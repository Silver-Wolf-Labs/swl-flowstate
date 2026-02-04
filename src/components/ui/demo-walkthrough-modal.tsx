"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Brain, Music, BarChart3, Timer, Code2, Sparkles, Play, Pause, Coffee, Zap, Palette } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "./button";

interface DemoWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mood color configurations for Step 1
const moodColors = {
  "Deep Focus": { gradient: "from-violet-500 to-purple-600", bg: "violet", hex: "#8b5cf6" },
  "Creative": { gradient: "from-pink-500 to-rose-500", bg: "pink", hex: "#ec4899" },
  "Calm": { gradient: "from-cyan-500 to-teal-500", bg: "cyan", hex: "#06b6d4" },
  "Energetic": { gradient: "from-orange-500 to-amber-500", bg: "orange", hex: "#f97316" },
};

// Music services for Step 3
const musicServices = [
  { name: "YouTube", icon: "▶️", color: "#FF0000" },
  { name: "Spotify", icon: "🎵", color: "#1DB954" },
  { name: "Apple Music", icon: "🎧", color: "#FA243C" },
  { name: "SoundCloud", icon: "☁️", color: "#FF5500" },
];

// Demo analytics data for Step 5
const demoAnalytics = {
  todaySessions: 5,
  todayFocusTime: 135, // minutes
  weeklyData: [45, 90, 120, 75, 135, 60, 0], // minutes per day
  streak: 7,
  weeklyTotal: 525, // minutes
};

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
    description: "Connect to YouTube, Spotify, Apple Music, SoundCloud, and other services. Music is curated based on your selected mood.",
    icon: Music,
    color: "from-pink-500 to-rose-600",
    features: ["Multi-Platform", "Mood Matching", "Lofi Streams", "Playlists"],
  },
  {
    id: 4,
    title: "IDE Integration",
    description: "Control FlowState directly from your code editor. Works with VS Code, Cursor, Windsurf, and other MCP-enabled IDEs.",
    icon: Code2,
    color: "from-emerald-500 to-green-600",
    features: ["VS Code", "Cursor", "Windsurf", "MCP Protocol"],
  },
  {
    id: 5,
    title: "Track Your Progress",
    description: "Real-time analytics show your focus time, session streaks, and productivity patterns. Watch your habits improve over time.",
    icon: BarChart3,
    color: "from-amber-500 to-orange-600",
    features: ["Daily Stats", "Weekly Charts", "Streaks", "Insights"],
  },
];

// Mini Timer Component for Step 2
function MiniTimer() {
  const [time, setTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTime((prev) => {
        if (prev <= 0) {
          setMode(mode === "focus" ? "break" : "focus");
          return mode === "focus" ? 5 * 60 : 25 * 60;
        }
        return prev - 1;
      });
    }, 50); // Fast for demo
    return () => clearInterval(interval);
  }, [isRunning, mode]);

  const progress = mode === "focus"
    ? ((25 * 60 - time) / (25 * 60)) * 100
    : ((5 * 60 - time) / (5 * 60)) * 100;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const radius = 45;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width="120" height="120" className="transform -rotate-90">
          <circle cx="60" cy="60" r={radius} strokeWidth="6" className="fill-none stroke-secondary" />
          <motion.circle
            cx="60" cy="60" r={radius} strokeWidth="6"
            className={`fill-none ${mode === "focus" ? "stroke-cyan-500" : "stroke-green-500"}`}
            strokeLinecap="round"
            style={{ strokeDasharray: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.1 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-mono">{formatTime(time)}</span>
          <span className={`text-xs ${mode === "focus" ? "text-cyan-400" : "text-green-400"}`}>
            {mode === "focus" ? "Focus" : "Break"}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <motion.button
          className={`p-2 rounded-lg ${isRunning ? "bg-orange-500/20 text-orange-400" : "bg-cyan-500/20 text-cyan-400"}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </motion.button>
        <motion.button
          className="p-2 rounded-lg bg-secondary text-muted-foreground"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => { setTime(25 * 60); setMode("focus"); setIsRunning(false); }}
        >
          <Coffee className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}

// Animated Bar Chart for Step 5
function AnimatedChart() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxValue = Math.max(...demoAnalytics.weeklyData);

  return (
    <div className="flex items-end justify-center gap-2 h-24">
      {demoAnalytics.weeklyData.map((value, index) => (
        <div key={days[index]} className="flex flex-col items-center gap-1">
          <motion.div
            className="w-6 bg-gradient-to-t from-amber-500 to-orange-400 rounded-t"
            initial={{ height: 0 }}
            animate={{ height: `${(value / maxValue) * 80}px` }}
            transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
          />
          <span className="text-[10px] text-muted-foreground">{days[index]}</span>
        </div>
      ))}
    </div>
  );
}

// Animated Counter
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}{suffix}</span>;
}

export function DemoWalkthroughModal({ isOpen, onClose }: DemoWalkthroughModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [hoveredMood, setHoveredMood] = useState<string | null>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setCurrentStep(0);
      setHoveredMood(null);
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

  // Get current gradient based on hovered mood (Step 1 only)
  const currentGradient = currentStep === 0 && hoveredMood
    ? moodColors[hoveredMood as keyof typeof moodColors]?.gradient || step.color
    : step.color;

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
            <motion.div
              className="bg-background border border-border rounded-3xl shadow-2xl overflow-hidden relative"
              animate={{
                boxShadow: hoveredMood && currentStep === 0
                  ? `0 0 60px ${moodColors[hoveredMood as keyof typeof moodColors]?.hex}40`
                  : "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Animated background gradient for mood hover */}
              {currentStep === 0 && (
                <motion.div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  animate={{
                    background: hoveredMood
                      ? `linear-gradient(135deg, ${moodColors[hoveredMood as keyof typeof moodColors]?.hex}40 0%, transparent 100%)`
                      : "transparent"
                  }}
                  transition={{ duration: 0.3 }}
                />
              )}

              {/* Header */}
              <div className="relative p-6 pb-0 z-10">
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
              <div className="p-6 pt-4 min-h-[450px] relative overflow-hidden z-10">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="space-y-5"
                  >
                    {/* Icon */}
                    <motion.div
                      className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${currentGradient} flex items-center justify-center shadow-lg`}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", delay: 0.1 }}
                    >
                      <Icon className="w-8 h-8 text-white" />
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
                      className="text-center text-muted-foreground max-w-md mx-auto text-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      {step.description}
                    </motion.p>

                    {/* Step-specific interactive content */}
                    {currentStep === 0 && (
                      /* Step 1: Interactive Mood Badges */
                      <motion.div
                        className="flex flex-wrap justify-center gap-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        {step.features.map((feature, index) => {
                          const moodConfig = moodColors[feature as keyof typeof moodColors];
                          const MoodIcon = feature === "Deep Focus" ? Brain : feature === "Creative" ? Palette : feature === "Calm" ? Coffee : Zap;
                          return (
                            <motion.div
                              key={feature}
                              className={`px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r ${moodConfig?.gradient || step.color} text-white cursor-pointer flex items-center gap-2`}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.35 + index * 0.08 }}
                              whileHover={{ scale: 1.1, y: -4 }}
                              onHoverStart={() => setHoveredMood(feature)}
                              onHoverEnd={() => setHoveredMood(null)}
                              style={{
                                boxShadow: hoveredMood === feature ? `0 8px 30px ${moodConfig?.hex}60` : "none"
                              }}
                            >
                              <MoodIcon className="w-4 h-4" />
                              {feature}
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}

                    {currentStep === 1 && (
                      /* Step 2: Animated Mini Timer */
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <MiniTimer />
                      </motion.div>
                    )}

                    {currentStep === 2 && (
                      /* Step 3: Music Services with Hover Effects */
                      <motion.div
                        className="flex flex-wrap justify-center gap-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        {musicServices.map((service, index) => (
                          <motion.div
                            key={service.name}
                            className="px-4 py-3 rounded-xl bg-secondary/80 border border-border flex items-center gap-2 cursor-pointer"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.35 + index * 0.08 }}
                            whileHover={{
                              scale: 1.08,
                              y: -3,
                              boxShadow: `0 8px 25px ${service.color}40`,
                              borderColor: service.color
                            }}
                          >
                            <span className="text-lg">{service.icon}</span>
                            <span className="text-sm font-medium">{service.name}</span>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}

                    {currentStep === 3 && (
                      /* Step 4: IDE Integration with Animations */
                      <motion.div
                        className="flex flex-wrap justify-center gap-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        {step.features.map((feature, index) => (
                          <motion.div
                            key={feature}
                            className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 flex items-center gap-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 + index * 0.1 }}
                            whileHover={{ scale: 1.05, borderColor: "#10b981" }}
                          >
                            <motion.div
                              className="w-2 h-2 rounded-full bg-emerald-400"
                              animate={{ opacity: [1, 0.4, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 }}
                            />
                            <span className="text-sm font-medium">{feature}</span>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}

                    {currentStep === 4 && (
                      /* Step 5: Analytics with Demo Data */
                      <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        {/* Stats Row */}
                        <div className="flex justify-center gap-4">
                          <motion.div
                            className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                          >
                            <div className="text-2xl font-bold text-amber-400">
                              <AnimatedCounter value={demoAnalytics.todaySessions} />
                            </div>
                            <div className="text-xs text-muted-foreground">Sessions Today</div>
                          </motion.div>
                          <motion.div
                            className="px-4 py-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-center"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            <div className="text-2xl font-bold text-orange-400">
                              <AnimatedCounter value={Math.floor(demoAnalytics.todayFocusTime / 60)} suffix="h " />
                              <AnimatedCounter value={demoAnalytics.todayFocusTime % 60} suffix="m" />
                            </div>
                            <div className="text-xs text-muted-foreground">Focus Time</div>
                          </motion.div>
                          <motion.div
                            className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-center"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 }}
                          >
                            <div className="text-2xl font-bold text-red-400">
                              <AnimatedCounter value={demoAnalytics.streak} /> 🔥
                            </div>
                            <div className="text-xs text-muted-foreground">Day Streak</div>
                          </motion.div>
                        </div>

                        {/* Weekly Chart */}
                        <motion.div
                          className="p-4 rounded-xl bg-secondary/50 border border-border"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 }}
                        >
                          <div className="text-xs text-muted-foreground mb-2 text-center">Weekly Focus Time</div>
                          <AnimatedChart />
                        </motion.div>
                      </motion.div>
                    )}
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
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
