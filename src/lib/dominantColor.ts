/**
 * Dominant-colour extraction for portfolio media.
 *
 * Runs in the ADMIN on the local `File`, before upload — never on the published
 * Supabase URL in a visitor's browser. That is the whole point: reading pixels
 * back out of a canvas that was painted from a cross-origin URL taints it and
 * throws, so sampling the local file sidesteps CORS entirely.
 *
 * The result is stored on `portfolio_sections.accent_hex` and drives the
 * gallery's ambient light.
 */

const SAMPLE = 32; // downscale target — plenty for a dominant hue, ~1k pixels
const HUE_BUCKETS = 24; // 15° per bucket

/** sRGB → HSL, all outputs 0..1 except hue in degrees */
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return { h, s, l };
}

function hslToHex(h: number, s: number, l: number) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const seg = Math.floor(h / 60) % 6;
  const [r1, g1, b1] =
    [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][seg] ?? [c, x, 0];
  const to = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${to(r1)}${to(g1)}${to(b1)}`;
}

/**
 * Pick the dominant hue from already-drawn canvas pixels.
 *
 * Near-black, near-white and near-grey pixels are discarded first. They almost
 * always dominate the raw counts (backgrounds, paper, shadow) and average out
 * to a muddy beige that tells you nothing about the artwork. What is left is
 * bucketed by hue and weighted by saturation, so a small area of strong colour
 * beats a large area of washed-out colour — which is what the eye does too.
 */
function dominantFromPixels(data: Uint8ClampedArray): string {
  const weight = new Float64Array(HUE_BUCKETS);
  const satSum = new Float64Array(HUE_BUCKETS);
  const lumSum = new Float64Array(HUE_BUCKETS);
  const count = new Float64Array(HUE_BUCKETS);

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue; // transparent
    const { h, s, l } = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    if (l < 0.12 || l > 0.92) continue; // near-black / near-white
    if (s < 0.18) continue; // near-grey
    const b = Math.min(HUE_BUCKETS - 1, Math.floor(h / (360 / HUE_BUCKETS)));
    weight[b] += s * s; // saturation-weighted, squared so vivid pixels really count
    satSum[b] += s;
    lumSum[b] += l;
    count[b] += 1;
  }

  let best = -1;
  let bestWeight = 0;
  for (let b = 0; b < HUE_BUCKETS; b++) {
    if (weight[b] > bestWeight) { bestWeight = weight[b]; best = b; }
  }
  // Entirely grey/black/white media: no meaningful hue to report.
  if (best < 0) return '';

  const h = (best + 0.5) * (360 / HUE_BUCKETS);
  const s = Math.min(0.85, Math.max(0.35, satSum[best] / count[best]));
  const l = Math.min(0.62, Math.max(0.38, lumSum[best] / count[best]));
  return hslToHex(h, s, l);
}

function readCanvas(draw: (ctx: CanvasRenderingContext2D) => void): string {
  const canvas = document.createElement('canvas');
  canvas.width = SAMPLE;
  canvas.height = SAMPLE;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return '';
  draw(ctx);
  return dominantFromPixels(ctx.getImageData(0, 0, SAMPLE, SAMPLE).data);
}

async function fromImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    return readCanvas((ctx) => ctx.drawImage(bitmap, 0, 0, SAMPLE, SAMPLE));
  } finally {
    bitmap.close();
  }
}

async function fromVideo(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.src = url;
  try {
    await new Promise<void>((resolve, reject) => {
      // Seek a little way in: frame 0 of a lot of clips is a black or white fade.
      const onLoaded = () => { video.currentTime = Math.min(0.1, (video.duration || 1) / 10); };
      const fail = () => reject(new Error('Could not read a frame from this video'));
      video.addEventListener('loadeddata', onLoaded, { once: true });
      video.addEventListener('seeked', () => resolve(), { once: true });
      video.addEventListener('error', fail, { once: true });
      window.setTimeout(fail, 8000);
    });
    return readCanvas((ctx) => ctx.drawImage(video, 0, 0, SAMPLE, SAMPLE));
  } finally {
    URL.revokeObjectURL(url);
    video.removeAttribute('src');
    video.load();
  }
}

/**
 * Sample the dominant colour of an image or video File.
 * Returns `#rrggbb`, or `''` when there is no meaningful hue (fully greyscale
 * media) or the file could not be decoded. Callers should treat `''` as
 * "fall back to the site accent" rather than as an error.
 */
export async function dominantColorFromFile(file: File): Promise<string> {
  try {
    if (file.type.startsWith('video/')) return await fromVideo(file);
    if (file.type.startsWith('image/')) return await fromImage(file);
    return '';
  } catch {
    return '';
  }
}
