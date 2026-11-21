/**
 * The compiler from a description's techniques to TypeScript
 * (`openspec/changes/compile-the-latin-ladder/design.md`): each technique
 * becomes a function over `engine/solve/describe-runtime.ts`'s marks and grid that enumerates its
 * bindings in the order its binders are written, and fires the first whose
 * conclusion changes the marks.
 *
 * Every term is given a sort before any code is written, and the sort decides
 * the representation: a number, a truth, an element as its index, a set of
 * values as a bitmask, a set of elements as an ordered array. A formula that
 * reads a name or calls a function the grid does not have, or mixes sorts,
 * is refused here, so a description that compiles is well-sorted.
 *
 * This module writes a game's or a library's module; the `compile-*.ts`
 * modules beside it compile the techniques and terms that go in it.
 */

import { compileExpr } from "./compile-expr.ts";
import {
  answerSet,
  type ClueKind,
  CompileError,
  type ElemSort,
  type Env,
  elem,
  expect,
  isMask,
  NUM,
  Out,
  once,
  type Sort,
  setOf,
  supplies,
  type Val,
} from "./compile-sorts.ts";
import { statedTable, stepsBlock } from "./compile-stated.ts";
import { capitalized, compileTechnique } from "./compile-technique.ts";
import { freeNames, reads } from "./compile-terms.ts";
import {
  cellMarkOf,
  type ClueKind as DescribedClueKind,
  type Description,
  type DescriptionJson,
  edgeMarkOf,
  type LibraryJson,
  loadDescription,
  parseTechnique,
  relationMarkOf,
  stepsOf,
  type Technique,
  UNPLACED,
  withEveryVariation,
} from "./description.ts";
import { type Binder, type Expr, parse } from "./expr.ts";

// --- modules ----------------------------------------------------------------

/** What a module needs from the runtime, as an import line: of the types and
 * the helpers the compiler used, those its code still names, since a set
 * compiled and then read another way (`linkedAggregate`) is never written,
 * and a description with no techniques fires nothing. */
function runtimeImport(
  used: ReadonlySet<string>,
  clueTypes: readonly string[],
  regions: boolean,
  runtime: string,
  body: string,
): string {
  const named = (n: string): boolean =>
    new RegExp(`\\b${n.replace(/^type /, "")}\\b`).test(body);
  const names = [
    ...clueTypes.map((t) => `type ${t}`),
    "type Fire",
    "type GridSpace",
    "type Marks",
    ...(regions ? ["type Partition"] : []),
    ...[...used].sort(),
  ].filter(named);
  const line = `import { ${names.join(", ")} } from "${runtime}";`;
  // Read once a module: under Vitest each read of `import.meta.env` is a
  // lookup, and in the stale-read guard's condition, in every binding, it
  // doubled the cost of a solve (2026-11-10). A build folds it to `false`
  // and drops the guard all the same.
  return names.includes("staleChecking")
    ? `${line}\n\nconst DEV = import.meta.env.DEV;`
    : line;
}

const HEADER = (source: string): string =>
  `// Compiled by \`npm run describe\` from ${source}: edit that, not this.`;

/** A library's techniques, each a function over any grid's units. */
export function compileLibrary(
  lib: LibraryJson,
  source: string,
  runtime: string,
  stepVoice: string,
): string {
  Out.reset();
  const used = new Set<string>();
  const env: Env = {
    defs: new Map(),
    breaks: { of: new Map(), sorts: new Map() },
    clues: new Map(),
    regions: new Set(),
    boxes: null,
    diagonals: false,
    cellDomain: false,
    sizes: { names: new Set(), read: new Set() },
    used,
    concluding: false,
    answer: null,
    position: null,
    carrying: null,
    tables: new Map(),
    geometry: true,
    tiling: false,
    faces: null,
    answerSort: "cell",
    memo: false,
    scratch: null,
    readsClues: { yes: false },
    hoist: null,
    boardRoot: null,
    epoch: null,
    prelude: null,
    relations: new Set(),
    edgeMark: null,
    edgeMarkSort: "edge",
    relation: null,
    cellMark: null,
    supposed: [],
    kept: null,
  };
  const techniques: Technique[] = [];
  const parts = Object.entries(lib.techniques).map(([id, stated]) => {
    const t: Technique = { ...parseTechnique(lib.library, id, stated), ...UNPLACED };
    techniques.push(t);
    const out = compileTechnique(t, env);
    if (out.clues)
      throw new CompileError(
        `${lib.library}.${id}: a library technique reads no clues`,
      );
    return out.code;
  });
  const steps = stepsBlock(
    stepsOf(lib.steps ?? {}, (part, src) => {
      try {
        return parse(src);
      } catch (e) {
        throw new SyntaxError(`${lib.library} ${part}: ${(e as Error).message}`);
      }
    }),
    techniques,
    null,
    stepVoice,
  )
    .join("\n")
    .trimEnd();
  const stated = [statedTable(techniques).join("\n").trimEnd(), steps]
    .filter((s) => s !== "")
    .join("\n\n");
  const body = (stated === "" ? parts : [...parts, stated]).join("\n\n");
  return `${[HEADER(source), "", runtimeImport(used, [], false, runtime, body), "", body].join("\n")}\n`;
}

/** The element sort a clue, or a clue at the board's field, sits at. */
function placeSort(what: string, at: string, env: Env): ElemSort {
  if (
    at === "edge" ||
    at === "cell" ||
    at === "line" ||
    at === "slot" ||
    at === "corner" ||
    at === "point" ||
    at === "center"
  )
    return at;
  if (env.tiling && (at === "face" || at === "angle")) return at;
  if (env.regions.has(at)) return `region ${at}`;
  throw new CompileError(`${what}: no element sort "${at}"`);
}

/** The sort of the members of `value`, a set, which may read `at`. */
function valuesSort(what: string, value: Expr, at: Sort | null, env: Env): Sort {
  // Compiled only for its sort, so what it would call is not imported, and
  // a mask it would make runs nowhere.
  const v = compileExpr(
    value,
    new Map(at === null ? [] : [["at", { code: "at", sort: at }]]),
    {
      ...env,
      wide: false,
      used: new Set(),
      readsClues: { yes: false },
      sizes: { ...env.sizes, read: new Set() },
    },
    new Out(0),
  );
  if (v.sort.k !== "set") throw new CompileError(`${what}: its values are not a set`);
  return v.sort.of;
}

/** The type a clue at the board is dealt as: how many there are, and each
 * field's values by clue, and by element where it is one an element, or
 * its list. */
function recordsType(fields: NonNullable<ClueKind["fields"]>): string {
  const parts = [...fields].map(
    ([name, f]) =>
      `readonly ${name}: readonly ${f.v.k === "list" ? "Int32Array" : f.at === null ? "number" : "(readonly number[])"}[]`,
  );
  return `{ readonly n: number; ${parts.join("; ")} }`;
}

/** The sorts of a clue kind's place and value, or of a clue at the board's
 * fields, from its declaration. */
function clueSorts(kind: string, c: DescribedClueKind, env: Env): ClueKind {
  if (c.value === null) {
    const fields = new Map<string, { at: ElemSort | null; v: Sort }>();
    for (const [name, f] of c.fields) {
      if (env.defs.has(name) || env.clues.has(name) || env.regions.has(name))
        throw new CompileError(`clue ${kind}: its field ${name} is named twice`);
      const at = f.at === null ? null : placeSort(`clue ${kind} ${name}`, f.at, env);
      const v = valuesSort(`clue ${kind} ${name}`, f.value, null, env);
      if (v.k !== "num")
        throw new CompileError(`clue ${kind} ${name}: its values are not numbers`);
      fields.set(name, { at, v: f.list ? { k: "list" } : v });
    }
    return { at: { k: "none" }, v: { k: "none" }, per: false, list: false, fields };
  }
  const at = elem(placeSort(`clue ${kind}`, c.at, env));
  const v = valuesSort(`clue ${kind}`, c.value, at, env);
  if (c.list && v.k !== "num")
    throw new CompileError(`clue ${kind}: a list holds numbers`);
  return { at, v: c.list ? { k: "list" } : v, per: c.per, list: c.list, fields: null };
}

/**
 * The ladder's order: the description's, but a technique a variation adds,
 * which the description lists after its own, goes before the first of a
 * higher tier on its scale, so a ladder in tier order stays in tier order
 * with the variation on.
 */
function rungOrder(
  techniques: readonly Technique[],
  addedBy: ReadonlyMap<string, string>,
): Technique[] {
  const out = techniques.filter((t) => !addedBy.has(t.id));
  for (const t of techniques.filter((x) => addedBy.has(x.id))) {
    const at = out.findIndex((x) => x.scale === t.scale && x.tier > t.tier);
    out.splice(at < 0 ? out.length : at, 0, t);
  }
  return out;
}

/**
 * A game's own techniques, its clue lists, and its ladder: every technique,
 * the library's it places included, by id and tier in the description's
 * order, which is the order a rung runs them in.
 */
export function compileGame(
  json: DescriptionJson,
  libraries: readonly LibraryJson[],
  source: string,
  runtime: string,
  stepVoice: string,
): string {
  Out.reset();
  const d = loadDescription(withEveryVariation(json), libraries);
  const used = new Set<string>();
  const clues = new Map<string, ClueKind>();
  const { space } = d.json;
  const grid = space.grid ?? null;
  const tiling = space.tiling !== undefined;
  if ([grid !== null, space.cells !== undefined, tiling].filter(Boolean).length !== 1)
    throw new CompileError(
      `${json.game}: a space is a grid, cells or a tiling, one of them`,
    );
  const relations = Object.keys(space.relations ?? {});
  const edgeMark = edgeMarkOf(d.json);
  const parts = Object.keys(space.regions ?? {});
  const unitParts = parts.filter((name) => space.units.includes(name));
  if (unitParts.length > 1)
    throw new CompileError(`${unitParts.join(", ")}: one partition among the units`);
  // A partition among the units is the space's boxes, dealt or not.
  const boxes = unitParts[0] ?? null;
  const regions = new Set(
    parts.filter((name) => name !== boxes && space.regions?.[name] === "dealt"),
  );
  for (const kind of d.clueKinds.keys())
    if (regions.has(kind))
      throw new CompileError(
        `${kind}: a partition and a clue kind are dealt by one name`,
      );
  const env: Env = {
    defs: d.defs,
    breaks: { of: d.breaks, sorts: new Map() },
    clues,
    regions,
    boxes,
    diagonals: space.diagonals === true,
    // A size the grid is not measured in: `order`, `w` and `h` are the
    // space's own.
    sizes: {
      names: new Set(
        Object.keys(d.json.sizes).filter(
          (n) =>
            grid === null ||
            (n !== "order" && n !== "w" && n !== "h" && n !== grid.w && n !== grid.h),
        ),
      ),
      read: new Set(),
    },
    cellDomain: false,
    used,
    concluding: false,
    answer: null,
    position: null,
    carrying: null,
    tables: new Map(),
    geometry: grid !== null || tiling,
    tiling,
    faces: null,
    answerSort: d.answerSort,
    to: d.to,
    wide: d.wide,
    memo: false,
    scratch: null,
    readsClues: { yes: false },
    hoist: null,
    boardRoot: null,
    epoch: null,
    prelude: null,
    relations: new Set(relations),
    edgeMark: edgeMark?.name ?? null,
    edgeMarkSort: edgeMark?.sort ?? "edge",
    relation: relationMarkOf(d.json),
    cellMark: cellMarkOf(d.json),
    supposed: [],
    kept: { defs: new Map(), used, terms: new Map() },
  };
  Out.own("", () => {
    for (const [kind, c] of d.clueKinds) clues.set(kind, clueSorts(kind, c, env));
  });
  const domainLines = Out.own("domainOf", () =>
    cellDomain(d.domain, env, d.json.sizes),
  );
  const own = d.techniques.filter((t) => !t.id.includes("."));
  const compiled = own.map((t) => ({ id: t.id, ...compileTechnique(t, env) }));
  const code = compiled.map((c) => c.code);
  const kept = env.kept?.defs ?? new Map();
  for (const fn of kept.keys())
    if (own.some((t) => t.id === fn))
      throw new CompileError(`${fn}: a kept definition and a technique share the name`);
  code.push(...[...kept.values()].map((k) => k.code));
  const check = Out.own("isAnswer", () => answerCheck(json, d, env));
  const scales = Object.entries(d.json.scales ?? {});
  const sizes = [...env.sizes.read].sort();
  const clueLines =
    clues.size + regions.size + relations.length + sizes.length === 0
      ? []
      : [
          "/** What the board deals: its partitions by name, its relations, a set of",
          " * cells for each cell, its clues by kind, and the sizes a technique or the",
          " * rules read that the grid does not give. */",
          "export interface Dealt {",
          ...[...regions].map((r) => `  ${r}: Partition;`),
          ...relations.map((r) => `  readonly ${r}: readonly (readonly number[])[];`),
          ...[...clues].map(
            ([k, c]) =>
              `  ${k}: ${c.fields ? recordsType(c.fields) : c.list ? "ListClues" : "ClueList"};`,
          ),
          ...sizes.map((n) => `  ${n}: number;`),
          "}",
          "",
        ];
  const ids = d.techniques.filter((t) => t.on === null).map((t) => t.id);
  const placing = d.techniques.filter((t) => t.on === "place").map((t) => t.id);
  const striking = d.techniques.filter((t) => t.on === "strike").map((t) => t.id);
  // A technique a variation adds runs only on a board the variation is on.
  const addedBy = new Map<string, string>();
  for (const [name, v] of Object.entries(json.variations ?? {}))
    for (const t of v.add?.techniques ?? [])
      addedBy.set("use" in t ? t.use : t.id, name);
  const quoted = (xs: readonly string[]): string =>
    xs.length === 0 ? "never" : xs.map((id) => JSON.stringify(id)).join(" | ");
  const onCellEntry = (id: string): string => {
    const by = addedBy.get(id);
    const fields = [
      `id: ${JSON.stringify(id)}`,
      ...(by === undefined ? [] : [`variation: ${JSON.stringify(by)}`]),
    ];
    return `  { ${fields.join(", ")} },`;
  };
  const ladder = [
    "/** The units no value repeats in, in the description's order: the",
    " * engine builds the space from them. */",
    `export const units: readonly string[] = ${JSON.stringify(space.units)};`,
    "",
    ...(space.edges === "king"
      ? [
          "/** A diagonal neighbor is across an edge too: the engine builds the",
          " * space's edges by it. */",
          'export const edgeGeometry = "king";',
          "",
        ]
      : []),
    "/** Every technique a rung runs, by id: the description's, in its order. */",
    `export type LadderId = ${quoted(ids)};`,
    "",
    ...(json.words === undefined
      ? []
      : [
          "/** The game's nouns, which the engine's hint words read. */",
          `export const WORDS = ${JSON.stringify(json.words)} as const;`,
          "",
        ]),
    ...(d.rulesOut === null
      ? []
      : [
          "/** What a placement rules out at a glance: the preference's words, and the",
          " * techniques whose conclusions a placement brings. */",
          `export const RULES_OUT = ${JSON.stringify(d.rulesOut)} as const;`,
          "",
        ]),
    ...stepsBlock(d.steps, own, json.words ?? null, stepVoice),
    ...(own.some((t) => t.says !== null)
      ? [
          "/** What a firing of each technique that says anything says, by id. */",
          "export interface SaysById {",
          ...own
            .filter((t) => t.says !== null)
            .map((t) => `  ${t.id}: ${capitalized(t.id)}Says;`),
          "}",
          "",
          "/** The kinds of step a firing can be: a technique's id, and for one whose",
          " * `says` has arms, `<id>.<arm>` for each. */",
          `export const SAYS_KINDS = ${JSON.stringify(
            own.flatMap((t) =>
              t.says === null
                ? []
                : t.says.variants.map((v) =>
                    v.name === null ? t.id : `${t.id}.${v.name}`,
                  ),
            ),
          )} as const;`,
          "",
          ...statedTable(own),
          ...(own.some(supplies)
            ? [
                "/** What the game supplies to each technique that declares a term or mark",
                " * `supplied`, by id: its hook for the technique returns it. */",
                "export interface SuppliedById {",
                ...own
                  .filter(supplies)
                  .map((t) => `  ${t.id}: ${capitalized(t.id)}Supplied;`),
                "}",
                "",
              ]
            : []),
          ...(own.some((t) => t.says?.each)
            ? [
                "/** The techniques whose step is made for each square the firing decides. */",
                `export const SAYS_EACH: readonly (keyof SaysById)[] = ${JSON.stringify(
                  own.filter((t) => t.says?.each).map((t) => t.id),
                )};`,
                "",
              ]
            : []),
          ...(own.some((t) => t.says?.legs)
            ? [
                "/** The techniques whose later squares' steps continue the first (a subset of",
                " * `SAYS_EACH`). */",
                `export const SAYS_LEGS: readonly (keyof SaysById)[] = ${JSON.stringify(
                  own.filter((t) => t.says?.legs).map((t) => t.id),
                )};`,
                "",
              ]
            : []),
        ]
      : []),
    "/** Every technique run as each value is placed, by id. */",
    `export type PlacingId = ${quoted(placing)};`,
    "",
    "/** The techniques run as each value is placed, in the description's order,",
    " * each with the variation that adds it where one does. */",
    "export const placing: readonly { id: PlacingId; variation?: string }[] = [",
    ...placing.map(onCellEntry),
    "];",
    "",
    "/** Every technique run as a value is struck from a cell, by id. */",
    `export type StrikingId = ${quoted(striking)};`,
    "",
    "/** The techniques run as a value is struck from a cell, in the",
    " * description's order, each with the variation that adds it where one",
    " * does. */",
    "export const striking: readonly { id: StrikingId; variation?: string }[] = [",
    ...striking.map(onCellEntry),
    "];",
    "",
    "/** Each of the description's own techniques, by id, and whether it reads",
    " * what the board deals: the engine runs each on the board's clues where it",
    " * does (`describedLadder`). */",
    "export const techniques = {",
    ...compiled.map((c) => `  ${c.id}: { dealt: ${c.clues}, run: ${c.id} },`),
    "} as const;",
    "",
    "/** The ladder: each technique's tier, on its scale where that is not the",
    " * description's tiers, the least cap it runs at where that is above its",
    " * tier, the cap from which it no longer runs where it has one, and the",
    " * variation that adds it where one does, in the order the description",
    " * lists them, a variation's before the first of a higher tier. */",
    "export const ladder: readonly { id: LadderId; name: string; tier: number; scale?: string; from?: number; until?: number; variation?: string }[] = [",
    ...rungOrder(
      d.techniques.filter((t) => t.on === null),
      addedBy,
    ).map((t) => {
      const by = addedBy.get(t.id);
      // Check & save names a move by the technique that made it.
      if (t.name === null)
        throw new CompileError(
          `${json.game} ${t.id}: no name (\`names\`, by its id or a rung)`,
        );
      const fields = [
        `id: ${JSON.stringify(t.id)}`,
        `name: ${JSON.stringify(t.name)}`,
        `tier: ${t.tier}`,
        ...(t.scale === null ? [] : [`scale: ${JSON.stringify(t.scale)}`]),
        ...(t.from === null ? [] : [`from: ${t.from}`]),
        ...(t.until === null ? [] : [`until: ${t.until}`]),
        ...(by === undefined ? [] : [`variation: ${JSON.stringify(by)}`]),
      ];
      return `  { ${fields.join(", ")} },`;
    }),
    "];",
    "",
    ...(json.names === undefined
      ? []
      : [
          "/** What a player calls each technique, by its id or a rung: a plan's",
          " * own rungs are named here too. */",
          `export const NAMES = ${JSON.stringify(json.names)} as const;`,
          "",
        ]),
    `/** The description's tiers, by name. */`,
    `export const tiers: readonly string[] = ${JSON.stringify(d.tiers)};`,
    ...(scales.length === 0
      ? []
      : [
          "",
          "/** Its other scales' tiers, by scale. */",
          `export const scales: Readonly<Record<string, readonly string[]>> = ${JSON.stringify(Object.fromEntries(scales))};`,
        ]),
  ];
  const body = [
    ...clueLines,
    ...ladder,
    ...domainLines,
    "",
    ...check,
    "",
    code.join("\n\n"),
  ].join("\n");
  return `${[
    HEADER(source),
    "",
    runtimeImport(
      used,
      [
        ...new Set(
          [...clues.values()].flatMap((c) =>
            c.fields !== null ? [] : [c.list ? "ListClues" : "ClueList"],
          ),
        ),
      ].sort(),
      regions.size > 0,
      runtime,
      body,
    ),
    "",
    body,
  ].join("\n")}\n`;
}

/**
 * The answer check: whether a whole grid, a value a cell and 0 where it has
 * none, is an answer to the board `cl` deals. Every cell holds a value of its
 * domain, and the shape, the rules and each dealt clue's meaning hold of it.
 * A rule a variation adds holds only where the board has the variation on,
 * as a technique a variation adds runs only there; a clue kind or partition
 * a variation adds is dealt empty where it is off.
 */
function answerCheck(json: DescriptionJson, d: Description, env: Env): string[] {
  const readsClues = { yes: false };
  const scratch: string[] = [];
  const cenv: Env = {
    ...env,
    answer: { repeats: d.repeat !== null },
    readsClues,
    scratch,
    memo: false,
    hoist: null,
    boardRoot: null,
    epoch: null,
    concluding: false,
  };
  const out = new Out(1);
  // A check reads a whole grid it never changes, so what a rule binds is
  // made once where it is bound: a set of edges is joined into groups there,
  // not walked again from each square (Rectangles' shape).
  cenv.hoist = { root: out.slot(0), loops: 0, marks: true };
  cenv.boardRoot = cenv.hoist.root;
  // A board of cells alone is measured in nothing.
  const { grid } = json.space;
  const measured = grid === undefined ? (e: Expr) => e : measuredBy(grid);
  const scope = new Map<string, Val>();
  out.open(`for (const cell of ${answerSet(env)}) {`);
  out.emit("const held = g[cell];");
  if (env.cellDomain) {
    readsClues.yes = true;
    out.emit(
      env.wide
        ? "if (!(held > 0 && domainOf(sp, cl, cell, held))) return false;"
        : "if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;",
    );
    out.close();
  } else {
    const at = new Out(1);
    const dom = compileExpr(measured(d.domain), scope, cenv, at);
    if (!isMask(dom.sort)) throw new CompileError("the domain is not a set of values");
    out.emit("if (!(held > 0 && (_domain >> held) & 1)) return false;");
    out.close();
    out.entries.unshift(...at.entries, {
      indent: 1,
      text: `const _domain = ${dom.code};`,
    });
    scope.set("domain", { code: "_domain", sort: setOf(NUM) });
  }
  if (d.repeat !== null) {
    const value = compileExpr(measured(d.repeat.value), scope, cenv, out);
    const times = compileExpr(measured(d.repeat.times), scope, cenv, out);
    out.emit(`const _repeat = ${value.code};`);
    out.emit(`const _times = ${times.code};`);
  }
  // A variation's own rules, each after the description's.
  const rules = [
    ...(json.shape ?? []).map((src) => ({ src, on: null as string | null })),
    ...Object.values(json.rules ?? {}).map((src) => ({ src, on: null })),
    ...Object.entries(json.variations ?? {}).flatMap(([name, v]) => [
      ...(v.add?.shape ?? []).map((src) => ({ src, on: name })),
      ...Object.values(v.add?.rules ?? {}).map((src) => ({ src, on: name })),
    ]),
  ];
  for (const { src, on } of rules) {
    if (on !== null) out.open(`if (variations.includes(${JSON.stringify(on)})) {`);
    const v = compileExpr(measured(parse(src)), scope, cenv, out);
    expect(v, "bool", `rule ${src}`);
    out.emit(`if (!(${v.code})) return false;`);
    if (on !== null) out.close();
  }
  for (const [kind, c] of d.clueKinds) {
    // A clue that says nothing of the answer itself (Signpost's arrow, which
    // the domain reads) holds of any.
    if (c.means.k === "name" && c.means.name === "true") continue;
    const sorts = env.clues.get(kind) as ClueKind;
    const k = Out.fresh("_k");
    const at = Out.fresh("_at");
    const v = Out.fresh("_v");
    const per = sorts.per ? Out.fresh("_per") : "";
    readsClues.yes = true;
    // A clue at the board is `k` in its meaning, its fields read of it.
    const own: [string, Val][] = sorts.fields
      ? [["k", { code: k, sort: elem(`clue ${kind}`) }]]
      : [
          ["at", { code: at, sort: sorts.at }],
          ["v", { code: v, sort: sorts.v }],
          ...(sorts.per ? [["per", { code: per, sort: NUM }] as [string, Val]] : []),
        ];
    out.open(
      `for (let ${k} = 0; ${k} < cl.${kind}.${sorts.fields ? "n" : "at.length"}; ${k}++) {`,
    );
    if (sorts.per) {
      cenv.used.add("perElement");
      cenv.used.add("perValue");
      out.emit(`const ${at} = perElement(cl.${kind}.at[${k}]);`);
      out.emit(`const ${per} = perValue(cl.${kind}.at[${k}]);`);
      out.emit(`const ${v} = cl.${kind}.v[${k}];`);
    } else if (!sorts.fields) {
      out.emit(`const ${at} = cl.${kind}.at[${k}];`);
      // A clue whose place is the whole of what it says (a block) has a value
      // its meaning never reads.
      if (reads(c.means, "v"))
        out.emit(`const ${v} = cl.${kind}.${sorts.list ? "lists" : "v"}[${k}];`);
    }
    const means = compileExpr(
      measured(c.means),
      new Map([...scope, ...own]),
      cenv,
      out,
    );
    expect(means, "bool", `clue ${kind}`);
    out.emit(`if (!(${means.code})) return false;`);
    out.close();
  }
  out.emit("return true;");
  const params = [
    "g: ArrayLike<number>",
    "sp: GridSpace",
    ...(readsClues.yes ? ["cl: Dealt"] : []),
    ...(rules.some((r) => r.on !== null) ? ["variations: readonly string[]"] : []),
  ];
  return [
    "/** Whether `g`, a value a cell and 0 where it has none, is an answer to the",
    " * board: every cell a value of its domain, and every rule and dealt clue",
    " * true of it, a variation's rules where `variations` has it on. */",
    `export function isAnswer(${params.join(", ")}): boolean {`,
    ...scratch.map((s) => `  ${s}`),
    ...out.text(),
    "}",
  ];
}

/**
 * A formula with the space's own measures read off the grid: where the
 * description measures its grid in a term of other sizes (Solo's `c * r`),
 * that term is the grid's width or height.
 */
function measuredBy(grid: { w: string; h: string }): (e: Expr) => Expr {
  const w = JSON.stringify(parse(grid.w));
  const h = JSON.stringify(parse(grid.h));
  const go = (e: Expr): Expr => {
    // A grid one cell high is measured in no term: a 1 is a 1.
    if (e.k === "num") return e;
    const s = JSON.stringify(e);
    if (s === w) return { k: "name", name: "w" };
    if (s === h) return { k: "name", name: "h" };
    const opt = (x: Expr | null): Expr | null => (x === null ? null : go(x));
    const binders = (bs: readonly Binder[]): Binder[] =>
      bs.map((b) => ({ ...b, of: go(b.of), where: opt(b.where) }));
    switch (e.k) {
      case "name":
        return e;
      case "call":
        return { ...e, args: e.args.map(go) };
      case "set":
        return { ...e, elems: e.elems.map(go) };
      case "size":
      case "not":
      case "neg":
        return { ...e, of: go(e.of) };
      case "bin":
        return { ...e, a: go(e.a), b: go(e.b) };
      case "with":
        return { ...e, cell: go(e.cell), value: go(e.value), body: go(e.body) };
      case "quant":
        return { ...e, binders: binders(e.binders), body: go(e.body) };
      case "agg":
        return {
          ...e,
          binders: binders(e.binders),
          where: opt(e.where),
          term: opt(e.term),
        };
    }
  };
  return go;
}

/**
 * Where the answer's domain is a cell's (it reads `c`, as Seismic's is its
 * area's numbers), the function the engine seeds each cell's candidates
 * from, and `domain` alone is then refused in a technique; nothing where it
 * is the board's.
 */
function cellDomain(
  domain: Expr,
  env: Env,
  sizes: Readonly<Record<string, unknown>>,
): string[] {
  if (env.wide) return wideDomain(domain, env);
  const names = new Set<string>();
  freeNames(domain, names, new Set());
  // Solo's board is measured in a `c`, which is no cell.
  if (!names.has("c") || "c" in sizes) return [];
  env.cellDomain = true;
  const out = new Out(1);
  const scope = new Map<string, Val>([["c", { code: "v_c", sort: elem("cell") }]]);
  const v = compileExpr(domain, scope, env, out);
  if (!isMask(v.sort)) throw new CompileError("the domain is not a set of values");
  const cl = env.readsClues.yes ? "cl: Dealt, " : "_cl: Dealt, ";
  env.readsClues.yes = false;
  const body = [...out.text(), `  return ${v.code};`];
  const sp = body.some((l) => /\bsp\b/.test(l)) ? "sp" : "_sp";
  return [
    "",
    "/** The values each cell may hold, by cell: its domain. */",
    `export function domainOf(${sp}: GridSpace, ${cl}v_c: number): number {`,
    ...body,
    "}",
  ];
}

/**
 * A wide domain, which no mask holds, as whether cell `c` may hold `d`: the
 * domain is `range(a, b)` or `{d in range(a, b) where P}`, so the engine
 * seeds each cell by asking it of every value. Always a cell's, so `domain`
 * alone is refused in a technique.
 */
function wideDomain(domain: Expr, env: Env): string[] {
  let range: Expr = domain;
  let d = "d";
  let where: Expr | null = null;
  if (domain.k === "agg" && domain.fn === "set" && domain.binders.length === 1) {
    const [bnd] = domain.binders;
    const term = domain.term;
    if (
      bnd.kind !== "in" ||
      (term !== null && !(term.k === "name" && term.name === bnd.name))
    )
      throw new CompileError(
        "a wide domain is `range(a, b)` or `{d in range(a, b) where P}`",
      );
    range = bnd.of;
    d = bnd.name;
    where = bnd.where ?? domain.where;
  }
  if (range.k !== "call" || range.fn !== "range" || range.args.length !== 2)
    throw new CompileError(
      "a wide domain is `range(a, b)` or `{d in range(a, b) where P}`",
    );
  env.cellDomain = true;
  const out = new Out(1);
  const scope = new Map<string, Val>([
    ["c", { code: "v_c", sort: elem("cell") }],
    [d, { code: "v_d", sort: NUM }],
  ]);
  const [a, b] = range.args.map((x) => {
    const t = once(compileExpr(x, scope, env, out), out);
    expect(t, "num", "range");
    return t.code;
  });
  out.emit(`if (v_d < ${a} || v_d > ${b}) return false;`);
  const p = where === null ? null : compileExpr(where, scope, env, out);
  if (p !== null) expect(p, "bool", "where");
  const cl = env.readsClues.yes ? "cl: Dealt, " : "_cl: Dealt, ";
  env.readsClues.yes = false;
  const body = [...out.text(), `  return ${p === null ? "true" : p.code};`];
  const sp = body.some((l) => /\bsp\b/.test(l)) ? "sp" : "_sp";
  return [
    "",
    "/** Whether cell `v_c` may hold `v_d`: its domain, wider than a mask. */",
    `export function domainOf(${sp}: GridSpace, ${cl}v_c: number, v_d: number): boolean {`,
    ...body,
    "}",
  ];
}

export { HEADER };
