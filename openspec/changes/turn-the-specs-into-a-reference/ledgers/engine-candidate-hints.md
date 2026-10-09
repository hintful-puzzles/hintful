# Ledger: engine-candidate-hints

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## A shared candidate-elimination hint entry

| Rule | Where it went |
| --- | --- |
| `candidateHint` owns the `Game.hint` control flow every candidate game shares: read `autoPencil` (off by default), build the plan through `buildSteps`, refuse an empty plan, else return the steps | spec: A shared candidate-elimination hint entry |
| The entry refuses on a completed board, and on a board the game's `findMistakes` reports a mistake on | untrue: `candidateHint(state, ui, buildSteps)` in `src/engine/candidate-hint.ts` takes no `findMistakes` and makes neither refusal, the midend's `computeHintPlan` makes both before it asks the game; held: src/engine/midend.ts "if (this.findMistakes() > 0) return FIX_MISTAKES_FIRST" |
| The standard refusal and empty-plan messages live in this one place | untrue: the module holds no message, the empty-plan refusal is `DEDUCTION_EXHAUSTED` imported from `src/engine/hint-refusal.ts` with every other refusal; held: src/engine/hint-refusal.ts "export const DEDUCTION_EXHAUSTED" |
| A game's `hint` is a one-line call passing its own `findMistakes` and `buildSteps` | untrue: no caller passes `findMistakes`. Each passes `buildSteps` with its `Ui` or its own `newUi` (as in `src/games/keen/index.ts`), or with `null` (`src/games/salad/hint.ts`, `src/games/crossing/index.ts`), and the requirement now says that |
| The module's path, `src/engine/candidate-hint.ts` | held: src/engine/candidate-hint.ts "export function candidateHint" |
| Routing through the entry is behavior-preserving | history |
| Scenario: a migrated game's refusals and success are unchanged and its suite passes with no change | history |

## Candidate-elimination hints clean obvious candidates at populate

| Rule | Where it went |
| --- | --- |
| Once notes first exist, populated or already noted, the plan emits one bulk obvious-candidate cleanup, as Mark-all's second press does (`obviousCandidateMarks`) | spec: Candidate-elimination hints clean obvious candidates at populate |
| The cleanup reads the game's `regionsOf` | spec: What a placed value rules out may depend on the value |
| The cleanup is one `pencilStrike` step with its marks baked in, flagged `continuesPrevious` after the populate fill and standing alone on an already-noted board | spec: The obvious-candidate cleanup is one strike step |
| The struck marks are applied to the plan's working notes | spec: The obvious-candidate cleanup is one strike step |
| `emitObviousCleanStep` owns the emission so every game produces it identically | spec: The obvious-candidate cleanup is one strike step |
| It fires only when there is something obvious, once on a noted board and once after the populate, and not again, and an empty cleanup emits no step | spec: The obvious-candidate cleanup fires once, and only when it strikes |
| The plan does not re-teach the obvious eliminations one firing at a time | spec: The bulk clean replaces the per-given opening |
| The rest of the walk is unchanged: easy-first ordering, and the harder deductions reached only when no easier move remains | spec: The walk owns the ladder; spec: A candidate hint plan continues from its latest steps where it can |
| The rest of the walk is unchanged: the explicit per-placement cleanup when auto-pencil is off | spec: A placement's cull continues its journey |
| It applies to every game with a region-uniqueness populate, and a game with no such populate is unaffected | spec: Candidate-elimination hints clean obvious candidates at populate |
| The list of games it applies to, and Undead as the one it does not | history |
| Scenario: the populate fills, then bulk-clears, leaving Mark-all's notes | spec: Candidate-elimination hints clean obvious candidates at populate |
| Scenario: the plan does not afterward re-teach those eliminations | spec: The bulk clean replaces the per-given opening |
| Scenario: the cleaned-note plan replays and refreshes | spec: The obvious-candidate cleanup is one strike step |

## A classified placement rests only on strikes the board shows

| Rule | Where it went |
| --- | --- |
| The classifier answers only naked or hidden, and throws for a placement the notes show as neither | spec: A classified placement rests only on strikes the board shows |
| No narration exists for such a placement: no `forcedSingle`, and in Salad no `forcedCross` or `forcedCircle` | spec: No narration exists for a placement the notes cannot explain |
| Salad's plan throws when the solver still forces a marker the board lacks | spec: No narration exists for a placement the notes cannot explain |
| Every plan that classifies passes through the classifier, so the cross-game hint walks are the guard and a game joins by calling it | spec: No narration exists for a placement the notes cannot explain |
| The names of the two test files that walk the hints | held: src/engine/latin-hint.ts "cross-game hint walks (`hint-resume.test.ts`, `hint-quality.test.ts`)" |
| Scenario: a placement the notes cannot explain throws | spec: A classified placement rests only on strikes the board shows |
| Scenario: a plan that skips a strike fails the hint walks | spec: No narration exists for a placement the notes cannot explain |

## Obvious candidate strikes precede a classified placement

| Rule | Where it went |
| --- | --- |
| A plan that classifies a placement against the notes has first struck every value already placed in the noted cell's regions, and a plan that places before it populates runs the cleanup ahead of its placement arm | untrue: `CandidateWalk.run` in `src/engine/candidate-plan.ts` offers the opening (the singles and the game's own rungs) before each `setUp.step()`, so a single the written notes show is placed before the clean, as this spec's "a stale note still lets a single go first" scenario also says. What holds is that notes are read as written, stale or not (`impliedNotes`), and the clean runs before any recorded strike |
| The stale note may be the player's or the plan's | spec: A placement is classified against the candidates the board shows |
| The plan strikes each value it places, every leg of a multi-leg journey included, from its lines' notes | spec: A placement is classified against the candidates the board shows |
| A note-less empty cell reads as every value not already placed in its regions, so a hidden single is claimed only where the board shows one | spec: A placement is classified against the candidates the board shows |
| Scenario: a player's stale note is struck before any placement step | untrue: the opening's singles come before the clean in `CandidateWalk.run`, so the scenario now says the note is struck before any recorded strike and that an earlier single is one the written notes show |
| Scenario: a note-free board's placements are narrated by what the board shows | spec: A placement is classified against the candidates the board shows |

## A candidate hint plan continues from its latest steps where it can

| Rule | Where it went |
| --- | --- |
| Among available firings the plan takes one reading what its latest step wrote, then the step before, and the rung order decides ties and the case where none qualifies | spec: A candidate hint plan continues from its latest steps where it can |
| The depth is three steps back | untrue: `HintFrontier.take` in `src/engine/hint-frontier.ts` records one set of written cells for each candidate taken, which is a whole firing with every step it pushed, and keeps three of them, so the requirement now counts firings |
| The engine owns the choice (`HintFrontier`), reads a premise off the steps a firing would push, built before the choice and pushed unchanged, and no firing carries a second statement of its premise | spec: The engine owns the choice and reads a premise off the steps |
| The frontier reads what a step wrote from the targets of the steps it pushed | spec: The engine owns the choice and reads a premise off the steps |
| The path `src/engine/hint-frontier.ts` | held: src/engine/hint-frontier.ts "export class HintFrontier" |
| The game owns which firings of its own rungs are available and the walk which recorded ones | spec: A firing is offered only when the board shows its premise |
| A firing is offered only when the board shows its premise, and a recorded firing is judged by one rule whether it strikes or places | spec: A firing is offered only when the board shows its premise |
| What the board does not show yet: a live mark an earlier firing has yet to strike, and an unmade placement's cell with every cell its value rules out that still shows it | spec: The marks a recorded firing waits on |
| A strike's premise is its steps' whole premise and a placement's leaves out the cells it places | spec: The marks a recorded firing waits on |
| A single the notes show is offered as the notes show it, and no recorded firing is withheld for its position or held back as a last resort | spec: No recorded firing waits on its place in the recording |
| A single's step carries in `reads` the placed cells it rests on through a note-less cell | spec: A single reads the placed cells it rests on through a note-less cell |
| The frontier keys only on the plan's own steps, and the choice stays on the hint path | spec: The frontier keys only on the plan's own steps |
| The guard's population is derived from the games' sources and keyed on the shape every entry shares, it walks every reading a game offers, and reads a premise as the frontier does | spec: Plan continuity is measured over a derived population |
| A reading over the bound is named, with the change that owns it, in a ledger held still over the bound | spec: A reading over the continuity bound is named in a ledger |
| Scenarios: a firing beside the last step, a fresh plan, a firing continuing from the evidence it shades | spec: A candidate hint plan continues from its latest steps where it can |
| Scenario: a firing is offered only when the board shows its premise | spec: A firing is offered only when the board shows its premise |
| Scenario: a strike past an unmade placement | spec: The marks a recorded firing waits on |
| Scenario: a clue-forced placement is offered where its premise holds | spec: No recorded firing waits on its place in the recording |
| Scenarios: the plans are measured from outside, and the population survives a new entry point | spec: Plan continuity is measured over a derived population |
| Scenario: a placement continues into the single it completes | spec: A single reads the placed cells it rests on through a note-less cell |
| Scenario: both readings are measured | spec: A reading over the continuity bound is named in a ledger |

## A cell's regions are one definition per relation

| Rule | Where it went |
| --- | --- |
| A game declares a cell's regions once, each flagged `holdsEvery`, and every consumer derives its relation from the declaration | spec: A cell's regions are one definition per relation |
| The classifier reads the regions that hold every value and skips one flagged `holdsEvery: false` | spec: A cell's regions are one definition per relation |
| Every notes cull reads every declared region: the duplicate strike, the obvious clean, Mark-all's clean, auto-pencil | spec: Every notes cull reads every declared region |
| Only two kinds are declared, a repeat-only region is `holdsEvery: false`, a region with neither property is not declared, and a hidden-single tag sits only on whole regions | spec: Only two kinds of region are declared |
| Scenario: the classifier skips a region that need not hold every value | spec: A cell's regions are one definition per relation |
| Scenario: the consumers of a relation agree | spec: Every notes cull reads every declared region |
| Scenarios: a Keen cage is not a region, and a Killer cage forbids repeats only | spec: Only two kinds of region are declared |

## Latin-family hints distinguish naked and hidden singles

| Rule | Where it went |
| --- | --- |
| A forced single is narrated by the deduction that forces it, re-derived from the board, in every game on the shared Latin solver and in Solo | spec: Latin-family hints distinguish naked and hidden singles |
| Only empty cells compete for a value | spec: Latin-family hints distinguish naked and hidden singles |
| A game reclassifies only a recorded `single`, and its own forced placements keep their reasons | spec: Latin-family hints distinguish naked and hidden singles |
| The generic `elim` records both kinds under one `single` reason | reason |
| A naked single's sentence and its evidence, the cell alone, and a hidden single's sentence and its evidence, the whole region | spec: A naked single shades its cell and a hidden single its region |
| A placement that is neither is governed by the classifier requirement | spec: A classified placement rests only on strikes the board shows |
| Scenario: a hidden single is narrated by its line | spec: A naked single shades its cell and a hidden single its region |
| Scenario: the naked phrasing is never used on a multi-candidate cell | spec: Latin-family hints distinguish naked and hidden singles |

## A shared candidate-elimination hint plan

| Rule | Where it went |
| --- | --- |
| The engine provides the whole plan walk (`runCandidatePlan`), a game's `buildSteps` hands its plan to it directly or through a preset, and the solvers and generator do not change because of it | spec: A shared candidate-elimination hint plan |
| The ladder: singles, own rungs, recorded strikes, recorded placements, with the last-resort signal, the step budget and the iteration cap | spec: The walk owns the ladder |
| The ladder runs in the note-free opening until setup is done and in the whole walk after it | spec: The walk owns the ladder |
| The setup: a lazy populate then the clean, or the clean alone under the implicit reading, unless the game supplies its own | spec: The walk owns the setup |
| A rung returns firings as lists of legs, and the walk builds each step, adding the move, the targets, the marks and the implicit reading's note legs | spec: The walk builds every step from the game's words |
| The placement cull, as a leg of the placement's journey or silently under auto-pencil | spec: A placement's cull continues its journey |
| A firing is emitted whole, its later legs flagged `continuesPrevious` | spec: A firing is emitted whole |
| The game keeps its solver, its words and evidence, its strike axis, its rungs, its hooks and its regions | spec: The game keeps what carries its meaning |
| The pure plan helpers over a working board and a recorded script | spec: The engine provides the pure plan helpers |
| The first recorded placement not yet on the grid and the next forced placement, listed as two helpers | untrue: `src/engine/candidate-hint.ts` exports one, `nextPlace`, which returns the first recorded placement whose cell is still empty, so the requirement names it once |
| Generic `keepCandidateHintTrack` and `refreshCandidateHintStep` over the shared pencil-move shape and `CandidateHighlights` | spec: The shared track and refresh read a game's move dialect |
| The classifier classifies over an arbitrary region list | spec: The placement classifier takes any region list |
| The paths `src/engine/candidate-plan.ts` and `src/engine/latin-hint.ts` | held: src/engine/candidate-plan.ts "export function runCandidatePlan"; held: src/engine/latin-hint.ts "export function classifyPlacementInRegions" |
| Scenario: a hidden single in a non-row/column region | spec: The placement classifier takes any region list |
| Scenario: a placement's cull continues its journey | spec: A placement's cull continues its journey |
| Scenario: a firing is one journey | spec: A firing is emitted whole |
| Scenario: a game's steps are built by the walk | spec: A shared candidate-elimination hint plan |

## A row/column Latin square answers no question its regions already settle

| Rule | Where it went |
| --- | --- |
| The engine provides a preset (`runLatinCandidatePlan`) supplying every field a row and a column force, so a plain Latin game supplies its solver, rungs and words only | spec: A row/column Latin square answers no question its regions already settle |
| Every game remains free to call the general entry point, and one that does says why | spec: A row/column Latin square answers no question its regions already settle |
| It says why in its change | history |
| The fields: the regions, the reason a single narrates as, and the setup sentences from the game's noun and verb | spec: The fields the row/column preset supplies |
| A hidden single's placement evidence is a field of the preset, which shades the line over whatever area the game's words returned | untrue: `runLatinCandidatePlan` passes the game's `placeWords` through unchanged, and the line is striped by the words that name it (`narrateLatinReason`'s `hiddenSingle` arm in `src/engine/hint-text.ts`), so the requirement says the preset adds no evidence |
| The setup sentences are two | untrue: the preset builds three sentences from the vocabulary (`populate`, `cleanObvious` and the implicit reading's `note`) and the conclusions as well |
| A game whose singles narrate over another region cannot take the preset, by type and not by convention or roster | spec: A game reasoning over other regions cannot take the preset |
| The preset is behavior-preserving for the games converted to it | history |
| Scenarios: a plain Latin game declares no regions | spec: A row/column Latin square answers no question its regions already settle |
| Scenario: a game reasoning over other regions cannot take the preset | spec: A game reasoning over other regions cannot take the preset |
| Scenario: the setup sentences name the regions without being told them | spec: The fields the row/column preset supplies |

## A region's name is read off the region

| Rule | Where it went |
| --- | --- |
| The words for the kinds of region are read off the declared regions, and the word is a property of the region | spec: A region's name is read off the region |
| The word is not carried by the hidden-single tag | spec: A region's word is not the tag that names a hidden single |
| Names decide what a citation repeats, and a board-wide citation names the union of the board's regions | spec: A citation repeats names, not regions |
| Scenario: a word is not a second statement of the regions | spec: A region's name is read off the region |
| Scenario: a region that holds no full set is still named | spec: A region's word is not the tag that names a hidden single |
| Scenarios: two regions called by one word, and the board-wide clean | spec: A citation repeats names, not regions |

## A candidate game's regions may come from a partition

| Rule | Where it went |
| --- | --- |
| The machinery accepts partition regions with no engine change, a region is marked whole only when it must be, which for a partition is its size, and a repeat-only region is not so marked | spec: A candidate game's regions may come from a partition |
| A value with one home left in a repeat-only region is not thereby forced there | spec: A cell's regions are one definition per relation |
| Scenario: a partition-region game classifies its singles correctly | spec: A candidate game's regions may come from a partition |

## A deduction over a graph is a reason, not a plan shape

| Rule | Where it went |
| --- | --- |
| Graph deductions are ordinary recorded eliminations with a game-specific reason, and the own-rungs slot is for a move the canonical shapes cannot express | spec: A deduction over a graph is a reason, not a plan shape |
| A premise asserting a walk is computed, checked, and shown as an ordered, numbered area | spec: A premise that asserts a walk is computed and numbered |
| Scenario: a reachability deduction needs no plan extension | spec: A deduction over a graph is a reason, not a plan shape |

## The recording path steps the ladder one firing at a time through the engine

| Rule | Where it went |
| --- | --- |
| The engine provides a one-firing driver beside the runner, a recording hint uses it, and the two share one pass down the ladder | spec: The recording path steps the ladder one firing at a time through the engine |
| Each call runs from the first technique and returns the one that fired or nothing, a contradiction is sticky, and the budget is required with a tally that outlives a call | spec: A call of the driver returns one firing, and a contradiction is sticky |
| The driver returns every firing, and whether one is shown is the plan loop's decision | spec: The driver returns a firing the player cannot see |
| Scenario: one firing per call | spec: The recording path steps the ladder one firing at a time through the engine |
| Scenario: a firing with nothing to show is still returned | spec: The driver returns a firing the player cannot see |
| Scenario: a contradiction stops the driver for good | spec: A call of the driver returns one firing, and a contradiction is sticky |

## The hint frontier keys on whatever a game's steps act on

| Rule | Where it went |
| --- | --- |
| `HintFrontier` takes a key, a grid game passes `gridKey(w, h)`, a game whose elements are not cells passes its own, and the key does not change the continue rule | spec: The hint frontier keys on whatever a game's steps act on |
| A direct user of the frontier is derived from its source and held to an exact ledger naming its guard | spec: A game taking the frontier directly is held by a ledger |
| The cross-game measurement reads a square grid | untrue: `planContinuity` in `src/engine/testing/plan-continuity.ts` reads a grid with its own width, square or not, so the requirement says a grid |
| Scenario: a graph game continues from the region it just colored | spec: The hint frontier keys on whatever a game's steps act on |
| Scenario: a new direct user of the frontier is not missed | spec: A game taking the frontier directly is held by a ledger |

## A shared narrator for generic Latin placements and strike premises

| Rule | Where it went |
| --- | --- |
| `narrateLatinReason` renders the generic placement reasons and `latinPremise` the generic strike premises, a row/column game delegates those arms, and each refuses the other half | spec: A shared narrator for generic Latin placements and strike premises |
| The signatures `narrateLatinReason(reason, n, vocab?)` and `latinPremise(reason, ns, vocab?)` | untrue: `src/engine/hint-text.ts` declares `narrateLatinReason(reason, at, w, vocab)` and `latinPremise(reason, marks, vocab)`, so the requirement names the functions without their parameters |
| The list of the games that delegate | history |
| The module's path, `src/engine/hint-text.ts` | held: src/engine/hint-text.ts "export function narrateLatinReason" |
| A game whose wording diverges keeps its own narration, as Solo and Towers do | spec: A game whose generic wording diverges keeps its own narration |
| Solo and Towers share only the forcing-chain premise and the confined premise | untrue: `src/games/towers/hint-text.ts` and `src/games/solo/hint-text.ts` also import `placedRulesOut`, the placement cull's premise, so the requirement lists all three and drops "only" |
| Scenarios: a delegated arm narrates the shared sentence, and a narrator refuses the other half | spec: A shared narrator for generic Latin placements and strike premises |

## A candidate strike SHALL end in the walk's conclusion

| Rule | Where it went |
| --- | --- |
| A strike's words are a premise, the walk ends the sentence with the plan's `conclude` words for the step's move, and a game off the preset supplies its own | spec: A candidate strike SHALL end in the walk's conclusion |
| The row/column preset builds `conclude` from the game's `notes` vocabulary | spec: The fields the row/column preset supplies |
| A premise says how the conclusion refers to the struck notes: `where`, `struck`, `named` | spec: A premise says how its conclusion refers to the struck notes |
| Scenario: a game writes no strike conclusion | spec: A candidate strike SHALL end in the walk's conclusion |
| Scenario: a premise that names the values is not repeated | spec: A premise says how its conclusion refers to the struck notes |

## A candidate hint plan reads an unmarked cell the way the player chose

| Rule | Where it went |
| --- | --- |
| The walk takes a reading of a blank note-less cell, offered through `hint-notes`: `populate` fills, cleans and reads the notes alone, `implicit` reads what the regions leave and emits no fill-all | spec: A candidate hint plan reads an unmarked cell the way the player chose |
| Under implicit the plan writes, before a firing's steps, the notes of every note-less cell it outlines, reads or strikes without folding | spec: The implicit reading writes the notes a firing rests on |
| It writes no notes for a cell from the leg that places in it on, and does write them when an earlier leg rests on the cell | spec: A cell a leg places in takes no notes from that leg on |
| A note-less cell with one value left is placed as a single in its own words | spec: A note-less single is placed in its own words |
| A strike is folded when its marks lie in one note-less cell, its premise has no `where` and no earlier leg reads or strikes the cell, and what it leaves accounts for an earlier fold's placement | spec: A strike from one note-less cell is folded |
| The plan's notes go on through `pencilAdd`, which the track follows and the refresh shrinks, and which draws no struck marks | spec: The plan writes notes through a move that only adds |
| A game states its starting reading in `newUi`, a hint without a `Ui` gets the game's default, and a plan with its own setup walks populate only | spec: A game states the reading it starts on |
| Under populate nothing folds, and the plan is what it would be without folding | spec: Nothing folds under the populate reading |
| Scenarios: a sudoku solved from singles, and every enrolled game keeps its promises under either reading | spec: A candidate hint plan reads an unmarked cell the way the player chose |
| Scenarios: a strike from a note-less cell, and a later fold sees an earlier one | spec: A strike from one note-less cell is folded |
| Scenario: a cage deduction writes its cage's notes | spec: The implicit reading writes the notes a firing rests on |
| Scenario: a journey's first step rests on a cell a later leg places in | spec: A cell a leg places in takes no notes from that leg on |

## What a placed value rules out may depend on the value

| Rule | Where it went |
| --- | --- |
| The walk takes what a placed value rules out as a reach, every place that asks reads it, and "no-repeat regions" at those places means the reach | spec: What a placed value rules out may depend on the value |
| The default reach is the cell's regions, a value-dependent game supplies its own and keeps `regionsOf`, and a reach is symmetric | spec: The default reach is the cell's regions |
| `RungContext.populated` means the setup is finished, the clean included, under either reading | spec: A rung sees the setup as finished only after the clean |
| Scenario: a value rules itself out only as far as it reaches | spec: What a placed value rules out may depend on the value |
| Scenario: a game whose rule is its regions passes no reach | spec: The default reach is the cell's regions |

## The implicit reading opens only on a stale note

| Rule | Where it went |
| --- | --- |
| Under implicit the setup counts as done while no note is one the clean would strike, and while one remains the opening runs as under populate, ending with the clean | spec: The implicit reading opens only on a stale note |
| Scenarios: a fresh board competes every rung, and a stale note still lets a single go first | spec: The implicit reading opens only on a stale note |

## A game's rung reads the walk's recorded placements

| Rule | Where it went |
| --- | --- |
| The walk hands every rung its placements (`RungContext.placements`), and a game whose placements lead takes them from there and does not decide availability | spec: A game's rung reads the walk's recorded placements |
| Scenario: Group's placements lead without a rule of Group's own | spec: A game's rung reads the walk's recorded placements |

## A recorded firing's premise SHALL name every cell its deduction reads

| Rule | Where it went |
| --- | --- |
| A recorded firing's premise names every cell its deduction reads, a cell read for what it does not hold included | spec: A recorded firing's premise SHALL name every cell its deduction reads |
| The recorded reason carries unnamed cells as `reads`, the walk adds them, and a placement leaves out only the cells its legs act on | spec: A recorded reason carries the cells its words do not name |
| The audit returns every cell outside the premise to the start, reruns the technique, and reports a firing that no longer follows | spec: The engine audits a premise by replaying its firing |
| The audit's path, `src/engine/firing-replay.ts` | held: src/engine/firing-replay.ts "export function auditRecordedPremises" |
| It first replays from the recorded state, reports a recording with no replay, and counts the cells it tested | spec: The premise audit checks its own instrument |
| A guard runs it over every walk game under every reading, on a board per leaf preset and any added board, with an exact ledger for a game it cannot audit | spec: A guard runs the premise audit over every game on the walk |
| A technique that reads more than it concludes from is ledgered with why, pinned to a board, and a fix it could hide has a test of its own | spec: A technique that reads more than its conclusion rests on is pinned |
| Scenario: a fish names the rest of its lines | spec: A recorded firing's premise SHALL name every cell its deduction reads |
| Scenario: a premise cut short turns the guard red | spec: The engine audits a premise by replaying its firing |
| Scenario: a note leg does not remove a premise cell | spec: A recorded reason carries the cells its words do not name |
| Scenario: a solver that offers no replay is reported | spec: A guard runs the premise audit over every game on the walk |

## A value confined across several lines shows the lines

| Rule | Where it went |
| --- | --- |
| The step stripes the confining lines and outlines the cells the value can still take, its premise is `confinedPremise`'s one sentence, and no game writes its own | spec: A value confined across several lines shows the lines |
| The solver says which lines confine the value, and one without repeated values records the fewer lines | spec: The solver says which lines confine a value |
| Scenarios: the lines are on the frame, and the premise the step marks is the one the firing needs | spec: A value confined across several lines shows the lines |
| Scenario: the fewer lines are named | spec: The solver says which lines confine a value |
