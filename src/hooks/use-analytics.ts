"use client";

import { useState, useEffect, useCallback } from "react";
import { analyticsService, type DailyStats, type FocusSession } from "@/lib/analytics";

export function useAnalytics() {
  const [todayStats, setTodayStats] = useState<DailyStats | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [productivityScore, setProductivityScore] = useState(0);
  const [weeklyFocusTime, setWeeklyFocusTime] = useState<number[]>([]);
  const [activityHeatmap, setActivityHeatmap] = useState<number[]>([]);
  const [peakHours, setPeakHours] = useState<{ start: number; end: number }>({ start: 14, end: 16 });

  // Load initial data
  const refreshData = useCallback(() => {
    const data = analyticsService.getData();
    setTodayStats(analyticsService.getTodayStats());
    setCurrentStreak(data.currentStreak);
    setTotalFocusTime(data.totalFocusTime);
    setTotalSessions(data.totalSessions);
    setProductivityScore(analyticsService.getProductivityScore());
    setWeeklyFocusTime(analyticsService.getWeeklyFocusTime());
    setActivityHeatmap(analyticsService.getActivityHeatmap());
    setPeakHours(analyticsService.getPeakHours());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Record a focus session
  const recordSession = useCallback(
    (session: Omit<FocusSession, "id">) => {
      console.log("[useAnalytics] recordSession called with:", session);
      analyticsService.recordSession(session);
      console.log("[useAnalytics] After recordSession - localStorage data:", analyticsService.getData());
      refreshData();
    },
    [refreshData]
  );

  // Increment tasks completed
  const incrementTasks = useCallback(() => {
    analyticsService.incrementTasksCompleted();
    refreshData();
  }, [refreshData]);

  // Format time helper
  const formatTime = useCallback((seconds: number) => {
    return analyticsService.formatTime(seconds);
  }, []);

  // Get formatted peak hours string
  const getPeakHoursString = useCallback(() => {
    const formatHour = (hour: number) => {
      const ampm = hour >= 12 ? "PM" : "AM";
      const h = hour % 12 || 12;
      return `${h} ${ampm}`;
    };
    return `${formatHour(peakHours.start)}-${formatHour(peakHours.end)}`;
  }, [peakHours]);

  // Getter functions for AI mood detection
  const getTodayStats = useCallback(() => {
    return todayStats || { totalFocusTime: 0, sessionsCompleted: 0, tasksCompleted: 0, primaryMood: null };
  }, [todayStats]);

  const getProductivityScore = useCallback(() => {
    return productivityScore;
  }, [productivityScore]);

  const getPeakHours = useCallback(() => {
    return peakHours;
  }, [peakHours]);

  return {
    // Stats
    todayStats,
    currentStreak,
    totalFocusTime,
    totalSessions,
    productivityScore,
    weeklyFocusTime,
    activityHeatmap,
    peakHours,
    
    // Actions
    recordSession,
    incrementTasks,
    refreshData,
    
    // Helpers
    formatTime,
    getPeakHoursString,
    
    // Getters for mood detection
    getTodayStats,
    getProductivityScore,
    getPeakHours,
  };
}

export type { DailyStats, FocusSession };
