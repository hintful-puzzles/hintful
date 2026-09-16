# ts-engine

## ADDED Requirements

### Requirement: A hint relies only on marks the player can make

A game's `hint()` SHALL rest every step on facts the player can see on the board or
record there with the game's own input. Where a tier's deductions need a kind of
mark the game does not offer, the game SHALL offer that mark to the player, and the
hint's steps SHALL place it as a move. A hint SHALL NOT draw, as a hint-only
overlay, a fact the player has no way to record.

#### Scenario: A deduction rests on a fact the player cannot mark

- **WHEN** a game's hint would rest a step on a fact its solver derived and the
  player has no input to record
- **THEN** the game is not conforming until it gives the player a mark for that fact
  and the hint places the mark as a move

#### Scenario: Every premise of a step is the player's own

- **WHEN** a step of any hinting game is displayed
- **THEN** every premise its sentence names is a clue, an entry the player placed,
  or a mark the player can make

### Requirement: One way into note-taking across the collection

A game whose `Ui` carries `pencilMode` SHALL offer the collection's shared
pencil-mode toggle: the Marks key last on its on-screen keypad, sending the one
button code that the app's bare `P` shortcut also sends. A game SHALL NOT invent a
toggle of its own, and a game without the mode SHALL NOT offer the key.

Note-taking reached the player differently in each game: the cell games toggle the
mode with a secondary press, which a game whose secondary press already means
something cannot copy, leaving that game to invent a key nobody else has. The
shared key costs a game no button, is the only route a touch player can see, and
makes the mode something a player learns once. The population SHALL be derived from
what each game's `newUi` returns rather than from a roster, so a game joins by
having the mode. Gestures a game already has — a secondary press, a select key on a
showing cursor — MAY toggle the mode as well.

The mode's on-screen indicator SHALL likewise be the collection's: the shared pencil
glyph, at the position the engine computes, in every game that has the mode. A game
SHALL reserve the room for it rather than choose a different place for it. The figure
it reserves SHALL be the engine's stated reach — the glyph plus the gap that keeps it
off each edge, which a game reserving the glyph alone would be short of at both — and
a game whose board leaves that corner occupied SHALL grow a margin for it rather than
overlap the board or move the glyph, and SHALL grow that margin on every side, so the
board stays centered in its canvas rather than being pushed off-center by room taken
on one side only.

#### Scenario: The indicator is in the same place in every game

- **WHEN** pencil mode is on in any game that has it
- **THEN** the glyph is drawn in the position the engine computes, not one the game
  chose for itself

#### Scenario: A game with a pencil mode is reachable the same way as the rest

- **WHEN** any registered game whose `newUi` returns a `pencilMode` is asked for its
  keypad, and that key is pressed
- **THEN** the key is present, last, and the press toggles the mode

#### Scenario: A game without the mode does not offer the key

- **WHEN** a registered game has no `pencilMode`
- **THEN** its keypad does not offer the toggle, so no key on it does nothing
