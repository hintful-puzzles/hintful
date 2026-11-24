/**
 * Where a fill game's clues sit, as the compiler reads them: the elements
 * each kind's clues are dealt at (`engine/fill/game-id.ts`'s `Universe`),
 * and how the clues at each place are drawn, at a corner and a part with a
 * sign (`engine/fill/corners.ts`), at an edge in its gap
 * (`engine/fill/gaps.ts`), and at a line or a slot in the margins
 * (`engine/fill/slots.ts`).
 */

import { EDGE_PAINTERS } from "../../engine/render/pieces/edge.ts";
import { type ClueKind, CompileError, type Env } from "../compile-sorts.ts";
import {
  type Description,
  type DescriptionJson,
  type PlayJson,
  tallyKindOf,
} from "../description.ts";
import { isElement, valuesOf } from "./values.ts";

/** The elements a clue may sit at, as the description names them. */
export const UNIVERSE: Readonly<Partial<Record<string, string>>> = {
  cell: "cells",
  line: "lines",
  edge: "edges",
  slot: "slots",
  corner: "corners",
};

/** The elements each kind the deal deals sits at, by kind: a clue a fill
 * game deals sits at a cell, a line, a slot beyond a line's end, an edge, a
 * corner or a dealt partition's part; the tally, the params' clue at the
 * board, is none it deals. */
export function universesOf(
  json: DescriptionJson,
  d: Description,
  env: Env,
): Record<string, string> {
  return Object.fromEntries(
    [...d.clueKinds]
      .filter(([k]) => k !== tallyKindOf(json))
      .map(([k, c]) => {
        const u = env.regions.has(c.at) ? "parts" : UNIVERSE[c.at];
        if (u === undefined)
          throw new CompileError(
            `clue ${k}: a fill game's clue sits at a cell, a line, a slot, an edge, a corner or a part`,
          );
        return [k, u];
      }),
  );
}

/** The deal's `partsOf`, the partition each kind at parts sits at, where
 * any kind does. */
export function partsOfKinds(
  d: Description,
  universes: Record<string, string>,
): { partsOf?: Record<string, string> } {
  const partsOf = Object.fromEntries(
    [...d.clueKinds]
      .filter(([k]) => universes[k] === "parts")
      .map(([k, c]) => [k, c.at]),
  );
  return Object.keys(partsOf).length === 0 ? {} : { partsOf };
}

/**
 * Refuses `play.signs` that leave a clue undrawn or name one not drawn with
 * a sign. A clue at a part is drawn at its first cell, with its sign where
 * it has one (Solo's Killer totals have none), on a board of numbers, whose
 * cells hold no number of their own; one at a corner on a disc where its
 * cells meet, with its sign. A list is a word a value, from the least, of a
 * range the sizes do not move.
 */
export function checkSigns(p: PlayJson, d: Description, env: Env): void {
  const signed = (at: string): boolean => env.regions.has(at) || at === "corner";
  for (const [k, c] of d.clueKinds) {
    if (env.regions.has(c.at) && p.numbers === undefined)
      throw new CompileError(`clue ${k}: a clue at a part, on a board of buttons`);
    if (c.at === "corner" && p.signs?.[k] === undefined)
      throw new CompileError(
        `clue ${k}: a clue at a corner, and no sign in play signs`,
      );
  }
  for (const [k, sign] of Object.entries(p.signs ?? {})) {
    if (!signed(d.clueKinds.get(k)?.at ?? ""))
      throw new CompileError(`play signs: ${k} is no clue kind at a part or a corner`);
    if (p.numbers === undefined)
      throw new CompileError(
        "play signs: a clue drawn with a sign on a board of buttons",
      );
    if (typeof sign === "string") continue;
    const [lo, hi] = valuesOf(d, k) ?? [0, -1];
    if (sign.length !== hi - lo + 1)
      throw new CompileError(
        `play signs: ${k}'s words, a value each, and its values are not ${sign.length} fixed numbers`,
      );
  }
}

/** Refuses a clue at an edge with no painter in `play.gaps`, which draws
 * it in the gap between its cells and only there, and a painter of a clue
 * valued otherwise than it draws. */
export function checkGaps(p: PlayJson, d: Description, env: Env): void {
  for (const [k, c] of d.clueKinds)
    if (c.at === "edge" && p.gaps?.[k] === undefined)
      throw new CompileError(
        `clue ${k}: a clue at an edge, and no painter in play gaps`,
      );
  for (const [k, painter] of Object.entries(p.gaps ?? {})) {
    if (d.clueKinds.get(k)?.at !== "edge")
      throw new CompileError(`play gaps: ${k} is no clue kind at an edge`);
    if (!(painter in EDGE_PAINTERS))
      throw new CompileError(`play gaps: no edge painter ${painter}`);
    const of = EDGE_PAINTERS[painter as keyof typeof EDGE_PAINTERS].of;
    if ((of === "end") !== isElement(env, k))
      throw new CompileError(
        `play gaps: ${painter} draws a clue valued ${of === "end" ? "one of its ends" : "a number"}, and ${k} is not`,
      );
  }
}

/** `lineClues`, `slotClues` and `lineLists`, the kinds drawn in the
 * margins. A clue at a slot is refused beside a line's, which the same
 * margins draw. */
export function marginsOf(d: Description, env: Env): string[] {
  const atLines = [...d.clueKinds].filter(([, c]) => c.at === "line").map(([k]) => k);
  const isList = (k: string) => (env.clues.get(k) as ClueKind).list;
  const lineClues = atLines.filter((k) => !isList(k));
  const lineLists = atLines.filter(isList);
  const slotClues = [...d.clueKinds].filter(([, c]) => c.at === "slot").map(([k]) => k);
  if (slotClues.length > 0 && (lineClues.length > 0 || lineLists.length > 0))
    throw new CompileError(
      `clue ${slotClues[0]}: a clue at a slot is drawn in the margins, where a line's clue is`,
    );
  return [
    "",
    "/** The clue kinds at lines, drawn past each line's end. */",
    `export const lineClues = ${JSON.stringify(lineClues)} as const;`,
    ...(slotClues.length === 0
      ? []
      : [
          "",
          "/** The clue kinds at slots, each drawn in the margin beyond its line's end. */",
          `export const slotClues = ${JSON.stringify(slotClues)} as const;`,
        ]),
    ...(lineLists.length === 0
      ? []
      : [
          "",
          "/** The list kinds at lines, each list drawn stacked before its line's start. */",
          `export const lineLists = ${JSON.stringify(lineLists)} as const;`,
        ]),
  ];
}
