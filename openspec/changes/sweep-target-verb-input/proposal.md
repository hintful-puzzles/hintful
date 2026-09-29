# sweep-target-verb-input

**Status: scaffolded, not started (2026-09-29).** Follows
`derive-target-verb-input`, whose `design.md` holds the measurements this
starts from (read it first; its archive is under `openspec/changes/archive/`).

## Why

`engine/target-verb.ts` owns the click games' input: a geometry, a verb per
button, Enter and Space derived, the help's Controls paragraph generated, and a
guard holding the keys to the buttons. Four games declare it (Light Up, Singles,
Range, Unruly). The input survey's other members still hand-write the cursor,
Enter/Space and verb branch, and each of them states the same convention in its
help prose.

## What changes

The remaining members adopt the model, and the model grows only where a member
measurably needs it. Re-take the member list first: `boardsReached`
(`testing/input-probe.ts`) is the instrument, and a game belongs when its keys
reach the boards its buttons reach.

## Task 0: the measured misfits, one question each

Each is a question about the model before it is a question about the game
(AGENTS.md, "A game that does not fit a convention is first a question about
the convention"):

- **Net: Space is the middle verb (lock)**, and clockwise rotation is `d`. Can a
  declaration say which verb Space applies, and is that a key map or a fourth
  verb slot? Also re-check whether the half of Net's cursor walk that ran past
  2,000 positions in the survey is its origin-shifting Ctrl-arrows.
- **Magnets: a clue click marks the clue done, and the keyboard cannot reach a
  clue.** A second target kind in the geometry (a gutter) would close a real
  parity gap.
- **Subsets: the tally band** is a second target kind that only the keyboard
  reaches in one press.
- **Palisade and Separate** already share `border-grid.ts`; its half-cell cursor
  is a geometry. Fold `interpretBorderGridInput` into a `TargetGeometry` rather
  than keeping two models of the same thing.
- **Loopy, Black Box, Mines**: the three members that touch the release. Mines'
  press depresses and the release opens; decide whether the model needs a
  release hook or they keep an arm.
- **The drag games that agree on Enter anyway** (Boats, Bricks, Clusters,
  Pattern, Spokes, Sticks, Tents, Tracks, Galaxies): they commit on the release.
  Measure whether declaring their click half needs the model to own
  resolve-on-release (the second falsifier's question, now over them).

## Hints to pull in

One: **Net**, once it declares its verbs. A hint's steps are moves, and in the
model's games the moves are what the verbs make, so a step should be spelled
through the declared verb; a hint that hand-builds a move the model already names
is a finding about the model. Net presses hardest of the hintless members: its
lock is a verb with game-supplied semantics, its decided element is a tile's
rotation (a new mark kind), and its deductions are connectivity, which the hint
bar can narrate. The other hintless members (Mines, Black Box, Flip, Twiddle)
stay in reserve (`hintless-games-in-reserve`).
