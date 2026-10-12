# sticks

The Purpose was corrected: it named "its parameters", "input" and "the
explained hint", and now says what of each the spec holds.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Sticks findMistakes flags only lines that contradict the solution | first sentence reworded: "SHALL take the board's one fill from the search that counts its answers, at either difficulty" became a clause that cites the engine. What is flagged, what is not, and the empty answer kept; scenario kept | `engine-difficulty`, "One search answers a board for everything that asks" (`findMistakes` reads the one kept answer, at any tier) |
| Rules: Sticks completion flashes once and nothing is animated | retitled "Rules: A Sticks board is solved when every blank cell carries a line that meets the clues". "and SHALL flash once on completion" and "There SHALL be no interpolated animation of line placement" cut, with "and flashes" from the scenario | `ts-engine`, "The win flash plays on a forward move that solves the board"; `animLength: () => 0`, `src/games/sticks/index.ts:570` |
| Params: Sticks parameters and what each check refuses | retitled "Params: Sticks refuses, for a deal only, a block percentage outside 5 to 100 and a quarter-turn symmetry off a square". First two sentences (the field list, the bound of 2 and the known symmetry, "declared on `paramConfig`") cut; the `validateParams` sentence and both scenarios kept | `paramConfig`, `src/games/sticks/state.ts:141` (`bounds: { min: 2 }`, `:144`; the symmetry is a `choices` field); `engine-params`, "Params validity is the engine's check" (each item's bounds, each choice inside its list) |
| Params: Sticks parameters round-trip through their encoding | replaced by the pointer requirement "Params: A Sticks params string may leave out its blocks, its symmetry and its difficulty" (rule 2). Cut: what the full and the short encoding carry, `de` and `du`, the round trip, with scenarios "A game ID round-trips through the parameters" and "A bare size decodes". Kept: no difficulty letter decodes as Easy. Scenario "The difficulty is in the full encoding only" became "A string that leaves a field out", made of its missing-field line and of `7x7` decoded | the `paramsCodec` field list, `src/games/sticks/state.ts:184` (`dims`, `num "b"`, `num "s"`, `searchTierSegment`, the last three in the full form only); `engine-difficulty`, "A game that searches has a tier for each deduction and Unreasonable above them" (`d` and the tier's first letter, in the full form only); `src/engine/__snapshots__/params-stability.test.ts.snap` holds `7x7b20s2du` with its short form `7x7`, and `src/engine/params-read-whole.test.ts` holds `7x7b20s2` |
| Params: Sticks' menu offers each size at both difficulties | removed, with its scenario; the pointer requirement names `presets` | `BOARDS`, `defaultParams` and `presets`, `src/games/sticks/state.ts:130`-`138`; `engine-params`, "The preset menu is a grid" (each board at every tier, easiest first); the snapshot above lists the six lines |
| Params: Sticks writes its block percentage after `b` and its symmetry's number after `s` | removed. Its last sentence (no `b` is 20 percent, no `s` is 2-way rotational) and scenario "An asymmetric board" joined "Params: A Sticks params string may leave out its blocks, its symmetry and its difficulty". Cut: the letters, their order, and which number is which symmetry, with scenario "A string from before the game had tiers" | the two `num` segments, `src/games/sticks/state.ts:186`-`197`, and the `choices` of the `symmetry` item, whose index the `s` number is, `:154`; the kept scenarios hold `s0` as no symmetry and `7x7b20s2` as Easy |
| Params: A Sticks title says its blocks and its symmetry where they are not the default | removed, with its scenario; the pointer requirement names the label words as `paramConfig`'s | the `label` of the block percentage and of the symmetry, `src/games/sticks/state.ts:148`, `:159`; `engine-params`, "One describer labels every params set" |
| Generation: Every Easy Sticks board has one solution, reached without guessing | removed, with its scenario | `engine-difficulty`, "Every tier promises one solution found at its cap" and "Only a tier named Unreasonable requires Search"; that Easy is what the solver completes is this spec's "Generation: The Sticks generator keeps only what the solver completes", and the count by a search is the scenario of "Generation: Uniqueness is established by a witness independent of the solver" |
| Generation: A pasted Sticks board opens at the difficulty it needs | retitled "Generation: A Sticks board is Easy where the solver and the hint both finish it". Kept: what makes a board Easy and what Unreasonable. The loading rule ("whatever lower difficulty its ID states", the two refusals) became a pointer. Scenario "A board with several answers or none is refused" dropped; "A board that needs search opens as Unreasonable" kept | `engine-difficulty`, "A loaded board whose id states no tier takes the lowest tier that solves it" and "A pinned tier is kept or raised and never lowered"; `engine-params`, "A board with a mistake check loads only with exactly one answer". The dropped scenario's two boards are in this spec, "Solver: Sticks' search assumes the first blank square's line across, then up and down", scenario "The search tells one answer from several and from none" |
| Solver: Sticks counts a board's answers by a bounded search | retitled "Solver: Sticks' search assumes the first blank square's line across, then up and down". Cut: counting up to two by trial and error, the four reports, the budget in positions, and Solve taking the answer at either difficulty; each became a citation. Kept: what the search assumes where the solver stops. Scenarios "A spent budget is neither answer" and "An Easy board takes one position" dropped; "The search tells one answer from several and from none" and "The search agrees with a count that has no search in it" kept | `engine-difficulty`, "The engine counts a searching game's answers up to two, within a budget of positions" (its scenarios "The budget runs out with one answer in hand" and "A board the deduction finishes" are the two dropped), "One search answers a board for everything that asks" and "Solve from the search shows the one answer or says which it lacks"; `solve` is `solveFromAnswer(answerOf(orig), …)`, `src/games/sticks/index.ts:357` |
| Controls: Sticks is played by drag, click and keyboard cursor | became the pointer for the clicks and the keys (rule 2): the two click cycles cut for a sentence that names `targetVerbs` and says where the drag and the modified arrows are stated. Title and scenario kept | `targetVerbs`, `src/games/sticks/index.ts:152` (`primary: verticalVerb`, `secondary: horizontalVerb`, each `does` giving its cycle; `geometry: squareGrid(…)`); `engine-input`, "The engine owns a declaring game's press and select keys" |
| Hint: One clue ruling out several Sticks squares is one journey | removed, with its scenario | `engine-hints`, "One deduction firing is one journey" (later legs flagged, with abbreviated narration); which squares one journey holds is this spec's "Hint: The Sticks hint takes the first forced square in reading order" ("every later square the same clue and rule force"), whose first scenario gives a journey of two |
| Hint: The Sticks hint draws the forced line in the hint color | removed. Scenario "The forced orientation is visible, not merely described" moves, unchanged, to "Hint: A Sticks hint's marks are its legend's, and they count out against the words" | the legend's `ring` role, `src/games/sticks/index.ts:555` (the line the step asks for, in the hint color, running the way it must go); that the hint's color is not a placed line's is this spec's "Look: No two roles on the Sticks board share a color" |
| Hint: The Sticks hint shows its evidence, and the marks count out against the words | retitled "Hint: A Sticks hint's marks are its legend's, and they count out against the words". First sentence (the evidence is shown, and does not hide what makes it evidence) replaced by one that names `hintMarks`; the two sentences on counts and on the run walked kept. Gains the scenario of "Hint: The Sticks hint draws the forced line in the hint color" | the legend's `outline` role, `src/games/sticks/index.ts:556`; `engine-hints`, "A hint marks beside the content, never behind it" |

## Kept, and why

- **Rules, "Where the search did not prove exactly one fill it SHALL flag
  nothing".** `engine-difficulty`, "One search answers a board for everything
  that asks", says the mistake check reads the search and not what it does
  with several, none or a spent budget.
- **Params, the three missing fields.** `whenAbsent` is not used: each is as
  `defaultParams` has it, and the tier is `engine-difficulty`'s to hold at
  Easy. Kept as what a missing field decodes to; every 7×7 board's short form
  is `7x7`.
- **Params: Sticks refuses Unreasonable where no board needs it** and
  **Unreasonable Sticks is bounded on its own measurements.** Refusals by
  `validateParams`, with their reasons.
- **Generation: An Unreasonable Sticks board has one answer that the solver
  does not reach.** `engine-difficulty`, "The engine deals the Unreasonable
  board of a game that searches" and "A strip is asked within the engine's
  dealing budget", state the keeping rule and the strip's budget; that the
  candidate is a fill the solver completes, stripped, is the draw the game
  supplies. Left as Palisade's stands.
- **Generation: A Sticks board is Easy where the solver and the hint both
  finish it.** The contract asks "the game's deduction"; that it is the solver
  and the hint both is `deductionFinishes`, `src/games/sticks/index.ts`.
- **Controls: Sticks' line keys set a line outright.** The keys are the
  `keyOnly` verbs' (`src/games/sticks/index.ts:162`); that a key sets where a
  click cycles, and that a key which changes nothing makes no move, is said by
  no `does` string together.
- **Hint: A Sticks hint concludes in the necessity voice and names a clue by
  its number.** The engine's necessity-voice requirements say who is checked;
  "this 2 must be vertical" is the game's wording.
- **Hint: Sticks' hint stops where the solver does.** That the hint goes on to
  finish an Unreasonable board from a right line is promised by no shared
  requirement.
- **Hint: The Sticks hint takes the first forced square in reading order.**
  The order is `deduceSticksPlan`'s scan and its ranking of contradictions
  (`src/games/sticks/solver.ts`), not `hintRungs`.

## Engine requests

- "A letter `a` to `z` SHALL stand for 1 to 26 plain blank cells", in
  "Description: A Sticks description spells a block `B` and parts two written
  cells with `_`". Pearl, Tracks and Palisade say it of themselves; see
  `pearl.md`.

## Found

- **"Generation: Uniqueness is established by a witness independent of the
  solver" says the solver completing a board "is not evidence about how many
  solutions exist".** `engine-hints`, "The solver and the hint are two
  projections of one deduction engine", says deductive completion implies
  uniqueness. Sticks' solver commits a line only where the other is
  contradicted, so a board it completes has one fill; the requirement is a
  rule about how a test counts and reads as a rule about the game.
- **"Rules: Sticks validity is checked against the puzzle rules" has for its
  scenario the solver completing a dealt board**, which is not a case of the
  three rules it states.
- **"Solver: Sticks ports the deductive solver and solver-gated generator"**:
  the title names a port and a generator; the body is the solver's method.
- **The spec never says a number above 4 on a block, or `s` above 4, is
  refused by which check.** `s9` decodes and is refused by the engine's check
  of the choices (`src/games/sticks/state.ts:180`, the comment on the codec).
