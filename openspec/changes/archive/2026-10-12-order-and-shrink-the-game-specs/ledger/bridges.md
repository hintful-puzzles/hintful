# bridges

The Purpose stands: it names nothing the spec no longer holds.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Bridges findMistakes reports every span the unique solution contradicts | "Because a generated board is uniquely solvable, the game SHALL implement `findMistakes`:" cut from the first sentence; "and Check & Save refuses to save" cut from scenario "A wrong bridge is flagged". Third pass: last sentence ("A board that is not uniquely solvable SHALL yield no mistakes") cut | `ts-engine`, "The engine supports an ephemeral, opt-in mistake-checking hook" and "`canCheck` and `check()` reach the mistake hook"; `ts-engine`, "A mistake check compares with the one answer, hidden or not" (no mark flagged against an answer where the solver did not establish exactly one, and the result empty where the game's spec states no broken rule it reports besides; `solveFromScratch(…) === 0`, `src/games/bridges/index.ts:481`) |
| Description: Bridges descriptions encode the island clue grid | third pass: "a run-length letter skips that many empty cells" reworded to "a run letter skips the empty cells between"; scenario kept. Found, mended: removed as a requirement of its own; its sentence and its scenario "A description round-trips" move, unchanged, to "Description: A Bridges description gives its islands row-major, a count above nine as a capital letter" | `engine-params`, "The engine provides the run-letter description grammar" |
| Controls: Bridges input drags bridges between islands | Found, mended: the last sentence cited "Requirement: A secondary drag lowers a Bridges span's limit by one", half a title; it now names "Controls: A secondary drag lowers a Bridges span's limit by one" in quotes. Scenarios untouched | |
| Hint: No Bridges hint step leans on a fact the player cannot see | Found, mended: "(Requirement: Bridges lets the player limit a span)" now reads "("Rules: Bridges lets the player limit a span")", the title whole. Scenario untouched | |
| Description: A Bridges description writes a count above nine as a capital letter | third pass: the clause "and a run of empty squares as a lowercase letter, `a` for one to `z` for twenty-six" cut; the count's characters, the trailing empty squares written, and the scenario kept. Found, mended: retitled "Description: A Bridges description gives its islands row-major, a count above nine as a capital letter"; gains, unchanged, the sentence and the scenario "A description round-trips" of "Description: Bridges descriptions encode the island clue grid", the two having stated one format in two places | `engine-params`, "The engine provides the run-letter description grammar" (`encodeRunLength`, `scanRunLength`, `src/games/bridges/state.ts:759`, `:787`) |
| Params: Bridges params are size, bridge limit, density, expansion, loops and difficulty | replaced by the pointer requirement "Params: Bridges takes its params, their encoding and its label words from its declarations" (rule 2). The field list and the encoding cut, with scenario "Params round-trip". Gains a sentence: what a string that leaves out the tier, the island percentage or the expansion decodes to. Scenario "Invalid params are rejected" moves, unchanged, to "Params: Bridges refuses a tier that so few islands cannot need". Scenario "A short form drops the tier" written | `paramConfig`, `src/games/bridges/state.ts:105`, and the `paramsCodec` field list, `:191` (`dims`, `num` `i` and `e` in the full form, `num "m"`, `flag "L"` with `means: false`, `num "d"` in the full form); `src/engine/__snapshots__/params-stability.test.ts.snap` holds the default, every preset and each field, `15x15i30e10m2d2` and `10x10m2L` among them |
| Params: Bridges refuses to generate Tricky with one bridge per line | reworded: "Generating a Tricky board with `maxb` 1 SHALL be refused with a reason" became "SHALL deal no Tricky board"; "A board already dealt that way SHALL still load" cut. The reason and the scenario kept | `only: { 0: { difficulty: [0, 1] } }` on the `max-bridges-per-direction` item, `src/games/bridges/state.ts:134`; `engine-params`, "The engine refuses a deal that asks for what a deciding field does not leave" ("A board that arrives already written … SHALL NOT be held to it") |
| Params: Bridges refuses a tier that so few islands cannot need | gains scenario "Invalid params are rejected", from "Params: Bridges params are size, bridge limit, density, expansion, loops and difficulty" | |
| Params: A Bridges label says only what departs from two bridges, 30% islands and 10% expansion | removed, with its scenario; the pointer requirement names the label words as `paramConfig`'s | `words: "no loops"` on the `allow-loops` modifier, `src/games/bridges/state.ts:116`, and the `label` of the three fields after it, `:135`, `:151`, `:164`; `engine-params`, "One describer labels every params set" and "The engine builds a modifier's help entry and label words"; the snapshot above holds "10x10 Normal, no loops" |
| Description: A Bridges description that describes no board is refused | the clause "so that `validateDesc` reports with a reason" cut. Found, mended: the scenario "A malformed description is rejected" says the desc is opened and refused, where it named `validateDesc`, no hook of the game, and "a non-null error string" | `engine-params`, "The engine derives a description's verdict from newState" |
| Solver: Bridges solves with a graded multi-stage deductive solver | "SHALL report whether it solved the board" cut; the two sentences made one. Scenario "A generated board is uniquely solvable at its difficulty" dropped, and "A board the stages leave short" written | `engine-difficulty`, "solveAtCap answers with a verdict" and, for the scenario, "A difficulty tier binds the board it generates" (its first scenario). The new scenario is `solveFromScratch` returning 0, `src/games/bridges/solver.ts` |
| Preferences: Bridges auto-marks satisfied islands (fork aid) | "The game SHALL offer an `auto-mark-complete` boolean preference through `Game.prefs`, default on" became "The `auto-mark-complete` preference of the game's `prefs` SHALL be on unless set"; the rest and the scenario kept | `prefs`, `src/games/bridges/index.ts:115` (the key, the name, the type). The default is `newUi`'s, `:111` |
| Preferences: Bridges offers a show-hints preference for possible bridges | "The game SHALL expose a `show-hints` boolean preference through the `Game.prefs` hook" became a clause; what it draws and the scenario kept | `prefs`, `src/games/bridges/index.ts:115`; `ts-engine`, "The engine supports per-game user preferences" |
| Hint: A Bridges hint's ladder is capped at the board's own difficulty | sentence kept. Scenario "Following the plan solves the board at every tier" dropped, and "An Easy board is not handed a harder argument" written | `engine-hints`, "The hint walk SHALL cover every preset a game offers" and "Deduction runs out only where the tier permits search". The new scenario is the cap `state.params.difficulty` handed to the recording pass, `src/games/bridges/hint.ts` (`bridgesHint`) |
| Hint: Bridges hint resumes from the player's marks | sentences kept. Scenario "A hint runs from the player's own bridges" dropped, and "An island the player filled and did not mark" written | `engine-hints`, "A hint is deduced from the board in play" (scenario "A right entry the deduction had not reached"). The new scenario is the seeding loop of `bridgesRecordingPass`, `src/games/bridges/solver.ts:896` |
| Hint: Bridges marks a hint in its own vocabulary | "`redraw` SHALL draw the displayed step's marks from `BridgesHighlights` as the game's own shapes recolored" became "A step's marks SHALL be drawn as the game's own shapes recolored": the marks are painted from the step's words and not from the highlights (see Review); the departure (no mark from `engine/hint-mark.ts`, and why) kept. Scenario "No hint mark is a fill" dropped; scenario "Raising a span leaves the bridges already there in board ink" joined from "Hint: A Bridges hint draws a span as what the step makes of it" | `engine-hints`, "A hint marks beside the content, never behind it" (no primitive fills with a hint color) and "A bound hint step's words SHALL name exactly the marks it draws" |
| Hint: A Bridges hint draws a span as what the step makes of it | removed. Its scenario moves, unchanged, to "Hint: Bridges marks a hint in its own vocabulary" | the legend's `ring` role, `src/games/bridges/index.ts:567` (bridges to add in the hint color, a bridge already there in the board's ink, the pair of crosses, the `≤1`); the palette's `COL_HINT`, `src/games/bridges/render.ts` |
| Hint: A Bridges hint recolors an island's rim and clue digit | gains scenario "A hint explains an island with exactly enough room left", from "Hint: Bridges explains each forced deduction" | |
| Hint: Bridges explains each forced deduction | retitled "Hint: A Bridges hint refuses where its deduction contradicts itself". First sentence cut; the refusal kept. Scenario "A hint explains an island with exactly enough room left" moves, unchanged, to "Hint: A Bridges hint recolors an island's rim and clue digit"; scenario "A contradiction with no entry to blame" written | `engine-hints`, "A hint is deduced from the board in play" and "A hint step always names a technique, with no un-narrated fallback". The new scenario is `pass.impossible()` in `bridgesHint`, `src/games/bridges/hint.ts`, and the comment above it. Third pass: "SHALL refuse with the collection's unlocalized-contradiction wording" cut to what is Bridges' own, taken from its scenario and reworded to stand ("`hint` SHALL refuse outright and SHALL show no step it derived on the way"); scenario kept: `engine-hints`, "A contradiction no entry can be blamed for is refused as one to undo" (the refusal is `CONTRADICTION_UNLOCALIZED`; whether the steps deduced first are given is the game's) |

## Kept, and why

- **Rules: Bridges findMistakes reports every span the unique solution
  contradicts.** The three ways a span is wrong, and the island marked too
  soon, are in no shared requirement.
- **Params: Bridges refuses to generate Tricky with one bridge per line.** The
  refusal is the declaration's and the engine's; why no such tier exists is in
  no declaration but a comment.
- **Params: Bridges refuses a percentage past its last choice when dealing.**
  `validateParams`, and the gap between the engine's check of a choices field
  and the game's is this game's alone.
- **Generation, the three tier requirements.** What each tier means here.
- **Solver, "purely deductive … SHALL NOT guess and verify".**
  `engine-difficulty`, "Only a tier named Unreasonable requires Search", is a
  rule about a tier's name; that this solver has no trial in it at any tier is
  not said there.
- **Controls, all four.** `interpretMove` is hand-written; Bridges declares no
  `targetVerbs`.
- **Preferences, what each preference draws, and "on unless set".** `prefs`
  holds the key and the name only.
- **Hint: A Bridges hint step is followed one drag at a time.** Hand-written
  (`bridgesKeepTrack`), with rules of its own: a count is progress toward the
  step's, a span is taken from either end, a limit is judged by what the drag
  leaves.
- **Hint: Bridges hint resumes from the player's marks.** Which marks the plan
  rests on, and the seeding of complete islands, are the game's to state
  (`engine-hints`, "A hint is deduced from the board in play").
- **Hint: A Bridges hint recolors an island's rim and clue digit.** The legend
  says an island is recolored; never both colors, the action color only where
  the sentence names it, and a group marked alike are rules the legend does
  not hold.
- **Hint: A Bridges hint asks its stages in order after every step.** The
  order is the solver's ladder (`src/games/bridges/solver.ts:798`);
  `hintRungs` lists premises.

## Engine requests

- Answered: `engine-hints`, "A contradiction no entry can be blamed for is
  refused as one to undo". Tracks' `PUZZLE_NOT_REASONABLE` is another
  situation, which no requirement states, and `deduceHintPlan` has no
  `"broken"` status: Bridges reads its recording pass's `impossible()`
  (`ledger/_engine.md`, "Third round: hints and colors", "Found").
  A deduction that contradicts itself on a board `findMistakes` passes is
  refused with the unlocalized-contradiction wording → `engine-hints`. The
  sentence is "Where the deduction contradicts itself on a board
  `findMistakes` finds nothing wrong with, `hint` SHALL refuse with the
  collection's unlocalized-contradiction wording", in "Hint: A Bridges hint
  refuses where its deduction contradicts itself". `engine-hints`, "The
  refusals distinguish the situations a player must tell apart", states it by
  its scenario only. The code is `CONTRADICTION_UNLOCALIZED`,
  `src/engine/hint-refusal.ts`, and the `"broken"` status of
  `deduceHintPlan`, `src/engine/hint-plan.ts`. Tracks answers the same
  position with `PUZZLE_NOT_REASONABLE` (see Found), so the home would also
  settle which.

## Found

- **Tracks and Bridges refuse the same position in different words.** A
  deduction that contradicts itself on a board the mistake check passes is
  `CONTRADICTION_UNLOCALIZED` in Bridges (`src/games/bridges/hint.ts`,
  `bridgesHint`) and `PUZZLE_NOT_REASONABLE` in Tracks
  (`src/games/tracks/hint.ts`, `tracksHint`). In both it is reached only on a
  board the game's own solver cannot finish, which does not load, so no player
  meets either.
- **The spec said `redraw` draws a step's marks from `BridgesHighlights`.**
  The renderer reads the step's words (`stepMarks`,
  `src/games/bridges/render.ts:850`) and takes from the highlights what is not
  a mark, as `engine-hints`, "A bound hint step's words SHALL name exactly the
  marks it draws", requires. The clause went with the cut.
- **The spec never says what a short params string decodes to.** The short
  form drops the tier, the island percentage and the expansion, so `10x10m2L`
  is an Easy board whichever preset it was the short form of. The pointer
  requirement's scenario now gives the case.
- **"Description: Bridges descriptions encode the island clue grid" says
  nothing that "Description: A Bridges description writes a count above nine
  as a capital letter" does not**, but its round-trip scenario. A second copy
  inside the spec, left as it stood.
- **"Controls: Bridges input drags bridges between islands" cites another
  requirement by "Requirement:" and half its title** ("A secondary drag lowers
  a Bridges span's limit by one" is under `Controls:`), as "Hint: No Bridges
  hint step leans on a fact the player cannot see" does.

## Review

15 rows read, each against the declaration or the requirement it names; 3
corrected.

Changed:

- **"Hint: Bridges marks a hint in its own vocabulary" corrected to the
  code.** As it stood it said `redraw` draws a step's marks from
  `BridgesHighlights`. `hintWords` takes every mark from the step's words
  (`stepMarks`, `src/games/bridges/render.ts:850`) and reads the highlights
  only for which outlined island is the sentence's focus (`:859`), data that
  is not a mark. The cut had put "the roles `hintMarks` declares" in its
  place, a pointer inside a subject with a dozen requirements of the game's
  own; the sentence now says only what is Bridges': the marks are its own
  shapes recolored, and none comes from `engine/hint-mark.ts`.
- **The Tricky refusal's citation taken out.** "which its bridge-limit field
  declares and the engine refuses for a deal alone (`engine-params`, …)" was
  the copy with a citation. The sentence now reads "SHALL deal no Tricky
  board, because …": "deal" keeps the qualifier, and the scenario keeps that
  a written board loads.
- **The Params pointer says what a missing piece decodes to**, in place of "A
  piece left out SHALL be read as "A params string is read whole or refused"
  has it", a second citation that named no capability. The codec starts from
  `defaultParams` (`src/games/bridges/state.ts:191`), whose tier, island
  percentage and expansion are Easy, 30 and 10 (`:82`); the snapshot holds
  the default as `7x7i30e10m2d0`. "written after `d` as its number from 0"
  cut: a pointer lists no letters, and it is `num "d"` in the field list.
- **The engine request reworded** to stand beside the other ledgers'. It is
  not stated: `engine-hints`, "The refusals distinguish the situations a
  player must tell apart", requires that the set of refusals tell the
  situation apart and gives the game's duty only in its scenario.

Checked and found sound:

- The eleven engine titles the rows and the spec cite are exact, and each
  states what its row removed. `only: { 0: { difficulty: [0, 1] } }`
  (`state.ts:134`) with "The engine refuses a deal that asks for what a
  deciding field does not leave" covers the refusal and the board that still
  loads.
- The legend's `ring` role (`index.ts:567`) states all of the removed "Hint: A
  Bridges hint draws a span as what the step makes of it": the added bars in
  the hint color, the bars already there in the board's ink, the crosses.
- The two preference requirements keep their keys (`show-hints`,
  `auto-mark-complete`) and the default; only "boolean … through
  `Game.prefs`" went.
- The new scenarios against the code: the hint's cap is
  `state.params.difficulty` (`hint.ts:232`) and the one Easy technique is
  `stage1-arithmetic` (`solver.ts:798`); `solveSub` returns 0 on a board its
  stages leave short (`:833`); the seeding loop is at `:896`; the refusal is
  `pass.impossible()` (`hint.ts:248`).
- The scenario "A short form drops the tier" run through the codec:
  `10x10m2L` decodes as a 10×10 board with two bridges a line, no loops, 30%
  islands, 10% expansion and Easy, and encodes in full as `10x10i30e10m2Ld0`;
  `10x10i30e10m2Ld1` has the short form `10x10m2L`.
- The spec read whole, subject by subject: none hollow, no dangling
  antecedent, every title fits its body.

## Third pass

Rows of the engine's third-round tables that name Bridges: 3 to act on (the
mistake check, the run-letter grammar, the unlocalized contradiction), and
two that read its code only (every step before it refuses; the bare flag,
which Bridges was not found to state). Engine requests of its own: 1,
answered. Sentences cut: 4. Clauses kept: 5.

- **Cut**: the empty mistake check; "that many" of the run letter in one
  `Description` requirement and "`a` for one to `z` for twenty-six" in the
  other; the unlocalized-contradiction wording.
- **Kept: "shows no step it derived on the way"**, raised from the scenario
  into the sentence: the engine requirement leaves to the game whether the
  steps deduced before the contradiction are given, and the review of the
  round says the clause stays. Where the refusal is reached (a board
  `findMistakes` finds nothing wrong with) stays as its condition.
- **Kept: the counts' characters, `1` to `9` and `A` to `G`, the refusals,
  and that the empty squares after the last island are written**
  (`keepTrailingBlanks`, `src/games/bridges/state.ts:766`).
- **Kept: the three ways a span is wrong and the island marked complete too
  soon.** The island's mark is compared with the solved board like a span's
  and is not reported without an answer, so it is no broken rule reported
  besides.
- **Kept: "Hint: A Bridges hint step is followed one drag at a time".**
  `bridgesKeepTrack` is the game's own and not `trackTargets`: a count is
  progress toward the step's, a span is taken from either end.
- **Kept: the ladder capped at the board's own difficulty**, which the engine
  ledger finds no rule of the collection.
- The spec never says the hint refuses where deduction runs out, so "A hint
  gives every step deduction still forces before it refuses" had nothing to
  take.
- No "no departure" sentence and none on what a pasted game ID opens as.

## Found, mended

- Tracks and Bridges refuse one position in different words: left: no player
  meets either, the board being one that does not load, and the third pass
  cut Bridges' wording of it.
- The spec said `redraw` draws a step's marks from `BridgesHighlights`: left:
  the review corrected "Hint: Bridges marks a hint in its own vocabulary".
- What a short params string decodes to: left: the review stated it in the
  `Params` pointer, with the scenario "A short form drops the tier".
- Two `Description` requirements stated one format: made one. The sentence
  and the round-trip scenario of "Description: Bridges descriptions encode
  the island clue grid" join "Description: A Bridges description writes a
  count above nine as a capital letter", retitled for both.
- Two requirements cited another by "Requirement:" and half its title: each
  now gives the title whole, with its subject, in quotes.
