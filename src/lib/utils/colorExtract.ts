// ─── Album Art Dominant Color Extraction ───
// Uses a canvas-based approach to extract the dominant color without external libraries.

/**
 * Extract the dominant color from an image URL.
 * Returns an RGB string like "rgb(255, 100, 50)".
 */
export async function extractDominantColor(
  imageUrl: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve("rgb(139, 92, 246)"); // fallback purple
          return;
        }

        // Scale down for performance
        const size = 32;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;

        // Simple averaging with saturation bias
        let r = 0, g = 0, b = 0, count = 0;

        for (let i = 0; i < data.length; i += 4) {
          const pr = data[i];
          const pg = data[i + 1];
          const pb = data[i + 2];

          // Skip very dark and very light pixels
          const brightness = (pr + pg + pb) / 3;
          if (brightness < 30 || brightness > 230) continue;

          // Weight by saturation for more vibrant result
          const max = Math.max(pr, pg, pb);
          const min = Math.min(pr, pg, pb);
          const saturation = max === 0 ? 0 : (max - min) / max;
          const weight = 1 + saturation * 3;

          r += pr * weight;
          g += pg * weight;
          b += pb * weight;
          count += weight;
        }

        if (count === 0) {
          resolve("rgb(139, 92, 246)"); // fallback
          return;
        }

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);

        resolve(`rgb(${r}, ${g}, ${b})`);
      } catch {
        resolve("rgb(139, 92, 246)"); // fallback
      }
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageUrl;
  });
}

/**
 * Create a CSS glow shadow from a color string.
 */
export function createGlow(color: string, intensity = 1): string {
  const spread = Math.round(30 * intensity);
  const blur = Math.round(60 * intensity);
  return `0 0 ${spread}px ${color}, 0 0 ${blur}px ${color}`;
}
