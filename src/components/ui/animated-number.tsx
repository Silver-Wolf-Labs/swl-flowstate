"use client";

import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  className?: string;
  format?: (value: number) => string;
}

export function AnimatedNumber({ 
  value, 
  className,
  format = (v) => Math.round(v).toString()
}: AnimatedNumberProps) {
  const spring = useSpring(value, { 
    stiffness: 100, 
    damping: 30,
    restDelta: 0.001
  });
  
  const display = useTransform(spring, (current) => format(current));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsubscribe = display.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = latest;
      }
    });
    return unsubscribe;
  }, [display]);

  return (
    <motion.span 
      ref={ref} 
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    />
  );
}

// Specialized timer display component
interface TimerDisplayProps {
  minutes: number;
  seconds: number;
  className?: string;
}

export function TimerDisplay({ minutes, seconds, className }: TimerDisplayProps) {
  const formatNumber = (num: number) => num.toString().padStart(2, "0");
  
  return (
    <div className={className}>
      <motion.span
        key={minutes}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {formatNumber(minutes)}
      </motion.span>
      <motion.span
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      >
        :
      </motion.span>
      <motion.span
        key={seconds}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {formatNumber(seconds)}
      </motion.span>
    </div>
  );
}
