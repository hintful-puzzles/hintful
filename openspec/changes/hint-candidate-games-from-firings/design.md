# Design

## The engine takes the gate (2026-11-14, read from Abcd and Seismic)

Abcd's two wrappers each did three things: build marks over the walk's board
(values placed, notes shown), ask the ladder's technique for its firings, and
gate on `RungContext`: `satisfied` on `populated`, `packed` on `populated` and
`nothingEarlier`. Only turning a firing into legs is the game's.

- **`techniqueRung` (`engine/candidate-plan.ts`) is the rung.** The game hands
  it a `NotesLadder` (its ladder, fresh marks over the working grid, its note
  encoding) and a technique id, and says how a firing becomes legs, from the
  terms its `says` names. The engine fills the marks' candidates from the
  notes through the encoding, so no game writes that loop.
- **The gate is read off the ladder's order.** A rung reading the notes
  always waits for `populated`, and any technique but the ladder's first
  waits for `nothingEarlier`, since the solver restarts from the top after
  each firing and so reaches it only once those before it are spent. That
  reproduces both games' hand-written gates: Abcd's `satisfied` (first) is
  ungated, its `runs` and Seismic's `starve` gated.
- **The tier was tried first and is not enough.** Gating only a technique of
  a harder tier than the ladder's easiest left Abcd's `runs` (Easy, like its
  single) ungated, and its walks changed: on the fingerprint's boards the
  packed-stretch steps rose and the singles fell (one 6×9 board: packed 5 to
  36, singles 49 to 18). The help calls `runs` the one idea that goes
  further, so it would crowd out the plain rules.
- **A plan with no recorder reads its hidden singles off the notes.** The
  recorder was the only source of hidden singles (`availablePlacements`), so
  `record` is now optional, and without it the walk's singles rung adds a
  hidden single in each region of `regionsOf` that holds every value, once
  the notes are set up or under the implicit reading. Every Latin game will
  need this when its recorder goes; Abcd has no such region, so it is
  unchanged.

## Abcd, moved (2026-11-14)

Its wrappers are two `techniqueRung` calls; `legs` is handed the shown notes,
which `packed`'s words read for the cells the line has left. Its walk
fingerprint, pinned at the commit before, is unchanged.

## Seismic, moved (2026-11-14)

The recorder (`recordSeismicDeductions`) and the ladder's reason callbacks are
gone; `starve` says `r` and `n`. A square that is a whole area is a rung of
its own before the setup (its note shows it after), which the recorded
placements did before.

Compared by a scratch dump of every plan over 21 Seismic boards and both
readings, every fifth move of a played-through game: every board still
finishes, and from the start the plans hold 2611 steps against 2588 at HEAD,
the same rungs in near the same numbers (a few more hidden singles and
starved areas, a few fewer naked singles). The dump ran in 4.5 s against
12 s at HEAD.

## Rome, moved (2026-11-14)

The recorder (`recordRomeDeductions`) and the ladder's reason callbacks are
gone. `loop`, `pair`, `reach` and `opposite` say their binding's cells, and
each is a `techniqueRung` in the ladder's order; a loop's chain and a goal's
group are read off the arrows placed. `onlyHome` has no rung: it is the
walk's hidden single in an area of four, so its strikes became placements.
`techniqueRung` now drops a note outside `NoteEncoding.all`, since a player
may pencil an arrow off the board. Rome's `reach @ reach` entry in
`firing-replay.test.ts`'s gated ledger went with the recording it audited.

Compared by a scratch dump of every plan over 20 Rome boards (4x4 to 8x8, all
three tiers) and both readings, every fifth move of a played-through game:
every board still finishes, and the rungs are the same in near the same
numbers (loop 5448 to 5363, reach 485 to 472, opposite 303 to 343; onlyHome's
131 strikes gone, hidden singles 12 to 83). The dump ran in 2.1 s against
10.8 s at HEAD.

## The fingerprint's boards (2026-11-14)

Enrolling every game left (task 2.0) took `hint-walk-fingerprint.test.ts`
to 178 s on CI against its 120 s budget, Group's 8x8 walks the most of it.
As `docs/testing.md` § "Right-sizing the gate" has it, every commit walks
one board a preset and the slow tier the other three, each into a snapshot of
its own (`hint-walk-<id>-more.txt`); the split files hold HEAD's lines
exactly. Both read the gate's slice of presets, which `gatePresets` widens to
every preset in the slow tier, where the snapshots would not have matched.

## The Latin library says (2026-11-14)

`set`, `fish` and `wing` say their terms, and the library's rungs build the
`LatinReason` that `latinPremise` narrates from them, so a reason is the same
recorded or read off the notes, and the rungs no longer read the marks
themselves. A fish says its two views as arms, `cols` where its columns are
no more than its rows, and the places the value can take in that view,
written column by column (`set(c over L in X, c in cells(L) ...)`), the
order the recorded reason had: written row by row, the outline's order
changed, and with it which cell the implicit reading notes first.

`latinNotesLadder` (`engine/latin-hint.ts`) is a game's `NotesLadder` over
a fresh `LatinSolver` holding the walk's grid, so a game's own techniques read
the solver they read when solving; `NotesLadder` and `techniqueRung` take
the marks' type.

Compared by `research/hint-walk-dump/` here and in a worktree of HEAD for the
six Latin games whose walk fingerprint a set or fish step reaches (Adjacent,
Group, Keen, Mathrax, Salad, Unequal): every dump is byte-identical.

## Salad, moved (2026-11-14)

The recorder (`recordSaladDeductions`) and the border's reason callback are
gone; `border` says `k`, `L`, `H`, `reach` and `stop`, and the hint builds
its near and far reasons from them. The library's rungs are
`latinStrikeRungs`, in `engine/latin-notes.ts` with `latinNotesLadder`
(apart from `latin-hint.ts`, which `candidate-plan.ts` imports, so as not
to make an import cycle). Each game's own `legs` would have been the same
three, so no Latin game writes them.

- **The X note is the hole symbol's candidate, a cross the hole placed**
  on the marks, and a ball's square has no X in its full set
  (`NoteEncoding.all`), so a stray X the player left on a ball is no
  candidate. `stop`, the first square that cannot be empty, is now read
  off the notes too: a square whose notes have lost the X. That is the
  same fact the cube's struck hole was, and the outlined square shows it.
- **The walk's hidden singles leave out the X**: the last X a line's notes
  have room for is a marker, which the counts take. `placeable` now takes
  a mark and screens the hidden singles too.
- **The check that every marker the cube forced was explained went** with
  the cube it compared against (`assertEveryMarkerExplained`). Each board
  finishing its walk (the dump below, the walk fingerprint) is what shows
  a skipped strike now.

Compared by `research/hint-walk-dump/` over the gate's three presets, 8
boards each from four starting shares: every one of the 96 walks finishes,
as at HEAD. The opening plans are the same up to the first hidden single
the notes show before the cube placed it; from there the plans run on hidden
singles where HEAD waited on the cube's naked ones and the line counts that
followed them (steps over every plan: hidden singles 8564 to 22620, naked
singles 35792 to 19144, line counts 35636 to 22692), and the plans are
shorter (120968 lines against 153884). The border and set steps are near
the same in number (border 11608 to 12972, set 3356 to 3380). The dump ran
in 7 s against 10 s at HEAD.

## Unequal, moved (2026-11-14)

The recorder and `sign`'s reason callback are gone; `sign` says its ends
and the bound each struck end is held to (`lo`, the least the smaller end
can be, `hi` the greatest the larger can be), as terms the description
computes off the marks, so the game reads no candidates to build a reason.
The hint cuts a firing a leg a cell, with `byCell` (`engine/latin-notes.ts`,
moved there from Salad) for the library's rungs.

The recorder solved only up to the board's tier; the rungs do not, and
need not: a technique past the board's tier is reached only when every
easier rung is empty, which on a board solvable at its tier never happens.

Compared by `research/hint-walk-dump/` over the gate's presets, 8 boards
each from four starting shares: every walk ends as at HEAD (128 solved, 32
refused on Unreasonable boards), and the rungs are near the same in number
(greater 36564 to 36792, lesser 34504 to 35456, set 11376 to 11992, hidden
singles 21092 to 21908, naked singles 55908 to 49316). The plans differ in
order where the notes show a hidden single before the recording placed it.
The walk fingerprint's per-commit boards keep their step counts and rungs;
on the slow tier a few walks move by a few steps, and an Unreasonable
board's goes further before it refuses (62 to 77 steps).

## A waiting technique continues; the board's tier bounds it (2026-11-14)

The commit after Adjacent's failed `hint-frontier.test.ts`: Adjacent's plans
passed over a firing that continued the last step on 14% of their jumps
(implicit reading), against a bound of 10%. Measured on the same corpus at
the session's start and after each move (avoidable jumps over jumps, implicit
reading): the recording games sit at 0 to 4%; Unequal went from 1.9% to
5.1%, Adjacent from 2.7% to 14.2%, and Rome, moved before, sat at 8.8%. The
cause was the gate: a recorded strike was offered beside the singles, so the
frontier could take the one that continued, while a `techniqueRung` past the
ladder's first waited for every earlier rung to be empty, so a bar step
continuing the last placement waited behind any single on the board.

- **Offered whenever it continues**, every waiting technique took Adjacent
  to 1.5% and Rome to 2.7%, but taught past the board: a Normal Adjacent
  board took neighbor-set steps (Tricky) by the dozen, an Easy one bar steps,
  Seismic's Easy boards starved areas, which its test forbids, and Abcd's
  `packed` crowded its singles out again (one 6x9 board: packed 5 to 36,
  singles 49 to 18), the outcome § "The engine takes the gate" rejected.
- **What holds**: a technique of the ladder's easiest tier waits outright,
  being another reading of the singles' difficulty, and a harder one offers
  only a firing that continues the latest steps. A `NotesLadder` carries the
  board's `caps`, and a technique the solver would not run at them offers
  nothing, as the Latin recorders, which solved up to the board's tier, did
  not record it. `latinNotesLadder` takes the cap; Abcd and Seismic pass
  their board's tier, Rome its top one, since its state keeps no tier and
  its recorder solved at every one.

With both, at the session's start against now (implicit reading): Adjacent
2.7% to 1.4%, Unequal 1.9% to 3.0%, Rome 8.8% to 6.4%, Salad 3.7% to 2.9%,
Seismic 3.3% to 0.8%, and Abcd's dump is byte-identical. Every walk of the
six games' dumps ends as before. Rome's pinned `pair` board no longer takes
a pair; a search found two such boards in 1200 dealt Tricky ones, and the
pin moved to one.

## Adjacent, moved (2026-11-14)

The recorder and both bar techniques' reason callbacks are gone; `adjacent`
says the placed neighbor, its number and whether a bar joins them, and
`adjacentSet` the neighbor and the bar. A bar firing strikes in one cell, so
it is one leg. The edge-clue recorder (`recordEdgeClueDeductions`) had no
other caller and went, with `research/describe/firings.test.ts`, which read
that recorder's firings against the stated techniques: the hint now runs
the stated techniques, so there is no second copy to compare.

`strikesOf` (`engine/candidate-plan.ts`) is a firing's facts as the marks
it strikes. Rome, Unequal, Adjacent and the library's rungs each wrote that
loop; they share it now, and Rome's, Unequal's and Salad's fingerprints are
unchanged by it.

Compared by `research/hint-walk-dump/` as for Unequal: every walk ends as
at HEAD (128 solved, 32 refused), and every step's sentence has a shape
HEAD spoke, but for a bar step striking three numbers at once (a neighbor
left only odd numbers forces this cell even). The rungs are near the same in
number (adjacent 20112 to 18056, adjacentSet 20152 to 21532, set 4180 to
4860, hidden singles 10872 to 13516, naked singles 54108 to 46784). The
fingerprint moves more than Unequal's: walks of a board's tier shift by up
to a dozen steps either way (5x5 Tricky #3 49 to 60, more of them neighbor
steps; #1 73 to 63), every one still solved.
