# pattern

The Purpose was corrected: it named "the params and description encodings",
and the spec now holds what the params refuse and what a short string means;
it also names the search, which the spec states and the Purpose left out.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Params: Pattern's parameters are a size and a difficulty | replaced by the pointer requirement "Params: A Pattern params string may leave out its height and its difficulty" (rule 2) and by "Params: Pattern refuses a grid unreasonably large", which is its last sentence standing alone. The field list ("positive integers", Easy or Unreasonable) and the encoding (`{w}x{h}`, `de`/`du` in the full form only) cut; the two missing-field sentences kept. Scenario "Params round-trip" dropped but for its bare-`10` line, which joins "An ID from before the tiers is Easy"; "Invalid params are rejected" cut to its oversized-grid line as "A grossly oversized grid" | `paramConfig`, `src/games/pattern/state.ts:141` (`bounds: { min: 1 }`, `:144`), and the `paramsCodec` field list, `:159` (`dims`, `searchTierSegment`); `presets`, `:152`; `engine-difficulty`, "A game that searches has a tier for each deduction and Unreasonable above them" (`de` and `du`, in the full form only); `engine-params`, "Params validity is the engine's check" (the bound's refusal); `src/engine/__snapshots__/params-stability.test.ts.snap` holds `15x15de`/`15x15` and every preset; `src/games/pattern/pattern.test.ts:94` holds `20x15de`, `20x15du` and "Width must be at least 1." |
| Params: Pattern refuses Unreasonable at a size none of whose boards needs it | last sentence ("A board of such a size that arrives with its description SHALL still load.") cut, the first already saying "when a board is to be dealt"; the last line of scenario "A 3x3 Unreasonable board is not dealt" cut | `engine-difficulty`, "An unbindable tier is refused, not silently downgraded" ("The refusal SHALL apply to generation only, so that a saved game or a game ID carrying its own description still loads"); `full &&` in `validateParams`, `src/games/pattern/state.ts:176` |
| Generation: An Unreasonable Pattern board has one answer that the lines do not reach | removed, with its scenario "A dealt Unreasonable board needs search and has one answer". What Unreasonable means here stays in "Generation: A Pattern board is Easy where the per-line solver and the hint both finish it" | `engine-difficulty`, "The engine deals the Unreasonable board of a game that searches" ("keep a candidate only where the game's deduction stops short of it and the game's search proves it has one answer"); `dealUnreasonable`, `src/games/pattern/generator.ts:123`, whose `deduced` is the per-line solver; `src/games/pattern/pattern-tier.test.ts:178` holds the dropped scenario |
| Generation: A pasted Pattern board opens at the tier it needs | retitled "Generation: A Pattern board is Easy where the per-line solver and the hint both finish it". Kept: what makes a board Easy and what Unreasonable. The loading rule ("whatever tier its ID states below that", the two refusals) cut. Scenario "A board with several answers or none is refused" dropped; "A board that needs search opens as Unreasonable" kept | `engine-difficulty`, "A loaded board whose id states no tier takes the lowest tier that solves it" and "A pinned tier is kept or raised and never lowered"; `engine-params`, "A board with a mistake check loads only with exactly one answer". The dropped scenario's two boards are in this spec, "Solver: Pattern's search assumes an undecided cell each way", scenario "The search tells one answer from several and from none"; `src/games/pattern/pattern-tier.test.ts:252` holds the refusals |
| Solver: Pattern counts a board's answers by a bounded search | retitled "Solver: Pattern's search assumes an undecided cell each way". Kept: what the search runs over, what it assumes and what ends a branch. Cut: counting up to two, the four verdicts, the budget in positions, and "Solve and the mistake check SHALL take the board's answer from this search at either tier". Scenario "A spent budget is neither answer" dropped; the other two kept | `engine-difficulty`, "The engine counts a searching game's answers up to two, within a budget of positions" (its scenario "The budget runs out with one answer in hand"), "Solve from the search shows the one answer or says which it lacks" and "One search answers a board for everything that asks"; `searchAnswers`, `src/games/pattern/solver.ts:322`, and `solve`, `src/games/pattern/index.ts:439`; `src/games/pattern/pattern-tier.test.ts:142` holds the spent budget |
| Controls: Pattern's keyboard paints and cycles as the pointer does | retitled "Controls: Pattern's keyboard stroke paints as the pointer's drag does". Last sentence ("The cursor-select keys SHALL cycle the cursor's cell: Enter as a left press does, Space as a right press does.") cut; scenario "A click and Enter agree" moves, unchanged, to "Controls: A Pattern press cycles the pressed cell and begins a drag", whose first sentence says a press cycles the cell as the cursor-select keys do; the other three scenarios kept | `targetVerbs` (`primary: shadeVerb`, `secondary: clearVerb`), `src/games/pattern/index.ts:148`; `engine-input`, "The engine owns a declaring game's press and select keys" (Enter the left-click verb, Space the right-click verb) and "A verb is the game's function, and other input is the game's own arm" (the release arm calls the same verb) |
| Controls: A Pattern press cycles the pressed cell and begins a drag | gains scenario "A click and Enter agree" from "Controls: Pattern's keyboard paints and cycles as the pointer does"; sentences untouched | |
| Hint: Pattern provides an explained, deductive hint | removed, with its scenario | `engine-hints`, "A hint step always names a technique, with no un-narrated fallback"; the four techniques are this spec's "Hint: A Pattern run's overlap is shaded, and a cell no run reaches is clear" (overlap, out of reach, a line with no clues) and "Hint: The single-line intersection is Pattern's bottom rung" |
| Hint: A Pattern hint never reveals the solution or searches | second sentence (every Easy board is line-solvable, so its plan completes with no un-narrated step) and scenario "The plan solves the board" cut; "as it does from any position" cut | this spec, "Generation: An Easy Pattern board is one the per-line solver solves"; `engine-hints`, "The hint walk SHALL cover every preset a game offers", "A hint step always names a technique, with no un-narrated fallback" and "A hint is deduced from the board in play"; `src/games/pattern/pattern-hint.test.ts:81` holds the plan that solves the board |
| Hint: Pattern hint color legend | removed, with its scenario "Forced cells are highlighted, not pre-filled" | `hintMarks.roles.ring`, `src/games/pattern/index.ts:487` ("the cells the step decides; the sentence says whether they must be …"); `engine-hints`, "A hint marks beside the content, never behind it" (ringed and not filled, in every game) and "Requesting a hint never mutates the board" |
| Hint: Pattern's hint premises follow the element-type legend | cut to its third sentence, which color outlines a cited `Full` cell and which an `Empty` one, reworded to stand ("Of the cells a step cites"); retitled "Hint: A cell a Pattern hint cites is outlined by what it holds"; scenario kept. First sentence (the stable legend, a non-color cue, no color named), second (the line's clue in the hint color, its line hatched) and "each outline at the cell's edge, beside the piece or the cross" cut | `engine-hints`, "A hint naming several kinds of element colors them by a stable legend", "A legend color is never the only cue", "A narration never identifies an element by its color", "A hint hatches the one line its sentence names" (the line and the clue slot at its end) and "A hint mark is drawn on the cell's border"; `hintMarks.roles.outline` and `.stripes`, `src/games/pattern/index.ts:490` |
| Look: Pattern's grid lines are the surface's quiet grid color | retitled "Look: Pattern doubles every fifth grid line, and its frame is one line thick". "SHALL be the surface's quiet grid color" and "The clue numbers SHALL stay in the ink color" cut; the frame's weight and the doubled fifth line kept. Scenario kept | the palette, `out[COL_GRID] = surfaceGrid(defaultBackground)` and `out[COL_TEXT] = INK`, `src/games/pattern/render.ts:80` and `:82` |

## Kept, and why

- **Params, "a bare `{w}` decodes to a square grid" and "no difficulty letter
  decodes as Easy".** `dims` and `searchTierSegment` say both; kept as what a
  missing field decodes to, which an old link depends on.
- **Params: Pattern refuses a grid unreasonably large.** A refusal by
  `validateParams`; `engine-params`, "A grid too large for a game is refused
  in one sentence", fixes the sentence and leaves the ceiling to the game.
- **Rules, the mistake's outline "at the cell's edge, beside the piece".** How
  the game draws its own mistake mark; no shared requirement draws it.
- **Generation, "Easy where the per-line solver and the hint finish it".**
  `engine-difficulty` says the contract asks "the game's deduction"; that
  Pattern's is the solver and the hint both is `deductionFinishes`,
  `src/games/pattern/index.ts:448`.
- **Controls, the three press and drag requirements.** `targetVerbs` declares
  the two verbs and no sweep: the press, the drag and the release are an arm
  of `interpretMove`, `src/games/pattern/index.ts:166`.
- **Hint: One Pattern line deduction is one multi-cell step.** `engine-hints`,
  "One deduction firing is one journey", makes a several-move deduction
  several legs; Pattern makes it one step with one move.
- **Hint: Pattern's narration leads with the indication and concludes by
  necessity.** The necessity-voice requirements say who is checked, not
  Pattern's three endings.
- **Hint: Pattern's hintKeepTrack follows partial progress.** Hand-written,
  `src/games/pattern/index.ts:410`.
- **Hint: Pattern's hint takes the first line a named technique decides.**
  `hintRungs` lists the four rungs, and nothing reads it for order: the order
  is the two techniques of `deduceHintPlan`, `src/games/pattern/solver.ts:763`.
- **Hint, "a cited `Full` cell `COL_HINT_BLACKREF`, an `Empty` cell
  `COL_HINT_WHITEREF`".** The legend says "outlined in a color of their own"
  and not which; `engine-colors` names the two roles and not what each cites.
- **Look: Pattern draws a full cell as a piece and an empty one as the clear
  square.** The shared requirements say what the piece and the clear square
  are; that Pattern is a half-and-half board, and that the hatch is drawn
  over the clear square's surface, is the game's.

## Engine requests

- `findMistakes` returns nothing where the search proved no single answer →
  `engine-difficulty`, "One search answers a board for everything that asks".
  Pattern's spec holds no sentence of it (see Found); the code is
  `findMistakes`, `src/games/pattern/solver.ts:806`.
- What `HINT_BLACKREF` and `HINT_WHITEREF` cite → `engine-colors`, "The hint
  emphases stay distinguishable in both schemes", which names them only as
  "the two premise references". The sentence is "an already-placed `Full`
  cell SHALL be outlined `COL_HINT_BLACKREF` and an already-placed `Empty`
  cell `COL_HINT_WHITEREF`", in "Hint: A cell a Pattern hint cites is outlined
  by what it holds". Five games' palettes take the pair
  (`src/games/{pattern,range,singles,lightup,slant}/render.ts`).

## Found

- No test of the game refuses a grid for its size: `pattern.test.ts:107`
  ("rejects invalid params") asks the two bounds only. The kept scenario "A
  grossly oversized grid" is held by `src/games/pattern/state.ts:173` alone,
  and that ceiling, `Number.MAX_SAFE_INTEGER`, is one no dialog reaches.
- The spec never says what `findMistakes` returns where the search proved no
  single answer (`[]`, `src/games/pattern/solver.ts:808`).
- The spec never states the win flash. The game draws one by `sweepStep`
  (`src/games/pattern/render.ts:407`) and follows the collection's rule, so
  there is nothing of its own to state.
- "Hint: Pattern's hint takes the first line a named technique decides": the
  comment in `deduceHintPlan` says "Pattern is untiered", which it no longer
  is (`src/games/pattern/solver.ts:775`).
- The dropped scenario "Forced cells are highlighted, not pre-filled" named
  `COL_HINT`, a palette index, as did the two legend requirements; the kept
  sentence still names `COL_HINT_BLACKREF` and `COL_HINT_WHITEREF`, since
  nothing else tells the two outlines apart.

## Review

12 rows read, each against the declaration or the requirement it names, read
whole; 7 corrected in the spec, 1 of them dropped from the table and 1 row
added, no sentence restored.

Changed. Each of these was a copy swapped for a pointer inside a subject that
says plenty of the game's own, and is now a plain removal:

- **"Rules: Pattern's findMistakes flags marks against the unique
  solution"**: the added sentence citing "One search answers a board for
  everything that asks" went, so the requirement is as it stood and has no
  row.
- **"Generation: An Unreasonable Pattern board has one answer that the lines
  do not reach"**: the pointer that replaced it is removed whole, with its
  scenario. All it said of Pattern's own was that the deduction is the
  per-line solver, and the requirement after it says what Unreasonable means
  here in the same words.
- **"Generation: A Pattern board is Easy where the per-line solver and the
  hint both finish it"** and **"Solver: Pattern's search assumes an undecided
  cell each way"**: the citations went, and from the second the sentence that
  Solve is the search's.
- **"Controls: Pattern's keyboard paints and cycles as the pointer does"**:
  the sentence on the cursor-select keys went, the requirement is retitled
  for the stroke it still states, and its scenario "A click and Enter agree"
  moves to the press requirement, whose first sentence it is a case of.
- **"Hint: A Pattern hint never reveals the solution or searches"**: the
  added sentence on the midend's refusals went.
- **"Hint: Pattern's hint premises follow the element-type legend"**: the
  pointer requirement that took its place is cut to the one sentence of the
  game's own and titled "Hint: A cell a Pattern hint cites is outlined by
  what it holds".

The `Params` pointer stays, as Palisade's does.

The engine requests: the first named a sentence Pattern's spec does not
hold and is now a note that the spec is silent (see Found); the second is
filed under the name Range's is, and five games' palettes take
the pair, not one.

Checked and found sound:

- "One search answers a board for everything that asks" gives no verdict of
  `findMistakes`. `engine-colors` names `HINT_BLACKREF` and `HINT_WHITEREF`
  only as "the two premise references" ("The hint emphases stay
  distinguishable in both schemes"), and no requirement of `engine-hints`
  names them, so the kept sentence stays.
- Each requirement named for something cut states all of it:
  "An unbindable tier is refused, not silently downgraded" says the refusal
  binds generation only; "A hint hatches the one line its sentence names"
  has the line and the clue slot at its end; "A hint mark is drawn on the
  cell's border" has the outline at the edge; the legend's `outline` role
  has the numbers in the hint color.
- The declarations and every line citation: `bounds: { min: 1 }`, the two
  codec segments, `presetGrid(paramConfig, BOARDS)`, `primary: shadeVerb`
  and `secondary: clearVerb`, `deductionFinishes`, `dealUnreasonable`'s
  `deduced`, `COL_GRID` and `COL_TEXT`.
- Every engine title the spec and the ledger cite is exact (23 citations).
