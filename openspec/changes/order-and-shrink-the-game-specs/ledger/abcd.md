# abcd

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: ABCD's findMistakes compares the board with its one solution | retitled "Rules: ABCD checks letters and notes against the one answer its clues fix" and cut to a pointer (rule 2). Its three sentences replaced by one that names the two shared requirements and where the answer comes from. Scenario "An entry that contradicts the solution is flagged" dropped; "A mark that has crossed out the answer is a mistake" kept, without "and the hint refuses until it is fixed" | `ts-engine`, "A mistake check compares with the one answer, hidden or not" (a wrong entry) and "A candidate note that excludes the answer is a mistake" (marks that leave out the answer are reported, extra letters are not; its first scenario is the second dropped one). Where the answer comes from: `engine-difficulty`, "One search answers a board for everything that asks" (`findMistakes`), named in this spec's "Solver: ABCD counts a clue set's answers by a bounded search". That the hint refuses until it is fixed: `engine-hints`, "The midend SHALL refuse a hint on a finished or wrong board before asking the game". `findMistakes`, `src/games/abcd/index.ts:290` |
| Rules: ABCD is solved when the grid is full and every rule holds | sentence untouched; "and flashes" reworded out of the scenario | `ts-engine`, "The win flash plays on a forward move that solves the board" |
| Params: ABCD's parameters | retitled "Params: ABCD needs five letters where diagonal touching is disallowed". Sentence 1 (the six fields) and sentence 3 (what a game ID encodes, and the round trip) cut; of sentence 2 the limits on one field (a width or height under 2, a letter count over 9 or under 3) are cut (second pass: the citing sentence that had replaced them went, and "their bounds" joined the pointer of "Params: An ABCD params string is its declared codec's…"), and "under 5 when diagonal adjacency is disallowed" is kept as the requirement. Scenario "A game ID round-trips through the parameters" dropped; "Invalid letter counts are rejected" narrowed to the game's own case and retitled "Four letters and no diagonal touching", with the sentence the code gives | the fields: `paramConfig`, `src/games/abcd/state.ts:116`-`160`, and this spec's "Params: An ABCD params string is its declared codec's…"; the bounds: `state.ts:120` and `:127`, refused by the engine (`engine-params`, "Params validity is the engine's check"); the round trip: `engine-params`, "A game declares its params encoding once, and both codec halves are derived". The new scenario's sentence: `validateParams`, `state.ts:292` |
| Params: ABCD's generation-time settings are in the full encoding only | retitled "Params: An ABCD params string is its declared codec's, and one with no difficulty letter is Easy". Sentence 1 (the flag and the difficulty are in the full encoding only, as `R` and `de` or `du`) replaced by the pointer to `paramConfig` and the codec, which says in a clause what the params are and, from the second pass, names their bounds with their encoding; "A string with no difficulty letter SHALL decode as Easy" kept, its reason ("so that an ID written before the game had tiers reads as it did") cut for length, the scenario still giving the case. Gains the `D` sentence and the scenario "The preset that disallows diagonal touching" from "Params: ABCD params are written as the size…". Third pass: the `D` sentence it gained ("A string with no `D` SHALL decode as a board that allows diagonal touching") cut, the scenario "The preset that disallows diagonal touching" staying. Scenario "The difficulty is in the full encoding only" untouched | the absent `D`: `engine-params`, "A bare flag letter left out is read as the opposite of its meaning" (its first scenario is ABCD's `5x5n5` and `5x5n5D`), with `flag(paramConfig, "D", "allow-diagonal-touching", { means: false })`, `state.ts:176`; `paramsCodec(defaultParams, [dims, num "n", flag "D" means false, flag "R" full, searchTierSegment])`, `state.ts:173`-`179`; `engine-difficulty`, "A game that searches has a tier for each deduction and Unreasonable above them" (`d` and the first letter of the tier's name, in the full form only). `src/games/abcd/abcd.test.ts:101`-`110` holds `5x5n5DRdu` and `5x5n5DR` |
| Params: ABCD's label names the tier and the hidden clues apart | removed | the `label` of the `remove-clues` item (`words: (p) => (p.removenums ? "clues hidden" : null)`, slot `tail`, after the letter count's), `state.ts:139`; the tier by its name and the order of the slots: `engine-params`, "One describer labels every params set". The snapshot `src/engine/__snapshots__/params-stability.test.ts.snap` holds "5x5 Easy, 4 letters, clues hidden" |
| Params: ABCD's menu offers a board under each of its rules | retitled "Params: ABCD's board without diagonal touching is a preset of its own". Sentence 1 (four sizes at both difficulties, then one Easy board each for clues hidden, no diagonal touching and three letters) cut (second pass: the pointer to `presets` and the shared shape that had replaced it went); sentence 2 kept, with its SHALL. Scenario "Every size is offered at both difficulties" dropped; the other two untouched | `presetGrid(paramConfig, BOARDS, { variants: VARIANTS })`, `state.ts:95`-`104` and `:162`; `engine-params`, "The preset menu is a grid" (each board at its tiers, then one board for each thing that is neither a size nor a tier) and "A board's tiers are one run of lines, and every tier is offered" |
| Params: ABCD params are written as the size, n with the letter count, and D for no diagonal touching | removed. Its last sentence (no `D` decodes as a board that allows diagonal touching) moved to "Params: An ABCD params string is its declared codec's, and one with no difficulty letter is Easy" and was cut there in the third pass; its scenario "The preset that disallows diagonal touching" (unchanged) moves to that requirement | the absent `D`: `engine-params`, "A bare flag letter left out is read as the opposite of its meaning"; the codec's segment list, `state.ts:173`-`179`; `engine-params`, "The codec grammar is a prefix, tagged segments, flags and letters". The snapshot holds `6x6n5Dde` and `6x6n5D` |
| Generation: An Unreasonable ABCD board has one answer that the ladder does not reach | title kept. Sentence 1 (a fill is accepted only when the ladder stops short and the search proves one answer) replaced by a pointer to the engine's deal, with what ABCD supplies as a candidate; of sentence 2, the start from a fill with one answer, the budget "far under the one a pasted board is allowed" and "keep the board only if the ladder then stops short" cut (second pass: the citation that had replaced them went, the deal's being the requirement's one pointer), and the strip itself (clues hidden in a randomized order, each only while the search still proves one answer) kept. Scenario untouched | `engine-difficulty`, "The engine deals the Unreasonable board of a game that searches" (kept only where the deduction stops short and the search proves one answer) and "A strip is asked within the engine's dealing budget" (a strip is handed only a proved candidate, within one budget well under any game's own, and the stripped board is asked once more). `dealUnreasonable`, `src/games/abcd/generator.ts:100`-`108` |
| Params: ABCD refuses board sizes it cannot generate | sentence 2 (the bound is not applied with a description in hand, so a shared game ID still loads) cut (second pass: the citing sentence that had replaced it went); sentence 1 says "when validating for generation", so the qualifier stands. Scenario "An existing game ID outside the bound still loads" dropped; the other untouched. Found, mended: "when validating for generation" now reads "when validating for generation at Easy", the bound being the Easy one (`state.ts:297` returns `unreasonableRefusal` first at Unreasonable) | `engine-params`, "Param validation distinguishes generating a board from loading one" (`full: false` when a description is in hand; its scenario "A generation-only bound does not refuse the descriptive form" is the dropped one) and "A generation-only bound is gated on full". `if (full)`, `src/games/abcd/state.ts:295` |
| Params: ABCD refuses Unreasonable where none of a size's boards needs it | last sentence ("A board of a refused size that arrives with its description SHALL still load") cut; sentence 1 opens "When a board is to be dealt", so the qualifier stands. Scenarios untouched, the first still giving the described board's case | `engine-difficulty`, "An unbindable tier is refused, not silently downgraded" ("The refusal SHALL apply to generation only, so that a saved game or a game ID carrying its own description still loads") |
| Generation: A pasted ABCD board opens at the difficulty it needs | third pass: retitled "Generation: An ABCD board is Easy where the ladder and the hint both finish it". What each tier is (Easy where the ladder and the hint finish a board, Unreasonable where it has one answer they do not reach) kept as its one sentence, "SHALL be" reworded "SHALL count as"; "whatever difficulty its ID states below that" and the two refusals' sentences, replaced by citations in the cut, went with their citations in the third pass. Scenario "A board with several answers or none is refused" dropped; "A board that needs search opens as Unreasonable" untouched | `engine-difficulty`, "A pinned tier is kept or raised and never lowered" and "A loaded board whose id states no tier takes the lowest tier that solves it"; `engine-params`, "A board with a mistake check loads only with exactly one answer" (`DESC_NOT_UNIQUE`, `DESC_CONTRADICTORY`) |
| Solver: ABCD's Solve does not claim a second answer it has not found | removed | `engine-difficulty`, "Solve from the search shows the one answer or says which it lacks" (the three refusals, `PUZZLE_NOT_REASONABLE` where the budget ran out; "A game on the search's tiers SHALL answer `solve` through it") and "One search answers a board for everything that asks". `solveFromAnswer(answerOf(orig), …)`, `index.ts:268`. The scenario: `engine-params`, "A board with a mistake check loads only with exactly one answer" |
| Solver: ABCD counts a clue set's answers by a bounded search | title kept. "count a clue set's answers up to two by trial and error", the four verdicts and the budget counted in positions replaced by a citation; what ABCD assumes (each candidate of an empty cell in turn where the ladder stops) kept; the last sentence (Solve and the mistake check take the answer from it) cut (second pass). Scenario "A spent budget is neither answer" dropped; the other two untouched. Found, mended: gains the budget, 2,000 positions, and that it is not lowered, since a saved board loads only within it (`SEARCH_BUDGET`, `src/games/abcd/solver.ts:410`) | `engine-difficulty`, "The engine counts a searching game's answers up to two, within a budget of positions" (its first scenario is the dropped one). The last sentence: `engine-difficulty`, "One search answers a board for everything that asks" and "Solve from the search shows the one answer or says which it lacks" ("A game on the search's tiers SHALL answer `solve` through it"); the mistake check's half is still named in this spec's "Rules: ABCD checks letters and notes against the one answer its clues fix". `searchAnswers`, `src/games/abcd/solver.ts:417` |
| Controls: ABCD enters a letter into the selected cell | sentence 1 reworded to name the shared mechanic it described ("selecting a cell, by mouse click or arrow-key cursor … with a pencil-mark mode") and keep, in a clause, what a click, the arrows and a key do. Sentences 2 and 3 (the keys `interpretMove` reads by hand) and the scenario untouched | `engine-notes`, "The note-taking cell is one shared mechanic"; `pressNoteTakingCell`, `src/games/abcd/index.ts:146` |
| Controls: ABCD's keypad offers the board's letters and Clear | sentence 2 (a letter key does what typing the letter does, and Clear what Backspace does) cut. Sentence 1 and the scenario untouched | `engine-input`, "Games may expose on-screen key labels" ("processed exactly as the equivalent physical keypress") and "Backspace clears wherever the panel's Clear does" |
| Hint: ABCD offers an explained hint | sentences untouched. Scenario "The hint finishes every generated board" dropped (false of the Unreasonable presets: see Found); "A letter placed where diagonal touching is disallowed" written in words | `engine-hints`, "The hint walk SHALL cover every preset a game offers", with `engine-hints`, "Deduction runs out only where the tier permits search", and this spec's "Hint: ABCD's hint stops where the ladder does". The new scenario: `reach`, `src/games/abcd/hint.ts:237` |
| Hint: ABCD's hint stops where the ladder does | title kept. Last sentence: ", as it does from any position" reworded out (review made it a citation, and the second pass took the citing clause out). Third pass: "The hint SHALL never run the search", "and no others, and where none forces anything it SHALL refuse with the collection's sentence that deduction has run out" and "It SHALL go on from the letters the player then enters" cut; kept: that the steps are those the three techniques force from the player's marks, on an Unreasonable board as on any other. The scenario loses its first THEN (unfinished, no mistake, the refusal's sentence) and its line on a letter entered wrongly, and keeps its last clause | never searches, and a letter entered wrongly: `engine-hints`, "The hint of a game on the search's tiers never searches" (scenario "A value tried wrongly"); every forced step before the refusal, the refusal, and going on from what the player enters: `engine-hints`, "A hint gives every step deduction still forces before it refuses"; `engine-hints`, "A hint is deduced from the board in play" |
| Solver: ABCD's solver classifies a clue set by deduction alone | third pass: title kept. "A firing census SHALL walk … and assert" reworded to what is ABCD's: its boards are generated at every preset on the menu, and every technique fires on them (`unreached: {}`, `src/games/abcd/abcd-ladder.test.ts:57`). Scenario "A technique the corpus never reaches fails the census" dropped; the other two untouched | `testing`, "A firing census certifies a solver's ladder" (its first scenario is the dropped one) |
| Look: What ABCD draws | "and SHALL flash on completion" and "There SHALL be no move animation." reworded out. Scenario untouched | `ts-engine`, "The win flash plays on a forward move that solves the board"; `animLength: () => 0`, `index.ts:386` |

## Kept, and why

- **Params: … one with no difficulty letter is Easy**, second sentence.
  `engine-difficulty`, "A game that searches has a tier for each deduction
  and Unreasonable above them" states the Easy half for every game on
  `searchTierSegment`; kept by the brief's rule that what a missing field
  decodes to stays. The `D` half went in the third pass.
- **Rules: ABCD checks letters and notes…** `ts-engine`, "A candidate note
  that excludes the answer is a mistake" binds "a game whose state carries
  candidate or pencil notes" only where it "reports them as mistakes": that
  ABCD does is the game's to say.
- **Solver: ABCD's solver classifies…**, the census's boards and that every
  technique fires on them, with the scenario "A preset is added to the menu":
  `testing`, "A firing census certifies a solver's ladder" leaves the boards
  and the caps to the game.
- **Generation: An ABCD board is Easy…**, its sentence. What Easy means in
  ABCD (the ladder and the hint both finish the board) is the game's:
  `deductionFinishes`, `index.ts:280`.
- **Solver: ABCD counts…**, "assuming each candidate of an empty cell in
  turn". The shared requirement leaves "what to assume where that stops" to
  the game.
- **Controls: ABCD's keypad…**, first sentence. `requestKeys` is a function
  written out by hand (`index.ts:305`).
- **Hint: ABCD offers an explained hint**, "reasoning from the player's
  pencil marks and placed letters". `engine-hints`, "A hint is deduced from
  the board in play" states the placed letters and leaves "which marks a
  step may rest on" to the game.
- **Hint: ABCD's hint stops where the ladder does.** What its deductions are
  (the three techniques, from the player's marks) is the game's, and the
  scenario's last clause, that a letter entered rightly wherever the hint
  stops lets it finish the board, is more than the engine's scenario.

## Engine requests

- Answered: `testing`, "A firing census certifies a solver's ladder" (in
  `testing` and not `engine-helpers`, the census being a test helper). The
  sentence is cut to which boards, and that every technique fires.
  "A firing census SHALL walk boards … and assert that every technique
  fires", with the scenario "A technique the corpus never reaches fails the
  census", in "Solver: ABCD's solver classifies a clue set by deduction
  alone". Solo, Tents and Pearl each say it of themselves and no engine
  capability names the census. Belongs in `engine-helpers`, beside the
  deduction fixpoint: that a ladder is certified by a census of which rungs
  its corpus fires, an unreached rung named with its reason. Which boards
  the corpus is stays the game's. `describeLadderCensus`,
  `src/engine/testing/ladder-census.ts`.

## Found

- **The dropped scenario "The hint finishes every generated board" was false
  of half the menu.** It said a plan built on "a freshly generated board of
  any preset" solves it. Four presets are Unreasonable, where the hint
  refuses when the ladder stops (this spec's "Hint: ABCD's hint stops where
  the ladder does"). The test walks the Easy shapes only
  (`src/games/abcd/abcd-hint.test.ts:41`-`47`).
- **"Solver: ABCD's solver classifies a clue set by deduction alone" and
  "Params: ABCD's bound is asserted in both directions" each state what a
  test does** (a firing census, an assertion). Left.
- **The spec never said what the mistake check reports where the search
  proves no single answer.** `findMistakes` returns nothing there
  (`index.ts:292`). Only a board whose search ran out of budget loads in that
  state, the others being refused at load.
- **The spec does not state the budget of ABCD's search**, which
  `engine-difficulty`, "The engine counts a searching game's answers up to
  two, within a budget of positions" leaves to the game.
- **"Params: ABCD refuses board sizes it cannot generate" does not say the
  bound is the Easy one.** At Unreasonable `validateParams` returns
  `unreasonableRefusal` and never reaches it (`state.ts:297`); the
  requirement after it ("Unreasonable is bounded on its own measurements")
  implies as much.

## Review

Rows read: 14, each against the declaration or the requirement it names,
opened whole. Rows corrected: 4. Rows added: 4.

Corrected:

- **Rules: ABCD's findMistakes…** was removed whole and is restored as a
  pointer. `ts-engine`, "A candidate note that excludes the answer is a
  mistake" is conditional ("where a game … reports them as mistakes"), so
  nothing said ABCD reports notes; and `Rules` was left with no word on what
  a mistake is. It now reads as Keen's, Towers', Unequal's and Solo's do.
- **Params: ABCD's parameters**: the kept bounds sentence had no SHALL and
  named no requirement; it now cites `engine-params`, "Params validity is
  the engine's check".
- **Generation: A pasted ABCD board…**: the spec cited "A pinned tier is kept
  or raised and never lowered" alone, though its scenario's first case is an
  ID with no difficulty letter. It now cites "A loaded board whose id states
  no tier takes the lowest tier that solves it" as well, in Palisade's words.
- **Generation: An Unreasonable ABCD board…**: line citation
  (`generator.ts:100`-`108`).

Cut in review (the second reading of what was kept), each with a row above:

- "Params: ABCD refuses board sizes it cannot generate", sentence 2 and the
  scenario "An existing game ID outside the bound still loads".
- "Params: ABCD refuses Unreasonable where none of a size's boards needs
  it", last sentence.
- "Controls: ABCD enters a letter into the selected cell" and "Hint: ABCD's
  hint stops where the ladder does": a copied clause reworded to a citation.

Engine requests: the `D` request is withdrawn. `engine-params`, "A params
string is read whole or refused", scenario "A bare flag letter left out",
states all of it (`flag`, `src/engine/params-codec.ts:277`), though by a
scenario only, its body speaking of tagged fields. The sentence stays as
what a missing field decodes to. One request added, for the firing census.

Checked and found sound:

- The other ten rows. Each declaration is where its row says:
  `paramConfig` bounds (`state.ts:120`, `:127`), the codec's five segments
  (`state.ts:173`-`179`), the `remove-clues` label (`state.ts:139`),
  `presetGrid` with `BOARDS` and `VARIANTS`, `animLength` (`index.ts:386`).
  `clearKey`'s button is code 8, Backspace's own, so the cut keypad sentence
  is `engine-input`, "Games may expose on-screen key labels" whole.
- Every quoted string: the refusal sentence (`state.ts:292`), `5x5n5DRdu`,
  `5x5n5D` and `5x5n5DR` (`abcd.test.ts:100`-`110`), `6x6n5Dde` and `6x6n5D`
  and "5x5 Easy, 4 letters, clues hidden" (the params-stability snapshot).
- The new hint scenario: `reach` is `neighbors`, diagonals included when
  `diag` (`hint.ts:236`), and ABCD has no auto-pencil preference, so the
  cull after a placement is a strike step.
- Kept as the game's after reading the shared requirement: the two line
  rungs waiting on `populated` and the runs rung on `nothingEarlier`
  (`hint.ts:252`-`265`; `engine-candidate-hints`, "The walk owns the ladder"
  gives the signal and leaves its use to the rung), the obvious marks
  (`engine-notes`, "Mark-all is adaptive…" names a rule "of its own"), the
  description's round trip (hand-written parser), and both `Look`
  requirements.
- Each subject read alone, and the four checks run.

## Second pass

Citing sentences read: 12. Removed: 4 sentences, and the citing clause of 2
more. Kept as the subject's one pointer: 6. Kept as a departure: 0.

- **Removed.** "The limits on a single field SHALL be its bounds in
  `paramConfig`, which the engine refuses (`engine-params`, …)", in "Params:
  ABCD needs five letters where diagonal touching is disallowed". `Params`
  has its pointer in the codec requirement, which now reads "their bounds
  and their encoding", as Salad's, Rome's and Undead's do. Two rows
  corrected.
- **Removed.** "The bound SHALL bind generation only, and a board that
  arrives with its description loads as the collection's does
  (`engine-params`, …)", in "Params: ABCD refuses board sizes it cannot
  generate". The sentence before it says "when validating for generation".
  Row corrected.
- **Removed.** "Which boards the menu offers SHALL be ABCD's `presets`, in
  the collection's shape (`engine-params`, …)", in "Params: ABCD's board
  without diagonal touching is a preset of its own": a second pointer in a
  subject that has one. Row corrected.
- **Removed.** "Solve and the mistake check SHALL take the board's answer
  from it as every searching game's do (`engine-difficulty`, …)", in
  "Solver: ABCD counts a clue set's answers by a bounded search". `Rules`
  keeps the pointer for the mistake check and names the same requirement.
  Two rows corrected.
- **Citing clause removed, the game's sentence kept.** The strip's citation
  in "Generation: An Unreasonable ABCD board has one answer that the ladder
  does not reach" (the deal's citation is that requirement's pointer), and
  "as every hint does from the board in play (`engine-hints`, …)" in "Hint:
  ABCD's hint stops where the ladder does". Two rows corrected.
- **Kept as a pointer.** `Rules`, the mistake check and where its answer
  comes from; `Params`, the codec sentence; `Generation`, the engine's deal,
  with what ABCD hands it; `Generation`, what a pasted ID opens as and which
  is refused, one sentence for the concern of loading; `Solver`, the
  engine's search, with what ABCD assumes; `Controls`, the note-taking cell.
- **Preferences.** ABCD declares none, and the cut touched none.
- Each subject read alone after the edit: none is a fragment, and every
  title fits its body.

## Third pass

Rows of the engine's third-round tables that name ABCD: 4 (the bare flag,
the census, every step before the refusal, never searches). Engine requests
of its own: 1. Cut: 4 sentences, 4 clauses and 2 scenarios, with 3 lines of a
third, in 4 requirements. Clauses kept: 6.

Cut (the rows above say where each is stated):

- **"Params: An ABCD params string is its declared codec's, and one with no
  difficulty letter is Easy"**: "A string with no `D` SHALL decode as a board
  that allows diagonal touching".
- **"Generation: A pasted ABCD board opens at the difficulty it needs"**:
  "What a pasted game ID opens as SHALL follow from that (`engine-difficulty`,
  …)", and with it "and one with several answers or none SHALL be refused
  (`engine-params`, …)", the same kind of sentence, with the scenario of the
  refusal; retitled for what a board counts as, as Crossing's, Range's and
  Sticks' now are.
- **"Solver: ABCD's solver classifies a clue set by deduction alone"**: "A
  firing census SHALL walk … and assert", and the scenario "A technique the
  corpus never reaches fails the census".
- **"Hint: ABCD's hint stops where the ladder does"**: "The hint SHALL never
  run the search.", "and no others, and where none forces anything it SHALL
  refuse with the collection's sentence that deduction has run out", "It
  SHALL go on from the letters the player then enters.", and the scenario's
  lines on the refusal's sentence and on a letter entered wrongly.

Kept:

- **"A string with no difficulty letter SHALL decode as Easy"**: what a
  missing field decodes to, which an old link depends on.
- **Which boards count as Easy and which as Unreasonable**, with the scenario
  "A board that needs search opens as Unreasonable", which stands under it.
- **The census's boards and that every technique fires on them.**
- **"the steps of ABCD's hint SHALL be those the three techniques force from
  the player's marks"**, and the scenario's last clause.
- **"with no departure from the codec grammar"** in `Params`: the subject's
  one pointer to what the params are and how they are written.
- **The mistake check's sentence**, with its three citations: the second pass
  kept it, and it states nothing of a board with no one answer.

The spec was searched for the third round's other rules in other words (the
wash over a cell's surface, an arrow moving the highlight, a hatch under
content, a sentence that leads with the indication): "hatching the line" in
the runs rung is where ABCD's hatch goes and not what it lies under, and
stays.

Each subject read alone: no fragment, no dangling pronoun, every title fits
its body, and the Purpose names nothing that went.

## Found, mended

- The dropped scenario "The hint finishes every generated board" was false of
  the Unreasonable presets: left: the cut dropped it, and no sentence of the
  spec says it now.
- Two requirements each state what a test does ("Solver: ABCD's solver
  classifies…", "Params: ABCD's bound is asserted in both directions"): left,
  as the brief has it. The first was reworded in the third pass; the second
  still reads "SHALL be asserted".
- What the mistake check reports where no single answer is proved: left:
  `ts-engine`, "A mistake check compares with the one answer, hidden or not"
  now states it ("no mark SHALL be flagged against an answer"), and a board
  whose search runs out is refused at load (`engine-difficulty`, "One search
  answers a board for everything that asks").
- The budget of ABCD's search: stated in "Solver: ABCD counts a clue set's
  answers by a bounded search", 2,000 positions and never lowered
  (`SEARCH_BUDGET`, `src/games/abcd/solver.ts:410`), a saved board depending
  on it.
- "Params: ABCD refuses board sizes it cannot generate" did not say the bound
  is the Easy one: it now reads "when validating for generation at Easy".
