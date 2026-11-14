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
[`keen/index.ts`](../src/games/keen/index.ts).

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
6. State the solver's techniques in the game's description, each saying
   the terms its step's words need, and make each a rung run on the notes:
   § "Deduce from the notes when the mistake check vouches for them".
7. Write `buildSteps` as one call to `runLatinCandidatePlan` (rows and
   columns) or `runCandidatePlan` (any other regions), handing it the
   rungs, the words of a placement and of a strike, and any hooks the game
   needs: § "The shared candidate-hint machinery", § "The row/column
   preset".
8. Write `hint` as `candidateHint(state, ui ?? newUi(state), buildSteps)`,
   `hintKeepTrack` as `keepCandidateHintTrack` and `refreshHintStep` as
   `refreshCandidateHintStep`.
9. Run the guards the game has joined by doing the above:
   `hint-frontier.test.ts`, `candidate-reading.test.ts`, `mark-all.test.ts`
   and `hint-resume.test.ts`, all in `src/engine/`.

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
| A rung of the game's own | you write a rung, or a deduction of your game is not a technique of its ladder |
| Continue from the last step | a plan jumps across the board, or `hint-frontier.test.ts` fails |
| Deduce from the notes when the mistake check vouches for them | you make your techniques the plan's rungs, or decide what the hint may read |
| A premise names everything its deduction reads | you write a technique's terms, a reason or its words |
| Persist, populate, and the moves | you add the note moves, the opening steps or the notes half of `findMistakes` |
| A populate step never resets notes | you write a fill-all move, a `setUp`, or a Mark-all press |
| Two readings of an unmarked cell | you add the `hint-notes` preference, choose its default, or a step rests on a cell with no notes |
| – Joining the preference | you add the `hint-notes` preference to a game |
| – Choosing the default | you set the reading `newUi` starts on, or your plan has a `setUp` of its own |
| – What the walk folds, and what a step owes it | a step under the implicit reading rests on a cell with no notes |
| Re-derive a placement's why | a placement is narrated as a single |
| Solve the way a human does | you split a firing into legs, add auto-pencil, or a clue forces cells with no notes needed |
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
supplies what carries its meaning, each a field of `CandidatePlan`, whose
docs say what each decides and, for an optional hook, the game-shaped fact
that needs it. Exemplar: [`keen/index.ts`](../src/games/keen/index.ts)'s
`buildSteps`. Requirements: "A shared candidate-elimination hint plan", "The
walk owns the ladder", "The walk builds every step from the game's words",
"The game keeps what carries its meaning".

What the walk does, so a game does not:

- **The ladder is fixed.** The singles the notes show, naked and hidden,
  then the game's `rungs`. A deduction of the game's own goes in `rungs` (§
  "A rung of the game's own"), never in a reordered ladder.
- **Until the setup is done the rungs that read the notes offer nothing**:
  the note-free opening, which holds the strikes back.
  Under the implicit reading the setup is done unless a stale note waits for
  the obvious clean, so a fresh board has no opening and every rung competes
  from the first step ("The implicit reading opens only on a stale note").
- **A firing is data.** A rung returns firings as lists of legs (`Leg`
  lists the kinds). The walk builds each leg's step from `placeWords` /
  `strikeWords` and adds the move, the `targets` and the `marks`, so none can
  disagree with the move. It reads `area` and `hatch` off the words
  (`evidenceOf`): a step cannot draw evidence its sentence does not name.
  The words carry `reads` for the cells a step's candidates rest on beyond
  those they outline (a cage deduction stripes the cage and reads every cell
  of it).
- **Each leg is played on the working board**, and after a placement the
  walk strikes the value from every cell it reaches: a leg continuing the
  journey, or silent under auto-pencil with the move carrying the same cull.
  A game writes no placement emitter of its own.
- **A firing is emitted whole**, its later legs flagged as continuing the
  journey. Do not emit one cell per turn and re-link by `group`: the frontier
  could take something else in between and split one deduction into two
  hints.
- **The walk chooses the next firing** and owns the budget and the cap (§
  "Continue from the last step").

**Pass `w` as the row stride only.** The helpers read the board's length off
`grid`, so a board that is not square needs nothing more.

## A cell's regions are one definition

State which cells share a uniqueness constraint with `(x, y)` once, as the
plan's `regionsOf`, and nowhere else. The hidden singles, the obvious
clean, the placement cull, Mark-all and auto-pencil all read it, so they
cannot disagree. Requirements: "A cell's regions are one definition per
relation", "Every notes cull reads every declared region", "Only two kinds of
region are declared".

- **A row/column game passes none**: the preset supplies `rowColRegions`
  from [`engine/latin-hint.ts`](../src/engine/latin-hint.ts).
- **Return every region a value may not repeat in, as a `CellRegion`, and
  flag each `holdsEvery`.** "Holds every value" and "forbids repeats" are two
  relations. A hidden single needs the first (a value with one home left
  must go there only if the region must hold it), and the walk reads none
  in a region flagged `false`. The culls need the second. A region that only
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

- **The default is `regionReach`**, every cell of `regionsOf`, so a game
  whose rule is its regions passes nothing.
- **`regionsOf` keeps the job that does not depend on a value**: the regions
  a hidden single is found in.
- **The relation must be symmetric.** The helpers read the reach outward from
  each placed value, which equals asking what reaches a cell only when "two
  equal values may not stand together" runs both ways.

Exemplar: [`seismic/hint.ts`](../src/games/seismic/hint.ts), whose `reach`
is what its description's `cull` strikes, asked once a cell and value.

## A sentence names which kinds of region

Where a sentence cites the kinds of region a value may not repeat in ("it
can't repeat in its row, column, block, diagonal or cage"), read the words
off the regions, as a `name` on every arm of the game's own `CellRegion`
type, never from a second list. Requirements: "A region's name is read off
the region", "A region's word is not the tag that names a hidden single", "A
citation repeats names, not regions".

- **The name cannot ride the hidden-single tag**: a region that only forbids
  repeats is untagged and still has to be named.
- **Dedupe on the name, not the region**: a cell on both diagonals says
  "diagonal" once.
- **Where the sentence speaks for the whole board, take the union over the
  board**, so a cell on neither diagonal is still told its notes were cleaned
  against them.
- **The name is the game's, not the engine's `CellRegion`'s.** A game with
  one kind of region says "this area" and carries no name; a game on the
  preset has a constant phrase.

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
strike's conclusion names the struck values, even after its premise".

- **`conclude` comes from the preset's `notes` vocabulary**, or from
  `candidateConclusions` in the game's own value words, or is written by a
  game whose values are not listable that way (Rome's, in the ways a square
  points).
- **Two optional fields of the premise say how the ending refers to the
  struck notes**: `where` for a strike that reaches past "this cell" ("from
  the other cells they pass through"), and `struck` where a list of values
  would misstate them. A premise that already named the values is still
  followed by them ("puts 2 in this cell, so the 2 must go"): "it" is no
  thing on the board to press.
- **Name the cell with `thisCell`, as a placement does.** Where the step
  strikes notes in it, the walk draws that reference as an outline on the
  cell, so pressing "this cell" points at the cell and "the 2" at its X
  ([`hints-marks.md`](./hints-marks.md) § "Outline the evidence"). Never
  name the cell by its notes: `mark.this` over a note throws.

## The row/column preset

A game whose values may not repeat in a row or a column, and nowhere else,
calls `runLatinCandidatePlan`
([`engine/candidate-plan.ts`](../src/engine/candidate-plan.ts)) and supplies
its rungs and its words. It is `runCandidatePlan` with
the answers a row and a column force filled in; its doc lists each and why
it is not a parameter. Exemplar:
[`mathrax/index.ts`](../src/games/mathrax/index.ts)'s `buildSteps`.
Requirements: "A row/column Latin square answers no question its regions
already settle", "The fields the row/column preset supplies", "A game
reasoning over other regions cannot take the preset".

- **A game with a `setUp` of its own still gives the `notes` vocabulary**,
  for the conclusions.
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
  ns, vocab?)` in `hint-text.ts` owns `single`, `hiddenSingle`, `dup` and
  `set`; a game narrates its own arms and falls through to it.
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
  whose generic wording diverges narrates its own arms". The same test
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
  "pencilStrike" | "pencilAll" }`: it reads a game move as the canonical
  `CandidateMove`, or `null` for "not one of these, so off-plan", and builds
  the game's own moves. `keepCandidateHintTrack`,
  `refreshCandidateHintStep` and the plan (`moves`) take it. Exemplars:
  [`group/index.ts`](../src/games/group/index.ts) (moves carrying a cell
  list), [`crossing/index.ts`](../src/games/crossing/index.ts) (a `kind`
  discriminator and candidate `n` at bit `n − 1`).
- **Emit the hint's placement as the game's native move**, so a player
  following the hint produces the exact move the plan expects. Add only the
  note moves the hint needs.
- **`NoteEncoding`** for notes that are not `1 << n` up to the grid order:
  its fields say how a candidate maps to a bit, the highest candidate a cell
  may note, and `all(i)`, cell `i`'s full note set where it is not
  board-wide (bounded by the grid edge, or by a region's size).
- **The game's own `pencilAll` is the authority for `all(i)`.** A populate
  that fills more than the player's Mark-all teaches strikes on notes the
  player never made. The converse is the input's: a note outside `all(i)`
  has no strike anywhere, so the game refuses it at entry
  ([`mechanics.md`](./mechanics.md) § "Pencil marks: the full note-taking
  UX").

## A rung of the game's own

A game's techniques are its rungs, each a `techniqueRung` (§ "Deduce from
the notes when the mistake check vouches for them"). Write a rung of your own
only for a deduction that is not a technique of the ladder, or a move the
canonical shapes have no room for (a marker). Ask first what the rung
writes: a deduction that only strikes notes is a technique with an unusual
reason, however it was reached ("A deduction over a graph is a reason, not a
plan shape"). A rung is a `CandidateRung`: called with a `RungContext`, it returns every firing it
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
  rungs certify. `techniqueRung` takes both gates for a compiled technique,
  from its place in the ladder; a rung of your own has to say so.
- **A hidden single of the game's own skips a cell whose notes are down to
  that value.** The walk calls it naked, and the frontier would otherwise
  prefer the hidden one for its larger evidence.
- **A strike that rides as a later leg is also offered by itself.** The board
  can reach the state the leg tidies without the leg (the player makes the
  first move, or takes the first leg and goes their own way), and the plan
  recomputes there. `circledEmptyNotes` in
  [`salad/hint.ts`](../src/games/salad/hint.ts) is such a strike as a rung;
  `salad-hint.test.ts` pins both routes.
- **A placement-first game marks its placing techniques `leads`** (§
  "Placements lead when the deductions are placements").
- **Classify a trial rung by what its rejection can be, not by the fact that
  it trials.** A rung that places a candidate and asks whether the board
  survives may be one placement and one look, a Check
  ([`hints.md`](./hints.md) § "The forcing boundary"), and then every cell
  the same fact rules out is one firing. Seismic's trial placement is the
  case, stated as its `starve` technique.

Exemplar: `extremeClueLines` in
[`towers/index.ts`](../src/games/towers/index.ts) (note-free).

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
- **The singles are the notes'**: the naked ones `nakedSingles` lists, and
  a hidden single in each region of `regionsOf` that holds every value, read
  off `RungContext.shown`. A technique's rung runs on the same view, so
  nothing it offers rests on a mark the board has yet to show.
- **Setup is outside the frontier.** The default is `populateThenClean`,
  built from the plan's `notes` words. A `setUp` of the game's own says
  whether it is `done`, not only whether a call did something.

Guard: `hint-frontier.test.ts` reads each plan through
[`engine/testing/plan-continuity.ts`](../src/engine/testing/plan-continuity.ts)
and bounds the jumps that passed over a firing that continued, under every
reading the game offers. A reading over the bound sits in the test's
`OVER_BOUND` ledger, which asserts it is still over.

## Deduce from the notes when the mistake check vouches for them

A hint deduces from the player's own notes, and it may only because the
game's `findMistakes` flags any empty cell whose notes have crossed out its
answer. The hint refuses on a flagged board, so wherever it runs every
cell's notes still hold its answer, and a deduction read off them is as
sound as one read off the solver's candidates. A game whose mistake check
ignores notes adds the notes half of `findMistakes` before its hint reads
them. Requirement: "A hint deduces from the notes only where the mistake
check vouches for them".

- **The rungs read `RungContext.shown`**: the notes, or under the implicit
  reading what a note-less cell's reach leaves it, which always holds the
  answer too. The walk reads the singles off the same view.
- **A rung is a compiled technique run on the notes**: `techniqueRung`
  (`engine/candidate-plan.ts`) builds the marks from the values placed and
  the notes shown, asks the ladder's technique for its firings, and hands
  each to the game to make legs of, from what its `says` names. So what a
  step finds is the solver's technique by construction, and the soundness
  check is what holds it, not a test comparing two copies. The rung waits
  for the setup, and any technique but the ladder's first waits for every
  earlier rung to come up empty, as the solver reaches it only then: the
  gate is read off the ladder's order, so the game writes none. The tier is
  not enough: Abcd's `runs` is as easy as its single, and ungated it
  crowds the singles out.
- **A harder technique continues the work in hand while it waits**: one of
  a harder tier than the ladder's easiest still offers a firing that reads
  a cell the latest steps wrote (`RungContext.continues`, the frontier's own
  test), beside the singles. Waiting outright, a plan leaves the work for a single elsewhere and comes back;
  `hint-frontier.test.ts` measures it. One of the singles' own tier waits
  outright, so Abcd's `runs` cannot crowd them out this way either.
- **The board's tier bounds what the hint teaches**: a `NotesLadder` carries
  the board's `caps`, and a technique the solver would not run at them
  offers nothing, so a harder technique cannot step in on an easier board,
  and a technique with a tier window (Keen's `cageEasy`, until Normal) runs
  only inside it. A game whose board keeps no tier (Rome) passes its top
  one.
- **A Latin game's marks are a `LatinSolver`**: `latinNotesLadder`
  (`engine/latin-notes.ts`) builds them over the walk's grid, so its own
  techniques read what they read when solving. The library's `set`, `fish`
  and `wing` say their terms, and `latinStrikeRungs` makes each a rung whose
  strikes carry the `LatinReason` that `latinPremise` narrates; the game
  writes no legs for them.
- **A marker the board shows beside its notes is seeded on the marks**
  where the game builds them: Salad's cross is the hole symbol placed, and
  a ball's square has the X outside its full set (`NoteEncoding.all`). A
  hidden single the game settles another way than by placing (Salad's last
  X) is kept out by the plan's `placeable`.
- **A technique the walk already takes gets no rung**: the singles, the cull
  around a placement, and a hidden single in a region that holds every
  value (Rome's `onlyHome`, which the walk places). The rungs go in the
  ladder's order.
- **A note outside the cell's full set (`NoteEncoding.all`) is no
  candidate**: a player may pencil Rome's arrow off the board, and no
  technique reads it.
- **What a sentence names beyond the technique's terms is read off the
  values placed** in the game's `legs`: Rome's loop chain and goal group.
- **The soundness check holds a technique, and the game's own hint test
  holds what its step claims** (Seismic's starved area against upstream's
  trial placement): the step is the technique's firing by construction, so
  no test compares two copies.
- **The hint never writes the state.** A shared structure read through an
  accessor that mutates as it reads (a `Dsf` compressing paths) breaks
  `hint-resume.test.ts`, which asks that asking change nothing: compress once
  when it is built.
- **A slow variant's hint walk takes no timeout of its own**
  ([`testing.md`](./testing.md) § "Seed-deterministic, never clock-gated").
  Which presets `hint-resume.test.ts` walks, and which it leaves to the slow
  tier, is `gatePresets`'s doc
  ([`engine/testing/hint-games.ts`](../src/engine/testing/hint-games.ts)).

Exemplars: [`seismic/hint.ts`](../src/games/seismic/hint.ts),
[`abcd/hint.ts`](../src/games/abcd/hint.ts),
[`rome/hint.ts`](../src/games/rome/hint.ts),
[`salad/hint.ts`](../src/games/salad/hint.ts) (a Latin game). Outside the
shared walk, Undead reads its ladder's firings off the notes the same way
(`undeadFirings` in [`undead/solver.ts`](../src/games/undead/solver.ts)).

## A premise names everything its deduction reads

A step's premise must name every cell whose candidates or placed value its
deduction read. The frontier reads a firing's premise off its steps, and
under the implicit reading the walk writes the notes of the cells it names
first, so a step that leaves a cell out jumps where it continues, and asks
the player to check a cell whose candidates it never showed. Requirements:
"A step's premise names every cell its deduction reads", "A reason carries
the cells its words do not name".

- **Absence is read too.** "4 can only go in these cells of these columns"
  reads every other cell of the columns. A naked set reads only its own
  cells; a hidden set and a fish read the rest of their lines. "Only this
  mark leads into the group" reads every square around the group.
- **Where the words cannot say it, the reason does.** A reason may
  carry `reads`, the cells its deduction reads beyond what the words outline;
  the walk adds them to the premise and, under the implicit reading, writes
  their notes first. Words that already name the cells need nothing more.
- **A read the player must check is drawn, not only carried.** `reads` shows
  nothing. A value confined across several lines stripes them through
  `confinedPremise` (`engine/hint-text.ts`); a technique with such a firing
  says the lines, built into `ConfinedLines` (`engine/latin.ts`), and calls
  it ("A value confined across several lines shows the lines").
- **A fish has two readings; name the smaller.** `k` columns holding a value
  in only `k` rows is also the other rows holding it in only the other
  columns. Say the fewer, as the library's fish does (`cols` where its
  columns are no more than its rows), and test each way round.
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
  every candidate, so a cell can show a value the givens already exclude,
  and no technique strikes it. Keep `pencilAll` a plain fill.
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
- **A resetting move kept in the union for the replay of saved move logs** is
  documented at its arm as unreachable from input.
- **A test of this rule must narrow a cell by hand**: a resetting fill writes
  back exactly what was there otherwise. The guard is
  [`engine/mark-all.test.ts`](../src/engine/mark-all.test.ts), which a game
  joins by declaring `markAll`.

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

- **A cell an earlier leg of the firing reads is noted first and struck as
  written**, since its candidates are that leg's premise. A cage firing notes
  the cage's other cells, folds the first, and strikes the rest.
- **A strike with a `where` never folds**: it speaks for cells other than
  "this cell".
- **A later fold sees an earlier fold's placement in the same firing**
  (`candidate-plan.test.ts` pins the shape).
- **The populate reading never folds** ("Nothing folds under the populate
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

The walk reads every single off the notes it shows and tells the game which
kind it is, so the narration is true on the board: a naked single (the
cell's notes are exactly `{n}`), a hidden single (no other empty cell of a
region still has `n`, while this cell may show several), or a cell with no
notes whose regions hold every other value. Narrating a hidden single as
"every other number has been ruled out in this cell" is false on the board.
Requirements: "A candidate hint distinguishes naked and hidden singles", "A
naked single shades its cell and a hidden single its region", "A placement
is read against the candidates the board shows", "Every single a plan takes
is one the notes show".

- **The game names the kind in `singleReason`**, over its `regionsOf`; the
  row/column preset supplies it.
- **A hidden single names its region** ("No other cell in this row can be
  3, so this cell must be 3") and shades the whole of it.
- **A placement a technique makes keeps that technique's reason** (a clue, a
  cage); it is not a single.

A single shows only where the notes show it, so a skipped strike shows as a
single that never comes, and the plan stalls short of the answer. When a
walk stalls, check:

- Every placement strikes its value from the notes it reaches, a multi-cell
  fill included.
- Obvious culls come before any single, including those left by a player
  who placed a value without striking it.
- A cell with no notes shows the values its regions leave it. The walk reads
  singles off `impliedNotes` and hands the same view to a game's rungs as
  `RungContext.shown`; reading a note-less cell as holding nothing passes
  every value as a hidden single.
- A technique's strike was dropped that no step of the game's own teaches (§
  "A cell decided without a value in the grid").

Guard: `hint-resume.test.ts` "a Latin-family placement never falsely claims
a naked single".

## Solve the way a human does

The walk takes, on a working copy of the board, the move a person makes
next: a single, else an elimination worth teaching. What a game decides
within that:

- **Auto-pencil is a preference, default off**, that strikes a placed value
  from the cells it reaches. Bake the decision into the move at
  `interpretMove` (`set { autoElim }`, read off the `Ui`), so `executeMove`
  stays pure and replay is deterministic. `Game.hint` takes the `ui` to read
  it; `candidateHint` passes it to the plan as `autoClean`. On, the cull is
  folded into the placement; off, it is taught as a continuing strike. A game
  without the preference teaches every cull.
- **Show a clue that forces cells outright as one placement journey, before
  populate.** A clue at an extreme value can force a line with no notes
  needed; the solver reaches it as a cascade of eliminations. Detect it in
  the plan, off the clues, as a note-free rung of the game's own: first leg
  unflagged, the rest continuing and narrated tersely. Populate is lazy, so
  it comes only when an elimination first needs something to cross out.
  Exemplar: `extremeClueLines` in
  [`towers/index.ts`](../src/games/towers/index.ts); guard
  `towers-hint.test.ts` "populates before the first elimination".
- **A firing's legs follow what the narration names singular.** The game's
  `legs` cut a technique's firing into legs (`byCell` in
  [`engine/latin-notes.ts`](../src/engine/latin-notes.ts) cuts by cell), and
  the walk flags the later ones as continuing. A firing whose sentence names
  one value ("a tower of height 5…")
  splits by value: one step striking two values under it contradicts the
  sentence. A firing whose premise is a whole region (a cage) splits by
  cell, the shaded region constant across the journey, and a list of values
  within a leg is fine. A firing whose premise names one digit across cells
  is one multi-cell step. Exemplars: a height a leg in
  [`towers/index.ts`](../src/games/towers/index.ts), a cell a leg in
  [`keen/index.ts`](../src/games/keen/index.ts); guards `towers-hint.test.ts`
  "a strike step never mixes heights", `keen-hint.test.ts` "a cage-strike
  step's marks all lie in one cell".

## Placements lead when the deductions are placements

Where a game's signature deductions place values, lead with them and
populate only when an elimination is the next thing to teach: each such
technique is a `techniqueRung` with `leads`, which waits neither for the
setup nor for earlier rungs; the walk's singles compete beside it.
Requirement: "A game's placing technique may lead". Exemplar:
[`group/index.ts`](../src/games/group/index.ts).

- **Never gate populate on a strike being available.** A strike counts only
  where its candidate is in the notes, so with no notes there is none, and
  the plan deadlocks.
- **A placement that forces others is one firing.** A technique whose
  firing places several cells (Group's identity row and column) makes them
  one journey, a leg a cell, the cell that revealed it shaded on every leg,
  not one hint per forced cell.
- **Placing first means reading singles on a board with few notes**: the
  obvious clean runs ahead of the strikes, and a note-less cell reads by
  what its regions leave it (§ "Re-derive a placement's why").
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
  or a hidden single is a marker and not a value.
- **The adapter reads the marker move as `null`**, and the game's
  `hintKeepTrack` and `refreshHintStep` judge it before delegating.
  `refreshHintStep` resolves a marker step from the marker array: the shared
  refresh keeps any step whose move its adapter reads as `null`, so it would
  never resolve one.
- **A marker is seeded on the technique's marks** where the game builds
  them (Salad's cross is the hole symbol placed): a marker is an entry the
  mistake check flags when wrong, so a technique may assume it.
- **`onPlace` keeps the game's own state beside `grid`** when a placement
  also settles it (Salad marks the square as no hole).

Three rules that go with it:

- **Find where the game's values are uniform, and put the collapse only at
  the edge.** In the solver's cube the marker's value is a symbol like any
  other; only the player-facing projection differs (one note while
  undecided, a marker once settled, never a grid entry). Look for that
  uniform view before widening a shared helper: a helper only asks which
  note bit a placed value occupies.
- **Re-derive a marker's why from the visible board, cheapest first, with no
  weak arm to fall back on**: a line's counts, then the cell's own notes.
- **Leave a technique's strike out only for the rung that says the same
  thing, and name that rung.** A strike no step of the game's own teaches stays a
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

- **Make a firing one clue acting on one cell**: attribute each elimination
  to the first incident clue that excludes it and say that clue. Leave the
  commit gate untouched: the technique still waits on the intersection, so
  the eliminations are the same. Test both halves: one cell and one clue
  per firing, and the same verdict and grid at every cap.
- **Re-derive a sentence's claim about another cell from the working
  board.** Say only the clue and its intersection, and let `narrate` read
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
it. Outline the walk's cells on the board, with no number on them ("A
premise that asserts a walk is computed and outlined"). Exemplar:
`arrowPath` in [`rome/hint.ts`](../src/games/rome/hint.ts).

**A test of a named walk holds each step to the one before it**, not only to
its own cell: a check that each named value is among its cell's candidates
passes a walk shifted by one, where each cell's candidates are the previous
cell's value and its own.

## A collapse the board cannot show

Where the solver reasons over candidates the player never sees (a cube of
whole-cell values behind per-slot marks), do not narrate a collapse by the
candidates eliminated: the list is long and dishonestly precise. Exemplars:
[`subsets/solver.ts`](../src/games/subsets/solver.ts),
[`subsets/index.ts`](../src/games/subsets/index.ts).

- **Start the plan's candidates from the player's own marks, and let the
  ladder find what a neighbor rules out.** Seeded from the whole shallow
  reading, every letter a decided neighbor's horseshoe carries read as a
  collapse rather than as the horseshoe's: Subsets' plans opened with a
  dozen collapses. What a rule derives that the board cannot show the
  player is given a mark for, and the hint places each such mark as a step
  before the firing that needs it
  ([`hints-marks.md`](./hints-marks.md) § "Give the facts a notation").
- **Take a step as soon as its firing decides what the player marks**, so
  the marks always say what the candidates agree on and a technique that
  reads a neighbor's marks reads the board. A collapse decides every letter
  the values it outlines agree on, narrowed by the shallow reading too, or
  it shows one value and marks half of it.
- **Give the dual counting deduction a technique of its own.** "This value
  has one place left" is usually cleaner to show than "this cell fits only
  one value", and the aid makes it checkable.
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
- **The plan keeps a reason for each strike the board cannot show** across
  its steps, and only those: every other strike the board shows once the
  steps before it are taken, which `markRuleOuts` holds it to by throwing.

## A candidate game off the shared walk

The shared helpers assume `0` for empty, `{x, y}` cells on a grid of stride
`w`, and a step that shrinks as `{...highlights, targets, marks}`. A game
that breaks these does not adapt onto them: an adapter that rebuilds the
highlights supplies the logic itself, and the helper then keeps none. It
writes its own plan and says so. Exemplar:
[`undead/index.ts`](../src/games/undead/index.ts) (a non-zero empty
sentinel, marks over a one-dimensional bordered board).

Everything else in this guide still applies to it: reading the notes only
where the mistake check vouches for them, `pencilStrike`, the naked-single-first walk with lazy populate, the stale
step refresh, and the frontier, which takes a key of the game's choosing (§
"A graph, not a grid (Map)"). In particular:

- **Read a counting deduction off the player's notes, never off a solver's
  candidates**, which are ahead of the board by every strike not yet shown ([`hints.md`](./hints.md) § "A plan's copy is the board, no
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
- **A game that plans without the walk and writes a cell's notes only when
  a narrowing needs them** reads [`hints-marks.md`](./hints-marks.md) §
  "Place the notes a fixpoint rests on".
- **A struck candidate the board already shows is not re-spoken from the
  fact graph.** Magnets' `reading.ts` names a bit's reason (touch, a full
  line, the partner end) off the board; the graph names the firing that
  struck it, which is the same reason in another order where several hold,
  so the words would move for no player-visible gain. Take `walk.graph` /
  `restsOn` only where the candidate is one a player cannot write and no
  board reading names it.

## A graph, not a grid (Map)

A game whose elements are regions of a graph, with adjacency its only
relation, stays off `runCandidatePlan`, which indexes cells by `(x, y)` on a
stride `w`. It writes its own plan and takes the rest of the machinery as
follows. Exemplar: [`map/hint.ts`](../src/games/map/hint.ts).

- **The firings are the compiled rungs'.** The plan builds the marks from
  the board's colors and dots, asks each technique for every firing it
  could make (`Rung.firings`), and groups and narrates them itself; it
  states no deduction of its own (`descriptions.md` § "The runtime a ladder
  runs on").

- **Both readings, with the preference.** A region's candidates are its
  dots, or with none every value less those a neighbor shows; under
  `populate` the plan opens with the Mark-all press as one fill-and-clean
  journey. `candidate-reading.test.ts` reads such a plan by what each step
  does to the board, not by the move's `type`.
- **The frontier takes a key**: `gridKey(w, h)` for a grid, the region index
  here ("The hint frontier keys on whatever a game's steps act on"). Since
  `plan-continuity.ts` reads a grid of cells, `hint-frontier.test.ts` holds a
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
- **A premise goes on the board before the step that rests on it.** For a
  pair or a weighing, ask whether each region's colors are on the board; if
  the player must work them out from the neighbors, the journey owes a leg
  that writes them down first (`premiseDots`). Check every rung for the gap
  once one has it.
- **A weighing names its parts and leaves the ways to the dots**: "whatever
  goes in the middle region, an outlined region beside this region must have
  violet". Each color the middle region can take is read off one end's two
  dots, which the premise legs wrote, so the sentence does not recite them.
  The ends take no noun of their own (owner, 2026-10-28, who declined "an
  end", "a partner" and "a pincer"): the role word names them. The candidate
  games' wing is the same sentence (`wingPremise`), and strikes one cell a
  firing so that "this cell" is true whatever the game's strike axis. Its
  ends are "another outlined cell", because the cell it strikes in is outlined
  too ([`hints-marks.md`](./hints-marks.md) § "Outline the evidence"). A
  legend that teaches a reference by its words ("the middle cell") is what
  lets the marks guard accept it without a role word.
- **Name an element by its mark, never by an id the board may not show**:
  "this region", "the outlined pair", "the middle region". Name a color that
  is a value by its word, kept beside its fill (`FOUR_NAMES` in
  `engine/color/colors.ts`), which is a word for each scheme: put it in a
  `phrase`, and list several with `listOf`.
