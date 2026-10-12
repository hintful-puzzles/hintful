# mosaic

The Purpose was corrected: it named "its params and description formats" and
"what a press and a drag do", which the spec no longer holds, and it now names
what the params refuse, what a toggle does, the deduction and the hint.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: A Mosaic toggle cycles a mark and a paint fills only unmarked cells | the clause "two steps are the right button's and select2's way round it" reworded to "two steps SHALL take it round the other way"; title and scenarios kept | `targetVerbs.secondary` (`apply: toggle(true)`), `src/games/mosaic/index.ts:87`; `engine-input`, "The engine owns a declaring game's press and select keys" (Space applies the right-click verb). The tie of the two-step toggle to the secondary verb is kept in this spec's `Controls` requirement |
| Rules: Mosaic checks mistakes against the deduced solution | Found, mended: retitled "Rules: Mosaic checks mistakes against the board's one answer", the answer being the search's at every tier and not a deduced one. The clause "taken from the search at either difficulty" cut, and "the search" of the last sentence reworded to "the game's search" so it stands without it; what is returned and how it is drawn kept; scenario kept. Third pass: the last sentence ("It SHALL return no mistakes when the game's search did not prove exactly one answer or when the marks are consistent") cut | `engine-difficulty`, "One search answers a board for everything that asks" (`findMistakes` among what asks; `answerOf`, `src/games/mosaic/solver.ts:347`); `ts-engine`, "A mistake check compares with the one answer, hidden or not" (no mark flagged where the search did not establish exactly one answer; a mark that agrees with the answer is none the first sentence returns) |
| Description: Mosaic descriptions are run-length clue grids | third pass: "a letter `a`-`z` for each run of 1-26 hidden cells" reworded to "a run letter for each run of hidden cells"; the scan order, the digit for a clue, both refusals and both scenarios kept | `engine-params`, "The engine provides the run-letter description grammar" (`encodeRunLength`, `scanRunLength`, `src/games/mosaic/state.ts:267`, `:280`) |
| Hint: Mosaic's hint stops where the rule does | third pass: cut to what its deductions are, reworded to stand ("On an Unreasonable board as on any other, the steps of Mosaic's hint SHALL be those one number at a time forces and then those two numbers compared force"). Cut: "The hint SHALL never run the search", "and no others, and where nothing is forced it SHALL refuse with the collection's sentence that deduction has run out", "It SHALL go on from the squares the player then marks". The scenario cut to its last clause (a square marked rightly wherever the hint stops, and the hint finishes the board); its lines on the unfinished board, the refusal's sentence and the wrong square reported went | `engine-hints`, "The hint of a game on the search's tiers never searches" (and its scenario "A value tried wrongly"); `engine-hints`, "A hint gives every step deduction still forces before it refuses" (the steps forced, the refusal with `DEDUCTION_EXHAUSTED` only where none is, deducing again from the board as it then stands; scenario "A board that stalls part-way") |
| Look: A blank Mosaic cell's number has the clear square to itself | third pass: removed, both scenarios with it | `engine-colors`, "A clear square whose middle is taken carries no cross" (the cross in the middle of a bare clear square, none where the middle holds a number; scenario "A numbered square beside a bare one"); the game's argument is `drawClearSquare`, `src/games/mosaic/render.ts:198` |
| Params: Mosaic's parameters and their encoding | replaced by the pointer requirement "Params: A Mosaic params string may leave out its aggressiveness and its difficulty" (rule 2). The field list and the encoding (`{w}x{h}`, `h{0\|1}` in the full form where it differs from the default, `de`/`dn`/`du`) cut; "no difficulty letter decodes as Easy" kept, and what a missing `h` decodes to said beside it. Found, mended: gains "a string of one number SHALL decode as a square board" and the scenario "One number is a square board", whose `7` is `src/games/mosaic/mosaic.test.ts:125`. Scenarios "Params round-trip" and "The middle difficulty has a letter of its own" dropped; "A string from before the tiers reads as Easy" kept | `paramConfig`, `src/games/mosaic/state.ts:139`, and the `paramsCodec` field list, `:185` (`dims`, `num "h"` with `full` and `omitWhen`, `searchTierSegment`); `engine-difficulty`, "A game that searches has a tier for each deduction and Unreasonable above them" (`de`, `dn`, `du`, in the full form only); `src/engine/__snapshots__/params-stability.test.ts.snap` holds `10x10de`/`10x10`, `10x10dn`, `10x10du` and `50x50h0de`/`50x50`; `src/games/mosaic/mosaic.test.ts:58` holds `10x8de`, `10x8dn` and `50x50h0du` |
| Params: Mosaic's largest preset deals without aggressive generation | removed. Its sentence joined "Params: Mosaic's menu leaves its two smallest boards and its largest at Easy"; scenario "The largest preset is not aggressive", which restated it, dropped | this spec; the data is `board`, `src/games/mosaic/state.ts:120` (`aggressive: side < 50`), and the snapshot's `50x50h0de` |
| Params: Mosaic's size limits | retitled "Params: Mosaic refuses a board of more than 10000 squares". First sentence (a board narrower or shorter than 3 is refused) cut. Scenario "Invalid params are rejected" cut to its tile-limit lines and retitled "A board one row past the limit" | `bounds: { min: 3 }`, `src/games/mosaic/state.ts:143`; `engine-params`, "Params validity is the engine's check" (the bound's refusal and its words); `src/games/mosaic/mosaic.test.ts:133` holds "Width must be at least 3." |
| Params: Mosaic rejects board shapes it cannot generate | last sentence ("A description that is supplied SHALL NOT be held to the bound.") cut, the first already saying "when a board is to be dealt"; scenario "An existing long description still loads" dropped | `engine-params`, "A generation-only bound is gated on full" and "Param validation distinguishes generating a board from loading one" (scenario "A generation-only bound does not refuse the descriptive form"); `if (!full) return null`, `src/games/mosaic/state.ts:245`; `src/games/mosaic/mosaic-tier.test.ts:334` holds the 3×400 board |
| Params: Mosaic's menu offers its middle sizes at every difficulty | retitled "Params: Mosaic's menu leaves its two smallest boards and its largest at Easy". The list of sizes and tiers and "The default SHALL be an Easy 10×10" cut; which boards are left at Easy and why, and that every size is dealt at every difficulty from the Custom dialog, kept; the sentence of "Params: Mosaic's largest preset deals without aggressive generation" joined. Scenario kept | `BOARDS`, `EVERY_TIER`, `defaultParams` and `presets`, `src/games/mosaic/state.ts:125`, `:136`, `:114`, `:169`; `engine-params`, "The preset menu is a grid"; the snapshot lists the twelve lines |
| Generation: An Unreasonable Mosaic board has one answer that the rule does not reach | retitled "Generation: An Unreasonable Mosaic board is an Easy one with clues the search can spare hidden". "SHALL keep the board only when the deduction … stops short on it" and "within a budget of its own" cut; "two numbers compared included" moved to the sentence on the clue whose loss stops the deduction (`solveGameActual`, `src/games/mosaic/solver.ts:231`); what the generator starts from and which clues it tries kept, the start now first. Scenario "A dealt Unreasonable board needs search and has one answer" dropped; the other two kept | `engine-difficulty`, "The engine deals the Unreasonable board of a game that searches" ("keep a candidate only where the game's deduction stops short of it and the game's search proves it has one answer") and "A strip is asked within the engine's dealing budget"; `dealUnreasonable`, `src/games/mosaic/solver.ts:473`; `src/games/mosaic/mosaic-tier.test.ts:256` holds the dropped scenario |
| Generation: A pasted Mosaic board opens at the lowest difficulty that solves it | retitled "Generation: A Mosaic board is Easy, Normal or Unreasonable by what finishes it". Kept: what makes a board each tier. The loading rule ("whatever lower difficulty its ID states", "A higher difficulty its ID states SHALL be kept", the two refusals) cut. Scenario "A board with several answers or none is refused" dropped; the other two kept | `engine-difficulty`, "A loaded board whose id states no tier takes the lowest tier that solves it" and "A pinned tier is kept or raised and never lowered"; `engine-params`, "A board with a mistake check loads only with exactly one answer". The dropped scenario's two boards are in this spec, "Solver: Mosaic's search assumes an undecided square shaded and then clear", scenario "The search tells one answer from several and from none"; `src/games/mosaic/mosaic-tier.test.ts:371` holds the refusals |
| Solver: Mosaic's Solve applies the deduced solution | retitled "Solver: Mosaic's Solve marks every cell and flags it solved". Where the answer comes from and the refusals cut; what the solve move does to the cells kept. Scenario kept | `engine-difficulty`, "Solve from the search shows the one answer or says which it lacks" and "One search answers a board for everything that asks"; `solve`, `src/games/mosaic/index.ts:145` |
| Solver: Mosaic counts a board's answers by a bounded search | retitled "Solver: Mosaic's search assumes an undecided square shaded and then clear". Kept: what the search assumes where the deduction stops, and the free square. Cut: counting up to two by trial and error over the deduction, the four verdicts and the budget in positions. Scenario "A spent budget is neither answer" dropped; the other two kept | `engine-difficulty`, "The engine counts a searching game's answers up to two, within a budget of positions" (its scenario "The budget runs out with one answer in hand"); `searchAnswers`, `src/games/mosaic/solver.ts:286`; `src/games/mosaic/mosaic-tier.test.ts:130` holds the spent budget |
| Controls: A Mosaic press toggles a cell and a drag repeats it | replaced by "Controls: Mosaic takes its buttons, keys and drag from its verbs, and a finished board takes none" (rule 2). The press and the drag became a pointer that keeps the tie of each verb to the toggle and what the sweep compares; the finished-board sentence kept. Both scenarios kept | `targetVerbs`, `src/games/mosaic/index.ts:72` (`primary` `:83`, `secondary` `:87`, `sweep.holds` `:91`); `engine-input`, "The engine owns a declaring game's press and select keys" and "A drag on from a press repeats the press" (its scenario is the drag that lays a mark) |
| Hint: Mosaic's hint says a comparison of two numbers | "It SHALL circle each number, outline each number's block whole, and ring the squares it decides, which only one of the two counts" cut to "The squares it rings SHALL be squares only one of the two counts"; scenarios kept | `hintMarks.roles`, `src/games/mosaic/index.ts:181` (`ring`: the squares the step decides; `outline`: the block of each number the step reasons from, the number itself circled); `engine-hints`, "A bound hint step's words SHALL name exactly the marks it draws" |
| Hint: One Mosaic number alone settles its block | "The hint step SHALL circle the number, outline its block and ring the squares it decides" cut; scenarios kept | the same `hintMarks.roles` |
| Look: Mosaic's win flash fills the ground of a cell | retitled "Look: Mosaic's win flash takes the place of a blank cell's clear surface". The sweep's direction and "SHALL keep what it holds: its piece" cut; that the flash stands in place of the clear surface, with the cross and number kept, stays. Scenario kept | `ts-engine`, "A game gives each element a position, and the route is which position it gives" (`sweepStep`, `src/games/mosaic/render.ts:312`); `engine-colors`, "A solved flash drawn as a color takes a shared color" (the ground filled, what it holds kept) |
| Look: Mosaic draws a marked cell as a piece and a blank cell as the clear square | last sentence ("The line between cells SHALL be the collection's thin surface grid.") cut; scenario kept | the palette, `out[COL_GRID] = surfaceGrid(defaultBackground)`, `src/games/mosaic/render.ts:88`; `engine-colors`, "The engine owns what a board of pieces looks like" |

## Kept, and why

- **Params, "no difficulty letter decodes as Easy" and "no `h` decodes with
  aggressive generation on".** `searchTierSegment` and the `num` segment say
  both; kept as what a missing field decodes to, which an old link depends on
  (upstream's IDs carry no tier, and an upstream `50x50` with no `h` is not
  the menu's 50×50).
- **Params, the menu requirement.** The size list went to `presets`. What
  stays is the departure from "each board at every tier" with its reason, the
  reason the largest preset is not aggressive, and "every size SHALL be dealt
  at every difficulty from the Custom dialog", which no declaration promises.
- **Rules, "each SHALL be drawn with an error-colored outline overlay".** The
  overlay's lifetime is the midend's; that Mosaic's mark is an outline round
  the cell is `redraw`'s, `src/games/mosaic/render.ts:217`.
- **Generation: Mosaic generates deduction-solvable boards**, **hides the
  clues a board does not need** and **A Normal Mosaic board needs a comparison
  and no search.** Each reads like the collection's rule by its title and is
  what the tier means here and how the deal reaches it, in hand-written loops.
- **Hint: Mosaic's hint stops where the rule does.** What is left is which
  deductions its steps are, and the scenario's clause that the hint finishes
  an Unreasonable board from a right square, promised by no shared
  requirement (`engine-hints`, "A hint finishes a board from a right entry
  made out of order", binds only a tier with no trial and error; "A hint gives
  every step deduction still forces before it refuses", scenario "A value
  tried rightly", says the hint may be refused again).
- **Hint: Mosaic's hint asks the numbers in reading order, and the nearest
  pair first.** `hintRungs` lists the four rungs, and nothing reads it for
  order: the order is the queue and the `BESIDE` table of `deduce`,
  `src/games/mosaic/deduce.ts`.
- **Look: Mosaic draws a marked cell as a piece and a blank cell as the clear
  square.** The shared requirements say what the piece and the clear square
  are; that Mosaic's board is the half-and-half kind, and which of its three
  marks takes which, is the game's.

## Engine requests

- Answered: `ts-engine`, "A mistake check compares with the one answer,
  hidden or not".
  `findMistakes` returns nothing where the search proved no single answer →
  `engine-difficulty`, "One search answers a board for everything that asks".
  The sentence is "It SHALL return no mistakes when the game's search did not
  prove exactly one answer", in "Rules: Mosaic checks mistakes against the
  deduced solution"; the code is each game's `findMistakes` reading
  `answerOf(state).kind` (`src/games/mosaic/solver.ts:594`), over
  `answerCache` in `src/engine/answer-search.ts`.
- Answered: `engine-colors`, "A clear square whose middle is taken carries no
  cross".
  "A blank cell that has a number SHALL carry no cross", in "Look: A blank
  Mosaic cell's number has the clear square to itself". `engine-colors`, "A
  board colored half and half gives its clear squares a surface", has it as a
  scenario only; the code is `drawClearSquare` in `src/engine/piece.ts`.

## Found

- **Mosaic refuses a board too large in a sentence of its own**: "Width times
  height must be at most 10000.", `src/games/mosaic/state.ts:241`, against
  `engine-params`, "A grid too large for a game is refused in one sentence"
  (`AREA_TOO_LARGE`). The ceiling here is a round figure and not what the game
  can hold, so it may be the kind that requirement leaves to the game; the
  spec gives no reason for 10000.
- The spec never states `hintKeepTrack`: a move that sets some of a step's
  squares keeps the step and shrinks it to the squares left
  (`mosaicKeepTrack`, `src/games/mosaic/hint.ts:86`).
- The spec never says a params string of one number is a square board
  (`dims`; `src/games/mosaic/mosaic.test.ts:112` holds `7`).
- "Rules: Mosaic checks mistakes against the deduced solution": the title
  says "deduced" and the answer is the search's at every tier.
- The dropped scenario "Params round-trip" said `10x8de` shows "default
  aggressiveness elided"; true, and the same string is what a 10×8 board with
  no `h` decodes from, so the default is the codec's and not the size's: a
  50×50 board entered as `50x50` is dealt with aggressive generation, which
  the menu's 50×50 is not.

Verified in review:

- **The large-board refusal: true.** `validateParams` returns "Width times
  height must be at most 10000." (`src/games/mosaic/state.ts:241`-`:242`,
  `MAX_TILES`, `:43`), where `engine-params`, "A grid too large for a game is
  refused in one sentence", has a game that refuses an area "more than the
  game can hold" return `AREA_TOO_LARGE` "and no sentence of its own". The
  10000 is upstream's round ceiling (`../puzzles/mosaic.c:30`, "Maximum size
  is 10000 tiles"), and Mosaic's sentence tells the player the limit, which
  the engine's does not. Whether a chosen ceiling is "more than the game can
  hold" is the reading that decides which side changes.
- **`50x50` with no `h`: true.** The codec starts from `defaultParams`
  (`board(10)`, aggressive on, `:114`, `:120`) and the `h` segment has no
  `whenAbsent` (`:187`-`:197`), so a string with no `h` is aggressive at any
  size, while the menu's 50×50 is `board(50)`, aggressive off (`:125`), and
  the snapshot writes it `50x50h0de` in full and `50x50` in brief. The brief
  form goes beside a description, where aggressiveness is not read. A player
  meets it only by entering `50x50` with no description: that board is dealt
  at Easy with aggressive generation, which `validateParams` allows and the
  menu's comment calls too slow.

## Review

17 rows read, each against the declaration or the requirement it names, read
whole; 9 corrected in the spec, 1 of them dropped from the table, no sentence
restored.

Changed. Eight copies had been swapped for a pointer inside a subject that
says plenty of the game's own, and each is now a plain removal:

- **"Rules: Mosaic checks mistakes against the deduced solution"**: the
  sentence citing "One search answers a board for everything that asks" went;
  "the search" of the kept sentence is "the game's search".
- **"Generation: An Unreasonable Mosaic board is an Easy one with clues the
  search can spare hidden"**: the sentence citing the engine's deal went, and
  the requirement speaks of the generator again and not of a candidate and a
  strip, words that had no antecedent without the citation.
- **"Generation: A Mosaic board is Easy, Normal or Unreasonable by what
  finishes it"**: the sentence on what a pasted ID opens as went, three
  citations with it.
- **"Solver: Mosaic's Solve marks every cell and flags it solved"** and
  **"Solver: Mosaic's search assumes an undecided square shaded and then
  clear"**: each kept its own sentence and lost its citation.
- **"Hint: Mosaic's hint stops where the rule does"**: the added sentence on
  the midend's two refusals went, so the requirement is as it stood and has
  no row.
- **"Hint: Mosaic's hint says a comparison of two numbers"** and **"Hint: One
  Mosaic number alone settles its block"**: "the roles `hintMarks` declares"
  went; the first keeps that the ringed squares are ones only one of the two
  numbers counts.
- **"Look: Mosaic's win flash takes the place of a blank cell's clear
  surface"**: the sentence citing the sweep and the shared flash color went.

Two pointers stay, each the one statement of its concern in an owed subject:
`Params` (the declared codec, as Palisade's) and `Controls`, which is that
one requirement.

The ledger: the engine request is in the words the other batches file it in;
`defaultParams` is at `state.ts:114`.

Checked and found sound:

- The engine requests. "One search answers a board for everything that asks"
  lists `findMistakes` among what reads the search and gives no verdict of
  it, so the sentence stays. `engine-colors`, "A board colored half and half
  gives its clear squares a surface", says in its body that the cross is
  drawn and gives the numbered square only as a scenario, so "SHALL carry no
  cross" stays and its request stands.
- Each requirement named for something cut states all of it: the tier
  letters and the string with no `d`; the engine's deal ("only where the
  game's deduction stops short of it and the game's search proves it has one
  answer") and the dealing budget; the two tier-loading requirements and the
  one-answer refusal; `searchAnswers`' four verdicts and its budget;
  `solveFromAnswer`'s refusals; the generation-only bound; `sweepStep`'s
  diagonal and the flash that keeps what a cell holds.
- The declarations: `bounds: { min: 3 }`, the three codec segments, `BOARDS`
  and `EVERY_TIER`, the two verbs and the sweep, the legend's two roles,
  `COL_GRID`. The other line citations are right.
- Every engine title the spec and the ledger cite is exact (30 citations).
- The diff against `c86372f4`, read hunk by hunk with no context: 32 hunks
  (15 at git's default context), one the Purpose and 31 inside the 16
  requirements the table has a row for. None touches a requirement without a
  row, a scenario the rows do not name, or a line's wrapping alone; the diff
  holds no carriage return and no trailing space.
- `Found`: the two player-facing items are verified above. Neither is a
  defect of the cut.

## Third pass

Rows of the engine's third-round tables that name Mosaic: 6 (the mistake
check, the run-letter grammar, a step followed one element at a time, every
step before it refuses, never searches, the clear square's cross). Engine
requests of its own: 2, both answered. Sentences cut: 6, a requirement and
two scenarios with them. Clauses kept: 4.

- **Cut**: the empty mistake check; the run letter's `a`-`z` for 1-26; "The
  hint SHALL never run the search"; the plan's "and no others" and its
  refusal; "It SHALL go on from the squares the player then marks"; the whole
  of "Look: A blank Mosaic cell's number has the clear square to itself".
- **Kept: which marks are flagged and that each is outlined** (the mistake
  check), as the review of the round says.
- **Kept: the digit for a clue, the scan order and the two refusals** of the
  description: the value characters and the refusals are the game's by the
  engine requirement's last sentence. Mosaic writes the run that reaches the
  last cell (`keepTrailingBlanks`, `src/games/mosaic/state.ts:270`) and its
  spec never said so; the length refusal implies it.
- **Kept: what the hint's deductions are, and the scenario's last clause**
  (a right square wherever the hint stops, and the hint finishes the board),
  which the engine's scenario does not promise.
- **Kept: "Look: Mosaic's win flash takes the place of a blank cell's clear
  surface".** `engine-colors`, "A clear square whose middle is taken carries
  no cross" has the lit square by its scenario "A lit clear square" only.
- **A step followed one element at a time**: Mosaic calls `trackTargets` and
  its spec states nothing of `hintKeepTrack`, so nothing went.
- No "no departure" sentence and none on what a pasted game ID opens as. The
  two scenarios of a pasted board sit under "Generation: A Mosaic board is
  Easy, Normal or Unreasonable by what finishes it", which says what counts
  as which tier.

## Found, mended

- The too-large refusal in a sentence of Mosaic's own: left, code (the main
  session's).
- `hintKeepTrack` never stated: left. `mosaicKeepTrack` is `trackTargets`,
  and `engine-hints` states a step followed one element at a time.
- One number is a square board: a clause and a scenario of "Params: A Mosaic
  params string may leave out its aggressiveness and its difficulty".
- The title's "deduced": retitled "Rules: Mosaic checks mistakes against the
  board's one answer". The sections above name the requirement by the title
  it had when they were written.
- `50x50` with no `h` is dealt with aggressive generation: left. The spec
  states what the string decodes to ("whatever its size"); whether a
  typed `50x50` should deal as the menu's 50×50 does is for the owner.
