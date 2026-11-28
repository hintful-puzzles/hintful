/**
 * How the player fills a fill game's board (`engine/fill/play.ts`'s
 * `FillPlay`), from the description's `play:`, with what the board reads of
 * the values beside it: the domain, the wash, the labels, and whether a
 * mark may stand.
 */

import { EDGE_VALUE_PAINTERS } from "../../engine/render/pieces/edge-value.ts";
import { PAINTERS } from "../../engine/render/pieces/index.ts";
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
import {
  type Description,
  type DescriptionJson,
  type PlayJson,
  tallyKindOf,
} from "../description.ts";
import type { Expr } from "../expr.ts";
import { parse } from "../expr.ts";
import { answerEnv, param } from "./emit.ts";
import { checkGaps, checkSigns, marginsOf } from "./locations.ts";
import { boundsOf, menuOf, sizeOf } from "./menu.ts";
import { notesOf } from "./notes.ts";
import { recordSitesOf } from "./records.ts";
import { partBound } from "./values.ts";

/** Refuses pictures (`numbers.pictures`) a board cannot draw: a painter no
 * description may name; values painted that are not 1 up, or not those
 * named, or an alphabet
 * they do not each have a letter of; a raised value, a block as tall as its
 * number; an empty square, which is a cross; and, where the player may
 * switch the pictures for the glyphs, a letter A, whose key switches them. */
function checkPictures(numbers: PlayJson["numbers"]): void {
  const pictures = numbers?.pictures;
  if (pictures === undefined) return;
  const values = Object.keys(pictures.paint).map(Number);
  for (const [v, paint] of Object.entries(pictures.paint))
    if (!(paint in PAINTERS))
      throw new CompileError(`play numbers pictures: ${v}'s painter ${paint} is none`);
  if (!values.sort((a, b) => a - b).every((v, i) => v === i + 1))
    throw new CompileError("play numbers pictures: the values painted are not 1 up");
  const named = Object.keys(pictures.names).map(Number);
  if (named.length !== values.length || !values.every((v) => named.includes(v)))
    throw new CompileError(
      "play numbers pictures: the values named are not those painted",
    );
  const letters = numbers?.letters;
  if (typeof letters === "string" && letters.length !== values.length)
    throw new CompileError(
      `play numbers pictures: ${values.length} values painted, and the alphabet ${letters} has ${letters.length} letters`,
    );
  if (
    pictures.pref !== undefined &&
    (letters === true || (typeof letters === "string" && /a/i.test(letters)))
  )
    throw new CompileError(
      "play numbers pictures: A switches the pictures, and types a letter",
    );
  if (numbers?.raised === true)
    throw new CompileError("play numbers: raised, and drawn as pictures");
  if (numbers?.empty !== undefined)
    throw new CompileError("play numbers: an empty square, and drawn as pictures");
}

/** Refuses an alphabet (`letters`, a string) that draws two values alike:
 * a letter of either case types one value. */
export function checkAlphabet(at: string, letters?: true | string): void {
  if (typeof letters !== "string") return;
  if (new Set(letters.toUpperCase()).size !== letters.length)
    throw new CompileError(`${at}: letters ${letters} draws two values alike`);
}

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

/**
 * `recordHolds(g, sp, cl, k)`: whether record `k` of the clue at the board
 * `play.list` draws holds of the values `g`, its meaning read of the board
 * as placed, for the list's strike. Nothing where there is no list; one
 * naming no clue at the board the deal derives, or whose records hold no
 * list, is refused.
 */
function recordHoldsOf(
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

/** Refuses what a board whose rows and columns stand for the same things
 * offers off such a board: dividers, the leading diagonal, and an order. */
function checkSquareLines(p: PlayJson, json: DescriptionJson, d: Description): void {
  const grid = json.space.grid;
  const square = grid !== undefined && grid.w === grid.h;
  const size = `${grid?.w} by ${grid?.h}`;
  // A divider is toggled by a press between two labels, and keyed by a line
  // both of rows and of columns, the same two of each.
  if (p.dividers === true) {
    if (p.numbers === undefined)
      throw new CompileError(
        "play dividers: dividers are a board of numbers', and play has no `numbers`",
      );
    if (p.labels?.start === undefined)
      throw new CompileError(
        "play dividers: a divider is ruled between two labels, and play has no `labels.start`",
      );
    if (!square)
      throw new CompileError(
        `play dividers: a divider rules two rows and two columns alike, and the grid is not square (${size})`,
      );
  }
  // The leading diagonal is where a row meets the same column, which only a
  // square board has.
  if (p.leadingDiagonal === true && !square)
    throw new CompileError(
      `play leadingDiagonal: a row meets the same column on a square board, and the grid is not square (${size})`,
    );
  // An order moves a row and the same column together, its labels with
  // them, so it is offered only where nothing else is fixed to a line's
  // place: no unit but the lines, and no clue but at a cell.
  if (p.order !== true) return;
  if (p.numbers === undefined)
    throw new CompileError(
      "play order: an order is a board of numbers', and play has no `numbers`",
    );
  if (p.labels?.start === undefined)
    throw new CompileError(
      "play order: a line is dragged by its label, and play has no `labels.start`",
    );
  if (!square)
    throw new CompileError(
      `play order: an order moves a row and the same column together, and the grid is not square (${size})`,
    );
  const units = json.space.units.filter((u) => u !== "rows" && u !== "cols");
  if (units.length > 0)
    throw new CompileError(
      `play order: an order keeps the rows and the columns alone, and the space has ${units.join(", ")}`,
    );
  const offCells = [...d.clueKinds].filter(([, k]) => k.at !== "cell").map(([n]) => n);
  if (offCells.length > 0)
    throw new CompileError(
      `play order: a clue off the cells keeps its place in an order, and ${offCells.join(", ")} is one`,
    );
}

export function playOf(
  json: DescriptionJson,
  d: Description,
  env: Env,
  measured: (e: Expr) => Expr,
): string[] {
  const p = json.play;
  // A clue saying a value is drawn as its glyph, beyond a line's end.
  const glyphClues = Object.entries(json.clues ?? {})
    .filter(([, c]) => c.glyph === true)
    .map(([k]) => k);
  for (const k of glyphClues)
    if (p?.numbers === undefined || json.clues?.[k]?.at !== "slot")
      throw new CompileError(`clue ${k}: a glyph, not at a slot of a board of numbers`);
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
  // from a list (Seismic's areas), whose largest is the keypad's last; or,
  // where the deal alone places some values (Undead's mirrors), the numbers
  // below them, those values differing from cell to cell.
  const given = Object.keys(p.given ?? {}).map(Number);
  if (p.numbers !== undefined && given.length > 0) {
    const least = Math.min(...given);
    if (given.some((v) => !given.includes(v + 1) && v !== Math.max(...given)))
      throw new CompileError(
        "play given: on a board of numbers, the values the deal alone places run on from one another",
      );
    for (const v of Object.keys(p.numbers.pictures?.paint ?? {}).map(Number))
      if (v >= least)
        throw new CompileError(
          `play given: ${least} and above are the deal's, and pictures paint ${v}`,
        );
  } else if (
    p.numbers !== undefined &&
    env.cellDomain &&
    partBound(d.domain, json) === null
  )
    throw new CompileError(
      "play numbers: the domain differs from cell to cell, and is no part's numbers",
    );
  // A raised value leans into the squares next door, where a gap or a clue
  // at a part's first square would be.
  if (p.numbers?.raised === true && (p.gaps !== undefined || p.signs !== undefined))
    throw new CompileError("play numbers: raised, on a board with gaps or part clues");
  // A block as tall as its value is a number's.
  if (p.numbers?.raised === true && p.numbers.letters !== undefined)
    throw new CompileError("play numbers: raised letters");
  checkAlphabet("play numbers", p.numbers?.letters);
  checkPictures(p.numbers);
  if (p.labels?.glyph === true && p.numbers === undefined)
    throw new CompileError(
      "play labels glyph: a label is drawn as a value, and play has no `numbers`",
    );
  // The empty square is the value a line holds more than once; its ball is
  // a clue at a square ruling that value out of it, and holds none itself.
  const empty = p.numbers?.empty;
  if (empty !== undefined) {
    if (d.repeat === null)
      throw new CompileError("play numbers empty: the answer declares no `repeat`");
    // A raised block is as tall as its number, and a cross has none.
    if (p.numbers?.raised === true)
      throw new CompileError("play numbers: raised, with an empty square");
    const ball = json.clues?.[empty.ball];
    if (ball?.at !== "cell" || ball.value !== "range(0, 0)")
      throw new CompileError(
        `play numbers empty: ${empty.ball} is not a clue at a square holding no value`,
      );
  }
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
    boardSkips,
    variants,
    bounds,
    plain: _plain,
    wash,
    highlights,
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
  checkCounts(json, d, measured);
  // The ends lay the margin of clues one a value at lines: each value of
  // theirs drawn at one end, so every clue is drawn and no square is empty.
  if (p.ends !== undefined) {
    const margined = [...d.clueKinds].filter(
      ([k, c]) => c.at === "line" && (env.clues.get(k) as ClueKind | undefined)?.per,
    );
    const laid = [...p.ends.start, ...p.ends.end];
    if (margined.length === 0)
      throw new CompileError("play ends: no clue one a value at the lines to lay");
    for (const [k, c] of margined) {
      const of = c.perOf;
      if (of === null || laid.length !== of.length || of.some((v) => !laid.includes(v)))
        throw new CompileError(
          `play ends: ${k}'s values are not laid each at one end, its \`per\` listing them`,
        );
    }
  }
  // A selection is the typed board's: a board of buttons drags a sweep.
  if (p.select !== undefined && p.numbers === undefined)
    throw new CompileError(
      "play select: a selection is typed into, and play has no `numbers`",
    );
  checkAlong(p);
  checkSquareLines(p, json, d);
  if (p.cornerCrosses !== undefined && json.variations?.[p.cornerCrosses] === undefined)
    throw new CompileError(`play cornerCrosses: no variation ${p.cornerCrosses}`);
  const plainPlay = {
    ...rest,
    ...(notes ? { notes } : {}),
    ...(dotted ? { dotted } : {}),
    ...(wash === undefined
      ? {}
      : { wash: wash.pref === undefined ? {} : { pref: wash.pref } }),
    ...(highlights === undefined
      ? {}
      : {
          highlights: highlights.map(({ paint, pref, on }) => ({
            paint,
            pref,
            on: on ?? true,
          })),
        }),
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
    ...repeatOf(d, env, measured),
    ...washedOf(wash?.when ?? null, env, measured),
    ...highlightedOf(highlights, env, measured),
    ...recordHoldsOf(json, d, env, measured),
    ...(p.along === undefined || p.list === undefined
      ? []
      : recordSitesOf(json, d, p.list, env, measured)),
    "",
    "/** How the player fills the board: the engine's `FillPlay`. */",
    `export const play = ${JSON.stringify(play)} as const;`,
    ...margins,
    ...(glyphClues.length === 0
      ? []
      : [
          "",
          "/** The clue kinds whose number is a value, drawn as its glyph. */",
          `export const glyphClues = ${JSON.stringify(glyphClues)} as const;`,
        ]),
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
    ...menuOf(json, {
      boards,
      byDefault,
      defaultTier,
      boardTiers,
      boardSkips,
      variants,
    }),
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
  return cellTestOf(
    "washed",
    "/** Whether cell `c` is washed on the values `g` (`play.wash`). */",
    when,
    "play wash when",
    env,
    measured,
  );
}

/**
 * `highlighted`, one test a highlight (`play.highlights`), in their order:
 * whether its `when` holds at cell `c` on the values `g`. Nothing where
 * there are none.
 */
function highlightedOf(
  highlights: PlayJson["highlights"],
  env: Env,
  measured: (e: Expr) => Expr,
): string[] {
  if (highlights === undefined) return [];
  const tests = highlights.flatMap((h, k) =>
    cellTestOf(
      `highlighted${k}`,
      `/** Whether cell \`c\` takes highlight ${k} on the values \`g\`. */`,
      h.when,
      `play highlights ${k} when`,
      env,
      measured,
    ),
  );
  return [
    ...tests,
    "",
    "/** Each highlight's test (`play.highlights`), in their order. */",
    `export const highlighted = [${highlights.map((_, k) => `highlighted${k}`).join(", ")}] as const;`,
  ];
}

/** `name(g, sp, cl, c)`, exported: whether the formula `when` holds of cell
 * `c` on the values `g`. */
function cellTestOf(
  name: string,
  doc: string,
  when: string,
  what: string,
  env: Env,
  measured: (e: Expr) => Expr,
): string[] {
  const scratch: string[] = [];
  const out = new Out(1);
  const v = compileExpr(
    measured(parse(when)),
    new Map<string, Val>([["c", { code: "c", sort: elem("cell") }]]),
    answerEnv(env, { yes: false }, scratch),
    out,
  );
  expect(v, "bool", what);
  const body = [...scratch.map((s) => `  ${s}`), ...out.text(), `  return ${v.code};`];
  return [
    "",
    doc,
    `export function ${name}(${[
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
 * `repeatOf`, where the answer declares a value that repeats in a unit
 * (Salad's empty square): the value and how many times each unit holds it,
 * which the ladder's marks count it by. Nothing where it declares none.
 */
function repeatOf(d: Description, env: Env, measured: (e: Expr) => Expr): string[] {
  if (d.repeat === null) return [];
  const out = new Out(1);
  const cenv = { ...env, answer: { repeats: false } };
  const value = compileExpr(measured(d.repeat.value), new Map(), cenv, out);
  const times = compileExpr(measured(d.repeat.times), new Map(), cenv, out);
  expect(value, "num", "answer repeat value");
  expect(times, "num", "answer repeat times");
  const body = [
    ...out.text(),
    `  return { value: ${value.code}, times: ${times.code} };`,
  ];
  return [
    "",
    "/** The value a unit may hold more than once, and how many times it does. */",
    `export function repeatOf(${param("sp", "GridSpace", body)}, ${param("cl", "Dealt", body)}): { value: number; times: number } {`,
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
  // A glyph is a value's, drawn as the board draws its values.
  const glyph = labels?.glyph === true;
  const body = [
    ...scratch.map((s) => `  ${s}`),
    ...out.text(),
    glyph ? `  return ${v.code};` : `  return String(${v.code});`,
  ];
  if (body.some((l) => /\b(g|sp|cl)\b/.test(l)))
    throw new CompileError(`play labels start: ${start} reads more than \`i\``);
  return [
    "",
    glyph
      ? "/** The value before each line's start, drawn as its glyph, by the line's index along its axis. */"
      : "/** The fixed text before each line's start, by its index along its axis. */",
    "export const labels = {",
    glyph ? "  value(i: number): number {" : "  start(i: number): string {",
    ...body.map((l) => `  ${l}`),
    "  },",
    "};",
  ];
}
