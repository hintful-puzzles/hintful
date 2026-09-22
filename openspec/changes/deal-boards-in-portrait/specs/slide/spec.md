## ADDED Requirements

### Requirement: Slide presets draw tall, and a Slide board is never turned

Slide SHALL offer its default and presets at 6×7 (limits 40 and 25, and no limit) and 6×8 (no limit), upstream's 7×6 and 8×6 turned to draw taller than wide. The 6×8 board costs about what the 8×6 it replaces did to generate: measured over eight seeds, 8×6 averaged 4.3 s a board and 6×8 about 3.8 s. Slide SHALL NOT declare `transposeParams`: the key block starts in the top-left corner and leaves by a gate in the right-hand wall, so a board turned on its side is a different puzzle.

#### Scenario: A Slide board is dealt as chosen

- **WHEN** a Slide board is dealt to fit a wide area
- **THEN** it is dealt at the size chosen
