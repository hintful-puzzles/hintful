# Design — keep-games-out-of-the-vite-config

Written 2026-10-22 from one sitting's measurements, on Vite 8.2.0, Node
26.8.2 and `@sentry/vite-plugin` 5.4.0. Re-measure before relying on a number
here (`docs/method.md`).

## The measure

A script starts the dev server through Vite's API (`createServer`, `hmr:
false`) on a spare port, then twelve times: `server.restart()`, which is what
a config-dependency change calls; load `/slant` and crawl its module graph
(256 modules) as a browser would; two `gc()` calls under `--expose-gc`; print
`process.memoryUsage().heapUsed`.

| Run | Heap after GC |
| --- | --- |
| As the tree stands (`configLoader: "bundle"`) | 67 MB, then +15 MB a restart, linear |
| Every `beforeExit` listener dropped | the same, +15 MB a restart |
| `configLoader: "runner"` | 193 MB, then +73 MB a restart |

RSS alone, sampled after touching `src/engine/border-grid-render.ts` twenty
times with no page loaded, swung from 225 to 690 MB with no trend: it is the
wrong instrument for this.

The bundled config is about 17 MB (`node_modules/.vite-temp/`, which also held
207 MB of bundles left by servers that were killed). It is the whole game
collection, through the transforms named in the proposal.

The script goes into the tree with this change, under `scripts/`, so the fix
is measured by the same instrument that found the leak, and a later session
can re-run it.

## What was ruled out

- **Sentry's `beforeExit` listener.** `createSentryBuildPluginManager` adds
  one on every config load and never removes it (Node's
  `MaxListenersExceededWarning` names it at the eleventh restart). Dropping
  them all left the leak unchanged. It is a small leak of its own; disabling
  the plugin in dev, where it does nothing, is worth a line if it is free.
- **`configLoader: "runner"`.** Worse, as measured.
- **A larger heap (`--max-old-space-size`).** It only moves the crash later.
- **Making the transforms import lazily with a literal `import()`.** The
  config bundler follows a literal dynamic import as it does a static one:
  `draft-puzzles.ts` already imports lazily, and `registerAllGames` is in the
  bundle.

## The plan

1. Move the measure into `scripts/` and re-run it on the tree as it is.
2. Give a transform a way to load a module that is not a config import: an
   `importGameModule(path)` on the context `extra-pages` hands its transforms.
   In dev it is `server.ssrLoadModule`. In a build it is `runnerImport` from
   Vite, or one module runner the build creates and closes. Measure which of
   the two leaks, since the runner loader did.
3. Move the six transforms and `draft-puzzles` onto it. Each loads the games
   and the registry once per render, through the loader, and nothing in
   `vite-plugins/` imports `src/` at the top. `extra-pages.ts`'s types stay.
4. A check that holds it: the bundled config's inputs include no file under
   `src/games/` or `src/engine/`. Vite reports the config's dependencies
   (`loadConfigFromFile(...).dependencies`), so the check asks Vite, not a
   regex over imports. See it fail with one import put back.
5. Re-run the measure. The expected result: an edit to a game file is a
   hot reload with no restart, and a forced restart costs under 1 MB.
6. Build, and diff `dist/help/` against a build from before: the same bytes.
7. Run the dev server, edit a game's `targetVerbs`, reload its help page, and
   see the new wording with no restart.

## What was built, and where it left the plan

Measured 2026-10-27, on Vite 8.2.0 and Node 26.8.2, with
`scripts/dev-server-heap.mjs` (heap after two `gc()` calls, `/slant` crawled
each round, 257 modules).

| Round | Before | After |
| --- | --- | --- |
| Edit to `src/engine/border-grid-render.ts` | a restart, +15 MB | a hot reload, flat (50 to 46 MB over four) |
| Forced restart | +15 MB | +2.6 MB |

The config's dependencies, as Vite reports them, went from 564 files (550
under `src/games/` or `src/engine/`) to 15. `dist/help/` builds to the same
bytes; the one other file that differs is a source map whose asset
placeholders are numbered in load order.

- **The loader is one shared `gameCode(watch)`, not a field on the transform
  context.** `draft-puzzles` is a `load` hook, not a transform, and needs the
  same thing. The `gameCodeLoader()` plugin sets it up, in `vite.config.ts`
  and `vitest.config.ts` both; `watch` is handed every file the collection was
  evaluated from, so a help page and the home screen's draft list reload on an
  edit.
- **One entry module, `src/build-facts.ts`, re-exports what the plugins
  read**, so the games and the registry are one evaluation.
- **Dev evaluates it in a module runner on the SSR environment, and drops the
  runner when any file it evaluated changes.** Re-evaluating an edited game
  into the same registry throws (`A different TS game is already registered`),
  because every game module registers itself on load. A fresh runner
  re-evaluates everything, registry included, from the dev server's transform
  cache: the first render after an edit took 189 ms. A runner's modules are
  plain closures, so a dropped one is collected, as the flat heap shows.
- **A build evaluates it with `runnerImport`, once.**
- **The restart that is left still leaked 13 MB**, and none of it was the
  config: Vite with no config, crawling nothing, kept 0.4 MB a restart. A heap
  snapshot found each old server's environments held from global handles:
  Vite hands rolldown's native resolver plugin callbacks (`onWarn`,
  `resolveSubpathImports`) that close over the environment, and a cycle
  through native handles is never collected. Vite 8.3.5 and rolldown 1.2.15,
  the latest on this date, still have it; 8.3.5 does clear
  `options.previousEnvironments`, one other path, but measured the same, so the
  tree stays on 8.2.0. `release-closed-server.ts` empties each closing server's
  module graphs (`invalidateAll`), which takes a restart from 13 MB to 2.6 MB.
  What is left is mostly the config bundle itself (about 540 KB with its
  inline source map) and markdown-it's linkify expressions. The plan's "under
  1 MB" is not met, and a restart now comes only from an edit to the config or
  `vite-plugins/`.
- **The Sentry plugin stays in dev.** The crash dialog borrows its
  third-party stack filtering, so dropping it changes what the dev crash
  dialog shows, against a listener that costs bytes.
- **`hmr: false` in a measuring script measures nothing**: Vite then ignores
  a file change outright, restart included. The first edit run reported no
  restarts for that reason; the script keeps HMR on and says why.

## Open questions

None for the owner: nothing a player sees changes.
