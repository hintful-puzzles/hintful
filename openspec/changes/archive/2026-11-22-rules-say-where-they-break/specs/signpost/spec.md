## MODIFIED Requirements

### Requirement: Rules: Signpost's live error overlay is not its mistake check

The live error overlay SHALL draw in the error color each square where the
board breaks a rule (`Game.rules`): two squares the numbers between two given
ones put at one number, a number and the next whose arrow misses it, and a
square that leads to the first number. A given's number SHALL never be
recolored by it. The overlay SHALL NOT flag a link for being globally wrong,
which is what `findMistakes` reports.

#### Scenario: A number off its arrow from the next

- **WHEN** on the 4×4 board `1ed4ffbdaebeeabbh16a` the player links the `1`
  down to the square below it, and that square on to the square right of
  the `1`, which the links number 3
- **THEN** the 3 is drawn in the error color, since its arrow misses the
  given 4, and the 4 is not recolored

#### Scenario: A wrong link that clashes with nothing

- **WHEN** on a generated board the player makes a link that is not in the
  solution and causes no clash of numbers
- **THEN** the live overlay shows no error, and Check & Save flags the link
