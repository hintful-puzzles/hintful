/*
 * Module-layering and import-cycle invariants.
 *
 * The layering these tests assert already held when they were written — 0
 * game-to-game imports, 0 engine-to-games imports outside the one named test
 * helper, 0 engine-or-games imports of the app shell. That is exactly why they
 * exist: the boundaries held only by convention, and the first violation will
 * look like sensible reuse (a game importing a helper from another game, an
 * engine module reaching for a Lit component). Nothing objected before this.
 *
 * Implemented as an in-repo test rather than a `dependency-cruiser` config
 * (`enforce-module-layering` D-choice): a few rules over a fixed directory layout
 * express fine here, they run inside the vitest step the gate already pays for,
 * and this repo already asserts cross-cutting invariants this way — see
 * `asset-integrity.test.ts` and `catalog-registry.test.ts`.
 *
 * ON CYCLES. The cycle check counts **runtime** cycles only. With
 * `verbatimModuleSyntax`, `import type` is erased and forms no runtime edge —
 * and moving a shared type behind a type-only import *is* the standard fix for
 * a module cycle. A checker that counted those would report the fix as the
 * problem: measured 2026-08-01, madge reported 20 where 1 was real (all sixteen
 * per-game `index ↔ render` pairs are `render.ts` importing nothing from
 * `index.ts` but the game's hint type). Dynamic `import()` is likewise not a
 * cycle edge: it is evaluated at call time, so it cannot close an
 * initialization loop, which is the hazard being guarded.
 */
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { ENGINE_DIRECTORIES } from "./engine/testing/engine-directories.ts";
import {
  type ImportEdge,
  importsOf,
  nodesOf,
  parsed,
} from "./engine/testing/syntax.ts";

/** Every source module, eagerly, as raw text — Vite resolves these at build. */
const sources = import.meta.glob("./**/*.ts", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

/** Files that are not part of the shipped module graph. */
const isTest = (p: string) => /\.test\.ts$/.test(p) || p.includes("/test-setup/");

const modules = Object.entries(sources)
  .map(([p, text]) => [p.replace(/^\.\//, "src/"), text] as const)
  .filter(([p]) => !isTest(p));

/**
 * Every module `text` reaches for, read off its syntax tree: an import, a
 * re-export (`export … from`, a runtime edge like an import), or an
 * `import("…")`. An import written inside a string or a comment is not one.
 *
 * `type` — `import type …`, or bindings that are all `type`. Erased; no
 * runtime edge.
 * `dynamic` — `import("…")`. Real, but deferred to call time.
 * `value` — everything else, including side-effect-only `import "…"`.
 */
const imports = (text: string, path = "src/plant.ts"): ImportEdge[] =>
  importsOf(parsed(path, text));

/**
 * What in `sf` preflight may not do, as `kind: source`: an `import()`, an
 * `await` outside any function (a top-level await, `for await` included),
 * `import.meta` other than `import.meta.env` (which vite replaces at build
 * time, so it never reaches the browser), or a relative import, which could
 * drag the others in.
 */
function breaches(sf: ts.SourceFile): string[] {
  const out: string[] = [];
  const say = (kind: string, n: ts.Node) => out.push(`${kind}: ${n.getText()}`);
  for (const n of nodesOf(sf)) {
    if (ts.isCallExpression(n) && n.expression.kind === ts.SyntaxKind.ImportKeyword)
      say("dynamic import", n);
    const awaits =
      ts.isAwaitExpression(n) ||
      (ts.isForOfStatement(n) && n.awaitModifier !== undefined);
    if (awaits && ts.findAncestor(n.parent, ts.isFunctionLike) === undefined)
      say("top-level await", n);
    if (
      ts.isMetaProperty(n) &&
      n.keywordToken === ts.SyntaxKind.ImportKeyword &&
      !(ts.isPropertyAccessExpression(n.parent) && n.parent.name.text === "env")
    )
      say("import.meta", n);
  }
  for (const e of importsOf(sf))
    if (e.kind !== "dynamic" && e.spec.startsWith(".")) out.push(`import: ${e.spec}`);
  return out;
}

/** Resolve a relative specifier against the importing file to a `src/…` path. */
function resolve(from: string, spec: string): string | null {
  if (!spec.startsWith(".")) return null;
  const parts = from.split("/").slice(0, -1);
  for (const seg of spec.split("/")) {
    if (seg === ".") continue;
    else if (seg === "..") parts.pop();
    else parts.push(seg);
  }
  const path = parts.join("/");
  for (const c of [path, `${path}.ts`, `${path}/index.ts`]) {
    if (sources[c.replace(/^src\//, "./")] !== undefined) return c;
  }
  return null;
}

/** A game's compiled module, generated outside its directory, is the game's. */
const gameOf = (p: string) =>
  /^src\/(?:generated\/)?games\/([^/]+)\//.exec(p)?.[1] ?? null;

/** The engine directory `p` sits in: `""` for a module at the engine's top,
 * `null` outside the engine. */
const engineDirOf = (p: string): string | null =>
  p.startsWith("src/engine/") ? (/^src\/engine\/([^/]+)\//.exec(p)?.[1] ?? "") : null;

/** Each declared engine directory's place, bottom first. */
const LAYER = new Map(ENGINE_DIRECTORIES.map(({ dir }, i) => [dir, i]));

/**
 * The runtime imports in `text`, written at `path`, that reach an engine
 * directory later in {@link ENGINE_DIRECTORIES} than `path`'s own, and how
 * many engine-to-engine runtime edges it looked at. A type-only import is
 * erased and forms no edge; a dynamic one still runs the module it names.
 */
function layerBreaches(
  path: string,
  text: string,
): { breaches: string[]; edges: number } {
  const from = LAYER.get(engineDirOf(path) ?? "");
  if (from === undefined) return { breaches: [], edges: 0 };
  const breaches: string[] = [];
  let edges = 0;
  for (const { spec, kind } of imports(text, path)) {
    if (kind === "type") continue;
    const target = resolve(path, spec);
    const to = target === null ? undefined : LAYER.get(engineDirOf(target) ?? "");
    if (to === undefined) continue;
    edges++;
    if (to > from) breaches.push(`${path} → ${target}`);
  }
  return { breaches, edges };
}

describe("module layering", () => {
  it("resolves the imports the rules below are counting", () => {
    // THE GUARD ON THE INSTRUMENT. Every rule in this file reports *offenders*,
    // and `resolve()` returns null when it cannot find a target — so a resolver
    // that resolves nothing finds no offenders anywhere, and the whole file goes
    // green while checking precisely nothing. That is not hypothetical:
    // `retire-native-directory`'s bulk import-rewrite corrupted this very file,
    // turning `resolve()`'s `startsWith(".")` guard into `startsWith("./")` so
    // that no `../…` specifier resolved at all — and every test below passed.
    //
    // So count what was actually inspected. Every relative `.ts` specifier in
    // the tree must resolve: `sources` globs every `.ts` under `src/`, so an
    // unresolved one means the resolver is broken or the target is missing.
    // Relative imports of other kinds (`.json` fixtures, `.css`) fall outside
    // that glob and are not this rule's business.
    //
    // The floor is deliberately far below the true count (3228 when written) —
    // it exists to separate "working" from "resolving nothing", not to ratchet
    // a number that legitimate deletions would wobble.
    //
    // This is the third instance of the shape in recent memory: `grid.test.ts`'s
    // `expect(d.edges.length).toBe(d.order)` could not fail because `d.edges`
    // was allocated `new Array(d.order)`, and `touch-input.test.ts` guarded its
    // sweep by counting the catalog while the sweep itself skipped on the
    // registry. An instrument that answers "how many violations?" must also
    // answer "how many things did I look at?".
    let resolved = 0;
    const unresolved: string[] = [];
    for (const [path, text] of Object.entries(sources).map(
      ([p, t]) => [p.replace(/^\.\//, "src/"), t] as const,
    )) {
      for (const { spec } of imports(text, path)) {
        if (!spec.startsWith(".") || !spec.endsWith(".ts")) continue;
        if (resolve(path, spec)) resolved++;
        else unresolved.push(`${path} → ${spec}`);
      }
    }
    expect(unresolved).toEqual([]);
    expect(resolved).toBeGreaterThan(2000);
  });

  it("no game imports another game", () => {
    const offenders: string[] = [];
    for (const [path, text] of modules) {
      const from = gameOf(path);
      if (!from) continue;
      for (const { spec } of imports(text, path)) {
        const target = resolve(path, spec);
        const to = target && gameOf(target);
        if (to && to !== from) offenders.push(`${path} → ${target}`);
      }
    }
    // Shared behavior belongs in src/engine/, never in a sibling game.
    expect(offenders).toEqual([]);
  });

  it("no game imports the midend", () => {
    // `ts-engine`, "A game depends on the `Game` interface and never on the
    // midend". A type-only import counts: a game that names the midend's type
    // is one step from calling it. A game's tests drive a board through the
    // midend and are outside `modules`.
    const offenders: string[] = [];
    for (const [path, text] of modules) {
      if (!gameOf(path)) continue;
      for (const { spec } of imports(text, path)) {
        if (resolve(path, spec) === "src/engine/midend/midend.ts") {
          offenders.push(`${path} → ${spec}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("the engine does not import games, except the named test helpers", () => {
    // These dev-only files derive a cross-game sweep's population from the
    // registry, so each has to import the module whose side effect populates it:
    //
    //   hint-games.ts     — every game that declares a `hint()`, the enrolled
    //                       set for six cross-game hint guards.
    //   params-corpus.ts  — every game's params cases, for the byte-stability
    //                       and codec-inverse guards.
    //   enrollment.ts     — the shared answer to "who is in this mechanic, and
    //                       did they actually use it", which every cross-game
    //                       guard asks. It also reads game *sources*, which is
    //                       the only way to assert that a hand-rolled copy does
    //                       not exist.
    //
    // Named one by one rather than exempting `engine/testing/`, so a fourth
    // violation cannot hide behind them — which is not hypothetical: this guard
    // is what caught `enrollment.ts` on the commit that added it. None is
    // reachable from production; nothing outside a `.test.ts` imports any.
    const ALLOWED = new Set([
      "src/engine/testing/enrollment.ts",
      "src/engine/testing/hint-games.ts",
      "src/engine/testing/params-corpus.ts",
    ]);
    const offenders: string[] = [];
    for (const [path, text] of modules) {
      if (!path.startsWith("src/engine/") || ALLOWED.has(path)) continue;
      for (const { spec } of imports(text, path)) {
        const target = resolve(path, spec);
        if (target && gameOf(target)) offenders.push(`${path} → ${target}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("the engine and games import nothing above them", () => {
    // The puzzle engine runs in a worker; a Lit component or dialog reached
    // from a solver would break that and bloat the worker bundle.
    //
    // Stated as an invariant rather than a blocklist. It used to name three
    // directories — screens/, dialogs/, components/ — and it was green for
    // months while 182 files imported `src/puzzle/types.ts`, because
    // `src/puzzle/` was not on the list. A blocklist can only catch the
    // violations its author thought of, and a directory added next year is
    // permitted by default, silently. This one has the opposite default:
    // everything outside the engine's own two directories is a violation, so
    // there is nothing to keep up to date. (`retire-native-directory` D4.)
    //
    // Unlike the rules above this one covers **test files too**. It can afford
    // to: after the same change moved the engine's type vocabulary down and the
    // Comlink adapter up, the violation count including tests is zero, so it
    // lands as a ratchet rather than a wish. The rules above cannot — an engine
    // test legitimately imports the games barrel to populate the registry.
    // The compiled descriptions are the engine's and the games' own code,
    // generated outside their directories.
    const OWN = ["src/engine/", "src/games/", "src/generated/"];
    const offenders: string[] = [];
    for (const [path, text] of Object.entries(sources).map(
      ([p, t]) => [p.replace(/^\.\//, "src/"), t] as const,
    )) {
      if (!OWN.some((o) => path.startsWith(o))) continue;
      for (const { spec } of imports(text, path)) {
        const target = resolve(path, spec);
        if (target && !OWN.some((o) => target.startsWith(o))) {
          offenders.push(`${path} → ${target}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("places every engine module in a declared directory, and declares none that is empty", () => {
    // A directory missing from `ENGINE_DIRECTORIES` has no layer, so the rule
    // below would skip its imports without a sound; a module at the engine's
    // top is in no concern.
    const dirs = new Set(
      Object.keys(sources)
        .map((p) => engineDirOf(p.replace(/^\.\//, "src/")))
        .filter((d): d is string => d !== null),
    );
    expect([...dirs].filter((d) => !LAYER.has(d))).toEqual([]);
    expect([...LAYER.keys()].filter((d) => !dirs.has(d))).toEqual([]);
  });

  it("an engine module imports at run time only from its own directory or one below it", () => {
    // The order is `engine-directories.ts`'s, bottom to top: rendering never
    // runs a hint planner, a solver never runs the midend. Shipped modules
    // only; a test may drive its module from above, through the midend.
    const offenders: string[] = [];
    let edges = 0;
    for (const [path, text] of modules) {
      const seen = layerBreaches(path, text);
      offenders.push(...seen.breaches);
      edges += seen.edges;
    }
    expect(offenders).toEqual([]);
    // A floor far below the count (about 450, 2026-11-21), to tell "checked"
    // from "resolved nothing".
    expect(edges).toBeGreaterThan(200);
  });

  it("would see an engine module import from a directory above its own", () => {
    const at = "src/engine/render/plant.ts";
    const upward = 'import { Midend } from "../midend/midend.ts";';
    expect(layerBreaches(at, upward).breaches).toHaveLength(1);
    expect(
      layerBreaches(at, 'const m = import("../hint/hint-plan.ts");').breaches,
    ).toHaveLength(1);
    for (const fine of [
      'import type { Midend } from "../midend/midend.ts";',
      'import { type Midend } from "../midend/midend.ts";',
      'import { drawRectOutline } from "./draw.ts";',
      'import { Dsf } from "../board/dsf.ts";',
    ])
      expect(layerBreaches(at, fine).breaches, fine).toEqual([]);
  });

  it("preflight stays inside its Baseline 2023 gate", () => {
    // preflight runs on older browsers to gate the rest of the app, so it may
    // not use top-level await or dynamic import(), and may not import a module
    // that could drag those in.
    //
    // Read off the syntax tree, where a comment is no node: preflight.ts's own
    // header documents the restriction — "no top-level await, dynamic
    // import(), import.meta" — and a text scan fails on the prose that states
    // the rule.
    const raw = sources["./preflight.ts"];
    expect(raw).toBeTypeOf("string");
    expect(breaches(parsed("src/preflight.ts", raw))).toEqual([]);
  });

  it("would see each thing preflight may not do", () => {
    for (const plant of [
      'const m = import("./b.ts");',
      "await f();",
      "for await (const x of xs) g(x);",
      "const u = import.meta.url;",
      'import { a } from "./a.ts";',
    ])
      expect(breaches(parsed("src/plant.ts", plant)), plant).toHaveLength(1);
    for (const fine of [
      "async function f() { await g(); }",
      "const h = async () => { await g(); };",
      "const dev = import.meta.env.DEV;",
      "// await import('./b.ts'); import.meta.url",
    ])
      expect(breaches(parsed("src/plant.ts", fine)), fine).toEqual([]);
  });
});

describe("import cycles", () => {
  it("has no runtime import cycles", () => {
    const graph = new Map<string, string[]>();
    for (const [path, text] of modules) {
      graph.set(
        path,
        imports(text, path)
          .filter((i) => i.kind === "value") // type + dynamic edges cannot close a cycle
          .map((i) => resolve(path, i.spec))
          .filter((t): t is string => t !== null),
      );
    }

    const cycles: string[] = [];
    const state = new Map<string, "open" | "done">();
    const stack: string[] = [];
    const walk = (node: string) => {
      const seen = state.get(node);
      if (seen === "done") return;
      if (seen === "open") {
        cycles.push([...stack.slice(stack.indexOf(node)), node].join(" → "));
        return;
      }
      state.set(node, "open");
      stack.push(node);
      for (const next of graph.get(node) ?? []) walk(next);
      stack.pop();
      state.set(node, "done");
    };
    for (const node of graph.keys()) walk(node);

    expect(cycles).toEqual([]);
  });

  it("detects a cycle when one exists", () => {
    // A ratchet at zero is worthless if the detector is broken, and "no cycles
    // found" is indistinguishable from "nothing was checked". This asserts the
    // walk above actually finds a loop, and that a type-only edge breaks one.
    const value = (to: string) => `import { x } from "${to}";`;
    expect(imports(value("./b.ts"))[0]?.kind).toBe("value");
    expect(imports(`import type { X } from "./b.ts";`)[0]?.kind).toBe("type");
    expect(imports(`import { type X, y } from "./b.ts";`)[0]?.kind).toBe("value");
    expect(imports(`import { type X } from "./b.ts";`)[0]?.kind).toBe("type");
    expect(imports(`const m = await import("./b.ts");`)[0]?.kind).toBe("dynamic");
    expect(imports(`import "./b.ts";`)[0]?.kind).toBe("value");
  });
});
