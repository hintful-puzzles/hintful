## MODIFIED Requirements

### Requirement: Pattern ports the per-line solver and gates generation on it

The port SHALL implement the per-line nonogram solver (the row/column fixpoint
that narrows each line against its run-length clue until no further cell is
forced) and a `generate_soluble` generator that produces a random grid and
accepts it only when it is **uniquely line-solvable** from its derived clues.
The solver SHALL be reused by `solve()` and `findMistakes`.

#### Scenario: Generated boards are uniquely line-solvable

- **WHEN** `newDesc` produces a board and the solver is run from its clues on an
  all-unknown grid
- **THEN** the solver completes to a single fully-determined grid (no remaining
  unknown cells, no contradiction)

#### Scenario: Solve recovers the unique grid

- **WHEN** `solve()` is invoked on a generated game
- **THEN** it returns the fully-solved `Full`/`Empty` grid

### Requirement: Pattern provides an explained, deductive hint

Pattern SHALL implement the Hint System hooks (`hint`, `hintKeepTrack`, and
rendering of the displayed step) to the explained-hint quality bar: each hint
SHALL teach *why* the move is forced by a recognizable nonogram line technique
(run overlap, line completion, unreachable gap, edge/anchor extension, or the
general single-line **intersection** — the cells forced in *every* arrangement of
one line's runs consistent with its marks), not merely state the move. Because the
generator accepts only boards uniquely solvable by the per-line solver with no
guessing, every shipped board is pure-deduction solvable and the hint SHALL never
reveal the stored solution or run a search.

A single line deduction that forces several cells SHALL be emitted as **one**
multi-cell `HintStep` whose move fills all of them (one firing = one step), with
each technique's forced set a single color so the step is understandable at a
glance. The narration SHALL lead with the indication (the clue and the spotted
pattern, in board terms) and conclude in the necessity voice (`must be` /
`must stay` / `are always`), never a bare state-of-being verb.

Every displayed step SHALL name a technique — the hint SHALL NOT emit a generic,
unexplained step (e.g. *"only one arrangement fits"*) for a deduction its named
techniques do not group. Where the elegant techniques do not cover a forced cell,
the plan SHALL narrate the general single-line **intersection** as an honest
deductive bottom rung (*"whichever way this line's runs fit, these cells must be
black / must stay white"* — the necessity voice of the explained-hint bar, never
the retired *"only one arrangement fits"* wording); being the per-line solver's
own fixpoint restricted to one line, that rung always exists for a generated
board, so the plan completes without any un-narrated step.

`hint` SHALL refuse with an error string when the board is already solved or when
`findMistakes` reports mistakes (the refusal lighting the mistake overlay and the
banner). `hintKeepTrack` SHALL return `"completed"` when the player fills the
last forced cell of the displayed step with the correct value, `"onTrack"`
(shrinking the step to the remaining cells) on partial progress, and `"off"`
otherwise.

#### Scenario: A hint explains a forced line deduction

- **WHEN** `hint` is called on an unsolved, mistake-free board with at least one
  deducible cell
- **THEN** it returns a step whose move fills every cell that one line technique
  forces, and whose explanation names the clue/pattern and concludes that those
  cells must be black (or must be white)

#### Scenario: No hint step is a generic un-narrated fallback

- **WHEN** the full hint plan is computed for any generated board
- **THEN** every step carries a named line technique (overlap, completion,
  unreachable, edge/anchor, or the single-line intersection bottom rung)
- **AND** no step carries a generic "only one arrangement fits" explanation

#### Scenario: The plan solves the board

- **WHEN** the full hint plan for any generated board is applied step by step
- **THEN** the board reaches its unique solution

#### Scenario: A hint refuses on a wrong board

- **WHEN** `hint` is called while `findMistakes` reports at least one mistake
- **THEN** it returns `{ ok: false }` with a message and the mistaken cells are
  highlighted

## REMOVED Requirements

### Requirement: Pattern generation byte-matches the C reference

**Reason**: Its whole content was the obligation that `newDesc` reproduce the C reference desc byte-for-byte against a committed gated differential, a porting-era concern the owner retired on 2026-09-13, when matching upstream's C stopped being a requirement.

**Migration**: None needed: what the generator must do is "Pattern ports the per-line solver and gates generation on it". The differential fixture may remain as a regression test; it is no longer a requirement.
