# keep-games-out-of-the-vite-config

## Why

The dev server dies of an out-of-memory abort after a long session of edits
(owner's log, 2026-10-22: `FATAL ERROR: Ineffective mark-compacts near heap
limit`, at a 4 GB heap after about nine hours up). The owner has seen it
several times.

Two facts make it:

- **An edit to any game or engine file restarts the whole server**, where it
  should hot-reload. The log says so: `src/engine/border-grid-render.ts
  changed, restarting server...`. Vite restarts on a change to anything the
  config imports, and the config imports the whole collection: the help-page
  transforms `controls`, `hint-marks`, `not-applicable`, `note-controls`,
  `pair` and `parameters` in `vite-plugins/` each import
  `src/games/index.ts` and the registry at the top.
- **Every restart keeps the last config in memory for good.** Vite bundles
  the config, games and all (about 17 MB of JavaScript), to a file with a
  fresh timestamp and imports it, and Node never unloads an imported module.
  Measured 2026-10-22 (`design.md` § "The measure"): the heap after a full GC
  grows by 15 MB a restart, in a straight line, 67 MB to 246 MB over twelve.
  4 GB is about 270 restarts.

Neither the Sentry plugin's `beforeExit` listener, which is added on every
restart and never removed, nor the `runner` config loader is the cause or the
cure (`design.md` § "What was ruled out").

## What changes

- The help-page transforms load the game collection when a page is rendered,
  not when the config is, so the config no longer imports a game or the
  engine. In dev they load it through the dev server's module graph, which
  picks up an edit without a restart; in a build, through a runner that the
  build discards.
- An edit to a game or the engine then hot-reloads like any other source
  file. The restart that is left, on an edit to `vite.config.ts` or
  `vite-plugins/`, re-imports a config of kilobytes, not megabytes.
- A help page in dev shows the game code as it is now, not as it was at the
  last restart.

Nothing a player sees changes: the built help pages are the same bytes.

## Impact

- `vite-plugins/*.ts` (the six transforms, and `draft-puzzles.ts`, whose lazy
  `import()` the config bundler follows all the same), a new
  `vite-plugins/game-code.ts` (the loader) and `src/build-facts.ts` (what it
  loads), `vite-plugins/release-closed-server.ts` (the restart Vite leaks),
  `vite.config.ts`, `vitest.config.ts`.
- `openspec/specs/build-pipeline/spec.md`: one requirement added.
- `docs/help-pages.md`: the rule that the config imports no game code, and
  why.
