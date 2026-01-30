"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Clock, Target, Flame, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from "@/components/ui";
import { useAnalytics } from "@/hooks";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  color: string;
  delay?: number;
}

function StatCard({ icon: Icon, label, value, change, trend, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      className="relative p-4 rounded-xl bg-secondary/50 border border-border/50 overflow-hidden group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      {/* Background gradient on hover */}
      <motion.div
        className={cn("absolute inset-0 opacity-0 group-hover:opacity-10", color)}
        transition={{ duration: 0.3 }}
      />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className={cn("p-2 rounded-lg", color.replace("bg-", "bg-opacity-20 bg-"))}>
            <Icon className={cn("w-4 h-4", color.replace("bg-", "text-").replace("-500", "-400"))} />
          </div>
          {change && (
            <Badge 
              variant={trend === "up" ? "success" : "warning"} 
              className="text-xs"
            >
              {trend === "up" ? "↑" : "↓"} {change}
            </Badge>
          )}
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );
}

// Animated bar chart
function MiniBarChart({ data }: { data: number[] }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  
  // Normalize data to percentages (max 120 minutes = 100%)
  const maxMinutes = 120;
  const bars = data.length > 0 
    ? data.map(minutes => Math.min((minutes / maxMinutes) * 100, 100))
    : [0, 0, 0, 0, 0, 0, 0];

  return (
    <div className="flex items-end justify-between gap-2 h-24">
      {bars.map((height, index) => (
        <div key={index} className="flex flex-col items-center gap-1 flex-1">
          <motion.div
            className={cn(
              "w-full rounded-t-sm",
              height > 0 ? "bg-gradient-to-t from-primary to-accent" : "bg-secondary"
            )}
            initial={{ height: 0 }}
            animate={{ height: height > 0 ? `${Math.max(height, 5)}%` : "4px" }}
            transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
          />
          <span className="text-[10px] text-muted-foreground">{days[index]}</span>
        </div>
      ))}
    </div>
  );
}

// Activity heatmap
function ActivityHeatmap({ data }: { data: number[] }) {
  const getColor = (value: number) => {
    if (value < 0.05) return "bg-secondary";
    if (value < 0.25) return "bg-primary/20";
    if (value < 0.5) return "bg-primary/40";
    if (value < 0.75) return "bg-primary/60";
    return "bg-primary";
  };

  // Use provided data or empty array
  const heatmapData = data.length > 0 ? data : Array(49).fill(0);

  return (
    <div className="grid grid-cols-7 gap-1">
      {heatmapData.map((value, index) => (
        <motion.div
          key={index}
          className={cn("w-3 h-3 rounded-sm", getColor(value))}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.01 }}
          whileHover={{ scale: 1.5 }}
          title={`Activity: ${Math.round(value * 100)}%`}
        />
      ))}
    </div>
  );
}

export function AnalyticsPreview() {
  const {
    todayStats,
    currentStreak,
    productivityScore,
    weeklyFocusTime,
    activityHeatmap,
    formatTime,
    getPeakHoursString,
  } = useAnalytics();

  // Calculate week over week change
  const thisWeekTotal = weeklyFocusTime.slice(-7).reduce((a, b) => a + b, 0);
  const lastWeekTotal = weeklyFocusTime.slice(0, 7).reduce((a, b) => a + b, 0);
  const weekChange = lastWeekTotal > 0 
    ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100) 
    : thisWeekTotal > 0 ? 100 : 0;

  const stats = [
    { 
      icon: Clock, 
      label: "Focus Time Today", 
      value: todayStats ? formatTime(todayStats.totalFocusTime) : "0m",
      change: todayStats && todayStats.totalFocusTime > 0 ? `${todayStats.sessionsCompleted} sessions` : undefined,
      trend: "up" as const, 
      color: "bg-violet-500" 
    },
    { 
      icon: Target, 
      label: "Sessions Today", 
      value: todayStats?.sessionsCompleted.toString() || "0",
      color: "bg-cyan-500" 
    },
    { 
      icon: Flame, 
      label: "Day Streak", 
      value: currentStreak > 0 ? `${currentStreak} day${currentStreak > 1 ? "s" : ""}` : "Start today!",
      color: "bg-orange-500" 
    },
    { 
      icon: TrendingUp, 
      label: "Productivity Score", 
      value: `${productivityScore}%`,
      change: productivityScore > 0 ? "Today" : undefined,
      trend: "up" as const, 
      color: "bg-emerald-500" 
    },
  ];

  return (
    <Card variant="gradient" id="analytics">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Analytics
            </CardTitle>
            <CardDescription>Track your productivity trends</CardDescription>
          </div>
          <Badge variant="outline">
            <Calendar className="w-3 h-3 mr-1" />
            This Week
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} {...stat} delay={index * 0.1} />
          ))}
        </div>

        {/* Charts row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Weekly focus time chart */}
          <motion.div
            className="p-4 rounded-xl bg-secondary/30 border border-border/50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-sm">Weekly Focus Time</h4>
                <p className="text-xs text-muted-foreground">Minutes per day</p>
              </div>
              {weekChange !== 0 && (
                <Badge variant={weekChange >= 0 ? "success" : "warning"}>
                  {weekChange >= 0 ? "+" : ""}{weekChange}%
                </Badge>
              )}
            </div>
            <MiniBarChart data={weeklyFocusTime} />
          </motion.div>

          {/* Activity heatmap */}
          <motion.div
            className="p-4 rounded-xl bg-secondary/30 border border-border/50"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-sm">Activity Map</h4>
                <p className="text-xs text-muted-foreground">Last 7 weeks</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-0.5">
                  <div className="w-2 h-2 rounded-sm bg-secondary" />
                  <div className="w-2 h-2 rounded-sm bg-primary/30" />
                  <div className="w-2 h-2 rounded-sm bg-primary/60" />
                  <div className="w-2 h-2 rounded-sm bg-primary" />
                </div>
                <span>More</span>
              </div>
            </div>
            <ActivityHeatmap data={activityHeatmap} />
          </motion.div>
        </div>

        {/* Insights */}
        <motion.div
          className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-start gap-3">
            <motion.div
              className="p-2 rounded-lg bg-primary/20"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <TrendingUp className="w-5 h-5 text-primary" />
            </motion.div>
            <div>
              <h4 className="font-medium text-sm mb-1">AI Insight</h4>
              <p className="text-sm text-muted-foreground">
                {currentStreak > 0 ? (
                  <>
                    Great work! You&apos;re on a <span className="text-foreground font-medium">{currentStreak}-day streak</span>. 
                    {todayStats && todayStats.sessionsCompleted > 0 
                      ? ` You've completed ${todayStats.sessionsCompleted} focus session${todayStats.sessionsCompleted > 1 ? "s" : ""} today.`
                      : " Start a focus session to keep it going!"
                    }
                  </>
                ) : (
                  <>
                    Start your first focus session to begin tracking your productivity. 
                    Your focus time typically peaks between <span className="text-foreground font-medium">{getPeakHoursString()}</span>.
                  </>
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
