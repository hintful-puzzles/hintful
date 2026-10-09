# Verdicts: mosaic

## keep `mosaic`: Mosaic's largest preset deals without aggressive generation

It is a decision someone would revisit: a session tidying the presets would make the 50×50 uniform with the rest. The comment in `presets()` (`src/games/mosaic/state.ts`) says only that upstream turns it off, and a comment is not a rule. A player sees the difference, since a board dealt without clue minimization shows more numbers.

## reword `mosaic`: Mosaic's size limits

Dropped "by the engine, from the bounds the game declares on its width and height fields", which says where the refusal is built. `engine-params` "A rule that a game rejects params is met by the engine's check" already says a game's stated minimum may be met by an item's `bounds`. The two limits and the scenario are unchanged.

### Requirement: Mosaic's size limits

A board narrower or shorter than 3 SHALL be refused. `validateParams` SHALL
refuse a board of more than 10000 tiles.

#### Scenario: Invalid params are rejected

- **WHEN** the params of a 2×3 board, or of a board of 101×100 cells, are
  checked
- **THEN** each is refused with a non-null error string
- **AND** a 3×3 board and a 100×100 board are accepted

## keep `mosaic`: A Mosaic press toggles a cell and a drag repeats it

`engine-input` "A drag on from a press repeats the press" gives the mechanism, and this says what Mosaic's sweep compares (the mark the pressed cell held) and what follows from it, lay or clear. The margin click and the finished board taking only cursor movement are what a control does, and no shared requirement states either (searched `engine-input` for a press that lands on no target: none).

## reword `mosaic`: Mosaic flags a satisfied clue and a contradicted one

Dropped "After each toggle, paint or fill the game SHALL reflag every clue the move affects", which is when the flags are computed. What a player sees is kept: the two definitions, and that the flags and the count follow the marks.

### Requirement: Mosaic flags a satisfied clue and a contradicted one

A clue SHALL be flagged `SOLVED` when it is exactly satisfied with no cell of
its neighborhood unmarked, and `ERROR` when it is overcommitted, with more
cells marked than the clue or too few cells left that could be. The flags and
the count of clues left SHALL follow the marks.

#### Scenario: A satisfied clue grays out and a contradicted clue reddens

- **WHEN** a clue's neighborhood is fully determined with exactly the clue's
  count marked
- **THEN** the clue carries the `SOLVED` flag (drawn gray)
- **AND** when more cells are marked around a clue than its value, it carries
  the `ERROR` flag (drawn red)

## keep `mosaic`: Mosaic's Solve applies the deduced solution

`ts-engine` "Solve leaves a solved board" says what Solve means and not where a game's answer comes from or when it fails. Here the answer is deduced from the clue board and not from the player's marks (`solve(orig, _curr)` in `src/games/mosaic/index.ts`), and Solve fails where deduction stalls: both are the game's.

## edit `mosaic`: Mosaic hides the clues a board does not need

The order in which the clues are tried is how the minimization is built. The app hands out boards and never seeds, so no one can observe it, and the promise that every hide leaves the board solvable is kept.

from: each remaining clue, in random order, and SHALL
to: each remaining clue and SHALL

## note Mosaic's spec has no requirement for its hint

The first doubt names no requirement, and it holds: `src/games/mosaic/hint.ts` ships two rungs (`MOSAIC_RUNGS`: `met`, then `needsAll`), ring and outline marks (`hintMarks` in `index.ts`), a tap-per-square `hintGesture`, `hintKeepTrack`, and a `DEDUCTION_EXHAUSTED` refusal, and the only requirement that touches any of it is "Mosaic names no hue of its own for either mark". Every other hinted game of this batch states its techniques, order, marks and refusal. A follow-up change should write Mosaic's from the code; this pass may not add them.

## note Mosaic's status bar words are stated nowhere

`statusbarText` in `src/games/mosaic/state.ts` shows "Clues left: N" and nothing once none is left. The spec says only that the count follows the marks. It is a sentence a player reads, so the same follow-up change should give it a line.

## note engine-input has no rule for a press that lands on no target

Mosaic's "A click in the margin SHALL be ignored" is true of every game whose geometry is `squareGrid`, which returns no target outside the grid (`src/engine/target-verb.ts`). `engine-input` does not say that a press addressing no target makes no move, so each declaring game that cares says it for itself. One sentence there would cover them.
