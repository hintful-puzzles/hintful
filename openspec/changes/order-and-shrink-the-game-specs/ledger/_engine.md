# The engine amendments the cut leans on

Requirements written into the engine capabilities so that a game's sentence
has a shared requirement that states all of it (design.md, § "The owner's
answer: C, amended", rule 1). Each was read against the code named, not
against the game specs.

| Capability | Requirement title | Added or extended | Read against | Game specs that state it of themselves today |
| --- | --- | --- | --- | --- |
| `border-grid` | Each button cycles an edge between its own state and undecided | added | `src/engine/border-grid.ts`: `edgeEdits`, `borderGridVerbs` (`primary`, `secondary`) | `palisade`, "Controls: Each button toggles the nearest edge toward its own state" and "Rules: Palisade edges are three-valued and shared between cells" (the two-sided edit); `separate`, "Controls: Each button toggles the nearest edge toward its own state" and "Rules: Separate uses a three-valued wall model with a half-grid cursor" |
| `border-grid` | A press addresses the nearest interior edge | added | `src/engine/border-grid.ts`: `pointerEdge`, `borderGridGeometry` (`pointerTarget`) | `palisade` and `separate`, "Controls: Each button toggles the nearest edge toward its own state" ("the edge nearest the pointer") |
| `border-grid` | The keyboard cursor moves by half a cell | added | `src/engine/border-grid.ts`: `borderGridGeometry` (`cursorTarget`, `moveCursor`), `moveBorderCursor`; `src/engine/target-verb.ts`: `interpretTargetVerbs` | `palisade`, "Controls: Each button toggles the nearest edge toward its own state" (last sentence); `separate`, "Rules: Separate uses a three-valued wall model with a half-grid cursor" (last sentence) |
| `border-grid` | A drag along a line of edges repeats the press | added | `src/engine/border-grid.ts`: `borderGridVerbs` (`sweep`); `src/engine/target-verb.ts`: `sweepTo`, `beginSweep` | none: the drag is in neither game's spec |
| `border-grid` | The board reddens an edge beside a group joined past the region size | added | `src/engine/border-grid-render.ts`: `borderErrorBits` (`tooLarge`); `src/engine/border-grid.ts`: `buildDsf` | `palisade`, "Rules: Palisade reddens what the board already contradicts" (first sentence, first item, and its first scenario); `separate` states none of the error model |
| `border-grid` | The board reddens a wall beside an undersized region and a wall that divides nothing | added | `src/engine/border-grid-render.ts`: `borderErrorBits` (`tooSmall`, `dangling`), `mistakeEdgeBits`, `drawBorderTile` | `palisade`, "Rules: Palisade reddens what the board already contradicts" (first sentence, second and third items, and its second scenario) and "Rules: Palisade checks mistakes against the unique solution" ("`redraw` SHALL redden each flagged edge") |
| `border-grid` | A hinted edge's step is completed by the edit that sets it | added | `src/engine/border-grid-hint.ts`: `borderHintKeepTrack` | `palisade`, "Hint: Making the hinted edit completes the step"; `separate` states none |
| `ts-engine` | Only the Solve command sets the solver record | added | `src/engine/midend.ts`: `Midend.solve` (the one place the record is set), `Midend.executeHint`; `src/engine/completion-status.ts`: `completionStatus` | `inertia`, "Hint: A hint is a nudge, and only Solve is a commitment" |
| `engine-params` | The engine provides the dot-run description grammar | added | `src/engine/dot-runs.ts`: `writeDotRuns` | `clusters`, "Description: Clusters descriptions use the upstream run-length dot encoding" and "Description: A Clusters description closes in lowercase and keeps a skip in its dot's case"; `unruly`, "Description: Unruly descriptions are run-length color grids" |
| `engine-params` | The dot-run reader refuses what its writer never writes | added | `src/engine/dot-runs.ts`: `readDotRuns`; `src/engine/desc-reader.ts`: `DescReader` | `clusters`, the same two; `unruly`, "Description: A malformed Unruly description is refused" |
| `engine-notes` | The pencil preferences have one key each, which a saved preference depends on | added | `src/engine/pencil-prefs.ts`: `stickyPencilPref`, `autoPencilPref`, `pencilKeepHighlightPref`; `src/engine/note-taking-cell.ts`: `releaseHighlightAfterEntry`; `src/engine/midend.ts`: `Midend.setPreferences` | `solo`, "Preferences: Solo exposes pencil-mark preferences" and "Preferences: Auto-pencil strikes a placed digit from its no-repeat regions"; `unequal`, "Preferences: Unequal exposes pencil-mark preferences"; `mathrax`, "Preferences: Mathrax offers the sticky pencil and auto-pencil preferences"; `towers`, "Preferences: Towers offers a sticky pencil mode" and "Preferences: Towers auto-pencils row/column eliminations on placement"; `keen`, "Preferences: Auto-pencil strikes a placed digit from its row and column". What each game's auto-pencil strikes from stays the game's |

`border-grid`'s Purpose was reworded: it said what each button does is stated
in `palisade` and `separate`, and now says it is stated here.

No existing requirement was extended or renamed. "A border-grid game takes the
mechanic from the engine and owns no copy" and "Border-grid games share the
hint's notation layer" stand as they were: they say the mechanic is shared,
and the new ones say what it does.

## Not written

Nothing of the four was left. The dot-run grammar is shared code, an engine
module both games call (`src/games/clusters/state.ts` and
`src/games/unruly/state.ts`, each through `readDotRuns` and `writeDotRuns`),
so it was stated in `engine-params` beside the two desc value alphabets.

## Found

- **Only Inertia's spec says a hint does not set the solver record.** The
  brief expected several. A search of the game specs for the solver's use,
  "auto-solve" and "solved with help" finds that one requirement; after the
  amendment its first sentence is a copy, and its second (the engine's helped
  mark) is "Help is the app doing some of the solving".
- **Palisade's "a wall dangling within a single region" is wider than the
  code.** `borderErrorBits` reddens a wall between two cells of one
  wall-bounded region only when that region holds at most `k` cells, or when
  no-wall marks join the two cells. A wall that does not yet close anything,
  inside a region still larger than `k`, is not red: that is every wall a
  player draws on a new board. The code is right and `border-grid` now says
  so; Palisade's sentence goes with the cut.
- **Palisade's "an edge beside a group ... larger than `k`" is narrower than
  it reads.** The code reddens every interior edge between the group and a
  cell outside it, undecided edges included, and not only walls. The existing
  Separate scenario in `border-grid` ("the edges between that region and its
  neighbors") agrees with the code.
- **Separate's spec says nothing of the live error model**, though it draws
  with the same `borderErrorBits` and the same `k`. Nothing to cut there, and
  nothing missing once `border-grid` states it.
- **Separate files the half-cell cursor under `Rules`** ("Rules: Separate uses
  a three-valued wall model with a half-grid cursor") and names the keys
  "select and select2"; Palisade files it under `Controls`. Both go to
  `border-grid`, "The keyboard cursor moves by half a cell".
- **A drag crossing a row of cells takes the edges it crosses.** The reach is
  measured from an edge's true middle, so a drag through the middles of a row
  of cells passes each edge between them at its middle and takes it. The new
  requirement states the reach and gives the along-a-line case; the
  across-a-row case follows from the same sentence and has no scenario.
- **Unruly's spec does not state the case rules its parser applies**: that
  the closing letter is lowercase, and that a `z` or `Z` skip is in the case
  of the clue that ends its run. Clusters' does. Both are `readDotRuns`, so
  an Unruly description closing in uppercase is refused, which its spec does
  not say.
- **The app stores a default of its own for `pencil-keep-highlight`.**
  `getPuzzlePreferences` in `src/store/settings.ts` seeds
  `"pencil-keep-highlight": true` into every game's preferences, under a TODO
  to move it. It is a second statement of the default that `engine-notes`,
  "Every member offers the keep-highlight preference, defaulted the same way",
  gives to each game's `newUi`, and a second place the key's spelling lives.
  It agrees today.
- **`hint-notes` is a fourth key in `pencil-prefs.ts`** (`candidateReadingPref`).
  `engine-candidate-hints` names it; it was not one of the three asked for and
  was left there.
- **Preferences are stored per game**, but for `one-key-shortcuts`
  (`splitPuzzlePreferences`). The pencil keys are shared spellings, not shared
  values: a preference set in one game is not read by another.

## Review

Each requirement read against the code named above and against how Palisade,
Separate, Clusters and Unruly call it. No title was renamed.

| Requirement | Verdict |
| --- | --- |
| Each button cycles an edge between its own state and undecided | sound |
| A press addresses the nearest interior edge | corrected: "nearest" did not say what a tie takes. `pointerEdge` gives the upper or lower edge before a side one, and the lower or right before its opposite (the exact middle of a cell is its lower edge); the sentence now says so |
| The keyboard cursor moves by half a cell | corrected: the select keys act on the edge the *shown* cursor rests on. On a hidden cursor the first select only shows it (`engine-input`, "The engine owns a declaring game's press and select keys") |
| A drag along a line of edges repeats the press | sound; a scenario added for the drag across a row of cells, which takes each edge it crosses and leaves those above and below. It restates `engine-input`, "A drag on from a press repeats the press", for edges and agrees with it |
| The board reddens an edge beside a group joined past the region size | corrected: "the cells joined to either ... number more than `k`" could be read as not counting the cell itself. The code counts the group, the cell included |
| The board reddens a wall beside an undersized region and a wall that divides nothing | sound. `mistakeEdgeBits` flags only the side it is handed, and both games' `findMistakes` report an edge from both cells, so the edge is red on both tiles |
| A hinted edge's step is completed by the edit that sets it | sound; the helper never answers `"onTrack"` |
| Only the Solve command sets the solver record | corrected: the first scenario's status-bar words hold only in a game with a status bar, and now says so. A game without `statusbarText` is sent no completion words |
| The engine provides the dot-run description grammar | corrected: the subject was "a description of blank cells and marks of two kinds", which claims every such description in the collection; it is now the two helpers, with which mark is which kind left to the game, and the letter's offset said to be the blanks no skip counted |
| The dot-run reader refuses what its writer never writes | sound. A run past the last cell is refused as too long before the closing letter's case is looked at |
| The pencil preferences have one key each, which a saved preference depends on | sound; no game spells a key of its own |

The Found list, each item checked against the code: all ten are true. None is
a defect a player meets. Two are behavior a player sees that no spec stated
before: the drag across a row of cells (now a scenario), and the refusal of an
Unruly description with an uppercase closing letter or a skip in the other
case from its mark. Upstream's `validate_desc` accepts both and its generator
writes neither (`../puzzles/unruly.c`), so no board the app or upstream deals
is refused. The seeded `pencil-keep-highlight` in `src/store/settings.ts`
agrees with every game's `newUi` today; its comment names four games and the
seed reaches all of them.

## Second round

What the first two games cut asked for (`clusters.md` and `palisade.md`,
§ "Engine requests"). Each was read against the code named.

| Capability | Requirement title | Added or extended | Read against | Game specs that state it of themselves today |
| --- | --- | --- | --- | --- |
| `engine-input` | The engine owns a declaring game's press and select keys | extended: a verb's own key, a key-only verb's included, only shows a hidden cursor; two scenarios added | `src/engine/target-verb.ts`: `interpretTargetVerbs`, and the lookup of a key's verb beneath it | `clusters`, "Controls: Clusters' number keys set the cursor's square outright" (last sentence). No other game with a keyed verb says it (`boats`, `bricks`, `lightup`, `loopy`, `net`, `slant`, `sticks`, `subsets`, `tents`, `unruly`) |
| `engine-hints` | A hint is deduced from the board in play | added | `src/engine/midend.ts`: `Midend.hint`, and the two private steps under it that compute a plan and ask the game; `src/engine/hint-plan.ts`: `deduceHintPlan` | `ascent`, "Hint: Ascent explains the next number"; `boats`, "Hint: The Boats hint replays the solver's deductions one firing at a time"; `bricks`, "Hint: Bricks provides an explained deduction hint"; `clusters`, "Hint: A recomputed Clusters plan continues where the last one left off"; `crossing`, "Hint: Crossing explains its next deduction from the board"; `dominosa`, "Hint: Dominosa provides an explained deductive hint"; `lightup`, "Hint: Light Up ships an explained deductive hint"; `magnets`, "Hint: Magnets offers an explained hint"; `palisade`, "Hint: The plan is every edge the deductions force from the player's walls and marks"; `range`, "Hint: Range provides an explained deduction hint"; `singles`, "Hint: Singles provides an explained deduction hint"; `slant`, "Hint: Slant ships an explained deductive hint"; `subsets`, "Hint: Subsets provides an explained hint"; `tracks`, "Hint: Tracks explains the next deduction"; `unruly`, "Hint: Unruly provides an explained deduction hint" |
| `engine-params` | The dot-run reader reads back what its writer wrote | added (the grammar's own requirement is at the length limit) | `src/engine/dot-runs.ts`: `writeDotRuns`, `readDotRuns` | `clusters`, "Description: Clusters descriptions use the upstream run-length dot encoding" (scenario "A generated description round-trips"); `unruly`, scenario "A description round-trips" |
| `border-grid` | A cell holds its four edges in one byte, and an edge is on both its cells | added | `src/engine/border-grid.ts`: `BORDER`, `DISABLED`, `BorderEdit`, `edgeEdits`, `initBorders`; `executeMove` in `src/games/palisade/state.ts` and `src/games/separate/state.ts` | `palisade`, "Rules: Palisade edges are three-valued and shared between cells"; `separate`, "Rules: Separate uses a three-valued wall model with a half-grid cursor" (three-valued and on both cells; it does not give the bits) |
| `engine-difficulty` | The engine counts a searching game's answers up to two, within a budget of positions | added | `src/engine/answer-search.ts`: `searchAnswers`, `solvedPositions`, `AnswerSearch` | `abcd`, `filling`, `palisade`: "Solver: … counts a clue set's answers by a bounded search"; `crossing`, `mosaic`, `net`, `pattern`, `range`, `rect`, `separate`, `signpost`, `sticks`: "Solver: … counts a board's answers by a bounded search" |
| `engine-difficulty` | One search answers a board for everything that asks | added | `src/engine/answer-search.ts`: `answerCache`, `searchTiers` (its `contract`), `dealUnreasonable`; each of the twelve games' `answerOf`, `findMistakes` and `solve` | the same twelve: where each says its Solve or its mistake check reads "the search that counts its answers, at either difficulty" (`abcd` and `pattern` say both in the bounded-search requirement; the others say the mistake check's in its own requirement) |
| `engine-difficulty` | Solve from the search shows the one answer or says which it lacks | added | `src/engine/answer-search.ts`: `solveFromAnswer`; `src/engine/solve-failure.ts`, `src/engine/hint-refusal.ts` | `abcd`, `crossing`, `filling`, `net`, `palisade`, `pattern`, `separate`, `sticks` in the bounded-search requirement; `range`, "Solver: Range's Solve searches where deduction stalls"; `mosaic` and `signpost`, each in a solver requirement of its own. `rect` was not found to say it. `crossing` adds that Solve says several or none only where the search proved it, which is this requirement's refusals |
| `engine-difficulty` | A game that searches has a tier for each deduction and Unreasonable above them | extended: a string with no `d` is left at the tier of `defaultParams`, which is to be Easy; one scenario added | `src/engine/answer-search.ts`: `searchTierSegment`; `src/engine/params-codec.ts`: `choice`, `paramsCodec` | all twelve: "a string (or an ID) with no difficulty letter SHALL decode as Easy", each in its params requirement |
| `engine-params` | A params string is read whole or refused | extended: what a piece left out is read as; scenario "A piece left out" reworded and "A region size left out" added | `src/engine/params-codec.ts`: `choice`, `num` (`whenAbsent`), `flag`, `paramsCodec` | `palisade` and `separate` (a bare size is regions of its width); every tiered game states its absent tier of itself |

### Not written

- **Nothing was left of the seven.**
- **What a game branches on and how large its budget is stay the game's**, as
  asked: the search requirement names what the game supplies and no more.
- **That each game's deduction can report a contradiction** is a condition on
  the game and is said as one ("its deduction, which reports a
  contradiction"). What counts as one in each game stays in its spec.
- **The absent tier of a game with a hand-written codec, or one whose tier is
  a `choice` and not `searchTierSegment`** (Clusters), stays the game's to
  state: the engine fixes no tier for it.

### Found

- **`searchTierSegment` does not read an absent tier as Easy.** It is `choice`
  with a table of letters, and `choice` leaves the field alone where its tag
  is absent, so the tier is whatever decoding began with: `defaultParams()` in
  a `paramsCodec` game, and in Net and Rectangles, whose codecs are
  hand-written, the `defaultParams()` their own `decodeParams` starts from.
  `engine-difficulty` said the segment "SHALL read a string with no tier as
  Easy"; it now says the segment leaves the default's tier and that the
  default is to be Easy. All twelve games' defaults are Easy today. The
  engine's own test of the segment passes because its toy game's default is
  Easy, and no cross-game guard holds a game on the search's tiers to an Easy
  default: a game that changed its default tier would change what an old ID
  with no `d` deals, with every test of the engine green.
- **A bare params string's tier is not a loaded board's.** The decoded tier is
  what a new board is dealt at. A board loaded by an ID with no tier is graded
  (`engine-difficulty`, "A loaded board whose id states no tier takes the
  lowest tier that solves it"), as `clusters.md` § "Found" already records.
- **Net's Solve does not search a board it dealt.** It takes the network the
  deal recorded, as one answer, and hands that to `solveFromAnswer`; only a
  pasted board is searched. The other eleven search at Solve whatever dealt
  the board. "One search answers a board for everything that asks" carves it
  out ("but where the game kept the answer its deal drew"), and Net's spec
  says so of itself ("or from the network a dealt board was drawn as"), which
  stays Net's.
- **The deal does not read the kept answer.** `dealUnreasonable` asks the
  game's search directly, within the dealing budget where the game strips, so
  it is the same search under a smaller budget and not the cache.
- **An `edges` move holds bits to flip, not an edge's state.** Each edit is a
  cell and a mask that `executeMove` applies with exclusive-or, so the same
  move replayed undoes itself. Palisade's "`executeMove` sets the right-wall
  bit" is the first application only. Both games refuse an edit that flips a
  rim wall, each in its own `executeMove` with its own message; that check is
  not the shared module's.
- **The key that only shows a hidden cursor is any key the model binds**, not
  only a key-only verb's: Net's `A` and `D` and Light Up's `I`, which belong to
  a button's verb, do the same. A key pressed while the shown cursor rests on
  no target applies nothing and repaints nothing.
- **`deduceHintPlan` copies nothing.** It deduces in place on the board it is
  handed, so that the plan starts from the player's board is each caller's
  one line, and the engine's guarantee is only that `Game.hint` is handed the
  state in play.
- **No game starts its hint from the givens.** Every game's hint was read to
  the line that builds its working board (a subagent's survey; the callers of
  `deduceHintPlan`, the candidate walk, and Map, Mines, Mosaic, Net, Pattern,
  Filling and Dominosa read again by the writer). Every game with a hint
  builds it from the state it is handed; Cube, Same Game, Slide and Twiddle
  have no hint. Four things short of the whole state, none of which makes a
  step of what the board holds:
  - **Filling falls back to the clues alone.** Where its recorder finds
    nothing on the player's board, it deduces on the clue-only board and takes
    the first fill the player still lacks (`deduceHintPlan` in
    `src/games/filling/solver.ts`), narrated against the player's board. That
    step's deduction does not rest on the player's entries, so the new
    requirement's "the player's entries included" holds of Filling's first
    resort and not of this one.
  - **Dominosa does not take the player's barriers as premises**, on purpose:
    a wrong one must not break the hint. Placed dominoes are premises. A
    barrier is a mark and not an entry, so the requirement is not broken.
  - **Mines does not take a flag as a premise** until it has proved it, and
    Black Box does not take a guessed ball as one for a ray.
  - **Boats, Spokes and Bricks ask a question of the clues before the plan**
    (the lowest cap that solves the board, or whether it solves at all); the
    plan itself runs on the player's board. Netslide and Untangle take their
    target from the known answer and search to it from the position.

### Review of the second round

Each requirement read against the code its row names, and against every game
that uses the mechanism. No title was renamed. The five capabilities validate
strictly, and `spec-form` and `spec-citations` pass.

| Requirement | Verdict |
| --- | --- |
| `engine-input`, The engine owns a declaring game's press and select keys | corrected: "a pointer press parks the cursor" claimed the right button in a game with no second verb, which `buttonVerb` gives no verb and the model passes over; it is now "a press of a button with a verb". "One that applies nothing repaints only when it hid a shown cursor" is the model's press and not a game's own arm's (Clusters' arm repaints on every press), so it now says "where the model applies nothing". The keys' clauses and both new scenarios are as `interpretTargetVerbs` has them: a key on a shown cursor with no target answers null |
| `engine-hints`, A hint is deduced from the board in play | corrected: "the player's entries included: what the board holds is a premise and never a step" was more than is true of all. Filling's last resort deduces from the clues alone, and Mines' flags, Dominosa's barriers, Black Box's guessed balls and Guess's rule-outs are marks their hints do not rest on (Guess derives its rule-outs from the scored rows and reads the player's only to skip a step). What holds of every hint: it is made from the state handed, an entry placed is never a step, and a step may rest on one; which marks, and a step from the clues alone, are the game's to state. "So a game hands it a copy" was dropped as a consequence and not a rule. A scenario added for the mark not taken on trust |
| `engine-params`, The dot-run reader reads back what its writer wrote | sound. A run of exactly twenty-five, a mark on the last cell and no cells were each walked through both functions |
| `border-grid`, A cell holds its four edges in one byte, and an edge is on both its cells | sound. The bits are `border-grid.ts`'s, both games start from `initBorders`, and both `executeMove`s apply an edit by exclusive-or; the three scenarios' numbers are `edgeEdits`' |
| `engine-difficulty`, The engine counts a searching game's answers up to two, within a budget of positions | corrected: what the game supplies left out that its assumptions hold each answer once, without which a board with one answer is counted as several. The budget scenario is true as written: the count is taken when a position is drawn, so one answer with a position still to try and nothing left is out of reach, and one answer with nothing left to try is one answer |
| `engine-difficulty`, One search answers a board for everything that asks | corrected: the deal was listed among the things that read the one kept answer. It asks the game's search afresh for each candidate, within the dealing budget where the game strips, so it is now said apart. Net's carve-out is true and reads "save on a board whose deal recorded its answer": Net alone takes Solve from `aux`, and its mistake check and contract search like the rest |
| `engine-difficulty`, Solve from the search shows the one answer or says which it lacks | corrected: the scenario "Solve on an Easy board" was false of a board Net dealt, and now excludes a board whose deal recorded an answer. The three refusals and the quoted sentence are `solve-failure.ts`'s and `hint-refusal.ts`'s |
| `engine-difficulty`, A game that searches has a tier for each deduction and Unreasonable above them | sound. `searchTierSegment` is `choice`, which leaves the field where its tag is absent, and every decoder that uses it starts from `defaultParams` (ABCD, Crossing, Filling, Mosaic, Net, Palisade, Pattern, Range, Rectangles, Separate, Signpost, Sticks; each default is Easy). Nothing asserts "SHALL be Easy": the params-stability snapshot records each default's full form, so a changed default tier shows as a changed line there and fails nothing by name |
| `engine-params`, A params string is read whole or refused | sound of a tagged field. A scenario added for a bare `flag` letter, which `flag` reads as the opposite of its meaning and not as `defaultParams` has it |

No second statement in the engine capabilities or `dealing` disagrees with
these. `engine-params`, "A board no cap solves is refused in the words its
game's tiers allow" is what refuses the board of the scenario "A board whose
search runs out does not load as Unreasonable".

For the hints the writer had from a survey: Black Box, Galaxies, Loopy,
Palisade, Guess, Flip, Flood, Fifteen, Sixteen, Pegs, Sokoban, Inertia,
Netslide and Untangle were each read to where the hint takes its board. All
start from the state handed. Cube, Same Game, Slide and Twiddle have no hint.

## Third round: the rest

What the 57 ledgers' `## Engine requests` asked of `engine-notes`,
`ts-engine`, `engine-difficulty`, `engine-params`, `engine-input` and
`engine-helpers`. Each was read against the code named. No title was renamed;
`engine-difficulty` was not changed.

| Capability | Requirement title | Added or extended | Read against | Game specs that state it of themselves today |
| --- | --- | --- | --- | --- |
| `ts-engine` | A mistake check compares with the one answer, hidden or not | extended: with no one answer established, nothing is flagged for differing from one, and the result is empty but for a broken rule the game's spec says it reports; two scenarios added | `findMistakes` in `src/engine/game.ts` (the hook's contract: what contradicts the unique solution); every game's `findMistakes`; `src/engine/entry-mistakes.ts`: `entryMistakes` (handed an answer, never the lack of one) | `crossing`, "Rules: Crossing's findMistakes compares the board with the unique solution"; `filling`, "Rules: Filling reports mistakes for Check & Save"; `signpost`, "Rules: Signpost reports mistakes for Check & Save"; `palisade`, "Rules: Palisade checks mistakes against the unique solution"; `mosaic`, "Rules: Mosaic checks mistakes against the deduced solution"; `range`, "Rules: Range checks mistakes against the solution"; `net`, "Rules: Net flags wrong locks and notes"; `rect`, "Rules: Rectangles flags a drawn edge the solution lacks"; `separate`, "Rules: Separate's mistake check flags an edge decided against the one partition"; `sticks`, "Rules: Sticks findMistakes flags only lines that contradict the solution"; `keen`, "Rules: Keen's mistake check re-solves from the cage clues"; `towers`, "Rules: Towers' mistake check re-solves from its clues and givens"; `unequal`, "Rules: Unequal's mistake check re-solves from its givens and clues"; `mathrax`, "Rules: Mathrax's mistake check re-solves from its givens and clues"; `solo`, "Rules: Solo checks entries and notes against the answer its givens and cage sums fix"; `rome`, "Rules: Rome mistake-checking covers arrows and marks that break no rule"; `bridges`, "Rules: Bridges findMistakes reports every span the unique solution contradicts"; `dominosa`, "Rules: Dominosa flags a domino the unique solution lacks"; `slant`, "Rules: Slant ships findMistakes". `group` and `pattern` do it and do not say it. A game that reports a broken rule without an answer (`bricks`, `clusters`, `rome`, `subsets`) keeps that sentence |
| `ts-engine` | Solve by search finishes from the player's position, or else from the board as dealt | added | `src/engine/search-outcome.ts`: `solveBySearch`, `SearchOutcome`; `solve` in `src/games/pegs/index.ts` and `src/games/sokoban/index.ts`; `Midend.solve` | `pegs`, "Solver: Pegs' Solve finishes from the player's position, or else from the dealt board" (the order of the two searches and both failures; that the move leaves one peg where the line ends stays); `sokoban`, "Solver: Sokoban's Solve finishes from the player's position, or else from the dealt board" (first sentence, to "from the board as dealt"; what its move carries stays) |
| `engine-notes` | The highlight is part of the cell's background | extended: the wash replaces whichever surface the game gives the cell, a given's included, and the triangle lies over it; one scenario added | `src/engine/note-taking-cell.ts`: `drawCellBackground`, `highlightFill`; the call in `src/games/solo/render.ts` and `src/games/unequal/render.ts` | `solo`, "Look: Solo draws its digits on a quiet surface, with a given's cell lifted" (last sentence); `salad`, "Look: Salad's selection and hint marks keep the square's surface" (first sentence); `unequal`, "Hint: The selection is drawn over the box and the hint's marks beside it" (first sentence); `group`, "Look: Group draws its table on a quiet surface, with a given's cell lifted" (last sentence); `towers`, "Look: The selection's wash and the hint's marks keep to the cell" ("over whichever surface the cell has"; "on a tower's faces as on its top" stays, being `highlightFill` called by Towers for more than the rect) |
| `engine-notes` | An auto-pencil strike is decided when the placement is made | added | `executeMove` in `src/engine/game.ts` (no `Ui`); `src/engine/pencil-prefs.ts`: `autoPencilPref`; `src/engine/candidate-plan.ts` (the dialect's `place`); the `set` move and `executeMove` of `keen`, `mathrax`, `solo`, `towers`, `unequal` | `towers`, "Preferences: Towers auto-pencils row/column eliminations on placement" (both sentences; "row and column" stays as which regions); `keen`, "Preferences: Auto-pencil strikes a placed digit from its row and column"; `mathrax`, "Preferences: Auto-pencil strikes a placed digit from its row and column"; `unequal`, "Preferences: Auto-pencil strikes a placed number from its row and column"; `solo`, "Preferences: Auto-pencil strikes a placed digit from its no-repeat regions". In each, what is left is which regions |
| `engine-notes` | The highlight is the game's keyboard cursor | added | `src/engine/note-taking-cell.ts`: `NoteTakingUi`, `highlightIsOn`, `releaseHighlightAfterEntry`; `src/engine/pointer.ts`: `moveCursor`; the arrow arm of each of the thirteen members' `interpretMove` | `keen`, "Controls: Keen selects a cell through the shared note-taking cell" (last sentence); `undead`, "Controls: Undead's first arrow selects the top-left square" (that an arrow moves the highlight; where its first arrow lands and that it stops at the edge stay) |
| `engine-params` | The engine provides the run-letter description grammar | added | `src/engine/run-length.ts`: `encodeRunLength`, `scanRunLength`; its callers in `bridges`, `filling`, `lightup`, `mosaic`, `palisade`, `pearl`, `slant` (both), `loopy`, `map` (the writer only) | `slant`, "Description: Slant descriptions are run-length clue grids"; `palisade`, "Description: Palisade descriptions are run-length clue grids"; `pearl`, "Description: A Pearl run letter counts its unclued squares from a" (whole) and "Description: Pearl descriptions use the upstream run-length encoding"; `filling`, "Description: Filling descriptions are run-length number grids"; `lightup`, "Description: Light Up descriptions use the upstream run-length encoding"; `mosaic`, "Description: Mosaic descriptions are run-length clue grids"; `bridges`, "Description: Bridges descriptions encode the island clue grid"; `loopy`, "Description: Loopy descriptions use the upstream run-length encoding" (the writer's half). In each the value characters, the refusals and whether the last run is written stay. Not users, whatever their sentence: `tracks`, `sticks`, `range`, `rect`, `rome`'s clue half and the rest that read a letter run by hand |
| `engine-params` | The engine provides the wall-list description grammar | added | `src/engine/wall-runs.ts`: `encodeWallRuns`, `encodeRegionWalls`, `readRegionWalls`, `gapLetters` | `rome`, "Description: Rome descriptions use the region-border and clue encoding" (the wall list's sentence) and "Description: A Rome description is the walls, a comma, then the clues" (first two sentences); `seismic`, "Description: A wall-list letter is a run of open borders and the wall that ends it" and "Description: Seismic descriptions use the run-length wall and clue encoding" (the order of the borders) |
| `engine-params` | The wall-list reader refuses a run that passes the last border | added | `src/engine/wall-runs.ts`: `readWallRuns`; `src/engine/desc-reader.ts`: `DescReader` (`int`, `char`) | `seismic`, "Description: A wall-list letter is a run of open borders and the wall that ends it" (its scenario of a `z` for more borders than the board has); `rome` states no refusal of the list |
| `engine-params` | A bare flag letter left out is read as the opposite of its meaning | added (the body of "A params string is read whole or refused" speaks of tagged fields and is at its length; its scenario "A bare flag letter left out" stands) | `src/engine/params-codec.ts`: `flag` | `abcd`, "Params: An ABCD params string is its declared codec's, and one with no difficulty letter is Easy" ("A string with no `D` SHALL decode as a board that allows diagonal touching"); `tracks`, "Params: A Tracks params string may leave out its difficulty and its `o`". The other games with a `flag` (`bridges`, `crossing`, `magnets`, `signpost`, `unruly`) were not found to say it |
| `engine-input` | The digit keypad has one key for each value, a letter past nine | added | `src/engine/key-labels.ts`: `digitKeys`, `digitKeyCode`, `clearKey` | `solo`, "Controls: Solo interprets digit, pencil, and mark-all input" (last sentence). `unequal`, "Controls: The keypad is zero-based from order 10" is a keypad of its own and stays |
| `engine-input` | A press the game declines is answered with its release where it was pressed | added | `src/puzzle/components/view-interactive.ts`: the pointer-down handler | `guess`, "Controls: Guess's pointer acts on the release" ("An unconsumed press is answered with a release at the press point, so a press that slides off before it lifts SHALL still act where it started") |
| `engine-input` | Escape and the erase keys are the cancel keys | added | `src/engine/pointer.ts`: `isCancelKey`, `isEraseKey`, `ESCAPE`, `BACKSPACE`, `DELETE`; its callers in `slide`, `pearl`, `rect`, `loopy`, `net`, `slant` | `slide`, "Controls: Escape, Backspace and Delete each cancel in Slide" (first sentence) |
| `engine-input` | The engine provides the geometry of a grid of squares | added | `src/engine/target-verb.ts`: `squareGrid`; `src/engine/pointer.ts`: `moveCursor`, `gridCursorMove` | `twiddle`, "Controls: The Twiddle cursor moves over the rotation origins" ("clamped at the edges without wrapping"; that the squares are the rotation origins stays) |
| `testing` | A firing census certifies a solver's ladder | added (in `testing` and not `engine-helpers`, the census being a test helper; `testing`'s rung requirements, "A hint test's pinned positions keep the scan that finds them" and "A rung no known board fires is excused by name, with its reason", are of a hint's rungs and its pins, and state none of it) | `src/engine/testing/ladder-census.ts`: `describeLadderCensus`; `src/engine/deduction-fixpoint.ts` (the `firings` option) | `abcd`, "Solver: ABCD's solver classifies a clue set by deduction alone" (the census sentence and the scenario "A technique the corpus never reaches fails the census"); `solo`, "Solver: A census certifies that every rung fires"; `pearl`, "Solver: Pearl's solver is a certified deduction ladder" (last sentence); `tents`, "Solver: Tents' solver is a certified deduction ladder" (the census sentence). Which boards and caps stays in each |
| `engine-helpers` | A wire tile is four bits, one for each side its wire leaves by | added | `src/engine/wires.ts`: `R`, `U`, `L`, `D`, `clockwise`, `offset` | `net`, "Rules: Net's board and what counts as solved" (the mask); `netslide`, "Rules: Netslide's board, its source and the lines that never slide" (the mask) |
| `engine-helpers` | The engine provides the wire-grid description grammar | added | `src/engine/wires.ts`: `encodeWireDesc`, `parseWireDesc`, `addBorderBarriers`; `newState` in `src/games/net/state.ts` and `src/games/netslide/state.ts` | `net`, "Description: Net descriptions are a hex digit a tile, with its barriers" (first two sentences); `netslide`, "Description: Netslide descriptions encode wires and barriers" (first and last sentences) |
| `engine-helpers` | The wire-grid reader refuses what its writer never writes | added | `src/engine/wires.ts`: `parseWireDesc`; `src/engine/desc-reader.ts`: `DescReader` | `net`, the same requirement (last sentence); `netslide`, the same requirement (second sentence, and the scenario "A description one tile short") |
| `engine-helpers` | Power floods from the source along wires joined from both sides | added | `src/engine/wires.ts`: `computeActive`; its wrappers in both games' `state.ts` | `netslide`, "Rules: Netslide slides rows and columns, and powers the connected tiles" ("reachable from the source through mutually connected wires not separated by a barrier"). `net` says "powered" and does not say how |
| `engine-helpers` | A wire distance is counted in tiles along the wires | added | `src/engine/wires.ts`: `wireDistance`; `redraw` in `src/games/net/render.ts` and `src/games/netslide/render.ts` | `net`, "Look: The completion flash spreads from the source along the wires" (first sentence and the scenario "A neighbor the wires do not join"); `netslide`, "Look: A slide is animated, and completion flashes outward" (the same sentence and scenario) |

### Not written

- **The entry arm of a note-taking game** (`keen`, `towers`, `unequal`,
  `group`, `mathrax`): the games' own. No shared code decodes a key, tests a
  given or builds the move; each game's `interpretMove` does, and
  `src/engine/note-taking-cell.ts` records that lifting it was evaluated and
  declined, since it would need a shared move type. `engine-notes` already
  says so ("The note-taking cell is one shared mechanic", scenario "Code that
  merely looks alike stays with the games"; "A game in the mechanic keeps its
  puzzle and its own move"), and already states the shared half: what an
  entry does to the highlight and what a keystroke that writes nothing
  returns ("The engine owns what a press and an entry do to the highlight").
  No guard holds "in pencil mode no key changes a filled cell" or "a given
  takes no entry". The sentences stay in the five specs.
- **A board counts as Easy where the solver and the hint both finish it**
  (`crossing`, `filling`, `signpost`, `palisade`): the games' own.
  `hintFinishes` is stated (`engine-params`, "The engine walks a game's hint
  to the end of a board"), and the contract asks "the game's deduction"
  (`engine-difficulty`, "A game that searches has a tier for each deduction
  and Unreasonable above them"). What that is, `deductionFinishes`, each game
  writes: `abcd`, `crossing`, `filling`, `palisade`, `pattern`, `separate`,
  `signpost` and `sticks` ask their solver and `hintFinishes`; `net` the hint
  alone; `rect` its rungs and the search; `mosaic` and `range` their deduction
  alone. Nothing requires one of these.
- **Solve and the mistake check solve once at the top cap** (`boats`,
  `subsets`): the games' own. Each is a default argument or a helper in the
  game's solver; no engine code, type or guard asks at which cap `solve` or
  `findMistakes` runs. Monotonicity, which makes it sound, is stated. Subsets
  says it of its hint too, where the Latin games' hints run at the board's
  tier, so the collection has no one rule.
- **Completing the board hides the cursor** (`lightup`; `singles` unstated):
  the games' own, in each game's `changedState`, and the two differ (see
  Found). No engine code, type or guard asks it.
- **`findMistakes` in `engine-difficulty`**: not stated a second time. "One
  search answers a board for everything that asks" says where the answer
  comes from; what the check does without one is `ts-engine`'s, for a game on
  a solver and on a search alike.

### Found

- **No engine code and no guard makes `findMistakes` empty without an
  answer.** Each game returns early; the rule rests on the hook's contract
  (what contradicts the unique solution) and is now stated. Four games then
  still report a broken rule: `bricks`, `clusters`, `rome` and `subsets`.
  Rome's sentence, "When the board is not deducible from those clues no
  contradiction SHALL be reported", is wider than its code, which reports an
  out-of-bounds, doubled or looping arrow whether or not the board deduces.
- **Six more specs hold the empty-check sentence than the ledgers filed**:
  `bridges`, `dominosa`, `rect`, `separate`, `slant` and `sticks`. Found by
  searching the game specs for "did not prove", "not uniquely solvable" and
  "exactly one"; a spec that words it another way is not in the row.
- **`solveBySearch` decides its failure by the dealt board alone.** A
  position proved lost on a board the search cannot settle fails as
  `PUZZLE_NOT_REASONABLE`. Neither Pegs nor Sokoban reports a lost status, so
  the midend's refusal of Solve on a lost board never comes first.
- **A `flag` written in the full form only decodes from the short form as
  the opposite of its meaning**, not as `defaultParams` has it: `R` in ABCD,
  `S` in Crossing and Magnets, `c` in Signpost, `o` in Tracks. Now a scenario.
- **A stray `v` or `h` after a wire description's last tile is refused as
  too long**, and anywhere earlier as that character. Net's "A desc with any
  other character … SHALL be refused" covers both without saying which.
- **`wireDistance` tests the barrier on the tile it leaves only**, where
  `computeActive` does the same; both rest on `parseWireDesc` and
  `addBorderBarriers` putting a barrier on both tiles.
- **Seven games on `runDeductionFixpoint` have no census**: `clusters`,
  `filling`, `pattern`, `singles`, `spokes`, `undead` and `unruly`. Nothing
  requires one, so the new requirement states the helper and not a duty.
- **Of `isCancelKey`'s six callers, three cancel on Escape alone**: Loopy,
  Net and Slant ask `isCancelKey(button) && !isEraseKey(button)`. Slide,
  Pearl and Rectangles cancel on all three keys.
- **The panel's Clear and the keyboard's Backspace are different codes**
  (`CLEAR_BUTTON` 8, and 127 for Backspace and Delete); `isEraseKey` takes
  both, which is why the requirement says "either erase code".
- **Singles is the one `squareGrid` game that wraps.** The other thirteen
  clamp. An arrow at a clamped edge with the cursor hidden reveals it and
  moves nothing.
- **Light Up hides the cursor on every state change that arrives at a correct
  board; Singles only on a change from an unsolved board to a solved one.**
  Each is the game's `changedState`; the other games were not surveyed for
  the same line.
- **Every member of the note-taking cell sets `cursorFromKeyboard` in its own
  arrow arm**: thirteen hand-written lines, held by no guard. Ascent carries
  the field and is no member.
- **Group's Shift+arrow on a hidden highlight only shows it**, which
  `engine-input`, "One arrow press reveals the cursor and moves it" allows an
  arrow that is an action.

### Review of the third round: the rest

Each requirement was read again against the code named, against two of the
games that use it, and against the sentence of every game in its row.

| Requirement | Verdict | The row's last column, where it changed |
| --- | --- | --- |
| A mistake check compares with the one answer, hidden or not | corrected: without one answer no mark is flagged *against an answer*; a broken rule a game reports besides, with an answer or without, is the game's to state, and the result is empty where its spec states none. Bricks, Rome and Subsets report broken rules on every board, Clusters only without an answer, so "empty but for" was true of one of the four | In every game named only the sentence "nothing where no one answer" goes; which marks are flagged, that an absent mark is no mistake, where the answer is solved from and how a flag is drawn stay. Added, the same sentence: `galaxies`, "Rules: What is incomplete is not flagged" (last sentence); `lightup`, "Rules: Light Up ships findMistakes" ("A board without a unique solution SHALL yield `[]`"); `map`, "Rules: Map reports completion and mistakes" (last sentence); `pearl`, "Rules: A Pearl mistake is a line the solution lacks or a cross on an edge it uses" (last clause); `tents`, "Rules: Tents ships findMistakes" (last sentence); `tracks`, "Rules: A Tracks mistake is a mark on a square or its edges that the solution contradicts" (last sentence). Keep a sentence of their own for what is reported with no answer: `clusters` ("On any other board it SHALL report the cells that break a rule"), `bricks` ("every cell the rule pass flags"), `subsets` (the two rule clauses, before "when the board has a unique solution"), `rome` (its rule-violation requirement; "no contradiction SHALL be reported" goes) |
| Solve by search finishes from the player's position, or else from the board as dealt | sound. `ts-engine`, "A Solve installs no route and reveals no loss" said a game with no finish from the player's position SHALL refuse, which this contradicted: it now excepts a Solve that is `solveBySearch`'s | unchanged |
| The highlight is part of the cell's background | sound | Added: `crossing`, "Look: A wash replaces a square's surface, empty or filled" (the selected square's wash, first clause; the run's direction wash and its paper digit stay) |
| An auto-pencil strike is decided when the placement is made | sound | unchanged; only `towers` states the decision, the other four state regions alone and lose nothing |
| The highlight is the game's keyboard cursor | sound | unchanged |
| The engine provides the run-letter description grammar | sound | `pearl`, "Description: A Pearl run letter counts its unclued squares from a": not whole. Its second sentence, that the run after the last pearl is written, is Pearl's `keepTrailingBlanks` and stays. Added: `map`, "Description: Map's clue list runs over the regions" (the writer's half, as Loopy's: Map reads its clue list by hand, so the sentence stays for the reader) |
| The engine provides the wall-list description grammar | sound | unchanged |
| The wall-list reader refuses a run that passes the last border | sound | `rome` does state a refusal: "A Rome description is the walls, a comma, then the clues", "either part running past its count, SHALL be refused". The wall half of that clause goes; the clue half and the missing comma stay |
| A bare flag letter left out is read as the opposite of its meaning | corrected: the body now says a flag declared for the full form only writes nothing in the short form, and that the absent letter decodes as the opposite whichever form was written; the reason clause went, the neighbor's scenario holding it | unchanged |
| The digit keypad has one key for each value, a letter past nine | sound | unchanged |
| A press the game declines is answered with its release where it was pressed | corrected: "A game whose pointer acts on the release" was true only of one that declines the press; a game that consumes it is followed, and acts where the pointer lifts. `app-shell`, "Every press delivered to a puzzle is followed by exactly one release" states the immediate release and agrees | unchanged |
| Escape and the erase keys are the cancel keys | corrected: "A game whose erase keys also rub something out SHALL test `isEraseKey` apart" left out Net, whose erase keys neither cancel nor erase. Now a game MAY cancel on Escape alone and SHALL where its erase keys rub something out | unchanged. `pearl` and `rect` name the three keys in a sentence that says what is abandoned, which stays |
| The engine provides the geometry of a grid of squares | sound | unchanged. `singles`, "Controls: Singles' keyboard cursor wraps at the grid's edges" is the game's `wrap` and stays |
| A firing census certifies a solver's ladder (`testing`) | sound, read where it now stands; `engine-helpers` no longer holds a copy | unchanged |
| A wire tile is four bits, one for each side its wire leaves by | sound | unchanged |
| The engine provides the wire-grid description grammar | sound | unchanged. Net's scenario "A wrapping board walled all round" (a wrapping board that does not wrap in play) is Net's and stays |
| The wire-grid reader refuses what its writer never writes | corrected: "An `h` before its tile's `v`" is read, and it is the `v` after it that is refused; the sentence now names the `v`, as its scenario did | unchanged |
| Power floods from the source along wires joined from both sides | sound | unchanged |
| A wire distance is counted in tiles along the wires | sound | unchanged |

- **Net and Netslide use `src/engine/wires.ts` alike.** Each reads its
  description with `parseWireDesc` under the params' wrap and fences a board
  that does not wrap with `addBorderBarriers`; each wraps `computeActive` with
  a flag of its own (Net names no moving line, Netslide the last slid row or
  column); each takes its win flash from `wireDistance`. They differ in what
  is theirs: Net's source is the player's to move and Netslide's is the
  board's, and Netslide keeps corner flags above the four barrier bits.
- **A short form reads back differently from the full form in five games**,
  wherever a full-form-only flag holds its letter's meaning: `R` in ABCD, `S`
  in Crossing and in Magnets, `c` in Signpost, `o` in Tracks (free 1 clues
  read back as disallowed). In four of them the opposite is what
  `defaultParams` holds. In Signpost it is not: `defaultParams` and every
  corner preset have the ends in corners, and their short form, `4x4`, decodes
  with free ends. The midend writes the short form in one place, to ask
  whether a pasted params string leaves its tier unstated, and reads none it
  wrote.
- **The four requests left unwritten are the games' own.** The entry arm: no
  shared code and no guard. The top cap: none. Hiding the cursor on
  completion: each game's `changedState`, and nothing in the midend. Easy as
  what the solver and the hint both finish: `deductionFinishes` is a hook each
  game writes; what the engine holds is its consequence, already stated
  (`engine-difficulty`, "The midend throws when deduction runs out below
  Unreasonable").

## Third round: hints and colors

What the 57 ledgers' § "Engine requests" ask of `engine-hints`,
`engine-candidate-hints` and `engine-colors`. Each was read against the code
named. In the last column a clause in brackets is the part of the game's
requirement the engine now states; where there is none, the whole of it.

| Capability | Requirement title | Added or extended | Read against | Game specs that state it of themselves today |
| --- | --- | --- | --- | --- |
| `engine-hints` | A step asking for several elements is followed one element at a time | added | `src/engine/hint-track.ts`: `trackTargets`, `changedCells`; its callers' `hintKeepTrack` in `filling`, `lightup`, `mosaic`, `pattern`, `pearl`, `singles`, `tents`, `tracks` | `singles`, "Hint: Singles hint tracking follows a step cell by cell"; `lightup`, "Hint: A partly followed hint step shrinks in place"; `tents`, "Hint: Tents' hintKeepTrack judges a move by what it changes"; `filling`, "Hint: hintKeepTrack follows a Filling step square by square"; `pattern`, "Hint: Pattern's hintKeepTrack follows partial progress"; `pearl`, "Hint: Pearl's hint follows a step made one edge at a time" [the `hintKeepTrack` sentence]; `tracks`, "Hint: One Tracks firing is one hint step" [the `hintKeepTrack` sentence]. `mosaic` calls it and states none. Not `unruly` (see Not written) |
| `engine-hints` | A hint gives every step deduction still forces before it refuses | added | each game's `hint` where it turns an empty plan into `DEDUCTION_EXHAUSTED` (`lightup/index.ts`, `bridges/hint.ts`, `tracks/hint.ts`, `pearl/hint.ts`, `magnets/hint.ts`, `tents/hint.ts`, `clusters/index.ts`, `subsets/index.ts`, `loopy/hint.ts`); `src/engine/candidate-hint.ts`: `candidateHint`; `src/engine/midend.ts`, where the refusal is let through on a tier that permits search | `lightup`, "Hint: On an Unreasonable board the hint stops at the guess point"; and the twelve of the next row, the clauses "its plan SHALL hold the steps … force … and no others, and where none is forced it SHALL refuse" and "It SHALL go on from …" |
| `engine-hints` | The hint of a game on the search's tiers never searches | added | `src/engine/answer-search.ts`: `searchTiers`, `answerCache`; every read of `answerOf` and `searchAnswers` in the twelve games (each is in `solve`, `findMistakes`, the contract or the generator, none in a `hint`) | [the sentence "The hint SHALL never run the search."] `abcd`, "Hint: ABCD's hint stops where the ladder does"; `crossing`, "Hint: Crossing's hint stops where the solver does"; `filling`, "Hint: Filling's hint stops where the solver does"; `mosaic`, "Hint: Mosaic's hint stops where the rule does"; `net`, "Hint: Net's hint stops where its deductions do"; `palisade`, "Hint: Palisade's hint stops where the solver does"; `pattern`, "Hint: A Pattern hint never reveals the solution or searches"; `range`, "Hint: Range's hint stops where its rules do"; `rect`, "Hint: Rectangles' hint stops where its steps do"; `separate`, "Hint: Separate's hint stops where the solver does"; `signpost`, "Hint: Signpost's hint stops where the solver does"; `sticks`, "Hint: Sticks' hint stops where the solver does". What each game's deductions are stays in its sentence |
| `engine-hints` | A search that can prove a position lost says which of its two ends it met | added | `src/engine/search-outcome.ts`: `searchRefusal`; `src/engine/solve-failure.ts`, `src/engine/hint-refusal.ts` (`isDeadEnd`); `pegs/hint.ts` and `sokoban/hint.ts`, `hint` and `hasNoSolution`; `src/engine/midend.ts`, where `hasNoSolution` is asked first | `pegs`, "Hint: Pegs' hint refuses a position it cannot finish from" [the sentence "Otherwise it SHALL refuse with `NO_SOLUTION_FROM_HERE` … `SEARCH_OUT_OF_REACH` …"]; `sokoban`, "Hint: Sokoban's hint refuses a position it cannot finish" [from "and SHALL refuse with `NO_SOLUTION_FROM_HERE`"]. The marked dead end (cut-off pegs, a jammed barrel) stays each game's |
| `engine-hints` | A recomputed plan continues the plan it replaces | added | `src/engine/hint-plan.ts`: `deduceHintPlan`; `spokes/solver.ts`, `clusters/solver.ts` and `bricks/solver.ts`, which call it | `spokes`, "Hint: A Spokes hint plan is stable across recomputation"; `clusters`, "Hint: A recomputed Clusters plan continues where the last one left off"; `bricks`, "Hint: A Bricks hint plan is recompute-stable" |
| `engine-hints` | The slide planner's first-move veto binds the heuristic search alone | added | `src/engine/slide-planner.ts`: `planSlides` (the one place `rejectFirstMove` is read, in the forward search), and the exact search and the depth-bounded last resort beside it, which do not read it; `sixteen/index.ts` and `netslide/hint.ts`, which pass it | `sixteen`, "Hint: The hint gives the move home even when it undoes the player's slide". `netslide` passes the veto and states none of this |
| `engine-hints` | A step's sentence opens with what the player can spot | added | `src/engine/hint-words.ts`: `sentence`, `so`, and the joining of each relation's parts | [the clause that a step leads with the indication] `slant`, "Hint: Each Slant technique is narrated by its own reason" (first sentence); `lightup`, "Hint: A Light Up hint step leads with what to look for, and one firing is one step" (first sentence, to "and then state why the move is forced"); `pattern`, "Hint: Pattern's narration leads with the indication and concludes by necessity" ("SHALL lead with the indication"; what the indication is, the clue and the spotted pattern, stays); `keen`, "Hint: A cage deduction's sentence names the cage by its clue" ("SHALL lead with the spotted indication … then give the reasoning"; the cage's name stays); `solo`, "Hint: Solo's narration leads with what was spotted" (the order; what each kind of step leads with stays); `unequal`, "Hint: Unequal's clue sentences read correctly at the ends of the range" ("SHALL lead with the inequality or adjacency pattern": the pattern stays) |
| `engine-hints` | A hatch lies over the square's ground and under what it holds | added | `src/engine/hatch.ts`; `src/engine/overlay-sidecar.ts`: `OverlaySidecar.drawHatch`; `src/engine/game.ts`: `GameDrawing.drawHatch`; `redraw` in `singles/render.ts`, `unruly/render.ts` and `pattern/render.ts` | `unruly`, "Hint: The named line is hatched under its pieces" ["under the pieces it holds"]; `singles`, "Hint: Singles hint roles are bands and stripes, never fills" ["stripes under the cell's content"]; `pegs`, "Look: Pegs' marks sit beside the peg and never recolor it" ["its stripes on the cell's face under the peg"]; `pattern`, "Look: Pattern draws a full cell as a piece and an empty one as the clear square" (last sentence) |
| `engine-hints` | A hint marks beside the content, never behind it | extended: "the hatch apart", since the hatch is drawn under content and the sentence forbade every mark there; no scenario changed | the same | none |
| `engine-hints` | A contradiction no entry can be blamed for is refused as one to undo | added (the rule stood in "The refusals distinguish the situations a player must tell apart" as a scenario only) | `src/engine/hint-refusal.ts`: `CONTRADICTION_UNLOCALIZED`, `isDeadEnd`; the refusing line of `bridges/hint.ts`, `clusters/index.ts`, `subsets/index.ts`, `loopy/hint.ts`, and of the games that answer a contradiction otherwise (see Found) | `bridges`, "Hint: A Bridges hint refuses where its deduction contradicts itself"; `subsets`, "Hint: A Subsets hint refuses a letter the answer does not have" [the clause "or the hint's own deduction from the player's marks ends in a contradiction"; the wrong letter stays Subsets']. `clusters` and `loopy` give the refusal and state none |
| `engine-candidate-hints` | A recording solve stops below the tier that searches | added | `src/engine/candidate-hint.ts`: `candidateHint`; `buildSteps` in `keen`, `towers`, `unequal`, `mathrax`, `group` and `solo` (`index.ts`), each `Math.min` of the board's tier and the highest beneath `Unreasonable`; `rome/hint.ts` | [the cap on an `Unreasonable` board only; "at the board's own tier" stays each game's] `keen`, "Hint: Keen's hint deduces at the tier of the board's params" ("capped at Hard", and the scenario of the Unreasonable tier); `mathrax`, "Hint: Mathrax's hint deduces at the tier of the board's params" ("and at Tricky where they name `Unreasonable`"); `unequal`, "Hint: Unequal's hint reasons no harder than the board's tier" ("and at Hard on an Unreasonable board"); `solo`, "Hint: Solo's hint uses no technique above the board's tier" ("and at Extreme on an Unreasonable board"); `towers`, "Hint: Towers' clue eliminations are tried a facing pair first and arrangements last" ("and never a search"). `group` caps the same and states none |
| `engine-colors` | The two premise references each cite one state of a cell | added | `src/engine/color/palette.ts`: `HINT_BLACKREF`, `HINT_WHITEREF`; the palette and the drawing of the reference in `pattern`, `range`, `singles`, `lightup` and `slant` (`render.ts`) | [which color cites which state; each game's own slot name and mark shape stay] `pattern`, "Hint: A cell a Pattern hint cites is outlined by what it holds"; `range`, "Hint: A shaded premise of a Range hint takes a color of its own"; `singles`, "Hint: A decided premise in a Singles hint takes the color of its state"; `lightup`, "Hint: Light Up draws a hint's evidence by what it is" (the `COL_HINT_LITERF` and `COL_HINT_DARKREF` sentences). `slant` takes `HINT_BLACKREF` and states none |
| `engine-colors` | A lit beveled tile is lit on its face and keeps its bevel | added ("A solved flash drawn as a color takes a shared color" had it by a scenario, and no room for the sentence) | `src/engine/draw.ts`: `drawRaisedTile`; `redraw` in `fifteen/render.ts`, `sixteen/render.ts` and `twiddle/render.ts`, each passing a flash color as the tile's face | `fifteen`, "Look: Fifteen's win flash lights its tiles and never the gap" [first sentence; "The gap SHALL never be lit" stays]; `twiddle`, "Look: The Twiddle completion flash lights each tile's face". `sixteen` does the same and states none |
| `engine-colors` | A clear square whose middle is taken carries no cross | added ("A board colored half and half gives its clear squares a surface" had it by a scenario) | `src/engine/piece.ts`: `drawClearSquare`, `drawRuledOutCross`; its three callers, `mosaic/render.ts`, `pattern/render.ts`, `bricks/render.ts` | `mosaic`, "Look: A blank Mosaic cell's number has the clear square to itself" |

No title was renamed. One existing requirement was reworded ("A hint marks
beside the content, never behind it").

### Not written

- **The firing census (abcd, solo) is `engine-helpers`'.**
  `describeLadderCensus` certifies a `runDeductionFixpoint` ladder and reads
  no hint, so it belongs beside the fixpoint and was left to the writer of
  that capability.
- **A searched plan's slides for one tile as one journey (netslide, sixteen)
  is the games' own.** The planner returns moves and makes no step, and
  `engine-hints`, "The slide planner is parameterized on what differs between
  games", says it holds no narration. The two games group by different rules:
  Sixteen flags a second leg only, and only where the first step previewed it
  (a slide perpendicular to the first that lands the tile on the previewed
  cell); Netslide flags every later slide for as long as the tile it follows
  stays the same. No one sentence is true of both.
- **Unruly's `hintKeepTrack` is its own code**, three lines that compare the
  move with the step's one target, and does not call `trackTargets`. It
  judges by the move and not by what changed. "Hint: hintKeepTrack completes
  on the hinted cell and value" stays Unruly's.
- **That a recording solve runs at the board's own tier** is not the
  collection's rule: see Found. Only the cap beneath `Unreasonable` was
  written.
- **What a game without a filled state takes the references for**, and each
  game's slot names (`COL_HINT_SHADEDREF`, `COL_HINT_LITERF`), stay the
  games'.

### Found

- **The unlocalized contradiction and Tracks' `PUZZLE_NOT_REASONABLE` are two
  situations, not one answered two ways.** Bridges, Clusters, Subsets and
  Loopy refuse with `CONTRADICTION_UNLOCALIZED` where their mistake check has
  no answer to compare with (a board the solver does not finish), and each
  says so at the line. Tracks, Magnets, Pearl, Tents and the grid skeleton
  refuse with `PUZZLE_NOT_REASONABLE`, each with the comment that its
  `findMistakes` vouches for every entry, so a contradiction there is the
  deduction's or the board's and no undo clears it. The new requirement
  states the first and is conditioned on the check having no answer, so it
  does not bind the second, which no requirement states.
- **`bridges.md` names a `"broken"` status of `deduceHintPlan`.** There is
  none: its status is the game's own type, and Bridges reads its recording
  pass's `impossible()`.
- **Loopy gives the steps it deduced before the contradiction** and refuses
  with `CONTRADICTION_UNLOCALIZED` only where it has none; Bridges, Clusters
  and Subsets refuse outright. The requirement says what the refusal is, and
  not that one is owed.
- **Subsets gives the same refusal for a mark the answer does not have**, a
  wider use than the requirement's, which its spec states of itself.
- **"A hint marks beside the content, never behind it" forbade the hatch.**
  Its first sentence said no mark is drawn underneath anything the player
  reads; the hatch is drawn there on purpose, in every game that hatches. The
  sentence now excepts it.
- **Pattern draws its hatch over the clear square's cross.** It draws the
  clear square, cross and all, and then the bands. The cross is a mark of the
  square's state and faint; the requirement counts it with the background.
- **Every one of the twelve games on the search's tiers states the
  never-search rule**, not the four the brief named, and in none does `hint`
  read `answerOf`. No engine code enforces it and no cross-game guard holds
  it: each game has a test of its own on one pinned board.
- **The cap at the board's own tier is seven games' agreement and two games'
  opposite.** Keen, Towers, Unequal, Mathrax, Group and Solo cap the
  recording solve at the board's tier, and Bridges and Tracks cap their
  ladders there ("Hint: A Bridges hint's ladder is capped at the board's own
  difficulty", "Hint: The Tracks hint starts from the player's marks and is
  capped at the board's own tier"). Rome records at every tier whatever the
  board states, and Subsets' spec says its hint runs at the top tier. No
  guard holds a hint to reasoning no harder than its board.
- **Keen's "capped at Hard" and its `DIFF_EXTREME` agree.** The constant is
  the solver's level; the tier it grades as is named Hard.
- **Recompute stability has no cross-game guard.** The hint-resume walk holds
  that hints recomputed after every move reach a solved board, which a plan
  that changed its line each time would still pass. That a game's `next`
  scans in a fixed order is held game by game, by Clusters', Spokes' and
  Bricks' own tests, and by nothing for the other callers of
  `deduceHintPlan`.
- **Pattern's `trackTargets` counts a target as held only when this move made
  it**, where the others ask the board after the move. The verdicts agree,
  since a step shrinks as its targets are made.
- **Tents shrinks a step only where its move is of cells**; a step of links
  that is partly made stays as it was, with the verdict `"onTrack"`.
- **`HINT_WHITEREF` being off the shaded piece's hue is held by a comment.**
  The palette guard holds the five hint roles apart from each other and does
  not compare the reference with `SHADED`.
- **Netslide vetoes the same slide Sixteen does, the one that undoes the
  player's last.** Its test reads `m.delta === s.lastMoveDir`, which is the
  opposite slide: the planner's `delta` is how far a tile travels and
  Netslide's `dir` is its negation. Only Sixteen's spec says the veto does not
  bind the exact search.

### Review of the third round: hints and colors

Each requirement was read against the code named, and the three rules with no
guard behind them were measured over every registered game with a `hint`, on
the board of its first preset and of its last (two scratch walks outside the
tree, through `HINT_GAMES`, `dealt` and a real `Midend`). No title was
renamed. No requirement was removed.

| Requirement | Verdict |
| --- | --- |
| A step asking for several elements is followed one element at a time | corrected: `trackTargets` judges the changes the game hands it, which is where "never its ops" is kept. True of the eight callers and of the grid skeleton. Tents does not rewrite a step whose move is a link (the link is still the one move that makes what is left) |
| A hint gives every step deduction still forces before it refuses | corrected: bound to a board with one answer and a deduction that meets no contradiction, and to the plan's cap. Read in every game with a tier that permits search: each refuses with `DEDUCTION_EXHAUSTED` on an empty plan and nowhere else. Bricks, Dominosa and Spokes refuse a board with no one answer before they plan, with `PUZZLE_NOT_REASONABLE`. The first scenario said the first hint is all of the steps, which a cap cuts |
| The hint of a game on the search's tiers never searches | sound. Every read of `answerOf` in the twelve is in `solve`, `findMistakes` or the contract; Pattern's goes through `solveState`, which only `findMistakes` calls |
| A search that can prove a position lost says which of its two ends it met | corrected: the game's clause binds a search "that can meet either end". Inertia and Flood can be lost and say `NO_SOLUTION_FROM_HERE` themselves, of a solver with one way to fail |
| A recomputed plan continues the plan it replaces | corrected: `next` is held to a firing that depends on the working board alone; Bridges and the grid skeleton, for two, hand a `next` that takes no board and reads a pass made over it. TRUE of every caller: see Found |
| The slide planner's first-move veto binds the heuristic search alone | sound |
| A step's sentence opens with what the player can spot | corrected: "and never the move or its conclusion" is out (`docs/hints.md` § "Lead with the indication" allows a step whose signal is the move, and `evident` is a look alone); *one of several* and *answers* need a look as *forced* does; the leg that takes none is the *again* relation, since a sequence's later leg takes one. A scenario titled for the *serves* relation was of a forced step and is retitled |
| A hatch lies over the square's ground and under what it holds | corrected: the ground is the background, a tile's face and a faint mark of the surface. One scenario added for a tile. See Found |
| A hint marks beside the content, never behind it | sound as extended; reflowed. It agrees with the hatch requirement and with "A hint hatches the region its sentence is about" |
| A contradiction no entry can be blamed for is refused as one to undo | corrected: it binds "a hint that refuses", and says the steps deduced first are the game's to give or not. One scenario added for that |
| A recording solve stops below the tier that searches | sound. Rome, Salad and Seismic are on `candidateHint` and have no such tier; ABCD and Crossing have the tier and no rung at it to record |
| The two premise references each cite one state of a cell | corrected: the second scenario said a cell "the player has not decided" takes neither reference, and Light Up's unlit square is one and takes `HINT_WHITEREF`. It now speaks of a cell cited for where it lies |
| A lit beveled tile is lit on its face and keeps its bevel | sound. Slide's blocks do the same |
| A clear square whose middle is taken carries no cross | sound |

**The last column, corrected.**

- *followed one element at a time*: `tents` keeps its scenario (a tent placed
  by a click leaves a step that asks for the link) and that a link step is
  not rewritten.
- *every step before it refuses*: add `galaxies`, "Hint: The Galaxies hint
  stops where its deductions do" [the sentence "Where none of its deductions
  applies it SHALL refuse …"; that no step tries a dot, and that an Easy
  board is carried to solved, stay]; `undead`, "Hint: An Unreasonable board's
  hint stops where deduction stops" [the first sentence to "saying so"; what
  its tests assert stays]; `bricks`, "Hint: The recursive lookahead rung is
  never narrated" [the last sentence]; `spokes`, "Hint: Spokes' hint stops at
  bounded reasoning" [the last sentence]. In the twelve, the scenario's last
  clause (the hint finishes the board once the right value is entered
  wherever it stops) is more than the engine's scenario and stays.
- *a recomputed plan*: `spokes` keeps its scenario, which is of one leg of a
  journey followed and not of a whole firing.
- *a contradiction*: `clusters` does state it, in "Hint: A Clusters hint is
  refused where it cannot deduce"; "SHALL NOT deduce onward" and where the
  refusal is reached stay Clusters'. `bridges` keeps "shows no step it
  derived on the way", which is now the game's by the requirement's own
  words.
- *a lit beveled tile*: `twiddle` keeps its scenario (the tile the flash has
  left is the one repainted).

#### Found

- **A recomputed plan continues the old one in every caller of
  `deduceHintPlan`, and in few other games.** Each plan's first firing (a
  step and its `continuesPrevious` legs) was played and the hint asked again,
  up to forty times a board. The eighteen registered callers gave 918
  recomputed plans and every one began with the old plan's second firing.
  The same walk over the games that build a plan another way found a
  different first firing in Singles (30 of 53), Range (17 of 80), Slant (15
  of 52), Palisade (13 of 66), Rome, ABCD, Unruly, Solo, Mosaic, Seismic,
  Group, Salad, Keen, Light Up, Mathrax, Towers, Map and Unequal, so the
  instrument can fail and the rule is `deduceHintPlan`'s and not the
  collection's. No guard holds it.
- **Every hatch drawn is over its ground and under its content, with two
  things under it that are not a background rect.** 6,531 hatches in 30
  games' frames, none with a number, a piece or a symbol drawn before it. Group
  draws its leading diagonal before the hatch and Pattern the clear square's
  cross, both faint marks of the surface. Magnets draws the hatch over a
  domino half's body, which is the pole's color where the half is set, and
  under its symbol: the requirement counts a tile's face as ground, which is
  what "A lit beveled tile …" says of a face, and a reader who counts the
  pole's color as what the square holds would call Magnets a departure.
  Galaxies, Rectangles, Mathrax and Unequal drew no hatch on the boards
  walked and were read instead.
- **Boats' mark for the acted-on square is forbidden by "A hint marks beside
  the content, never behind it", as it was before this round.** Boats draws a
  filled segment or waves in `COL_HINT` in the square and no ring
  (`boats/render.ts`), as `docs/hints-marks.md` § "Echo the move's shape in
  the hint color" tells it to and its own "Hint: A Boats hint marks a boat
  and water each in its own shape" requires. The requirement says the
  acted-on cell is ringed and not filled "in every game and with no
  exceptions", and its scenario that "no primitive fills the cell with a hint
  color". The hatch's exception does not reach it, and neither hatch
  requirement speaks of it: the echo is no hatch and lies under nothing. No
  engine requirement states the guide's rule. Recommended: the engine
  requirement takes the echo as its second exception, in a change of its own.
- **The unlocalized contradiction is not reached on a board the app loads.**
  Bridges, Clusters and Loopy each say it is reached only on a board the
  solver does not finish, and `loadDesc` loads only a board the game's solver
  solves. The requirement's first scenario is of a state built without it,
  as the games' tests build one.
- **Clusters refuses a stalled plan with `DEDUCTION_EXHAUSTED` though it holds
  steps** (`plan.verdict !== COMPLETE`). Clusters has no tier that permits
  search, so the requirement does not bind it and the midend would throw.
- **`slant/render.ts` calls its reference "a doubled teal ring"**; the slot is
  `HINT_BLACKREF`, which is green.

## Found, mended (task 3.4a)

- `engine-params`, "A grid too large for a game is refused in one sentence"
  gains the sentence and scenario that keep Undead's "must be at most 54.":
  a ceiling a player meets at a size they might well ask for names its
  number. Mosaic's 10000 took `AREA_TOO_LARGE`, as Clusters' has.
- `src/store/settings.ts` no longer seeds `pencil-keep-highlight`.
- The Slant comment is corrected.
- Boats' mark: raised to the owner in `design.md` § "Found, and the owner's
  to decide". The "no exceptions" is the owner's ruling
  (`src/engine/hint-mark.test.ts`), so the requirement was not given an
  exception here.
- The three pencil preference keys, Loopy's "the edge under" and Loopy's clue
  colors stand in `design.md` as they were raised.
- Clusters' `DEDUCTION_EXHAUSTED` on a stalled plan: left, since a board
  Clusters' solver does not finish does not load.
