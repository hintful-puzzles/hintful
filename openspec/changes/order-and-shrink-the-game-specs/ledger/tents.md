# tents

The Purpose's list is corrected: "its params and description encodings" and
"drag, cursor and direct-key input" named what the spec no longer holds, and
now read as what its params refuse and its description encoding, and its drag
and its painting arrows.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Params: Tents' parameters | split in two. Sentence 1 (the three fields, `{w}x{h}d{e\|t}`, the short form and the square shorthand) and sentence 2 (width and height at least 4) replaced by one that sends the reader to the declaration and says the game departs nowhere (rule 2), under the title "Params: A Tents params string is its declared codec's, and one with no difficulty is Easy", which keeps the scenario "Params round-trip" and gains the sentence and the scenario of the requirement below. Sentence 3 (a 4×4 above Easy is refused of full params) stands, unchanged, as "Params: No 4×4 Tents board is dealt above Easy", with the scenario "A 4×4 Normal board that arrives written still loads". Scenario "Invalid params are rejected" dropped | the fields and "at least 4": `paramConfig`, `src/games/tents/state.ts:141`-`149` (`bounds: { min: 4 }`); the encoding: `paramsCodec(defaultParams, [dims(paramConfig), choice(paramConfig, "d", "difficulty", DIFF_CHARS, { full: true })])`, `state.ts:151`, with `DIFF_CHARS = "et"`, `state.ts:44`; the square shorthand: `engine-params`, "The codec grammar is a prefix, tagged segments, flags and letters"; the dropped scenario: `engine-params`, "Params validity is the engine's check" (its first scenario), and `src/games/tents/tents.test.ts:95`. The `tents` entry of `src/engine/__snapshots__/params-stability.test.ts.snap` holds `15x15dt` |
| Params: Tents params that name no difficulty are Easy | removed. "A params string with no `d` … SHALL decode as Easy" and the scenario "A bare size" move to "Params: A Tents params string is its declared codec's, and one with no difficulty is Easy". The clause "or whose `d` is followed by a letter that names no tier" is dropped: it is false of the code (see Found) | what an unknown letter does: `engine-params`, "A params string is read whole or refused" (refused, and never read as a default) |
| Controls: Tents takes a cursor and direct keys | retitled "Controls: An arrow with Shift or Ctrl grasses the squares the cursor leaves and enters". Sentence 1 (Select a tent, select2 a non-tent, or clear) and sentence 2 (`T`, `N` and `B`) cut; sentence 3 (Shift or Ctrl with an arrow) untouched, and is the whole of it. Scenario "A letter sets the cursor square" dropped; "A shifted arrow paints grass" kept | `targetVerbs.primary`, `.secondary` and `.keyOnly` with their `does` strings and keys, `src/games/tents/index.ts:123`-`155`; `engine-input`, "The engine owns a declaring game's press and select keys" (Enter the left-click verb, Space the right-click one, a verb's own keys that verb, key-only verbs included) |
| Hint: Tents explains the next deduction | retitled "Hint: A Tents hint step has one premise". "The game SHALL implement `hint` as a recording projection of its own solver rungs, one premise per step" reworded to "Each step … SHALL rest on one premise, a rung of the game's own solver"; the list of premises and the last sentence untouched. Scenario kept | `engine-hints`, "The solver and the hint are two projections of one deduction engine" (the hint runs the solver's techniques with the recorder on) |
| Hint: A Tents hint step says why and marks what it uses | title kept. "ring what it decides, outline what it reasons from, hatch the row or column it counts with, color that clue in the action color, and draw a link it asks for in the action color" replaced by a sentence that sends the reader to the legend; "in one sentence" kept. Scenario kept | `hintMarks.roles` (`ring`: "…the link is drawn between them in the hint color"; `outline`: "…the number of the row or column it counts with, which is shown in the hint's color"; `stripes`), `index.ts:462`-`469`; `engine-hints`, "The engine SHALL own the hint mark roles and the words for them" and "A hint hatches the one line its sentence names" |
| Look: The Tents completion flash fills each square and keeps its pieces | title kept. "The completion flash SHALL sweep the squares diagonally, a square's position being its place in the grid." cut, and the next sentence reworded to stand ("A square the completion flash is on"). Scenario kept | `ts-engine`, "A game gives each element a position, and the route is which position it gives"; the game's call is `flash.win(sweepStep(x, y))`, `src/games/tents/render.ts:643` |

## Kept, and why

- **Rules: Tents ships findMistakes.** `ts-engine`, "A mistake check compares
  with the one answer, hidden or not" names neither the two kinds of wrong
  square, nor that a blank is never one, nor the inset overlay.
- **Params: … one with no difficulty is Easy.** `engine-params`, "A params
  string is read whole or refused" hands the tier back to the game.
- **Params: Tents refuses a grid whose area cannot be counted.**
  `engine-params`, "A grid too large for a game is refused in one sentence"
  leaves the ceiling to the game.
- **Description**, both requirements. `encodeDesc` and `parseDesc` are written
  out by hand (`state.ts:175`, `:201`).
- **Generation: Tents generates solver-gated boards**, "accept only when the
  solver succeeds at the target difficulty and fails to converge one level
  below". For Easy the level below is the links-only cap, which
  `engine-difficulty`, "A difficulty tier binds the board it generates" does
  not ask of the easiest tier.
- **Solver: Tents' solver is a certified deduction ladder.** It says how the
  solver is built and how it is tested, which the guide says a spec does not
  hold, but the brief's three classes do not name it. Left; see Found.
- **Controls: Tents places tents and grass by click and drag.** The two
  clicks are the verbs' `does` strings, but the press, the drag along one
  line and the release are an arm of the game's own `interpretMove`
  (`index.ts:183`-`249`), and the sentence states them as one gesture.
- **Hint: A Tents hint step rests only on what the player can see.** Its
  first sentence is `engine-hints`, "A hint relies only on marks the player
  can make", said of tents, grass, trees, clues and links; the second, which
  links count as seen, hangs on it.
- **Hint: The Tents hint tries the squares beside a tree before it counts a
  line.** The order is `hint.ts`'s loop, with a link sought between rungs;
  `hintRungs` lists nine reason kinds.
- **Look**, the first two. As Clusters': `engine-colors`, "The engine owns
  what a board of pieces looks like" is taken by reference.

## Engine requests

- "`hintKeepTrack` SHALL judge a move by the squares and links it changes,
  holding a step that is only partly made and shrinking it to what is left.",
  the whole of "Hint: Tents' hintKeepTrack judges a move by what it changes".
  It is the verdict rule of `trackTargets`, `src/engine/hint-track.ts:40`,
  called at `src/games/tents/hint.ts:421`. Singles and Light Up state it of
  themselves in the same terms (`singles.md`, § "Engine requests", has the
  full request). Belongs in `engine-hints`, beside "A completed verdict
  vouches for the rest of the plan".

## Found

- **The spec said a `d` followed by a letter that names no tier decodes as
  Easy; the code refuses it.** `choice` reads the letter through
  `paramsLetter` (`src/engine/params.ts:62`), which refuses a letter not in
  `"et"`, as `engine-params`, "A params string is read whole or refused"
  requires. The clause is dropped with the cut. No scenario stated it.
  **Reviewed: true.** `choice`'s decode hands the letter after the tag to
  `paramsLetter` (`src/engine/params-codec.ts:259`-`264`), which refuses one
  the tag does not list (`src/engine/params.ts:62`-`66`), and Tents' tag
  lists `"et"` (`src/games/tents/state.ts:44`, `:153`). The engine's own test
  holds the refusal for a declared codec
  (`src/engine/params-codec.test.ts:91`); no test under `src/games/tents/`
  decodes a letter that names no tier. The spec was wrong and the code is as
  the collection requires, so no player meets a defect.
- **"Solver: Tents' solver is a certified deduction ladder" states a test**
  ("A firing census SHALL walk boards generated at every preset … and assert
  that every rung fires") and how the solver is built, and "Generation:
  Tents' Normal rungs are rungs of their own" has a scenario that says a test
  fails ("the frozen differential fails"). `openspec/config.yaml` asks for
  neither in a spec. Untouched.
- **A left drag that is not the link gesture "SHALL act as a click at its
  start"** is stated under the link requirement and again, differently
  ("extend it along the single nearer row or column, and enact it on
  release"), under the click-and-drag one, which reads as though a left drag
  painted. Only a right drag paints (`index.ts:233`).
- **The spec never says a tree is a target no verb applies to for the letter
  keys** beyond "Trees SHALL never be modified", which sits under the
  click-and-drag requirement. `setSquare` returns nothing on a tree
  (`index.ts:118`).

## Review

6 rows read, each against the declaration or the requirement it names, read
whole; 2 rows corrected.

Changed:

- **Controls: Tents takes a cursor and direct keys**, now "Controls: An arrow
  with Shift or Ctrl grasses the squares the cursor leaves and enters". The
  sentence that only sent the reader to `targetVerbs` and `engine-input` cut:
  the subject has three other requirements of the game's own, the clicks
  among them. What is left is the painting arrow, and the title says so.
- **Hint: A Tents hint step says why and marks what it uses.** ", which also
  says how the clue of a counted line and a link the step asks for are
  drawn" cut: a pointer names the declaration and does not list what it
  holds. The pointer itself stays, as the one place this subject says what
  its marks are.

Checked and found sound:

- The declarations: `paramConfig` with `bounds: { min: 4 }` and the codec
  (`state.ts:141`-`154`), `DIFF_CHARS = "et"`, the two button verbs and the
  three lettered ones (`index.ts:123`-`155`), the legend (`index.ts:462`).
  `tents.test.ts:95` holds "Width must be at least 4.".
- Every cited engine title is exact, and each requirement states all of what
  its row removed.
- The kept pointer in `Params`: without it the subject is two refusals.
- The description is written and read by hand (`encodeDesc`, `state.ts:175`;
  `parseDesc`, `:201`), so both its requirements stay.
- The engine request: no capability states the verdict rule of
  `trackTargets` (see `unruly.md`, § "Review").
- "Solver: Tents' solver is a certified deduction ladder": no capability
  states the firing census (`engine-helpers` gives `runDeductionFixpoint` and
  not that a game's rungs are each seen to fire), so it is not a copy with a
  home, and it is left as the writer found it.
- Each subject read alone: none hollow, no dangling antecedent, every title
  fits its body.
- Every requirement left untouched was read for a copy by the three classes.
  The scenarios "Following the hint finishes a board" and "Generated boards
  solve at exactly their difficulty" are the collection's promises, each the
  one scenario, or one of two, of a requirement that states the game's own;
  left.
