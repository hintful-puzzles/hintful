# name-the-lines-solos-digit-pattern-reads

Found in `keep-the-precommit-well-under-ten-minutes`, and filed on the owner's
answer that day (2026-10-08): *"Good, yes, please write it up as a change and
continue to it in a new session."*

## Why

On Solo's Extreme tier, one rung works on a single digit across several rows
and columns (`solver.ts`'s `digitSets`, technique `digit-set`): where the
digit's places in some columns lie in as many rows, it is struck from the rest
of those rows. The step outlines only the squares the digit is left with, and
says that their columns fit the digit only in those cells, leaving no other
in their rows (`hint-text.ts`'s `say.set`, the arm with no region).

The deduction rests on more than those squares. It also reads every other
square of those columns, where the digit is absent, and the step marks none of
them. A player checking the step has outlined squares and a claim about
columns that the frame does not show, so they must find the columns
themselves and confirm the digit is gone from each of their other squares.

Measured on 2026-10-08, when the cross-game sweeps moved to shared boards: the
premise audit (`src/engine/firing-replay.test.ts`) replays each recorded firing
with only the squares its step names, and this one does not fire again from
them. It is held in that file's `SHORT` ledger, pinned to the board
`3x3de:a7b9a3a8d2a4_5a4a1h9_6e1_3a9a8a2_5e2_9h8a3a5_4a6d8a2a1b4a`.

**Not yet established, and the first task:** that the audit's finding is the
missing columns and nothing else. The same file keeps a `GATED` ledger for
firings a replay flags although their premise is whole, and this session did
not rule that reading out by hand on the pinned board. The Solo spec's
requirement "Solo marks every board element its hint sentence points at" has a
scenario, "The locked pattern shows its own cells", that asks for exactly what
the step does today; read it and its change in the archive before deciding
that it was an oversight and not a decision.

## What Changes

- The `digit-set` step marks the lines it read as well as the squares the
  digit is left with, so that everything the sentence says can be checked
  against the frame. The reason's cells in `solver.ts` (`setCells`, and the
  `set` reason it feeds) carry what the firing read; `hint-text.ts`'s `say.set`
  region-less arm points at those marks.
- The sentence says what the marks show. Whether the rows or the columns are
  the confined lines depends on the firing, and the words follow it.
- The `SHORT` entry and its pinned board leave `firing-replay.test.ts` once the
  audit passes this firing; the pin fails on that day by design.

### What it costs

- **A busier frame on one Extreme-tier step**: two or three whole lines are
  marked where a handful of squares were. The step is rare (the sweeps'
  earlier boards never showed it), and a player meeting it is being taught a
  swordfish.
- The sentence must still fit the narration length limit
  (`hint-quality.test.ts`), with the lines named.

## Impact

- `src/games/solo/solver.ts`, `src/games/solo/hint-text.ts`,
  `src/games/solo/index.ts` (the `set` arm of the narration).
- `src/engine/firing-replay.test.ts`: the `SHORT` ledger and `PINNED`.
- `openspec/specs/solo/spec.md`: the locked-pattern scenario.
- Solo's help page, if its hint section describes this step.
