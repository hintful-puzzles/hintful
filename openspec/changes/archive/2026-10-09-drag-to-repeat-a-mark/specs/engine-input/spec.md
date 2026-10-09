## ADDED Requirements

### Requirement: A drag on from a press repeats the press

A game that declares `Game.targetVerbs` MAY declare a **sweep**: what a target
holds, as a value the engine compares. For such a game the engine SHALL make a
drag on from a press repeat that press: each further target the pointer passes
over that holds what the pressed target held before its press SHALL get the
pressed button's verb, and a target that holds anything else SHALL be passed
over. A drag therefore paints the press's result and never toggles its way
along a row. A press whose verb made no move SHALL open no drag.

The declaration MAY limit the drag to some buttons, to some targets given the
first, and to targets the pointer passes within a stated distance of the point
that addresses them, which is how a drag along a line of edges is kept from
taking the edges that meet it at each corner. The engine SHALL take every
target between two pointer events, so a fast drag skips none.

A game whose own arm takes the press SHALL reach the same drag through the
engine's helpers, and where its click acts on the release, the pressed
target's verb SHALL be applied when the drag reaches a second target.

The midend SHALL treat the moves of one drag as one step: one Undo takes all
of them back and one Redo replays all of them. The grouping is not saved; a
reloaded game undoes such a drag a move at a time.

The generated Controls paragraph SHALL say the drag for a game that declares
one. A cross-game guard SHALL hold the declaration to the behavior: for every
game declaring a sweep, and each button it names, a drag between two targets
that hold the same thing leaves both holding the press's result, and one Undo
returns the board to where the press found it.

#### Scenario: A drag paints and does not toggle

- **WHEN** the player presses an empty square of a declaring game, which marks
  it, and drags across an empty square, a marked square and another empty
  square
- **THEN** the two empty squares take the same mark and the marked square is
  left as it was

#### Scenario: One Undo takes a drag back

- **WHEN** a drag has marked four targets and the player presses Undo once
- **THEN** all four are as they were before the press
- **AND** one Redo marks all four again

#### Scenario: A game that drops its drags fails

- **WHEN** a game declares a sweep and its `interpretMove` never hands a drag
  event to the engine
- **THEN** the guard fails for that game

### Requirement: A mark a player wants on several targets can be dragged

A button whose verb is a mark (a shade, a cross, a flag, a wall, a line, a
note, a clue marked done) SHALL be repeated by a drag wherever a drag on that
kind of target is not already another gesture of the game. A game SHALL
declare this and SHALL NOT write a drag of its own for it: as its
`targetVerbs.sweep`, or, where its input is not target-verb or the mark
exists beside it (a clue marked done beside cells that take a keypad, a mark
of notes mode, the one button a drag game's own drag does not use), as the
engine's verbs for one draggable mark, opened and continued through the same
helpers. A drag opened on one declaration SHALL NOT be carried on with
another.

A drag SHALL NOT repeat a verb that is a move (a rotation, a slide, a beam
fired, a square opened) or a mark never wanted in a row (Light Up's bulb).
Where a game's drag is its own gesture on that target (Rect's rectangle,
Bridges' bridge, Spokes' spoke, Map's color, Rome's arrow, Loopy's pair note
in notes mode, Tents' link on the left button), the click stays one mark a
press.

Each mark declared outside `targetVerbs` SHALL be held to the same behavioral
check as a declared sweep.

#### Scenario: A flag is dragged and a square is not opened

- **WHEN** the player right-drags across three covered squares in Mines
- **THEN** all three are flagged, and one Undo unflags all three
- **AND WHEN** the player left-drags across covered squares
- **THEN** no square is opened by the drag

#### Scenario: A clue marked done is dragged

- **WHEN** the player presses a clue beside a Towers grid, marking it done, and
  drags along the clues beside it
- **THEN** each clue passed that was not done is marked done
