"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowDown, Play } from "lucide-react";
import { Button } from "@/components/ui";

interface HeroSectionProps {
  onWatchDemo?: () => void;
}

export function HeroSection({ onWatchDemo }: HeroSectionProps) {
  return (
    <section className="relative h-screen overflow-hidden" id="dashboard">
      {/* Animated background */}
      <div className="absolute inset-0 bg-grid opacity-50" />
      
      {/* Gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        animate={{
          x: [0, -50, 0],
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main content - centered */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>
            <span className="text-sm font-medium text-primary">Mood-Adaptive Productivity</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Stay in{" "}
            <span className="relative">
              <span className="gradient-text">Flow</span>
              <motion.span
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </span>
            <br />
            While{" "}
            <motion.span
              className="inline-block"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{
                background: "linear-gradient(90deg, var(--foreground), var(--primary), var(--accent), var(--foreground))",
                backgroundSize: "300% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Coding
            </motion.span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            A personalized productivity dashboard that adapts to your mood, 
            recommends the perfect vibe, and helps you achieve deep focus.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button 
              variant="gradient" 
              size="lg" 
              className="min-w-[200px]"
              onClick={() => document.getElementById("focus")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Focusing
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="min-w-[200px]"
              onClick={onWatchDemo}
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator - fixed to bottom of viewport */}
      <motion.div
        className="absolute bottom-6 left-0 right-0 z-20 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <motion.button
          className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          whileHover={{ scale: 1.1 }}
          onClick={() => document.getElementById("focus")?.scrollIntoView({ behavior: "smooth" })}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-lg sm:text-xl font-medium group-hover:text-primary transition-colors">Scroll to explore</span>
          <ArrowDown className="w-6 h-6" />
        </motion.button>
      </motion.div>
    </section>
  );
}
