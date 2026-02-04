"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { driver, Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { DemoState, DemoMode, INITIAL_DEMO_STATE, TOUR_STEPS } from "./types";

interface DemoContextType {
  state: DemoState;
  startTour: () => void;
  startSimulation: () => void;
  stopDemo: () => void;
  setSimulatedMood: (mood: DemoState["simulatedMood"]) => void;
  setSimulatedTimerState: (state: DemoState["simulatedTimerState"]) => void;
  nextSimulationStep: () => void;
  prevSimulationStep: () => void;
}

const DemoContext = createContext<DemoContextType | null>(null);

export function useDemoContext() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemoContext must be used within a DemoProvider");
  }
  return context;
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>(INITIAL_DEMO_STATE);
  const [driverInstance, setDriverInstance] = useState<Driver | null>(null);

  // Initialize driver.js tour
  const startTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: "rgba(0, 0, 0, 0.75)",
      stagePadding: 8,
      stageRadius: 8,
      popoverClass: "flowstate-tour-popover",
      steps: TOUR_STEPS.map((step) => ({
        element: step.element,
        popover: {
          title: step.popover.title,
          description: step.popover.description,
          side: step.popover.side,
          align: step.popover.align || "center",
        },
      })),
      onDestroyStarted: () => {
        setState((prev) => ({ ...prev, mode: null, isActive: false }));
        driverObj.destroy();
      },
      onDestroyed: () => {
        setDriverInstance(null);
      },
    });

    setDriverInstance(driverObj);
    setState((prev) => ({ ...prev, mode: "tour", isActive: true }));
    driverObj.drive();
  }, []);

  // Start interactive simulation
  const startSimulation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      mode: "simulation",
      isActive: true,
      currentStep: 0,
      simulatedMood: "focus",
      simulatedTimerState: "idle",
      simulatedTimeRemaining: 25 * 60,
      simulatedSessionCount: 0,
    }));
  }, []);

  // Stop any demo mode
  const stopDemo = useCallback(() => {
    if (driverInstance) {
      driverInstance.destroy();
      setDriverInstance(null);
    }
    setState(INITIAL_DEMO_STATE);
  }, [driverInstance]);

  // Simulation controls
  const setSimulatedMood = useCallback((mood: DemoState["simulatedMood"]) => {
    setState((prev) => ({ ...prev, simulatedMood: mood }));
  }, []);

  const setSimulatedTimerState = useCallback(
    (timerState: DemoState["simulatedTimerState"]) => {
      setState((prev) => ({ ...prev, simulatedTimerState: timerState }));
    },
    []
  );

  const nextSimulationStep = useCallback(() => {
    setState((prev) => ({ ...prev, currentStep: prev.currentStep + 1 }));
  }, []);

  const prevSimulationStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (driverInstance) {
        driverInstance.destroy();
      }
    };
  }, [driverInstance]);

  return (
    <DemoContext.Provider
      value={{
        state,
        startTour,
        startSimulation,
        stopDemo,
        setSimulatedMood,
        setSimulatedTimerState,
        nextSimulationStep,
        prevSimulationStep,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

