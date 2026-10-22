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

## Open questions

None for the owner: nothing a player sees changes.
