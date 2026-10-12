# dominosa

The Purpose was left as it stood: it names nothing the cut removed.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Description: Dominosa descriptions carry the clue grid | Found, mended: "`validateDesc` SHALL reject" now reads "`newState` SHALL refuse", the game having no such hook and the refusals being its parser's (`parseDesc`, `src/games/dominosa/state.ts:164`); the scenario "A malformed description is rejected" says the desc is opened and refused, where it named `validateDesc` and "a non-null error string". The round-trip scenario untouched | |
| Rules: Dominosa flags a domino the unique solution lacks | "The game SHALL implement `findMistakes`, since a generated Dominosa board is uniquely solvable" reworded out, the sentence now led by what `findMistakes` returns; "and Check & Save refuses to save" cut from the scenario. Third pass: "A board that is not uniquely solvable SHALL yield no mistakes" reworded out; that blank squares and barrier edges are never flagged kept | `ts-engine`, "A mistake check compares with the one answer, hidden or not" (no mark flagged against an answer where the solver did not establish exactly one; Dominosa reports no broken rule besides, `src/games/dominosa/index.ts:356`); the `Game` type (`findMistakes`); `engine-params`, "A board with a mistake check loads only with exactly one answer"; `quick-save`, "Check & save gates the checkpoint on a clean board" (a flagged board is not saved) |
| Params: Dominosa refuses params outside its bounds | first sentence ("Params with `n` below 1 SHALL be refused.") cut; the two `validateParams` refusals and the title kept. Scenario "Invalid params are rejected" dropped; "A tier the smallest set cannot reach is refused" kept | `bounds: { min: 1 }`, `src/games/dominosa/index.ts:677`; `engine-params`, "Params validity is the engine's check" and "A params refusal is a sentence" |
| Controls: Dominosa input places dominoes and barrier edges | which button or select key toggles which mark cut; what placing a domino erases, that a barrier edge never affects the win and that one is refused beside a placed domino kept. Both scenarios kept | `targetVerbs`, `src/games/dominosa/index.ts:234` (`primary`: "place or remove a domino covering them"; `secondary`: "place or remove a line between them"); `engine-input`, "The engine owns a declaring game's press and select keys" (Enter the left-click verb, Space the right-click verb) |
| Controls: Dominosa provides a domino reference with pair-occurrence highlight | "Dominosa SHALL implement the engine reference-aid hooks so the app shows a domino reference" reworded to "Dominosa's `reference` SHALL be a domino reference"; nothing else | `ts-engine`, "The engine surface exposes an opt-in per-game reference-aid capability" (the two hooks, and that the app shows the model) |
| Hint: Dominosa provides an explained deductive hint | retitled "Hint: Dominosa's hint is seeded from the placed dominoes". Kept: the plan is the deductive solver run one firing at a time, seeded from the placed dominoes. Cut: "SHALL implement `Game.hint(state)`, returning a narrated plan computed from the player's current board" and the second sentence ("Each step SHALL carry a forced move and an explanation of *why* it is forced."). Scenario kept. Found, mended: gains that the hint takes no barrier edge the player drew as a premise (`seedFromDominoes(grid)`, `src/games/dominosa/index.ts:401`; the edges are read only to leave a drawn line out of the plan) and the keep-track verdict (the step's exact move completes it, any other is off the plan; `hintKeepTrack`, `index.ts:473`) | `engine-hints`, "The engine supports an ephemeral Hint System" (each step carries a move and an explanation), "A hint is deduced from the board in play" and "A hint step always names a technique, with no un-narrated fallback" |
| Hint: Barriers ruled out by one firing form one journey | retitled "Hint: A barrier the player has already drawn is not shown again". The clause "Barriers ruled out by one firing SHALL group into one `continuesPrevious` journey" cut; the drawn barrier skipped while the deduction goes on kept, with the scenario | `engine-hints`, "One deduction firing is one journey"; what the later legs say is this spec's "Hint: A later line of one firing does not repeat its reason" |
| Hint: Dominosa renders the hint distinctly | removed, with its scenario "A placement hint highlights the target domino cells" | `hintMarks.roles`, `src/games/dominosa/index.ts:701` (ring: the spot's two squares, joined for a domino, apart with the line between for a barrier; outline: the squares the reason rests on); the palette, `out[COL_HINT] = HINT_ACTION` and `out[COL_HINT_CELL] = HINT_EVIDENCE`, `src/games/dominosa/render.ts:92` and `:96`; `engine-hints`, "A bound hint step's words SHALL name exactly the marks it draws" |
| Look: Dominosa renders dominoes, barriers and overlays under the web geometry | last sentence ("Every per-square overlay ... SHALL be part of the render diff key so it repaints and clears correctly.") cut; what the renderer draws and the border kept, with the scenario | `engine-drawing`, "A warm frame matches a fresh paint of the same state" (a painter input missing from a cache key fails, in every registered game) |

## Kept, and why

- **Params: Dominosa params are the highest number, a tier and the tall
  flag**, whole, with the two requirements after it. `encodeParams` and
  `decodeParams` are written out (`src/games/dominosa/state.ts:115`, `:121`):
  no `paramsCodec` declares the `t`, the `d` letters `tbhe` or what `da`
  reads as.
- **Hint, "seeded from the placed dominoes"** and **"a barrier the player has
  already drawn SHALL be skipped for display while still advancing the
  deduction".** `engine-hints`, "A hint is deduced from the board in play",
  leaves which marks a step may rest on to the game: Dominosa's are the placed
  dominoes and not the barriers (`seedFromDominoes`,
  `src/games/dominosa/index.ts:402`; `seenEdges`, `:409`). `engine-hints`, "A
  hint SHALL show only steps the player's board does not already decide",
  names `deduceHintPlan`'s `showable`, which Dominosa's own loop does not use.
- **Hint: A hint is refused on an ambiguous board.** The game's own check,
  ahead of its plan (`src/games/dominosa/index.ts:397`); the midend's two
  refusals are of a finished board and a wrong one.
- **Hint: The forcing chain grades boards and is never narrated.**
  `engine-hints`, "A Search is refused and never narrated", is the rule; that
  the forcing chain is Dominosa's search, and stays in the solver, is the
  game's.
- **Hint: Dominosa's hint tries its techniques in one order.** `hintRungs`
  lists the same order and nothing reads it for order: the order is the body
  of `firstFiring`, `src/games/dominosa/solver.ts:794`.
- **Hint: A later line of one firing does not repeat its reason.** "One
  deduction firing is one journey" says a later leg's narration is
  abbreviated, and not Dominosa's sentence for it.
- **Look: Dominosa draws a domino as a piece in the theme pair's first
  color.** It reads like the palette. It is the decision the palette's three
  assignments carry out, and the white that does not invert is a departure
  from ink that `engine-colors`, "A departure from a shared role is stated at
  the assignment", asks to be stated.
- **Look, scenario "A mistake overlay repaints on a later frame".** The
  warm-frame requirement covers it; it is the one scenario the requirement
  has, and a replacement would have to be composed.

## Engine requests

None.

## Found

- "Description: Dominosa descriptions carry the clue grid" names
  `validateDesc`, which is no hook of the game: the verdict is the engine's,
  from `newState` (`engine-params`, "The engine derives a description's
  verdict from newState"; `parseDesc`, `src/games/dominosa/state.ts:164`).
- The spec never says outright that the hint does not take the player's
  barrier edges as premises, though the help page does ("It does not rely on
  the lines you have drawn between numbers"). The kept sentence about a drawn
  barrier being skipped implies it.
- "Hint: A hint is refused on an ambiguous board" does not say which refusal:
  the code answers `PUZZLE_NOT_REASONABLE`
  (`src/games/dominosa/index.ts:398`), and so does Solve on a board with no
  `aux` whose solver does not find exactly one answer (`:345`), which the
  spec never states. The spec has no `Solver` requirement for Solve at all.
- The spec never states the hint's keep-track verdict (`hintKeepTrack`,
  `src/games/dominosa/index.ts:473`): the step's exact move completes it and
  anything else drops the plan.
- "Rules: Dominosa detects completion" says "with no repeated value"; `status`
  counts the distinct dominoes placed and is solved when that is the whole
  set (`src/games/dominosa/state.ts:237`), which on a full cover is the same
  thing.
- The spec never states the drag: `targetVerbs.sweep`
  (`src/games/dominosa/index.ts:255`) repeats a press over further pairs.
- The preset menu (`PRESETS`, `src/games/dominosa/state.ts:93`) is written
  out by hand and is in no requirement; `src/engine/params-stability.test.ts`
  holds its lines.

## Review

8 rows read, each against the declaration or the requirement it names, read
whole; 3 rows' requirements changed in the spec, no sentence restored.

Changed:

- **"Params: Dominosa refuses params outside its bounds"**: the clause "An
  `n` below 1 is refused by the bound its field declares" cut, a copy with
  its source attached, and the title put back as it stood, which the body
  still fits.
- **"Controls: Dominosa input places dominoes and barrier edges"**: the
  sentence naming `targetVerbs` and the engine's select keys cut. What stays
  is what `executeMove` and the secondary verb's `apply` do.
- **"Hint: Dominosa's marks are the roles its legend declares"** removed with
  its scenario: the legend (`index.ts:701`) and the palette
  (`render.ts:92`, `:96`) state all of what "Hint: Dominosa renders the hint
  distinctly" said, and the Hint subject is not hollow without it.

Checked and found sound:

- `engine-hints`, "One deduction firing is one journey", for the grouping
  clause; "A hint is deduced from the board in play" leaves which marks a
  step rests on to the game, so "seeded from the placed dominoes" and the
  skipped barrier stay; `engine-drawing`, "A warm frame matches a fresh paint
  of the same state", for the diff-key sentence; `quick-save` for the save.
- `validateParams` (`state.ts:144`) makes the two refusals the kept sentence
  names and no other; `bounds: { min: 1 }` is at `index.ts:677`.
- The codec is hand-written (`state.ts:115`, `:121`), so the three Params
  requirements above the refusal stay whole.
- Each subject read alone: none hollow, no dangling antecedent.

## Third pass

What the engine's third round states, removed. 1 row of the third-round
tables names Dominosa (the mistake check, added by "Found"), and the review
of the hints round names it once, as a game that refuses a board with no one
answer before it plans. This ledger filed no request.

Cut, 1 clause: **"A board that is not uniquely solvable SHALL yield no
mistakes"**, in "Rules: Dominosa flags a domino the unique solution lacks":
`ts-engine`, "A mistake check compares with the one answer, hidden or not".

Kept, 2 clauses:

- "Blank squares and barrier edges SHALL never be flagged": which marks are
  flagged is the game's, by the review's word.
- "Hint: A hint is refused on an ambiguous board", whole. `engine-hints`, "A
  hint gives every step deduction still forces before it refuses", is bound
  to a board with one answer and says nothing of one without.

No sentence of the brief's section 2 stood in the spec, and a search for the
round's other rules in other words (the search never run, the steps before a
refusal, a recomputed plan) found none: "Hint: The forcing chain grades
boards and is never narrated" is which deduction is Dominosa's search.

Each subject read alone: none hollow, no fragment, every title fits. The
Purpose names nothing that went.

## Found, mended

- "Description: Dominosa descriptions carry the clue grid" names
  `validateDesc`: it now names `newState`, in the sentence and the scenario.
- The hint does not take the player's barrier edges as premises: stated in
  "Hint: Dominosa's hint is seeded from the placed dominoes".
- "Hint: A hint is refused on an ambiguous board" does not say which refusal,
  and Solve's on such a board is not stated: left: no player reaches either.
  A board the solver does not find exactly one answer of does not load
  (`engine-params`, "A board with a mistake check loads only with exactly one
  answer" and "A board loads only if the game's own solver solves it"), and
  on one that loads Solve shows that answer.
- The hint's keep-track verdict: stated in the same requirement as the
  premises.
- "with no repeated value" against `status` counting distinct dominoes: left:
  the same thing on a full cover, as the item says.
- The drag (`targetVerbs.sweep`): left: a declaration's.
- The preset menu is in no requirement: left: the preset table's, and
  `src/engine/params-stability.test.ts` holds its lines.
