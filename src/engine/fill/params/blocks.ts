import type { ParamConfigItem } from "../../contract/game.ts";
import { isDigit, parseLeadingInt } from "../../game-id/decimal.ts";
import { parseConfigInt } from "../../game-id/params.ts";
import type { ParamsSegment } from "../../game-id/params-codec.ts";
import { type Ruleset, rulesetItem } from "../../game-id/ruleset.ts";
import { type FillParams, sizesOf, variationsOf } from "../game-id.ts";

/**
 * A board sized by its blocks (`play.blocks`): the params give how many
 * blocks it has across, `across`, each that many squares tall, and down,
 * `down`, each that many wide, the grid `across * down` on a side; a board of
 * blocks one square wide deals its blocks instead, the variation `dealtBy`
 * (Solo's Jigsaw, `across` then the order). Written `{across}x{down}`, or
 * `{across}` and `letter` where the blocks are dealt, and a bare number read
 * as that many both ways, as upstream solo.c reads it.
 */
export interface FillBlocks {
  readonly across: string;
  readonly down: string;
  readonly letter: string;
  readonly dealtBy: string;
  readonly columns: {
    readonly kw: string;
    readonly name: string;
    readonly doc: string;
  };
  readonly rows: { readonly kw: string; readonly name: string };
  /** The puzzle with blocks cut, then the one with them dealt. */
  readonly rulesets: readonly [Ruleset, Ruleset];
  readonly bounds: Readonly<
    Record<"across" | "down", { readonly min: number; readonly max: number }>
  >;
}

/** The blocks across and down board `p` has. */
const blocksOn = (b: FillBlocks, p: FillParams): [number, number] => {
  const s = sizesOf(p);
  return [s[b.across] ?? b.bounds.across.min, s[b.down] ?? b.bounds.down.min];
};

/** Sets `p` to `across` blocks by `down`: the sizes, the grid, and the
 * variation that deals the blocks, on where they are one square wide. */
export function setBlocks(
  b: FillBlocks,
  p: FillParams,
  across: number,
  down: number,
): void {
  p.sizes = { ...p.sizes, [b.across]: across, [b.down]: down };
  p.w = p.h = across * down;
  const rest = variationsOf(p).filter((v) => v !== b.dealtBy);
  const now = down === 1 ? [b.dealtBy, ...rest] : rest;
  if (now.length > 0) p.variations = now;
  else delete p.variations;
}

/** The squarest blocks of an `order` grid, `[across, down]` with `across ≤
 * down`, or dealt blocks where the order is prime. */
function squarest(order: number): [number, number] {
  for (let a = Math.floor(Math.sqrt(order)); a >= 2; a--)
    if (order % a === 0) return [a, order / a];
  return [order, 1];
}

/** The Custom dialog's fields of a board sized by its blocks: across, down,
 * and the ruleset, last, since choosing it folds the two (the midend sets
 * fields in order). */
export function blocksItems(b: FillBlocks): ParamConfigItem<FillParams>[] {
  return [
    {
      kw: b.columns.kw,
      name: b.columns.name,
      type: "string",
      doc: b.columns.doc,
      bounds: b.bounds.across,
      label: {
        slot: "size",
        // Dealt blocks have no width and height, so it says its grid's.
        words: (p) => {
          const [a, d] = blocksOn(b, p);
          return d === 1 ? `${a}x${a}` : `${a}x${d}`;
        },
      },
      get: (p) => String(blocksOn(b, p)[0]),
      set: (p, v) => setBlocks(b, p, parseConfigInt(v), blocksOn(b, p)[1]),
    },
    {
      kw: b.rows.kw,
      name: b.rows.name,
      type: "string",
      doc: { with: b.columns.kw },
      bounds: b.bounds.down,
      get: (p) => String(blocksOn(b, p)[1]),
      set: (p, v) => setBlocks(b, p, blocksOn(b, p)[0], parseConfigInt(v)),
    },
    rulesetItem<FillParams>(b.rulesets, {
      get: (p) => (blocksOn(b, p)[1] === 1 ? 1 : 0),
      set: (p, i) => {
        const [a, d] = blocksOn(b, p);
        if (i === 1 && d !== 1) setBlocks(b, p, a * d, 1);
        else if (i === 0 && d === 1) setBlocks(b, p, ...squarest(a));
      },
    }),
  ];
}

/** A board's blocks in the params: `{across}x{down}`, or `{across}` and the
 * letter where they are dealt. Read as upstream solo.c reads them: a bare
 * number is that many both ways, and the letter after `{a}x{d}` makes a
 * board of dealt blocks of the order `a * d`. */
export function blocksSegment(b: FillBlocks): ParamsSegment<FillParams> {
  return {
    encode: (p) => {
      const [a, d] = blocksOn(b, p);
      return d === 1 ? `${a}${b.letter}` : `${a}x${d}`;
    },
    decode: (s, i, p) => {
      const first = parseLeadingInt(s, i);
      let [a, d] = [first.value, first.value];
      let at = first.next;
      let seenDown = false;
      if (s[at] === "x" && isDigit(s[at + 1] ?? "")) {
        const down = parseLeadingInt(s, at + 1);
        d = down.value;
        at = down.next;
        seenDown = true;
      }
      if (s[at] === b.letter) {
        at++;
        if (seenDown) a *= d;
        d = 1;
      }
      setBlocks(b, p, a, d);
      return at;
    },
  };
}

/** Why board `p`'s blocks cannot be, or `null`. */
export function blocksRefusal(b: FillBlocks, p: FillParams): string | null {
  const [a, d] = blocksOn(b, p);
  const { across, down } = b.bounds;
  if (a < across.min || a > across.max)
    return `${b.columns.name} must be between ${across.min} and ${across.max}.`;
  if (d < down.min || d > down.max)
    return `${b.rows.name} must be between ${down.min} and ${down.max}.`;
  return null;
}
