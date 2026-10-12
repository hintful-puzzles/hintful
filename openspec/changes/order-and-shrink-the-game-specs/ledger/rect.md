# rect

The Purpose is unchanged: everything it names the spec still holds. The cut
is small because little of this spec is declared: the params codec, the input
and the renderer are all hand-written, and the hint's marks were never
restated.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Rectangles flags a drawn edge the solution lacks | title kept. "The game SHALL implement `findMistakes`" and "from the search that counts its answers, at either difficulty" reworded out (the second pass took the engine citation off the search: it is "the search that counts the board's answers"). Which edge is flagged, that a missing edge is none, and the empty answer kept; scenario kept | the `Game` type (`findMistakes`); `engine-difficulty`, "One search answers a board for everything that asks" (`findMistakes` reads the one search, which answers at any tier); `answerOf` called at `src/games/rect/index.ts:363` |
| Params: Rectangles' menu offers its sizes at both difficulties, the largest two at Easy | retitled "Params: Rectangles' menu offers its two largest sizes at Easy alone". The list of sizes at both difficulties and the default cut; a sentence sends the reader to `presets`, and the departure (17×17 and 19×19 at Easy alone) kept. Scenario kept | `BOARDS`, `src/games/rect/state.ts:128`, `defaultParams`, `:123`, and `presets`, `src/games/rect/index.ts:398` (`presetGrid` with its `tiers` option); `engine-params`, "The preset menu is a grid" (each board at the tiers it is offered at, easiest first); `src/engine/__snapshots__/params-stability.test.ts.snap` lists the default and the menu's lines |
| Generation: A pasted Rectangles board opens at the difficulty it needs | removed (second pass; the first cut kept it as two pointers). "whatever lower difficulty its ID states" and the second sentence (the two refusals and their words) cut; what opens as Easy and what as Unreasonable is "Generation: An Easy Rectangles board is one the hint finishes" and "Generation: An Unreasonable Rectangles board has one answer that the hint does not reach". Scenario "A board with several answers or none is refused" dropped; "A board that needs search opens as Unreasonable" moves, unchanged, to "Generation: An Easy Rectangles board is one the hint finishes" | `engine-difficulty`, "A loaded board whose id states no tier takes the lowest tier that solves it" and "A pinned tier is kept or raised and never lowered"; `engine-params`, "A board with a mistake check loads only with exactly one answer" (`DESC_NOT_UNIQUE`, `DESC_CONTRADICTORY`). The dropped scenario's two boards are in this spec, "Solver: Rectangles' search tries the number with the fewest placements left", scenario "The search tells one answer from several and from none"; `src/games/rect/rect-tier.test.ts:364` ("with several answers, or none, is refused") holds the refusals and the board `2b2_2a2b2b2a2_2` |
| Generation: An Easy Rectangles board is one the hint finishes | gains scenario "A board that needs search opens as Unreasonable" from "Generation: A pasted Rectangles board opens at the difficulty it needs"; sentence and its two scenarios unchanged | |
| Solver: Rectangles' Solve returns the unique solution's edges | title kept. "take the board's answer from the search that counts its answers, at either difficulty, and return its edges, or an error when the numbers admit no division or more than one" cut to "made from the answer of the game's search, as its edges" (the engine citation beside it went in the second pass); that a dealt board's Solve is the generator's `aux` kept. Scenario kept | `engine-difficulty`, "Solve from the search shows the one answer or says which it lacks" (the solve move of the one answer at any tier; the refusals for several and for none) and "One search answers a board for everything that asks" ("but where the game kept the answer its deal drew"); `solveFromAnswer` called at `src/games/rect/index.ts:348` |
| Solver: Rectangles counts a board's answers by a bounded search | retitled "Solver: Rectangles' search tries the number with the fewest placements left". Kept: what the search assumes where the solver stops, and what makes a position impossible. "count … up to two by trial and error over the solver" became a pointer, and "It SHALL report one answer, several, none, or that it stopped at its budget, which SHALL be counted in positions and never in time" was cut. Scenarios "A spent budget is neither answer" and "An Easy board takes one position" dropped; the other two kept | `engine-difficulty`, "The engine counts a searching game's answers up to two, within a budget of positions" (the four verdicts, positions and never time; scenarios "The budget runs out with one answer in hand" and "A board the deduction finishes"); `searchBoard` called at `src/games/rect/solver.ts:163`; the dropped cases are `src/games/rect/rect-tier.test.ts:148` and `:161` |
| Hint: Rectangles offers an explained hint that reads only the board | retitled "Hint: A Rectangles hint step draws one rectangle or one line, and reads only the board". "Rectangles SHALL offer a hint" and "and says why it is forced" reworded out of the first sentence; what a step draws, what it reasons from and what a fit is kept; both scenarios kept | the `Game` type (`hint`); `engine-hints`, "A hint step always names a technique, with no un-narrated fallback" ("SHALL always explain why its move is forced by a named technique") |
| Look: A finished rectangle fills whole with the finished-region role | ", a wash of the theme pair's first hue, so it is told by hue from an unfinished square and from a number's lifted square in both schemes" cut from the first sentence; scenario kept | the palette, `out[COL_CORRECT] = REGION_DONE`, `src/games/rect/render.ts:93`; `engine-colors`, "The pair's hues carry what a player moves, seeks and finishes" (`REGION_DONE` carries the first pair member's hue and is distinct from the lifted surface under a given, in either scheme) |

## Kept, and why

- **Params: Rectangles' parameters and their encoding**, whole. `encodeParams`
  and `decodeParams` are written out as functions
  (`src/games/rect/state.ts:140`, `:146`), so the field order, the `e`
  suffix and the short form are no declaration's. The tier's `d` and letter
  come from `searchTierSegment`, which the codec places by hand, and "an ID
  with no difficulty letter SHALL decode as Easy" is the game's to state: the
  engine fixes no absent tier for a hand-written codec.
- **Params: Rectangles' menu offers its two largest sizes at Easy alone.**
  The grid offers each board at every tier; leaving two boards off a tier is
  a departure, and its test is `src/games/rect/rect-tier.test.ts:472`.
- **Generation: A pasted Rectangles board opens at the difficulty it needs**,
  its first sentence. It repeats "Generation: An Easy Rectangles board is one
  the hint finishes" for a pasted ID; kept as the antecedent of the two
  pointers, as Palisade's and Separate's are.
- **Generation: Rectangles generates by tiling, stretching and solving** and
  the three after it. Each is what a tier means here or how a board is drawn.
- **Controls: Rectangles input** and **Rectangles' Enter draws from the
  cursor's square and Space clears.** Rectangles declares no `targetVerbs`;
  the whole of its input is `interpretMove`, `src/games/rect/index.ts:159`.
- **Hint: A hint's rectangle is ringed as the contour of its squares.**
  `engine-hints`, "A piece a hint acts on is ringed as one shape", says the
  same of a piece, and its scenarios are dominoes drawn by the shared painter.
  Rectangles draws its ring in a pass of its own
  (`src/games/rect/render.ts:291`), so the requirement states what a
  hand-written function does.
- **Hint: Rectangles' hint stops where its steps do.** As in Palisade: no
  shared requirement promises that the hint goes on to finish an Unreasonable
  board from a rectangle drawn rightly.
- **Hint: Rectangles' hint tries its five deductions plainest first.**
  `hintRungs` lists the same five, and nothing reads it for order.
- **Look: Rectangles rendering** and **Rectangles draws its squares on the
  collection's quiet surface.** The renderer is hand-written, so which color
  a preview takes, that a number's square is lifted and that the outer edge
  stays in ink are its own decisions, not a palette's.

## Engine requests

None.

## Found

- The spec never says what a hint step's marks are beyond the ring: the
  legend's `outline` and `stripes` (`src/games/rect/index.ts:455`) appear only
  in the scenarios of the technique requirements, and no requirement names
  `hintMarks`.
- "Solver: Rectangles' Solve returns the unique solution's edges": the title
  says "unique solution", and for a dealt board the body takes the `aux`
  without asking whether the board has one answer. Every dealt board does.
- "Params: Rectangles' parameters and their encoding" says the expansion
  factor is written "for a non-zero expansion factor" and only its third
  scenario says the short form drops it; the sentence reads as though the
  short form wrote it (`src/games/rect/state.ts:142`).
- The spec does not give the reason the two largest sizes are offered at Easy
  alone; it is the comment at `src/games/rect/index.ts:400` (a section of the
  menu holds twelve lines).

## Review

6 rows read, each against the declaration or the requirement it names, read
whole; none corrected, 1 row added, no sentence restored.

Changed:

- **"Hint: Rectangles offers an explained hint that reads only the board"**
  retitled and its first sentence reworded: that the game has a hint and
  that a step says why it is forced are the collection's, and the sentence
  now holds what a step draws and what it reads.
- **"Generation: A pasted Rectangles board opens at the difficulty it
  needs"**: "is refused" is "SHALL be refused".

Checked and found sound:

- The 7 engine titles the spec cites are exact, and each states what its
  row removed: the one search that `findMistakes` and Solve read, with the
  carve-out for a board whose deal recorded its answer (Rectangles' `aux`);
  the four verdicts and the budget in positions; the two tier-loading
  requirements and the one-answer refusal; `presetGrid` and its tiers.
- The declarations: `BOARDS`, `defaultParams`, the `tiers` option that leaves
  17×17 and 19×19 at Easy, `REGION_DONE` in the palette.
- The kept requirements, read for copies, with the code open. The codec is
  two functions that place `searchTierSegment` by hand after the `e` suffix
  and upstream's `a`, so "Params: Rectangles' parameters and their encoding"
  is no declaration's; the input is `interpretMove` with no `targetVerbs`, so
  "Enter or Space on a hidden cursor SHALL only show it" is the game's own;
  the renderer and the hint's ring are hand-written. Nothing further is a
  copy: the 3% is what this spec restated.
- Each subject read alone: none hollow, no dangling antecedent.

## Second pass

The brief's "A pointer is for that case only", applied. 8 citing sentences
read; 4 removed, none kept as a pointer, 4 kept as a departure or the game's
own.

Removed, each a copy with a citation in a subject that says plenty:

- **Rules, the flagged edge**: the citation of "One search answers a board
  for everything that asks"; the sentence names "the search that counts the
  board's answers".
- **Generation, the pasted board**: both its sentences, so the requirement.
  What opens as Easy and what as Unreasonable is the two requirements before
  it, whose scenarios are pasted IDs already; the rest was three citations.
  Its scenario, the game's case of an ID with `de` raised to `du`, moves to
  "Generation: An Easy Rectangles board is one the hint finishes".
- **Solver, Solve**: the citation of "Solve from the search shows the one
  answer or says which it lacks"; that a dealt board's Solve is the `aux`,
  and otherwise the search's answer as its edges, stays.

Kept as a departure: the menu ("The preset menu is a grid", with the two
largest sizes at Easy alone). Kept as the game's own: `Solver`, the one
citation that locates the search whose choice of number the requirement
states; the hint's refusal "with the collection's sentence"; the cell
surface in `Look`.

Preferences: `prefs` is not declared (`expansion-factor` is a field of
`paramConfig`). Each subject read alone after the edits: none hollow, no
fragment, every title fits.
