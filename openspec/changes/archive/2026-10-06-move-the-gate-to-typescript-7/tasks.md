## 1. Install

- [x] 1.1 Add TypeScript 7 as an aliased devDependency at `~7.0` and remove
      `@typescript/native-preview`. Verified 2026-10-06:
      `require('typescript').createProgram` is a function on 5.9.3, and the
      aliased `bin/tsc --version` prints 7.0.2. **`node_modules/.bin/tsc` did
      not stay on 5.9**: here npm linked it to the alias, the opposite of the
      empty-directory measurement, while `.bin/tsserver` stayed on 5.9. Nothing
      in the tree calls `.bin/tsc`, and this is the tie design D2 routes round.
- [x] 1.2 One package script (`npm run tsc`) runs the aliased compiler by
      path; `typecheck` and `build` call it, and `scripts/gate.sh` steps 1 and
      2 call it. Verified: `git grep -w tsgo -- package.json scripts .github`
      returns nothing.
- [x] 1.3 `npm run typecheck` passes in about two seconds, and a planted
      `let result: string = 1;` in `src/engine/combi/index.ts` fails it with
      four errors at 63:7, 65:5, 65:15 and 67:3. Restored; the file's diff is
      empty.
- [x] 1.4 `npm run refs -- src/engine/difficulty.ts tierNames` answers (80
      references, 34 files, 29 games). The `madge` command from
      `scripts/metrics.sh` was run on its own, not through `npm run metrics`:
      it processed 1070 files and listed cycles, with no crash signature.

## 2. Retire what nothing reads

- [x] 2.1 `.lsp.json` is inert. A headless session with `typescript-lsp`
      disabled answered a hover with "No LSP server available for file type:
      .ts"; the same hover with the plugin enabled answered `let result:
      number`. The first run proved nothing, because the file named
      `node_modules/.bin/tsgo` and task 1.1 had already removed it. It was
      repeated with the file pointed at `node_modules/.bin/tsc`, which was
      first shown to answer an LSP `initialize`, and the answer was the same.
- [x] 2.2 Delete `.lsp.json`. Done a commit after the rest: the session's
      permission classifier refused the removal, and the owner approved it
      when asked.
- [x] 2.3 Rewrite the sentences that name `tsgo`, `@typescript/native-preview`
      or `.lsp.json` in `scripts/gate.sh`, `scripts/metrics.sh`,
      `.github/workflows/ci.yml`, `docs/games/mechanics.md`,
      `src/asset-integrity.test.ts` and `src/games/ascent/ascent.test.ts`, and
      also `scripts/refs.mjs` and `docs/test-strength.md`, which the list
      missed. `AGENTS.md` no longer has the "Git" steps the list named.
      Verified: `git grep -w -e tsgo -e native-preview -e '\.lsp\.json'`
      outside `openspec/changes/archive` and this change returns `.lsp.json`
      itself (2.2), one line of history in the `build-pipeline` spec, and the
      scenario line this change's delta rewrites.

## 3. The language server

- [x] 3.1 The diagnostics check, in a fresh headless session after the
      install: four errors, at 63:7, 65:5, 65:15 and 67:3. **A first run
      reported none**, because the session edited, read and reverted with no
      wait; the errors arrive about fifteen seconds after the edit, attached
      to a later tool result.
- [x] 3.2 The session's server was Homebrew's `typescript-language-server`,
      and both `tsserver.js` processes it started were this repository's
      `node_modules/typescript/lib/tsserver.js`, read from the process list
      during three separate runs.
- [x] 3.3 The check is `scripts/agent-diagnostics.sh` (`npm run
      agent-diagnostics`), with its expected answer in its header, and the
      `AGENTS.md` sentence about the LSP tool points at it (design D5). Seen
      passing, and seen failing with exit 1 when the plugin was disabled.

## 4. Close

- [x] 4.1 The `build-pipeline` delta's heading matches the live requirement as
      a whole line, and its body differs from the live one in the one scenario
      line it means to change.
- [x] 4.2 The full gate passed on the new compiler (commit `03479ad3`), and on
      the Linux runner `npm ci`, the gate's fast checks and the build passed.
      CI's full gate job was already red, on `hint-quality.test.ts` and since
      `6ccb03bb`; `2112baca` is the fix.
- [x] 4.3 Archive.
