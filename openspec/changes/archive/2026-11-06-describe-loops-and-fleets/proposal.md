# describe-loops-and-fleets

**Status: filed by `describe-chains-loops-and-fleets` (2026-11-02)**, which
split at its start and took Rome. Part of step 8 of
`describe-the-whole-catalog`'s plan (`design.md` § "The plan"). It split at
its start too (2026-11-06): it takes Slant, and filed Boats as
`describe-fleets`, which files step 9.

## Why

Slant ran a hand-written ladder beside a description that stated only its
help. What it reads that the language lacked (the catalog's survey,
`design.md` § "The constructs"): the points where squares meet, which way a
diagonal runs through one, the groups of points the diagonals join (acyclic
over the border vertices, C), and a mark on the pairs of squares side by
side (its alike and v-shapes, a relation mark).

## What Changes

- **Points, diagonals and a mark on the edges** in the description
  language, the ladder runtime and the checker: `points: true`, `cells(k)`,
  `points(c)`, `slash(c, k)`, `linked(k)`, `through(c, E)`, a clue at a
  point, and a mark on the edges whose `of` says what it means of the
  answer (`docs/descriptions.md` § "The formula syntax", § "Checking a
  technique sound").
- **Slant's ladder stated**, its tiers as it grades them, and its
  hand-written solver retired: `solver.ts` runs the compiled ladder for the
  generator, `solve()`, `findMistakes`, the difficulty and the hint, whose
  walk is the engine's.
- **Split at the start**, as steps 7 and 8 split by game: Boats, the
  largest deletion in the catalog, is `describe-fleets`.

## Acceptance

Slant runs its compiled ladder for its hint and its generator's grading;
the hand-written rungs removed; every technique checked sound; the boards
dealt, their tiers and the hint walks compared with HEAD and each difference
reported, with which saves or links no longer load; the guides updated; the
next step filed.

## What the comparison found

Recorded at HEAD (635538a0) before any code moved: every preset at both
difficulties, eight seeds each (48 boards), dealt and walked to the end
from empty.

- **Boards and grades: all 48 descs and both grades identical.** The C
  byte-match differential's 10 frozen boards still deal byte for byte, and
  stay its test. The
  old and new solvers agree on all 24,000 solves of random clue subsets
  (boards 4–6 a side, both caps). **No save or link stops loading.**
- **Hint walks**: 8 of 48 identical step for step, 17 the same length. Easy
  walks read exactly HEAD's clue and loop steps (775 clue-fill, 735
  clue-empty, 162 loop) without HEAD's 58 mark-clue steps: the engine's
  walk never takes a step harder than the ladder's next, and HEAD's passes
  read a marked pair while a clue was still to read. Normal walks: mark-clue
  137→106, mark-v 56→59, dead end 39→44, equiv 0→5; the equiv steps say an
  existing sentence. One pinned `mark-v` sentence reads the 1s at the pair's
  ends where HEAD's read the 3s, since `one` runs before `three`.
- **Deal time is slower**, timed back to back with a HEAD worktree (ms a
  deal, two seeds):

  | Board | HEAD | Now |
  | --- | --- | --- |
  | 10×12 Easy | 10 | 34 |
  | 10×12 Normal | 21 | 185 |
  | 20×20 Easy | 116 | 416 |
  | 20×20 Normal | 252 | 2,902 |
  | 30×30 Easy | 1,315 | 4,504 |
  | 30×30 Normal | 2,069 | 25,622 |

  The first working ladder was 21 times slower at 20×20 Normal; profiles
  found three causes, each fixed in the runtime or the compiler (groups of
  points kept by an incremental union-find, a set of edges joined once where
  it is bound, the answer check's groups joined once a check). What is left
  is the runner restarting at the first technique after every firing, about
  74 runs a solve on a 20×20 board, each over the whole board, where HEAD's
  three passes did each technique's work in one scan. A runner that sweeps
  the ladder before restarting gives the same verdicts on all 24,000 solves
  and saved 1.3–1.6× (20×20 Normal 2.1 s, 30×30 Normal 16.3 s): too little
  to change the engine's runner for. The presets deal in under 0.2 s.

## What steps 7 and 8 learned that binds here

- Record the comparison at HEAD before any code moves: a scratch
  `src/scratch-*.test.ts` that deals every preset at several seeds and walks
  each hint to the end by its first step, writing desc, deal time, both
  grades and every step's rung, move and words as JSON to the session's
  scratchpad; run it again after, and diff by each square's final mark and
  rule, keyed by what a move decides, not by step count. Range's and Rome's
  whole comparisons ran in seconds. Vitest silences `console.log`: write the
  JSON to a file, or throw the report.
- Time large boards back to back with HEAD, from a worktree of HEAD in the
  scratchpad: Range's presets moved by milliseconds while 10×118 first went
  3.6 times slower, and a profile (`node:inspector/promises`' `Session` in a
  scratch test) named the cause.
- **Run the byte-match differential before retiring it.** Rome's 15 frozen
  C boards still dealt byte for byte on its compiled ladder, a pair rule
  restated without upstream's root quirk included.
- **Keep a hand-written rung's conclusion where it changes the words.**
  Rome's `onlyHome` and `reach` strike the square's other arrows, as the
  hand-written rungs did, rather than placing the one left: a placement
  speaks another sentence, and as strikes every sentence stayed HEAD's.
- **A generator that lays its answer while deducing runs the same ladder on
  the board it is laying**, where only the techniques that read nothing yet
  dealt can fire, and a square the ladder empties is a contradiction that
  stops the run: Rome makes such a square a goal and solves again, which
  kept its draws, and so its boards, as they were.
- **A value with no direction is numbered past 4** when `step` reads the
  values as directions (Rome's goal, 5), and a domain stated as `{d in
  range(1, k) where ...}` is checked up to `k`.
- **A set of numbers is a 32-bit mask.** A position along a line is a
  number bound by `range`, which counts; read as a set it holds nothing past
  31 (`docs/descriptions.md` § "The formula syntax").
- `place` on a cell already holding a value is no fact and no
  contradiction, so a technique states its guard (`value(p) != 1 and
  place(p, 2)`, Range's `besideShaded`) where the search beneath it must see
  a broken position before the board is full.
- `connected(S)` and `cuts(S)` exist; bind `cuts` once by `=`. `chain(c)` is
  a set in reading order; a sentence that names the walk computes it in the
  game's reason.
- A hand-written cascade a hint showed as steps of its own is a rung at the
  top of the ladder, not `on: place`, which folds it into the placing step
  (Singles' `besideCovered`, Range's `besideShaded`).
- An upstream else-if chain is one technique whose conclusion is the chain
  (`(not A or P) and (A or ...)`, Singles' `corner`); split into techniques,
  every first reading runs before any second.
- Two readings a hand-written scan interleaves are one technique bound by
  the clue (`docs/descriptions.md` § "A statement's order is behavior"),
  unless the order change is the plan's accepted one, as Range's was.
- The checker reads marks the game never reaches; a technique that leans on
  the game's placements is unsound there, and the statement states the
  guard (Rome's `home` finds a goal by its clue, not its placed value,
  since the checker may leave a goal unplaced). It cannot divide a count it
  does not fix.
- A plant must apply on the smallest board checked (order 3): a plant that
  binds nothing there is called sound and fails the run.
- **A `count` beside chains stalls the checker.** Rome's `reach`, stated as
  a count of the arrows into its goals' squares, ran one z3 query at order
  4 for over an hour without an answer; stated as an arrow no other shares,
  with `exists`, it checked in 34 minutes. Prefer a quantifier to a count
  where the statement allows, and start the check early.
- A definition is computed at each read, so bind a term read more than once.
- A library name must be spelled apart from every name a description
  defines; grep the descriptions and `compile.ts`' names first. A plant is
  keyed `<game>.<id>` where another game states the id.
- A MODIFIED requirement cannot drop a scenario that is now false: REMOVED
  the requirement and ADDED its successor (Range's hint order, Rome's
  recorder).

## Figures to re-check

Measured on 635538a0 (2026-11-06): Slant's `solver.ts` went from 904 lines
to 553, the adapter that rebuilds the trace `hint.ts` (802, unchanged)
narrates from the engine's walk. Boats' figures moved to `describe-fleets`.
