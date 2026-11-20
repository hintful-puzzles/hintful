## 1. Design

- [x] 1.1 Read every consumer of `catalog-data.ts`, `catalog.ts` and
      `registerAllGames` (`npm run refs`), including `vite.config.ts` and the
      worker. Decide the metadata module's name and shape, and how the build
      config and the app each find the modules. Record it in `design.md`.
- [x] 1.2 Decide what `registerAllGames`'s idempotence (needed under
      `isolate: false`) becomes with a glob registry.

## 2. Move

- [x] 2.1 Move each entry into its game's directory unchanged. Verify by the
      diff's shape: the catalog object built from the modules deep-equals
      HEAD's `puzzleCatalog`, key order included. (Both readers, 65 ids.)
- [x] 2.2 Build the registry from the population; delete the hand list.
- [x] 2.3 Retire `catalog-registry.test.ts`, or reduce it to what is still
      not structural. Plant a game directory without metadata and see it
      refused. (Also planted: a catalog entry with no game, and a game that
      registers nothing.)
- [x] 2.4 Update `new-game.sh` and `new-game-register.mjs`. Stamp
      `scripts/new-game.sh <id> grid` and confirm the stamp edits no shared
      file; delete the stamp. (It still edits `soundness.json`; design.md
      says why that stays.)
- [x] 2.5 Keep the test selector's walk precise through the new globs
      (`reach.ts`), with a case in `select-tests.ts --verify` seen to fail.

## 3. Finish

- [x] 3.1 `docs/new-game.md` and `src/puzzle/README.md` say where the
      catalog entry lives.
- [x] 3.2 Run the app: home screen order, search by family, a puzzle page,
      help links. (Also: an edit to a game's `catalog.ts` restarts the dev
      server and its page shows the new words.)
- [ ] 3.3 Commit, push, archive.
