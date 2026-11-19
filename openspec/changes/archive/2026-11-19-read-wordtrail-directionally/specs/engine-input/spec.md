## ADDED Requirements

### Requirement: A game may draw its lines with a direction

A game drawing lines with the engine's drag MAY declare its lines directed. Each line SHALL then run from one square to the next in the order the drag passed them, and a square SHALL take at most one line in and one out. A drag from the end of a run of lines SHALL carry it on, and one that ends on a run's first square SHALL join onto its front. A game that does not declare it SHALL draw as before.

#### Scenario: A fragment drawn first, then joined at its front

- **WHEN** a directed game's drag draws I-G-N, and a second drag draws A-L-I ending on that I
- **THEN** the lines read A, L, I, G, N in that order

#### Scenario: A drag outward from a run's first square stops

- **WHEN** a directed game's drag starts on the first square of a run and leaves it by an edge the run does not take
- **THEN** the drag stops before the next square, as a drag stops where a square would take too many lines

#### Scenario: A directed line is drawn with the engine's arrow

- **WHEN** a directed game draws a line, or a game shows which way a path runs between two squares
- **THEN** it is drawn with the engine's arrow, pointing the way it reads, and a path's first square with the engine's start mark

#### Scenario: An undirected game is unchanged

- **WHEN** Pearl's or Path's lines are drawn
- **THEN** they hold no direction, and their saves read as before
