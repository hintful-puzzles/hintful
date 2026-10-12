## ADDED Requirements

### Requirement: A change of the Ui alone leaves an animation running

An input that changes only the `Ui` SHALL NOT end or restart a move's
animation, a flash of the game's own or the win flash: a `UI_UPDATE` from
`interpretMove`, a `hover`, and `selectReference`. The frames that follow SHALL
paint the `Ui` as it now is. Only a change of position SHALL end one, since
the move it belongs to still stands.

#### Scenario: The release after the winning press

- **WHEN** a press makes the move that solves the board, and the release that
  follows changes only the game's `Ui`
- **THEN** the win flash plays to its end

#### Scenario: A cursor key while a move animates

- **WHEN** a move is animating and the player presses a key that only moves the
  game's cursor
- **THEN** the animation carries on from where it was, with the cursor painted
  in its new place
