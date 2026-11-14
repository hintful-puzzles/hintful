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

## Keen, moved (2026-11-14)

The recorder and the three cage techniques' reason callbacks are gone; each
says its cage, and `cageLine` its line too (the rows numbered first, so a
line below the board's width is a row). The cap keeps `cageEasy` to Easy
boards, as its `until` did for the solver.

Compared by `research/hint-walk-dump/` as for Unequal: every walk ends as
at HEAD (160 solved, 32 refused), and every sentence has a shape HEAD
spoke, but for a line step striking three numbers at once. No line step
appears below Tricky. On Tricky boards and up the line steps rise (28920 to
51908) and the cell-by-cell cage steps fall (188376 to 168532): a line step
that continues the last one is now offered beside the singles. The
avoidable-jump share fell (implicit reading 2.8% to 2.6%, populated 1.0% to
0%). Every fingerprint walk still solves, in a few steps fewer.

## Towers, moved (2026-11-14)

The recorder and the three techniques' reason callbacks are gone. `facing`
says its pairs, and the hint finds the pair each placement is the tallest
of (`facingReason`); a row's pair and a column's may place in one corner,
which is one leg. `bounds` says its clue and which reading struck,
`arrangement` its clue. Every strike is cut a leg a height, as the recorded
ones were. The `lineFull` board `firing-replay.test.ts` swept went with the
audit of Towers' recording.

Compared by `research/hint-walk-dump/` as for Unequal: every walk ends as
at HEAD (96 solved, 32 refused). The openings are HEAD's but for a hidden
single the notes show sooner, and facing steps fall (232 to 60): `facing`
is of the ladder's easiest tier, so it waits behind the singles, and the
tower it pins is mostly a hidden single of its line by then. The other
rungs are near the same (arrangement 5268 to 6244, lowerBound 3020 to
3300, lineFull 1876 to 1552). The avoidable-jump share rose (implicit
reading 3.4% to 5.2%, populated 0% to 0.6%), inside the 10% bound.

## Mathrax, moved (2026-11-14)

The recorder and the clue readings' reason callback are gone; each says its
clue, and a firing, one clue's strikes in one cell, is one leg. The
replay audit's two gated entries, which said a recorded clue strike was
decided by more corners than the step names, went with the recording they
audited.

Compared by `research/hint-walk-dump/` as for Unequal: every walk ends as
at HEAD (288 solved, 32 refused), every sentence has a shape HEAD spoke,
and the rungs are near the same (clue 29144 to 29016, a line's last cell
73872 to 69984, hidden singles 8300 to 9716, sets 1352 to 1824, and 156
wing steps on Tricky boards where there were none). The avoidable-jump
share is unchanged (implicit reading 2.1% to 2.2%, populated 0.8% to
0.4%). Two Tricky fingerprint walks lengthen (73 to 88 and 54 to 68
steps), taking singles where a line's last cell was filled whole.

## Group, moved: a placing technique leads (2026-11-14)

The recorder and the three techniques' reason callbacks are gone;
`associativity` says its triple and the products' cells, `identity` the
revealing product and the identity, `notIdentity` the element and its
witness, and the hint builds the reasons from them off the working grid.

Group's `leads` rung offered the recorded placements whose premise held,
ahead of the strikes and in the note-free opening. With nothing recorded,
what leads is the techniques themselves: `techniqueRung` takes `leads`, and
a leading technique waits neither for the setup nor for earlier rungs. It is
the game's word, not read off the ladder, because Towers' `facing` places
too and waits behind the singles by design (§ "Towers, moved"). Until the
setup the game's own rung still offers every single the board shows
(`RungContext.placements()`). The identity's row and column are one firing,
so they are one journey without the plan's `placement` hook, which had no
other user and went, with the `recorded` flag on `placements()`, which only
Group read.

Compared by `research/hint-walk-dump/` as for Unequal: every walk ends as at
HEAD (160 solved, 32 refused). Associativity steps rise (35556 to 48544) and
identity fills (2876 to 4404), as every firing the board supports is offered
where the recording held only those its solve reached before a single did;
singles fall (27232 to 18596, regions-full 77008 to 70464). The frontier
takes a single first unless the placement continues, so the plans jump less:
over the leaf presets, avoidable jumps 0 of 36 implicit and 0 of 77
populated, against 0 of 142 and 2 of 154 at HEAD. Under 50 jumps
`hint-frontier.test.ts` cannot judge a share, so it now deals further boards
a preset, up to six, until a game's plans have jumped enough. The 84 obvious-clean steps
under the implicit reading are gone: a stale note's opening now always has a
placement to take first.

## Solo, moved (2026-11-14)

The recorder threaded through `SolverUsage` (`pendingRecorder`), its premise
replay and every reason method of the solver are gone; the ladder is
board-static (`soloLadder`), and `soloNotesLadder` is Solo's `NotesLadder`
over fresh `SolverUsage` marks, capped on both scales: the board's tier
below the search, and its killer tier on a killer board. Each technique a
step teaches says its terms (a cage's `r`, `K`, `t`; a unit's leftover `u`,
`W`, `L`, `s`, the rest of its cage `t`, and which of the two a part reads,
`i`; an intersection's line, box and direction; `digitSet`'s lines), and
`solo/hint-reasons.ts` builds the reasons from them, with the reason types
the solver no longer needs. The library's `set` now says its unit `u` too,
which Solo's set names.

- **No working cages on the hint path.** The killer techniques read a cage's
  filled cells off the grid (`owed`), so the cages `reduceCages` keeps for the
  solve are not read; the walk's cull already strikes a placed value from the
  rest of its cage (a cage is one of `regionsOf`).
- **`boxSingle` has no rung**: it is the walk's hidden single in a block, as
  Rome's `onlyHome` was.
- **The set step outlined the wrong cells.** It outlined the open cells
  outside the set (`open − S`, the hidden set) under words that name the
  naked one ("Other cells in this column already account for 3, so the 3
  must go", the struck cell among those outlined); it outlines `S` now. At
  HEAD too.
- **The killer-sum test reads the rungs.** "works out every killer sum it
  cites" checked the recording; it now reads every leg the rungs offer at
  four positions on the way to each board's answer.

Compared by `research/hint-walk-dump/` here and in a worktree of HEAD, two
boards a preset (at eight the HEAD dump's text passes the string limit):
every walk ends as at HEAD (112 solved, 8 refused on Unreasonable). The
rungs: single 77684 to 59384, cageSingle 20716 to 13832, cageMinMax 45488
to 51040, cageSums 0 to 4936 (a cage-sums strike that continues the last
step is now offered beside the singles, where the recording solved by min
and max first), set 1968 to 3176, intersect 1744 to 2200, note 26588 to
35884, and the plans are shorter (350884 lines against 375032). The
avoidable-jump share fell (four boards a preset: implicit 23 of 676 to 9
of 518, populate 29 of 1089 to 16 of 916). The fingerprint's Killer Easy
walk lengthens (247 to 297 steps, more of them min/max strikes); every
other walk keeps its ending, within a few steps.

## Undead and Crossing keep their own walks (2026-11-14)

Neither is on `runCandidatePlan`, and neither moves onto it here. Undead's
notes are on its monster squares, numbered round the mirrors, not on a grid
the walk strides; Crossing's steps fill a whole run and write the notes the
next placement rests on (`aimedNotes`), which no rung of the walk does.

- **Undead** reads its ladder's `total` and `sightline` firings off the
  player's notes (`undeadFirings`), a note-less square reading as every
  monster, in place of the recorder (`recordUndeadDeductions`) and the
  reason callbacks. `total` says `d` and `n`, `sightline` its slot `s`. The
  count placement (`onlyCells`) is `total`'s placing half, so the walk's own
  copy of that count went. The recorder's two tests went with it: every
  rung is pinned (`describeHintPins`), and `hint-resume.test.ts` asks
  `findMistakes` at every position a walk reaches.
- **Crossing** already walked the compiled firings on the notes; its five
  reason callbacks became `says`, read by one `whyOf`.

Compared by `research/hint-walk-dump/` here and in a worktree of HEAD:
Crossing's dump is byte-identical. Undead's ends every walk as at HEAD (64
solved, 32 refused on Unreasonable), and differs on one board, where a
`total` now strikes three vampires at once where HEAD struck one by a
sightline first (21928 lines against 21968). The walk fingerprint is
unchanged for both. Undead's dump ran in 5.3 s against 8.9 s at HEAD.
