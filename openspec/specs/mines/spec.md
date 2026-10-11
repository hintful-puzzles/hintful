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

### Requirement: Mines' short params leave out the mine count

The short encoding SHALL be `{w}x{h}` alone, and a string with no `n` SHALL
decode to a mine count of a tenth of the grid's area, rounded down. `X{x}` and
`Y{y}` SHALL name the first square of a board laid out with no click, which
the game in play never asks for: `newDesc` SHALL NOT read them, they SHALL be
written in the full encoding only when set, and one outside the grid SHALL be
refused.

#### Scenario: A string with no mine count

- **WHEN** `9x9`, the short encoding of the preset `9x9n10`, is decoded
- **THEN** the params are a 9×9 grid with 8 mines, whose full encoding is
  `9x9n8`

#### Scenario: The first-square letters

- **WHEN** `16x16n40aX3Y4` is decoded and encoded again
- **THEN** the first square is column 3 of row 4, the full encoding is
  `16x16n40X3Y4` and the short one `16x16`
- **AND** `9x9n10X9`, the preset `9x9n10` with `X9` added, is refused with
  "First-click x coordinate must be inside the grid."

### Requirement: Mines refuses a grid of 2²⁸ squares or more

`validateParams` SHALL refuse a grid whose width times height is 2²⁸ or more,
in the engine's words for an area too large, whether or not a board is to be
generated.

#### Scenario: The area bound falls between two grids

- **WHEN** a 16383×16384 grid and a 16384×16384 grid are validated
- **THEN** the first is admitted and the second refused

### Requirement: A Mines description before the first click is a mine count and a seed

The description `newDesc` writes SHALL be `r{n},u,{state}`: the mine count,
the letter `u`, and the random state the first click lays the board out from,
in lowercase hex at the length the engine encodes a random state to. It SHALL
be refused where `n` leaves fewer than nine squares without a mine, in a
sentence of the game's own; where the letter is neither `u` nor `a`; and where
the state is shorter, longer or other than what the encoder writes.

#### Scenario: A dealt description opens a board not laid out

- **WHEN**
  `r10,u,6a340dba8566f93f26b22672ce7dc53b17088d5ef6df68c873a45e1d18f41ba695c44fc5a74fe45cb7bf25462e8aafc6fdf89ace35538a69440ad3ec02`
  is opened on a 9×9 grid
- **THEN** the board holds ten mines not laid out yet, every square is
  covered, and the game answers `supersededDesc` with nothing

#### Scenario: Too many mines, and a state cut short

- **WHEN** that description is offered with its `r10` changed to `r73`, and
  again with its last digit dropped
- **THEN** the first is refused with "This game ID has more mines than its
  board can hold around a safe first click." and the second as too short

### Requirement: A laid-out Mines description is its first square and a masked layout

The description `supersededDesc` writes SHALL be `{x},{y},m{hex}`: the first
square, counted from zero, and the layout as one bit a square in reading
order, most significant bit first, masked by the engine's bitmap obfuscation
and written as `⌈w·h/4⌉` lowercase hex digits. `u` in place of `m` SHALL read
the same bits unmasked. `newState` SHALL open the first square, and the
board's mine count SHALL be the layout's, whatever the params' `n`.

#### Scenario: A layout upstream wrote

- **WHEN** `0,8,mff9452e1d83a0a7065160` is read on a 9×9 grid
- **THEN** the board has ten mines, the bottom-left square is opened with the
  squares its flood reaches, and `supersededDesc` answers the same string

#### Scenario: The same layout unmasked

- **WHEN** `0,8,u840900209000001020040`, the bits of that layout with no
  mask over them, is read on a 9×9 grid
- **THEN** the board is the one `0,8,mff9452e1d83a0a7065160` opens, and
  `supersededDesc` answers with the masked string

#### Scenario: The layout's count, not the params'

- **WHEN** `0,8,mff9452e1d83a0a7065160` is read on a 9×9 grid whose params
  ask for 35 mines
- **THEN** the board has ten mines

### Requirement: A Mines layout is read only as the encoder writes it

A layout SHALL be refused where a coordinate of its first square lies outside
the grid, where it has fewer or more hex digits than the grid needs, where a
digit is uppercase or sets a bit past the last square, and where neither `m`
nor `u` leads it. Each SHALL be refused in the collection's words for a
number out of range, a description too short or too long, and a character
where it cannot be.

#### Scenario: Each refusal

- **WHEN** `0,8,mff9452e1d83a0a7065160` is offered on a 9×9 grid with its
  first `0` changed to `9`, with its last digit dropped, with its first `f`
  written `F`, and with its `m` dropped
- **THEN** the first is refused as out of range, the second as too short, and
  the last two as having a character where it cannot be

#### Scenario: A padding bit is set

- **WHEN** `0,8,mff9452e1d83a0a7065160` is offered on a 9×9 grid with its
  last digit changed to `1`, the 81st square being that digit's high bit
- **THEN** it is refused for its `1`

### Requirement: A Mines press opens on its release, and the secondary button flags

The left button SHALL act on its release: after a press on a covered square
it opens the covered square it is released over, and after a press on a
number it chords the number it is released over. A release off the grid SHALL
make no move. The secondary button SHALL flag a covered square or take its
flag off, and a drag on from it SHALL be the engine's sweep; the left button
has none. A flagged square SHALL NOT be opened, nor an opened one flagged.

#### Scenario: A press slid to another square

- **WHEN** the player presses the left button on a covered square, moves to
  another covered square and releases
- **THEN** the second square is opened and the first stays covered

#### Scenario: A flag drag

- **WHEN** the player presses the secondary button on a covered square and
  drags across a flagged square and another covered square
- **THEN** both covered squares are flagged and the flagged one keeps its flag

### Requirement: One Mines number alone settles its squares

A number that already touches as many proved mines as it counts SHALL make
its other unopened squares safe. A number with exactly as many unopened,
unproved squares as mines still to place SHALL make them all mines. The step
SHALL outline the number, and the mines it already touches, and ring the
squares it decides.

#### Scenario: A number with just enough room

- **WHEN** the hint is asked on `0,8,mff9452e1d83a0a7065160`
- **THEN** its first step flags one square, saying "The outlined 1 has
  exactly 1 unopened square around it, so the ringed square must be a mine."

### Requirement: Two Mines numbers that share squares settle the squares they do not

Where two numbers share unopened squares, and the first needs as many more
mines than the second as it has unopened squares the second does not touch,
those squares SHALL be mines and the second's squares the first does not
touch SHALL be safe. Where every unopened square of one number is also
another's, the other's remaining squares hold exactly the difference of what
the two need, and that set SHALL take a number's place in the comparison. No
set SHALL be taken from another set.

#### Scenario: Two numbers that need the same

- **WHEN** two numbers need one mine each and every unopened square of the
  first is also the second's
- **THEN** the second's other unopened squares are ringed as safe, and no
  square is flagged

### Requirement: Mines counts the mines left

Where every mine left is accounted for by up to five numbers whose unopened
squares do not overlap, one of them at most a set of the kind above, every
other unopened square SHALL be safe; where the squares outside them number
exactly the mines they leave over, those SHALL all be mines. With no number counted the same
SHALL hold of the whole board: all mines found, or as many squares as mines.
The step SHALL outline the numbers and stripe the squares they account for.

#### Scenario: Every mine is found

- **WHEN** the proved mines number the board's count and unopened squares
  remain that no deduction has proved
- **THEN** the step rings them as safe, saying that all the mines are found

### Requirement: Mines' hint takes the simplest deduction the board supports

Each step SHALL be the first deduction found in this order: one number alone,
the numbers taken in reading order; two numbers that share squares; a nested
set against a number, then against another set; the count of the mines left.
The plan SHALL look again from the top after every step, with the numbers the
step opened. A deduction that proves both SHALL flag its mines and then open
its safe squares, as one journey, and one that changes nothing on the board
SHALL NOT be shown.

#### Scenario: Single numbers come before a pair

- **WHEN** the hint's plan is read on `0,8,mff9452e1d83a0a7065160`
- **THEN** its first eight steps each rest on one number, and the ninth is the
  first to compare two

### Requirement: The Mines hint's first square is the middle one

Before the first click the hint SHALL ring the square at `⌊w/2⌋, ⌊h/2⌋`, and
its move SHALL be the first open of that square, carrying the layout the seed
gives it.

#### Scenario: The opening step of a 9×9 board

- **WHEN** the hint is asked on a 9×9 board not laid out yet
- **THEN** it rings the square at column 4 of row 4, counted from zero, and
  says "No mine is ever laid in the first square you open or beside it, so
  this square can't hold one: open it to begin."

### Requirement: The Mines status bar counts flags against mines

In play the status bar SHALL read `Marked: {flags} / {mines}`, the mines being
the description's count before the board is laid out. Where one to nine safe
squares are still covered it SHALL add ` (1 safe square remains)` or
` ({n} safe squares remain)`. A dead board SHALL read `DEAD!` in its place,
and a won board SHALL leave the words to the engine. Once the player has
died, `Deaths: {n}` SHALL follow after two spaces.

#### Scenario: Before and after a death

- **WHEN** the player opens a mine on a ten-mine board with no flag down, and
  then undoes
- **THEN** the status bar reads "DEAD!  Deaths: 1" on the dead board and
  "Marked: 0 / 10  Deaths: 1" after the undo
