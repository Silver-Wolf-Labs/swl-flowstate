"use client";

import { useState, useEffect, useCallback } from "react";

export type IDEType = "cursor" | "vscode" | "windsurf" | "intellij" | "unknown";

export interface IDEConnectionState {
  isConnected: boolean;
  connectedIDE: IDEType | null;
  sessionStartTime: number | null;
  lastHeartbeat: number | null;
  currentSessionDuration: number;
}

export interface IDEConnectionHistory {
  totalConnectionTime: number;
  sessionsCount: number;
  todayConnectionTime: number;
  weekConnectionTime: number;
  lastSessionDate: string | null;
  dailyHistory: Record<string, number>;
}

export interface SetupStatus {
  isComplete: boolean;
  completedAt: string | null;
  selectedIDEs: string[];
  envVarsConfigured: string[];
}

const defaultState: IDEConnectionState = {
  isConnected: false,
  connectedIDE: null,
  sessionStartTime: null,
  lastHeartbeat: null,
  currentSessionDuration: 0,
};

const defaultHistory: IDEConnectionHistory = {
  totalConnectionTime: 0,
  sessionsCount: 0,
  todayConnectionTime: 0,
  weekConnectionTime: 0,
  lastSessionDate: null,
  dailyHistory: {},
};

const defaultSetupStatus: SetupStatus = {
  isComplete: false,
  completedAt: null,
  selectedIDEs: [],
  envVarsConfigured: [],
};

export function useIDEConnection() {
  const [connectionState, setConnectionState] = useState<IDEConnectionState>(defaultState);
  const [history, setHistory] = useState<IDEConnectionHistory>(defaultHistory);
  const [setupStatus, setSetupStatus] = useState<SetupStatus>(defaultSetupStatus);
  const [isLoading, setIsLoading] = useState(true);
  const [liveSessionTime, setLiveSessionTime] = useState(0);

  // Fetch connection state from API
  const fetchConnectionState = useCallback(async () => {
    try {
      const response = await fetch("/api/ide-connection");
      const data = await response.json();
      setConnectionState(data.state);
      setHistory(data.history);

      // Update live session time
      if (data.state.isConnected && data.state.sessionStartTime) {
        const elapsed = Math.floor((Date.now() - data.state.sessionStartTime) / 1000);
        setLiveSessionTime(elapsed);
      } else {
        setLiveSessionTime(0);
      }
    } catch (error) {
      console.error("Failed to fetch IDE connection state:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch setup status (configured IDEs)
  const fetchSetupStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/setup/complete");
      const data = await response.json();
      setSetupStatus(data);
    } catch (error) {
      console.error("Failed to fetch setup status:", error);
    }
  }, []);

  // Poll for connection state every 5 seconds
  useEffect(() => {
    fetchConnectionState();
    fetchSetupStatus();
    const interval = setInterval(fetchConnectionState, 5000);
    return () => clearInterval(interval);
  }, [fetchConnectionState, fetchSetupStatus]);

  // Update live session time every second when connected
  useEffect(() => {
    if (!connectionState.isConnected || !connectionState.sessionStartTime) {
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - connectionState.sessionStartTime!) / 1000);
      setLiveSessionTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [connectionState.isConnected, connectionState.sessionStartTime]);

  // Format time helper
  const formatTime = useCallback((seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }, []);

  // Format time for display (shorter format)
  const formatTimeShort = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Get IDE display name
  const getIDEDisplayName = useCallback((ide: IDEType | null): string => {
    const names: Record<IDEType, string> = {
      cursor: "Cursor",
      vscode: "VS Code",
      windsurf: "Windsurf",
      intellij: "IntelliJ",
      unknown: "IDE",
    };
    return ide ? names[ide] : "IDE";
  }, []);

  return {
    // State
    connectionState,
    history,
    setupStatus,
    isLoading,
    liveSessionTime,

    // Computed
    isConnected: connectionState.isConnected,
    connectedIDE: connectionState.connectedIDE,
    configuredIDEs: setupStatus.selectedIDEs as IDEType[],
    isSetupComplete: setupStatus.isComplete,

    // Actions
    refresh: fetchConnectionState,

    // Helpers
    formatTime,
    formatTimeShort,
    getIDEDisplayName,
  };
}

