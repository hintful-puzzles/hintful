# mathrax

The Purpose's "what its generator promises of a board at each tier" became
"what separates its tiers" (second pass): the promise is the collection's and
the spec no longer points at it.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Mathrax flags mistakes against the unique solution | retitled "Rules: Mathrax's mistake check re-solves from its givens and clues". Sentences 1 to 3 (provides `findMistakes`; a wrong digit and notes that have crossed out the answer; extra candidates not flagged) cut to what the answer is re-solved from (second pass: the sentence no longer names the two shared requirements). Sentence 4 (nothing flagged when not uniquely deducible) cut (third pass). Scenario "A wrong placed digit is flagged" dropped; scenario "A wrong digit that breaks no rule" written as the game's case | nothing flagged where the givens and clues do not solve to one answer: `ts-engine`, "A mistake check compares with the one answer, hidden or not"; `engine-hints`, "Check & Save names a wrong entry in every game"; `ts-engine`, "A candidate note that excludes the answer is a mistake" (notes, extra candidates, the answer from clues and givens; its first scenario is the dropped one). The check: `src/games/mathrax/index.ts:338` |
| Params: Mathrax's parameters are a size, a difficulty and a set of clue types | removed | the three params and the six clue types: `paramConfig`, `index.ts:560`, with `CLUE_OPTIONS`, `index.ts:466`; the top tier's name: `DIFF_NAMES = tierNames(4, { search: true })`, `src/games/mathrax/state.ts:50`, and `engine-difficulty`, "Unreasonable is declared and never issued by position"; its character `r`, the encoding and the empty clue set: this spec's "Params: Mathrax's params are the size, a tier letter and the clue-type letters"; the round trip: `engine-params`, "Encode and decode are mutual inverses over the corpus". The `mathrax` entry of `src/engine/__snapshots__/params-stability.test.ts.snap` holds `5dr` and `6dr` |
| Params: Mathrax refuses a size, a difficulty or a clue-type set it cannot play | retitled "Params: Mathrax refuses to deal with no clue type enabled". Sentence 1 (sizes 3 to 9, a size outside refused) cut (second pass: "The range of the size SHALL be the one its `paramConfig` item declares", which stood in its place, went too); sentence 2 kept. Scenario "A size below the bound is refused" dropped; scenario "Every clue type unchecked" written from the code's sentence | `bounds: { min: 3, max: 9 }`, `index.ts:564`, and `engine-params`, "Params validity is the engine's check" (whose first scenario is the dropped one). The refusal's sentence: `validateParams`, `state.ts:234` |
| Params: Mathrax offers only the difficulties a size can support | title kept. Sentence 2 (rejected for a full parameter set and accepted otherwise, so a saved game or an ID with its description loads) cut (second pass: "The refusal SHALL bind generation only, as the collection's does", with its citation, went too; sentence 1 says "refuse to *generate*" and the scenario's last clause gives the load). Sentences 1, 3 and 4 and the scenario untouched | `engine-difficulty`, "An unbindable tier is refused, not silently downgraded" (reported through validation, generation only, a saved game or an ID with its description still loads) |
| Generation: Mathrax grades its difficulty tiers honestly | retitled "Generation: An ambiguous verdict does not let Mathrax's generator keep removing". Both sentences (not soluble a tier below; a bounded retry) cut; the second pass also removed the sentence that named the two shared requirements in their place, and the scenario "A Tricky board genuinely needs the Tricky tier". The requirement now holds the second sentence and the scenario of "Generation: A Mathrax board has one solution at every difficulty" | `engine-difficulty`, "A difficulty tier binds the board it generates" (its scenario "A board generated above the easiest tier needs that tier" is the dropped one) and "Every tier promises one solution found at its cap"; the bounded loop: `engine-difficulty`, "Every generate-until-success loop is bounded by the shared retry limit", and `retryLimit` at `src/games/mathrax/generator.ts:176` |
| Generation: A Mathrax board has one solution at every difficulty | removed. Sentence 1 (uniqueness at every difficulty, `Unreasonable` included) goes; sentence 2 (an ambiguous verdict is no ground to keep removing) and the scenario "Even the guess-and-verify tier yields a unique solution" move to "Generation: An ambiguous verdict does not let Mathrax's generator keep removing", the scenario unchanged and the sentence with "While it removes givens and clues from a board" put before it so that it stands alone (`stripGridClues` and `stripMathClues`, `src/games/mathrax/generator.ts:115` and `:140`) | `engine-difficulty`, "Every tier promises one solution found at its cap" ("No tier SHALL promise anything but a board with one solution") and `engine-params`, "A board with a mistake check loads only with exactly one answer" |
| Controls: Mathrax input and keypad | retitled "Controls: Mathrax enters digits through the shared note-taking cell". "The Solo-style control scheme: a cell is selected by left-click or cursor, for ink outside pencil mode and for pencil marks in it" replaced by one sentence that says where the selection is stated; the entry and clear keys reworded to stand as their own sentence; the pencil-mode and given sentences kept; the keypad sentence cut. All three scenarios untouched | the selection: `engine-notes`, "The note-taking cell is one shared mechanic" and the requirements after it (`pressNoteTakingCell`, `index.ts:189`); the keypad: `requestKeys: (p) => digitKeys(p.o)`, `index.ts:631`, and `engine-input`, "A key label carries its resolved text" |
| Preferences: Mathrax offers the sticky pencil and auto-pencil preferences | retitled "Preferences: Auto-pencil strikes a placed digit from its row and column". Sentence 1 (offers the two preferences) cut; sentence 2 kept without "both on the board and in the hint's plan". Scenario untouched | `autoPencilPref`, `stickyPencilPref`, `index.ts:634`-`637`; `engine-notes`, "The pencil preferences have one key each, which a saved preference depends on"; the hint's plan: `engine-candidate-hints`, "A placement's cull continues its journey" (with auto-pencil on no cull step is emitted and the placement's move carries it) |
| Hint: Mathrax's hint plan is the shared candidate-elimination walk | the first sentence gains the citation of the requirement it sends the reader to; nothing else changes | |
| Hint: The recording solve stops below the guess-and-verify tier | removed; its scenario "A board at the top tier is hinted by deduction alone" moved to "Hint: Mathrax's hint deduces at the tier of the board's params" and was dropped there in the third pass | `engine-candidate-hints`, "A recording solve stops below the tier that searches" (its first scenario is the dropped one); the reason: `engine-hints`, "A Search is refused and never narrated" |
| Hint: Mathrax's hint deduces at the tier of the board's params | title kept. Third pass: "and at Tricky where they name `Unreasonable`" reworded out, the sentence now bound to params that name a tier below `Unreasonable`; the scenario "A board at the top tier is hinted by deduction alone", gained from "Hint: The recording solve stops below the guess-and-verify tier", dropped; "A board whose params say Easy" untouched | `engine-candidate-hints`, "A recording solve stops below the tier that searches". Mathrax's call: `src/games/mathrax/index.ts:417` |

## Kept, and why

- **Params: Mathrax's params are the size, a tier letter and the clue-type
  letters.** The codec is hand-written (`state.ts:198`, `:210`); it also
  holds what the short form decodes to.
- **Params: A Mathrax label names a restricted clue set by the shorter
  list.** The `label` is declared, but its words are a function with a rule
  of its own (`clueWords`, `index.ts:520`).
- **Params: Mathrax offers only the difficulties…**, "SHALL name the tiers
  from the game's tier list". The sentence is Mathrax's own and not the
  collection's `noSuchTier` (see Found).
- **Generation: An ambiguous verdict…**, its one sentence. No shared
  requirement says what a strip loop does with a solver verdict of more than
  one answer.
- **Controls: … through the shared note-taking cell**, the entry sentences.
  `interpretMove` is hand-written (`index.ts:213`-`240`).
- **Hint: Recording does not change what the Mathrax solver commits.**
  `engine-candidate-hints`, "A shared candidate-elimination hint plan" says
  the walk changes no solver; this is about Mathrax's recorder attributing a
  deduction clue by clue while the gate waits on all of them.
- **Hint: A clue step outlines the cells that identify its clue.** The legend
  (`hintMarks.roles.outline`, `index.ts:608`) says what is outlined; the
  requirement stays for why, which the legend does not give: the board has no
  mark for an intersection, and each set meets at one.

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
  Mathrax's sentence: "With a cell selected, a digit key SHALL enter that
  digit, or in pencil mode toggle its pencil mark, and backspace, space or
  zero SHALL clear the cell. In pencil mode no key SHALL change a cell that
  holds a digit. Immutable given cells SHALL NOT be editable.", in "Controls:
  Mathrax enters digits through the shared note-taking cell". Code:
  `index.ts:213`-`240`. Stays Mathrax's: the bound, the grid size, and `0` as
  a clear.
- **A mistake check reports nothing where the puzzle does not solve to one
  answer.** Answered: `ts-engine`, "A mistake check compares with the one
  answer, hidden or not". The sentence is cut. Where the game's solver, asked from the clues and givens, finds no
  answer or more than one, `findMistakes` reports nothing. Home: `ts-engine`,
  beside "A mistake check compares with the one answer, hidden or not".
  Mathrax's sentence: "When they do not solve to exactly one answer, no cell
  SHALL be flagged.", in "Rules: Mathrax's mistake check re-solves from its
  givens and clues". Code: `index.ts:341`.
- **A candidate hint's recording solve runs at the board's tier, and no higher
  than the top tier below Unreasonable.** Answered for the cap:
  `engine-candidate-hints`, "A recording solve stops below the tier that
  searches"; "and at Tricky where they name `Unreasonable`" is cut. Left the
  game's own: that the solve runs at the board's own tier, which is not the
  collection's rule (Rome records at every tier, Subsets at the top one), so
  that clause stays. Home: `engine-candidate-hints`,
  beside "A recording solve reads the placed entries and never the notes".
  Mathrax's sentence: "The recording solve SHALL run at the tier the board's
  params name, and at Tricky where they name `Unreasonable`", in "Hint:
  Mathrax's hint deduces at the tier of the board's params". Code:
  `index.ts:417`.
- **Auto-pencil strikes a placed value from the other cells of its no-repeat
  regions.** Answered: `engine-notes`, "An auto-pencil strike is decided when
  the placement is made", which leaves which regions to the game; Mathrax's
  sentence states the regions alone and stays whole.
  In these four games the regions are the row and the column.
  Home: `engine-notes`, beside "The pencil preferences have one key each,
  which a saved preference depends on", which leaves the reach to the game.
  Mathrax's sentence: "When auto-pencil is on a placement SHALL remove its
  digit from the pencil marks of the rest of its row and column.", the whole
  of "Preferences: Auto-pencil strikes a placed digit from its row and
  column". Code: `index.ts:271`.
- **The auto-pencil decision is recorded on the move.** Answered:
  `engine-notes`, "An auto-pencil strike is decided when the placement is
  made". Mathrax's spec does
  not state it; its `set` move carries `autoElim` (`index.ts:238`). See
  `towers.md`.

## Found

- **The size-3 refusal is a sentence of Mathrax's own where the collection
  has one.** `validateParams` returns "Size 3 has no Normal or Unreasonable
  puzzles; use Easy or Tricky." (`state.ts:242`); Keen, Towers, Unequal and
  Group refuse a tier no board of a size needs through `noSuchTier`
  ("No 3x3 puzzle is Tricky."). The spec asks only that the tiers be named as
  the menu names them.
- **A re-entered digit is handled by hand and not through `noOpEntryResult`**
  (`index.ts:223`-`227`), which the other four use. It tests only the digit
  and not the cell's notes, so clearing an empty cell that has notes is a
  move here as there, but typing the digit a cell holds is a no-op whatever
  its notes.
- **The spec's `Controls` say nothing of the Enter key's toggle, Mark-all or
  the sticky preference**, which are the collection's (`engine-notes`); the
  new first sentence sends the reader there.
- **"Hint: Mathrax's hint plan is the shared candidate-elimination walk",
  scenario "A hint with no Ui pencils in only what it needs"** names
  `pencilAll`, a move type, where the other specs say "the fill-all move".

## Review

11 rows read, each against the declaration or the requirement it names, read
whole; 0 rows corrected, and no sentence restored or cut in the spec.

Changed:

- **Engine requests** reworded under the five names the five ledgers share.

Checked and found sound:

- Every engine title the spec cites is exact (`spec-citations` resolves them),
  and each requirement a row names states all of what the row removed. Of the
  removed "Params: Mathrax's parameters are a size, a difficulty and a set of
  clue types", the two promises a game ID depends on are both still in
  "Params: Mathrax's params are the size, a tier letter and the clue-type
  letters": `r` is the fourth tier letter, and no clue letter is every clue
  type.
- The declarations: the size's `bounds` (`index.ts:564`), `CLUE_OPTIONS`
  (`index.ts:466`), `requestKeys` as `digitKeys(p.o)` (`index.ts:631`), the
  two pencil preferences (`index.ts:634`-`637`), `retryLimit`
  (`generator.ts:176`).
- The new sentences against the code: `findMistakes` solves from the givens
  and reports nothing where that gives no one answer (`index.ts:340`-`341`);
  the size-3 refusal is gated on `full` (`state.ts:241`); `newUi` states the
  implicit reading (`state.ts:626`).
- The quoted strings: "At least one clue type must be enabled." is
  `validateParams`' (`state.ts:234`).
- The four requests' claim that no capability states them, as in `keen.md`.
- Each subject read alone: none hollow, no dangling antecedent, every title
  fits its body. `Params` opens on a refusal and says what the params are in
  its third requirement, which the subject's order leaves as it stood.
- Left: the hand-written codec and the label's function (`clueWords`,
  `index.ts:520`).

## Second pass

Applied the brief's "A pointer is for that case only". 6 citing sentences or
clauses read: 4 removed, 2 kept as the subject's one pointer, 0 kept as a
departure.

Removed, each a copy with a citation in a subject that says plenty of
Mathrax's own (the rows above say where each is stated):

- **"Rules: Mathrax's mistake check re-solves from its givens and clues"**:
  "SHALL report what the collection's check reports (`engine-hints`, …, and
  `ts-engine`, …), against" reworded out; the sentence keeps what the answer
  is re-solved from.
- **"Params: Mathrax refuses to deal with no clue type enabled"**: "The range
  of the size SHALL be the one its `paramConfig` item declares." removed.
- **"Params: Mathrax offers only the difficulties a size can support"**: "The
  refusal SHALL bind generation only, as the collection's does
  (`engine-difficulty`, "An unbindable tier is refused, not silently
  downgraded"), and" reworded out. The first sentence already says the
  refusal is of generating, and the scenario that the same params load with
  a description.
- **"Generation: What a Mathrax board promises at its tier is the
  collection's"**: its pointer sentence and the scenario "A Tricky board
  genuinely needs the Tricky tier" removed, and the requirement retitled for
  the one sentence left, which gained an opening clause so that "keep
  removing" has its object. `Generation` says what separates the tiers in the
  requirement after it. The Purpose follows.

Kept as a pointer: "Mathrax SHALL take its selection from the engine's
note-taking cell (`engine-notes`, …)", the one place `Controls` says how a
cell is selected; and the first sentence of "Hint: Mathrax's hint plan is the
shared candidate-elimination walk", the one place `Hint` says where the plan
is stated.

Preferences: the cut removed "SHALL offer the collection's sticky pencil
preference and its auto-pencil preference", which named no key or choice
order.

Each subject read alone after the edits: no fragment, no dangling pronoun,
every title fits its body.

## Third pass

Rows of the engine's third-round tables that name Mathrax: 3. Engine requests
of its own: 5. Cut: 1 sentence, 1 clause and 1 scenario, in 2 requirements.
Clauses kept: 4.

Cut (the rows above say where each is stated):

- **"Rules: Mathrax's mistake check re-solves from its givens and clues"**:
  "When they do not solve to exactly one answer, no cell SHALL be flagged."
- **"Hint: Mathrax's hint deduces at the tier of the board's params"**: "and
  at Tricky where they name `Unreasonable`", and the scenario "A board at the
  top tier is hinted by deduction alone", which is the engine requirement's
  own first scenario.

Kept:

- **"SHALL run at that tier"**, now said of params that name a tier below
  `Unreasonable`: how far beneath it a game caps is its own.
- **"Preferences: Auto-pencil strikes a placed digit from its row and
  column"**, whole: the regions, and nothing of when the strike is decided.
- **The entry sentences** of "Controls: Mathrax enters digits through the
  shared note-taking cell": left the games' own.
- **"Generation: An ambiguous verdict does not let Mathrax's generator keep
  removing"**: of Mathrax's strip loop, and no copy of a tier's promise.

No "no departure" sentence, and none of the form "What a pasted game ID opens
as". The spec was searched for the third round's other rules in other words
(the wash over a cell's surface, an arrow moving the highlight, a sentence
that leads with the indication): none is stated.

Each subject read alone: no fragment, no dangling pronoun, every title fits
its body, and the Purpose names nothing that went.
