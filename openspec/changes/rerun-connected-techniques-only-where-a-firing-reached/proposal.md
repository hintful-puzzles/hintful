# rerun-connected-techniques-only-where-a-firing-reached

**Status: filed on the owner's word (2026-11-08)**, after
`describe-net-pearl-tracks-and-tents` left Net's largest Unreasonable deals
past the owner's bar. It follows the archived
`rerun-only-what-a-firing-touched`, which made a technique whose reads are
local skip the elements no firing reached, and left every technique that
reads connectivity whole.

## Why

The fixpoint runs every technique again from the top after each firing. A
technique whose reads the compiler can follow through the tiling's geometry
visits only the elements a fact reached since it last found nothing there
(`footprint.ts`, `CellMarks.visit`). A technique that reads connectivity,
such as `through(c, L)`, a reach built step by step, or a set over the whole
board, is whole: it visits every element after every firing.

Net's loop, seal and strand techniques are all whole, and Net is described
with them. Measured with `deal-compare` against the hand-written ladder
(2026-11-08, ten deals a preset, mean and worst):

| Preset | Described | Hand-written |
| --- | --- | --- |
| 9x11 wrapping Unreasonable | 971 ms (3.5 s) | 47 ms |
| 11x13 Unreasonable | 279 ms (1.2 s) | 121 ms |
| 7x9 wrapping Unreasonable | 182 ms (572 ms) | 23 ms |

The first is past the owner's bar (a large preset may take up to 1 s), and
the second touches it. Easy deals are at the hand-written ladder's speed or
better. Pearl and Tracks read loops and connectivity too, so they will pay
the same cost.

A profile of ten 9x11 wrapping deals (2026-11-08, after `boundSets`), as
inclusive shares of the deal:

- **Where the deal spends its time:** the search inside `network()` with
  fit and loop alone takes 44%. The whole ladder's `finishes`, once a draw,
  takes 45%; most drawn networks are thrown away by it.
- **Which techniques spend it:** `sealLock` 25%, `fitLock` 17%, `loopLock`
  12%, `loopNote` 12%, `fitNote` 10%, `arms` 12% (kept per board, but
  called often), and `union` 7%.

Fit already skips. Seal and loop run over every square after every firing,
and most of those runs find nothing.

## What Changes

- **A technique that reads connectivity skips an element whose reads no
  firing changed.** For `through(c, L)` over a set of edges bound by the
  technique, that is a group whose membership no placement changed, as
  `keptEdgeGroups` already tracks from the marks' log. For a reach built
  step by step, it is the squares the reach visited. The restart from the
  easiest technique stays, so every firing, every tier and every board is
  unchanged.
- **What a technique reads stays the compiler's to say**, as a footprint the
  runtime inverts. A read it cannot name keeps the technique whole, so a
  footprint never leaves out a read.
- **Measure first.** Task 1 splits the cost of Net's whole techniques
  between runs that found nothing and runs that fired, by element. It also
  measures how much of a 9x11 wrapping deal goes to draws thrown away by
  `finishes`, since a cheaper rejection may be the larger win.

## Acceptance

- Net's 9x11 wrapping Unreasonable deals average well under 1 s, and the
  worst of ten deals is under 1 s.
- Every board and every cap's verdict matches HEAD on Net, Loopy and every
  game that skips (`deal-compare`, `ladder-skip.test.ts`).
- A planted footprint that leaves out a read fails a test.
- Large boards are timed back to back with HEAD.
- `docs/descriptions.md` § "What a technique compiles to" says what the
  analysis now follows.

## Not in scope

- Speeding up the search or the generator's rewiring for Net alone. Net's
  generator already asks the whole ladder once a draw (`QUICK` in
  `solver.ts`). A per-game workaround is taken only where the engine cannot
  help, and it says why.
