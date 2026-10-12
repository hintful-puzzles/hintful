# group

The Purpose no longer says that Check & Save flags pencil marks that have
crossed out the answer, which is the collection's (the row of that
requirement says where), and says where the note-taking part is stated.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: A Group board is solved by a group table | sentence 2 (because a board has one solution, Group provides `findMistakes`) cut; sentence 1 untouched; "and flashes" reworded out of the scenario | `findMistakes` on the game object, `src/games/group/index.ts:817`; the flash: `ts-engine`, "The win flash plays on a forward move that solves the board"; `ts-engine`, "The engine supports an ephemeral, opt-in mistake-checking hook" and "A mistake check compares with the one answer, hidden or not"; that the board has one answer: `engine-params`, "A board with a mistake check loads only with exactly one answer" |
| Rules: Group's Check & Save flags pencil marks that have crossed out the answer | retitled "Rules: Group's mistake check re-solves from its givens". Sentences 1 and 2 (a wrong entry, a mark set that leaves out the answer, extra candidates not reported) cut to what the answer is re-solved from (second pass: the sentence no longer names the two shared requirements); kept from sentence 1: the mark set is drawn in the same mistake outline. Sentence 3 (the hint refuses while such a mark set stands) cut. Scenarios "Marks without the answer are a mistake and the hint refuses" and "Extra candidates beside the answer are not a mistake" dropped; scenario "A wrong element that breaks no rule" written as the game's case | `engine-hints`, "Check & Save names a wrong entry in every game"; `ts-engine`, "A candidate note that excludes the answer is a mistake" (both dropped scenarios are its first); the hint's refusal: `engine-hints`, "The midend SHALL refuse a hint on a finished or wrong board before asking the game" (scenario "Asking for a hint on a board with a mistake highlights it"). The check: `index.ts:474` |
| Params: Group's parameters | title kept. Sentence 1 (a size between 3 and 26, the five tiers, the flag) cut to the three params (second pass: without the clause that they are fields of `paramConfig`, which declares the range and the tiers); sentence 2 and the scenario untouched | `bounds: { min: 3, max: 26 }`, `index.ts:770`; `difficultyItem(DIFF_NAMES, "diff")`, `index.ts:773`, with `DIFF_NAMES = tierNames(5, { search: true })`, `src/games/group/state.ts:49`; `engine-params`, "Params validity is the engine's check" |
| Params: A size is refused at a tier none of its boards need | "and SHALL NOT deal an easier board in its place" reworded out of sentence 1; the rest and both scenarios untouched | `engine-difficulty`, "A generator never settles for a lower tier" |
| Params: Group's params are a size, a tier letter and an identity flag | the last clause (refuses a character it does not know and a `d` followed by no tier letter) cut; what a string with no `d` and no `i` decodes to kept. Scenario "A letter that is no tier" dropped; the other two kept | `engine-params`, "A params string is read whole or refused" and "The engine makes the one refusal of a params string" (whose first scenario is this sentence for `8x8dq`). Group's calls: `paramsLetter` and `unreadParams`, `state.ts:138`-`144` |
| Generation: A Group board is a group from the data table | title kept. Sentence 2 (its clues admit exactly one completion, at the requested difficulty) cut (second pass: the sentence that named the two shared requirements in its place went too). The scenario keeps its middle clause (the completion is a valid group table) and loses the other two | `engine-difficulty`, "Every tier promises one solution found at its cap" and "A difficulty tier binds the board it generates". The gate: `src/games/group/generator.ts:101` and `:120` |
| Solver: Group's solver accepts only an associative grid and grades a board at its tier | retitled "Solver: Group's solver accepts only an associative grid". Sentence 2 (solvable at its tier and not at the tier below) cut. Scenario "The solver grades a board at the intended difficulty" dropped; scenario "A Latin square that is no group" written | `engine-difficulty`, "A difficulty tier binds the board it generates" (the dropped scenario is its first). The validity check: `groupValid`, `src/games/group/solver.ts:322` |
| Hint: Group's own placements lead the eliminations | title kept. The order (a naked single first, Group's placements next, then the eliminations, last a forced generic placement) cut to what is Group's: its own rung of the walk's ladder, with the citation, and a clause that says where the rest of the hint is stated (rule 2). The reading it starts on and the scenario untouched | `engine-candidate-hints`, "The walk owns the ladder" (naked singles, the game's own rungs, the recorded strikes, the recorded placements; the note-free opening). Group's rung: `leads`, `index.ts:628`, handed over at `index.ts:648` |
| Controls: Group selects a cell through the shared note-taking cell | added (rule 2): the subject began at "a cell selected for entry" and said nowhere how a cell is selected. Its two answers and its scenario are from `pressNoteTakingCell`'s call, `index.ts:199`-`202`, and `prefs`, `index.ts:821` | |
| Look: Group draws its table on a quiet surface, with a given's cell lifted | third pass: last sentence ("The selection's wash and its pencil-mode corner SHALL be drawn over whichever surface the cell has.") cut; the surfaces, the legend's sentence and the scenario untouched | `engine-notes`, "The highlight is part of the cell's background" (the wash replaces whichever surface the game gives the cell, a given's lifted one included; the triangle lies over it) |
| Look: Group draws its legend, marks and errors | "highlight the selection" and "and flash on completion" reworded out of the one sentence; the legend, the pencil-mark grid and the error annotation, the title and the scenario untouched | the highlight: `engine-notes`, "The note-taking cell's highlight has one picture, drawn by the engine" (`cellHighlight`, `src/games/group/render.ts:548`); the flash: `ts-engine`, "The win flash plays on a forward move that solves the board" and "The win flash is one traveling highlight in every game" (`winHighlight`, `render.ts:551`) |
| Description: A Group description is validated against the grid area | Found, mended: "telling "not enough data" from "too much"" corrected to the two kinds a player reads, too short and too long for its board, in the sentence and the scenario's THEN | |
| Hint: Group's hint uses no deduction above the board's tier | added (Found, mended): the cap of `buildSteps`, `src/games/group/index.ts:606` | |

## Kept, and why

- **Rules: … re-solves from its givens**, the outline sentence. How Group
  draws the two kinds alike is its own.
- **Params: Hiding the identity leaves every tier but Easy.** The modifier's
  `only` declares it (`index.ts:783`); the requirement stays for its reason,
  which the declaration cannot give and the next requirement's refusals rest
  on.
- **Params: Group's params are a size, a tier letter and an identity flag.**
  The codec is hand-written (`state.ts:120`, `:127`), and what a missing `d`
  or `i` decodes to is the promise an old link depends on.
- **Controls: A letter key enters its element**, the keypad sentence.
  `requestKeys` is written out by hand (`index.ts:136`), through the
  identity-dependent lettering.
- **Hint: … lead the eliminations**, the implicit reading. A departure from
  the convention of `engine-candidate-hints`, "A game states the reading it
  starts on".
- **Hint: Learning the identity fills its row and column as one journey.**
  `engine-hints`, "One deduction firing is one journey" gives the form; that
  the identity's whole row and column are one firing is Group's
  (`placing`, `index.ts:612`).
- **Hint: The hint teaches Group's three deductions**, "by a `set` move" and
  "by a `pencilStrike` move". They say which of the three places and which
  strikes.

## Engine requests

The five Latin games' requests go under five names, the same in `keen.md`,
`towers.md`, `unequal.md`, `group.md` and `mathrax.md`. Each name's first
line, the rule as the engine would state it and the home, is the same in every
ledger that has it; what follows is this game's sentence and code.

- **The entry arm of a note-taking game.** Left the game's own: no shared
  code decodes a key, tests a given or builds the move, and lifting it was
  evaluated and declined, since it would need a shared move type
  (`src/engine/note-taking-cell.ts`); no guard holds it. The sentences stay.
  With a cell highlighted, a value's
  key enters that value, or in pencil mode toggles its pencil mark; Backspace
  and Space clear the cell; in pencil mode no key changes a cell that holds a
  value; a given takes no entry. Home: `engine-notes`, beside "The engine owns
  what a press and an entry do to the highlight".
  Group's sentences: "Backspace, Space and the keypad's Clear SHALL empty the
  selected cells … In pencil mode they SHALL leave a cell that holds a letter
  as it is, and in either mode a given.", in "Controls: Backspace, Space and
  Clear empty the selected Group cells", and "A letter key … SHALL enter the
  element it letters in the selected cells, or toggle that element's pencil
  mark in pencil mode", in "Controls: A letter key enters its element". Code:
  `index.ts:307`-`335`. Stays Group's: letters for values, by the
  identity-dependent lettering; a run of cells entered at once; and a given
  that already holds the element being part of the move.
- **A mistake check reports nothing where the puzzle does not solve to one
  answer.** Answered: `ts-engine`, "A mistake check compares with the one
  answer, hidden or not". Group's spec does not state it (see Found); its
  `findMistakes` does it (`index.ts:480`). See `keen.md`.
- **A candidate hint's recording solve runs at the board's tier, and no higher
  than the top tier below Unreasonable.** Answered for the cap:
  `engine-candidate-hints`, "A recording solve stops below the tier that
  searches"; that the solve runs at the board's own tier is left the games'
  own, not being the collection's rule. Group's spec does not state it (see
  Found); its `buildSteps` does it (`index.ts:606`). See `keen.md`.
- **Auto-pencil strikes a placed value from the other cells of its no-repeat
  regions**, and **the auto-pencil decision is recorded on the move.**
  Answered: `engine-notes`, "An auto-pencil strike is decided when the
  placement is made". Not Group's: it offers no auto-pencil (`prefs`, `index.ts:821`).

## Found

- **The spec does not say what the mistake check reports of a board its
  givens do not solve to one answer.** `findMistakes` returns nothing there
  (`index.ts:480`), as the other four Latin games' specs say of theirs.
- **The spec does not say at what tier the hint deduces.** `buildSteps` caps
  the recording solve at the board's tier, and at Hard on an Unreasonable
  board (`index.ts:606`); Keen's, Towers', Unequal's and Mathrax's specs each
  say so.
- **Group offers no sticky pencil preference and no auto-pencil**, alone
  among the five (`prefs`, `index.ts:821`), so a secondary press there selects
  one cell and latches nothing (`engine-notes`, "An unoffered pencil
  preference is read from its absence"). The spec has no `Preferences`
  requirement; the scenario of "Controls: Group selects a cell through the
  shared note-taking cell" now gives the secondary press.
- **"Description: A Group description is validated against the grid area"**
  says the refusal tells "not enough data" from "too much"; the words a
  player reads are the collection's too-short and too-long kinds
  (`engine-params`, "A description error kind says what went wrong for the
  player").

## Review

8 rows read, each against the declaration or the requirement it names, read
whole; 1 row corrected (a clause more cut), 2 rows added, and nothing
restored.

Changed:

- **"Controls: Group selects a cell through the shared note-taking cell"
  added.** The writer filed under Found that the subject never says how a
  cell is selected; rule 2 asks for the sentence, and the other four games
  have it. The Found item went with it.
- **"Look: Group draws its legend, marks and errors"** lost "highlight the
  selection" and "flash on completion", two clauses of the collection's that
  the writer filed under Found and left. Each has one requirement that states
  all of it. The Found item went with it. "And flashes" went from the
  scenario of "Rules: A Group board is solved by a group table" for the same
  reason, in that requirement's row.
- **Engine requests** reworded under the five names the five ledgers share.
  Group's spec states only the first; the second and third are in its code
  and under Found.

Checked and found sound:

- Every engine title the spec cites is exact (`spec-citations` resolves
  them), and each requirement a row names states all of what the row removed.
  "It SHALL refuse while such a mark set stands" follows from two
  requirements, each whole: the note is a mistake (`ts-engine`), and a
  mistake refuses the hint (`engine-hints`, "The midend SHALL refuse a hint on
  a finished or wrong board before asking the game").
- The declarations: `bounds` (`index.ts:770`), `difficultyItem` (`:773`), the
  modifier's `only` (`:783`), `prefs` (`:821`).
- The new sentences against the code: `findMistakes` solves from
  `state.immutable` alone; `leads` hands over every recorded placement, and
  every single until the notes are set up (`index.ts:628`); `groupValid`
  refuses a full grid whose two bracketings of a triple differ
  (`solver.ts:322`); Group's `newUi` states the implicit reading
  (`state.ts:313`).
- The engine requests' claim that no capability states them: `engine-notes`,
  `engine-input`, `ts-engine`, `engine-hints`, `engine-candidate-hints`,
  `engine-difficulty` and `engine-params` searched for the entry arm, an
  empty check on an unsolved puzzle and the hint's tier. None states any.
- Each subject read alone: none hollow, no dangling antecedent, every title
  fits its body. `Generation` and `Solver` each name where the tier's promise
  is stated or state Group's own.
- Left: the hand-written codec and keypad; the three `Found` items the spec is
  silent on (the empty check, the hint's tier, the description's words), which
  are not a reviewer's to add.

## Second pass

Applied the brief's "A pointer is for that case only". 6 citing sentences or
clauses read: 3 removed, 2 kept as the subject's one pointer, 1 kept as a
departure.

Removed, each a copy with a citation in a subject that says plenty of Group's
own (the rows above say where each is stated):

- **"Rules: Group's mistake check re-solves from its givens"**: "SHALL report
  what the collection's check reports (`engine-hints`, …, and `ts-engine`,
  …), against" reworded out; the sentence keeps what the answer is re-solved
  from, and the outline sentence stays.
- **"Params: Group's parameters"**: "each a field of its `paramConfig`, which
  declares the size's range and the tiers" reworded out. `Params` holds four
  more requirements of Group's own, the tier letters among them.
- **"Generation: A Group board is a group from the data table"**: "What the
  board promises at its tier SHALL be the collection's (`engine-difficulty`,
  …), with no departure." removed. `Generation` says what each tier adds,
  where a board's solution comes from and what an identity-hidden board
  blanks, "still … solvable at its difficulty afterward" included.

Kept as a pointer: "Group SHALL take its selection from the engine's
note-taking cell (`engine-notes`, …)", the one place `Controls` says how a
cell is selected; and the first sentence of "Hint: Group's own placements
lead the eliminations", the one place `Hint` says where the plan beyond
Group's own rung is stated.

Kept as a departure: "(the modifier's `only`)" in "Params: Hiding the
identity leaves every tier but Easy", which names the declaration beside the
reason the declaration cannot give.

Preferences: Group declares none and the cut removed none.

Each subject read alone after the edits: no fragment, no dangling pronoun,
every title fits its body. The Review's line that `Generation` names where
the tier's promise is stated no longer holds of `Generation`; the row says
where.

## Third pass

Rows of the engine's third-round tables that name Group: 1 (and a mention in
the mistake check's row, as a game that does it and does not say it). Engine
requests of its own: 4. Cut: 1 sentence, in 1 requirement. Clauses kept: 3.

Cut: the last sentence of **"Look: Group draws its table on a quiet surface,
with a given's cell lifted"**, "The selection's wash and its pencil-mode
corner SHALL be drawn over whichever surface the cell has."; the row above
says where it is stated.

Kept:

- **The entry sentences** of "Controls: Backspace, Space and Clear empty the
  selected Group cells" and "Controls: A letter key enters its element": the
  entry arm, left the games' own.
- **"On a hidden cursor the first such press SHALL only show it"**, in
  "Controls: Shift and an arrow move the cursor's row or column": an arrow
  that is an action of the game's own, which `engine-notes`, "The highlight
  is the game's keyboard cursor" hands to the game.
- **The first sentence of "Hint: Group's own placements lead the
  eliminations"**: the subject's one pointer to the shared plan.

No "no departure" sentence, and none of the form "What a pasted game ID opens
as". The spec was searched for the third round's other rules in other words
(an empty mistake check, the hint's cap beneath Unreasonable, a sentence that
leads with the indication, an auto-pencil decision): none is stated.

Each subject read alone: no fragment, no dangling pronoun, every title fits
its body, and the Purpose names nothing that went.

## Found, mended

- The mistake check on a board with no one answer: left. Such a board does
  not load (`engine-params`, "A board with a mistake check loads only with
  exactly one answer"), and `ts-engine`, "A mistake check compares with the
  one answer, hidden or not" states the empty result.
- The tier the hint deduces at: added "Hint: Group's hint uses no deduction
  above the board's tier" (`Math.min(state.diff, DIFF_EXTREME)`,
  `index.ts:606`; `DIFF_EXTREME` is the tier a player reads as Hard).
  `engine-candidate-hints`, "A recording solve stops below the tier that
  searches" leaves how far beneath to the game.
- No sticky pencil preference and no auto-pencil: left, the absence of a
  declaration (`prefs`), and the scenario of "Controls: Group selects a cell
  through the shared note-taking cell" gives the secondary press.
- "Not enough data" and "too much": corrected in "Description: A Group
  description is validated against the grid area" to too short and too long
  for its board (`DESC_TOO_LONG`, `state.ts:364`; the reader's own
  too-short at the end of the string).
