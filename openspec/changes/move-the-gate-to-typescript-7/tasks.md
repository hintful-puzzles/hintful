## 1. Install

- [ ] 1.1 Add TypeScript 7 as an aliased devDependency at `~7.0` and remove
      `@typescript/native-preview`. Verify: `node_modules/.bin/tsc --version`
      still prints 5.9.x, `node -e "require('typescript').createProgram"` is a
      function, and the aliased `bin/tsc --version` prints 7.0.x.
- [ ] 1.2 One package script runs the aliased compiler by path; `typecheck` and
      `build` call it, and `scripts/gate.sh` steps 1 and 2 call it. Verify:
      `git grep -w tsgo -- package.json scripts .github` returns nothing.
- [ ] 1.3 `npm run typecheck` passes, and a planted type error in
      `src/engine/combi/index.ts` fails it naming the line. Restore and confirm
      `git status` is clean.
- [ ] 1.4 `npm run refs -- src/engine/difficulty.ts tierNames` still answers,
      and `npm run metrics` reaches its `madge` step without the crash
      signature. These are the two 5.9 API consumers most likely to notice.

## 2. Retire what nothing reads

- [ ] 2.1 Show `.lsp.json` is inert: a headless session started here with
      `typescript-lsp` disabled makes one LSP hover call. Verify: the tool
      reports no server for `.ts`. If it finds one, stop and revisit design D4.
- [ ] 2.2 Delete `.lsp.json`.
- [ ] 2.3 Rewrite the sentences that name `tsgo`, `@typescript/native-preview`
      or `.lsp.json` in `scripts/gate.sh`, `scripts/metrics.sh`,
      `.github/workflows/ci.yml`, `AGENTS.md` § "Git" steps 1 and 2,
      `docs/games/mechanics.md`, `src/asset-integrity.test.ts` and
      `src/games/ascent/ascent.test.ts`. Verify: `git grep -w -e tsgo -e
      native-preview -e '\.lsp\.json'` outside `openspec/changes/archive` and
      this change returns only history told in the past tense.

## 3. The language server

- [ ] 3.1 Run the diagnostics check in a fresh headless session after the
      install: edit `  let result = 1;` to `  let result: string = 1;` in
      `src/engine/combi/index.ts`, wait, report what was shown. Verify: four
      errors, at 63:7, 65:5, 65:15 and 67:3. Restore the file.
- [ ] 3.2 Record which `tsserver.js` that session's server loaded (this
      repository's `node_modules/typescript` or a global one), from the
      process list while the session runs.
- [ ] 3.3 Write the check and its expected answer into `AGENTS.md` beside the
      sentence that says which server the LSP tool runs.

## 4. Close

- [ ] 4.1 Re-read the `build-pipeline` delta against the live requirement as a
      whole-line match on its heading, and against the code as it ended up.
- [ ] 4.2 Full gate on the new compiler, commit, push, and watch CI until the
      typecheck step passes on the Linux runner.
- [ ] 4.3 Archive.
