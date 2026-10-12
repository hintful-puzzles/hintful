# fifteen

Purpose: "the params encoding" reworded to "where its params are declared".

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Controls: A click slides only along the gap's row or column | Found, mended: the last sentence gains "and does nothing where the gap has no tile on that side" (`gridCursorMove` answers null off the edge, `src/games/fifteen/index.ts:125`). Scenarios untouched | |
| Look: Fifteen draws beveled numbered tiles in a recessed border | Found, mended: the scenario "First draw emits the border and numbered tiles" says a fresh board is first drawn and what the frame holds, where it named "a recording `GameDrawing` double" and "the recorded operations", how a test is built. Sentence untouched | |
| Params: Fifteen's params are a width and a height | retitled "Params: Fifteen's params are its declared codec's". All three sentences (the two fields and `WxH`; the bare `W`; the refusal below 2) replaced by a pointer to the declaration that says the game departs nowhere and refuses nothing of its own (rule 2). Scenario "Params round-trip and lenient decode" kept as the game's one case; "A board one cell wide is refused" dropped | the fields and the minimum: `paramConfig`, `dimensionParamConfig({ bounds: { min: 2 } })`, `src/games/fifteen/state.ts:48`-`52`; the encoding: `paramsCodec(defaultParams, [dims(paramConfig)])`, `state.ts:55`; the bare `W`: `engine-params`, "The codec grammar is a prefix, tagged segments, flags and letters"; the refusal: `engine-params`, "Params validity is the engine's check" (each item's `bounds`). `src/games/fifteen/fifteen.test.ts:86` holds the 1×4 refusal and the `fifteen` entry of `src/engine/__snapshots__/params-stability.test.ts.snap` holds the strings |
| Generation: A generated Fifteen board is solvable and starts unsolved | retitled "Generation: A generated Fifteen board is one slides can solve". Sentence 1 kept; sentence 2 ("It SHALL NOT deal the solved arrangement.") cut. The scenario is renamed "A generated board is solvable" and loses its AND clause (the initial state is not solved) | `engine-difficulty`, "A board that comes solved is dealt again" (`generate`, `src/engine/deal.ts:51`) |
| Hint: Fifteen offers a greedy full-solution hint plan | title kept. "highlighting the tile it slides" cut from sentence 2. Scenario "Hint highlights the tile it moves" dropped; "Hint plan solves a solvable board" kept | `hintMarks.roles.ring` ("what the step decides: the tile to slide, filled in the hint's color."), `src/games/fifteen/index.ts:300`-`304`; that the slide is one cell from the gap is the kept sentence's "single-cell gap slide" and the kept scenario's "legal single-cell gap slides" |
| Status bar: Fifteen's status bar shows the move count | title kept. "after the engine's completion words" reworded out, and the two sentences joined. Scenario untouched | `ts-engine`, "The status bar's completion words come from the engine" ("The midend SHALL prefix them to whatever the game's `statusbarText` returns") |
| Look: A genuine Fifteen completion sweeps the tiles | retitled "Look: Fifteen's win flash lights its tiles and never the gap". Sentence 1 ("A genuine completion's flash SHALL sweep the tiles diagonally, a tile's position being its cell's place in the grid") cut. Sentence 2 reworded to stand without it ("A tile the win flash lights SHALL have its face filled" for "A lit tile's face SHALL be filled"). Sentence 3 and the scenario untouched. Third pass: sentence 2 (the face filled inside the bevel, the bevel and the number kept) cut, and sentence 3 reworded to stand as the requirement, "Fifteen's win flash SHALL light its tiles and SHALL never light the gap."; scenario untouched | the lit face: `engine-colors`, "A lit beveled tile is lit on its face and keeps its bevel"; "genuine": `ts-engine`, "The win flash plays on a forward move that solves the board"; the diagonal and the position: `ts-engine`, "A game gives each element a position, and the route is which position it gives" ("`sweepStep` of its center otherwise: a diagonal from the bottom left to the top right"). `flash.win(sweepStep(…))`, `src/games/fifteen/render.ts:203` |

## Kept, and why

- **Rules: A Fifteen slide shifts the whole line…**, "A solve SHALL replace
  the grid with the solved permutation and count as one move." `ts-engine`,
  "Solve leaves a solved board" says the board is left solved; that the move
  counts as one is `executeMove`'s (`index.ts:62`-`68`).
- **Description: …**, "so its description does not load". `engine-params`, "A
  board its game proves has no solution does not load" states the refusal
  (and its second scenario is this game). The clause is what makes
  `hasNoSolution` a statement about a description, and the scenario "Two
  tiles exchanged" gives the string and says it parses first; left whole.
- **Controls: A click slides only…**. All of it is `interpretMove`
  (`index.ts:107`). That the game has no secondary button is the declaration
  `ignoresSecondaryButton` and was never in the spec.
- **Hint: Fifteen's hintKeepTrack completes on the hinted slide alone.**
  `engine-hints`, "A player move is classified against the stored plan" says
  what each verdict does; which move earns which is `hintKeepTrack`
  (`index.ts:252`), hand-written.
- **Look: A Fifteen slide animates…**, "over the animation duration". The
  length is `animLength` (`index.ts:321`), which the sentence does not give;
  the interpolation is `redraw`'s.
- **Look: Fifteen's win flash…**, "SHALL never light the gap". The gap is
  no element the flash is given, which is the game's choice in `redraw`.

## Engine requests

- "A tile the win flash lights SHALL have its face filled with a flash color
  inside its bevel, and SHALL keep its bevel and its number.", in "Look:
  Fifteen's win flash lights its tiles and never the gap". Twiddle states it of itself in nearly the
  same words. Belongs in `engine-colors`, "A solved flash drawn as
  a color takes a shared color", which says a tile's ground is filled and
  keeps what it holds, and says the bevel stays only by its scenario "A flash
  that is not a color". The code is each game's `redraw` passing a flash
  color as the face to `drawRaisedTile` (`src/games/fifteen/render.ts:255`).
  Answered: `engine-colors`, "A lit beveled tile is lit on its face and keeps
  its bevel".

## Found

- **Fifteen's generator rules out the solved board itself**, in a loop of
  its own with its own retry limit (`state.ts:154`, `:192`), though
  `generate` (`src/engine/deal.ts:48`) deals a solved board again "so no game
  has to rule one out itself". A second copy in code, harmless.
- **The spec never says the right button does nothing**, nor that a held
  touch is a click (`ignoresSecondaryButton`, `index.ts:273`). The
  declaration says it; nothing under `Controls` sends the reader there.
- **"Controls: …" says "Cursor keys SHALL slide the adjacent tile into the
  gap immediately"** and not what an arrow does when no tile is on that
  side: `interpretMove` answers null (`index.ts:125`).
- **Scenario "First draw emits the border and numbered tiles" names a
  recording `GameDrawing` double**, which is how a test is built and not a
  case of the game. Left.

## Review

5 rows read, each against the declaration or the requirement it names, read
whole; 2 rows corrected, no sentence restored.

Changed:

- **"Hint: Fifteen offers a greedy full-solution hint plan"**: "its tile
  marked as the legend (`hintMarks`) says" stood where "highlighting the tile
  it slides" had, a pointer of the copy's length in a subject that says
  plenty of its own. Removed; the row says where the mark is stated.
- **"Look: Fifteen's win flash lights its tiles and never the gap"**: the
  first sentence, cut to "its tiles, each at the position of its cell" with a
  citation, was still the collection's (`sweepStep` of an element's center)
  and the tiles are named by the two sentences after it. Removed, and the
  next sentence reworded so "lit" has its flash.

Checked and found sound:

- The Params pointer: Fifteen has no `validateParams`, its one bound is
  `min: 2` on both dimensions, and `4x4`, `4` and `5x4` decode as the kept
  scenario says. Kept as a pointer: without it `Params` is hollow.
- `engine-difficulty`, "A board that comes solved is dealt again" states all
  of the cut sentence and the scenario's AND clause; `ts-engine`, "The status
  bar's completion words come from the engine" states the prefix.
- The engine request stands: `engine-colors`, "A solved flash drawn as a
  color takes a shared color" says a tile's ground is filled and keeps what
  it holds, and names a bevel only in a scenario; `ts-engine`,
  `engine-drawing` and `engine-hints` say nothing of a lit tile's bevel.
- Every kept requirement read by sentence: none is a copy. The 6 engine
  titles the ledger cites are exact, and its 12 line citations are where it
  says.

## Third pass

What the engine's third round states, removed. 1 row of the third-round
tables names Fifteen (the lit beveled tile), and this ledger's one request
was answered by it.

Cut, 1 sentence: **"A tile the win flash lights SHALL have its face filled
with a flash color inside its bevel, and SHALL keep its bevel and its
number."**, in "Look: Fifteen's win flash lights its tiles and never the
gap": `engine-colors`, "A lit beveled tile is lit on its face and keeps its
bevel".

Kept, 1 clause: "The gap SHALL never be lit", by the engine table's word,
reworded to stand as the requirement ("Fifteen's win flash SHALL light its
tiles and SHALL never light the gap."); the title and the scenario fit it
as they stood.

No sentence of the brief's section 2 stood in the spec, and a search for the
round's other rules in other words found none.

Each subject read alone: none hollow, no fragment, every title fits. The
Purpose names nothing that went.

## Found, mended

- The generator rules out the solved board in a loop of its own: left: code,
  which the main session is fixing.
- The right button does nothing and a held touch is a click: left: the
  declaration's (`ignoresSecondaryButton`), and `Controls` says plenty of the
  game's own, so it takes no pointer.
- What an arrow does when no tile is on that side: stated in "Controls: A
  click slides only along the gap's row or column".
- The scenario "First draw emits the border and numbered tiles" named a
  recording `GameDrawing` double: reworded to the case of the game.
