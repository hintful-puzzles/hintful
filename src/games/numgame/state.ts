/**
 * Numgame's state, params, move and ui types, and its desc codec.
 *
 * The board is six places, two rows of three in reading order. Each holds a
 * tile or nothing: a combination empties one place and puts its result in
 * another, so a tile never moves under the player's finger
 * (`add-numgame-ts-port` design D5).
 */

import { assertNever } from "../../engine/assert-never.ts";
import { type DescParse, descValue } from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import { difficultyItem, tierNames } from "../../engine/difficulty.ts";
import type { ParamConfigItem, PresetBoards } from "../../engine/game.ts";
import { numberItem } from "../../engine/params.ts";
import { choice, num, paramsCodec } from "../../engine/params-codec.ts";
import type { GridCursor } from "../../engine/pointer.ts";
import { combine, OPS, type Op, type Step } from "./solver.ts";

// --- the board --------------------------------------------------------------

/** How many numbers a board deals. */
export const PLACES = 6;
/** The places in a row of the board. */
export const ROW = 3;

/** Countdown's small numbers: two cards each of these. */
export const SMALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
/** Countdown's large numbers: one card each. */
export const LARGE = [25, 50, 75, 100] as const;

/** The largest number a desc may deal: Countdown's largest card. It also
 * keeps every product of six numbers an exact double. */
const MAX_NUMBER = 100;
/** The largest target a desc may set: four digits fill the target's box. */
const MAX_TARGET = 9999;

// --- difficulty -------------------------------------------------------------

/** A tier is the fewest operations its target needs, less this. */
export const OPS_AT_EASIEST = 2;

const DIFF_NAMES: readonly string[] = tierNames(4);

/** The `d<char>` params suffix, by tier. */
const DIFF_CHARS = "enth";

// --- types ------------------------------------------------------------------

export interface NumgameParams {
  /** How many of the six numbers are large, 0 to 4. */
  large: number;
  /** The tier: the target needs exactly `diff + OPS_AT_EASIEST` operations. */
  diff: number;
}

/** How a tile the player made was made: `a op b`, `a` the larger. */
export interface Made {
  readonly a: number;
  readonly op: Op;
  readonly b: number;
}

export interface Tile {
  readonly value: number;
  /** `null` for a number as dealt. */
  readonly made: Made | null;
}

export interface NumgameState {
  readonly target: number;
  /** The numbers as dealt, in their places. Shared between states. */
  readonly dealt: readonly number[];
  /** What each place holds now. */
  readonly slots: readonly (Tile | null)[];
}

/** A combination, or Solve's line of them. Solve starts again from the
 * numbers as dealt where no line finishes from the board as played. */
export type NumgameMove =
  | ({ kind: "combine" } & Step)
  | { kind: "solve"; restart: boolean; steps: readonly Step[] };

export interface NumgameUi {
  /** The place of the first number of a combination, once tapped. */
  selected: number | null;
  /** The operator chosen, once tapped; only with a number selected. */
  op: Op | null;
  cursor: GridCursor;
}

// --- params -----------------------------------------------------------------

/** The "Custom type…" form, and the fields the codec below reads and writes. */
export const paramConfig: ParamConfigItem<NumgameParams>[] = [
  numberItem<NumgameParams>("large", "Large numbers", "large", {
    doc: "How many of the six numbers are drawn from the large ones, 25, 50, 75 and 100; the rest are drawn from two each of 1 to 10.",
    bounds: { min: 0, max: LARGE.length },
    label: { slot: "kind", words: (p) => `${p.large} large` },
  }),
  difficultyItem(DIFF_NAMES, "diff", {
    doc: "<p>The tier is the fewest operations that make the target: two at <em>Easy</em>, three at <em>Normal</em>, four at <em>Tricky</em> and five at <em>Hard</em>.</p>",
  }),
];

const BOARDS: NumgameParams[] = [
  { large: 1, diff: 0 },
  { large: 2, diff: 0 },
  { large: 4, diff: 0 },
];

/** Normal, so that the first board's hint walks a split with a step on each
 * side of it: the board the cross-game guards deal is this one. */
export function defaultParams(): NumgameParams {
  return { ...BOARDS[0], diff: 1 };
}

export const menu: PresetBoards<NumgameParams> = { boards: BOARDS };

export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  num(paramConfig, "l", "large"),
  choice(paramConfig, "d", "difficulty", DIFF_CHARS, { full: true }),
]);

// --- desc -------------------------------------------------------------------

/** The six numbers, comma-separated, then `=` and the target:
 * `25,50,3,7,8,1=952`. */
export function encodeDesc(dealt: readonly number[], target: number): string {
  return `${dealt.join(",")}=${target}`;
}

function parseDesc(desc: string): DescParse<{ dealt: number[]; target: number }> {
  return readDesc(desc, (r) => {
    const dealt: number[] = [];
    for (let i = 0; i < PLACES; i++) {
      if (i > 0) r.expect(",");
      dealt.push(r.int(1, MAX_NUMBER));
    }
    r.expect("=");
    const target = r.int(1, MAX_TARGET);
    r.end();
    return { dealt, target };
  });
}

export function newState(_p: NumgameParams, desc: string): NumgameState {
  const { dealt, target } = descValue(parseDesc(desc));
  return { target, dealt, slots: dealt.map((value) => ({ value, made: null })) };
}

// --- moves ------------------------------------------------------------------

/** The tile combining the tiles in `from` and `into` with `op` makes, or
 * `null` where that is not a move. */
export function combined(
  slots: readonly (Tile | null)[],
  { from, into, op }: Step,
): Tile | null {
  // A place off the board reads as `undefined`, which is no tile either.
  const x = slots[from] ?? null;
  const y = slots[into] ?? null;
  if (from === into || x === null || y === null) return null;
  const value = combine(x.value, op, y.value);
  if (value === null) return null;
  const a = Math.max(x.value, y.value);
  const b = Math.min(x.value, y.value);
  return { value, made: { a, op, b } };
}

/**
 * The step with its places in the order the board plays them: the result
 * lands in the larger number's place (the lower place between equals), so
 * which number the player picked first changes nothing, and a hint's step is
 * followed whichever way round it is tapped.
 */
export function normalized(slots: readonly (Tile | null)[], step: Step): Step {
  const { from, into, op } = step;
  const x = slots[from]?.value ?? 0;
  const y = slots[into]?.value ?? 0;
  const lands = x > y || (x === y && from < into) ? from : into;
  return lands === into ? step : { from: into, into: from, op };
}

function played(slots: readonly (Tile | null)[], given: Step): (Tile | null)[] {
  // Read from the save, so checked for shape before it is trusted.
  if (
    !Number.isInteger(given.from) ||
    !Number.isInteger(given.into) ||
    !OPS.includes(given.op)
  )
    throw new Error(`numgame: not a combination: ${JSON.stringify(given)}`);
  const step = normalized(slots, given);
  const { from, into, op } = step;
  const tile = combined(slots, step);
  if (tile === null)
    throw new Error(`numgame: ${from} ${op} ${into} is not a combination here`);
  const next = slots.slice();
  next[from] = null;
  next[into] = tile;
  return next;
}

/** A move's board. Pure: `s` is left as it was. */
export function executeMove(s: NumgameState, move: NumgameMove): NumgameState {
  if (move.kind === "combine") {
    return { ...s, slots: played(s.slots, move) };
  } else if (move.kind === "solve") {
    const start = move.restart
      ? s.dealt.map((value) => ({ value, made: null }))
      : s.slots;
    return { ...s, slots: move.steps.reduce(played, start) };
  } else {
    return assertNever(move, "numgame: executeMove");
  }
}

/** Whether a number on the board is the target. */
export function reachesTarget(s: NumgameState): boolean {
  return s.slots.some((t) => t?.value === s.target);
}

// --- text format ------------------------------------------------------------

/** How an operator is written for a reader: the arithmetic signs. */
export const OP_SIGN: Record<Op, string> = { "+": "+", "-": "−", "*": "×", "/": "÷" };

/** A made tile's sum, as the board and the hint write it. */
export function madeText({ a, op, b }: Made): string {
  return `${a} ${OP_SIGN[op]} ${b}`;
}

export function textFormat(s: NumgameState): string {
  const cell = (t: Tile | null) =>
    t === null
      ? "-"
      : t.made === null
        ? String(t.value)
        : `${t.value} (${madeText(t.made)})`;
  const rows: string[] = [];
  for (let i = 0; i < PLACES; i += ROW)
    rows.push(
      s.slots
        .slice(i, i + ROW)
        .map(cell)
        .join("  "),
    );
  return `Target: ${s.target}\n${rows.join("\n")}\n`;
}
