## MODIFIED Requirements

### Requirement: A game with no secondary meaning is not given a synthetic one

A game in which the secondary button means nothing observable SHALL declare
`Game.ignoresSecondaryButton`. For such a game the interactive view SHALL
promote no press to the secondary button: neither a long press nor a
two-finger tap promotes it, and the press is delivered at once, not held for
the detection window. Without the flag a held press becomes `RIGHT_BUTTON`, the
game tests no such button, and a press-and-drag gesture is lost, only on
touch, whenever the player pauses to aim.

#### Scenario: A held touch press still plays a drag game

- **WHEN** a touch press is held past the long-press window and then dragged,
  in a game that declares `ignoresSecondaryButton`
- **THEN** the gesture is delivered as a left-button press, drag and release,
  and completes as it would have without the pause
