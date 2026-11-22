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
import { freeNames } from "./compile-terms.ts";
import {
  type Description,
  type DescriptionJson,
  type GrowJson,
  growOf,
  type IdSegmentJson,
  type OptionJson,
  optionsOf,
  type PlayJson,
  type SizeBoundsJson,
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
    boardTiers,
    variants,
    modifiers,
    bounds,
    plain: _plain,
    sizes: _sizes,
    wash,
    ...rest
  } = p;
  if (rest.sweepWith !== undefined && rest.stroke !== "sweep")
    throw new CompileError(
      "play sweepWith: a button sweeps only where the stroke does",
    );
  if (rest.hides !== undefined && p.values[rest.hides.value] === undefined)
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
  const plainPlay = {
    ...rest,
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
    ...labelsOf(labels, env),
    ...(boards === undefined
      ? []
      : [
          "",
          "/** The preset menu's sizes, smallest first; the first is the default. */",
          `export const boards = ${JSON.stringify(boards.map(sizeOf(json)))} as const;`,
        ]),
    ...menuOf(json, { boards, byDefault, boardTiers, variants }),
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
  } => {
    const m = /^(\d+)x(\d+)((?:[a-z]\d+)*)$/.exec(b);
    if (m === null) throw new CompileError(`play boards: ${b} is not WxH`);
    const sizes: Record<string, number> = Object.fromEntries(
      Object.keys(json.play?.sizes ?? {}).map((n) => [n, json.sizes[n]?.min ?? 0]),
    );
    const options: Record<string, number> = {};
    for (const [, letter, n] of m[3].matchAll(/([a-z])(\d+)/g)) {
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
    };
  };

/**
 * `menu`, what the preset menu offers beside its grid of `boards`: the
 * default board where it is not the first, the tiers a board stops at, and
 * the variant boards, a tier by its index. Nothing where the description
 * states none. A board not in `boards`, a tier not in `tiers` or a variation
 * the description lacks is refused.
 */
function menuOf(
  json: DescriptionJson,
  p: Pick<PlayJson, "boards" | "boardTiers" | "variants"> & { byDefault?: string },
): string[] {
  const { boards, byDefault, boardTiers, variants } = p;
  if (byDefault === undefined && boardTiers === undefined && variants === undefined)
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
  const menu = {
    ...(byDefault === undefined ? {} : { default: board(byDefault, "default") }),
    tiers: Object.entries(boardTiers ?? {}).map(([b, [first, last]]) => ({
      ...board(b, "boardTiers"),
      first: tierOf(first, "boardTiers"),
      last: tierOf(last, "boardTiers"),
    })),
    variants: (variants ?? []).map((v) => {
      for (const name of v.with)
        if (json.variations?.[name] === undefined)
          throw new CompileError(`play variants: ${name} is no variation`);
      return {
        ...board(v.board, "variants"),
        variations: v.with,
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
  return [
    "",
    "/** The values each cell may hold: the board's domain, the same at every cell. */",
    "export function domainOf(_sp: GridSpace, _cl: Dealt, _c: number): number {",
    ...out.text(),
    `  return ${v.code};`,
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

/** Refuses an `id:` segment that cannot write the kind it names. */
function checkSegments(id: readonly IdSegmentJson[], d: Description, env: Env): void {
  for (const [i, seg] of id.entries()) {
    const [kind, ...more] = segmentKinds(seg);
    if ("walls" in seg) {
      if (!env.regions.has(kind))
        throw new CompileError(`id: walls of ${kind}, which is no dealt partition`);
      continue;
    }
    const c = d.clueKinds.get(kind);
    if (c === undefined) throw new CompileError(`id: no clue kind ${kind}`);
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
    // A digit is a clue's value, so every value is one; with a mark between
    // two side by side, a clue is a whole number of any size.
    if (
      "digits" in seg &&
      seg.apart === undefined &&
      (c.at !== "cell" || values === null || values[0] < 0 || values[1] > 9)
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
  checkNamed(id, [...kinds, ...partitions], hexagon?.outside ?? null);
  checkSegments(id, d, env);
  const hideJson = json.deal?.["hide"];
  // One kind, or several hidden in one random order.
  const hide =
    typeof hideJson === "string" ||
    (Array.isArray(hideJson) && hideJson.every((k) => typeof k === "string"))
      ? (hideJson as string | readonly string[])
      : undefined;
  if (hideJson !== undefined && hide === undefined)
    throw new CompileError("deal hide: a clue kind, or a list of them");
  const hides = hide !== undefined;
  for (const k of typeof hide === "string" ? [hide] : (hide ?? []))
    if (!d.clueKinds.has(k)) throw new CompileError(`deal hide: no clue kind ${k}`);
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
  const sample = sampleOf(json);
  const grow = growOf(json);
  if (grow !== null) {
    if (!env.regions.has(grow.partition))
      throw new CompileError(`deal grow: ${grow.partition} is no dealt partition`);
    if (sample === null || "build" in sample)
      throw new CompileError("deal grow: a partition is grown round a sampled value");
    if (grow.closed !== undefined && grow.closed.oneIn.length !== tiers.length)
      throw new CompileError("deal grow: closed oneIn is not one number a tier");
  }
  for (const r of env.regions)
    if (grow?.partition !== r)
      throw new CompileError(
        `${r}: a fill game's dealt partition is one the deal grows`,
      );
  const settings = settingsOf(json, env);
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
  const leaves = json.deal?.["leaves"];
  if (leaves !== undefined) {
    if (typeof leaves !== "string" || !isMarker(leaves))
      throw new CompileError(
        `deal leaves: ${String(leaves)} is no cell's one-valued marker`,
      );
    if (!hides)
      throw new CompileError("deal leaves: what a hidden clue leaves, and no hide");
  }
  const options = optionsJsonOf(json, tiers, [
    ...settings.map((s) => s.letter),
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
  const tierAliases = tierAliasesOf(json, tiers, tierLetters);
  const { grid } = json.space;
  const deal = {
    ...(grid !== undefined && grid.w === grid.h ? { square: true } : {}),
    ...(hexagon === null ? {} : { hexagon }),
    ...(settings.length === 0 ? {} : { settings }),
    ...(Object.keys(options).length === 0 ? {} : { options }),
    sample,
    ...(hides ? { hide } : {}),
    ...(stripFrom === undefined ? {} : { stripFrom }),
    ...(typeof leaves === "string" ? { leaves } : {}),
    ...present("tierFlag", tierFlag),
    ...present("tierAliases", tierAliases),
    ...(typeof unpair === "string" ? { unpair } : {}),
    ...present("latin", latin),
    ...(symmetric === undefined ? {} : { symmetric }),
    ...present("thorough", thorough),
    ...(grow === null
      ? {}
      : {
          grow: {
            partition: grow.partition,
            value:
              sample === null || "build" in sample
                ? 0
                : "dominoes" in sample
                  ? sample.dominoes.value
                  : "lines" in sample
                    ? sample.lines.value
                    : "picture" in sample
                      ? sample.picture.value
                      : sample.scatter.value,
            ...(grow.closed === undefined ? {} : { closed: grow.closed }),
          },
        }),
    id,
    universes,
    ...(partitions.length === 0 ? {} : { partitions }),
    tierLetters,
    sizes: json.sizes,
  };
  const max: string[] = [];
  // Each kind's smallest value, which the ID refuses below.
  const least: Record<string, number> = {};
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
    max.push(
      `  ${kind}(${param("sp", "GridSpace", body)}, ${param("at", "number", body)}): number {`,
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
    if (taken.has(s.letter))
      throw new CompileError(`play sizes: the letter ${s.letter} is taken`);
    taken.add(s.letter);
    if (range.max === undefined || s.rulesets.length !== range.max - range.min + 1)
      throw new CompileError(`play sizes: ${size} has not one ruleset a value`);
    return { size, letter: s.letter, min: range.min, rulesets: s.rulesets };
  });
  // The Custom dialog has one ruleset field.
  if (out.length > 1)
    throw new CompileError("play sizes: a game has one field of rulesets");
  return out;
}

/** The symmetries a `first` sample's option chooses among, in upstream's
 * order (`engine/generate/symmetric-blacks.ts`). */
const SYMMETRIES = 5;

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
interface FillSettingJson {
  size: string;
  letter: string;
  min: number;
  rulesets: { name: string; rule: string; least?: number }[];
}

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
 * dealt holding (`play.dealt`, drawn as its value); and `clueCells`, the
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
  const numbers = [...d.clueKinds].filter(
    ([kind, c]) => c.at === "cell" && kind !== json.play?.dealt && !oneValued(c.value),
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
const UNIVERSE: Readonly<Record<string, string>> = { cell: "cells", line: "lines" };

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
  if (typeof under !== "number" || json.play?.values[String(under)] === undefined)
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
  const grown = growOf(json)?.partition;
  // A size the grid is not measured in is the params' (`play.sizes`).
  if ([...env.regions].some((r) => r !== grown) || env.relations.size > 0)
    throw new CompileError(
      `${json.game}: a sampled deal derives clues and grows a partition, and this board deals more`,
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
  for (const [kind, c] of d.clueKinds) {
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
    const universe = UNIVERSE[c.at];
    if (sorts.list && !sorts.per && universe !== undefined) {
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
    const group = oneIn[kind];
    if (readsClues.yes && group === undefined)
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
        ...(group === undefined ? [] : [param("cl", "Dealt", body)]),
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
        // No clue of another kind sits outside a hexagon.
        const within =
          outside !== undefined && universe === "cells"
            ? `inHexagon(sp.w, sp.h, ${a} % sp.w, Math.floor(${a} / sp.w)) && `
            : "";
        derive.emit(
          `if (${within}${at}.at(-1) !== ${a} && clueHolds_${kind}(g, sp, ${a}, ${v})) { ${at}.push(${a}); ${vs}.push(${v}); }`,
        );
      },
    );
    dealt.push(`${kind}: clueList(${at}, ${vs}, sp.${universe}.length)`);
  }
  if (dealt.length > 0) env.used.add("clueList");
  if (grown !== undefined) dealt.unshift(`${grown}: grown[${JSON.stringify(grown)}]`);
  // The sizes the techniques and the rules read, as `Dealt` holds them.
  const sizes = [...env.sizes.read].sort();
  for (const n of sizes) dealt.push(`${n}: sizes.${n}`);
  const onceKinds = Object.keys(oneIn);
  const body =
    onceKinds.length === 0
      ? [...derive.text(), `  return { ${dealt.join(", ")} };`]
      : [
          ...derive.text(),
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
      sizes.length === 0
        ? "_sizes: object = {}"
        : `sizes: Readonly<Record<${sizes.map((n) => JSON.stringify(n)).join(" | ")}, number>>`,
      ...(onceKinds.length === 0 ? [] : ["pick: (n: number) => number = () => 0"]),
    ].join(", ")}): Dealt {`,
    ...body,
    "}",
  ];
}
