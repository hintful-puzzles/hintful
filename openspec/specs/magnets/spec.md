# magnets Specification

## Purpose
Magnets, the puzzle of filling each domino with a magnet or a neutral piece so
that no two like poles are orthogonally adjacent and each row and column meets
its clued pole counts. This capability specifies its port to the TS engine, with
input that cycles a domino's contents and marks clues done, and mistake-checking
against the unique solution.

## Requirements

### Requirement: Magnets game implements the Game interface

The engine SHALL provide a registered `magnets` game implementing
`Game<MagnetsParams, MagnetsState, MagnetsMove, MagnetsUi, MagnetsDrawState, MagnetsMistake>`:
fill a `w × h` grid of pre-laid 2×1 dominoes so that each domino is either a
magnet (one `+` cell and one `−` cell) or neutral (both cells blank), no two
orthogonally-adjacent cells share a polarity, and each row and column contains
exactly its clue count of `+` and of `−` cells. Some dominoes MAY be fixed
singleton squares that are permanently neutral. Params SHALL be `w`, `h`,
`diff` (Easy / Normal) and `stripclues` (boolean), encoded `{w}x{h}` with a
full-form `d{e|t}` difficulty suffix and an `S` strip-clues suffix (square
shorthand `{n}`). All 8 upstream presets SHALL be offered. `validateParams`
SHALL enforce `w ≥ 2`, `h ≥ 2`, a per-difficulty minimum size (Easy: `w ≥ 3`
or `h ≥ 3`; Normal: `w ≥ 5` or `h ≥ 5`) and the area bound. The game SHALL
report `canSolve = true` and `canFormatAsText = true`.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 10, h: 9, diff: DIFF_TRICKY, stripclues: true }` (the
  Normal tier) are encoded in full
- **THEN** the result is `10x9dtS` and decoding it round-trips the params

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given a 4×4 grid at Normal difficulty
- **THEN** it returns a non-null error string (Normal needs a side ≥ 5)

### Requirement: Magnets descriptions carry the clues and domino layout

The desc SHALL encode, comma-separated: the `w` column `+` counts, the `h` row
`+` counts, the `w` column `−` counts, the `h` row `−` counts (each a digit/
letter, or `.` for a stripped/absent clue), then a `w·h`-character row-major
string of domino orientations (`L`/`R`/`T`/`B` for the left/right/top/bottom
half of a domino, `*` for a singleton square). `newState` SHALL parse this into
a per-cell domino-partner map and the `[+, −, neutral]` row/column count
targets shared (frozen) across all states of the game, deriving each neutral
target as `size − (+) − (−)` and marking singletons permanently neutral.
`validateDesc` SHALL reject a short desc, characters out of range, inconsistent
domino descriptions (an end not pointing back at its partner), and counts that
exceed the row/column size.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and re-encoded
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** `validateDesc` is given a desc whose domino ends are inconsistent
- **THEN** it returns a non-null error string

### Requirement: Magnets input cycles domino contents and toggles clue aids

Left-click or `CURSOR_SELECT` on a domino cell SHALL cycle its content
empty → `+` → `−` → empty (setting the partner to the opposite polarity),
refusing to start from a placed neutral. Right-click or `CURSOR_SELECT2` SHALL
cycle empty → neutral → not-neutral(`?`) → empty over the whole domino,
refusing to start from a magnet. A left-click on a border clue number SHALL
toggle that clue's "done" gray highlight (a solver aid, tracked in state and
never affecting the win condition). Cursor keys SHALL move a keyboard cursor.
A click or cursor action on a singleton square SHALL do nothing.

#### Scenario: The magnet cycle sets both domino ends

- **WHEN** the player left-clicks the left cell of a horizontal domino twice
- **THEN** after the first click that cell is `+` and its partner `−`, and
  after the second the cell is `−` and its partner `+`

#### Scenario: Clue-done toggle does not affect completion

- **WHEN** the player clicks a border clue number
- **THEN** that clue renders grayed and the board's solved status is unchanged

### Requirement: Magnets flags mistakes against the unique solution

Because a generated Magnets board is uniquely solvable, the game SHALL
implement `findMistakes`: re-solve from the dominoes and row/column counts to
the unique solution and return every player-set cell whose content contradicts
it, and every cell of a domino marked not-neutral (`?`) that is neutral in the
solution. The `?` is checked because the hint reads it as a fact, and a mark the
hint reasons from has to be one the mistake check vouches for. Empty cells, and
a `?` on a domino that is a magnet in the solution, SHALL never be flagged; a
board that is not uniquely solvable SHALL yield no mistakes. The renderer SHALL
overlay the flagged cells distinctly from the always-on live error highlighting
(two touching identical terminals, and over/under-committed clue counts, shown
in red per upstream `check_completion`).

#### Scenario: A wrong placement is flagged

- **WHEN** the player sets a domino to a polarity the unique solution
  contradicts, without yet violating adjacency or a count
- **THEN** `findMistakes` includes that cell and Check & Save refuses to save

#### Scenario: A `?` on a neutral domino is flagged

- **WHEN** the player marks `?` on a domino that is neutral in the unique
  solution
- **THEN** `findMistakes` includes its cells, and the hint refuses until the
  mark is fixed

### Requirement: Magnets grades boards with a tiered deductive solver

The solver SHALL return the impossible / ambiguous / solved (−1 / 0 / 1)
verdict at each difficulty. The Easy tier
SHALL perform: set-and-hold of initial givens, force-by-flags, the
neither-can-be-a-magnet neutral deduction, the row/column count-full pass
(color complete ⇒ exclude the rest; remaining unset all needed ⇒ set them),
and the odd-length-section deduction. The Normal tier SHALL additionally
perform: the advanced-full in-row domino-polarization pass, the
single-neutral-left exclusion, and the two count-dominoes passes
(all-remaining-dominoes-magnet ⇒ no neutral; one placeable end ⇒ set it). The
solver SHALL propagate a deduction across a domino to its partner (an
excluded color on one end excludes the opposite color on the other).

#### Scenario: A generated board is uniquely solvable at its difficulty

- **WHEN** a board generated at difficulty `d` is solved from empty
- **THEN** the solver returns solved (1) at `d`, and — for a Normal board —
  fails to fully solve (0) at Easy

### Requirement: Magnets renders under the web geometry

The renderer SHALL draw the rounded-corner dominoes (per upstream
`draw_tile_col`), the `+`/`−` magnet symbols, the neutral cross, the blue
not-neutral `?`, singleton black squares, and the `+`/`−` clue counts on all
four borders (top = column `+`, bottom = column `−`, left = row `+`, right =
row `−`) with the corner `+`/`−` symbols, using the web build's
`NARROW_BORDERS` geometry (`BORDER = 0`, an `(w+2) × (h+2)`-tile canvas). The
mistake-overlay color SHALL be appended past the base palette. Every per-cell and per-clue overlay
(set / error / cursor / not-neutral / flash / mistake / clue-done) SHALL be
part of the render diff key so it repaints and clears correctly.

#### Scenario: A mistake overlay repaints on a later frame

- **WHEN** a cell is drawn, then `findMistakes` flags it on a subsequent frame
  without the cell's own value changing
- **THEN** the mistake overlay is painted on that later frame

### Requirement: Magnets offers an explained hint

Magnets SHALL implement `hint` as the recording projection of its graded
solver: the same ladder, run one firing at a time from the player's board, each
firing narrated with the premise that forced it. The hint SHALL start from the
player's placed dominoes and `?` marks, and SHALL refuse on a solved board or
one with mistakes.

A firing that places dominoes SHALL be one journey of placement legs, and one
that concludes dominoes cannot be neutral SHALL be one journey of legs that mark
them `?`, so every "cannot be neutral" fact a later step rests on is on the
board. A firing that concludes only that a square cannot hold + or − SHALL
advance the plan without being shown, because the board already says it: every
such fact follows from a placed pole beside the square, a line whose count is
met (counting each marked magnet lying along it as one + and one −), or the
same fact about the domino's other end, and a later step citing one SHALL name
it in those terms.

Following a leg through the game's own press cycle SHALL keep the plan: the
press on the way to the leg's value (a + before a −, neutral before a `?`) holds
the leg, and the press that lands it completes the leg.

#### Scenario: The hint finishes the board

- **WHEN** the player asks for hints on a fresh board of any preset and follows
  every step
- **THEN** the board is solved without a refusal

#### Scenario: A hidden fact is one the board shows

- **WHEN** the solver, run one firing at a time, rules + or − out of an
  undecided square
- **THEN** that square touches the same pole, lies in a line whose count for it
  is met counting marked magnets, or has a partner of which the same holds for
  the opposite pole

#### Scenario: Placing a − through its cycle keeps the plan

- **WHEN** a leg asks for a − and the player presses the square once, making it
  a +
- **THEN** the leg is held, and the second press completes it
