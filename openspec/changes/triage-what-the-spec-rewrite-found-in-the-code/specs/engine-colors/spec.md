## MODIFIED Requirements

### Requirement: A color is a shared role only where two games mean the same by it

A color SHALL be a shared role only where two or more games mean the same
thing by it; a hint role (`HINT_ACTION` and its siblings) owes one game, since
the hint vocabulary settles its meaning. A color one game derives for its own
board SHALL be declared in the engine's table of game-local colors, under a
name that begins with the game's id; a named color a game takes directly is
not in that table. A member of a set told apart from its other members SHALL
NOT be a shared role.

#### Scenario: A game-specific color stays game-specific

- **WHEN** a color is derived for one game's board only
- **THEN** it is declared game-local under that game's id, so the declaration is a
  recorded decision and not an omission
- **AND** the suite fails when another game imports it

#### Scenario: A role one game is left holding

- **WHEN** a shared role outside the hint vocabulary is taken by one game, or by
  none
- **THEN** the suite fails and names the role and the game

#### Scenario: The evidence fill has one game

- **WHEN** one game alone has evidence cells that hold nothing, and fills them
  with `HINT_EVIDENCE_WASH`
- **THEN** the fill stays a shared role, and the distances the hint roles owe
  each other are measured with it among them

### Requirement: Every game's board sits at one tone

The engine SHALL hand a game's `colors()` a background already shifted off
pure white and pure black, from a single resolution point (`resolvePalette`)
that whatever paints a board for a player goes through. The color a game
paints its board with SHALL resolve to the same value across the collection
for a given host background, whether or not the game's own `colors()` calls
`mkhighlight`: on the backgrounds the app hands, a game that calls it SHALL
get back the background it received.

#### Scenario: A raw-background game and a mkhighlight game paint one board

- **WHEN** a game that assigns the background it receives as its board, and a
  game that assigns `mkhighlight(...).background`, are both resolved against pure
  white
- **THEN** the two board colors are equal

#### Scenario: Every registered game paints the collection's board

- **WHEN** every registered game's palette is resolved against pure white and
  against the light host
- **THEN** the color at each game's board index equals the shifted host in both
  cases
- **AND** the check looks at every game the app lists and fails if the shift did
  not fire

#### Scenario: A tinted host the app does not hand

- **WHEN** a background that is not gray, and lies within the shift's reach of
  white or black, is shifted and then shifted again
- **THEN** the second result MAY differ from the first in a channel's last
  binary place, which is the bound of the equality: the app hands pure white
  and one gray, and for those the two are the same value

#### Scenario: A test that names the colors of a draw record

- **WHEN** a test calls a game's `colors()` with a background of its own, to
  label what a recorded frame drew
- **THEN** it paints no board for a player and is not held to the resolution
  point

### Requirement: A departure from a shared role is stated at the assignment

Where the shared palette defines a role for a meaning a game's color carries
(the keyboard cursor, a held or dragged item, a flagged mistake, a hint's
action or evidence, a black or white piece, a retired clue, a correctly
completed region), the game SHALL assign that role. A game that assigns a
different color for that meaning SHALL state, on or immediately above the
assignment, why its board has spent the role's color.

#### Scenario: A game whose board has spent the cursor's green says so

- **WHEN** a game assigns its keyboard-cursor slot a color other than the shared
  cursor role
- **THEN** the assignment carries a one-line reason naming what the role's color
  is already used for on that board

#### Scenario: A slot whose name says what it means

- **WHEN** a slot named for a cursor, a held or dragged item, a hint or a
  mistake is assigned another color with no reason beside it
- **THEN** the suite fails and names the file, the line and the slot

#### Scenario: A meaning no slot name says

- **WHEN** a game gives another color to a retired clue, a completed region or a
  black or white piece
- **THEN** no cross-game check finds it, because a slot's name is all that says
  what a slot means, and the names these meanings go by are used for other
  things in other games
- **AND** the reason is owed all the same

### Requirement: Colors a game paints side by side stand apart in the dark scheme

Two palette colors that a game's sampled frames paint next to each other
SHALL stand a stated distance apart in the dark scheme as the app paints it,
or be entered as close on purpose with what carries the shape instead. Two filled areas SHALL owe that distance outright. A thin mark or a
glyph SHALL owe it only where the light scheme gives the same pair more than
twice its dark distance. The pairs SHALL be read off the game's own draw
record, so a game is covered by being registered.

#### Scenario: A pair that is close on purpose

- **WHEN** two neighbors stand closer than the distance and something else
  tells them apart, as a white pearl's black outline does on the loop, or the
  shadow edge of a lifted tile does for its lit edge
- **THEN** the guard holds an entry for that pair saying so, and fails when a
  pair is close with no entry, or an entry's pair is no longer close

#### Scenario: The frames a game is sampled on

- **WHEN** the guard reads a game's neighbors
- **THEN** it reads two frames at the game's default parameters: the board as
  dealt, and the board some hint steps in where the game has a hint
- **AND** a color only a drag, a mistake, the solved flash or a hint's own
  marks bring out is on neither, and is not measured

#### Scenario: Two colors that meet at a corner

- **WHEN** two areas or marks touch along fewer than a handful of pixels on a
  frame
- **THEN** the pair is a corner and not a boundary, and owes no distance

#### Scenario: A wall that sinks into the floor fails

- **WHEN** a movement game's wall and floor are painted as adjacent areas
- **AND** the wall's dark value stands closer to the floor than the stated
  distance
- **THEN** the cross-game guard fails and names the game and the pair

#### Scenario: A quiet grid line passes

- **WHEN** a grid line stands closer to its cell than the stated distance in the
  dark scheme, and the light scheme gives the pair no more than twice its dark
  distance
- **THEN** the guard does not fail on the pair

#### Scenario: One color under two indices

- **WHEN** two palette indices hold one color in both schemes, and a frame
  paints them side by side, as areas or as marks
- **THEN** the pair owes no distance, being one role under two names

### Requirement: The pair's colors keep off the marks' hues and stand apart in lightness

The two-state pair's colors SHALL be none of the hues spent on marks drawn
over a board: the error's, the cursor's, those of the hint roles, and the
orange in which a game that uses the pair outlines a hint premise no shared
role names. A game that paints the pair, a role made of it or one of its
washes SHALL give no mark of its own a color in either of the pair's hues.
They SHALL stand apart in lightness in both schemes, for a player who cannot
tell the hues.

#### Scenario: A cursor over a finished region

- **WHEN** a game washes a finished region in the pair's first hue, as Filling
  does, and draws its keyboard cursor as a ring over the cell
- **THEN** the ring is the shared cursor's green and not a purple, which the
  wash would swallow in the dark scheme

#### Scenario: The pair survives a loss of hue

- **WHEN** the pair's two colors are measured in either scheme
- **THEN** their lightnesses stand apart by more than a stated gap
- **AND** their shapes differ

#### Scenario: A third hint premise on a board of the pair

- **WHEN** a game that uses the pair marks a hint premise that is neither the
  evidence nor one of the two premise references
- **THEN** it outlines it in orange, which is neither piece's hue
