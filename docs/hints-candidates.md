# Hints for a game with candidate notes

This guide is for a game that imports
[`engine/note-taking-cell.ts`](../src/engine/note-taking-cell.ts): its player
pencils candidates into a cell, and its hint teaches by setting and striking
those notes, a placement being the moment a cell's notes come down to one.
Every other game skips it. It holds the candidate walk and what a game owes
it; the quality bar, the narration rules and the plan mechanics every hint
shares are in [`hints.md`](./hints.md), and how a step is drawn is in
[`hints-marks.md`](./hints-marks.md). The normative text is
[`engine-candidate-hints`](../openspec/specs/engine-candidate-hints/spec.md).

## What every game does

What a game with notes does beyond the skeleton, in order. The file that does
each of these the shared way is
[`unequal/index.ts`](../src/games/unequal/index.ts).

1. Take the cell's highlight, entry and pencil mode from
   `note-taking-cell.ts` (`pressNoteTakingCell`, `toggleNoteTakingMode`):
   [`mechanics.md`](./mechanics.md) § "Pencil marks: the full note-taking UX".
2. Give the move union `pencilAll`, `pencilStrike` and `pencilAdd`, applied by
   `applyNoteMove`, and a placement that carries the auto-pencil decision:
   § "Persist, populate, and the moves".
3. Declare `markAll` as a call to `adaptiveMarkAllMove`: § "A populate step
   never resets notes".
4. Pass the notes to `entryMistakes` in `findMistakes`, so a note that has
   crossed out its cell's answer is a mistake: § "Persist, populate, and the
   moves".
5. Carry `autoPencil` and `candidateReading` in the `Ui`, list
   `autoPencilPref` and `candidateReadingPref` in `prefs`, and choose the
   reading `newUi` starts on: § "Two readings of an unmarked cell".
6. Make the solver record its eliminations and placements, from the placed
   entries alone: § "The recorder and the soundness boundary".
7. Write `buildSteps` as one call to `runLatinCandidatePlan` (rows and
   columns) or `runCandidatePlan` (any other regions), handing it the
   recording solver, the words of a placement and of a strike, the strike
   axis and any rungs of the game's own: § "The shared candidate-hint
   machinery", § "The row/column preset".
8. Write `hint` as `candidateHint(state, ui ?? newUi(state), buildSteps)`,
   `hintKeepTrack` as `keepCandidateHintTrack` and `refreshHintStep` as
   `refreshCandidateHintStep`.
9. Run the guards the game has joined by doing the above:
   `hint-frontier.test.ts`, `candidate-reading.test.ts`,
   `firing-replay.test.ts`, `mark-all.test.ts` and `hint-resume.test.ts`,
   all in `src/engine/`.

## Sections

| Section | Read it when |
| --- | --- |
| The shared candidate-hint machinery | your game writes its `buildSteps`, or you need to know what the walk does and what the game supplies |
| A cell's regions are one definition | your game's values may not repeat in something other than a row and a column |
| A value's reach depends on the value | what a placed value rules out is not a fixed set of cells |
| A sentence names which kinds of region | your game has several kinds of region and a sentence must say which |
| A strike's words are a premise | your game writes `strikeWords`, or a strike's ending reads wrong |
| The row/column preset | your game is a plain Latin square, or you are choosing between the preset and `runCandidatePlan` |
| Moves or notes outside the Latin dialect | your moves are not `{ type: "set" }` with a `1 << n` note bit, or a cell cannot note every value |
| A rung of the game's own | a deduction of your game is not a recorded strike or placement |
| Continue from the last step | a plan jumps across the board, or `hint-frontier.test.ts` fails |
| The recorder and the soundness boundary | you thread a recorder through a solver, or decide what the solver may read |
| Record off a bespoke solver: thread or parallel | your solver is not `engine/latin.ts` |
| Deduce from the notes when the mistake check vouches for them | your hint would read the player's notes instead of a recording |
| A premise names everything its deduction reads | you write a recorded reason or its words, or `firing-replay.test.ts` fails |
| Persist, populate, and the moves | you add the note moves, the opening steps or the notes half of `findMistakes` |
| A populate step never resets notes | you write a fill-all move, a `setUp`, or a Mark-all press |
| Two readings of an unmarked cell | you add the `hint-notes` preference, choose its default, or a step rests on a cell with no notes |
| – Joining the preference | you add the `hint-notes` preference to a game |
| – Choosing the default | you set the reading `newUi` starts on, or your plan has a `setUp` of its own |
| – What the walk folds, and what a step owes it | a step under the implicit reading rests on a cell with no notes |
| Re-derive a placement's why | a placement is narrated as a single, or the classifier throws |
| Solve the way a human does | you choose a strike axis, add auto-pencil, or a clue forces cells with no notes needed |
| Placements lead when the deductions are placements | your game's signature deductions place values and strike none |
| A cell decided without a value in the grid | a conclusion of your game is a marker, or one note stands for a solver value that is never placed |
| Candidates that are not values | your candidates are directions, colors or anything but `1..n` |
| A solver that sweeps | your solver's techniques apply everything they find in one call |
| One deduction body, several clues | one solver routine intersects several clues at a cell |
| A walk a sentence claims is a walk the code takes | a sentence says that following something leads somewhere |
| A collapse the board cannot show | the solver's candidates are not what the player sees and marks |
| A candidate game off the shared walk | your board is not `0`-empty `(x, y)` cells on a grid of stride `w` |
| A graph, not a grid (Map) | your elements are regions of a graph |

## The shared candidate-hint machinery

Write `buildSteps` as one call to `runCandidatePlan`
([`engine/candidate-plan.ts`](../src/engine/candidate-plan.ts)), or to
`runLatinCandidatePlan` for a plain row/column Latin square (§ "The
row/column preset"). The walk owns the loop and builds every step; the game
supplies what carries its meaning. Exemplar:
[`keen/index.ts`](../src/games/keen/index.ts)'s `buildSteps`. Requirements:
"A shared candidate-elimination hint plan", "The walk owns the ladder", "The
walk builds every step from the game's words", "The game keeps what carries
its meaning".

What the walk does, so a game does not:

- **The ladder is fixed.** Naked singles, then the game's `rungs`, then the
  recorded strikes, then the recorded placements. A deduction of the game's
  own goes in `rungs`, never in a reordered ladder.
- **Until the setup is done only the singles and the game's `rungs` are
  offered**: the note-free opening, which holds the recorded strikes back.
  Under the implicit reading the setup is done unless a stale note waits for
  the obvious clean, so a fresh board has no opening and every rung competes
  from the first step ("The implicit reading opens only on a stale note").
- **A firing is data.** A rung returns firings as lists of legs
  (`Leg`: a placement, a strike, or a `step` of the game's own with an
  `apply`). The walk builds each leg's step from `placeWords` /
  `strikeWords` and adds the move, the `targets` and the `marks`, so none can
  disagree with the move. It reads `area` and `hatch` off the words
  (`evidenceOf`): a step cannot draw evidence its sentence does not name.
- **Each leg is played on the working board**, and after a placement the
  walk strikes the value from every cell it reaches: a leg continuing the
  journey, or silent under auto-pencil with the move carrying the same cull.
  A game writes no placement emitter of its own.
- **A firing is emitted whole**, its later legs flagged as continuing the
  journey. Do not emit one cell per turn and re-link by `group`: the frontier
  could take something else in between and split one deduction into two
  hints.
- **The choice of the next firing**, the budget and the cap (§ "Continue from
  the last step").

What the game decides, each a field of `CandidatePlan`:

- `record`, its recording solver, and `rungs`, its own deductions (§ "A rung
  of the game's own").
- `placeWords` and `strikeWords`, with `reads` for the cells a step's
  candidates rest on beyond those its words outline (a cage deduction stripes
  the cage and reads every cell of it).
- `strikeAxis`, how a firing's strikes split into legs (§ "Solve the way a
  human does").
- `regionsOf` and `reach`, where they are a decision at all (§ "A cell's
  regions are one definition", § "A value's reach depends on the value").
- The optional hooks `singles`, `placeable`, `placed`, `placement`, `onPlace`
  and `stuck`, each documented at its field with the game-shaped fact that
  needs it.

Pass `w` as the row stride only. The helpers read the board's length off
`grid`, so a board that is not square needs nothing more.

## A cell's regions are one definition

State which cells share a uniqueness constraint with `(x, y)` once, as the
plan's `regionsOf`, and nowhere else. The placement classifier, the obvious
clean, the placement cull, Mark-all and auto-pencil all read it, so they
cannot disagree. Requirements: "A cell's regions are one definition per
relation", "Every notes cull reads every declared region", "Only two kinds of
region are declared".

- A row/column game passes none: the preset supplies `rowColRegions(x, y, w)`
  from [`engine/latin-hint.ts`](../src/engine/latin-hint.ts).
- **Return every region a value may not repeat in, as a `CellRegion`, and
  flag each `holdsEvery`.** "Holds every value" and "forbids repeats" are two
  relations. A hidden single needs the first (a value with one home left
  must go there only if the region must hold it), and the classifier skips
  regions flagged `false`. The culls need the second. A region that only
  forbids repeats is declared `holdsEvery: false` and untagged, and the type
  refuses it the other way; without it the notes keep a value the solver
  struck, and a later single rests on a strike the player never saw.
- **A constraint a value may repeat under is not a region.** Leave an
  arithmetic cage out of `regionsOf` and keep its logic a deduction of its
  own.
- **A region need not be arithmetic on `y * w + x`.** A member list per
  partition root is a `CellRegion`, with `holdsEvery` the predicate the
  game's own solver already tests ("A candidate game's regions may come from
  a partition").

Exemplars: [`solo/index.ts`](../src/games/solo/index.ts)'s `regionsOf` (row,
column, block, diagonals, then the Killer cage as `holdsEvery: false`);
`romeRegions` in [`rome/state.ts`](../src/games/rome/state.ts) (areas from a
`Dsf`, `holdsEvery` only at four squares).

## A value's reach depends on the value

Where what a placed value rules out depends on the value, give the plan a
`reach(i, n)`: the cells an `n` at cell `i` rules `n` out of
(`Reach` in [`engine/candidate-hint.ts`](../src/engine/candidate-hint.ts)).
The walk reads it wherever it asks what a placed value rules out: the
placement cull, the obvious clean, a note-less cell's implied candidates, and
a fold's check of what an earlier fold placed. Requirements: "What a placed
value rules out may depend on the value", "The default reach is the cell's
regions".

- The default is `regionReach`, every cell of `regionsOf`, so a game whose
  rule is its regions passes nothing.
- `regionsOf` keeps the job that does not depend on a value: the regions a
  hidden single is found in.
- The relation must be symmetric. The helpers read the reach outward from
  each placed value, which equals asking what reaches a cell only when "two
  equal values may not stand together" runs both ways.

Exemplar: [`seismic/hint.ts`](../src/games/seismic/hint.ts), whose `reach`
asks the game's own `clashes` of every cell once.

## A sentence names which kinds of region

Where a sentence cites the kinds of region a value may not repeat in ("it
can't repeat in its row, column, block, diagonal or cage"), read the words
off the regions, as a `name` on every arm of the game's own `CellRegion`
type, never from a second list. Requirements: "A region's name is read off
the region", "A region's word is not the tag that names a hidden single", "A
citation repeats names, not regions".

- The name cannot ride the hidden-single tag: a region that only forbids
  repeats is untagged and still has to be named.
- Dedupe on the name, not the region: a cell on both diagonals says
  "diagonal" once.
- Where the sentence speaks for the whole board, take the union over the
  board, so a cell on neither diagonal is still told its notes were cleaned
  against them.
- The name is the game's, not the engine's `CellRegion`'s. A game with one
  kind of region says "this area" and carries no name; a game on the preset
  has a constant phrase.

Exemplar: `regionsOf` and `noRepeatRegionNames` in
[`solo/index.ts`](../src/games/solo/index.ts), guarded by
`solo-hint.test.ts` "solo no-repeat region names".

## A strike's words are a premise

Return from `strikeWords` a `Premise`
([`engine/hint-text.ts`](../src/engine/hint-text.ts)): the clause saying why
the values go, and no ending. The walk ends it with the plan's `conclude`
words for the move the step turns out to make: "so 2 and 4 must go" as a
strike, and under the implicit reading "so this cell must be 3" or
"so this cell can only be 1 or 5" (§ "Two readings of an unmarked cell").
The walk builds the reference: the struck values ("2 and 4") or "this cell",
never the clause, since a reference is what the player presses
(`hints.md` § "Keep the narration terse").
Requirements: "A candidate strike SHALL end in the walk's conclusion", "A
premise says how its conclusion refers to the struck notes".

- `conclude` comes from the preset's `notes` vocabulary, or from
  `candidateConclusions` in the game's own value words, or is written by a
  game whose values are not listable that way (Rome's, in the ways a square
  points).
- Two optional fields of the premise say how the ending refers to the
  struck notes: `where` for a strike that reaches past "this cell" ("from the
  other cells they pass through"), and `struck` where a list of values would
  misstate them. A premise that already named the values is still followed
  by them ("puts 2 in this cell, so the 2 must go"): "it" is no thing on the
  board to press.

## The row/column preset

A game whose values may not repeat in a row or a column, and nowhere else,
calls `runLatinCandidatePlan`
([`engine/candidate-plan.ts`](../src/engine/candidate-plan.ts)) and supplies
its recording solver, its rungs and its words. It is `runCandidatePlan` with
the answers a row and a column force filled in. Exemplar:
[`mathrax/index.ts`](../src/games/mathrax/index.ts)'s `buildSteps`.
Requirements: "A row/column Latin square answers no question its regions
already settle", "The fields the row/column preset supplies", "A game
reasoning over other regions cannot take the preset".

| Field | What the preset supplies |
| --- | --- |
| `regionsOf` | `rowColRegions(x, y, w)` |
| `singleReason` | `singleReasonOf`, the only inhabitant of that signature once the region is a `RowColRegion` |
| a hidden single's evidence | its own line, `hiddenSingleLine`; the game's `placeWords` still says why |
| the setup sentences and `conclude` | built from the game's `notes: { noun, placedVerb, value?, cell? }`. A game with a `setUp` of its own still gives `notes`, for the conclusions |

- **A game that differs is turned back by the checker.** The parameter type
  carries `NarratesSingles<Reason>`, which is `never` unless the game's
  reason union can hold the `SingleReason` the preset synthesizes. A game
  whose hidden single names a block or a diagonal calls `runCandidatePlan`,
  which every game may do, and says why in its change.
- **A game joins by calling it.** `hint-frontier.test.ts` finds the
  plan-walking games by the shape `CandidatePlan(` in their source and
  cross-checks against who imports the module, so nothing is declared.
- **The `hint` entry is shared**: `candidateHint(state, ui, buildSteps)`
  owns the preference defaults and the empty-plan refusal ("A shared
  candidate-elimination hint entry").
- **The generic Latin narration arms are shared.** `narrateLatinReason(reason,
  ns, vocab?)` in `hint-text.ts` owns `single`, `hiddenSingle`, `dup`, `set`
  and `forcing`; a game narrates its own arms and falls through to it.
  Exemplar: `narrate` in [`unequal/index.ts`](../src/games/unequal/index.ts).
- **The value vocabulary is a parameter**: `LatinVocab { noun, value(n),
  cell? }`. Omit it for plain numbers. The shared `dup` arm picks "a"/"an" by
  the rendered value; check a letter value `a` after "There's already…",
  which reads as the article.
- **Use the shared narrator when the only difference is the vocabulary, and
  keep a local `narrate` when an arm's shape differs** (it names a block as
  well, or one value where the shared arm lists several). One vocabulary
  cannot express a per-arm difference. A recorded local narrator conforms: "A
  shared narrator for generic Latin placements and strike premises", "A game
  whose generic wording diverges keeps its own narration". The same test
  decides any extraction here: ask, per field, what a game would legitimately
  do differently ([`doctrine.md`](./doctrine.md) § "Convention over
  configuration").

## Moves or notes outside the Latin dialect

Never rename a game's moves to fit the helpers: a save replays the move log,
so a discriminator rename breaks every existing save. Describe the
difference to the helpers instead
([`engine/candidate-hint.ts`](../src/engine/candidate-hint.ts)).
Requirement: "The shared track and refresh read a game's move dialect".

- **`CandidateMoveAdapter<M>`** for a move union that is not `{ type: "set" |
  "pencilStrike" | "pencilAll" }`: `read(m)` maps a game move onto the
  canonical `CandidateMove`, or `null` for "not one of these, so off-plan";
  `strike(marks)` builds a strike in the game's shape; `populate` writes its
  fill-all; `bit(n)` gives the mask encoding. `keepCandidateHintTrack`,
  `refreshCandidateHintStep` and the plan (`moves`) take it. Exemplars:
  [`group/index.ts`](../src/games/group/index.ts) (moves carrying a cell
  list), [`crossing/index.ts`](../src/games/crossing/index.ts) (a `kind`
  discriminator and candidate `n` at bit `n − 1`).
- **Emit the hint's placement as the game's native move**, so a player
  following the hint produces the exact move the plan expects. Add only the
  note moves the hint needs.
- **`NoteEncoding { bit?(n), values?, all?(i) }`** for the notes: `values` is
  the highest candidate a cell may note when that is shorter than the grid
  order; `all(i)` is the full note set of cell `i` where it is not
  board-wide (bounded by the grid edge, or by a region's size).
- **The game's own `pencilAll` is the authority for `all(i)`.** A populate
  that fills more than the player's Mark-all teaches strikes on notes the
  player never made. The converse is the input's: a note outside `all(i)`
  has no strike anywhere, so the game refuses it at entry
  ([`mechanics.md`](./mechanics.md) § "Pencil marks: the full note-taking
  UX").
- **`placed`, a grid distinct from `grid`**, for `availableFirings`,
  `availablePlacements` and `nextPlace`: "which cells are already decided"
  against "which cells can still take notes". Give it when a cell can be
  decided without a value written into the grid (§ "A cell decided without a
  value in the grid").

## A rung of the game's own

Put a deduction in the plan's `rungs` only when it makes a move the recorded
shapes have no room for, or reads the board with no recording. Ask first what
the rung writes: a deduction that only strikes notes is a recorded
elimination with an unusual reason, however it was reached ("A deduction over
a graph is a reason, not a plan shape"; Rome's `rungs` is empty). A rung is a
`CandidateRung`: called with a `RungContext`, it returns every firing it
could take now, and the frontier chooses. Its duties:

- **Offer only what the board supports.** The frontier takes whatever it is
  handed (§ "Continue from the last step").
- **Read `RungContext.shown`**, every blank cell's candidates as the player
  reads them, not the raw notes.
- **A rung that reads the notes waits for `RungContext.populated`**, which is
  the setup finished, clean included ("A rung sees the setup as finished only
  after the clean"). A rung that needs no notes fires in the opening.
- **A harder tier's rung fires only on `nothingEarlier`.** The frontier takes
  any rung's firing that continues the last step, so a harder technique would
  be taken over an easier one elsewhere and taught on a board the easier
  rungs certify. A recorded strike cannot do this, since the solver records
  the harder deduction only when the easier are spent; an own rung has to say
  so.
- **A hidden single of the game's own skips a cell whose notes are down to
  that value.** The shared classifier calls it naked, and the frontier would
  otherwise prefer the hidden one for its larger evidence.
- **A strike that rides as a later leg is also offered by itself.** The board
  can reach the state the leg tidies without the leg (the player makes the
  first move, or takes the first leg and goes their own way), and the plan
  recomputes there. `circledEmptyNotes` in
  [`salad/hint.ts`](../src/games/salad/hint.ts) is such a strike as a rung;
  `salad-hint.test.ts` pins both routes.
- **A placement-first game reads the walk's list**,
  `RungContext.placements()`, and does not decide availability itself (§
  "Placements lead when the deductions are placements").
- **Classify a trial rung by what its rejection can be, not by the fact that
  it trials.** A rung that places a candidate and asks whether the board
  survives may be one placement and one look, a Check
  ([`hints.md`](./hints.md) § "The forcing boundary"), and then every cell
  the same fact rules out is one firing. Seismic's `attempt` is the case.

Exemplars: `extremeClueLines` in
[`towers/index.ts`](../src/games/towers/index.ts) (note-free), the finders of
[`seismic/hint.ts`](../src/games/seismic/hint.ts) (reading `shown`, the
starve rung on `nothingEarlier`).

## Continue from the last step

A plan takes each next firing through a `HintFrontier`
([`engine/hint-frontier.ts`](../src/engine/hint-frontier.ts)), which prefers
a firing reading a cell the latest step wrote, then the step before, three
deep, and otherwise the ladder's first choice. `runCandidatePlan` does this;
a game does nothing but keep its premises true. Requirements: "A candidate
hint plan continues from its latest steps where it can", "The engine owns the
choice and reads a premise off the steps", "A firing is offered only when the
board shows its premise".

- **A firing reads exactly what its steps carry: `area ∪ hatch ∪ reads ∪
  targets`.** The walk builds a firing's steps before choosing and reads the
  premise off those. So a step that shades less than its deduction reads
  makes the plan jump: outline or `reads` every cell.
- **A single in a note-less cell reads the placed cells that rule its other
  values out.** The walk adds them to a `regionsFull` single's `reads`, and
  to a hidden single's the placed cells that rule the value out of each
  note-less cell of its line. Nothing draws them ("A single reads the placed
  cells it rests on through a note-less cell").
- **The standard rungs are vouched for by the shared listers**:
  `nakedSingles`; `availableFirings`, every recorded firing whose premise
  holds nothing the board has yet to show (§ "Solve the way a human does");
  `availablePlacements`, every recorded single the notes show as naked or
  hidden, and every placement with a reason of its own that
  `availableFirings` vouched for.
- **A single the notes do not show is taken only as the last resort**, and
  then the classifier throws (§ "Re-derive a placement's why"). The rung is
  told so by `nothingEarlier`: every earlier rung came up empty, not merely
  "nothing to strike", since a marker or single on an earlier rung may be the
  premise it waits on.
- **Setup is outside the frontier.** The default is `populateThenClean`,
  built from the plan's `notes` words. A `setUp` of the game's own says
  whether it is `done`, not only whether a call did something.

Guard: `hint-frontier.test.ts` reads each plan through
[`engine/testing/plan-continuity.ts`](../src/engine/testing/plan-continuity.ts)
and bounds the jumps that passed over a firing that continued, under every
reading the game offers. A reading over the bound sits in the test's
`OVER_BOUND` ledger, which asserts it is still over.

## The recorder and the soundness boundary

Seed the recording solver from the placed entries only, never from the
player's notes. A note can be wrong, and a wrong note fed back as a fact lets
the solver prove nonsense. Requirement: "A recording solve reads the placed
entries and never the notes". The notes are used to diff (which
already-true elimination to show next, what is done) and to render. The one
exception is § "Deduce from the notes when the mistake check vouches for
them".

- **Record off the candidate cube.** Thread a `DeductionRecorder`
  ([`engine/deduction-record.ts`](../src/engine/deduction-record.ts)) through
  the generic deductions and the game's own, so each candidate cleared
  (`elim`) and each cell placed (`place`) is recorded in solver order with
  its reason and premise.
- **Gate every reason allocation and record on `solver.recorder`**, so the
  generate and solve paths are unchanged. The game's differential test is
  the check.
- **Turn the recorder on after the givens are seeded.** Seeding is not a
  teachable deduction.
- **One `group` id per firing**, bumped once per top-level deduction attempt.
  Bumping per pass gathers unrelated firings under one narration
  ([`hints.md`](./hints.md) § "Recording the deduction"). A test that a
  step's targets lie inside the area it shades catches this where the words
  and the solved board do not.
- **Run it at the board's own difficulty, deductive only**, capped below
  recursion: a guess is not a teachable strike.
- **A placed marker the mistake check flags counts as placed.** A game that
  settles a cell with a marker seeds the cube from the grid and the markers.
- **The hint never writes the state.** A shared structure read through an
  accessor that mutates as it reads (a `Dsf` compressing paths) breaks
  `hint-resume.test.ts` "hint() leaves the state unchanged": compress once
  when it is built.

Exemplar: `recordUnequalDeductions` in
[`unequal/solver.ts`](../src/games/unequal/solver.ts) over
[`engine/latin.ts`](../src/engine/latin.ts).

## Record off a bespoke solver: thread or parallel

A solver that is not `engine/latin.ts` records one of two ways. Pick by
whether the deduction logic is cheap to run again.

- **Cheap: write a parallel recorder**, separate code from the grading path
  that reuses its building blocks. The generate, solve and `findMistakes`
  paths never call it, so they are unchanged by construction and no flag is
  threaded. Each ladder pass returns after its first firing and bumps the
  group; the recorder loops to a fixpoint. Exemplar:
  `recordUndeadDeductions` in
  [`undead/solver.ts`](../src/games/undead/solver.ts).
- **Not cheap: thread a gated recorder through the live solver.** Hold a
  nullable `recorder`, set only after the givens are placed, and gate every
  behavioral change on it. Exemplar:
  [`solo/solver.ts`](../src/games/solo/solver.ts).

When threading:

- **Bump `group` at the top of the main loop** where the loop already
  restarts after a technique's first firing. A pass that accumulates over
  several regions before continuing breaks after the first when the recorder
  is set, and only then.
- **Record only the deduction whose premise the working board cannot
  recover.** A deduction the plan can re-derive from the board needs no
  recorder, which keeps the gated surface small. Exemplar: the border scan
  in [`salad/solver.ts`](../src/games/salad/solver.ts), the one function
  Salad records.
- **Record placements only; the walk recomputes each placement's cull** from
  `reach`, so a solver need not record `dup` strikes.
- **More kinds of region mean a richer reason union and the game's own
  `regionsOf`**, which the classifier runs over. Only a placement the board
  cannot re-derive (a cage-sum forcing) keeps its recorded reason.
- **A slow variant's hint walk takes no timeout of its own**
  ([`testing.md`](./testing.md) § "Seed-deterministic, never clock-gated").
  `hint-resume.test.ts` walks one preset per declared tier; breadth across
  variants that are not tiers stays in the game's own hint test.

## Deduce from the notes when the mistake check vouches for them

A hint may deduce from the player's own notes, with no recording, only when
the game's `findMistakes` flags any empty cell whose notes have crossed out
its answer. The hint refuses on a flagged board, so wherever it runs every
cell's notes still hold its answer, and a single read off them is as sound
as one read off the solver's candidates. Check the premise before copying
the shape: where the mistake check ignores notes, § "The recorder and the
soundness boundary" holds in full. A game adopting this adds the notes half
of `findMistakes` in the same change.

- **`record` returns nothing, and the game's rungs read
  `RungContext.shown`**: the notes, or under the implicit reading what a
  note-less cell's reach leaves it, which always holds the answer too.
- **Hold each finder to the solver's rung by a test.** A finder is the
  one-firing form of a solver rung that sweeps; the test compares what it
  strikes with what the solver's rung rejects at every point it is the next
  step, and every note the plan writes with what the solver leaves there.
  That is what makes the hint a projection and not a second solver.
- **Share the arithmetic, not only the rule.** Where a technique counts,
  put the counting in one function that the solver's rung and the hint's
  finder both call, and test its claim against a brute-force enumeration,
  not against itself. Exemplar: `runsForce` in
  [`abcd/solver.ts`](../src/games/abcd/solver.ts), `abcd-hint.test.ts`.

Exemplars: [`seismic/hint.ts`](../src/games/seismic/hint.ts) with
`seismic-hint.test.ts`; [`abcd/hint.ts`](../src/games/abcd/hint.ts).

## A premise names everything its deduction reads

A step's premise must name every cell whose candidates or placed value its
deduction read. The walk offers a recorded firing once its premise shows
nothing the board has yet to show, so a step that leaves a cell out is
offered while that cell may still say otherwise, and its sentence is false on
the player's board while every other test passes. Requirements: "A recorded
firing's premise SHALL name every cell its deduction reads", "A recorded
reason carries the cells its words do not name".

- **Absence is read too.** "4 can only go in these cells of these columns"
  reads every other cell of the columns. A naked set reads only its own
  cells; a hidden set and a fish read the rest of their lines. "Only this
  mark leads into the group" reads every square around the group.
- **Where the words cannot say it, the solver does.** A recorded reason may
  carry `reads`, the cells its deduction reads beyond what the words outline;
  the walk adds them to the premise and, under the implicit reading, writes
  their notes first. Words that already name the cells need nothing more.
- **A read the player must check is drawn, not only carried.** `reads` shows
  nothing. A value confined across several lines stripes them through
  `confinedPremise` (`engine/hint-text.ts`); a solver with such a rung
  records the lines as `ConfinedLines` (`engine/latin.ts`) and calls it ("A
  value confined across several lines shows the lines").
- **A fish has two readings; name the smaller.** `k` columns holding a value
  in only `k` rows is also the other rows holding it in only the other
  columns. Pick by count when recording (`confinedSet` in `latin.ts`), and
  test each way round.
- **Say what the sentence rests on, not what the solver's state is.** A cage
  the solver has shrunk by filling cells is still the cage the player sees,
  so "the rest of this cage is filled in" reads those cells.
- **A derived fact the solver keeps is a fact the hint must teach.** Before
  narrating state a solver carries between passes, ask whether the player
  could write it down. If not, derive it afresh each pass, so every use is
  one step from the board, and narrate it from where it came from. What the
  solver loses goes to a tier the hint does not teach
  ([`hints-marks.md`](./hints-marks.md) § "Give the facts a
  notation").

Guard: `firing-replay.test.ts` audits every candidate walk through
[`engine/firing-replay.ts`](../src/engine/firing-replay.ts): it returns
every cell outside a step's premise to where the recording started and runs
the firing's technique again ("The engine audits a premise by replaying its
firing"). What a game owes it:

- A solver on `latinSolver` takes part with no code. A bespoke one writes a
  `ReplayAdapter` (Rome's, Solo's).
- **The replay runs one technique, not the ladder**, so a rung reads nothing
  a rung before it left behind in the same pass: work such state out from
  the board inside the rung.
- An adapter whose replay does not make the recorded firing again from the
  untouched state fails the guard as `unreproduced`, before any premise is
  judged with it.
- A technique that reads more to decide whether to fire than its conclusion
  rests on is flagged though its premise is honest: ledger the gate in the
  guard against a pinned board ("A technique that reads more than its
  conclusion rests on is pinned").
- Where the audit cannot reach a read (it counts what it tested), hold it
  with a recording test in the game's own hint test.

## Persist, populate, and the moves

Express the plan against the live notes, and skip every operation the board
already shows, so a fresh plan resumes from any mid-game position. The walk
does this; a game supplies the moves it is written in.

- **`pencilAll`** is populate: the fill-all move the Mark-all press makes, so
  the hint's start is a state the player can reach by hand. It fires only
  when some empty cell lacks notes, and only adds (§ "A populate step never
  resets notes").
- **`pencilStrike { marks }`** clears a list of candidate bits atomically. A
  `set { pencil }` toggle is one cell and not idempotent, so a strike
  re-applied would add the candidate back; `pencilStrike` makes one firing
  one step, idempotent and safe on resume.
- **`pencilAdd`** writes notes into a note-less cell under the implicit
  reading ("The plan writes notes through a move that only adds").
- **A placement is the game's real `set`.** `applyNoteMove`
  ([`engine/candidate-hint.ts`](../src/engine/candidate-hint.ts)) applies the
  three note moves.
- **`keepCandidateHintTrack`** judges a pencil toggle that clears a subset of
  the step's marks as `onTrack` (the step shrinks in place) or `completed`, a
  placement of the hinted value as `completed`, and anything else as `off`
  ("A candidate step is completed by the move that makes it whole").
- **The opening clean is one step, not part of populate.** `pencilAll` fills
  every candidate, so a cell can show a value the givens already exclude, and
  the recording never strikes it. Keep `pencilAll` a plain fill.
  `emitObviousCleanStep` strikes every such note in one `pencilStrike`,
  continuing the populate when it follows one and standalone otherwise. It
  fires once, as a step of the walk, so it also cleans a board the player
  noted. A game writing its own `setUp` keeps the order `populateThenClean`
  has ("Candidate-elimination hints clean obvious candidates at populate",
  "The obvious-candidate cleanup is one strike step").
- **The clean is a setup step**, several cells and several values. Exempt it,
  by its rung `clean` (and the fill by `populate`), from a per-firing test
  that a strike's marks share one cell or one value, or that every step uses
  the necessity voice.
- **A placement's cull continues its journey**: a strike step after the
  placement ("a 5 now sits in this row and column, so strike it from these
  notes"), or silent under auto-pencil ("A placement's cull continues its
  journey").
- **Notes are markings `findMistakes` checks.** Flag an empty cell whose
  non-empty notes exclude its answer, as `kind: "note"`; notes with extra
  candidates are ordinary. Pass `notes` to `entryMistakes`
  ([`engine/entry-mistakes.ts`](../src/engine/entry-mistakes.ts)). A note
  claims its value is still possible. A game whose notes have no stated
  meaning decides this before its hint, since a candidate hint cannot read a
  note it cannot trust.

## A populate step never resets notes

`pencilAll` is additive: it fills only cells with no mark yet. The hint's
opener and the Mark-all press both use it, the press through
`adaptiveMarkAllMove`
([`engine/candidate-hint.ts`](../src/engine/candidate-hint.ts)), so a press
only ever adds or removes. A fill that resets every cell throws away the
player's deductions as soon as one cell is blank.

- **The plan's working copy mirrors the additive fill exactly**, or the plan
  teaches strikes on candidates the player already crossed out. `lazyPopulate`
  does.
- A resetting move kept in the union for the replay of saved move logs is
  documented at its arm as unreachable from input.
- Guard: [`engine/mark-all.test.ts`](../src/engine/mark-all.test.ts), which a
  game joins by declaring `markAll`. A test of this rule must narrow a cell
  by hand: a resetting fill writes back exactly what was there otherwise.

## Two readings of an unmarked cell

How a blank cell with no notes reads is the player's choice, and the walk
owns both answers: `CandidateReading` in
[`engine/candidate-hint.ts`](../src/engine/candidate-hint.ts), set by the
`hint-notes` preference, `candidateReadingPref` in
[`engine/pencil-prefs.ts`](../src/engine/pencil-prefs.ts). Requirements: "A
candidate hint plan reads an unmarked cell the way the player chose", "The
implicit reading writes the notes a firing rests on", "A strike from one
note-less cell is folded", "A game states the reading it starts on".

- **`populate`**: not filled in yet. The plan pencils every candidate in
  first, cleans the obvious ones, and reads the notes alone from then on.
- **`implicit`**: every value its regions do not already hold. There is no
  populate step. A firing first writes the notes of each blank, note-less
  cell it outlines or `reads`, one `pencilAdd` leg each in the engine's
  words, and a note-less cell whose regions hold every other value is the
  `regionsFull` single, narrated as that.

### Joining the preference

A game joins by having: a `candidateReading` field in its `Ui`;
`candidateReadingPref` in its `prefs`; the reading passed through
`buildSteps` to the walk; `ui ?? newUi(state)` in its `hint`, so a caller
with no `Ui` gets the game's own default; and a `pencilAdd` arm in its move
union and `executeMove`. `candidate-reading.test.ts` finds the population by
the `Ui` field and walks each game's other reading, which every other hint
guard misses. Under both readings it holds every blank cell a step outlines,
`reads` or strikes from to showing notes when the step is spoken. It cannot
see a `reads` a new cage rule forgot to declare: that is the game's to
state.

### Choosing the default

The convention, `DEFAULT_CANDIDATE_READING`, is `populate`: where clues or
cages drive the deductions nearly every cell ends up needing notes, and
writing them a cell at a time costs more than one populate. A game whose
plan is shorter under the implicit reading overrides it in `newUi` and says
why there. **Measure before choosing**: over every leaf preset at several
seeds, the steps of the implicit plan over the populate plan, and the share
of cells the implicit plan writes notes into. `hint-frontier.test.ts` walks
both readings, so the continuity bound holds whichever is the default.

**A game with a `setUp` of its own walks the populate reading only**, and
the walk refuses it the implicit one ("A plan's setup declares the reading
it walks"). Its rung list leaves out `note` and `regionsFull`
(`LATIN_POPULATE_RUNGS`; [`hints.md`](./hints.md) § "Name the rung a step
speaks"). So does a game where no region rules a candidate out, whose
implicit reading would be a populate done one cell at a time.

### What the walk folds, and what a step owes it

**A strike from one note-less cell is folded into its conclusion.** When a
strike's marks lie in one blank, note-less cell and its premise has no
`where`, the step ends in the move the board calls for: "…differ by 3, so
this cell must be 2", or "…so this cell can only be 1 or 4". The limits:

- A cell an earlier leg of the firing reads is noted first and struck as
  written, since its candidates are that leg's premise. A cage firing notes
  the cage's other cells, folds the first, and strikes the rest.
- A strike with a `where` never folds: it speaks for cells other than "this
  cell".
- A later fold sees an earlier fold's placement in the same firing
  (`candidate-plan.test.ts` pins the shape).
- The populate reading never folds ("Nothing folds under the populate
  reading").

**The note legs cover every cell a step's candidates rest on**: the outlined
area, the struck cells a fold does not write, and `reads`. So a step whose
sentence names a region but reads its cells (a cage, an arrangement line)
declares them as `reads`, and a generic set outlines its subset ("A set
outlines the cells it rests on"). A hatched line is not read: a hidden
single says no other cell of the line can take the value, and each of those
shows it by its own regions. A journey may outline cells its later legs
place: the walk writes no notes for a cell from the leg that places in it
on ("A cell a leg places in takes no notes from that leg on").

## Re-derive a placement's why

Classify a placement recorded as a plain `single` from the working board
when the step is built; never trust the recorded reason. `engine/latin.ts`
records every forced placement as `{ kind: "single" }`, but that covers a
naked single (the cell's notes are exactly `{n}`) and a hidden single (no
other empty cell of a region still has `n`, while this cell still shows
several). Narrating a hidden single as "every other number has been ruled
out in this cell" is false on the board. Requirements: "A candidate hint
distinguishes naked and hidden singles", "A naked single shades its cell and
a hidden single its region", "A placement is classified against the
candidates the board shows".

- The walk classifies with `classifyPlacementInRegions`
  ([`engine/latin-hint.ts`](../src/engine/latin-hint.ts)) over the game's
  `regionsOf`; `classifyPlacement` is the row/column form and
  `singlePlacementReason` maps the answer to the `single` / `hiddenSingle`
  reasons.
- A hidden single names its region ("Every other cell in this row rules out
  3, so this cell must be 3") and shades the whole of it.
- Reclassify only a recorded `single`. A placement with a reason of its own
  (a clue, a cage) keeps it.

**The classifier throws when the placement is neither.** The notes then show
a candidate the solver ruled out, so the plan skipped a strike the placement
rests on ("No narration exists for a placement the notes cannot explain").
There is no weaker arm to fall back on, and a game adds none. When it
throws, check:

- Every placement strikes its value from the notes it reaches, a multi-cell
  fill included.
- Obvious culls come before any placement the plan classifies, including
  those left by a player who placed a value without striking it.
- A cell with no notes shows the values its regions leave it. The walk
  classifies against `impliedNotes` and hands the same view to a game's
  rungs as `RungContext.shown`; reading a note-less cell as holding nothing
  passes every placement as a hidden single.
- A recorded strike was dropped that no step of the game's own teaches (§ "A
  cell decided without a value in the grid").

Guards: `latin-hint.test.ts`, and `hint-resume.test.ts` "a Latin-family
placement never falsely claims a naked single".

## Solve the way a human does

Do not express the recorded script verbatim. The walk takes, on a working
copy of the board, the move a person makes next: a naked single, else an
elimination worth teaching, else a forced placement. What a game decides
within that:

- **Auto-pencil is a preference, default off**, that strikes a placed value
  from the cells it reaches. Bake the decision into the move at
  `interpretMove` (`set { autoElim }`, read off the `Ui`), so `executeMove`
  stays pure and replay is deterministic. `Game.hint` takes the `ui` to read
  it; `candidateHint` passes it to the plan as `autoClean`. On, the cull is
  folded into the placement; off, it is taught as a continuing strike. A game
  without the preference teaches every cull.
- **A recorded firing is offered by its premise, never by its position in
  the recording.** The recording ran on the solver's candidates, which are
  ahead of the board by the marks it does not show yet: a strike still live
  in the notes, and a placement whose cell is still empty, with every cell
  its value reaches that still shows it. A recorded strike, or a placement
  with a reason of its own, is available when the cells its step reads hold
  none of those (a placement's own cells aside). The rule is
  `availableFirings`; "The marks a recorded firing waits on", "No recorded
  firing waits on its place in the recording". So a step's premise names
  every cell it rests on: a clue rung reading the values along its line
  hatches the line (§ "A premise names everything its deduction reads").
- **Show a clue that forces cells outright as one placement journey, before
  populate.** A clue at an extreme value can force a line with no notes
  needed; the solver reaches it as a cascade of eliminations. Detect it in
  the plan, off the clues, as a note-free rung of the game's own: first leg
  unflagged, the rest continuing and narrated tersely. Populate is lazy, so
  it comes only when an elimination first needs something to cross out.
  Exemplar: `extremeClueLines` in
  [`towers/index.ts`](../src/games/towers/index.ts); guard
  `towers-hint.test.ts` "populates before the first elimination".
- **The strike axis follows what the narration names singular.** State it as
  the plan's `strikeAxis`; the walk splits the firing into legs and flags
  them. A firing whose sentence names one value ("a tower of height 5…")
  splits by value: one step striking two values under it contradicts the
  sentence. A firing whose premise is a whole region (a cage) splits by
  cell, the shaded region constant across the journey, and a list of values
  within a leg is fine. A firing whose premise names one digit across cells
  is one multi-cell step. Exemplars: `(op) => op.n` in
  [`towers/index.ts`](../src/games/towers/index.ts), the cell in
  [`keen/index.ts`](../src/games/keen/index.ts); guards `towers-hint.test.ts`
  "a strike step never mixes heights", `keen-hint.test.ts` "a cage-strike
  step's marks all lie in one cell".

## Placements lead when the deductions are placements

Where a game's signature deductions place values, lead with them and
populate only when an elimination is the next thing to teach: a rung of the
game's own offers `RungContext.placements()` ahead of the strikes, in the
note-free opening too ("A game's rung reads the walk's recorded
placements"). That list is every recorded placement whose premise the board
supports and, until the notes are set up, every single the board shows.
Exemplar: `leads` in [`group/index.ts`](../src/games/group/index.ts).

- **Never gate populate on a strike being available.** A strike counts only
  where its candidate is in the notes, so with no notes there is none, and
  the plan deadlocks.
- **A placement that forces others is one firing.** Give the plan a
  `placement` hook returning the whole journey, the cell that revealed it
  shaded on every leg, not one hint per forced cell.
- Placing first means classifying on a board with few notes: the obvious
  clean runs ahead of the placement arm, and a note-less cell reads by what
  its regions leave it (§ "Re-derive a placement's why").
- **A fill-all move the hint needs may be added as a real play move**, with
  the owner's agreement, since the populate step must be one a player can
  make by hand. The press is `Game.markAll`, which the midend answers, so no
  game's `interpretMove` takes a key for it.

## A cell decided without a value in the grid

Where a conclusion settles a cell with a marker (this square is empty, this
square is not), it is a move the canonical shapes have no room for, and the
game handles it at four sites. Exemplar:
[`salad/hint.ts`](../src/games/salad/hint.ts).

- **The plan takes it as a `step` leg** from a rung of the game's own, with
  its own `apply`, and overrides `singles` and `placeable` where a lone note
  or a recorded placement is a marker and not a value.
- **The adapter reads the marker move as `null`**, and the game's
  `hintKeepTrack` and `refreshHintStep` judge it before delegating.
  `refreshHintStep` resolves a marker step from the marker array: the shared
  placement arm waits for `grid[cell] !== 0`, which never comes.
- **The plan gives `placed`**, the cells already decided, since a cell
  settled by a marker stays blank in `grid`. Judging by `grid` alone leaves
  that operation unmade for good and holds back every firing whose premise
  reads the cell.
- **The soundness boundary is the grid and the markers**: a marker is an
  entry the mistake check flags when wrong, so the working cube may assume
  it. Notes still never seed it.

Three rules that go with it:

- **Find where the game's values are uniform, and put the collapse only at
  the edge.** In the solver's cube the marker's value is a symbol like any
  other; only the player-facing projection differs (one note while
  undecided, a marker once settled, never a grid entry). Look for that
  uniform view before widening a shared helper: a helper only asks which
  note bit a placed value occupies.
- **Re-derive a marker's why from the visible board, cheapest first, with no
  weak arm to fall back on**: a line's counts, then the cell's own notes. A
  marker the solver forces that neither explains rests on a skipped strike,
  so the plan throws (`assertEveryMarkerExplained`), as the placement
  classifier does.
- **Drop a recorded strike only for the rung that says the same thing, and
  name that rung.** A strike no step of the game's own teaches stays a
  strike of the note, or the note stays on the board and a later single
  never shows as one.

A sweep that finds a fallback unused covers only the tiers it dealt: deal
the tiers only the Custom dialog offers before retiring an arm on it.

## Candidates that are not values

The walk scans a dense ordinal, `for (v = 1; v <= values; v++)`, and a
`Mark.n` carries it. A game whose candidates are bits, directions or colors
gives a `NoteEncoding` saying how the ordinal maps to its note bit (`bit` as
a lookup, `values` the count) and never passes its bits as values:
`nakedSingles` would test `pencil & 12` on its way past. Exemplar:
[`rome/hint.ts`](../src/games/rome/hint.ts).

- **Name a candidate by its word and its relation, not its glyph**: "up",
  "the square above", "point straight back". A glyph is smaller in prose
  than on the board. `LatinVocab` is not widened for it; a game whose arms
  name an area where the shared narrator names a row and column writes its
  own.
- **Project a packed cell onto "`0` means undecided" only with the argument
  that an undecided cell is exactly `0`**, written beside the projection.

## A solver that sweeps

A technique that sweeps every line and applies all it finds in one call owes
the hint a finder that yields one line's firing at a time
([`hints.md`](./hints.md) § "A rung is not a premise, so return per
premise"). The plan owns the order: a rung returns every firing it can take
now and the frontier chooses, so the order a solver sweeps in never reaches
the player and nothing about ordering is added to the walk. Exemplar:
`satisfiedLines` and `packedLines` in
[`abcd/hint.ts`](../src/games/abcd/hint.ts).

- **A counting argument fits one step when the picture carries the parts.**
  Hatch the line through its clue, draw the count the sentence reads in the
  action color, and outline the cells that can still take the value; the
  sentence then says only the count and the conclusion ("This row needs 3
  Ds, and the outlined cells fit only 3 apart, so each stretch is full: this
  cell must be D.").
- **Before teaching the walk a new memory layout, ask whether the game's
  layout is a decision about the puzzle.** Store notes as a bitmask per cell
  and an empty cell as `0`, whatever the moves name: a move may keep naming
  a value by the index a save replays.

## One deduction body, several clues

Where one solver routine intersects a cell's candidates with several clues
and commits what survives, split it per clue before narrating. A step saying
"the 7+ clue means…" while crossing out a value another clue ruled out is
false and checkable. Exemplar:
[`mathrax/solver.ts`](../src/games/mathrax/solver.ts) with
`mathrax-hint.test.ts`.

- **On the recording path, attribute each elimination to the first incident
  clue that excludes it and return after one clue**, so one `group` is one
  clue acting on one cell. Leave the commit gate untouched: the rungs still
  wait on the intersection, so the eliminations are the same. Test both
  halves: one cell and one clue per group, and the same verdict and grid at
  every cap with and without a recorder.
- **Re-derive a sentence's claim about another cell from the working
  board.** Record only the clue and its intersection, and let `narrate` read
  the partner off the working grid: the sentence names a digit across the
  clue exactly when one is written there. Guard it with a walk asserting the
  board shows what the sentence names.
- **Evidence for a clue the board has no mark for is the cells that
  identify it**: the set of cells it constrains, where that set meets at one
  clue. Cells that share no edge take separate rings, not one contour, which
  would outline board the clue does not constrain (`outlineSides`). For a
  clue outside the grid see [`hints-marks.md`](./hints-marks.md) §
  "Off-board evidence".

## A walk a sentence claims is a walk the code takes

Where a sentence says that following something leads somewhere ("Following
the arrows from the square above leads back here"), compute the walk and
throw if it does not arrive, with the termination argument written beside
it. Number the walk on the board ("A premise that asserts a walk is computed
and numbered"). Exemplar: `arrowPath` in
[`rome/solver.ts`](../src/games/rome/solver.ts).

A test of a named walk holds each step to the one before it, not only to
its own cell: a check that each named value is among its cell's candidates
passes a walk shifted by one, where each cell's candidates are the previous
cell's value and its own.

## A collapse the board cannot show

Where the solver reasons over candidates the player never sees (a cube of
whole-cell values behind per-slot marks), do not narrate a collapse by the
candidates eliminated: the list is long and dishonestly precise. Exemplars:
[`subsets/solver.ts`](../src/games/subsets/solver.ts),
[`subsets/index.ts`](../src/games/subsets/index.ts).

- **Sync the recorder's cube to the shallow reading the board gives**, so
  what the board already says is never a step. What a rule derives beyond it
  the player is given a mark for, and the hint places each such mark as a
  step before the firing that needs it
  ([`hints-marks.md`](./hints-marks.md) § "Give the facts a
  notation").
- **Look for the dual counting deduction and try it first.** "This value has
  one place left" is usually cleaner to show than "this cell fits only one
  value". Measure how many deductions move to it; the shallow test is weaker
  than the cube's.
- **Give the game a reference aid that shows where a value can go**, computed
  shallowly from the board with no solver and no solution, and use the same
  computation in the hint, so its "only this cell" claim is checkable
  against the aid. Make it two-way over one predicate (value to locations,
  location to values), one focus at a time, suppressed while a hint shows,
  with "is placed here" and "could go here" in different colors. Inspecting
  a location is a dedicated, touch-sized control, not a side effect of an
  editing tap.
- **One slot per step**, each leg's sentence about its own slot. A cell
  becoming a value is one journey of such legs, never a lumped "mark A and C
  and clear B" nor "for the same reason". A continuation leg names its
  referent in full ("the highlighted set"), never a bare "them", and says
  what it continues.
- **Where the collapse still fires, narrate it by what survives**: per slot,
  against the surviving values, highlighted where the player counts them.
  Name one excluded competitor and why, preferring "already placed
  elsewhere", and highlight the blocker.
- A parallel recorder that loops to a fixpoint keeps its cube and its
  reasons across iterations.

## A candidate game off the shared walk

The shared helpers assume `0` for empty, `{x, y}` cells on a grid of stride
`w`, and a step that shrinks as `{...highlights, targets, marks}`. A game
that breaks these does not adapt onto them: an adapter that rebuilds the
highlights supplies the logic itself, and the helper then keeps none. It
writes its own plan and says so. Exemplar:
[`undead/index.ts`](../src/games/undead/index.ts) (a non-zero empty
sentinel, marks over a one-dimensional bordered board).

Everything else in this guide still applies to it: the soundness boundary,
`pencilStrike`, the naked-single-first walk with lazy populate, the stale
step refresh, and the frontier, which takes a key of the game's choosing (§
"A graph, not a grid (Map)"). In particular:

- **Read a counting deduction off the player's notes, never off the
  recorder**, whose candidates are ahead of the board by every strike not
  yet shown ([`hints.md`](./hints.md) § "A plan's copy is the board, no
  further on and no further back").
- **Give a global count its own narrated step.** "This value is fully
  placed, so strike it everywhere" and its dual, "exactly as many cells can
  hold it as remain", are deductions of their own; folding one into another
  clue's narration states a premise that does not discriminate the move.
- **Split by what the premise names**: a clue firing by cell, the clue's
  whole path shaded on every leg; a count firing as one step across every
  cell.
- **The plan is deductive only**, with no solution walk, which the ladder
  solving every shipped tier guess-free allows
  ([`solver-and-generator.md`](./solver-and-generator.md) § "Guess-free
  generation").
- A game that plans without the walk and writes a cell's notes only when a
  narrowing needs them: [`hints-marks.md`](./hints-marks.md) § "Place the
  notes a fixpoint rests on".

## A graph, not a grid (Map)

A game whose elements are regions of a graph, with adjacency its only
relation, stays off `runCandidatePlan`, which indexes cells by `(x, y)` on a
stride `w`. It writes its own plan and takes the rest of the machinery as
follows. Exemplar: [`map/hint.ts`](../src/games/map/hint.ts).

- **Both readings, with the preference.** A region's candidates are its
  dots, or with none every value less those a neighbor shows; under
  `populate` the plan opens with the Mark-all press as one fill-and-clean
  journey. `candidate-reading.test.ts` reads such a plan by what each step
  does to the board, not by the move's `type`.
- **The frontier takes a key**: `gridKey(w, h)` for a grid, the region index
  here ("The hint frontier keys on whatever a game's steps act on"). Since
  `plan-continuity.ts` reads a square grid, `hint-frontier.test.ts` holds a
  game driving the frontier directly to a ledger naming its own continuity
  guard ("A game taking the frontier directly is held by a ledger").
- **Draw the ring as the game's own selection band**, in the hint color
  ([`hints-marks.md`](./hints-marks.md) § "Echo the move's shape in the hint
  color"); `hint-mark.ts` bands a cell's border box and does not reach a
  region. The selection band nests inside the ring.
- **Only one role sits on a shared border.** Mark only what the board does
  not already show: a single's premise is its neighbors' fills, so it
  outlines nothing. Where evidence must be marked, make it differ from the
  target in form, not in hue or weight alone: a thin dashed line set in from
  the border by a band's width, against the target's solid band.
- **A narrowing ends in whichever move the board calls for**: one value left
  is a placement, a noted element loses the struck notes, an unnoted one
  gets notes for the values left, and the sentence names the move. The next
  step may read those notes as its premise.
- **Offer only the lowest rung that fires**, where the tiers are exactly the
  rungs: the frontier chooses within the easiest non-empty rung. Test it
  against the board (a harder rung is spoken only where no easier one fires
  anywhere), not against the labels per tier, which pass with the rungs
  reordered.
- **A chain's premises go on the board before the chain is spoken.** For any
  chain or pair rung, ask whether each link's premise is on the board; if
  the player must work it out from the neighbors, the journey owes a leg
  that writes it down first (`premiseDots`). Check every rung for the gap
  once one has it.
- **A chain step names what the notes show, never a rule to run**: the
  pattern where there is one, else the chain value by value up to five
  elements, and past that the rule and where the chain ends. The plan
  throws if the walk does not end on the struck value (§ "A walk a sentence
  claims is a walk the code takes"). The chain is outlined whole, its ends
  named by their relation to it ([`hints-marks.md`](./hints-marks.md)
  § "Show the what-if walk statically"); the forcing-chain sentence stays
  the game's, `forcingChainPremise` being written for a line.
- **Name an element by its mark, never by an id the board may not show**:
  "this region", "the outlined pair", "the outlined chain". Name a color that is a value by its word, kept beside its fill
  (`FOUR_NAMES` in `engine/color/colors.ts`), which is a word for each
  scheme: put it in a `phrase`, and list several with `listOf`.
