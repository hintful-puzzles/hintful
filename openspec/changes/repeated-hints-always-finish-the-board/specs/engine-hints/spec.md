## ADDED Requirements

### Requirement: Applying the hint on a wrong board clears its mistakes

When the hint is refused with `FIX_MISTAKES_FIRST`, applying it SHALL make a move that takes off every mistake the overlay shows, as one step of Undo. The engine SHALL build that move from each game's `clearMistakes`, which every game with `findMistakes` SHALL declare, and no game SHALL write it as a hint of its own.

#### Scenario: A line drawn out of order is taken off

- **WHEN** on a Path board a line joins two numbers that are not one apart, the hint is refused with `FIX_MISTAKES_FIRST`, and the hint is applied
- **THEN** the lines the overlay showed as mistakes are taken off, Undo puts them back, and the next hint is not refused for mistakes

### Requirement: Applying the hint at a dead end goes back to where the board can be won

When the hint refuses with a dead end (`isDeadEnd`), applying it SHALL undo to the latest earlier position of the board's current run that is not lost, has no mistake, is no dead end to the hint, and is not one Solve says nothing finishes from; else to the position the run began at. Redo SHALL put the moves back.

#### Scenario: A position proved dead is backed out of

- **WHEN** a move leaves a position the game proves nothing finishes from, and the hint is shown and then applied
- **THEN** the board is at the last position before it that is not proved dead, and Redo returns to the dead one

### Requirement: Applying the hint where deduction runs out reveals one piece of the answer

When the hint refuses with `DEDUCTION_EXHAUSTED`, `SEARCH_OUT_OF_REACH` or `NO_MOVE_WORTH_MAKING` on a board with an answer, applying it SHALL put one element of that answer on the board through the game's `revealOne`, which every game with a tier that allows trial and error SHALL declare. A game without it SHALL show the answer whole there instead.

#### Scenario: An Unreasonable board is led on

- **WHEN** on an Unreasonable board the hint says deduction has run out, and the hint is applied
- **THEN** one element of the answer is on the board, no mistake is, and the next press asks the hint again

### Requirement: Pressing Hint over and over finishes any board

From any position a player can reach, pressing Hint repeatedly, each refusal applied for its way forward, SHALL finish the board, in every game. A refusal with a way forward SHALL say what applying it does, and the Hint control SHALL offer to apply it. The exception is a board with no one answer (`PUZZLE_NOT_REASONABLE`, `SOLUTION_UNKNOWN`), which has nothing to be led to.

#### Scenario: A wrong board is finished by the hint alone

- **WHEN** a dealt board is played by random input, and Hint is pressed and applied until the board's status stops changing
- **THEN** the board's status is solved
