// Global type declarations for Spotify Web Playback SDK

interface Window {
  Spotify: typeof Spotify;
  onSpotifyWebPlaybackSDKReady: () => void;
}
