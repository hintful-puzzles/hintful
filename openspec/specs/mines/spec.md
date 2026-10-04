# mines Specification

## Purpose
Mines (Minesweeper), the puzzle of uncovering every square that is not a mine,
guided by the neighbor counts the uncovered squares reveal. This capability
specifies its port to the TS engine around the guarantees that keep it fair: the
first click is never a mine, every preset board is solvable without guessing, a
death can be undone, and chording never reveals more than it must.

## Requirements

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
square; a layout with no square opened SHALL pass.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 16, h: 16, n: 99 }` are encoded in full
- **THEN** the result is `16x16n99` and decoding it round-trips the params

#### Scenario: Upstream's may-need-a-guess letter

- **WHEN** `16x16n40aX3Y4` is decoded
- **THEN** the params are those of `16x16n40X3Y4`

### Requirement: The first click is never a mine

The mine layout SHALL NOT exist until the player's first click, and SHALL be generated
around that click so that the clicked square and its eight neighbors are all free of mines.
The game SHALL then supersede its description (`Game.supersededDesc`) so that the shareable
game ID, a restart and a save all name the board actually being played.

The layout SHALL be generated **at most once per game**, and SHALL survive undo: undoing past
the first click and clicking a different square SHALL use the layout already generated, not a
fresh one. A player SHALL NOT be able to obtain a new board by undoing.

#### Scenario: The first click generates the board

- **WHEN** the player makes their first click on a board whose description names no layout
- **THEN** a layout is generated in which neither the clicked square nor any of its
  neighbors holds a mine, and the game's description is superseded with the real board

#### Scenario: Undo does not reroll the board

- **WHEN** the player dies, undoes back past their first click, and clicks a different square
- **THEN** the mines are exactly where they already were — the board is not regenerated

### Requirement: Generated boards are solvable without guessing

The generator SHALL perturb every board until its own solver can complete it by pure
deduction. No parameter SHALL lay out a board that requires a guess.

#### Scenario: Every preset board is deducible

- **WHEN** a board is generated from any preset
- **THEN** the solver completes it with no guessing and no perturbation left outstanding

### Requirement: Death is recoverable and is not a loss

Clicking a mine SHALL expose only the mine that killed the player, leaving every other square
covered, and SHALL block further moves until the player undoes, Solve aside: Solve
SHALL show the finished board over the opened mine, as it replaces any wrong entry. The game status SHALL NOT
report a loss on death — only a win taken with the Solve function SHALL report as
solved-with-help. The count of deaths SHALL persist in the status bar for the rest of the
game, and SHALL survive a save.

#### Scenario: A player dies, undoes, and carries on

- **WHEN** the player clicks a mine and then undoes
- **THEN** play resumes on the same board, the game status is still "ongoing", and the status
  bar reports the death

### Requirement: Chording never reveals more than it must

Clearing around a satisfied number whose flags are misplaced SHALL uncover only the mined
squares among those it would have opened, rather than the whole neighborhood — revealing as
little additional information as possible.

#### Scenario: A chord on wrongly-flagged squares

- **WHEN** the player chords a number whose flag count is satisfied but whose flags are on the
  wrong squares
- **THEN** only the mine(s) that the chord would have struck are uncovered

### Requirement: A plain left-click chords without a false-uncover preview

A left-click on a number SHALL chord (clear around it when its flags are satisfied).
The 3×3 mouse-down "pressed" preview is drawn identically to opened cells, so it
SHALL be shown exactly where the release will chord: while the left button is
held on a number whose flags are all placed, having been pressed on a number. On a
not-yet-satisfied number it would flash a false uncover that reverts on release,
and it SHALL NOT be shown there, nor while a press that opens a covered square is
dragged over a number. A left-press over a covered square SHALL keep its
single-cell "about to open" highlight. There is no separate chord button: the
left click chords wherever chording applies, for a mouse and a finger alike.

#### Scenario: Clicking a not-yet-satisfied number

- **WHEN** the player presses the left button on a number whose mines are not all flagged
- **THEN** no 3×3 preview appears, so nothing looks uncovered and nothing re-covers on release

#### Scenario: Pressing a number with all its flags previews the chord

- **WHEN** the player presses the left button on a number whose flags are all placed
- **THEN** the 3×3 around it shows as pressed, and releasing there opens the unflagged squares

### Requirement: The clock reflects the state of play

Mines SHALL leave when its solve timer runs to the engine's rule, stating only that a dead board holds it (`timerHolds`). The timer SHALL
therefore not run before the first click (there is no board yet), SHALL run during play, and
SHALL stop on death and on completion, and SHALL run again when the player undoes out of
either. Solve SHALL complete the board, dead or alive, so the game reports solved-with-help and
the timer stops. Elapsed time SHALL survive a save and restore.

#### Scenario: The clock starts on the first click

- **WHEN** a new Mines game is displayed and the player has not yet clicked
- **THEN** the clock is not running; it starts when the first click uncovers the board

### Requirement: Mines checks flags against its mines

Mines SHALL implement `findMistakes`, reporting every flag on a square with no
mine under it, and nothing before the first click lays the mines out. An opened
mine SHALL NOT be reported: the hint's dead-board refusal answers it. The mistake
SHALL be drawn as a frame in the error color around the flagged square, held in
the tile's cache key so it repaints when it comes and goes.

#### Scenario: Check & Save on Mines

- **WHEN** the player invokes Check & Save with a flag on a square that has no
  mine
- **THEN** the flag is framed as a mistake and the board is not saved

#### Scenario: A right flag passes

- **WHEN** every flag on the board sits on a mine
- **THEN** `findMistakes` reports nothing, whether or not the numbers prove those
  mines yet

### Requirement: Mines ships an explained deductive hint from proved facts

Mines SHALL offer a hint that reasons only from what the board proves, the opened
numbers and squares, and never from the player's flags: the midend asks it only
about a board whose flags all sit on mines, but a flag the numbers have not
proved may be a guess, and the hint SHALL NOT teach from it. Each step SHALL name
the number or numbers it reasons from and why the ringed squares must be safe or
must be mines: one number on its own, two numbers sharing squares, a number whose
squares sit inside another's, or the count of mines left. Before the first click
the hint SHALL open a square, saying that no mine is laid in the first square
opened or beside it. On a board whose last move opened a mine, the hint SHALL
refuse and tell the player to undo it; on a board deduction cannot advance, it
SHALL refuse with the collection's deduction-exhausted words.

#### Scenario: A satisfied number frees its other squares

- **WHEN** an opened number already touches all its mines
- **THEN** the hint marks that number and rings its other unopened squares as safe,
  saying so

#### Scenario: A lucky flag is not a premise

- **WHEN** the player has flagged a mine no opened number touches
- **THEN** the hint's first step reads as it would without the flag

#### Scenario: A dead board

- **WHEN** a hint is asked for after the player opened a mine
- **THEN** the hint refuses, telling the player to undo that move
