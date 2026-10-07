## MODIFIED Requirements

### Requirement: Mines game implements the Game interface

The engine SHALL provide a registered `mines` game implementing `Game<MinesParams,
MinesState, MinesMove, MinesUi, MinesDrawState>`: a `w × h` grid concealing `n` mines, in
which the player uncovers squares, deduces from the revealed neighbor-counts where the
mines are, and flags them.

Params SHALL be `w`, `h` and `n`, encoded `{w}x{h}n{n}`,
with a custom `n%` form meaning "percentage of area". Decoding SHALL skip upstream's `a`,
which asks for a board that may need a guess, and encoding SHALL never write it; a
preliminary description SHALL be read whether it says `u` or `a`. Six presets (9×9/10,
9×9/35, 16×16/40, 16×16/99, 16×30/99, 16×30/170), upstream's with the expert
board turned to draw taller than wide, SHALL be offered. `validateParams` SHALL
require `n ≥ 1`, `n ≤ w·h − 9`, and `w > 2 && h > 2` for a board about to be generated.

The game SHALL provide `solve`, `textFormat` and `statusbarText`. It SHALL implement
`finishesByDeduction` as its hint's plan, played from the first click, opening every safe
square. A board not laid out yet SHALL pass: it will be laid out to finish from
whichever square is opened first.

A description that gives a layout and no first square SHALL read as a board not
laid out yet. It is what a save written before the layout moved into the first
move kept as its private description, and the layout SHALL be the one such a
save's replayed first open takes. A first square the player opens on that board
SHALL lay out afresh, since the layout was made to finish from one square it
does not name.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 16, h: 16, n: 99 }` are encoded in full
- **THEN** the result is `16x16n99` and decoding it round-trips the params

#### Scenario: Upstream's may-need-a-guess letter

- **WHEN** `16x16n40aX3Y4` is decoded
- **THEN** the params are those of `16x16n40X3Y4`

#### Scenario: A layout with no first square is typed as a game ID

- **WHEN** a game ID gives a mine layout and no first square (`9x9n10:m…`)
- **THEN** it opens a board not laid out yet, and the first square opened
  lays one out to finish from there

#### Scenario: A save written before the layout moved into the first move

- **WHEN** a save carries a layout alone as its private description, and a move
  log whose first open brings no layout
- **THEN** it restores to the board it was saved on
- **AND** saved again from any position of its history, it restores again

## REMOVED Requirements

### Requirement: The first click is never a mine

**Reason**: it required the layout to survive undo ("Undo does not reroll the
board"), which left a player who undid the first click on a board made to be
finished from another square.

**Migration**: "The first click is never a mine, and undoing it un-lays the
board" keeps the first-click guarantee and reverses the undo rule.

## ADDED Requirements

### Requirement: The first click is never a mine, and undoing it un-lays the board

The mine layout SHALL NOT exist until the player's first click, and SHALL be generated
around that click so that the clicked square and its eight neighbors are all free of mines.
The game SHALL then answer `Game.supersededDesc` with the board laid out and its
first square, so that the shareable game ID, a restart and a save all name the
board actually being played.

The layout SHALL belong to the position the first click made. Undoing the first
click SHALL return to the board not laid out yet, with the game ID it started
from, and the square opened next SHALL lay a board out around itself from the
same seed: the same board for the same square every time. A player can
therefore choose among the boards one seed gives; nothing in the app counts or
rewards a board, and the alternative left a player who undid the first click on
a board made to be finished from a square they were no longer standing on.

The move that opens the first square SHALL carry the layout it laid out, and
replaying it SHALL take that layout and generate nothing, so a save restores
its board whatever the generator has since become. An open that brings no
layout SHALL be refused on a board not laid out yet, a save written before this
aside. A first move whose layout holds a mine in its square or beside it SHALL
be refused.

#### Scenario: The first click generates the board

- **WHEN** the player makes their first click on a board whose description names no layout
- **THEN** a layout is generated in which neither the clicked square nor any of its
  neighbors holds a mine, and the game's description is superseded with the real board

#### Scenario: Undoing the first click un-lays the board

- **WHEN** the player undoes their first click and opens a different square
- **THEN** a board is laid out around that square, with no mine in it or beside
  it, that finishes by deduction from there
- **AND** its game ID names that square, and a save of it restores

#### Scenario: The same square lays out the same board

- **WHEN** the player undoes their first click and opens the same square again
- **THEN** the board is the one that square laid out before

#### Scenario: A save with the first click undone

- **WHEN** the player undoes their first click and the game is saved and restored
- **THEN** the board is not laid out, and Redo returns the board the click made
