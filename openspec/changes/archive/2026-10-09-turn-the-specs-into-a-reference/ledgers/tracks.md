# Ledger: tracks

Base: bb004490

Where every rule of Tracks' spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters.

## Tracks game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `tracks` game implements `Game`, and what the puzzle is | spec: Tracks game implements the Game interface |
| The six type arguments, the last of them `TracksMistake` | untrue: `tracksGame` in `src/games/tracks/index.ts` is `Game<TracksParams, TracksState, TracksMove, TracksUi, TracksDrawState, Point, unknown, TracksRung>`, and no `TracksMistake` type exists, so the requirement names `Game` alone |
| Params are `w`, `h`, `diff` and the consecutive-1-clues switch, with their encoding and the square shorthand | spec: Tracks' parameters |
| The switch is the field `single_ones` | untrue: the field of `TracksParams` in `src/games/tracks/state.ts` is `singleOnes` |
| The presets, with the non-square sizes turned to draw taller than wide | spec: Tracks' presets are drawn taller than wide |
| "Upstream's 12 presets" | history |
| `validateParams` enforces a minimum size of 4×4 | untrue: `validateParams` in `src/games/tracks/state.ts` has no size check, the minimum is `bounds: { min: 4 }` on the dimension items of `paramConfig`, which the engine's `paramsError` in `src/engine/params.ts` refuses on, so it went to spec: Tracks refuses a grid under 4×4, and a 4×4 above Easy |
| The game provides `solve` and `textFormat` | spec: Tracks game implements the Game interface |
| A completion flash suppressed after Solve | spec: The Tracks completion flash runs the track from A to B |
| Scenario: params round-trip | spec: Tracks' parameters |
| Scenario: invalid params are rejected | spec: Tracks refuses a grid under 4×4, and a 4×4 above Easy |

## Tracks descriptions use the upstream encoding

| Rule | Where it went |
| --- | --- |
| The row-major grid of run letters and hexadecimal clue squares, and the clue-number list with its `S` prefixes | spec: Tracks descriptions use the upstream encoding |
| `validateDesc` rejects unknown characters, a wrong bit-count, a short number list, and anything but one entrance and one exit | untrue: the game has no `validateDesc`, the parse inside `newState` in `src/games/tracks/state.ts` refuses each of these and the engine's `validateDesc` in `src/engine/desc-error.ts` reads that refusal, so it went to spec: newState parses a Tracks description and refuses a malformed one |
| `newState` parses into track edges and shared immutable clue data, the player grid blank | spec: newState parses a Tracks description and refuses a malformed one |
| Scenario: a description round-trips | spec: Tracks descriptions use the upstream encoding |
| Scenario: a malformed description is rejected | spec: newState parses a Tracks description and refuses a malformed one |

## Tracks input maps drag, click and cursor

| Rule | Where it went |
| --- | --- |
| Two drags, told apart by what the pressed square holds and never by where the press lands | spec: Tracks input maps drag, click and cursor |
| A left-drag from a square without track and every right-drag paint squares along one row or column, toggling by the start cell's state | spec: Tracks input maps drag, click and cursor |
| A right-drag never marks an edge, with its reason | spec: Tracks input maps drag, click and cursor |
| A left-drag from a square that carries track marks no square and lays or removes segments on the edges it crosses, as one step of Undo | spec: A drag from a square that carries track lays segments |
| A left-click toggles the square near its center and the edge near an edge | spec: A Tracks click toggles a square or an edge |
| A right-click toggles no-track on the square, and on the edge only on the strip along it, an eighth of a tile and never under four pixels | spec: A Tracks click toggles a square or an edge |
| The half-grid keyboard cursor, select and select2 | spec: The Tracks keyboard cursor walks a half-grid |
| A move that changes nothing, and an interaction outside the grid, makes no history move | spec: A Tracks interaction that changes nothing makes no move |
| Scenario: a drag lays a straight run of track | spec: Tracks input maps drag, click and cursor |
| Scenario: a drag from a square that carries track lays segments | spec: A drag from a square that carries track lays segments |
| Scenario: a right-click crosses the square unless it is on an edge | spec: A Tracks click toggles a square or an edge |
| Scenario: a right-drag from an edge's strip crosses squares | spec: Tracks input maps drag, click and cursor |
| Scenario: a no-op interaction produces no move | spec: A Tracks interaction that changes nothing makes no move |
| Scenario: a drag that drifts out of bounds keeps its last valid extent | spec: Tracks input maps drag, click and cursor |
| "Rather than resetting to the start cell, as upstream did" | history |

## Tracks ships findMistakes

| Rule | Where it went |
| --- | --- |
| `findMistakes` re-solves the clues and reports the marks that contradict the unique solution, never an unmarked cell, and nothing on a board that is not uniquely solvable | spec: Tracks ships findMistakes |
| One mistake per square or edge | untrue: `findMistakes` in `src/games/tracks/index.ts` returns one `Point` per square, and a square is reported when its own mark or a mark on one of its edges contradicts the solution, so a wrong edge reports the squares it borders |
| Mistakes render in the red mistake styling, carried in the render diff key | spec: A Tracks mistake is drawn in the mistake styling |
| Scenario: a wrong mark blocks Check & Save | spec: Tracks ships findMistakes |
| Scenario: a mistake overlay repaints an unchanged tile | spec: A Tracks mistake is drawn in the mistake styling |

## Tracks explains the next deduction

| Rule | Where it went |
| --- | --- |
| A hint is refused by the midend on a solved board or one with mistakes, and otherwise `hint` returns the forced deductions as an ordered plan whose steps say why | spec: Tracks explains the next deduction |
| The plan comes from the same `DeductionTechnique` objects `tracksSolve` runs, with a recorder on the working `Board`, no rung reimplemented, the generator's solve path unchanged | spec: The Tracks hint runs the solver's own rungs |
| There are eight of them | figure |
| They run through one `runDeductionFixpoint` call | untrue: `tracksRecordingPass` in `src/games/tracks/solver.ts` runs the ladder through the engine's `singleFirings`, one firing at a time, and only `tracksSolve` calls `runDeductionFixpoint` |
| The ladder is capped at the board's own difficulty, with its reason | spec: The Tracks hint is capped at the board's own tier |
| "Rather than `DIFF_COUNT`" | spec: The Tracks hint is capped at the board's own tier |
| One firing is one step, a rung returning at its first premise that changed the board | spec: One Tracks firing is one hint step |
| A step's move carries several ops when one premise forces them, and `hintKeepTrack` then says `"onTrack"` and shrinks the step | spec: One Tracks firing is one hint step |
| Every change is recorded, and the plan hides a firing with no reason or one the board already decides, through `showable` | spec: A firing the board already shows is hidden |
| When a change is already decided | spec: A firing the board already shows is hidden |
| Three rules of `update-flags` declare no reason, and every reason-less firing is evident by that test | spec: Three rules of update-flags declare no reason |
| Scenario: a hint explains a clue that is already met | spec: One Tracks firing is one hint step |
| Scenario: a finished piece's sides are never a step | spec: Three rules of update-flags declare no reason |
| Scenario: a hint runs from the player's own marks | spec: Tracks explains the next deduction |
| Scenario: a hint refuses rather than reasoning from a wrong board | spec: Tracks explains the next deduction |
| Scenario: following the plan solves the board at every tier | spec: Tracks explains the next deduction |

## Tracks marks a hint in its own vocabulary

| Rule | Where it went |
| --- | --- |
| The shape of the action says which action is meant: a ring, a ring with the center cross, rail stubs, an edge cross, and nothing a fill | spec: Tracks marks a hint in its own vocabulary |
| The marks are drawn from `TracksHighlights` | untrue: no `TracksHighlights` exists, `redraw` in `src/games/tracks/render.ts` reads the marks the step's words carry through `stepMarks`, in the roles `ring`, `outline` and `stripes` the game's `hintMarks` declares |
| Evidence in `COL_HINT_CELL`: a contour painted per side, and a bar on a cited side | spec: Tracks hint evidence is drawn in the evidence color |
| A clue the step counts with has its digit recolored in the margin | spec: Tracks hint evidence is drawn in the evidence color |
| "Half of most Tracks deductions is a clue" | figure |
| The hint is part of the clue row's cache key as well as the per-tile one | spec: A Tracks hint is part of the tile's cache key and the clue row's |
| The per-square marks ride an `Int32Array` in the tile cache's diff key | spec: A Tracks hint is part of the tile's cache key and the clue row's |
| Scenario: a displayed hint repaints an otherwise unchanged frame | spec: A Tracks hint is part of the tile's cache key and the clue row's |
| Scenario: a forced side is drawn as the action it asks for | spec: Tracks marks a hint in its own vocabulary |

## Tracks solves with a graded deductive solver

| Rule | Where it went |
| --- | --- |
| The solver runs its deductions in rung order at each difficulty | spec: Tracks solves with a graded deductive solver |
| The rungs of Easy, Normal and Tricky | spec: Each Tracks difficulty adds its rungs |
| The rungs named as upstream's functions, `update_flags` to `check_bridge_parity` | history |
| The three verdicts, and the reuse by `solve()` and `findMistakes` | spec: Tracks solves with a graded deductive solver |
| Scenario: generated boards solve at exactly their difficulty | spec: Tracks solves with a graded deductive solver |
| Scenario: solve recovers from a wrong mid-game state | spec: Tracks solves with a graded deductive solver |

## Tracks generates solver-gated boards reproducibly

| Rule | Where it went |
| --- | --- |
| The same board for the same seed, the random walk, the clue numbers, and the boards rejected as boring or for their 1 clues | spec: Tracks generates solver-gated boards reproducibly |
| The 1-clue rejections are "consecutive/exit 1-clues" | untrue: `newDesc` in `src/games/tracks/generator.ts` also rejects a clue of 1 on the first column, the entrance's, as well as on the last row, the exit's, so the requirement Tracks generates solver-gated boards reproducibly names both |
| The steps named as upstream's functions `lay_path` and `add_clues` | history |
| Clues are laid until the board is soluble at exactly the target difficulty, then the redundant ones stripped, the solver re-run on each candidate | spec: Tracks lays clues until the board solves at exactly its tier |
| A 4×4 at Normal or Tricky falls back to Easy | untrue: `newDesc` in `src/games/tracks/generator.ts` has no fallback, and `validateParams` in `src/games/tracks/state.ts` refuses a 4×4 above Easy with `noSuchTier` when a board is to be dealt, so the requirement Tracks refuses a grid under 4×4, and a 4×4 above Easy states the refusal |
| Scenario: generation is reproducible from a seed | spec: Tracks generates solver-gated boards reproducibly |

## Tracks renders rails, clues, drag previews and the completion flash

| Rule | Where it went |
| --- | --- |
| What `redraw` renders, in a geometry of no gutter and a one-tile margin for the clues and the A and B labels, with the drag colors | spec: Tracks renders rails, clues, drag previews and the completion flash |
| The geometry is named `NARROW_BORDERS` | history |
| The drawstate diffs committed and drag flags and a clue-error sidecar, the mistake overlay in the diff key | spec: The Tracks drawstate diffs committed and drag flags |
| The committed and drag flags are "a per-cell `Int32Array`" | untrue: `TracksDrawState` in `src/games/tracks/render.ts` holds two, `flags` and `flagsDrag`, so the requirement The Tracks drawstate diffs committed and drag flags says `Int32Array`s || The flash is a highlight a few squares long that runs the track in order and goes dark before it ends | spec: The Tracks completion flash runs the track from A to B |
| One pace on every board, never under a second, and a color that reads in both schemes | spec: The Tracks completion flash keeps one pace |
| Scenario: a completed row clue turns red when over-filled | spec: Tracks renders rails, clues, drag previews and the completion flash |
| Scenario: a drag preview shows provisional pieces | spec: Tracks renders rails, clues, drag previews and the completion flash |
| Scenario: the flash runs from A to B | spec: The Tracks completion flash runs the track from A to B |

## Tracks computes live errors as upstream and judges completion from the board

| Rule | Where it went |
| --- | --- |
| `executeMove` recomputes errors: over two track edges, a loop, and track off a finished path | spec: Tracks computes live errors on every move |
| "Exactly as upstream `check_completion` with marking" | history |
| A clue is in error when over-filled or when its no-track cells exceed the complement | spec: A Tracks clue is in error when its line cannot meet it |
| A clue whose completed count fails to match is in error once a path exists | untrue: `checkCompletion` in `src/games/tracks/state.ts` applies that test only while `pathret` holds, which needs the path and no cell in error as well, so a board with a path and stray track elsewhere does not flag the count, and the requirement A Tracks clue is in error when its line cannot meet it says so |
| The board is solved exactly while no errors exist and every clue's completed count matches, however it was reached | spec: Tracks judges completion from the board |
| Scenario: a loop is flagged | spec: Tracks computes live errors on every move |
| Scenario: an over-filled clue is flagged | spec: A Tracks clue is in error when its line cannot meet it |
| Scenario: completion follows the board | spec: Tracks judges completion from the board |

## Tracks rejects a bare board as too easy only when it solves

| Rule | Where it went |
| --- | --- |
| A laid path is too easy only when its bare board solves completely below the target tier, and a stalled bare board goes on to clue-laying, with its reason | spec: Tracks rejects a bare board as too easy only when it solves |
| The step named as upstream's `add_clues` | history |
| Above Easy this diverges from upstream, whose check since 2020 also rejects a stalled bare board | history |
| An Easy board is upstream's byte-for-byte, kept as the scenario Easy boards are unchanged | spec: Tracks rejects a bare board as too easy only when it solves |
| The byte-match differential, a test, is kept only for Easy fixtures | history |
| Above Easy, generated boards are graded at exactly their preset's tier | spec: Tracks lays clues until the board solves at exactly its tier |
| The test file named as doing that grading | history |
| Scenario: a stalled bare board is not too easy | spec: Tracks rejects a bare board as too easy only when it solves |
| Scenario: 15x15 Hard deals | spec: Tracks rejects a bare board as too easy only when it solves |
| The tiers of that scenario are "Hard" and "Tricky" | untrue: `DIFF_NAMES` in `src/games/tracks/state.ts` is `tierNames(3)`, Easy, Normal and Tricky, so `DIFF_HARD` is the tier shown as Tricky and the one below it is Normal, as the first requirement of the old spec already had it |
| Scenario: Easy boards are unchanged | spec: Tracks rejects a bare board as too easy only when it solves |

## Tracks tells a square's state by its surface and a cross

| Rule | Where it went |
| --- | --- |
| An undecided square is the cell surface, the grid line one pixel wide at every tile size, the frame no heavier | spec: An undecided Tracks square is the cell surface |
| A given sits on the lifted surface with the same ink rails, told by the cell under it | spec: A given Tracks rail is told by the cell under it |
| A square that carries track is the bed, with no other mark, differing in hue from both surfaces in both schemes, a rail reading on it in both | spec: A square that carries track is the track bed |
| A no-track square stays the cell surface with the ruled-out cross, and a no-track edge holds a smaller cross | spec: Tracks tells a square's state by its surface and a cross |
| The cursor's outline is at least two pixels thick | spec: The Tracks keyboard cursor's outline is at least two pixels thick |
| Scenario: undecided, no track and track are told apart | spec: Tracks tells a square's state by its surface and a cross |
| Scenario: a square a given rail leads into is the bed | spec: A square that carries track is the track bed |
| Scenario: a given rail is the same rail | spec: A given Tracks rail is told by the cell under it |
