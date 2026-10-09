# wash-crossing-runs-in-pencil-mode

**Status: approved by the owner (2026-10-09)**, who took the recommendation
of the session that archived
`2026-10-09-triage-what-the-spec-rewrite-found-in-the-code` (its rows
`A-crossing-2` and `B-crossing-1`). Fifth in the order that session set.

## Why

Selecting a Crossing cell for digit entry washes the two runs through it and
colors the clue list by which clues fit. Selecting the same cell for pencil
marks shows neither: seen in the running app (2026-10-09), the cell carries
the pencil selection and nothing else. `redraw` in
`src/games/crossing/render.ts` computes its selected cell only outside pencil
mode. No decision was found for it (no comment at the site; `git log -S`
shows refactors only). A player penciling candidates is asking the same
question, which runs is this cell in, and gets no answer.

## What Changes

- A cell selected for pencil marks washes the runs through it, as one
  selected for digit entry does, under the same preference.
- The clue list stays uncolored in pencil mode. A colored clue promises that
  a click places it in that run, and in pencil mode a click only holds the
  clue.

- Found in the app while checking the wash (2026-10-09), and fixed here
  because the wash under a pencil selection makes each one the common case:
  pencil marks on a washed square take the ink a placed digit takes there
  (the pencil ink all but vanished on the run color); the square selected
  for pencil marks keeps its own surface under the notes triangle; and a
  filled square shows the pencil selection, where it showed nothing.

## Capabilities

### Modified Capabilities

- `crossing`: "Selecting a cell shows which clues fit its runs", which today
  states that a pencil selection shows neither aid.

## Impact

- `redraw` in `src/games/crossing/render.ts`, its render tests and
  snapshots, and `help/games/crossing.md` where it describes the two aids.
- No save or game-ID change.
