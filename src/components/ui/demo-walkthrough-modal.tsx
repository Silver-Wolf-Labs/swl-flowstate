"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Brain, Music, BarChart3, Timer, Code2, Sparkles, Play, Pause, Coffee, Zap, Palette } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./button";

interface DemoWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGetStarted?: () => void;
}

// Mood color configurations for Step 1
const moodColors = {
  "Deep Focus": { gradient: "from-violet-500 to-purple-600", bg: "violet", hex: "#8b5cf6" },
  "Creative": { gradient: "from-pink-500 to-rose-500", bg: "pink", hex: "#ec4899" },
  "Calm": { gradient: "from-cyan-500 to-teal-500", bg: "cyan", hex: "#06b6d4" },
  "Energetic": { gradient: "from-orange-500 to-amber-500", bg: "orange", hex: "#f97316" },
};

// SVG Icons for music services
const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const SpotifyIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);

const AppleMusicIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03c.525 0 1.048-.034 1.57-.1.823-.106 1.597-.35 2.296-.81.84-.553 1.472-1.287 1.88-2.208.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76.962-1.388 1.14-.35.1-.706.157-1.07.173-.95.042-1.785-.455-2.105-1.245-.38-.94.093-2.003 1.116-2.439.25-.106.508-.178.773-.22.457-.073.918-.118 1.374-.2.27-.05.465-.193.545-.463.027-.095.038-.195.038-.293V9.207c0-.283-.07-.37-.35-.32l-4.57.88c-.028.005-.056.014-.084.02-.19.047-.272.143-.28.34-.005.096 0 .193 0 .29v6.766c0 .39-.05.773-.21 1.134-.267.6-.71.985-1.32 1.18-.39.125-.79.19-1.2.21-.94.05-1.79-.41-2.13-1.18-.4-.91.03-1.97 1.03-2.43.29-.13.6-.21.91-.27.39-.07.78-.12 1.17-.18.33-.05.55-.21.63-.54.02-.08.03-.17.03-.26V7.06c0-.34.07-.46.4-.53l5.96-1.16c.32-.06.65-.12.98-.17.18-.03.28.04.3.23.01.06.01.12.01.18v4.5z"/>
  </svg>
);

const SoundCloudIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.06-.052-.1-.1-.1m-.899.828c-.06 0-.091.037-.104.094L0 14.479l.165 1.308c.014.057.045.094.09.094s.089-.037.099-.094l.19-1.308-.19-1.334c-.01-.057-.044-.09-.09-.09m1.83-1.229c-.061 0-.12.045-.12.104l-.21 2.563.225 2.458c0 .06.045.104.106.104.061 0 .12-.044.12-.104l.24-2.458-.24-2.563c0-.06-.059-.104-.12-.104m.945-.089c-.075 0-.135.06-.15.135l-.193 2.64.21 2.544c.016.077.075.138.149.138.075 0 .135-.061.15-.138l.225-2.544-.225-2.64c-.015-.075-.075-.135-.15-.135m.93-.132c-.09 0-.149.075-.165.165l-.195 2.775.195 2.52c.016.09.075.164.165.164.089 0 .149-.074.164-.164l.21-2.52-.21-2.775c-.015-.09-.075-.165-.164-.165m.96-.015c-.105 0-.18.09-.195.195l-.18 2.79.18 2.49c.015.105.09.195.195.195.104 0 .179-.09.194-.195l.195-2.49-.195-2.79c-.015-.105-.09-.195-.194-.195m.989-.015c-.119 0-.21.104-.225.225l-.165 2.805.165 2.46c.015.12.106.225.225.225.12 0 .21-.105.225-.225l.18-2.46-.18-2.805c-.015-.12-.105-.225-.225-.225m1.02.045c-.135 0-.24.12-.255.255l-.15 2.76.15 2.415c.015.135.12.255.255.255.135 0 .24-.12.255-.255l.165-2.415-.165-2.76c-.015-.135-.12-.255-.255-.255m1.02-.045c-.149 0-.27.135-.27.285l-.149 2.805.149 2.37c0 .15.121.285.27.285.15 0 .27-.135.285-.285l.165-2.37-.165-2.805c-.015-.15-.135-.285-.285-.285m1.035-.075c-.165 0-.3.15-.315.315l-.135 2.88.135 2.34c.015.165.15.315.315.315.165 0 .3-.15.315-.315l.15-2.34-.15-2.88c-.015-.165-.15-.315-.315-.315m1.05-.045c-.18 0-.33.165-.345.345l-.12 2.925.12 2.295c.015.18.165.345.345.345.18 0 .33-.165.345-.345l.135-2.295-.135-2.925c-.015-.18-.165-.345-.345-.345m1.05.015c-.195 0-.36.18-.36.375l-.12 2.91.12 2.265c0 .195.165.375.36.375.195 0 .36-.18.375-.375l.12-2.265-.12-2.91c-.015-.195-.18-.375-.375-.375m1.065-.03c-.21 0-.39.195-.39.405l-.105 2.94.105 2.235c0 .21.18.405.39.405.21 0 .39-.195.405-.405l.12-2.235-.12-2.94c-.015-.21-.195-.405-.405-.405m1.08-.015c-.225 0-.42.21-.42.435l-.105 2.955.105 2.205c0 .225.195.435.42.435.225 0 .42-.21.435-.435l.105-2.205-.105-2.955c-.015-.225-.21-.435-.435-.435m1.095.015c-.24 0-.45.225-.45.465l-.09 2.94.09 2.175c0 .24.21.465.45.465.24 0 .45-.225.465-.465l.105-2.175-.105-2.94c-.015-.24-.225-.465-.465-.465m1.095.045c-.255 0-.48.24-.48.495l-.09 2.895.09 2.145c0 .255.225.495.48.495.255 0 .48-.24.495-.495l.09-2.145-.09-2.895c-.015-.255-.24-.495-.495-.495m1.11.015c-.27 0-.51.255-.51.525l-.075 2.88.075 2.115c0 .27.24.525.51.525.27 0 .51-.255.525-.525l.09-2.115-.09-2.88c-.015-.27-.255-.525-.525-.525m1.11.045c-.285 0-.54.27-.54.555l-.075 2.835.075 2.085c0 .285.255.555.54.555.285 0 .54-.27.555-.555l.075-2.085-.075-2.835c-.015-.285-.27-.555-.555-.555m1.125.03c-.3 0-.57.285-.57.585l-.06 2.805.06 2.055c0 .3.27.585.57.585.3 0 .57-.285.585-.585l.075-2.055-.075-2.805c-.015-.3-.285-.585-.585-.585m1.125.045c-.315 0-.6.3-.6.615l-.06 2.76.06 2.025c0 .315.285.615.6.615.315 0 .6-.3.615-.615l.06-2.025-.06-2.76c-.015-.315-.3-.615-.615-.615m1.14.03c-.33 0-.63.315-.63.645l-.045 2.73.045 1.995c0 .33.3.645.63.645.33 0 .63-.315.645-.645l.06-1.995-.06-2.73c-.015-.33-.315-.645-.645-.645m1.14.045c-.345 0-.66.33-.66.675l-.045 2.685.045 1.965c0 .345.315.675.66.675.345 0 .66-.33.675-.675l.045-1.965-.045-2.685c-.015-.345-.33-.675-.675-.675m1.155.03c-.36 0-.69.345-.69.705l-.03 2.655.03 1.935c0 .36.33.705.69.705.36 0 .69-.345.705-.705l.045-1.935-.045-2.655c-.015-.36-.345-.705-.705-.705m1.155.045c-.375 0-.72.36-.72.735l-.03 2.61.03 1.905c0 .375.345.735.72.735.375 0 .72-.36.735-.735l.03-1.905-.03-2.61c-.015-.375-.36-.735-.735-.735m1.17.03c-.39 0-.75.375-.75.765l-.015 2.58.015 1.875c0 .39.36.765.75.765.39 0 .75-.375.765-.765l.03-1.875-.03-2.58c-.015-.39-.375-.765-.765-.765m1.17.045c-.405 0-.78.39-.78.795l-.015 2.535.015 1.845c0 .405.375.795.78.795.405 0 .78-.39.795-.795l.015-1.845-.015-2.535c-.015-.405-.39-.795-.795-.795m1.185.03c-.42 0-.81.405-.81.825v2.505l.015 1.815c0 .42.39.825.81.825.42 0 .81-.405.825-.825l.015-1.815-.015-2.505c-.015-.42-.405-.825-.825-.825"/>
  </svg>
);

// Music services for Step 3
const musicServices = [
  { name: "YouTube", Icon: YouTubeIcon, color: "#FF0000" },
  { name: "Spotify", Icon: SpotifyIcon, color: "#1DB954" },
  { name: "Apple Music", Icon: AppleMusicIcon, color: "#FA243C" },
  { name: "SoundCloud", Icon: SoundCloudIcon, color: "#FF5500" },
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
          const newMode = mode === "focus" ? "break" : "focus";
          setMode(newMode);
          return newMode === "focus" ? 25 * 60 : 5 * 60;
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

  const handleBreakClick = () => {
    setMode("break");
    setTime(5 * 60);
    setIsRunning(true);
  };

  const handleFocusClick = () => {
    setMode("focus");
    setTime(25 * 60);
    setIsRunning(true);
  };

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
          title={isRunning ? "Pause" : "Play"}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </motion.button>
        <motion.button
          className={`p-2 rounded-lg ${mode === "break" ? "bg-green-500/20 text-green-400" : "bg-secondary text-muted-foreground"}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleBreakClick}
          title="Start 5min Break"
        >
          <Coffee className="w-4 h-4" />
        </motion.button>
        <motion.button
          className={`p-2 rounded-lg ${mode === "focus" ? "bg-cyan-500/20 text-cyan-400" : "bg-secondary text-muted-foreground"}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleFocusClick}
          title="Start 25min Focus"
        >
          <Timer className="w-4 h-4" />
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

export function DemoWalkthroughModal({ isOpen, onClose, onGetStarted }: DemoWalkthroughModalProps) {
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
                        {musicServices.map((service, index) => {
                          const ServiceIcon = service.Icon;
                          return (
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
                              style={{ color: service.color }}
                            >
                              <ServiceIcon />
                              <span className="text-sm font-medium text-foreground">{service.name}</span>
                            </motion.div>
                          );
                        })}
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
                        if (onGetStarted) {
                          setTimeout(() => {
                            onGetStarted();
                          }, 300);
                        }
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
