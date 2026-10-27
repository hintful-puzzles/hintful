# Tasks — keep-games-out-of-the-vite-config

- [x] Put the measure in `scripts/dev-server-heap.mjs` and re-run it on the
      tree as it stood: +15 MB a restart, and an engine edit a restart.
- [x] `vite-plugins/game-code.ts`: `gameCode(watch)` and its
      `gameCodeLoader()` plugin; a module runner per generation in dev,
      `runnerImport` in a build. `src/build-facts.ts` is what it loads.
- [x] Move the six help transforms and `draft-puzzles` onto it, and add the
      loader to `vitest.config.ts`, which loads `draft-puzzles` too.
- [x] `vite-plugins/config-imports.test.ts`: the config's dependencies hold no
      file under `src/games/` or `src/engine/`. Seen failing with an engine
      import planted in `pair.ts`.
- [x] Re-run the measure: an engine edit is a hot reload with a flat heap. A
      forced restart still leaked 13 MB; traced to Vite's resolver cycle, cut
      to 2.6 MB by `release-closed-server.ts` (design § "What was built").
- [x] Build, and diff `dist/help/` against a build of the tree before: the
      same bytes.
- [x] Dev server: edit Black Box's `targetVerbs` wording, reload its help
      page, see the new words, no restart; reverted, and the page followed.
      Home screen (Cube still labelled Draft) and Slant open in Chrome.
- [x] `docs/help-pages.md` § "A generated section reads the game when it
      renders".
