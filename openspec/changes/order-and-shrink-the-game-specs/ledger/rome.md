# rome

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Rome is complete when every arrow leads to a goal | sentence untouched; "and flashes" reworded out of the scenario | `ts-engine`, "The win flash plays on a forward move that solves the board"; Rome declares no `flashLength` |
| Rules: Rome mistake-checking covers arrows and marks that break no rule | title kept. Sentence 1 (an arrow that contradicts the unique solution though it breaks no rule) and the first half of sentence 2 (re-derived from the fixed clues alone) replaced by one that names the two shared requirements and keeps "separately from the rule violations" and that the solution is the solver's from the fixed clues; the last clause (nothing reported where the board is not deducible) cut (third pass). Scenario untouched | `ts-engine`, "A mistake check compares with the one answer, hidden or not" (a wrong entry; no mark flagged against an answer where the solver did not establish exactly one; a broken rule reported besides is the game's to state, which "Rules: Mistake-checking reports the rule violations the board shows" does); `engine-hints`, "Check & Save names a wrong entry in every game" ("whether or not the entry breaks a rule"); `ts-engine`, "A candidate note that excludes the answer is a mistake" ("never from anything the player has entered") |
| Rules: Marks that rule out the answer are a mistake | removed | `ts-engine`, "A candidate note that excludes the answer is a mistake" (a non-empty set that excludes the answer is reported; its first scenario is the dropped one). The `note` kind and the empty set left alone: `entryMistakes`, `src/engine/entry-mistakes.ts:46`, called at `src/games/rome/index.ts:640`. The requirement above now names the shared one |
| Params: Rome's parameters | removed; one sentence that sends the reader to `paramConfig` and the codec, and says what the params are, joins "Params: A Rome params string is its declared codec's, and one with no difficulty letter is Easy". Scenario "A game ID round-trips through the parameters" dropped | the fields and the bounds (width and height at least 3): `paramConfig`, `src/games/rome/state.ts:356`-`362`; a difficulty within range: `engine-params`, "Params validity is the engine's check" (Rome has no `validateParams`); the encoding: `paramsCodec(defaultParams, [dims, choice "d" over "ent", full])`, `state.ts:365`-`368`; the square fallback: `engine-params`, "The codec grammar is a prefix, tagged segments, flags and letters"; the round trip: `engine-params`, "A game declares its params encoding once, and both codec halves are derived" |
| Params: A Rome params string with no difficulty letter is Easy | retitled "Params: A Rome params string is its declared codec's, and one with no difficulty letter is Easy". Gains the pointer sentence; sentence 1 kept; sentence 2 (a `d` with another letter is refused) cut. Scenario "A string with no letter" untouched; "A letter that is no difficulty" dropped | `engine-params`, "A params string is read whole or refused" and "The engine makes the one refusal of a params string" (its first scenario is the dropped one with another game's string). The `rome` entry of `src/engine/__snapshots__/params-stability.test.ts.snap` holds `4x4de`, `4x4dn`, `4x4dt` and `4x4` |
| Description: Rome descriptions use the region-border and clue encoding | third pass: removed. Sentence 1 (the wall list: a number for a run of walls, a letter for a run of non-walls, `z` with no trailing wall) cut; sentence 2 (the clue grid's letters, and `U`, `D`, `L`, `R`, `X`) joins "Description: A Rome description is the walls, a comma, then the clues"; its scenario "A generated description round-trips" moves, unchanged, to that requirement | `engine-params`, "The engine provides the wall-list description grammar". Rome's calls: `encodeRegionWalls` and `readRegionWalls`, `src/games/rome/state.ts:468`, `:440` |
| Description: Rome rejects a description that breaks its shape | third pass: "that uses invalid region-border characters" reworded out of the one sentence; the clue characters, the region of more than four cells and the goal's region kept. Scenario untouched | `engine-params`, "The wall-list reader refuses a run that passes the last border" (a character that is neither a digit nor a lowercase letter, naming it) |
| Description: A Rome description is the walls, a comma, then the clues | third pass: title kept. Sentences 1 and 2 (which borders the list covers and in what order; `a`–`y` as open borders and a wall) replaced by a pointer to the engine's wall list (the subject's one statement of how the areas are written); the comma and the clue grid kept, with the clue characters from the requirement above; "either part running past its count" cut to the clue grid's half. Gains the scenario "A generated description round-trips"; its own two scenarios untouched | the list: `engine-params`, "The engine provides the wall-list description grammar"; a wall run past the last border: `engine-params`, "The wall-list reader refuses a run that passes the last border". The clue grid's overrun is Rome's: `readBoard`, `state.ts:450` |
| Generation: Rome's generator keeps every board soluble at its tier | removed. Retitled "Generation: A Rome board keeps the collection's promise at its tier" by the cut, its sentence replaced by one that named the two shared requirements and said the game departs from neither; the third pass removed that requirement, "Generation: Rome's rules are met in one order, Easy first" saying which rules each of Rome's tiers holds. Scenario "Every preset produces a soluble board" dropped; "A Tricky board needs the Tricky rule", written in words for the pointer, dropped with it | `engine-difficulty`, "Every tier promises one solution found at its cap" and "A difficulty tier binds the board it generates" (both directions). The gate: `src/games/rome/generator.ts:212` |
| Hint: Rome explains its next deduction | retitled "Hint: Rome's hint is the candidate walk's, started on the implicit reading". "SHALL provide an explained `hint()` that narrates the next forced move by the premise that forces it" replaced by a pointer to the walk and the legend; "in Rome's own vocabulary of arrows, squares and areas" kept. Gains the implicit-reading sentence and the scenario "A board with no marks and no stored preference" from "Hint: Rome's hint pencils marks in only as a step needs them". Scenario "A hint can be followed to a finished board" dropped | `engine-candidate-hints`, "A shared candidate-elimination hint plan"; `engine-hints`, "A hint step always names a technique, with no un-narrated fallback". The scenario: `engine-hints`, "The hint walk SHALL cover every preset a game offers" (following hints solves the board from any reached position) and "A displayed hint step never references already-resolved state" |
| Hint: A Rome hint rests on what the player can see or mark | removed | `engine-hints`, "A hint relies only on marks the player can make" (sentence 1), "The engine SHALL own the hint mark roles and the words for them" (outline for what a step reasons from, stripes for a region named) and "A hint marks beside the content, never behind it" (ringed and not filled; its first scenario is the dropped one). Rome's legend: `hintMarks`, `index.ts:706`-`714` |
| Hint: A walk in a Rome hint is numbered square by square | title kept. "the chain SHALL be outlined in order, numbered, so the claim the sentence makes is one the player can follow square by square" and "The chain SHALL be computed rather than assumed." replaced by a citation; what is Rome's (the premise is an arrow chain leading back to the square being struck) kept. Scenario untouched | `engine-candidate-hints`, "A premise that asserts a walk is computed and numbered" |
| Hint: Rome's hint pencils marks in only as a step needs them | removed. "the hint SHALL read a square with no marks as holding every arrow its area has not used that does not point off the grid", the `implicit` default and the scenario "A board with no marks and no stored preference" (unchanged) move to "Hint: Rome's hint is the candidate walk's, started on the implicit reading". "Rome SHALL offer the shared `hint-notes` preference" and "SHALL pencil marks in only where a step needs them" cut | `candidateReadingPref()` in `prefs`, `index.ts:742`, whose key and choice order are the engine's (`src/engine/pencil-prefs.ts:59`-`62`) and held by tests: `src/engine/candidate-reading.test.ts:235` reads the key `hint-notes` off every game that carries a reading, and `src/engine/midend-prefs.test.ts:176` sets it to choice 1 for the populate reading; `engine-candidate-hints`, "A candidate hint plan reads an unmarked cell the way the player chose" (a game on the walk offers the choice through `hint-notes`; no fill-all under `implicit`) and "The implicit reading writes the notes a firing rests on" |
| Look: What Rome draws | "There SHALL be no interpolated arrow animation." cut; "and a completion flash" reworded out of the list (second pass). Scenario "An arrow appears at once" dropped; "The player repeats a fixed arrow" written from the renderer | `animLength: () => 0`, `index.ts:751`. The flash: this spec's "Look: Rome's completion flash sweeps the board", and `ts-engine`, "The win flash plays on a forward move that solves the board". The new scenario: `src/games/rome/render.ts:304`-`313` |
| Look: Rome's completion flash sweeps the board | title kept. "sweep the board's squares from the bottom left to the top right" replaced by a citation of the collection's sweep; "a lit square SHALL be filled with a flash color in place of its surface and keep what it holds" cut (review made it a citation, and the second pass took the citing clause out); the hidden selection kept. Scenario "The flash moves" dropped; "The selection through the flash" kept | `ts-engine`, "A game gives each element a position, and the route is which position it gives" (`sweepStep`: a diagonal from the bottom left to the top right); `flash.win(sweepStep(x, y))`, `render.ts:406`. The lit square: `engine-colors`, "A solved flash drawn as a color takes a shared color" (the ground of a cell filled with the role's color, keeping what it holds, and never by lifting or swapping a surface); `winHighlight`, `render.ts:406` |
| Controls: A tap that commits no move selects the square | title kept. "it selects that square, a second tap on the selected square puts the highlight away, and the highlight shows only where the mode could write" replaced by a citation (review); the reason and which tap commits a move kept. Scenario "A second tap on the selected square" dropped; the other three untouched | `engine-notes`, "A game whose press starts a drag joins the note-taking cell through its tap" (a release that commits nothing resolves through the engine's press arm; Rome is named), "A game that joins through its tap is a full member of the mechanic" (its first scenario is the dropped one) and "The highlight is shown only where its mode could write"; `tapNoteTakingCell`, `index.ts:447` |

## Kept, and why

- **Rules: Mistake-checking reports the rule violations the board shows.** A
  departure: the shared check compares with the answer, and Rome's reports
  what the board already draws as well.
- **Params: … one with no difficulty letter is Easy**, "SHALL give Easy". It
  is what `defaultParams` holds (`state.ts:344`) and the promise an old link
  depends on.
- **Generation: Rome's rules are met in one order, Easy first.** The order is
  the ladder's (`romeLadder`, `src/games/rome/solver.ts`), a list written by
  hand and run by the fixpoint, not `hintRungs`.
- **Controls: Rome fills and cleans candidate marks in one press.** The press
  is `engine-notes`, "Mark-all is adaptive in a game with an obvious-candidate
  rule"; which arrows a square can hold, and that the fill, the solver and
  the hint share that set, is Rome's.
- **Controls: Rome offers one key per arrow, and a Clear key.** `requestKeys`
  returns a list written out by hand (`ARROW_KEYS`, `index.ts:213`).
- **Controls: A tap that commits no move selects the square**, the scenario
  "A notes-mode tap on a square holding an arrow". The shared rule hides the
  highlight where the mode cannot write; that a square holding an arrow takes
  no marks is Rome's (`canMark`, `index.ts:451`). Which taps commit a move is
  Rome's too.
- **Look: Rome's completion flash sweeps the board**, the hidden selection.
  `engine-notes`, "A game keeps what is its puzzle's in the highlight's
  picture" hands "a completion flash that hides the highlight" to the game.
- **Preferences: Rome's two highlight preferences.** A copy of `prefs`
  (`index.ts:721`-`738`) and of `newUi`'s defaults, kept: the keys `goal` and
  `loop` are what a stored preference is read back by, and no test holds
  them.
- **Hint: The hint's recorder changes nothing the solver decides.** The
  shared rule (`engine-hints`, "The solver and the hint are two projections
  of one deduction engine") does not give Rome's reason: every published
  description depends on the solver's verdict on each clue set.
- **Look: The selected square is drawn with the note-taking cell's picture**,
  first sentence. It is the pointer the `?` sentence hangs on.

## Engine requests

- Answered: `ts-engine`, "A mistake check compares with the one answer,
  hidden or not". The sentence is cut; it was also wider than the code, which
  reports a broken rule whether or not the board deduces, as the rule
  requirement says.
  "When the board is not deducible from those clues no contradiction SHALL
  be reported.", in "Rules: Rome mistake-checking covers arrows and marks
  that break no rule". Solo says the same of an ambiguous board. Belongs in
  `ts-engine`, beside "A mistake check compares with the one answer, hidden
  or not". Each game returns early itself (`index.ts:635`).
- Answered: `engine-params`, "The engine provides the wall-list description
  grammar" and "The wall-list reader refuses a run that passes the last
  border". The sentences are cut.
  The wall list: "a decimal number for a run of walls and a letter for a run
  of non-walls, with the letter `z` denoting a maximal run with no trailing
  wall", in "Description: Rome descriptions use the region-border and clue
  encoding", and the first two sentences of "Description: A Rome description
  is the walls, a comma, then the clues" (which borders the list covers and
  in what order, and that `a`–`y` ends in a wall). Seismic states the same
  grammar in "Description: A wall-list letter is a run of open borders and
  the wall that ends it". Belongs in `engine-params`, beside "The engine
  provides the dot-run description grammar". `encodeWallRuns`,
  `readRegionWalls` and `encodeRegionWalls`, `src/engine/wall-runs.ts`.

## Found

- **"Generation: Rome's rules are met in one order, Easy first" and "Solver:
  Rome's solver deduces and never guesses" say the same of the tiers'
  rules**, one under each subject; the first also says the hint records the
  solver, which is `Hint`'s. Left.
- **The spec does not say why Rome departs from the `populate` convention**,
  which `engine-candidate-hints`, "A game states the reading it starts on"
  asks of a game that overrides it. The reason is the comment at
  `index.ts:169`.
- **A square reported for a rule violation is not reported again by the
  answer check** (`fixed`, `index.ts:647`), so a duplicated arrow that is
  also the wrong one is a `double` and never a `cell`. The spec says
  "separately" and not this.

## Review

Rows read: 12. Rows corrected: 1 (the flash). Rows added: 1 (the tap).

- **Look: Rome's completion flash sweeps the board.** The writer kept "a lit
  square SHALL be filled with a flash color in place of its surface and keep
  what it holds" and asked for an engine home. `engine-colors`, "A solved
  flash drawn as a color takes a shared color" states all of it: the ground of
  a cell is filled with the role's color, keeps what it holds, and is lit no
  other way. The clause is now a citation and the request is removed.
- **Controls: A tap that commits no move selects the square.** What the tap
  does to the selection (selects, a second tap puts the highlight away, shown
  only where the mode could write) is three `engine-notes` requirements, the
  first of which names Rome. Cut to a citation, with the scenario that is the
  shared requirement's own.
- **Engine request added: the wall list.** Rome and Seismic read and write it
  through one engine module and each spec states the grammar; no capability
  does (a search of `openspec/specs/` for the module's helpers and for "wall
  list" finds only the two games' specs). The sentences stay.
- **Engine request kept: no contradiction where the clues are not
  deducible.** `ts-engine`, "The engine supports an ephemeral, opt-in
  mistake-checking hook" and "A mistake check compares with the one answer,
  hidden or not" assume the answer exists; `engine-params`, "A board loads
  only if the game's own solver solves it" keeps such a board from loading
  and says nothing of the check. Not stated.
- **Sound, each opened and compared clause by clause**: the two `ts-engine`
  mistake requirements and `engine-hints`, "Check & Save names a wrong entry
  in every game"; the params rows against `paramConfig` (`min: 3`,
  `difficultyItem`) and the codec (`dims`, `choice` `d`, full only), with no
  `validateParams` in the game and `4x4`, `4x4de` in the snapshot; the
  generation gate at `generator.ts:212` against both `engine-difficulty`
  titles; the five `engine-candidate-hints` and four `engine-hints` titles of
  the hint rows (the hint is `runCandidatePlan`, `hint.ts:253`;
  `candidateReading: "implicit"`, `index.ts:173`); `animLength`; the new
  scenario "The player repeats a fixed arrow" against the ink choice at
  `render.ts:304`-`313` (a fixed arrow's ink is chosen before the error
  color). Every cited title is exact.
- **Kept on reading the rest**: "Preferences: Rome's two highlight
  preferences" (no test reads `goal` or `loop` by its key, and Loopy's ledger
  keeps its keys on the same ground); "Hint: The hint's recorder changes
  nothing the solver decides" (its first sentence is the antecedent of the
  second); the hand-written key list, the keyboard arm and the digit keys;
  the three Look requirements on the surface, the outline and the goal, which
  say which shared role Rome gives to what.

## Second pass

Citing sentences read: 7, one of them with two citing clauses. Removed: 1
clause. Kept as the subject's one pointer: 6. Kept as a departure: 1 clause.

- **Removed.** "and a lit square SHALL be painted as the collection paints
  one (`engine-colors`, …)", in "Look: Rome's completion flash sweeps the
  board". `Look` says plenty of Rome's own and the clause was the copy with a
  citation attached. Row corrected.
- **Removed in passing**, not a citing sentence: "and a completion flash",
  from the list of "Look: What Rome draws". The flash has a requirement of
  its own two below, and Solo's and Salad's lists lost the same words in
  review. Row corrected.
- **Kept as a departure.** The sweep clause of the same sentence:
  `ts-engine`, "A game gives each element a position, and the route is which
  position it gives" hands the route to the game, and the sweep is Rome's
  choice of one.
- **Kept as a pointer.** `Rules`, the answer check (with "separately from
  the rule violations", which is Rome's); `Params`, the codec sentence;
  `Generation`, "A Rome board keeps the collection's promise at its tier"
  (the subject's other requirement gives the order of the solver's rules and
  nothing of what a dealt board promises); `Controls`, the tap that joins
  the note-taking cell; `Hint`, the walk and the legend; `Hint`, the
  numbered walk, which is the only requirement that gives the loop strike's
  premise and cites how a walk is shown, a concern the legend's pointer does
  not cover.
- **Preferences.** The cut removed "Rome SHALL offer the shared `hint-notes`
  preference". The key and its choice order are the engine's declaration and
  two tests hold them; the row now names both. `goal` and `loop` stand in the
  spec.
- Each subject read alone after the edit: none is a fragment, and every
  title fits its body.

## Third pass

Rows of the engine's third-round tables that name Rome: 3 (the mistake
check, the wall-list grammar, the wall-list reader's refusal). Engine
requests of its own: 2. Cut: 5 sentences, 2 clauses and 1 scenario, in 5
requirements, 2 of which are gone. Clauses kept: 6.

Cut (the rows above say where each is stated):

- **"Rules: Rome mistake-checking covers arrows and marks that break no
  rule"**: "When the board is not deducible from those clues no contradiction
  SHALL be reported."
- **"Description: Rome descriptions use the region-border and clue
  encoding"**: the wall list's sentence. The requirement is gone, its clue
  sentence and its scenario joined to the one below.
- **"Description: A Rome description is the walls, a comma, then the
  clues"**: its first two sentences, and the wall half of "either part
  running past its count".
- **"Description: Rome rejects a description that breaks its shape"**: "that
  uses invalid region-border characters". The engine's table does not name
  this clause; the reader's requirement states the refusal of a character
  that is neither a digit nor a lowercase letter.
- **"Generation: A Rome board keeps the collection's promise at its tier"**,
  whole, with the scenario written for it. The second pass kept it as the
  subject's pointer; under the third pass's one rule it goes, the subject's
  other requirement saying which rules each of Rome's tiers holds.

Kept:

- **The pointer to the engine's wall list** in "Description: A Rome
  description is the walls, a comma, then the clues": `Description` is owed,
  and without it the subject says nothing of how the areas are written. One
  pointer, for the one concern.
- **The comma, the clue grid's characters and runs, and the refusal of a
  missing comma and of a clue grid past its count**: what follows the list is
  the game's to read.
- **The scenario "A dealt 4×4 board"**, which reads a wall list: a case of
  this game's description, both halves.
- **"Rules: Mistake-checking reports the rule violations the board shows"**:
  the broken rules Rome reports with an answer or without, which the engine
  requirement leaves to the game.
- **The first sentence of the answer check**, with "separately from the rule
  violations": Rome's, as the second pass found.
- **"with no departure from the codec grammar and no refusal of the game's
  own"** in `Params`: the subject's one pointer, the rest being what a string
  with no `d` decodes to.

Rome records at every tier whatever the board states, and its spec says
nothing of a cap, so the recording-solve row has nothing here. No sentence of
the form "What a pasted game ID opens as". The spec was searched for the
third round's other rules in other words (the wash over a square's surface,
an arrow moving the highlight, where Rome's arrows are actions of its own, a
sentence that leads with the indication): none is stated as a copy.

Each subject read alone: no fragment, no dangling pronoun, every title fits
its body, and the Purpose names nothing that went.
