"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, Music, Brain, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeStepProps {
  onNext: () => void;
}

const features = [
  {
    icon: Brain,
    title: "Mood-Adaptive",
    description: "Environment adapts to your current mood",
  },
  {
    icon: Zap,
    title: "IDE Integration",
    description: "Control FlowState from your code editor",
  },
  {
    icon: Music,
    title: "Music Streaming",
    description: "Connect Spotify, YouTube, and more",
  },
];

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", delay: 0.1 }}
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">Welcome to FlowState</h2>
        <p className="text-muted-foreground">
          Let&apos;s get you set up in just a few steps
        </p>
      </motion.div>

      {/* Features */}
      <motion.div
        className="grid gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 border border-border"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <feature.icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* What we'll do */}
      <motion.div
        className="p-4 rounded-xl bg-primary/5 border border-primary/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="font-semibold mb-2 text-primary">What we&apos;ll set up:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Optional music service connections (Spotify, YouTube, etc.)</li>
          <li>• IDE integration for controlling FlowState from your editor</li>
          <li>• MCP configuration for AI assistant integration</li>
        </ul>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <Button variant="gradient" className="w-full" onClick={onNext}>
          Get Started
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}

