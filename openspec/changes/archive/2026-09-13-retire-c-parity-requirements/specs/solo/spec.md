## ADDED Requirements

### Requirement: Solo generates boards uniquely solvable at exactly the requested difficulty

`newDesc` SHALL generate a full solution grid satisfying all active constraints
(Latin rows/columns, sub-blocks, X-diagonals when `xtype`, killer cages when
`killer`; jigsaw blocks produced by the lazily-ported `divvy`), then remove givens
in symmetry orbits (per the `symm` mode) by re-running the graded solver, keeping a
board only when it is **uniquely** solvable at **exactly** the requested
difficulty, regenerating otherwise. Generation SHALL carry a capped-iteration
backstop that throws rather than hanging.

#### Scenario: Generated board is uniquely solvable at its difficulty

- **WHEN** a board is generated for given params
- **THEN** the graded solver solves it uniquely at the requested difficulty
- **AND** (for difficulties above the lowest) the solver fails to solve it one
  difficulty level lower

## MODIFIED Requirements

### Requirement: Solo solves with its bespoke graded solver

The solver SHALL be a self-contained port of upstream's `solver_usage` model: a
per-cell candidate cube plus per-constraint-group position grids, built from a
constraint-group list (rows, columns, sub-blocks, and — when `xtype` — the two
diagonals) so X-type and jigsaw fall out of the shared technique loops. It SHALL
implement, in difficulty order, the standard techniques (positional and numeric
elimination, block/row/column intersection, set elimination, extreme forcing
chains, and bounded recursion) and the killer techniques (single-cell sums,
min/max elimination, sum-combination enumeration, and cage/line intersection).
`solveSolo(...)` SHALL return the difficulty reached, or an impossible/ambiguous
sentinel.

#### Scenario: Solver grades a known board

- **WHEN** `solveSolo` is run on a generated board at its difficulty
- **THEN** it returns that difficulty and fills the grid with the unique solution

#### Scenario: Solver detects an inconsistent board

- **WHEN** `solveSolo` is run on a board with no solution
- **THEN** it returns the impossible sentinel

### Requirement: Solo provides an explained deduction hint

The game SHALL implement `hint(state, aux?, ui?)`, returning a plan of
`HintStep`s that teaches the player the next deduction in pencil-notes terms,
working in a sound candidate cube **seeded from the placed entries (givens and
player digits) only — never from the player's pencil notes** (a note can be wrong;
that is what `findMistakes` flags). The plan is built by walking a working copy of
the board the way a person solves it, preferring at each step:

1. a **naked single** — an empty cell whose live notes have collapsed to a single
   candidate (sound on a mistake-free board, since that candidate is then the
   solution) — placed via a `set` move; else
2. (after a lazy **populate** step that fills every empty cell's candidate notes
   via the existing fill-all `pencilAll` move, emitted only when some empty cell
   lacks notes) the **basic-region** eliminations a placed or given value implies —
   the digit struck from the rest of its row, column, sub-block (rectangular or
   jigsaw) and, on an X board, its diagonal(s) — via `pencilStrike`; else
3. the next **deductive elimination** — one technique *firing* (a positional or
   numeric single, a block/line intersection, a naked/hidden subset, a forcing
   chain, or — on a killer board — a single-square cage, a cage min/max bound, a
   cage sum-combination, or a deduced extra-cage) — striking the candidate(s) it
   rules out, via one or more `pencilStrike` moves linked as one journey; else
4. a forced **placement** — a naked single (the cell's own candidates have
   collapsed to one) or a positional/hidden single (a digit that fits only one cell
   of a row, column, sub-block or diagonal, the cell itself still showing several
   candidates), narrated and highlighted by *which* it is (the recorded reason
   conflates them, so the *why* is re-derived from the working board).

Each step SHALL carry a narration meeting the hint quality bar — leading with the
spotted indication (the firing region, named by its kind; a killer cage named by
its sum clue), then the reasoning, then a necessity-voice conclusion ("must cross
out the N" for an elimination, "can only be N" for a placement). A single technique
firing forcing several strikes SHALL be one journey (continuation legs flagged
`continuesPrevious`), and equivalent strikes of one firing SHALL share the target
hint color. When a single step names two or more board-element types at once, each
type SHALL carry a stable per-game color always paired with a non-color cue
(shade / ring / cross-through), per the cross-game hint color-legend convention.

The trivial region eliminations a placement implies SHALL be governed by the
auto-pencil preference (read from `ui`): with it on they are folded silently into
the placement; with it off they are taught as explicit `continuesPrevious` strike
continuations.

The hint SHALL refuse (`{ ok: false, error }`) when the board is solved or when
`findMistakes` is non-empty, and refusal SHALL light the mistake overlay through
the engine's refusal→`findMistakes` coupling. The deduction SHALL be capped below
recursion (`DIFF_RECURSIVE`) — a guess is not a teachable note strike — so on a
board only solvable by guessing the hint reports it cannot deduce the next move.

Every step SHALL be monotone progress (a note added by populate, a note removed by
a strike, or a cell filled by a placement — never undone by the hint), so a
freshly-recomputed hint from any solvable, mistake-free mid-game position SHALL
make progress and lead to a solved board (the cross-game resume guarantee); on
recompute the plan SHALL skip any operation already reflected on the board.
`hintKeepTrack` SHALL advance the plan when the player's move matches the displayed
step's intent — a `pencilStrike` clearing a subset of the step's marks is
`onTrack` (the step shrinks in place) or `completed`; a placement of the hinted
value is `completed` — otherwise drop the plan (`off`). `refreshHintStep` SHALL
drop a stored step's dead marks (or resolve the step) before each (re-)display so a
kept plan never tells the player to remove a candidate already gone.

The solver's recording mode SHALL be gated so that with recording off the
generator/solve path is **unchanged** (Solo's solver is its own, not the shared
`engine/latin.ts`, so the recording mode is added to Solo's own techniques), and
one recorded deduction *firing* (one region's elimination, one cage's pruning, …)
SHALL map to exactly one `group` so a hint step never mixes regions.

#### Scenario: A region elimination is taught as a note strike

- **WHEN** the player asks for a hint on a fully-penciled board where a placed
  digit, or a deductive technique, rules a digit out of a cell
- **THEN** the hint returns a step whose `pencilStrike` move clears exactly those
  candidates
- **AND** the narration names the firing region (row / column / sub-block /
  diagonal, or a killer cage by its sum clue) and concludes in the necessity voice
- **AND** the region's cells are shaded and the struck candidates marked in the
  hint color

#### Scenario: A killer-cage deduction is taught on a killer board

- **WHEN** the player asks for a hint on a killer board where a cage's sum clue
  rules a digit out of one of its cells
- **THEN** the hint returns a `pencilStrike` step naming the cage by its sum goal
  ("this cage must sum to V") and concluding in the necessity voice

#### Scenario: A positional single is named by its region, not the cell

- **WHEN** the hint forces a placement into a cell that still shows several
  candidates, because the placed digit fits nowhere else in its row (or column,
  block, or diagonal)
- **THEN** the narration names that region ("in this row, N can go in only this
  cell") rather than claiming every number is ruled out in the cell
- **AND** the whole region is shaded as evidence, with the cell marked as the
  placement target

#### Scenario: An empty board is populated before elimination

- **WHEN** the player asks for a hint on a board with no pencil notes
- **THEN** the first elimination is preceded by the fill-all populate step

#### Scenario: The hint resumes from a self-played mid-game position

- **WHEN** a hint is requested from a solvable, mistake-free board (standard, X,
  jigsaw or killer) the player reached by their own notes and placements
- **THEN** the freshly-recomputed hint makes progress and, applied step by step
  with recompute, leads to a solved board

#### Scenario: The hint refuses on a board with mistakes

- **WHEN** a hint is requested while `findMistakes` is non-empty
- **THEN** the hint refuses and the engine lights the mistake overlay

#### Scenario: The hint declines when only a guess remains

- **WHEN** a hint is requested on a board whose next move requires the recursion
  (Unreasonable) tier
- **THEN** the hint reports that it cannot deduce the next move rather than
  narrating a guess

### Requirement: Solo provides on-screen key labels

Solo SHALL implement `requestKeys(params)` returning the digit keypad for its grid:
one button per symbol `1..cr` (where `cr = c·r`), labeled by the symbol character
(`"1".."9"`, then `"a"`, `"b"`, … for `cr > 9`), followed by a clear key (button
code `8`, the backspace, labeled `"Clear"`).

#### Scenario: A 9-symbol board shows digits 1–9 plus clear

- **WHEN** the key labels are requested for a `3×3` Solo board
- **THEN** the result is the buttons `1,2,…,9` followed by a clear key

#### Scenario: A smaller board shows fewer digits

- **WHEN** the key labels are requested for a `2×2` Solo board
- **THEN** the result is the buttons `1,2,3,4` followed by a clear key

## REMOVED Requirements

### Requirement: Solo generates uniquely-solvable boards at the requested difficulty

**Reason**: It required the emitted desc to match the C reference byte-for-byte, or the differential to match C-recorded verdicts, with a scenario asserting it. That was a porting-era obligation: C compatibility is no longer a concern (owner, 2026-09-13), so a requirement may not hold the game to it.

**Migration**: Replaced by "Solo generates boards uniquely solvable at exactly the requested difficulty", which keeps generation, the difficulty gate and the backstop without the obligation to match upstream's C. The frozen differential fixtures remain as tests, not as a requirement.
