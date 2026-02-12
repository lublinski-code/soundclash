// ─── Song Pool: Fetch & Build Game Track List ───

import type { SpotifyTrack, GameConfig } from "../game/types";
import {
  searchTracksByGenre,
  searchPlaylists,
  getPlaylistTracks,
} from "./api";

/**
 * Shuffle an array (Fisher-Yates).
 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Deduplicate tracks by ID.
 */
function deduplicateTracks(tracks: SpotifyTrack[]): SpotifyTrack[] {
  const seen = new Set<string>();
  return tracks.filter((track) => {
    if (seen.has(track.id)) return false;
    seen.add(track.id);
    return true;
  });
}

/**
 * Safely check if a raw track object has the shape we need.
 */
function isValidTrack(raw: unknown): raw is SpotifyTrack {
  if (!raw || typeof raw !== "object") return false;
  const t = raw as Record<string, unknown>;
  if (typeof t.id !== "string" || !t.id) return false;
  if (typeof t.name !== "string" || !t.name) return false;
  if (typeof t.uri !== "string" || !t.uri) return false;
  if (typeof t.duration_ms !== "number") return false;
  if (!Array.isArray(t.artists) || t.artists.length === 0) return false;
  if (!t.album || typeof t.album !== "object") return false;
  const album = t.album as Record<string, unknown>;
  if (!Array.isArray(album.images)) return false;
  return true;
}

/** Playlist search terms for each genre (best hits playlists) */
const GENRE_PLAYLIST_QUERIES: Record<string, string[]> = {
  rock: ["rock classics", "rock hits", "classic rock"],
  pop: ["pop hits", "today's top hits", "all out pop"],
  metal: ["metal essentials", "heavy metal", "metal classics"],
  "hip-hop": ["hip hop hits", "rap caviar", "hip hop classics"],
  dance: ["dance hits", "dance classics", "dance pop"],
  electronic: ["electronic hits", "electronic dance", "EDM hits"],
  "r-n-b": ["R&B hits", "R&B classics", "soul R&B"],
  jazz: ["jazz classics", "jazz essentials", "jazz hits"],
  classical: ["classical essentials", "classical hits"],
  country: ["country hits", "country classics", "hot country"],
  blues: ["blues classics", "blues hits"],
  reggae: ["reggae classics", "reggae hits"],
  punk: ["punk essentials", "punk rock hits", "punk classics"],
  soul: ["soul classics", "soul hits"],
  indie: ["indie hits", "indie rock", "indie essentials"],
  latin: ["latin hits", "latin pop", "reggaeton hits"],
  funk: ["funk classics", "funk hits"],
  disco: ["disco classics", "disco hits", "disco fever"],
  alternative: ["alternative hits", "alt rock essentials", "alternative 90s"],
  grunge: ["grunge essentials", "90s grunge", "grunge rock"],
};

/**
 * Build a song pool based on game configuration.
 *
 * Three-layer strategy:
 * 1. Search for curated playlists matching the genre (most recognizable songs)
 * 2. Direct track search with genre as keyword + year filter
 *
 * Targets ~60 songs minimum for a good game session.
 */
export async function buildSongPool(
  config: GameConfig,
  targetSize = 60
): Promise<SpotifyTrack[]> {
  let allTracks: SpotifyTrack[] = [];
  const { genres, eras, market } = config;

  console.log(
    `[SongPool] Building pool for genres=[${genres.join(", ")}], eras=[${eras.join(", ")}], market=${market}`
  );

  // ── Strategy 1: Find playlists by searching for genre-specific keywords ──
  for (const genre of genres) {
    const queries =
      GENRE_PLAYLIST_QUERIES[genre] ?? [`${genre} hits`, `${genre} classics`, `best of ${genre}`];

    for (const query of queries) {
      if (allTracks.length >= targetSize * 2) break;

      try {
        const playlists = await searchPlaylists(query, market, 5);
        console.log(
          `[SongPool] Playlist search "${query}": found ${playlists.length} playlists`
        );

        for (const playlist of playlists.slice(0, 3)) {
          try {
            const rawTracks = await getPlaylistTracks(playlist.id, market, 50);
            const validTracks = rawTracks.filter(isValidTrack);
            console.log(
              `[SongPool]   "${playlist.name}" (${playlist.id}): ${rawTracks.length} raw -> ${validTracks.length} valid`
            );
            allTracks.push(...validTracks);
          } catch (err) {
            console.warn(`[SongPool]   Failed to fetch playlist "${playlist.name}":`, err);
          }
        }
      } catch (err) {
        console.warn(`[SongPool] Playlist search failed for "${query}":`, err);
      }
    }
  }

  console.log(`[SongPool] After playlist strategy: ${allTracks.length} tracks`);

  // ── Strategy 2: Direct search with genre keyword + year range ──
  if (allTracks.length < targetSize) {
    for (const genre of genres) {
      const eraList = eras.length > 0 ? eras : [undefined];

      for (const era of eraList) {
        if (allTracks.length >= targetSize * 2) break;

        try {
          const offset = Math.floor(Math.random() * 50);
          const tracks = await searchTracksByGenre(genre, era, market, offset, 50);
          const validTracks = tracks.filter(isValidTrack);
          console.log(
            `[SongPool] Search "${genre}" ${era ?? "all years"}: ${tracks.length} raw -> ${validTracks.length} valid`
          );
          allTracks.push(...validTracks);
        } catch (err) {
          console.warn(`[SongPool] Search failed for "${genre}" ${era ?? ""}:`, err);
        }
      }
    }
    console.log(`[SongPool] After search strategy: ${allTracks.length} tracks`);
  }

  // ── Post-processing ──
  allTracks = deduplicateTracks(allTracks);
  console.log(`[SongPool] After dedup: ${allTracks.length} tracks`);

  // Filter out tracks without album art or that are too short (< 30s)
  allTracks = allTracks.filter((track) => {
    try {
      const hasArt =
        track.album &&
        Array.isArray(track.album.images) &&
        track.album.images.length > 0;
      const longEnough = track.duration_ms > 30000;
      return hasArt && longEnough;
    } catch {
      return false;
    }
  });

  allTracks = shuffle(allTracks);

  console.log(`[SongPool] Final pool: ${allTracks.length} tracks`);

  return allTracks.slice(0, Math.max(targetSize, allTracks.length));
}
