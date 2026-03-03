// ─── Preview Player ───
// Plays 30-second Spotify preview URLs using HTMLAudioElement.
// Supports timed snippets with configurable duration and start offset.

let audio: HTMLAudioElement | null = null;
let stopTimer: ReturnType<typeof setTimeout> | null = null;

function cleanup() {
  if (stopTimer) {
    clearTimeout(stopTimer);
    stopTimer = null;
  }
  if (audio) {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
  }
}

/**
 * Play a preview URL for a given duration.
 * @param previewUrl  The 30s MP3 preview URL from Spotify
 * @param durationMs  How long to play (max ~30000ms)
 * @param onEnd       Called when snippet playback finishes
 * @param startOffsetMs  Where to start within the 30s preview
 */
export async function playPreview(
  previewUrl: string,
  durationMs: number,
  onEnd?: () => void,
  startOffsetMs = 0
): Promise<void> {
  cleanup();

  if (!audio) {
    audio = new Audio();
  }

  audio.src = previewUrl;
  audio.currentTime = Math.min(startOffsetMs / 1000, 29);

  const handleEnd = () => {
    cleanup();
    onEnd?.();
  };

  audio.onended = handleEnd;
  audio.onerror = handleEnd;

  try {
    await audio.play();
  } catch (err) {
    console.error("[Player] Playback failed:", err);
    onEnd?.();
    return;
  }

  const maxPreviewMs = 30_000;
  const effectiveDuration = Math.min(durationMs, maxPreviewMs - startOffsetMs);

  if (effectiveDuration > 0 && effectiveDuration < maxPreviewMs) {
    stopTimer = setTimeout(() => {
      if (audio && !audio.paused) {
        audio.pause();
        onEnd?.();
      }
    }, effectiveDuration);
  }
}

/** Stop any currently playing preview. */
export function stopPreview(): void {
  cleanup();
}

/** Check if audio is currently playing. */
export function isPreviewPlaying(): boolean {
  return !!audio && !audio.paused;
}
