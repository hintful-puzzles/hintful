/**
 * How the player fills a fill game's board (`engine/fill/play.ts`'s
 * `FillPlay`), from the description's `play:`, with what the board reads of
 * the values beside it: the domain, the wash, the labels, and whether a
 * mark may stand.
 */

import { EDGE_VALUE_PAINTERS } from "../../engine/render/pieces/edge-value.ts";
import { compileExpr } from "../compile-expr.ts";
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
} from "../compile-sorts.ts";
import type { Description, DescriptionJson, PlayJson } from "../description.ts";
import type { Expr } from "../expr.ts";
import { parse } from "../expr.ts";
import { answerEnv, param } from "./emit.ts";
import { checkGaps, checkSigns, marginsOf } from "./locations.ts";
import { boundsOf, menuOf, sizeOf } from "./menu.ts";
import { notesOf } from "./notes.ts";
import { partBound } from "./values.ts";

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

/** Whether `e` is `value(at) = v`. */
const isValueAt = (e: Expr): boolean =>
  e.k === "bin" &&
  e.op === "=" &&
  e.a.k === "call" &&
  e.a.fn === "value" &&
  e.a.args.length === 1 &&
  e.a.args[0].k === "name" &&
  e.a.args[0].name === "at" &&
  e.b.k === "name" &&
  e.b.name === "v";

/** Whether `e` is `value(at) = v`, alone or as the first of a conjunction. */
const fixesItsValue = (e: Expr): boolean =>
  isValueAt(e) || (e.k === "bin" && e.op === "and" && fixesItsValue(e.a));

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
  // The schema gives a board of buttons all three, and one of numbers none.
  const values = p.values ?? {};
  for (const [button, v] of [
    ["primary", p.primary],
    ["secondary", p.secondary],
  ] as const)
    if (v !== undefined && values[v] === undefined)
      throw new CompileError(
        `play: the ${button} value ${v} is not one the player places`,
      );
  // A value on a cell prints as its glyph; one on an edge, which runs one of
  // two ways, as its edge painter says.
  const onEdges = json.answer.value.sort === "edge";
  for (const [v, { glyph, paint }] of Object.entries(values)) {
    if (!onEdges && glyph === undefined)
      throw new CompileError(`play values: ${v} has no glyph`);
    if (onEdges && glyph !== undefined)
      throw new CompileError(
        `play values: ${v} is on an edge, which its painter prints, and has a glyph`,
      );
    if (onEdges && !(paint in EDGE_VALUE_PAINTERS))
      throw new CompileError(
        `play values: ${v} is on an edge, and ${paint} is no edge painter`,
      );
  }
  // The keypad is the domain, which the params alone must give: the board's,
  // or the numbers 1 to a cell's part's size, the part dealt to sizes drawn
  // from a list (Seismic's areas), whose largest is the keypad's last.
  if (p.numbers !== undefined && env.cellDomain && partBound(d.domain, json) === null)
    throw new CompileError(
      "play numbers: the domain differs from cell to cell, and is no part's numbers",
    );
  // A raised value leans into the squares next door, where a gap or a clue
  // at a part's first square would be.
  if (p.numbers?.raised === true && (p.gaps !== undefined || p.signs !== undefined))
    throw new CompileError("play numbers: raised, on a board with gaps or part clues");
  // A block as tall as its value is a number's.
  if (p.numbers?.raised === true && p.numbers.letters === true)
    throw new CompileError("play numbers: raised letters");
  if (p.links !== undefined && p.links !== env.cellMark?.name)
    throw new CompileError(
      `play: links names ${p.links}, not the cell mark naming a clue`,
    );
  // A dealt kind whose meaning says more than its cell's value is drawn
  // with a dot on the piece (Clusters' dot, which also counts its like
  // neighbors).
  let dotted = false;
  if (p.dealt !== undefined) {
    const kind = json.clues?.[p.dealt];
    const means = kind === undefined ? null : parse(kind.means);
    if (kind?.at !== "cell" || means === null || !fixesItsValue(means))
      throw new CompileError(
        `play dealt: ${p.dealt} is not a clue at a cell meaning \`value(at) = v\`, alone or before an \`and\``,
      );
    dotted = !isValueAt(means);
  }
  const {
    links,
    glance,
    askBefore,
    labels,
    boards,
    hintMarks,
    default: byDefault,
    defaultTier,
    boardTiers,
    variants,
    bounds,
    plain: _plain,
    wash,
    ...rest
  } = p;
  if (rest.covers !== undefined && values[rest.covers.value] === undefined)
    throw new CompileError(
      `play covers: ${rest.covers.value} is not a value the player places`,
    );
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
  const { notes, distinctParts } = notesOf(json, d, env);
  checkSigns(p, d, env);
  checkGaps(p, d, env);
  // A clue is marked done by a press where it is drawn, and the engine finds
  // a press on a clue in a gap, at a slot, on one at a part, or on a line's
  // one a value in the margin before its start, alone; the press goes to the
  // board of numbers' input, which takes no press off its squares of its
  // own.
  for (const k of Object.keys(p.done ?? {})) {
    const at = d.clueKinds.get(k)?.at ?? "";
    const margined = at === "line" && (env.clues.get(k) as ClueKind | undefined)?.per;
    if (
      p.gaps?.[k] === undefined &&
      !env.regions.has(at) &&
      at !== "slot" &&
      margined !== true
    )
      throw new CompileError(
        `play done: ${k} is no clue kind drawn in a gap, at a slot, at a part or one a value at a line, the places a press marks a clue done`,
      );
    if (p.numbers === undefined)
      throw new CompileError(
        `play done: ${k} is marked done on a board of numbers alone, and play has no \`numbers\``,
      );
  }
  const plainPlay = {
    ...rest,
    ...(notes ? { notes } : {}),
    ...(dotted ? { dotted } : {}),
    ...(wash === undefined
      ? {}
      : { wash: wash.pref === undefined ? {} : { pref: wash.pref } }),
  };
  const play =
    links === undefined
      ? plainPlay
      : {
          ...plainPlay,
          links: {
            clue: env.cellMark?.kind,
            ...(glance === undefined ? {} : { glance, askBefore: askBefore ?? [] }),
          },
        };
  const margins = marginsOf(d, env, labels?.start !== undefined);
  // A rule over a dealt partition's parts breaks at the cells it counts, which
  // may happen to lie in a row and still are no run.
  const overParts = (src: string): boolean => {
    const e = parse(src);
    const of = e.k === "quant" ? e.binders[0]?.of : undefined;
    return of?.k === "name" && env.regions.has(of.name);
  };
  const partRules = [
    ...(json.shape ?? []).flatMap((s, i) => (overParts(s) ? [`shape.${i}`] : [])),
    ...Object.entries(json.rules ?? {}).flatMap(([n, s]) => (overParts(s) ? [n] : [])),
  ];
  return [
    ...boardDomainOf(d, env, measured),
    ...washedOf(wash?.when ?? null, env, measured),
    "",
    "/** How the player fills the board: the engine's `FillPlay`. */",
    `export const play = ${JSON.stringify(play)} as const;`,
    ...margins,
    ...(partRules.length === 0
      ? []
      : [
          "",
          "/** The rules over a dealt partition's parts, by name. */",
          `export const partRules = ${JSON.stringify(partRules)} as const;`,
        ]),
    ...(distinctParts.length === 0
      ? []
      : [
          "",
          "/** The dealt partitions whose parts hold no value twice, which the walk",
          " * of the notes reads a value's places in. */",
          `export const distinctParts = ${JSON.stringify(distinctParts)} as const;`,
        ]),
    ...labelsOf(labels, env),
    ...(boards === undefined
      ? []
      : [
          "",
          "/** The preset menu's sizes, smallest first; the first is the default. */",
          `export const boards = ${JSON.stringify(boards.map(sizeOf(json)))} as const;`,
        ]),
    ...menuOf(json, { boards, byDefault, defaultTier, boardTiers, variants }),
    ...boundsOf(json, bounds),
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
 * `washed(g, sp, cl, c)`: whether open cell `c` is washed on the values `g`,
 * from `play.wash.when`. Nothing where there is no wash.
 */
function washedOf(
  when: string | null,
  env: Env,
  measured: (e: Expr) => Expr,
): string[] {
  if (when === null) return [];
  const scratch: string[] = [];
  const out = new Out(1);
  const v = compileExpr(
    measured(parse(when)),
    new Map<string, Val>([["c", { code: "c", sort: elem("cell") }]]),
    answerEnv(env, { yes: false }, scratch),
    out,
  );
  expect(v, "bool", "play wash when");
  const body = [...scratch.map((s) => `  ${s}`), ...out.text(), `  return ${v.code};`];
  return [
    "",
    "/** Whether cell `c` is washed on the values `g` (`play.wash`). */",
    `export function washed(${[
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
  // A domain a size states reads the space (`range(1, w)`).
  const body = [...out.text(), `  return ${v.code};`];
  return [
    "",
    "/** The values each cell may hold: the board's domain, the same at every cell. */",
    `export function domainOf(${param("sp", "GridSpace", body)}, ${param("cl", "Dealt", body)}, _c: number): number {`,
    ...body,
    "}",
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
