export type DemoMode = "tour" | "simulation" | null;

export interface TourStep {
  element?: string;
  popover: {
    title: string;
    description: string;
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
  };
}

export interface DemoState {
  mode: DemoMode;
  isActive: boolean;
  currentStep: number;
  simulatedMood: "focus" | "calm" | "energetic" | "creative";
  simulatedTimerState: "idle" | "running" | "paused" | "break";
  simulatedTimeRemaining: number;
  simulatedSessionCount: number;
}

export const INITIAL_DEMO_STATE: DemoState = {
  mode: null,
  isActive: false,
  currentStep: 0,
  simulatedMood: "focus",
  simulatedTimerState: "idle",
  simulatedTimeRemaining: 25 * 60,
  simulatedSessionCount: 0,
};

export const TOUR_STEPS: TourStep[] = [
  {
    popover: {
      title: "Welcome to FlowState! 🎯",
      description:
        "Let me show you around the productivity dashboard. This tour will highlight the key features.",
    },
  },
  {
    element: "[data-tour='timer']",
    popover: {
      title: "Focus Timer ⏱️",
      description:
        "The Pomodoro timer helps you stay focused. Start a 25-minute session and take breaks between sessions.",
      side: "right",
    },
  },
  {
    element: "[data-tour='mood-selector']",
    popover: {
      title: "Mood Selector 🎨",
      description:
        "Choose your mood to adapt the environment. Each mood changes the music, colors, and ambiance.",
      side: "bottom",
    },
  },
  {
    element: "[data-tour='music-player']",
    popover: {
      title: "Music Integration 🎵",
      description:
        "Connect to Spotify, YouTube, Apple Music, or SoundCloud. Music is curated based on your selected mood.",
      side: "left",
    },
  },
  {
    element: "[data-tour='stats']",
    popover: {
      title: "Productivity Stats 📊",
      description:
        "Track your focus sessions, total time, and streaks. See your productivity patterns over time.",
      side: "top",
    },
  },
  {
    element: "[data-tour='quick-actions']",
    popover: {
      title: "Quick Actions ⚡",
      description:
        "Access common actions quickly: start a session, take a break, or change your mood.",
      side: "left",
    },
  },
  {
    popover: {
      title: "You're All Set! 🚀",
      description:
        "Start your first focus session and boost your productivity. Happy focusing!",
    },
  },
];

