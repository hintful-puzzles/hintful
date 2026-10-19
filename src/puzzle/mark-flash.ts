/**
 * The pixels of one reference's marks, found by drawing the board with them
 * (`shown`) and without them (`hidden`), as RGBA: whatever differs is theirs,
 * whatever shape and color each game draws them in. White, with the
 * difference as opacity, so a mark's anti-aliased rim fades as it does on the
 * board.
 */
export function markPixels(
  shown: Uint8ClampedArray,
  hidden: Uint8ClampedArray,
): Uint8ClampedArray<ArrayBuffer> {
  const out = new Uint8ClampedArray(shown.length);
  for (let i = 0; i < shown.length; i += 4) {
    const d = Math.max(
      Math.abs(shown[i] - hidden[i]),
      Math.abs(shown[i + 1] - hidden[i + 1]),
      Math.abs(shown[i + 2] - hidden[i + 2]),
    );
    if (d === 0) continue;
    out[i] = out[i + 1] = out[i + 2] = 255;
    // A mark's full color stands well clear of what it covers; a rim pixel
    // differs by a fraction of that, and keeps the fraction.
    out[i + 3] = Math.min(255, d * 3);
  }
  return out;
}
