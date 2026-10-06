# move-the-gate-to-typescript-7

**Status: implemented 2026-10-06.** A follow-up from retiring the `tsgo-lsp` plugin
(commit `d7547260`). Where this page says the diagnostics check goes into
`AGENTS.md`, design.md D5 says where it went and why.

## Why

The gate typechecks with `tsgo` from `@typescript/native-preview`, and that
package stopped publishing on 2026-07-07: its `latest` tag is the build this
repository already has, `7.0.0-dev.20260707.2`. TypeScript 7 has since shipped
as `typescript` itself (`latest` 7.0.2, `next` 7.1.0-dev.20261005.1, read from
the registry 2026-10-05). So the compiler that decides what may be committed is
a three-month-old development preview that will never receive a fix.

Measured the same day, from a scratch install that touched nothing here:
`typescript@7.0.2`'s `tsc` passes both of the gate's projects (`-b --noEmit`,
and `--noEmit -p tsconfig.node.json`) with no errors, the first in about two
seconds.

Two things stand beside the compiler and are wrong today:

- **`.lsp.json` at the repository root** points a language server at
  `node_modules/.bin/tsgo`. The commit that added it (`a8ff83ec`) said its
  pickup was unproven, and the session transcripts suggest it never was: a
  month after it was added, 475 TypeScript diagnostics records arrived between
  2026-09-05 and 2026-09-12, and `tsgo` pushes none (design.md § Context). `scripts/gate.sh` and `scripts/metrics.sh` both tell the
  reader the language server is served through it.
- **The agent's diagnostics after an edit** were lost for three weeks without
  anything noticing, because nothing here ever checks that they arrive. They
  are back as of 2026-10-05: a fresh session that planted a type error in
  `src/engine/combi/index.ts` was shown the same four errors `tsgo -b` reports.
  That check was run by hand and is written down nowhere.

## What Changes

- The gate, `npm run typecheck` and `npm run build` typecheck with TypeScript
  7's released compiler. `@typescript/native-preview` leaves `package.json`.
- `typescript` stays on 5.9. This repository tried `typescript@7` once
  (`de5606a`) and lost the language server and `madge`, because TS 7's package
  ships no `tsserver.js` and no classic compiler API. Both still hold on 7.0.2
  and on today's 7.1 nightly (design.md § Context). So TypeScript 7 is
  installed under a second name beside it.
- `.lsp.json` is deleted, once it is shown to be read by nothing.
- The sentences that name `tsgo`, `@typescript/native-preview` or `.lsp.json`
  are rewritten against what the tree then does: `scripts/gate.sh`,
  `scripts/metrics.sh`, `.github/workflows/ci.yml`, `AGENTS.md` § "Git" steps 1
  and 2, `docs/games/mechanics.md`, and the comments in
  `src/asset-integrity.test.ts` and `src/games/ascent/ascent.test.ts`.
- The check that diagnostics reach a fresh agent session is run again after
  the move, and the way to run it is written into `AGENTS.md` beside the
  sentence that says which server the LSP tool runs.

Nothing a player sees changes. No game, test or build output is meant to move.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `build-pipeline`: the scenario "a respelled helper leaves a dead comparison"
  names `tsgo` as the checker that passes. It says "the typechecker" instead,
  so the requirement stops naming a binary.

## Impact

- `package.json`, `package-lock.json`: one devDependency out, one in. The new
  one carries per-platform optional packages, as the old one did, so CI's Linux
  runner has to be seen green.
- `scripts/gate.sh`, `package.json` scripts `build` and `typecheck`: the
  command they run.
- `.lsp.json`: removed.
- The files that `import ts from "typescript"`, and `madge`: untouched,
  and that is the constraint the design is built around.
- The agent's LSP tool: unchanged by intent, verified after the fact.
