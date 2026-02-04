"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Compass } from "lucide-react";
import { useState, useEffect } from "react";
import { useDemoContext } from "@/components/demo";

export function FloatingTourButton() {
  const { startTour } = useDemoContext();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if tour has been completed for this IP
  useEffect(() => {
    const checkTourStatus = async () => {
      try {
        const response = await fetch("/api/tour/status");
        const data = await response.json();
        setIsVisible(!data.completed);
      } catch {
        // If API fails, show the button by default
        setIsVisible(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkTourStatus();
  }, []);

  const handleStartTour = async () => {
    // Mark tour as completed for this IP
    try {
      await fetch("/api/tour/complete", { method: "POST" });
    } catch {
      // Silently fail - tour will still work
    }

    // Hide the button
    setIsVisible(false);

    // Start the tour
    startTour();
  };

  if (isLoading || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.button
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleStartTour}
        className="fixed bottom-6 right-6 z-[90] flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-primary to-accent text-white font-medium shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow cursor-pointer"
        aria-label="Start guided tour"
        title="Take a guided tour"
      >
        <Compass className="w-5 h-5" />
        <span className="hidden sm:inline">Take a Tour</span>
      </motion.button>
    </AnimatePresence>
  );
}

