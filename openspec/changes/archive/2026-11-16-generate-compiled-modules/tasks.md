# Tasks

## 1. Where the modules go

- [x] 1.1 List everything that names a compiled module's path: `git grep -n "compiled" -- scripts package.json biome.json .github .husky vite.config.ts 'vitest*.ts' tsconfig*.json docs README.md`, and the importers (`git grep -l '\.compiled\.ts"' -- src scripts research`; 34 test files among them at 2026-11-16). `src/describe/sources.ts`'s `compiledPath` is the one statement of the place
- [x] 1.2 Decide the directory and the import a game writes (a path alias or a relative path), and record why. The library's module (`src/engine/latin.description.yaml`) and the two skeletons' go the same way
  - `src/d/x.description.yaml` compiles to `src/generated/d/x.compiled.ts`: the same place under one ignored directory, so a module's import of the runtime is as deep as before and `compiledPath` stays a one-line rule.
  - A relative import, not an alias: `node scripts/*.ts` (game, hint-scan, deal-walk, describe) runs TypeScript by type stripping, which reads no tsconfig `paths`, so an alias would need a second resolver in every runner.
- [x] 1.3 Move the output there, git-ignore it, `git rm` the 64 modules, and rewrite the imports. Verified by the shape of the diff: with every `"….compiled.ts"` specifier masked, the removed and added lines are the same multiset (192 files, 199 specifiers); biome then reordered and rewrapped imports only. Four tests globbed `../games/*/*.compiled.ts` and now glob `../generated/games/…`, taking the id as the path's second-last part

## 2. Every entry point generates first

- [x] 2.1 One generator, `scripts/describe.ts`, which writes only a changed module (renamed into place, so a concurrent reader never sees half of one) and removes a module no description compiles to. It runs from: `vite-plugins/describe.ts` (`describeFirst`) in `vite.config.ts` and all five Vitest configs, once a process; the gate, before the push's plan and before the typechecks; `pre` scripts of `typecheck`, `build`, `refs`, `agent-diagnostics`, `game`, `hint-scan`, `deal-walk`, `dead-exports`, `metrics`; and `prepare`, so `npm ci` leaves the modules on disk. CI runs `npm ci` and the gate. Fresh clone: checked after the commit (4.2)
- [x] 2.2 The dev server regenerates when a description changes: a Towers sentence edited in a running server was served recompiled and reloaded, and Chrome's hint read the new words; a description edited not to compile logged the compiler's message and the server kept serving
- [x] 2.3 See it fail: with `src/generated/` deleted, `npm run typecheck`, `npx vitest run <file>`, `npm run refs`, `npm run game` and `npm run dead-exports` each generated and ran. A test-selection hole the move opened is closed: a description edit is no longer a diff to a tracked module, so `select-tests.ts` adds the module it compiles to, and `reach.ts`, `module-layering.test.ts` and `enrollment.ts` count `src/generated/games/<id>/` as the game's

## 3. What only the committed copy needed

- [x] 3.1 The drift guard and the orphan test are gone from `src/describe/compile.test.ts`; `describe.ts` removes an orphan instead
- [x] 3.2 `deal-profile.test.ts` finds the described games through `compiledPath`; `new-game.sh` renames the skeleton's generated import to the game's; biome's exclusion is gone (it reads `.gitignore`); `unused-exports.mjs` adds the ignored generated files to its tracked ones (seen to fail without them: the runtime's exports read as dead); jscpd skips them; `deal-compare.test.ts` runs a base commit's own `describe.ts` in its extracted tree. `typescript-projects.mjs` needs no change: it compares tracked files, and the generated ones sit under `src/`, inside `tsconfig.json`'s `include`
  - Decided: the eight cross-game scans that glob `../games/**/*.ts` for a porter's conventions (refusal kinds, retry bounds, vocabulary) no longer read compiled code. It is the compiler's output, held by the compiler's tests and the samples; `enrollment.ts`, which decides who uses a mechanic, does read it (`kept-structures.test.ts`'s vacuity floor caught the gap)
- [x] 3.3 `compile.test.ts` keeps Flip (planning), Pattern (own techniques) and Adjacent (the Latin library's) as samples under `src/describe/__snapshots__/`; a planted change to the emitted header failed all three
- [x] Found in passing: neither skeleton had `clearMistakes`, which `registerGame` has required since 2026-11-09, so every game `new-game.sh` stamped failed its first test run. Both skeletons have it, the registry's rules are `assertRegistrable`, and `src/skeleton/registrable.test.ts` holds each skeleton to them (seen to fail on the edges skeleton without it). `new-game.sh` then stamped a grid and an edges game whose tests pass

## 4. Docs, and the end

- [x] 4.1 `docs/descriptions.md` § "What every game does" says where a module is and what generates it; the build-pipeline requirement is replaced by three (this change's spec delta)
- [x] 4.2 `npm run gate`, `npm run test:hint-sweeps`, a production build run in Chrome (a game deals, a hint speaks), a fresh clone's `npm ci && npm run typecheck`, then push and watch that CI and the deploy generate before they build
  - The gated commit and the sweeps passed. `npm run build` from no `src/generated/` built, and in `vite preview` Keen dealt and its hint spoke a compiled cage step. A fresh clone had no `src/generated/` until `npm ci` wrote it, and `npm run typecheck` passed with nothing between. CI and the deploy run `npm ci` and the gate, which both generate; their first run is the next session's to check
