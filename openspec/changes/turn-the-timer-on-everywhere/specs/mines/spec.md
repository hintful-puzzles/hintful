## MODIFIED Requirements

### Requirement: Mines game implements the Game interface

The engine SHALL provide a registered `mines` game implementing `Game<MinesParams,
MinesState, MinesMove, MinesUi, MinesDrawState>`: a `w × h` grid concealing `n` mines, in
which the player uncovers squares, deduces from the revealed neighbor-counts where the
mines are, and flags them.

Params SHALL be `w`, `h`, `n` and `unique`, encoded `{w}x{h}n{n}[a]` (`a` = not unique),
with a custom `n%` form meaning "percentage of area". Six presets (9×9/10,
9×9/35, 16×16/40, 16×16/99, 16×30/99, 16×30/170), upstream's with the expert
board turned to draw taller than wide, SHALL be offered. `validateParams` SHALL
require `n ≥ 1` and `n ≤ w·h − 9`, and additionally `w > 2 && h > 2` when `unique`.

The game SHALL report `canSolve = true`, `canFormatAsText = true`, and `wantsStatusbar = true`.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 16, h: 16, n: 99, unique: true }` are encoded in full
- **THEN** the result is `16x16n99` and decoding it round-trips the params

### Requirement: The clock reflects the state of play

Mines SHALL leave when its solve timer runs to the engine's rule, stating only that a dead board holds it (`timerHolds`). The timer SHALL
therefore not run before the first click (there is no board yet), SHALL run during play, and
SHALL stop on death, on completion, and once the game has been completed even if the player
subsequently undoes. Solve on a live board SHALL complete it, so the game reports
solved-with-help and the timer stops. Elapsed time SHALL survive a save and restore.

#### Scenario: The clock starts on the first click

- **WHEN** a new Mines game is displayed and the player has not yet clicked
- **THEN** the clock is not running; it starts when the first click uncovers the board
