# Verdicts: fifteen

## reword `fifteen`: A Fifteen hint step says whether its slide places a tile home

The requirement told of two kinds of step and the hint speaks five
(`FIFTEEN_RUNGS` and `narrateFifteenStep` in `src/games/fifteen/index.ts`,
the sentences in `hint-text.ts`): the goal into place, the goal closer, the
goal back a step, another tile into place, another tile out of the way. A
hint's words stay in the spec, so the two the text left out are stated, and
the reason the goal is held, which lived only in a code comment, is given in
a clause. Every rule and scenario that was there is kept; one scenario is
added for the goal sliding away from home.

### Requirement: A Fifteen hint step says whether its slide places a tile home

Each step's narration SHALL name the goal tile it works toward its home: one
tile, held until it is home, so a restoration reads as part of one goal. A
slide of the goal SHALL say it slides into place, closer, or back a step, as
it lands home, nearer or further. A slide of another tile SHALL say that tile
slides into place only where it lands in its solved cell and no later slide of
the plan moves it, and otherwise that it slides out of the way.

#### Scenario: Narration distinguishes a home move from a setup move

- **WHEN** a step lands a tile in its solved cell, and no later step of the
  plan slides that tile
- **THEN** its narration states that the tile is being placed home
- **WHEN** a step only maneuvers (it does not land a tile in its solved cell)
- **THEN** its narration states it is a setup move and names the goal tile
  being worked toward its home

#### Scenario: The goal slides away from its home

- **WHEN** a step slides the goal tile one cell further from its solved cell
- **THEN** it says the goal slides back a step, leaving the hole between it and
  its home, and a step that slides it nearer says it slides closer

#### Scenario: A tile carried through its own home

- **WHEN** the gap's way round carries a tile into its solved cell and a later
  step of the plan slides it out again
- **THEN** the step says that tile slides out of the way

#### Scenario: The goal stays through a restoration

- **WHEN** placing the last tile of a line displaces a tile already home and
  slides it back
- **THEN** every step of that rotation names the same goal tile, and the slide
  back says the displaced tile slides into place

#### Scenario: A placed goal that the next rotation displaces

- **WHEN** a goal tile is home and the rotation placing the next tile of its
  line slides it away and back
- **THEN** the step that first homed it said it slides into place, and the
  slide back says so again

## reword `fifteen`: Fifteen's hintKeepTrack completes on the hinted slide alone

"Advancing the plan" and "dropping the plan so the next request recomputes it"
are what the midend does with each verdict, for every game: `engine-hints`, "A
player move is classified against the stored plan". They go. Fifteen's own
rule is which verdict it gives, and that it never answers `"onTrack"`, which
is now said outright.

### Requirement: Fifteen's hintKeepTrack completes on the hinted slide alone

`hintKeepTrack` SHALL return `"completed"` for a player move that produces
exactly the board the current step expects, and `"off"` for any other move. It
SHALL never return `"onTrack"`.

#### Scenario: The hinted slide completes the step and any other is off

- **WHEN** the player makes exactly the move the current step describes
- **THEN** `hintKeepTrack` reports the step completed
- **AND** a different move reports `"off"`

## reword `fifteen`: A Fifteen tile stands off the well it slides in

"Color 0 SHALL stay the board" goes. Which palette slot holds the board is how
the palette is laid out, and the shared rules already fix it: `engine-colors`,
"The app reads a game's scheme handling from the game", gives a game that
declares no board color 0 as its board (Fifteen's `paletteScheme` in
`src/games/fifteen/render.ts` declares only its bevel swap), and "Every
game's board sits at one tone" holds the value at that slot for every game.
What the player sees, the tile lifted and the gap darker than the board, is
kept.

### Requirement: A Fifteen tile stands off the well it slides in

`redraw` SHALL draw a tile's face as the collection's lifted surface inside its
bevel, and the gap, with whatever a sliding tile uncovers, as the collection's
cell surface, so a tile is told from the well by more than its bevel in both
schemes. The tile SHALL keep its bevel: it is an object the player moves.

#### Scenario: A tile is not the board's gray

- **WHEN** a board is drawn at rest in either scheme
- **THEN** every tile's face is the lifted surface
- **AND** the gap is the cell surface, darker than the board around the grid

## keep `fifteen`: Fifteen offers a greedy full-solution hint plan

The clause "with a fixed shortest-move table for the end-of-line corner" is
part of the hint's technique and its order, which never go. Without it the
requirement says every tile is walked toward its home one at a time, and that
is false at the end of a line: there the solver places the last two tiles
together (`nextPiece2` and `nextMove3x2` over `MOVE_3X2` in
`src/games/fifteen/solver.ts`), displacing a tile already home and sliding it
back. That is the rotation the narration requirement's two restoration
scenarios describe, and this clause is the only statement of why it happens.

## reword `fifteen`: Fifteen is solved when its tiles read in order with the gap last

The sentence that there is no `findMistakes` hook goes as `declared`:
`notApplicable.findMistakes` in `src/games/fifteen/index.ts` holds the reason
as a sentence the help page shows, and `ts-engine`, "A not-applicable reason
is a fact about the puzzle", takes Fifteen's as its own example. The sentence
before it, that the game provides `statusbarText`, `solve` and `textFormat`,
goes with it as `type`: the game object says which hooks it has. The rule of
the puzzle and what counts as solved are untouched.

### Requirement: Fifteen is solved when its tiles read in order with the gap last

The board SHALL be a `w×h` grid of numbered tiles with one empty gap, solved
when the tiles read `1..n-1` in row-major order with the gap last.

#### Scenario: The board is solved exactly when its tiles are in order

- **WHEN** a `4x4` board's tiles read `1` to `15` in row-major order with the
  gap in the last cell
- **THEN** the game reports it solved
- **AND** a board one slide away from that arrangement is reported as not
  completed

## reword `fifteen`: A click slides only along the gap's row or column

"With the default arrow semantics" goes: there is one meaning, not a default.
`FifteenUi.invertCursor` (`src/games/fifteen/state.ts`) is always `false`,
nothing sets it and no preference exposes it, so the spec should not read as
though a second setting existed. What an arrow does is unchanged.

### Requirement: A click slides only along the gap's row or column

`interpretMove` SHALL produce a slide from a click only when the target cell
shares exactly one coordinate with the current gap: a click sharing zero or
both coordinates, or out of bounds, SHALL produce nothing. Cursor keys SHALL
slide the adjacent tile into the gap immediately: the pressed arrow moves a
tile in that direction.

#### Scenario: Click geometry constrains legal slides

- **WHEN** a click targets a cell diagonal to the gap (sharing neither
  coordinate), or the gap's own cell (sharing both)
- **THEN** no move is produced

#### Scenario: An arrow moves a tile, not the gap

- **WHEN** the gap is in the bottom-right corner and the Down arrow is pressed
- **THEN** the tile above the gap slides down into it

## note `FifteenUi.invertCursor` is a dead field with a false comment

`src/games/fifteen/state.ts` keeps upstream's arrow-sense preference as a
field that is always `false`, with the comment "because the engine has no
preferences hook to expose it". The engine has had one for some time
(`ts-engine`, "The engine supports per-game user preferences"). Either the
preference is offered, which is a new control and the owner's to want, or the
field, its branch in `interpretMove` and the three test literals go. I
recommend deleting it: no one has asked for the inverted sense, and the spec
no longer implies it.

## note `sixteen` and `twiddle` carry the same "Color 0" sentence

`sixteen` "A Sixteen tile stands off the board" ends "Color 0 SHALL stay the
board" and `twiddle` "A Twiddle tile stands off the well it turns in" ends
"Color 0 stays the board". No entry named them, so they are untouched, but
the reason the sentence leaves Fifteen's requirement holds for both.
