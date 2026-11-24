/**
 * The clue kinds a fill game writes as a number on their cell
 * (`engine/fill/numbers.ts`), with the cells each one's meaning reads.
 */

import { compileExpr } from "../compile-expr.ts";
import {
  type ClueKind,
  CompileError,
  type Env,
  Out,
  type Val,
} from "../compile-sorts.ts";
import { freeNames } from "../compile-terms.ts";
import type { Description, DescriptionJson } from "../description.ts";
import type { Expr } from "../expr.ts";
import { children } from "../expr.ts";
import { answerEnv, param } from "./emit.ts";

/**
 * `numbers`, the clue kinds a fill game writes as a number on their cell:
 * each at a cell, of more than one value, and not the kind the board is
 * dealt holding (`play.dealt`, drawn as its value) or the kind that gives a
 * cell's piece its shape (`play.shape`, drawn as the piece); and `clueCells`, the
 * cells each one's meaning reads, the sets its `means` ranges over with `at`
 * its cell. The engine draws a number's cells as its block, judges it done
 * where they are all decided, and searches the cells of the number with
 * fewest open. A number whose meaning ranges over no set, or over one its
 * own binders choose, is refused.
 */
export function numbersOf(
  json: DescriptionJson,
  d: Description,
  env: Env,
  measured: (e: Expr) => Expr,
): string[] {
  if (json.play === undefined) return [];
  const oneValued = (value: Expr | null): boolean => {
    const [lo, hi] = value?.k === "call" ? value.args : [];
    return lo?.k === "num" && hi?.k === "num" && lo.v === hi.v;
  };
  const shape = json.play.shape;
  if (shape !== undefined && d.clueKinds.get(shape)?.at !== "cell")
    throw new CompileError(`play shape: ${shape} is no clue kind at a cell`);
  const numbers = [...d.clueKinds].filter(
    ([kind, c]) =>
      c.at === "cell" &&
      kind !== json.play?.dealt &&
      kind !== shape &&
      !oneValued(c.value),
  );
  if (numbers.length === 0) return [];
  const plain = json.play.plain ?? [];
  for (const kind of plain)
    if (!numbers.some(([k]) => k === kind))
      throw new CompileError(`play plain: ${kind} is no number on a cell`);
  const cells: string[] = [];
  for (const [kind, c] of numbers) {
    if (plain.includes(kind)) continue;
    const sorts = env.clues.get(kind) as ClueKind;
    const sets: Expr[] = [];
    // A set its own binders choose, or one that reads the clue's value, is
    // no set of cells the clue reads.
    const walk = (e: Expr, bound: ReadonlySet<string>): void => {
      if (e.k === "quant" || e.k === "agg") {
        const inner = new Set(bound);
        for (const b of e.binders) {
          const free = new Set<string>();
          freeNames(b.of, free, new Set());
          if (b.kind === "in" && ![...free].some((n) => inner.has(n))) sets.push(b.of);
          inner.add(b.name);
        }
        for (const x of children(e)) walk(x, inner);
        return;
      }
      for (const x of children(e)) walk(x, bound);
    };
    walk(measured(c.means), new Set(["v"]));
    if (sets.length === 0)
      throw new CompileError(
        `clue ${kind}: a number on its cell ranges over the cells it counts, and this one ranges over none`,
      );
    const all = sets.reduce((a, b) => ({ k: "bin", op: "+", a, b }));
    const scratch: string[] = [];
    const out = new Out(2);
    const v = compileExpr(
      all,
      new Map<string, Val>([["at", { code: "at", sort: sorts.at }]]),
      answerEnv(env, { yes: false }, scratch),
      out,
    );
    if (v.sort.k !== "set" || v.sort.of.k !== "elem" || v.sort.of.e !== env.answerSort)
      throw new CompileError(
        `clue ${kind}: the sets its meaning ranges over are not the answer's ${env.answerSort}s`,
      );
    const body = [
      ...scratch.map((s) => `    ${s}`),
      ...out.text(),
      `    return ${v.code};`,
    ];
    cells.push(
      `  ${kind}(${param("sp", "GridSpace", body)}, at: number): readonly number[] {`,
      ...body,
      "  },",
    );
  }
  return [
    "",
    "/** The clue kinds written as a number on their cell. */",
    `export const numbers = ${JSON.stringify(numbers.map(([k]) => k))} as const;`,
    "",
    "/** The cells each number's meaning reads, its block; none for a plain one. */",
    "export const clueCells = {",
    ...cells,
    "};",
  ];
}
