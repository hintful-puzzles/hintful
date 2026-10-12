# towers

The Purpose no longer lists the sticky pencil mode, the mistake check's note
case and the keypad, which the spec no longer holds, and says where the shared
part is stated. "Its params and description formats" became "its rules, what
its params refuse and its description format", the params format now being
the declared codec's.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Towers checks for mistakes against the unique solution | retitled "Rules: Towers' mistake check re-solves from its clues and givens". Sentence 1 (re-solve; a wrong tower is a `"cell"`, a candidate set lacking its height a `"note"`) cut to what the answer is re-solved from (second pass: the sentence no longer names the two shared requirements). Sentence 2 (both render as the same red overlay) and sentence 3 (empty when not uniquely solvable) kept, reworded to stand. Scenarios "A wrong tower is flagged" and "A note that excludes the correct height is flagged" dropped; scenario "A wrong tower that breaks no rule" written as the game's case | a wrong entry: `engine-hints`, "Check & Save names a wrong entry in every game"; the note set, and that the answer comes from the clues and givens and never from an entry: `ts-engine`, "A candidate note that excludes the answer is a mistake" (its first scenario is both dropped ones). The kinds are `TowersMistake`, `src/games/towers/index.ts:129`; the check, `index.ts:373` |
| Params: Towers' parameters are a grid size and a difficulty | retitled "Params: A Towers params string is its declared codec's, and one with no difficulty is Easy". The one sentence (the two params, `{w}d{c}` with `e`, `h`, `x`, `u`, and `{w}`) replaced by a pointer to the declaration that says the game departs nowhere (rule 2), and by what a string with no difficulty decodes to, which the pointer owes and the spec had not stated. Scenario "Params round-trip" dropped; scenario "The tier letters are not the tiers' initials" written from the game's test | the fields: `paramConfig`, `src/games/towers/state.ts:63`; the encoding: `paramsCodec(defaultParams, [size(…), choice(paramConfig, "d", "difficulty", DIFF_CHARS, { full: true })])`, `state.ts:86`, with `DIFF_CHARS = "ehxu"`, `state.ts:40`; the round trip: `engine-params`, "A game declares its params encoding once, and both codec halves are derived" and "Encode and decode are mutual inverses over the corpus". `src/games/towers/towers.test.ts:77`-`79` holds `6du`, `5dh` and `4`, and the `towers` entry of `src/engine/__snapshots__/params-stability.test.ts.snap` every preset's two forms |
| Params: Towers' grid size runs from 3 to 9 | retitled "Params: A 3×3 Towers is not dealt above Normal". Sentence 1 (the bounds 3 and 9) and sentence 2 (a difficulty letter that names no tier) cut; sentence 3 kept, "When full" reworded to "When a board is to be generated". Scenario "Invalid params are rejected" dropped; scenario "A 3×3 Tricky is asked for" written from the game's test | `bounds: { min: 3, max: 9 }`, `state.ts:66`, and `engine-params`, "Params validity is the engine's check"; the letter: `engine-params`, "A params string is read whole or refused". The new scenario's strings: `describeAbsentTiers(towersGame, ["3dx", "3du"])`, `towers.test.ts:28`; `validateParams`, `state.ts:77` |
| Generation: Towers generates uniquely-solvable boards at the target difficulty | retitled "Generation: An Easy Towers board keeps every clue". Sentence 1 (unique, and solvable at exactly the chosen difficulty) replaced by one that names the two shared requirements and says Towers departs from neither; sentence 2 untouched. Scenario "Generated board is unique and correctly graded" dropped; scenario "An Easy board and a Normal one" written | `engine-difficulty`, "Every tier promises one solution found at its cap" and "A difficulty tier binds the board it generates" (whose first scenario is the dropped one). The clue stripping: `src/games/towers/generator.ts:77` |
| Controls: Towers selects a cell by pointer or by keyboard cursor | gains a first sentence that says where the ordinary selection is stated (rule 2: the requirement held only the 3D corner case); the 3D sentence and the scenario untouched | |
| Controls: Towers provides on-screen key labels | removed | `requestKeys: (p) => digitKeys(p.w)`, `index.ts:657`; `engine-input`, "Games may expose on-screen key labels" and "A key label carries its resolved text" |
| Preferences: Towers offers a sticky pencil mode | removed | `stickyPencilPref<TowersUi>()`, `index.ts:664`; `engine-notes`, "The pencil preferences have one key each, which a saved preference depends on" (the key and what it does), "The button and the sticky preference decide the mode a press selects for" (whose first scenario is the dropped one) and "A sticky notes mode is visible on the board" (the indicator) |
| Preferences: Towers auto-pencils row/column eliminations on placement | title kept. "The game SHALL provide an auto-pencil preference" and "when it is off a placement SHALL leave other cells' pencil marks untouched" reworded out; kept: where the strike reaches, and that the decision is recorded on the move. Scenario "Auto-pencil off leaves notes untouched" dropped; "Placing a tower clears matching notes in its line" kept | `autoPencilPref<TowersUi>(…)`, `index.ts:661`; `engine-notes`, "The pencil preferences have one key each, which a saved preference depends on" (`auto-pencil`: whether placing a value strikes it) and "Every member offers the keep-highlight preference, defaulted the same way" (starts off; scenario "A placement with no preference changed") |
| Hint: Towers provides an explained, pencil-notes-based deduction hint | retitled "Hint: Towers' hint is the shared candidate plan over rows and columns". Both sentences replaced by a pointer to the shared plan and its row/column preset, saying what Towers supplies and that its marks are the legend's (rule 2). Scenario "The player has edited the notes" dropped; scenario "A single on a Towers board" written | `engine-candidate-hints`, "A shared candidate-elimination hint plan" (sets and strikes notes, places when a cell's notes collapse) and "A recording solve reads the placed entries and never the notes" (the notes decide which recorded firings are still to make; its scenario is the dropped one). Towers' call: `runLatinCandidatePlan`, `index.ts:554`; its own singles: `engine-candidate-hints`, "A game whose generic wording diverges keeps its own narration" |
| Hint: A Towers hint step populates, eliminates or places | retitled "Hint: A Towers clue elimination strikes one height a leg". Kept: an elimination clears what one firing rules out, one leg for each height. Cut: the `populate` reading Towers starts on, the populate step and when it is emitted, the `pencilAll` and `pencilStrike` moves, the place step. Scenario untouched | the reading: `candidateReading: DEFAULT_CANDIDATE_READING`, `state.ts:236`, and `engine-candidate-hints`, "A game states the reading it starts on" (the convention is `populate`); the populate step: "A candidate hint plan reads an unmarked cell the way the player chose" and "The walk owns the setup" (a lazy populate); the moves: "The walk builds every step from the game's words"; the place step: "A shared candidate-elimination hint plan" |
| Hint: A Towers hint is ordered the way a person solves | retitled "Hint: Towers' own rung is the clue lines that need no notes". Kept: the two clue lines, and which comes first (second pass: without the citation of "The walk owns the ladder", the subject's pointer being the requirement before). Cut: the naked single first, the eliminations and the forced placement after, "a freshly built plan opens in that order". Scenario "A naked single is offered ahead of further elimination" dropped; "A full-height clue opens an empty board" kept | `engine-candidate-hints`, "The walk owns the ladder" (naked singles, the game's own rungs, the recorded strikes, the recorded placements; the opening before the setup). Towers' rung: `extremeClueLines`, `index.ts:499`, handed over at `index.ts:574` |
| Hint: A Towers hint step says what was spotted and why it forces the move | removed | `engine-hints`, "A hint step's words SHALL be built from their parts" (what to look at, what follows, the move) and "The engine writes the words that join a sentence's parts" (forced: "L, so M."); the necessity voice: `engine-hints`, "The necessity-voice rule applies to every hinting game not ledgered as narrating moves"; the strike's ending: `engine-candidate-hints`, "A candidate strike SHALL end in the walk's conclusion". Each technique's sentence is quoted in its own requirement below |
| Hint: A Towers hint step marks the clue it reasons from and the cells it acts on | removed; "Hint: Towers' hint is the shared candidate plan over rows and columns" says the marks are the legend's | `hintMarks.roles` (`ring`: the cell the step decides or strikes from; `outline`: "the clue it counts, in its slot beside the grid"; `stripes`: "the row or column a clue sees along, through the clue slots at both its ends"), `index.ts:629`; `engine-hints`, "A bound hint step's words SHALL name exactly the marks it draws"; the strikes of one firing sharing the ring: `engine-hints`, "A hint marks beside the content, never behind it" (the acted-on cell is ringed whether the step places or strikes) |

## Kept, and why

- **Rules: … re-solves from its clues and givens**, the overlay sentence and
  the empty result. The first is how Towers draws the two kinds; the second
  no shared requirement states (see Engine requests).
- **Params: … one with no difficulty is Easy.** `engine-params`, "A params
  string is read whole or refused" says a declared codec leaves the field as
  `defaultParams` has it, and which tier that is is the game's.
- **Controls: Towers accepts digit, pencil, clue-strike, and solve moves.**
  `interpretMove` is hand-written (`index.ts:254`-`280`).
- **Preferences: Towers exposes an appearance preference.** The preference is
  the game's own, and its default is `newUi`'s and not the declaration's.
- **Preferences: … auto-pencils…**, "fixed at move-creation time, recorded on
  the move". No shared requirement says a replayed placement strikes as it
  did when it was made.
- **Hint: … strikes one height a leg.** `engine-candidate-hints`, "The game
  keeps what carries its meaning" leaves the strike axis to the game.
- **Hint: Towers' clue eliminations are tried a facing pair first and
  arrangements last.** The order is the recording solver's loop, not
  `hintRungs` and not the walk's ladder.
- **Look: The selection's wash and the hint's marks keep to the cell.**
  `engine-hints`, "A hint mark is drawn on the cell's border" leaves border or
  inset to the game, and the wash on a tower's faces is Towers' own.

## Engine requests

The five Latin games' requests go under five names, the same in `keen.md`,
`towers.md`, `unequal.md`, `group.md` and `mathrax.md`. Each name's first
line, the rule as the engine would state it and the home, is the same in every
ledger that has it; what follows is this game's sentence and code.

- **The entry arm of a note-taking game.** With a cell highlighted, a value's
  key enters that value, or in pencil mode toggles its pencil mark; Backspace
  and Space clear the cell; in pencil mode no key changes a cell that holds a
  value; a given takes no entry. Home: `engine-notes`, beside "The engine owns
  what a press and an entry do to the highlight".
  Towers' sentence: "With a cell highlighted, a digit `1..w` SHALL enter that
  tower, or toggle that pencil mark in pencil mode, and Backspace, Space
  (`CURSOR_SELECT2`) or `0` SHALL clear the cell. Immutable (given) cells
  SHALL reject entry.", in "Controls: Towers accepts digit, pencil,
  clue-strike, and solve moves". Code: `index.ts:254`-`280`. Stays Towers':
  the bound `w`, and `0` as a clear.
- **A mistake check reports nothing where the puzzle does not solve to one
  answer.** Where the game's solver, asked from the clues and givens, finds no
  answer or more than one, `findMistakes` reports nothing. Home: `ts-engine`,
  beside "A mistake check compares with the one answer, hidden or not".
  Towers' sentence: "When the clues and givens do not solve to exactly one
  answer the result SHALL be empty.", in "Rules: Towers' mistake check
  re-solves from its clues and givens". Code: `index.ts:379`.
- **A candidate hint's recording solve runs at the board's tier, and no higher
  than the top tier below Unreasonable.** Home: `engine-candidate-hints`,
  beside "A recording solve reads the placed entries and never the notes".
  Towers' sentence: "`hint` SHALL use no deduction above the board's own tier,
  and never a search.", in "Hint: Towers' clue eliminations are tried a facing
  pair first and arrangements last". Code: `index.ts:553`.
- **Auto-pencil strikes a placed value from the other cells of its no-repeat
  regions.** In these four games the regions are the row and the column.
  Home: `engine-notes`, beside "The pencil preferences have one key each,
  which a saved preference depends on", which leaves the reach to the game.
  Towers' sentence: "With auto-pencil on, a placement SHALL strike its height
  from the pencil marks of every other cell in the same row and column.", in
  "Preferences: Towers auto-pencils row/column eliminations on placement".
  Code: `index.ts:309`-`315`.
- **The auto-pencil decision is recorded on the move.** A placement's move
  carries whether auto-pencil was on when it was made, so a replayed move
  strikes as it did then, whatever the preference is now. Home:
  `engine-notes`, beside "The pencil preferences have one key each, which a
  saved preference depends on". Towers' sentence: "The decision SHALL be fixed
  at move-creation time, recorded on the move, so that replaying a saved game
  is deterministic regardless of the preference's later value.", in
  "Preferences: Towers auto-pencils row/column eliminations on placement".
  Keen, Unequal and Mathrax carry `autoElim` on their `set` move as Towers
  does and do not say so. Code: `index.ts:278`, and `executeMove`,
  `index.ts:309`.

## Found

- **The spec does not say that a drag along the clues repeats the strike.**
  `clueDrag` (`index.ts:147`) is a `dragMarkVerbs` declaration and
  `interpretMove` starts its sweep on a clue press (`index.ts:229`).
  "Controls: An outside clue is struck through by a click or a modified
  cursor key" states the click and the keys only.
- **The spec does not say what Towers' tiers mean.** No `Generation`
  requirement says which deductions Easy, Normal and Tricky allow; "Hint:
  Towers' clue eliminations are tried…" says only that arrangements and sets
  need a board above Easy.
- **"Controls: Towers accepts digit, pencil, clue-strike, and solve moves"**
  names a solve move and a clue strike its body does not state, and its body
  does not say that no key changes a filled cell in pencil mode
  (`index.ts:260`), which Keen's and Mathrax's do.
- **"Look: Towers repaints the neighbors a tower reaches into"** states how
  the renderer caches, which is how a thing is built.
- **The tier keys are not the tier names.** `diff` is `"hard"` at Normal and
  `"extreme"` at Tricky (`state.ts:32`). Keen's spec says so of its own keys;
  Towers' does not, and the removed scenario's `diff: "unreasonable"` was the
  one key it showed.

## Review

13 rows read, each against the declaration or the requirement it names, read
whole; 2 rows corrected (a citation each), and no sentence restored or cut in
the spec.

The edit was applied by a script, so the diff was read hunk by hunk against
the table: 8 hunks, each wholly accounted for by a row or by the Purpose
line, and the 18 requirements outside them are byte for byte the base's
(`cut-check` counts them untouched). The file has no trailing space, tab,
carriage return or doubled blank line, and ends in one newline.

Changed:

- **The Purpose line above the table** now names the one change it left out:
  "its params and description formats" became "its rules, what its params
  refuse and its description format".
- **"Hint: A Towers hint step says what was spotted…"**: the row named no
  home for "a necessity-voice conclusion" on a placement; it is `engine-hints`,
  "The necessity-voice rule applies to every hinting game not ledgered as
  narrating moves".
- **"Hint: A Towers hint step marks the clue…"**: the row named no home for
  "the equivalent strikes of one firing sharing the target's mark"; the
  legend's `ring` covers every cell a step strikes from, and `engine-hints`,
  "A hint marks beside the content, never behind it" gives the one mark.
- **Engine requests** reworded under the five names the five ledgers share.
  Towers' is the one spec that states the fifth.

Checked and found sound:

- Every engine title the spec cites is exact (`spec-citations` resolves them),
  and each requirement a row names states all of what the row removed.
- The declarations: `paramConfig` and its `bounds` (`state.ts:63`, `:66`), the
  codec and `DIFF_CHARS` (`state.ts:86`, `:40`), `requestKeys` as
  `digitKeys(p.w)` (`index.ts:657`), the two pencil preferences
  (`index.ts:661`, `:664`), the legend (`index.ts:629`), the reading
  (`state.ts:236`).
- The new sentences against the code: `defaultParams` is Easy, so a string
  with no `d` is (`state.ts:57`); `validateParams` refuses a 3×3 above Normal
  only when `full` (`state.ts:79`); clues are stripped only above Easy
  (`generator.ts:77`); `findMistakes` solves from `state.immutable` and the
  clues (`index.ts:377`); Towers words its own singles
  (`engine-candidate-hints`, "A game whose generic wording diverges keeps its
  own narration", which names it); the one rung handed over is
  `extremeClueLines`, full lines first (`index.ts:499`, `:574`).
- The quoted strings: `5dh`, `4`, `3dx` and `3du` are the game's test's
  (`towers.test.ts:28`, `:78`, `:79`).
- The five requests' claim that no capability states them, as in `keen.md`;
  for the fifth, `ts-engine`, "A move a save holds keeps replaying" and
  "Preferences are not part of a save" were read, and neither says a replayed
  placement strikes as it did when made.
- Each subject read alone: none hollow, no dangling antecedent, every title
  fits its body.
- Left: "Preferences: Towers exposes an appearance preference" restates the
  `prefs` entry's key and the order of its choices (`index.ts:668`-`671`).
  A saved preference is stored under that key as the choice's index, no test
  holds either, and the default is `newUi`'s, so the requirement stays whole.

## Second pass

Applied the brief's "A pointer is for that case only". 7 citing sentences or
clauses read: 2 removed, 5 kept as a subject's one pointer for its concern,
0 kept as a departure.

Removed (the rows above say where each is stated):

- **"Rules: Towers' mistake check re-solves from its clues and givens"**:
  "SHALL report what the collection's check reports (`engine-hints`, …, and
  `ts-engine`, …), against" reworded out; the sentence keeps what the answer
  is re-solved from. `Rules` states the puzzle and the solved board itself.
- **"Hint: Towers' own rung is the clue lines that need no notes"**: the
  parenthesis "(`engine-candidate-hints`, "The walk owns the ladder")" went.
  It was a second pointer for the plan, which "Hint: Towers' hint is the
  shared candidate plan over rows and columns" already gives, "one rung of
  its own" included.

Kept as a pointer:

- `Params`: "those its `paramConfig` and its declared codec give
  (`engine-params`, …)". Without it the subject holds one refusal.
- `Generation`: "What a board dealt at a tier promises SHALL be the
  collection's (`engine-difficulty`, …), with no departure." Without it the
  subject holds one sentence, on which clues a board keeps. It is the nearest
  of the five kept to a copy: that sentence does end "for as long as the
  board stays solvable at that difficulty".
- `Controls`: "Towers SHALL take its selection from the engine's note-taking
  cell (`engine-notes`, …)", the ordinary press beside the 3D corner case.
- `Hint`: the first sentence of "Hint: Towers' hint is the shared candidate
  plan over rows and columns", and its last, "What its marks stand for SHALL
  be the legend's (`hintMarks`)": one pointer requirement for two concerns,
  the plan and the marks.

Preferences: the cut removed "Preferences: Towers offers a sticky pencil
mode", whose sentence named no key ("SHALL offer the sticky pencil
preference"), and the label of auto-pencil, not its key. `appearance` and the
order of its choices stay in the spec. `src/games/towers/towers-stale-hint.test.ts:98`
sets `"auto-pencil"` by its key.

Each subject read alone after the edits: no fragment, no dangling pronoun,
every title fits its body.
