const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;

interface CompressOptions {
  maxDimension?: number;
  quality?: number;
}

/**
 * Downscale a photo to a reasonable size and return it as a JPEG data URL.
 * Keeps uploads small and fast.
 *
 * Defaults match the receipt scanner (1600px). Avatars and QR codes pass a
 * smaller maxDimension — they end up in a database column read on every page,
 * so a full-size 400 KB base64 string is not acceptable there.
 */
export async function compressImage(
  file: File,
  { maxDimension = MAX_DIMENSION, quality = JPEG_QUALITY }: CompressOptions = {},
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not supported in this browser");
    ctx.drawImage(bitmap, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    bitmap.close();
  }
}
