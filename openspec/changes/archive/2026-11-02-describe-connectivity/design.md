# Design: Singles described

## Sections

| Section | What it holds |
| --- | --- |
| The split | why the step took Singles alone |
| What Singles needed of the language | C as two library terms |
| The ladder | upstream's rungs, stated as eight techniques |
| What retired | the hand-written solver |
| Against HEAD | the boards, the tiers, the walks, the deals |

## The split

Measured at the start (2026-11-02, HEAD `26adedc1`), the proposal's figures
held: Singles `solver.ts` 909, Range 808, Rome 938 and `hint.ts` 313, Slant
904 and `hint.ts` 802, Boats 1,026 and `hint-solver.ts` 1,407. Each of step
7's games was a session of its own, and these are as large, so the step took
the one whose connectivity is the plainest (one set joined, and its cut
squares) and filed the rest. Range reads the same `cuts` with the beams
step 7 built, so it is the cheapest of what is left.

## What Singles needed of the language

- **`connected(S)`**: whether a set of cells is one group side by side. The
  rules state the clear squares joined with it, and the answer check reads
  it.
- **`cuts(S)`**: the members without which the rest are not one group, one
  depth-first search of the whole set (Hopcroft and Tarjan's articulation
  points, counting the pieces a member's own group falls into without it,
  so a set already in pieces reads by the same definition). The proposal's
  survey asked for "a cut-vertex primitive, not a `look` flooding once per
  cell"; it is one, and Range will read it.
- **The checker reads both as reach**: the first member reaches a member
  beside one it reaches, as many steps as the board has cells; `cuts` holds
  each member under the guard that the rest do not connect. No unknown of
  its own; the eight techniques check in under a second each at orders 3
  and 4.
- **`src/engine/describe-runtime.test.ts`** pins both to their definition by
  brute force on every grid up to 5×5, and fails on a planted `>` for `>=`
  in the search.
- **No `look` was needed**: upstream's flood a candidate square is `cuts`
  bound once, and the rest of Singles' rules read the numbers and the marks
  as they stand.

## The ladder

1 is a covered square and 2 a clear one; every square deals its number (a
complete clue, which means its number shows in no other clear square of its
lines).

| Technique | Tier | Upstream |
| --- | --- | --- |
| `besideCovered` | Easy | the op queue's cascade from a black |
| `sameLine` | Easy | the op queue's cascade from a circle |
| `sandwich` | Easy | `solve_singlesep` |
| `pair` | Easy | `solve_doubles` |
| `corner` | Easy | `solve_corner`, its else-if chain as one conclusion |
| `boxedIn` | Easy | `solve_allblackbutone` |
| `offset` | Normal | `solve_offsetpair` |
| `split` | Normal | `solve_removesplits` |

All eight are sound at orders 3 and 4, and each plant unsound
(`research/technique-check/results-describe-singles.txt`).

- **The cascades are rungs at the top of the ladder, not `on: place`**:
  HEAD's hint showed a covered square's neighbors made clear, and a clear
  square's repeats covered, as steps of their own, and so does the ladder.
- **`corner` is upstream's chain**: the corner or the square across from it
  covered where it matches both squares beside the corner, else a pair
  beside one of those leaves the other clear. Split into techniques, every
  corner's first reading would run before any second, and the hint would
  meet a two-square firing upstream never makes.
- **`offset` is stated symmetric**, by the two by two the pairs make: upstream
  scanned only the next line over, and met the mirrored pairs by the other
  pair's scan, which comes to the same squares.
- **`split` reads every square, not only those diagonal to a covered one**:
  any square without which the uncovered squares fall apart is clear. A cut
  square beside a covered one is clear already, so the difference is a cut
  square the border makes; in the sample it took 95 steps to HEAD's 94, the
  one more a square HEAD's walk made clear beside a covered one. The help already said it this way.
- **The once-only rules run as rungs**, read again on each pass where
  upstream queued them once: they read only the numbers, so a second
  reading finds nothing new, and a hint from the player's marks no longer
  needs them primed.
- **`solveSneaky` stays the generator's** (`circleUnrepeated`): it circles a
  number repeated in neither of its lines, which the rules do not force, so
  the checker would refuse it. It only strengthens the test that a Normal
  board is not too easy.
- **The generator lays its covered squares on the same ladder**: each square
  covered in turn, the ladder run to its fixpoint after each. The numbers
  are then a Latin square's, so only `besideCovered`, `boxedIn` and `split`
  fire. Upstream ran its two connectivity rules once a covering, not to a
  fixpoint; no board in the sample moved for it.

## What retired

The op queue and its cascades, the once-only rules, the flood fill, the
recording plumbing and the primed cascade a resumed hint needed, the
`findingTechniques`/`singleFirings` hint skeleton, the completion check
(`status` is the compiled answer check; the error overlay keeps its own
marking, `markErrors`), `F_SCRATCH` and the state's `impossible` flag.
`solver.ts` is 343 lines, from 909.

## Against HEAD

Every preset at each tier, 10 seeds each (100 boards, 2026-11-02, HEAD
`26adedc1` against this change, back to back):

- **All 100 descs are HEAD's**, and the frozen upstream differential still
  matches byte for byte, so no board moved.
- **Every board grades as HEAD graded it** (50 Easy, 50 Normal). That holds
  beyond the sample: Easy reads HEAD's rules the same way, and Normal only
  grew, so no save or link stops loading or changes tier.
- **Every walk ends solved.** Of the 7,340 squares the walks decide, none gets
  another mark; 162 are decided by another rule, 154 of them a sandwich and
  a covered square's neighbor trading places, as the walks take steps in
  another order (HEAD offered every once-only reading from the start and
  opened on its column scan's first; the ladder scans rows first). No walk
  is HEAD's step for step for that reason.
- **The words are HEAD's functions.** Two pinned sentences moved: a covered
  square's neighbors are listed clockwise from the top, as the grid lists
  them, where HEAD listed left, right, up, down; and the offset pin's
  position meets another offset first.
- **Deals cost more on the small presets and the same on the large**: median
  and worst, in ms,

| Preset | HEAD | now |
| --- | --- | --- |
| 5×5 Easy | 0.6 / 1.8 | 1.1 / 3.0 |
| 5×5 Normal | 1.3 / 3.2 | 4.2 / 8.0 |
| 6×6 Easy | 0.8 / 2.8 | 2.0 / 6.7 |
| 6×6 Normal | 0.3 / 1.6 | 0.8 / 4.5 |
| 7×9 Easy | 6.1 / 22.5 | 12.9 / 45.1 |
| 7×9 Normal | 6.2 / 11.6 | 13.9 / 26.2 |
| 9×11 Easy | 13.8 / 55.3 | 21.5 / 89.5 |
| 9×11 Normal | 4.8 / 29.3 | 8.8 / 47.0 |
| 12×12 Easy | 98.1 / 586.1 | 117.9 / 780.8 |
| 12×12 Normal | 12.8 / 35.5 | 12.4 / 38.4 |

A 12×12 hint takes about 3 ms, against HEAD's 5.

**In the running app** (Chrome): a fresh 9×11 Normal board walks by its
hints to the finish, opening on a sandwich; a fresh 7×9 Normal board's
first `split` step rings the square and outlines the uncovered squares it
would cut off.
