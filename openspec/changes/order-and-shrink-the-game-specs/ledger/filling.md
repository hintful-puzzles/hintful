# filling

The Purpose was corrected: it named a hint "with its own color legend", which
the spec no longer holds (the legend is `hintMarks`).

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Filling reports mistakes for Check & Save | title and scenario kept. "The game SHALL implement `findMistakes(state)` by taking the board's one answer from the search that counts its answers, at either difficulty" reworded to a citation; what is returned, and the empty result where no one answer was proved, kept | `engine-difficulty`, "One search answers a board for everything that asks"; `answerOf`, `src/games/filling/index.ts:214` |
| Params: Filling's parameters | retitled "Params: A Filling params string may leave out its height and its difficulty" (the pointer, rule 2). The field list, the bound of 1 and the `{w}x{h}`, `de`, `du` encoding cut; "no difficulty letter decodes as Easy" kept, and the square fallback, which stood only in a scenario, said as a sentence. Scenarios "Params round-trip" and "The difficulty is in the full encoding only" replaced by "A string that leaves a field out", made of their two missing-field lines | `paramConfig`, `src/games/filling/state.ts:90` (`bounds: { min: 1 }` at `:93`), and the `paramsCodec` field list, `:108` (`dims`, `searchTierSegment`); `engine-difficulty`, "A game that searches has a tier for each deduction and Unreasonable above them" (`d` and the tier's letter, in the full form only); `engine-params`, "Params validity is the engine's check"; `src/engine/__snapshots__/params-stability.test.ts.snap` holds `9x13de`/`9x13` and every preset |
| Params: Filling rejects board sizes it cannot generate | "A description that is supplied SHALL NOT be held to the bound." cut, with scenario "An existing large description still loads"; the kept sentence already says "when a board is to be dealt" | `engine-params`, "A generation-only bound is gated on full" and "Param validation distinguishes generating a board from loading one" (scenario "A generation-only bound does not refuse the descriptive form"); `if (!full) return null`, `src/games/filling/state.ts:143` |
| Params: Filling's menu offers each size at both difficulties | removed; the `Params` pointer names `presets` and `defaultParams` | `BOARDS`, `defaultParams` and `presets`, `src/games/filling/state.ts:83`, `:85`, `:101`; `engine-params`, "The preset menu is a grid" (each board at every tier, easiest first); the snapshot lists the default and the five other lines |
| Generation: An Unreasonable Filling board has one answer that the solver does not reach | retitled "Generation: An Unreasonable Filling board is a full board with clues hidden while one answer is proved". Kept: the strip (clues hidden from a full board while the search proves one answer). Cut for two citations: the strip's budget "of its own, well under the search's", and "SHALL keep the board only when the solver stops short on it". Scenario "A dealt Unreasonable board needs search and has one answer" dropped; "The smallest boards carry the tier" kept | `engine-difficulty`, "The engine deals the Unreasonable board of a game that searches" (kept only where deduction stops short and the search proves one answer; its first scenario) and "A strip is asked within the engine's dealing budget" (one budget, the same in every game, well under any game's own); `dealUnreasonable`, `src/games/filling/generator.ts:220` |
| Generation: A pasted Filling board opens at the difficulty it needs | retitled "Generation: A Filling board is Easy where the solver and the hint both finish it". Kept: what makes a board Easy and what Unreasonable. The loading rule and the two refusals became a pointer. Scenario "A board with several answers or none is refused" dropped; "A board that needs search opens as Unreasonable" kept | `engine-difficulty`, "A loaded board whose id states no tier takes the lowest tier that solves it" and "A pinned tier is kept or raised and never lowered"; `engine-params`, "A board with a mistake check loads only with exactly one answer". The dropped scenario's two boards (an empty 3×1, `3x1:222`) are in this spec, "Solver: Filling's search assumes each number an empty square can still take", scenario "The search tells one answer from several and from none"; `src/games/filling/filling-tier.test.ts:306` holds the refusals |
| Solver: Filling counts a clue set's answers by a bounded search | retitled "Solver: Filling's search assumes each number an empty square can still take". Kept: what the search runs over and what it assumes where the solver stops. Cut for two citations: counting up to two, the four verdicts, the budget in positions, and "Solve SHALL take the answer from it at either difficulty". Scenario "A spent budget is neither answer" dropped; the other two kept | `engine-difficulty`, "The engine counts a searching game's answers up to two, within a budget of positions" (its scenario "The budget runs out with one answer in hand") and "Solve from the search shows the one answer or says which it lacks"; `searchAnswers`, `src/games/filling/solver.ts:597`, and `solve`, `src/games/filling/index.ts:192` |
| Controls: Filling provides on-screen key labels | removed, with its scenario | `requestKeys: digitKeys(9)`, `src/games/filling/index.ts:401`, which takes no params and so is the same on every board |
| Hint: Filling provides an explained deduction hint | removed. "A step's narration SHALL avoid repeating the region's number" joins "Hint: One region-growth firing is one hint step". Scenario "Hint explains the next forced move and solves the board" dropped | `engine-hints`, "A hint is deduced from the board in play" (true of the plan's first resort only; the departure is kept, see below), "A hint step always names a technique, with no un-narrated fallback", "A player move is classified against the stored plan" and "A hint finishes a board from a right entry made out of order"; that the plan finishes every mistake-free position of a board that loads is this spec's "Hint: Filling's hint keeps what the solver deduces from the clues alone"; the scenario is "The hint walk SHALL cover every preset a game offers" |
| Hint: One region-growth firing is one hint step | gains "A step's narration SHALL avoid repeating the region's number.", from "Hint: Filling provides an explained deduction hint" | |
| Hint: Filling draws the displayed step's target and evidence | retitled "Hint: A Filling target is ringed empty, and is never its own evidence" (the pointer for the marks, rule 2). "`redraw` SHALL render the displayed step", "The deduction's evidence SHALL be marked too, so the picture the narration names is visible" and "The evidence cells' digits SHALL remain readable" cut for a sentence naming `hintMarks`; kept: the ring holds no digit, what the evidence is, and that it never includes a target. Scenario kept | `hintMarks.roles`, `src/games/filling/index.ts:387` (`ring`, `outline`, `stripes`); `engine-hints`, "A hint marks beside the content, never behind it" (the digits stay readable) and "A bound hint step's words SHALL name exactly the marks it draws" |
| Hint: Filling hint color legend | removed, with both scenarios | `hintMarks.roles`, `src/games/filling/index.ts:387`; the palette, `out[COL_HINT] = HINT_ACTION` and `out[COL_HINT_CELL] = HINT_EVIDENCE`, `src/games/filling/render.ts:86` and `:96`; `engine-hints`, "A hint naming several kinds of element colors them by a stable legend" (equivalent forced moves share the one target color) and "A legend color is never the only cue". That the target's ring holds no digit is kept in "Hint: A Filling target is ringed empty, and is never its own evidence" |
| Hint: Filling's hint keeps what the solver deduces from the clues alone | title and both scenarios kept. Its first sentence now opens by naming the rule the fallback departs from ("The plan SHALL depart in one thing from `engine-hints`, "A hint is deduced from the board in play""), which is also the Hint subject's pointer to where the ordinary case, a plan from the player's board, is stated (rule 2; added in review). Nothing cut | |
| Hint: Filling's hint stops where the solver does | one sentence added (rule 2): a finished board or one with a mistake is refused before `hint` is asked, with where that is stated. Nothing cut | |
| Look: Filling flashes when the board is solved | removed, with its scenario | `ts-engine`, "The win flash plays on a forward move that solves the board" (its scenario "The Solve command does not celebrate") |

## Kept, and why

- **Params, the square fallback and "no difficulty letter decodes as Easy".**
  `dims` and `searchTierSegment` say both; kept as what a missing field
  decodes to (upstream's IDs carry no tier).
- **Rules, "It SHALL return an empty result when the search did not prove
  exactly one answer".** No shared requirement says what `findMistakes`
  returns there (see the engine requests).
- **Generation: Filling generates uniquely solvable boards.** The cap on a
  region's size, what Easy means here, and that an Easy board is upstream's
  from the same seed.
- **Generation, "Easy where the solver and the hint finish it".**
  `deductionFinishes`, `src/games/filling/index.ts:203`, asks both.
- **Solver: Filling solver deduces the unique solution.** The four techniques
  and their order are the solver's hand-written loop, and "How many it fills
  MAY depend on the order" is the reason the hint keeps a run from the clues.
- **Controls**, the three kept. `interpretMove`,
  `src/games/filling/index.ts:101`, is hand-written; the game declares no
  `targetVerbs`.
- **Hint: hintKeepTrack follows a Filling step square by square.**
  `hintKeepTrack`, `src/games/filling/index.ts:318`, is hand-written and
  shrinks the step, which no shared verdict does for it.
- **Hint: Filling's hint keeps what the solver deduces from the clues
  alone.** It is Filling's departure from `engine-hints`, "A hint is deduced
  from the board in play", and now says so: where no rule forces a square on
  the player's board, `deduceHintPlan` (`src/games/filling/solver.ts:739`)
  deduces on the clue-only board and takes the first fill the player still
  lacks. That step's deduction does not rest on the player's entries, which
  the engine requirement leaves to the game ("a step drawn from the clues
  alone [is] the game's to state").
- **Hint: Filling's hint stops where the solver does.** As in Palisade: the
  promise to go on from a number entered rightly on an Unreasonable board is
  no shared requirement's.
- **Look: Filling rendering shows regions, errors, and completion.** A list,
  and the one place the error shade's two cases are said.

## Engine requests

The three are stated, each under the same bold name, in `crossing.md`,
`filling.md` and `signpost.md`; Palisade's spec holds the same three
sentences.

- **`findMistakes` returns nothing where the search proved no single
  answer.** Here: "It SHALL return an empty result when the search did not
  prove exactly one answer", in "Rules: Filling reports mistakes for Check &
  Save". Belongs in `engine-difficulty`, "One search answers a board for
  everything that asks", which names `findMistakes` among what reads the
  search and does not say what it returns where the verdict is not one
  answer. No engine code does it: each game's `findMistakes` returns early
  (`src/games/filling/index.ts:215`).
- **A board counts as Easy where the solver and the hint both finish it.**
  Here: "A board SHALL count as Easy where the solver and the hint finish
  it", in "Generation: A Filling board is Easy where the solver and the hint
  both finish it". Belongs in `engine-difficulty`, "A game that searches has
  a tier for each deduction and Unreasonable above them", which says the
  contract asks "the game's deduction" and not that the hint is asked with
  the solver. The code is `hintFinishes`, `src/engine/hint-finishes.ts`,
  called from each game's `deductionFinishes`
  (`src/games/filling/index.ts:203`).
- **The hint never runs the search; on an Unreasonable board it holds only
  what deduction forces from the player's board, and goes on from what the
  player then enters.** Here: "The hint SHALL never run the search. On an
  Unreasonable board its plan SHALL hold the steps its deductions force from
  the player's numbers and no others … It SHALL go on from the numbers the
  player then enters", in "Hint: Filling's hint stops where the solver does".
  Belongs in `engine-hints`, beside "A Search is refused and never narrated"
  (a search's survivor is never a step; it does not say the hint runs no
  search, and "A search certifies a position and never teaches one" lets a
  hint run one) and "A hint finishes a board from a right entry made out of
  order" (binds only a tier with no trial and error). The clause between
  them, that the refusal is the collection's sentence, is already
  `engine-hints`, "Deduction running out on a sound board SHALL have one
  wording". No engine code does it; `src/games/filling/filling-tier.test.ts:317`
  holds it.

## Found

- **The removed "Hint: Filling provides an explained deduction hint" was
  false of an Unreasonable board.** It said that from any mistake-free
  position `hint` deduces steps "that together solve the board"; there the
  plan stops and refuses, as "Hint: Filling's hint stops where the solver
  does" says.
- **The description's clue ceiling and the entry ceiling are two formulas.**
  The parser refuses a clue above `max(w, h, 3)`
  (`src/games/filling/state.ts:173`) and entry refuses a digit above
  `max(w, h)`, or 3 on a 2×2 board (`src/games/filling/index.ts:172`). They
  differ on a board whose longer side is 1 or 2 other than 2×2: a 1×2 board
  loads with a clue of 3, which no region there can be and no key enters.
  A region of 3 does not fit in two squares, so no dealt board is one. The
  spec states each ceiling and not that they differ.
- **`validateParams` refuses an area past `Number.MAX_SAFE_INTEGER` with the
  collection's sentence** (`src/games/filling/state.ts:139`), on a loaded
  board too; the spec does not say so.
- **"The plan SHALL so finish every mistake-free position of a board that
  loads" is false of an Unreasonable board** (found in review). It stands in
  "Hint: Filling's hint keeps what the solver deduces from the clues alone",
  kept as it was, and in the comment above `deduceHintPlan`
  (`src/games/filling/solver.ts:712`), both written when every board that
  loaded was one the solver finishes. An Unreasonable board loads, the
  solver's run from its clues stops short, and the plan ends there
  (`if (fill === undefined) break`, `src/games/filling/solver.ts:742`), as
  "Hint: Filling's hint stops where the solver does" says two requirements
  on. The sentence holds of an Easy board. No player meets it: the hint
  refuses as it should.

## Review

14 rows read, each against the declaration or the requirement it names, read
whole; 1 requirement reworded in the spec and given a row, no sentence
restored, no further sentence cut.

Changed:

- **"Hint: Filling's hint keeps what the solver deduces from the clues
  alone"** now names the rule its fallback departs from. With "Hint: Filling
  provides an explained deduction hint" gone, no requirement of the Hint
  subject said where the plan's ordinary case is stated, and the fallback, a
  step whose deduction rests on the clues and not on the player's numbers,
  was a departure from `engine-hints`, "A hint is deduced from the board in
  play", that the spec did not call one. Read against `deduceHintPlan`: the
  working board is a copy of the player's, the first resort is a rule firing
  on it, the second `recordFills(clues, …)` run once, of which the first fill
  whose square is still empty is taken and narrated by `stepOf` against the
  working board. The requirement stays inside the 500 characters.
- **The engine requests** are worded as Crossing's and Signpost's are, under
  the same three names.
- A `## Found` item added (above), and the "Kept, and why" line for the same
  requirement corrected: it said the spec does not cite the engine
  requirement.

The three sentences were read against `engine-difficulty` and `engine-hints`
as `crossing.md` § "Review" records; none is stated whole by a shared
requirement, and all three stay.

Checked and found sound:

- The 11 engine titles the spec cites resolve, each exactly, and each
  requirement states what its row removed. "A strip is asked within the
  engine's dealing budget" says the budget is "the same in every game and
  well under any game's own", which is the cut "of its own, well under the
  search's"; "The engine deals the Unreasonable board of a game that
  searches" keeps a candidate "only where the game's deduction stops short".
- The marks: `hintMarks.roles` has the ring, the outline and the stripes the
  removed legend requirement named by color constant; `engine-hints`, "A hint
  marks beside the content, never behind it", states that evidence carrying
  content is outlined with its content drawn as without the hint; "A hint
  naming several kinds of element colors them by a stable legend" states the
  one target color. "Ringed with no digit drawn in it" is none of these and
  stays.
- `digitKeys(9)` ends in the Clear key and takes no params, so the removed
  keypad requirement is the declaration whole. The win flash "other than the
  Solve command" is `ts-engine`'s sentence.
- Every line citation of the writer's, 27 of them, lands on the line named;
  the snapshot holds the default and the five other lines.
- No kept requirement holds a further copy by the three classes. The
  scenarios "Every generated board is solvable" and "A wrong fill is flagged
  and clears" read like the collection's and are each their requirement's
  only one.
- Each subject read alone: none hollow, no dangling antecedent, every title
  fits its body.
