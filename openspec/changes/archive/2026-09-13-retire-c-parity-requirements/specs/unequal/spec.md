## MODIFIED Requirements

### Requirement: Unequal provides an explained deduction hint

The game SHALL implement `hint(state, aux?, ui?)`, returning a plan of
`HintStep`s that teaches the player the next deduction in pencil-notes terms,
working in a sound candidate cube **seeded from the placed givens/entries only —
never from the player's pencil notes** (a note can be wrong; that is what
`findMistakes` flags). The plan is built by walking a working copy of the board
the way a person solves it, preferring at each step:

1. a **naked single** — an empty cell whose live notes have collapsed to a single
   candidate (sound on a mistake-free board, since that candidate is then the
   solution) — placed via a `set` move; else
2. (after a lazy **populate** step that fills every empty cell's candidate notes
   via the existing fill-all `pencilAll` move, emitted only when some empty cell
   lacks notes) the **basic Latin** row/column eliminations a given or placed
   value implies, struck via `pencilStrike`; else
3. the next **clue elimination** — the Unequal-mode greater-than "link" bound
   deduction or the Adjacent-mode differ-by-1 deduction — a single technique
   *firing* striking the candidate(s) it rules out, via one `pencilStrike` move;
   else
4. a forced **placement** of a cell whose sound candidates have collapsed to one.

Each step SHALL carry a narration meeting the hint quality bar — leading with the
spotted indication (the inequality or adjacency pattern), then the reasoning, then
a necessity-voice conclusion ("must cross out the N" for an elimination, "can only
be N" for a placement) — phrased correctly at the degenerate value extremes (the
differ-by-1 clue narrates "exactly one away from N", not "N−1 or N+1"). A single
firing forcing several strikes SHALL be one journey (continuation legs flagged
`continuesPrevious`), and equivalent strikes of one firing SHALL share the target
hint color.

The trivial row/column eliminations a placement implies SHALL be governed by the
auto-pencil preference (read from `ui`): with it on they are folded silently into
the placement; with it off they are taught as explicit `continuesPrevious` strike
continuations.

The hint SHALL refuse (`{ ok: false, error }`) when the board is solved or when
`findMistakes` is non-empty, and refusal SHALL light the mistake overlay through
the engine's refusal→`findMistakes` coupling. The deduction SHALL be capped below
recursion (a guess is not a teachable note strike).

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
generator/solve path is unchanged, and one recorded deduction *firing* (one inequality link, or one
cell+direction adjacency clue) SHALL map to exactly one `group` so a hint step
never mixes clues.

#### Scenario: An inequality bound is taught as a note strike

- **WHEN** the player asks for a hint on a fully-penciled Unequal-mode board
  where a greater-than clue rules a value out of one of its two cells
- **THEN** the hint returns a step whose `pencilStrike` move clears exactly those
  candidates
- **AND** the narration names the greater-than relationship and the bounding
  cell's smallest/largest possible value, concluding in the necessity voice
- **AND** the clue's two cells are shaded and the struck candidates marked in the
  hint color

#### Scenario: An adjacency clue is taught in Adjacent mode

- **WHEN** the player asks for a hint on a fully-penciled Adjacent-mode board
  where a bar (or its absence) beside a filled cell rules a value out of the
  neighbor
- **THEN** the hint returns a `pencilStrike` step clearing those candidates, the
  narration stating that the two numbers must (or must not) differ by exactly one

#### Scenario: An empty board is populated before elimination

- **WHEN** the player asks for a hint on a board with no pencil notes
- **THEN** the first elimination is preceded by the fill-all populate step

#### Scenario: The hint resumes from a self-played mid-game position

- **WHEN** a hint is requested from a solvable, mistake-free board the player
  reached by their own notes and placements, in either mode
- **THEN** the freshly-recomputed hint makes progress and, applied step by step
  with recompute, leads to a solved board

#### Scenario: The hint refuses on a board with mistakes

- **WHEN** a hint is requested while `findMistakes` is non-empty
- **THEN** the hint refuses and the engine lights the mistake overlay

### Requirement: Unequal provides on-screen key labels

Unequal SHALL implement `requestKeys(params)` returning one button per grid value
`1..order` followed by a clear key (button code `8`, labeled `"Clear"`),
in both the inequality and adjacent (Adjacent) modes.

Faithful to upstream's `c2n`/`game_request_keys`, the value-to-button mapping
depends on the order: for `order < 10` the buttons are `'1'..'9'` (value `v` ⇒
char `'0' + v`); for `order ≥ 10` the keypad is `'0'`-based — `'0'..'9'` cover
values `1..10` and `'a','b',…` cover `11..order`. Each button's label is its own
character. Orders run 3..32, so the high range is genuinely reachable. (This
diverges from the shared `digitKeys` helper, which the other digit games use.)

#### Scenario: The keypad covers the grid's digits plus clear (order < 10)

- **WHEN** the key labels are requested for an order-4 Unequal board
- **THEN** the result is the buttons `1,2,3,4` followed by a clear key

#### Scenario: The keypad is '0'-based for order ≥ 10

- **WHEN** the key labels are requested for an order-11 Unequal board
- **THEN** the result is the buttons `0,1,…,9,a` (values 1..11) followed by a clear key
