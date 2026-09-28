## ADDED Requirements

### Requirement: A game offers a keypad exactly when touch play needs one to type

A game whose board carries a `pencil` array (the board arm of `takesNotes`,
exported as `hasPencilArray`) SHALL offer a non-empty `requestKeys`, because its
notes are written by typing a symbol and on touch the keypad is the only way to
type. A game that offers a keypad without such an array SHALL be named, with the
reason, in the input-parity guard's `KEYPAD_WITHOUT_PENCIL` ledger. The guard
SHALL check this per game as a biconditional, so that losing a keypad fails that
game's own case and gaining one without a pencil array fails until it is
ledgered; it SHALL NOT rely on a floor under the number of keypad games.

Wherever a game's keypad offers the Clear key (`CLEAR_BUTTON`), the keyboard's
Backspace (`DELETE`) SHALL also reach that game.

#### Scenario: A note-taking game that loses its keypad fails its own case

- **WHEN** a game whose board has a `pencil` array stops implementing
  `requestKeys`
- **THEN** that game's input-parity case fails, naming the pencil array as the
  reason it needs a keypad

#### Scenario: A keypad without a pencil array must be ledgered

- **WHEN** a game with no `pencil` array offers a keypad and is not in
  `KEYPAD_WITHOUT_PENCIL`
- **THEN** that game's input-parity case fails and asks for a ledger entry with
  the reason

#### Scenario: Backspace clears wherever the panel's Clear does

- **WHEN** a game's keypad offers the Clear key
- **THEN** a `DELETE` keypress is consumed by that game under the same probe that
  reaches its panel keys
