## Context

Consumers, read 2026-11-20 with `git grep`:

- The catalog is read at **config time** by `vite.config.ts` (the puzzle and
  help pages, the puzzle count) and by `vite-plugins/game-lists.ts` through
  `src/puzzle/game-lists.ts`; and at **run time** by the app through
  `src/puzzle/catalog.ts` (home screen, switcher, routing, saved games, help
  links) and by tests.
- The registry, `src/games/index.ts`, is imported by the worker, by
  `src/build-facts.ts` (which the build loads through Vite's module runner),
  and by some sixty tests. Forty of those call `registerAllGames()`, which
  exists for one reason: `untiered-load.test.ts` calls `_resetRegistry()` to
  take its fake game back out, and under `isolate: false` every other file
  then has to put the games back.
- Every game module registers itself on import, except `wordtrail`, which
  only the hand list registered.

Vite 8 bundles the config with rolldown, which leaves both `import.meta.glob`
and a template-literal `import()` as they are (probed 2026-11-20). So the
config cannot share the app's glob.

## Decisions

**The entry is `src/games/<id>/catalog.ts`, exporting `entry: PuzzleData`.**
The id is the directory's name and is not written again. The module imports
only the `PuzzleData` type, so it loads none of the game.

**The shape and the families move to `src/engine/catalog.ts`.** Two rules
meet here: a game imports nothing under `src/` outside `engine/` and `games/`
(the layering check), and the Vite config is built from nothing under
`engine/` or `games/` (`config-imports.test.ts`). The entry's type is what a
game declares in, so it is the engine's; `catalog-data.ts`, which the config
loads, keeps `catalogFrom` and imports the type alone, which the config's
bundle erases. `src/games/index.ts` reads the catalog's population from its
own directories (a glob of the `catalog.ts` paths), not from the app.

**Two readers, one assembly.** `catalogFrom` in `catalog-data.ts` turns a set
of modules keyed by path into the catalog, sorted by id (the order the home
screen and menus use, as before). The app's reader is an eager
`import.meta.glob` in `src/puzzle/catalog.ts`. The config's reader,
`vite-plugins/catalog.ts`, lists `src/games/*/` and imports each `catalog.ts`
through Node's own type stripping; a directory without one fails the config
load. Those imports are not in the config bundle, so the plugin restarts the
dev server itself when one changes, as an edit to `catalog-data.ts` used to,
and a `#<mtime>.ts` fragment keeps Node's module cache from serving the old
one (a query hides the extension from Vite's transform, which reads the
language off the end of the whole URL).
`game-lists.ts` takes the catalog as an argument, since both sides call it.

**The registry is a glob over `src/games/*/index.ts`**, each game registering
itself on import, as all but one already did. On load it throws unless every
directory registered a game under its own name and the catalog names the same
directories: what `catalog-registry.test.ts` asserted, now a load-time error
in the worker, the build and every test that loads the games.

Vite compiles `Object.keys(import.meta.glob(...))`, written as one
expression, to the paths alone and imports none of the modules: the first
draft registered no game. The registry binds its glob to a name, and says
why; the catalog check uses the paths-only form on purpose.

**The selector's walk follows a glob of modules.** `scripts/checks/reach.ts`
took any glob that imports modules as reaching everything, which was true of
5 test files (measured at HEAD with the compiled descriptions generated; a
tree without them reads 414, every import of a missing module being
"everything"). With the registry and the app's catalog as globs, every test
loading either would have run for every commit, and `asset-integrity` would
have left the source-scan pass. A glob is now followed into every file its
literal base can match, as an import of each, where each is a script or JSON;
anything else, which a plugin might compile, still reaches everything. Against
HEAD, no test reaches less of a game, the midend or the home screen, except
those 5, now read precisely; the source-scan set is HEAD's.

**`registerAllGames` and `_resetRegistry` go.** The fake game's test takes it
back out with `_unregisterGame(id)`, so nothing else ever empties the
registry, and a test that needs the games imports `src/games/index.ts`.
`registerGame`'s idempotence on the same instance served only
`registerAllGames`; a second registration under an id is now always refused.

**The two `family` vocabularies stay two.** Measured over the 65 games: a
description's `numbers` is catalog `lines`, `numbers` or `objects`, and its
`position` is `moves`, `numbers` or `rearranging`. Neither is a function of
the other: a description's family is what the player produces (its schema
says so), a catalog's is the shelf a player browses. The register script's
header says the same and stays.

**What a stamp still edits outside its directory**: `src/describe/soundness.json`,
where the copy inherits the skeleton's soundness verdicts under its own
description's path. It is a record of verdicts, not a list of games, and its
keys sort, so concurrent games touch different lines.
