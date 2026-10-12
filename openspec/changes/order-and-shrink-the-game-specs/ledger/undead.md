# undead

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Undead's findMistakes compares the board with its unique solution | title kept. Sentence 1 (re-solve; every placed cell that contradicts the answer, every empty cell whose non-empty notes crossed out its monster) replaced by one that names the two shared requirements and keeps what they leave to the game: that Undead reports pencil marks, and what the answer is re-solved from. Sentence 2 ("from the description clues only") joins it, spelled out. Scenario "Check & Save flags a wrong placement" dropped; "A wrong monster that breaks no count" written from `findMistakes` | `engine-hints`, "Check & Save names a wrong entry in every game" (an entry the answer contradicts, whether or not it breaks a rule) and `ts-engine`, "A candidate note that excludes the answer is a mistake" (a non-empty set that crossed out the answer is reported, extra notes are not; Check & Save refuses to save; its first scenario is the dropped one). `findMistakes` through `entryMistakes`, `src/games/undead/index.ts:411`-`429`; the answer: `findUndeadSolution`, `src/games/undead/solver.ts:198` |
| Params: Undead's parameters and their encoding | retitled "Params: An Undead params string is its declared codec's, and a grid past 54 squares is refused". Both sentences (the three fields and the values they are held as; `{w}x{h}` and `d` with `e`, `n` or `t` in the full form) replaced by a pointer to `paramConfig` and the codec, which says in a clause what the params are. Gains "`validateParams` SHALL refuse `w·h > 54`" from "Params: Undead's parameter limits". Scenario "Params round-trip" dropped; "A grid of 54 squares and one of 60" written from `validateParams` | `paramConfig`, `src/games/undead/state.ts:115`-`126`; `paramsCodec(defaultParams, [dims, choice "d" over "ent", full])`, `state.ts:129`-`132`; the round trip: `engine-params`, "A game declares its params encoding once, and both codec halves are derived". The `undead` entry of `src/engine/__snapshots__/params-stability.test.ts.snap` holds `5x5dt` and `5x5`; that `t` is the top tier stays in "Params: Undead's top tier is Unreasonable and keeps the letter t". The new scenario: `state.ts:134`-`135` |
| Params: Undead's parameter limits | removed. "`validateParams` SHALL refuse `w·h > 54`" moves to "Params: An Undead params string is its declared codec's, and a grid past 54 squares is refused". The minimum of 3 and the unknown difficulty letter cut; scenario "Invalid params are rejected" dropped | the minimum: `bounds: { min: 3 }`, `state.ts:118`, refused by the engine (`engine-params`, "Params validity is the engine's check"); the letter: `engine-params`, "A params string is read whole or refused" |
| Controls: Undead supports monster, pencil, and clue moves with a cursor | sentences untouched. Scenario "Pencil-mark UX" dropped; "Place and clear a monster" kept | `engine-notes`, "The button and the sticky preference decide the mode a press selects for" (a latched pencil mode stays through the next press) and "A sticky notes mode is visible on the board" (the indicator) |
| Controls: Undead's Mark-all fills the cells that have no notes | title kept. "SHALL fill every undecided cell that carries no notes with all three candidate notes, and SHALL make no move once none is left" replaced by a pointer to the shared rule and the hook; the reason (a placed monster rules nothing out of another cell) kept. Scenario untouched | `engine-notes`, "A game with no obvious-candidate rule keeps a fill-only Mark-all" (names Undead; fills the note-less cells, leaves a narrowed one, no move on a fully noted board). `markAll`, `index.ts:922` |
| Hint: Undead explained deduction hint | retitled "Hint: Undead's hint is deductive, by a plan of the game's own". Sentence 1 (purely deductive, no solution reveal, no narrated guess) replaced by a pointer to the two shared requirements, "with no departure"; sentence 2 (below Unreasonable a plan solves the board, and hints followed one at a time reach a solved board) cut; one sentence added that the plan is the game's own and what it is built from (rule 2: the subject's other requirements each give one technique or one refusal). Scenario "The plan reaches a solved board from any mistake-free position" dropped; "Naked single is surfaced first as a placement" and "Total exhaustion is narrated honestly, not as a sightline" untouched | `engine-hints`, "A hint step always names a technique, with no un-narrated fallback" and "A Search is refused and never narrated"; the dropped scenario: `engine-hints`, "The hint walk SHALL cover every preset a game offers" and "Deduction runs out only where the tier permits search". The added sentence: `buildSteps`, `index.ts:660` |
| Hint: Undead's hint marks follow the element-type color legend | retitled "Hint: A ringed Undead cell shows no monster ahead of the move". The two colors by constant, "following the element-type color legend", the outline of the sightline evidence and "Both marks SHALL sit on the cell's edge, over the grid line" replaced by one sentence that sends the reader to the legend; "ringed … with no pre-rendered monster glyph" kept. Scenario untouched | `hintMarks.roles.ring` ("in the hint color") and `.outline` ("the *sightline* the step reasons from, in a second color: the squares, mirrors included…"), `index.ts:946`-`953`; `engine-hints`, "A hint naming several kinds of element colors them by a stable legend", "The engine SHALL own the hint mark roles and the words for them" and "A hint mark is drawn on the cell's border" |
| Hint: A struck candidate stays legible | removed, with its scenario "A hint is dismissed" | `engine-hints`, "A highlight on a board element stays legible against its cell" (a struck candidate stays among its cell's notes in the note's own ink with a line through it, never on a fill of the highlight's color) and "A hint marks beside the content, never behind it" (the acted-on cell is ringed and not filled, whether the step places or strikes). The dismissal: `engine-hints`, "A mark outside the content box is driven by the drawstate" (a mark inside the box is undone by the cell's own repaint). The drawing: `src/games/undead/render.ts:568`-`577` |

## Kept, and why

- **Params: Undead's top tier is Unreasonable and keeps the letter t.** The
  letters are the codec's (`DIFF_CHARS`, `state.ts:40`); that the top one
  stays `t` though the tier is named Unreasonable is the promise an old ID
  depends on, and `engine-difficulty`, "A tier's name is not part of any
  encoding" says only that the two are independent.
- **Controls: Undead provides on-screen key labels.** `requestKeys` is a list
  written out by hand (`index.ts:958`-`963`), and its last sentence (the keys
  carry letters whichever display is selected) is the game's.
- **Preferences: Undead's count style and monster display are preferences.**
  A copy of `prefs` (`index.ts:969`-`988`), kept: `count-style` and
  `monsters` are the keys a stored preference is read back by, and no test
  holds them. The `A` key is `interpretMove`'s.
- **Hint: An Unreasonable board's hint stops where deduction stops.**
  `engine-hints`, "Deduction runs out only where the tier permits search" and
  "Deduction running out on a sound board SHALL have one wording" allow and
  word the refusal; that Undead's plan stops there and never runs its forcing
  rung is the game's.
- **Hint: Undead's hint conclusions use the necessity voice.** The rule is
  `engine-hints`, "The necessity-voice rule applies to every hinting game not
  ledgered as narrating moves"; the two phrases are Undead's own words, its
  hint not being on the shared candidate walk, whose conclusion they would
  otherwise be.
- **Hint: Undead's hint pencils every monster in before its first strike.**
  Undead's plan is its own loop (`index.ts:660`), so `engine-candidate-hints`,
  "A candidate hint plan reads an unmarked cell the way the player chose"
  does not bind it.
- **Hint: Undead's hint tries a single, then a counted placement, then a
  strike.** The order is the loop's (`index.ts:714`-`737`), not `hintRungs`.
- **Look: Undead draws its cells on a quiet surface and lifts what is
  fixed.** `engine-colors`, "The engine owns what a board of pieces looks
  like": that Undead takes it is the requirement.

## Engine requests

None.

## Found

- **A params string with no `d` decodes as Normal, and the spec does not say
  so.** `defaultParams` is the 4×4 Normal preset (`state.ts:110`), and the
  codec leaves an absent `d` at the default (`engine-params`, "A params
  string is read whole or refused"). Every other game of this batch says
  what its missing tier is. A board loaded by such an ID is graded by the
  midend, so this is the tier a bare params string deals at.
- **Undead refuses a grid too large in a sentence of its own**, "Width times
  height must be at most 54." (`state.ts:135`). `engine-params`, "A grid too
  large for a game is refused in one sentence" asks for `AREA_TOO_LARGE` and
  "no sentence of its own" where the product is more than the game can hold.
  Undead's names its ceiling, which the shared sentence does not.
- **`findMistakes` reports nothing where the solver finds no single answer**
  (`index.ts:414`), which the requirement did not say before the cut and does
  not say now.
- **Run, not read: a params string with no `d` decodes as Normal at every
  size.** `decodeParams` gives `5x5`, `7x7` and `6x9` each `diff: "normal"`
  (full forms `5x5dn`, `7x7dn`, `6x9dn`), and `5x5de` Easy; `defaultParams`
  is `{ w: 4, h: 4, diff: "normal" }`. `src/games/undead/undead.test.ts:84`
  holds `4x4` as Normal, which is the default's own size.
- **"Hint: An Unreasonable board's hint stops where deduction stops" says
  what the game's tests assert**, and "Look: Undead paints a flagged count
  and a flagged clue red" what upstream does. Left.

## Review

Seven rows and the Purpose line read, each against the declaration or the
shared requirement it names, opened whole; two rows corrected, one row
added, the Purpose line withdrawn.

Changed:

- **"Rules: Undead's findMistakes compares the board with its unique
  solution" restored, as a pointer.** It had been removed whole. `ts-engine`,
  "A candidate note that excludes the answer is a mistake" binds a game
  "where" it reports notes and does not say that Undead does, and with the
  requirement gone the `Rules` subject said nothing of the mistake check or
  of where it is stated (rule 2). It now names the two shared requirements,
  as the other note-taking games' do, and keeps that pencil marks are
  reported and what the answer is re-solved from (`findUndeadSolution` starts
  from the fixed cells alone, `solver.ts:198`-`207`). Title kept. The Purpose
  is back as it stood, and its ledger line is gone.
- **"Hint: Undead's hint is deductive, by a plan of the game's own": "with no
  departure below `Unreasonable`" reads "with no departure".** The qualifier
  came from the cut sentence about a plan solving the board, and beside the
  two rules it now sat with it implied a departure on `Unreasonable`. There
  is none: the plan stops and the hint refuses, which is "A Search is refused
  and never narrated".
- **"Hint: A struck candidate stays legible" cut** (second task), with a row.
  `engine-hints`, "A highlight on a board element stays legible against its
  cell" states the note's own ink, the line through it and the background,
  and would read the same of any note-taking game.

Checked and found sound:

- The params pointer: `dims` and `choice "d"` over `ent`, full form only
  (`state.ts:129`-`132`); the minimum of 3 is `bounds` (`state.ts:118`); the
  cited title is exact; the new scenario's two boards and its sentence are
  `validateParams`' (6×9 passes, 6×10 does not).
- The dropped "Pencil-mark UX" scenario is the first scenario of
  `engine-notes`, "The button and the sticky preference decide the mode a
  press selects for", and "A sticky notes mode is visible on the board".
- The Mark-all pointer: the shared requirement names Undead and states the
  fill, the narrowed cell and the no-move press; `markAll` is `index.ts:922`.
- The hint-marks pointer: both roles' words are in `hintMarks`
  (`index.ts:946`-`953`), and the border placement is `engine-hints`, "A hint
  mark is drawn on the cell's border".
- Every title cited in the spec is exact, and the strings quoted in the
  scenarios the cut wrote are the code's.
- Kept requirements read for copies, all subjects. Left: the key list of
  `requestKeys` and the description parser are written out by hand; the
  preference keys are held by no test; the refusal clause of "An
  Unreasonable board's hint stops where deduction stops" is the consequence
  of the game's own sentence before it. Nothing else found to cut: Undead's
  input, description, hint loop and drawing are its own functions, which is
  why the cut is 6%.
- Engine requests: none were filed, and none is owed by a kept sentence.
- The four checks pass for `undead`.
