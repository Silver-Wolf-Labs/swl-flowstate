"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Coffee, Brain, Settings, Volume2, VolumeX, Bell, BellOff } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, ProgressRing } from "@/components/ui";
import type { FocusSession } from "@/hooks/use-analytics";
import type { FlowStateSync } from "@/hooks/use-flowstate-sync";

type TimerMode = "focus" | "shortBreak" | "longBreak";

interface TimerConfig {
  focus: number;
  shortBreak: number;
  longBreak: number;
}

const defaultConfig: TimerConfig = {
  focus: 25 * 60, // 25 minutes
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 15 * 60, // 15 minutes
};

const TIMER_CONFIG_STORAGE_KEY = "flowstate_timer_config";

const TIMER_LIMITS: Record<TimerMode, { minSeconds: number; maxSeconds: number }> = {
  focus: { minSeconds: 60, maxSeconds: 180 * 60 },
  shortBreak: { minSeconds: 60, maxSeconds: 60 * 60 },
  longBreak: { minSeconds: 60, maxSeconds: 60 * 60 },
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalizeConfig = (config: Partial<TimerConfig>): TimerConfig => ({
  focus: clamp(
    Number.isFinite(config.focus) ? (config.focus as number) : defaultConfig.focus,
    TIMER_LIMITS.focus.minSeconds,
    TIMER_LIMITS.focus.maxSeconds
  ),
  shortBreak: clamp(
    Number.isFinite(config.shortBreak) ? (config.shortBreak as number) : defaultConfig.shortBreak,
    TIMER_LIMITS.shortBreak.minSeconds,
    TIMER_LIMITS.shortBreak.maxSeconds
  ),
  longBreak: clamp(
    Number.isFinite(config.longBreak) ? (config.longBreak as number) : defaultConfig.longBreak,
    TIMER_LIMITS.longBreak.minSeconds,
    TIMER_LIMITS.longBreak.maxSeconds
  ),
});

const loadStoredConfig = (): TimerConfig => {
  if (typeof window === "undefined") return defaultConfig;
  try {
    const stored = localStorage.getItem(TIMER_CONFIG_STORAGE_KEY);
    if (!stored) return defaultConfig;
    const parsed = JSON.parse(stored) as Partial<TimerConfig>;
    return normalizeConfig(parsed);
  } catch {
    return defaultConfig;
  }
};

const persistConfig = (config: TimerConfig) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TIMER_CONFIG_STORAGE_KEY, JSON.stringify(config));
};

const modeConfig = {
  focus: { label: "Focus Time", icon: Brain, color: "primary" as const },
  shortBreak: { label: "Short Break", icon: Coffee, color: "accent" as const },
  longBreak: { label: "Long Break", icon: Coffee, color: "accent" as const },
};

// Sound notification using Web Audio API
const playNotificationSound = (type: "complete" | "break" | "tick") => {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === "complete") {
      // Success chime - C major chord arpeggio
      const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      frequencies.forEach((freq, i) => {
        setTimeout(() => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.frequency.setValueAtTime(freq, audioContext.currentTime);
          osc.type = "sine";
          gain.gain.setValueAtTime(0.3, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          osc.start(audioContext.currentTime);
          osc.stop(audioContext.currentTime + 0.5);
        }, i * 150);
      });
    } else if (type === "break") {
      // Soft notification for break
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } else if (type === "tick") {
      // Subtle tick for last 10 seconds
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
    }
  } catch (error) {
    console.warn("Audio playback failed:", error);
  }
};

// Request notification permission
const requestNotificationPermission = async () => {
  if ("Notification" in window && Notification.permission === "default") {
    await Notification.requestPermission();
  }
};

// Show browser notification
const showNotification = (title: string, body: string, icon?: string) => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: icon || "/favicon.ico",
      badge: "/favicon.ico",
      tag: "flowstate-timer",
      requireInteraction: true,
    });
  }
};

interface FocusTimerProps {
  mood?: string;
  onSessionComplete?: (session: Omit<FocusSession, "id">) => void;
  syncState?: FlowStateSync | null;
  updateSyncState?: (updates: Partial<FlowStateSync>) => void;
}

export function FocusTimer({ mood = "focus", onSessionComplete, syncState, updateSyncState }: FocusTimerProps) {
  const [config, setConfig] = useState<TimerConfig>(defaultConfig);
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(defaultConfig.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const sessionStartRef = useRef<number | null>(null);
  const lastSyncRef = useRef<number>(0);
  const lastLocalChangeRef = useRef<number>(0); // Track local changes to avoid sync race conditions
  
  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationsEnabled(true);
      }
    }
  }, []);

  useEffect(() => {
    const stored = loadStoredConfig();
    setConfig(stored);
  }, []);

  useEffect(() => {
    if (!updateSyncState) return;
    const updates: Partial<FlowStateSync> = {
      focusDuration: config.focus,
      shortBreakDuration: config.shortBreak,
      longBreakDuration: config.longBreak,
    };
    if (!isRunning) {
      updates.timeRemaining = config[mode];
      updates.totalTime = config[mode];
    }
    updateSyncState(updates);
  }, [config, updateSyncState, isRunning, mode]);

  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(config[mode]);
    }
  }, [config, mode, isRunning]);

  useEffect(() => {
    if (!syncState || syncState.lastUpdated <= lastSyncRef.current) return;
    lastSyncRef.current = syncState.lastUpdated;

    const isMcpUpdate =
      syncState.lastMcpUpdate > 0 && syncState.lastMcpUpdate === syncState.lastUpdated;
    
    // Skip sync if there was a recent local change (within 1 second) to avoid race conditions
    const timeSinceLocalChange = Date.now() - lastLocalChangeRef.current;
    const recentLocalChange = timeSinceLocalChange < 1000;

    console.log("[Timer] Sync effect - isMcpUpdate:", isMcpUpdate, "isRunning:", isRunning, "recentLocalChange:", recentLocalChange, "timeSinceLocalChange:", timeSinceLocalChange, "syncState.isRunning:", syncState.isRunning);

    if (
      typeof syncState.focusDuration === "number" ||
      typeof syncState.shortBreakDuration === "number" ||
      typeof syncState.longBreakDuration === "number"
    ) {
      const nextConfig = normalizeConfig({
        focus: syncState.focusDuration ?? config.focus,
        shortBreak: syncState.shortBreakDuration ?? config.shortBreak,
        longBreak: syncState.longBreakDuration ?? config.longBreak,
      });
      setConfig(nextConfig);
      persistConfig(nextConfig);
    }

    // Only apply timer state from sync if:
    // 1. It's an MCP update (always apply)
    // 2. Timer is not running AND no recent local change
    const shouldApplyTimerState = isMcpUpdate || (!isRunning && !recentLocalChange);
    console.log("[Timer] shouldApplyTimerState:", shouldApplyTimerState);

    if (shouldApplyTimerState) {
      console.log("[Timer] APPLYING sync state - setting isRunning to:", syncState.isRunning);
      if (syncState.mode && syncState.mode !== mode) {
        setMode(syncState.mode);
      }
      if (typeof syncState.timeRemaining === "number") {
        setTimeLeft(syncState.timeRemaining);
      }
      if (typeof syncState.isRunning === "boolean") {
        setIsRunning(syncState.isRunning);
      }
    } else {
      console.log("[Timer] SKIPPING sync state application");
    }
  }, [syncState, config, mode, isRunning]);

  const totalTime = config[mode] || defaultConfig[mode];
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const currentConfig = modeConfig[mode];
  const Icon = currentConfig.icon;

  // Track session start time
  useEffect(() => {
    if (isRunning && sessionStartRef.current === null) {
      sessionStartRef.current = Date.now();
    }
  }, [isRunning]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    console.log("[Timer] Effect running - isRunning:", isRunning, "timeLeft:", timeLeft);

    if (isRunning && timeLeft > 0) {
      console.log("[Timer] Starting interval...");
      interval = setInterval(() => {
        console.log("[Timer] Interval tick");
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          if (soundEnabled && newTime <= 10 && newTime > 0) {
            playNotificationSound("tick");
          }
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      console.log("[Timer] Timer completed!");
      setIsRunning(false);
      
      // Play completion sound
      if (soundEnabled) {
        playNotificationSound(mode === "focus" ? "complete" : "break");
      }

      // Show browser notification
      if (notificationsEnabled) {
        if (mode === "focus") {
          showNotification(
            "Focus Session Complete! 🎯",
            `Great work! You've completed a ${Math.floor(totalTime / 60)} minute focus session. Time for a break!`,
          );
        } else {
          showNotification(
            "Break Time Over! ☕",
            "Ready to get back to work? Your next focus session is waiting.",
          );
        }
      }
      
      // Record completed session
      if (sessionStartRef.current && onSessionComplete) {
        const endTime = Date.now();
        onSessionComplete({
          startTime: sessionStartRef.current,
          endTime,
          duration: totalTime,
          type: mode,
          mood,
          completed: true,
        });
      }
      sessionStartRef.current = null;

      // Auto switch modes
      if (mode === "focus") {
        const nextSessions = sessions + 1;
        setSessions(nextSessions);
        const nextMode = nextSessions % 4 === 0 ? "longBreak" : "shortBreak";
        const nextTime = config[nextMode];
        setMode(nextMode);
        setTimeLeft(nextTime);
        updateSyncState?.({
          isRunning: false,
          mode: nextMode,
          timeRemaining: nextTime,
          totalTime: nextTime,
        });
      } else {
        const nextTime = config.focus;
        setMode("focus");
        setTimeLeft(nextTime);
        updateSyncState?.({
          isRunning: false,
          mode: "focus",
          timeRemaining: nextTime,
          totalTime: nextTime,
        });
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, sessions, totalTime, mood, onSessionComplete, soundEnabled, notificationsEnabled, config, updateSyncState]);

  const toggleTimer = useCallback(() => {
    const now = Date.now();
    console.log("[Timer] Toggle clicked at:", now, "isRunning was:", isRunning);
    lastLocalChangeRef.current = now;
    const nextRunning = !isRunning;
    console.log("[Timer] Setting isRunning to:", nextRunning);
    setIsRunning(nextRunning);
    if (updateSyncState) {
      updateSyncState({
        isRunning: nextRunning,
        mode,
        timeRemaining: timeLeft,
        totalTime: config[mode],
      });
    }
  }, [config, mode, timeLeft, isRunning, updateSyncState]);

  const resetTimer = useCallback(() => {
    lastLocalChangeRef.current = Date.now(); // Mark local change
    setIsRunning(false);
    const resetTime = config[mode];
    setTimeLeft(resetTime);
    updateSyncState?.({
      isRunning: false,
      mode,
      timeRemaining: resetTime,
      totalTime: resetTime,
    });
  }, [config, mode, updateSyncState]);

  const switchMode = useCallback((newMode: TimerMode) => {
    lastLocalChangeRef.current = Date.now(); // Mark local change
    setMode(newMode);
    const nextTime = config[newMode];
    setTimeLeft(nextTime);
    setIsRunning(false);
    updateSyncState?.({
      isRunning: false,
      mode: newMode,
      timeRemaining: nextTime,
      totalTime: nextTime,
    });
  }, [config, updateSyncState]);

  const updateDuration = useCallback(
    (target: TimerMode, minutesValue: number) => {
      if (!Number.isFinite(minutesValue)) return;
      const clampedMinutes = clamp(
        Math.floor(minutesValue),
        Math.floor(TIMER_LIMITS[target].minSeconds / 60),
        Math.floor(TIMER_LIMITS[target].maxSeconds / 60)
      );
      const nextSeconds = clampedMinutes * 60;
      const nextConfig = { ...config, [target]: nextSeconds };
      setConfig(nextConfig);
      persistConfig(nextConfig);
      const shouldResetTime = !isRunning && mode === target;
      updateSyncState?.({
        focusDuration: nextConfig.focus,
        shortBreakDuration: nextConfig.shortBreak,
        longBreakDuration: nextConfig.longBreak,
        ...(shouldResetTime ? { timeRemaining: nextSeconds, totalTime: nextSeconds } : {}),
      });
      if (shouldResetTime) {
        setTimeLeft(nextSeconds);
      }
    },
    [config, isRunning, mode, updateSyncState]
  );

  const formatTime = (num: number) => num.toString().padStart(2, "0");

  return (
    <Card variant="glow" className="relative overflow-hidden" id="focus">
      {/* Animated background pulse when running */}
      <AnimatePresence>
        {isRunning && (
          <motion.div
            className="absolute inset-0 bg-primary/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.05, 0.1, 0.05] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </AnimatePresence>

      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-primary" />
              Focus Timer
            </CardTitle>
            <CardDescription>Pomodoro-style sessions to maximize productivity</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isRunning ? "success" : "secondary"} pulse={isRunning}>
              {isRunning ? "Running" : "Paused"}
            </Badge>
            <Badge variant="outline">
              {sessions} sessions
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        {/* Mode selector */}
        <div className="flex justify-center gap-2 mb-8">
          {(Object.keys(modeConfig) as TimerMode[]).map((m) => (
            <motion.button
              key={m}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === m
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => switchMode(m)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {modeConfig[m].label}
            </motion.button>
          ))}
        </div>

        {/* Timer display */}
        <div className="flex justify-center mb-8">
          <ProgressRing 
            progress={progress} 
            size={280} 
            strokeWidth={12}
            color={mode === "focus" ? "gradient" : "accent"}
          >
            <div className="flex flex-col items-center">
              <motion.div
                className="text-6xl sm:text-7xl font-bold font-mono tracking-tight"
                key={`${minutes}-${seconds}`}
              >
                <motion.span
                  key={`min-${minutes}`}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {formatTime(minutes)}
                </motion.span>
                <motion.span
                  className="text-primary"
                  animate={{ opacity: isRunning ? [1, 0.3, 1] : 1 }}
                  transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
                >
                  :
                </motion.span>
                <motion.span
                  key={`sec-${seconds}`}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {formatTime(seconds)}
                </motion.span>
              </motion.div>
              <span className="text-muted-foreground text-sm mt-2">
                {currentConfig.label}
              </span>
            </div>
          </ProgressRing>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="secondary"
              size="icon"
              onClick={resetTimer}
              className="w-12 h-12"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="gradient"
              size="lg"
              onClick={toggleTimer}
              className="w-40 h-14"
            >
              <AnimatePresence mode="wait">
                {isRunning ? (
                  <motion.span
                    key="pause"
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Pause className="w-5 h-5" />
                    Pause
                  </motion.span>
                ) : (
                  <motion.span
                    key="start"
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Play className="w-5 h-5" />
                    Start
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="secondary"
              size="icon"
              className="w-12 h-12"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-6 p-4 rounded-xl bg-secondary/50 border border-border space-y-4">
                <h4 className="text-sm font-medium">Timer Settings</h4>

                {/* Duration settings */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Session Lengths (minutes)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="flex flex-col gap-2 text-xs font-medium text-muted-foreground">
                      Focus
                      <input
                        type="number"
                        min={Math.floor(TIMER_LIMITS.focus.minSeconds / 60)}
                        max={Math.floor(TIMER_LIMITS.focus.maxSeconds / 60)}
                        step={1}
                        value={Math.round(config.focus / 60)}
                        onChange={(event) => updateDuration("focus", event.target.valueAsNumber)}
                        className="h-10 rounded-lg border border-border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-xs font-medium text-muted-foreground">
                      Short Break
                      <input
                        type="number"
                        min={Math.floor(TIMER_LIMITS.shortBreak.minSeconds / 60)}
                        max={Math.floor(TIMER_LIMITS.shortBreak.maxSeconds / 60)}
                        step={1}
                        value={Math.round(config.shortBreak / 60)}
                        onChange={(event) => updateDuration("shortBreak", event.target.valueAsNumber)}
                        className="h-10 rounded-lg border border-border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-xs font-medium text-muted-foreground">
                      Long Break
                      <input
                        type="number"
                        min={Math.floor(TIMER_LIMITS.longBreak.minSeconds / 60)}
                        max={Math.floor(TIMER_LIMITS.longBreak.maxSeconds / 60)}
                        step={1}
                        value={Math.round(config.longBreak / 60)}
                        onChange={(event) => updateDuration("longBreak", event.target.valueAsNumber)}
                        className="h-10 rounded-lg border border-border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </label>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Sound Toggle */}
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                      soundEnabled 
                        ? "bg-primary/10 border-primary/30 text-primary" 
                        : "bg-secondary border-border text-muted-foreground"
                    }`}
                  >
                    {soundEnabled ? (
                      <Volume2 className="w-5 h-5" />
                    ) : (
                      <VolumeX className="w-5 h-5" />
                    )}
                    <div className="text-left">
                      <div className="text-sm font-medium">Sound</div>
                      <div className="text-xs opacity-70">{soundEnabled ? "Enabled" : "Disabled"}</div>
                    </div>
                  </button>

                  {/* Notifications Toggle */}
                  <button
                    onClick={async () => {
                      if (!notificationsEnabled) {
                        await requestNotificationPermission();
                        if (Notification.permission === "granted") {
                          setNotificationsEnabled(true);
                        }
                      } else {
                        setNotificationsEnabled(false);
                      }
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                      notificationsEnabled 
                        ? "bg-primary/10 border-primary/30 text-primary" 
                        : "bg-secondary border-border text-muted-foreground"
                    }`}
                  >
                    {notificationsEnabled ? (
                      <Bell className="w-5 h-5" />
                    ) : (
                      <BellOff className="w-5 h-5" />
                    )}
                    <div className="text-left">
                      <div className="text-sm font-medium">Notifications</div>
                      <div className="text-xs opacity-70">
                        {notificationsEnabled 
                          ? "Enabled" 
                          : Notification.permission === "denied" 
                            ? "Blocked" 
                            : "Click to enable"}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Test Sound Button */}
                <button
                  onClick={() => {
                    if (soundEnabled) {
                      playNotificationSound("complete");
                    }
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  disabled={!soundEnabled}
                >
                  Test completion sound
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
