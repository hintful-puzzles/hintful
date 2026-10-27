/**
 * Which two palette slots a game draws as **the same mark in the same color**:
 * a bar of one thickness, a fill of one size, a disc of one radius or text of
 * one size, in colors a player cannot tell apart.
 *
 * Path's walls and its lines reaching no number were both ink bars, and read as
 * one thing (owner, 2026-10-23). A color alone cannot find that: a game's
 * givens and its grid share one ink on purpose, and are told apart because one
 * is a digit and the other a line. So a slot's marks are read off the game's
 * own frames, as the ops it drew with that slot, and two slots collide only
 * where both the color and the mark match.
 *
 * **What it looks at is three frames**: the deal, the board half solved by
 * playing the hint, and that board with its next hint step shown. A slot only
 * a drag, a mistake or the solved flash brings out is on none of them, so
 * {@link MarkCensus.marks} says which slots were seen at all.
 *
 * Dev/test-only; never imported by production code.
 */

import { Midend } from "../engine/midend.ts";
import { getTsGame } from "../engine/registry.ts";
import { type DrawOp, RecordingDrawing } from "../engine/testing/recording-drawing.ts";
import { colorDistance } from "./neighbor-contrast.ts";
import { schemeOf, schemePalettes } from "./scheme-palettes.ts";

/**
 * The shape of one mark, as a player sees it.
 *
 * - A line and a rect three times as long as it is wide are both a `bar`: a
 *   round cap does not tell a wall from a line. A line at a slant is a
 *   `slash`, so the strokes of a cross are not a wall.
 * - A `fill` covers most of a tile; a `block` is a smaller patch.
 * - A `disc` is a filled circle, a `ring` one with only its edge showing.
 * - A polygon is a `shape`, or an `outline` when it is not filled, and two of
 *   them are one mark only with as many corners.
 */
export type MarkKind =
  | "bar"
  | "slash"
  | "fill"
  | "block"
  | "disc"
  | "ring"
  | `shape/${number}`
  | `outline/${number}`
  | "text";

export interface Mark {
  kind: MarkKind;
  slot: number;
  /** A bar's thickness, a disc's or ring's radius, a text's size, or a patch's
   * side (the square root of its area, for a fill, block or shape). */
  size: number;
  /** How far a bar or slash reaches, so a grid line is not an arrow's shaft;
   * for any other mark, its size again. */
  length: number;
}

/** A rect at least this many times as long as it is wide is a bar. */
const BAR_ASPECT = 3;
/** A patch whose short side is at least this share of a tile is a fill. */
const FILL_SHARE = 0.6;

/** A rect drawn over by one no more than this inset on every side shows only
 * as its rim. */
const RIM = 2;

/**
 * The marks one frame draws.
 *
 * A rim is not a mark of its own, because the fill it edges is what the player
 * reads: the outline of a filled circle or polygon, a line drawn again along
 * the same path by a narrower one, as Path edges a colored line, and a rect
 * drawn over by a slightly smaller one on its center, as Inertia edges a mine.
 * A disc with a smaller one drawn later on its center shows only as a `ring`.
 * The engine's own ops (a clip, the hint's ring and hatch) draw no mark of a
 * game's.
 */
export function frameMarks(ops: readonly DrawOp[], tileSize: number): Mark[] {
  const marks: Mark[] = [];
  // Walked last op first, so each op sees what is drawn over it later: the
  // narrowest line on its path, the smallest circle and the rects on its center.
  const narrowest = new Map<string, number>();
  const smallest = new Map<string, number>();
  const insides = new Map<string, { w: number; h: number }[]>();
  for (let i = ops.length - 1; i >= 0; i--) {
    const op = ops[i];
    switch (op.op) {
      case "line": {
        const path = pathKey(op);
        const edged = (narrowest.get(path) ?? Infinity) < op.thickness;
        narrowest.set(path, Math.min(op.thickness, narrowest.get(path) ?? Infinity));
        if (edged) continue;
        const slant = op.x1 !== op.x2 && op.y1 !== op.y2;
        marks.push({
          kind: slant ? "slash" : "bar",
          slot: op.color,
          size: Math.max(1, op.thickness),
          length: Math.max(1, Math.hypot(op.x2 - op.x1, op.y2 - op.y1)),
        });
        continue;
      }
      case "rect": {
        const short = Math.min(op.w, op.h);
        const long = Math.max(op.w, op.h);
        if (short <= 0) continue;
        const center = `${2 * op.x + op.w},${2 * op.y + op.h}`;
        const inside = insides.get(center) ?? [];
        insides.set(center, [...inside, op]);
        const rimmed = inside.some(
          (o) =>
            o.w < op.w && o.h < op.h && op.w - o.w <= 2 * RIM && op.h - o.h <= 2 * RIM,
        );
        if (rimmed) continue;
        if (long >= BAR_ASPECT * short) {
          marks.push({ kind: "bar", slot: op.color, size: short, length: long });
          continue;
        }
        const kind = short >= FILL_SHARE * tileSize ? "fill" : "block";
        const side = Math.sqrt(op.w * op.h);
        marks.push({ kind, slot: op.color, size: side, length: side });
        continue;
      }
      case "circle": {
        const center = `${op.cx},${op.cy}`;
        const hollowed = (smallest.get(center) ?? Infinity) < op.r;
        smallest.set(center, Math.min(op.r, smallest.get(center) ?? Infinity));
        const kind = op.fill >= 0 && !hollowed ? "disc" : "ring";
        const slot = op.fill >= 0 ? op.fill : op.outline;
        if (slot >= 0) marks.push({ kind, slot, size: op.r, length: op.r });
        continue;
      }
      case "polygon": {
        const xs = op.points.map(([x]) => x);
        const ys = op.points.map(([, y]) => y);
        const size = Math.sqrt(
          (Math.max(...xs) - Math.min(...xs) || 1) *
            (Math.max(...ys) - Math.min(...ys) || 1),
        );
        const corners = op.points.length;
        if (op.fill >= 0)
          marks.push({ kind: `shape/${corners}`, slot: op.fill, size, length: size });
        else if (op.outline >= 0)
          marks.push({
            kind: `outline/${corners}`,
            slot: op.outline,
            size,
            length: size,
          });
        continue;
      }
      case "text":
        marks.push({ kind: "text", slot: op.color, size: op.size, length: op.size });
        continue;
      case "hatch":
      case "ring":
      case "clip":
      case "unclip":
        continue;
    }
  }
  return marks;
}

/** A line's path, the same whichever end it was drawn from. */
function pathKey(op: Extract<DrawOp, { op: "line" }>): string {
  const [p, q] = [`${op.x1},${op.y1}`, `${op.x2},${op.y2}`].sort();
  return `${p} ${q}`;
}

/** The frames a game is measured on, as draw records, with the tile size they
 * were drawn at. */
function playedFrames(id: string): {
  frames: DrawOp[][];
  tileSize: number;
  /** Hint steps a whole solve took, of which half were played. */
  steps: number;
} {
  const game = getTsGame(id);
  if (!game) throw new Error(`${id} is not registered`);
  const params = game.defaultParams();
  const gameId = `${game.encodeParams(params, true)}#mark-collisions`;
  const midend = new Midend(game);
  const palette = schemePalettes(id).light;
  const capture = (): DrawOp[] => {
    // Run out any animation, so the frame is the one a player is left with.
    midend.timer(60);
    const recording = new RecordingDrawing(palette);
    midend.forceRedraw(recording);
    return recording.ops;
  };
  const deal = (): void => {
    const err = midend.newGameFromId(gameId);
    if (err) throw new Error(`${id}: ${err}`);
  };
  /** Play up to `limit` hint steps; how many were played. */
  const play = (limit: number): number => {
    let n = 0;
    while (n < limit && !midend.hint() && !midend.executeHint(true)) {
      midend.timer(60);
      n++;
    }
    return n;
  };

  deal();
  const frames = [capture()];
  let whole = 0;
  if (game.hint) {
    whole = play(MAX_STEPS);
    deal();
    play(Math.floor(whole / 2));
    frames.push(capture());
    if (!midend.hint()) frames.push(capture());
  }
  return { frames, tileSize: game.preferredTileSize ?? 32, steps: whole };
}

/** A solve longer than this is cut off; half of it is still a board with play
 * on it. */
const MAX_STEPS = 400;

/** Two sizes closer than this factor are one mark to the eye. Path's ink wall
 * (3 px) beside its ink line (5 px) read as one, at 1.67; twice as thick is
 * how every grid game tells a border from its grid lines. */
const SIZE_FACTOR = 2;
/** Below this, two colors are one as far as a player is concerned; the
 * distance `color-collide` reports at. */
const SAME_COLOR = 0.02;

export interface MarkCollision {
  a: number;
  b: number;
  /** The two marks that matched, `a`'s first. */
  marks: [Mark, Mark];
  /** Which scheme cannot tell the colors apart. */
  scheme: "light" | "dark" | "both";
}

export interface MarkCensus {
  collisions: MarkCollision[];
  /** Each slot's distinct marks, for every slot the frames drew a mark with
   * but a bevel's edges. */
  marks: Map<number, Mark[]>;
  /** How many slots `colors()` returns. */
  defined: number;
  /** Hint steps a whole solve took; the frames half way through it are read. */
  steps: number;
}

/** Every pair of a game's slots drawn as one mark in one color. */
export function markCollisions(id: string): MarkCensus {
  const game = getTsGame(id);
  if (!game) throw new Error(`${id} is not registered`);
  const defined = game.colors([0.9, 0.9, 0.9]).length;
  const { light, dark } = schemePalettes(id);
  const { darkSwaps } = schemeOf(id);
  // A slot dark mode exchanges plays its partner's part in the light scheme.
  const lightRole = (slot: number): number => {
    for (const [x, y] of darkSwaps) {
      if (slot === x) return y;
      if (slot === y) return x;
    }
    return slot;
  };

  // A bevel's lit and shadow edges are the rim of the tile they raise.
  const bevel = new Set(darkSwaps.flat());

  const { frames, tileSize, steps } = playedFrames(id);
  const distinct = new Map<number, Map<string, Mark>>();
  for (const ops of frames)
    for (const mark of frameMarks(ops, tileSize)) {
      if (mark.slot >= defined || bevel.has(mark.slot)) continue;
      const seen = distinct.get(mark.slot) ?? new Map<string, Mark>();
      distinct.set(mark.slot, seen);
      seen.set(`${mark.kind} ${mark.size} ${mark.length}`, mark);
    }
  const bySlot = new Map(
    [...distinct].map(([slot, seen]) => [slot, [...seen.values()]]),
  );

  const slots = [...bySlot.keys()].sort((p, q) => p - q);
  const collisions: MarkCollision[] = [];
  for (let i = 0; i < slots.length; i++)
    for (let j = i + 1; j < slots.length; j++) {
      const a = slots[i];
      const b = slots[j];
      const inLight =
        colorDistance(light[lightRole(a)], light[lightRole(b)]) < SAME_COLOR;
      const inDark = colorDistance(dark[a], dark[b]) < SAME_COLOR;
      if (!inLight && !inDark) continue;
      const marks = alike(bySlot.get(a) ?? [], bySlot.get(b) ?? []);
      if (!marks) continue;
      const scheme = inLight && inDark ? "both" : inLight ? "light" : "dark";
      collisions.push({ a, b, marks, scheme });
    }
  return { collisions, marks: bySlot, defined, steps };
}

/** The first two marks, one from each list, of one kind and a like size and
 * length: what a player could not tell apart if they were one color. */
export function alike(p: readonly Mark[], q: readonly Mark[]): [Mark, Mark] | null {
  const near = (x: number, y: number): boolean =>
    Math.max(x, y) < SIZE_FACTOR * Math.min(x, y);
  for (const x of p)
    for (const y of q)
      if (x.kind === y.kind && near(x.size, y.size) && near(x.length, y.length))
        return [x, y];
  return null;
}
