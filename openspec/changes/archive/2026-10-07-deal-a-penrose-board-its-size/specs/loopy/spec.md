## ADDED Requirements

### Requirement: Loopy draws an aperiodic patch again when it is far under its size

On an aperiodic tiling, Loopy SHALL NOT deal a patch that has half or fewer of
the faces its size usually gives while a larger one can be drawn. The usual
count SHALL be a function of the width and height alone, the same for every
aperiodic tiling, and not a table of sizes. Loopy SHALL draw a fresh
description, within a bounded number of draws, until a patch has more than half
of it.

Where no patch drawn reaches that, Loopy SHALL deal the largest patch it drew.
A size SHALL NOT be refused, and a deal SHALL NOT give up, because its patches
are small: a size whose every patch is the same few faces deals those faces.

The redraw SHALL change only which description is drawn. The grid a description
builds SHALL NOT change, since saved games and shared game IDs carry
descriptions. The draws SHALL come from the deal's own random stream, so that a
given seed always produces the same board.

#### Scenario: A size that usually fills its box is not dealt three faces

- **WHEN** a 5x5 Penrose (rhombs) board is dealt, where one patch in four is
  three rhombs around a point and the rest have five to eleven
- **THEN** the board has more than half the faces a 5x5 usually gives

#### Scenario: A size no patch fills deals the largest patch drawn

- **WHEN** a 3x14 Penrose (rhombs) board is dealt, where every patch has three
  faces or six
- **THEN** the board has six faces

#### Scenario: A size whose every patch is three faces deals them

- **WHEN** a 3x3 Penrose (rhombs) board is dealt
- **THEN** a board of three faces is produced, and the deal does not give up
