# untangle

The Purpose is unchanged.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Params: Untangle's params are a vertex count | title kept. Sentence 2 (the `n` field declares a lower bound of 4 and an upper bound, so the engine's check refuses outside them) cut; sentence 1 untouched. Scenario "Invalid params are rejected" dropped; "Params round-trip" kept | `bounds: { min: 4, max: MAX_POINTS }` on the `number-of-points` item of `paramConfig`, `src/games/untangle/index.ts:171`; `engine-params`, "Params validity is the engine's check" (scenario "A value outside its range") |
| Controls: Vertices are dragged by pointer or keyboard | "as a `UI_UPDATE` with no history entry" cut from sentence 2; nothing else changed | `ts-engine`, "A UI-only input redraws without a history entry" |
| Preferences: The Untangle port exposes its three preferences via the hook | retitled "Preferences: Untangle shows crossed edges until the player turns that off". Sentence 1 (the three keywords, their types and the two choice labels) cut. Sentence 2 (the defaults `newUi` sets, and why crossed edges are shown) reworded only to open on its own ("Untangle's `newUi` SHALL set its preferences' defaults"). Scenario "Untangle preferences round-trip through the engine" dropped; "A board opened with no preference set" written in words for the defaults | the keywords, types and labels: `prefs`, `index.ts:448`-`477`. The config and the values the engine returns, beside `show-timer`: `ts-engine`, "The engine supports per-game user preferences" and "Every game has a solve timer, and it runs while the board is undecided". That a set preference repaints and leaves the others: `ts-engine`, "`setPreferences` applies the keys it is given and repaints in full". **The promise to a stored preference** (the three key strings and the choice's order) is held by `src/games/untangle/untangle.test.ts:439`-`452`, "ships show-crossed-edges ON, snap OFF, vertex-style Circles": `getPreferences()` is compared whole with `"snap-to-grid": false`, `"show-crossed-edges": true`, `"vertex-style": 0` and `"show-timer": true`, so a renamed, added or dropped key fails it, and the `vertex-style` item with `choicenames: ["Circles", "Numbers"]`, so a reordered choice fails it. `untangle-render-scenario.test.ts:190` holds the repaint |
| Hint: A hint step marks its vertex, its destination and the crossings it removes | title kept. Sentence 2 (what `redraw` draws for each mark: the line, the two points in the hint's color, the rings) cut. Sentence 1 kept. Scenario "Displayed hint is rendered" dropped; "A journey's first leg marks the others" kept | `hintMarks.roles.ring` ("the point to move, drawn in the hint's color, with a line in the same color running to the spot to drop it on, which is also drawn as a point… the other points it will move next are ringed too") and `.outline` ("the crossings the move clears, each with a ring round it"), `index.ts:407`-`412` |

## Kept, and why

- **Params: Untangle's params are a vertex count**, "encoded as the
  integer". `encodeParams` and `decodeParams` are written out
  (`index.ts:179`-`186`).
- **Params: An Untangle title is its number of points.** The words are the
  `label.words` function of the one field (`index.ts:172`); what a title of
  the game's own says is the `Params` subject's, and no shared requirement
  gives these words.
- **Rules: Crossed edges are Untangle's only mistake feedback.** The reason
  is also the `notApplicable.findMistakes` string (`index.ts:398`), but a
  game with no mistake check departs from the collection, and the departure
  is the requirement.
- **Description: The layout is restored by replaying the move log.** Every
  game's save replays its log; that the points' positions are in the log
  alone and the description never holds them is what a save of this game
  depends on.
- **Description: A graph that is not planar does not load.** `engine-params`,
  "A board its game proves has no solution does not load" gives the
  consequence; what `hasNoSolution` proves here is the game's.
- **Controls**, all four. Untangle declares no `targetVerbs`; the drag, the
  clamp and the keys are arms of `interpretMove` (`index.ts:221`).
- **Hint: Untangle hints finish a knot of crossings as one journey**, last
  sentence. `engine-hints`, "One deduction firing is one journey" binds a
  plan derived from a solver's firing; that a searched set of moves is
  returned as one journey is this hint's choice.
- **Hint: Untangle's hint refusals.** It names which of the collection's
  refusals the hint gives and when, and quotes nothing.
- **Look**, both. The colors are taken from the collection by role; which
  role a vertex wears when is the game's.

## Engine requests

None.

## Found

- **"Hint: Untangle hints move the point that removes the most crossings"
  says "Executing a step SHALL animate the vertex sliding to its
  destination", and by the code a played step lands at once.** The step is
  played as a drag (`hintGesture`, `index.ts:416`), a drag's release sets
  `justDragged` (`index.ts:251`), `changedState` carries it into `justMoved`
  (`index.ts:216`), and `animLength` answers 0 for a move just dragged
  (`index.ts:438`); the midend stretches only a nonzero length
  (`setupAnimation`, `src/engine/midend.ts:1644`). No test asserts the slide
  (`untangle-landing.test.ts` walks `executeHint` and checks where the point
  lands). The sentence was left.
  **Run by the reviewer** (a throwaway vitest file, since deleted: a real
  `Midend` on the first board of `untangle-landing.test.ts` at tile 64, the
  game's `animLength` wrapped to record its answers): three `executeHint`
  calls in a row each had `animLength` answer 0 and
  `currentAnimationMs()` 0; the undo after them answered 0.13 (130 ms) and
  Solve 0.5 (500 ms). So a played hint step lands at once, and the same move
  undone slides.
  **Which is intended: the slide.** The spec sentence came with the hint
  (`80993757`), when a step's move was applied and so animated; the step
  became a played drag in `f438234e`, which did not touch `animLength` and
  changed no word here. `engine-hints`, "A hint-executed move plays its
  animation at one duration" has the completing move "play its game's
  animation" at the auto-play dwell and allows "at once" only for a move
  whose `animLength` is zero, which this game's is by the accident of the
  flag; "The toolbar Hint button alternates show and apply" has the second
  press apply the step "in slow motion"; and `docs/hints-search.md` says of a game that animates its moves that "an
  executed step rides that pipeline and the midend stretches it to
  `HINT_ANIM_S`" (`midend.ts:98`). `help/games/untangle.md` § "Hints" says
  the hint "shows a point to move and where to put it, rather than simply
  moving it" and says nothing of how a played step moves. The code is the
  bug: `justDragged` cannot tell the hint's drag from the player's, whose
  point is already under the pointer. A player meets it on the second press
  of Hint and through Auto-Hint, where each point jumps to its spot.
- **The spec does not say that either button drags a point.** `interpretMove`
  takes a press, a drag and a release of the secondary button as it takes the
  primary's (`isMouseDown`, `isMouseDrag`, `isMouseRelease`,
  `index.ts:232`-`254`), and the game does not declare
  `ignoresSecondaryButton`, so a finger held past the touch hold still drags.
  That is a departure from `engine-input`, "A game with no secondary meaning
  is not given a synthetic one", which asks such a game for the flag, and no
  requirement here states it. Nothing was added to the spec for it: what the
  secondary button is to be is the owner's open question, in
  `openspec/changes/own-the-secondary-button-in-the-engine`.
- **The spec does not say what a params string with no number is.**
  `decodeParams` reads it as 0 points, which the field's bounds then refuse
  (`index.ts:180`).
- **"Solver: Solve untangles any planar board…" holds "The solve SHALL
  animate" and "Hint: Untangle hints move…" holds the step's animation**;
  neither says that a point the player dragged does not animate
  (`animLength`, `index.ts:437`).

## Review

4 rows read, each against the declaration or the requirement it names, read
whole; 3 corrected, no sentence restored.

Changed:

- **Three pointers undone into plain removals**, each inside a subject that
  says plenty of its own: ", within the bounds its field declares in
  `paramConfig`" (Params), "Untangle's preferences SHALL be the three its
  `prefs` declares" (Preferences, a subject the game does not owe and that
  holds the snap-to-grid requirement beside this one), and "How each is drawn
  SHALL be the legend's (`hintMarks`)" (Hint). The defaults sentence now
  opens "Untangle's `newUi` SHALL set its preferences' defaults".
- **Found**: the played hint step was run and the finding settled (above),
  and the either-button line says where the question is open.

Checked and found sound:

- The bound (`index.ts:171`, `MAX_POINTS` 2000) and `engine-params`, "Params
  validity is the engine's check".
- `ts-engine`, "A UI-only input redraws without a history entry" states the
  clause cut from the drag's preview.
- `prefs` (`index.ts:448`-`477`) holds the three keywords, types and labels;
  `untangle.test.ts:439` holds the three keys with their defaults and the
  choice's names, so a saved preference's key is held by a test;
  `ts-engine`, "`setPreferences` applies the keys it is given and repaints in
  full" has the repaint, with Untangle's vertex style as its scenario. The
  writer's new scenario is true of `newUi` (`index.ts:198`-`210`).
- The legend (`index.ts:407`-`412`) states every mark of the cut sentence:
  the point and its spot in the hint's color with a line between, a ring on
  each crossing cleared and on each point still to move.
- Untangle declares no `targetVerbs`; its `Controls` subject states the
  pointer and every key in arms of its own, so it needs no pointer.
- "The solve SHALL animate" and "Executing a step SHALL animate…" restate
  `animLength`, which here is a function with the game's own rule in it and
  not a constant. Left: the first is true, the second is the intent the code
  misses.
- Every title under "Kept, and why" exists, and the line citations were
  opened.

## Third pass

Nothing changed in the spec. Rows of the engine's third-round tables that
name Untangle: 0. Engine requests of its own: 0. Sentences cut: 0. Clauses
kept: 1.

- **Kept: "`hint` SHALL refuse with the collection's no-move-worth-making
  wording"** in "Hint: Untangle's hint refusals". None of the third round's
  refusal requirements is of this one (`engine-hints`, "A search that can
  prove a position lost says which of its two ends it met" is of a game that
  can be lost, and "A hint gives every step deduction still forces before it
  refuses" of `DEDUCTION_EXHAUSTED` on a board whose tier permits search);
  which refusal Untangle gives and when is the game's.
- No "no departure" sentence, none of the form "What a pasted game ID opens
  as" and none citing `engine-difficulty`: Untangle has no tiers.
- The spec was searched for the third round's other rules in other words
  (the cancel keys, the release of a declined press, a hatch under content,
  a mistake check without an answer): none is stated. Untangle asks no
  `isCancelKey` and has no mistake check.
