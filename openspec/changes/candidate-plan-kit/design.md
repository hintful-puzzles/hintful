# candidate-plan-kit — design

## 1. Survey (task 1.1)

Read on 2026-09-19 against `a28ef86a`, all six `buildSteps` side by side. The
proposal's four idioms were all there, and a fifth and sixth turned up.

| Idiom | Towers | Keen | Unequal | Solo | Group | Salad |
|---|---|---|---|---|---|---|
| premise stated beside the step (`reads`) | clue line only; **omits the struck cells** | cage ∪ cells | area ∪ **first cell's** marks | region ∪ cells | [op] ∪ reason area; **identity fill: one cell** | evidence ∪ cells |
| premise stated a third time (`availableStrikes`' callback) | area ∪ cells | same | per-op area ∪ op | same | same | same |
| `emitPlacement` | set, `reasonArea`, row/col cull | set, `placementArea`, row/col cull | set, hidden-line area, row/col cull | set, `placementArea`, **block/diag/cage cull**, dup shades the placed cell | `{cells}` move, always culls | `{value}` move, writes `holes`, enc bits |
| strike split | by height, **one height per turn** | by cell, whole firing | by cell, **one cell per turn** | intersect whole, else by cell | whole firing | far-arm by symbol, else by kind+cell |
| `lastStrikeGroup` | yes | — | yes | — | — | yes, **dead**: its split emits every leg at once, so the group never recurs |
| setup | lazy populate + obvious clean | same | same | same, cull regions | same | own populate (holes) + clean |
| rungs | singles, **lines**, strikes, places | singles, strikes, places | same | same | singles, **leads**, strikes, places (classified on `visibleCandidates`) | nakedSymbols, **markers**, strikes, places (hole ops filtered) |

Per difference, "would a game legitimately want it?":

- **The words and the evidence** — yes, always the game's (`placeWords`,
  `strikeWords`).
- **The move shape** — a dialect, already a parameter for keep-track
  (`CandidateMoveAdapter`); it gains `place`.
- **The regions a placement culls** — yes where a region forbids repeats
  without having to hold every value (Solo's Killer cage): `cullRegionsOf`.
- **The split axis** — yes, dictated by what the narration names singular:
  `strikeAxis`.
- **One leg per turn and `lastStrikeGroup`** — no. Nothing about Towers'
  heights or Unequal's link ends wants the frontier to take something else
  between two legs of one firing; that splits one deduction into two hints,
  against quality-bar rule 2. The firing is emitted whole and the tracking
  disappears.
- **The premise** — no. Every game meant "what the step shows", and three
  wrote something narrower.
- **Setup** — the default for five; Salad's populate has to know about empty
  squares, so `setUp` stays overridable.
- **The rungs** — the ladder is the same in all six (singles, own, strikes,
  places, with the own rungs in the note-free opening too), so the slot is
  fixed and only the own rungs are supplied.
- **Salad's hole symbols, Group's note-less classification and identity
  journey** — genuine: `singles`, `placeable`, `placed`, `shownNotes`,
  `placement`, `onPlace`. Each hook carries its one game-shaped fact in its doc
  comment.

## 2. Decisions

**D1. A firing is data, and the walk builds its steps.** A rung returns firings
as lists of legs (`place`, `strike`, or a game's own `step` with `apply`). The
walk builds each step from the game's words, adds the move, `targets` (the
move's cells, each once) and `marks`, pushes it and plays it on the working
board. The frontier reads a candidate's premise as `area ∪ targets` of those
same steps, built before the choice and reused by the take. There is no second
statement of the premise anywhere, including the `availableStrikes` callback,
which now reads the same steps.

**D2. The kit is `runCandidatePlan` with hooks, not a class the game drives.**
Every game's `buildSteps` became one call. The hooks are properties, so a
game's handler is checked strictly: a reason union without `DupReason` fails
to compile rather than narrating a cull it cannot name.

**D3. The walk lives in its own module, `candidate-plan.ts`.** It calls
`availablePlacements` (in `latin-hint.ts`, which imports `candidate-hint.ts`),
so keeping it in `candidate-hint.ts` would have made a value-level import
cycle.

**D4. Targets are deduplicated.** Unequal, Group and Salad listed a cell once
per struck value; Keen and Solo once. One cell, one target.

**D5. Not behavior-preserving, deliberately, in four games.** The proposal
said every step would be. Measured instead (below): Keen and Solo are
byte-identical; Towers, Unequal, Group and Salad changed order, because their
frontier now reads what the player is shown and their firings are no longer
split across turns. The instrument built for exactly this, `plan-continuity.ts`,
scores all four better, so the change is kept rather than engineered away.

## 3. Measurements

**Plan dump.** Every leaf preset × 3 seeds × auto-pencil on/off, following each
plan five steps and recomputing, up to 40 rounds: 6,490 hint calls, ~334k
steps (scratch harness, not committed). Keen 1097/1097 and Solo 1782/1782 plans
identical. In the other four no plan throws, and every walk ends exactly as
before: the same count of solved boards and of "nothing further follows"
refusals per game.

**Continuity** (`planContinuity`, every leaf preset × 6 seeds; avoidable jumps /
jumps, before → after):

| | before | after |
|---|---|---|
| Towers | 22/456 (4.8%) | 17/443 (3.8%) |
| Unequal | 86/1404 (6.1%) | 76/1385 (5.5%) |
| Group | 83/939 (8.8%) | 78/947 (8.2%) |
| Salad | 27/566 (4.8%) | 19/551 (3.4%) |
| Keen, Solo | unchanged | unchanged |

**Cost.** The plan dump took 48.8 s before and 48.3 s after on the same
machine; building steps before choosing costs nothing measurable.

**The new tests fail when they should.** Four planted defects in
`candidate-plan.ts` — premise read from targets only, later legs not flagged,
the cull never taught, the split axis ignored — each turned exactly one
`candidate-plan.test.ts` case red.

## 4. Combining the solver and the hinter

The owner asked whether mechanisms of the solver and the hinter could be
combined. For the candidate games the solver already *is* the one engine: the
hint runs each game's own solver with a recorder, and nothing in the hint
re-deduces. What was duplicated sat inside the hint projection, three times
per firing (§1's first two rows plus the steps), and this change removes it.
The seams that remain between the two, each read and each kept for a reason:

- **The placement cull reads the notes, not the solver's `dup` records.** The
  cube never holds what populate pencils in, so the notes carry candidates the
  solver's records know nothing about; a cull from the records would leave
  them standing.
- **Naked and hidden singles are classified on the notes, not taken from the
  solver's slice.** The slice says what the cube saw; the narration has to say
  what the player sees. The classifier throwing when the two disagree is the
  guard that a plan skipped a strike.
- **Towers' extreme-clue lines are detected in the plan, not recorded by the
  solver.** The solver reaches the same fact as a cascade of eliminations; a
  note-free placement journey is a way of showing it. The guide gave "keeps
  the solver byte-identical" as the reason, a byte-parity argument the project
  has released; the sentence now gives this one.
- **The `record*Deductions` wrappers stay per game.** Each is where a game says
  what its recording solver is seeded from (clues, cages, sign flags, Killer
  data, Salad's markers) — the soundness boundary — and the part they share is
  one `ops.push`.
- **Re-recording after every placement** is the plan's largest cost, but it is
  not a duplicate of anything, and no measurement has named it a problem.
