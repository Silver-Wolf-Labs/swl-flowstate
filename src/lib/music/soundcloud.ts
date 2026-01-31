// SoundCloud OAuth 2.1 API integration
// Docs: https://developers.soundcloud.com/docs/api/guide

const SOUNDCLOUD_CLIENT_ID = process.env.NEXT_PUBLIC_SOUNDCLOUD_CLIENT_ID || "";
const SOUNDCLOUD_REDIRECT_URI = typeof window !== "undefined" 
  ? `${window.location.origin}/api/auth/soundcloud/callback`
  : "";
const SOUNDCLOUD_API_BASE = "https://api.soundcloud.com";
const SOUNDCLOUD_AUTH_URL = "https://api.soundcloud.com/connect";

// Types
export interface SoundCloudUser {
  id: number;
  username: string;
  avatar_url: string;
  full_name: string;
  permalink_url: string;
}

export interface SoundCloudTrack {
  id: number;
  title: string;
  description: string;
  uri: string;
  duration: number;
  user: SoundCloudUser;
  artwork_url: string | null;
  permalink_url: string;
  stream_url?: string;
  waveform_url: string;
  genre: string;
  tag_list: string;
  playback_count: number;
  likes_count: number;
}

export interface SoundCloudPlaylist {
  id: number;
  title: string;
  description: string;
  uri: string;
  permalink_url: string;
  artwork_url: string | null;
  user: SoundCloudUser;
  track_count: number;
  tracks?: SoundCloudTrack[];
  duration: number;
  genre: string;
}

export interface SoundCloudTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

// Token storage keys
const TOKEN_STORAGE_KEY = "soundcloud_tokens";
const VERIFIER_STORAGE_KEY = "soundcloud_code_verifier";

// PKCE helpers
function generateRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join("");
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Auth service
export const soundcloudAuth = {
  // Start OAuth flow
  async login(): Promise<void> {
    if (!SOUNDCLOUD_CLIENT_ID) {
      throw new Error("SoundCloud Client ID not configured. Add NEXT_PUBLIC_SOUNDCLOUD_CLIENT_ID to .env.local");
    }

    const codeVerifier = generateRandomString(64);
    localStorage.setItem(VERIFIER_STORAGE_KEY, codeVerifier);

    const codeChallenge = await generateCodeChallenge(codeVerifier);

    const params = new URLSearchParams({
      client_id: SOUNDCLOUD_CLIENT_ID,
      redirect_uri: SOUNDCLOUD_REDIRECT_URI,
      response_type: "code",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state: generateRandomString(16),
    });
    // Note: scope is intentionally omitted (empty) as SoundCloud no longer allows non-expiring tokens

    window.location.href = `${SOUNDCLOUD_AUTH_URL}?${params.toString()}`;
  },

  // Exchange authorization code for tokens
  async exchangeCode(code: string): Promise<SoundCloudTokens> {
    const codeVerifier = localStorage.getItem(VERIFIER_STORAGE_KEY);
    if (!codeVerifier) {
      throw new Error("Code verifier not found");
    }

    const response = await fetch(`${SOUNDCLOUD_API_BASE}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: SOUNDCLOUD_CLIENT_ID,
        grant_type: "authorization_code",
        code,
        redirect_uri: SOUNDCLOUD_REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    const tokens: SoundCloudTokens = await response.json();
    this.saveTokens(tokens);
    localStorage.removeItem(VERIFIER_STORAGE_KEY);

    return tokens;
  },

  // Refresh access token
  async refreshToken(): Promise<SoundCloudTokens | null> {
    const tokens = this.getTokens();
    if (!tokens?.refresh_token) return null;

    try {
      const response = await fetch(`${SOUNDCLOUD_API_BASE}/oauth2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: SOUNDCLOUD_CLIENT_ID,
          grant_type: "refresh_token",
          refresh_token: tokens.refresh_token,
        }),
      });

      if (!response.ok) {
        this.logout();
        return null;
      }

      const newTokens: SoundCloudTokens = await response.json();
      this.saveTokens(newTokens);
      return newTokens;
    } catch {
      this.logout();
      return null;
    }
  },

  // Save tokens to localStorage
  saveTokens(tokens: SoundCloudTokens): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify({
      ...tokens,
      expires_at: Date.now() + tokens.expires_in * 1000,
    }));
  },

  // Get tokens from localStorage
  getTokens(): (SoundCloudTokens & { expires_at: number }) | null {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const tokens = this.getTokens();
    return !!tokens?.access_token;
  },

  // Get valid access token (refresh if needed)
  async getAccessToken(): Promise<string | null> {
    const tokens = this.getTokens();
    if (!tokens) return null;

    // Refresh if expired or expiring soon (5 min buffer)
    if (tokens.expires_at && Date.now() > tokens.expires_at - 300000) {
      const refreshed = await this.refreshToken();
      return refreshed?.access_token || null;
    }

    return tokens.access_token;
  },

  // Logout
  logout(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(VERIFIER_STORAGE_KEY);
  },
};

// API service
export const soundcloudApi = {
  // Make authenticated API request
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const accessToken = await soundcloudAuth.getAccessToken();
    if (!accessToken) {
      throw new Error("Not authenticated with SoundCloud");
    }

    const response = await fetch(`${SOUNDCLOUD_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `OAuth ${accessToken}`,
        Accept: "application/json",
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token expired, try refresh
      const refreshed = await soundcloudAuth.refreshToken();
      if (refreshed) {
        return this.request(endpoint, options);
      }
      throw new Error("Authentication expired");
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SoundCloud API error: ${error}`);
    }

    return response.json();
  },

  // Get current user
  async getMe(): Promise<SoundCloudUser> {
    return this.request("/me");
  },

  // Get user's playlists
  async getMyPlaylists(limit = 20): Promise<SoundCloudPlaylist[]> {
    return this.request(`/me/playlists?limit=${limit}`);
  },

  // Get user's liked tracks
  async getMyLikes(limit = 20): Promise<SoundCloudTrack[]> {
    const response = await this.request<{ collection: SoundCloudTrack[] }>(
      `/me/likes/tracks?limit=${limit}`
    );
    return response.collection || response as unknown as SoundCloudTrack[];
  },

  // Get user's tracks
  async getMyTracks(limit = 20): Promise<SoundCloudTrack[]> {
    return this.request(`/me/tracks?limit=${limit}`);
  },

  // Search tracks
  async searchTracks(query: string, limit = 20): Promise<SoundCloudTrack[]> {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
    });
    const response = await this.request<{ collection: SoundCloudTrack[] }>(
      `/tracks?${params}`
    );
    return response.collection || response as unknown as SoundCloudTrack[];
  },

  // Search playlists
  async searchPlaylists(query: string, limit = 20): Promise<SoundCloudPlaylist[]> {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
    });
    const response = await this.request<{ collection: SoundCloudPlaylist[] }>(
      `/playlists?${params}`
    );
    return response.collection || response as unknown as SoundCloudPlaylist[];
  },

  // Get playlist by ID
  async getPlaylist(playlistId: number): Promise<SoundCloudPlaylist> {
    return this.request(`/playlists/${playlistId}`);
  },

  // Get track by ID
  async getTrack(trackId: number): Promise<SoundCloudTrack> {
    return this.request(`/tracks/${trackId}`);
  },

  // Get stream URL for a track
  async getStreamUrl(trackId: number): Promise<string> {
    const response = await this.request<{ url: string }>(`/tracks/${trackId}/streams`);
    return response.url;
  },
};

// Mood-based search queries for public playlists
export const moodSearchQueries = {
  focus: ["lofi study beats", "concentration music", "deep work ambient", "focus playlist"],
  calm: ["relaxing acoustic", "peaceful piano", "calm ambient", "meditation music"],
  energetic: ["workout music", "edm dance", "high energy", "running playlist"],
  creative: ["indie creative", "inspiration music", "artistic vibes", "creative flow"],
};

// Curated SoundCloud lofi playlists for each mood (no auth required)
// Using playlist URLs that work with the embedded player
export const curatedSoundCloudStreams: Record<string, { url: string; title: string; artist: string }[]> = {
  focus: [
    { url: "https://soundcloud.com/lolofi/sets/lofi-hip-hop", title: "Lofi Hip Hop Mix", artist: "LoLofi" },
    { url: "https://soundcloud.com/chaborilemusic/sets/lofi-hip-hop-mix", title: "Lofi Hip Hop Study Beats", artist: "Chaborile" },
    { url: "https://soundcloud.com/lofi_girl/sets/lofi-hip-hop-beats-to-sleep", title: "Lofi Beats to Sleep", artist: "Lofi Girl" },
  ],
  calm: [
    { url: "https://soundcloud.com/chaborilemusic/sets/chill-lofi-beats", title: "Chill Lofi Beats", artist: "Chaborile" },
    { url: "https://soundcloud.com/lofi_girl/sets/chill-lofi", title: "Chill Lofi", artist: "Lofi Girl" },
    { url: "https://soundcloud.com/lolofi/sets/rainy-lofi", title: "Rainy Day Lofi", artist: "LoLofi" },
  ],
  energetic: [
    { url: "https://soundcloud.com/nocopyrightsounds/sets/ncs-uplifting", title: "NCS Uplifting", artist: "NoCopyrightSounds" },
    { url: "https://soundcloud.com/lolofi/sets/lofi-beats-chill", title: "Upbeat Lofi", artist: "LoLofi" },
    { url: "https://soundcloud.com/chaborilemusic/sets/lofi-hip-hop-chill", title: "Lofi Chill Vibes", artist: "Chaborile" },
  ],
  creative: [
    { url: "https://soundcloud.com/lolofi/sets/jazz-lofi", title: "Jazz Lofi Mix", artist: "LoLofi" },
    { url: "https://soundcloud.com/chaborilemusic/sets/jazzy-lofi", title: "Jazzy Lofi Beats", artist: "Chaborile" },
    { url: "https://soundcloud.com/lofi_girl/sets/lofi-jazz", title: "Lofi Jazz", artist: "Lofi Girl" },
  ],
};

// Get curated SoundCloud streams for a mood
export function getCuratedSoundCloudStreams(mood: string) {
  return curatedSoundCloudStreams[mood] || curatedSoundCloudStreams.focus;
}

// Get mood-based playlists (public search)
export async function getMoodPlaylists(
  mood: "focus" | "calm" | "energetic" | "creative",
  limit = 10
): Promise<SoundCloudPlaylist[]> {
  const queries = moodSearchQueries[mood];
  const randomQuery = queries[Math.floor(Math.random() * queries.length)];
  
  try {
    return await soundcloudApi.searchPlaylists(randomQuery, limit);
  } catch (error) {
    console.error("Failed to search playlists:", error);
    return [];
  }
}

// Get mood-based tracks (public search)
export async function getMoodTracks(
  mood: "focus" | "calm" | "energetic" | "creative",
  limit = 10
): Promise<SoundCloudTrack[]> {
  const queries = moodSearchQueries[mood];
  const randomQuery = queries[Math.floor(Math.random() * queries.length)];
  
  try {
    return await soundcloudApi.searchTracks(randomQuery, limit);
  } catch (error) {
    console.error("Failed to search tracks:", error);
    return [];
  }
}

// Widget for embedded playback (used when API doesn't provide stream URLs)
declare global {
  interface Window {
    SC?: {
      Widget?: {
        (element: HTMLIFrameElement | string): SoundCloudWidget;
        Events: {
          READY: string;
          PLAY: string;
          PAUSE: string;
          FINISH: string;
          PLAY_PROGRESS: string;
          ERROR: string;
        };
      };
    };
  }
}

export interface SoundCloudWidget {
  bind(event: string, callback: (data?: unknown) => void): void;
  unbind(event: string): void;
  load(url: string, options?: { auto_play?: boolean; callback?: () => void }): void;
  play(): void;
  pause(): void;
  toggle(): void;
  seekTo(milliseconds: number): void;
  setVolume(volume: number): void;
  getVolume(callback: (volume: number) => void): void;
  getDuration(callback: (duration: number) => void): void;
  getPosition(callback: (position: number) => void): void;
  getSounds(callback: (sounds: SoundCloudTrack[]) => void): void;
  getCurrentSound(callback: (sound: SoundCloudTrack) => void): void;
  getCurrentSoundIndex(callback: (index: number) => void): void;
  isPaused(callback: (paused: boolean) => void): void;
  skip(soundIndex: number): void;
  next(): void;
  prev(): void;
}

export interface SoundCloudPlaybackState {
  isPlaying: boolean;
  currentTrack: SoundCloudTrack | null;
  position: number;
  duration: number;
  volume: number;
}

// Widget service for embedded playback
let widgetInstance: SoundCloudWidget | null = null;
let widgetIframe: HTMLIFrameElement | null = null;
let isWidgetReady = false;

export const soundcloudWidget = {
  async loadScript(): Promise<void> {
    if (typeof window === "undefined") return;
    if (window.SC?.Widget) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://w.soundcloud.com/player/api.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load SoundCloud Widget API"));
      document.head.appendChild(script);
    });
  },

  async initialize(iframe: HTMLIFrameElement): Promise<SoundCloudWidget | null> {
    if (typeof window === "undefined") return null;
    
    try {
      await this.loadScript();
      
      if (!window.SC?.Widget) {
        throw new Error("SoundCloud Widget API not loaded");
      }

      widgetIframe = iframe;
      widgetInstance = window.SC.Widget(iframe);

      return new Promise((resolve) => {
        widgetInstance!.bind(window.SC!.Widget!.Events.READY, () => {
          isWidgetReady = true;
          resolve(widgetInstance);
        });
      });
    } catch (error) {
      console.error("Failed to initialize SoundCloud widget:", error);
      return null;
    }
  },

  getWidget(): SoundCloudWidget | null {
    return widgetInstance;
  },

  isReady(): boolean {
    return isWidgetReady;
  },

  disconnect(): void {
    if (widgetInstance && window.SC?.Widget) {
      widgetInstance.pause();
    }
    widgetInstance = null;
    widgetIframe = null;
    isWidgetReady = false;
  },
};

// Legacy exports for backward compatibility
export const soundcloudService = {
  async initialize(): Promise<SoundCloudWidget | null> {
    // This is now a no-op, use the widget with an iframe
    return null;
  },
  isConnected(): boolean {
    return soundcloudAuth.isAuthenticated();
  },
  disconnect(): void {
    soundcloudAuth.logout();
    soundcloudWidget.disconnect();
  },
};

export const moodTracks = {
  focus: [] as { url: string; title: string; artist: string }[],
  calm: [] as { url: string; title: string; artist: string }[],
  energetic: [] as { url: string; title: string; artist: string }[],
  creative: [] as { url: string; title: string; artist: string }[],
};

export const featuredTracks = moodTracks.focus;
export const soundcloudMoodPlaylists = moodSearchQueries;

export async function searchSoundCloud(query: string) {
  try {
    const tracks = await soundcloudApi.searchTracks(query, 10);
    return tracks.map(t => ({
      url: t.permalink_url,
      title: t.title,
      artist: t.user.username,
    }));
  } catch {
    return [];
  }
}
