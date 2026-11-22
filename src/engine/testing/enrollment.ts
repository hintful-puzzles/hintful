/**
 * **Who is in a shared mechanic, and did they actually use it** — the two
 * questions every cross-game guard asks, written once. Each guard needs the same
 * four steps: build every game, filter it to the members, put a floor under the
 * count so a sweep that found nothing cannot report health, and name the
 * offenders in the failure.
 *
 * ON WHY THIS IS DERIVED AND NOT DECLARED. A game could instead *declare* its
 * capabilities and the guards read the manifest, but a declaration can be
 * forgotten by a new game, left behind by a changed one, or simply wrong, and
 * nothing notices. Everything here reads what the game *is*: the object it
 * registers, the `Ui` its `newUi` returns, the code of its own source. None of
 * those can drift from the game, because they are the game.
 *
 * The rule is the `ts-engine` spec's "A shared mechanic is joined by having it"
 * (followable form: `docs/testing.md` § "How a cross-game guard finds its
 * population"). A value a *mechanism consumes* (a technique's tier, a
 * `paramConfig` field list) is a healthy declaration and not what this is
 * against.
 *
 * Dev/test-only; never imported by production code.
 */

import ts from "typescript";
import "../../games/index.ts";
import { type Game, hasHint } from "../contract/game.ts";
import type { WorkingRow } from "../mechanics/code-rows.ts";
import { getTsGame, registeredGameIds } from "../midend/registry.ts";
import { randomNew } from "../random/index.ts";
import { linesMatching, stripComments } from "./code-lines.ts";
import { ENGINE_DIRECTORIES } from "./engine-directories.ts";
import type { KindExemption } from "./ledger.ts";
import { preferredDrawState } from "./preferred-draw-state.ts";
import {
  callsTo,
  type ExportRef,
  importedModules,
  parsed,
  resolveSpecifier,
  type UseKind,
  usesOf,
} from "./syntax.ts";

// biome-ignore lint/suspicious/noExplicitAny: a deliberately game-agnostic probe.
export type AnyGame = Game<any, any, any, any, any, any>;

/** One registered game, with a board and a fresh `Ui` built from it. */
export interface BuiltGame {
  readonly id: string;
  readonly game: AnyGame;
  /** A default-params board, from a fixed seed so a failure names the same one
   * every run. */
  readonly state: unknown;
  /** What this game's `newUi` actually returns — the thing to read a
   * capability off, rather than asking the game to announce one. */
  readonly ui: Record<string, unknown>;
  /** The other half of what a game remembers: what its `newDrawState` returns
   * at its preferred tile size — the vocabulary the game's own constructor
   * declares. Read straight off the constructor, before `redraw` has run, so a
   * field only a frame assigns is not in it. */
  readonly drawState: Record<string, unknown>;
}

/**
 * Every registered game, by puzzle id, sorted so a sweep iterates in a stable
 * order and a failure names the same game first every run. The side-effect
 * import above is what populates the registry.
 */
export const REGISTERED_GAMES: readonly [string, AnyGame][] = registeredGameIds()
  .sort()
  .map((id): [string, AnyGame] => {
    const game = getTsGame(id) as AnyGame | undefined;
    if (!game) throw new Error(`${id} is registered but has no game object`);
    return [id, game];
  });

/** The ids of `REGISTERED_GAMES`, in the same sorted order. */
export const REGISTERED_IDS: readonly string[] = REGISTERED_GAMES.map(([id]) => id);

/**
 * How many games the registry offered — the **vacuity guard** every derived
 * sweep owes. A sweep over an empty population passes while checking nothing,
 * so an import cycle leaving the registry unpopulated, or a renamed accessor,
 * would turn every guard green. Floor this, not only a filtered result, which
 * can look healthy while the set it was drawn from is short.
 */
export const REGISTERED_GAME_COUNT = REGISTERED_GAMES.length;

let built: BuiltGame[] | null = null;

/**
 * Every registered game, id-sorted, each with a board and a `Ui`. Memoized:
 * generating every board is the expensive part of a cross-game sweep, so the
 * guards in one worker share a single set.
 */
export function builtGames(): BuiltGame[] {
  if (built) return built;
  built = REGISTERED_GAMES.map(([id, game]): BuiltGame => {
    const params = game.defaultParams();
    const desc = game.newDesc(params, randomNew(`enrollment-${id}`)).desc;
    const state = game.newState(params, desc);
    return {
      id,
      game,
      state,
      ui: game.newUi(state) as Record<string, unknown>,
      drawState: preferredDrawState(game, state) as Record<string, unknown>,
    };
  });
  return built;
}

export interface Enrollment {
  /** The member ids, sorted. */
  readonly ids: string[];
  /** How many games the registry offered the filter — **the vacuity number**.
   * Assert a floor under *this*, not only under `ids`: a filtered count can
   * look healthy while the set it was drawn from is short, which is how a
   * derived sweep reports health having looked at nothing. */
  readonly population: number;
}

/**
 * The games a predicate accepts, read off what each game actually is.
 *
 * ```ts
 * const noteTaking = enrolledIn((g) => typeof g.ui.pencilMode === "boolean");
 * expect(noteTaking.population).toBeGreaterThanOrEqual(50); // vacuity guard
 * expect(noteTaking.ids).toEqual([...]);
 * ```
 */
export function enrolledIn(isMember: (g: BuiltGame) => boolean): Enrollment {
  const all = builtGames();
  return { ids: all.filter(isMember).map((g) => g.id), population: all.length };
}

// --- what each game can do, derived ----------------------------------------

/**
 * The optional members of the `Game` interface and of its hint, `GameHint`,
 * read off their own declarations: a hint's as `hint.<member>`.
 *
 * The same derivation `contract-surface.test.ts` makes, for the complementary
 * question. That file asks, per *member*, "does anyone implement this and does
 * anyone read it"; this asks, per *game*, "what can it do" — so both must start
 * from the interface itself rather than from a list somebody typed, or a
 * capability added to `Game` is invisible to both.
 */
export const OPTIONAL_GAME_MEMBERS: readonly string[] = (() => {
  const modules = import.meta.glob<string>("../contract/game.ts", {
    query: "?raw",
    import: "default",
    eager: true,
  });
  const text = Object.values(modules)[0];
  if (text === undefined)
    throw new Error("enrollment: engine/contract/game.ts not found");
  const src = ts.createSourceFile("game.ts", text, ts.ScriptTarget.ESNext, true);
  const optionalOf = (name: string): string[] => {
    for (const st of src.statements) {
      if (!ts.isInterfaceDeclaration(st) || st.name.text !== name) continue;
      const names = st.members
        .filter((m) => m.questionToken !== undefined && m.name !== undefined)
        .map((m) => (m.name as ts.Identifier).text);
      if (names.length === 0)
        throw new Error(`enrollment: \`${name}\` has no optional members`);
      return names;
    }
    throw new Error(`enrollment: no \`${name}\` interface in engine/contract/game.ts`);
  };
  // `hint` itself is required, and absent as a draft's `DRAFT_HINT`: a game
  // may lack a written hint as it may lack any optional member.
  return [
    "hint",
    ...optionalOf("Game"),
    ...optionalOf("GameHint").map((m) => `hint.${m}`),
  ].sort();
})();

/** Everything one game is observably able to do. */
export interface CapabilitySet {
  readonly id: string;
  /** The optional `Game` members this game actually carries, sorted. */
  readonly members: string[];
  /** The fields its `newUi` actually returned, sorted. */
  readonly ui: string[];
  /** The fields its `newDrawState` actually returned, sorted.
   *
   * **Names only, deliberately** — not sizes, values or types. A snapshot that
   * moves for a reason other than a game's vocabulary is noise, and noise
   * trains its readers to re-baseline without reading.
   *
   * The `Ui` half cannot see the whole of the drag or pencil vocabulary,
   * because half of it is remembered by the renderer (`pencilModeShown`, for
   * one). A private copy of that vocabulary shows here and nowhere else: jscpd
   * misses one that computes its own box. */
  readonly drawState: string[];
}

/**
 * What every registered game can do, read off the game, its `Ui` and its draw
 * state.
 *
 * The guard against *silent capability loss*: a refactored game that quietly
 * stops offering its keypad, its reference aid or its mistake checking still
 * compiles, still plays, and still passes most of its own tests. A declared
 * manifest cannot catch that, because the edit that drops the capability drops
 * its manifest entry too. A set read off the object cannot be edited into
 * agreement with a mistake.
 */
export function capabilitySets(): CapabilitySet[] {
  return builtGames().map((g) => ({
    id: g.id,
    members: OPTIONAL_GAME_MEMBERS.filter((m) =>
      m === "hint"
        ? hasHint(g.game)
        : m.startsWith("hint.")
          ? Object.hasOwn(g.game.hint, m.slice("hint.".length))
          : Object.hasOwn(g.game as object, m),
    ).sort(),
    ui: Object.keys(g.ui).sort(),
    drawState: Object.keys(g.drawState).sort(),
  }));
}

/** Each field of the working row, and what a `Ui` holds there. Keyed by the
 * type, so a field renamed in `code-rows.ts` fails to compile here. */
const WORKING_ROW_FIELDS: {
  readonly [K in keyof Required<WorkingRow>]: (v: unknown) => boolean;
} = {
  entries: Array.isArray,
  cursor: (v) => typeof v === "object" && v !== null,
  pencilMode: (v) => v === undefined || typeof v === "boolean",
  ready: (v) => typeof v === "boolean",
};

/**
 * The code-breaking games, by the working row of `code-rows.ts` on their
 * `Ui`: a guess composed a slot at a time, each value named by its own key,
 * and sent whole as a probe of a hidden answer. Throws on none, so a
 * derivation that stopped seeing the row cannot excuse nothing in silence.
 */
export function workingRowGames(): string[] {
  const { ids } = enrolledIn((g) =>
    Object.entries(WORKING_ROW_FIELDS).every(([field, holds]) => holds(g.ui[field])),
  );
  if (ids.length === 0) throw new Error("enrollment: no game has a working row");
  return ids;
}

/** What a guard excuses every code-breaking game of `population` for, with
 * the reason, rather than listing them in its ledger. */
export function workingRowExemption(
  population: readonly string[],
  reason: string,
): KindExemption {
  const rows = workingRowGames();
  return {
    kind: "a working row (engine/mechanics/code-rows.ts)",
    ids: population.filter((id) => rows.includes(id)),
    reason,
  };
}

/** A source file a guard reads, by its repo-relative path. */
export interface SourceFile {
  path: string;
  text: string;
}

/** A glob key from this module's directory, as a repo-relative path. */
const fromHere = (key: string): string =>
  resolveSpecifier("src/engine/testing/x.ts", key);

/** Every game's own source files, by game id — test files excluded, because a
 * guard asking "does this game hand-roll the mechanic" must not be satisfied by
 * a test that merely mentions the helper.
 *
 * A game's own code includes each **game family** it imports: an engine
 * directory that builds part of a `Game` (a `family` in
 * `engine-directories.ts`), such as `edge-clue-latin/`, which Unequal and
 * Adjacent play on. What two games share cannot live in either, and a game
 * that runs the shared mechanic there has neither hand-rolled it nor hidden
 * it. The engine's other directories are not a game's own code: they are the
 * mechanics the guards ask after. */
export const gameSourceFiles: ReadonlyMap<string, readonly SourceFile[]> = (() => {
  // A game's compiled module is its own code, generated outside its directory.
  const modules = {
    ...import.meta.glob<string>("../../games/*/**/*.ts", {
      query: "?raw",
      import: "default",
      eager: true,
    }),
    ...import.meta.glob<string>("../../generated/games/*/*.ts", {
      query: "?raw",
      import: "default",
      eager: true,
    }),
  };
  // A glob is a literal, so each family is named; the count below fails when
  // a declared family is missing from it. A wider glob would make every guard
  // that enrolls games read, and so be selected by, every engine module.
  const engineDirs = import.meta.glob<string>(
    ["../edge-clue-latin/*.ts", "../fill/*.ts"],
    {
      query: "?raw",
      import: "default",
      eager: true,
    },
  );
  const familyDirs = new Set(
    ENGINE_DIRECTORIES.filter((d) => d.kind === "family").map((d) => d.dir),
  );
  const families = new Map<string, SourceFile[]>();
  for (const [key, text] of Object.entries(engineDirs)) {
    if (key.includes(".test.")) continue;
    const path = fromHere(key);
    const dir = path.split("/")[2] as string;
    if (familyDirs.has(dir))
      families.set(dir, [...(families.get(dir) ?? []), { path, text }]);
  }
  if (families.size !== familyDirs.size)
    throw new Error(
      `game families read ${families.size} of ${familyDirs.size} declared`,
    );

  const byGame = new Map<string, SourceFile[]>();
  const familiesOf = new Map<string, Set<string>>();
  for (const [key, text] of Object.entries(modules)) {
    if (key.includes(".test.")) continue;
    const path = fromHere(key);
    const id = /\/games\/([^/]+)\//.exec(path)?.[1];
    if (!id) continue;
    byGame.set(id, [...(byGame.get(id) ?? []), { path, text }]);
    const dirs = familiesOf.get(id) ?? new Set<string>();
    for (const m of importedModules(parsed(path, text))) {
      const [src, engine, dir, file] = m.split("/");
      if (
        src === "src" &&
        engine === "engine" &&
        file !== undefined &&
        families.has(dir as string)
      )
        dirs.add(dir as string);
    }
    familiesOf.set(id, dirs);
  }
  for (const [id, dirs] of familiesOf)
    for (const dir of dirs) byGame.get(id)?.push(...(families.get(dir) ?? []));
  return byGame;
})();

/** How many game source files were scanned — the source sweep's own vacuity
 * number. An unmatched glob yields `{}`, and every check over it then passes. */
export const SCANNED_SOURCE_FILES = [...gameSourceFiles.values()].reduce(
  (n, list) => n + list.length,
  0,
);

/** Each game's syntax trees, one per source file. */
export function gameSyntax(id: string): ts.SourceFile[] {
  return (gameSourceFiles.get(id) ?? []).map((f) => parsed(f.path, f.text));
}

/** Every game's trees, once each: a family's files are shared by its games. */
function everyGameSyntax(): ts.SourceFile[] {
  return [...new Set([...gameSourceFiles.keys()].flatMap(gameSyntax))];
}

/** The questions {@link gamesUsing} has seen some game answer, so a guard
 * asking it per game checks the whole collection once. */
const everUsed = new Set<string>();

/**
 * Which of `ids` use any of the exports `refs` in their own code, as `kind`
 * when given: a `"call"` of a function, a `"new"` of a class, or a use of any
 * kind. Bound through the import, so a renamed import counts and a local of
 * the same name does not (`syntax.ts`'s `usesOf`).
 *
 * **The reverse direction, and the one no behavioral test can see**: what is
 * often asserted is that a hand-rolled copy of the shared mechanic does *not*
 * exist, and code that does not exist cannot be observed by running anything.
 * Ask for the call where the call is the mechanic: importing a module and
 * never calling it is not using it.
 *
 * Throws when no game's code uses any of `refs`: an export was renamed or
 * moved, and a guard keyed on the old one would otherwise read an empty
 * population as health.
 */
export function gamesUsing(
  ids: readonly string[],
  refs: ExportRef | readonly ExportRef[],
  kind: UseKind | null = null,
): string[] {
  const all: readonly ExportRef[] = "module" in refs ? [refs] : refs;
  const used = (sf: ts.SourceFile): boolean =>
    all.some((ref) => usesOf(sf, ref).some((u) => kind === null || u.kind === kind));
  const key = JSON.stringify([all, kind]);
  if (!everUsed.has(key) && !everyGameSyntax().some(used))
    throw new Error(
      `enrollment: no game's code uses ${all.map((r) => `${r.name} from ${r.module}`).join(" or ")}${kind ? ` as a ${kind}` : ""}: renamed or moved?`,
    );
  everUsed.add(key);
  return ids.filter((id) => gameSyntax(id).some(used));
}

/** The rest of `ids`: those whose code never uses any of `refs` as `kind`
 * ({@link gamesUsing}). */
export function gamesNotUsing(
  ids: readonly string[],
  refs: ExportRef | readonly ExportRef[],
  kind: UseKind | null = null,
): string[] {
  const using = gamesUsing(ids, refs, kind);
  return ids.filter((id) => !using.includes(id));
}

/** Which of `ids` call a method named `name` on any receiver (`x.name(…)`):
 * the key for a member of an interface, such as `GameDrawing`'s, which no
 * import binds. Throws, as {@link gamesUsing} does, when no game calls one. */
export function gamesCallingMethod(ids: readonly string[], name: string): string[] {
  const calls = (sf: ts.SourceFile): boolean =>
    callsTo(sf, name).some((c) => ts.isPropertyAccessExpression(c.expression));
  if (!everyGameSyntax().some(calls))
    throw new Error(`enrollment: no game calls a method named ${name}: renamed?`);
  return ids.filter((id) => gameSyntax(id).some(calls));
}

/** Which of `ids` import a module `matches` accepts (a repo-relative path),
 * at run time: a type-only import is not a use. Throws, as
 * {@link gamesUsing} does, when no game imports one. */
export function gamesImporting(
  ids: readonly string[],
  matches: (module: string) => boolean,
): string[] {
  const imports = (sf: ts.SourceFile): boolean =>
    importedModules(sf, true).some(matches);
  if (!everyGameSyntax().some(imports))
    throw new Error("enrollment: no game imports a module the predicate accepts");
  return ids.filter((id) => gameSyntax(id).some(imports));
}

/** Each game's comment-stripped sources, computed on first ask and kept. */
const codeText = new Map<string, string[]>();

function gameCode(id: string): string[] {
  const cached = codeText.get(id);
  if (cached) return cached;
  const stripped = (gameSourceFiles.get(id) ?? []).map((f) => stripComments(f.text));
  codeText.set(id, stripped);
  return stripped;
}

/**
 * Every line of `ids`' own **code** matching `re`, tagged with the game it came
 * from: for a scan whose subject is wording, where the text is the thing under
 * test. A scan for a use of something keys on the tree instead
 * ({@link gamesUsing}).
 *
 * Comment-stripped: a rule about what a game *says to a player* must not fire
 * on a doc comment discussing it.
 *
 * The caller gets a superset — every match anywhere in the code, not only in a
 * narration string — and is expected to classify what it catches rather than
 * narrow the pattern (`docs/method.md` § "A scan that keys on a name"). Narrowing to
 * "string literals inside `explain()`" is how a sweep comes to miss the arm
 * that was written somewhere else.
 */
export function codeLinesMatching(
  ids: readonly string[],
  re: RegExp,
): { id: string; line: string }[] {
  return ids.flatMap((id) =>
    gameCode(id).flatMap((code) => linesMatching(id, code, re)),
  );
}
