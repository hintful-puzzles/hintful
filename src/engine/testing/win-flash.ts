/**
 * A win flash for a test that paints frames itself, with no midend to run the
 * clock.
 */

import { expect } from "vitest";
import { type Flash, WIN_FLASH_S, WinWave } from "../win-wave.ts";

/**
 * The win flash `seconds` after it set off.
 *
 * A wave learns its route from the frame before, so `measure` paints one
 * frame with the flash it is handed, into a draw state and a drawing the test
 * throws away. The flash returned answers for the frame after that one.
 */
export function winFlashAt(
  seconds: number,
  measure: (flash: Flash) => void,
  still = false,
): Flash {
  const wave = new WinWave(still);
  measure(wave);
  wave.endFrame();
  wave.seek(seconds);
  return wave;
}

/** What a win flash lit, frame by frame, each element as a key of the test's
 * choosing. */
export interface WinFlashRun<Key> {
  /** The lit elements at instants spread across the flash, neither end among
   * them. */
  readonly frames: readonly (readonly Key[])[];
  /** The lit elements at the flash's last instant. */
  readonly end: readonly Key[];
}

/**
 * Paint a win flash from start to end and read what each frame lit.
 *
 * `paint` paints one frame with the flash it is handed, from a draw state that
 * has never painted, and `lit` reads the lit elements off what it returned.
 */
export function winFlashRun<Frame, Key>(
  paint: (flash: Flash) => Frame,
  lit: (frame: Frame) => readonly Key[],
  count = 30,
): WinFlashRun<Key> {
  const at = (seconds: number) => lit(paint(winFlashAt(seconds, paint)));
  return {
    frames: Array.from({ length: count }, (_, i) =>
      at((WIN_FLASH_S * (i + 1)) / (count + 1)),
    ),
    end: at(WIN_FLASH_S),
  };
}

/**
 * Assert that `run` is the engine's highlight traveling the game's route:
 * `elements` of them lit in all, each for one stretch of frames, never all at
 * once, in the order of `position` (the number the game hands `flash.win` for
 * that element), the first frame at the route's start, the last at its end,
 * and nothing lit when the flash is over.
 */
export function expectWinFlashTravels<Key>(
  run: WinFlashRun<Key>,
  elements: number,
  position: (key: Key) => number,
): void {
  const { frames, end } = run;
  const all = [...new Set(frames.flat())].sort((a, b) => position(a) - position(b));
  expect(all).toHaveLength(elements);
  const first = all.map((key) => frames.findIndex((frame) => frame.includes(key)));
  const last = all.map((key) => frames.findLastIndex((frame) => frame.includes(key)));
  all.forEach((key, i) => {
    // One stretch: the highlight passes an element and does not come back.
    const stretch = frames.filter((frame) => frame.includes(key)).length;
    expect(last[i] - first[i] + 1, `${String(key)} is lit for one stretch`).toBe(
      stretch,
    );
  });
  // In route order: no element lights before one that comes earlier.
  expect(first).toEqual([...first].sort((a, b) => a - b));
  expect(last).toEqual([...last].sort((a, b) => a - b));
  const low = position(all[0]);
  const high = position(all[all.length - 1]);
  expect(frames[0].map(position)).toContain(low);
  expect(frames[frames.length - 1].map(position)).toContain(high);
  for (const frame of frames) {
    expect(frame.length).toBeGreaterThan(0);
    if (high > low) expect(new Set(frame).size).toBeLessThan(elements);
  }
  expect(end).toEqual([]);
}
