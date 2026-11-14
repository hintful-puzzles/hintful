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
