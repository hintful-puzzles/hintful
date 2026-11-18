## ADDED Requirements

### Requirement: A keypad may be laid out as a keyboard

A `KeyLabel` MAY carry a `row`, the keyboard row it sits on from 0, given on
every key of a keypad or on none. The app SHALL draw a keypad with rows as a
keyboard: a line a row in order, never wrapped, the keys sharing the width
they are given up to a key's usual size, and SHALL fit no columns to it.
`letterKeyboard()` SHALL build the alphabet in QWERTY rows, each key sending
its capital letter.

#### Scenario: A keyboard fits a phone

- **WHEN** a keypad of ten keys a row is shown under the board on a phone
- **THEN** each row fits the width, every key on screen

### Requirement: A key may show what the board has shown of its value

The engine SHALL support an optional `Game.keyStatus(state)` hook returning,
for keys by their button, a look (the key filled, a disc behind its label, or
its label faint), the palette index of a fill or a disc, and the words a
screen reader is told after the label. The midend SHALL send it with every
state change for a game with the hook, and the app SHALL draw each key from
the latest, resolved against the published palette; a key with no entry SHALL
be drawn plain.

#### Scenario: A key follows the board

- **WHEN** a move scores a letter in place
- **THEN** that letter's key is filled in the color the board's in-place
  square is, and is read out with the game's words for it
