## MODIFIED Requirements

### Requirement: Look: The letters sit on discs over the lines, and the words drawn fill the list

Each letter SHALL sit on a disc of its square's surface drawn over the
lines, so a line shows only between letters. The list of lengths below the
grid SHALL write each piece of lines that spells a common word,
read the way its lines run, into a slot of its length as it reads. A line
no word of the board can still take, a loop's included, SHALL be drawn in
the error color (`Game.rules`); a word drawn part-way SHALL NOT be.

#### Scenario: A word drawn is written into the list

- **WHEN** on `4x3n2de:45,namedlgo3p` lines run P to O to E to M
- **THEN** POEM is written into the list's four-letter slot

#### Scenario: Letters that are not yet a word stay out of the list

- **WHEN** lines run only P to O to E, or M to E to O to P
- **THEN** the list is empty

#### Scenario: A word is written the way it was drawn

- **WHEN** on `3x2n1de:3,but3` lines run T to U to B, and on another such board B to U to T
- **THEN** the first writes TUB into the list and the second BUT

#### Scenario: A line no word can take is red, and part of a word is not

- **WHEN** on `4x3n2de:45,namedlgo3p` lines run G to L to A, or N to A to L
  to D
- **THEN** G to L to A is drawn plain, and N to A to L to D, which GLAND runs
  the other way, in the error color
