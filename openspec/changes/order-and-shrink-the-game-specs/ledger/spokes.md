# spokes

The Purpose was corrected: it named "its parameters", and now says what of the
params the spec holds.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Spokes' findMistakes compares the board with its one solution | retitled "Rules: A Spokes mistake is a line the solution forbids or a mark where it needs a line"; body and scenario untouched. The old title was the collection's rule | `ts-engine`, "A mistake check compares with the one answer, hidden or not" |
| Params: Spokes' parameters | retitled "Params: Spokes refuses Unreasonable on a board too small or too narrow to have one". Cut: the field list, the bound of 2, and "A game ID SHALL encode the width, height and difficulty and round-trip through decode", with scenario "A game ID round-trips through the parameters". Kept: the two refusals of `Unreasonable` when dealing, now said of `validateParams`, and that there is no upper bound. Scenario "A narrow board at the top tier" kept | `paramConfig`, `src/games/spokes/state.ts:141` (`bounds: { min: 2 }`, `:144`; the tiers are `difficultyItem(DIFF_NAMES, …)`); `engine-params`, "Encode and decode are mutual inverses over the corpus"; `src/engine/__snapshots__/params-stability.test.ts.snap` holds every preset |
| Params: Spokes' params write the difficulty as d and a letter | replaced by the pointer requirement "Params: A Spokes params string with no difficulty is Easy" (rule 2). Cut: what `encodeParams` writes, the bare number, and the refusal of another letter or of none, with scenario "A letter that names no tier". Kept: a string with no `d` decodes as Easy, and scenario "A Normal preset and its short form" | the `paramsCodec` field list, `src/games/spokes/state.ts:172` (`dims`, `choice "d"` over `DIFF_CHARS`, full form only); `engine-params`, "The codec grammar is a prefix, tagged segments, flags and letters" (the bare number), "A params string is read whole or refused" (its scenarios "A difficulty letter the game does not have" and "A tag with nothing after it") and "The engine makes the one refusal of a params string" (the quoted sentence); `src/engine/params-read-whole.test.ts` holds `4x4dt` and `6x6dh` |
| Generation: Spokes' generator keeps every board uniquely soluble | retitled "Generation: Every hub of a dealt Spokes board carries a line". "The generator SHALL use the solver to keep every board uniquely soluble at the target difficulty" cut; the hub sentence and the scenario kept | `engine-difficulty`, "Every tier promises one solution found at its cap" and "A difficulty tier binds the board it generates" |
| Generation: Spokes' difficulty tiers bind the boards they generate | removed, with its scenario | `engine-difficulty`, "A difficulty tier binds the board it generates" (not solvable one tier down; its first scenario is the removed one) |
| Controls: Spokes is played by dragging between hubs or with a keyboard cursor | first two sentences reworded: which button and which select key applies which verb cut, the two verbs named in its place. Kept: the drag, the cursor's half-grid, that either verb clears, the blocked crossing, and the last sentence. Scenario "Dragging between two hubs draws a line" dropped; "A left drag over a ruled-out spoke clears the mark" kept | `targetVerbs` (`primary: lineVerb`, `secondary: markVerb`), `src/games/spokes/index.ts:239`, and each verb's `does`, `:194`, `:200`; `engine-input`, "The engine owns a declaring game's press and select keys" (Enter the left-click verb, Space the right-click verb) |
| Preferences: The satisfied-hub marking is visual only and can be turned off | gains the key `mark-satisfied`, "SHALL start on" and scenario "A player who has changed no preference", from "Preferences: The satisfied-hub preference is mark-satisfied and starts on" | |
| Preferences: The satisfied-hub preference is mark-satisfied and starts on | removed. The key, "SHALL start on" and its scenario joined "Preferences: The satisfied-hub marking is visual only and can be turned off"; the type and the name cut | `prefs`, `src/games/spokes/index.ts:571` (the name, `type: "boolean"`). The default is `newUi`'s, `src/games/spokes/state.ts:525` |
| Hint: Spokes explains why each hinted move is forced | "Spokes SHALL implement the hint hooks, and" cut. Gains scenario "A saturated hub is explained by the count that forces it" from "Hint: A deduction that forces several spokes is one journey", less its last line | the `Game` type (`hint`, `hintKeepTrack`) |
| Hint: Spokes' hint is a projection of its solver | removed, with its scenario | `engine-hints`, "The solver and the hint are two projections of one deduction engine"; `engine-difficulty`, "Narratable-deduction generation policy" (every board below `Unreasonable` is solvable by the techniques the hint teaches) and "An Unreasonable tier is the one exemption from the narratable policy"; the unbounded rung is this spec's "Hint: Spokes' hint stops at bounded reasoning". The scenario is `engine-hints`, "The hint walk SHALL cover every preset a game offers" and "The hint walk asks findMistakes at every position" |
| Hint: A deduction that forces several spokes is one journey | removed. Scenario "A saturated hub is explained by the count that forces it" moves to "Hint: Spokes explains why each hinted move is forced", its last line ("all of those spokes are presented as one hint in one color") cut | `engine-hints`, "One deduction firing is one journey" (legs, the first with the full explanation) and "A hint naming several kinds of element colors them by a stable legend" ("equivalent forced moves SHALL still share the single target color"); the code is `stepsOfFiring`, `src/games/spokes/index.ts` |
| Hint: A Spokes hint shows a line to draw and marks a dot to rule out | the line in the hint color, the ring round a dot and the evidence color cut. Kept: marks only on what the step has still to decide, the dot left unmarked inside its ring, the outline just outside the rim, and no mark on a spoke an earlier leg settled. Title and scenario kept | the legend, `hintMarks.roles`, `src/games/spokes/index.ts:593` (`ring`: a line in the hint color to draw, a ring round a dot to rule out; `outline`: the hubs the step reasons from, in a second color) |
| Look: What Spokes draws | last sentence ("There SHALL be no interpolated line-drawing animation.") cut | `animLength: () => 0`, `src/games/spokes/index.ts:611` |

## Kept, and why

- **Params, "A string with no `d` SHALL decode as Easy".** The declaration's
  (`defaultParams` is 6×6 Easy), kept as what a missing field decodes to: the
  short form of the Normal and the `Unreasonable` presets is an Easy board.
- **Params: Spokes' top tier is named Unreasonable.** `engine-difficulty`, "A
  tier's name is not part of any encoding", is the rule; that this tier's
  letter is `h` and why the name fits is the game's.
- **Solver: Spokes solves with a tiered deductive solver.** What each tier
  runs. Its scenario is close to the collection's, and the sentence has no
  other.
- **Controls, "Either on a spoke that already holds a line or a mark SHALL
  clear it".** Each verb's `does` string says it; kept as the tie between the
  two verbs and the one exception, the blocked crossing, which no declaration
  holds.
- **Hint: Spokes explains why each hinted move is forced.** Its three
  sentences read as the collection's, and no one engine requirement states
  them all (premises before the conclusion is in none); its scenarios are the
  only place the spec says what the two-ones, the saturation and the
  look-ahead steps tell the player.
- **Hint: A Spokes hint plan is stable across recomputation.** See the engine
  requests.
- **Hint: Spokes' hint stops at bounded reasoning.** A departure from the
  hint's being as strong as the board's tier: the top rung never fires in a
  plan. Its refusal clause is `engine-hints`, "Deduction running out on a
  sound board SHALL have one wording", and stays as where the stop leads.
- **Hint: Spokes' hint tries its techniques in one order.** The order is the
  hand-written chain of the plan's next firing
  (`src/games/spokes/solver.ts:641`), not `hintRungs`, which lists the two-ones
  first.

## Engine requests

- A plan is stable across recomputation → `engine-hints`. The sentence is "A
  hint plan SHALL be stable across recomputation: re-requesting a hint after
  the player has followed a step SHALL continue the same line of reasoning
  rather than propose a different or contradictory one", in "Hint: A Spokes
  hint plan is stable across recomputation". Clusters says it of itself
  ("Hint: A recomputed Clusters plan continues where the last one left off").
  `engine-hints`, "A hint is deduced from the board in play", says the plan is
  made afresh and not that it agrees with the last, and "Hint mechanics are
  engine-owned and cross-game guarded" names it only inside a parenthesis. The code is each game's deterministic deduction under
  `deduceHintPlan`, `src/engine/hint-plan.ts`.

## Found

- **The spec never states the question the hint asks of the clues first.**
  `hint` refuses with `PUZZLE_NOT_REASONABLE` where the solver cannot solve
  the board from its clues alone (`src/games/spokes/index.ts:466`), before any
  plan is made from the player's board. The Purpose's "refuses a position it
  cannot vouch for" is the only mention. No board that loads reaches it.
- **The spec never states what counts as solved under `Rules`.** The one
  statement is the scenario of "Look: What Spokes draws".
- **`hintKeepTrack` completes a leg only on its exact spoke**
  (`src/games/spokes/index.ts:482`): another spoke of the same firing is off
  the plan and the next hint offers the rest. The spec has no requirement on
  it.
- **"Controls" never says what the half-grid is**: a hub on every third
  sub-cell, its eight dots between, and Enter on a hub's center addressing
  nothing (`onHalfGrid` and `cursorTarget`, `src/games/spokes/index.ts`).
- **"Solver: The look-ahead's bound has one definition" says the bound "SHALL
  be documented"**, which is a rule about a comment and not about the game.

## Review

13 rows read, each against the declaration or the requirement it names; 6
corrected.

Changed:

- **The preference's key restored.** "The preference its `prefs` declares"
  is again "The `mark-satisfied` preference". A stored preference depends on
  the key, and no test pins the string: it is in `src/games/spokes/index.ts`
  alone. The name and the type stay cut.
- **Three pointers taken out**, each in a subject with requirements of the
  game's own beside it: Generation's "held to its tier both ways by the
  collection's gate (`engine-difficulty`, …)", beside "Generation: The
  look-ahead runs at two strengths, which are two rungs"; Controls' "SHALL be
  those its `targetVerbs` declares … (`engine-input`, …)", beside "Controls:
  A press on a hub aims at the dot it points toward", which says the release
  applies its button's verb; and the marks requirement's "the roles
  `hintMarks` declares". The rows say where each is stated.
- **The bare number's citation corrected** to `engine-params`, "The codec
  grammar is a prefix, tagged segments, flags and letters": Spokes' codec is
  declared, and "The engine provides a shared dimension param parser" binds a
  hand-written `decodeParams`.
- **The engine request reworded** to stand beside Clusters'. It is not
  stated: see the request.

Checked and found sound:

- The Params pointer is kept, as the one place the subject says where the
  ordinary case is. `defaultParams` is the 6×6 Easy preset
  (`src/games/spokes/state.ts:137`), so a string with no `d` is Easy; the
  snapshot holds `4x4dt` as "4x4 Normal" with the short form `4x4`.
- `engine-hints`, "A hint naming several kinds of element colors them by a
  stable legend" has "equivalent forced moves SHALL still share the single
  target color", and "One deduction firing is one journey" the legs, so the
  removed journey requirement is stated whole. `engine-difficulty`,
  "Narratable-deduction generation policy" and "An Unreasonable tier is the
  one exemption from the narratable policy" state the removed "No shipped
  board SHALL require a step the hint cannot explain".
- The legend (`index.ts:593`) states the line, the ring round a dot and the
  second color; the dot left unmarked, the outline outside the rim and the
  settled leg's spoke are in no declaration and stay.
- `animLength: () => 0` (`index.ts:611`); the verbs (`:245`, with `does` at
  `:195` and `:201`); the hint's order is `nextSpokesFiring`
  (`solver.ts:636`).
- The two silences under Found are true of the code and stay there: `hint`
  asks `solveFromClues` before it plans (`index.ts:466`), and no `Rules`
  requirement says when a board is solved.
- Each subject read alone: none hollow, no dangling antecedent, every title
  fits its body.
