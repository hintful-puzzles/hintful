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
- **The gate is read off the ladder.** A rung reading the notes always waits
  for `populated`. A technique of a harder tier than the ladder's easiest
  waits for `nothingEarlier`, which is the rule `docs/hints-candidates.md` §
  "A rung of the game's own" already stated for a hand-written rung. Seismic's
  `starve` (Normal) takes it; Abcd's `satisfied` (Easy) does not, as before.
  Abcd's `runs` is Easy too, and its wrapper gated it by hand as "the solver's
  last resort"; whether the tier rule may drop that is measured on Abcd before
  it moves (task 1.3).
- **A plan with no recorder reads its hidden singles off the notes.** The
  recorder was the only source of hidden singles (`availablePlacements`), so
  `record` is now optional, and without it the walk's singles rung adds a
  hidden single in each region of `regionsOf` that holds every value, once
  the notes are set up or under the implicit reading. Every Latin game will
  need this when its recorder goes; Abcd has no such region, so it is
  unchanged.

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
