# inertia

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Params: Inertia's parameters | retitled "Params: Inertia's params are its declared codec's, and a grid under six squares is refused". Sentence 1 (`w` and `h`, encoded `WxH`) and the first half of sentence 2 (each dimension 2 or more) replaced by one sentence that sends the reader to the declaration and says the game departs nowhere. The area refusal and its reason kept, word for word. Scenario "Params round-trip" dropped; scenario "Degenerate params are rejected" replaced by "The smallest boards", written from the game's test, which keeps the area case and drops the dimension case | the fields and the floor of 2: `paramConfig` (`dimensionParamConfig({ bounds: { min: 2 } })`), `src/games/inertia/state.ts:68`, refused by `engine-params`, "Params validity is the engine's check"; the encoding: `paramsCodec(defaultParams, [dims(paramConfig)])`, `state.ts:76`; the round trip: `engine-params`, "A game declares its params encoding once, and both codec halves are derived" and "Encode and decode are mutual inverses over the corpus". The `inertia` entry of `src/engine/__snapshots__/params-stability.test.ts.snap` holds the strings. The new scenario's sentence and sizes: `validateParams`, `state.ts:87`, and `src/games/inertia/inertia.test.ts:104` |
| Params: Inertia refuses a grid too large to count | added (Found pass): what `validateParams` refuses as too large, with a scenario in words | |
| Description: Descriptions encode the grid, and the start square becomes a stop | Found pass: "`validateDesc` SHALL reject a desc of the wrong length, containing…" reworded to "A desc SHALL be refused when it is of the wrong length, contains…", the game having no hook of that name; the four refusals untouched. The scenario "A desc with no gems is rejected" gives its case by the test's string and the code's sentence | |
| Solver: Solve plays a computed route to the finished board | sentences untouched. In the scenario "Solve finishes the game", "and the game reports itself solved with help" replaced by the game's own case of the last sentence (one move, the ball at the route's end, no slide animated) | `ts-engine`, "Solve leaves a solved board" (scenario "Solve finishes the board": the status is solved and the midend reports it solved-with-help). The new clause: `executeMove`, `src/games/inertia/index.ts:90`-`94`, and `animLength`, `src/games/inertia/render.ts:488` |
| Hint: The hint plans for the nearest gem the ball can safely take | "The game SHALL implement `hint`, planning in **legs**" reworded to "The hint SHALL plan in **legs**"; nothing else. Whole read: the line the rewording left short rewrapped, no word changed | that the game has a hint: `hint` on the `Game`, `index.ts:297`; `ts-engine`, "A game's contract sections are implemented, not applicable, or absent, and an absent one makes it a draft" |
| Hint: A hint is a nudge, and only Solve is a commitment | removed, both scenarios with it | `ts-engine`, "Only the Solve command sets the solver record": a hint does not set the record, shown or played; help is another record, which labels the timer and changes neither the status nor the completion words; its scenario "A board finished by hints alone" is this requirement's two scenarios in a game with a status bar. That a hint's step shown is help: `ts-engine`, "Help is the app doing some of the solving" |
| Hint: The hint is drawn as a marked gem and an arrow | retitled "Hint: An aimed swipe's arrow replaces the hint's". Sentence 1 (the subgoal gem ringed in its own color, the direction an arrow on the ball) removed. Sentence 2 untouched. Scenario "The marked gem is ringed and the direction shown" dropped; scenario "A swipe aimed across a displayed hint" written for the kept sentence. Whole read: the kept sentence rewrapped, no word changed | `hintMarks.roles.ring` ("the way to slide: an arrow on the ball, in the hint's color.") and `.outline` ("the gem the hint is working on, circled in a second color…"), `index.ts:299`-`305`; `engine-hints`, "A bound hint step's words SHALL name exactly the marks it draws". The new scenario: `redraw`, `render.ts:463`-`479` (the aim wins the arrow) and `:436` (the gem's circle does not read the aim) |
| Hint: The hint refuses honestly when the move to make is undo | Whole read: one line past the wrap rewrapped, no word changed | |

## Kept, and why

- **Controls: All eight directions are reachable from the keyboard.**
  `engine-input`, "The engine reads a number-pad digit as a direction, once"
  gives the layout, which the requirement already hands to `numpadDirection`.
  That the top row's digits are read as the pad's is a hand-written line of
  `interpretMove` and a departure: the shared requirement's second scenario
  says a top-row digit names no direction.
- **Controls: The swipe works on the secondary button.** A departure from
  `engine-input`, "A game with no secondary meaning is not given a synthetic
  one", stated with its reason (`design.md` § "Found, and the owner's to
  decide").
- **Hint: Following the hint keeps the plan.** `engine-hints`, "A player move
  is classified against the stored plan" says what each verdict does. Which
  move earns "completed" here (a slide in the step's direction, whatever else)
  is `hintKeepTrack`, a hand-written function, and the second sentence is its
  reason.
- **Hint: The hint refuses honestly when the move to make is undo.**
  `engine-hints`, "An escape names a dead end only one puzzle has" names
  Inertia's dead ball in a parenthesis and states neither refusal.
- **Hint: Inertia's hint refuses in Solve's words where no route is found.**
  `ts-engine`, "A fact a hint and Solve both meet is worded once" says the two
  agree; when this hint reaches that refusal, and that it outlines nothing, is
  the game's.
- **Status bar**, "The words that open the bar … are the engine's": already a
  pointer, and the last scenario needs it.
- **Look: A move animates the slide, and death and the win flash.** `ts-engine`,
  "A game gives each element a position, and the route is which position it
  gives" offers the diagonal sweep among others; that Inertia takes it, lights
  the floor and skips a wall is the game's. `animLength` and `flashLength` are
  functions here and not constants.
- **Look: Inertia's pieces and ball**, the gem's and the ball's colors.
  `engine-colors`, "The pair's hues carry what a player moves, seeks and
  finishes" and "The figure the player steers takes the cursor's color" give
  the roles; which piece takes which is the requirement.

## Engine requests

None.

## Found

- **The spec does not say a grid too large is refused.** `validateParams`
  returns `AREA_TOO_LARGE` where width times height is not a safe integer
  (`state.ts:81`); `engine-params`, "A grid too large for a game is refused in
  one sentence" leaves where the ceiling sits to the game's spec.
- **"Hint: The hint refuses honestly…" does not say a hint with no leg at all
  refuses with `NO_MOVE_WORTH_MAKING`** (`src/games/inertia/hint.ts:349`). The
  route check above it makes the branch unreachable on a board with a route,
  so no player meets it.
- **The spec calls the gem's mark a ring** ("ring in its own color", "the
  board rings its subgoal gem") where the legend's role for it is the outline
  and the ring is the arrow. Both sentences went with the cut; "Hint: The hint
  explains each move…" says only "marked".

## Review

Five rows read, each against the code line and the engine requirement it
names; one corrected. The 28 untouched requirements read sentence by sentence
against the three classes; none cut.

- **Corrected: "Hint: An aimed swipe's arrow replaces the hint's".** The
  writer's first sentence ("What the arrow on the ball and the circle round a
  gem stand for in a hint SHALL be the legend's (`hintMarks`)") was the copy
  with a citation attached, in a subject that is otherwise all the game's
  own. Removed; the row's third cell says where the marks are stated.
  The kept sentence stands alone, and "Hint: The hint explains each move by
  the gem it is going for" still says the subgoal gem is marked.
- **Sound: the Params pointer.** The subject's only other statement is the
  six-square refusal, a corner case, so the one sentence that says where the
  width, the height and `WxH` are stated is rule 2's. `paramConfig` and
  `paramsCodec([dims])` are at `state.ts:68` and `:76`; "Width must be at
  least 2." and the 2×2 and 3×2 cases are `inertia.test.ts:104`-`110`.
- **Sound: the removed "Hint: A hint is a nudge…".** `ts-engine`, "Only the
  Solve command sets the solver record" states both its sentences and both
  its scenarios (Inertia has a status bar).
- **Sound: the Solve scenario's new clause.** `executeMove` plays the whole
  route as one `solution` move and zeroes `distanceMoved`
  (`index.ts:90`-`94`).
- **Sound: the new scenario "A swipe aimed across a displayed hint".**
  `render.ts:463`-`479`: the aim's direction and color win the one arrow; the
  gem's circle (`:436`) reads only the step's goals.
- **Kept and checked**: the status bar's "are the engine's and the same in
  every game" is the subject's one pointer and its last scenario leans on it;
  `hintKeepTrack`'s second sentence is its one sentence of reason.

## Third pass

Nothing changed in the spec. Rows of the engine's third-round tables that
name Inertia: 0. Engine requests of its own: 0. Sentences cut: 0. Clauses
kept: 3.

- **Kept: both refusals of "Hint: The hint refuses honestly when the move to
  make is undo", and the refusal of "Hint: Inertia's hint refuses in Solve's
  words where no route is found".** `engine-hints`, "A search that can prove a
  position lost says which of its two ends it met" binds a search that can
  meet either end; Inertia's route solver has one way to fail and the game
  chooses its sentence itself, as the review of that requirement says.
- **Kept: "with no departure from the codec grammar"** in "Params: Inertia's
  params are its declared codec's, and a grid under six squares is refused".
  It is the one pointer of an owed subject whose only other statement is a
  corner case.
- **Kept: "The words that open the bar … are the engine's"** in the status
  bar: the subject's one pointer, and its last scenario leans on it.
- No sentence of the form "What a pasted game ID opens as" and none citing
  `engine-difficulty`: Inertia has no tiers.
- The spec was searched for the third round's other rules in other words (a
  hatch under content, the release of a declined press, the cancel keys, a
  lit beveled tile, a mistake check without an answer): none is stated.

## Found, mended

- The spec does not say a grid too large is refused: added "Params: Inertia
  refuses a grid too large to count". `validateParams`,
  `src/games/inertia/state.ts:80`-`83`, refuses where width times height is
  not a safe integer; the sentence is the engine's `AREA_TOO_LARGE`
  (`src/engine/params.ts:255`), and no test holds a size, so the scenario's
  case is in words. A requirement of its own, since the pointer requirement
  of `Params` is at its length.
- A hint with no leg at all refuses with `NO_MOVE_WORTH_MAKING`: left: a
  branch no player reaches.
- The spec called the gem's mark a ring: left: both sentences went with the
  cut, and what is left says "marked".

## Whole read

33 requirements read top to bottom as a reader with the spec alone; 1
citation checked against the capability's titles (`engine-params`), exact; 4
mends beyond the one above.

- **Mended**: "Description: Descriptions encode the grid, and the start
  square becomes a stop" named `validateDesc`, which is no hook of the
  `Game` and no function of Inertia's: the refusals are `parseDesc`'s
  (`state.ts:283`-`310`), reached through `newState`. Its scenario's string
  and sentence are `src/games/inertia/inertia.test.ts:122` and
  `state.ts:307`.
- **Mended, wrap only**: "Hint: The hint plans for the nearest gem the ball
  can safely take" and "Hint: An aimed swipe's arrow replaces the hint's",
  each with a line the cut left short, and "Hint: The hint refuses honestly
  when the move to make is undo", with one of 102 characters.
- **Sound**: each subject says what the game does there or where to look,
  `Params` by its pointer and `Status bar` by its clause for the engine's
  words; no pronoun without its antecedent and every title fits its body.
  Against the code: the top row's digits as the pad's (`keyDirection`,
  `index.ts:111`), a wall and a dead ball refused (`:208`-`209`), the bar's
  three parts (`:217`-`221`), a step completed by a slide in its direction
  (`hintKeepTrack`, `hint.ts:365`), the two undo refusals (`hint.ts:290`-`306`),
  the slide's time and the death flash (`render.ts:488`-`502`).
- **Left, and seen**: "Controls: The swipe works on the secondary button" is
  as the cut left it; the secondary button is the main session's.
