/**
 * What the engine's fill board (`engine/fill/`) reads of a description that
 * the techniques and the checks do not: whether a cell's mark may stand on
 * the values (a mark's `while`), and, for a game whose deal samples an
 * answer, the clues that answer deals, from each clue kind's `means`
 * (`openspec/changes/a-game-from-its-description-alone`, design.md § 4 and
 * § 7).
 */

import { WALK_STEPS } from "../engine/fill/walk-steps.ts";
import { EDGE_PAINTERS } from "../engine/render/pieces/edge.ts";
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
import { concludes } from "./compile-technique.ts";
import { freeNames } from "./compile-terms.ts";
import {
  codeOf,
  type Description,
  type DescriptionJson,
  type DivideJson,
  divideOf,
  firstKindJsonOf,
  type GrowJson,
  growOf,
  type IdSegmentJson,
  type KindLetterJson,
  kindLettersJsonOf,
  noteMarkOf,
  type OneKindJson,
  type OnlyFlagJson,
  type OptionJson,
  oneKindOf,
  onlyFlagOf,
  optionsOf,
  type PlayJson,
  type SampleJson,
  type SizeBoundsJson,
  type SizeRange,
  sampleOf,
  segmentKinds,
  thoroughOf,
} from "./description.ts";
import type { Binder, Expr } from "./expr.ts";
import { children, parse } from "./expr.ts";

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
 * Refuses `play.signs` that leave a clue undrawn or name one not drawn with
 * a sign. A clue at a part is drawn at its first cell with its sign, on a
 * board of numbers, whose cells hold no number of their own; one at a corner
 * on a disc where its cells meet. A list is a word a value, from the least,
 * of a range the sizes do not move.
 */
function checkSigns(p: PlayJson, d: Description, env: Env): void {
  const signed = (at: string): boolean => env.regions.has(at) || at === "corner";
  for (const [k, c] of d.clueKinds)
    if (signed(c.at) && p.signs?.[k] === undefined)
      throw new CompileError(
        `clue ${k}: a clue at a ${c.at === "corner" ? "corner" : "part"}, and no sign in play signs`,
      );
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

/**
 * `play`, the engine's `FillPlay`, from the description's `play:`: its link
 * named by the clue kind the cell mark names. Nothing where there is no
 * `play:`. A button whose value the player cannot place, or a link that is
 * not the cell mark naming a clue, is refused.
 */
/**
 * The dealt partitions a rule holds distinct, each stated as `forall r in P:
 * distinct(value(c) over c in cells(r))`: the walk of the notes reads a
 * value's places in each part, as in a row. A partition whose rule says more
 * (a cage's sum) is no such region, and is not listed.
 */
function distinctPartsOf(json: DescriptionJson, env: Env): string[] {
  const answer = Object.keys(json.answer);
  const parts = new Set<string>();
  for (const src of [...(json.shape ?? []), ...Object.values(json.rules ?? {})]) {
    const e = parse(src);
    if (e.k !== "quant" || e.q !== "forall" || e.binders.length !== 1) continue;
    const [r] = e.binders;
    if (r.kind !== "in" || r.where !== null || r.of.k !== "name") continue;
    if (!env.regions.has(r.of.name)) continue;
    const b = e.body;
    if (b.k !== "agg" || b.fn !== "distinct" || b.where !== null) continue;
    if (b.binders.length !== 1) continue;
    const [c] = b.binders;
    const over = c.of;
    if (c.kind !== "in" || c.where !== null || over.k !== "call") continue;
    if (over.fn !== "cells" || over.args.length !== 1) continue;
    const [of] = over.args;
    if (of.k !== "name" || of.name !== r.name) continue;
    const t = b.term;
    if (t === null || t.k !== "call" || !answer.includes(t.fn)) continue;
    if (t.args.length !== 1 || t.args[0].k !== "name" || t.args[0].name !== c.name)
      continue;
    parts.add(r.of.name);
  }
  return [...parts];
}

/**
 * Holds a board of notes to the regions its walk reads: its rows and
 * columns, or the parts of partitions its rules hold distinct. Where a placed
 * value rules itself out of more than a row and a column, the description
 * words the walk's steps that say how far (`WALK_STEPS`), each over the terms
 * the walk supplies and the board's sizes.
 */
function checkWalkSteps(
  json: DescriptionJson,
  d: Description,
  distinctParts: readonly string[],
): void {
  const units = [...json.space.units].sort().join();
  if (units !== "" && units !== "cols,rows")
    throw new CompileError(
      `marks: the walk of the notes reads rows and columns, not ${json.space.units.join(", ")}`,
    );
  if (units === "cols,rows") return;
  if (distinctParts.length === 0)
    throw new CompileError(
      "marks: the walk of the notes reads no unit, and no partition a rule holds distinct",
    );
  const sizes = Object.keys(json.sizes ?? {}).filter((s) => s !== "w" && s !== "h");
  for (const [id, supplied] of Object.entries(WALK_STEPS)) {
    const step = d.steps.find((s) => s.id === id);
    if (step === undefined)
      throw new CompileError(
        `steps: ${id} is unworded, and the notes' reach is no row and column`,
      );
    if (step.ring !== "cell")
      throw new CompileError(`steps ${id}: the walk rings a cell`);
    for (const t of step.terms) {
      const kind = Object.hasOwn(supplied, t.name)
        ? (supplied as Readonly<Record<string, string>>)[t.name]
        : sizes.includes(t.name)
          ? "number"
          : null;
      if (kind === null)
        throw new CompileError(
          `steps ${id}: the walk supplies no term ${t.name} (${[...Object.keys(supplied), ...sizes].join(", ")})`,
        );
      if (t.kind !== kind)
        throw new CompileError(`steps ${id}: term ${t.name} is a ${kind}`);
    }
  }
}

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
  if (p.numbers !== undefined && json.answer.value.sort !== "cell")
    throw new CompileError("play numbers: the answer's value is not at a cell");
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
    modifiers,
    bounds,
    plain: _plain,
    sizes: _sizes,
    wash,
    ...rest
  } = p;
  if (rest.hides !== undefined && values[rest.hides.value] === undefined)
    throw new CompileError(
      `play hides: ${rest.hides.value} is not a value the player places`,
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
  // Notes are typed, a key a value, so only a board of numbers keeps them.
  const notes = noteMarkOf(json) !== null;
  // The walk of notes names a step by the arm that held, each a rung the
  // description gives the technique, or by its one rung.
  if (notes)
    for (const t of d.techniques) {
      if (t.id.includes(".") || t.says === null) continue;
      const arms = t.says.variants.flatMap((v) => (v.name === null ? [] : [v.name]));
      if (arms.length === 0 && t.rungs.length > 1)
        throw new CompileError(
          `${t.id}: its steps are recorded under one rung, and it has ${t.rungs.length}: arms named for them choose`,
        );
      for (const arm of arms)
        if (t.rungs.length > 0 && !t.rungs.includes(arm))
          throw new CompileError(
            `${t.id}: a step of arm ${arm} is no rung of the technique's (${t.rungs.join(", ")})`,
          );
    }
  if (!notes)
    for (const t of d.techniques)
      if (t.says?.byValue === true)
        throw new CompileError(
          `${t.id}: says shown value, and the board keeps no notes`,
        );
  if (notes && p.numbers === undefined)
    throw new CompileError(
      "marks: candidate notes are a board of numbers', and play has no `numbers`",
    );
  // A board of numbers holds no strike but in its notes: a step that only
  // strikes would be no move.
  if (!notes && p.numbers !== undefined)
    for (const t of d.techniques)
      if (t.on === null && concludes(t.conclude, "strike", env))
        throw new CompileError(
          `technique ${t.id}: it strikes, and a board of numbers strikes only in notes \`marks\` declares`,
        );
  if (!notes && p.hintNotes !== undefined)
    throw new CompileError(
      "play hintNotes: the hint reads notes, and `marks` declares none",
    );
  const distinctParts = notes ? distinctPartsOf(json, env) : [];
  if (notes) checkWalkSteps(json, d, distinctParts);
  checkSigns(p, d, env);
  // A clue at an edge is drawn in the gap between its cells, and only there.
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
  // A clue is marked done by a press where it is drawn, and the engine finds
  // a press on a clue in a gap, at a slot or on one at a part alone; the
  // press goes to the board of numbers' input, which takes no press off its
  // squares of its own.
  for (const k of Object.keys(p.done ?? {})) {
    const at = d.clueKinds.get(k)?.at ?? "";
    if (p.gaps?.[k] === undefined && !env.regions.has(at) && at !== "slot")
      throw new CompileError(
        `play done: ${k} is no clue kind drawn in a gap, at a slot or at a part, the places a press marks a clue done`,
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
  const atLines = [...d.clueKinds].filter(([, c]) => c.at === "line").map(([k]) => k);
  const isList = (k: string) => (env.clues.get(k) as ClueKind).list;
  const lineClues = atLines.filter((k) => !isList(k));
  const lineLists = atLines.filter(isList);
  const slotClues = [...d.clueKinds].filter(([, c]) => c.at === "slot").map(([k]) => k);
  if (slotClues.length > 0 && (lineClues.length > 0 || lineLists.length > 0))
    throw new CompileError(
      `clue ${slotClues[0]}: a clue at a slot is drawn in the margins, where a line's clue is`,
    );
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
    ...(modifiers === undefined
      ? []
      : [
          "",
          "/** The variations the player may switch on, by name (`engine/fill/game-id.ts`). */",
          `export const modifiers = ${JSON.stringify(checkedModifiers(json, modifiers))} as const;`,
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

/** A board's `WxH` as its size, each size beyond the grid's it gives after
 * it by its params letter (`8x8s2`, two stars), a size it does not name at
 * its least, and each deal option it names by its letter (`7x7s4`). A letter
 * that is neither's is refused. */
const sizeOf =
  (json: DescriptionJson) =>
  (
    b: string,
  ): {
    w: number;
    h: number;
    sizes?: Record<string, number>;
    options?: Record<string, number>;
    tally?: number;
  } => {
    const m = /^(\d+)x(\d+)((?:[a-z]\d+|[A-Za-z](?!\d))*)$/.exec(b);
    if (m === null) throw new CompileError(`play boards: ${b} is not WxH`);
    const sizes: Record<string, number> = Object.fromEntries(
      Object.keys(json.play?.sizes ?? {}).map((n) => [n, json.sizes[n]?.min ?? 0]),
    );
    const options: Record<string, number> = {};
    let tally: number | null = null;
    for (const [, letter, n] of m[3].matchAll(/([A-Za-z])(\d*)/g)) {
      // A bare letter is a ruleset written by its own (`6x6T`, Tectonic).
      if (n === "") {
        const bare = Object.entries(json.play?.sizes ?? {}).find(([, s]) =>
          s.letters?.includes(letter),
        );
        if (bare === undefined)
          throw new CompileError(`play boards: ${b}: ${letter} is no ruleset's letter`);
        const [name, s] = bare;
        sizes[name] = (json.sizes[name]?.min ?? 0) + (s.letters ?? []).indexOf(letter);
        continue;
      }
      if (letter === json.play?.tally?.size.letter) {
        tally = Number(n);
        continue;
      }
      const named = Object.entries(json.play?.sizes ?? {}).find(
        ([, s]) => s.letter === letter,
      );
      const option = Object.entries(optionsOf(json)).find(
        ([, o]) => o.letter === letter,
      );
      if (named !== undefined) sizes[named[0]] = Number(n);
      else if (option !== undefined) options[option[0]] = Number(n);
      else
        throw new CompileError(
          `play boards: ${b}: ${letter} is no size's letter or option's`,
        );
    }
    return {
      w: Number(m[1]),
      h: Number(m[2]),
      ...(Object.keys(sizes).length === 0 ? {} : { sizes }),
      ...(Object.keys(options).length === 0 ? {} : { options }),
      ...present("tally", tally),
    };
  };

/** The Custom field of the deal's setting `key`, where it states one. */
function dealSettingKw(json: DescriptionJson, key: string): string | null {
  const f = json.deal?.[key];
  return typeof f === "object" && f !== null && "kw" in f && typeof f.kw === "string"
    ? f.kw
    : null;
}

/**
 * `menu`, what the preset menu offers beside its grid of `boards`: the
 * default board where it is not the first, the tiers a board stops at, and
 * the variant boards, a tier by its index. Nothing where the description
 * states none. A board not in `boards`, a tier not in `tiers` or a variation
 * the description lacks is refused.
 */
function menuOf(
  json: DescriptionJson,
  p: Pick<PlayJson, "boards" | "boardTiers" | "variants" | "defaultTier"> & {
    byDefault?: string;
  },
): string[] {
  const { boards, byDefault, defaultTier, boardTiers, variants } = p;
  if (
    byDefault === undefined &&
    defaultTier === undefined &&
    boardTiers === undefined &&
    variants === undefined
  )
    return [];
  const tiers = json.tiers ?? [];
  const tierOf = (name: string, where: string): number => {
    const i = tiers.indexOf(name);
    if (i < 0) throw new CompileError(`play ${where}: ${name} is no tier`);
    return i;
  };
  const board = (b: string, where: string) => {
    if (!boards?.includes(b))
      throw new CompileError(`play ${where}: ${b} is not in boards`);
    return sizeOf(json)(b);
  };
  // The default board is offered at its tier.
  const first = boards?.[0];
  const offered = boardTiers?.[byDefault ?? first ?? ""] ?? [tiers[0], tiers.at(-1)];
  const dealtAt = defaultTier === undefined ? null : tierOf(defaultTier, "defaultTier");
  if (
    dealtAt !== null &&
    (dealtAt < tierOf(offered[0] ?? "", "defaultTier") ||
      dealtAt > tierOf(offered[1] ?? "", "defaultTier"))
  )
    throw new CompileError(
      `play defaultTier: the menu does not offer the default board at ${defaultTier}`,
    );
  const menu = {
    ...(byDefault === undefined ? {} : { default: board(byDefault, "default") }),
    ...present("defaultTier", dealtAt),
    tiers: Object.entries(boardTiers ?? {}).map(([b, [first, last]]) => ({
      ...board(b, "boardTiers"),
      first: tierOf(first, "boardTiers"),
      last: tierOf(last, "boardTiers"),
    })),
    variants: (variants ?? []).map((v) => {
      // A deal's setting is named by its Custom field, a variation by its name.
      const settings = Object.entries({
        only: onlyFlagOf(json)?.kw ?? null,
        hides: dealSettingKw(json, "hideFlag"),
      }).filter(([, kw]) => kw !== null && v.with.includes(kw));
      const variations = v.with.filter(
        (name) => !settings.some(([, kw]) => kw === name),
      );
      for (const name of variations)
        if (json.variations?.[name] === undefined)
          throw new CompileError(`play variants: ${name} is no variation or setting`);
      return {
        ...board(v.board, "variants"),
        variations,
        ...Object.fromEntries(settings.map(([field]) => [field, true])),
        diff: tierOf(v.tier, "variants"),
      };
    }),
  };
  return [
    "",
    "/** The preset menu beside its grid: the default board, the tiers a board",
    " * stops at, and the variant boards. */",
    `export const menu = ${JSON.stringify(menu)} as const;`,
  ];
}

/**
 * `bounds`, what the sizes alone cannot say of a board (`play.bounds`), a
 * tier's by its index. Nothing where the description states none; a tier
 * not in `tiers` is refused.
 */
function boundsOf(json: DescriptionJson, bounds: PlayJson["bounds"]): string[] {
  if (bounds === undefined) return [];
  const { tiers: byTier, ...all } = bounds;
  const tiers = json.tiers ?? [];
  const out = {
    all,
    tiers: Object.entries(byTier ?? {}).map(([name, b]) => {
      const tier = tiers.indexOf(name);
      if (tier < 0) throw new CompileError(`play bounds: ${name} is no tier`);
      return { tier, ...b };
    }),
  };
  return [
    "",
    "/** What the sizes alone cannot say of a board, and of a board of a tier. */",
    `export const bounds = ${JSON.stringify(out)} as const;`,
  ];
}

/** The modifiers, each a variation the description has that only adds: a
 * ruleset would need a choice, which no fill game offers yet. */
function checkedModifiers(
  json: DescriptionJson,
  modifiers: NonNullable<PlayJson["modifiers"]>,
): NonNullable<PlayJson["modifiers"]> {
  const letters = new Set<string>();
  for (const [name, m] of Object.entries(modifiers)) {
    const v = json.variations?.[name];
    if (v === undefined)
      throw new CompileError(`play modifiers: ${name} is no variation`);
    if (v.replace !== undefined)
      throw new CompileError(`play modifiers: ${name} replaces, so it is a ruleset`);
    if (m.letter === "d" || letters.has(m.letter))
      throw new CompileError(`play modifiers: the letter ${m.letter} is taken`);
    letters.add(m.letter);
  }
  // The board passes the variations after its clues, which an answer check
  // takes only where it reads one.
  if (Object.keys(json.clues ?? {}).length === 0)
    throw new CompileError("play modifiers: a fill game with variations deals a clue");
  return modifiers;
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
    `export function domainOf(${param("sp", "GridSpace", body)}, _cl: Dealt, _c: number): number {`,
    ...body,
    "}",
  ];
}

/** The values a kind's `range(lo, hi)` states, where both are numbers. */
function valuesOf(d: Description, kind: string): number[] | null {
  const c = d.clueKinds.get(kind);
  if (c === undefined) throw new CompileError(`id: no clue kind ${kind}`);
  return c.value !== null &&
    c.value.k === "call" &&
    c.value.args.every((a) => a.k === "num")
    ? c.value.args.map((a) => (a.k === "num" ? a.v : 0))
    : null;
}

/** Whether a kind is a cell's one-valued marker, which says where a clue is
 * and never its value: one value, 0. */
function markerKind(d: Description, kind: string): boolean {
  return d.clueKinds.get(kind)?.at === "cell" && valuesOf(d, kind)?.join() === "0,0";
}

/** Whether a kind is valued 0 or 1 at every element (Adjacent's bar), so a
 * record writes where it is 1 alone. */
function flagKind(d: Description, kind: string): boolean {
  return (
    d.clueKinds.get(kind)?.complete === true && valuesOf(d, kind)?.join() === "0,1"
  );
}

/** Whether a clue kind's value is one of the board's elements (a sign's
 * greater end), not a number. */
const isElement = (env: Env, kind: string): boolean =>
  env.clues.get(kind)?.v.k === "elem";

/** Refuses a `codes` segment whose kinds sit at different places, or at a
 * part, whose code a clue could be written by two ways, or that leaves a
 * value of a kind no code writes. */
function checkCodes(codes: Readonly<Record<string, string>>, d: Description, env: Env) {
  const said = Object.entries(codes).map(([code, s]) => ({ code, ...codeOf(s) }));
  const ats = new Set(said.map((s) => d.clueKinds.get(s.kind)?.at));
  const [at] = ats;
  if (at === undefined || ats.size > 1 || env.regions.has(at) || at === "board")
    throw new CompileError(
      "id: codes of kinds that are not all clues at one place of the space",
    );
  for (const { code, kind, value } of said) {
    if (isElement(env, kind))
      throw new CompileError(
        `id: the code ${code} of ${kind}, which is valued an element`,
      );
    const vs = valuesOf(d, kind);
    if (value !== null && vs !== null && (value < vs[0] || value > vs[1]))
      throw new CompileError(
        `id: the code ${code}, ${kind} ${value}, which it cannot be`,
      );
  }
  // A kind is written by its number after its code, or wholly by the codes
  // of each of its values.
  const kinds = new Set(said.map((s) => s.kind));
  for (const kind of kinds) {
    const numbered = said.filter((s) => s.kind === kind && s.value === null).length;
    const whole = said.filter((s) => s.kind === kind && s.value !== null);
    const vs = valuesOf(d, kind);
    if (numbered > 1)
      throw new CompileError(`id: ${kind} has ${numbered} codes its number follows`);
    if (new Set(whole.map((s) => s.value)).size !== whole.length)
      throw new CompileError(`id: two codes of one value of ${kind}`);
    if (numbered === 0 && (vs === null || whole.length !== vs[1] - vs[0] + 1))
      throw new CompileError(`id: a value of ${kind} that no code writes`);
  }
}

/** The least of a `range(lo, hi)` whose `lo` is a number; `-1` otherwise. */
const lowBound = (value: Expr | null): number =>
  value?.k === "call" && value.args[0]?.k === "num" ? value.args[0].v : -1;

/** The most of a `range(lo, hi)` whose `hi` is a size, at the size's most;
 * `Infinity` where it is anything else or the size has no most. */
const sizeBound = (value: Expr | null, sizes: Readonly<Record<string, SizeRange>>) => {
  const hi = value?.k === "call" ? value.args[1] : undefined;
  return hi?.k === "name" ? (sizes[hi.name]?.max ?? Infinity) : Infinity;
};

/** The most of a `range(1, |cells(P(at))|)`, the numbers of a cell's part
 * of a partition the deal divides to drawn sizes: the largest size drawn;
 * `null` where the value is anything else. */
function partBound(value: Expr | null, json: DescriptionJson): number | null {
  const divide = divideOf(json);
  if (divide === null || !("sizes" in divide) || value === null) return null;
  const hi = value.k === "call" && value.fn === "range" ? value.args[1] : undefined;
  const ofPart =
    hi?.k === "size" &&
    hi.of.k === "call" &&
    hi.of.fn === "cells" &&
    hi.of.args[0]?.k === "call" &&
    hi.of.args[0].fn === divide.partition;
  return ofPart ? Math.max(...divide.sizes.flat()) : null;
}

/** Refuses an `id:` segment that cannot write the kind it names. */
function checkSegments(
  id: readonly IdSegmentJson[],
  d: Description,
  env: Env,
  sizes: Readonly<Record<string, SizeRange>>,
  json: DescriptionJson,
): void {
  for (const [i, seg] of id.entries()) {
    const [kind, ...more] = segmentKinds(seg);
    if ("walls" in seg || "blocks" in seg) {
      if (!env.regions.has(kind))
        throw new CompileError(`id: walls of ${kind}, which is no dealt partition`);
      continue;
    }
    if ("parts" in seg) {
      if (!env.regions.has(seg.parts))
        throw new CompileError(
          `id: parts of ${seg.parts}, which is no dealt partition`,
        );
      // A part holds one clue, so its letter says its kind.
      for (const k of segmentKinds(seg)) {
        const at = d.clueKinds.get(k)?.at;
        if (at !== seg.parts || isElement(env, k))
          throw new CompileError(
            `id: parts' letter for ${k}, which is no number at a part of ${seg.parts}`,
          );
      }
      // Each part is written after the partition, which says where it is.
      const blocks = id.findIndex(
        (s) =>
          ("blocks" in s && s.blocks === seg.parts) ||
          ("walls" in s && s.walls === seg.parts),
      );
      if (blocks < 0 || blocks > i)
        throw new CompileError(`id: parts of ${seg.parts} before the partition itself`);
      continue;
    }
    if ("codes" in seg) {
      checkCodes(seg.codes, d, env);
      continue;
    }
    const c = d.clueKinds.get(kind);
    if (c === undefined) throw new CompileError(`id: no clue kind ${kind}`);
    if ("records" in seg) {
      // 0 is a record's cell with no clue, so no clue is 0.
      const lo = c.value?.k === "call" ? c.value.args[0] : undefined;
      if (c.at !== "cell" || isElement(env, kind) || lo?.k !== "num" || lo.v < 1)
        throw new CompileError(
          `id: records of ${kind}, which is not a cell's number from 1 up`,
        );
      const sides = d.clueKinds.get(seg.sides);
      if (
        sides?.at !== "edge" ||
        !(isElement(env, seg.sides) || flagKind(d, seg.sides))
      )
        throw new CompileError(
          `id: sides of ${seg.sides}, which is not an edge's clue valued one of its ends, nor 0 or 1 at every edge`,
        );
      continue;
    }
    // Only a record says which end of an edge a clue is valued.
    if (isElement(env, kind))
      throw new CompileError(
        `id: ${kind} is valued an element, which only a record's sides write`,
      );
    const values = valuesOf(d, kind);
    if ("runs" in seg && !markerKind(d, kind))
      throw new CompileError(
        `id: runs of ${kind}, which is not a cell's one-valued marker`,
      );
    const after = "digits" in seg ? (seg.after ?? {}) : {};
    for (const m of more)
      if (!Object.values(after).includes(m) && !markerKind(d, m))
        throw new CompileError(
          `id: the letter of ${m}, which is not a cell's one-valued marker`,
        );
    if ("digits" in seg) {
      for (const letter of Object.keys(seg.letters ?? {}))
        if (seg.apart === letter)
          throw new CompileError(`id: the letter ${letter} is the digits' apart`);
      // The segment behind its mark is written where its own kind has a
      // clue, so it holds no other kind's.
      if (
        seg.before !== undefined &&
        more.length + Object.keys(seg.also ?? {}).length > 0
      )
        throw new CompileError(
          `id: digits of ${kind} after ${seg.before}, written only where ${kind} has a clue, and another kind in the segment`,
        );
      // A letter's number is one digit, written straight after it.
      for (const [letter, k] of Object.entries(after)) {
        const vs = valuesOf(d, k);
        if (seg.letters?.[letter] === undefined)
          throw new CompileError(`id: a number after ${letter}, which is no letter`);
        if (d.clueKinds.get(k)?.at !== "cell" || vs === null || vs[0] < 0 || vs[1] > 9)
          throw new CompileError(
            `id: digits of ${k} after ${letter}, which is not a cell's clue of the values 0 to 9`,
          );
      }
      // A number another kind is written as is past every one of the
      // segment's own.
      for (const n of Object.keys(seg.also ?? {}))
        if (values === null || Number(n) <= values[1])
          throw new CompileError(
            `id: ${n} written for another kind, which a clue of ${kind} may be`,
          );
    }
    // A dot run's case is its value, one of two.
    if (
      "dots" in seg &&
      (c.at !== "cell" ||
        values === null ||
        values[1] - values[0] !== 1 ||
        [...seg.cases].sort().join() !== values.join())
    )
      throw new CompileError(
        `id: dots of ${kind}, which is not a cell's clue of the values ${seg.cases.join(" and ")}`,
      );
    if ("dots" in seg && i !== id.length - 1)
      throw new CompileError(`id: dots of ${kind} end the desc, and come last`);
    // A digit is a clue's value, so every value is one, the most a size
    // bounds it by too (Mathrax's givens, to `w`); with a mark between two
    // side by side, a clue is a whole number of any size.
    const top = values?.[1] ?? partBound(c.value, json) ?? sizeBound(c.value, sizes);
    if (
      "digits" in seg &&
      seg.apart === undefined &&
      (c.at !== "cell" || (values?.[0] ?? lowBound(c.value)) < 0 || top > 9)
    )
      throw new CompileError(
        `id: digits of ${kind}, which is not a cell's clue of the values 0 to 9`,
      );
    if ("cells" in seg && c.at !== "cell")
      throw new CompileError(`id: cells of ${kind}, which is not a cell's clue`);
    if ("digits" in seg && seg.apart !== undefined && c.at !== "cell")
      throw new CompileError(`id: digits of ${kind}, which is not a cell's clue`);
  }
}

/**
 * `deal`, what the engine deals a fill game's board by and writes its game
 * ID with: the sample, the codec's segments, the tiers' letters and the
 * sizes; and `clueMax`, each clue kind's largest value at an element, from
 * its `value: range(lo, hi)`, which bounds what a game ID may say. Nothing
 * where there is no `play:`.
 */
/** The grid's hexagon, its outside kind held to be a cell's marker. */
function hexagonOf(
  json: DescriptionJson,
  isMarker: (kind: string) => boolean,
): { outside: string } | null {
  const hexagon = json.space.grid?.hexagon;
  if (hexagon === undefined) return null;
  if (!isMarker(hexagon.outside))
    throw new CompileError(
      `space hexagon: outside ${hexagon.outside}, which is not a cell's one-valued marker`,
    );
  return hexagon;
}

/** Refuses an ID that names a clue kind or partition other than once. A
 * hexagon's corners hold its `outside` kind unwritten, so the ID may name it
 * nowhere. */
function checkNamed(
  id: readonly IdSegmentJson[],
  kinds: readonly string[],
  outside: string | null,
): void {
  const named = id.flatMap(segmentKinds);
  for (const kind of kinds) {
    const n = named.filter((k) => k === kind).length;
    if (n !== 1 && !(n === 0 && kind === outside))
      throw new CompileError(`id: clue kind or partition ${kind} is not named once`);
  }
}

/** The retired tier letters, each the index of the tier it reads as. */
function tierAliasesOf(
  json: DescriptionJson,
  tiers: readonly string[],
  tierLetters: string,
): Record<string, number> | null {
  if (json.tierAliases === undefined) return null;
  return Object.fromEntries(
    Object.entries(json.tierAliases).map(([letter, tier]) => {
      if (tierLetters.includes(letter))
        throw new CompileError(`tierAliases: ${letter} is a tier's own letter`);
      return [letter, tierIndex(tiers, tier, "tierAliases")];
    }),
  );
}

/** The value a sample lays, 0 where it lays no one value: it builds the
 * answer, draws a Latin square, or searches one. */
function sampledValue(sample: SampleJson | null): number {
  if (sample === null || "build" in sample || "latin" in sample || "search" in sample)
    return 0;
  if ("dominoes" in sample) return sample.dominoes.value;
  if ("lines" in sample) return sample.lines.value;
  if ("picture" in sample) return sample.picture.value;
  if ("pieces" in sample) return sample.pieces.value;
  return sample.scatter.value;
}

/** `{ [key]: value }` to spread into a module's object, or nothing where
 * `value` is absent, so the module holds no `null` field. */
function present<K extends string, V>(key: K, value: V | null): Partial<Record<K, V>> {
  return value === null ? {} : ({ [key]: value } as Record<K, V>);
}

export function dealOf(
  json: DescriptionJson,
  d: Description,
  env: Env,
  measured: (e: Expr) => Expr,
): string[] {
  if (json.play === undefined) return [];
  const kinds = [...d.clueKinds.keys()];
  const partitions = [...env.regions];
  const id =
    json.id ?? kinds.map((k, i) => ({ numbers: k, ...(i > 0 ? { before: "," } : {}) }));
  const isMarker = (kind: string): boolean => markerKind(d, kind);
  const hexagon = hexagonOf(json, isMarker);
  // The tally is the params', which the ID does not write.
  const written = kinds.filter((k) => k !== json.play?.tally?.kind);
  checkNamed(id, [...written, ...partitions], hexagon?.outside ?? null);
  checkSegments(id, d, env, json.sizes, json);
  const { hide, hideFirst, hideFrom, hideWhole } = hideOf(json, d);
  const hides = hide !== null;
  const thorough = thoroughOf(json);
  if (thorough !== null) {
    if (!hides)
      throw new CompileError(
        "deal thorough: a setting of how the deal hides, and no hide",
      );
    const taken = [
      "d",
      ...Object.values(json.play?.modifiers ?? {}).map((m) => m.letter),
    ];
    if (taken.includes(thorough.letter))
      throw new CompileError(`deal thorough: the letter ${thorough.letter} is taken`);
  }
  const stripFrom = json.deal?.["stripFrom"];
  if (stripFrom !== undefined && (stripFrom !== "everyClue" || !hides))
    throw new CompileError("deal stripFrom: everyClue, where the deal hides");
  const symmetric = json.deal?.["symmetric"];
  if (symmetric !== undefined && typeof hide !== "string")
    throw new CompileError(
      "deal symmetric: the symmetry of the clues left, and no hide of one kind",
    );
  const tiers = json.tiers ?? [];
  const tierLetters =
    json.tierLetters ?? tiers.map((t) => t[0]?.toLowerCase() ?? "").join("");
  if (tierLetters.length !== tiers.length || new Set(tierLetters).size !== tiers.length)
    throw new CompileError(`tierLetters: ${tierLetters} is not one letter a tier`);
  // A clue a fill game deals sits at a cell, a line, a slot beyond a line's
  // end, an edge, a corner or a dealt partition's part; the tally, the
  // params' clue at the board, is none it deals.
  const universes = Object.fromEntries(
    [...d.clueKinds]
      .filter(([k]) => k !== json.play?.tally?.kind)
      .map(([k, c]) => {
        const u = env.regions.has(c.at) ? "parts" : UNIVERSE[c.at];
        if (u === undefined)
          throw new CompileError(
            `clue ${k}: a fill game's clue sits at a cell, a line, a slot, an edge, a corner or a part`,
          );
        return [k, u];
      }),
  );
  const sample = sampleOf(json);
  const grow = growOf(json);
  const divide = divideOf(json);
  if (divide !== null && grow !== null)
    throw new CompileError("deal divide: a partition grown, and one divided");
  if (grow !== null) {
    if (!env.regions.has(grow.partition))
      throw new CompileError(`deal grow: ${grow.partition} is no dealt partition`);
    if (sampledValue(sample) === 0)
      throw new CompileError("deal grow: a partition is grown round a sampled value");
    if (grow.closed !== undefined && grow.closed.oneIn.length !== tiers.length)
      throw new CompileError("deal grow: closed oneIn is not one number a tier");
  }
  if (divide !== null && !env.regions.has(divide.partition))
    throw new CompileError(`deal divide: ${divide.partition} is no dealt partition`);
  // The answer is searched under a partition dealt before it.
  if (sample !== null && "search" in sample && divide === null)
    throw new CompileError(
      "deal sample: an answer searched under no divided partition",
    );
  for (const r of env.regions)
    if (grow?.partition !== r && divide?.partition !== r)
      throw new CompileError(
        `${r}: a fill game's dealt partition is one the deal grows or divides`,
      );
  const oneKind = oneKindDeal(json, d, divide?.partition ?? null);
  const settings = settingsOf(json, env);
  const divided = divideDeal(divide, settings);
  if (sample !== null && "lines" in sample) {
    const { count } = sample.lines;
    if (typeof count === "string" && !settings.some((s) => s.size === count))
      throw new CompileError(`deal sample: ${count} is no size the params give`);
  }
  const unpair = json.deal?.["unpair"];
  if (unpair !== undefined) {
    if (typeof unpair !== "string" || d.clueKinds.get(unpair)?.at !== "cell")
      throw new CompileError(
        `deal unpair: ${String(unpair)} is no clue kind at a cell`,
      );
    if (hides)
      throw new CompileError(
        "deal unpair: a board's answer is the ladder's, and a hide",
      );
    const s = sampleOf(json);
    if (s === null || !("scatter" in s) || s.climb !== true)
      throw new CompileError("deal unpair: a board unpaired is graded by a climb");
  }
  const latin = latinOf(json, d);
  if (sample !== null && "scatter" in sample) {
    if ((sample.mend === true || sample.climb === true) && sample.scatter.each !== true)
      throw new CompileError(
        "deal sample: a mend and a climb redraw a cell at a time, so take `each`",
      );
    if (sample.climb === true && hides)
      throw new CompileError(
        "deal sample: a climb keeps what the ladder decided, and a hide",
      );
    if (
      sample.first !== undefined &&
      (sample.scatter.each !== true || sample.climb === true)
    )
      throw new CompileError(
        "deal sample: first cells are kept by a scatter of `each` that does not climb",
      );
  }
  const options = optionsJsonOf(json, tiers, [
    ...settings.flatMap(settingLetters),
    ...(thorough === null ? [] : [thorough.letter]),
    ...Object.values(json.play?.modifiers ?? {}).map((m) => m.letter),
  ]);
  if (sample !== null && "first" in sample && sample.first !== undefined) {
    const { share, symmetry } = sample.first;
    if (options[share] === undefined || options[share].choices !== undefined)
      throw new CompileError(
        `deal sample first: ${share} is no number the options give`,
      );
    if (options[symmetry]?.choices?.length !== SYMMETRIES)
      throw new CompileError(
        `deal sample first: ${symmetry} is no option of the ${SYMMETRIES} symmetries`,
      );
    if (!hides && "build" in sample)
      throw new CompileError(
        "deal sample first: the build is on the first cells' clues with every hidden one hidden, and no hide",
      );
  }
  const tierFlag =
    json.tierFlag === undefined
      ? null
      : {
          letter: json.tierFlag.letter,
          tier: tierIndex(tiers, json.tierFlag.tier, "tierFlag"),
        };
  if (
    tierFlag !== null &&
    [...Object.values(options).map((o) => o.letter), "d"].includes(tierFlag.letter)
  )
    throw new CompileError(`tierFlag: the letter ${tierFlag.letter} is taken`);
  const unusedLetters = json.unusedLetters ?? null;
  const firstKind = firstKindOf(json, d);
  const kindLetters = kindLettersOf(json, d);
  const taken = [
    ...settings.flatMap(settingLetters),
    ...Object.values(options).map((o) => o.letter),
    ...(thorough === null ? [] : [thorough.letter]),
    ...Object.values(json.play?.modifiers ?? {}).map((m) => m.letter),
    ...(tierFlag === null ? [] : [tierFlag.letter]),
    ...(oneKind?.only == null ? [] : [oneKind.only.letter]),
    ...(kindLetters ?? []).map((l) => l.letter),
    "d",
  ];
  if (
    oneKind?.only != null &&
    taken.filter((l) => l === oneKind.only?.letter).length > 1
  )
    throw new CompileError(`deal onlyFlag: the letter ${oneKind.only.letter} is taken`);
  for (const { letter } of kindLetters ?? [])
    if (taken.filter((l) => l === letter).length > 1)
      throw new CompileError(`deal kindLetters: the letter ${letter} is taken`);
  for (const letter of Object.keys(unusedLetters ?? {}))
    if (taken.includes(letter))
      throw new CompileError(`unusedLetters: the letter ${letter} is taken`);
  const tierAliases = tierAliasesOf(json, tiers, tierLetters);
  const { grid } = json.space;
  const deal = {
    ...(grid !== undefined && grid.w === grid.h ? { square: true } : {}),
    ...(hexagon === null ? {} : { hexagon }),
    ...(settings.length === 0 ? {} : { settings }),
    ...(Object.keys(options).length === 0 ? {} : { options }),
    sample,
    ...(hides ? { hide } : {}),
    ...present("hideFirst", hideFirst),
    ...present("hideFrom", hideFrom),
    ...present("hideWhole", hideWhole),
    ...(stripFrom === undefined ? {} : { stripFrom }),
    ...present("tierFlag", tierFlag),
    ...present("unusedLetters", unusedLetters),
    ...present("tierAliases", tierAliases),
    ...(typeof unpair === "string" ? { unpair } : {}),
    ...present("latin", latin),
    ...present("tally", tallyOf(json, tiers)),
    ...present("hideFlag", hideFlagOf(json, d, hides)),
    ...(symmetric === undefined ? {} : { symmetric }),
    ...present("thorough", thorough),
    ...present("divide", divided),
    ...(oneKind === null ? {} : { oneKind: oneKind.deal }),
    ...present("onlyFlag", oneKind?.only ?? null),
    ...present("firstKind", firstKind),
    ...present("kindLetters", kindLetters),
    ...(grow === null
      ? {}
      : {
          grow: {
            partition: grow.partition,
            value: sampledValue(sample),
            ...(grow.closed === undefined ? {} : { closed: grow.closed }),
          },
        }),
    // A record's sides of a kind valued 0 or 1 are written from both ends.
    id: id.map((seg) =>
      "records" in seg && flagKind(d, seg.sides) ? { ...seg, both: true } : seg,
    ),
    universes,
    ...(partitions.length === 0 ? {} : { partitions }),
    tierLetters,
    sizes: json.sizes,
  };
  const max: string[] = [];
  // Each kind's smallest value, which the ID refuses below.
  const least: Record<string, number> = {};
  for (const [kind, c] of d.clueKinds) {
    if (kind === json.play?.tally?.kind) continue;
    const sorts = env.clues.get(kind) as ClueKind;
    // A value that is one of the board's elements (a sign's greater end) is
    // written by where it lies, never as a number.
    if (sorts.v.k === "elem") continue;
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
    const [lo] = range.args;
    if (lo.k !== "num")
      throw new CompileError(
        `clue ${kind}: a fill game's clue values start at a number`,
      );
    least[kind] = lo.v;
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
    // A part's cells are the partition's, which the clues read so far hold.
    max.push(
      `  ${kind}(${param("sp", "GridSpace", body)}, ${param("at", "number", body)}, ${param("cl", "Dealt", body)}): number {`,
      ...body,
      "  },",
    );
  }
  return [
    "",
    "/** How the engine deals the board and writes its game ID. */",
    `export const deal = ${JSON.stringify({ ...deal, least })} as const;`,
    "",
    "/** Each clue kind's largest value at an element. */",
    "export const clueMax = {",
    ...max,
    "};",
    ...(grow === null ? [] : growByOf(grow, env)),
    ...(oneKind === null ? [] : suitsOf(oneKind.json, env, measured, tiers)),
  ];
}

/** `deal.oneKind`'s kinds, at the partition the deal divides, with the
 * setting that deals some alone; `null` where the deal deals every clue it
 * derives. */
function oneKindDeal(
  json: DescriptionJson,
  d: Description,
  partition: string | null,
): {
  json: OneKindJson;
  deal: { kinds: readonly string[]; partition: string };
  only: (Omit<OnlyFlagJson, "kinds"> & { kinds: readonly string[] }) | null;
} | null {
  const one = oneKindOf(json);
  const only = onlyFlagOf(json);
  if (one === null) {
    if (only !== null)
      throw new CompileError("deal onlyFlag: a setting of oneKind, and none");
    return null;
  }
  if (partition === null)
    throw new CompileError(
      "deal oneKind: kinds at the parts of a partition the deal divides",
    );
  for (const k of one.kinds)
    if (d.clueKinds.get(k)?.at !== partition)
      throw new CompileError(
        `deal oneKind: ${k} is no clue kind at a part of ${partition}`,
      );
  // Every clue at a part is one of them, as a part holds one.
  for (const [k, c] of d.clueKinds)
    if (c.at === partition && !one.kinds.includes(k))
      throw new CompileError(
        `deal oneKind: ${k} sits at a part, and is none of its kinds`,
      );
  for (const k of [...Object.keys(one.poor ?? {}), ...Object.keys(one.never ?? {})])
    if (!one.kinds.includes(k))
      throw new CompileError(`deal oneKind: ${k} is none of its kinds`);
  for (const k of only?.kinds ?? [])
    if (!one.kinds.includes(k))
      throw new CompileError(`deal onlyFlag: ${k} is none of oneKind's kinds`);
  return {
    json: one,
    deal: { kinds: one.kinds, partition },
    only,
  };
}

/** `deal.firstKind`: kinds at one place other than a part, where a part's
 * one clue is `oneKind`'s; `null` where there is none. */
function firstKindOf(json: DescriptionJson, d: Description): readonly string[] | null {
  const kinds = firstKindJsonOf(json);
  if (kinds === null) return null;
  const places = new Set(kinds.map((k) => d.clueKinds.get(k)?.at));
  for (const k of kinds) {
    const c = d.clueKinds.get(k);
    if (c === undefined) throw new CompileError(`deal firstKind: no clue kind ${k}`);
    if (c.complete)
      throw new CompileError(
        `deal firstKind: ${k} is complete, a clue at every element`,
      );
  }
  if (places.size !== 1 || kinds.length < 2)
    throw new CompileError("deal firstKind: two kinds or more, at one place");
  return kinds;
}

/** `deal.kindLetters`: each a kind of clue the deal deals, and a kind the
 * board's own rules read none of; `null` where there are none. */
function kindLettersOf(
  json: DescriptionJson,
  d: Description,
): readonly KindLetterJson[] | null {
  const letters = kindLettersJsonOf(json);
  if (letters === null) return null;
  for (const { kind } of letters) {
    const c = d.clueKinds.get(kind);
    if (c === undefined)
      throw new CompileError(`deal kindLetters: no clue kind ${kind}`);
    if (c.complete || kind === "given")
      throw new CompileError(`deal kindLetters: ${kind} is dealt whatever the params`);
  }
  if (new Set(letters.map((l) => l.kind)).size !== letters.length)
    throw new CompileError("deal kindLetters: a kind named twice");
  if (new Set(letters.map((l) => l.letter)).size !== letters.length)
    throw new CompileError("deal kindLetters: a letter named twice");
  return letters;
}

/**
 * `suits(sp, cl, kind, at, v, tier)`: how well a clue of `kind` valued `v`
 * suits part `at` on a board of tier `tier`, by `deal.oneKind`'s formulas: 0
 * where `never` refuses it, 1 where it is `poor` (from its tier), else 2.
 */
function suitsOf(
  one: OneKindJson,
  env: Env,
  measured: (e: Expr) => Expr,
  tiers: readonly string[],
): string[] {
  const scratch: string[] = [];
  const out = new Out(1);
  const henv = answerEnv(env, { yes: false }, scratch);
  const scope = (kind: string) => {
    const sorts = env.clues.get(kind) as ClueKind;
    return new Map<string, Val>([
      ["at", { code: "at", sort: sorts.at }],
      ["v", { code: "v", sort: sorts.v }],
    ]);
  };
  const test = (kind: string, src: string, what: string): string => {
    const e = compileExpr(measured(parse(src)), scope(kind), henv, out);
    expect(e, "bool", `deal oneKind: ${what} of ${kind}`);
    return e.code;
  };
  for (const [kind, src] of Object.entries(one.never ?? {}))
    out.emit(
      `if (kind === ${JSON.stringify(kind)} && (${test(kind, src, "never")})) return 0;`,
    );
  for (const [kind, p] of Object.entries(one.poor ?? {})) {
    const { when, from } = typeof p === "string" ? { when: p, from: null } : p;
    const tier = from === null ? null : tierIndex(tiers, from, "deal oneKind poor");
    out.emit(
      `if (kind === ${JSON.stringify(kind)}${tier === null ? "" : ` && tier >= ${tier}`} && (${test(kind, when, "poor")})) return 1;`,
    );
  }
  const body = [...scratch.map((s) => `  ${s}`), ...out.text(), "  return 2;"];
  return [
    "",
    "/** How well a clue of `kind` valued `v` suits part `at` on a board of tier",
    " * `tier` (`deal.oneKind`): 0 never, 1 poor, 2 well. */",
    `export function suits(${[
      param("sp", "GridSpace", body),
      param("cl", "Dealt", body),
      param("kind", "string", body),
      param("at", "number", body),
      param("v", "number", body),
      param("tier", "number", body),
    ].join(", ")}): number {`,
    ...body,
    "}",
  ];
}

/**
 * The sizes beyond the grid's that the params give, from `play.sizes`: each
 * a size the rules read that the grid is not measured in, with one ruleset a
 * value. A size with no setting, a setting of no such size, a letter another
 * field takes, or a second ruleset field is refused.
 */
function settingsOf(json: DescriptionJson, env: Env): FillSettingJson[] {
  const given = json.play?.sizes ?? {};
  for (const n of env.sizes.names)
    if (given[n] === undefined)
      throw new CompileError(`play sizes: ${n} is a size the params must give`);
  const taken = new Set([
    "d",
    ...Object.values(json.play?.modifiers ?? {}).map((m) => m.letter),
    ...(thoroughOf(json) === null ? [] : [thoroughOf(json)?.letter]),
  ]);
  const out = Object.entries(given).map(([size, s]) => {
    const range = json.sizes[size];
    if (range === undefined || !env.sizes.names.has(size))
      throw new CompileError(`play sizes: ${size} is no size beyond the grid's`);
    for (const letter of settingLetters(s)) {
      if (taken.has(letter))
        throw new CompileError(`play sizes: the letter ${letter} is taken`);
      taken.add(letter);
    }
    if (range.max === undefined || s.rulesets.length !== range.max - range.min + 1)
      throw new CompileError(`play sizes: ${size} has not one ruleset a value`);
    const rest = { size, min: range.min, rulesets: s.rulesets };
    if (s.letters === undefined) return { ...rest, letter: s.letter };
    if (s.letters.length !== s.rulesets.length)
      throw new CompileError(`play sizes: ${size} has not one letter a ruleset`);
    return { ...rest, letters: s.letters };
  });
  // The Custom dialog has one ruleset field.
  if (out.length > 1)
    throw new CompileError("play sizes: a game has one field of rulesets");
  return out;
}

/** `deal.divide` as the deal reads it (`FillDivide`): a divide by drawn
 * sizes with `by` holds the setting's least, and one list a value of it. */
function divideDeal(
  divide: DivideJson | null,
  settings: readonly FillSettingJson[],
):
  | Exclude<DivideJson, { sizes: number[][] }>
  | { partition: string; sizes: number[][]; by?: { size: string; min: number } }
  | null {
  if (divide === null || !("sizes" in divide)) return divide;
  const { partition, sizes, by } = divide;
  if (by === undefined) {
    if (sizes.length !== 1)
      throw new CompileError("deal divide: several lists of sizes, and no by");
    return { partition, sizes };
  }
  const s = settings.find((x) => x.size === by);
  if (s === undefined)
    throw new CompileError(`deal divide: ${by} is no size the params give`);
  if (sizes.length !== s.rulesets.length)
    throw new CompileError(`deal divide: not one list of sizes a value of ${by}`);
  return { partition, sizes, by: { size: by, min: s.min } };
}

/** The symmetries a `first` sample's option chooses among, in upstream's
 * order (`engine/generate/symmetric-blacks.ts`). */
const SYMMETRIES = 5;

/** `deal.hide`, one kind or several, those tried before the rest
 * (`hideFirst`), and the tier each is first hidden at (`hideFrom`). */
function hideOf(
  json: DescriptionJson,
  d: Description,
): {
  hide: string | readonly string[] | null;
  hideFirst: readonly string[] | null;
  hideFrom: Record<string, number> | null;
  hideWhole: Record<string, { below: number; bounds: SizeBoundsJson }> | null;
} {
  const hideJson = json.deal?.["hide"];
  // One kind, or several hidden in one random order.
  const hide =
    typeof hideJson === "string" ||
    (Array.isArray(hideJson) && hideJson.every((k) => typeof k === "string"))
      ? (hideJson as string | readonly string[])
      : null;
  if (hideJson !== undefined && hide === null)
    throw new CompileError("deal hide: a clue kind, or a list of them");
  const kinds = typeof hide === "string" ? [hide] : (hide ?? []);
  for (const k of kinds) {
    const c = d.clueKinds.get(k);
    if (c === undefined) throw new CompileError(`deal hide: no clue kind ${k}`);
    if (c.complete)
      throw new CompileError(`deal hide: ${k} is complete, so none of it is hidden`);
  }
  const first = json.deal?.["hideFirst"];
  const hideFirst =
    Array.isArray(first) && first.every((k) => typeof k === "string")
      ? (first as string[])
      : null;
  if (first !== undefined) {
    if (hideFirst === null || hideFirst.length === 0)
      throw new CompileError("deal hideFirst: a list of the kinds deal hide names");
    for (const k of hideFirst)
      if (!kinds.includes(k))
        throw new CompileError(`deal hideFirst: ${k} is not hidden`);
    if (hideFirst.length >= kinds.length)
      throw new CompileError("deal hideFirst: every hidden kind, and none after them");
  }
  return {
    hide,
    hideFirst,
    hideFrom: hideFromOf(json, kinds),
    hideWhole: hideWholeOf(json, kinds),
  };
}

const SIZE_MEASURES = ["sum", "area", "shorter", "longer"] as const;

/** `deal.hideWhole`: each kind of `hidden` the deal hides whole below a
 * tier, by the tier's index, on a board within the bounds; `null` where
 * there is none. */
function hideWholeOf(
  json: DescriptionJson,
  hidden: readonly string[],
): Record<string, { below: number; bounds: SizeBoundsJson }> | null {
  const whole = json.deal?.["hideWhole"];
  if (whole === undefined) return null;
  if (typeof whole !== "object" || whole === null || Array.isArray(whole))
    throw new CompileError("deal hideWhole: a tier and bounds by clue kind");
  const out: Record<string, { below: number; bounds: SizeBoundsJson }> = {};
  for (const [kind, spec] of Object.entries(whole as Record<string, unknown>)) {
    if (!hidden.includes(kind))
      throw new CompileError(`deal hideWhole: ${kind} is no kind the deal hides`);
    const { below, ...bounds } = spec as { below?: unknown } & SizeBoundsJson;
    if (typeof below !== "string")
      throw new CompileError(`deal hideWhole: ${kind} below a tier, by its name`);
    for (const name of Object.keys(bounds))
      if (!(SIZE_MEASURES as readonly string[]).includes(name))
        throw new CompileError(`deal hideWhole: ${kind}'s ${name} is no size bound`);
    out[kind] = { below: tierIndex(json.tiers ?? [], below, "deal hideWhole"), bounds };
    if (out[kind].below === 0)
      throw new CompileError(
        `deal hideWhole: ${kind} below the lowest tier is no board`,
      );
  }
  return out;
}

/** `deal.hideFrom`: each kind of `hidden` the deal keeps whole below a
 * tier, by the tier's index; `null` where there is none. */
function hideFromOf(
  json: DescriptionJson,
  hidden: readonly string[],
): Record<string, number> | null {
  const from = json.deal?.["hideFrom"];
  if (from === undefined) return null;
  if (typeof from !== "object" || Array.isArray(from))
    throw new CompileError("deal hideFrom: a tier by clue kind");
  const out: Record<string, number> = {};
  for (const [kind, tier] of Object.entries(from)) {
    if (!hidden.includes(kind))
      throw new CompileError(`deal hideFrom: ${kind} is no kind the deal hides`);
    if (typeof tier !== "string")
      throw new CompileError(`deal hideFrom: ${kind}'s tier by its name`);
    out[kind] = tierIndex(json.tiers ?? [], tier, "deal hideFrom");
    if (out[kind] === 0)
      throw new CompileError(
        `deal hideFrom: ${kind} from the lowest tier is every tier`,
      );
  }
  return out;
}

/** The index of tier `name`, refused where there is no such tier. */
function tierIndex(tiers: readonly string[], name: string, where: string): number {
  const i = tiers.indexOf(name);
  if (i < 0) throw new CompileError(`${where}: ${name} is no tier`);
  return i;
}

/** Bounds as the engine holds them (`SizeBounds`), a tier's by its index. */
type BoundsOut = SizeBoundsJson & {
  square?: true;
  tiers?: (SizeBoundsJson & { tier: number })[];
};

/**
 * The deal's options as the engine holds them (`FillOption`): each choice's
 * bounds with its tiers by index. A letter another field takes, a number
 * with no range, or a default out of range, is refused.
 */
function optionsJsonOf(
  json: DescriptionJson,
  tiers: readonly string[],
  taken: readonly string[],
): Record<
  string,
  Omit<OptionJson, "choices"> & {
    choices?: { name: string; words?: string; bounds?: BoundsOut }[];
  }
> {
  const used = new Set(["d", ...taken]);
  return Object.fromEntries(
    Object.entries(optionsOf(json)).map(([name, o]) => {
      if (used.has(o.letter))
        throw new CompileError(`deal options: the letter ${o.letter} is taken`);
      used.add(o.letter);
      const [min, max] =
        o.choices === undefined ? [o.min, o.max] : [0, o.choices.length - 1];
      if (min === undefined || max === undefined)
        throw new CompileError(`deal options: ${name} has no min and max`);
      if (o.default < min || o.default > max)
        throw new CompileError(`deal options: ${name}'s default is out of range`);
      const choices = o.choices?.map(({ bounds, ...bare }) => {
        if (bounds === undefined) return bare;
        const { tiers: byTier, ...all } = bounds;
        return {
          ...bare,
          bounds: {
            ...all,
            ...(byTier === undefined
              ? {}
              : {
                  tiers: Object.entries(byTier).map(([t, b]) => ({
                    tier: tierIndex(tiers, t, `deal options ${name}`),
                    ...b,
                  })),
                }),
          },
        };
      });
      return [name, { ...o, min, max, ...(choices === undefined ? {} : { choices }) }];
    }),
  );
}

/** A size beyond the grid's as the deal holds it (`FillSetting`). */
type FillSettingJson = ({ letter: string } | { letters: string[] }) & {
  size: string;
  min: number;
  rulesets: { name: string; rule: string; least?: number }[];
};

/** The letters a setting is written by in the params: its one before the
 * number, or each of its bare ones but the one written as nothing. */
const settingLetters = (s: { letter?: string; letters?: readonly string[] }) =>
  s.letter !== undefined ? [s.letter] : (s.letters ?? []).filter((l) => l !== "");

/**
 * `growBy(sp, cl)`, what a grown partition's parts hold on a board: `holds`,
 * `smallest` and `parts`, each a number or a formula of the board's sizes
 * (`engine/fill/grow.ts`'s `GrowSizes`).
 */
function growByOf(grow: GrowJson, env: Env): string[] {
  const read = new Set<string>();
  const scratch: string[] = [];
  const out = new Out(1);
  const genv = {
    ...answerEnv(env, { yes: false }, scratch),
    sizes: { names: env.sizes.names, read },
  };
  const term = (v?: number | string): string => {
    if (v === undefined) return "null";
    if (typeof v === "number") return String(v);
    const got = compileExpr(parse(v), new Map(), genv, out);
    if (got.sort.k !== "int" && got.sort.k !== "num")
      throw new CompileError(`deal grow: ${v} is not a number`);
    return got.code;
  };
  const fields = [
    `holds: ${term(grow.holds)}`,
    `smallest: ${term(grow.smallest)}`,
    `parts: ${term(grow.parts)}`,
  ];
  const body = [
    ...scratch.map((s) => `  ${s}`),
    ...out.text(),
    `  return { ${fields.join(", ")} };`,
  ];
  const sizes = [...read].sort().map((n) => JSON.stringify(n));
  return [
    "",
    "/** What the grown partition's parts hold on a board of these sizes. */",
    `export function growBy(${[
      param("sp", "GridSpace", body),
      sizes.length === 0
        ? "_cl: object"
        : `cl: Readonly<Record<${sizes.join(" | ")}, number>>`,
    ].join(", ")}): { holds: number; smallest: number; parts: number | null } {`,
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
    if (v.sort.k !== "set" || v.sort.of.k !== "elem" || v.sort.of.e !== "cell")
      throw new CompileError(
        `clue ${kind}: the sets its meaning ranges over are not cells`,
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

/** `deal.oneIn`: by clue kind, the cells a clue at `at` is the one of, so
 * the deal shows one in each such group, at a random member. */
function oneInOf(json: DescriptionJson): Readonly<Record<string, string>> {
  const got = json.deal?.["oneIn"];
  if (got === undefined) return {};
  const groups: Record<string, string> = {};
  for (const [k, g] of typeof got === "object" && !Array.isArray(got)
    ? Object.entries(got)
    : [])
    if (typeof g === "string") groups[k] = g;
  if (typeof got !== "object" || Object.keys(groups).length !== Object.keys(got).length)
    throw new CompileError("deal oneIn: a formula of `at` by clue kind");
  return groups;
}

/**
 * The deal of kind `kind` one in each group: for each cell no group so far
 * holds, its group's cells, one of them at random, and there the first of
 * its values whose clue holds as the only one of its kind (`clueHolds_` with
 * the clues `cl`). Emitted into `once`, which `deriveClues` runs after the
 * other kinds.
 */
function onceOf(
  kind: string,
  c: { readonly value: Expr | null },
  group: string,
  sorts: ClueKind,
  env: Env,
  measured: (e: Expr) => Expr,
  once: Out,
): void {
  const covered = Out.fresh("_covered");
  const members = Out.fresh("_members");
  const at = Out.fresh("_at");
  const vs = Out.fresh("_v");
  const pickAt = Out.fresh("_pick");
  const found = Out.fresh("found");
  once.emit(`const ${covered} = new Uint8Array(sp.cells.length);`);
  once.emit(`const ${at}: number[] = [];`);
  once.emit(`const ${vs}: number[] = [];`);
  once.open("for (const _c of sp.cells) {");
  once.emit(`if (${covered}[_c]) continue;`);
  once.emit(`const ${members}: number[] = [];`);
  const groupExpr = measured(parse(group));
  bindingLoops(
    [{ name: "_p", kind: "in", of: groupExpr, where: null }],
    new Map<string, Val>([["at", { code: "_c", sort: sorts.at }]]),
    { ...env, readsClues: { yes: false } },
    once,
    (sc) => once.emit(`${members}.push(${(sc.get("_p") as Val).code});`),
  );
  once.emit(`if (${members}.length === 0) continue;`);
  once.emit(`for (const _m of ${members}) ${covered}[_m] = 1;`);
  once.emit(`const ${pickAt} = ${members}[pick(${members}.length)];`);
  once.open(`${found}: {`);
  bindingLoops(
    [{ name: "v", kind: "in", of: measured(c.value as Expr), where: null }],
    new Map<string, Val>([["at", { code: pickAt, sort: sorts.at }]]),
    { ...env, readsClues: { yes: false } },
    once,
    (sc) => {
      const v = (sc.get("v") as Val).code;
      once.emit(
        `if (clueHolds_${kind}(g, sp, { ...cl, ${kind}: clueList([${pickAt}], [${v}], sp.cells.length) }, ${pickAt}, ${v})) { ${at}.push(${pickAt}); ${vs}.push(${v}); break ${found}; }`,
      );
    },
  );
  once.close();
  once.close();
  // The clues in cell order, as a list holds them.
  once.emit(
    `const _order_${kind} = ${at}.map((_x, _i) => _i).sort((_a, _b) => ${at}[_a] - ${at}[_b]);`,
  );
  once.emit(
    `cl.${kind} = clueList(_order_${kind}.map((_i) => ${at}[_i]), _order_${kind}.map((_i) => ${vs}[_i]), sp.cells.length);`,
  );
}

/** The elements a clue may sit at, as the description names them. */
const UNIVERSE: Readonly<Partial<Record<string, string>>> = {
  cell: "cells",
  line: "lines",
  edge: "edges",
  slot: "slots",
  corner: "corners",
};

/** The clue kinds `deal.never` names: dealt by no deal, carried only by an
 * ID (Pattern's given squares, which only upstream's pictures hold). */
function neverOf(json: DescriptionJson, d: Description): string[] {
  const never = json.deal?.["never"];
  const kinds = never === undefined ? [] : typeof never === "string" ? [never] : never;
  if (!Array.isArray(kinds))
    throw new CompileError("deal never: a clue kind, or a list");
  for (const k of kinds)
    if (typeof k !== "string" || !d.clueKinds.has(k))
      throw new CompileError(`deal never: ${String(k)} is no clue kind`);
  return kinds as string[];
}

/** `deal.withhold`'s values of `kind`: values a deal never derives, which
 * only an ID writes (Boats' segment of a shape not given). */
/** `E` where a meaning is `E = v` or `v = E`, alone or a term of a
 * conjunction, and `E` does not read `v`: the one value the clue can hold,
 * which a derive takes without trying each. `null` where it is not. */
function solvedFor(means: Expr): Expr | null {
  if (means.k !== "bin") return null;
  if (means.op === "and") return solvedFor(means.a) ?? solvedFor(means.b);
  if (means.op !== "=") return null;
  const isV = (e: Expr): boolean => e.k === "name" && e.name === "v";
  const freeOfV = (e: Expr): boolean => {
    const names = new Set<string>();
    freeNames(e, names, new Set());
    return !names.has("v");
  };
  if (isV(means.b) && freeOfV(means.a)) return means.a;
  if (isV(means.a) && freeOfV(means.b)) return means.b;
  return null;
}

function withheldOf(json: DescriptionJson, d: Description, kind: string): number[] {
  const w = json.deal?.["withhold"];
  if (w === undefined) return [];
  if (typeof w !== "object" || Array.isArray(w))
    throw new CompileError("deal withhold: { kind: [values] }");
  const byKind = w as Record<string, unknown>;
  for (const k of Object.keys(byKind))
    if (d.clueKinds.get(k)?.at !== "cell")
      throw new CompileError(`deal withhold: ${k} is no clue kind at a cell`);
  const values = byKind[kind];
  if (values === undefined) return [];
  if (!Array.isArray(values) || !values.every((n) => Number.isInteger(n)))
    throw new CompileError(`deal withhold: ${kind}'s values are a list of numbers`);
  return values as number[];
}

type TallyJson = NonNullable<PlayJson["tally"]>;

/** The module's tally (`engine/fill/game-id.ts`'s `FillTally`). */
interface Tally {
  kind: string;
  index: string;
  count: string;
  size: TallyJson["size"] & { min: number };
  counts: TallyJson["counts"];
  single?: number;
}

/** The module's hide flag (`engine/fill/game-id.ts`'s `FillHideFlag`). */
interface HideFlag {
  kind: string;
  letter: string;
  kw: string;
  name: string;
  doc: string;
  words: string;
}

/** `play.tally`: a board kind of two fields, each length and its count, the
 * params give; `null` where there is none. */
function tallyOf(json: DescriptionJson, tiers: readonly string[]): Tally | null {
  const t = json.play?.tally;
  if (t === undefined) return null;
  const kind = json.clues?.[t.kind];
  const fields = Object.keys(kind?.fields ?? {});
  if (kind?.at !== "board" || fields.length !== 2)
    throw new CompileError(
      `play tally: ${t.kind} is no board clue of two fields, a length and its count`,
    );
  const single = t.single === undefined ? -1 : tiers.indexOf(t.single);
  if (t.single !== undefined && single < 0)
    throw new CompileError(`play tally: single names no tier ${t.single}`);
  return {
    kind: t.kind,
    index: fields[0],
    count: fields[1],
    size: { ...t.size, min: 1 },
    counts: t.counts,
    ...(single < 0 ? {} : { single }),
  };
}

/** `deal.hideFlag`: the setting under which the deal hides a clue kind
 * beside `deal.hide`'s, whose hide it joins; `null` where there is none. */
function hideFlagOf(
  json: DescriptionJson,
  d: Description,
  hides: boolean,
): HideFlag | null {
  const f = json.deal?.["hideFlag"];
  if (f === undefined) return null;
  if (!hides)
    throw new CompileError("deal hideFlag: a setting of the hide, and no hide");
  const { kind, letter, kw, name, doc, words } = f as Record<string, unknown>;
  if (![kind, letter, kw, name, doc, words].every((s) => typeof s === "string"))
    throw new CompileError("deal hideFlag: { kind, letter, kw, name, doc, words }");
  if (!d.clueKinds.has(kind as string))
    throw new CompileError(`deal hideFlag: no clue kind ${String(kind)}`);
  return { kind, letter, kw, name, doc, words } as HideFlag;
}

/** `deal.latin`: a kind on every cell the deal numbers as a Latin square
 * and renumbers under `under` (`engine/fill/latin-numbers.ts`), never derived
 * from the answer; `null` where it deals none. */
function latinOf(
  json: DescriptionJson,
  d: Description,
): { readonly kind: string; readonly under: number } | null {
  const latin = json.deal?.["latin"];
  if (latin === undefined) return null;
  if (typeof latin !== "object" || latin === null)
    throw new CompileError("deal latin: { kind, under }");
  const { kind, under } = latin as { kind?: unknown; under?: unknown };
  if (typeof kind !== "string" || d.clueKinds.get(kind)?.at !== "cell")
    throw new CompileError(`deal latin: ${String(kind)} is no clue kind at a cell`);
  if (typeof under !== "number" || json.play?.values?.[String(under)] === undefined)
    throw new CompileError(
      `deal latin: under ${String(under)}, which is no value played`,
    );
  if (json.deal?.["hide"] !== undefined)
    throw new CompileError("deal latin: every number is shown, and none hidden");
  return { kind, under };
}

/**
 * `<kind>_l`, the list a list kind deals at each element of `universe`, its
 * meaning `T = v` (either way round) with `T` read off the answer: the list
 * is `T`, so every element holds one, an empty one included. A meaning of
 * any other shape is refused.
 */
function listDerived(
  kind: string,
  means: Expr,
  universe: string,
  env: Env,
  measured: (e: Expr) => Expr,
): string[] {
  const isV = (e: Expr) => e.k === "name" && e.name === "v";
  const term =
    means.k !== "bin" || means.op !== "="
      ? null
      : isV(means.b)
        ? means.a
        : isV(means.a)
          ? means.b
          : null;
  if (term === null)
    throw new CompileError(
      `clue ${kind}: a sampled deal derives a list whose meaning is a list of the answer = v`,
    );
  const readsClues = { yes: false };
  const scratch: string[] = [];
  const out = new Out(1);
  const sorts = env.clues.get(kind) as ClueKind;
  const t = compileExpr(
    measured(term),
    new Map<string, Val>([["at", { code: "at", sort: sorts.at }]]),
    answerEnv(env, readsClues, scratch),
    out,
  );
  if (t.sort.k !== "list" || readsClues.yes)
    throw new CompileError(
      `clue ${kind}: a sampled deal derives a list whose meaning is a list of the answer = v`,
    );
  return [
    `const ${kind}_l = sp.${universe}.map((at) => {`,
    ...scratch.map((s) => `  ${s}`),
    ...out.text(),
    `  return Array.from(${t.code});`,
    "});",
  ];
}

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
  // The partition the deal grows round the answer, or divides apart from it.
  const grown = growOf(json)?.partition ?? divideOf(json)?.partition;
  // A size the grid is not measured in is the params' (`play.sizes`).
  if ([...env.regions].some((r) => r !== grown) || env.relations.size > 0)
    throw new CompileError(
      `${json.game}: a sampled deal derives clues and deals a partition, and this board deals more`,
    );
  const holds: string[] = [];
  const derive = new Out(1);
  const dealt: string[] = [];
  const oneIn = oneInOf(json);
  for (const k of Object.keys(oneIn))
    if (d.clueKinds.get(k)?.at !== "cell")
      throw new CompileError(`deal oneIn: ${k} is no clue kind at a cell`);
  /** The kinds dealt one in each group, after the rest. */
  const once = new Out(1);
  const outside = json.space.grid?.hexagon?.outside;
  const latinKind = latinOf(json, d)?.kind;
  const never = [...neverOf(json, d), ...(latinKind === undefined ? [] : [latinKind])];
  const tally = json.play?.tally?.kind;
  /** Whether a kind sits at the dealt partition's parts, whose cells its
   * meaning reads off the partition. */
  const atParts = (c: { at: string }): boolean => grown !== undefined && c.at === grown;
  const partKinds = [...d.clueKinds.values()].some(atParts);
  if (partKinds && Object.keys(oneIn).length > 0)
    throw new CompileError("deal oneIn: a kind dealt one a group, and kinds at parts");
  // A part's clue reads the partition off the clues it is derived beside.
  if (partKinds)
    derive.emit(
      `const cl = { ${grown}: grown[${JSON.stringify(grown)}] } as unknown as Dealt;`,
    );
  for (const [kind, c] of d.clueKinds) {
    // The tally is the params', as a size is.
    if (kind === tally) {
      dealt.push(`${kind}: sizes.${kind}`);
      continue;
    }
    // A hexagon's corners hold its outside kind, and no other cell does.
    if (kind === outside) {
      derive.emit(
        `const ${kind}_at = sp.cells.filter((c) => !inHexagon(sp.w, sp.h, c % sp.w, Math.floor(c / sp.w)));`,
      );
      dealt.push(
        `${kind}: clueList(${kind}_at, ${kind}_at.map(() => 0), sp.cells.length)`,
      );
      env.used.add("inHexagon");
      continue;
    }
    // A kind only an ID carries is dealt none.
    if (never.includes(kind)) {
      dealt.push(`${kind}: clueList([], [], sp.cells.length)`);
      continue;
    }
    const sorts = env.clues.get(kind) as ClueKind;
    const parts = atParts(c);
    const universe = parts ? null : UNIVERSE[c.at];
    if (sorts.list && !sorts.per && universe !== undefined && universe !== null) {
      for (const line of listDerived(kind, c.means, universe, env, measured))
        derive.emit(line);
      dealt.push(
        `${kind}: listClues(sp.${universe}, ${kind}_l, sp.${universe}.length)`,
      );
      env.used.add("listClues");
      continue;
    }
    if (c.value === null || sorts.per || sorts.list || universe === undefined)
      throw new CompileError(
        `clue ${kind}: a sampled deal derives a clue of one value at a cell, a line, a slot, an edge, a corner or a part`,
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
    const group = oneIn[kind];
    // A part's cells are read off the partition, which the clues hold.
    if (readsClues.yes && group === undefined && !parts)
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
      group === undefined
        ? `/** Whether a ${kind} clue at \`at\` valued \`v\` holds of the whole board \`g\`. */`
        : `/** Whether a ${kind} clue at \`at\` valued \`v\` holds of the whole board \`g\`, the clues \`cl\`. */`,
      `export function clueHolds_${kind}(${[
        "g: ArrayLike<number>",
        param("sp", "GridSpace", body),
        ...(group === undefined && !parts ? [] : [param("cl", "Dealt", body)]),
        param("at", "number", body),
        param("v", "number", body),
      ].join(", ")}): boolean {`,
      ...body,
      "}",
    );
    if (group !== undefined) {
      onceOf(kind, c, group, sorts, henv, measured, once);
      continue;
    }
    // Each element in order, then each value in the values' order: a value
    // pushed at this element already is the one that holds first.
    const at = `${kind}_at`;
    const vs = `${kind}_v`;
    derive.emit(`const ${at}: number[] = [];`);
    derive.emit(`const ${vs}: number[] = [];`);
    // A meaning `E = v` is solved for `v`: a value at a time would try 9^6
    // products on a cage of six.
    const solved = solvedFor(measured(c.means));
    const value = measured(c.value);
    const binders: Binder[] = [
      {
        name: "at",
        kind: "in",
        of: { k: "name", name: parts ? c.at : (universe as string) },
        where: null,
      },
      solved === null
        ? { name: "v", kind: "in", of: value, where: null }
        : {
            name: "v",
            kind: "let",
            of: solved,
            where: { k: "bin", op: "in", a: { k: "name", name: "v" }, b: value },
          },
    ];
    bindingLoops(
      binders,
      new Map(),
      { ...henv, readsClues: { yes: false } },
      derive,
      (sc) => {
        const a = (sc.get("at") as Val).code;
        const v = (sc.get("v") as Val).code;
        // No clue of another kind sits outside a hexagon.
        const within =
          outside !== undefined && universe === "cells"
            ? `inHexagon(sp.w, sp.h, ${a} % sp.w, Math.floor(${a} / sp.w)) && `
            : "";
        // A value only an ID writes is never derived.
        const withheld = withheldOf(json, d, kind).map((n) => ` && ${v} !== ${n}`);
        derive.emit(
          `if (${within}${at}.at(-1) !== ${a}${withheld.join("")} && clueHolds_${kind}(g, sp, ${parts ? "cl, " : ""}${a}, ${v})) { ${at}.push(${a}); ${vs}.push(${v}); }`,
        );
      },
    );
    dealt.push(
      `${kind}: clueList(${at}, ${vs}, ${parts ? `cl.${c.at}.parts.length` : `sp.${universe}.length`})`,
    );
  }
  if (dealt.length > 0) env.used.add("clueList");
  if (grown !== undefined) dealt.unshift(`${grown}: grown[${JSON.stringify(grown)}]`);
  // The sizes the techniques and the rules read, as `Dealt` holds them.
  const sizes = [...env.sizes.read].sort();
  for (const n of sizes) dealt.push(`${n}: sizes.${n}`);
  const onceKinds = Object.keys(oneIn);
  // A cell's clue may read the partition too, as a given's value reads the
  // size of its cell's area (Seismic's).
  const derived = derive.text();
  if (grown !== undefined && !partKinds && derived.some((l) => /\bcl\./.test(l)))
    derived.unshift(
      `  const cl = { ${grown}: grown[${JSON.stringify(grown)}] } as unknown as Dealt;`,
    );
  const body =
    onceKinds.length === 0
      ? [...derived, `  return { ${dealt.join(", ")} };`]
      : [
          ...derived,
          // Each kind dealt one in a group is read as the only clue of its
          // kind on the board, beside every other kind.
          `  const cl: Dealt = { ${[
            ...dealt,
            ...onceKinds.map((k) => `${k}: clueList([], [], sp.cells.length)`),
          ].join(", ")} };`,
          ...once.text(),
          "  return cl;",
        ];
  if (onceKinds.length > 0) env.used.add("clueList");
  return [
    ...holds,
    "",
    "/** The clues the whole board `g` deals: each kind at each element where",
    " * one of its values holds, the first in its values' order; the",
    " * partition the deal grew round it; and the sizes the params give. */",
    `export function deriveClues(${[
      param("g", "ArrayLike<number>", body),
      param("sp", "GridSpace", body),
      // A board with no partition imports no `Partition`, and is grown none.
      grown === undefined
        ? "_grown: object = {}"
        : param("grown", "Readonly<Record<string, Partition>>", body),
      sizes.length === 0 && tally === undefined
        ? "_sizes: object = {}"
        : `sizes: ${[
            ...(sizes.length === 0
              ? []
              : [
                  `Readonly<Record<${sizes.map((n) => JSON.stringify(n)).join(" | ")}, number>>`,
                ]),
            ...(tally === undefined
              ? []
              : [`{ readonly ${tally}: Dealt["${tally}"] }`]),
          ].join(" & ")}`,
      ...(onceKinds.length === 0 ? [] : ["pick: (n: number) => number = () => 0"]),
    ].join(", ")}): Dealt {`,
    ...body,
    "}",
  ];
}
