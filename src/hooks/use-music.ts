"use client";

import { useState, useEffect, useCallback } from "react";
import {
  spotifyAuth,
  spotifyApi,
  appleMusicAuth,
  appleMusicApi,
  moodToSpotifyParams,
  soundcloudAuth,
  soundcloudApi,
  getMoodPlaylists,
  getMoodTracks,
  youtubeService,
  getMoodVideos,
  curatedLofiStreams,
  type SpotifyTrack,
  type SpotifyPlaylist,
  type SoundCloudTrack,
  type SoundCloudPlaylist,
  type YouTubeVideo,
} from "@/lib/music";

export type MusicService = "spotify" | "apple" | "soundcloud" | "youtube" | null;
export type MoodType = "focus" | "calm" | "energetic" | "creative";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  imageUrl: string;
  uri?: string;
  service: MusicService;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  trackCount: number;
  uri?: string;
  service: MusicService;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTrack: Track | null;
  progress: number;
  duration: number;
  volume: number;
}

export function useMusic() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeService, setActiveService] = useState<MusicService>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTrack: null,
    progress: 0,
    duration: 0,
    volume: 50,
  });
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Check for existing connections on mount
  useEffect(() => {
    const checkConnections = async () => {
      setIsLoading(true);
      
      // Check for Spotify OAuth callback
      const urlParams = new URLSearchParams(window.location.search);
      const spotifyCode = urlParams.get("spotify_code");
      const spotifyError = urlParams.get("spotify_error");

      if (spotifyError) {
        setError(`Spotify error: ${spotifyError}`);
        window.history.replaceState({}, "", window.location.pathname);
      } else if (spotifyCode) {
        try {
          await spotifyAuth.exchangeCode(spotifyCode);
          setActiveService("spotify");
          setIsConnected(true);
          window.history.replaceState({}, "", window.location.pathname);
        } catch {
          setError("Failed to complete Spotify authentication");
        }
      } else if (spotifyAuth.isLoggedIn()) {
        setActiveService("spotify");
        setIsConnected(true);
      }

      // Check for SoundCloud OAuth callback
      const soundcloudCode = urlParams.get("soundcloud_code");
      const soundcloudError = urlParams.get("soundcloud_error");

      if (soundcloudError) {
        setError(`SoundCloud error: ${soundcloudError}`);
        window.history.replaceState({}, "", window.location.pathname);
      } else if (soundcloudCode) {
        try {
          await soundcloudAuth.exchangeCode(soundcloudCode);
          setActiveService("soundcloud");
          setIsConnected(true);
          window.history.replaceState({}, "", window.location.pathname);
        } catch {
          setError("Failed to complete SoundCloud authentication");
        }
      }

      // Check Apple Music
      if (!activeService && appleMusicAuth.isAuthorized()) {
        setActiveService("apple");
        setIsConnected(true);
      }

      // Check SoundCloud (existing session)
      if (!activeService && soundcloudAuth.isAuthenticated()) {
        setActiveService("soundcloud");
        setIsConnected(true);
      }

      setIsLoading(false);
    };

    checkConnections();
  }, []);

  // Poll playback state when connected
  useEffect(() => {
    if (!isConnected || !activeService) return;

    const pollPlayback = async () => {
      try {
        if (activeService === "spotify") {
          const state = await spotifyApi.getPlaybackState();
          if (state) {
            setPlaybackState({
              isPlaying: state.is_playing,
              progress: state.progress_ms,
              duration: state.item?.duration_ms || 0,
              volume: state.device?.volume_percent || 50,
              currentTrack: state.item
                ? {
                    id: state.item.id,
                    title: state.item.name,
                    artist: state.item.artists.map((a) => a.name).join(", "),
                    album: state.item.album.name,
                    duration: state.item.duration_ms,
                    imageUrl: state.item.album.images[0]?.url || "",
                    uri: state.item.uri,
                    service: "spotify",
                  }
                : null,
            });
          }
        } else if (activeService === "apple") {
          const state = appleMusicApi.getPlaybackState();
          if (state) {
            setPlaybackState({
              isPlaying: state.isPlaying,
              progress: state.currentTime * 1000,
              duration: state.duration * 1000,
              volume: state.volume * 100,
              currentTrack: state.currentTrack
                ? {
                    id: state.currentTrack.id,
                    title: state.currentTrack.name,
                    artist: state.currentTrack.artist,
                    album: state.currentTrack.album,
                    duration: state.currentTrack.duration,
                    imageUrl: state.currentTrack.artworkUrl,
                    service: "apple",
                  }
                : null,
            });
          }
        } else if (activeService === "soundcloud") {
          // SoundCloud playback is managed by the embedded widget/iframe
          // No polling needed - the iframe handles its own state
        }
      } catch {
        // Silently handle polling errors
      }
    };

    pollPlayback();
    const interval = setInterval(pollPlayback, 1000);
    return () => clearInterval(interval);
  }, [isConnected, activeService]);

  // Connect to Spotify
  const connectSpotify = useCallback(async () => {
    try {
      setError(null);
      await spotifyAuth.login();
    } catch {
      setError("Failed to connect to Spotify");
    }
  }, []);

  // Connect to Apple Music
  const connectAppleMusic = useCallback(async () => {
    try {
      setError(null);
      const success = await appleMusicAuth.authorize();
      if (success) {
        setActiveService("apple");
        setIsConnected(true);
      } else {
        setError("Failed to connect to Apple Music");
      }
    } catch {
      setError("Failed to connect to Apple Music");
    }
  }, []);

  // Connect to SoundCloud (no auth needed for embedded player)
  const connectSoundCloud = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      // SoundCloud embedded player works without auth
      setActiveService("soundcloud");
      setIsConnected(true);
      
      // Import curated streams dynamically
      const { getCuratedSoundCloudStreams } = await import("@/lib/music/soundcloud");
      const streams = getCuratedSoundCloudStreams("focus");
      
      const tracks: Track[] = streams.map((s, i) => ({
        id: `sc-${i}`,
        title: s.title,
        artist: s.artist,
        album: "SoundCloud",
        duration: 0,
        imageUrl: "/soundcloud-placeholder.png",
        uri: s.url,
        service: "soundcloud" as const,
      }));
      setRecommendations(tracks);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect to SoundCloud";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Connect to YouTube (no auth needed for public videos)
  const connectYouTube = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      // YouTube doesn't require auth for public videos
      setActiveService("youtube");
      setIsConnected(true);
      
      // Load curated lofi streams for default mood
      const videos = await getMoodVideos("focus");
      const tracks: Track[] = videos.map((v: YouTubeVideo) => ({
        id: `yt-${v.id}`,
        title: v.title,
        artist: v.channelTitle,
        album: v.isLive ? "🔴 LIVE" : "",
        duration: 0,
        imageUrl: v.thumbnailUrl,
        uri: v.id, // YouTube video ID
        service: "youtube" as const,
      }));
      setRecommendations(tracks);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect to YouTube";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Disconnect current service
  const disconnect = useCallback(async () => {
    if (activeService === "spotify") {
      spotifyAuth.logout();
    } else if (activeService === "apple") {
      await appleMusicAuth.logout();
    } else if (activeService === "soundcloud") {
      soundcloudAuth.logout();
    } else if (activeService === "youtube") {
      youtubeService.disconnect();
    }
    setActiveService(null);
    setIsConnected(false);
    setPlaybackState({
      isPlaying: false,
      currentTrack: null,
      progress: 0,
      duration: 0,
      volume: 50,
    });
    setRecommendations([]);
    setPlaylists([]);
  }, [activeService]);

  // Play/Pause
  const togglePlayback = useCallback(async () => {
    try {
      if (activeService === "spotify") {
        if (playbackState.isPlaying) {
          await spotifyApi.pause();
        } else {
          await spotifyApi.play();
        }
      } else if (activeService === "apple") {
        if (playbackState.isPlaying) {
          await appleMusicApi.pause();
        } else {
          await appleMusicApi.play();
        }
      } else if (activeService === "soundcloud") {
        // SoundCloud uses embedded iframe - playback controlled directly in player
      }
    } catch {
      setError("Playback control failed");
    }
  }, [activeService, playbackState.isPlaying]);

  // Play specific track
  const playTrack = useCallback(
    async (track: Track) => {
      try {
        if (activeService === "spotify" && track.uri) {
          await spotifyApi.play({ uris: [track.uri] });
        } else if (activeService === "apple") {
          await appleMusicApi.play(track.id);
        } else if (activeService === "soundcloud" && track.uri) {
          // SoundCloud track selection updates the iframe src in the component
          setPlaybackState((prev) => ({
            ...prev,
            currentTrack: track,
          }));
        }
      } catch {
        setError("Failed to play track");
      }
    },
    [activeService]
  );

  // Skip next
  const skipNext = useCallback(async () => {
    try {
      if (activeService === "spotify") {
        await spotifyApi.next();
      } else if (activeService === "apple") {
        await appleMusicApi.next();
      } else if (activeService === "soundcloud") {
        // SoundCloud uses embedded iframe - skip controlled in player
      }
    } catch {
      setError("Skip failed");
    }
  }, [activeService]);

  // Skip previous
  const skipPrevious = useCallback(async () => {
    try {
      if (activeService === "spotify") {
        await spotifyApi.previous();
      } else if (activeService === "apple") {
        await appleMusicApi.previous();
      } else if (activeService === "soundcloud") {
        // SoundCloud uses embedded iframe - skip controlled in player
      }
    } catch {
      setError("Skip failed");
    }
  }, [activeService]);

  // Set volume
  const setVolume = useCallback(
    async (volume: number) => {
      try {
        if (activeService === "spotify") {
          await spotifyApi.setVolume(Math.round(volume));
        } else if (activeService === "apple") {
          appleMusicApi.setVolume(volume / 100);
        } else if (activeService === "soundcloud") {
          // SoundCloud uses embedded iframe - volume controlled in player
        }
        setPlaybackState((prev) => ({ ...prev, volume }));
      } catch {
        // Silently handle volume errors
      }
    },
    [activeService]
  );

  // Get recommendations based on mood
  const getRecommendationsForMood = useCallback(
    async (mood: MoodType) => {
      if (!isConnected) return;

      try {
        if (activeService === "spotify") {
          const params = moodToSpotifyParams[mood];
          const response = await spotifyApi.getRecommendations({
            ...params,
            limit: 10,
          });
          
          const tracks: Track[] = response.tracks.map((track: SpotifyTrack) => ({
            id: track.id,
            title: track.name,
            artist: track.artists.map((a) => a.name).join(", "),
            album: track.album.name,
            duration: track.duration_ms,
            imageUrl: track.album.images[0]?.url || "",
            uri: track.uri,
            service: "spotify" as const,
          }));
          
          setRecommendations(tracks);
        } else if (activeService === "apple") {
          const moodQueries: Record<MoodType, string> = {
            focus: "focus concentration study",
            calm: "relaxing ambient chill",
            energetic: "energetic upbeat workout",
            creative: "creative inspiring indie",
          };
          
          const results = await appleMusicApi.search(moodQueries[mood], 10);
          const tracks: Track[] = results.map((track) => ({
            id: track.id,
            title: track.name,
            artist: track.artist,
            album: track.album,
            duration: track.duration,
            imageUrl: track.artworkUrl,
            service: "apple" as const,
          }));
          
          setRecommendations(tracks);
        } else if (activeService === "soundcloud") {
          // SoundCloud: use curated streams (no API auth needed)
          const { getCuratedSoundCloudStreams } = await import("@/lib/music/soundcloud");
          const streams = getCuratedSoundCloudStreams(mood);
          
          const tracks: Track[] = streams.map((s, i) => ({
            id: `sc-${mood}-${i}`,
            title: s.title,
            artist: s.artist,
            album: "SoundCloud",
            duration: 0,
            imageUrl: "/soundcloud-placeholder.png",
            uri: s.url,
            service: "soundcloud" as const,
          }));
          
          setRecommendations(tracks);
        } else if (activeService === "youtube") {
          // YouTube: get mood-based lofi videos
          const videos = await getMoodVideos(mood);
          
          const tracks: Track[] = videos.map((v: YouTubeVideo) => ({
            id: `yt-${v.id}`,
            title: v.title,
            artist: v.channelTitle,
            album: v.isLive ? "🔴 LIVE" : "",
            duration: 0,
            imageUrl: v.thumbnailUrl,
            uri: v.id, // YouTube video ID
            service: "youtube" as const,
          }));
          
          setRecommendations(tracks);
        }
      } catch {
        setError("Failed to get recommendations");
      }
    },
    [isConnected, activeService]
  );

  // Get user playlists
  const getUserPlaylists = useCallback(async () => {
    if (!isConnected) return;

    try {
      if (activeService === "spotify") {
        const response = await spotifyApi.getMyPlaylists(10);
        const items: Playlist[] = response.items.map((playlist: SpotifyPlaylist) => ({
          id: playlist.id,
          name: playlist.name,
          description: playlist.description || "",
          imageUrl: playlist.images[0]?.url || "",
          trackCount: playlist.tracks.total,
          uri: playlist.uri,
          service: "spotify" as const,
        }));
        
        setPlaylists(items);
      } else if (activeService === "soundcloud") {
        // SoundCloud: check if authenticated
        if (soundcloudAuth.isAuthenticated()) {
          // User is logged in - get their playlists
          const scPlaylists = await soundcloudApi.getMyPlaylists(10);
          
          const items: Playlist[] = scPlaylists.map((playlist: SoundCloudPlaylist) => ({
            id: `sc-${playlist.id}`,
            name: playlist.title,
            description: playlist.description || "",
            imageUrl: playlist.artwork_url || "",
            trackCount: playlist.track_count,
            uri: playlist.permalink_url,
            service: "soundcloud" as const,
          }));
          
          setPlaylists(items);
        } else {
          // Not authenticated - use curated playlists (no API call needed)
          setPlaylists([]);
        }
      } else if (activeService === "youtube") {
        // YouTube: show curated lofi categories
        const ytPlaylists: Playlist[] = [
          {
            id: "yt-focus",
            name: "Focus & Study",
            description: "24/7 lofi beats for concentration",
            imageUrl: `https://img.youtube.com/vi/${curatedLofiStreams.focus[0].id}/hqdefault.jpg`,
            trackCount: curatedLofiStreams.focus.length,
            uri: "focus",
            service: "youtube",
          },
          {
            id: "yt-calm",
            name: "Calm & Relaxing",
            description: "Peaceful music for unwinding",
            imageUrl: `https://img.youtube.com/vi/${curatedLofiStreams.calm[0].id}/hqdefault.jpg`,
            trackCount: curatedLofiStreams.calm.length,
            uri: "calm",
            service: "youtube",
          },
          {
            id: "yt-energetic",
            name: "Energetic Vibes",
            description: "Upbeat lofi for productivity",
            imageUrl: `https://img.youtube.com/vi/${curatedLofiStreams.energetic[0].id}/hqdefault.jpg`,
            trackCount: curatedLofiStreams.energetic.length,
            uri: "energetic",
            service: "youtube",
          },
          {
            id: "yt-creative",
            name: "Creative Flow",
            description: "Inspiring beats for creativity",
            imageUrl: `https://img.youtube.com/vi/${curatedLofiStreams.creative[0].id}/hqdefault.jpg`,
            trackCount: curatedLofiStreams.creative.length,
            uri: "creative",
            service: "youtube",
          },
        ];
        setPlaylists(ytPlaylists);
      }
    } catch {
      setError("Failed to get playlists");
    }
  }, [isConnected, activeService]);

  // Play a playlist
  const playPlaylist = useCallback(
    async (playlist: Playlist) => {
      try {
        if (activeService === "spotify" && playlist.uri) {
          await spotifyApi.play({ context_uri: playlist.uri });
        } else if (activeService === "soundcloud" && playlist.uri) {
          // SoundCloud: return the URI for the component to handle via iframe
          setPlaybackState((prev) => ({
            ...prev,
            currentTrack: {
              id: playlist.id,
              title: playlist.name,
              artist: "",
              album: "",
              duration: 0,
              imageUrl: playlist.imageUrl,
              uri: playlist.uri,
              service: "soundcloud",
            },
          }));
        }
      } catch {
        setError("Failed to play playlist");
      }
    },
    [activeService]
  );

  return {
    // State
    isLoading,
    isConnected,
    activeService,
    playbackState,
    recommendations,
    playlists,
    error,

    // Auth actions
    connectSpotify,
    connectAppleMusic,
    connectSoundCloud,
    connectYouTube,
    disconnect,

    // Playback actions
    togglePlayback,
    playTrack,
    skipNext,
    skipPrevious,
    setVolume,

    // Data actions
    getRecommendationsForMood,
    getUserPlaylists,
    playPlaylist,

    // Utilities
    clearError: () => setError(null),
  };
}
