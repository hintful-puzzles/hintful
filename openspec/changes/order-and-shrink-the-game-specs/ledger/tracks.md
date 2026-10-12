# tracks

The Purpose stands: it names nothing the spec no longer holds.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Tracks judges completion from the board | retitled "Rules: A Tracks board is solved while one track meets every clue". The clause ", judged from the board however it was reached" cut from the second sentence; the scenario's last line ("a later move that breaks the track or a clue reports it unsolved again") cut and the scenario renamed "A whole track that meets its clues" | `ts-engine`, "A game's status is judged from the board alone" (from the position alone, "never from how it was reached") |
| Rules: Tracks ships findMistakes | retitled "Rules: A Tracks mistake is a mark on a square or its edges that the solution contradicts"; body kept whole. "and rendered red" cut from the scenario | `ts-engine`, "The midend shows mistakes until the next transition" (the midend passes the result to `redraw`, which draws the cells highlighted) |
| Params: Tracks' parameters | replaced by the pointer requirement "Params: A Tracks params string may leave out its difficulty and its `o`" (rule 2). The field list, the encoding and "a bare `{n}` decodes as an `n × n` grid" cut, with scenario "Params round-trip" | `paramConfig`, `src/games/tracks/state.ts:287`, and the `paramsCodec` field list, `:312` (`dims`, `choice "d"` over `DIFF_CHARS`, `:43`, with the tier names of `difficultyItem(DIFF_NAMES)`, `:293`; `flag "o"` with `means: false`, both `full`); `engine-params`, "The codec grammar is a prefix, tagged segments, flags and letters" (`dims`, "with the square fallback when decoding") and "A game declares its params encoding once, and both codec halves are derived"; `src/engine/__snapshots__/params-stability.test.ts.snap` holds `8x8dt`, every preset and `8x8dto` |
| Params: Tracks refuses a grid under 4×4, and a 4×4 above Easy | retitled "Params: Tracks refuses a 4×4 above Easy". First sentence (the bound of 4) and scenario "Invalid params are rejected" cut; the kept sentence now says a 4×4 is the smallest the bounds allow | `bounds: { min: 4 }` on the dimensions, `src/games/tracks/state.ts:291`; `engine-params`, "Params validity is the engine's check" |
| Params: Tracks params that name no difficulty are Normal | joined to the pointer requirement "Params: A Tracks params string may leave out its difficulty and its `o`", with its scenario. The clause "or whose `d` is followed by a letter that names no tier" cut: it is false of the code (see Found) | `engine-params`, "A params string is read whole or refused" ("a letter after a tag that the tag does not list … SHALL each be refused") |
| Params: Tracks refuses a grid whose area cannot be counted | the clause "in the engine's sentence that the width times the height must not be unreasonably large" cut; the scenario keeps the sentence | `engine-params`, "A grid too large for a game is refused in one sentence" |
| Params: A Tracks title says when adjacent 1 clues are allowed | removed, with its scenario; the pointer requirement names the label words as `paramConfig`'s | `label: { slot: "tail", words: … "allow adjacent 1’s" }` on the `disallow-consecutive-1-clues` item, `src/games/tracks/state.ts:299`; `engine-params`, "One describer labels every params set" (`size[ tier][, tail…]`) |
| Description: newState parses a Tracks description and refuses a malformed one | the clause "as a desc error the engine's `validateDesc` reports" cut | `engine-params`, "The engine derives a description's verdict from newState" |
| Controls: The Tracks keyboard cursor walks a half-grid | reworded: what select and select2 toggle cut; the half-grid and its two kinds of stop kept. The scenario says "shows" and "Enter" for "stands" and "select" | `engine-input`, "The engine owns a declaring game's press and select keys" (Enter the left-click verb, Space the right-click verb); the verbs are `primary: trackVerb` and `secondary: noTrackVerb`, `src/games/tracks/index.ts:293` |
| Hint: Tracks explains the next deduction | removed, with both scenarios. "from the player's current marks" joined "Hint: The Tracks hint starts from the player's marks and is capped at the board's own tier" | `engine-hints`, "A hint is deduced from the board in play" (scenario "A hint runs from the player's own marks"), "A hint step always names a technique, with no un-narrated fallback", and "The hint walk SHALL cover every preset a game offers" with "Deduction runs out only where the tier permits search" (scenario "Following the plan solves the board at every tier": no Tracks tier is Unreasonable) |
| Hint: The Tracks hint is capped at the board's own tier | retitled "Hint: The Tracks hint starts from the player's marks and is capped at the board's own tier"; gains a first sentence, from "Hint: Tracks explains the next deduction": the plan is deduced from the player's marks, on squares and on edges | |
| Hint: A firing the board already shows is hidden | second sentence reworded: "Through the shared plan loop's `showable` hook, the plan SHALL hide (apply to its working board, but not show)" became "Tracks' `showable` judgment SHALL hide", the loop's mechanism cut. Scenario "A narrated rule the board already shows is not a step" dropped, and "A blocked side on the rim is not a step" written in its place | `engine-hints`, "A hint SHALL show only steps the player's board does not already decide" (a firing not showable still advances the working board; its scenario is the dropped one, set in Tracks). The new scenario is `closed` in `evident`, `src/games/tracks/hint.ts` (`!inGrid` is closed) |
| Hint: Tracks marks a hint in its own vocabulary | Cut: that the marks are drawn from the step's words, the ring, the cross for an emptied square, "not color alone" and "Nothing SHALL be a fill". Kept: that the three action shapes are the game's own. Joined from "Hint: Tracks hint evidence is drawn in the evidence color": the clue's digit and scenario "A clue the step counts with is recolored" | the legend's `ring` role, `src/games/tracks/index.ts:608`; `engine-hints`, "A bound hint step's words SHALL name exactly the marks it draws", "A legend color is never the only cue" and "A hint marks beside the content, never behind it" |
| Hint: Tracks hint evidence is drawn in the evidence color | removed. Its clue sentence and its scenario joined "Hint: Tracks marks a hint in its own vocabulary". Cut: `COL_HINT_CELL`, the contour painted per side, the bar on a cited side, and that the legend says the number takes the hint color | the legend's `outline` role, `src/games/tracks/index.ts:609` (the outline, the bar, the number in the hint color); the palette, `out[COL_HINT_CELL] = HINT_EVIDENCE`, `src/games/tracks/render.ts:142`; the contour is the engine's `outlineSides` (`src/games/tracks/render.ts:287`) and `engine-hints`, "A hint marks beside the content, never behind it" ("a side wherever the neighbor across it is not also evidence"); "A recolored clue is an outline reference" |

## Kept, and why

- **Rules: A Tracks mistake is a mark on a square or its edges that the
  solution contradicts.** `ts-engine`, "A mistake check compares with the one
  answer, hidden or not", names neither that an edge's mark is reported by its
  square, nor the two kinds, nor the empty answer on a board the solver does
  not finish.
- **Params, "a string with no `d` decodes as Normal" and "disallowed unless it
  carries the `o`".** Both are the declaration's (`defaultParams` and the
  flag's `means: false`); kept as what a missing field decodes to. An Easy
  preset's short form deals a Normal board, which only this sentence says.
- **Params: Tracks refuses a grid whose area cannot be counted.** The engine
  requirement leaves the ceiling to the game.
- **Generation: Each Tracks difficulty adds its rungs.** What each tier means
  here. The order is the solver's own list (`src/games/tracks/solver.ts:910`),
  which `hintRungs` does not fix: `TRACKS_RUNGS` lists premises, not rungs.
- **Controls: A Tracks click toggles a square or an edge.** The verbs are
  declared, but which of a square and an edge a press addresses is
  `pointerTarget` and `aimedAt`, hand-written, and the right button's strip
  is in no declaration.
- **Hint: One Tracks firing is one hint step.** A departure: `engine-hints`,
  "One deduction firing is one journey", has a firing of several moves as a
  run of legs, and Tracks makes it one step that shrinks in place.
- **Hint: The Tracks hint tries a square's sides, then the clues, then the
  loop.** The order is the solver's rung list and each rung's scan.
- **Look: The Tracks completion flash runs the track from A to B.**
  `ts-engine`, "A game gives each element a position, and the route is which
  position it gives", leaves the position to the game.

## Engine requests

- The verdict rule of `trackTargets` (completed, on track with the step
  shrunk to what is left, off) → `engine-hints`. The sentence is
  "`hintKeepTrack` SHALL then verdict `"onTrack"` and shrink the step in place
  until the last of them is placed", in "Hint: One Tracks firing is one hint
  step"; the code is `trackTargets`, `src/engine/hint-track.ts:40`, which
  `tracksKeepTrack` calls (`src/games/tracks/hint.ts:411`).

## Found

- **The spec said a `d` followed by a letter that names no tier decodes as
  Normal.** `choice` refuses it (`paramsLetter`,
  `src/engine/params-codec.ts:262`), as `engine-params`, "A params string is
  read whole or refused" requires. The clause went with the cut.
- **"Generation: Tracks generates solver-gated boards"**: the title names a
  gate the body does not state; the body is the strip and the track laid by
  construction.
- **No test of the game holds the label "10x8 Normal, allow adjacent 1’s".**
  The words are in `paramConfig` alone.

## Review

14 rows read, each against the declaration or the requirement it names; 7
corrected.

Changed:

- **Four citations swapped in for a copy were taken out**, each inside a
  subject that says plenty of the game's own: the area refusal's "in the
  sentence of `engine-params`, …" (the scenario keeps the sentence), the
  cursor's "so that the select keys apply the two buttons' verbs to either
  (`engine-input`, …)", the `showable` requirement's parenthesis, and the
  marks requirement's first sentence ("the roles `hintMarks` declares, painted
  from the step's words"). The rows say where each is stated.
- **"the tier written `t` (Tricky is `h`)" cut from the Params pointer.** A
  pointer lists no letters, and the tie is two declarations side by side:
  `DIFF_CHARS`, `state.ts:43`, and `difficultyItem(DIFF_NAMES)`, `:293`. The
  snapshot holds `8x10dt` as "8x10 Normal" and `10x10dh` as "10x10 Tricky".
- **"The evidence contour SHALL be painted per side wherever the neighbor
  across it is not also evidence" cut.** It is the engine's `outlineSides`
  (`render.ts:287`) and `engine-hints`, "A hint marks beside the content,
  never behind it", in the same words.
- **"Hint: The Tracks hint is capped at the board's own tier" retitled**
  "Hint: The Tracks hint starts from the player's marks and is capped at the
  board's own tier": it gained a sentence the old title did not cover.
- **The square fallback's citation corrected** to `engine-params`, "The codec
  grammar is a prefix, tagged segments, flags and letters": the codec's `dims`
  is what Tracks uses, and "The engine provides a shared dimension param
  parser" binds a hand-written `decodeParams`.
- **The run-letter engine request dropped.** Tracks reads and writes its runs
  by hand and not through `scanRunLength` and `encodeRunLength`, by decision
  (`src/engine/run-length.ts`, the module comment names Tracks), so its
  sentence stays as what a hand-written parser reads whatever the engine
  states. The `trackTargets` request is reworded to the wording the other
  ledgers carry; no requirement of `engine-hints` states the rule ("A player
  move is classified against the stored plan" says what the midend does with
  each verdict, not when a game gives it).

Checked and found sound:

- The ten engine titles the rows cite are exact, and each states what its row
  removed. "A hint is deduced from the board in play" leaves which marks a
  step rests on to the game, so "on squares and on edges" stays.
- The declarations: `bounds: { min: 4 }` (`state.ts:291`), the label words
  (`:301`), the codec (`:312`), the two verbs (`index.ts:293`), the legend
  (`:606`), `HINT_EVIDENCE` (`render.ts:142`); the snapshot holds `8x8dt` as
  the default and every preset.
- The new scenario "A blocked side on the rim is not a step" is `evident`'s
  `!inGrid` arm (`hint.ts:252`). The hint's cap is `state.diff` (`:309`).
- Each subject read alone: none hollow, no dangling antecedent.
