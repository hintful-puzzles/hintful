# generate-compiled-modules

Asked for by the owner (2026-11-16, the debrief recorded in
`archive/2026-11-16-state-hint-sentences-in-the-description/tasks.md` § 3).
The first change of the track it set.

## Why

A description compiles to a `*.compiled.ts` beside it, and the module is
committed. Measured 2026-11-16:

- 61 compiled modules hold 91,831 lines against 13,928 lines of description:
  more than six generated lines a stated one, in the directory a porter reads.
- Since 2026-10-29 their history is +257,166 / −165,335 lines. Every
  description commit carries a diff nobody reads by eye (a technique's body is
  `_g59`, `G60:` labels).
- `npm run describe` compiles the whole catalog in about one second, so
  nothing is saved by keeping its output.
- A guard exists only to hold the committed copy to its source
  (`src/describe/compile.test.ts` recompiles and compares). With no copy there
  is nothing to drift.

## What Changes

- **Compiled modules are generated, never committed.** They are written to one
  git-ignored directory outside the games (`src/generated/`, unless the
  session finds a better name), and a game imports its module from there.
  `dist/` alone cannot hold them: typecheck, Vitest and the dev server import
  them as source, each game its typed tables (`STEPS`, `WORDS`, `LadderId`).
- **Every entry point generates first**: typecheck, test, dev, build, the gate
  and its hooks, CI, and a fresh clone's first command. A missing or stale
  module is never an import error a reader has to diagnose: the step that
  generates is part of the command that needs it.
- **The dev server regenerates on a description's edit.**
- **The drift guard goes**, and so does whatever reads a compiled module as a
  tracked file (`scripts/checks/typescript-projects.mjs`,
  `scripts/checks/deal-profile.test.ts`, `scripts/new-game.sh`, the biome
  exclusion, `unused-exports`, which reads tracked files only).
- **What a compiler change did to its output stays reviewable**: the compiled
  module of two or three small descriptions is kept as a committed snapshot, so
  a change to `compile.ts` shows its effect in the diff.
- `docs/descriptions.md` and the guides that name a compiled module's place
  say the new one.

## What it drops, and what replaces it

A commit no longer shows a game's emitted code. The snapshot above replaces
it for the compiler; for one game, the module is on disk after any command.

## Not in this change

Compiling a description on import through a Vite plugin: it would give hot
reload with no watcher, but `tsc` needs the types on disk regardless, so it
adds a second path. Reconsider only if the watcher proves awkward.
