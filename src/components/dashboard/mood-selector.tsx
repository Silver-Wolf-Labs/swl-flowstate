"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, Palette, Coffee, Sparkles, Wand2, X, Lightbulb } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { detectMood, getMoodTips, getTimeGreeting, type MoodId } from "@/lib/mood-detection";
import { useAnalytics } from "@/hooks";

interface Mood {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  bgClass: string;
}

const moods: Mood[] = [
  {
    id: "focus",
    name: "Deep Focus",
    description: "Minimize distractions, maximize output",
    icon: Brain,
    color: "#8b5cf6",
    gradient: "from-violet-500 to-purple-600",
    bgClass: "bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/30",
  },
  {
    id: "energetic",
    name: "Energetic",
    description: "High energy, fast-paced work",
    icon: Zap,
    color: "#f97316",
    gradient: "from-orange-500 to-amber-500",
    bgClass: "bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Explore ideas, think outside the box",
    icon: Palette,
    color: "#ec4899",
    gradient: "from-pink-500 to-rose-500",
    bgClass: "bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/30",
  },
  {
    id: "calm",
    name: "Calm",
    description: "Relaxed and steady progress",
    icon: Coffee,
    color: "#06b6d4",
    gradient: "from-cyan-500 to-teal-500",
    bgClass: "bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30",
  },
];

interface MoodSelectorProps {
  onMoodSelect?: (mood: Mood) => void;
  currentMood?: string;
}

export function MoodSelector({ onMoodSelect, currentMood: externalMood }: MoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState<string>(externalMood || "focus");
  
  // Sync with external mood changes (from IDE)
  useEffect(() => {
    if (externalMood && externalMood !== selectedMood) {
      setSelectedMood(externalMood);
    }
  }, [externalMood]);
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    mood: MoodId;
    confidence: number;
    reasoning: string[];
    tips: string[];
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { getTodayStats, getProductivityScore, getPeakHours } = useAnalytics();

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood.id);
    onMoodSelect?.(mood);
    setShowAISuggestion(false);
  };

  const handleAISuggest = async () => {
    setIsAnalyzing(true);
    setShowAISuggestion(true);

    // Simulate AI thinking with a small delay for UX
    await new Promise(resolve => setTimeout(resolve, 800));

    // Get productivity data for the AI
    const todayStats = getTodayStats();
    const peakHours = getPeakHours();

    const suggestion = detectMood({
      sessionsCompleted: todayStats.sessionsCompleted,
      totalFocusTime: todayStats.totalFocusTime * 60, // Convert to seconds
      streak: todayStats.sessionsCompleted > 0 ? 1 : 0,
      lastSessionMood: selectedMood as MoodId,
      peakHours: peakHours ? { start: peakHours.start, end: peakHours.end } : undefined,
    });

    const tips = getMoodTips(suggestion.mood);

    setAiSuggestion({
      ...suggestion,
      tips,
    });
    setIsAnalyzing(false);
  };

  const applyAISuggestion = () => {
    if (aiSuggestion) {
      const mood = moods.find(m => m.id === aiSuggestion.mood);
      if (mood) {
        handleMoodSelect(mood);
      }
    }
  };

  const currentMood = moods.find(m => m.id === selectedMood);

  return (
    <Card variant="gradient" className="relative overflow-hidden">
      {/* Animated background gradient based on mood */}
      <motion.div
        className={cn(
          "absolute inset-0 opacity-30 bg-gradient-to-br",
          currentMood?.gradient
        )}
        animate={{ opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Current Vibe
            </CardTitle>
            <CardDescription>Set your mood to optimize your environment</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={handleAISuggest}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 text-sm font-medium hover:from-primary/30 hover:to-accent/30 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Wand2 className="w-4 h-4 text-primary" />
              <span className="hidden sm:inline">AI Suggest</span>
            </motion.button>
            {currentMood && (
              <Badge variant="default" pulse>
                {currentMood.name}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        {/* AI Suggestion Panel */}
        <AnimatePresence>
          {showAISuggestion && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                {isAnalyzing ? (
                  <div className="flex items-center justify-center gap-3 py-4">
                    <motion.div
                      className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="text-sm text-muted-foreground">Analyzing your productivity patterns...</span>
                  </div>
                ) : aiSuggestion ? (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <Wand2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{getTimeGreeting()}</p>
                          <p className="text-xs text-muted-foreground">AI Mood Suggestion</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowAISuggestion(false)}
                        className="p-1 rounded-lg hover:bg-secondary transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium",
                        aiSuggestion.mood === "focus" && "bg-violet-500/20 text-violet-400",
                        aiSuggestion.mood === "energetic" && "bg-orange-500/20 text-orange-400",
                        aiSuggestion.mood === "creative" && "bg-pink-500/20 text-pink-400",
                        aiSuggestion.mood === "calm" && "bg-cyan-500/20 text-cyan-400",
                      )}>
                        Recommended: {moods.find(m => m.id === aiSuggestion.mood)?.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {aiSuggestion.confidence}% confidence
                      </div>
                    </div>

                    {aiSuggestion.reasoning.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Why this mood?</p>
                        <ul className="text-xs text-muted-foreground space-y-0.5">
                          {aiSuggestion.reasoning.slice(0, 3).map((reason, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-primary mt-0.5">•</span>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {aiSuggestion.tips.length > 0 && (
                      <div className="pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
                          <Lightbulb className="w-3.5 h-3.5" />
                          Quick tip
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {aiSuggestion.tips[Math.floor(Math.random() * aiSuggestion.tips.length)]}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="gradient"
                        size="sm"
                        onClick={applyAISuggestion}
                        className="flex-1"
                      >
                        Apply Suggestion
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAISuggestion(false)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {moods.map((mood, index) => {
            const Icon = mood.icon;
            const isSelected = selectedMood === mood.id;
            const isAISuggested = aiSuggestion?.mood === mood.id && showAISuggestion;
            
            return (
              <motion.button
                key={mood.id}
                className={cn(
                  "relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300",
                  mood.bgClass,
                  isSelected && "ring-2 ring-offset-2 ring-offset-background",
                  isAISuggested && !isSelected && "ring-2 ring-offset-2 ring-offset-background ring-primary/50",
                )}
                style={{ 
                  "--tw-ring-color": isSelected ? mood.color : "transparent",
                } as React.CSSProperties}
                onClick={() => handleMoodSelect(mood)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* AI Suggested indicator */}
                {isAISuggested && !isSelected && (
                  <motion.div
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Wand2 className="w-3 h-3 text-white" />
                  </motion.div>
                )}

                {/* Glow effect when selected */}
                {isSelected && (
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{ 
                      boxShadow: `0 0 30px ${mood.color}40, 0 0 60px ${mood.color}20`
                    }}
                    animate={{ 
                      boxShadow: [
                        `0 0 20px ${mood.color}30, 0 0 40px ${mood.color}10`,
                        `0 0 30px ${mood.color}50, 0 0 60px ${mood.color}20`,
                        `0 0 20px ${mood.color}30, 0 0 40px ${mood.color}10`,
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                
                <motion.div
                  className={cn(
                    "relative w-12 h-12 rounded-xl flex items-center justify-center mb-2",
                    `bg-gradient-to-br ${mood.gradient}`
                  )}
                  animate={isSelected ? { 
                    rotate: [0, 5, -5, 0],
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>
                
                <span className="font-medium text-sm text-foreground">{mood.name}</span>
                <span className="text-xs text-muted-foreground text-center mt-1 line-clamp-1">
                  {mood.description}
                </span>
              </motion.button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
