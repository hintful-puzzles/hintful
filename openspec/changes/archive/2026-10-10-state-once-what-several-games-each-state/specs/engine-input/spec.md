## MODIFIED Requirements

### Requirement: One keyboard-cursor vocabulary across games

A game whose keyboard cursor is a position on a grid SHALL hold it in the
engine's shared cursor shape, a position and a visibility flag, under the one
canonical `Ui` field, `cursor`, and SHALL NOT name either itself. The engine
SHALL provide that shape and the verbs for it: constructing one, moving it,
revealing it and hiding it. A game whose cursor has no row and column to be
at, standing on a dot of a tiling or a point of a graph, SHALL hold it in a
shape of its own.

#### Scenario: A game's cursor is the shared shape

- **WHEN** a game has a keyboard cursor on a grid
- **THEN** its `Ui` holds a position and a visibility flag under `cursor`,
  and under no field of the game's own naming

#### Scenario: A cursor with no row and column

- **WHEN** a game's cursor stands on a dot of a tiling and carries the edge an
  arrow chose there
- **THEN** it is held as the dot's index and that edge, in the game's own
  shape, and the shared verbs are not asked to move it

### Requirement: A cursor outside the canonical field fails the build

The engine SHALL fail the build for a cursor of the shared shape held anywhere
but the canonical field. That check SHALL find it structurally, by the shape
read off the engine's own constructor, over every game's real `newUi` output,
and not by matching names, so a cursor of a game's own shape is outside it. A
game SHALL NOT re-declare an engine cursor helper, which is enforced from
`pointer.ts`'s own export list.

#### Scenario: A cursor under any other field fails the build

- **WHEN** a game holds a cursor-shaped object under a field of its own naming
- **THEN** the guard fails, naming the game and the field, without having been
  told that name in advance

### Requirement: A pointer drag over a grid has one name across the collection

A game whose `Ui` remembers where a pointer drag started and where it is now,
each as a pair of integer coordinates in one grid space of the game's own,
SHALL hold that in the engine's `GridDrag` and not in fields of its own
naming, the convention `GridCursor` carries for the keyboard cursor. The
engine SHALL own the anchor, the current position, whether a drag is running,
and the helpers that start, move and end one. A drag held any other
way is outside this rule.

#### Scenario: a game asks whether a drag is running

- **GIVEN** a game that carries a `GridDrag`
- **WHEN** it needs to know whether a drag is in progress
- **THEN** it reads one field whose meaning is the same in every game
- **AND** it does not test a coordinate against a sentinel value of its own
  choosing

#### Scenario: a dragged piece follows the pointer

- **GIVEN** a game that remembers the cell a piece was picked up from and the
  pointer's position in pixels, so the piece is drawn under the pointer
- **WHEN** its `Ui` is written
- **THEN** the two are fields of the game's own, since they are in two spaces
  and a `GridDrag` holds one

### Requirement: A target and its cursor belong to the geometry

A target is whatever the game aims at: a square, an edge between two cells, a
clue beside the grid. Where the cursor is, and how the arrows move it, SHALL
belong to the geometry, and the engine SHALL read only whether the cursor
shows. A press at a point the geometry gives no target SHALL apply no verb,
leave the cursor as it was and make no move, unless an arm of the game's own
took the press first. The declaration SHALL also admit a verb reached only by
keys, with no button.

#### Scenario: A game aims at an edge

- **WHEN** a declaring game's target is an edge between two cells
- **THEN** its geometry says which edge a press addresses and which the cursor
  rests on, and the engine reads from the `Ui` only whether the cursor shows

#### Scenario: A press in the margin leaves a shown cursor showing

- **WHEN** a declaring game with no arm of its own for the press shows its
  cursor on a square, and the player presses in the margin outside the grid
- **THEN** no verb is applied, the cursor stays shown on that square, and undo
  offers no step for the press
