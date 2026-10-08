# lightup Specification

## Purpose
Light Up (Akari), the puzzle of placing bulbs to light every blank square
without two bulbs lighting each other, meeting the counts on numbered walls.
This capability specifies its port to the TS engine, with live errors,
mistake-checking, an explained deductive hint drawn in the element-type legend,
and no tier below Unreasonable that requires guessing.

## Requirements

### Requirement: Light Up game implements the Game interface

The engine SHALL provide a registered `lightup` game implementing
`Game<LightupParams, LightupState, LightupMove, LightupUi, LightupDrawState>`:
place light bulbs on open squares of a `w × h` grid so that every open square
is lit (bulbs shine along rows and columns until blocked by a wall),
no bulb is lit by another bulb, and every numbered wall has exactly
that many orthogonally-adjacent bulbs. Params SHALL be `w`, `h`, `blackpc`
(percentage of walls), `symm` (none / 2-way mirror / 2-way rotational /
4-way mirror / 4-way rotational) and `difficulty` (Easy / Normal / Unreasonable),
encoded `{w}x{h}b{blackpc}s{symm}d{difficulty}` (short form `{w}x{h}`). All 9
upstream presets SHALL be offered. Decoding SHALL keep upstream's lenient
quirks: a bare `WxH` id demotes 4-way-rotational symmetry to 2-way-rotational
when `w ≠ h`, and the legacy `r` flag decodes as difficulty 2. `validateParams`
SHALL enforce minimum size 2×2, blackpc 5–100, 4-way symmetry only on
square grids of at least 3×3, and known symmetry/difficulty values. The game SHALL provide `solve` and `textFormat` and SHALL drive a
solve-completion flash.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 10, h: 10, blackpc: 20, symm: ROT2, difficulty: 1 }`
  are encoded in full
- **THEN** the result is `10x10b20s2d1` and decoding it round-trips the params

#### Scenario: Lenient decode quirks

- **WHEN** `18x10` is decoded with defaults carrying 4-way-rotational symmetry
- **THEN** the symmetry demotes to 2-way rotational
- **AND** a params string using the legacy `r` suffix decodes as difficulty 2

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given a 1-wide grid, a blackpc outside 5–100,
  or 4-way symmetry on a non-square grid
- **THEN** it returns a non-null error string

### Requirement: Light Up descriptions use the upstream run-length encoding

The desc SHALL encode the grid row-major, one character per wall
(`B` unnumbered, `0`–`4` numbered) with maximal runs of open squares
compressed as `a`–`z` (run of 1–26). `validateDesc` SHALL reject unknown
characters, short descs, and over-long descs. `newState` SHALL parse the desc
into wall and numbered flags and clue values with all open squares unlit.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and re-encoded
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** `validateDesc` is given a desc with an invalid character or a
  length not matching `w × h`
- **THEN** it returns a non-null error string

### Requirement: Light Up accepts pointer and cursor input

`interpretMove` SHALL reproduce upstream input: left-click toggles a bulb on
an open, unmarked square (clearing any mark when placing); right-click toggles
the impossible-mark on an open, bulb-less square (placing a mark removes any
bulb); clicks on walls and out-of-grid are no-ops; a left-click on a
marked square (and a right-click on a bulb) is rejected without a history
entry. Keyboard: arrow cursor movement (revealing the cursor), select/Enter
toggles a bulb, select2/`i` toggles a mark, with the same rejection rules.
Completion SHALL hide the cursor. Bulb and mark are mutually exclusive in
`executeMove`, which SHALL recompute lit counts; the board SHALL be reported
solved exactly while the grid is correct (all lit, no overlap, all clues
exact).

#### Scenario: Left-click places and toggles a bulb

- **WHEN** the player left-clicks an empty open square, then left-clicks it
  again
- **THEN** a bulb appears (lighting its row/column to the nearest
  walls) and then disappears

#### Scenario: Marks block bulbs

- **WHEN** the player left-clicks a square carrying an impossible-mark
- **THEN** no move is produced and no history entry is created

#### Scenario: Completion is detected

- **WHEN** a move leaves every open square lit, no bulb lit by another, and
  every clue exactly satisfied
- **THEN** `status` reports the board solved and the solve-completion flash
  plays

### Requirement: Light Up ships findMistakes

The game SHALL implement `findMistakes(state)`: re-solve the clues to the
unique solution and flag every player bulb on a square the solution leaves
bulb-less (`kind: "light"`) and every impossible-mark sitting on a solution
bulb position (`kind: "mark"`). A board without a unique solution yields `[]`.
Flagged squares SHALL render with a distinct error overlay that repaints on
the frame it is computed (sidecar in the render diff key).

#### Scenario: Check & Save flags a wrong bulb

- **WHEN** `findMistakes` runs on a board with a bulb where the unique
  solution has none
- **THEN** that square is returned as a mistake and rendered with the mistake
  overlay on the next redraw

#### Scenario: A merely-unhelpful mark is not flagged

- **WHEN** a mark sits on a square the solution leaves empty
- **THEN** it is not reported as a mistake

### Requirement: Light Up ships an explained deductive hint

The game SHALL implement `hint()` returning a plan of narrated steps computed
by the game's own solver techniques from the player's current position
(honoring placed bulbs and impossible-marks), refusing on a solved board and
on a board with detectable mistakes (coupling to the `findMistakes` overlay
and the banner). Each step SHALL name its technique and meet the Palisade
quality bar: lead with the recognizable indication, state why the move is
forced, conclude in the necessity voice, one deduction firing = one step (a
clue firing that forces several squares is one grouped multi-cell step). The
narrated techniques SHALL cover at minimum: forced-light (an unlit square
with one remaining way to be lit), clue-satisfied (a full clue crossing out
its remaining neighbors), clue-saturated (remaining bulbs = remaining
spaces), and the overlapping-set discount (a candidate square that would
extinguish every way to satisfy an unlit square or a clue). Steps that rule
squares out SHALL emit the game's impossible-mark move, so the accumulated
marks externalize the deduction state on the board. `hintKeepTrack` SHALL
classify a player's partial completion of a multi-cell step as on-track and
shrink the step in place. No displayed step may be a generic, un-narrated
fallback.

**A discount narration SHALL describe the set it is discounting as the
deduction counts it.** The set of squares one of which must hold a bulb
includes, for an unlit square, **that square itself** wherever a bulb could
still be placed there — it lights itself. Because the display marks that square
as the outlined dark square, apart from the other outlined squares, a narration
that says only the other outlined squares can light it names fewer candidates
than the deduction rests on, and is false on the boards where the dark square
is a member. The sentence SHALL therefore say which of the two it means, and
SHALL state the premise its
conclusion needs — that one of those squares must hold the bulb — rather than
leaving the reader to supply it.

#### Scenario: A forced bulb is explained

- **WHEN** the plan reaches a square with exactly one remaining way to be lit
- **THEN** the step's move places that bulb, and its narration names the
  unlit square and why every other candidate is gone, concluding with a
  necessity modal

#### Scenario: A satisfied clue groups its marks

- **WHEN** a clue already adjacent to its full bulb count has k > 1 free
  neighbors
- **THEN** one step emits one move marking all k squares impossible, narrated
  as a single deduction

#### Scenario: A discounted square's narration counts every candidate

- **WHEN** a discount step's rule-out set contains the outlined dark square
  itself, so that only the *remaining* members are the other outlined squares
- **THEN** the narration names the dark square itself alongside the other
  outlined ones as a place the bulb could go, rather than attributing the
  whole set to the other outlined squares

#### Scenario: Refusal on a wrong board

- **WHEN** `hint()` is invoked on a board where `findMistakes` is non-empty
- **THEN** it refuses with an error, and the mistake overlay is displayed

#### Scenario: The plan completes deductive boards

- **WHEN** the plan is computed on any generated Easy or Normal board
- **THEN** following it step-by-step solves the board with no un-narrated step

### Requirement: Light Up hint rendering follows the element-type legend

The displayed hint SHALL highlight, not perform: each target square SHALL be
ringed `COL_HINT` at its edge with no bulb/mark preview (bulb targets and mark
targets look identical; the narration says which action), so a bulb or cross
already on it stays visible. The deduction's evidence SHALL be drawn by what
it is: an evidence square no bulb lights SHALL be shaded `COL_HINT_CELL`; a
lit one SHALL keep its lit fill and take a doubled ring in `COL_HINT_LITERF`;
the unlit square the deduction is about SHALL take a doubled ring in
`COL_HINT_DARKREF`; and the driving clue SHALL be ringed at its wall's edge in
`COL_HINT_CLUE`, keeping its digit. Every hint bit SHALL participate in the
per-tile render cache diff key.

#### Scenario: Evidence is visible as an area

- **WHEN** a forced-light step is displayed
- **THEN** the target square is ringed `COL_HINT` with its content un-obscured
  and each unlit square of the corridor it reasons over renders
  `COL_HINT_CELL`

#### Scenario: A hint step's marks stay inside its evidence

- **WHEN** any grouped clue step is displayed
- **THEN** every target square lies within the narrated clue's neighbor set

### Requirement: No non-Unreasonable Light Up tier requires guessing

Light Up SHALL comply with the `ts-migration` narratable-deduction generation
policy: every difficulty tier offered under a name other than `Unreasonable`
SHALL generate only boards solvable by the narrated deductive techniques with
no recursion. The recursion-requiring top tier SHALL be offered as `Unreasonable`: it is
upstream's Hard tier under an honest name, renamed by `add-lightup-hint` as a
label change that left its generation untouched.
On boards of an `Unreasonable` tier the hint MAY narrate the deductive prefix
and then refuse honestly at the guess point.

#### Scenario: Deductive tiers are hint-complete

- **WHEN** a board is generated at a non-`Unreasonable` tier
- **THEN** the hint's narrated techniques solve it to completion

#### Scenario: The guess tier is honestly named

- **WHEN** a tier's boards require recursion to solve
- **THEN** that tier is offered only under the name `Unreasonable`

### Requirement: Light Up grades boards with a tiered deductive solver

Light Up's solver SHALL apply, at each difficulty: at Easy, forced-light ("this unlit square has exactly one
remaining way to be lit") and clue deductions (a satisfied clue marks its
remaining neighbors impossible; a clue whose remaining lights equal its
remaining spaces fills them); at Normal, additionally the overlapping-set
discount (every MAKESLIGHT set — from an unlit square or a `C(n, n−m+1)`
combination of a clue's free neighbors enumerated via the ported `Combi`
module — is tested against candidate MAKESDARK squares chosen by the upstream
minimum-rule-out heuristic, marking squares impossible), restarting the cheap
deduction sweep after the first successful discount; at Unreasonable, additionally
recursion on the most-illuminating candidate square, depth-capped at 5, with
unique-solution bookkeeping (recursion-limit hits propagate
"unknown" under force-unique; solution counts sum across branches). The solver
SHALL track which clue numbers it used, for generator stripping. The solver
SHALL be reused by `solve()` and `findMistakes`.

#### Scenario: Generated boards solve at exactly their difficulty

- **WHEN** a board generated at difficulty `d > 0` is solved
- **THEN** the solver succeeds with the difficulty-`d` technique set and fails
  (or needs recursion it is denied) with the difficulty-`d−1` set

#### Scenario: Solve recovers a solution from a dirty board

- **WHEN** `solve()` is invoked on a mid-game state containing wrong bulbs
- **THEN** it returns a move that leaves the board correctly and completely
  lit (solving from the current position when possible, else from the clean
  clues)

### Requirement: Light Up generates solver-gated boards

The generator SHALL build a board by symmetric
wall placement per the symmetry mode (including the center-square
random draw for odd 4-way-rotational grids), a correct random light placement
seeded by filling all open squares then removing lights via the marked-sweep,
numbering all walls, solver-gating at the target difficulty, stripping
unused numbers, removing surviving numbers one-by-one in the one-shot shuffled
order while the puzzle stays good, rejecting boards that are still solvable
one difficulty lower, and ramping `blackpc` by 5 (to at most 90) after 20
failed grids. Generation from a given seed SHALL be reproducible.

#### Scenario: Generation is reproducible from a seed

- **WHEN** `newDesc` is run twice for the same preset and seed
- **THEN** both runs produce the identical description

### Requirement: Light Up renders with live error feedback

`redraw` SHALL draw: walls (numbered ones showing their clue,
on a disc in the error color when the clue is provably wrong — too many adjacent
bulbs, or too few even if all plausible neighbors were filled); open squares
with lit squares filled yellow; bulbs as circles (error-colored when lit by
another bulb); impossible-marks as the collection's ruled-out cross — suppressed
on lit squares when the `show-lit-blobs` preference (default on, via the
`Game.prefs` hook) is off; the keyboard cursor; and the 3-phase completion
flash. The per-tile packed flags SHALL be the render cache key (`Int32Array`),
and every overlay not in the packed value (the `findMistakes` highlight) SHALL
be in a sidecar included in the diff key.

#### Scenario: Overlapping bulbs render as errors

- **WHEN** two bulbs light each other
- **THEN** both are drawn in the error color

#### Scenario: A provably-wrong clue turns red

- **WHEN** a numbered wall has more adjacent bulbs than its clue
- **THEN** its number is drawn on a disc in the error color

#### Scenario: Lit blobs honor the preference

- **WHEN** a marked square becomes lit and `show-lit-blobs` is off
- **THEN** the blob is not drawn (and reappears when the preference is
  re-enabled)

### Requirement: Light Up draws walls, bulbs and light on the collection's quiet surface

`redraw` SHALL draw an open square no bulb lights as the collection's cell
surface, with the collection's surface grid line between squares and a frame
round the grid no heavier than that line. A lit square SHALL keep its yellow
wash. A wall SHALL be a solid block in the collection's wall color, over its
whole tile, so that adjacent walls read as one block, with its clue in a white
that is the same in both schemes. A bulb SHALL be a disc in that same white,
outlined in a black that is the same in both schemes, so it reads on a lit and
an unlit square alike. The mark for a square that cannot hold a bulb SHALL be
the collection's ruled-out cross. The clue a hint reasons from SHALL keep its
white digit and be ringed at its wall's edge in the collection's evidence
color, with a line in the digit's white inside the ring. The game's words (its
help page and its Custom dialog) SHALL call the square a wall, never a black
square.

A clue that is provably wrong SHALL sit on a disc in the full error color,
which stands off a wall in both schemes, with its digit in that color's text
color, and a bulb another bulb lights SHALL be a disc in the full error color.
The
keyboard cursor SHALL be brackets at the corners of its square, clear of a
bulb. The completion flash SHALL blink the lit squares to the lifted surface.

#### Scenario: An unlit square is surface and a lit one is washed

- **WHEN** a board with one bulb is drawn
- **THEN** the squares the bulb lights are filled with the lit wash
- **AND** every other open square is the cell surface

#### Scenario: A wrong clue reads on its wall in the dark scheme

- **WHEN** a numbered wall has more adjacent bulbs than its clue
- **THEN** its number sits on a disc in the full error color, not that color's
  wash
