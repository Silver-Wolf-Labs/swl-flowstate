"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Brain, Music, BarChart3, Timer, Heart, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./button";

interface DemoWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const demoSteps = [
  {
    id: 1,
    title: "Choose Your Mood",
    description: "Start by selecting how you're feeling. FlowState adapts everything to match your current vibe - whether you need deep focus, creative energy, calm relaxation, or an energetic boost.",
    icon: Brain,
    color: "from-violet-500 to-purple-600",
    features: ["Deep Focus", "Creative", "Calm", "Energetic"],
  },
  {
    id: 2,
    title: "Focus Timer",
    description: "Use the Pomodoro-style timer to structure your work sessions. 25 minutes of focused work followed by short breaks keeps you productive without burnout.",
    icon: Timer,
    color: "from-cyan-500 to-blue-600",
    features: ["25min Focus", "5min Break", "Session Tracking", "Auto-switch"],
  },
  {
    id: 3,
    title: "Mood-Based Music",
    description: "Connect to YouTube for curated lofi streams that match your mood. 24/7 livestreams and handpicked mixes help you get into the zone.",
    icon: Music,
    color: "from-pink-500 to-rose-600",
    features: ["Lofi Streams", "Mood Matching", "Favorites", "Playlists"],
  },
  {
    id: 4,
    title: "Track Your Progress",
    description: "Real-time analytics show your focus time, session streaks, and productivity patterns. Watch your habits improve over time.",
    icon: BarChart3,
    color: "from-emerald-500 to-green-600",
    features: ["Daily Stats", "Weekly Charts", "Streaks", "Insights"],
  },
  {
    id: 5,
    title: "Save Your Favorites",
    description: "Found a perfect lofi stream? Save it to your favorites with one click. Build your personal collection of productivity music.",
    icon: Heart,
    color: "from-red-500 to-orange-600",
    features: ["Quick Save", "Custom Playlists", "Persist Locally", "Easy Access"],
  },
];

export function DemoWalkthroughModal({ isOpen, onClose }: DemoWalkthroughModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setCurrentStep(0);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const nextStep = () => {
    if (currentStep < demoSteps.length - 1) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goToStep = (index: number) => {
    setDirection(index > currentStep ? 1 : -1);
    setCurrentStep(index);
  };

  const step = demoSteps[currentStep];
  const Icon = step.icon;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-2xl mx-4"
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="bg-background border border-border rounded-3xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative p-6 pb-0">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-xl hover:bg-secondary transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <motion.div
                  className="flex items-center gap-2 mb-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-primary">How FlowState Works</span>
                </motion.div>
              </div>

              {/* Content */}
              <div className="p-6 pt-4 min-h-[400px] relative overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="space-y-6"
                  >
                    {/* Icon */}
                    <motion.div
                      className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", delay: 0.1 }}
                    >
                      <Icon className="w-10 h-10 text-white" />
                    </motion.div>

                    {/* Step indicator */}
                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <span className="text-sm text-muted-foreground">Step {step.id} of {demoSteps.length}</span>
                    </motion.div>

                    {/* Title */}
                    <motion.h3
                      className="text-2xl sm:text-3xl font-bold text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {step.title}
                    </motion.h3>

                    {/* Description */}
                    <motion.p
                      className="text-center text-muted-foreground max-w-md mx-auto"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      {step.description}
                    </motion.p>

                    {/* Features */}
                    <motion.div
                      className="flex flex-wrap justify-center gap-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {step.features.map((feature, index) => (
                        <motion.span
                          key={feature}
                          className={`px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${step.color} text-white`}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.35 + index * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          {feature}
                        </motion.span>
                      ))}
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="p-6 pt-0">
                {/* Progress dots */}
                <div className="flex justify-center gap-2 mb-6">
                  {demoSteps.map((_, index) => (
                    <motion.button
                      key={index}
                      className={`h-2 rounded-full transition-all ${
                        index === currentStep
                          ? "w-8 bg-primary"
                          : "w-2 bg-secondary hover:bg-primary/50"
                      }`}
                      onClick={() => goToStep(index)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="min-w-[120px]"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>

                  {currentStep === demoSteps.length - 1 ? (
                    <Button
                      variant="gradient"
                      onClick={() => {
                        onClose();
                        setTimeout(() => {
                          document.getElementById("focus")?.scrollIntoView({ behavior: "smooth" });
                        }, 300);
                      }}
                      className="min-w-[120px]"
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      Get Started
                    </Button>
                  ) : (
                    <Button
                      variant="gradient"
                      onClick={nextStep}
                      className="min-w-[120px]"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
