export { spotifyAuth, spotifyApi, moodToSpotifyParams } from "./spotify";
export type { SpotifyTokens, SpotifyTrack, SpotifyPlaylist, SpotifyPlaybackState } from "./spotify";

export { appleMusicAuth, appleMusicApi } from "./apple-music";
export type { AppleMusicTrack } from "./apple-music";

export { 
  soundcloudAuth, 
  soundcloudApi, 
  soundcloudWidget,
  soundcloudService,
  soundcloudMoodPlaylists, 
  featuredTracks, 
  moodTracks, 
  searchSoundCloud,
  getMoodPlaylists,
  getMoodTracks,
  moodSearchQueries as soundcloudMoodSearchQueries,
} from "./soundcloud";
export type { 
  SoundCloudTrack, 
  SoundCloudPlaylist,
  SoundCloudUser,
  SoundCloudTokens,
  SoundCloudPlaybackState, 
  SoundCloudWidget,
} from "./soundcloud";

export {
  youtubeApi,
  youtubePlayer,
  youtubeService,
  getMoodVideos,
  curatedLofiStreams,
  moodSearchQueries as youtubeMoodSearchQueries,
  favoritesManager,
  playlistManager,
} from "./youtube";
export type {
  YouTubeVideo,
  YouTubePlaylist,
  YouTubePlayer,
  UserPlaylist,
} from "./youtube";
