## Context

See proposal.md § Why for the motivation. What shapes the approach, all
measured 2026-10-05:

- **TypeScript 7's package is a compiler and nothing else.** On 7.0.2 and on
  7.1.0-dev.20261005.1, `require("typescript")` yields two keys, `version` and
  `versionMajorMinor`; `createProgram` is `undefined`. Its `lib/` holds
  `tsc.js` and no `tsserver.js`. The classic API is under `./unstable/*`.
  `scripts/refs.mjs` says the API is not stable before 7.1, and today's 7.1
  nightly has not changed the main export.
- **This tree reads the classic API itself** (`git grep -l 'from
  "typescript"'`): build-side scripts under `scripts/`, and tests and
  test-support modules under `src/`. `madge` reaches it too, through `ts-api-utils`
  (`scripts/metrics.sh` has that measurement).
- **The agent's language server needs `tsserver.js`.** The default
  `typescript-lsp` plugin runs `typescript-language-server`, a wrapper around
  it. `a8ff83ec`'s message records what happened when `typescript` was 7:
  `Math` hovered as `any`.
- **TypeScript 7's own language server pushes no diagnostics.** Driven
  directly with an LSP client, the preview's `tsgo --lsp`, 7.0.2's `tsc --lsp`
  and the 7.1 nightly's each sent zero `publishDiagnostics` for a file with a
  type error and answered a `textDocument/diagnostic` request with six items.
  `typescript-language-server` pushed twice in the same run. Claude Code
  2.1.289 relays only pushed diagnostics.
- **An alias install works, and its `tsc` is not on the path.** `npm install
  typescript@~5.9.0 typescript-7@npm:typescript@7.0.2` in an empty directory
  left `node_modules/.bin/tsc` and `tsserver` linked to 5.9.3 and
  `require("typescript")` on the 5.9 API, with 7.0.2 runnable as
  `node node_modules/typescript-7/bin/tsc`. **In this repository the link went
  the other way** (2026-10-06): after the real install `node_modules/.bin/tsc`
  is the alias's 7.0.2 and only `tsserver` is 5.9's. Which package wins a bin
  name both declare follows install order, so neither measurement is a
  promise.

## Goals / Non-Goals

**Goals:**

- The gate's compiler is a published release that receives fixes.
- Everything that reads the 5.9 API, and the language server, keeps working
  with no edit.
- The tree holds no language-server configuration that nothing reads.
- The diagnostics check is something a later session can run from the page.

**Non-Goals:**

- Moving this tree's API readers onto TypeScript 7's `./unstable/*`. That
  waits for a stable API and is its own change.
- Making the language server and the gate run the same checker. They do not
  today, and the only server that would make them agree delivers no
  diagnostics to the agent.
- Automating the diagnostics check in the gate. It needs a live agent session.

## Decisions

**D1. TypeScript 7 is a second devDependency under an alias; `typescript`
stays `~5.9.0`.** Both consumers of the 5.9 package fail on 7 and both
failures were measured, the earlier one in this repository's own history.
*Alternative considered:* `typescript@7` with the API readers on
`./unstable/ast`. It leaves `madge` and the language server broken, which is
the state `de5606a` reached and `a8ff83ec` backed out of.

**D2. The gate reaches the compiler through one package script, by path.**
Two installed packages both declare a `tsc` bin, and which one npm links is
not something to rest a gate on. A single script (`node
node_modules/<alias>/bin/tsc`) is the one place the path is written;
`typecheck`, `build` and `scripts/gate.sh` call that script. The first task
asserts which `tsc` is on the path after a real install here, because the
scratch measurement was an empty directory.

**D3. The range is `~7.0`, not a caret.** A minor release of a compiler can
change what the gate accepts, and that should arrive as a commit somebody made.

**D4. `.lsp.json` is deleted after it is shown inert, not on the transcripts
alone.** The transcripts show the default server answering while the file
existed; they do not show what a session with no TypeScript plugin does. One
headless session with `typescript-lsp` disabled settles it: if the LSP tool
finds a server, the file is live and this decision is revisited.

**D5. The diagnostics check is a script, `scripts/agent-diagnostics.sh`, with
its expected answer in its header.** A fresh headless session edits one line of
`src/engine/combi/index.ts` to `let result: string = 1;`, waits, and reports
what it was shown; the answer is four errors at 63:7, 65:5, 65:15 and 67:3,
and the tree is restored afterwards. The script fails unless all four are in
the report and the file matches HEAD.

It was first to be a recipe in `AGENTS.md`. Two things changed that
(2026-10-06). `AGENTS.md` has since been cut to what binds every session and
tells its editor to turn a rule into a check before adding a line. And the
recipe as written was wrong in the way prose cannot show: a session that
edits, reads and reverts at once is shown nothing, because the errors arrive
about fifteen seconds later on a later tool result. A script holds the wait;
a paragraph leaves it to the reader. `AGENTS.md` gains one sentence, on the
bullet about the LSP tool, that says when the errors arrive and names the
script.

It stays out of the gate (Non-Goals): it starts a real agent session.

## Risks / Trade-offs

- **7.0.2 may accept or reject something the July preview did not.** Both pass
  the tree today, which says nothing about code not yet written. → Run the
  full gate once on the new compiler before the commit that switches, and read
  any difference rather than suppressing it.
- **The lockfile needs the Linux package for CI.** → The push is watched until
  the typecheck step is green on the runner; this is the specific concern that
  earns watching a deploy.
- **Two compilers stay in the tree.** The language server reports 5.9's view
  and the gate enforces 7's. → Already true; `AGENTS.md` says so, and
  `npm run typecheck` is the gate's verdict.
- **The default language server may load a `typescript` other than this
  repository's.** Other sessions on this machine were seen running the
  Homebrew-global `tsserver.js`. → Task 3.2 records which one a session here
  loads, since that sets how far its diagnostics can drift from 5.9.3.
