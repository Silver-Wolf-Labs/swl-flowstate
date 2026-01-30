"use client";

import { motion } from "framer-motion";
import { Brain, Zap, Palette, Coffee, Sparkles } from "lucide-react";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

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
}

export function MoodSelector({ onMoodSelect }: MoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState<string>("focus");

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood.id);
    onMoodSelect?.(mood);
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Current Vibe
            </CardTitle>
            <CardDescription>Set your mood to optimize your environment</CardDescription>
          </div>
          {currentMood && (
            <Badge variant="default" pulse>
              {currentMood.name}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {moods.map((mood, index) => {
            const Icon = mood.icon;
            const isSelected = selectedMood === mood.id;
            
            return (
              <motion.button
                key={mood.id}
                className={cn(
                  "relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300",
                  mood.bgClass,
                  isSelected && "ring-2 ring-offset-2 ring-offset-background",
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
