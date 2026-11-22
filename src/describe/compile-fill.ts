/**
 * What the engine's fill board (`engine/fill/`) reads of a description that
 * the techniques and the checks do not: whether a cell's mark may stand on
 * the values (a mark's `while`), and, for a game whose deal samples an
 * answer, the clues that answer deals, from each clue kind's `means`
 * (`openspec/changes/a-game-from-its-description-alone`, design.md § 4 and
 * § 7).
 */

import { bindingLoops, compileExpr } from "./compile-expr.ts";
import {
  type ClueKind,
  CompileError,
  type Env,
  elem,
  expect,
  Out,
  type Val,
} from "./compile-sorts.ts";
import { type Description, type DescriptionJson, sampleOf } from "./description.ts";
import type { Binder, Expr } from "./expr.ts";
import { parse } from "./expr.ts";

/** A compiling environment that reads a whole board `g`, as the answer
 * check does. */
function answerEnv(env: Env, readsClues: { yes: boolean }, scratch: string[]): Env {
  return {
    ...env,
    answer: { repeats: false },
    readsClues,
    scratch,
    memo: false,
    hoist: null,
    boardRoot: null,
    epoch: null,
    concluding: false,
  };
}

/** A function's parameter, `_`-prefixed where its body leaves it unread. */
const param = (name: string, type: string, body: readonly string[]): string =>
  body.some((l) => new RegExp(`\\b${name}\\b`).test(l))
    ? `${name}: ${type}`
    : `_${name}: ${type}`;

/**
 * `markWhile(g, sp, cl, c)`: whether the mark on cell `c` may stand on the
 * values `g`, from the one cell mark's `while`. Nothing where no mark states
 * one.
 */
export function markWhileOf(
  json: DescriptionJson,
  env: Env,
  measured: (e: Expr) => Expr,
): string[] {
  const stated = Object.entries(json.marks ?? {}).filter(
    ([, m]) => m.while !== undefined,
  );
  if (stated.length === 0) return [];
  if (stated.length > 1 || stated[0][1].sort !== "cell" || env.cellMark === null)
    throw new CompileError(
      `${stated.map(([n]) => n).join(", ")}: \`while\` is the one cell mark's that names a clue`,
    );
  const [name, m] = stated[0];
  const readsClues = { yes: false };
  const scratch: string[] = [];
  const out = new Out(1);
  const v = compileExpr(
    measured(parse(m.while as string)),
    new Map<string, Val>([["at", { code: "c", sort: elem("cell") }]]),
    answerEnv(env, readsClues, scratch),
    out,
  );
  expect(v, "bool", `mark ${name} while`);
  const body = [...scratch.map((s) => `  ${s}`), ...out.text(), `  return ${v.code};`];
  return [
    "",
    `/** Whether the ${name} on cell \`c\` may stand on the values \`g\`: its`,
    " * `while`. An edit drops a mark that may not. */",
    `export function markWhile(${[
      "g: ArrayLike<number>",
      param("sp", "GridSpace", body),
      param("cl", "Dealt", body),
      "c: number",
    ].join(", ")}): boolean {`,
    ...body,
    "}",
  ];
}

/** The elements a clue may sit at, as the description names them. */
const UNIVERSE: Readonly<Record<string, string>> = { cell: "cells", line: "lines" };

/**
 * For a description whose deal samples an answer: `clueHolds_<kind>(g, sp,
 * at, v)`, whether a clue of each kind at `at` valued `v` holds of the whole
 * board `g`, and `deriveClues(g, sp)`, the clues `g` deals, each kind at
 * each element where one of its values holds, the first in its values'
 * order. Nothing for any other description. A clue the board's answer alone
 * cannot decide (one whose meaning reads other clues, a clue at the board,
 * a list, one a value) cannot be derived, and is refused.
 */
export function derivedClues(
  json: DescriptionJson,
  d: Description,
  env: Env,
  measured: (e: Expr) => Expr,
): string[] {
  if (sampleOf(json) === null) return [];
  if (env.regions.size + env.relations.size + env.sizes.read.size > 0)
    throw new CompileError(
      `${json.game}: a sampled deal derives clues alone, and this board deals more`,
    );
  const holds: string[] = [];
  const derive = new Out(1);
  const dealt: string[] = [];
  for (const [kind, c] of d.clueKinds) {
    const sorts = env.clues.get(kind) as ClueKind;
    const universe = UNIVERSE[c.at];
    if (c.value === null || sorts.per || sorts.list || universe === undefined)
      throw new CompileError(
        `clue ${kind}: a sampled deal derives a clue of one value at a cell or a line`,
      );
    const readsClues = { yes: false };
    const scratch: string[] = [];
    const henv = answerEnv(env, readsClues, scratch);
    const out = new Out(1);
    const means = compileExpr(
      measured(c.means),
      new Map<string, Val>([
        ["at", { code: "at", sort: sorts.at }],
        ["v", { code: "v", sort: sorts.v }],
      ]),
      henv,
      out,
    );
    expect(means, "bool", `clue ${kind}`);
    if (readsClues.yes)
      throw new CompileError(
        `clue ${kind}: its meaning reads the board's clues, so a sampled answer cannot deal it`,
      );
    const body = [
      ...scratch.map((s) => `  ${s}`),
      ...out.text(),
      `  return ${means.code};`,
    ];
    holds.push(
      "",
      `/** Whether a ${kind} clue at \`at\` valued \`v\` holds of the whole board \`g\`. */`,
      `export function clueHolds_${kind}(${[
        "g: ArrayLike<number>",
        param("sp", "GridSpace", body),
        param("at", "number", body),
        param("v", "number", body),
      ].join(", ")}): boolean {`,
      ...body,
      "}",
    );
    // Each element in order, then each value in the values' order: a value
    // pushed at this element already is the one that holds first.
    const at = `${kind}_at`;
    const vs = `${kind}_v`;
    derive.emit(`const ${at}: number[] = [];`);
    derive.emit(`const ${vs}: number[] = [];`);
    const binders: Binder[] = [
      { name: "at", kind: "in", of: { k: "name", name: universe }, where: null },
      { name: "v", kind: "in", of: measured(c.value), where: null },
    ];
    bindingLoops(
      binders,
      new Map(),
      { ...henv, readsClues: { yes: false } },
      derive,
      (sc) => {
        const a = (sc.get("at") as Val).code;
        const v = (sc.get("v") as Val).code;
        derive.emit(
          `if (${at}.at(-1) !== ${a} && clueHolds_${kind}(g, sp, ${a}, ${v})) { ${at}.push(${a}); ${vs}.push(${v}); }`,
        );
      },
    );
    dealt.push(`${kind}: clueList(${at}, ${vs}, sp.${universe}.length)`);
  }
  env.used.add("clueList");
  return [
    ...holds,
    "",
    "/** The clues the whole board `g` deals: each kind at each element where",
    " * one of its values holds, the first in its values' order. */",
    "export function deriveClues(g: ArrayLike<number>, sp: GridSpace): Dealt {",
    ...derive.text(),
    `  return { ${dealt.join(", ")} };`,
    "}",
  ];
}
