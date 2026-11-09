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

## What the measurement showed, and what was built (2026-11-09)

Ten 9x11 wrapping Unreasonable deals (`deal-compare-9x11wdu-0..9`), timed
by technique and by whether a run fired:

- **At HEAD: 8.5 s in all, the worst deal 3.03 s.** The search inside
  `network()` took 44%, and `finishes` took 44%. In the search, the fit and
  loop techniques ran on fresh marks for every child position, so a skip
  within one marks object could not help them. In `finishes`, `sealLock`'s
  runs that fired took 29%, and `sealNote` and `strandNote` made `K` for
  every square, 14%.
- **The skip helps only the loop techniques.** Seal and strand read a reach
  over the board through `P` and `U`, which change with almost any strike,
  and their cost is in the runs that fire, not in the runs that find nothing
  (`sealLock` found nothing in 117 runs for 13 ms, against 407 ms in 141 runs
  that fired, on the worst deal). A reach footprint would name nearly every
  square, so it was not built, and seal and strand stay whole.

What was built, with each step's effect on the ten deals:

| Step | Effect |
| --- | --- |
| `union` and `minus` stamp their members | 8.5 s → 6.9 to 7.6 s |
| A search's child forks its parent's marks (`CellMarks.fork`) | search fit 2.0 → 0.76 s |
| Group footprints (`loopLock`, `loopNote`) | search loop 1.63 → 0.67 s; 5.1 s |
| A binder with no member skips the costly names before it | `sealNote` and `strandNote` 0.77 → 0.06 s; 4.4 s |
| Member tables, stamped comprehensions, hoisted `±`, group-kept sets | `sealLock` 1.62 → 1.05 s; 3.62 s |
| A rung's fill arrays kept across runs, cleared whole at each run | 3.54 s |
| A board-kept table read inside a filling's pairwise test | 3.36 s |

**Outcome: 3.36 s in all (336 ms a deal), the worst deal 1.13 s**, against
8.5 s and 3.03 s at HEAD. The worst deal is the eighth, whose generator draws
113 networks and asks `finishes` of each. What is left of its time is spread
over the five fit, loop and seal techniques, none above a sixth of the
deal. The worst-of-ten bar is missed by that one deal; no further engine
change with a clear cross-game win was found. Net's generator rejecting
draws more cheaply is the remaining lever, and it is Net's alone, out of
scope below.

Two defects deal-compare caught across the catalog, fixed before commit:

- Fill arrays kept across runs were cleared by the set they were last
  given over. That set can be a scratch array the next run refills, so the
  old cells kept their values, and Tents dealt two different boards. They
  are now cleared whole at the start of each run.
- Stamping every comprehension made Palisade's deals 1.13 of HEAD's: its
  sets are short, and a call costs more than a scan. A set is now scanned
  until it has sixteen members, and stamped past that.

With both fixed, deal-compare against HEAD over every game whose compiled
module changed (33 games, three deals a preset) found every board and every
cap's verdict the same. Net's deals took 0.46 of HEAD's time and its
solves 0.35; 9x11 wrapping Unreasonable averaged 406 ms against 983 ms, and
11x13 Unreasonable 30 ms against 76 ms. Every other game's total was within
0.92 to 1.05 for deals, inside the 0.73 to 1.15 HEAD reads against itself.
Pearl's 10x12 Easy deals average 1.2 s, as at HEAD. Its Easy tier has no
loop technique, so this change does not reach that cost, and its Normal
loop techniques read `Q - through(…)`, a set over the whole board, so they
stay whole.

The planted-footprint acceptance is held by `ladder-skip.test.ts` as it
stands. A footprint that dropped the neighbors' group read failed it at one
deal, on Net's Bordered 7x7 Unreasonable. One that dropped the square's own
group read passed at eight deals: when the square's group changes, either a
neighbor in that group is listed too, or the square was alone and a wire at
it was placed, which its answer read sees. So that read is implied, and it
is kept as the conservative statement.

## Not in scope

- Speeding up the search or the generator's rewiring for Net alone. Net's
  generator already asks the whole ladder once a draw (`QUICK` in
  `solver.ts`). A per-game workaround is taken only where the engine cannot
  help, and it says why.
