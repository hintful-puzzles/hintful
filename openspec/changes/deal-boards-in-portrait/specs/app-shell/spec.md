## ADDED Requirements

### Requirement: A new board is dealt to fit the space it is drawn in

The puzzle view SHALL report the space available to the board, measured before any `maxScale` cap, to its `Puzzle` whenever it measures, and when it is first given a `Puzzle`, so that the first board can fit as well. Every new game the app deals SHALL pass that area to the engine's deal, which chooses which way round a board that can turn is dealt. A board already on screen SHALL NOT be turned when the space changes shape: the next new game fits the new shape.

The size a player chose, whether a preset or a remembered or custom size, is a size and not an orientation, so it SHALL be dealt turned to fit on a screen held the other way round, and SHALL be remembered as chosen.

#### Scenario: The measured area reaches the deal

- **WHEN** the view has measured a wide area and a new Magnets game is dealt from its 5×6 preset
- **THEN** the board on screen is 6×5

### Requirement: A board dealt turned keeps its preset's name

The type header SHALL name a board dealt turned on its side by the title of the preset it was dealt from, found by matching the board's params either as they are or turned back. The title names the kind of board chosen, and the preset stays checked in the menu. The Custom dialog SHALL show the size the board was dealt at.

#### Scenario: A turned board reads as its preset

- **WHEN** Magnets' "5x6 Normal" preset has been dealt as 6×5
- **THEN** the type header reads "5x6 Normal"

#### Scenario: A size no preset turns into is not given a preset's name

- **WHEN** the board's params match no preset either way round
- **THEN** the header names no preset
