## MODIFIED Requirements

### Requirement: Rome's parameters

Parameters SHALL be a width, a height, and a difficulty (Easy, Normal or
Tricky). Validation SHALL require a width of at least 3, a height of at least
3, and a difficulty within range. The encoding SHALL be `WxH`, an absent `x`
meaning a square board, followed in the full form only by `d` and the
difficulty's letter: `e`, `n` or `t`. It SHALL round-trip through decode.

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded in the full form and decoded
- **THEN** the same width, height and difficulty are recovered

### Requirement: Rome's two highlight preferences

Rome SHALL offer two highlight preferences: one highlighting the squares whose
arrows reach a goal, on by default, under the key `goal`, and one highlighting
the squares of a loop, off by default, under the key `loop`.

#### Scenario: A new game starts with the defaults

- **WHEN** a game is started with no stored preference
- **THEN** the squares whose arrows reach a goal are highlighted and the
  squares of a loop are not
