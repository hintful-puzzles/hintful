# Verdicts: loopy

## reword `loopy`: Loopy draws edges in a fixed color order with clues at the incenter

The sentence that clue positions are recomputed when the tile size changes,
and its resize scenario, go as `obsolete`. Searched `src/games/loopy/render.ts`
for a cache of clue positions (`cache`, `tileSize`, `incenter`): there is
none. The draw state holds only the tile size, and each frame computes every
clue's place from `gridFindIncenter` and `toScreen`. Nothing is left to
forget to invalidate, and `engine-drawing` "A draw state is at one tile size
for its whole life" holds the rest for every game.

### Requirement: Loopy draws edges in a fixed color order with clues at the incenter

Rendering SHALL draw edges in a fixed color order so that mistaken edges paint
over all others, SHALL place clue text at each face's incenter, SHALL highlight
the edges of every closed loop but the largest when more than one exists, and
SHALL flash on completion.

#### Scenario: Completing a single loop wins

- **WHEN** the drawn lines form exactly one closed loop with no stray paths and
  every clue is satisfied
- **THEN** the game is reported solved and flashes

## keep `loopy`: Loopy's cursor is held under ui.cursor in its own shape

`engine-input` does not record the departure. "One keyboard-cursor vocabulary
across games" says a game with a keyboard cursor holds it in the engine's
shared shape, with no exception, and "A cursor outside the canonical field
fails the build" finds cursors by that shape. This requirement is the only
place that says Loopy's cursor is another shape and that the guard does not
see it.

## reword `loopy`: Loopy explains the next deduction from notes the player can make

The refusal on a solved or mistaken board, and the scenario "A wrong mark
refuses the hint", go as `collection`: `engine-hints` "The midend SHALL refuse
a hint on a finished or wrong board before asking the game" states both for
every game, with the scenario "Asking for a hint on a board with a mistake
highlights it", and Loopy has a `findMistakes` and departs in nothing. What is
Loopy's stays: the plan, and that it takes the player's marks as facts, with
the reason reworded to stand without the cut sentence.

### Requirement: Loopy explains the next deduction from notes the player can make

`hint(state)` SHALL return the lines the solver can decide from the player's
own board as an ordered plan, each step narrating why its move is forced from
premises the sentence itself states. Because the mistake check vouches for
every mark before the game is asked, the plan SHALL take the player's lines,
ruled-out edges and notes as facts.

#### Scenario: Following the plan finishes the board on every tiling

- **WHEN** a board of any tiling and any tier is generated and its hints are
  followed one step at a time from the empty board
- **THEN** every step sets only lines and notes that agree with the solution, and
  the board ends solved

## keep `loopy`: Each row of LOOPY_GRIDS states whether its tiling turns

The names match the `turns` column of `LOOPY_GRIDS` in
`src/games/loopy/params.ts` today, and they are not a bare copy of it. The
criterion "a patch that fills its box alike both ways" does not say by itself
which aperiodic tilings pass; the names are the worked cases a session adding
a tiling reads its own against, and the column gives no reasons.

## keep `loopy`: A hover makes no move and nothing depends on it

The repaint economy is a rule a change is checked against. `hover` in
`src/games/loopy/index.ts` returns `null` when the nearest edge is unchanged,
and its comment says that is what keeps a pointer sweep to one repaint an
edge; a board of a few hundred edges repainted on every pointer event is what
breaking it costs. The scenario states that, and the requirement states the
rest.

## keep `loopy`: The dline index is the same from the dot and from the face

The guard is not retired: `src/games/loopy/dlines.test.ts` checks the
dot-side and face-side formulas agree over every grid type. The rule is the
reason for it.

## note `engine-input` states the shared cursor shape with no exception

"One keyboard-cursor vocabulary across games" reads as holding every game with
a keyboard cursor, and Loopy's is a dot, a chosen edge and an arrow.
`src/games/loopy/cursor.ts` cites that requirement by title. The exception is
recorded only in `loopy`.
