## ADDED Requirements

### Requirement: Subsets players can rule a set out of a cell

The game SHALL let the player rule any set-value out of any cell, stored per cell
as a set of ruled-out set-values and set or cleared by an absolute `rule` move so
that replaying one is harmless. With an undecided cell in focus in the reference
aid, a press on a tally entry SHALL rule that set out of the cell, or take the
rule-out back; with no cell in focus, or a decided one, it SHALL spotlight the set
as before. The keyboard cursor SHALL move from the grid's bottom row down into the
tally band, keeping the cell in focus, where the arrows move between entries,
Enter or Space presses the entry, Backspace takes a rule-out back, and Up from the
band's top row returns to the grid. While a cell is in focus, or a hint step is
about it, the tally SHALL draw every set ruled out of that cell struck through.

#### Scenario: A tally press rules a set out of the cell in focus

- **WHEN** an undecided cell is in focus and a tally entry is pressed
- **THEN** the move rules that set out of the cell, and pressing it again takes
  the rule-out back
- **AND** the entry is drawn struck through while the cell is in focus

#### Scenario: The keyboard reaches the tally

- **WHEN** the cursor is on the grid's bottom row, Down is pressed and then Enter
- **THEN** the cursor is in the tally band and the entry under it is ruled out of
  the cell in focus

#### Scenario: Saves from before rule-outs still load

- **WHEN** a move log holding only letter moves is replayed
- **THEN** it produces the same board, with nothing ruled out

## MODIFIED Requirements

### Requirement: Subsets input, marking, mistakes and completion

Subsets SHALL be played by toggling individual letter slots within each cell. A
left-click or select SHALL cycle a slot unknown → known → cleared → unknown, a
right-click or secondary select SHALL cycle unknown → cleared → known → unknown,
and a middle-click or backspace SHALL reset a slot to unknown; a given (immutable)
slot SHALL NOT change. A keyboard cursor SHALL navigate slots, skipping the gaps
between cell blocks. A move SHALL be modeled as a discriminated union, not a move
string.

The game SHALL flag mistakes for Check & Save: a set-value placed in more than one
cell, any edge whose horseshoe (or missing-horseshoe disjointness) relation is
violated by two decided cells, and, when the board has a unique solution, any
set ruled out of the cell that solution puts it in, which is drawn in the mistake
color. A Solve action SHALL fill the board from the solver
unless the board is invalid, and SHALL complete the game as solved-with-help
without firing the win flash — a deliberate divergence from upstream, whose solve
move omits the completion bookkeeping (the collection convention wins). The board
SHALL be formattable as text. Rendering
SHALL show each cell's letter slots, the horseshoe arrows, a tally of every
set-value with its placement count, and a completion flash; there SHALL be no move
animation.

#### Scenario: Toggling a letter slot cycles its state

- **WHEN** a mutable letter slot is left-clicked repeatedly
- **THEN** it advances unknown → known → cleared and back to unknown, and a given
  slot does not change

#### Scenario: Completing the grid wins and flashes

- **WHEN** every set is placed exactly once so that all clues hold
- **THEN** the game is reported solved and flashes

#### Scenario: A duplicated placement is flagged as a mistake

- **WHEN** the same set-value is fully placed in two cells and mistakes are checked
- **THEN** both offending cells are reported as mistakes

#### Scenario: A wrong rule-out is a mistake

- **WHEN** a set is ruled out of the cell the unique solution puts it in
- **THEN** `findMistakes` reports that rule-out and the hint refuses

### Requirement: Subsets provides an explained hint

Subsets SHALL implement `hint()`, planning from the player's current marks and
rule-outs and narrating each firing as the deduction that forces it.

The recorder SHALL be able to narrate every deduction the solver may use,
including rules available only above the lowest tier: a board whose tier the
recorder cannot reach stalls mid-plan with nothing to say. Those rules SHALL be
reached for **only once the cheaper rules are exhausted**, so a board at the
lowest tier is planned exactly as a recorder lacking them would plan it. That
equivalence SHALL be asserted by comparison against a capped recorder, not
assumed — running a stronger rule unconditionally is sound and still silently
re-plans easier boards.

A step SHALL rest only on what the board shows: letters, rule-outs, horseshoes and
placed sets. Every set a firing needs gone from a cell that the board does not
already rule out SHALL be ruled out by an earlier step of its own, in the same
journey, narrated by the horseshoe that leaves it no partner: no set the
neighbor across it can still hold is a smaller set inside it (or a bigger set
holding it). Every set that step's own premise needs gone SHALL be ruled out
before it, and no rule-out SHALL be placed that no firing uses. Each step's
highlights and claims SHALL be read off the board as that step is shown.

#### Scenario: A hint narrates an arrow deduction

- **WHEN** a hint is requested on a board where a horseshoe forces a letter
- **THEN** the explanation names the arrow relation that forces it, not just the
  letter to write

#### Scenario: A hidden single is shown with its placement spotlight

- **WHEN** a set has exactly one cell it can still legally occupy
- **THEN** the hint places it there and spotlights that cell as the only
  candidate

#### Scenario: A deduction deciding several letters reads as one journey

- **WHEN** one firing decides more than one letter slot
- **THEN** the steps are emitted as a single continued journey rather than
  several separate hints

#### Scenario: A mistaken board is refused honestly

- **WHEN** a hint is requested on a board contradicting its own clues
- **THEN** the hint refuses and points at the mistakes instead of deducing from
  a wrong position

#### Scenario: A board above the lowest tier is fully narratable

- **WHEN** a hint plan is computed from the opening position of a board
  generated above the lowest tier
- **THEN** the plan reaches a complete solution, and the same recorder capped
  one tier lower does not

#### Scenario: The lowest tier's plan is unchanged by the higher rules

- **WHEN** a board at the lowest tier is planned by the full recorder and by one
  capped below the higher rules
- **THEN** both produce the same firings, in the same order

#### Scenario: A collapse rests on rule-outs the plan placed

- **WHEN** the plan decides a cell's letters because only some sets can still go
  in it, and the board alone does not rule the others out
- **THEN** each set it needs gone is ruled out by an earlier step in the same
  journey, naming the horseshoe and boxing the sets the neighbor can still hold
- **AND** when the letters are decided, the sets the tally shows for the cell all
  agree on them

### Requirement: Subsets offers a two-way placement reference aid

Subsets SHALL let the player explore where sets and cells can go, judged
shallowly from the visible board (a cell's own marks and rule-outs, the horseshoe
/ missing-horseshoe relations to decided neighbors, that the empty set and the
full set need every edge of their cell to point the one way, and the
exactly-once rule), never from a solver or the solution:

- selecting a **set** from the tally band, with no undecided cell in focus, SHALL
  spotlight every cell it can still legally go in; if the set is already placed,
  its home cell SHALL be shown in a distinct color (where it *is*, versus where it
  could go);
- focusing a **cell** via its dedicated inspect icon — a touch-sized badge in
  the margin above the cell block, doing nothing but inspect (never editing) —
  or by moving the keyboard cursor onto it, SHALL highlight in the tally every
  set that cell could still hold.

The two directions SHALL be mutually exclusive, the spotlight SHALL update as
the board changes, and all of this SHALL be ephemeral UI state, never
persisted. Because the aid and a hint draw in the same overlay space, touching
the aid while a hint is displayed SHALL dismiss the hint (and its status text)
so the aid is shown, rather than the aid being silently suppressed.

#### Scenario: The reference aid dismisses a displayed hint

- **WHEN** the player interacts with the reference aid while a hint is on
  display
- **THEN** the hint is dismissed and the aid is shown

#### Scenario: Spotlighting a set's placements

- **WHEN** the player clicks an unplaced set in the tally band
- **THEN** every cell where that set could still legally go is spotlit, and
  clicking it again clears the spotlight

#### Scenario: A placed set shows where it sits

- **WHEN** the player clicks a set that is already placed
- **THEN** its home cell is highlighted in the distinct "placed" color, not the
  "could go here" spotlight color

#### Scenario: A cell shows the sets it can still hold

- **WHEN** the player taps an undecided cell's inspect icon
- **THEN** every set that could still legally go in it is highlighted in the
  tally band, and nothing about the cell is edited

#### Scenario: A rule-out leaves the cell's list

- **WHEN** the player rules a set out of the cell in focus
- **THEN** that set is no longer highlighted as one the cell could hold, and no
  longer spotlights the cell
