/**
 * AI Mood Detection System
 * 
 * Analyzes multiple signals to suggest the optimal mood for productivity:
 * - Time of day patterns
 * - Recent productivity data
 * - Session history
 * - Day of week patterns
 */

export type MoodId = "focus" | "calm" | "energetic" | "creative";

interface MoodSuggestion {
  mood: MoodId;
  confidence: number; // 0-100
  reasoning: string[];
}

interface ProductivityData {
  sessionsCompleted: number;
  totalFocusTime: number;
  streak: number;
  lastSessionMood?: MoodId;
  peakHours?: { start: number; end: number };
}

// Circadian rhythm-based mood mapping
const TIME_MOOD_MAP: Record<string, { mood: MoodId; weight: number }> = {
  // Early morning (5-8): Calm start
  "05": { mood: "calm", weight: 0.7 },
  "06": { mood: "calm", weight: 0.8 },
  "07": { mood: "energetic", weight: 0.6 },
  // Morning peak (8-11): High focus
  "08": { mood: "focus", weight: 0.9 },
  "09": { mood: "focus", weight: 1.0 },
  "10": { mood: "focus", weight: 1.0 },
  "11": { mood: "focus", weight: 0.9 },
  // Midday (12-14): Creative dip
  "12": { mood: "creative", weight: 0.7 },
  "13": { mood: "calm", weight: 0.6 },
  "14": { mood: "creative", weight: 0.7 },
  // Afternoon (15-17): Second wind
  "15": { mood: "focus", weight: 0.8 },
  "16": { mood: "energetic", weight: 0.8 },
  "17": { mood: "energetic", weight: 0.7 },
  // Evening (18-21): Wind down
  "18": { mood: "creative", weight: 0.8 },
  "19": { mood: "creative", weight: 0.9 },
  "20": { mood: "calm", weight: 0.8 },
  "21": { mood: "calm", weight: 0.9 },
  // Night (22-4): Rest or deep work
  "22": { mood: "calm", weight: 0.7 },
  "23": { mood: "calm", weight: 0.6 },
  "00": { mood: "focus", weight: 0.5 },
  "01": { mood: "focus", weight: 0.4 },
  "02": { mood: "calm", weight: 0.3 },
  "03": { mood: "calm", weight: 0.3 },
  "04": { mood: "calm", weight: 0.4 },
};

// Day of week patterns
const DAY_MOOD_BIAS: Record<number, { mood: MoodId; weight: number }> = {
  0: { mood: "calm", weight: 0.3 }, // Sunday - relaxed
  1: { mood: "focus", weight: 0.4 }, // Monday - start strong
  2: { mood: "focus", weight: 0.5 }, // Tuesday - peak productivity
  3: { mood: "focus", weight: 0.5 }, // Wednesday - midweek push
  4: { mood: "creative", weight: 0.4 }, // Thursday - creative day
  5: { mood: "energetic", weight: 0.4 }, // Friday - finish strong
  6: { mood: "creative", weight: 0.3 }, // Saturday - creative weekend
};

// Productivity-based mood suggestions
function getProductivityBasedMood(data: ProductivityData | null): { mood: MoodId; weight: number; reason: string } | null {
  if (!data) return null;

  const { sessionsCompleted, totalFocusTime, streak, lastSessionMood } = data;
  const focusHours = totalFocusTime / 3600;

  // If they've done a lot already today, suggest a break mood
  if (sessionsCompleted >= 6) {
    return {
      mood: "calm",
      weight: 0.6,
      reason: `You've completed ${sessionsCompleted} sessions today - consider a calmer pace`,
    };
  }

  // If they're on a streak, keep the momentum
  if (streak >= 3 && lastSessionMood) {
    return {
      mood: lastSessionMood,
      weight: 0.5,
      reason: `You're on a ${streak}-day streak with ${lastSessionMood} mood - keep it going!`,
    };
  }

  // If they haven't done much, suggest energetic to get started
  if (sessionsCompleted === 0 && focusHours < 1) {
    return {
      mood: "energetic",
      weight: 0.4,
      reason: "Start your day with some energy to build momentum",
    };
  }

  // After 2-4 hours of focus, suggest creative for variety
  if (focusHours >= 2 && focusHours < 4 && lastSessionMood === "focus") {
    return {
      mood: "creative",
      weight: 0.4,
      reason: "After focused work, a creative session can spark new ideas",
    };
  }

  return null;
}

// Check if user is in their peak productivity hours
function isPeakHour(peakHours: { start: number; end: number } | undefined): boolean {
  if (!peakHours) return false;
  const currentHour = new Date().getHours();
  return currentHour >= peakHours.start && currentHour <= peakHours.end;
}

/**
 * Analyze signals and suggest optimal mood
 */
export function detectMood(productivityData?: ProductivityData | null): MoodSuggestion {
  const now = new Date();
  const hour = now.getHours().toString().padStart(2, "0");
  const dayOfWeek = now.getDay();

  const scores: Record<MoodId, { score: number; reasons: string[] }> = {
    focus: { score: 0, reasons: [] },
    calm: { score: 0, reasons: [] },
    energetic: { score: 0, reasons: [] },
    creative: { score: 0, reasons: [] },
  };

  // 1. Time-based scoring (weight: 40%)
  const timeData = TIME_MOOD_MAP[hour];
  if (timeData) {
    scores[timeData.mood].score += timeData.weight * 40;
    scores[timeData.mood].reasons.push(
      `${timeData.mood === "focus" ? "Peak focus hours" : 
        timeData.mood === "creative" ? "Creative time of day" :
        timeData.mood === "energetic" ? "High energy period" : 
        "Natural wind-down time"} (${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`
    );
  }

  // 2. Day of week bias (weight: 20%)
  const dayData = DAY_MOOD_BIAS[dayOfWeek];
  if (dayData) {
    scores[dayData.mood].score += dayData.weight * 20;
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    scores[dayData.mood].reasons.push(
      `${dayNames[dayOfWeek]}s are great for ${dayData.mood === "focus" ? "focused work" : 
        dayData.mood === "creative" ? "creative thinking" : 
        dayData.mood === "energetic" ? "high-energy tasks" : "relaxed productivity"}`
    );
  }

  // 3. Productivity data scoring (weight: 40%)
  const productivityMood = getProductivityBasedMood(productivityData || null);
  if (productivityMood) {
    scores[productivityMood.mood].score += productivityMood.weight * 40;
    scores[productivityMood.mood].reasons.push(productivityMood.reason);
  }

  // 4. Peak hours bonus
  if (productivityData?.peakHours && isPeakHour(productivityData.peakHours)) {
    scores.focus.score += 15;
    scores.focus.reasons.push("You're in your peak productivity hours");
  }

  // Find the highest scoring mood
  let bestMood: MoodId = "focus";
  let highestScore = 0;

  for (const [mood, data] of Object.entries(scores)) {
    if (data.score > highestScore) {
      highestScore = data.score;
      bestMood = mood as MoodId;
    }
  }

  // Normalize confidence to 0-100
  const confidence = Math.min(100, Math.round(highestScore));

  return {
    mood: bestMood,
    confidence,
    reasoning: scores[bestMood].reasons.filter(Boolean),
  };
}

/**
 * Get mood-specific tips
 */
export function getMoodTips(mood: MoodId): string[] {
  const tips: Record<MoodId, string[]> = {
    focus: [
      "Close unnecessary tabs and apps",
      "Put your phone in another room",
      "Use the Pomodoro technique for sustained attention",
      "Take short breaks every 25-30 minutes",
    ],
    calm: [
      "Take deep breaths before starting",
      "Work at a steady, comfortable pace",
      "Don't rush - quality over speed",
      "Play ambient or lo-fi music",
    ],
    energetic: [
      "Tackle challenging tasks first",
      "Keep momentum with quick wins",
      "Stay hydrated and take movement breaks",
      "Channel energy into productive output",
    ],
    creative: [
      "Allow yourself to explore tangents",
      "Brainstorm without judgment",
      "Take walks to spark ideas",
      "Try unconventional approaches",
    ],
  };

  return tips[mood] || tips.focus;
}

/**
 * Get greeting based on time of day
 */
export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Late night warrior! 🌙";
  if (hour < 12) return "Good morning! ☀️";
  if (hour < 17) return "Good afternoon! 🌤️";
  if (hour < 21) return "Good evening! 🌆";
  return "Good night! 🌙";
}
