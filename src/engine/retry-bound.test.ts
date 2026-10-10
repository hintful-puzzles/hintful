/*
 * A loop that draws randomness until something happens is bounded, and says by
 * what.
 *
 * Generators are synchronous, so a "generate until it works" loop that never
 * succeeds owns its thread (`retry-limit.ts` says what that costs). A
 * deterministic loop that never ends hangs on every run and the first test to
 * reach it finds it; a loop that draws from the RNG hangs on the seed nobody
 * tried. So this holds the second kind to one of two answers: it calls a
 * `retryLimit` guard once per pass, or `BOUNDED_OTHERWISE` says what ends it.
 *
 * ON THE INSTRUMENT: keyed on shape and on references, not on a file name or a
 * list of games (Same Game's deal is in `state.ts`, Palisade's in `solver.ts`).
 *
 *   - An OPEN loop is one whose header does not count: `while`, `do…while`, and
 *     a `for` missing its condition or its incrementor. `for…of`, `for…in` and
 *     a `for` with both are bounded by what they walk.
 *   - A loop DRAWS when its header or body names an RNG: a parameter, variable
 *     or property typed `RandomState`, a variable initialized from a function
 *     declared to return one, or a function that itself draws, followed by name
 *     within a file and through relative imports across files.
 *   - A loop is GUARDED when its own body, outside any nested loop or function,
 *     calls a variable initialized from `retryLimit`, declared in a function
 *     that encloses the loop.
 *
 * What it does not see: a counted `for` that steps its counter back to retry in
 * place, an RNG parameter that takes its type from context and is used only
 * through a method call or a re-export, and a guard handed in as an argument.
 * The synthetic cases below are the known positives.
 */
import ts from "typescript";
import { describe, expect, it } from "vitest";

const RETRY_LIMIT = "engine/retry-limit.ts";
const RANDOM = "engine/random/index.ts";

function sources(): Record<string, string> {
  const raw = {
    ...import.meta.glob<string>("../games/**/*.ts", {
      query: "?raw",
      import: "default",
      eager: true,
    }),
    ...import.meta.glob<string>("./**/*.ts", {
      query: "?raw",
      import: "default",
      eager: true,
    }),
  };
  const out: Record<string, string> = {};
  for (const [key, text] of Object.entries(raw)) {
    const path = key.startsWith("../") ? key.slice(3) : `engine/${key.slice(2)}`;
    if (path.endsWith(".test.ts") || path.startsWith("engine/testing/")) continue;
    out[path] = text;
  }
  return out;
}

/**
 * What ends each open, drawing loop that takes no `retryLimit` guard: one
 * reason per loop, in source order, under the file and the named function
 * around it. The scan asserts this is exactly the set it finds unguarded, so an
 * entry cannot outlive its loop and a new bare loop cannot arrive without one.
 *
 * A reason says what ends the loop: a counter, something each pass uses up, or
 * for rejection sampling what keeps an acceptable draw on offer. "It nearly
 * always works" is not one: a loop that deals a whole board again takes a
 * guard. A guard's default budget is wrong for rejection sampling, though: one
 * free square in 1,600 is refused 10,000 times running about once in 500.
 */
const BOUNDED_OTHERWISE: Record<string, readonly string[]> = {
  "engine/divvy.ts › divvyRectangleAttempt": [
    "each pass grows an omino by a square or returns null, and divvyRectangle counts the attempts",
  ],
  "engine/grid/tilings/hat.ts › extendCoords": ["pushes a level each pass, up to n"],
  "engine/grid/tilings/hat.ts › tryStepMetamap": [
    "walks a finite rewrite table and returns on coming back to its first entry",
  ],
  "engine/grid/tilings/hat.ts › walkKites": ["an enumerator over the w×h kites"],
  "engine/grid/tilings/penrose.ts › extendCoords": [
    "pushes a level each pass, up to n",
  ],
  "engine/grid/tilings/spectre.ts › extendCoords": [
    "pushes a level each pass, up to n",
  ],
  "engine/latin.ts › matching": [
    "Hopcroft–Karp: each phase enlarges the matching, which neither side can exceed",
    "a depth-first walk of the phase's layered graph, each edge tried once",
  ],
  "engine/laydomino.ts › dominoLayout": [
    "each pass pairs off two singletons",
    "a breadth-first search: each square is queued once",
  ],
  "engine/loopgen.ts › generateLoop": [
    "each pass colors a gray face, and none is uncolored",
  ],
  "engine/random/index.ts › randomUpto": [
    "rejection sampling: a draw is accepted more often than not",
  ],
  "engine/wires.ts › growSpanningTree": [
    "removes a possibility each pass, and a tile adds its arms once",
  ],
  "games/ascent/generator.ts › ascentAddEdges": ["counts `attempts` to MAX_ATTEMPTS"],
  "games/ascent/generator.ts › generateHamiltonianPath": [
    "rejection sampling over cells, and no mode walls every cell",
    "stalled steps count `attempts` to MAX_ATTEMPTS",
  ],
  "games/blackbox/answer.ts › buildDesc": ["places a ball each pass or returns null"],
  "games/blackbox/state.ts › scatterDesc": [
    "places a ball each pass",
    "rejection sampling over squares, and validateParams keeps the balls fewer than the squares",
  ],
  "games/boats/generator.ts › newBoatsDesc": [
    "validateParams places the fleet first-fit, so a placement is on offer (docs/games/solver-and-generator.md, on load-bearing validation)",
  ],
  "games/bridges/generator.ts › newBridgesDesc": [
    "adds an island each pass, and misses count `badTries` to MAX_NEWISLAND_TRIES",
  ],
  "games/dominosa/generator.ts › tryHard": ["a pass that places no domino ends it"],
  "games/filling/generator.ts › makeBoard": [
    "each pass that goes round again merges two regions",
  ],
  "games/flip/generator.ts › genRandomMatrix": ["counts `limit` down"],
  "games/galaxies/generator.ts › newGameDesc": ["counts `safety` to 20"],
  "games/guess/state.ts › newDesc": [
    "rejection sampling over colors, and validateParams keeps the pegs no more than the colors",
  ],
  "games/map/generator.ts › fourcolorRecurse": ["counts down the colors left to try"],
  "games/map/generator.ts › genmap": ["colors a square each pass"],
  "games/mines/generator.ts › minegen": ["counts down the mines to lay"],
  "games/mines/solver.ts › minesolve": [
    "each pass deduces a square or perturbs, and a perturbation settles the set it was asked about or gives up",
  ],
  "games/net/generator.ts › generate": [
    "a pass that does not reduce the ambiguous sections regenerates, under `attempt`",
  ],
  "games/net/generator.ts › perturb": [
    "two wall-followers round a finite loop, ending when either closes",
  ],
  "games/net/generator.ts › shuffle": [
    "stalled rounds count to MAX_STALLED_ROUNDS, and a worse round reshuffles under `attempt`",
  ],
  "games/netslide/generator.ts › shuffle": [
    "rejection sampling over slides: only undoing or over-repeating the last one is refused",
  ],
  "games/pegs/generator.ts › genMoves": ["each pass adds a peg to a finite board"],
  "games/rect/generator.ts › newDesc": ["covers a square each pass"],
  "games/rect/solver.ts › rectSolver": [
    "a deduction fixpoint: each pass that goes round again rules a placement out",
  ],
  "games/samegame/state.ts › genGrid": [
    "each pass fills cells, and one that can fill none leaves",
    "counts down the insertion points",
  ],
  "games/seismic/generator.ts › growRegions": [
    "claims a free cell each pass",
    "pops a frontier entry each pass",
  ],
  "games/separate/generator.ts › easyBoard": [
    "stuck passes count `retries` down, and progress locks a square",
  ],
  "games/signpost/generator.ts › newGameFill": [
    "numbers a cell each pass or returns",
    "numbers a cell each pass or returns",
    "numbers a cell each pass or returns",
  ],
  "games/singles/generator.ts › newSinglesDesc": ["counts `tries` to MAXTRIES"],
  "games/sixteen/state.ts › newDesc": [
    "rejection sampling over moves: only undoing or over-repeating the last line is refused",
  ],
  "games/solo/generator.ts › genKillerCages": [
    "each pass steps past a block or merges one away",
  ],
  "games/solo/generator.ts › mergeSomeCages": ["uses up a candidate pair each pass"],
  "games/solo/generator.ts › newSoloDesc": [
    "each pass merges cages or leaves, and misses count `ntries` to 50",
  ],
  "games/tracks/generator.ts › spreadOnes": [
    "each bend leaves one line fewer with a clue of 1, or it stops",
  ],
  "games/tracks/generator.ts › walk": ["enters a free square each pass, or stops"],
  "games/twiddle/state.ts › newDesc": [
    "rejection sampling over rotations, and its condition skips the board where none is acceptable",
  ],
};

type FunctionNode = ts.FunctionLikeDeclaration;
type OpenLoop = ts.WhileStatement | ts.DoStatement | ts.ForStatement;

interface Loop {
  /** `file › function`, the ledger's key. */
  owner: string;
  where: string;
  guarded: boolean;
}

/** A `throw new X(…)` standing straight after a loop that draws: the loop's
 * bound running out, in any loop shape. */
interface GiveUp {
  where: string;
  /** Whether `X` is `RetryLimitExceeded`, the one error the midend answers. */
  answered: boolean;
}

interface Scan {
  loops: Loop[];
  giveUps: GiveUp[];
}

/** The class a `throw new X(…)` right after `loop` throws, or `null`. */
function thrownAfter(loop: ts.Node): string | null {
  const block = loop.parent;
  if (!ts.isBlock(block) && !ts.isSourceFile(block)) return null;
  const next = block.statements[block.statements.indexOf(loop as ts.Statement) + 1];
  if (!next || !ts.isThrowStatement(next)) return null;
  const thrown = next.expression;
  return ts.isNewExpression(thrown) && ts.isIdentifier(thrown.expression)
    ? thrown.expression.text
    : null;
}

interface FileFacts {
  sf: ts.SourceFile;
  /** Local name → `file#exportedName`, for each relative named import. */
  imports: Map<string, string>;
  /** Every function with a name, nested ones included. */
  functions: Map<string, FunctionNode>;
  rngNames: Set<string>;
  /** Variables holding a `retryLimit` guard, by declaration. */
  guards: ts.VariableDeclaration[];
}

const isOpenLoop = (n: ts.Node): n is OpenLoop =>
  ts.isWhileStatement(n) ||
  ts.isDoStatement(n) ||
  (ts.isForStatement(n) && (!n.condition || !n.incrementor));

const isAnyLoop = (n: ts.Node): boolean =>
  ts.isIterationStatement(n, /* lookInLabeledStatements */ false);

function resolve(from: string, specifier: string): string | null {
  if (!specifier.startsWith(".")) return null;
  const parts = from.split("/").slice(0, -1);
  for (const seg of specifier.split("/")) {
    if (seg === "..") parts.pop();
    else if (seg !== ".") parts.push(seg);
  }
  return parts.join("/");
}

/** The name a function is known by: its own, or the variable or property that
 * holds it. */
function nameOf(fn: ts.Node): string | null {
  if (!ts.isFunctionLike(fn)) return null;
  if (fn.name && ts.isIdentifier(fn.name)) return fn.name.text;
  const holder = fn.parent;
  if (
    (ts.isVariableDeclaration(holder) || ts.isPropertyAssignment(holder)) &&
    ts.isIdentifier(holder.name)
  ) {
    return holder.name.text;
  }
  return null;
}

function scan(files: Record<string, string>): Scan {
  const facts = new Map<string, FileFacts>();
  for (const [path, text] of Object.entries(files)) {
    const sf = ts.createSourceFile(path, text, ts.ScriptTarget.ESNext, true);
    const imports = new Map<string, string>();
    const functions = new Map<string, FunctionNode>();
    const visit = (n: ts.Node): void => {
      if (ts.isImportDeclaration(n) && ts.isStringLiteral(n.moduleSpecifier)) {
        const target = resolve(path, n.moduleSpecifier.text);
        const named = n.importClause?.namedBindings;
        if (target !== null && named && ts.isNamedImports(named)) {
          for (const el of named.elements) {
            imports.set(el.name.text, `${target}#${(el.propertyName ?? el.name).text}`);
          }
        }
      }
      const name = nameOf(n);
      if (name !== null) functions.set(name, n as FunctionNode);
      ts.forEachChild(n, visit);
    };
    visit(sf);
    facts.set(path, { sf, imports, functions, rngNames: new Set(), guards: [] });
  }

  /** Whether `name`, read in `path`, is the export `wanted` of `file`. */
  const refersTo = (path: string, name: string, file: string, wanted: string) =>
    path === file
      ? name === wanted
      : facts.get(path)?.imports.get(name) === `${file}#${wanted}`;

  // The functions declared to return a `RandomState`, as `file#name`.
  const mentionsRngType = (path: string, type?: ts.TypeNode): boolean => {
    let hit = false;
    const visit = (n: ts.Node): void => {
      if (ts.isIdentifier(n) && refersTo(path, n.text, RANDOM, "RandomState"))
        hit = true;
      else ts.forEachChild(n, visit);
    };
    if (type) visit(type);
    return hit;
  };
  const makers = new Set<string>();
  for (const [path, f] of facts) {
    for (const [name, fn] of f.functions) {
      if (mentionsRngType(path, fn.type)) makers.add(`${path}#${name}`);
    }
  }
  const calls = (
    path: string,
    init: ts.Expression | null,
    isTarget: (id: string) => boolean,
  ) => {
    if (!init || !ts.isCallExpression(init) || !ts.isIdentifier(init.expression))
      return false;
    const name = init.expression.text;
    return isTarget(facts.get(path)?.imports.get(name) ?? `${path}#${name}`);
  };

  for (const [path, f] of facts) {
    const visit = (n: ts.Node): void => {
      if (
        (ts.isParameter(n) ||
          ts.isVariableDeclaration(n) ||
          ts.isPropertySignature(n) ||
          ts.isPropertyDeclaration(n)) &&
        ts.isIdentifier(n.name)
      ) {
        const init = ts.isPropertySignature(n) ? null : (n.initializer ?? null);
        if (
          mentionsRngType(path, n.type) ||
          calls(path, init, (id) => makers.has(id))
        ) {
          f.rngNames.add(n.name.text);
        }
        if (
          ts.isVariableDeclaration(n) &&
          calls(path, init, (id) => id === `${RETRY_LIMIT}#retryLimit`)
        ) {
          f.guards.push(n);
        }
      }
      ts.forEachChild(n, visit);
    };
    visit(f.sf);
  }

  // The functions that draw, to a fixpoint: one that names an RNG, or names a
  // function that draws.
  const drawing = new Set<string>();
  const draws = (path: string, root: ts.Node): boolean => {
    const f = facts.get(path);
    if (!f) return false;
    let hit = false;
    const visit = (n: ts.Node): void => {
      if (hit) return;
      if (ts.isIdentifier(n)) {
        const id = f.imports.get(n.text) ?? `${path}#${n.text}`;
        if (f.rngNames.has(n.text) || drawing.has(id)) hit = true;
        return;
      }
      ts.forEachChild(n, visit);
    };
    visit(root);
    return hit;
  };
  for (let changed = true; changed; ) {
    changed = false;
    for (const [path, f] of facts) {
      for (const [name, fn] of f.functions) {
        const id = `${path}#${name}`;
        if (!drawing.has(id) && draws(path, fn)) {
          drawing.add(id);
          changed = true;
        }
      }
    }
  }

  const loops: Loop[] = [];
  const giveUps: GiveUp[] = [];
  for (const [path, f] of facts) {
    const enclosingFunction = (n: ts.Node): ts.Node => {
      let p: ts.Node = n.parent;
      while (!ts.isFunctionLike(p) && !ts.isSourceFile(p)) p = p.parent;
      return p;
    };
    const encloses = (outer: ts.Node, inner: ts.Node): boolean => {
      for (let p: ts.Node = inner; p; p = p.parent) if (p === outer) return true;
      return false;
    };
    const guarded = (loop: OpenLoop): boolean => {
      const inScope = new Set(
        f.guards
          .filter((g) => encloses(enclosingFunction(g), loop))
          .map((g) => g.name.getText(f.sf)),
      );
      let hit = false;
      const visit = (n: ts.Node): void => {
        if (hit || isAnyLoop(n) || ts.isFunctionLike(n)) return;
        if (ts.isCallExpression(n) && ts.isIdentifier(n.expression)) {
          if (inScope.has(n.expression.text)) hit = true;
        }
        ts.forEachChild(n, visit);
      };
      visit(loop.statement);
      return hit;
    };
    const ownerName = (n: ts.Node): string => {
      for (let p: ts.Node = n.parent; p; p = p.parent) {
        const name = nameOf(p);
        if (name !== null) return name;
      }
      return "(top level)";
    };
    const visit = (n: ts.Node): void => {
      if (isAnyLoop(n) && draws(path, n)) {
        const line = f.sf.getLineAndCharacterOfPosition(n.getStart(f.sf)).line + 1;
        const where = `${path}:${line}`;
        if (isOpenLoop(n)) {
          loops.push({
            owner: `${path} › ${ownerName(n)}`,
            where,
            guarded: guarded(n),
          });
        }
        const thrown = thrownAfter(n);
        if (thrown !== null) {
          giveUps.push({
            where,
            answered: refersTo(path, thrown, RETRY_LIMIT, "RetryLimitExceeded"),
          });
        }
      }
      ts.forEachChild(n, visit);
    };
    visit(f.sf);
  }
  return { loops, giveUps };
}

/** What the ledger and the scan disagree about, one line per owner. */
function disagreements(
  loops: Loop[],
  ledger: Record<string, readonly string[]>,
): string[] {
  const bare = new Map<string, string[]>();
  for (const l of loops) {
    if (!l.guarded) bare.set(l.owner, [...(bare.get(l.owner) ?? []), l.where]);
  }
  const out: string[] = [];
  for (const owner of new Set([...bare.keys(), ...Object.keys(ledger)])) {
    const found = bare.get(owner) ?? [];
    const stated = ledger[owner]?.length ?? 0;
    if (found.length !== stated) {
      out.push(
        `${owner}: ${found.length} unguarded (${found.join(", ")}), ${stated} in the ledger`,
      );
    }
  }
  return out.sort();
}

describe("an open loop that draws randomness", () => {
  const { loops, giveUps } = scan(sources());

  // The midend answers a `RetryLimitExceeded` with a sentence and the board
  // in play; any other error from a generator is a fault and propagates, which
  // for a bound that merely ran out leaves the player with a deal that never
  // ends.
  it("throws RetryLimitExceeded where a throw follows a loop that draws", () => {
    expect(
      giveUps.filter((g) => !g.answered).map((g) => g.where),
      "a bound that runs out throws RetryLimitExceeded, for the midend to answer",
    ).toEqual([]);
    expect(giveUps.length).toBeGreaterThanOrEqual(4);
  });

  it("calls a retryLimit guard, or the ledger says what bounds it", () => {
    expect(
      disagreements(loops, BOUNDED_OTHERWISE),
      "guard the loop with retryLimit, or state its bound in BOUNDED_OTHERWISE",
    ).toEqual([]);
  });

  it("is a population the scan can see", () => {
    // Floors, not a census: enough that an instrument gone blind cannot pass.
    expect(loops.filter((l) => l.guarded).length).toBeGreaterThanOrEqual(45);
    expect(loops.filter((l) => !l.guarded).length).toBeGreaterThanOrEqual(30);
    expect(
      new Set(loops.map((l) => l.where.split("/")[1])).size,
    ).toBeGreaterThanOrEqual(40);
  });

  it("gives every ledger entry a reason", () => {
    const empty = Object.entries(BOUNDED_OTHERWISE).flatMap(([owner, reasons]) =>
      reasons.some((r) => r.trim() === "") ? [owner] : [],
    );
    expect(empty).toEqual([]);
  });
});

describe("the scan, on loops written to be found", () => {
  const engine = {
    [RETRY_LIMIT]:
      "export function retryLimit(label: string): () => void { return () => {}; }",
    [RANDOM]: [
      "export type RandomState = { pos: number };",
      "export function randomNew(seed: string): RandomState { return { pos: 0 }; }",
      "export function randomUpto(state: RandomState, limit: number): number { return 0; }",
    ].join("\n"),
  };
  // Assembled, so that no import statement stands in this file's own text for
  // a scan of real imports to read.
  const importing = (names: string, from: string) =>
    `import { ${names} } ${"from"} "${from}";`;
  const game = (body: string) => ({
    ...engine,
    "games/x/deal.ts": [
      importing("retryLimit as limit", "../../engine/retry-limit.ts"),
      importing(
        "type RandomState, randomNew, randomUpto",
        "../../engine/random/index.ts",
      ),
      importing("fill", "./fill.ts"),
      "declare function solved(): boolean;",
      body,
    ].join("\n"),
    "games/x/fill.ts": [
      importing("randomUpto, type RandomState", "../../engine/random/index.ts"),
      "const held: { rs: RandomState } = { rs: { pos: 0 } };",
      "export function fill(): boolean { return randomUpto(held.rs, 2) === 0; }",
    ].join("\n"),
  });
  const found = (body: string) =>
    scan(game(body)).loops.map(
      (l) => `${l.owner.split(" › ")[1]}:${l.guarded ? "guarded" : "bare"}`,
    );

  it("finds a bare retry in each open shape", () => {
    expect(
      found(
        "function a(rng: RandomState) { for (;;) { if (randomUpto(rng, 2)) break; } }",
      ),
    ).toEqual(["a:bare"]);
    expect(
      found(
        "function a(rng: RandomState) { while (true) { if (randomUpto(rng, 2)) break; } }",
      ),
    ).toEqual(["a:bare"]);
    expect(
      found("function a(rng: RandomState) { do {} while (randomUpto(rng, 2)); }"),
    ).toEqual(["a:bare"]);
    expect(
      found("function a(rng: RandomState) { while (!solved()) randomUpto(rng, 2); }"),
    ).toEqual(["a:bare"]);
    expect(
      found(
        "function a(rng: RandomState) { for (let i = 0; ; i++) { if (randomUpto(rng, 2)) break; } }",
      ),
    ).toEqual(["a:bare"]);
    expect(
      found(
        "function a(rng: RandomState) { for (let i = 0; i < 9; ) { i += randomUpto(rng, 2); } }",
      ),
    ).toEqual(["a:bare"]);
  });

  it("finds a draw behind a local variable, a local function and an import", () => {
    expect(
      found(
        'function a() { const r = randomNew("s"); for (;;) { if (randomUpto(r, 2)) break; } }',
      ),
    ).toEqual(["a:bare"]);
    expect(
      found(
        "function pick(rng: RandomState) { return randomUpto(rng, 2); }\nconst b = (rng: RandomState) => { while (!pick(rng)) {} };",
      ),
    ).toEqual(["b:bare"]);
    expect(found("function a() { while (!fill()) {} }")).toEqual(["a:bare"]);
  });

  it("accepts a guard called once per pass, under an import alias", () => {
    expect(
      found(
        'function a(rng: RandomState) { const attempt = limit("a"); for (;;) { attempt(); if (randomUpto(rng, 2)) break; } }',
      ),
    ).toEqual(["a:guarded"]);
    expect(
      found(
        'function a(rng: RandomState) { const attempt = limit("a"); while (!randomUpto(rng, 2)) attempt(); }',
      ),
    ).toEqual(["a:guarded"]);
  });

  it("refuses a guard that is not this loop's", () => {
    // Created and never called.
    expect(
      found(
        'function a(rng: RandomState) { const attempt = limit("a"); for (;;) { if (randomUpto(rng, 2)) break; } }',
      ),
    ).toEqual(["a:bare"]);
    // Called by the loop inside, which is the one it bounds.
    expect(
      found(
        'function a(rng: RandomState) { const attempt = limit("a"); for (;;) { for (;;) { attempt(); if (randomUpto(rng, 2)) break; } if (solved()) break; } }',
      ),
    ).toEqual(["a:bare", "a:guarded"]);
    // Another function's guard of the same name.
    expect(
      found(
        'function g() { const attempt = limit("g"); attempt(); }\nfunction a(rng: RandomState) { const attempt = () => {}; for (;;) { attempt(); if (randomUpto(rng, 2)) break; } }',
      ),
    ).toEqual(["a:bare"]);
    // A call that only looks like one.
    expect(
      found(
        "declare function retryLimit(l: string): () => void;\nfunction a(rng: RandomState) { const attempt = retryLimit('a'); for (;;) { attempt(); if (randomUpto(rng, 2)) break; } }",
      ),
    ).toEqual(["a:bare"]);
  });

  it("leaves alone a loop that counts, and one that draws nothing", () => {
    expect(
      found(
        "function a(rng: RandomState) { for (let i = 0; i < 9; i++) randomUpto(rng, 2); for (const x of [1]) randomUpto(rng, x); }",
      ),
    ).toEqual([]);
    expect(found("function a() { for (;;) { if (solved()) break; } }")).toEqual([]);
  });

  it("finds a throw after a counted loop that draws, and reads its class", () => {
    const answered = (thrown: string) =>
      scan(
        game(
          `${importing("RetryLimitExceeded as Spent", "../../engine/retry-limit.ts")}\nfunction a(rng: RandomState) { for (let i = 0; i < 9; i++) { if (randomUpto(rng, 2)) return; } throw new ${thrown}("a"); }`,
        ),
      ).giveUps.map((g) => g.answered);
    expect(answered("Error")).toEqual([false]);
    expect(answered("Spent")).toEqual([true]);
    // A throw after a loop that draws nothing is not a retry running out.
    expect(
      scan(
        game('function a() { for (let i = 0; i < 9; i++) {} throw new Error("a"); }'),
      ).giveUps,
    ).toEqual([]);
  });

  it("reports a ledger that says too much, and one that says too little", () => {
    const { loops } = scan(
      game(
        "function a(rng: RandomState) { for (;;) { if (randomUpto(rng, 2)) break; } }",
      ),
    );
    const owner = "games/x/deal.ts › a";
    expect(disagreements(loops, { [owner]: ["counts down"] })).toEqual([]);
    expect(disagreements(loops, {})).toHaveLength(1);
    expect(disagreements(loops, { [owner]: ["counts down", "twice"] })).toHaveLength(1);
    expect(
      disagreements(loops, {
        [owner]: ["counts down"],
        "games/x/gone.ts › b": ["was here"],
      }),
    ).toHaveLength(1);
  });
});
