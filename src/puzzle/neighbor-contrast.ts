/**
 * How far apart a game's neighboring colors stand in each scheme: every pair
 * of palette indices its frames paint side by side
 * (`engine/testing/painted-neighbors.ts`), measured as the app paints them
 * (`scheme-palettes.ts`).
 *
 * **What it looks at is two frames**: the deal, and the board some hint steps
 * in for a game that has a hint. A color only input or an error brings out (a
 * drag, a mistake, the solved flash, a hint's own marks) is on neither, so a
 * pair that is absent from the result has not been measured, and is not
 * thereby fine.
 *
 * Dev/test-only; never imported by production code.
 */

import { Midend } from "../engine/midend.ts";
import { getTsGame } from "../engine/registry.ts";
import {
  type NeighborKind,
  paintedNeighbors,
} from "../engine/testing/painted-neighbors.ts";
import { type DrawOp, RecordingDrawing } from "../engine/testing/recording-drawing.ts";
import type { Color, PuzzleId, Size } from "../engine/types.ts";
import { colorToOKLCH, isGrayChroma } from "../utils/color.ts";
import { puzzleAugmentations } from "./augmentation.ts";
import { schemePalettes } from "./scheme-palettes.ts";

/** The seed the frames are dealt from. Any fixed one; it names which roles
 * happen to be on the board, so changing it moves the measured population. */
const SEED = "contact-sheet";
/** How far into the hint plan the second frame is taken. */
const HINT_STEPS = 14;
/** Fewer touching pixels than this is a corner, not a boundary. */
const MIN_PIXELS = 8;

export interface SchemeNeighbor {
  kind: NeighborKind;
  a: number;
  b: number;
  count: number;
  /** Distance in the light scheme, **by role**: an index dark mode exchanges
   * with another is compared through its partner, since that is the index
   * playing this part in the light scheme. */
  light: number;
  /** Distance in the dark scheme, between the two indices as painted. */
  dark: number;
}

/** OKLCH distance with chroma and hue as a plane, so a hue difference between
 * two near-grays counts for the little the eye gives it. */
function colorDistance(p: Color, q: Color): number {
  const plane = ([, c, h]: readonly number[]): [number, number] =>
    isGrayChroma(c)
      ? [0, 0]
      : [c * Math.cos((h * Math.PI) / 180), c * Math.sin((h * Math.PI) / 180)];
  const a = colorToOKLCH(p);
  const b = colorToOKLCH(q);
  const [ax, ay] = plane(a);
  const [bx, by] = plane(b);
  return Math.hypot(a[0] - b[0], ax - bx, ay - by);
}

/** The frames a game is measured on, as draw records, with their size. */
export function sampleFrames(id: string): { frames: DrawOp[][]; size: Size } {
  const game = getTsGame(id);
  if (!game) throw new Error(`${id} is not registered`);
  const params = game.defaultParams();
  const midend = new Midend(game);
  const err = midend.newGameFromId(`${game.encodeParams(params, true)}#${SEED}`);
  if (err) throw new Error(`${id}: ${err}`);
  const palette = schemePalettes(id).light;
  const capture = (): DrawOp[] => {
    // Run out any animation, so the frame is the one a player is left with.
    midend.timer(60);
    const recording = new RecordingDrawing(palette);
    midend.forceRedraw(recording);
    return recording.ops;
  };
  const frames = [capture()];
  if (game.hint) {
    for (let i = 0; i < HINT_STEPS; i++)
      if (midend.hint() || midend.executeHint(true)) break;
    frames.push(capture());
  }
  return { frames, size: game.computeSize(params, game.preferredTileSize ?? 32) };
}

/** Every pair of neighboring indices on a game's sample frames, with its
 * distance in each scheme. */
export function schemeNeighbors(id: string): SchemeNeighbor[] {
  const { light, dark } = schemePalettes(id);
  const augmentations = puzzleAugmentations[id as PuzzleId];
  const background = augmentations?.paletteBgIndex ?? 0;
  const swaps = augmentations?.darkMode?.paletteSwaps ?? [];
  const lightRole = (index: number): number => {
    for (const [x, y] of swaps) {
      if (index === x) return y;
      if (index === y) return x;
    }
    return index;
  };

  const { frames, size } = sampleFrames(id);
  const seen = new Map<string, SchemeNeighbor>();
  for (const ops of frames)
    for (const pair of paintedNeighbors(ops, size, background)) {
      if (pair.kind !== "text" && pair.count < MIN_PIXELS) continue;
      const key = `${pair.kind}:${pair.a}:${pair.b}`;
      const old = seen.get(key);
      if (old && old.count >= pair.count) continue;
      seen.set(key, {
        ...pair,
        light: colorDistance(light[lightRole(pair.a)], light[lightRole(pair.b)]),
        dark: colorDistance(dark[pair.a], dark[pair.b]),
      });
    }
  return [...seen.values()];
}

/** The least distance two neighbors may stand apart in the dark scheme. Below
 * it a wall could not be told from the floor on a phone (owner, 2026-10-03, at
 * 0.03); the wall that fixed it stands 0.107 off. */
export const MIN_DARK_DISTANCE = 0.07;

/**
 * Whether a pair is too close in the dark scheme.
 *
 * Two areas owe the floor outright: a player tells a wall from the floor by
 * the two fills, and "the light scheme is as close" excuses nothing when the
 * light scheme's bevel was carrying the shape. A mark or a glyph owes it only
 * where the light scheme gave it at least twice the distance, because a quiet
 * grid line is quiet on purpose in both. A pair that is one color in both
 * schemes is one role under two indices.
 */
export function tooCloseInDark(pair: SchemeNeighbor): boolean {
  if (pair.dark >= MIN_DARK_DISTANCE) return false;
  if (pair.dark < 0.005 && pair.light < 0.005) return false;
  return pair.kind === "area" || pair.dark < 0.5 * pair.light;
}
