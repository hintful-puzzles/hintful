## ADDED Requirements

### Requirement: Rules: A Wordtrail board is divided into words along orthogonal paths

A board SHALL be a grid of letters with some squares blocked, and a list of
word lengths that sum to its letters. It SHALL be solved when its open
squares are divided into paths, each of orthogonally adjacent squares
spelling a word of the list, one for each listed length, every letter in
exactly one.

#### Scenario: A diagonal step is no path

- **WHEN** a word is drawn from a letter to its diagonal neighbor
- **THEN** the step is refused and the word keeps its first letter alone

#### Scenario: A letter already in a word is not entered again

- **WHEN** a word is drawn through a square another word already holds
- **THEN** the step is refused
