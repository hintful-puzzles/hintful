/**
 * A fill game's game ID, from its description: the params, `WxH` and
 * `d<letter>`, and the desc, the clues by the segments `id:` lists, after
 * cspuz's serializer combinators. Tents' `id:` keeps upstream's grammar byte
 * for byte, so its IDs and shared links do not change
 * (`openspec/changes/a-game-from-its-description-alone`, design.md § 8).
 */

import type { DescParse } from "../contract/desc-error.ts";
import { DESC_OUT_OF_RANGE, DESC_TOO_LONG } from "../contract/desc-error.ts";
import { difficultyItem } from "../contract/difficulty.ts";
import type { ParamConfigItem } from "../contract/game.ts";
import { isDigit } from "../game-id/decimal.ts";
import { readDesc } from "../game-id/desc-reader.ts";
import { readDotRuns, writeDotRuns } from "../game-id/dot-runs.ts";
import { modifierItem } from "../game-id/modifier.ts";
import { dimensionParamConfig } from "../game-id/params.ts";
import { choice, dims, flag, num, paramsCodec } from "../game-id/params-codec.ts";
import { encodeRunLength } from "../game-id/run-length.ts";
import { type ClueList, clueList, type GridSpace } from "../solve/describe-runtime.ts";
import type { Sample } from "./sample.ts";

/** A segment of the desc: where a one-valued clue kind sits, as upstream's
 * run code; a two-valued kind at cells as upstream's dot runs, its value the
 * letter's case (`cases`, lowercase then uppercase); or a kind's values, the
 * first after `before` and the rest after commas, in the space's order or
 * the columns first. */
export type IdSegment =
  | { readonly runs: string }
  | { readonly dots: string; readonly cases: readonly [number, number] }
  | { readonly digits: string }
  | { readonly numbers: string; readonly before?: string; readonly order?: "columns" };

/** A deal setting the player may turn off (`deal.thorough`): on, the hide
 * tries every clue; off, as many as the board's shorter side. A menu board
 * and a new size have it on where they are narrower than `offFrom`. */
export interface FillThorough {
  readonly letter: string;
  readonly kw: string;
  readonly name: string;
  readonly doc: string;
  readonly offFrom: number;
}

/** What a compiled fill module says of its deal (`deal`). */
export interface FillDeal {
  readonly sample: Sample | null;
  /** The clue kind the deal hides while the board still finishes. */
  readonly hide?: string;
  readonly thorough?: FillThorough;
  readonly id: readonly IdSegment[];
  /** Where each clue kind sits. */
  readonly universes: Readonly<Record<string, "cells" | "lines">>;
  readonly tierLetters: string;
  readonly sizes: Readonly<
    Record<
      string,
      { readonly min: number; readonly max?: number; readonly step?: number }
    >
  >;
}

/** A variation the player may switch on (`play.modifiers`). */
export interface FillModifier {
  readonly letter: string;
  readonly kw: string;
  readonly name: string;
  readonly words: string;
  readonly rule: string;
  readonly note?: string;
  /** The most lines a board 2i squares across may have the other way. */
  readonly most?: readonly number[];
}

export interface FillParams {
  w: number;
  h: number;
  diff: number;
  /** The variations on, by name, in the modifiers' order; absent where none
   * is, as on every board of a game with none. */
  variations?: readonly string[];
  /** Whether the deal hides thoroughly, in a game whose deal has the
   * setting; absent in any other. */
  thorough?: boolean;
}

/** The variations `p` has on. */
export const variationsOf = (p: FillParams): readonly string[] => p.variations ?? [];

/** The setting's default for a board `w` squares wide. */
const thoroughBy = (t: FillThorough, w: number): boolean => w < t.offFrom;

/** `p` with the deal's setting at its default for its size, where the deal
 * has one. */
export const withThorough = (deal: FillDeal, p: FillParams): FillParams =>
  deal.thorough === undefined ? p : { ...p, thorough: thoroughBy(deal.thorough, p.w) };

/** A board's clues, by kind. */
type Clues<C> = { readonly [K in keyof C]: ClueList };

/** Each clue kind's largest value at an element (`clueMax`). */
export type ClueMax<C> = {
  readonly [K in keyof C]: (sp: GridSpace, at: number) => number;
};

/**
 * The params' custom form and codec: the size within the description's
 * `sizes`, each modifier by its letter, and the tier by its letter, which
 * only a full ID carries; and what the form's bounds cannot say, a size off
 * its step or past a modifier's `most`.
 */
export function fillParams(
  deal: FillDeal,
  tiers: readonly string[],
  defaults: () => FillParams,
  modifiers: Readonly<Record<string, FillModifier>> = {},
): {
  paramConfig: ParamConfigItem<FillParams>[];
  encodeParams(p: FillParams, full: boolean): string;
  decodeParams(s: string): FillParams;
  validateParams(p: FillParams): string | null;
} {
  const w = deal.sizes["w"];
  const step = w?.step;
  const named = Object.entries(modifiers);
  const paramConfig: ParamConfigItem<FillParams>[] = [
    ...dimensionParamConfig<FillParams>({
      doc: `Size of the grid in squares.${step === 2 ? " Both must be even." : ""}`,
      ...(w === undefined
        ? {}
        : { bounds: { min: w.min, ...(w.max === undefined ? {} : { max: w.max }) } }),
    }),
    difficultyItem(tiers, "diff"),
    ...named.map(([variation, m]) =>
      modifierItem<FillParams>({
        kw: m.kw,
        name: m.name,
        type: "boolean",
        when: true,
        words: m.words,
        slot: "tail",
        rule: m.rule,
        ...(m.note === undefined ? {} : { note: m.note }),
        get: (p) => variationsOf(p).includes(variation),
        // In the modifiers' order, whichever is set first, and absent where
        // none is on.
        set: (p, on) => {
          const now = named
            .map(([n]) => n)
            .filter((n) => (n === variation ? on : variationsOf(p).includes(n)));
          if (now.length > 0) p.variations = now;
          else delete p.variations;
        },
      }),
    ),
  ];
  const { thorough } = deal;
  if (thorough !== undefined)
    paramConfig.push({
      kw: thorough.kw,
      name: thorough.name,
      type: "boolean",
      doc: thorough.doc,
      // Named where it is not the size's default.
      label: {
        slot: "tail",
        words: (p) =>
          p.thorough === thoroughBy(thorough, p.w)
            ? null
            : `${p.thorough ? "slower" : "faster"} generation`,
      },
      get: (p) => p.thorough ?? thoroughBy(thorough, p.w),
      set: (p, v) => {
        p.thorough = v;
      },
    });
  return {
    paramConfig,
    ...paramsCodec(defaults, [
      dims(paramConfig),
      ...named.map(([, m]) => flag(paramConfig, m.letter, m.kw)),
      // A deal setting, which only a full ID carries, and only where it is
      // off: absent, it is on whatever the size, as upstream reads it, so an
      // upstream ID deals as it did there.
      ...(thorough === undefined
        ? []
        : [
            num(
              paramConfig,
              thorough.letter,
              {
                get: (p) => (p.thorough ? 1 : 0),
                set: (p, v) => {
                  p.thorough = v !== 0;
                },
              },
              {
                full: true,
                omitWhen: (p) => p.thorough !== false,
                whenAbsent: (p) => {
                  p.thorough = true;
                },
              },
            ),
          ]),
      choice(paramConfig, "d", "difficulty", deal.tierLetters, { full: true }),
    ]),
    validateParams(p) {
      if (step !== undefined && (p.w % step !== 0 || p.h % step !== 0))
        return step === 2
          ? "Width and height must both be even."
          : `Width and height must both be multiples of ${step}.`;
      for (const [variation, m] of named) {
        const { most } = m;
        if (most === undefined || !variationsOf(p).includes(variation)) continue;
        for (const [across, along, side, other] of [
          [p.w, p.h, "wide", "high"],
          [p.h, p.w, "high", "wide"],
        ] as const) {
          const bound = most[across / 2];
          if (bound !== undefined && along > bound)
            return `${m.name}: a grid ${across} ${side} can be at most ${bound} ${other}.`;
        }
      }
      return null;
    },
  };
}

/** The elements a kind sits at, in the order a segment writes them: a cell's
 * kind by rows or by columns, a line's kind the rows then the columns, or
 * the columns first. */
function elements(
  sp: GridSpace,
  universe: "cells" | "lines",
  order?: "columns",
): readonly number[] {
  const { w, h } = sp;
  if (order !== "columns") return sp[universe];
  if (universe === "lines") return [...sp.lines.slice(h), ...sp.lines.slice(0, h)];
  const out: number[] = [];
  for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) out.push(y * w + x);
  return out;
}

function universeOf(deal: FillDeal, kind: string): "cells" | "lines" {
  const u = deal.universes[kind];
  if (u === undefined) throw new Error(`id: no clue kind ${kind}`);
  return u;
}

/** The desc of the clues `dealt`, by the deal's `id`. */
export function encodeDesc<C extends Clues<C>>(
  deal: FillDeal,
  sp: GridSpace,
  dealt: C,
): string {
  let out = "";
  for (const seg of deal.id) {
    if ("runs" in seg) {
      // `_` a clue with no gap before it, `a` to `y` one after a gap of 1 to
      // 25, `z` 25 empty cells with more to come, and a last clue past the
      // end.
      const list = dealt[seg.runs as keyof C];
      const n = sp.cells.length;
      let gap = 0;
      for (let c = 0; c <= n; c++) {
        if (c === n || list.byAt[c] >= 0) {
          out += gap === 0 ? "_" : String.fromCharCode(96 + gap);
          gap = 0;
          continue;
        }
        gap++;
        if (gap > 25) {
          out += "z";
          gap -= 25;
        }
      }
      continue;
    }
    if ("digits" in seg) {
      const list = dealt[seg.digits as keyof C];
      out += encodeRunLength(
        sp.cells.length,
        (c) => (list.valueAt[c] >= 0 ? String(list.valueAt[c]) : null),
        { keepTrailingBlanks: true },
      );
      continue;
    }
    if ("dots" in seg) {
      const list = dealt[seg.dots as keyof C];
      const [lower, upper] = seg.cases;
      out += writeDotRuns(sp.cells.length, (c) => {
        const v = list.valueAt[c];
        return v === upper ? 1 : v === lower ? 0 : null;
      });
      continue;
    }
    const list = dealt[seg.numbers as keyof C];
    elements(sp, universeOf(deal, seg.numbers), seg.order).forEach((e, i) => {
      out += i === 0 ? (seg.before ?? "") : ",";
      const v = list.valueAt[e];
      if (v >= 0) out += String(v);
    });
  }
  return out;
}

const isRunChar = (ch: string): boolean => ch === "_" || (ch >= "a" && ch <= "z");

/** The clues `desc` deals, each number read within its kind's largest value
 * at its element. */
export function decodeDesc<C extends Clues<C>>(
  deal: FillDeal,
  sp: GridSpace,
  clueMax: ClueMax<C>,
  desc: string,
): DescParse<C> {
  return readDesc(desc, (r) => {
    const out: Partial<Record<keyof C, ClueList>> = {};
    for (const seg of deal.id) {
      if ("runs" in seg) {
        const n = sp.cells.length;
        const at: number[] = [];
        let pos = 0;
        for (;;) {
          const ch = r.char(isRunChar);
          if (ch === "z") {
            // `z` is written only with empty cells still to follow it.
            pos += 25;
            if (pos >= n) r.fail(DESC_TOO_LONG);
            continue;
          }
          pos += ch === "_" ? 0 : ch.charCodeAt(0) - 96;
          if (pos > n) r.fail(DESC_TOO_LONG);
          if (pos === n) break;
          at.push(pos++);
        }
        out[seg.runs as keyof C] = clueList(
          at,
          at.map(() => 0),
          n,
        );
        continue;
      }
      if ("digits" in seg) {
        // A digit is one cell's clue, a letter a run of 1 to 26 without one;
        // the last run is written, so the cells end with the segment.
        const kind = seg.digits as keyof C;
        const n = sp.cells.length;
        const at: number[] = [];
        const v: number[] = [];
        for (let pos = 0; pos < n; ) {
          const ch = r.char((x) => isDigit(x) || (x >= "a" && x <= "z"));
          if (!isDigit(ch)) {
            pos += ch.charCodeAt(0) - 96;
            if (pos > n) r.fail(DESC_TOO_LONG);
            continue;
          }
          const value = Number(ch);
          if (value > clueMax[kind](sp, pos)) r.fail(DESC_OUT_OF_RANGE);
          at.push(pos++);
          v.push(value);
        }
        out[kind] = clueList(at, v, n);
        continue;
      }
      if ("dots" in seg) {
        const at: number[] = [];
        const v: number[] = [];
        readDotRuns(r, sp.cells.length, (c, kind) => {
          at.push(c);
          v.push(seg.cases[kind]);
        });
        out[seg.dots as keyof C] = clueList(at, v, sp.cells.length);
        continue;
      }
      const kind = seg.numbers as keyof C;
      const universe = universeOf(deal, seg.numbers);
      const at: number[] = [];
      const v: number[] = [];
      elements(sp, universe, seg.order).forEach((e, i) => {
        if (i === 0) {
          if (seg.before !== undefined) r.expect(seg.before);
        } else r.expect(",");
        // An absent clue is written as nothing.
        if (!r.peekIs(isDigit)) return;
        at.push(e);
        v.push(r.int(0, clueMax[kind](sp, e)));
      });
      // The elements in the space's order, as a list is held.
      const byAt = at.map((e, k) => [e, v[k]] as const).sort((a, b) => a[0] - b[0]);
      out[kind] = clueList(
        byAt.map(([e]) => e),
        byAt.map(([, x]) => x),
        sp[universe].length,
      );
    }
    r.end();
    // The compiler holds `id` to naming every kind once.
    return out as C;
  });
}
