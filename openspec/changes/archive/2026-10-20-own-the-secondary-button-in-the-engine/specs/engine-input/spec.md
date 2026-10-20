## ADDED Requirements

### Requirement: The right button reaches a game with no secondary action as the left

For a game that declares `Game.ignoresSecondaryButton`, the midend SHALL hand
the game a right-button press, drag and release as the left button's, before
the game is asked. A right click then plays as a left click in every such
game, and the game has no branch for a button it is never handed. Keys SHALL
pass through unchanged.

#### Scenario: A right click plays as a left click

- **WHEN** a mouse's right button is pressed, dragged and released in a game
  that declares `ignoresSecondaryButton`
- **THEN** the game receives a left-button press, drag and release
- **AND** a key that arrives meanwhile reaches the game unchanged

### Requirement: A verb that rules a target out is declared as one, on the right button

A target verb that marks a target as holding nothing (a cross, water, grass,
a faint line, "unused"), or a cycle whose first press makes that mark, SHALL
be declared with `rulingOut`, in the game's own words and with its own mark.
Only the secondary verb SHALL accept it, so the right button rules a target
out in every game. A game that declares `Game.rulesOut` SHALL have a
ruling-out secondary verb.

#### Scenario: A cross on the left button does not compile

- **WHEN** a game declares a `rulingOut` verb as its `primary`
- **THEN** the typecheck fails

#### Scenario: Marks a placement brings are the right button's

- **WHEN** a game declares `Game.rulesOut` and its secondary verb is not
  declared with `rulingOut`
- **THEN** the cross-game guard fails, naming the game

## MODIFIED Requirements

### Requirement: A game with no secondary meaning is not given a synthetic one

A game in which no secondary gesture does anything the primary one would not
SHALL declare `Game.ignoresSecondaryButton`. For such a game the interactive
view SHALL promote no press to the secondary button: neither a long press nor
a two-finger tap promotes it, and the press is delivered at once, not held for
the detection window. The bar SHALL offer no "Right click" toggle, which would
change nothing.

#### Scenario: A held touch press still plays a drag game

- **WHEN** a touch press is held past the long-press window and then dragged,
  in a game that declares `ignoresSecondaryButton`
- **THEN** the gesture is delivered as a left-button press, drag and release,
  and completes as it would have without the pause

### Requirement: The secondary-button declaration is held to the behavior

A guard SHALL assert for every registered game that it declares
`ignoresSecondaryButton` if and only if no secondary gesture on a real board
leaves a game different both from the sequence without it and from the
sequence on the primary button. A declaring game SHALL do nothing observable
with a right button handed to it directly. The flag is not upstream's
`REQUIRE_RBUTTON` inverted and SHALL NOT be derived from it.

#### Scenario: The declaration cannot drift from the behavior

- **WHEN** a registered game's secondary button does something of its own
- **THEN** the guard fails if that game declares `ignoresSecondaryButton`
- **AND** when it does nothing of its own, the guard fails if it does not

#### Scenario: A fold by hand is refused

- **WHEN** a game folds `RIGHT_BUTTON` onto `LEFT_BUTTON` in its own
  `interpretMove`
- **THEN** the guard fails, whether or not the game declares
  `ignoresSecondaryButton`

### Requirement: A secondary meaning is derived from what the player can perceive

What counts as a secondary action SHALL be derived, never declared, by one
question: did the secondary gesture change anything the player can perceive,
now or next, that the primary gesture would not have? A move of its own and a
change to what the next input does both count; doing what the primary gesture
does SHALL NOT. Consumption alone SHALL NOT satisfy the biconditional: a bare
repaint of `RIGHT_BUTTON` is no action.

#### Scenario: A repaint is not a secondary meaning

- **WHEN** a game answers `RIGHT_BUTTON` but the gesture leaves the same frame
  and the same save, and changes nothing about what the next input does
- **THEN** the guard demands `ignoresSecondaryButton`, even though the button
  was consumed

#### Scenario: A meaning reached through a shared helper counts

- **WHEN** a game's secondary action is supplied by `pressNoteTakingCell` or
  another shared helper, with no `RIGHT_BUTTON` branch of its own
- **THEN** the guard credits it, because the derivation reads behavior and not
  source

#### Scenario: An eraser that acts only inside a box is seen

- **WHEN** a game's secondary drag erases only what lies inside the box it
  spans, and its primary drag over the same box both draws and erases
- **THEN** the guard credits it once a primary drag has left an edge inside a
  larger box
