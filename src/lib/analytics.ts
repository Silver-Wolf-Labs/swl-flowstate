// Analytics tracking service - stores data in localStorage

const ANALYTICS_KEY = "focus_analytics";

export interface FocusSession {
  id: string;
  startTime: number;
  endTime: number;
  duration: number; // in seconds
  type: "focus" | "shortBreak" | "longBreak";
  mood: string;
  completed: boolean;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  totalFocusTime: number; // seconds
  sessionsCompleted: number;
  tasksCompleted: number;
  primaryMood: string;
}

export interface AnalyticsData {
  sessions: FocusSession[];
  dailyStats: DailyStats[];
  currentStreak: number;
  longestStreak: number;
  totalFocusTime: number;
  totalSessions: number;
  lastActiveDate: string;
}

const defaultAnalytics: AnalyticsData = {
  sessions: [],
  dailyStats: [],
  currentStreak: 0,
  longestStreak: 0,
  totalFocusTime: 0,
  totalSessions: 0,
  lastActiveDate: "",
};

// Get today's date in YYYY-MM-DD format
function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

// Get date string for a given timestamp
function getDateString(timestamp: number): string {
  return new Date(timestamp).toISOString().split("T")[0];
}

// Check if two dates are consecutive
function areConsecutiveDays(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

export const analyticsService = {
  // Get all analytics data
  getData(): AnalyticsData {
    if (typeof window === "undefined") return defaultAnalytics;
    const stored = localStorage.getItem(ANALYTICS_KEY);
    return stored ? JSON.parse(stored) : defaultAnalytics;
  },

  // Save analytics data
  saveData(data: AnalyticsData): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
  },

  // Record a completed focus session
  recordSession(session: Omit<FocusSession, "id">): void {
    console.log("[analyticsService] recordSession called");
    const data = this.getData();
    const today = getTodayDate();
    console.log("[analyticsService] today:", today, "current data:", data);

    // Add session
    const newSession: FocusSession = {
      ...session,
      id: `session-${Date.now()}`,
    };
    data.sessions.push(newSession);

    // Only count focus sessions (not breaks)
    if (session.type === "focus" && session.completed) {
      data.totalFocusTime += session.duration;
      data.totalSessions += 1;

      // Update daily stats
      let todayStats = data.dailyStats.find((d) => d.date === today);
      if (!todayStats) {
        todayStats = {
          date: today,
          totalFocusTime: 0,
          sessionsCompleted: 0,
          tasksCompleted: 0,
          primaryMood: session.mood,
        };
        data.dailyStats.push(todayStats);
      }
      todayStats.totalFocusTime += session.duration;
      todayStats.sessionsCompleted += 1;

      // Update streak
      if (data.lastActiveDate !== today) {
        if (data.lastActiveDate === "" || areConsecutiveDays(data.lastActiveDate, today)) {
          data.currentStreak += 1;
        } else {
          // Streak broken, check if yesterday
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];
          if (data.lastActiveDate !== yesterdayStr) {
            data.currentStreak = 1;
          }
        }
        data.lastActiveDate = today;
      }

      // Update longest streak
      if (data.currentStreak > data.longestStreak) {
        data.longestStreak = data.currentStreak;
      }
    }

    console.log("[analyticsService] Saving data:", data);
    this.saveData(data);
  },

  // Increment task completed
  incrementTasksCompleted(): void {
    const data = this.getData();
    const today = getTodayDate();

    let todayStats = data.dailyStats.find((d) => d.date === today);
    if (!todayStats) {
      todayStats = {
        date: today,
        totalFocusTime: 0,
        sessionsCompleted: 0,
        tasksCompleted: 0,
        primaryMood: "focus",
      };
      data.dailyStats.push(todayStats);
    }
    todayStats.tasksCompleted += 1;

    this.saveData(data);
  },

  // Get today's stats
  getTodayStats(): DailyStats | null {
    const data = this.getData();
    const today = getTodayDate();
    return data.dailyStats.find((d) => d.date === today) || null;
  },

  // Get stats for the last N days
  getRecentStats(days: number = 7): DailyStats[] {
    const data = this.getData();
    const result: DailyStats[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      const dayStats = data.dailyStats.find((d) => d.date === dateStr);
      result.push(
        dayStats || {
          date: dateStr,
          totalFocusTime: 0,
          sessionsCompleted: 0,
          tasksCompleted: 0,
          primaryMood: "focus",
        }
      );
    }
    
    return result.reverse(); // Oldest first
  },

  // Get weekly focus time data for chart (last 7 days)
  getWeeklyFocusTime(): number[] {
    const recentStats = this.getRecentStats(7);
    return recentStats.map((day) => Math.round(day.totalFocusTime / 60)); // Convert to minutes
  },

  // Get activity data for heatmap (last 7 weeks)
  getActivityHeatmap(): number[] {
    const data = this.getData();
    const result: number[] = [];
    const maxFocusTime = 4 * 60 * 60; // 4 hours as max for normalization

    for (let i = 48; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      const dayStats = data.dailyStats.find((d) => d.date === dateStr);
      const focusTime = dayStats?.totalFocusTime || 0;
      // Normalize to 0-1 range
      result.push(Math.min(focusTime / maxFocusTime, 1));
    }
    
    return result;
  },

  // Calculate productivity score (0-100)
  getProductivityScore(): number {
    const todayStats = this.getTodayStats();
    if (!todayStats) return 0;

    // Score based on:
    // - Focus time (max 4 hours = 40 points)
    // - Sessions completed (max 8 = 30 points)
    // - Tasks completed (max 10 = 30 points)
    const focusScore = Math.min((todayStats.totalFocusTime / (4 * 60 * 60)) * 40, 40);
    const sessionScore = Math.min((todayStats.sessionsCompleted / 8) * 30, 30);
    const taskScore = Math.min((todayStats.tasksCompleted / 10) * 30, 30);

    return Math.round(focusScore + sessionScore + taskScore);
  },

  // Get peak productivity hours (returns array of hour indices with most sessions)
  getPeakHours(): { start: number; end: number } {
    const data = this.getData();
    const hourCounts: number[] = new Array(24).fill(0);

    data.sessions.forEach((session) => {
      if (session.type === "focus" && session.completed) {
        const hour = new Date(session.startTime).getHours();
        hourCounts[hour] += 1;
      }
    });

    // Find the 2-hour window with most sessions
    let maxCount = 0;
    let peakStart = 14; // Default to 2 PM

    for (let i = 0; i < 23; i++) {
      const windowCount = hourCounts[i] + hourCounts[i + 1];
      if (windowCount > maxCount) {
        maxCount = windowCount;
        peakStart = i;
      }
    }

    return { start: peakStart, end: peakStart + 2 };
  },

  // Format time from seconds to "Xh Ym" format
  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  },

  // Clear all data (for testing/reset)
  clearData(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ANALYTICS_KEY);
  },
};
