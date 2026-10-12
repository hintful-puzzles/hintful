# palisade

The Purpose was corrected: it named "its params and description encodings",
"how the buttons set them" and "how the board looks", none of which the spec
holds now, and it says instead what is `border-grid`'s to state.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Palisade edges are three-valued and shared between cells | the clause "so every edit `interpretMove` emits is two-sided" cut from the second sentence; title and scenario kept | `border-grid`, "Each button cycles an edge between its own state and undecided" ("The edits SHALL change both cells the edge separates") |
| Rules: Palisade reddens what the board already contradicts | retitled "Rules: Palisade reddens a clue that is already impossible". First sentence (the three edge cases) replaced by one that sends the reader to the shared error model; second sentence (the clue) kept and put first. Scenarios "An over-large region reddens its edges" and "An undersized region reddens its walls" dropped; scenario "A clue with too many walls, and one that cannot reach its number" written, since the kept sentence had none | `border-grid`, "The board reddens an edge beside a group joined past the region size" (its scenario "An undecided edge round an over-large group is reddened" is set in Palisade) and "The board reddens a wall beside an undersized region and a wall that divides nothing" (scenario "An undersized region reddens its walls"); the code is `borderErrorBits`, `src/engine/border-grid-render.ts`, called at `src/games/palisade/render.ts:197`. The new scenario is `on > clue \|\| clue > 4 - off`, `src/games/palisade/render.ts:194` |
| Rules: Palisade checks mistakes against the unique solution | last sentence ("`redraw` SHALL redden each flagged edge.") cut, and the "AND `redraw` … draws the edge in the error color" line of scenario "A wrong wall is flagged" | `border-grid`, "The board reddens a wall beside an undersized region and a wall that divides nothing" ("An edge the game's Check & Save flags SHALL be drawn in the same error color"); `mistakeEdgeBits`, `src/games/palisade/render.ts:180` |
| Params: Palisade's parameters are a size and a region size | retitled "Params: A Palisade params string may leave out its region size and its difficulty". The field list and the encoding (`{w}x{h}n{k}`, `de`/`du` in the full form only) cut; a sentence sends the reader to `paramConfig`, the declared codec and `presets` (rule 2); the two missing-field sentences kept. Scenarios "Params round-trip" and "The difficulty is in the full encoding only" replaced by "A string that leaves a field out", made of their two missing-field lines | `paramConfig`, `src/games/palisade/state.ts:142`, and the `paramsCodec` field list, `src/games/palisade/state.ts:166` (`dims`, `num "n"`, `searchTierSegment`); `engine-difficulty`, "A game that searches has a tier for each deduction and Unreasonable above them" (`d` and the tier's first letter, in the full form only); `src/engine/params-stability.test.ts` holds `8x6n6`-shaped strings for the default, every preset and each field (`5x5n5de` / `5x5n5`) |
| Params: Palisade refuses a region size the grid cannot be divided by | first sentence (the bounds refuse a `w`, `h` or `k` below 1) and scenario "A region size of zero is refused by its bound" cut | `bounds: { min: 1 }` on the three fields, `src/games/palisade/state.ts:145` and `:149`; `engine-params`, "Params validity is the engine's check" and "A params refusal is a sentence" (the bound's words are the engine's) |
| Params: Palisade's menu offers each board at both difficulties | removed; the `Params` pointer sentence names `presets` | `BOARDS`, `defaultParams` and `presets`, `src/games/palisade/state.ts:130`, `:137`, `:159`; `engine-params`, "The preset menu is a grid" (each board at every tier, easiest first); `src/engine/params-stability.test.ts` lists the eight lines |
| Generation: A pasted Palisade board opens at the difficulty it needs | retitled "Generation: A Palisade board is Easy where the solver and the hint both finish it". Kept: what makes a board Easy and what Unreasonable. The loading rule ("whatever lower difficulty its ID states", the two refusals) became a pointer. Scenario "A board with several answers or none is refused" dropped; "A board that needs search opens as Unreasonable" kept | `engine-difficulty`, "A loaded board whose id states no tier takes the lowest tier that solves it" and "A pinned tier is kept or raised and never lowered"; `engine-params`, "A board with a mistake check loads only with exactly one answer". The dropped scenario's two boards are in this spec, "Solver: Palisade counts a clue set's answers by a bounded search", scenario "The search tells one answer from several and from none"; `src/games/palisade/palisade-tier.test.ts` ("a pasted Palisade board") holds the refusals |
| Controls: Each button toggles the nearest edge toward its own state | replaced by the pointer requirement "Controls: Palisade takes its buttons, drag and cursor from the border grid" (rule 2): all three sentences went, scenario "A left-click on a no-wall mark makes a wall" dropped, "A second left-click returns the edge to unknown" kept as the one real case | `targetVerbs = borderGridVerbs(…)`, `src/games/palisade/index.ts:83`; `border-grid`, "Each button cycles an edge between its own state and undecided" (its first scenario is the dropped one, set in Palisade), "A press addresses the nearest interior edge", "The keyboard cursor moves by half a cell", "A drag along a line of edges repeats the press" |
| Hint: Palisade offers a deduction-based hint | removed. Its second sentence (the plan is the full chain, in discovery order, so auto-hint can play it) joined "Hint: The plan is every edge the deductions force from the player's walls and marks". First sentence (implements the two hooks) and third (each leg's move is the two-sided `edges` edit) cut; scenario "Next deduction is surfaced and solves the board" dropped | the `Game` type (`hint`, `hintKeepTrack`); `border-grid`, "Border-grid games share the hint's notation layer" (the journey a firing becomes; the game wraps the shared edits in its move) and "A hinted edge's step is completed by the edit that sets it"; the scenario is `engine-hints`, "The hint walk SHALL cover every preset a game offers" |
| Hint: The hint is seeded from the player's own walls and marks | retitled "Hint: The plan is every edge the deductions force from the player's walls and marks". Its last sentence ("It SHALL then run the six deductions to a fixpoint.") replaced by the plan sentence from "Hint: Palisade offers a deduction-based hint"; scenario kept | this spec, "Hint: Palisade's hint runs its deductions in a fixed round" |
| Hint: The hint records every edge the deductions force | removed | this spec's five technique requirements, which say what each forces (a wall or an open edge) and that a full clue is "one firing over all those edges"; `engine-hints`, "One deduction firing is one journey". The scenario's case is "Hint: A Palisade clue that is full, or needs every edge left, settles its edges", scenario "A clue with all its walls" |
| Hint: The solver concludes the same with or without the hint's recorder | removed | `engine-hints`, "The solver and the hint are two projections of one deduction engine" (the generator runs the techniques with the recorder off, the hint the same techniques with it on) |
| Hint: A multi-edge firing says why its edges are forced together | the last line of its scenario cut ("AND the plan holds both edges as one journey, the second leg flagged `continuesPrevious`") | `engine-hints`, "One deduction firing is one journey", scenario "One clue forces two edges" |
| Hint: Each hint leg marks every element its sentence references | replaced by the pointer requirement "Hint: Palisade's marks and its keep-track verdict are the border grid's" (rule 2). Its sentence and its scenario went | `hintMarks.roles`, `src/games/palisade/index.ts:290` (ring: every edge the firing decides, marked together; outline; stripes); `engine-hints`, "A bound hint step's words SHALL name exactly the marks it draws"; which marks each technique draws is in this spec's technique requirements |
| Hint: The hint refuses when the deductions force no edge | removed | this spec, "Hint: Palisade's hint stops where the solver does" ("where none is forced it SHALL refuse with the collection's sentence that deduction has run out"); `engine-hints`, "Deduction running out on a sound board SHALL have one wording" |
| Hint: Making the hinted edit completes the step | removed; "Hint: Palisade's marks and its keep-track verdict are the border grid's" names where the verdict is stated | `border-grid`, "A hinted edge's step is completed by the edit that sets it" (completed on the forced state, off otherwise, the wrong button does not complete; its first scenario is set in Palisade); `hintKeepTrack`, `src/games/palisade/index.ts:232`, only hands over |
| Hint: The hint paints a firing's edges as one set | removed | the legend's `ring` role, `src/games/palisade/index.ts:292`; the palette's `hintEdge`, `src/games/palisade/render.ts:114`; `engine-hints`, "One deduction firing is one journey" (the first leg shows the whole set) |
| Hint: The hint marks the cells it reasons from inside the cell body | removed. Its last sentence (for `equivalentEdges` the marked cells are the region, not the clue cell) joined "Hint: Two edges of a Palisade clue that border one region share a fate". Scenario "Two regions a join would merge are outlined" moved to "Hint: Palisade's marks and its keep-track verdict are the border grid's"; "The one region a sentence is about is hatched" kept for `equivalentEdges` as "The clue that decides the edges is not marked" | `engine-hints`, "A hint mark is drawn on the cell's border" (names Palisade: inset inside the cell) and "A hint hatches the region its sentence is about"; the legend's `outline` and `stripes`; the palette's `hintEvidence`, `src/games/palisade/render.ts:115`. That a `notTooSmall` step stripes its region is this spec's "Hint: Palisade regions are all one size, in the hint as on the board" |
| Hint: Palisade's clue layer stays its own | removed | `border-grid`, "Border-grid games share the hint's notation layer" (each game keeps its deduction, its sentences and its move) and "The shared renderer does not know which game is drawing" (the digit is the game's callback); the finished-region test is this spec's "Look: Palisade shades completed correct regions" |
| Hint: Palisade's hint stops where the solver does | one sentence added (rule 2): a finished board or one with a mistake is refused before `hint` is asked, with where that is stated. Nothing cut | |
| Hint: Two edges of a Palisade clue that border one region share a fate | one sentence and scenario "The clue that decides the edges is not marked" joined from "Hint: The hint marks the cells it reasons from inside the cell body" | |
| Look: Palisade shades completed correct regions | the parenthesis "(`REGION_DONE`, a wash of the theme pair's first hue)" cut; the first sentence and the scenario of "Look: A finished region and the solved flash cover the clue cells" joined | the palette, `out[COL_CORRECT] = REGION_DONE`, `src/games/palisade/render.ts:97` |
| Look: Palisade draws its cells on the collection's quiet surface | retitled "Look: A Palisade clue sits on the lifted surface of a given". First sentence (every cell on the collection's cell surface) and third (the edges' three colors) cut, with scenario "The edges keep their three colors" | `PALETTE`, `src/games/palisade/render.ts:104` (`background: COL_CELL`, `lineNo`, `lineMaybe`, `grid`) and `colors`, `:84`, which the shared renderer paints from (`border-grid`, "The shared renderer does not know which game is drawing") |
| Look: A finished region and the solved flash cover the clue cells | removed. First sentence and scenario joined "Look: Palisade shades completed correct regions"; the win-flash sentence cut | `ts-engine`, "A game gives each element a position, and the route is which position it gives" (`sweepStep`: a diagonal from the bottom left to the top right; `src/games/palisade/render.ts:190`); `engine-colors`, "A solved flash drawn as a color takes a shared color" (the ground filled, what it holds kept) |

## Kept, and why

- **Rules: Palisade edges are three-valued and shared between cells**, the
  byte layout. `border-grid` says the edge bits are the engine's and never
  says which bit is which; a saved `edges` move holds the flags.
- **Params, "a string with no difficulty letter SHALL decode as Easy".**
  `engine-difficulty`, "A game that searches has a tier for each deduction
  and Unreasonable above them", states it for every game on
  `searchTierSegment`, but `engine-params`, "A params string is read whole or
  refused", sends the reader to "the tier the game's spec gives a string with
  no `d`". Kept so that pointer lands.
- **Params, "no region size decodes with `k` equal to the width".** It is the
  `whenAbsent` of the codec's `n` field, so the declaration does say it; kept
  as what a missing field decodes to, which a shared link depends on.
- **Generation: Palisade generates uniquely solvable boards.** Reads like the
  collection's rule by its title; its three sentences are what Easy means
  here, the strip, and "divided again where it stalls".
- **Generation, "Easy where the solver and the hint finish it".**
  `engine-difficulty` says the contract asks "the game's deduction"; that
  Palisade's is the solver and the hint both is `deductionFinishes`,
  `src/games/palisade/index.ts:283`.
- **Solver: Palisade counts a clue set's answers by a bounded search.** No
  engine capability states `searchAnswers` (see the engine requests).
- **Hint: Palisade's hint stops where the solver does.** The collection
  refuses a Search; that this hint goes on to finish an Unreasonable board
  from a right edge is promised by no shared requirement (`engine-hints`, "A
  hint finishes a board from a right entry made out of order", binds only a
  tier with no trial and error).
- **Hint: A hint sentence is advice that has not been applied.** The
  necessity-voice requirements of `engine-hints` say who is checked, not
  Palisade's two phrasings.
- **Hint: Palisade's hint runs its deductions in a fixed round.** `hintRungs`
  lists the same order, and nothing reads it for order: the round is the loop
  of `runToFixpoint`, `src/games/palisade/solver.ts:395`.
- **Look, "It SHALL fill the region whole, its clue cells included".** The
  shared renderer's choice (`F_CORRECT` before `F_GIVEN`), but Palisade is the
  one border-grid game with givens and no shared requirement says it.

## Engine requests

- "Each edge … stored as one byte per cell: the low nibble the walls U/R/D/L,
  the high nibble the no-wall marks", in "Rules: Palisade edges are
  three-valued and shared between cells". Belongs in `border-grid`; the code
  is `BORDER`, `DISABLED` and `BorderEdit` in `src/engine/border-grid.ts`. A
  save's moves hold these flags in both games.
- "It SHALL report one answer, several, none, or that it stopped at its
  budget, which SHALL be counted in positions and never in time", in "Solver:
  Palisade counts a clue set's answers by a bounded search". The same sentence
  stands in the specs of abcd, crossing, filling, mosaic, net, pattern, range,
  separate, signpost and sticks. Belongs in `engine-difficulty` or
  `engine-helpers`; the code is `searchAnswers`, `src/engine/answer-search.ts:191`.
- "Solve SHALL take the answer from it at either difficulty", same
  requirement: `solveFromAnswer`, `src/engine/answer-search.ts:324`.
- `engine-params`, "A params string is read whole or refused", scenario "A
  piece left out", says "the tier the game's spec gives a string with no
  `d`". For a game on `searchTierSegment` the giver is `engine-difficulty`,
  "A game that searches has a tier for each deduction and Unreasonable above
  them"; the scenario could say so, and the sentence then leaves every such
  game's spec.

## Found

- The spec never says a description may stop short of the last square (the
  writer drops the trailing run), only that one describing more than `w·h` is
  refused: `parseDesc`, `src/games/palisade/state.ts:238`.
- The spec never says `validateParams` refuses an area past 2³¹ with the
  collection's sentence: `src/games/palisade/state.ts:178`.
- No test of the game draws a clue in the error color; the kept sentence of
  "Rules: Palisade reddens a clue that is already impossible" is held by
  `src/games/palisade/render.ts:194` alone.
- "Rules: Palisade detects completion and the unique-division solve": the
  title names a "unique-division solve" the body does not state.
- The dropped scenario "Next deduction is surfaced and solves the board" said
  the plan solves "a fresh, uniquely-solvable" board; that is true of an Easy
  board only.

## Review

24 rows read, each against the declaration or the requirement it names, read
whole; 1 row's requirement reworded in the spec, 5 rows' line citations
corrected, no sentence restored.

Changed:

- **"Params: A Palisade params string may leave out its region size and its
  difficulty"**, the pointer sentence. It listed the four fields, which a
  pointer does not, and said the letters are declared on `paramConfig`; the
  `n` is in the `paramsCodec` call (`state.ts:166`). It now names
  `paramConfig`, the declared codec (`engine-params`, "A game declares its
  params encoding once, and both codec halves are derived") and `presets`,
  and the kept sentence introduces `k` itself.
- Line citations: `mistakeEdgeBits` is at `render.ts:180`, `hintEdge` at
  `:114`, `hintEvidence` at `:115`, `REGION_DONE` at `:97`, `colors` at `:84`,
  `parseDesc` at `state.ts:238`.

Checked and found sound:

- The 13 engine titles the spec cites are exact, and each requirement states
  what its row removed: the four `border-grid` input requirements against the
  old Controls sentences clause by clause, the two reddening requirements
  against the three edge cases, the keep-track verdict, the two tier-loading
  requirements and the one-answer refusal.
- The declarations: the bounds (`state.ts:145`, `:149`), `BOARDS` and
  `presetGrid`, `whenAbsent`, `searchTierSegment`, the legend
  (`index.ts:290`), `PALETTE`, `animLength`; the snapshot holds the eight
  preset strings and `5x5n5de`.
- The new sentences against the code: `interpretMove` is
  `interpretTargetVerbs` and nothing else; `hintKeepTrack` only hands over;
  the clue scenario is `on > clue || clue > 4 - off` (2 > 1, 3 > 2).
- The hint pointer keeps "a ring along every edge its firing has yet to set,
  and an outline and stripes inside the cell body" though it reads as a list:
  it is the one place that says the ring is on the edge and not in the cell.
- Each subject read alone: none hollow, no dangling antecedent, every title
  fits its body.
- "Look: Palisade draws its cells…" lost its plain-surface sentence to the
  palette while Clusters keeps "pieces on a quiet surface" as its own. The
  two specs differ there; the kept Palisade scenario still gives the plain
  cell.
