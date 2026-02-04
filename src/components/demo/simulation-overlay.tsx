"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from "lucide-react";
import { useDemoContext } from "./demo-context";
import { Button } from "@/components/ui/button";

const SIMULATION_STEPS = [
  {
    title: "Welcome to the Simulation",
    description: "Experience FlowState in action! This interactive demo lets you try the features without affecting your real data.",
    action: null,
  },
  {
    title: "Choose Your Mood",
    description: "Click on a mood to see how the environment adapts. Try 'Focus' for deep work or 'Creative' for brainstorming.",
    action: "mood",
  },
  {
    title: "Start a Focus Session",
    description: "Click the play button to start a simulated 25-minute focus session. Watch the timer count down!",
    action: "timer",
  },
  {
    title: "Take a Break",
    description: "After completing a session, take a short 5-minute break or a long 15-minute break.",
    action: "break",
  },
  {
    title: "Track Your Progress",
    description: "See your simulated stats update as you complete sessions. In the real app, these persist across sessions.",
    action: "stats",
  },
  {
    title: "You're Ready!",
    description: "You've experienced the core features. Close this demo and start your real productivity journey!",
    action: null,
  },
];

export function SimulationOverlay() {
  const { state, stopDemo, nextSimulationStep, prevSimulationStep, setSimulatedMood, setSimulatedTimerState } = useDemoContext();

  if (state.mode !== "simulation" || !state.isActive) {
    return null;
  }

  const currentStep = SIMULATION_STEPS[state.currentStep];
  const isFirstStep = state.currentStep === 0;
  const isLastStep = state.currentStep === SIMULATION_STEPS.length - 1;

  const handleMoodClick = (mood: "focus" | "calm" | "energetic" | "creative") => {
    setSimulatedMood(mood);
  };

  const handleTimerAction = () => {
    if (state.simulatedTimerState === "idle") {
      setSimulatedTimerState("running");
    } else if (state.simulatedTimerState === "running") {
      setSimulatedTimerState("paused");
    } else {
      setSimulatedTimerState("running");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Top instruction bar */}
        <motion.div
          className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-background/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl p-4 max-w-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Step {state.currentStep + 1} of {SIMULATION_STEPS.length}
                  </span>
                  <span className="text-xs text-muted-foreground">Demo Mode</span>
                </div>
                <h3 className="font-semibold text-sm">{currentStep.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{currentStep.description}</p>
              </div>
              <button onClick={stopDemo} className="p-1 hover:bg-secondary rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action buttons for simulation */}
            {currentStep.action === "mood" && (
              <div className="flex gap-2 mt-3">
                {(["focus", "calm", "energetic", "creative"] as const).map((mood) => (
                  <button
                    key={mood}
                    onClick={() => handleMoodClick(mood)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      state.simulatedMood === mood
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    {mood.charAt(0).toUpperCase() + mood.slice(1)}
                  </button>
                ))}
              </div>
            )}

            {currentStep.action === "timer" && (
              <div className="flex items-center gap-3 mt-3">
                <Button size="sm" variant="outline" onClick={handleTimerAction}>
                  {state.simulatedTimerState === "running" ? (
                    <Pause className="w-4 h-4 mr-1" />
                  ) : (
                    <Play className="w-4 h-4 mr-1" />
                  )}
                  {state.simulatedTimerState === "running" ? "Pause" : "Start"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSimulatedTimerState("idle")}>
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
                <span className="text-sm font-mono">
                  {Math.floor(state.simulatedTimeRemaining / 60)}:
                  {(state.simulatedTimeRemaining % 60).toString().padStart(2, "0")}
                </span>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
              <Button size="sm" variant="ghost" onClick={prevSimulationStep} disabled={isFirstStep}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <div className="flex gap-1">
                {SIMULATION_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === state.currentStep ? "bg-primary" : "bg-secondary"
                    }`}
                  />
                ))}
              </div>
              {isLastStep ? (
                <Button size="sm" variant="default" onClick={stopDemo}>
                  Finish
                </Button>
              ) : (
                <Button size="sm" variant="ghost" onClick={nextSimulationStep}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

