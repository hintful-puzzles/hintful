/**
 * The guard for **"a game contains no color value"** — read as a rule about
 * source, because that is what the rule actually says.
 *
 * `palette.test.ts` checks *values*, and value is the wrong instrument for this
 * requirement in both directions. It cannot see provenance (a game writing a
 * literal that happens to equal a token passes), and once every color is a token
 * it cannot see anything at all, because a derived color has no value to look up
 * — `mkhighlightSpecific(GRID_DARK)` and `soloKiller(bg)` are correct and
 * unmatchable. So the value guard keeps the jobs value is good at (no two shared
 * roles hold one value; every derived role stays visible against both host
 * backgrounds) and this one reads the source.
 *
 * Three rules, each aimed at one way a color decision leaks back into a game:
 *
 * 1. **no color literal** — `[0.2, 1, 0.2]` in a game is a value nobody can
 *    restyle, and `[(2 * a[0] + b[0]) / 3, …]` is the same decision computed;
 *    an array literal is one where TypeScript reads it as a `Color`;
 * 2. **no reading a color's channel** — `bg[0] * 0.9` is the same decision
 *    written as arithmetic, and the commonest way a ported game spells a
 *    derived color; a channel read is an index into a value TypeScript reads
 *    as a `Color`;
 * 3. **no importing the color combinators** — `mix`/`scale`/`divide`
 *    are how the *table* builds one color out of others; a game reaching for
 *    them is a game deciding a color.
 *
 * A fourth rule holds the table to the games: a token in `palette-games.ts`
 * is imported only by the game its prefix names, and by some game.
 *
 * Every rule reads the syntax tree, and the first two the type checker: a
 * color is found by its type and an import by its module, never by a
 * spelling (`docs/method.md` § "A scan that keys on a name").
 *
 * What it deliberately does not attempt: a game could still compute a color
 * from values it destructures out of one. That is a review matter. A game is
 * free to call a **named derivation** from the table (`slantGrid(background)`) or
 * the shared bevel trio (`mkhighlightSpecific(GRID_DARK)`) — those are the
 * intended shape, not an exception to it.
 */
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { gameSourceFiles } from "../testing/enrollment.ts";
import {
  type ExportRef,
  importedModules,
  importedNames,
  parsed,
  resolveSpecifier,
  usesOf,
} from "../testing/syntax.ts";
import * as colors from "./colors.ts";
import * as roles from "./palette.ts";
import * as gameTokens from "./palette-games.ts";

/** A glob key from this directory, as the repo-relative path every tree a
 * guard parses is named by. */
const fromHere = (key: string): string =>
  resolveSpecifier("src/engine/color/x.ts", key);

const PALETTE = "src/engine/color/palette.ts";
const TABLE = "src/engine/color/palette-games.ts";
const COLORS = "src/engine/color/colors.ts";
const ROLES = "src/engine/color/roles.ts";
const COMBINATORS = "src/engine/color/color-token.ts";

/** The table's modules, and the app, which paints a hint's reference colors
 * itself over any game's board. */
const tableModules = import.meta.glob<string>(
  [
    "./palette.ts",
    "./palette-games.ts",
    "./colors.ts",
    "./roles.ts",
    "../../puzzle/hint-presentation.ts",
  ],
  { query: "?raw", import: "default", eager: true },
);

/** Each painter's file, by the name a description's `paint:` gives it, read
 * off the registry's imports. */
const painterFiles: ReadonlyMap<string, ts.SourceFile> = (() => {
  const files = Object.entries(
    import.meta.glob<string>("../render/pieces/*.ts", {
      query: "?raw",
      import: "default",
      eager: true,
    }),
  ).map(([key, text]) => parsed(fromHere(key), text));
  const index = files.find((f) => f.fileName.endsWith("/pieces/index.ts"));
  if (index === undefined) throw new Error("no painter registry: moved?");
  const out = new Map<string, ts.SourceFile>();
  for (const f of files)
    for (const name of importedNames(index, f.fileName)) out.set(name, f);
  return out;
})();

/** The painters each game born from its description names, by game id. */
const paintersNamed: ReadonlyMap<string, readonly string[]> = new Map(
  Object.entries(
    import.meta.glob<{
      readonly play?: {
        readonly values: Readonly<Record<string, { readonly paint?: string }>>;
      };
    }>("../../generated/games/*/*.compiled.ts", { eager: true }),
  ).flatMap(([key, module]) => {
    const id = /\/games\/([^/]+)\//.exec(key)?.[1];
    const names = Object.values(module.play?.values ?? {}).flatMap((v) =>
      v.paint === undefined ? [] : [v.paint],
    );
    return id === undefined || names.length === 0 ? [] : [[id, names] as const];
  }),
);

/** The module at `path`, parsed; throws when the glob missed it. */
function tree(path: string): ts.SourceFile {
  const hit = Object.entries(tableModules).find(([key]) => fromHere(key) === path);
  if (!hit) throw new Error(`no module at ${path}: moved?`);
  return parsed(path, hit[1]);
}

/** The meanings layer: a named color counts as used when a meaning is defined
 * over it, not only when a game imports it directly. */
const paletteTree = tree(PALETTE);
/** The per-game half of the table: needed to see that a set's members are
 * used by the aggregate the games import. */
const tableTree = tree(TABLE);
const colorsTree = tree(COLORS);
const rolesTree = tree(ROLES);
const appTree = tree("src/puzzle/hint-presentation.ts");

/** Raw text of every non-test source file under `src/games/`.
 *
 * A glob is **not** an import specifier, so a bulk rewriter that repoints
 * imports after a file move leaves it behind — and an unmatched glob yields
 * `{}` rather than an error, so every assertion below would pass over
 * nothing. That is why `finds the game sources at all` exists. */
const sourceModules = import.meta.glob<string>("../../games/**/*.ts", {
  query: "?raw",
  import: "default",
  eager: true,
});

/** The engine's painters, which a game born from its description names in
 * its `play:`: their colors are that game's. */
const painterModules = import.meta.glob<string>("../render/pieces/*.ts", {
  query: "?raw",
  import: "default",
  eager: true,
});
const painterTrees = Object.entries(painterModules)
  .filter(([key]) => !key.endsWith(".test.ts"))
  .map(([key, text]) => parsed(fromHere(key), text));

/** Every non-test game source, keyed `<game>/<file>`, with its tree. */
const sources: { rel: string; tree: ts.SourceFile }[] = Object.entries(sourceModules)
  .filter(([key]) => !key.endsWith(".test.ts"))
  .map(([key, text]) => {
    const path = fromHere(key);
    return { rel: path.slice("src/games/".length), tree: parsed(path, text) };
  })
  .sort((a, b) => a.rel.localeCompare(b.rel));

interface Finding {
  line: number;
  text: string;
}

/**
 * Each game source's color literals and channel reads, by `<game>/<file>`,
 * as the type checker reads them.
 *
 * A literal is an array literal TypeScript reads as a `Color`
 * (`engine/contract/types.ts`'s alias), wherever it stands. A color reaches a board
 * only through `colors`, typed `Color[]`, so a literal that gets there is
 * typed a `Color`, by where it is written or by a declaration or assertion on
 * the way; a triple of numbers that is a tally or a menu's sizes is not,
 * whatever its shape. A channel read is an index into a value of that type,
 * whatever the value is called. Both are keyed on the type's symbol, not its
 * name.
 */
function colorFindings(): Map<string, { literals: Finding[]; channels: Finding[] }> {
  // `src` is typed without Node, so a path is the URL's own.
  const path = (p: string): string =>
    decodeURIComponent(new URL(p, import.meta.url).pathname);
  const files = Object.keys(sourceModules)
    .filter((p) => !p.endsWith(".test.ts"))
    .map(path);
  const typesFile = path("../contract/types.ts");
  const root = path("../../../");
  const config = ts.readConfigFile(`${root}tsconfig.json`, (p) => ts.sys.readFile(p));
  const { options } = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
  const program = ts.createProgram([...files, typesFile], { ...options, noEmit: true });
  const checker = program.getTypeChecker();
  const typesSource = program.getSourceFile(typesFile);
  const module = typesSource && checker.getSymbolAtLocation(typesSource);
  const color =
    module && checker.getExportsOfModule(module).find((s) => s.name === "Color");
  if (!color) throw new Error("engine/contract/types.ts exports no Color");
  const isColor = (t: ts.Type): boolean =>
    t.aliasSymbol === color || (t.isUnion() && t.types.some(isColor));
  const out = new Map<string, { literals: Finding[]; channels: Finding[] }>();
  for (const file of files) {
    const source = program.getSourceFile(file);
    if (!source) throw new Error(`${file} is not in the program`);
    const rel = /(?:^|\/)src\/games\/(.+)$/.exec(file)?.[1] ?? file;
    const found = { literals: [] as Finding[], channels: [] as Finding[] };
    const at = (n: ts.Node): Finding => {
      const line = source.getLineAndCharacterOfPosition(n.getStart()).line + 1;
      return { line, text: (source.text.split("\n")[line - 1] ?? "").trim() };
    };
    const visit = (n: ts.Node): void => {
      if (ts.isArrayLiteralExpression(n)) {
        const t = checker.getContextualType(n);
        if (t && isColor(t)) found.literals.push(at(n));
      }
      if (
        ts.isElementAccessExpression(n) &&
        isColor(checker.getTypeAtLocation(n.expression))
      )
        found.channels.push(at(n));
      ts.forEachChild(n, visit);
    };
    visit(source);
    out.set(rel, found);
  }
  return out;
}

describe("a game contains no color value", () => {
  const findings = colorFindings();

  it("finds the game sources at all", () => {
    // A broken glob would make every rule below vacuously pass.
    expect(sources.length).toBeGreaterThan(100);
    expect([...findings.keys()].sort()).toEqual(sources.map((s) => s.rel).sort());
  });

  for (const { rel, tree } of sources) {
    const found = findings.get(rel);

    it(`${rel} writes no color literal`, () => {
      expect(
        (found?.literals ?? []).map((f) => `${rel}:${f.line}  ${f.text}`),
        "a color belongs in the token table (palette.ts / palette-games.ts) " +
          "under a name that says what it means; add it there and reference it",
      ).toEqual([]);
    });

    it(`${rel} reads no color's channel`, () => {
      expect(
        (found?.channels ?? []).map((f) => `${rel}:${f.line}  ${f.text}`),
        "a color defined relative to another is still a color decision: " +
          "give it a name in palette-games.ts as a function of the background, " +
          "and call that",
      ).toEqual([]);
    });

    it(`${rel} does not combine colors itself`, () => {
      expect(
        importedModules(tree).includes(COMBINATORS) ? rel : null,
        "mix/scale/divide build one color out of others, which is the " +
          "token table's job — put the combination there under a name",
      ).toBeNull();
    });
  }
});

/** Whether `tree`, the module that declares `ref`, refers to it anywhere but
 * its own declaration: a set it is gathered into, or a meaning built on it. */
const referencedInOwnModule = (tree: ts.SourceFile, ref: ExportRef): boolean =>
  usesOf(tree, ref).some(
    ({ node }) => !(ts.isVariableDeclaration(node.parent) && node.parent.name === node),
  );

/**
 * Ownership, checked at the import.
 *
 * A per-game token names the game it belongs to, and that name is only worth
 * anything if it is true. Checking it here rather than by inspecting resolved
 * palettes catches the case a palette cannot show: a token that is an *input
 * to* `mkhighlightSpecific` (Slide's block bases) never appears in a palette
 * with its own value, so an identity check over palette entries calls it
 * unused.
 */
describe("a per-game token belongs to the game it names", () => {
  /** The game a token's name claims. `SIGNPOST_REGION_0` → `signpost`;
   * `netslideBorder` → `netslide`. Taking the whole run before the first
   * underscore (or the leading lower-case run) rather than testing prefixes
   * avoids the trap that `NETSLIDE_*` also starts with `net`. */
  const owner = (name: string): string =>
    name === name.toUpperCase()
      ? (name.split("_")[0] as string).toLowerCase()
      : (/^[a-z]+/.exec(name)?.[0] ?? name);

  for (const { rel, tree } of sources) {
    const game = rel.split("/")[0];
    const wrong = importedNames(tree, TABLE).filter((n) => owner(n) !== game);
    it(`${rel} imports only its own tokens`, () => {
      // A copied import line is the realistic way this breaks: `SPOKES_CURSOR`
      // pasted into Sticks looks right, works, and quietly ties two games'
      // schemes together.
      expect(wrong).toEqual([]);
    });
  }

  it("declares no token no game uses", () => {
    // A token with no consumer is a color decision whose effect nobody can see,
    // and it will be wrong by the time somebody does.
    //
    // "Used" includes used *by the table itself*: a set's members are declared
    // individually so each can carry a name, a meaning and its own scheme value,
    // and are then gathered into the ordered array the game actually imports
    // (`FLOOD_TILE_3` → `FLOOD_TILES`). Only a name nothing refers to is dead.
    const byGames = new Set(sources.flatMap(({ tree }) => importedNames(tree, TABLE)));
    const dead = Object.keys(gameTokens).filter(
      (name) =>
        !byGames.has(name) &&
        !referencedInOwnModule(tableTree, { module: TABLE, name }),
    );
    expect(dead).toEqual([]);
  });
});

/**
 * A **named color with no consumer** is a color decision nobody can see.
 *
 * The same rule as the per-game half, over `colors.ts`: when a color's last
 * consumer moves to another shade, the color stays in the table declaring a
 * shade nothing on any board can show. That is exactly the state the palette is
 * small in order to avoid.
 *
 * "Used" spans all five ways a color reaches a board: a game or one of the
 * engine's painters (`engine/render/pieces/`) imports it, a
 * meaning in `palette.ts` or `palette-games.ts` is defined over it, one of the
 * sets in `colors.ts` itself gathers it up (`PURPLE` is in `TWO`, which is
 * what Unruly imports), or the app paints it over the board (a hint's
 * reference colors).
 */
it("declares no named color nothing can show", () => {
  const used = new Set(
    [
      ...sources.map((s) => s.tree),
      ...painterTrees,
      paletteTree,
      tableTree,
      appTree,
    ].flatMap((t) => importedNames(t, COLORS)),
  );
  const dead = Object.keys(colors).filter(
    (name) =>
      !used.has(name) && !referencedInOwnModule(colorsTree, { module: COLORS, name }),
  );
  expect(dead).toEqual([]);
});

/**
 * **Only the engine draws a ring**, round (`GameDrawing.drawRing`), in the ink
 * `resolvePalette` appends; a game that held `HINT_RING` in a slot could draw
 * a "ringed" mark in any shape. The color itself is no secret (the drag's
 * blue is the same), so what is refused is the name: a game reaches the ring
 * only through the engine.
 */
it("no game holds the ring's ink", () => {
  const holding = sources
    .filter(
      ({ tree }) => usesOf(tree, { module: PALETTE, name: "HINT_RING" }).length > 0,
    )
    .map(({ rel }) => rel);
  expect(holding).toEqual([]);
});

/**
 * A **shared role** is one because two or more games mean the same thing by
 * it. One game's color is that game's, declared under its id in
 * `palette-games.ts`, and a role no game takes is a decision nothing on any
 * board shows.
 *
 * A hint ink owes no game: the engine reads every one (`HINT_INK`), and draws
 * the stripes in its own (`resolvePalette`).
 *
 * Counted by game id over `gameSourceFiles`, which credits a shared family's
 * renderer (`engine/edge-clue-latin/`) to every game that draws with it, and
 * each painter a born game's `paint:` names to that game. A game whose
 * palette starts from `rolePalette` takes every role `roles.ts` fills, read
 * off that file's own import from `palette.ts`.
 */
it("declares no shared role fewer than two games take", () => {
  const filledByRoles = importedNames(rolesTree, PALETTE);
  expect(filledByRoles).toContain("CURSOR");
  const takenBy = new Map<string, Set<string>>();
  for (const [id, files] of gameSourceFiles)
    for (const { path, text } of files) {
      const tree = parsed(path, text);
      const names = importedNames(tree, PALETTE);
      if (usesOf(tree, { module: ROLES, name: "rolePalette" }).length > 0)
        names.push(...filledByRoles);
      for (const name of names)
        takenBy.set(name, (takenBy.get(name) ?? new Set()).add(id));
    }
  // A game born from its description draws with the painters it names, whose
  // files are no game's source.
  for (const [id, names] of paintersNamed)
    for (const name of names) {
      const file = painterFiles.get(name);
      if (file === undefined) throw new Error(`${id}: no painter file for ${name}`);
      for (const role of importedNames(file, PALETTE))
        takenBy.set(role, (takenBy.get(role) ?? new Set()).add(id));
    }
  expect(paintersNamed.size).toBeGreaterThan(5);
  const lonely = Object.keys(roles)
    .map((name) => ({
      name,
      games: [...(takenBy.get(name) ?? [])].sort(),
      owed: name.startsWith("HINT_") ? 0 : 2,
    }))
    .filter(({ games, owed }) => games.length < owed)
    .map(({ name, games }) => `${name}: ${games.join(", ") || "no game"}`);
  expect(lonely).toEqual([]);
});
