# mines Specification

## Purpose
Mines (Minesweeper), the puzzle of uncovering every square that is not a mine,
guided by the neighbor counts the uncovered squares reveal. Four guarantees keep
it fair: the first click is never a mine, every board is solvable without
guessing, a death can be undone, and chording never reveals more than it must.
It also holds what a saved game and a game ID depend on, since the board is
laid out by the first click, what the hint reasons from, and how the board
looks.

## Requirements

### Requirement: The rules of Mines

Mines SHALL be a `w × h` grid concealing `n` mines, in which the player
uncovers squares, deduces from the revealed neighbor counts where the mines
are, and flags them. The board SHALL be solved when every square without a
mine is open.

#### Scenario: The last safe square is opened

- **WHEN** the player opens the last square that holds no mine, on a board
  they have not died on
- **THEN** the board is solved, whether or not the mines are flagged

### Requirement: Mines' parameters

Params SHALL be `w`, `h` and `n`, encoded in full as `{w}x{h}n{n}`. The Custom
dialog's mine count SHALL also take the form `n%`, meaning that percentage of
the grid's area.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 16, h: 16, n: 99 }` are encoded in full
- **THEN** the result is `16x16n99` and decoding it round-trips the params

### Requirement: Mines never asks for a board that may need a guess

Decoding params SHALL skip upstream's `a`, which asks for a board that may need
a guess, and encoding SHALL never write it. A preliminary description SHALL be
read whether it says `u` or `a`.

#### Scenario: Upstream's may-need-a-guess letter

- **WHEN** `16x16n40aX3Y4` is decoded
- **THEN** the params are those of `16x16n40X3Y4`

### Requirement: Mines' parameters leave room for a safe first click

Params SHALL be refused unless `1 ≤ n ≤ w·h − 9`, and, for a board about to be
generated, unless `w > 2 && h > 2`.

#### Scenario: Too many mines for a safe first click

- **WHEN** a 9×9 board with 73 mines is validated
- **THEN** it is refused, since fewer than nine squares would hold no mine

### Requirement: Mines finishes by deduction as its hint's plan

The game SHALL implement `finishesByDeduction` as its hint's plan, played from
the first click, opening every safe square. A board not laid out yet SHALL
pass: it will be laid out to finish from whichever square is opened first.

#### Scenario: A board not laid out yet passes

- **WHEN** `finishesByDeduction` is asked of a board whose first square has not
  been opened
- **THEN** it answers that the board finishes

### Requirement: A layout with no first square is a board not laid out yet

A description that gives a layout and no first square SHALL read as a board not
laid out yet. It is what an older save kept as its private description, beside
a move log whose first open brings no layout, and the layout SHALL be the one
that replayed first open takes. A first square the player opens on that board
SHALL lay out afresh, since the layout was made to finish from one square it
does not name.

#### Scenario: A layout with no first square is typed as a game ID

- **WHEN** a game ID gives a mine layout and no first square (`9x9n10:m…`)
- **THEN** it opens a board not laid out yet, and the first square opened
  lays one out to finish from there

#### Scenario: A save whose first open brings no layout

- **WHEN** a save carries a layout alone as its private description, and a move
  log whose first open brings no layout
- **THEN** it restores to the board it was saved on
- **AND** saved again from any position of its history, it restores again

### Requirement: Generated boards are solvable without guessing

The generator SHALL perturb every board until its own solver can complete it by pure
deduction. No parameter SHALL lay out a board that requires a guess.

#### Scenario: Every preset board is deducible

- **WHEN** a board is generated from any preset
- **THEN** the solver completes it with no guessing and no perturbation left outstanding

### Requirement: Death is recoverable and is not a loss

Clicking a mine SHALL expose only the mine that killed the player, leaving every
other square covered, and SHALL block further moves until the player undoes,
Solve aside: Solve SHALL show the finished board over the opened mine, as it
replaces any wrong entry. The game status SHALL NOT report a loss on death, and
only a win taken with the Solve function SHALL report as solved-with-help.

#### Scenario: A player dies, undoes, and carries on

- **WHEN** the player clicks a mine and then undoes
- **THEN** play resumes on the same board, the game status is still "ongoing", and the status
  bar reports the death

#### Scenario: Solve on a dead board

- **WHEN** the player opens a mine and then uses Solve
- **THEN** the board is completed and the game reports solved-with-help

### Requirement: The count of deaths persists

The count of deaths SHALL persist in the status bar for the rest of the game,
through an undo of the death, and SHALL survive a save.

#### Scenario: A death is still counted after a save

- **WHEN** the player clicks a mine, undoes, and the game is saved and restored
- **THEN** the status bar still reports the death

### Requirement: Chording never reveals more than it must

Clearing around a satisfied number whose flags are misplaced SHALL uncover only the mined
squares among those it would have opened, rather than the whole neighborhood, revealing as
little additional information as possible.

#### Scenario: A chord on wrongly-flagged squares

- **WHEN** the player chords a number whose flag count is satisfied but whose flags are on the
  wrong squares
- **THEN** only the mine(s) that the chord would have struck are uncovered

### Requirement: A plain left-click chords without a false-uncover preview

A left-click on a number SHALL chord: clear around it when its flags are
satisfied. There SHALL be no separate chord button: the left click chords
wherever chording applies, for a mouse and a finger alike. The 3×3 mouse-down
"pressed" preview SHALL be shown exactly where the release will chord: while
the left button is held on a number whose flags are all placed, having been
pressed on a number.

#### Scenario: Pressing a number with all its flags previews the chord

- **WHEN** the player presses the left button on a number whose flags are all placed
- **THEN** the 3×3 around it shows as pressed, and releasing there opens the unflagged squares

### Requirement: The pressed preview never shows where the release will not chord

The 3×3 "pressed" preview is drawn identically to opened cells, so on a
not-yet-satisfied number it would flash a false uncover that reverts on
release. It SHALL NOT be shown there, nor while a press that opens a covered
square is dragged over a number. A left-press over a covered square SHALL keep
its single-cell "about to open" highlight.

#### Scenario: Clicking a not-yet-satisfied number

- **WHEN** the player presses the left button on a number whose mines are not all flagged
- **THEN** no 3×3 preview appears, so nothing looks uncovered and nothing re-covers on release

### Requirement: The clock reflects the state of play

Mines SHALL leave when its solve timer runs to the engine's rule, stating only
that a dead board holds it (`timerHolds`): a death is not a loss, yet nobody
is playing a dead board. The timer SHALL stop on death and SHALL run again
when the player undoes it.

#### Scenario: The clock stops on a death

- **WHEN** the player opens a mine, and then undoes
- **THEN** the clock stops while the board is dead, and runs again after the
  undo

### Requirement: Mines checks flags against its mines

Mines SHALL implement `findMistakes`, reporting every flag on a square with no
mine under it, and nothing before the first click lays the mines out. An opened
mine SHALL NOT be reported: the hint's dead-board refusal answers it. The mistake
SHALL be drawn as a frame in the error color around the flagged square.

#### Scenario: Check & Save on Mines

- **WHEN** the player invokes Check & Save with a flag on a square that has no
  mine
- **THEN** the flag is framed as a mistake and the board is not saved

#### Scenario: A right flag passes

- **WHEN** every flag on the board sits on a mine
- **THEN** `findMistakes` reports nothing, whether or not the numbers prove those
  mines yet

### Requirement: Mines ships an explained deductive hint from proved facts

Mines SHALL offer a hint that reasons only from what the board proves, the
opened numbers and squares, and never from the player's flags. The midend asks
it only about a board whose flags all sit on mines, but a flag the numbers have
not proved may be a guess, and the hint SHALL NOT teach from it.

#### Scenario: A lucky flag is not a premise

- **WHEN** the player has flagged a mine no opened number touches
- **THEN** the hint's first step reads as it would without the flag

### Requirement: Each Mines hint step names its numbers and its reason

Each step of the hint SHALL name the number or numbers it reasons from and why
the ringed squares must be safe or must be mines: one number on its own, two
numbers sharing squares, a number whose squares sit inside another's, or the
count of mines left.

#### Scenario: A satisfied number frees its other squares

- **WHEN** an opened number already touches all its mines
- **THEN** the hint marks that number and rings its other unopened squares as safe,
  saying so

### Requirement: The Mines hint opens the first square, and refuses a dead or exhausted board

Before the first click the hint SHALL open a square, saying that no mine is laid
in the first square opened or beside it. On a board whose last move opened a
mine, the hint SHALL refuse and tell the player to undo it. On a board
deduction cannot advance, it SHALL refuse with the collection's
deduction-exhausted words.

#### Scenario: A dead board

- **WHEN** a hint is asked for after the player opened a mine
- **THEN** the hint refuses, telling the player to undo that move

### Requirement: The first click is never a mine, and undoing it un-lays the board

The mine layout SHALL NOT exist until the player's first click, and SHALL be
generated around that click so that the clicked square and its eight neighbors
are all free of mines. The layout SHALL belong to the position the first click
made: undoing the first click SHALL return to the board not laid out yet, with
the game ID it started from.

#### Scenario: The first click generates the board

- **WHEN** the player makes their first click on a board whose description names no layout
- **THEN** a layout is generated in which neither the clicked square nor any of its
  neighbors holds a mine, and the game's description is superseded with the real board

### Requirement: The board laid out supersedes the description it started from

Once the first click has laid the board out, the game SHALL answer
`Game.supersededDesc` with that board and its first square, so that the
shareable game ID, a restart and a save all name the board actually being
played.

#### Scenario: The game ID names the board being played

- **WHEN** the player's first click has laid a board out
- **THEN** the game ID names that layout and the square it was laid out around

### Requirement: One seed lays out the same board for the same first square

After the first click is undone, the square opened next SHALL lay a board out
around itself from the same seed: the same board for the same square every
time. A player can therefore choose among the boards one seed gives, and is
never left on a board made to be finished from a square other than the one
they opened.

#### Scenario: Undoing the first click un-lays the board

- **WHEN** the player undoes their first click and opens a different square
- **THEN** a board is laid out around that square, with no mine in it or beside
  it, that finishes by deduction from there
- **AND** its game ID names that square, and a save of it restores

#### Scenario: The same square lays out the same board

- **WHEN** the player undoes their first click and opens the same square again
- **THEN** the board is the one that square laid out before

### Requirement: The first move carries the layout it laid out

The move that opens the first square SHALL carry the layout it laid out, and
replaying it SHALL take that layout and generate nothing, so a save restores
its board whatever the generator has since become. An open that brings no
layout SHALL be refused on a board not laid out yet, except the one replayed
onto an older save's layout with no first square. A first move whose layout
holds a mine in its square or beside it SHALL be refused.

#### Scenario: A save with the first click undone

- **WHEN** the player undoes their first click and the game is saved and restored
- **THEN** the board is not laid out, and Redo returns the board the click made

### Requirement: Mines tells a covered square from an opened one by two flat surfaces

`redraw` SHALL draw the board with no bevel. An opened square SHALL be the
plain cell surface and a covered square the lifted surface, with the surface's
grid line between two squares and a frame round the grid no heavier than that
line, so that "covered" reads at a glance in both color schemes. The game
SHALL declare no palette swap for the dark scheme: neither surface is half of
a bevel.

#### Scenario: Two surfaces and no bevel

- **WHEN** a board with opened and covered squares is drawn, with no flag down
- **THEN** each opened square is a flat fill in the cell surface and each
  covered square a flat fill in the lifted surface
- **AND** nothing on the frame is a polygon

### Requirement: What Mines draws on its two surfaces

A square held down by the pointer SHALL take the opened surface until it is
released. The count digits SHALL keep their own colors, and the flag, the mine
and the tint on a number with more flags beside it than it counts SHALL be drawn on the two flat surfaces.

#### Scenario: A pressed square previews the opened surface

- **WHEN** the pointer is held down on a covered square
- **THEN** the square is drawn in the opened surface
- **AND** it returns to the covered surface when the press is released without
  opening it

### Requirement: The Mines cursor and marks sit at the square's edge

The keyboard cursor SHALL be drawn at the square's edge and SHALL NOT fill it,
so the square under the cursor still shows whether it is covered. A hint's ring
and outline and a mistake's frame SHALL sit at the edge of the square's
surface.

#### Scenario: The cursor leaves the square readable

- **WHEN** the keyboard cursor is on a covered square, and then on an opened one
- **THEN** each square keeps its own surface under the cursor's mark
- **AND** the square the cursor left is repainted with no trace of the mark

### Requirement: Mines' flashes fill every square on their lit beats

The flash on a win SHALL lift every square to the covered surface on its lit
beats, and the flash on a death SHALL fill every square in the error color on
its lit beats. The mine the player trod on SHALL keep the error color
throughout.

#### Scenario: The trodden mine through a death's flash

- **WHEN** a death's flash moves from a lit beat to an unlit one
- **THEN** every square is filled in the error color on the lit beat
- **AND** on the unlit beat the trodden mine's square is still filled in it,
  while the others return to their own surfaces
