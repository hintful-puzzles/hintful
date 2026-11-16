# Tasks

## 1. Where the modules go

- [ ] 1.1 List everything that names a compiled module's path: `git grep -n "compiled" -- scripts package.json biome.json .github .husky vite.config.ts 'vitest*.ts' tsconfig*.json docs README.md`, and the importers (`git grep -l '\.compiled\.ts"' -- src scripts research`; 34 test files among them at 2026-11-16). `src/describe/sources.ts`'s `compiledPath` is the one statement of the place
- [ ] 1.2 Decide the directory and the import a game writes (a path alias or a relative path), and record why. The library's module (`src/engine/latin.description.yaml`) and the two skeletons' go the same way
- [ ] 1.3 Move the output there, git-ignore it, `git rm --cached` the 61 modules, and rewrite the imports. Verify the bulk edit by the shape of its diff: every changed line is an import path

## 2. Every entry point generates first

- [ ] 2.1 `typecheck`, `test` and its variants, `dev`, `build`, `refs`, the gate's steps, the hooks and CI each run `describe` before they need a module. A fresh clone: `npm ci && npm run typecheck` passes with no step between
- [ ] 2.2 The dev server regenerates when a description changes; edit one in a running server and see the game change
- [ ] 2.3 See it fail: delete the generated directory and run each entry point; none reports a missing import

## 3. What only the committed copy needed

- [ ] 3.1 Remove the drift guard in `src/describe/compile.test.ts` and the "a compiled module has a description" half of it; keep what tests the compiler
- [ ] 3.2 `scripts/checks/typescript-projects.mjs`, `scripts/checks/deal-profile.test.ts` (it finds the described games by the file's existence), `scripts/new-game.sh`, the biome exclusion, `scripts/checks/unused-exports.mjs` (tracked files only: an export only compiled code calls must still count as used)
- [ ] 3.3 A committed snapshot of two or three small descriptions' modules, compared in a test, so a compiler change shows in a diff. See it fail on a planted change to the emitter

## 4. Docs, and the end

- [ ] 4.1 `docs/descriptions.md`, `docs/new-game.md` and the other guides that say where a compiled module is
- [ ] 4.2 `npm run gate`, `npm run test:hint-sweeps`, a production build run in Chrome (a game deals, a hint speaks), then push and watch that CI and the deploy generate before they build
