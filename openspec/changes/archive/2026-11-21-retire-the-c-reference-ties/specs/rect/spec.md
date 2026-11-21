## ADDED Requirements

### Requirement: Generation: Rectangles deals only boards its ladder finishes

At Easy and Normal the generator SHALL deal only boards the ladder of that
tier finishes from an empty board, and at Normal only boards Easy's
techniques do not, dealing again where a board it laid out falls outside
them.

#### Scenario: A board past the hint is dealt again

- **WHEN** the generator, dealing an Easy board, lays out a uniquely solvable
  board Easy's techniques cannot finish
- **THEN** it draws another board instead of returning that one

## MODIFIED Requirements

### Requirement: Hint: A Rectangles hint step draws one rectangle or one line, and reads only the board

Every step of the hint SHALL draw one rectangle or one line, reasoning only
from the clues and the player's marks. A clue's fits are the rectangles it
allows that contain it, stay on the board, take in no other clue, cross no
line and take no square of another clue's drawn rectangle, and contain its
own (`Hint: A rectangle the player drew round one clue is a lower bound`).

#### Scenario: The player draws the rectangle a side at a time

- **WHEN** the displayed step draws a rectangle and the player draws one of its
  sides
- **THEN** the step stays displayed, and it completes when the last side is
  drawn

#### Scenario: Upstream's 10x10 board is hinted to the end

- **WHEN** the hint is followed on `10x10e0.5:a3c4b3g2_3f16_12n4i4c5b3g21m8h4a4e4c`
- **THEN** it finishes the board, one of its steps a line

#### Scenario: The hint goes on from a rectangle drawn rightly

- **WHEN** the hint is followed on an Unreasonable board, and the solution's
  rectangle is drawn wherever the hint stops
- **THEN** the hint finishes the board

#### Scenario: A Patches clue is named by what it shows

- **WHEN** the hint is asked on `3x2p:SaTc`
- **THEN** its words name the square clue or the tall clue, and following it
  finishes the board

## REMOVED Requirements

### Requirement: Generation: Rectangles deals only boards its hint can finish

**Reason**: It required a seed's desc and `aux` to be upstream's wherever upstream's board fell within the tier, a tie to the C that is retired.

**Migration**: Restated without that tie as "Generation: Rectangles deals only boards its ladder finishes".
