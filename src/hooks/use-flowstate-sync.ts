"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// MCP connection timeout - if no MCP update in this time, consider disconnected
const MCP_CONNECTION_TIMEOUT = 10000; // 10 seconds

export interface FlowStateSync {
  isRunning: boolean;
  mode: "focus" | "shortBreak" | "longBreak";
  timeRemaining: number;
  totalTime: number;
  focusDuration?: number;
  shortBreakDuration?: number;
  longBreakDuration?: number;
  currentMood: "focus" | "calm" | "energetic" | "creative";
  sessionsCompleted: number;
  totalFocusTime: number;
  lastUpdated: number;
  lastMcpUpdate: number; // Timestamp of last MCP server update
  scrollTo?: "mood" | "timer" | "music" | "analytics" | null;
}

interface UseFlowStateSyncOptions {
  onMoodChange?: (mood: FlowStateSync["currentMood"]) => void;
  onTimerStart?: () => void;
  onTimerStop?: () => void;
  onScrollRequest?: (target: string) => void;
}

export function useFlowStateSync(options: UseFlowStateSyncOptions = {}) {
  const [syncState, setSyncState] = useState<FlowStateSync | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMcpConnected, setIsMcpConnected] = useState(false);
  const lastUpdateRef = useRef<number>(0);
  const previousMoodRef = useRef<string | null>(null);
  const previousRunningRef = useRef<boolean | null>(null);

  // Poll for state changes
  const pollState = useCallback(async () => {
    try {
      const response = await fetch("/api/flowstate");
      if (response.ok) {
        const state: FlowStateSync = await response.json();
        setIsConnected(true);
        
        // Check if MCP has updated recently (within timeout)
        const mcpConnected = state.lastMcpUpdate > 0 && 
          (Date.now() - state.lastMcpUpdate) < MCP_CONNECTION_TIMEOUT;
        setIsMcpConnected(mcpConnected);

        // Only update if state has changed
        if (state.lastUpdated > lastUpdateRef.current) {
          lastUpdateRef.current = state.lastUpdated;
          setSyncState(state);

          // Trigger callbacks for changes
          if (previousMoodRef.current !== null && previousMoodRef.current !== state.currentMood) {
            options.onMoodChange?.(state.currentMood);
          }
          previousMoodRef.current = state.currentMood;

          if (previousRunningRef.current !== null) {
            if (!previousRunningRef.current && state.isRunning) {
              options.onTimerStart?.();
            } else if (previousRunningRef.current && !state.isRunning) {
              options.onTimerStop?.();
            }
          }
          previousRunningRef.current = state.isRunning;

          // Handle scroll requests
          if (state.scrollTo) {
            options.onScrollRequest?.(state.scrollTo);
            // Clear scroll request after handling
            await fetch("/api/flowstate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ scrollTo: null }),
            });
          }
        }
      }
    } catch (error) {
      setIsConnected(false);
      setIsMcpConnected(false);
      console.error("FlowState sync error:", error);
    }
  }, [options]);

  // Start polling on mount
  useEffect(() => {
    // Initial fetch
    pollState();

    // Poll every 500ms for responsive updates
    const interval = setInterval(pollState, 500);

    return () => clearInterval(interval);
  }, [pollState]);

  // Update state (from web UI)
  const updateState = useCallback(async (updates: Partial<FlowStateSync>) => {
    try {
      const response = await fetch("/api/flowstate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const { state } = await response.json();
        setSyncState(state);
        lastUpdateRef.current = state.lastUpdated;
      }
    } catch (error) {
      console.error("Failed to update FlowState:", error);
    }
  }, []);

  return {
    syncState,
    isConnected,
    isMcpConnected, // True only if MCP server has sent updates recently
    updateState,
  };
}
