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
  isMask,
  NUM,
  Out,
  type Val,
} from "./compile-sorts.ts";
import {
  type Description,
  type DescriptionJson,
  type PlayJson,
  sampleOf,
} from "./description.ts";
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

/**
 * `play`, the engine's `FillPlay`, from the description's `play:`: its link
 * named by the clue kind the cell mark names. Nothing where there is no
 * `play:`. A button whose value the player cannot place, or a link that is
 * not the cell mark naming a clue, is refused.
 */
export function playOf(
  json: DescriptionJson,
  d: Description,
  env: Env,
  measured: (e: Expr) => Expr,
): string[] {
  const p = json.play;
  if (p === undefined) return [];
  for (const [button, v] of [
    ["primary", p.primary],
    ["secondary", p.secondary],
  ] as const)
    if (p.values[v] === undefined)
      throw new CompileError(
        `play: the ${button} value ${v} is not one the player places`,
      );
  if (p.links !== undefined && p.links !== env.cellMark?.name)
    throw new CompileError(
      `play: links names ${p.links}, not the cell mark naming a clue`,
    );
  const { links, glance, askBefore, labels, boards, hintMarks, ...rest } = p;
  const rungs = d.techniques.filter((t) => t.on === null).map((t) => t.id);
  for (const [key, ids] of [
    ["glance", glance],
    ["askBefore", askBefore],
  ] as const)
    for (const id of ids ?? [])
      if (!rungs.includes(id))
        throw new CompileError(`play ${key}: ${id} is no technique of the ladder`);
  if (glance !== undefined && links === undefined)
    throw new CompileError(
      "play glance: a glance reads links, and there is no `links`",
    );
  if (askBefore !== undefined && glance === undefined)
    throw new CompileError("play askBefore: a link is asked for only beside `glance`");
  for (const id of askBefore ?? [])
    if (glance?.includes(id))
      throw new CompileError(`play askBefore: ${id} is read at a glance`);
  const play =
    links === undefined
      ? rest
      : {
          ...rest,
          links: {
            clue: env.cellMark?.kind,
            ...(glance === undefined ? {} : { glance, askBefore: askBefore ?? [] }),
          },
        };
  const lineClues = [...d.clueKinds].filter(([, c]) => c.at === "line").map(([k]) => k);
  return [
    ...boardDomainOf(d, env, measured),
    "",
    "/** How the player fills the board: the engine's `FillPlay`. */",
    `export const play = ${JSON.stringify(play)} as const;`,
    "",
    "/** The clue kinds at lines, drawn past each line's end. */",
    `export const lineClues = ${JSON.stringify(lineClues)} as const;`,
    ...labelsOf(labels, env),
    ...(boards === undefined
      ? []
      : [
          "",
          "/** The preset menu's sizes, smallest first; the first is the default. */",
          `export const boards = ${JSON.stringify(
            boards.map((b) => {
              const [w, h] = b.split("x").map(Number);
              return { w, h };
            }),
          )} as const;`,
        ]),
    ...(hintMarks === undefined
      ? []
      : [
          "",
          "/** What each mark of the hint means here (`Game.hint.marks`). */",
          `export const hintMarks = ${JSON.stringify(hintMarks)} as const;`,
        ]),
  ];
}

/**
 * `domainOf` where the description states the domain for the whole board
 * (Kakurasu's `range(1, 2)`), as every cell's: the fill board seeds each cell
 * from it. Nothing where the domain is a cell's, which compiles its own.
 */
function boardDomainOf(
  d: Description,
  env: Env,
  measured: (e: Expr) => Expr,
): string[] {
  if (env.cellDomain) return [];
  const out = new Out(1);
  const v = compileExpr(
    measured(d.domain),
    new Map(),
    { ...env, answer: { repeats: false } },
    out,
  );
  if (!isMask(v.sort)) throw new CompileError("the domain is not a set of values");
  return [
    "",
    "/** The values each cell may hold: the board's domain, the same at every cell. */",
    "export function domainOf(_sp: GridSpace, _cl: Dealt, _c: number): number {",
    ...out.text(),
    `  return ${v.code};`,
    "}",
  ];
}

/**
 * `deal`, what the engine deals a fill game's board by and writes its game
 * ID with: the sample, the codec's segments, the tiers' letters and the
 * sizes; and `clueMax`, each clue kind's largest value at an element, from
 * its `value: range(lo, hi)`, which bounds what a game ID may say. Nothing
 * where there is no `play:`.
 */
export function dealOf(
  json: DescriptionJson,
  d: Description,
  env: Env,
  measured: (e: Expr) => Expr,
): string[] {
  if (json.play === undefined) return [];
  const kinds = [...d.clueKinds.keys()];
  const id =
    json.id ?? kinds.map((k, i) => ({ numbers: k, ...(i > 0 ? { before: "," } : {}) }));
  const named = id.map((seg) => ("runs" in seg ? seg.runs : seg.numbers));
  for (const kind of kinds)
    if (named.filter((k) => k === kind).length !== 1)
      throw new CompileError(`id: clue kind ${kind} is not named once`);
  for (const seg of id) {
    const kind = "runs" in seg ? seg.runs : seg.numbers;
    const c = d.clueKinds.get(kind);
    if (c === undefined) throw new CompileError(`id: no clue kind ${kind}`);
    // A run code says where a clue is, never its value: one value, 0.
    const one =
      c.value !== null &&
      c.value.k === "call" &&
      c.value.args.every((a) => a.k === "num" && a.v === 0);
    if ("runs" in seg && (c.at !== "cell" || !one))
      throw new CompileError(
        `id: runs of ${kind}, which is not a cell's one-valued marker`,
      );
  }
  const tiers = json.tiers ?? [];
  const tierLetters =
    json.tierLetters ?? tiers.map((t) => t[0]?.toLowerCase() ?? "").join("");
  if (tierLetters.length !== tiers.length || new Set(tierLetters).size !== tiers.length)
    throw new CompileError(`tierLetters: ${tierLetters} is not one letter a tier`);
  const universes = Object.fromEntries(
    [...d.clueKinds].map(([k, c]) => {
      const u = UNIVERSE[c.at];
      if (u === undefined)
        throw new CompileError(
          `clue ${k}: a fill game's clue sits at a cell or a line`,
        );
      return [k, u];
    }),
  );
  const deal = {
    sample: sampleOf(json),
    id,
    universes,
    tierLetters,
    sizes: json.sizes,
  };
  const max: string[] = [];
  for (const [kind, c] of d.clueKinds) {
    const sorts = env.clues.get(kind) as ClueKind;
    const range = c.value === null ? null : measured(c.value);
    if (
      range === null ||
      range.k !== "call" ||
      range.fn !== "range" ||
      range.args.length !== 2
    )
      throw new CompileError(
        `clue ${kind}: a fill game's clue values are a range(lo, hi)`,
      );
    const scratch: string[] = [];
    const out = new Out(2);
    const hi = compileExpr(
      range.args[1],
      new Map<string, Val>([["at", { code: "at", sort: sorts.at }]]),
      answerEnv(env, { yes: false }, scratch),
      out,
    );
    const body = [
      ...scratch.map((s) => `    ${s}`),
      ...out.text(),
      `    return Number(${hi.code});`,
    ];
    max.push(
      `  ${kind}(${param("sp", "GridSpace", body)}, ${param("at", "number", body)}): number {`,
      ...body,
      "  },",
    );
  }
  return [
    "",
    "/** How the engine deals the board and writes its game ID. */",
    `export const deal = ${JSON.stringify(deal)} as const;`,
    "",
    "/** Each clue kind's largest value at an element. */",
    "export const clueMax = {",
    ...max,
    "};",
  ];
}

/**
 * `labels`, the fixed text before each line's start, from `play`'s
 * `labels:`: a formula of `i`, the line's index along its axis. It reads
 * nothing of the board, so it is drawn once.
 */
function labelsOf(labels: PlayJson["labels"], env: Env): string[] {
  const start = labels?.start;
  if (start === undefined) return [];
  const scratch: string[] = [];
  const out = new Out(1);
  const v = compileExpr(
    parse(start),
    new Map<string, Val>([["i", { code: "i", sort: NUM }]]),
    answerEnv(env, { yes: false }, scratch),
    out,
  );
  if (v.sort.k !== "int" && v.sort.k !== "num")
    throw new CompileError(`play labels start: ${start} is not a number`);
  const body = [
    ...scratch.map((s) => `  ${s}`),
    ...out.text(),
    `  return String(${v.code});`,
  ];
  if (body.some((l) => /\b(g|sp|cl)\b/.test(l)))
    throw new CompileError(`play labels start: ${start} reads more than \`i\``);
  return [
    "",
    "/** The fixed text before each line's start, by its index along its axis. */",
    "export const labels = {",
    "  start(i: number): string {",
    ...body.map((l) => `  ${l}`),
    "  },",
    "};",
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
