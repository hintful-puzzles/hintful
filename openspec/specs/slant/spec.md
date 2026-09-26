# slant Specification

## Purpose
Slant (Gokigen Naname), the puzzle of drawing a diagonal in every square so that
no loop forms and each numbered point meets that many lines. This capability
specifies its port to the TS engine, with live errors, its two preferences,
mistake-checking, and an explained deductive hint drawn in the element-type
legend.

## Requirements

### Requirement: Slant game implements the Game interface

The engine SHALL provide a registered `slant` game implementing
`Game<SlantParams, SlantState, SlantMove, SlantUi, SlantDrawState>`: fill
every square of a `w × h` grid with a `/` or `\` diagonal so that every
numbered vertex clue (0–4, on the `(w+1) × (h+1)` point grid) is met by
exactly that many incident diagonals and the diagonals form no closed loop.
Params SHALL be `w`, `h` and `diff` (Easy / Normal), encoded `{w}x{h}d{e|h}`
(short form `{w}x{h}`, square shorthand `{n}`). Six presets
(5×5, 8×8, 10×12 × Easy/Normal; upstream's 12×10 turned to draw taller than
wide) SHALL be offered. `validateParams` SHALL
enforce minimum size 2×2. The game SHALL provide `solve` and `textFormat` and SHALL drive a solve-completion flash suppressed
after Solve.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 12, h: 10, diff: DIFF_HARD }` (the Normal tier) are
  encoded in full
- **THEN** the result is `12x10dh` and decoding it round-trips the params

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given a 1-wide or 1-high grid
- **THEN** it returns a non-null error string

### Requirement: Slant descriptions use the upstream run-length encoding

The desc SHALL encode the `(w+1) × (h+1)` vertex-clue grid row-major, one
digit `0`–`4` per clue, with maximal runs of clueless vertices compressed as
`a`–`z` (run of 1–26, longer runs emitting `z` chunks). `validateDesc` SHALL
reject unknown characters, short descs, and over-long descs. `newState`
SHALL parse the desc into a clue grid shared (frozen) across all states of
the game, with all squares initially blank.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and re-encoded
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** `validateDesc` is given a desc with an invalid character or a
  clue count not matching `(w+1) × (h+1)`
- **THEN** it returns a non-null error string

### Requirement: Slant computes live errors and completion as upstream

`executeMove` SHALL recompute error state exactly as upstream
`check_completion`: every diagonal lying on a loop edge (per the shared
findloop helper over the vertex graph) is a loop error; every clue vertex
whose degree exceeds its clue or whose maximum achievable degree is below
its clue is a vertex error; every diagonal in the border-connected vertex
component is grounded. The board is complete when no errors exist and no
square is blank; the completed flag SHALL latch.

#### Scenario: A closed loop is flagged

- **WHEN** diagonals are placed forming a closed loop
- **THEN** each diagonal on the loop carries the loop-error flag

#### Scenario: An over-committed clue is flagged

- **WHEN** a vertex clue `1` has two incident diagonals
- **THEN** that vertex carries the vertex-error flag

#### Scenario: Completion latches

- **WHEN** the last blank square is filled consistently with all clues and
  no loop exists
- **THEN** the state reports completed

### Requirement: Slant input maps clicks, cursor and direct keys

`interpretMove` SHALL cycle a square blank→`\`→`/`→blank on left-click and
blank→`/`→`\`→blank on right-click, swapped when the `left-button`
preference selects `/`-first. Arrow keys SHALL move a cursor (revealing it
first), select/select2 SHALL cycle the cursor square in each direction, and
the literal keys `\`, `/` and backspace SHALL set/clear the cursor square
directly, returning no move when the square already holds that value.
Clicks outside the grid SHALL be ignored.

#### Scenario: Left-click cycles a square

- **WHEN** a blank square is left-clicked three times (default button
  order)
- **THEN** the square becomes `\`, then `/`, then blank

#### Scenario: Swapped button order

- **WHEN** the `left-button` preference is set to `/`-first and a blank
  square is left-clicked
- **THEN** the square becomes `/`

### Requirement: Slant ships findMistakes

`findMistakes(state)` SHALL re-solve the board's clues with the Normal solver
and, when a unique solution exists, return one mistake per square whose
placed diagonal differs from that solution (blank squares are never
mistakes), rendered with the existing red error styling, and one mistake, carrying
the side it sits on, per same-slant mark joining two squares whose solution slants
differ, drawn in the mistake color; it SHALL return an empty list when the board
is not uniquely solvable.

#### Scenario: A wrong diagonal blocks Check & Save

- **WHEN** a square holds the diagonal opposite to the unique solution and
  `findMistakes` runs
- **THEN** exactly that square is reported and rendered red

#### Scenario: Blank squares are not mistakes

- **WHEN** the board is partially filled with only correct diagonals
- **THEN** `findMistakes` returns an empty list

#### Scenario: A wrong mark is a mistake

- **WHEN** a same-slant mark joins two squares the solution slants differently
- **THEN** `findMistakes` reports that mark and the hint refuses

### Requirement: Slant exposes its two upstream preferences

The game SHALL expose via the `Game.prefs` hook: `left-button` (choices —
"Left \, right /" default, "Left /, right \") mapping to the click-cycle
swap, and `fade-grounded` (boolean, default off) fading diagonals in the
border-connected component to a dimmed color so unfixable loop candidates
stand out.

#### Scenario: Fade-grounded dims border-connected diagonals

- **WHEN** `fade-grounded` is enabled and a diagonal is connected to the
  border
- **THEN** it renders in the grounded color instead of its slash color

### Requirement: Slant ships an explained deductive hint

The game SHALL implement `hint()` returning a plan of narrated steps computed
by the game's own solver techniques from the player's current position (the
solver seeded with the placed diagonals and the player's same-slant marks),
refusing on a solved board and on a board with detectable mistakes (coupling to
the `findMistakes` overlay and the banner). The plan SHALL be computed with the
recorder off leaving the generator's solve path unchanged.

Each step SHALL name its technique and meet the Palisade quality bar: lead with
the recognizable indication, state why the move is forced, conclude in the
necessity voice. One deduction firing = one journey; a clue firing that forces
several squares SHALL be one multi-leg journey (`continuesPrevious` legs), not
several independent hints. A step SHALL rest only on diagonals, clues and
same-slant marks on the board: every equivalence a firing uses (a square taking
the slant of a placed square, or a clue counting two squares as one line) SHALL
cite the marks joining the two squares, and every such mark the board does not
show SHALL be placed by an earlier step of its own, narrated by why the two
squares slant alike (a clue with one line left for exactly those two squares, the
same clue at both ends of their shared side, or a straight line of 2s capped at
both ends by the same kind of limit, named as that pattern). No mark SHALL be
placed that no firing uses. No displayed step SHALL be a generic, un-narrated
fallback.

#### Scenario: A clue-counting firing is explained and grouped

- **WHEN** the plan reaches a clue whose remaining lines equal its remaining
  empty neighbors (or is already satisfied)
- **THEN** one journey fills all forced neighbors, its opening leg naming the
  clue and why the count forces the slant, concluding with a necessity modal,
  and continuation legs flagged `continuesPrevious`

#### Scenario: Loop and dead-end firings name the connectivity reason

- **WHEN** the plan reaches a square forced by simple loop avoidance or by
  dead-end avoidance
- **THEN** the step's narration explains that the ruled-out slant would close a
  loop (or seal points off from the grid's edge), and its evidence shades the
  connected chain / trapped components involved

#### Scenario: Refusal on a wrong board

- **WHEN** `hint()` is invoked on a board where `findMistakes` is non-empty
- **THEN** it refuses with an error and the mistake overlay is displayed

#### Scenario: The plan completes deductive boards

- **WHEN** the plan is computed on any generated Easy or Normal board
- **THEN** following it step-by-step solves the board with no un-narrated step

#### Scenario: An equivalence rests on a mark the plan placed

- **WHEN** the plan forces a square because it slants the same as a placed one
- **THEN** every mark the step cites is on the board when the step is shown
- **AND** each was placed by an earlier step saying why its two squares slant alike

### Requirement: Slant hint rendering follows the element-type legend

The displayed hint SHALL highlight, not perform: target square(s) ringed
`COL_HINT` blue with **no slash preview** (the diagonal is drawn only once
auto-hint applies the move), a mark the step places drawn in `COL_HINT`, the
deduction's evidence — the clue's neighborhood, the loop chain, the trapped
components, or the pairs a v-shape argument reads, computed against the board as
that step fires — outlined `COL_HINT_CELL`, the marks it cites drawn
`COL_HINT_CELL`, the clues it reads recolored `COL_HINT`, and a cited filled
anchor ringed `COL_HINT_REF`. Hint colors SHALL be appended past the upstream
color enum (the dark-mode overrides target other indices), and every hint bit
SHALL participate in the per-tile render-cache diff key.

#### Scenario: Evidence is visible as an area

- **WHEN** a clue-counting step is displayed
- **THEN** the target square(s) render `COL_HINT` with no slash drawn, the
  clue's digit recolors `COL_HINT`, and the reasoned neighborhood renders
  `COL_HINT_CELL`

#### Scenario: Every step carries visible evidence

- **WHEN** any step is displayed
- **THEN** it carries a non-empty evidence area, a ringed anchor, a clue it
  reads or a mark it cites, never a bare conclusion

### Requirement: Slant solves with a graded deductive solver

The solver SHALL apply the following deductions at each difficulty. At Easy: the clue-point counting deduction (a clue whose
remaining lines equal zero or its remaining undecided neighbors fills all
of them) and immediate loop avoidance (a square whose one orientation would
close a loop takes the other). At Normal, additionally: single-pair
equivalence tracking around clue points (two adjacent undecided
equivalent squares count jointly as one line; a 2-clue with two undecided
adjacent neighbors marks them equivalent), slash-value propagation through
equivalence classes, dead-end avoidance (never connect two non-border
vertex groups that each have at most one remaining exit), and the v-shape
bitmap deductions (placed slashes, 1-clues and 3-clues rule out v-shapes;
2-clues propagate ruled-out v-shapes to their far side; a square pair with
both v-shapes ruled out becomes equivalent). The solver SHALL return
impossible / unique / non-converged verdicts. The solver SHALL be reused by `solve()` and `findMistakes`.

#### Scenario: Generated boards solve at exactly their difficulty

- **WHEN** a board generated at Normal is solved
- **THEN** the Normal solver reaches the unique solution
- **AND** the Easy solver fails to converge on it

#### Scenario: Solve recovers from a wrong mid-game state

- **WHEN** `solve()` runs against a state containing wrong diagonals
- **THEN** the returned move list yields the unique solution

### Requirement: Slant generates solver-gated boards reproducibly

`newDesc` SHALL generate the same board for the same seed, by filled-grid growth over a shuffled square order (forced by the
vertex DSF where a loop would form, otherwise one `random_upto(rs, 2)`
draw), full clue derivation, a single clue-index shuffle, two-pass
solver-gated clue removal (pass 0 removes obvious starting points — 4s, 0s,
border 2s, corner 1s, or everything at Easy — pass 1 the rest), and
regeneration while the board is solvable one difficulty level down.

#### Scenario: Generation is reproducible from a seed

- **WHEN** `newDesc` runs twice with the same params and seed
- **THEN** both runs emit the identical Slant description

### Requirement: Slant renders diagonals, clues, errors and the completion flash

`redraw` SHALL render: chessboard-colored thick diagonals (color parity
`(x^y)&1`), grid lines, corner dots where neighboring squares' diagonals
meet the tile, clue circles with parity-colored rings and ink numbers,
red error coloring for loop-edge slashes (including their corner dots) and
unmet clue circles, a filled-square background tint, the cursor highlight,
the grounded fade (per pref), and the upstream 3-phase completion flash.
The drawstate SHALL diff a `(w+2) × (h+2)` packed `Int32Array` covering the
border ring, with the findMistakes overlay carried in the diff key (a
packed bit of the per-frame-rebuilt word).

#### Scenario: A mistake overlay repaints an unchanged tile

- **WHEN** a tile is painted, `findMistakes` flags it, and `redraw` runs
  again with no tile change
- **THEN** the second paint renders the red mistake styling

#### Scenario: Border clue circles draw

- **WHEN** a clue sits on the outer border of the point grid
- **THEN** the border-ring tile pass draws its circle and number

### Requirement: Slant notes mode marks squares that slant alike

The game SHALL offer a same-slant mark between any two squares that share a
side, stored per square as a mark to the right and a mark below, and set or
cleared by an absolute `alike` move so that replaying one is harmless. Notes mode
(`ui.pencilMode`) SHALL be toggled by the collection's Marks key, which SHALL be
the only key on Slant's keypad, and while it is on the pencil indicator SHALL show
at `pencilIndicatorBox`. In notes mode a press of any button SHALL toggle the mark
on the side of the pressed square nearest the press, and SHALL do nothing when
that side is the board's outer edge; Enter or Space SHALL pin the cursor square,
toggle the mark between the pin and a square beside it, let go of the pin when
pressed on it, and move the pin when pressed elsewhere, and Escape SHALL let go of
a pin. With notes mode off, input SHALL be unchanged. A mark SHALL be drawn as two
short bars across the middle of the shared side in the pencil color.

#### Scenario: A tap marks the nearest shared side

- **WHEN** notes mode is on and a square is pressed near its right side
- **THEN** the move toggles the mark between that square and its right neighbor
- **AND** a press near the same side from the neighbor toggles the same mark

#### Scenario: The keyboard pins and pairs

- **WHEN** notes mode is on, Enter is pressed on a square, the cursor moves to
  the square below and Enter is pressed again
- **THEN** the move sets the mark between the two squares and the pin is released

#### Scenario: Saves from before marks still load

- **WHEN** a move log holding only diagonals is replayed
- **THEN** it produces the same board, with no marks
