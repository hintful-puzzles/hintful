## MODIFIED Requirements

### Requirement: Towers provides an explained, pencil-notes-based deduction hint

The game SHALL implement `hint(state, aux?)` and `hintKeepTrack(...)`, delivering
an explained hint that teaches Towers' candidate-elimination reasoning by setting
and striking pencil notes. The hint SHALL be the solver's own narrated deduction
script: `hint` runs the *recording* solver on a sound candidate cube **seeded
from the placed grid only** (never from the player's notes) and expresses the
resulting ordered operations against the player's live notes + grid as a sequence
of `HintStep`s of three kinds:

- a **populate** step (emitted only when some empty cell lacks notes) that fills
  every empty cell's candidate marks, via the existing fill-all (`pencilAll`)
  move;
- one or more **eliminate** steps, each a single technique *firing* that strikes
  the candidate(s) that firing rules out (a multi-cell firing is one step bearing
  a single `pencilStrike` move that clears those bits); and
- **place** steps that fill a cell whose sound candidates have collapsed to one.

The hint SHALL be expressed the way a person solves: at each step it SHALL prefer
a **naked single** — an empty cell whose live notes have collapsed to a single
candidate (sound on a mistake-free board, since that lone candidate is then the
solution) — ahead of any further elimination; otherwise the next clue elimination;
otherwise a forced placement. The trivial row/column ("this number already sits in
this line") eliminations a placement implies SHALL be governed by the auto-pencil
preference (below): with it on they are folded silently into the placement and not
emitted as steps; with it off they are taught as an explicit `continuesPrevious`
strike continuation. `hint` SHALL receive the game UI so it can read that
preference.

Each step SHALL carry a narration that meets the hint quality bar — leading with
the spotted indication (the clue/line pattern), then the reasoning, then a
necessity-voice conclusion — and a highlight that shades the **driving clue
cell(s)** and their line of sight (`COL_HINT_CELL`) so the player can see which
clue the hint is about, marks the target cell(s)/struck candidate(s)
(`COL_HINT`), with equivalent strikes of one firing sharing the target color.
The hint SHALL refuse (`{ ok: false, error }`) when the board is solved or when
`findMistakes` is non-empty, and refusal SHALL light the mistake overlay through
the engine's existing refusal→`findMistakes` coupling.

Every step SHALL be monotone progress (a note added by populate, a note removed by
eliminate, or a cell filled by place — never undone by the hint), so a
freshly-recomputed hint from any solvable, mistake-free mid-game position SHALL
make progress and lead to a solved board (the cross-game resume guarantee). On
recompute the script SHALL skip any operation whose effect is already on the
board and resume at the first that is not. `hintKeepTrack` SHALL advance the plan
when the player's move matches the displayed step's intent — a `pencilStrike`
clearing a subset of the step's marks is `onTrack` (the step shrinks in place) or
`completed` (the last is struck); a placement of the hinted value is `completed`
— and otherwise drop the plan to recompute (`off`).

The solver's recording mode SHALL be gated so that with recording off the
generator's solve path is unchanged, and the hint fixpoint SHALL be guarded by a step budget.

#### Scenario: A clue elimination is taught as a note strike

- **WHEN** the player asks for a hint on a fully-penciled board where a clue
  line-of-sight deduction rules a height out of one or more cells
- **THEN** the hint returns a step whose `pencilStrike` move clears exactly those
  candidates
- **AND** the narration names the clue pattern and states why those heights
  cannot sit there, concluding in the necessity voice
- **AND** the driving clue's line of sight is shaded and the struck candidates
  are marked in the hint color

#### Scenario: An empty board is populated before elimination

- **WHEN** the player asks for a hint on a board with no pencil notes
- **THEN** the first step fills the empty cells' candidate notes (the fill-all
  move)
- **AND** subsequent steps strike candidates and place cells

#### Scenario: A collapsed cell is placed

- **WHEN** a cell's sound candidate set has collapsed to a single height
- **THEN** the hint returns a `set` step placing that height, narrating that every
  other height is ruled out there

#### Scenario: The hint resumes from a self-played mid-game position

- **WHEN** a hint is requested from a solvable, mistake-free board the player
  reached by their own notes and placements
- **THEN** the freshly-recomputed hint makes progress (a strike or a placement)
  and, applied step by step with recompute, leads to a solved board

#### Scenario: The hint refuses on a board with mistakes

- **WHEN** a hint is requested while `findMistakes` is non-empty (a wrong tower or
  a note that excludes the truth)
- **THEN** the hint refuses with an explanatory message and the mistaken cells are
  highlighted

#### Scenario: A naked single is offered ahead of further elimination

- **WHEN** a hint is requested on a mistake-free board where some empty cell's
  pencil notes have collapsed to a single candidate
- **THEN** the next step places that height in that cell

### Requirement: Towers provides on-screen key labels

Towers SHALL implement `requestKeys(params)` returning one button per digit `1..w`
(labeled by the digit character) followed by a clear key (button code `8`,
labeled `"Clear"`).

#### Scenario: The keypad covers the grid's heights plus clear

- **WHEN** the key labels are requested for a `5×5` Towers board
- **THEN** the result is the buttons `1,2,3,4,5` followed by a clear key
