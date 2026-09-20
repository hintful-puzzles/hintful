# ts-engine — delta

## ADDED Requirements

### Requirement: The engine gives every note-taking game its Marks key

The engine SHALL append the shared Marks key to the on-screen keypad of every
game that takes notes, at the keypad the app renders rather than at each game's
own key list. A game SHALL NOT list the key itself, so there is one source and
no two statements of the rule to drift apart.

Whether a game takes notes SHALL be **derived from what the game is** — a
`pencil` array on its board, or the collection's pencil-mode flag on its `Ui` —
and never from a boolean the game declares. A declaration can be forgotten by a
new game and left behind by a changed one with nothing noticing, which is how
two games came to carry notes with no key at all.

The derivation SHALL have **one definition**, read by both the engine that
offers the key and the guard that checks it, so the two cannot disagree about
who is in the population.

#### Scenario: A note-taking game gets the key without asking for it

- **WHEN** a game whose board carries notes is rendered, whatever its own key
  list contains and whether or not it has one
- **THEN** its rendered keypad ends with the Marks key, exactly once

#### Scenario: A game that takes no notes is not given one

- **WHEN** a game with neither notes nor the mode is rendered
- **THEN** its keypad is exactly its own, with no Marks key

### Requirement: An offered Marks key is never inert

A game offered the Marks key SHALL consume the press and toggle its pencil
mode. The engine can put a key on the panel; only the game can make it act, and
a key that is offered and does nothing is a worse failure than no key, because
it looks like the feature is there.

A game that genuinely cannot toggle a mode SHALL be recorded as an exception
against the derived population, one entry per game with its reason, and the
derivation SHALL assert that ledger is exactly right so a game that quietly
stops handling the key fails rather than joining the exceptions.

#### Scenario: A game that ignores the key fails

- **WHEN** a note-taking game does not consume the pencil-mode button
- **THEN** the cross-game guard names it, rather than passing over it

### Requirement: A sticky notes mode is visible on the board

A game with the collection's pencil-mode flag SHALL show the pencil-mode
indicator in the engine's corner, reserving the room for it — by a border wide
enough, or by a canvas grown to make one — because a sticky mode whose state
cannot be seen is a mode the player cannot trust.

#### Scenario: A game whose board has no margin grows one

- **WHEN** a game acquires the pencil mode and its own borders are too small to
  hold the glyph
- **THEN** its canvas is grown on every side so the board stays centered, its
  pointer mapping shifts by the same margin, and the indicator is drawn in the
  engine's box
