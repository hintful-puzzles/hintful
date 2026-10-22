# pearl Specification Delta — share-line-drawing-drag

## MODIFIED Requirements

### Requirement: Controls: Pearl draws the loop by dragging along grid edges

Pearl SHALL draw its loop with the engine's line drawing, each square taking two lines and a drag back onto its first square closing the loop where that leaves no square more than two, and SHALL save the release as its line-segment flips. A drag SHALL keep the lines it passes, take them up only where it passes nothing else, and stop at a crossed edge or before a square's third line; a click or Ctrl+arrow that would draw a third line SHALL make no move.

#### Scenario: A drag draws a loop path

- **WHEN** the player left-drags along a sequence of grid edges
- **THEN** `interpretMove` yields a move whose execution sets those loop segments

#### Scenario: Tracing the loop's end carries it on

- **WHEN** a drag starts along a stretch of loop already drawn and goes on past its end
- **THEN** the stretch is kept and the loop carried on along the drag

#### Scenario: No square takes a third line

- **WHEN** a square has two lines and the player clicks a third edge of it
- **THEN** no move is made
