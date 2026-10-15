## MODIFIED Requirements

### Requirement: Rules: Map's digits, keys and color words name one order of the colors

The four colors SHALL have one order, pink, yellow, teal and violet: a clue
digit `0`–`3` in a desc is that color by position, the digit keys `1`–`4` and
the on-screen keys labeled with them enter the first to the fourth, and the
hint names a color by that word.

#### Scenario: A clue digit, a key and a word agree

- **WHEN** the desc whose clue list is `0c1321b3e01a0b10b0032` is opened on
  `15x20n30de`
- **THEN** region 0 is a pink clue and region 4 a yellow one, and the key that
  would enter the color of region 4 elsewhere is `2`
