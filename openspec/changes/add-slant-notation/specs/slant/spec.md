## ADDED Requirements

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

## MODIFIED Requirements

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
squares slant alike (a clue with one line left for exactly those two squares, or
both v-shapes of the pair ruled out, naming the 1, 3, 2 or diagonal that rules
each out). No mark SHALL be placed that no firing uses. No displayed step SHALL
be a generic, un-narrated fallback.

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
