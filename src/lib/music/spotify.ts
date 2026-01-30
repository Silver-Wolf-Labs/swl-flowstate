// Spotify Authentication & API utilities

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_URL = "https://api.spotify.com/v1";

// Scopes for Spotify access
const SCOPES = [
  "user-read-email",
  "user-read-private",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "streaming",
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-library-read",
].join(" ");

// Generate random string for PKCE
function generateRandomString(length: number): string {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

// Generate code verifier and challenge for PKCE
async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string; width: number; height: number }[];
  };
  duration_ms: number;
  uri: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  tracks: { total: number };
  uri: string;
}

export interface SpotifyPlaybackState {
  is_playing: boolean;
  progress_ms: number;
  item: SpotifyTrack | null;
  device: {
    id: string;
    name: string;
    volume_percent: number;
  } | null;
}

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: "spotify_access_token",
  REFRESH_TOKEN: "spotify_refresh_token",
  EXPIRES_AT: "spotify_expires_at",
  CODE_VERIFIER: "spotify_code_verifier",
};

export const spotifyAuth = {
  // Initialize login flow with PKCE
  async login(): Promise<void> {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    if (!clientId) {
      throw new Error("Spotify Client ID not configured");
    }

    const codeVerifier = generateRandomString(64);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    // Store code verifier for later
    localStorage.setItem(STORAGE_KEYS.CODE_VERIFIER, codeVerifier);

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/auth/spotify/callback`;
    
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      scope: SCOPES,
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
      state: generateRandomString(16),
    });

    window.location.href = `${SPOTIFY_AUTH_URL}?${params.toString()}`;
  },

  // Exchange code for tokens
  async exchangeCode(code: string): Promise<SpotifyTokens> {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const codeVerifier = localStorage.getItem(STORAGE_KEYS.CODE_VERIFIER);
    
    if (!clientId || !codeVerifier) {
      throw new Error("Missing client ID or code verifier");
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/auth/spotify/callback`;

    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to exchange code for tokens");
    }

    const data = await response.json();
    const tokens: SpotifyTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    // Store tokens
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, tokens.expiresAt.toString());
    localStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER);

    return tokens;
  },

  // Refresh access token
  async refreshAccessToken(): Promise<SpotifyTokens | null> {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    if (!clientId || !refreshToken) {
      return null;
    }

    try {
      const response = await fetch(SPOTIFY_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: clientId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const data = await response.json();
      const tokens: SpotifyTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresAt: Date.now() + data.expires_in * 1000,
      };

      // Update stored tokens
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, tokens.expiresAt.toString());

      return tokens;
    } catch {
      return null;
    }
  },

  // Get current valid access token
  async getAccessToken(): Promise<string | null> {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);

    if (!accessToken || !expiresAt) {
      return null;
    }

    // Check if token is expired (with 5 min buffer)
    if (Date.now() >= parseInt(expiresAt) - 5 * 60 * 1000) {
      const tokens = await this.refreshAccessToken();
      return tokens?.accessToken || null;
    }

    return accessToken;
  },

  // Logout
  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);
    localStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER);
  },

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },
};

// Spotify API functions
export const spotifyApi = {
  // Make authenticated API request
  async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const accessToken = await spotifyAuth.getAccessToken();
    if (!accessToken) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${SPOTIFY_API_URL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    return response.json();
  },

  // Get current user profile
  async getMe() {
    return this.fetch<{ id: string; display_name: string; images: { url: string }[] }>("/me");
  },

  // Get user's playlists
  async getMyPlaylists(limit = 20) {
    return this.fetch<{ items: SpotifyPlaylist[] }>(`/me/playlists?limit=${limit}`);
  },

  // Get playlist tracks
  async getPlaylistTracks(playlistId: string, limit = 50) {
    return this.fetch<{ items: { track: SpotifyTrack }[] }>(
      `/playlists/${playlistId}/tracks?limit=${limit}`
    );
  },

  // Get current playback state
  async getPlaybackState() {
    try {
      return await this.fetch<SpotifyPlaybackState>("/me/player");
    } catch {
      return null;
    }
  },

  // Play a track or resume playback
  async play(options?: { uris?: string[]; context_uri?: string; position_ms?: number }) {
    return this.fetch("/me/player/play", {
      method: "PUT",
      body: options ? JSON.stringify(options) : undefined,
    });
  },

  // Pause playback
  async pause() {
    return this.fetch("/me/player/pause", { method: "PUT" });
  },

  // Skip to next track
  async next() {
    return this.fetch("/me/player/next", { method: "POST" });
  },

  // Skip to previous track
  async previous() {
    return this.fetch("/me/player/previous", { method: "POST" });
  },

  // Set volume
  async setVolume(volumePercent: number) {
    return this.fetch(`/me/player/volume?volume_percent=${volumePercent}`, { method: "PUT" });
  },

  // Search for tracks
  async search(query: string, type = "track", limit = 20) {
    return this.fetch<{ tracks: { items: SpotifyTrack[] } }>(
      `/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`
    );
  },

  // Get recommendations based on seeds
  async getRecommendations(options: {
    seed_genres?: string[];
    seed_tracks?: string[];
    seed_artists?: string[];
    limit?: number;
    target_energy?: number;
    target_valence?: number;
  }) {
    const params = new URLSearchParams();
    if (options.seed_genres?.length) params.set("seed_genres", options.seed_genres.join(","));
    if (options.seed_tracks?.length) params.set("seed_tracks", options.seed_tracks.join(","));
    if (options.seed_artists?.length) params.set("seed_artists", options.seed_artists.join(","));
    if (options.limit) params.set("limit", options.limit.toString());
    if (options.target_energy !== undefined) params.set("target_energy", options.target_energy.toString());
    if (options.target_valence !== undefined) params.set("target_valence", options.target_valence.toString());

    return this.fetch<{ tracks: SpotifyTrack[] }>(`/recommendations?${params.toString()}`);
  },

  // Get available genre seeds
  async getGenres() {
    return this.fetch<{ genres: string[] }>("/recommendations/available-genre-seeds");
  },

  // Get focus/chill playlists (curated categories)
  async getFeaturedPlaylists(limit = 10) {
    return this.fetch<{ playlists: { items: SpotifyPlaylist[] } }>(
      `/browse/featured-playlists?limit=${limit}`
    );
  },

  // Get category playlists (e.g., "focus", "chill")
  async getCategoryPlaylists(categoryId: string, limit = 10) {
    return this.fetch<{ playlists: { items: SpotifyPlaylist[] } }>(
      `/browse/categories/${categoryId}/playlists?limit=${limit}`
    );
  },
};

// Mood to Spotify parameters mapping
export const moodToSpotifyParams = {
  focus: {
    seed_genres: ["ambient", "chill", "study"],
    target_energy: 0.3,
    target_valence: 0.4,
  },
  calm: {
    seed_genres: ["ambient", "classical", "sleep"],
    target_energy: 0.2,
    target_valence: 0.3,
  },
  energetic: {
    seed_genres: ["electronic", "dance", "pop"],
    target_energy: 0.8,
    target_valence: 0.7,
  },
  creative: {
    seed_genres: ["indie", "alternative", "jazz"],
    target_energy: 0.5,
    target_valence: 0.6,
  },
};
