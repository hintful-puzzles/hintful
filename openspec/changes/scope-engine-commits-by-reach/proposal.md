# scope-engine-commits-by-reach

**Status: scaffolded, not started** (2026-09-27). The next step after
`measure-the-suites-per-commit-cost`, which narrowed the cross-game sweeps for a
commit confined to game directories.

## Why

That narrowing reaches few commits. Classifying the last 300 commits by the
paths they touch (2026-09-27, `git log --name-only`):

| paths | commits |
|---|---|
| documentation only (already skips vitest) | 127 |
| game directories only (now narrowed) | 23 |
| game directories plus test files outside them | 22 |
| a non-test `src/engine/` module | 71 |
| anything else (app shell, scripts, config, help) | 57 |

So 13% of code commits get the narrowing, and the largest group, **41%, touch
the engine and pay the whole suite**: 505 s wall on 2026-09-27 under load.
Many of those engine modules are not shared by every game. The most-touched
were `midend.ts` (19), `candidate-hint.ts` (13), `candidate-plan.ts` (11),
`game.ts` (11) and `latin-hint.ts` (5). The first and fourth reach every game.
The hint-framework modules plausibly reach only the games that import them.

## The idea (unmeasured)

Generalize the scope from "the games whose directories hold every staged path"
to **"the games whose import closure reaches every staged module"**, falling
back to no narrowing whenever a staged module is also reached by the harness
side independently of any game: the guard files, `engine/testing/`, the midend.
A per-game case for game G then depends on G's closure and the guard's own
imports. If the changed module is outside the guard's imports and outside G's
closure, G's verdict cannot have moved.

`src/engine/testing/game-scope.ts` states the soundness condition this would
extend, and `GATE_GAME_SCOPE`, `inSweep` and `itOverWholeSweep` already
carry a scope of any size. So the work is in computing the scope and proving it
sound, not in plumbing.

## First steps

1. **Measure before building.** For each of the 71 engine-touching commits,
   compute the games whose closure reaches its engine files, and whether any
   guard reaches them without going through a game. If most of the 71 hit
   `midend.ts` / `game.ts` / `types.ts`, the saving is small and this should be
   declined with that number.
2. The closure walk exists: `scripts/checks/source-scans.ts` walks import
   closures with `ts.preProcessFile`. Reuse it rather than writing a second one.
3. The 22 "game plus a test outside it" commits are a separate question. A
   changed guard must run whole, but the other guards could still narrow. That
   is per-file scoping, which vitest's single name filter cannot express, so
   measure it separately.
