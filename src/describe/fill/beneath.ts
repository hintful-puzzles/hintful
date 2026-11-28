/**
 * What a board draws beneath it, from the description's `play:`: a row of
 * counts (`counts`), a list (`list`, and typing along its sites, `along`),
 * or the band of every value (`band`). Each is refused where the board
 * cannot draw or play it, and the list's strike is compiled.
 */

import { compileExpr } from "../compile-expr.ts";
import {
  CompileError,
  type Env,
  elem,
  expect,
  Out,
  type Val,
} from "../compile-sorts.ts";
import {
  type Description,
  type DescriptionJson,
  type PlayJson,
  tallyKindOf,
} from "../description.ts";
import type { Expr } from "../expr.ts";
import { answerEnv, param } from "./emit.ts";

/** Refuses what the board would draw beneath it and cannot: counts, typing
 * along a list, a band. */
export function checkBeneath(
  json: DescriptionJson,
  d: Description,
  measured: (e: Expr) => Expr,
): void {
  const p = json.play as PlayJson;
  checkCounts(json, d, measured);
  checkAlong(p);
  checkBand(p);
}

/** Refuses `play.counts` that name no clue at the board the deal derives,
 * or whose records are not keyed by a field alone, before their count, of
 * values the player places; and a style of counts with no row to read. */
function checkCounts(
  json: DescriptionJson,
  d: Description,
  measured: (e: Expr) => Expr,
): void {
  const p = json.play as PlayJson;
  if (p.countStyle !== undefined && Object.keys(p.counts ?? {}).length === 0)
    throw new CompileError("play countStyle: no row of counts to read");
  for (const [k, field] of Object.entries(p.counts ?? {})) {
    const c = d.clueKinds.get(k);
    const fields = [...(c?.fields.keys() ?? [])];
    if (c?.at !== "board" || k === tallyKindOf(json))
      throw new CompileError(
        `play counts: ${k} is no clue at the board the deal derives`,
      );
    if (fields.length !== 2 || fields[0] !== field)
      throw new CompileError(
        `play counts: ${k}'s records are keyed by ${field} alone, before their count`,
      );
    const range = measured((c.fields.get(field) as { value: Expr }).value);
    const [lo, hi] = range.k === "call" && range.fn === "range" ? range.args : [];
    const placed = (n: number): boolean =>
      p.numbers !== undefined || p.values?.[String(n)] !== undefined;
    if (
      lo?.k !== "num" ||
      hi?.k !== "num" ||
      !Array.from({ length: hi.v - lo.v + 1 }, (_, i) => lo.v + i).every(placed)
    )
      throw new CompileError(
        `play counts: ${k}'s ${field} is a range of values the player places`,
      );
  }
}

/** Refuses typing along a list's sites (`along`) on a board that is not one
 * of numbers with a list, or whose drag selects several squares, which a
 * value typed fills at once. */
function checkAlong(p: PlayJson): void {
  if (p.along === undefined) return;
  if (p.numbers === undefined || p.list === undefined)
    throw new CompileError(
      "play along: typing goes along a list's sites on a board of numbers, and play has no `numbers` or no `list`",
    );
  if (p.select !== undefined)
    throw new CompileError("play along: a selection is typed into at once");
}

/** Refuses the band of every value (`band`) on a board not of numbers,
 * whose values have no glyph to write, or beside a list or a row of counts,
 * which are drawn where it is. */
function checkBand(p: PlayJson): void {
  if (p.band === undefined) return;
  if (p.numbers === undefined)
    throw new CompileError(
      "play band: a band writes each value's glyph, and play has no `numbers`",
    );
  if (p.list !== undefined || p.counts !== undefined)
    throw new CompileError(
      "play band: the band is drawn beneath the board, where a `list` or `counts` is",
    );
}

/**
 * `recordHolds(g, sp, cl, k)`: whether record `k` of the clue at the board
 * `play.list` draws holds of the values `g`, its meaning read of the board
 * as placed, for the list's strike. Nothing where there is no list; one
 * naming no clue at the board the deal derives, or whose records hold no
 * list, is refused.
 */
export function recordHoldsOf(
  json: DescriptionJson,
  d: Description,
  env: Env,
  measured: (e: Expr) => Expr,
): string[] {
  const kind = json.play?.list;
  if (kind === undefined) return [];
  const c = d.clueKinds.get(kind);
  if (c?.at !== "board" || kind === tallyKindOf(json))
    throw new CompileError(
      `play list: ${kind} is no clue at the board the deal derives`,
    );
  const fields = [...c.fields.values()];
  if (fields.length !== 1 || !fields[0].list || fields[0].at !== null)
    throw new CompileError(`play list: ${kind}'s records are one list of numbers each`);
  const scratch: string[] = [];
  const out = new Out(1);
  const v = compileExpr(
    measured(c.means),
    new Map<string, Val>([["k", { code: "k", sort: elem(`clue ${kind}`) }]]),
    answerEnv(env, { yes: false }, scratch),
    out,
  );
  expect(v, "bool", `play list ${kind}`);
  const body = [...scratch.map((s) => `  ${s}`), ...out.text(), `  return ${v.code};`];
  return [
    "",
    `/** Whether ${kind} record \`k\` holds of the values \`g\`, as placed (\`play.list\`). */`,
    `export function recordHolds(${[
      "g: ArrayLike<number>",
      param("sp", "GridSpace", body),
      param("cl", "Dealt", body),
      "k: number",
    ].join(", ")}): boolean {`,
    ...body,
    "}",
  ];
}
