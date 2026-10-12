# salad

Purpose (third pass): "what its two difficulties and its generator promise"
reworded to "what its two difficulties hold", the sentence on what a dealt
board promises having gone.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Salad has two game modes | sentence untouched. Scenario "Every preset produces a uniquely-solvable board" dropped; "Where each mode carries its clues" written from two descriptions this spec already holds | `engine-difficulty`, "Every tier promises one solution found at its cap"; `engine-params`, "Every default and preset passes validation for generation" |
| Rules: Salad flags mistakes against the unique solution | retitled "Rules: Salad checks its markers as well as its symbols and notes against the answer". "flag mistakes on demand", "re-solve from the fixed clues and report every player entry that contradicts the unique solution: a wrong symbol" and the note sentence replaced by one that names the two shared requirements; the two marker cases kept, and "the note that a square might be empty is a candidate like any other" said in place of the note sentence. Scenario "Check flags a contradicting entry" dropped; "A ball on a square that stays empty" written in words | `ts-engine`, "A mistake check compares with the one answer, hidden or not" and "A candidate note that excludes the answer is a mistake" (the note rule; the answer from what the puzzle fixes). `findMistakes`, `src/games/salad/solver.ts:511` |
| Rules: Salad is solved when every line and every border clue is satisfied | "and SHALL flash" reworded out of the sentence, and "and flashes" out of the scenario | `ts-engine`, "The win flash plays on a forward move that solves the board" ("A game SHALL NOT give it a length"); Salad declares no `flashLength` |
| Params: Salad's parameters | removed. Its sentence "`validateParams` SHALL refuse a `nums` that is not less than `order`" joins "Params: A Salad params string is its declared codec's, and one with no mode letter is ABC End View", reworded to name the fields in words, and its scenario "As many symbols as the size" moves there, unchanged. Scenario "A game ID round-trips through the parameters" dropped | the four fields and the bounds (size at least 3, symbols 2 to 9): `paramConfig`, `src/games/salad/state.ts:139`-`154`; the round trip: `engine-params`, "A game declares its params encoding once, and both codec halves are derived" (its scenario) and "Encode and decode are mutual inverses over the corpus" |
| Params: Salad's menu offers both of its difficulties | retitled "Params: Salad's Normal presets are the shapes that deal quickly". Sentence 1 (boards at each difficulty, and why) and sentence 3 (a shape's Normal follows its Easy) cut (second pass: the pointer to `presets` and the shared rule that had replaced them went); sentence 2 kept, opening "Salad's Normal presets". Both scenarios dropped; "A shape that is slow at Normal" written from the preset list | `PRESETS`, `state.ts:109`-`125`; `engine-params`, "A board's tiers are one run of lines, and every tier is offered" (every tier on the menu in each ruleset; one board's lines consecutive from its first tier). `src/games/salad/salad.test.ts:126` holds the Normal lines |
| Params: Salad params are a size, n, a symbol count and a mode letter | retitled "Params: A Salad params string is its declared codec's, and one with no mode letter is ABC End View". Sentence 1 (the encoding letter by letter) replaced by the pointer to `paramConfig` and the codec; sentence 2 (no mode letter is ABC End View, no `d` is Easy) kept; sentence 3 (a `d` with another letter is refused) cut; gains the `validateParams` sentence and "As many symbols as the size" from "Params: Salad's parameters". Scenarios "A Number Ball preset" and "A string with no difficulty" untouched; "A letter that is no difficulty" dropped | `paramsCodec(defaultParams, [size, num "n", letters ["L", "B"], choice "d" over "ex", full])`, `state.ts:158`-`163`; `engine-params`, "The codec grammar is a prefix, tagged segments, flags and letters" (names Salad's `L` and `B`). The refusal and its sentence: `engine-params`, "A params string is read whole or refused" and "The engine makes the one refusal of a params string" (its first scenario is the dropped one with another game's string). The `salad` entry of `src/engine/__snapshots__/params-stability.test.ts.snap` holds `5n4Bdx`, `5n4B`, `4n3Lde` and `4n3L` |
| Params: Salad refuses two symbols at Normal where no board has it | last sentence ("A board that arrives with its description SHALL NOT be refused for this") cut (second pass: the citing sentence that had replaced it went); sentence 1 opens "When a board is to be dealt", so the qualifier stands, and the first scenario still gives the described board's case. Scenarios untouched | `engine-difficulty`, "An unbindable tier is refused, not silently downgraded" ("The refusal SHALL apply to generation only, so that a saved game or a game ID carrying its own description still loads"); `validateParams` reads `full`, `src/games/salad/state.ts:198`-`201` |
| Generation: Salad has two difficulties, both solved by deduction alone | retitled "Generation: Salad has two difficulties, over the Latin deductions and its border clue's". "Salad's solver SHALL provide two difficulties" reworded "Salad SHALL offer two tiers"; "and both SHALL be solvable by pure deduction without guessing" cut; the border-clue sentence and what each tier holds kept; the sentence it gained, naming the two shared requirements and saying the game departs from neither, cut in the third pass, the subject saying what each of Salad's tiers holds. Scenario "The solver deduces the unique solution without guessing" dropped; it takes "A Normal board genuinely needs the Normal tier" from the requirement below | what a dealt board promises: `engine-difficulty`, "Every tier promises one solution found at its cap" and "A difficulty tier binds the board it generates"; `engine-difficulty`, "Narratable-deduction generation policy" (a board below Unreasonable is solved by the taught techniques, no guessing; its scenario is the dropped one) |
| Generation: Salad's Normal tier is never soluble at Easy | removed; its scenario "A Normal board genuinely needs the Normal tier" moves, unchanged, to "Generation: Salad has two difficulties, over the Latin deductions and its border clue's". Scenario "A generated board is uniquely solvable at its stated tier" dropped | `engine-difficulty`, "Every tier promises one solution found at its cap" and "A difficulty tier binds the board it generates" (its first scenario is the dropped one) |
| Controls: Salad selects a square and enters a symbol or a marker | "with pencil marks available for tentative notes" reworded out; the sentence gains the pointer to the mechanic the selection and the notes come from. The arrow-key sentence ("The arrow keys SHALL move a keyboard cursor.") cut (third pass); the scenario untouched | the arrows: `engine-notes`, "The highlight is the game's keyboard cursor" (the highlight is the `Ui`'s `cursor`; an arrow reveals and moves it and hands it to the keyboard), which Salad's arm does and no more (`src/games/salad/index.ts:188`-`197`); `engine-notes`, "The note-taking cell is one shared mechanic" (a player highlights a cell, types a value into it and pencils candidate marks in it); `pressNoteTakingCell` and `toggleNoteTakingMode`, `src/games/salad/index.ts:179`, `:199` |
| Controls: Salad's keypad holds its symbols and the two markers | found, mended: the sentence and its scenario gain the Clear key, last on the keypad (`requestKeys`, `src/games/salad/index.ts:413`) | |
| Controls: Salad refuses an entry on a given, and a marker its square contradicts | found, mended: the sentence on a penciled not-empty marker now says what it does on every square it reaches: it makes no pencil mark, sets the real marker on a blank square and clears it from one so marked that holds no symbol (`executeMove`, `src/games/salad/index.ts:313`-`:317`); that it leaves a square marked empty alone kept. Scenarios untouched | |
| Controls: Salad offers a fill-all-candidates action | retitled "Controls: Salad's Mark-all pencils nothing into a square marked empty". Its one sentence replaced by a pointer to the shared rule and the hook, with the departure its scenario already gave (a square marked empty takes no marks). Scenario untouched | `markAll`, `src/games/salad/index.ts:239`; `engine-notes`, "Mark-all is adaptive in a game with an obvious-candidate rule" and "The Mark-all press is the engine's, from the game's hook". The departure: `needsPencilFill`, `state.ts:337`, and the `pencilAll` arm, `index.ts:278` |
| Hint: Salad explains every hint as a pencil-note deduction | retitled "Hint: Salad's hint is the candidate walk's, with steps of its own that enter a marker". "implement the `hint` hook as a candidate-elimination hint: the plan sets and strikes pencil notes … and places a symbol at the moment a square's notes collapse to one" replaced by a pointer to the walk and the legend; the marker clause kept as a sentence of its own. Sentence 2 (every step explains why) cut. Scenario "One deduction forcing several squares is one hint" dropped; "A count that settles two squares" written in words | `engine-candidate-hints`, "A shared candidate-elimination hint plan" (sets and strikes notes, places when a cell's notes collapse to one); `engine-hints`, "A hint step always names a technique, with no un-narrated fallback" (why, not which) and "One deduction firing is one journey" (the dropped scenario). `hintMarks`, `index.ts:380` |
| Hint: Salad's hint narrates the Latin deductions it inherits and needs no fallback | removed | `engine-candidate-hints`, "A shared narrator for generic Latin placements and strike premises" (a row/column game delegates the singles, the duplicate, the set and the chain to it; Salad's calls: `src/games/salad/hint.ts:205`, `:255`); `engine-hints`, "A hint step always names a technique, with no un-narrated fallback"; `engine-difficulty`, "Narratable-deduction generation policy". Which Latin deductions Salad has stays in "Generation: Salad has two difficulties…". The scenario: `engine-hints`, "The hint walk SHALL cover every preset a game offers" |
| Look: What Salad draws | "and a completion flash" reworded out of the sentence. Scenario untouched | `ts-engine`, "The win flash plays on a forward move that solves the board"; `engine-colors`, "A solved flash drawn as a color takes a shared color" (the lit square's ground is `FLASH` or `FLASH_LEAD`, which is all `render.ts` gives it: `src/games/salad/render.ts:122`-`123`) |
| Look: Salad's selection and hint marks keep the square's surface | third pass: retitled "Look: A Salad ball shows its square's surface, and the hint's marks stay on the border". Sentence 1 (the wash and the pencil-mode corner over whichever surface the square has) cut; "that surface" in sentence 2 reworded "its square's surface" to stand; sentences 2 and 3 kept. Scenario "A blank square is selected beside a given", which restated sentence 1, dropped; scenario "A ball the player marked, in each mode" written in words | `engine-notes`, "The highlight is part of the cell's background" (the wash replaces whichever surface the game gives the cell, a given's lifted one included; the triangle lies over it; its scenario "A cell whose surface is a given's"). The new scenario: `drawBall`, `src/games/salad/render.ts:355`-`386` |

## Kept, and why

- **Params: … one with no mode letter is ABC End View**, second sentence.
  Both are what `defaultParams` holds (`state.ts:127`) and the codec leaves
  alone, and are the promise an old link depends on; `engine-params`, "A
  params string is read whole or refused" says an absent piece is left "as
  `defaultParams` has it" and not what Salad's has.
- **Params: Salad's Normal presets…**, "whose deal stays well under a
  second". The reason the menu leaves Normal off the larger shapes; the code
  holds it as a comment (`state.ts:106`).
- **Description: "A generated description round-trips".** The codec is
  hand-written; no shared requirement holds it.
- **Controls: Salad's keypad holds its symbols and the two markers.**
  `requestKeys` is written out by hand (`index.ts:404`), a key list and not
  a call of a shared builder.
- **Generation: "A Normal board genuinely needs the Normal tier".** It reads
  as the first scenario of `engine-difficulty`, "A difficulty tier binds the
  board it generates"; kept as the requirement's one scenario, as the
  accepted Clusters cut keeps its own.
- **Hint: Salad's hint pencils the candidates in and offers no other
  reading.** `engine-candidate-hints`, "A game states the reading it starts
  on" names Salad in a scenario only, and the reason is Salad's.
- **Hint: Salad's hint takes a marker on the board as settled**, "SHALL NOT
  take the player's pencil marks as facts". `engine-candidate-hints`, "A
  recording solve reads the placed entries and never the notes" states it;
  kept because the sentence's other half (a marker is a fact) hangs on the
  contrast.
- **Look: Salad draws its squares on a quiet surface…** `engine-colors`, "The
  engine owns what a board of pieces looks like": that Salad takes it is the
  requirement.

## Engine requests

- Answered: `engine-notes`, "The highlight is part of the cell's
  background". The sentence is cut.
  "The selection's wash and its pencil-mode corner SHALL be drawn over
  whichever surface the square has.", in "Look: Salad's selection and hint
  marks keep the square's surface". Solo, Unequal, Group and Towers say it of
  themselves in the same words. Belongs in `engine-notes`, "The highlight is
  part of the cell's background", which says the picture is drawn with the
  background and before the content, and not that a lifted given's surface
  keeps its color under it. `src/engine/note-taking-cell.ts`, the highlight
  painter each game's `render.ts` calls.
- "A marker is an entry to it" (Salad's `findMistakes`). No request: only
  Salad has markers.

## Found

- **The keypad's Clear key is in no requirement.** "Controls: Salad's keypad
  holds its symbols and the two markers" lists the symbols, X and O;
  `requestKeys` ends with `clearKey` (`index.ts:413`).
- **A Number Ball shape is on the menu at Normal alone.** 5×5 with four
  numbers is offered at Normal and not at Easy (`state.ts:120`); the old
  sentence "each shape's Normal preset SHALL follow its Easy one" held of it
  only because it has no Easy one.
- **"Solver: Salad's solver reasons about the empty square directly" speaks
  of what the code lacks** ("nor keep a hand-written sync-and-count layer"),
  which is history. Left.
- **A penciled not-empty marker changes the real marker.** `executeMove`
  toggles `holes` for a penciled circle (`index.ts:313`-`317`), "upstream's
  oddity"; "Controls: Salad refuses an entry on a given…" says only that it
  leaves a square marked empty alone, and nowhere that on a blank square it
  enters the marker itself and no pencil mark.
- **Two Description requirements state the same alphabet.** "Description:
  Salad descriptions use the upstream run-length block encoding" and
  "Description: A Salad description writes letters in ABC End View and digits
  in Number Ball" each give the lowercase run, `X`, `O` and the symbol
  letters and digits, and the border-then-grid order. A copy inside the spec
  and of nothing shared, so outside this cut. Left.
- **"SHALL NOT take the player's pencil marks as facts" is narrower than it
  reads.** Two of the hint's own steps read the player's notes: a square
  whose notes are down to the empty-square mark is marked empty, and one that
  has lost it is marked as holding a symbol (`crossNaked` and `xNoteGone`,
  `src/games/salad/hint.ts:138`-`139`; "Hint: Salad's hint narrates the hole
  and symbol synchronization in its own terms" states both). What holds is
  that the recorded solve reads no note. Left.

## Review

Rows read: 11. Rows whose "where it is stated instead" was wrong: 0. Rows
added: 3. Each cited requirement was opened and read whole, each declaration
found in the code, and each new scenario's strings and claims checked.

Changed:

- **Params: Salad refuses two symbols at Normal where no board has it.** Its
  last sentence was a copy of `engine-difficulty`, "An unbindable tier is
  refused, not silently downgraded", kept bare. It now names that
  requirement, in the words the accepted Clusters cut uses. Row added; the
  "Kept" entry removed.
- **Controls: Salad selects a square and enters a symbol or a marker.** "with
  pencil marks available for tentative notes" is the shared mechanic's, and
  the subject named no shared rule for its ordinary case. The clause went and
  the sentence names `engine-notes`, "The note-taking cell is one shared
  mechanic". The arrow keys stay: Salad's own arm moves the cursor. Row
  added; the "Kept" entry rewritten.
- **Look: What Salad draws.** "and a completion flash" went: the writer cut
  the same words from "Rules: Salad is solved…" and left them here. Row
  added.
- **Generation: Salad has two difficulties…** One line of the new sentence
  ran to 119 characters; rewrapped, no word changed.
- **Found**: two line numbers corrected (`index.ts:413`, `:313`-`317`); two
  items added.

Read and found sound:

- The eleven rows. The dropped "pure deduction without guessing" is carried
  by the kept sentences that say what each tier's deductions are, with
  `engine-difficulty`, "Every tier promises one solution found at its cap".
  A string with no mode letter is ABC End View because `letters` with no
  silent choice leaves the field as `defaultParams` has it
  (`src/engine/params-codec.ts:213`-`236`), so the kept sentence is a promise
  the declaration does not spell.
- The new scenarios: both descriptions of "Where each mode carries its clues"
  count out to their boards (16 border clues and 16 squares; 25 squares); the
  preset list bears out "A shape that is slow at Normal"; a count's firing is
  one `set` step a square with no marks struck
  (`src/games/salad/hint.ts:574`-`598`).
- The engine request. `engine-notes`, "The note-taking cell's highlight has
  one picture, drawn by the engine", "The highlight's wash is the palette's
  "you are here" wash", "The highlight is part of the cell's background" and
  "A game keeps what is its puzzle's in the highlight's picture" were read,
  with `engine-colors`, "The engine owns what a board of pieces looks like"
  and "A solved flash drawn as a color takes a shared color". None says what
  is under the highlight on a lifted given; the fourth leaves the background
  to the game. The sentence stays and the request stands.
- Every cited title is exact (`spec-form` and `cut-check` pass).

The cut is 7%. What is left is Salad's own: a description codec, a key map
and a keypad written out by hand, the marker rules, and the hint
requirements that say what each step concludes and from what.

## Second pass

Citing sentences read: 8. Removed: 2. Kept as the subject's one pointer: 4.
Kept as a departure: 2.

- **Removed.** "Which boards the menu offers SHALL be Salad's `presets`,
  held to the collection's rule that every tier is on it (`engine-params`,
  …)", in "Params: Salad's Normal presets are the shapes that deal quickly":
  `Params` already has its pointer (the codec requirement) and says plenty
  of Salad's own, and the sentence was a second one. What is left opens
  "Salad's Normal presets" so it stands. Row corrected.
- **Removed.** "The refusal SHALL bind generation only, as the collection's
  does (`engine-difficulty`, …)", in "Params: Salad refuses two symbols at
  Normal where no board has it". The qualifier is in the sentence before it
  ("When a board is to be dealt") and in the first scenario's last line. Row
  corrected.
- **Kept as a pointer.** `Params`, the codec sentence; `Generation`, "What a
  board dealt at either promises SHALL be the collection's" (the subject
  otherwise says what each tier's deductions are and nothing of what a dealt
  board promises, and its scenario rests on it); `Controls`, the
  note-taking cell; `Hint`, the walk and the legend.
- **Kept as a departure.** `Rules`, the mistake check (a marker is an entry
  to it); `Controls`, Mark-all (a square marked empty takes no marks).
- **Preferences.** The cut removed no preference's key or choice order;
  "Salad SHALL NOT offer the `hint-notes` preference" stands as it stood.
- Each subject read alone after the edit: none is a fragment, and every
  title fits its body.

## Third pass

Rows of the engine's third-round tables that name Salad: 1. Engine requests
of its own: 1 (and one note that asks for nothing). Cut: 3 sentences and 1
scenario, in 3 requirements. Clauses kept: 4.

Cut (the rows above say where each is stated):

- **"Look: Salad's selection and hint marks keep the square's surface"**: its
  first sentence, and the scenario that restated it; retitled for the balls
  and the hint's marks, which it keeps.
- **"Controls: Salad selects a square and enters a symbol or a marker"**:
  "The arrow keys SHALL move a keyboard cursor." The engine's table does not
  name Salad for this row; the spec was searched and held the rule in these
  words. Salad is a member of the mechanic, and its arrow arm reveals the
  cursor, moves it and sets `cursorFromKeyboard`, with no action of its own.
- **"Generation: Salad has two difficulties, over the Latin deductions and
  its border clue's"**: "What a board dealt at either promises SHALL be the
  collection's (`engine-difficulty`, …), with no departure." The second pass
  kept it as the subject's pointer; under the third pass's one rule it goes,
  the requirement saying what each of Salad's tiers holds.

Kept:

- **The scenario "A Normal board genuinely needs the Normal tier"**: the
  requirement's one scenario, a case of Salad's two tiers.
- **"In ABC End View mode a ball SHALL show its square's surface through it;
  in Number Ball mode …"** and **"The hint's marks SHALL stay on the square's
  border"**: Salad's balls and its layout.
- **"with no departure from the codec grammar"** in "Params: A Salad params
  string is its declared codec's, and one with no mode letter is ABC End
  View": the one pointer of `Params` to what its params are and how they are
  written, the rest of the subject being what is missing, the menu and two
  refusals.
- **The mistake check's markers** and **Mark-all's departure**: Salad's own,
  as the second pass found. Salad's mistake check states nothing of a board
  with no one answer.

No sentence of the form "What a pasted game ID opens as". The spec was
searched for the third round's other rules in other words (an empty mistake
check, a hint's cap or a search it never runs, a sentence that leads with the
indication, an auto-pencil decision): none is stated.

Each subject read alone: no fragment, no dangling pronoun, every title fits
its body, and the Purpose is corrected as the line above the table says.

## Found, mended

- The keypad's Clear key is in no requirement: the keypad requirement and
  its scenario now name it.
- A Number Ball shape is on the menu at Normal alone: left: the preset table
  is a declaration, and no sentence of the spec is false of it.
- The solver requirement speaks of what the code lacks: left: a constraint
  on how the solver is built, true of the code.
- A penciled not-empty marker changes the real marker: "Controls: Salad
  refuses an entry on a given, and a marker its square contradicts" now
  says so.
- Two `Description` requirements state the same alphabet: left: each holds
  what the other lacks (the section order and the mode's sections; the
  border's order, the run's length, which mode takes `O`, the refusal).
- "SHALL NOT take the player's pencil marks as facts" is narrower than it
  reads: left: not sure enough of the walk's reading of the player's notes
  to reword it; reported.
