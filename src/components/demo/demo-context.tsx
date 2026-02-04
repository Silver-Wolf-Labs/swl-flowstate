"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { driver, Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { DemoState, INITIAL_DEMO_STATE, TOUR_STEPS } from "./types";

interface DemoContextType {
  state: DemoState;
  startTour: () => void;
  stopDemo: () => void;
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

  // Stop any demo mode
  const stopDemo = useCallback(() => {
    if (driverInstance) {
      driverInstance.destroy();
      setDriverInstance(null);
    }
    setState(INITIAL_DEMO_STATE);
  }, [driverInstance]);

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
        stopDemo,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

