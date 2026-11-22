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
  type PlayJson,
  sampleOf,
  segmentKind,
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
  if (p.dealt !== undefined) {
    const kind = json.clues?.[p.dealt];
    if (kind?.at !== "cell" || kind.means.replace(/\s+/g, "") !== "value(at)=v")
      throw new CompileError(
        `play dealt: ${p.dealt} is not a clue at a cell meaning \`value(at) = v\``,
      );
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
    ...rest
  } = p;
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
    "",
    "/** How the player fills the board: the engine's `FillPlay`. */",
    `export const play = ${JSON.stringify(play)} as const;`,
    "",
    "/** The clue kinds at lines, drawn past each line's end. */",
    `export const lineClues = ${JSON.stringify(lineClues)} as const;`,
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

/** A board's `WxH` as its size, and each size beyond the grid's it gives
 * after it by its params letter (`8x8s2`, two stars), a size it does not
 * name at its least. A letter that is no size's is refused. */
const sizeOf =
  (json: DescriptionJson) =>
  (b: string): { w: number; h: number; sizes?: Record<string, number> } => {
    const m = /^(\d+)x(\d+)((?:[a-z]\d+)*)$/.exec(b);
    if (m === null) throw new CompileError(`play boards: ${b} is not WxH`);
    const sizes: Record<string, number> = Object.fromEntries(
      Object.keys(json.play?.sizes ?? {}).map((n) => [n, json.sizes[n]?.min ?? 0]),
    );
    for (const [, letter, n] of m[3].matchAll(/([a-z])(\d+)/g)) {
      const named = Object.entries(json.play?.sizes ?? {}).find(
        ([, s]) => s.letter === letter,
      );
      if (named === undefined)
        throw new CompileError(`play boards: ${b}: ${letter} is no size's letter`);
      sizes[named[0]] = Number(n);
    }
    return {
      w: Number(m[1]),
      h: Number(m[2]),
      ...(Object.keys(sizes).length === 0 ? {} : { sizes }),
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
  const partitions = [...env.regions];
  const id =
    json.id ?? kinds.map((k, i) => ({ numbers: k, ...(i > 0 ? { before: "," } : {}) }));
  const named = id.map(segmentKind);
  for (const kind of [...kinds, ...partitions])
    if (named.filter((k) => k === kind).length !== 1)
      throw new CompileError(`id: clue kind or partition ${kind} is not named once`);
  for (const [i, seg] of id.entries()) {
    const kind = segmentKind(seg);
    if ("walls" in seg) {
      if (!env.regions.has(kind))
        throw new CompileError(`id: walls of ${kind}, which is no dealt partition`);
      continue;
    }
    const c = d.clueKinds.get(kind);
    if (c === undefined) throw new CompileError(`id: no clue kind ${kind}`);
    // The values a kind's `range(lo, hi)` states, where both are numbers.
    const values =
      c.value !== null &&
      c.value.k === "call" &&
      c.value.args.every((a) => a.k === "num")
        ? c.value.args.map((a) => (a.k === "num" ? a.v : 0))
        : null;
    // A run code says where a clue is, never its value: one value, 0.
    if ("runs" in seg && (c.at !== "cell" || values?.join() !== "0,0"))
      throw new CompileError(
        `id: runs of ${kind}, which is not a cell's one-valued marker`,
      );
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
    if ("digits" in seg && seg.apart !== undefined && c.at !== "cell")
      throw new CompileError(`id: digits of ${kind}, which is not a cell's clue`);
  }
  const hide = json.deal?.["hide"];
  if (typeof hide === "string" && !d.clueKinds.has(hide))
    throw new CompileError(`deal hide: no clue kind ${hide}`);
  const thorough = thoroughOf(json);
  if (thorough !== null) {
    if (typeof hide !== "string")
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
  const symmetric = json.deal?.["symmetric"];
  if (symmetric !== undefined && typeof hide !== "string")
    throw new CompileError(
      "deal symmetric: the symmetry of the clues left, and no hide",
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
  const { grid } = json.space;
  const deal = {
    ...(grid !== undefined && grid.w === grid.h ? { square: true } : {}),
    ...(settings.length === 0 ? {} : { settings }),
    sample,
    ...(typeof hide === "string" ? { hide } : {}),
    ...(symmetric === undefined ? {} : { symmetric }),
    ...(thorough === null ? {} : { thorough }),
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
  const grown = growOf(json)?.partition;
  // A size the grid is not measured in is the params' (`play.sizes`).
  if ([...env.regions].some((r) => r !== grown) || env.relations.size > 0)
    throw new CompileError(
      `${json.game}: a sampled deal derives clues and grows a partition, and this board deals more`,
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
  if (dealt.length > 0) env.used.add("clueList");
  if (grown !== undefined) dealt.unshift(`${grown}: grown[${JSON.stringify(grown)}]`);
  // The sizes the techniques and the rules read, as `Dealt` holds them.
  const sizes = [...env.sizes.read].sort();
  for (const n of sizes) dealt.push(`${n}: sizes.${n}`);
  const body = [...derive.text(), `  return { ${dealt.join(", ")} };`];
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
    ].join(", ")}): Dealt {`,
    ...body,
    "}",
  ];
}
