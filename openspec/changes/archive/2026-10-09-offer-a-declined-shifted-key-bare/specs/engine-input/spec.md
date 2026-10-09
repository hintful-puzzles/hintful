## ADDED Requirements

### Requirement: A declined key is offered again without its Shift

When a game declines a key that carries Shift, and the key is not an arrow, the
midend SHALL offer the game the same key without Shift and act on that answer.
It SHALL NOT offer again a key the game answered, an arrow, or a pointer
button, and SHALL leave Ctrl and the keypad bit on the key it offers. A capital
letter reaches the frontend with Shift held, so without this a game that
compares against the letter never sees it.

#### Scenario: A capital letter reaches a game that compares against it

- **WHEN** a game acts on the bare code of `D` and declines every other code,
  and `D` arrives with Shift
- **THEN** the game is asked about `D` with Shift and then about `D` alone, and
  the key is consumed

#### Scenario: A game that reads Shift keeps its meaning

- **WHEN** a game answers Tab with Shift differently from Tab alone, and Tab
  arrives with Shift
- **THEN** the game is asked once and its shifted answer is acted on

#### Scenario: A declined Shift+arrow stays declined

- **WHEN** a game acts on a plain arrow and declines that arrow with Shift
- **THEN** the shifted arrow is not consumed and the game is asked once
