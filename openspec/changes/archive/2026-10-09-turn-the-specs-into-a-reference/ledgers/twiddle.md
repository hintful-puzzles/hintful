# Ledger: twiddle

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## Twiddle game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `twiddle` game implements `Game` over its five types, a grid solved when the numbers read in non-decreasing row-major order and, when orientable, every tile is upright | spec: Twiddle game implements the Game interface |
| The game provides `statusbarText`, `solve` and `textFormat` | spec: Twiddle game implements the Game interface |
| Params are `w`, `h`, `n`, `rowsonly`, `orientable` and `movetarget`, encoded `WxHnN` with trailing `r`, `o` and `mK`, decoded leniently with a bare `W` square and a default `n` of 2 | spec: Twiddle params are written WxHnN with trailing flags |
| The presets are offered, and only one of them is orientable | spec: Twiddle's presets hold one orientable board |
| The presets are upstream's, which had two orientable boards | history |
| `validateParams` rejects `w < n`, `h < n` and an unreasonably large area | spec: Twiddle refuses a board smaller than its block |
| `validateParams` rejects `n < 2` and a negative `movetarget` | untrue: `validateParams` in `src/games/twiddle/state.ts` checks only the two block-size comparisons and the area, and the other two are refused by the engine's `paramsError` (`src/engine/params.ts`) from the `bounds` the two `numberItem`s declare in `src/games/twiddle/index.ts`, with the sentences "Rotating block size must be at least 2." and "Number of shuffling moves must be at least 0.", so the requirement now states the declared bounds and the engine's refusal |
| No `findMistakes` hook, since every reachable position is legal | spec: Twiddle has no mistake check and no hint |
| No `hint` hook | spec: Twiddle has no mistake check and no hint |
| There is no hint because upstream has no human solver for subsquare rotation | reason |
| Scenario: params round-trip and lenient decode | spec: Twiddle params are written WxHnN with trailing flags |
| Scenario: a generated board is scrambled, starts unsolved, and generation terminates for every preset | spec: Twiddle game implements the Game interface |
| Scenario: invalid params get a non-null human-readable reason | spec: Twiddle refuses a board smaller than its block |
| Scenario: that reason is returned by `validateParams` for `{ n: 1 }` and a negative `movetarget` | untrue: those two reasons come from the engine's params check, which reads the declared bounds before it calls the game's `validateParams` (`paramsError` in `src/engine/params.ts`), so the scenario now names the engine's check |

## Twiddle rotation and solve moves transform state purely

| Rule | Where it went |
| --- | --- |
| A move is a rotation carrying the region's top-left corner and a direction, or a solve | spec: Twiddle rotation and solve moves transform state purely |
| `executeMove` is pure, and a rotation turns the block 90° in `dir`, advances orientations when orientable and increments the move count | spec: Twiddle rotation and solve moves transform state purely |
| A click is offset by `(n−1)/2` tiles to select the region centered on it, a region outside the grid is rejected, left-click is `dir +1` and right-click `dir −1` | spec: A click rotates the block centered on it |
| Cursor keys move a clamped, unwrapped cursor over the rotation origins and return a UI update, the two selects rotate the cursor's block each way, and a first select while hidden only reveals | spec: The Twiddle cursor moves over the rotation origins |
| Corner letters, their shifted reverses and the parity-gated numpad rotations produce rotations | spec: Letter and numpad keys rotate fixed blocks |
| A solve replaces the grid with the solved arrangement, clears orientations and counts as one move | spec: Solve replaces the grid with the solved arrangement |
| The state keeps no record of completion or of the solver, the board is solved exactly while in the solved arrangement, and the engine records Solve and suppresses its flash | spec: Twiddle state keeps no record of completion or of the solver |
| Scenario: a rotation and its reverse restore the grid, mutate nothing and count a move each | spec: Twiddle rotation and solve moves transform state purely |
| Scenario: a click whose region passes the grid edge produces no move | spec: A click rotates the block centered on it |
| Scenario: orientation advances with the rotation and counts toward completion | spec: Twiddle rotation and solve moves transform state purely |
| Scenario: solve snaps to the solved board with the flash suppressed | spec: Solve replaces the grid with the solved arrangement |

## Twiddle renders tiles, cursor, rotation animation, and flash

| Rule | Where it went |
| --- | --- |
| A one-time recessed beveled border, then each tile as a beveled square with its centered number and, when orientable, an orientation triangle | spec: Twiddle draws a recessed border and beveled numbered tiles |
| A per-tile cache repaints a tile only on a changed number or orientation, an animating block, a cursor moved onto or off it, or a changed flash background | spec: A Twiddle tile is repainted only when it changed |
| A rotation animates the block turning 90° about its center over a duration proportional to `sqrt(n−1)`, with each turning tile's four bevel edges recolored and tiles outside drawn normally | spec: A rotation animates the block turning about its center |
| A genuine completion, not a solve, flashes the background | spec: Only a genuine completion flashes the background |
| A visible cursor's region is outlined with cursor-colored bevel edges | spec: The Twiddle cursor outlines its block |
| The status bar shows a move count that never freezes or resets, with the target suffix, after the engine's completion words | spec: The Twiddle status bar shows a move count that never resets |
| Scenario: the first draw emits the border and one numbered beveled tile per cell | spec: Twiddle draws a recessed border and beveled numbered tiles |
| Scenario: a rotation draws its block rotated mid-animation and the rest unrotated | spec: A rotation animates the block turning about its center |
| Scenario: completion flashes on a player's rotation and not on a solve | spec: Only a genuine completion flashes the background |

## A Twiddle tile stands off the well it turns in

| Rule | Where it went |
| --- | --- |
| A tile's face is the lifted surface inside its bevel and what a turning block uncovers is the cell surface, in both schemes, the tile keeps its bevel, and color 0 stays the board | spec: A Twiddle tile stands off the well it turns in |
| Scenario: a tile is not the board's gray | spec: A Twiddle tile stands off the well it turns in |
| Scenario: a turning block shows the well | spec: A Twiddle tile stands off the well it turns in |
