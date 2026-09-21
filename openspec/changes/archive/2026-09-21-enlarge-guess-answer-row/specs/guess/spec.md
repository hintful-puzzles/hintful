# guess — delta

## REMOVED Requirements

### Requirement: Guess keeps rule-out marks in an answer row

**Reason**: its dots were too small to see on a phone and its hollow
ruled-out state was indistinguishable from the filled one in dark mode
(measured in `enlarge-guess-answer-row`'s proposal). Its scenarios also named
the dots, which are gone.

**Migration**: "Guess keeps rule-out marks as color blocks in an answer row"
below carries every rule that survives, with the scenarios renamed for blocks.

## ADDED Requirements

### Requirement: Guess keeps rule-out marks as color blocks in an answer row

Guess SHALL draw an **answer row** below the guess rows while the game is in
play, 1.5 tiles tall: one slot per peg of the hidden combination, each a dark
well divided into one cell per color, in keypad order and in the same place in
every slot. A color still possible in a slot SHALL be a solid block inset in its
cell, with no outline; a color ruled out of the slot SHALL be drawn as nothing.
The well SHALL be darker than every peg color in both color schemes, so that no
block can sink into it and read as ruled out. The cell grid SHALL be the one
giving the largest cell, fewest wasted cells among equals. A block SHALL be
small enough never to read as a peg. The reveal SHALL replace the row when the
game ends. With labels on, a block SHALL carry its color's digit.

A slot's ruled-out colors SHALL be part of the state (`ruledOut`, a bitmask per
slot), changed by a mark move that **sets** each named mark to ruled out or not
rather than toggling it, so that a mark undoes, replays from the move log, and
can be placed by a hint step idempotently.

A player SHALL be able to rule a color out, and back in, by:

- a right-click or held finger on its cell, in either mode;
- a tap on its cell in notes mode;
- its color key or digit in notes mode, which acts on the answer slot the
  cursor is on; Clear in notes mode SHALL put every color back in that slot.

A cell SHALL answer the pointer whether or not its block is shown, so a
ruled-out color is put back where it was.

Notes mode SHALL be `GuessUi.pencilMode`, so the engine supplies the Marks key
and the pencil-mode indicator. In notes mode the cursor SHALL be drawn round
the answer slot rather than on the working row, in the margin outside the well,
and SHALL not rest on the submit position.

Outside notes mode, a tap on a cell SHALL enter that color in the **same
column** of the working row.

A hint's mark on a color SHALL be a thin frame in the gap beside its block,
never a fill over it; a hint's evidence outline on a slot SHALL sit in the
margin outside the well.

A mark SHALL never be reported as a mistake. The answer is hidden, and a check
that a mark contradicts it would tell the player something the rows have not;
a mark the rows do not justify is a hypothesis.

#### Scenario: A tap on a block enters that color in its column

- **WHEN** notes mode is off and the block for color 5 in the third answer slot
  is tapped on a fresh board
- **THEN** the working row is `0, 0, 5, 0` and no move is made

#### Scenario: A held finger on a block rules it out

- **WHEN** the right button is pressed on the block for color 3 in the second
  answer slot and then released
- **THEN** the press produces a mark move ruling 3 out of that slot, the release
  produces nothing, and the working row is unchanged

#### Scenario: A color key marks in notes mode

- **WHEN** notes mode is on, the cursor is on the third slot, and the fourth
  color key is pressed
- **THEN** a mark move rules color 4 out of the third answer slot

#### Scenario: Notes mode keeps the cursor off the submit position

- **WHEN** notes mode is switched on while the cursor rests on the submit
  position
- **THEN** the cursor moves to the last slot

#### Scenario: A ruled-out color is drawn as nothing

- **WHEN** the answer row is drawn on a fresh Standard board
- **THEN** there is one block per color per slot, each under half a tile across,
  and a slot with a color ruled out draws one block fewer
