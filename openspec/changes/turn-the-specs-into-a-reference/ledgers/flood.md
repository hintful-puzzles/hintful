# Ledger: flood

Base: bb004490

Where every rule of Flood's spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters.

## Flood game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `flood` game implementing `Game<FloodParams, FloodState, FloodMove, FloodUi, FloodDrawState>`, a `w×h` grid flood-filled from the top-left corner to one color within a move limit | spec: Flood game implements the Game interface |
| The game provides `statusbarText`, `solve` and `textFormat`, and no `findMistakes`, with the reason | spec: Flood game implements the Game interface |
| Params are `w`, `h`, `colors` and `leniency`, encoded `WxH` with `c{colors}m{leniency}` when `full`, decoded leniently with a bare `W` square | spec: Flood params are a size, a color count and a leniency |
| `colors` is 3–10 | spec: Flood refuses params it cannot deal |
| The seven presets are offered | spec: Flood offers its presets |
| The presets are upstream's, and there are seven | history; figure |
| `validateParams` rejects `w·h < 2` | spec: Flood refuses params it cannot deal |
| `validateParams` rejects `colors` outside 3–10 and a negative `leniency` | untrue: `validateParams` in `src/games/flood/state.ts` holds the `w·h < 2` check alone. The two fields carry `bounds` in the `paramConfig` of `src/games/flood/index.ts` (3 to `MAXCOLORS`, and a minimum of 0), and `paramsError` in `src/engine/params.ts` refuses a value outside them before it calls the game. The spec now says the engine refuses them from the declared bounds |
| Scenario: params round-trip and lenient decode | spec: Flood params are a size, a color count and a leniency |
| Scenario: a generated board is not one color and its limit is the solver's count plus the leniency | spec: A generated Flood board is completable within its move limit |

## Flood fill and solve moves transform state purely

| Rule | Where it went |
| --- | --- |
| A move is a fill carrying a color or a solve | spec: Flood fill and solve moves transform state purely |
| `executeMove` is pure, a fill floods the corner region and increments the move count, a solve runs the solver and applies its fills | spec: Flood fill and solve moves transform state purely |
| `interpretMove` produces a fill only when the target's color differs from the corner's and the game is not complete, and cursor keys move the cursor, clamped | spec: Flood input fills with the chosen square's color |
| Solve refuses, saying no solution can be found from this position, when its fills would pass the limit, since that grid is a loss | spec: Flood's Solve refuses a finish past the move limit |
| The state keeps no record of completion or of the solver, completion is the grid being one color, and the engine records that Solve was used | spec: Flood's state records neither completion nor the solver |
| Scenario: a fill floods the corner region | spec: Flood fill and solve moves transform state purely |
| Scenario: a fill that does not change the corner color is rejected | spec: Flood input fills with the chosen square's color |
| Scenario: Solve refuses a finish past the move limit | spec: Flood's Solve refuses a finish past the move limit |
| Scenario: Solve snaps to a completed grid | spec: Flood fill and solve moves transform state purely |

## Flood reports win and lose status

| Rule | Where it went |
| --- | --- |
| `status()` is `"solved"` on a grid complete within the limit, `"lost"` when the count reaches the limit first, `"ongoing"` otherwise | spec: Flood reports win and lose status |
| The status bar shows the move count against the limit, with `COMPLETED!`, `FAILED!` and `Auto-solved` prefixes as appropriate | spec: Flood's status bar counts moves against the limit |
| Scenario: exhausting the move limit loses | spec: Flood reports win and lose status |
| Scenario: completing within the limit wins | spec: Flood reports win and lose status |

## Flood offers a solver-backed hint plan

| Rule | Where it went |
| --- | --- |
| `hint()` returns the solver's whole remaining sequence as a multi-step plan, each step a fill narrated by its color and highlighting the squares it absorbs | spec: Flood offers a solver-backed hint plan |
| `hintKeepTrack` advances the plan on the step's fill and drops it otherwise | spec: Flood's hint plan follows the player's fills |
| Scenario: the hint plan completes the board | spec: Flood offers a solver-backed hint plan |
| Scenario: following the plan keeps it and deviating drops it | spec: Flood's hint plan follows the player's fills |

## Flood draws a flat field of colored tiles

| Rule | Where it went |
| --- | --- |
| The board is a field of flat tiles in the collection's ten colors with no bevel, and tiles of one region join with no line between them | spec: Flood draws a flat field of colored tiles |
| Between two regions and round the field the line is the surface's grid line, thin, and the frame is no heavier than the line between two regions | spec: Flood's regions and field are bounded by the thin grid line |
| A mark on a tile (the cursor's outline, the hint's dot, the lost board's blink) is black in both schemes, with the reason | spec: A mark on a Flood tile is black in both schemes |
| Scenario: the field has no bevel, every tile a flat rectangle | spec: Flood draws a flat field of colored tiles |
| Scenario: the field is framed in the grid's color, as wide as a region's edge | spec: Flood's regions and field are bounded by the thin grid line |
| Scenario: a region is one area, no line between two tiles of one color | spec: Flood draws a flat field of colored tiles |
| Scenario: two adjacent tiles of different colors are separated by the grid line | spec: Flood's regions and field are bounded by the thin grid line |
