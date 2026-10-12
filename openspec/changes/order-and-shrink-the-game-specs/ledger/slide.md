# slide

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Params: Slide's params are a width, a height and a solution-length limit | removed, with its scenario "A game ID round-trips through the parameters". Its one clause no declaration makes plain to a reader of the params string (a negative `maxmoves` means no limit) joins "Params: Slide's params write the limit as m and a number, or u" | the three fields: `paramConfig`, `src/games/slide/index.ts:278`-`303`, whose third item's `doc` says "Enter a negative number for no limit at all"; that the string encodes them: "Params: Slide's params write the limit as m and a number, or u", in this spec; the round trip: `engine-params`, "Encode and decode are mutual inverses over the corpus" (every registered game, a hand-written codec included). The `slide` entry of `src/engine/__snapshots__/params-stability.test.ts.snap` holds `6x7m40`, `6x7m25` and `6x7u` |
| Params: A Slide board too large to generate is rejected | retitled "Params: A Slide board too large for the solver's search is rejected". Body and scenario untouched | nothing went: the old title read as a generation-only bound, and `validateParams` ignores `full` (`src/games/slide/state.ts:161`), as the requirement "Params: Slide's area limit holds for a board that arrives with its description" says |
| Solver: Solve plays a shortest route from the current position | title kept. The clause "so the board is finished, as Solve finishes every game's board" cut from its one sentence. Scenario untouched | `ts-engine`, "Solve leaves a solved board" |
| Params: Slide's params write the limit as m and a number, or u | gains the clause "which a negative `maxmoves` means" after "or `u` for no limit", from the requirement above. Nothing else | |
| Params: Slide's size limits hold for a board that arrives with its description | retitled "Params: Slide's area limit holds for a board that arrives with its description". Sentence 1 (a width below 5 or above 251 and a height below 4 are refused as the bounds of the dialog's fields) cut; sentences 2 and 3 joined into one about the 48 squares alone. The scenario's "AND" clause (the width written `4`) dropped; the rest of it untouched | the bounds: `bounds: { min: 5, max: MAXWID }` and `{ min: 4 }`, `index.ts:281` and `:286`; that a bound holds whatever `full` says: `engine-params`, "A generation-only bound is gated on full" ("a bound applies whatever the `full` flag says and would refuse a description-carrying game ID") and "Params validity is the engine's check" (its scenario is "Width must be at least N."). `src/games/slide/slide.test.ts:191` holds the three bound sentences |
| Params: A Slide board's name gives the limit on its shortest solution | title kept. Sentence 1 (the name gives the size and then `max {n} moves` or `no move limit`) cut; sentence 2 reworded to stand without it ("The solution-length limit a board's name gives SHALL be…"). Scenario untouched | the two `label.words`, `index.ts:282` and `:295`; `engine-params`, "One describer labels every params set" and "A params field declares what it means, its range and its words". The snapshot above holds "6x7, max 25 moves" and "6x7, no move limit" |
| Controls: Slide plays from the keyboard alone | removed, with its scenario "A board can be completed without a pointer" | `engine-input`, "Every action is reachable with the two buttons alone" ("…by clicks and drags, as well as from the keyboard") and "A keyboard commits a move". "Both driving the same move machinery" is this spec's "Controls: A keyboard journey produces the one move its drag produces" |
| Controls: A grab is dropped when the board changes under it | sentences untouched. Scenario "An undo made while the pointer is still down" dropped; "A grab dropped by an undo leaves the cursor in place" kept | `engine-input`, "A board change from outside the input ends the gesture in flight" (scenario "an undo lands under a drag the engine cannot see") and "An ended gesture leaves the Ui as before its press" (scenario "a preview is on screen when the board changes": the frame is the undone board with no gesture on it) |
| Look: Slide draws a held block where it would land, with no slide animation | retitled "Look: Slide draws a held block where it would land". Last sentence ("There SHALL be no interpolated sliding animation: a block released goes straight to its cell.") cut. Scenario untouched | `animLength: () => 0`, `index.ts:361` |
| Controls: Escape, Backspace and Delete each cancel in Slide | third pass: title kept. Sentence 1 ("Escape, Backspace and Delete SHALL each be a cancel key.") cut; sentence 2 reworded to name the three keys itself ("With a block grabbed, Escape, Backspace and Delete SHALL each hand it back…"), sentence 3 untouched. Both scenarios kept | `engine-input`, "Escape and the erase keys are the cancel keys". `isCancelKey(button)`, `src/games/slide/index.ts:192` |

## Kept, and why

- **Params: Slide's params write the limit as m and a number, or u.** A
  hand-written codec (`encodeParams` and `decodeParams`,
  `src/games/slide/state.ts:99`-`123`), and the default limit of 40 a string
  with neither letter takes is what an old link depends on.
- **Params: A Slide board too large for the solver's search is rejected**, and
  the 48 in the requirement after it. `engine-params`, "A grid too large for a game is
  refused in one sentence" is about what a game can hold; this is a board the
  solver cannot work, with a sentence and a reason of its own (`design.md`
  § "Found by the readers, and fixed at the owner's word").
- **Controls: The keyboard select grabs with the pointer's grab**, "Selecting
  SHALL show the cursor". Slide declares no `targetVerbs`; this is an arm of
  `interpretMove`.
- **Controls: A pointer press takes the board over**, "it SHALL hide the
  cursor". `engine-input`, "One arrow press reveals the cursor and moves it"
  says a pointer press hides it; the sentence's other half (it puts down what
  the keyboard held) hangs on it.
- **Controls: A grab is dropped when the board changes under it**, the
  sentences. The engine ends a pointer gesture; a block held from the keyboard
  is no gesture in flight, and dropping it is the game's `changedState`.
- **Controls: Either pointer button moves a Slide block.** A departure from
  `engine-input`, "A game with no secondary meaning is not given a synthetic
  one", folded by hand (`design.md` § "Found, and the owner's to decide").
- **Controls: Escape, Backspace and Delete each cancel in Slide.** Its
  first sentence was kept until the third pass, which cut it (see its row).
  What a cancel puts down is the game's by the engine requirement's last
  sentence.
- **Look: Slide's board reads by color, not by bevel alone**, "a function of
  the host background rather than an authored color". `engine-colors`, "A
  shared role is an absolute color or a function of the background" is about a
  shared role; these four fills are the game's ladder.

## Engine requests

- "Escape, Backspace and Delete SHALL each be a cancel key.", in "Controls:
  Escape, Backspace and Delete each cancel in Slide". Belongs in
  `engine-input`: the three keys are one predicate of the engine's,
  `isCancelKey` in `src/engine/pointer.ts`, and no requirement names it. What
  a cancel does with a block held stays the game's.
  **Answered:** `engine-input`, "Escape and the erase keys are the cancel
  keys".

## Found

- **Two requirements state one refusal.** "Params: A Slide board too large
  for the solver's search is rejected" (retitled in review; it read "too large
  to generate") speaks of a "documented bound" and of generation's memory;
  the next says the bound is 48 and holds with a description in hand.
  `validateParams` ignores `full` (`state.ts:161`), so the board is refused
  however it arrives. The first's scenario still speaks only of generation.
- **"The measurements that set the bound SHALL be recorded with it"** is a
  requirement on a comment (`state.ts:125`-`158`), not on behavior.
- **"Controls: The keyboard select…": "There SHALL be one grab
  implementation"** states how the thing is built. Left, since "Controls: A
  keyboard journey produces the one move its drag produces" rests on it.
- **Slide has no hint** (`index.ts:21`), so by the collection's rule it is a
  draft; the spec owes no `Hint` subject and has none.

## Review

Seven rows read, each against the code line and the engine requirement it
names; one corrected, two added. The 26 requirements the writer left
untouched read sentence by sentence against the three classes; one clause cut
and one title mended, which leaves 24 untouched.

- **Corrected: "Params: Slide's area limit holds for a board that arrives
  with its description".** The writer's sentence ended "as the bounds its
  width and height declare do (`engine-params`, "A generation-only bound is
  gated on full")": the cut first sentence put back as a citation. Removed;
  the row says where the bounds are stated.
- **Cut: "as Solve finishes every game's board"**, with "so the board is
  finished", from "Solver: Solve plays a shortest route from the current
  position". A rule of the collection (`ts-engine`, "Solve leaves a solved
  board"); what is left is the game's choice of where the route starts.
- **Retitled: "Params: A Slide board too large to generate is rejected".**
  `validateParams` takes `_full` and never reads it (`state.ts:161`), and
  the next requirement's scenario holds the refusal with a description in
  hand, so "to generate" was false of the code. The
  refusal's own sentence names the solver.
- **Sound: the removed "Params: Slide's params are…".** The three fields are
  `paramConfig`'s (`index.ts:278`-`303`), the encoding is the kept codec
  requirement's, and `6x7m25` and `6x7u` are in the params snapshot.
- **Sound: the name's words.** `label.words` at `index.ts:282` and `:295`
  give `{w}x{h}`, "max {n} moves" and "no move limit".
- **Sound: the removed "Controls: Slide plays from the keyboard alone".**
  `engine-input`, "Every action is reachable with the two buttons alone"
  says every action is reachable from the keyboard as well; "A held block
  moves one cell per press" keeps the game's own reason a press does not
  slide to the end.
- **Sound: the dropped undo-under-a-drag scenario and the cut animation
  sentence** (`engine-input`, "A board change from outside the input ends the
  gesture in flight"; `animLength: () => 0`, `index.ts:361`).
- **The engine request stands.** `engine-input` names Escape nowhere, and
  Backspace only in "Backspace clears wherever the panel's Clear does".
  `isCancelKey` is also what Loopy, Net, Pearl, Rectangles and Slant ask.

## Third pass

Rows of the engine's third-round tables that name Slide: 1. Engine requests
of its own: 1, answered. Sentences cut: 1. Clauses kept: 3.

- **"Controls: Escape, Backspace and Delete each cancel in Slide"**: its
  first sentence went to `engine-input`, "Escape and the erase keys are the
  cancel keys". Kept: that all three cancel here (the engine lets a game
  cancel on Escape alone, so which keys is Slide's, and the sentence that
  says what is put down names them, as Pearl's and Rectangles' do); what a
  cancel does with a block held; what it does with none. The title still
  fits.
- **Left as it is: "A held block SHALL be drawn lit up at its snapped
  destination"** in "Look: Slide draws a held block where it would land".
  `engine-colors`, "A lit beveled tile is lit on its face and keeps its bevel"
  is true of Slide's blocks; the sentence says where a held block is drawn
  and nothing of face or bevel, so it holds no copy.
- No "no departure" sentence, none of the form "What a pasted game ID opens
  as" and none citing `engine-difficulty`.
