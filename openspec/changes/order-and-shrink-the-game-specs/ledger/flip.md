# flip

Purpose: "generated solvable and not already solved" reworded to "generated
solvable".

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: A press flips the square and its matrix-defined neighbors | title kept. "Clicking a square, or selecting it with the keyboard cursor," reworded to "Pressing a square". Scenario untouched | `targetVerbs.primary`, `src/games/flip/index.ts:113`; `engine-input`, "The engine owns a declaring game's press and select keys" (Enter applies the left-click verb). The `Controls` requirement now sends the reader there |
| Rules: Flip's rulesets are Crosses and Random | removed, with its scenario "The help says what Random changes" | `rulesetItem` with its two entries and their `rule` strings, `index.ts:72`-`89`; `engine-params`, "A game declares its rulesets with rulesetItem"; the help: `help-pages`, "A game page's list of rulesets is generated". Which squares each flips stays in "Rules: Flip's two toggle matrices" |
| Params: Flip's params encoding | retitled "Params: A Flip params string is its declared codec's, and one with no ruleset letter is Crosses". Sentence 1 (width and height, then `c` or `r` in the full form) and the first two shorter forms of sentence 2 replaced by a pointer to the declaration that says the game departs nowhere from the grammar (rule 2). "a string without one decoding as Crosses" kept, as a sentence. Scenario untouched | the fields: `paramConfig`, `index.ts:67`-`90`; the encoding: `paramsCodec(defaultParams, [dims(paramConfig), letters(paramConfig, RULESET_KW, ["c", "r"], { full: true })])`, `index.ts:94`-`97`; `"5"` and `"5x4"`: `engine-params`, "The codec grammar is a prefix, tagged segments, flags and letters". The `flip` entry of `src/engine/__snapshots__/params-stability.test.ts.snap` holds `5x5c`, `5x5r` and the short `5x5` |
| Params: Flip refuses a size it cannot use | title kept. "with a human-readable reason" and the non-positive width or height cut; what `validateParams` refuses kept, as the requirement's one sentence. Scenario "A width of zero" dropped; "A board too large to hold" written, its sentence the engine's constant | the reason: `engine-params`, "A params refusal is a sentence"; below 1: `bounds: { min: 1 }`, `index.ts:70`, refused by `engine-params`, "Params validity is the engine's check". `src/games/flip/flip.test.ts:165` holds "Width must be at least 1.". The new scenario: `validateParams`, `index.ts:198`-`200`, and `AREA_TOO_LARGE`, `src/engine/params.ts:255` (50000 > (2³¹ − 4) / 50000); no test of Flip holds it |
| Generation: Flip generates solvable, non-trivial boards | retitled "Generation: Flip generates solvable boards". "and whose starting lights are not already solved" cut from the sentence, and "and the start grid is non-trivial" from the scenario's THEN | `engine-difficulty`, "A board that comes solved is dealt again" (`generate`, `src/engine/deal.ts:51`) |
| Controls: A square that flips nothing takes no press | retitled "Controls: Flip's press is its declared verb, and a square that flips nothing takes none". Gains a first sentence that sends the reader to `targetVerbs` (rule 2: the subject held only this corner case). Its two sentences and its scenario untouched | |
| Hint: Flip names no hue for either state | retitled "Hint: Flip's hint calls the two states lit and unlit". "The game SHALL name no hue of its own for either state:" cut; what Flip's words are, and the help page's naming by shape, kept ("for a square's two states" added so the sentence stands). Scenario untouched | `engine-colors`, "A game that uses the pair names no hue or shape of its own" |
| Hint: A press that is an unlit square's last chance is said as a deduction | title kept. "ring the square to press, outline those unlit squares, and stripe" cut from the sentence, leaving that the step marks and names every other square the press flips ("mark and name" for "stripe and name"). Scenario untouched | `hintMarks.roles.ring` ("the square to press."), `.outline` ("the ones only it can still light, no square further on flipping them") and `.stripes` ("the other squares that press flips, unlit or lit."), `index.ts:284`-`291` |
| Hint: The last press says it finishes the board | title kept. "and SHALL outline every other unlit square" cut. Scenario untouched | `hintMarks.roles.outline` ("or on the last press every unlit square left"), `index.ts:287` |
| Status bar: Flip's status bar counts the moves | removed, with its scenario "The status bar after a press" | that the game has a status bar: `statusbarText`, `index.ts:340`, and `ts-engine`, "Solve, the status bar and text export follow from the game's methods"; what it reads: this spec's "Status bar: Solve counts a move for each square it presses" ("`Moves: ` and the number of presses made on the board") |
| Look: A flip shows one piece at a time, and the win flash sweeps the squares | retitled "Look: A flip shows one piece at a time". Sentence 2 (the flash sweeps the squares along the diagonal; a lit square's ground is filled, its piece and diagram unchanged) cut. Scenario "A move that does not solve the board" dropped; "Halfway through a flip" kept | the diagonal over the squares: `ts-engine`, "A game gives each element a position, and the route is which position it gives" (`flash.win(sweepStep(x, y))`, `src/games/flip/render.ts:169`); the ground filled and what it holds kept: `engine-colors`, "A solved flash drawn as a color takes a shared color"; no flash on a move that leaves a light on: `ts-engine`, "The win flash plays on a forward move that solves the board" |

## Kept, and why

- **Rules: Flip's two toggle matrices.** The generator's, hand-written
  (`src/games/flip/generator.ts`); the ruleset's `rule` string says "a
  selection of the eight squares around it" to a player and not that a matrix
  with two identical rows is grown again.
- **Params: … one with no ruleset letter is Crosses.** What a missing field
  decodes to.
- **Params: Flip refuses a size it cannot use**, "unreasonably large
  dimensions". `engine-params`, "A grid too large for a game is refused in
  one sentence" leaves where the ceiling sits to the game.
- **Generation: Flip generates solvable boards**, "the Flip solver SHALL find
  a solution for every generated board". Flip has no tiers, so
  `engine-difficulty`, "Every tier promises one solution found at its cap"
  does not bind it; the promise is `newDesc`'s (`index.ts:219`-`231`: the
  lights are a sum of rows of the matrix).
- **Solver: Flip's solver finds a shortest set of presses**, "Solve SHALL
  press every square of the solution in one move". `ts-engine`, "Solve
  leaves a solved board" says the board is left solved, not that the answer
  is the shortest or one move.
- **Hint: Flip's hint presses the shortest answer…**, "A step SHALL claim
  nothing the code has not checked on the board the step is shown on."
  `engine-hints`, "A tie a narration states is one the code guarantees" is
  about a tie; this is about each step's kind.
- **Hint: The hint's plan is the same plan after each of its presses.**
  `engine-hints`, "A hint is deduced from the board in play" says where a
  plan starts and not that a recomputed one repeats the last.
- **Hint: A press the order does not decide…** and **The last press…**: the
  scenarios' "outlines and stripes nothing" and "the outlined squares are
  every unlit square but the ringed one" give which marks a kind of step
  carries, which the legend gives per mark and not per kind.
- **Status bar: Solve counts a move for each square it presses**, "the first
  two words being the engine's". One clause that keeps the scenario's string
  true to `statusbarText`.
- **Look: A square's state is a piece of the two-state pair** and **Look: The
  diagram is on the piece…**. `engine-colors`, "The engine owns what a board
  of pieces looks like" says a game takes these by reference; which state is
  which member, and that the cursor and the marks go round the piece, are the
  game's.

## Engine requests

None.

## Found

- **A board no presses light does not load, and the spec says so nowhere.**
  `hasNoSolution` is `!hasAnswer` (`index.ts:265`), so `engine-params`, "A
  board its game proves has no solution does not load" refuses it (its first
  scenario is Flip; `src/engine/no-solution-load.test.ts:32` pins
  `3x3c:000000000000000000000,800`). `Description` owes the sentence, as
  Fifteen's, Sixteen's, Twiddle's and Cube's have it.
- **Two requirements describe what a player can never meet.** "Solver: …",
  "or report that no solution exists for a hand-entered position" with its
  scenario, and "Hint: The hint refuses a board no set of presses lights".
  `solve` answers `NO_SOLUTION` (`index.ts:278`) and `hint` answers
  `PUZZLE_NOT_REASONABLE` (`src/games/flip/hint.ts:43`) exactly when
  `eliminate` finds no answer (`src/games/flip/solver.ts:32`-`33`), which is
  when `hasAnswer` is false (`solver.ts:72`-`73`). `hasNoSolution` is
  `!hasAnswer` (`index.ts:265`), and `answerVerdict` refuses such a board
  before it loads, from a game ID, a link or a save alike
  (`src/engine/desc-error.ts:239`). A dealt board's lights are a sum of rows
  of its matrix (`index.ts:219`-`231`), and a press adds one row, so a board
  with an answer keeps one. Both refusals are reached only by a test that
  builds the state by hand (`src/games/flip/flip.test.ts:129`,
  `flip-hint.test.ts:226`). The comment at `hint.ts:41`-`42` ("Only a game ID
  typed by hand") is false since such an ID does not load.
- **`validateParams` has a second sentence of its own for a grid too large,
  and it is the one a player meets.** `index.ts:198`-`207`: a board whose
  `w·h` is above 2³¹ − 4 is refused with `AREA_TOO_LARGE` (`:199`-`:201`), and
  one whose `(w·h)²` is above it, so any board of 46341 squares or more, with
  "Width times height is too large." (`:203`-`:205`). The first test is
  implied by the second, so every size from 46341 squares up to 2³¹ − 4
  (216×215, 300×300) gets Flip's own sentence and only one past that gets the
  engine's. The second is a hold limit and not the refusal of a board the
  game cannot work: nothing in the rules fails at 216×215, the matrix of
  `(w·h)²` entries is what no longer fits. So `engine-params`, "A grid too
  large for a game is refused in one sentence" covers it ("more than the
  game can hold … and no sentence of its own. Where the ceiling sits SHALL
  stay the game's own"), and Flip breaks it. The fix is one line: return
  `AREA_TOO_LARGE` from the second test. The spec's scenario "A board too
  large to hold" is true (50000×50000 fails the first test) and gives the
  case a player is least likely to type.
- **Flip's generator rules out the solved board itself** (`index.ts:222`,
  `:231`), as Fifteen's and Twiddle's do, though `generate`
  (`src/engine/deal.ts:48`) deals a solved board again for every game.
- **"Generation: …" says "no two identical rows" of both rulesets**, and the
  generator checks it only for Random; for Crosses it is a property of the
  plus shape, true on every board with more than one square.
- **The spec does not say the right button does nothing**
  (`ignoresSecondaryButton`, `index.ts:173`, and a `targetVerbs` with no
  `secondary`). Both are declarations.

## Review

11 rows read, each against the declaration or the requirement it names, read
whole; 3 rows corrected, no sentence restored.

Changed:

- **"Params: Flip refuses a size it cannot use"**: "Every other refusal SHALL
  be a bound its `paramConfig` declares" stood where the copied lower bound
  had, a second pointer in a subject whose first requirement already sends
  the reader to `paramConfig`. Removed.
- **"Hint: Flip's hint calls the two states lit and unlit"**: the closing
  clause "so that the game names no hue (`engine-colors`, …)" was the copy
  with a citation attached. Removed.
- **"Hint: A press that is an unlit square's last chance is said as a
  deduction"**: "What each of a step's marks stands for SHALL be the legend's
  (`hintMarks`)" was a pointer in a subject that says plenty of its own.
  Removed, and "name every other square" made "mark and name", since the
  clause after it is about a square left unmarked.

Checked and found sound:

- The two pointers kept. `Params`: as the accepted specs keep theirs, with
  what a missing letter decodes to. `Controls`: the subject held only the
  empty-row corner, and `targetVerbs` has the one verb (`index.ts:111`-`114`).
- `engine-params`, "A game declares its rulesets with rulesetItem" and
  `help-pages`, "A game page's list of rulesets is generated" state all of
  the removed `Rules` requirement and its scenario; the legend's three roles
  state the cut marks of both hint requirements, the last press's outline
  included; `engine-colors`, "A solved flash drawn as a color takes a shared
  color" and the two `ts-engine` flash requirements state the cut `Look`
  sentence and its scenario.
- The new scenario's sentence is `AREA_TOO_LARGE` and 50000×50000 reaches it.
  Run through `paramsError` on `flipGame`, short and full: 50000×50000 gives
  "Width times height must not be unreasonably large.", 216×215 and 300×300
  give "Width times height is too large.", and 215×215 is accepted.
- The two reports asked for are under `## Found`, read from the code.
- Every kept requirement read by sentence: none is a copy. The 12 engine
  titles the ledger cites are exact.
