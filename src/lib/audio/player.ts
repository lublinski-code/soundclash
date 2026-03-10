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

export function stopPreview(): void {
  cleanup();
}

export function isPreviewPlaying(): boolean {
  return !!audio && !audio.paused;
}
