/**
 * A fill game's game ID, from its description: the params, `WxH` and
 * `d<letter>`, and the desc, the clues by the segments `id:` lists, after
 * cspuz's serializer combinators. Tents' `id:` keeps upstream's grammar byte
 * for byte, so its IDs and shared links do not change
 * (`openspec/changes/a-game-from-its-description-alone`, design.md § 8).
 */

import type { DescParse } from "../contract/desc-error.ts";
import { DESC_TOO_LONG } from "../contract/desc-error.ts";
import { difficultyItem } from "../contract/difficulty.ts";
import type { ParamConfigItem } from "../contract/game.ts";
import { readDesc } from "../game-id/desc-reader.ts";
import { dimensionParamConfig } from "../game-id/params.ts";
import { choice, dims, paramsCodec } from "../game-id/params-codec.ts";
import { type ClueList, clueList, type GridSpace } from "../solve/describe-runtime.ts";
import type { Sample } from "./sample.ts";

/** A segment of the desc: where a one-valued clue kind sits, as upstream's
 * run code, or a kind's values, the first after `before` and the rest after
 * commas, in the space's order or the columns first. */
export type IdSegment =
  | { readonly runs: string }
  | { readonly numbers: string; readonly before?: string; readonly order?: "columns" };

/** What a compiled fill module says of its deal (`deal`). */
export interface FillDeal {
  readonly sample: Sample | null;
  readonly id: readonly IdSegment[];
  /** Where each clue kind sits. */
  readonly universes: Readonly<Record<string, "cells" | "lines">>;
  readonly tierLetters: string;
  readonly sizes: Readonly<
    Record<string, { readonly min: number; readonly max?: number }>
  >;
}

export interface FillParams {
  w: number;
  h: number;
  diff: number;
}

/** A board's clues, by kind. */
type Clues<C> = { readonly [K in keyof C]: ClueList };

/** Each clue kind's largest value at an element (`clueMax`). */
export type ClueMax<C> = {
  readonly [K in keyof C]: (sp: GridSpace, at: number) => number;
};

/** The params' custom form and codec: the size within the description's
 * `sizes`, and the tier by its letter, which only a full ID carries. */
export function fillParams(
  deal: FillDeal,
  tiers: readonly string[],
  defaults: () => FillParams,
): {
  paramConfig: ParamConfigItem<FillParams>[];
  encodeParams(p: FillParams, full: boolean): string;
  decodeParams(s: string): FillParams;
} {
  const w = deal.sizes["w"];
  const paramConfig: ParamConfigItem<FillParams>[] = [
    ...dimensionParamConfig<FillParams>({
      doc: "Size of the grid in squares.",
      ...(w === undefined
        ? {}
        : { bounds: { min: w.min, ...(w.max === undefined ? {} : { max: w.max }) } }),
    }),
    difficultyItem(tiers, "diff"),
  ];
  return {
    paramConfig,
    ...paramsCodec(defaults, [
      dims(paramConfig),
      choice(paramConfig, "d", "difficulty", deal.tierLetters, { full: true }),
    ]),
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
      const kind = seg.numbers as keyof C;
      const universe = universeOf(deal, seg.numbers);
      const at: number[] = [];
      const v: number[] = [];
      elements(sp, universe, seg.order).forEach((e, i) => {
        if (i === 0) {
          if (seg.before !== undefined) r.expect(seg.before);
        } else r.expect(",");
        // An absent clue is written as nothing.
        if (!r.peekIs((ch) => ch >= "0" && ch <= "9")) return;
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
