# keen

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Keen flags mistakes against its unique solution | retitled "Rules: Keen's mistake check re-solves from the cage clues". Sentence 1 (implement `findMistakes`; a wrong digit is a `"cell"`, notes that cross out the answer a `"note"`) replaced by one that names the two shared requirements and keeps what is Keen's: the answer is re-solved from the cage clues alone. Sentence 2 (empty when the clues do not solve to one answer) kept, reworded to stand. Scenario "A wrong digit and a wrong note are flagged" dropped; scenario "A wrong digit its cage allows" written as the game's case | a wrong entry: `engine-hints`, "Check & Save names a wrong entry in every game"; a note set that leaves out the answer, extra candidates not reported, the answer never taken from what the player entered: `ts-engine`, "A candidate note that excludes the answer is a mistake" (its first scenario is the dropped one). The two kinds are `KeenMistake`, `src/games/keen/index.ts:119`; the check, `index.ts:292` |
| Params: Keen's parameters | title kept. Sentence 1 reworded to say the three params are the fields of `paramConfig`, which declares the size's range; sentence 2 (the tier keys) kept; sentence 3 (refused outside `3 ≤ w ≤ 9`) cut. Scenario "Invalid params are rejected" dropped; scenario "The Tricky preset" written from the params snapshot | `bounds: { min: 3, max: 9 }` on the `grid-size` item, `index.ts:424`; `engine-params`, "Params validity is the engine's check" (each item's bounds, the refusal names the field; its first scenario is the dropped one). `6dh` and "6x6 Tricky": the `keen` entry of `src/engine/__snapshots__/params-stability.test.ts.snap` |
| Params: Keen's params encoding | sentence 2 (a `d` followed by a letter that is none of the five, or by nothing, is refused) cut. Scenario "A difficulty letter that names no tier" dropped; "Params round-trip" kept | `engine-params`, "A params string is read whole or refused" (a letter the tag does not list, a tag with nothing after it; its first two scenarios) and "The engine makes the one refusal of a params string" (the sentence, through `paramsLetter`). Keen's call: `paramsLetter(s, i + 1, DIFF_CHARS)`, `src/games/keen/state.ts:129` |
| Params: A Keen label ends in multiplication only for a product-only puzzle | removed | `label: { slot: "tail", words: … "multiplication only" }` on the `multiplication-only` item, `index.ts:438`; `engine-params`, "One describer labels every params set" (`size[ tier][, tail…]`). The snapshot above holds "6x6 Normal, multiplication only" |
| Generation: Keen generates boards uniquely solvable at exactly the requested difficulty | retitled "Generation: A Keen cage has at most six cells and a balanced mix of clues". Sentence 1 (solvable at `diff` and not at `diff − 1`) replaced by one that names the two shared requirements and says Keen departs from neither; sentence 2 (cage area, the mix of clues) kept; sentence 3 (regenerates under a capped backstop that throws) cut. The scenario keeps its last clause as "The cages of a dealt board" and loses its first two | `engine-difficulty`, "Every tier promises one solution found at its cap" and "A difficulty tier binds the board it generates" (both directions, and the dropped clauses as its first scenario); the bounded loop: `engine-difficulty`, "Every generate-until-success loop is bounded by the shared retry limit", and `retryLimit` at `src/games/keen/generator.ts:108` |
| Controls: Keen selects a cell through the shared note-taking cell | the first sentence gains the citation of the requirement it sends the reader to; nothing else changes | |
| Controls: Keen provides on-screen key labels | removed | `requestKeys: (p) => digitKeys(p.w)`, `index.ts:491`; `engine-input`, "Games may expose on-screen key labels" and "A key label carries its resolved text" (whose scenario is `digitKeys(3)`: the digits, then `"Clear"` on `CLEAR_BUTTON`) |
| Hint: Keen provides an explained deduction hint | retitled "Hint: Keen's hint is the shared candidate plan over rows and columns". Sentence 1 (teaches the next deduction in pencil-notes terms) replaced by a pointer to the shared plan and its row/column preset, saying what Keen supplies (rule 2: the subject's ordinary case was stated nowhere). Sentence 2 (capped below recursion, because a guess is not a teachable strike) cut. Scenario "A hint on an Unreasonable board" moves, unchanged, to "Hint: Keen's hint deduces at the tier of the board's params"; scenario "A single on a Keen board" written | pencil-notes terms: `engine-candidate-hints`, "A shared candidate-elimination hint plan"; the cap: this spec's "Hint: Keen's hint deduces at the tier of the board's params" ("capped at Hard"), and its reason `engine-hints`, "A Search is refused and never narrated". Keen's call: `runLatinCandidatePlan`, `index.ts:368`; the single's sentence: `narrateLatinReason`, `index.ts:341` |
| Hint: A cage elimination is one firing, struck as one journey | retitled "Hint: A cage elimination is one firing, and a firing is one cage's". Sentence 3 (struck through `pencilStrike` moves linked as one journey, every struck cell in the acted-on color) cut; sentences 1 and 2 and both scenarios untouched | the move and the journey: `engine-candidate-hints`, "The walk builds every step from the game's words" (the walk adds the move) and "A firing is emitted whole" (later legs `continuesPrevious`; its scenario names Keen's cage); the mark: `engine-hints`, "A hint marks beside the content, never behind it" (the acted-on cell is ringed whether the step places or strikes) |
| Hint: A cage deduction's sentence names the cage by its clue | ", then end in a necessity-voice conclusion" reworded out of the one sentence; both scenarios untouched | `engine-candidate-hints`, "A candidate strike SHALL end in the walk's conclusion" (a game gives a premise and the walk ends the sentence) |
| Hint: Keen's hint deduces at the tier of the board's params | gains the scenario "A hint on an Unreasonable board" from "Hint: Keen provides an explained deduction hint" | |
| Look: The selection is drawn under the clue, and the hint's ring in the gutter | retitled "Look: The hint's ring and its outline are drawn in the gutter". Sentence 1 (the wash and the pencil-mode corner over the cell's surface, under the cage's clue) cut; sentence 2 kept. Scenario "A cage's minimal cell is selected for a pencil mark" dropped; scenario "A hint rings a cell inside a cage" written | `engine-notes`, "The highlight is part of the cell's background" (drawn with the background and before any content, "so a clue, a mark or a divider in the same corner stays on top of it", which is the dropped scenario). Keen's call: `cellHighlight`, `src/games/keen/render.ts:41`; the new scenario: `markBand`, `render.ts:423` |

## Kept, and why

- **Rules: … re-solves from the cage clues**, "the result SHALL be empty". No
  shared requirement says what a check reports of a board its solver does not
  finish to one answer; `engine-params`, "A board with a mistake check loads
  only with exactly one answer" keeps such a board from loading and says
  nothing of the check.
- **Params: Keen's parameters**, the tier keys. The codec is hand-written
  (`DIFFS`, `state.ts:47`), and the scenarios of four requirements write
  `diff: "hard"` for Tricky.
- **Params: Keen's params encoding.** `encodeParams` and `decodeParams` are
  functions (`state.ts:100`, `:123`), not a declared codec.
- **Params: A 3×3 Keen…** and **A multiplication-only 9×9…**. `engine-difficulty`,
  "An unbindable tier is refused, not silently downgraded" and "A tier too
  rare to deal says so" give the form; which size and tier is Keen's.
- **Controls: Keen interprets digit, pencil, and mark-all input.**
  `interpretMove` is hand-written; `engine-notes`, "A game in the mechanic
  keeps its puzzle and its own move" and `engine-input`, "The meaning of a
  digit key stays with the game" hand the entry, the bound and the meaning of
  `0` back to the game.
- **Preferences: Auto-pencil strikes a placed digit from its row and column.**
  `engine-notes`, "The pencil preferences have one key each, which a saved
  preference depends on" leaves where the strike reaches to the game.
- **Hint: A cage elimination…**, scenario "A cage elimination is taught as a
  note strike". It is the one place the cage's stripes and the cell's ring
  are tied to the cage step.
- **Look: Keen shows rule violations and mistakes on the board.** The only
  statement of which cells are in error as the board stands.
- **Look: The hint's ring and its outline are drawn in the gutter.**
  `engine-hints`, "A hint mark is drawn on the cell's border" leaves gutter or
  inset to the game's layout, and Keen's heavy cage boundary is the case that
  requirement would inset.

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
  Keen's sentence: "With a cell highlighted, a digit key `1..w` SHALL enter
  that digit, or in pencil mode toggle that pencil mark, and backspace or
  space … SHALL clear the cell. … In pencil mode no key SHALL change a cell
  that holds a digit.", in "Controls: Keen interprets digit, pencil, and
  mark-all input". Code: `index.ts:182`-`206`, around `noOpEntryResult` and
  `releaseHighlightAfterEntry` of `src/engine/note-taking-cell.ts`. Stays
  Keen's: the bound `w`, and `0` as a clear (`engine-input`, "The meaning of a
  digit key stays with the game").
- **A mistake check reports nothing where the puzzle does not solve to one
  answer.** Where the game's solver, asked from the clues and givens, finds no
  answer or more than one, `findMistakes` reports nothing. Home: `ts-engine`,
  beside "A mistake check compares with the one answer, hidden or not".
  Keen's sentence: "When the clues do not solve to exactly one answer the
  result SHALL be empty.", in "Rules: Keen's mistake check re-solves from the
  cage clues". Code: `index.ts:299`, before `entryMistakes`
  (`src/engine/entry-mistakes.ts`).
- **A candidate hint's recording solve runs at the board's tier, and no higher
  than the top tier below Unreasonable.** Home: `engine-candidate-hints`,
  beside "A recording solve reads the placed entries and never the notes".
  Keen's sentence: "The hint's recording solve SHALL run at the tier of the
  board's own params, capped at Hard", in "Hint: Keen's hint deduces at the
  tier of the board's params". Code: `index.ts:367`.
- **Auto-pencil strikes a placed value from the other cells of its no-repeat
  regions.** In these four games the regions are the row and the column.
  Home: `engine-notes`, beside "The pencil preferences have one key each,
  which a saved preference depends on", which leaves the reach to the game.
  Keen's sentence: "With auto-pencil enabled, a real placement SHALL
  additionally strike that digit from the pencil marks of every other cell in
  its row and column.", the whole of "Preferences: Auto-pencil strikes a
  placed digit from its row and column". Code: `index.ts:233`-`239`.
- **The auto-pencil decision is recorded on the move.** Keen's spec does not
  state it; its `set` move carries `autoElim` (`index.ts:204`). See
  `towers.md`.

One more, Keen's alone among the five:

- "The cursor keys SHALL move the highlight.", in "Controls: Keen selects a
  cell through the shared note-taking cell". `engine-input`, "One arrow press
  reveals the cursor and moves it" says it of the cursor, and no requirement
  of `engine-notes` says the arrows move the note-taking highlight, which is
  that cursor. Belongs in `engine-notes`, beside "The select key on a showing
  highlight toggles pencil mode". Code: `moveCursor`, `index.ts:176`.

## Found

- **The spec does not say what a params string with no `d` decodes to.**
  `decodeParams` starts from `defaultParams`, so `6` is Normal
  (`state.ts:96`, `:124`). The codec is hand-written, so no declaration
  holds it, and an old link depends on it.
- **A board loaded by an ID with no tier is graded, not left at Normal**
  (`engine-difficulty`, "A loaded board whose id states no tier takes the
  lowest tier that solves it"), so "the tier of the board's own params" in
  "Hint: Keen's hint deduces at the tier of the board's params" is the graded
  tier there.
- **"Controls: Keen interprets digit, pencil, and mark-all input" says nothing
  of Mark-all**, which its title names. The press is the engine's
  (`engine-notes`, "The Mark-all press is the engine's, from the game's
  hook"), and that a cage is no uniqueness region is `engine-notes`, "An
  obvious candidate is judged only against placed values". The spec's
  `Controls` do not say where Mark-all, the Enter key's toggle of pencil mode
  or the sticky preference are stated; the Purpose does.
- **"Description: A malformed Keen description is refused", scenario
  "Malformed description is rejected"** restates its sentence and gives no
  case.
- **"Look: Keen shows rule violations and mistakes on the board" holds a
  `Rules` fact** (which cells are in error as the board stands) under `Look`.
- **The 9×9 refusal's reason differs between spec and help field.** The spec
  says a multiplication-only 9×9 above Tricky "exists and takes too long to
  find"; the `multiplication-only` item's `doc` (`index.ts:437`) says such
  puzzles are "rare above Tricky, and at 9x9 above Normal". `validateParams`
  refuses only above Tricky (`state.ts:114`); the doc's "above Normal" is
  about rarity and not refusal, so neither is false.

## Review

11 rows read, each against the declaration or the requirement it names, read
whole; 0 rows corrected, 1 row added, and nothing restored.

Changed:

- **"Look: The selection is drawn under the clue, and the hint's ring in the
  gutter"** cut to its second sentence and retitled. The writer kept the first
  as the second's antecedent; the second stands without it, and `engine-notes`,
  "The highlight is part of the cell's background" states all of the first,
  the clue in the same corner included. The new scenario is `markBand`'s
  (`src/games/keen/render.ts:423`): the band is the gutter's width and takes
  nothing inside the tile.
- **Engine requests** reworded under the five names the five ledgers share,
  and a sixth added that is Keen's alone: "The cursor keys SHALL move the
  highlight" reads the same with any note-taking game's name, and
  `engine-input` says it of the cursor without `engine-notes` saying that the
  highlight is that cursor. Two requirements in two files, so it stays.

Checked and found sound:

- Every engine title the spec cites is exact (`spec-citations` resolves them),
  and each requirement a row names states all of what the row removed.
- The declarations: the size's `bounds` (`index.ts:424`), the tail label's
  words (`index.ts:438`-`441`), `requestKeys` as `digitKeys(p.w)`
  (`index.ts:491`), `paramsLetter` (`state.ts:129`), `retryLimit`
  (`generator.ts:108`).
- The new sentences against the code: `findMistakes` solves from
  `state.clues` into an empty grid (`index.ts:297`); a placement's sentence is
  `narrateLatinReason`'s and a cage reason never places (`index.ts:338`-`341`);
  Keen's `newUi` states the default reading (`state.ts:472`), so "with no
  departure" holds.
- The quoted strings: `6dh` and "6x6 Tricky" are one line of the params
  snapshot.
- The four requests' claim that no capability states them: `engine-notes`,
  `engine-input`, `ts-engine`, `engine-hints`, `engine-candidate-hints`,
  `engine-difficulty` and `engine-params` searched for the entry arm, an empty
  check on an unsolved puzzle, the hint's tier and where auto-pencil reaches.
  None states any: `engine-notes`, "A game in the mechanic keeps its puzzle
  and its own move" gives the move to the game, "The pencil preferences have
  one key each…" gives the reach to the game, and `engine-params`, "A board
  with a mistake check loads only with exactly one answer" speaks of loading
  and not of the check.
- Each subject read alone: none hollow, no dangling antecedent, every title
  fits its body.
- Left: the hand-written codec, and every kept `Look` requirement but the one
  above, each a decision about Keen's own cage lines, clues and error cells.
