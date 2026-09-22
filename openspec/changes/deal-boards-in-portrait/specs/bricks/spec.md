## ADDED Requirements

### Requirement: Bricks presets draw tall, and a Bricks board is never turned

Bricks SHALL offer its presets at 6×7 and 8×10, upstream's 7×6 and 10×8 turned to draw taller than wide. Bricks SHALL NOT declare `transposeParams`: a shaded brick rests on the row below it and no three may lie in a horizontal line, so a tall board is a different puzzle from a wide one rather than the same one turned.

#### Scenario: A Bricks board is dealt as chosen

- **WHEN** a Bricks board is dealt to fit a wide area
- **THEN** it is dealt at the size chosen
