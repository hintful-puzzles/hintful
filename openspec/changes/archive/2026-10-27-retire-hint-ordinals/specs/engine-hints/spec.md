## MODIFIED Requirements

### Requirement: A tie a narration states is one the code guarantees

A relation a narration uses to tie two marks ("its ringed neighbor", "the
shaded brick above", "the end of the shaded run") SHALL be one the code
guarantees: a relation asserted in prose and not enforced in code is a false
claim. Where a step marks a chain and names one of its links apart from the
rest, that link SHALL be a reference of its own, and the bare deictic SHALL
stay with the element the step acts on.

#### Scenario: A chain step says "this cell"

- **WHEN** a step outlines the cells of a chain, names its two ends, and rings
  the cell it acts on
- **THEN** each end is a reference of its own, the chain is named as a whole,
  and "this cell" is the ringed cell
- **AND** no number is drawn on any cell of the chain

### Requirement: An edge a hint names is the engine's mark

The engine SHALL provide the mark kind for an edge between two squares, keyed by its edge number, and the drawing of a hint on it: the line or cross the step asks for in the hint color, and an outlined edge in the outline's color. A square-grid edge game SHALL draw its hint edges through it, declaring only how its own line and cross are drawn.

#### Scenario: One edge named from either side is one mark

- **WHEN** a step's words name an edge from the square on each side of it
- **THEN** the step marks one edge, and the frame draws it once

### Requirement: A hypothesis is classified as Check, Tactic or Search

A deduction that reaches its conclusion through a hypothesis SHALL be
classified by whether each link writes a mark the player can make. A Check is
a contradiction visible at the placement, with no propagation, narratable at
any tier. A Tactic is a chain whose every link is a fact the game's ordinary
marks record, taught as ordinary steps that each write their mark. A Search
runs the solver from a hypothesis, backtracks, or follows a chain of
suppositions no mark records, however short.

#### Scenario: A trial that propagates is not thereby a Search

- **WHEN** a technique tries a value and follows its forced consequences
- **THEN** it is classified by whether each consequence is a fact the player
  can mark, not by whether a trial propagates nor by the technique being called
  "forcing"

#### Scenario: A chain of suppositions is a Search

- **WHEN** a rung's links are "if this, then that" between values no mark
  records, as a Latin forcing chain's are
- **THEN** it runs only at Unreasonable, and the hint below it refuses it as a
  Search

### Requirement: A Tactic's chain is shown on the board

A supposition chain a tier keeps ("A supposition rung that defines its tier
keeps it until a markable technique fills it") SHALL be shown on the board:
every link outlined, both ends anchored, no number on any link. It SHALL NOT
compress the chain into a single claim the player can only check by redoing
the deduction. It SHALL NOT be required to advance one leg at a time: the
player holds the hypothesis in mind and walks the marked chain at their own
pace.

#### Scenario: A bounded chain is walked, not asserted

- **WHEN** a hint's next deduction is a bounded chain of forced consequences
  reaching a named contradiction, at a tier that keeps it
- **THEN** every link is outlined on the board, with the hypothesis and the
  contradiction both anchored, and the narration is not one sentence asserting
  the conclusion
- **AND** the player walks it on the board at their own pace; the hint is not
  required to advance one link per step

### Requirement: A Tactic's narration names the ends, the links and the rule

The narration of a chain a tier keeps SHALL name the two ends of the chain and
the chain as a whole, each a reference of its own, and SHALL supply the rule
that propagates the chain, which is the technique being taught and is nowhere
on the board. Where the conclusion rests on more than one branch of a case
split, the narration SHALL say so: a conclusion that does not follow from its
own stated premises is a defect.

#### Scenario: A chain's conclusion rests on a case split

- **WHEN** a narrated chain's conclusion follows only because both branches of
  a case split lead to it
- **THEN** the narration names the two ends and the chain, states the rule that
  propagates it, and states both branches

## ADDED Requirements

### Requirement: A supposition rung that defines its tier keeps it until a markable technique fills it

A Search SHALL sit at Unreasonable, with one exception: a supposition rung
that alone defines a tier below Unreasonable SHALL keep that tier, its hint
shown as a chain on the board, until a markable technique fills the tier, and
SHALL then move to Unreasonable. Moving it first would leave the tier with no
board to deal, and removing a tier changes the params a game ID and a saved
preference carry.

#### Scenario: A rung that is the whole of its tier

- **WHEN** a tier's boards are told apart from the tier below only by a
  supposition rung
- **THEN** the rung stays at that tier until a markable technique deals the
  tier's boards without it

#### Scenario: A rung a tier can do without

- **WHEN** a tier keeps other techniques that still deal boards without the
  supposition rung
- **THEN** the rung runs only at Unreasonable

## REMOVED Requirements

### Requirement: The chain ordinal is the evidence role

**Reason**: No hint draws a chain ordinal. The owner found the numbers added
nothing to an explanation and cluttered the hardest hints (2026-10-26).

**Migration**: A chain is outlined in the evidence role like any other
premise, and a link the words single out is a reference of its own.

### Requirement: A chain's order is declared and drawn as an ordinal

**Reason**: The order a chain was numbered in is the order the search found
its links, not a sequence the player can follow, and a number is a mark the
player cannot make on their own board.

**Migration**: Games stop declaring a link's position. A chain whose every
link writes a mark the player can make is taught as ordinary steps; a chain of
suppositions is Search, refused below Unreasonable, save where it alone
defines a tier ("A hypothesis is classified as Check, Tactic or Search").
