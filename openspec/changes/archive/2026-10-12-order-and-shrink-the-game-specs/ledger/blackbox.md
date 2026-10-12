# blackbox

The Purpose is unchanged.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Params: Black Box refuses params that cannot be played | title kept. Sentence 1 ("A `w` or an `h` below 2 or above 255 SHALL be refused, by the bounds the size fields declare.") cut; sentence 2 untouched. Scenario "A box too narrow" dropped; "Invalid params are rejected" kept. Found, mended: that scenario's THEN gives the three sentences `validateParams` answers (`src/games/blackbox/state.ts:190`-`193`) where it said "a non-null error string" | `bounds: { min: 2, max: 255 }` on the size fields of `paramConfig`, `src/games/blackbox/index.ts:402`; that a declared bound refuses: `engine-params`, "Params validity is the engine's check" (scenario "A value outside its range"). `src/games/blackbox/blackbox.test.ts:297` holds the `w: 1` case |
| Controls: A Black Box drag repeats a ball or a mark inside the box and fires nothing | title kept. In sentence 2, "SHALL repeat its press on each inside square it passes that holds what the pressed one held" cut, sentences 2 and 3 joining as what a drag from inside and a drag from the edge do; sentence 1 untouched. Scenario untouched | `engine-input`, "A drag on from a press repeats the press" (each further target that holds what the pressed target held gets the pressed button's verb, and one that holds anything else is passed over) |
| Hint: A settled square is shown by a mark, in one step | title kept. "that rings the square and outlines the laser's ends" cut from the sentence. Scenario untouched | `HINT_MARKS.roles.ring` ("what the step decides: the square to mark as known or to put a ball on…") and `.outline` ("the ends of the fired laser the step reasons from."), `src/games/blackbox/hint-text.ts:36` |
| Look: Black Box's win flash sweeps the squares of the revealed box | retitled "Look: Black Box's win flash lights the squares of the box and never a laser square". "SHALL declare no flash of its own for it", "SHALL sweep the squares of the box diagonally" and sentence 2 (a lit square is filled with a flash color and keeps its ball) cut; kept: a reveal is the win, the flash is over the squares of the box alone, a laser square is never lit. Scenario "The Solve command reveals without a flash" dropped; "A check the box accepts" written in words for the game's own case | no length of its own and no flash on Solve: `ts-engine`, "The win flash plays on a forward move that solves the board" ("A game SHALL NOT give it a length"; scenario "The Solve command does not celebrate"). The diagonal: `ts-engine`, "A game gives each element a position, and the route is which position it gives" (`sweepStep` otherwise), asked at `src/games/blackbox/render.ts:414`. The fill: `engine-colors`, "A solved flash drawn as a color takes a shared color". The new scenario: the loop at `render.ts:412` asks `flash.win` of the box's squares only |
| Controls: Black Box takes its presses, its cursor and its select keys from its target verbs | added (rule 2): the subject never said what the keyboard does but for the cursor's walk | |

## Kept, and why

- **Params: Black Box params are a size and a ball range.** The codec is
  written out (`encodeParams`, `decodeParams`,
  `src/games/blackbox/state.ts:166` and `:177`): the four letters, any order,
  a letter left out keeping its default. "SHALL refuse any other character"
  is `engine-params`, "A params string is read whole or refused" in a
  sentence about this decoder's own grammar.
- **Params: The type summary names the size and the ball count.** The words
  are the `label.words` function of the `no-of-balls` field
  (`index.ts:411`), written by hand; `engine-params`, "One describer labels
  every params set" says who joins them, not what Black Box's say.
- **Params: Only a deal is bound by the ball limit.** `engine-params`, "A
  generation-only bound is gated on full" says how such a bound is written;
  that this bound is one is the game's.
- **Controls**, the other three. Every arm is an `apply` function or the
  hand-written geometry (`index.ts:142`-`241`): what a press does depends on
  where it lands, which the `does` strings give only in outline.
- **Hint: Black Box's hint SHALL reason only from the lasers fired** and
  **Hint: The hint's steps only add marks.** `engine-hints`, "A hint is
  deduced from the board in play" leaves which marks a step rests on to the
  game.
- **Hint: With every laser fired…**, "SHALL refuse with
  `SEARCH_OUT_OF_REACH`". `engine-hints`, "A hint that plans by searching
  SHALL refuse honestly past its reach" binds a hint that searches; that this
  step of this hint is the one that searches is the game's.
- **Look: Black Box draws its balls as pieces and lifts what is settled**,
  "pieces on a quiet surface". `engine-colors` says a game takes that look by
  reference; that Black Box does is the requirement.
- **Look: The cursor and the marks keep clear of a ball**, second sentence.
  `engine-hints`, "A hint mark is drawn on the cell's border" allows two
  placements by the game's layout; which is Black Box's, and the mistake's
  frame, are the game's.

## Engine requests

None.

## Found

- **The spec said nothing of the keyboard but the cursor's walk.** Enter and
  Space apply the two verbs at the cursor through `interpretTargetVerbs`
  (`index.ts:123`); "Controls: A primary press on the edge…" says only "or
  for a moment when a key made the press". The review added the pointer
  requirement that says so (rule 2).
- **"Rules: A reveal is gated on the ball count" and "Controls: The corner
  button checks the guess while the ball count allows it" give the same
  condition twice**, once as what `executeMove` refuses and once as when the
  corner is a target (`canReveal`, `state.ts:554`, adds the failed check).
- **"Params: Black Box refuses params that cannot be played", scenario
  "Invalid params are rejected"** says only "a non-null error string"; the
  three sentences are at `state.ts:190`-`193`.

## Review

4 rows read, each against the declaration or the requirement it names, read
whole; 4 corrected, 1 row added, no sentence restored.

Changed:

- **Four pointers undone into plain removals**, each inside a subject that
  says plenty of its own: "Beside the bounds its size fields declare in
  `paramConfig`" (Params), "as the engine's drag does (`engine-input`, …)"
  (Controls), "What a step's ring and outline stand for SHALL be the legend's"
  (Hint), and "its flash SHALL be the collection's (`ts-engine`, …)" (Look).
  The drag requirement now says what a drag from inside and a drag from the
  edge do, which is the game's `reaches`; the flash requirement says the
  flash lights the squares of the box alone.
- **"Controls: Black Box takes its presses, its cursor and its select keys
  from its target verbs"** added, first of the subject (rule 2): it names
  `targetVerbs` and `engine-input`, "The engine owns a declaring game's press
  and select keys", and the one arm of the game's own (`interpretMove`,
  `index.ts:111`: the left release ends the flash of a laser pressed again).
  Its scenario is Enter on an unfired edge square, which the primary verb
  fires (`index.ts:201`-`217`).

Checked and found sound:

- The bounds (`index.ts:402`) and `engine-params`, "Params validity is the
  engine's check"; `blackbox.test.ts:297` holds `w: 1`.
- `engine-input`, "A drag on from a press repeats the press" states the cut
  clause whole (a target holding what the pressed one held gets the verb, any
  other is passed over); the kept scenario is the game's case of it.
- The legend (`hint-text.ts:36`): the ring is the square marked or given a
  ball, the outline the ends of the fired laser.
- `ts-engine`, "The win flash plays on a forward move that solves the board"
  ("A game SHALL NOT give it a length", scenario "The Solve command does not
  celebrate"), "A game gives each element a position, and the route is which
  position it gives" and `engine-colors`, "A solved flash drawn as a color
  takes a shared color" state what went from the flash requirement; Black Box
  has no `flashLength`, and `render.ts:412` asks `flash.win` of the box's
  squares only, which the writer's new scenario gives.
- Every title under "Kept, and why" exists, and the line citations were
  opened.
- The 40 requirements left untouched: none holds a sentence a declaration or
  a shared requirement states whole.

## Third pass

Nothing changed in the spec. Rows of the engine's third-round tables that
name Black Box: 0. Engine requests of its own: 0. Sentences cut: 0. Clauses
kept: 2, each read against the third-round requirement it resembles.

- **Kept: "Past the search's budget it SHALL refuse with
  `SEARCH_OUT_OF_REACH`"** in "Hint: With every laser fired, the hint offers
  a layout it searched for". `engine-hints`, "A search that can prove a
  position lost says which of its two ends it met" binds a game that can be
  lost and searches for a finishing line; Black Box's search is for a layout
  and has the one refusal, which the game gives itself.
- **Kept: "and nothing once the answer is revealed"** in "Rules: Black Box
  checks marks against its answer". `ts-engine`, "A mistake check compares
  with the one answer, hidden or not" speaks of a board with no one answer
  established; a revealed board has one, and reporting nothing there is the
  game's.
- No "no departure" sentence, none of the form "What a pasted game ID opens
  as" and none citing `engine-difficulty`.

## Found, mended

- The spec said nothing of the keyboard but the cursor's walk: left: the
  review mended it, with "Controls: Black Box takes its presses, its cursor
  and its select keys from its target verbs".
- "Rules: A reveal is gated on the ball count" and "Controls: The corner
  button checks the guess while the ball count allows it" give one condition
  twice: left: neither says only what the other does. The first is what
  `executeMove` refuses of a reveal move (`state.ts`, `canReveal`), with the
  scenario of the throw; the second is when the corner is a target, with the
  failed check and the revealed board besides.
- The scenario "Invalid params are rejected" said only "a non-null error
  string": it now gives the three sentences (`state.ts:190`-`193`).
