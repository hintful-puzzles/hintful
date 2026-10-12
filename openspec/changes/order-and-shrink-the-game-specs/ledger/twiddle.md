# twiddle

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Twiddle is solved when its tiles read in order | title kept. "and SHALL NOT itself be solved" cut from sentence 2; sentence 3 ("The game SHALL provide `statusbarText`, `solve` and `textFormat`.") cut. The scenario is renamed "A generated board is scrambled" and loses "that is not itself the solved arrangement, and reports a not-completed status" | not solved: `engine-difficulty`, "A board that comes solved is dealt again" (`generate`, `src/engine/deal.ts:51`); the three methods: the `Game` object, `src/games/twiddle/index.ts:296`-`300`, and `ts-engine`, "Solve, the status bar and text export follow from the game's methods" |
| Params: Twiddle refuses a board smaller than its block | title kept. "each with a human-readable reason" cut. The scenario's THEN ("it returns a non-null human-readable reason") now gives the sentence `validateParams` returns | `engine-params`, "A params refusal is a sentence". The sentence: `src/games/twiddle/state.ts:103` |
| Params: Twiddle's short params are its full ones | title kept. "It SHALL refuse a character it does not know" cut, and the sentence's other half ("SHALL read `n0` as a block of 2") joined to the one before. Scenarios untouched | `engine-params`, "A params string is read whole or refused" |
| Params: Twiddle's block is at least two squares wide | removed, with its scenario "A block of one square" | `bounds: { min: 2 }` on the block-size item and `bounds: { min: 0 }` on the shuffle item, `index.ts:235` and `:273`; `engine-params`, "Params validity is the engine's check" (each item's `bounds`, named by the label its dialog shows). `src/games/twiddle/twiddle.test.ts:107` holds "Rotating block size must be at least 2." |
| Params: A Twiddle title names what departs from the basic game | removed, with its scenarios "The Type menu's boards" and "A shuffle target" | the words and their slots: `label` on the block-size item (`index.ts:236`-`239`) and on the shuffle item (`:274`-`277`), `words: "rows only"` and `words: "orientable"` with `slot: "kind"` on the two `modifierItem`s (`:246`, `:259`); the order: `engine-params`, "One describer labels every params set", and "The engine builds a modifier's help entry and label words" (said exactly when the rule applies). The `twiddle` entry of `src/engine/__snapshots__/params-stability.test.ts.snap` holds "3x3 rows only", "3x3 orientable" and "4x4, rotating 3x3 blocks", and `twiddle.test.ts:135` "5x5, 12 shuffles" |
| Controls: A click rotates the block centered on it | title kept. "`interpretMove` SHALL convert a left or right click to a rotation" and the last sentence (left anticlockwise, right clockwise) cut. The offset and the refusal of a block off the grid kept, reworded to stand alone ("A click SHALL be offset", "make no move" for "reject"); "and mapping the result to grid coordinates" cut with the clause it explained. Scenario untouched | `targetVerbs.primary` ("rotate it anticlockwise") and `.secondary` ("rotate it clockwise"), `index.ts:98`-`105`; `engine-input`, "The engine owns a declaring game's press and select keys". That anticlockwise is `dir +1` stays in "Controls: Letter and numpad keys rotate fixed blocks" |
| Look: The Twiddle completion flash lights each tile's face | title kept. Sentence 1 ("The completion flash SHALL sweep the tiles diagonally, a tile's position being its place in the grid") cut. Sentence 2 reworded to stand without it ("A tile the completion flash lights SHALL have its face filled" for "A lit tile's face SHALL be filled"). Scenario untouched | `ts-engine`, "A game gives each element a position, and the route is which position it gives" ("`sweepStep` of its center otherwise: a diagonal from the bottom left to the top right"). `flash.win(sweepStep(tx, ty))`, `src/games/twiddle/render.ts:348` |

## Kept, and why

- **Params: Twiddle params are written WxHnN with trailing flags** and
  **Params: Twiddle's short params are its full ones.** `encodeParams` and
  `decodeParams` are written out (`state.ts:65`-`100`); the field list in the
  first sentence is what the letters are of. "A missing `nN` as `n = 2`" is
  what a missing field decodes to.
- **Params: Twiddle refuses a board smaller than its block**, "an
  unreasonably large `w·h`". `engine-params`, "A grid too large for a game is
  refused in one sentence" gives the sentence and leaves the refusal to the
  game.
- **Controls: A click rotates the block centered on it**, the offset and the
  bounds. They are the `size` and `border` functions Twiddle hands
  `squareGrid` (`index.ts:93`-`94`), and the `does` strings say only "it".
- **Controls: The Twiddle cursor moves over the rotation origins**, "clamped
  at the edges without wrapping". `engine-input`, "A bounded-grid cursor is
  driven through `moveCursor`" says the clamp or the wrap is the helper's and
  not which one a `squareGrid` game gets.
- **Controls: Each Twiddle letter and keypad digit has its block**, "Each of
  these keys SHALL act wherever the cursor is, shown or not". They are an arm
  of `interpretMove` tried before the model (`fixedBlockKey`, `index.ts:126`),
  and not verbs' keys, which on a hidden cursor would only show it.
- **Solver: Solve replaces the grid with the solved arrangement.** `ts-engine`,
  "Solve leaves a solved board" says the board is left solved; that the
  orientations clear and the move counts as one is `executeMove`'s
  (`index.ts:165`).
- **Status bar.** The words are `statusbarText`'s, hand-written; the
  completion words are not restated.
- **Look: A rotation animates…**, "proportional to `sqrt(n−1)`": `animLength`
  is a function of the block size (`render.ts:82`), not a constant.
- **Look: The Twiddle completion flash lights each tile's face**, its one
  sentence. `engine-colors`, "A solved flash drawn as a color takes a shared
  color" says a tile's ground is filled and keeps what it holds; "inside its
  bevel" it gives only by a scenario, and that the orientation mark is among
  what stays is the game's.

## Engine requests

- "A tile the completion flash lights SHALL have its face filled with a flash
  color inside its bevel, and SHALL keep its number and its orientation
  mark.", in "Look: The Twiddle completion flash lights each tile's face". Fifteen states it of itself in
  nearly the same words. Belongs in `engine-colors`, "A solved flash drawn as
  a color takes a shared color", which says the bevel stays only by its
  scenario "A flash that is not a color". `redraw`,
  `src/games/twiddle/render.ts`.
- "clamped at the edges without wrapping", in "Controls: The Twiddle cursor
  moves over the rotation origins". Belongs in `engine-input`, "A target and
  its cursor belong to the geometry" or beside it: what the arrows do to the
  cursor of a game on `squareGrid`. No spec names `squareGrid`
  (`src/engine/target-verb.ts`).

## Found

- **Twiddle's generator rules out the solved board itself**
  (`state.ts:370`, `:408`), as Fifteen's does, though `generate`
  (`src/engine/deal.ts:48`) deals a solved board again for every game.
- **"Controls: Letter and numpad keys rotate fixed blocks" and "Controls:
  Each Twiddle letter and keypad digit has its block" state one function
  twice.** The second names which key has which block; the first adds only
  the parity condition and the capitals. One arm, `fixedBlockKey`
  (`index.ts:126`).
- **The capitals are refused nowhere on the keypad side**: a keypad digit
  with Shift still turns anticlockwise (`index.ts:130` strips Shift). The
  spec says "A keypad digit SHALL turn anticlockwise only", which holds.
- **"Rules: Twiddle is solved…" holds a `Generation` sentence** ("A
  generated board SHALL be a scramble of the solved arrangement by
  rotations"), and the spec says nowhere how long the shuffle is with no
  shuffle target (`state.ts:365`) or that the generator avoids undoing its
  own turn (`:389`).
- **"Description: Twiddle refuses a board no turns can put in order" has one
  line past the wrap** ("and the turns' sum modulo four. Where no number
  repeats"). Left.
- **Twiddle has no `hint`**, so by the doctrine it is a draft; the spec has
  no `Hint` subject and owes none.
- **`Controls` does not say which button turns a block which way, or what
  Enter and Space do at the cursor.** Both are the declaration's
  (`targetVerbs`, `index.ts:98`-`105`) and the collection's (`engine-input`,
  "The engine owns a declaring game's press and select keys"), and the spec
  held only the buttons before the cut.

## Review

7 rows read, each against the declaration or the requirement it names, read
whole; 2 rows corrected, no sentence restored.

Changed:

- **"Controls: A click rotates the block centered on it"**: the sentence
  sending the reader to `targetVerbs` stood where the two copied clauses
  had, at their length, in a subject with four requirements of the game's
  own. Removed; the row says where the buttons are stated, and the offset
  and the bounds stand alone.
- **"Look: The Twiddle completion flash lights each tile's face"**: the
  first sentence, cut to "its tiles, each at the position of its place in
  the grid" with a citation, was still the collection's. Removed, and the
  next sentence reworded so "lit" has its flash.

Checked and found sound:

- `engine-params`, "A params string is read whole or refused" binds every
  game's `decodeParams`, so it states the cut refusal of an unknown character
  for this hand-written decoder (`unreadParams`, `state.ts:97`).
- The scenario's new THEN, "Width must be at least the rotating block size.",
  is `validateParams`'s for `w < n` (`state.ts:103`); run through
  `paramsError` on `twiddleGame`, the default params with `w: 2, n: 3` give
  that sentence, short and full. The bound `min: 2`
  and the four label declarations are where the rows say; the slots give the
  removed title's order through `engine-params`, "One describer labels every
  params set".
- Both engine requests stand. The bevel: as in Fifteen's ledger. The cursor:
  no spec names `squareGrid`; `engine-input`, "A target and its cursor
  belong to the geometry" leaves how the arrows move the cursor to the
  geometry, and "A bounded-grid cursor is driven through `moveCursor`" says
  the clamp or the wrap is the helper's and not which.
- Every kept requirement read by sentence: none is a copy. The 9 engine
  titles the ledger cites are exact.
