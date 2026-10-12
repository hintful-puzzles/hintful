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
