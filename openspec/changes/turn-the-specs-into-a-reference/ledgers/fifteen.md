# Ledger: fifteen

Base: bb004490

Where every rule of Fifteen's spec went in the reference form.

## Fifteen game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `fifteen` game implements `Game`, a `w×h` grid of numbered tiles with one gap, solved when the tiles read in order with the gap last | spec: Fifteen game implements the Game interface |
| The five type arguments of `Game` | untrue: `fifteenGame` in `src/games/fifteen/index.ts` is typed with eight arguments, the hint rung among them, so the requirement names `Game` alone |
| Params are `w` and `h`, encoded `WxH`, with a bare `W` decoding to a square board | spec: Fifteen's params are a width and a height |
| Presets of `3x3`, `4x4` and `5x5` | spec: Fifteen's params are a width and a height |
| `validateParams` rejects `w < 2` or `h < 2` | untrue: Fifteen has no `validateParams`. `paramConfig` in `src/games/fifteen/state.ts` declares `bounds: { min: 2 }` on both fields and the engine's `paramsError` in `src/engine/params.ts` refuses on it. The rule is kept in spec: Fifteen's params are a width and a height |
| The game provides `statusbarText`, `solve` and `textFormat` | spec: Fifteen game implements the Game interface |
| No `findMistakes` hook, every reachable position being legal | spec: Fifteen game implements the Game interface |
| Scenario: params round-trip and lenient decode | spec: Fifteen's params are a width and a height |
| Scenario: a generated board is solvable and starts unsolved | spec: A generated Fifteen board is solvable and starts unsolved |

## Fifteen slide and solve moves transform state purely

| Rule | Where it went |
| --- | --- |
| A move is a slide carrying the destination gap cell, or a solve | spec: Fifteen slide and solve moves transform state purely |
| `executeMove` is pure. A slide shifts the line of tiles toward the old gap and counts one move per tile shifted. A solve replaces the grid and counts as one move | spec: Fifteen slide and solve moves transform state purely |
| `interpretMove` produces a slide only for a target sharing exactly one coordinate with the gap, and nothing for zero, both or out of bounds | spec: A click slides only along the gap's row or column |
| Cursor keys slide the adjacent tile into the gap at once, the pressed arrow moving a tile that way | spec: A click slides only along the gap's row or column |
| The state keeps no record of completion or of the solver, and the board is solved exactly while its tiles are in order | spec: Fifteen's state records neither completion nor the solver |
| The engine records that Solve was used and suppresses the completion flash for the Solve command | spec: Fifteen's state records neither completion nor the solver |
| Scenario: a slide shifts a line of tiles into the gap | spec: Fifteen slide and solve moves transform state purely |
| Scenario: click geometry constrains legal slides | spec: A click slides only along the gap's row or column |
| Scenario: Solve snaps to the solved board | spec: Fifteen's state records neither completion nor the solver |

## Fifteen offers a greedy full-solution hint plan

| Rule | Where it went |
| --- | --- |
| `hint()` returns the whole greedy solution as a multi-step plan, each step the greedy solver's next single-cell gap slide, highlighting the tile it slides | spec: Fifteen offers a greedy full-solution hint plan |
| The solver fills the shorter of the top row and left column tile by tile, with a fixed shortest-move table for the end-of-line corner | spec: Fifteen offers a greedy full-solution hint plan |
| Following the plan from any solvable board reaches the solved state | spec: Fifteen offers a greedy full-solution hint plan |
| Narration explains why the move matters, not merely which tile slides | spec: A Fifteen hint step says whether its slide places a tile home |
| A step that lands a tile in its solved cell is narrated as placing that tile home | spec: A Fifteen hint step says whether its slide places a tile home |
| The home wording is only for a cell where the solver will not disturb the tile again | untrue: `narrateFifteenStep` in `src/games/fifteen/index.ts` tests only that the slid tile lands in its own solved cell (`landsAtOwnHome`) and does not ask whether the solver moves it later, so the requirement states the positional test |
| A step that does not is narrated as a setup move, naming the target tile it works toward its home | spec: A Fifteen hint step says whether its slide places a tile home |
| The wording is consistent with the hint quality bar (the Palisade exemplar) and with the Sixteen hint | spec: A Fifteen hint step says whether its slide places a tile home |
| `hintKeepTrack` returns `"completed"` for a move producing exactly the board the step expects and `"off"` otherwise, dropping the plan for the next request to recompute | spec: Fifteen's hintKeepTrack completes on the hinted slide alone |
| Returning the whole plan keeps the hint displayed while it is followed | spec: Fifteen offers a greedy full-solution hint plan |
| "Consistent with the other sliding-tile game" as the reason for a whole plan | reason |
| The move, the highlighted tile, the tracking and the plan length are unchanged by the narration | spec: A Fifteen hint step says whether its slide places a tile home |
| "The narration enrichment" as an event | history |
| Scenario: hint plan solves a solvable board, within `5·n³` moves | spec: Fifteen offers a greedy full-solution hint plan |
| The bound is upstream's | history |
| Scenario: hint highlights the tile it moves | spec: Fifteen offers a greedy full-solution hint plan |
| Scenario: narration distinguishes a home move from a setup move | spec: A Fifteen hint step says whether its slide places a tile home |
| Scenario: following the plan keeps it displayed and deviating drops it | spec: Fifteen's hintKeepTrack completes on the hinted slide alone |

## Fifteen renders tiles, border, and slide animation

| Rule | Where it went |
| --- | --- |
| `redraw` draws a one-time recessed beveled border, then each tile as a beveled square with its centered number | spec: Fifteen renders tiles, border, and slide animation |
| The gap is drawn as plain background | untrue: `drawTile` in `src/games/fifteen/render.ts` paints the gap `COL_WELL`, the cell surface, and never color 0, as the old spec's own last requirement already said. The rule that holds is in spec: A Fifteen tile stands off the well it slides in |
| A per-tile cache repaints a tile only when it changed, is animating, or the flash background changed | untrue: `redraw` in `src/games/fifteen/render.ts` also repaints when the hinted tile changed (`ds.hintTile !== hintTile`), so the requirement in spec: Fifteen renders tiles, border, and slide animation lists it |
| A slide animates in two passes, vacated cells blanked first, then each moving tile interpolated toward the gap over the animation duration | spec: A Fifteen slide animates in two passes |
| A genuine completion, not a solve, flashes for two frames | spec: A genuine Fifteen completion flashes for two frames |
| The flash is of the background | untrue: `redraw` in `src/games/fifteen/render.ts` passes the flash color to `drawTile` as a tile's face and paints the gap `COL_WELL` throughout, so the requirement says the tiles' faces flash |
| The status bar shows the move count, never frozen or reset, after the engine's completion words | spec: Fifteen's status bar shows the move count |
| Scenario: first draw emits the border and numbered tiles | spec: Fifteen renders tiles, border, and slide animation |
| Scenario: a slide animates between cells | spec: A Fifteen slide animates in two passes |

## A Fifteen tile stands off the well it slides in

| Rule | Where it went |
| --- | --- |
| A tile's face is the lifted surface inside its bevel, the gap and what a slide uncovers the cell surface, in both schemes. The tile keeps its bevel and color 0 stays the board | spec: A Fifteen tile stands off the well it slides in |
| Scenario: a tile is not the board's gray | spec: A Fifteen tile stands off the well it slides in |
