// Apple Music (MusicKit JS) integration

declare global {
  interface Window {
    MusicKit: typeof MusicKit;
  }
}

declare namespace MusicKit {
  function configure(config: {
    developerToken: string;
    app: { name: string; build: string };
  }): Promise<MusicKitInstance>;

  function getInstance(): MusicKitInstance;

  interface MusicKitInstance {
    authorize(): Promise<string>;
    unauthorize(): Promise<void>;
    isAuthorized: boolean;
    player: Player;
    api: API;
    musicUserToken: string;
  }

  interface Player {
    play(): Promise<void>;
    pause(): Promise<void>;
    stop(): Promise<void>;
    skipToNextItem(): Promise<void>;
    skipToPreviousItem(): Promise<void>;
    seekToTime(time: number): Promise<void>;
    volume: number;
    currentPlaybackTime: number;
    currentPlaybackDuration: number;
    isPlaying: boolean;
    nowPlayingItem: MediaItem | null;
    queue: Queue;
  }

  interface Queue {
    items: MediaItem[];
    isEmpty: boolean;
    position: number;
  }

  interface MediaItem {
    id: string;
    title: string;
    artistName: string;
    albumName: string;
    artwork?: { url: string };
    durationInMillis: number;
  }

  interface API {
    music(
      path: string,
      options?: { parameters?: Record<string, string | number> }
    ): Promise<{ data: { data: MediaItem[] } }>;
  }
}

export interface AppleMusicTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  artworkUrl: string;
  duration: number;
}

let musicKitInstance: MusicKit.MusicKitInstance | null = null;
let isInitializing = false;

export const appleMusicAuth = {
  // Load MusicKit JS script
  async loadMusicKit(): Promise<void> {
    if (typeof window === "undefined") return;
    
    if (window.MusicKit) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://js-cdn.music.apple.com/musickit/v3/musickit.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load MusicKit JS"));
      document.head.appendChild(script);
    });
  },

  // Initialize MusicKit
  async initialize(): Promise<MusicKit.MusicKitInstance | null> {
    if (typeof window === "undefined") return null;
    
    if (musicKitInstance) return musicKitInstance;
    if (isInitializing) {
      // Wait for initialization to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return musicKitInstance;
    }

    const developerToken = process.env.NEXT_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN;
    if (!developerToken) {
      console.warn("Apple Music developer token not configured");
      return null;
    }

    try {
      isInitializing = true;
      await this.loadMusicKit();

      musicKitInstance = await window.MusicKit.configure({
        developerToken,
        app: {
          name: process.env.NEXT_PUBLIC_APPLE_MUSIC_APP_NAME || "FlowState",
          build: process.env.NEXT_PUBLIC_APPLE_MUSIC_APP_BUILD || "1.0.0",
        },
      });

      return musicKitInstance;
    } catch (error) {
      console.error("Failed to initialize MusicKit:", error);
      return null;
    } finally {
      isInitializing = false;
    }
  },

  // Authorize user
  async authorize(): Promise<boolean> {
    const instance = await this.initialize();
    if (!instance) return false;

    try {
      await instance.authorize();
      return instance.isAuthorized;
    } catch (error) {
      console.error("Apple Music authorization failed:", error);
      return false;
    }
  },

  // Deauthorize user
  async logout(): Promise<void> {
    if (musicKitInstance) {
      await musicKitInstance.unauthorize();
    }
  },

  // Check if authorized
  isAuthorized(): boolean {
    return musicKitInstance?.isAuthorized || false;
  },

  // Get instance
  getInstance(): MusicKit.MusicKitInstance | null {
    return musicKitInstance;
  },
};

export const appleMusicApi = {
  // Search for songs
  async search(query: string, limit = 20): Promise<AppleMusicTrack[]> {
    const instance = appleMusicAuth.getInstance();
    if (!instance) return [];

    try {
      const response = await instance.api.music("/v1/catalog/us/search", {
        parameters: {
          term: query,
          types: "songs",
          limit,
        },
      });

      const songs = response.data.data || [];
      return songs.map((song: MusicKit.MediaItem) => ({
        id: song.id,
        name: song.title,
        artist: song.artistName,
        album: song.albumName,
        artworkUrl: song.artwork?.url?.replace("{w}x{h}", "300x300") || "",
        duration: song.durationInMillis,
      }));
    } catch (error) {
      console.error("Apple Music search failed:", error);
      return [];
    }
  },

  // Get curated playlists
  async getCuratedPlaylists(limit = 10) {
    const instance = appleMusicAuth.getInstance();
    if (!instance) return [];

    try {
      const response = await instance.api.music("/v1/catalog/us/playlists", {
        parameters: { limit },
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Failed to get Apple Music playlists:", error);
      return [];
    }
  },

  // Play a song
  async play(songId?: string): Promise<void> {
    const instance = appleMusicAuth.getInstance();
    if (!instance) return;

    try {
      if (songId) {
        await instance.player.queue.items;
        // Set queue and play
      }
      await instance.player.play();
    } catch (error) {
      console.error("Apple Music play failed:", error);
    }
  },

  // Pause playback
  async pause(): Promise<void> {
    const instance = appleMusicAuth.getInstance();
    if (!instance) return;

    try {
      await instance.player.pause();
    } catch (error) {
      console.error("Apple Music pause failed:", error);
    }
  },

  // Skip to next
  async next(): Promise<void> {
    const instance = appleMusicAuth.getInstance();
    if (!instance) return;

    try {
      await instance.player.skipToNextItem();
    } catch (error) {
      console.error("Apple Music next failed:", error);
    }
  },

  // Skip to previous
  async previous(): Promise<void> {
    const instance = appleMusicAuth.getInstance();
    if (!instance) return;

    try {
      await instance.player.skipToPreviousItem();
    } catch (error) {
      console.error("Apple Music previous failed:", error);
    }
  },

  // Set volume (0-1)
  setVolume(volume: number): void {
    const instance = appleMusicAuth.getInstance();
    if (!instance) return;
    instance.player.volume = volume;
  },

  // Get current playback state
  getPlaybackState() {
    const instance = appleMusicAuth.getInstance();
    if (!instance) return null;

    const player = instance.player;
    const nowPlaying = player.nowPlayingItem;

    return {
      isPlaying: player.isPlaying,
      currentTime: player.currentPlaybackTime,
      duration: player.currentPlaybackDuration,
      volume: player.volume,
      currentTrack: nowPlaying
        ? {
            id: nowPlaying.id,
            name: nowPlaying.title,
            artist: nowPlaying.artistName,
            album: nowPlaying.albumName,
            artworkUrl: nowPlaying.artwork?.url?.replace("{w}x{h}", "300x300") || "",
            duration: nowPlaying.durationInMillis,
          }
        : null,
    };
  },
};
