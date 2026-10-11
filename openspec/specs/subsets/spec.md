# subsets Specification

## Purpose
Subsets, the puzzle of placing every set of letters into a grid once, so that
the horseshoe symbols between neighbors state every superset relation there is.
It has an explained hint, a notation for ruling a set out of a cell, and a
two-way reference aid that shows, from the visible board alone, where a set can
go and what a cell can hold.

## Requirements

### Requirement: Subsets is solved when every set is placed once and every clue holds

The game SHALL be solved when every set is placed exactly once and every clue
holds. A horseshoe between two neighbors says that one cell's set contains the
other's; two neighbors with no horseshoe between them SHALL hold sets neither
of which contains the other.

#### Scenario: Completing the grid wins and flashes

- **WHEN** every set is placed exactly once so that all clues hold
- **THEN** the game is reported solved and flashes

### Requirement: Subsets' parameters

Parameters SHALL be a width, a height, a universe size `n` and a difficulty
tier. Validation SHALL accept only `4×4` with `n = 4`. There SHALL be one
preset per tier. A game ID SHALL encode the width, height, universe size and
tier and round-trip through decode, and each tier SHALL encode to a *distinct*
ID. A game ID whose difficulty character names no tier SHALL be refused, and
SHALL NOT be played at another tier in its place.

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded to a game ID and decoded
- **THEN** the same width, height, universe size and tier are recovered

#### Scenario: Unsupported parameters are rejected

- **WHEN** parameters other than `4×4` with `n = 4` are validated
- **THEN** they are rejected: "Currently only 4x4 puzzles are supported."

#### Scenario: An unrecognized difficulty character is rejected

- **WHEN** a game ID carries a difficulty character naming no tier
- **THEN** validation rejects it, rather than falling back to another tier

### Requirement: The Custom dialog offers the tier alone

A Custom-parameters dialog SHALL be offered for the tier alone: the board
shape has exactly one legal value, so the tier is the only field.

#### Scenario: The dialog is opened

- **WHEN** the Custom dialog is opened for Subsets
- **THEN** it holds one field, the difficulty, and none for the width, the
  height or the universe size

### Requirement: Subsets descriptions use the per-cell arrow encoding

A Subsets description SHALL encode the grid in row-major order as one
comma-separated token per cell: a decimal set number for a given cell or an
underscore for a blank cell, immediately followed by any of the arrow markers
`U`, `R`, `D`, `L` for the horseshoe clues leaving that cell.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a board
- **THEN** re-encoding that board yields the identical description

### Requirement: A Subsets description is validated

Validation SHALL reject a description that carries more or fewer cells than
the grid holds (distinguishing which), that contains a set number out of range
for the universe, that omits a required separator, that uses an unexpected
character, that places an arrow pointing off the grid, or that places two
arrows on one edge which contradict each other.

#### Scenario: A description with the wrong number of cells is rejected

- **WHEN** a description carrying more or fewer cells than the grid has is
  validated
- **THEN** it is rejected with a message distinguishing too much data from too
  little

#### Scenario: Contradicting arrows on one edge are rejected

- **WHEN** a description places an arrow from a cell to its neighbor and the
  opposite arrow from that neighbor back
- **THEN** the description is rejected as contradictory

### Requirement: Subsets is played by toggling letter slots

Subsets SHALL be played by toggling individual letter slots within each cell.
A left-click or select SHALL cycle a slot unknown → known → cleared → unknown,
a right-click or secondary select SHALL cycle unknown → cleared → known →
unknown, and Backspace SHALL reset a slot to unknown. A given (immutable) slot
SHALL NOT change.

#### Scenario: Toggling a letter slot cycles its state

- **WHEN** a mutable letter slot is left-clicked repeatedly
- **THEN** it advances unknown → known → cleared and back to unknown, and a given
  slot does not change

### Requirement: The keyboard cursor walks the letter slots

A keyboard cursor SHALL navigate the letter slots, skipping the gaps between
cell blocks.

#### Scenario: The cursor crosses from one cell to the next

- **WHEN** the cursor is on the right-hand slot of a cell that has a cell to its
  right, and Right is pressed
- **THEN** it rests on the left-hand slot of that next cell, never on the gap
  between the two

### Requirement: Subsets flags mistakes for Check & Save

The game SHALL flag as mistakes for Check & Save: a set-value placed in more
than one cell; any
edge whose horseshoe relation, or missing-horseshoe disjointness relation, is
violated by two decided cells; and, when the board has a unique solution, any
letter marked or crossed out against that solution, and any
set ruled out of the cell that solution puts it in, each of which SHALL be
drawn in the mistake color.

#### Scenario: A duplicated placement is flagged as a mistake

- **WHEN** the same set-value is fully placed in two cells and mistakes are checked
- **THEN** both offending cells are reported as mistakes

#### Scenario: A wrong rule-out is a mistake

- **WHEN** a set is ruled out of the cell the unique solution puts it in
- **THEN** `findMistakes` reports that rule-out and the hint refuses

#### Scenario: A wrong letter that breaks no rule

- **WHEN** on `13RD,_,6R,_,_,_,_D,_UL,_R,12D,_,_DL,_UR,_,3U,10`, whose solution
  puts {D} in the second cell, B is marked present there and Check & Save is
  pressed
- **THEN** one mistake is reported, the B is drawn in the mistake color, and
  the board is not saved

#### Scenario: A wrong cross

- **WHEN** a letter the solution holds in a cell is crossed out there
- **THEN** `findMistakes` reports that slot, and its cross is drawn in the
  mistake color

### Requirement: What Subsets draws

The board SHALL be formattable as text. Rendering SHALL show each cell's
letter slots, the horseshoe arrows, a tally of every set-value that tells
whether it is placed never, once or more than once, and a completion flash.
There SHALL be no move animation.

#### Scenario: A set placed twice shows in the tally

- **WHEN** the same set is fully placed in two cells
- **THEN** its tally entry is drawn in the mistake color, unlike an entry placed
  once or not at all

### Requirement: Subsets provides an explained hint

Subsets SHALL implement `hint()`, planning from the player's current marks and
rule-outs and narrating each firing as the deduction that forces it. A hint on
a board that contradicts its own clues SHALL be refused, pointing at the
mistakes.

#### Scenario: A hint narrates an arrow deduction

- **WHEN** a hint is requested on a board where a horseshoe forces a letter
- **THEN** the explanation names the arrow relation that forces it, not just the
  letter to write

#### Scenario: A hidden single is shown with its placement spotlight

- **WHEN** a set has exactly one cell it can still legally occupy
- **THEN** the hint places it there and spotlights that cell as the only
  candidate

#### Scenario: A mistaken board is refused honestly

- **WHEN** a hint is requested on a board contradicting its own clues
- **THEN** the hint refuses and points at the mistakes instead of deducing from
  a wrong position

### Requirement: The hint narrates every deduction the solver may use

The recorder SHALL be able to narrate every deduction the solver may use,
including the rules available only above the lowest tier: a board whose tier
the recorder cannot reach stalls mid-plan with nothing to say.

#### Scenario: A board above the lowest tier is fully narratable

- **WHEN** a hint plan is computed from the opening position of a board
  generated above the lowest tier
- **THEN** the plan reaches a complete solution, and the same recorder capped
  one tier lower does not

### Requirement: The hint reaches for the higher rules last

The rules available only above the lowest tier SHALL be reached for **only
once the cheaper rules are exhausted**, so a board at the lowest tier is
planned exactly as a recorder lacking them would plan it. That equivalence
SHALL be asserted by comparison against a capped recorder, not assumed:
running a stronger rule unconditionally is sound and still silently re-plans
easier boards.

#### Scenario: The lowest tier's plan is unchanged by the higher rules

- **WHEN** a board at the lowest tier is planned by the full recorder and by one
  capped below the higher rules
- **THEN** both produce the same firings, in the same order

### Requirement: A hint step rests only on what the board shows

A step SHALL rest only on what the board shows: letters, rule-outs, horseshoes
and placed sets. Each step's highlights and claims SHALL be read off the board
as that step is shown.

#### Scenario: A collapse's survivors agree on the letters

- **WHEN** a step decides a cell's letters because only some sets can still go
  in it
- **THEN** the sets the tally shows for the cell at that step all agree on those
  letters

### Requirement: A firing's rule-outs are placed before it

Every set a firing needs gone from a cell that the board does not already rule
out SHALL be ruled out by an earlier step of its own, in the same journey,
narrated by the horseshoe that leaves it no partner: no set the neighbor across
it can still hold is a smaller set inside it (or a bigger set holding it).
Every set that step's own premise needs gone SHALL be ruled out before it, and
no rule-out SHALL be placed that no firing uses.

#### Scenario: A collapse rests on rule-outs the plan placed

- **WHEN** the plan decides a cell's letters because only some sets can still go
  in it, and the board alone does not rule the others out
- **THEN** each set it needs gone is ruled out by an earlier step in the same
  journey, naming the horseshoe and boxing the sets the neighbor can still hold
- **AND** when the letters are decided, the sets the tally shows for the cell all
  agree on them

### Requirement: Subsets offers a two-way placement reference aid

Subsets SHALL let the player explore where sets and cells can go, judged
shallowly from the visible board and never from a solver or the solution. The
judgment SHALL read a cell's own marks and rule-outs, the horseshoe and
missing-horseshoe relations to decided neighbors, that the empty set and the
full set need every edge of their cell to point the one way, and the
exactly-once rule.

#### Scenario: A rule-out leaves the cell's list

- **WHEN** the player rules a set out of the cell in focus
- **THEN** that set is no longer highlighted as one the cell could hold, and no
  longer spotlights the cell

### Requirement: Selecting a set shows where it can go

Selecting a **set** from the tally band, with no undecided cell in focus, SHALL
spotlight every cell it can still legally go in. If the set is already placed,
its home cell SHALL be shown in a distinct color: where it *is*, versus where
it could go.

#### Scenario: Spotlighting a set's placements

- **WHEN** the player clicks an unplaced set in the tally band
- **THEN** every cell where that set could still legally go is spotlit, and
  clicking it again clears the spotlight

#### Scenario: A placed set shows where it sits

- **WHEN** the player clicks a set that is already placed
- **THEN** its home cell is highlighted in the distinct "placed" color, not the
  "could go here" spotlight color

### Requirement: Focusing a cell shows the sets it can hold

Focusing a **cell** SHALL highlight in the tally every set that cell could
still hold. A cell SHALL be focused by its dedicated inspect icon, or by moving
the keyboard cursor onto it. The icon SHALL be a touch-sized badge in the
margin above the cell block, and SHALL do nothing but inspect, never editing.

#### Scenario: A cell shows the sets it can still hold

- **WHEN** the player taps an undecided cell's inspect icon
- **THEN** every set that could still legally go in it is highlighted in the
  tally band, and nothing about the cell is edited

### Requirement: The aid's two directions are exclusive and ephemeral

The two directions of the reference aid SHALL be mutually exclusive, the
spotlight SHALL update as the board changes, and all of the aid SHALL be
ephemeral UI state, never persisted.

#### Scenario: Inspecting a cell replaces a set's spotlight

- **WHEN** a set is spotlit and the player taps a cell's inspect icon
- **THEN** the set's spotlight is gone and the tally shows the sets that cell
  could hold

### Requirement: Touching the reference aid dismisses a displayed hint

Because the aid and a hint draw in the same overlay space, touching the aid
while a hint is displayed SHALL dismiss the hint and its status text, so the
aid is shown and not silently suppressed. The exception SHALL be a hint step
that rules a set out of a cell, which SHALL stay: following it by hand starts
with that cell's inspect icon.

#### Scenario: The reference aid dismisses a displayed hint

- **WHEN** the player interacts with the reference aid while a hint step that
  marks a letter is on display
- **THEN** the hint is dismissed and the aid is shown

#### Scenario: A rule-out step is followed by hand

- **WHEN** the displayed hint step rules a set out of a cell and the player taps
  that cell's inspect icon
- **THEN** the hint stays on display

### Requirement: Subsets solves by candidate elimination

Subsets SHALL provide a solver that reports whether a board is complete,
unfinished or invalid, driven by a candidate-elimination fixpoint over the set
of possible set-values per cell. It SHALL apply arrow propagation (a superset
cell contains its subset neighbor's confirmed letters, and a subset cell cannot
hold letters its superset lacks), missing-arrow disjointness, single-count and
single-position placement, and the advanced arrow-subset elimination.

#### Scenario: The solver classifies a board

- **WHEN** a solvable board, an ambiguous board and a rule-violating board are each
  solved
- **THEN** the solver reports complete, unfinished and invalid respectively

### Requirement: The solver takes an explicit difficulty cap

The grading solver, `subsetsSolveGame`, SHALL take an explicit difficulty cap,
with no default: an implicit cap is how a caller silently measures a tier it
did not mean. At the lowest tier the rule set SHALL be upstream's compiled
strength exactly, without upstream's disabled advanced-rule branch. `solve`,
`findMistakes` and `hint` SHALL run at the top tier whatever tier the board
states, and `solve` SHALL refuse a board that leaves unfinished.

#### Scenario: A lowest-tier board is solved at the lowest cap

- **WHEN** a board generated at the lowest tier is solved with the cap named as
  the lowest tier
- **THEN** the solver reaches a complete solution

#### Scenario: Solve on a board dealt at the lowest tier

- **WHEN** Solve is asked for on a board whose ID states the lowest tier
- **THEN** the solver runs with the top tier's rules and the board is filled

#### Scenario: A board whose arrows settle nothing

- **WHEN** `solve` is given a board with no givens, which no tier finishes
- **THEN** it returns "This puzzle's solution can't be determined." and no
  partly filled board

### Requirement: The higher tier adds the mirror half of the advanced arrow rule

Above the lowest tier the solver SHALL additionally apply the **mirror half**
of the advanced arrow rule: where an arrow forces `set(head) ⊂ set(tail)`, a
surviving candidate at the head that fits inside no surviving candidate at the
tail SHALL be eliminated.

#### Scenario: A board above the lowest tier needs its tier

- **WHEN** a board generated above the lowest tier is solved with the ladder
  capped one tier below it
- **THEN** the solver does not reach a complete solution

### Requirement: The mirror elimination is sound

The mirror elimination SHALL never remove a set-value that the board's own
solution places in that cell: a puzzle whose one solution the solver has ruled
out is worse than a weak solver. Soundness SHALL be checked against the
generator's known assignment, and SHALL NOT be checked against the other cap.

#### Scenario: The restored elimination never removes the true answer

- **WHEN** a generated board is re-solved from its description with the ladder at
  its top
- **THEN** the solved board matches, cell for cell, the assignment the generator
  blanked to produce it

### Requirement: Subsets generates uniqueness-gated boards

The generator SHALL assign every set-value to the grid by a single shuffle,
derive all arrow clues from the subset relation, then blank cells in a shuffled
order, keeping a cell blank only while the solver, capped at the requested
tier, still reaches a complete solution.

#### Scenario: A cell the capped solver needs stays given

- **WHEN** blanking a cell leaves a board the solver, capped at the requested
  tier, does not complete
- **THEN** that cell is given again, and the blanking goes on to the next

### Requirement: A board above the lowest tier is not solved by the tier below

Above the lowest tier the generator SHALL also reject a candidate board that
the tier below already solves, and SHALL redraw a wholly fresh board, not
perturb the rejected one: every candidate consumes fresh randomness, so a plain
retry cannot re-derive what it rejected.

#### Scenario: A candidate the lower tier solves is thrown away

- **WHEN** a board is generated above the lowest tier
- **THEN** the solver capped one tier below it does not reach a complete
  solution, and the solver capped at its own tier does

### Requirement: Subsets players can rule a set out of a cell

The game SHALL let the player rule any set-value out of any cell, stored per
cell as a set of ruled-out set-values and set or cleared by an absolute `rule`
move so that replaying one is harmless. With an undecided cell in focus in the
reference aid, a press on a tally entry SHALL rule that set out of the cell, or
take the rule-out back; with no cell in focus, or a decided one, it SHALL
spotlight the set.

#### Scenario: A tally press rules a set out of the cell in focus

- **WHEN** an undecided cell is in focus and a tally entry is pressed
- **THEN** the move rules that set out of the cell, and pressing it again takes
  the rule-out back

#### Scenario: Saves from before rule-outs still load

- **WHEN** a move log holding only letter moves is replayed
- **THEN** it produces the same board, with nothing ruled out

### Requirement: The keyboard reaches the tally band

The keyboard cursor SHALL move from the grid's bottom row down into the tally
band, keeping the cell in focus. In the band the arrows SHALL move between
entries, Enter or Space SHALL press the entry, Backspace SHALL take a rule-out
back, and Up from the band's top row SHALL return to the grid.

#### Scenario: The keyboard reaches the tally

- **WHEN** the cursor is on the grid's bottom row, Down is pressed and then Enter
- **THEN** the cursor is in the tally band and the entry under it is ruled out of
  the cell in focus

### Requirement: The tally strikes through what is ruled out of its cell

While a cell is in focus, or a hint step is about it, the tally SHALL draw
every set ruled out of that cell struck through.

#### Scenario: A rule-out is struck through while its cell is in focus

- **WHEN** a set is ruled out of the undecided cell in focus
- **THEN** the set's tally entry is drawn struck through while the cell is in
  focus

### Requirement: A slot's surface says who decided its cell

`redraw` SHALL draw every letter slot of a cell the player fills on the
collection's cell surface, and every slot of a cell whose set the puzzle gave
on the collection's lifted surface of a given, with the collection's surface
grid line between the slots of a cell.

#### Scenario: A given cell is told by the surface under it

- **WHEN** the opening frame is drawn
- **THEN** every slot of a given cell is the lifted surface and every other
  slot is the plain cell surface

### Requirement: Subsets tells a slot's state by a letter, a cross or nothing

A slot's state SHALL be what it holds and never the surface under it: a letter
marked present is drawn, in ink for a given and in the entry color for the
player's; a letter cleared holds the collection's ruled-out cross; an unknown
slot holds nothing. No state SHALL be told by a step of gray.

#### Scenario: A cleared letter holds the cross

- **WHEN** the opening frame is drawn
- **THEN** each letter absent from a given set holds the ruled-out cross, and no
  unknown slot holds one

### Requirement: The completion flash lifts every slot

On a lit beat of the completion flash every slot SHALL take the lifted surface
and keep its letter or cross.

#### Scenario: The flash lifts every slot

- **WHEN** a solved board is drawn on a lit beat of the flash
- **THEN** no slot is the plain cell surface
- **AND** on the next unlit beat the player's slots are the plain surface again

### Requirement: A used-up entry takes the used-up clue color

A tally entry placed once and the idle inspect badge SHALL be drawn in the
collection's color for a clue that is used up.

#### Scenario: A set is placed once

- **WHEN** a set is fully placed in exactly one cell
- **THEN** its tally entry is drawn in the color for a clue that is used up

### Requirement: A Subsets set number adds up its letters, and an arrow is written on the bigger set's cell

A given cell's number SHALL be the sum of its set's letters, A as 1, B as 2, C
as 4 and D as 8, so that 0 is the empty set. An arrow letter SHALL be written
on the cell whose set contains its neighbor's, and SHALL name the side that
neighbor is on. A cell's arrow letters SHALL come in the order `U`, `R`, `D`,
`L`, each at most once. `newState` SHALL refuse arrow letters in another
order, and a set given to two cells.

#### Scenario: A dealt board is read

- **WHEN** `13RD,_,6R,_,_,_,_D,_UL,_R,12D,_,_DL,_UR,_,3U,10` is read
- **THEN** the top-left cell is given the set {A,C,D}, which contains the set
  of the cell to its right and the set of the cell below it
- **AND** the third cell is given {B,C} and the last cell {B,D}

#### Scenario: Letters out of order, and a set given twice

- **WHEN** the `13RD` of that description is changed to `13DR`, or its `6R` to
  `13R`
- **THEN** the first is refused as having an `R` where it cannot have one, and
  the second as giving the same number twice

### Requirement: Subsets params are written `4x4n4` and a difficulty letter

`encodeParams` SHALL write the width, `x`, the height, `n` and the universe
size, and in the full form `d` and the tier's letter after them: `e` for Easy
and `t` for Normal. `decodeParams` SHALL read a width with no `x` as a square,
a string with no `n` as four letters, and a string with no `d` as Easy.

#### Scenario: The Normal preset and its short form

- **WHEN** the Normal preset is encoded in full and without the difficulty
- **THEN** the results are `4x4n4dt` and `4x4n4`
- **AND** `4x4n4` decodes as the Easy board

### Requirement: A Subsets preset is titled by its board and its tier

Each preset SHALL be titled `4x4 Size 4` and then its tier's name, where Size
is the number of letters the sets are drawn from.

#### Scenario: The Type menu

- **WHEN** the presets are listed
- **THEN** they read "4x4 Size 4 Easy" and "4x4 Size 4 Normal", for the params
  `4x4n4de` and `4x4n4dt`

### Requirement: The Subsets hint carries a letter across a horseshoe

Where a letter is marked present in the cell at a horseshoe's closed end and
not in the cell at its open end, a step SHALL mark it present there ("…has C
marked, so C must be here too"). Where a letter is cleared at the open end and
not at the closed end, a step SHALL clear it there ("…which has no B, so B
can't be here either"). The step SHALL ring the letter it decides and outline
the cell across the horseshoe, and several letters from one horseshoe SHALL be
one journey.

#### Scenario: A given set clears a letter from the cell inside it

- **WHEN** a hint is asked for on
  `13RD,_,6R,_,_,_,_D,_UL,_R,12D,_,_DL,_UR,_,3U,10` with nothing marked
- **THEN** the first step clears B in the second cell of the top row, whose
  set lies inside the top-left cell's {A,C,D}

### Requirement: The Subsets hint reads the horseshoes before it counts sets

`hint` SHALL take the first of these that decides a letter, and begin again
after each: a horseshoe, taken by its open-end cell in reading order, a letter
to mark present there before one to clear across it; a set no cell holds that
the board lets into one cell only, lowest number first, placed there; a cell
whose remaining sets agree on a letter; a set whose remaining cells are one.
The last two SHALL be tried without the rule above the lowest tier before they
are tried with it.

#### Scenario: A horseshoe is read while a set has one cell left

- **WHEN** a board shows both a letter that a horseshoe carries across and a
  set that can go in one cell only
- **THEN** the next step is the horseshoe's

### Requirement: A Subsets hint refuses a letter the answer does not have

Where a letter the player has marked present or cleared differs from the
board's solution, or the hint's own deduction from the player's marks ends in
a contradiction, `hint` SHALL refuse with the collection's sentence that the
entries contradict each other.

#### Scenario: A letter marked where the answer has none

- **WHEN** B is marked present in the second cell of
  `13RD,_,6R,_,_,_,_D,_UL,_R,12D,_,_DL,_UR,_,3U,10`, where the answer has no
  B, and a hint is asked for
- **THEN** the hint is refused: "These entries contradict each other, so one
  of them must be wrong. Undo, or clear the ones you are unsure of."
