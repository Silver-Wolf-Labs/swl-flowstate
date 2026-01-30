"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Coffee, Brain, Settings } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, ProgressRing } from "@/components/ui";
import type { FocusSession } from "@/hooks/use-analytics";

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

const modeConfig = {
  focus: { label: "Focus Time", icon: Brain, color: "primary" as const },
  shortBreak: { label: "Short Break", icon: Coffee, color: "accent" as const },
  longBreak: { label: "Long Break", icon: Coffee, color: "accent" as const },
};

interface FocusTimerProps {
  mood?: string;
  onSessionComplete?: (session: Omit<FocusSession, "id">) => void;
}

export function FocusTimer({ mood = "focus", onSessionComplete }: FocusTimerProps) {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(defaultConfig.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const sessionStartRef = useRef<number | null>(null);

  const totalTime = defaultConfig[mode];
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

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      
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
        setSessions((prev) => prev + 1);
        const nextMode = (sessions + 1) % 4 === 0 ? "longBreak" : "shortBreak";
        setMode(nextMode);
        setTimeLeft(defaultConfig[nextMode]);
      } else {
        setMode("focus");
        setTimeLeft(defaultConfig.focus);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, sessions, totalTime, mood, onSessionComplete]);

  const toggleTimer = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(defaultConfig[mode]);
  }, [mode]);

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(defaultConfig[newMode]);
    setIsRunning(false);
  }, []);

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
                  key={minutes}
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
                  key={seconds}
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
            >
              <Settings className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
