# separate

The Purpose was corrected: it named "its params and description", "its
three-valued walls and half-grid cursor" and "this spec says what is shared",
none of which the spec holds now. It says instead what the params requirements
hold, names the solver and the search, and says what is `border-grid`'s to
state.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Separate uses a three-valued wall model with a half-grid cursor | removed, with its scenario "Clicking an interior edge toggles a wall on both sides". "Controls: Separate takes its buttons, drag and cursor from the border grid" names where each part is stated | `border-grid`, "A cell holds its four edges in one byte, and an edge is on both its cells" (three states, on both cells; its scenario "A wall drawn on an undecided edge" is the click and the click again), "Each button cycles an edge between its own state and undecided" ("The edits SHALL change both cells the edge separates") and "The keyboard cursor moves by half a cell" (the coordinates, the range, the arrows and the select keys); `targetVerbs = borderGridVerbs(…)`, `src/games/separate/index.ts:87` |
| Rules: Separate ships findMistakes for Check & Save | retitled "Rules: Separate's mistake check flags an edge decided against the one partition". "The game SHALL implement `findMistakes`" and "at either difficulty" reworded out, the search named by its engine requirement; "A flagged edge SHALL be drawn in the error color." cut, with the scenario's line "AND the next `redraw` draws that edge in the error color". Which edge is flagged, and the empty list, kept | the `Game` type (`findMistakes`); `engine-difficulty`, "One search answers a board for everything that asks" (`findMistakes` reads the one search, which answers at any tier); `border-grid`, "The board reddens a wall beside an undersized region and a wall that divides nothing" ("An edge the game's Check & Save flags SHALL be drawn in the same error color"), `mistakeEdgeBits`, `src/games/separate/render.ts:183` |
| Params: Separate's parameters are a size and a letter count | retitled "Params: A Separate params string may leave out its letter count and its difficulty". The field list and the encoding (`{w}x{h}n{k}`, `de`/`du` in the full form only) cut; a sentence sends the reader to `paramConfig`, the declared codec and `presets` (rule 2). The bare-`{w}` sentence replaced by the sentence of "Params: A Separate size with no letter count takes its width", which says the same of a string with a height too; "no difficulty letter as Easy" kept. Scenarios "Params round-trip" and "The difficulty is in the full encoding only" replaced by "A string that leaves a field out", made of their two missing-field lines | `paramConfig`, `src/games/separate/state.ts:116`, and the `paramsCodec` field list, `src/games/separate/state.ts:136` (`dims`, `num "n"`, `searchTierSegment`); `engine-difficulty`, "A game that searches has a tier for each deduction and Unreasonable above them" (`d` and the tier's first letter, in the full form only); `src/engine/__snapshots__/params-stability.test.ts.snap` holds `6x6n4de` / `6x6n4` and `6x6n4du` / `6x6n4` |
| Params: Separate's menu offers each board at both difficulties | removed; the `Params` pointer sentence names `presets` | `BOARDS`, `defaultParams` and `presets`, `src/games/separate/state.ts:100`, `:107`, `:111`; `engine-params`, "The preset menu is a grid" (each board at every tier, easiest first); the params-stability snapshot lists the default and the menu's lines |
| Params: Separate refuses to deal a size its generator gives up on | gains scenario "A pasted board of a refused size", which moves, unchanged, from "Params: A Separate board of a size that is not dealt still opens": it is the case of this requirement's "Under full validation" | |
| Params: A Separate board of a size that is not dealt still opens | removed. Its scenario "A pasted board of a refused size" moves, unchanged, to "Params: Separate refuses to deal a size its generator gives up on" | `engine-params`, "Param validation distinguishes generating a board from loading one" (`full: false` when a description is in hand, so a generation-only bound retires no game ID) and "A generation-only bound is gated on full"; each of this spec's dealing refusals says "Under full validation" or "when a board is to be dealt" of itself |
| Params: A Separate size with no letter count takes its width | removed as a requirement: its sentence and its scenario "A preset without its letter count" join "Params: A Separate params string may leave out its letter count and its difficulty", unchanged but for "letters `k`" | |
| Generation: A pasted Separate board opens at the difficulty it needs | retitled "Generation: A Separate board is Easy where the solver and the hint both finish it". Kept: what makes a board Easy and what Unreasonable. The loading rule ("whatever lower difficulty its ID states", the two refusals and their words) became a pointer. Scenario "A board with several answers or none is refused" dropped; "A board that needs search opens as Unreasonable" kept | `engine-difficulty`, "A loaded board whose id states no tier takes the lowest tier that solves it" and "A pinned tier is kept or raised and never lowered"; `engine-params`, "A board with a mistake check loads only with exactly one answer" (`DESC_NOT_UNIQUE`, `DESC_CONTRADICTORY`). The dropped scenario's two boards are in this spec, "Solver: Separate's search tries the region with the fewest squares to grow into", scenario "The search tells one answer from several and from none"; `src/games/separate/separate-tier.test.ts:315` ("with several answers, or none, is refused") holds the refusals |
| Solver: Separate counts a board's answers by a bounded search | retitled "Solver: Separate's search tries the region with the fewest squares to grow into". Kept: what the search assumes where the solver stops. "count … up to two by trial and error over the solver", "It SHALL report one answer, several, none, or that it stopped at its budget, which SHALL be counted in positions and never in time" and "Solve SHALL take the answer from it at either difficulty" became pointers. Scenarios "A spent budget is neither answer" and "An Easy board takes one position" dropped; the other two kept | `engine-difficulty`, "The engine counts a searching game's answers up to two, within a budget of positions" (the four verdicts, positions and never time; scenarios "The budget runs out with one answer in hand" and "A board the deduction finishes") and "Solve from the search shows the one answer or says which it lacks" (at any tier); `searchBoard` called at `src/games/separate/solver.ts:524`, `solveFromAnswer` at `src/games/separate/index.ts:264`; the dropped cases are `src/games/separate/separate-tier.test.ts:139` and `:146` |
| Controls: Each button toggles the nearest edge toward its own state | replaced by the pointer requirement "Controls: Separate takes its buttons, drag and cursor from the border grid" (rule 2): all three sentences went; scenario "A right click turns a wall into a no-wall mark" kept as the one real case | `targetVerbs = borderGridVerbs(…)`, `src/games/separate/index.ts:87`, and `interpretMove`, `:94`, which is `interpretTargetVerbs` alone; `border-grid`, "Each button cycles an edge between its own state and undecided" (straight to the pressed button's state), "A press addresses the nearest interior edge", "The keyboard cursor moves by half a cell", "A drag along a line of edges repeats the press" |
| Hint: Separate runs its solver as a declared ladder that its hint shares | second sentence cut ("The working state SHALL carry the same facts as border-grid bytes, so the generator and the hint run the same techniques on the same state."); title, first sentence and scenario kept | `engine-hints`, "The solver and the hint are two projections of one deduction engine" (the generator runs the techniques with the recorder off, the hint the same techniques with it on); that the working board is border-grid bytes is how `SolverScratch` is built, `src/games/separate/solver.ts:104` |
| Hint: Separate offers a deduction-based hint | retitled "Hint: The plan starts from the player's no-wall marks and walls". Kept, and written out of its parenthesis: how the player's marks seed the ladder. "SHALL provide `hint()`" and "returning one multi-leg journey per firing of its ladder, each leg setting one edge" cut; scenario kept | the `Game` type (`hint`); `engine-hints`, "One deduction firing is one journey"; `border-grid`, "Border-grid games share the hint's notation layer" (the journey a firing becomes), `borderHintJourney` called at `src/games/separate/index.ts:210`. The seeding is `separateRecordingPass`, `src/games/separate/solver.ts:596` |
| Status bar: Separate's status bar says how many letters a region holds | the clause "which the engine's completion words precede on a finished board" cut; scenario kept | `ts-engine`, "The status bar's completion words come from the engine" ("The midend SHALL prefix them to whatever the game's `statusbarText` returns") |
| Look: Separate shades completed correct regions | "`REGION_DONE`, a wash of the theme pair's first hue," cut from the first sentence | the palette, `out[COL_CORRECT] = REGION_DONE`, `src/games/separate/render.ts:89` |
| Look: Separate's clue layer stays its own | retitled "Rules: A letter repeated in a completed region is drawn as an error" and moved among the `Rules` requirements, before the mistake check (which letters are flagged is `Rules`). Kept: the repeated-letter error, which only this requirement and its scenario state, written as a rule. The list of what stays Separate's (its region constraints, solver, generator, clue rendering, the finished-region test) cut. One sentence added (rule 2) that says where the reddening of edges is stated, which this spec never said; scenario kept | `border-grid`, "Border-grid games share the hint's notation layer" (each game keeps its deduction, its sentences and its move) and "The shared renderer does not know which game is drawing" (the letter is the game's callback); the finished-region test is this spec's "Look: Separate shades completed correct regions". The kept rule is `src/games/separate/render.ts:195` |
| Hint: Separate's marks and its keep-track verdict are the border grid's | added (rule 2), as Palisade has it: the `Hint` subject said nothing of the marks or of when a hinted edit completes its step. Its scenario is the case of `src/games/separate/separate-hint.test.ts:215` | |
| Look: Separate draws its cells on the collection's quiet surface | retitled "Look: No Separate cell is lifted as a given". First sentence (every cell on the collection's cell surface) and third (the edges' three colors) cut; "with its letter in ink" joined the kept sentence | `PALETTE`, `src/games/separate/render.ts:97` (`background: COL_CELL`, `grid`, `lineNo`, `lineMaybe`) and `colors`, `:78`, which the shared renderer paints from (`border-grid`, "The shared renderer does not know which game is drawing") |

## Kept, and why

- **Params, "a string with no difficulty letter SHALL decode as Easy".**
  `engine-difficulty`, "A game that searches has a tier for each deduction
  and Unreasonable above them", now states it for every game on
  `searchTierSegment`. Kept as what a missing field decodes to (the brief's
  rule 3), as Palisade keeps it; a reviewer who reads the engine sentence as
  enough can cut the clause and nothing else moves.
- **Params, "no `n` decodes with as many letters as the grid is wide".** It
  is the `whenAbsent` of the codec's `n` field
  (`src/games/separate/state.ts:139`); kept as what a missing field decodes
  to.
- **Rules: A new Separate board holds its letters and only the rim walls.**
  `border-grid` says `initBorders` starts a board with the rim's walls alone;
  that `newState` calls it and parses the letters is the game's.
- **Rules: The grid rim cannot be edited.** The refusal is in Separate's own
  `executeMove` (`src/games/separate/state.ts:310`) and not in the shared
  module.
- **Rules, "it SHALL return an empty list" where the search proved no single
  partition.** No shared requirement says what a mistake check returns then.
- **Generation: Every generated Separate board is solved by its own solver**
  and **An Unreasonable Separate board has one answer that the solver does
  not reach.** Each reads like the collection's rule by its title; the first
  is what Easy means here and how a board is drawn (no ring of squares), the
  second how a candidate is drawn (letters swapped inside a dealt region).
- **Generation, "Easy where the solver and the hint finish it".**
  `engine-difficulty` says the contract asks "the game's deduction"; that
  Separate's is the solver and the hint both is `deductionFinishes`,
  `src/games/separate/index.ts:273`.
- **Hint: Separate runs its solver as a declared ladder that its hint
  shares**, the order. `hintRungs` lists the same three, and nothing reads it
  for order: the order is the array `separateLadder` hands
  `runDeductionFixpoint`, `src/games/separate/solver.ts:377`.
- **Hint: Separate's hint stops where the solver does.** As in Palisade: the
  collection refuses a Search, and that this hint goes on to finish an
  Unreasonable board from a right edge is promised by no shared requirement.
- **Controls, the scenario "A right click turns a wall into a no-wall
  mark".** `border-grid`, "Each button cycles an edge between its own state
  and undecided", has the same scenario set in Separate; kept as the pointer
  requirement's one real case.
- **Status bar, the scenario's "behind the engine's "Auto-solved."".** It is
  the case of "the same at every point of play" after Solve.

## Engine requests

None.

## Found

- The spec never said when a hinted edit completes its step
  (`hintKeepTrack`, `src/games/separate/index.ts:220`), nor what a step's
  marks are. The review added the pointer requirement Palisade has.
- "A letter repeated in a completed region is drawn as an error" states
  which letters are flagged, which `docs/new-game.md` files under `Rules`. The
  writer left it under `Look`; the review moved it.
- Scenario "The hint finishes from the player's own positions" (in "Hint: The
  plan starts from the player's no-wall marks and walls") says "the board is
  solved and no hint refuses" without saying the board is Easy; the test walks
  boards dealt at the presets' Easy tier
  (`src/games/separate/separate-hint.test.ts:104`). On an Unreasonable board
  the hint refuses.
- The spec never said which edges redden while playing, though the help page
  does ("Lines that close off a region of the wrong size are shown in red").
  One sentence now sends the reader to `border-grid` for it.
- Scenario "The hint and the generator run one ladder" (in "Hint: Separate
  runs its solver as a declared ladder that its hint shares") says only what
  `engine-hints`, "The solver and the hint are two projections of one
  deduction engine", says of every game. It is the requirement's one
  scenario, and no test of the game records a board's first firings to write
  a case of the order from, so it stands.

## Review

16 rows read, each against the declaration or the requirement it names, read
whole; 2 corrected (one retitled to its subject, one line citation), 1 row
added, no sentence restored.

Changed:

- **"Look: A letter repeated in a completed region is drawn as an error"**
  is now "Rules: A letter repeated …", among the `Rules` requirements, as
  Palisade files its reddened clue. Its body, which holds the pointer to the
  shared error model, is unchanged.
- **"Hint: Separate's marks and its keep-track verdict are the border
  grid's"** added (rule 2). `hintMarks` declares ring, outline and stripes
  (`src/games/separate/index.ts:281`), and `hintKeepTrack` only hands an
  `edges` move's edits to `borderHintKeepTrack` (`:220`).
- **"Generation: A Separate board is Easy where the solver and the hint both
  finish it"**: "is refused" is "SHALL be refused", as in Palisade.
- `searchBoard` is called at `solver.ts:524`; `:517` is the function it is
  called in.

Checked and found sound:

- The 15 engine titles the spec cites are exact. Each states what its row
  removed: the four `border-grid` input requirements and "A cell holds its
  four edges in one byte" against the two old sentences on edges, buttons and
  the cursor; "An edge the game's Check & Save flags SHALL be drawn in the
  same error color"; the two tier-loading requirements and the one-answer
  refusal; the search's four verdicts and its budget; `solveFromAnswer` "at
  any tier"; the midend's prefix on the status bar.
- The declarations: `BOARDS`, `defaultParams`, `presets`, `paramConfig`, the
  codec's `whenAbsent` and `searchTierSegment`, `PALETTE`, `colors`; the
  snapshot holds `6x6n4de` and `6x6n4du`.
- The kept requirements, read for copies. What reads as the collection's
  (`Generation`'s first two, "Hint: Separate's hint stops where the solver
  does") is kept sentence for sentence as Palisade keeps it; nothing further
  was cut. The status bar's "Auto-solved." is `AUTO_SOLVED`,
  `src/engine/completion-status.ts:15`.
- Each subject read alone: none hollow, no dangling antecedent.
