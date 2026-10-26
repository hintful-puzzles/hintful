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
suppositions is Search, refused below Unreasonable.
