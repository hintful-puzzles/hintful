# Tasks

- [x] 1. Find what turns the module cache on, and plant a new game to show the stale glob
  - vitest 5.0.5 defaults `fsModuleCache` to true. It already bails out a
    module containing `import.meta.glob(`, but this repo writes the typed
    call `import.meta.glob<string>(`, which that substring misses
    (`node_modules/vitest/dist/chunks/cli-api.*.js`, `generateCachePath`).
  - Plant: `src/games/abcd/planted-cache.ts` exporting `"Auto-solved"`.
    `completion-status.test.ts`, warm, passed; with `--fsModuleCache=false`
    it failed on the plant (2026-10-31).
- [x] 2. Measure each fix's cost, and make the stale glob impossible
  - The scan pass (`GATE_TEST_PASS=scan`), warm, 2026-10-31: HEAD 4.25–4.71 s;
    bailing out globbing modules 4.50–5.68 s (the first run re-warmed after
    the config changed); the cache off 5.57–5.67 s. Bailing out costs only
    the globbing modules their cache, so it is taken.
  - `vite-plugins/glob-cache.ts` bails out any module matching
    `import.meta.glob\b` through `defineCacheKeyGenerator`. With it, the same
    plant on a warm cache failed the guard. `glob-cache.test.ts` failed on
    vitest's own narrower pattern before it passed.
- [x] 3. Retire the `testing.md` paragraph that asks a session to remember it
