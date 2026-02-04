// YouTube IFrame Player API integration
// Docs: https://developers.google.com/youtube/iframe_api_reference

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || "";
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

// Types
export interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  description: string;
  thumbnailUrl: string;
  duration?: string;
  isLive?: boolean;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  channelTitle: string;
  description: string;
  thumbnailUrl: string;
  videoCount: number;
}

export interface YouTubeSearchResult {
  videos: YouTubeVideo[];
  playlists: YouTubePlaylist[];
}

// Curated lofi streams and videos for different moods
// isLive: true ONLY for verified 24/7 livestreams (Lofi Girl channels)
export const curatedLofiStreams = {
  focus: [
    // Verified 24/7 Livestreams
    {
      id: "jfKfPfyJRdk", // Lofi Girl main - verified 24/7
      title: "Lofi Hip Hop Radio - beats to study/relax to",
      channelTitle: "Lofi Girl",
      isLive: true,
    },
    {
      id: "4xDzrJKXOOY", // Lofi Girl Synthwave - verified 24/7
      title: "Synthwave Radio - beats to chill/game to",
      channelTitle: "Lofi Girl",
      isLive: true,
    },
    {
      id: "_k-5U7IeK8g", // Tokyo views livestream
      title: "Tokyo Views - Live Stream",
      channelTitle: "Tokyo Views",
      isLive: true,
    },
    // Video mixes (shuffled on each load)
    {
      id: "lTRiuFIWV54",
      title: "1 Hour Lofi Mix - deep focus session",
      channelTitle: "Lofi Girl",
      isLive: false,
    },
    {
      id: "n61ULEU7CO0",
      title: "Chillhop Essentials - focus beats",
      channelTitle: "Chillhop Music",
      isLive: false,
    },
    {
      id: "5qap5aO4i9A",
      title: "2 Hour Study Session - lofi beats",
      channelTitle: "Lofi Girl",
      isLive: false,
    },
    {
      id: "bmVKaAV_7-A",
      title: "Deep Focus Mix - concentration music",
      channelTitle: "The Jazz Hop Cafe",
      isLive: false,
    },
    {
      id: "7NOSDKb0HlU",
      title: "Study With Me - 2 hour focus session",
      channelTitle: "Lofi Girl",
      isLive: false,
    },
  ],
  calm: [
    // Verified 24/7 Livestreams
    {
      id: "rUxyKA_-grg", // Lofi Girl Sleep - verified 24/7
      title: "Lofi Sleep Radio - beats to sleep/chill to",
      channelTitle: "Lofi Girl",
      isLive: true,
    },
    {
      id: "HuFYqnbVbzY", // Calm livestream
      title: "Calm & Relaxing Live Stream",
      channelTitle: "Calm Music",
      isLive: true,
    },
    // Video mixes (shuffled on each load)
    {
      id: "DWcJFNfaw9c",
      title: "Peaceful Piano & Rain - sleep & relaxation",
      channelTitle: "Quiet Quest",
      isLive: false,
    },
    {
      id: "77ZozI0rw7w",
      title: "Ambient Sounds - deep relaxation",
      channelTitle: "Yellow Brick Cinema",
      isLive: false,
    },
    {
      id: "HSOtku1j600",
      title: "Nature Sounds - forest ambience",
      channelTitle: "Relaxing White Noise",
      isLive: false,
    },
    {
      id: "hlWiI4xVXKY",
      title: "Relaxing Sleep Music - calm dreams",
      channelTitle: "Soothing Relaxation",
      isLive: false,
    },
    {
      id: "1ZYbU82GVz4",
      title: "Rain & Piano - peaceful evening",
      channelTitle: "Relaxing Music",
      isLive: false,
    },
  ],
  energetic: [
    // Verified 24/7 Livestreams
    {
      id: "jfKfPfyJRdk", // Lofi Girl main - verified 24/7
      title: "Lofi Hip Hop Radio - upbeat vibes",
      channelTitle: "Lofi Girl",
      isLive: true,
    },
    {
      id: "4xDzrJKXOOY", // Lofi Girl Synthwave - verified 24/7
      title: "Synthwave Radio - energetic beats",
      channelTitle: "Lofi Girl",
      isLive: true,
    },
    // Video mixes (shuffled on each load)
    {
      id: "5yx6BWlEVcY",
      title: "Chillhop Essentials - jazzy & upbeat",
      channelTitle: "Chillhop Music",
      isLive: false,
    },
    {
      id: "9UMxZofMNbA",
      title: "Upbeat Work Music - productivity boost",
      channelTitle: "Chillhop Music",
      isLive: false,
    },
    {
      id: "WPni755-Krg",
      title: "Jazz Hop Coffee - upbeat mornings",
      channelTitle: "Jazz Hop Cafe",
      isLive: false,
    },
    {
      id: "36YnV9STBqc",
      title: "Coffee Shop Vibes - morning energy",
      channelTitle: "Lofi Cafe",
      isLive: false,
    },
  ],
  creative: [
    // Verified 24/7 Livestream
    {
      id: "jfKfPfyJRdk", // Lofi Girl main - verified 24/7
      title: "Lofi Hip Hop Radio - inspiration vibes",
      channelTitle: "Lofi Girl",
      isLive: true,
    },
    // Video mixes (shuffled on each load)
    {
      id: "kgx4WGK0oNU",
      title: "Jazz Lofi Mix - chill beats to create to",
      channelTitle: "Lofi Records",
      isLive: false,
    },
    {
      id: "-FlxM_0S2lA",
      title: "Art & Lofi - beats for creating",
      channelTitle: "Lofi Girl",
      isLive: false,
    },
    {
      id: "ceqgwo7U28Y",
      title: "Nujabes Tribute Mix - soulful beats",
      channelTitle: "Lofi Hip Hop",
      isLive: false,
    },
    {
      id: "bmVKaAV_7-A",
      title: "Jazzy Hip Hop - creative flow",
      channelTitle: "The Jazz Hop Cafe",
      isLive: false,
    },
    {
      id: "hHW1oY26kxQ",
      title: "Lofi Jazz - smooth creative vibes",
      channelTitle: "Lofi Jazz",
      isLive: false,
    },
  ],
};

// User playlist/favorites management (stored in localStorage)
const FAVORITES_STORAGE_KEY = "youtube_favorites";
const PLAYLISTS_STORAGE_KEY = "youtube_playlists";

export interface UserPlaylist {
  id: string;
  name: string;
  videos: YouTubeVideo[];
  createdAt: number;
  updatedAt: number;
}

export const favoritesManager = {
  // Get all favorites
  getFavorites(): YouTubeVideo[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  // Add to favorites
  addFavorite(video: YouTubeVideo): void {
    const favorites = this.getFavorites();
    if (!favorites.find((f) => f.id === video.id)) {
      favorites.unshift(video);
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    }
  },

  // Remove from favorites
  removeFavorite(videoId: string): void {
    const favorites = this.getFavorites().filter((f) => f.id !== videoId);
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  },

  // Check if video is favorited
  isFavorite(videoId: string): boolean {
    return this.getFavorites().some((f) => f.id === videoId);
  },

  // Toggle favorite
  toggleFavorite(video: YouTubeVideo): boolean {
    if (this.isFavorite(video.id)) {
      this.removeFavorite(video.id);
      return false;
    } else {
      this.addFavorite(video);
      return true;
    }
  },
};

export const playlistManager = {
  // Get all playlists
  getPlaylists(): UserPlaylist[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(PLAYLISTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  // Create a new playlist
  createPlaylist(name: string): UserPlaylist {
    const playlists = this.getPlaylists();
    const newPlaylist: UserPlaylist = {
      id: `playlist-${Date.now()}`,
      name,
      videos: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    playlists.push(newPlaylist);
    localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
    return newPlaylist;
  },

  // Delete a playlist
  deletePlaylist(playlistId: string): void {
    const playlists = this.getPlaylists().filter((p) => p.id !== playlistId);
    localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
  },

  // Add video to playlist
  addToPlaylist(playlistId: string, video: YouTubeVideo): void {
    const playlists = this.getPlaylists();
    const playlist = playlists.find((p) => p.id === playlistId);
    if (playlist && !playlist.videos.find((v) => v.id === video.id)) {
      playlist.videos.push(video);
      playlist.updatedAt = Date.now();
      localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
    }
  },

  // Remove video from playlist
  removeFromPlaylist(playlistId: string, videoId: string): void {
    const playlists = this.getPlaylists();
    const playlist = playlists.find((p) => p.id === playlistId);
    if (playlist) {
      playlist.videos = playlist.videos.filter((v) => v.id !== videoId);
      playlist.updatedAt = Date.now();
      localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
    }
  },

  // Get a specific playlist
  getPlaylist(playlistId: string): UserPlaylist | undefined {
    return this.getPlaylists().find((p) => p.id === playlistId);
  },

  // Rename playlist
  renamePlaylist(playlistId: string, newName: string): void {
    const playlists = this.getPlaylists();
    const playlist = playlists.find((p) => p.id === playlistId);
    if (playlist) {
      playlist.name = newName;
      playlist.updatedAt = Date.now();
      localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
    }
  },

  // Create default playlists if none exist
  initializeDefaultPlaylists(): void {
    const playlists = this.getPlaylists();
    if (playlists.length === 0) {
      this.createPlaylist("Favorites");
      this.createPlaylist("Study Session");
      this.createPlaylist("Chill Vibes");
    }
  },
};

// Mood-based search queries
export const moodSearchQueries = {
  focus: ["lofi study beats", "concentration music playlist", "deep focus ambient"],
  calm: ["relaxing lofi", "peaceful ambient music", "calm piano music"],
  energetic: ["upbeat lofi", "energetic study music", "productive beats"],
  creative: ["creative lofi", "artistic ambient", "inspiration music lofi"],
};

// YouTube Data API service
export const youtubeApi = {
  // Search for videos
  async searchVideos(query: string, maxResults = 10): Promise<YouTubeVideo[]> {
    if (!YOUTUBE_API_KEY) {
      console.warn("YouTube API key not configured");
      return [];
    }

    const params = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video",
      videoCategoryId: "10", // Music category
      maxResults: String(maxResults),
      key: YOUTUBE_API_KEY,
    });

    try {
      const response = await fetch(`${YOUTUBE_API_BASE}/search?${params}`);
      if (!response.ok) throw new Error("YouTube API error");

      const data = await response.json();
      return data.items.map((item: {
        id: { videoId: string };
        snippet: {
          title: string;
          channelTitle: string;
          description: string;
          thumbnails: { high?: { url: string }; medium?: { url: string }; default: { url: string } };
          liveBroadcastContent: string;
        };
      }) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.high?.url || 
                      item.snippet.thumbnails.medium?.url || 
                      item.snippet.thumbnails.default.url,
        isLive: item.snippet.liveBroadcastContent === "live",
      }));
    } catch (error) {
      console.error("YouTube search failed:", error);
      return [];
    }
  },

  // Search for playlists
  async searchPlaylists(query: string, maxResults = 10): Promise<YouTubePlaylist[]> {
    if (!YOUTUBE_API_KEY) {
      console.warn("YouTube API key not configured");
      return [];
    }

    const params = new URLSearchParams({
      part: "snippet,contentDetails",
      q: query,
      type: "playlist",
      maxResults: String(maxResults),
      key: YOUTUBE_API_KEY,
    });

    try {
      const response = await fetch(`${YOUTUBE_API_BASE}/search?${params}`);
      if (!response.ok) throw new Error("YouTube API error");

      const data = await response.json();
      return data.items.map((item: {
        id: { playlistId: string };
        snippet: {
          title: string;
          channelTitle: string;
          description: string;
          thumbnails: { high?: { url: string }; medium?: { url: string }; default: { url: string } };
        };
      }) => ({
        id: item.id.playlistId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.high?.url || 
                      item.snippet.thumbnails.medium?.url || 
                      item.snippet.thumbnails.default.url,
        videoCount: 0, // Would need another API call to get this
      }));
    } catch (error) {
      console.error("YouTube playlist search failed:", error);
      return [];
    }
  },

  // Get video details
  async getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
    if (!YOUTUBE_API_KEY) return null;

    const params = new URLSearchParams({
      part: "snippet,contentDetails,liveStreamingDetails",
      id: videoId,
      key: YOUTUBE_API_KEY,
    });

    try {
      const response = await fetch(`${YOUTUBE_API_BASE}/videos?${params}`);
      if (!response.ok) throw new Error("YouTube API error");

      const data = await response.json();
      if (!data.items?.length) return null;

      const item = data.items[0];
      return {
        id: item.id,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.high?.url || 
                      item.snippet.thumbnails.medium?.url || 
                      item.snippet.thumbnails.default.url,
        duration: item.contentDetails?.duration,
        isLive: item.snippet.liveBroadcastContent === "live",
      };
    } catch (error) {
      console.error("Failed to get video details:", error);
      return null;
    }
  },
};

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get mood-based videos (uses curated list if no API key, otherwise searches)
export async function getMoodVideos(
  mood: "focus" | "calm" | "energetic" | "creative"
): Promise<YouTubeVideo[]> {
  // Get curated videos for this mood
  const curated = curatedLofiStreams[mood].map((stream) => ({
    ...stream,
    description: stream.isLive ? "24/7 livestream" : "Lofi mix",
    thumbnailUrl: `https://img.youtube.com/vi/${stream.id}/hqdefault.jpg`,
  }));

  // Separate livestreams and regular videos
  const livestreams = curated.filter(v => v.isLive);
  const videos = curated.filter(v => !v.isLive);
  
  // Shuffle the regular videos
  const shuffledVideos = shuffleArray(videos);

  // If API key is available, also search for more videos
  if (YOUTUBE_API_KEY) {
    const queries = moodSearchQueries[mood];
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    
    try {
      const searchResults = await youtubeApi.searchVideos(randomQuery, 5);
      // Put livestreams first, then shuffled videos, then search results
      return [...livestreams, ...shuffleArray([...shuffledVideos, ...searchResults])];
    } catch {
      // Livestreams first, then shuffled regular videos
      return [...livestreams, ...shuffledVideos];
    }
  }

  // Livestreams first, then shuffled regular videos
  return [...livestreams, ...shuffledVideos];
}

// YouTube IFrame Player (loaded dynamically)
declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string | HTMLElement,
        config: {
          videoId?: string;
          width?: string | number;
          height?: string | number;
          playerVars?: {
            autoplay?: 0 | 1;
            controls?: 0 | 1;
            disablekb?: 0 | 1;
            fs?: 0 | 1;
            modestbranding?: 0 | 1;
            rel?: 0 | 1;
            showinfo?: 0 | 1;
            origin?: string;
          };
          events?: {
            onReady?: (event: { target: YouTubePlayer }) => void;
            onStateChange?: (event: { data: number; target: YouTubePlayer }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => YouTubePlayer;
      PlayerState: {
        UNSTARTED: -1;
        ENDED: 0;
        PLAYING: 1;
        PAUSED: 2;
        BUFFERING: 3;
        CUED: 5;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface YouTubePlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  getVolume(): number;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  getPlayerState(): number;
  getCurrentTime(): number;
  getDuration(): number;
  getVideoUrl(): string;
  loadVideoById(videoId: string, startSeconds?: number): void;
  cueVideoById(videoId: string, startSeconds?: number): void;
  destroy(): void;
}

let playerInstance: YouTubePlayer | null = null;
let isApiLoaded = false;
let apiLoadPromise: Promise<void> | null = null;

export const youtubePlayer = {
  // Load the YouTube IFrame API
  async loadApi(): Promise<void> {
    if (typeof window === "undefined") return;
    if (isApiLoaded) return;
    if (apiLoadPromise) return apiLoadPromise;

    apiLoadPromise = new Promise((resolve) => {
      // Check if already loaded
      if (window.YT?.Player) {
        isApiLoaded = true;
        resolve();
        return;
      }

      // Set up callback
      window.onYouTubeIframeAPIReady = () => {
        isApiLoaded = true;
        resolve();
      };

      // Load the script
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    });

    return apiLoadPromise;
  },

  // Create a player instance
  async createPlayer(
    elementId: string,
    videoId: string,
    options?: {
      autoplay?: boolean;
      onReady?: (player: YouTubePlayer) => void;
      onStateChange?: (state: number) => void;
      onError?: (errorCode: number) => void;
    }
  ): Promise<YouTubePlayer | null> {
    await this.loadApi();

    if (!window.YT?.Player) {
      console.error("YouTube API not loaded");
      return null;
    }

    return new Promise((resolve) => {
      const player = new window.YT!.Player(elementId, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: options?.autoplay ? 1 : 0,
          controls: 1,
          disablekb: 0,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          origin: typeof window !== "undefined" ? window.location.origin : undefined,
        },
        events: {
          onReady: (event) => {
            playerInstance = event.target;
            options?.onReady?.(event.target);
            resolve(event.target);
          },
          onStateChange: (event) => {
            options?.onStateChange?.(event.data);
          },
          onError: (event) => {
            options?.onError?.(event.data);
          },
        },
      });
    });
  },

  // Get current player
  getPlayer(): YouTubePlayer | null {
    return playerInstance;
  },

  // Destroy player
  destroy(): void {
    if (playerInstance) {
      playerInstance.destroy();
      playerInstance = null;
    }
  },

  // Check if API is loaded
  isLoaded(): boolean {
    return isApiLoaded;
  },
};

// Service for managing YouTube connection state
export const youtubeService = {
  isConnected(): boolean {
    // YouTube doesn't require authentication for public videos
    return true;
  },

  disconnect(): void {
    youtubePlayer.destroy();
  },
};
