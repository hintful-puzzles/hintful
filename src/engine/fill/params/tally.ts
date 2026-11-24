import { noSuchTier } from "../../contract/difficulty.ts";
import type { ParamConfigItem } from "../../contract/game.ts";
import { isDigit, parseLeadingInt } from "../../game-id/decimal.ts";
import { parseConfigInt, unreadParams } from "../../game-id/params.ts";
import type { FillDeal, FillParams } from "../game-id.ts";
import type {
  SettingBase,
  SettingContext,
  SettingField,
  SettingKind,
} from "./setting.ts";

/**
 * A board clue of two fields the params give, its id the clue's kind: for
 * each length from 1 to the size, the count of pieces of it (Boats' fleet).
 * The size is written by its letter (`f3`), and the counts after a comma at
 * the params' end (`,3,2,1`); absent, a size of `size.default` and a count of
 * each length one more than the next's, from one of the longest.
 */
export interface TallySetting extends SettingBase {
  readonly kind: "tally";
  readonly letter: string;
  /** The clue's fields: each length, and the count of pieces of it. */
  readonly index: string;
  readonly count: string;
  readonly size: SettingField & {
    readonly min: number;
    readonly max: number;
    readonly default: number;
  };
  readonly counts: SettingField;
  /** The tier a tally of one piece is dealt at alone, by its index. */
  readonly single?: number;
}

/** Each length's count of a tally of `size`, where the params name none:
 * one of the longest, and one more of each shorter. */
const tallyDefault = (size: number): number[] =>
  Array.from({ length: size }, (_, i) => size - i);

/** The tally `p` gives, its default where `p` names none. */
export const tallyOf = (
  t: TallySetting,
  p: Pick<FillParams, "tally">,
): readonly number[] => p.tally ?? tallyDefault(t.size.default);

/** The deal's tally, or `null`. */
export const tallyIn = (deal: FillDeal): TallySetting | null =>
  deal.settings.find((s): s is TallySetting => s.kind === "tally") ?? null;

/** The board clue the tally of `p` is: each length and its count. */
export const tallyClue = (
  t: TallySetting,
  p: FillParams,
): Readonly<Record<string, number | readonly number[]>> => {
  const counts = tallyOf(t, p);
  return {
    n: counts.length,
    [t.index]: counts.map((_, i) => i + 1),
    [t.count]: counts,
  };
};

/** The count of the tally's pieces of each length on a board of `p`. */
export const piecesOf = (deal: FillDeal, p: FillParams): readonly number[] => {
  const t = tallyIn(deal);
  if (t === null) throw new Error("deal: pieces, and no tally");
  return tallyOf(t, p);
};

/** Counts read from `s` for a tally of `size`: numbers apart by anything
 * else, 0 for each the text runs out before (upstream boats.c). */
function readCounts(s: string, size: number): number[] {
  const nums = [...s.matchAll(/\d+/g)].map((m) => Number(m[0]));
  return Array.from({ length: size }, (_, i) => nums[i] ?? 0);
}

/** Why board `p` cannot have tally `t` as it is: a size past its range or
 * the board's, no piece, or one piece at a tier it has no boards at. */
export function tallyRefusal(
  t: TallySetting,
  p: FillParams,
  full: boolean,
  cx: SettingContext,
): string | null {
  const counts = tallyOf(t, p);
  const size = counts.length;
  const name = t.size.name;
  if (size < t.size.min || size > t.size.max)
    return `${name} must be between ${t.size.min} and ${t.size.max}.`;
  if (size > p.w && size > p.h)
    return `${name} must be smaller than the width and height.`;
  const pieces = counts.reduce((a, b) => a + b, 0);
  if (pieces === 0) return `The ${t.id} must contain at least 1 piece.`;
  if (full && pieces === 1 && t.single !== undefined && p.diff !== t.single)
    return noSuchTier(`puzzle with one piece in its ${t.id}`, cx.tiers[p.diff]);
  return null;
}

export const tally: SettingKind<TallySetting> = {
  // Its size, and its counts, blank where they are the size's default.
  items(t) {
    const counts = (p: FillParams): string => {
      const c = tallyOf(t, p);
      const def = tallyDefault(c.length);
      return c.every((n, i) => n === def[i]) ? "" : c.join(",");
    };
    const size: ParamConfigItem<FillParams> = {
      kw: t.size.kw,
      name: t.size.name,
      type: "string",
      doc: t.size.doc,
      bounds: { min: t.size.min, max: t.size.max },
      label: { slot: "tail", words: (p) => `size ${tallyOf(t, p).length}` },
      get: (p) => String(tallyOf(t, p).length),
      // A new size takes its default counts, as upstream's dialog does.
      set: (p, v) => {
        p.tally = tallyDefault(parseConfigInt(v));
      },
    };
    return [
      size,
      {
        kw: t.counts.kw,
        name: t.counts.name,
        type: "string",
        doc: t.counts.doc,
        label: {
          slot: "tail",
          words: (p) => (counts(p) === "" ? null : `${t.id} ${counts(p)}`),
        },
        get: counts,
        set: (p, v) => {
          const n = tallyOf(t, p).length;
          p.tally = v === "" ? tallyDefault(n) : readCounts(v, n);
        },
      },
    ];
  },
  // The size by its letter, absent the default size; the counts after a
  // comma, last in the params and always written, absent the size's default.
  segments(t) {
    return {
      here: [
        {
          encode: (p) => `${t.letter}${tallyOf(t, p).length}`,
          decode: (s, i, p) => {
            if (s[i] !== t.letter) {
              p.tally = tallyDefault(t.size.default);
              return i;
            }
            const parsed = parseLeadingInt(s, i + 1);
            p.tally = tallyDefault(parsed.value);
            return parsed.next;
          },
        },
      ],
      last: {
        encode: (p) => `,${tallyOf(t, p).join(",")}`,
        decode: (s, i, p) => {
          if (s[i] !== ",") return i;
          for (let j = i; j < s.length; j++)
            if (s[j] !== "," && !isDigit(s[j])) unreadParams(s, j);
          p.tally = readCounts(s.slice(i), tallyOf(t, p).length);
          return s.length;
        },
      },
    };
  },
  start(t, p, board) {
    p.tally = tallyDefault(board.tally ?? t.size.default);
  },
};
