## Why

`architectural-review` item 3 (owner's go-ahead, 2026-11-20). There are two
hand-kept lists of every game:
- the registry, `src/games/index.ts`: an import and a `registerGame` line
  per game;
- the catalog, `src/puzzle/catalog-data.ts`: a metadata entry per game.

`catalog-registry.test.ts` exists only to hold them to each other, and
`scripts/new-game-register.mjs` exists to edit both when a game is stamped.
That is a second copy with a guard and a script to keep it in step, which the
doctrine refuses ("Declare what the engine consumes; refuse a second copy").
At hundreds of games, each one adds a line to two shared files that every
concurrent game change also edits.

## What Changes

- Each game's catalog entry moves, unchanged, into its own directory as a
  metadata module that loads none of the game's engine. The catalog is the
  set of those modules. `vite.config.ts` reads them at config time, so the
  build-side reader must work in Node without Vite's `import.meta.glob`.
- The registry is built from the same population: a glob over
  `src/games/*/index.ts`, or the metadata modules naming their game. A game
  is registered by existing.
- `puzzleFamilies` and its order stay shared in `catalog-data.ts` (or its
  successor): the order is the home screen's, a decision across games.
- `catalog-registry.test.ts` loses its reason. Whatever it still checks (a
  directory with no metadata, or metadata with no game) becomes a load-time
  error or a structural guard.
- `scripts/new-game-register.mjs` writes the metadata module instead of
  editing two shared files, or is folded into `new-game.sh`.
- While there: a description's `family` and the catalog's `family` are two
  vocabularies (a code game is `code` in one and `hidden` in the other, per
  the register script's header). Say whether one can be derived from the
  other; fold them only if the evidence is clear.
- No player-visible change. Ids, names, order and URLs stay the same.

## Impact

`src/games/index.ts`, `src/puzzle/catalog-data.ts` and `catalog.ts`,
`vite.config.ts`, `src/catalog-registry.test.ts`, `scripts/new-game.sh`,
`scripts/new-game-register.mjs`, every `src/games/<id>/` (one new small
file), `docs/new-game.md` where it lists the registration steps.
