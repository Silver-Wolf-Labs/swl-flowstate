"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Music, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Volume2, 
  Headphones,
  LogIn,
  LogOut,
  AlertCircle,
  Loader2,
  Music2,
  Heart,
  Plus,
  ListMusic,
} from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from "@/components/ui";
import { useMusic, type Track, type MoodType, type Playlist } from "@/hooks/use-music";
import { favoritesManager, playlistManager, type UserPlaylist, type YouTubeVideo } from "@/lib/music";
import { cn } from "@/lib/utils";

// Spotify and Apple Music icons
function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  );
}

function AppleMusicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.401-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03c.525 0 1.048-.034 1.57-.1.823-.106 1.597-.35 2.296-.81a5.046 5.046 0 001.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76.962-1.388 1.14-.35.1-.706.157-1.07.173-.95.042-1.785-.455-2.105-1.392-.227-.668-.032-1.43.547-1.89.393-.313.853-.468 1.337-.546.512-.082 1.026-.142 1.535-.238.177-.033.347-.1.48-.214.173-.148.227-.357.227-.59V8.373c0-.26-.086-.45-.32-.523-.202-.063-.41-.077-.617-.054-.53.058-1.063.107-1.594.163-.946.1-1.893.197-2.838.3-.12.013-.24.04-.355.07-.21.056-.318.2-.319.41-.002.467 0 .933 0 1.4v5.94c0 .405-.058.804-.234 1.177-.294.62-.778 1.003-1.43 1.178-.338.09-.684.14-1.034.154-.984.048-1.818-.458-2.14-1.406-.26-.767.006-1.525.685-1.99.42-.288.9-.422 1.4-.483.365-.045.734-.076 1.1-.122.265-.033.524-.084.758-.21.19-.102.29-.26.29-.471V6.89c0-.176.03-.348.091-.514.108-.296.326-.458.624-.507.16-.026.324-.038.487-.054l3.528-.37c.998-.104 1.996-.21 2.994-.312.168-.017.34-.016.507-.002.28.024.478.177.55.448.026.097.04.197.04.297.002 1.38.002 2.76 0 4.14z"/>
    </svg>
  );
}

function SoundCloudIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.06-.052-.1-.084-.1zm-.899 1.825c-.06 0-.091.037-.104.094L0 15.479l.165 1.308c.014.057.045.094.09.094s.089-.037.099-.094l.19-1.308-.19-1.334c-.01-.057-.054-.094-.078-.094zm1.83-1.229c-.061 0-.12.045-.12.104l-.21 2.563.225 2.458c0 .06.045.104.106.104.061 0 .12-.044.12-.104l.24-2.474-.24-2.547c0-.06-.059-.104-.121-.104zm.945-.089c-.075 0-.135.06-.15.135l-.193 2.64.21 2.539c.016.075.075.135.149.135.075 0 .135-.06.151-.135l.24-2.539-.24-2.64c-.016-.075-.076-.135-.166-.135zm1.155.36c-.005-.09-.075-.149-.159-.149-.09 0-.158.06-.164.149l-.217 2.43.2 2.563c.005.09.074.149.163.149.09 0 .164-.06.165-.149l.24-2.563-.228-2.43zm.809-1.709c-.101 0-.18.09-.18.181l-.21 3.957.227 2.563c0 .09.075.18.165.18.089 0 .18-.09.18-.18l.24-2.578-.24-3.942c0-.09-.09-.181-.18-.181zm.959-.914c-.105 0-.195.09-.21.195l-.165 4.665.18 2.548c.015.105.09.18.21.18.094 0 .194-.075.194-.195l.209-2.533-.209-4.665c0-.105-.09-.195-.209-.195zm1.125.945c0-.119-.105-.209-.209-.209-.119 0-.209.09-.225.209l-.165 3.93.165 2.534c.016.12.106.209.225.209.119 0 .209-.089.209-.209l.195-2.549-.195-3.915zm.749-1.498c-.135 0-.24.105-.255.24l-.15 5.175.165 2.519c.015.135.12.24.255.24.12 0 .24-.105.24-.24l.18-2.519-.165-5.175c0-.135-.12-.24-.27-.24zm1.005.166c-.164 0-.284.135-.284.285l-.103 5.294.135 2.474c0 .149.135.27.285.27.149 0 .27-.135.27-.27l.154-2.489-.154-5.28c0-.149-.121-.284-.303-.284zm1.789-.586c-.18 0-.316.149-.316.314l-.148 5.719.163 2.444c0 .166.136.3.316.3.165 0 .313-.135.313-.3l.166-2.459-.15-5.704c0-.165-.15-.314-.344-.314zm.91 0c-.197 0-.346.15-.346.33l-.12 5.689.135 2.444c0 .18.149.33.33.33.181 0 .33-.15.346-.33l.149-2.444-.15-5.689c0-.18-.164-.33-.344-.33zm1.084.086c-.211 0-.375.165-.391.375l-.1 5.234.135 2.42c.016.21.18.359.375.359.195 0 .359-.165.375-.359l.149-2.42-.149-5.234c-.016-.21-.18-.375-.394-.375zm1.035-.142c-.21 0-.39.18-.39.39l-.12 5.25.135 2.415c0 .21.18.39.39.39.195 0 .39-.18.39-.39l.149-2.415-.15-5.25c0-.21-.179-.39-.404-.39zm1.141-.126c-.239 0-.42.181-.42.42l-.1 5.206.135 2.39c0 .24.181.421.42.421.225 0 .42-.181.42-.42l.15-2.391-.15-5.206c0-.239-.195-.42-.455-.42zm1.068-.075c-.254 0-.449.196-.449.449l-.09 5.131.12 2.361c0 .254.195.449.449.449.255 0 .45-.195.45-.449l.136-2.376-.136-5.116c0-.254-.21-.449-.48-.449zm1.171-.061c-.27 0-.479.21-.494.479l-.076 5.056.104 2.346c.016.27.226.479.494.479.255 0 .479-.209.479-.479l.12-2.346-.12-5.056c0-.27-.226-.479-.507-.479zm6.188 2.754c-.391 0-.765.077-1.125.24-.24-2.729-2.545-4.858-5.354-4.858-.585 0-1.17.104-1.709.285-.225.075-.285.165-.285.33v9.542c0 .179.149.329.329.344h8.145c1.784 0 3.24-1.454 3.24-3.24-.001-1.784-1.441-3.238-3.241-3.238v-.405z"/>
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

const moodGradients: Record<string, string> = {
  focus: "from-violet-600 to-purple-800",
  calm: "from-cyan-600 to-teal-800",
  energetic: "from-orange-600 to-amber-800",
  creative: "from-pink-600 to-rose-800",
};

interface MusicRecommendationsProps {
  mood?: MoodType;
}

export function MusicRecommendations({ mood = "focus" }: MusicRecommendationsProps) {
  const currentMood = mood;
  const {
    isLoading,
    isConnected,
    activeService,
    playbackState,
    recommendations,
    playlists,
    error,
    connectSpotify,
    connectAppleMusic,
    connectSoundCloud,
    connectYouTube,
    disconnect,
    togglePlayback,
    playTrack,
    skipNext,
    skipPrevious,
    setVolume,
    getRecommendationsForMood,
    getUserPlaylists,
    playPlaylist,
    clearError,
  } = useMusic();

  const [scPlayerUrl, setScPlayerUrl] = useState<string | null>(null);
  const [ytVideoId, setYtVideoId] = useState<string | null>(null);
  const [userPlaylists, setUserPlaylists] = useState<UserPlaylist[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showAddToPlaylist, setShowAddToPlaylist] = useState<string | null>(null);
  const scContainerRef = useRef<HTMLDivElement>(null);

  // Initialize playlists and load favorites on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      playlistManager.initializeDefaultPlaylists();
      setUserPlaylists(playlistManager.getPlaylists());
      const favs = favoritesManager.getFavorites();
      setFavorites(new Set(favs.map(f => f.id)));
    }
  }, []);

  // Load recommendations when mood changes or connected
  useEffect(() => {
    if (isConnected) {
      getRecommendationsForMood(currentMood);
      getUserPlaylists();
    }
  }, [isConnected, currentMood, getRecommendationsForMood, getUserPlaylists]);

  // Update SoundCloud player when recommendations change
  useEffect(() => {
    if (activeService === "soundcloud" && recommendations.length > 0 && recommendations[0].uri) {
      setScPlayerUrl(recommendations[0].uri);
    }
  }, [activeService, recommendations]);

  // Update YouTube player when recommendations change
  useEffect(() => {
    if (activeService === "youtube" && recommendations.length > 0 && recommendations[0].uri) {
      setYtVideoId(recommendations[0].uri);
    }
  }, [activeService, recommendations]);

  const handlePlayTrack = async (track: Track) => {
    if (track.service === "soundcloud" && track.uri) {
      setScPlayerUrl(track.uri);
    } else if (track.service === "youtube" && track.uri) {
      setYtVideoId(track.uri);
    } else if (track.service) {
      await playTrack(track);
    }
  };

  const isTrackPlaying = (track: Track) => {
    if (activeService === "youtube") {
      return ytVideoId === track.uri;
    }
    return playbackState.currentTrack?.id === track.id;
  };

  const formatDuration = (ms: number) => {
    if (!ms || ms === 0) return "";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Toggle favorite for a track
  const toggleFavorite = useCallback((track: Track) => {
    if (!track.uri) return;
    
    const video: YouTubeVideo = {
      id: track.uri,
      title: track.title,
      channelTitle: track.artist,
      description: "",
      thumbnailUrl: track.imageUrl,
      isLive: track.album === "🔴 LIVE",
    };

    const isFav = favoritesManager.toggleFavorite(video);
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (isFav) {
        newSet.add(track.uri!);
      } else {
        newSet.delete(track.uri!);
      }
      return newSet;
    });

    // Also add to "Favorites" playlist if favoriting
    if (isFav) {
      const favPlaylist = userPlaylists.find(p => p.name === "Favorites");
      if (favPlaylist) {
        playlistManager.addToPlaylist(favPlaylist.id, video);
        setUserPlaylists(playlistManager.getPlaylists());
      }
    }
  }, [userPlaylists]);

  // Add track to a specific playlist
  const addToPlaylist = useCallback((track: Track, playlistId: string) => {
    if (!track.uri) return;
    
    const video: YouTubeVideo = {
      id: track.uri,
      title: track.title,
      channelTitle: track.artist,
      description: "",
      thumbnailUrl: track.imageUrl,
      isLive: track.album === "🔴 LIVE",
    };

    playlistManager.addToPlaylist(playlistId, video);
    setUserPlaylists(playlistManager.getPlaylists());
    setShowAddToPlaylist(null);
  }, []);

  // Play a user playlist
  const playUserPlaylist = useCallback((playlist: UserPlaylist) => {
    if (playlist.videos.length > 0) {
      setYtVideoId(playlist.videos[0].id);
    }
  }, []);

  return (
    <Card variant="glass" className="relative overflow-hidden" id="music">
      {/* Animated music waves background */}
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-10 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 w-full h-full"
            style={{
              background: `linear-gradient(to top, var(--primary), transparent)`,
              transform: `scaleY(${0.3 + i * 0.15})`,
            }}
            animate={{
              scaleY: [0.3 + i * 0.15, 0.5 + i * 0.15, 0.3 + i * 0.15],
            }}
            transition={{
              duration: 1 + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.1,
            }}
          />
        ))}
      </div>

      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-primary" />
              Vibe Zone
            </CardTitle>
            <CardDescription>
              {isConnected 
                ? `Connected to ${activeService === "spotify" ? "Spotify" : activeService === "soundcloud" ? "SoundCloud" : "Apple Music"}`
                : "Connect to stream music"}
            </CardDescription>
          </div>
          
          {/* Connection buttons */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Button variant="outline" size="sm" onClick={disconnect}>
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={connectYouTube}
                  disabled={isLoading}
                  className="bg-[#FF0000]/10 border-[#FF0000]/30 hover:bg-[#FF0000]/20"
                >
                  <YouTubeIcon className="w-4 h-4 mr-2 text-[#FF0000]" />
                  YouTube
                </Button>
                <div className="relative group">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled
                    className="bg-[#1DB954]/5 border-[#1DB954]/20 opacity-50 cursor-not-allowed"
                  >
                    <SpotifyIcon className="w-4 h-4 mr-2 text-[#1DB954]/50" />
                    Spotify
                  </Button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-secondary border border-border rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    Coming soon...
                  </div>
                </div>
                <div className="relative group">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled
                    className="bg-[#FF5500]/5 border-[#FF5500]/20 opacity-50 cursor-not-allowed"
                  >
                    <SoundCloudIcon className="w-4 h-4 mr-2 text-[#FF5500]/50" />
                    SoundCloud
                  </Button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-secondary border border-border rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    Coming soon...
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-6">
        {/* Error display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={clearError} className="text-red-400 hover:text-red-300">
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && (
          <>
            {/* User playlists (when connected) */}
            {isConnected && userPlaylists.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <ListMusic className="w-4 h-4" />
                  Your Playlists
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {userPlaylists.slice(0, 3).map((playlist, index) => (
                    <motion.button
                      key={playlist.id}
                      className={cn(
                        "relative p-4 rounded-xl border border-border/50 text-left group overflow-hidden",
                        playlist.videos.length > 0 
                          ? "bg-secondary/50 hover:bg-secondary cursor-pointer" 
                          : "bg-secondary/20 cursor-default"
                      )}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={playlist.videos.length > 0 ? { scale: 1.02, y: -2 } : {}}
                      whileTap={playlist.videos.length > 0 ? { scale: 0.98 } : {}}
                      onClick={() => playlist.videos.length > 0 && playUserPlaylist(playlist)}
                    >
                      <motion.div
                        className={cn(
                          "absolute top-0 left-0 w-1 h-full",
                          playlist.name === "Favorites" ? "bg-red-500" : "bg-primary"
                        )}
                        whileHover={{ width: 4 }}
                      />
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-sm truncate flex items-center gap-1.5">
                          {playlist.name === "Favorites" && <Heart className="w-3 h-3 text-red-500" fill="currentColor" />}
                          {playlist.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {playlist.videos.length} {playlist.videos.length === 1 ? "track" : "tracks"}
                        </span>
                      </div>
                      {playlist.videos.length > 0 && (
                        <motion.div
                          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100"
                          initial={{ scale: 0 }}
                          whileHover={{ scale: 1.1 }}
                        >
                          <Play className="w-6 h-6 text-primary" fill="currentColor" />
                        </motion.div>
                      )}
                      {playlist.videos.length === 0 && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          Empty
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Click the heart icon on tracks below to add to Favorites
                </p>
              </div>
            )}

            {/* Connect prompt when not connected */}
            {!isConnected && (
              <motion.div
                className="text-center py-8 px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#FF0000]/20 to-[#FF0000]/5 flex items-center justify-center">
                  <YouTubeIcon className="w-8 h-8 text-[#FF0000]" />
                </div>
                <h4 className="text-lg font-medium mb-2">Stream Lofi Beats</h4>
                <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
                  Connect to YouTube for 24/7 lofi livestreams that match your current vibe
                </p>
                <Button 
                  onClick={connectYouTube}
                  className="bg-[#FF0000] hover:bg-[#FF0000]/90 text-white"
                >
                  <YouTubeIcon className="w-4 h-4 mr-2" />
                  Connect YouTube
                </Button>
              </motion.div>
            )}

            {/* Track list - only show when connected */}
            {isConnected && recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                {activeService === "youtube" ? "Lofi Streams & Mixes" : "Recommended for You"}
              </h4>
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {recommendations.map((track, index) => {
                  const playing = isTrackPlaying(track);
                  const isFavorited = track.uri ? favorites.has(track.uri) : false;
                  const isLive = track.album === "🔴 LIVE";

                  return (
                    <motion.div
                      key={track.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl transition-colors group",
                        playing ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary/50"
                      )}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(index * 0.05, 0.3) }}
                    >
                      {/* Album art - clickable */}
                      <motion.div
                        className={cn(
                          "relative w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br overflow-hidden cursor-pointer",
                          moodGradients[currentMood] || moodGradients.focus
                        )}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => handlePlayTrack(track)}
                      >
                        {track.imageUrl ? (
                          <img 
                            src={track.imageUrl} 
                            alt={track.album}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            {playing ? (
                              <motion.div className="flex items-end gap-0.5 h-4">
                                {[...Array(3)].map((_, i) => (
                                  <motion.div
                                    key={i}
                                    className="w-1 bg-white rounded-full"
                                    animate={{ height: ["40%", "100%", "40%"] }}
                                    transition={{
                                      duration: 0.5,
                                      repeat: Infinity,
                                      delay: i * 0.1,
                                    }}
                                  />
                                ))}
                              </motion.div>
                            ) : (
                              <Music className="w-5 h-5 text-white" />
                            )}
                          </>
                        )}
                        
                        {/* Play overlay */}
                        <motion.div
                          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100"
                          transition={{ duration: 0.2 }}
                        >
                          {playing ? (
                            <Pause className="w-5 h-5 text-white" />
                          ) : (
                            <Play className="w-5 h-5 text-white" fill="white" />
                          )}
                        </motion.div>
                      </motion.div>

                      {/* Track info - clickable */}
                      <div 
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => handlePlayTrack(track)}
                      >
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            "font-medium text-sm truncate",
                            playing && "text-primary"
                          )}>
                            {track.title}
                          </p>
                          {isLive && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                              LIVE
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {track.artist}
                        </p>
                      </div>

                      {/* Favorite button */}
                      {activeService === "youtube" && (
                        <motion.button
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            isFavorited 
                              ? "text-red-500" 
                              : "text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100"
                          )}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(track);
                          }}
                        >
                          <Heart 
                            className="w-4 h-4" 
                            fill={isFavorited ? "currentColor" : "none"} 
                          />
                        </motion.button>
                      )}

                      {/* Duration - only show for non-live videos with duration */}
                      {!isLive && track.duration > 0 && (
                        <span className="text-xs text-muted-foreground tabular-nums min-w-[40px] text-right">
                          {formatDuration(track.duration)}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
            )}

            {/* SoundCloud Embedded Player */}
            <AnimatePresence>
              {activeService === "soundcloud" && (
                <motion.div
                  ref={scContainerRef}
                  className="rounded-xl overflow-hidden border border-border/50"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <iframe
                    key={scPlayerUrl || "default"}
                    width="100%"
                    height="166"
                    scrolling="no"
                    frameBorder="0"
                    allow="autoplay"
                    src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(scPlayerUrl || recommendations[0]?.uri || "https://api.soundcloud.com/tracks/293")}&color=%238b5cf6&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=false`}
                    style={{ borderRadius: "12px" }}
                  />
                  <div className="bg-secondary/30 px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
                    <Music className="w-3 h-3" />
                    Click any track above to load it, then press play in the player
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* YouTube Embedded Player */}
            <AnimatePresence>
              {activeService === "youtube" && ytVideoId && (
                <motion.div
                  className="rounded-xl overflow-hidden border border-border/50"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="aspect-video w-full bg-black rounded-t-xl overflow-hidden">
                    <iframe
                      key={ytVideoId}
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${ytVideoId}?autoplay=1&rel=0&modestbranding=1`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="bg-secondary/30 px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
                    <YouTubeIcon className="w-3 h-3 text-[#FF0000]" />
                    Click any track above to switch videos • 24/7 lofi livestreams available
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </>
        )}
      </CardContent>
    </Card>
  );
}
