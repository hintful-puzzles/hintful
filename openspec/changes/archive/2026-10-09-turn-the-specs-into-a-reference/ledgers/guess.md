# Ledger: guess

Base: bb004490

Where every rule of Guess's spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters.

## Guess game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `guess` game implements `Game`, a Mastermind clone of `npegs` pegs from `ncolors` colors within `nguesses` rows | spec: Guess game implements the Game interface |
| The list of the interface's type arguments | untrue: `guessGame` in `src/games/guess/index.ts` takes eight, with `GuessHighlights` and `GuessRung` after the six named |
| The five params, their encoding and the lenient decode | spec: Guess's parameters |
| Standard, Super and a third preset that is Standard with duplicates forbidden | spec: Guess's parameters |
| "The two upstream presets" | history |
| `validateParams` rejects `allowMultiple = false` with `ncolors < npegs` | spec: Guess refuses params no board can be dealt for |
| `validateParams` rejects `ncolors < 2`, `npegs < 2`, `ncolors > 10` and `nguesses < 1` | untrue: `validateParams` in `src/games/guess/state.ts` tests the duplicates case alone, and these are `bounds` on the `paramConfig` items in `src/games/guess/index.ts` that the engine's `paramsError` refuses; spec: Guess refuses params no board can be dealt for |
| It provides `statusbarText`, `solve` and `findMistakes`, and not `textFormat` | spec: Guess game implements the Game interface |
| Scenario: params round-trip and lenient decode | spec: Guess's parameters |
| Scenario: invalid params are rejected | spec: Guess refuses params no board can be dealt for |

## Guess descriptions are obfuscated solution bitmaps

| Rule | Where it went |
| --- | --- |
| `newDesc` draws the sequence, redraws a repeat without `allowMultiple`, masks the byte-per-peg bitmap and hex-encodes it | spec: Guess descriptions are obfuscated solution bitmaps |
| The masking is "the upstream `obfuscate_bitmap`" | history |
| `newState` recovers the solution by hex-decoding and de-obfuscating | spec: Guess descriptions are obfuscated solution bitmaps |
| `validateDesc` rejects a desc of the wrong length or with a byte outside `1..ncolors` | untrue: the game has no `validateDesc` and `newState` in `src/games/guess/state.ts` refuses such a desc through `readDesc`, which the engine's `validateDesc` in `src/engine/desc-error.ts` reads; spec: Guess descriptions are obfuscated solution bitmaps |
| Scenario: a description round-trips through obfuscation | spec: Guess descriptions are obfuscated solution bitmaps |
| Scenario: a corrupted description is rejected | spec: Guess descriptions are obfuscated solution bitmaps |

## Guess scores submitted rows with Knuth feedback

| Rule | Where it went |
| --- | --- |
| A move is a guess submission with pegs and holds, or a set of answer-row marks | spec: A Guess move is a submitted row or a set of marks |
| Solve submits the answer as the next guess, which wins, and `executeMove` is pure | spec: A Guess move is a submitted row or a set of marks |
| A submission validates each peg, scores black and white, stores the feedback and advances unless every peg is in place | spec: Guess scores submitted rows with Knuth feedback |
| Won on a last row all in place, lost with the solution revealed when the rows run out, both judged from the rows on the board | spec: Guess is won or lost by the rows on the board |
| Scenario: a correct guess wins | spec: Guess is won or lost by the rows on the board |
| Scenario: feedback counts black then white pegs | spec: Guess scores submitted rows with Knuth feedback |
| Scenario: exhausting the rows loses and reveals | spec: Guess is won or lost by the rows on the board |

## Guess offers one key per color, and a tap selects a peg

| Rule | Where it went |
| --- | --- |
| A key per color, a Clear key and a Submit key, and what each does | spec: Guess offers one key per color |
| Colors were reachable only by a drag from the palette column, which a finger's pause dropped | history |
| The frontend promotes a press within 8 px for 350 ms | figure |
| Guess cannot turn the promotion off with `ignoresSecondaryButton`, since its right button toggles a hold | spec: A hold stays off the panel |
| Colors are Guess's markable elements, and the collection puts a game's elements on the panel | reason |
| A key acts whether or not the cursor is shown, revealing it, and with no cursor a color goes to the first empty slot | spec: A key acts whether or not the cursor is shown |
| That holds for every key in every mode, and every key reveals the cursor | untrue: in notes mode `interpretMove` in `src/games/guess/index.ts` declines a color key and Clear when `markSlot` finds no cursor shown, and the Submit arm returns its move without setting `cursor.visible`; spec: In notes mode a color key rules its color out |
| "Deliberately unlike Map", and what makes the panel usable on touch | reason |
| A key is painted in its color and labeled with its digit, and the tenth color is the `'0'` key and not `'a'` | spec: A color key wears its color and its digit |
| A ten-color game is reachable from the Custom dialog, and the sweep for inert keys reads default params only | reason |
| The Submit key's code is one the key map does not send, it is offered unconditionally, declined on a row that is not markable, and the status line carries the reason | spec: The Submit key is always offered and only the panel sends it |
| No automatic submit when the last slot is filled, since undo cannot give the row back | spec: Guess never submits a row on its own |
| An automatic submit could not replace the Submit control, since editing a full row never re-crosses the boundary | reason |
| A release over a current-row peg selects it and leaves notes mode, which keeps a mid-row blank expressible | spec: A tap selects a peg of the working row |
| The board draws no palette column, and its width carries no term for one | spec: The board draws no palette column |
| What upstream drew, and the quarter of the width the column cost | history; figure |
| The board's height is the guess rows' alone | untrue: `computeSize` in `src/games/guess/render.ts` adds the answer row's 1.5 tiles to the guess rows; spec: The board draws no palette column |
| The pegs do not get bigger, measured at 1280×720 with a 46 px spacing | figure |
| A tap selects a slot and never a color in one, the panel is the pointer's only way to choose a color, and with the keypad off the digits enter pegs and marks | spec: The panel is the pointer's only way to choose a color |
| A block is a fifth of a peg across and taps missed it (owner, with a date) | history |
| The cursor is one-dimensional, `CURSOR_SELECT` submits or toggles notes mode and is declined when hidden, and a digit names a color in one press | spec: Guess's keyboard cursor is one-dimensional |
| The second axis walked the palette column and went with it | history |
| A hold stays off the panel and is reached by a right click, a long press and `CURSOR_SELECT2` | spec: A hold stays off the panel |
| Scenario: a guess is committed from panel buttons alone | spec: Guess offers one key per color |
| Scenario: a tap on an empty slot selects it | spec: A tap selects a peg of the working row |
| Scenario: a tap on a filled slot keeps the cursor | spec: A tap selects a peg of the working row |
| Scenario: the board has no palette to tap | spec: The board draws no palette column |
| Scenario: the tenth color is the zero key | spec: A color key wears its color and its digit |
| Scenario: Enter on a slot toggles notes mode | spec: Guess's keyboard cursor is one-dimensional |

## Guess rubs out a color without ever lengthening the row

| Rule | Where it went |
| --- | --- |
| Erase clears the selected slot when it holds a color, else backspaces past held slots, and is declined when every filled slot is held | spec: Guess rubs out a color without ever lengthening the row |
| The erase key does that in notes mode too | untrue: in notes mode `interpretMove` in `src/games/guess/index.ts` answers an erase key with `clearMarks` on the cursor's answer slot and leaves the working row alone; spec: In notes mode a color key rules its color out |
| The key never writes past the last peg, by a scan or a checked cursor and not by declining | spec: Guess rubs out a color without ever lengthening the row |
| The erase arm was the one that did not bound the cursor, and what went wrong unguarded | history |
| Scenario: clearing on the submit position backspaces | spec: Guess rubs out a color without ever lengthening the row |
| Scenario: backspace leaves a held peg alone | spec: Guess rubs out a color without ever lengthening the row |

## Guess says why a row will not go

| Rule | Where it went |
| --- | --- |
| `statusbarText` names the guess in progress and the number available, and says when a repeat keeps the row from going | spec: Guess says why a row will not go |
| The line always names the guess in progress | untrue: once the game is over `statusbarText` in `src/games/guess/index.ts` reports the outcome instead, "Solved in N guesses." or "Out of guesses: the answer is revealed." |
| A silent `null` reads as a broken key | spec: Guess says why a row will not go |
| It is why the Submit key can be offered unconditionally | spec: The Submit key is always offered and only the panel sends it |
| Scenario: a repeat under no-duplicates is explained | spec: Guess says why a row will not go |
| Scenario: the explanation goes when the repeat does | spec: Guess says why a row will not go |

## Guess remembers a half-composed row across a save

| Rule | Where it went |
| --- | --- |
| `encodeUi` and `decodeUi` carry the working row and the live holds, which the move log does not hold | spec: Guess remembers a half-composed row across a save |
| `decodeUi` empties a peg with no color and leaves the cursor where the next color goes | spec: Guess remembers a half-composed row across a save |
| Without the hook a player who closed the app mid-row lost it | history |
| Scenario: a half-composed row survives a save | spec: Guess remembers a half-composed row across a save |
| Scenario: a peg no color exists for is dropped | spec: Guess remembers a half-composed row across a save |

## Guess composes a row from colors, holds and keyboard input

| Rule | Where it went |
| --- | --- |
| What `interpretMove` supports, and that it does not consume `'h'`, `'H'` or `'?'` | spec: Guess composes a row from colors, holds and keyboard input |
| A color lands in the selected slot, else the first empty one, and the cursor rests on the first empty slot after a transition and after every entry | spec: A color lands in the selected slot, else the first empty one |
| Advancing by index let the first color after a submit overwrite a held peg | history |
| With no empty slot the cursor rests on the submit position | untrue: `restCursor` in `src/games/guess/index.ts` rests there only when the row is markable, and otherwise on its fallback, the slot just entered or slot 0; spec: A color lands in the selected slot, else the first empty one |
| A color is declined when the row is full and no slot is selected | spec: A color is declined when the row is full and no slot is selected |
| A row is markable only with enough pegs and, without `allowMultiple`, no repeat | spec: A row is submittable only when it is markable |
| The working row, holds, cursor, label toggle and notes mode live in `GuessUi`, holds carry pegs forward, and `changedState` rebuilds only when the row being played changes | spec: The working row lives in the Ui and is rebuilt only when the row changes |
| A pointer action happens on the release, keyed on the button class, with the press declined, so a slid press acts where it started and a promoted press acts as itself | spec: Guess's pointer acts on the release |
| That holds for every pointer action | untrue: `interpretMove` in `src/games/guess/index.ts` toggles a hold on the `RIGHT_BUTTON` press and consumes it; spec: Guess's pointer acts on the release |
| Claiming the press would buy only drag frames nothing reads, and the 350 ms hold | reason; figure |
| Scenario: submit is only offered for a markable row | spec: A row is submittable only when it is markable |
| Scenario: holds carry pegs to the next guess | spec: The working row lives in the Ui and is rebuilt only when the row changes |
| Scenario: the first key after a submit does not overwrite a held peg | spec: A color lands in the selected slot, else the first empty one |
| Scenario: a mark keeps the half-composed row | spec: The working row lives in the Ui and is rebuilt only when the row changes |
| Scenario: the hint letters reach the app | spec: Guess composes a row from colors, holds and keyboard input |

## Guess's hint places what the rows prove, then suggests a guess

| Rule | Where it went |
| --- | --- |
| The three hooks, reading nothing but the scored rows, and the two kinds of step in order | spec: Guess's hint places what the rows prove, then suggests a guess |
| A mark step places one reading's rule-outs as one move, narrated, with its slots outlined and its colors framed, from the hint's own rule-outs, never a mark the board has | spec: A mark step places what one reading proves |
| The row a mark step reads is outlined | untrue: the row is hatched, the `stripes` role of `hintMarks` in `src/games/guess/index.ts`, drawn with `drawHatch` in `src/games/guess/render.ts`; spec: A mark step places what one reading proves |
| The readings are sound, checked by brute force over the whole answer space | spec: The hint's readings are sound |
| Every plan ends with a guess that fits, one color per slot framed, claiming only what was counted and recounted, a function of the scored rows alone | spec: Every plan ends with a probe that could win |
| Every plan ends with a guess | untrue: `guessHint` in `src/games/guess/hint.ts` returns the mark steps alone when `chooseProbe` finds no fitting answer within `NODE_BUDGET`; spec: Every plan ends with a probe that could win; spec: Following the hint wins, and the hint refuses only a dead end |
| On the presets following the hint wins within the row limit, checked over every Standard answer | spec: Following the hint wins, and the hint refuses only a dead end |
| The hint refuses only once the game is over | untrue: `guessHint` in `src/games/guess/hint.ts` also answers `SEARCH_OUT_OF_REACH` when its enumeration finds no fitting answer and no mark is left, and ends the plan without a guess when marks are left; spec: Following the hint wins, and the hint refuses only a dead end |
| Scenario: a row with no blacks is read as marks | spec: A mark step places what one reading proves |
| Scenario: a mark the player made is not taught again | spec: A mark step places what one reading proves |
| Scenario: the plan ends in a guess that could win | spec: Every plan ends with a probe that could win |
| Scenario: following the hint wins | spec: Following the hint wins, and the hint refuses only a dead end |

## Guess marks an answer slot selected as a whole

| Rule | Where it went |
| --- | --- |
| The answer row, its height, its slots and cells, a possible color as a block and a ruled-out one as nothing, and the reveal replacing it | spec: Guess draws an answer row of the colors still possible |
| The well darker than every peg color in both schemes, the cell grid, a block never reading as a peg, and the digit with labels on | spec: The answer row's blocks stay legible |
| `ruledOut` is state, changed by a mark move that sets and does not toggle | spec: A mark is state, set by a move |
| The selection decides what a color key does, a release on an answer slot selects it and turns notes mode on, one on a working-row peg turns it off, and the pointer never acts on one color | spec: Guess marks an answer slot selected as a whole |
| A right-click or held finger on the answer row does nothing | untrue: `interpretMove` in `src/games/guess/index.ts` declines the press, and the release the frontend then sends selects the slot, since `isMouseRelease` answers for both buttons; spec: Guess marks an answer slot selected as a whole |
| In notes mode a color key or digit toggles its color in the selected slot, and Clear puts every color back | spec: In notes mode a color key rules its color out |
| Notes mode is `GuessUi.pencilMode`, the cursor is drawn round the answer slot in the margin and off the submit position, and the Marks key and `CURSOR_SELECT` move the frame between the rows | spec: Notes mode is the engine's pencil mode |
| A hint's mark is a frame beside the block, and its evidence outline sits in the margin | spec: A hint's marks on the answer row sit beside the content |
| A mark is never reported as a mistake | untrue: `findMistakes` in `src/games/guess/state.ts` reports a slot whose marks rule out the code's color, as the later requirement says; spec: Guess checks the answer row's rule-outs against the code |
| A check against the answer would tell the player what the rows have not | reason |
| Scenario: a tap anywhere on an answer slot selects it for marking | spec: Guess marks an answer slot selected as a whole |
| Scenario: a color key marks the selected slot | spec: In notes mode a color key rules its color out |
| Scenario: a tap on the working row goes back to entering pegs | spec: Guess marks an answer slot selected as a whole |
| Scenario: a held finger on the answer row marks nothing | spec: Guess marks an answer slot selected as a whole |
| Scenario: notes mode keeps the cursor off the submit position | spec: Notes mode is the engine's pencil mode |
| Scenario: a ruled-out color is drawn as nothing | spec: Guess draws an answer row of the colors still possible; spec: The answer row's blocks stay legible |

## Guess checks the answer row's rule-outs against the code

| Rule | Where it went |
| --- | --- |
| `findMistakes` reports a slot ruling out the code's color, as the slot alone, nothing once the game is over, and without reading the guess rows | spec: Guess checks the answer row's rule-outs against the code |
| The mistake is a frame in the error color in the margin round the well, repainting when it comes and goes | spec: Guess checks the answer row's rule-outs against the code |
| The frame is held in the slot's cache key | held: src/games/guess/render.ts "ANSWER_MISTAKE" |
| Scenarios: a rule-out of the code's own color, every color ruled out, a guess that is not the code | spec: Guess checks the answer row's rule-outs against the code |

## Guess draws an empty hole as quiet surface

| Rule | Where it went |
| --- | --- |
| An empty peg hole and an empty feedback hole are the cell surface inside a rim in the grid line | spec: Guess draws an empty hole as quiet surface |
| The peg colors, the feedback pegs, the ready-row wash, the held-peg bar and the well keep their colors | spec: Guess draws an empty hole as quiet surface |
| "As before" | history |
| Scenarios: an empty hole recedes, a peg keeps its color and its outline | spec: Guess draws an empty hole as quiet surface |
