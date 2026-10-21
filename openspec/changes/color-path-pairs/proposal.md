# color-path-pairs

Filed 2026-10-21 on the owner's word, after Path's hint iteration: color each
pair of numbers, and the lines that reach them, in a color of its own.

## Why

In Path a line's number is the fact every deduction turns on, and the board
draws every line in ink: telling which number a line leads to means tracing
it. Coloring a number's disc and the lines that reach it shows that at a
glance. It gives nothing away: the numbers already say which squares pair up,
and the hint already counts an edge between two numbers' lines as plainly
closed (the owner, 2026-10-21, in removing the pair step), which coloring
makes as plain on the board as the hint assumes. It is also the genre's look:
Flow Free colors its pairs.

## The owner's decisions (2026-10-21)

- **Colors may repeat** where a board has more pairs than the set has colors.
  The numbers stay on the discs and tell repeated colors apart, so a player
  who cannot tell the hues apart loses nothing.
- **A separate palette for colors that mean nothing**, not the set games use
  today. `TEN` (`src/engine/color/colors.ts`) holds red, blue, green and teal,
  which are also the error, the hint's ring, the cursor and the hint's
  outline; a red pair would hide an error and a blue line blur with the
  hint. The pair colors come from a set designed to stand apart from every
  color that carries a meaning on the board.

## What changes

- **An engine set of semantically free colors**, beside `TEN` in
  `src/engine/color/colors.ts`: colors a player tells apart that carry no
  meaning of the collection's (no error, hint, cursor, held or done color
  among them, nor one a player would take for one), measured for mutual
  distinctness in both schemes and against the marks drawn over them, as
  `TEN` was. Its size is what that measurement allows, and Path repeats
  colors past it.
- **Path colors each pair**: the disc of each number in its pair's color, and
  every line whose piece reaches a number in that number's color. A piece
  reaching no number stays ink. The number stays on the disc.
- **A broken line is told by its shape, not red**, so no pair's color can hide
  it, and the hint's marks are checked on colored lines in both schemes.
- **Every other game whose colors mean nothing moves onto the new set where
  it serves** (owner, 2026-10-21: "if that's useful to other games, let's
  reuse it"): Flood, Guess and Samegame take colors from `TEN` today, and the
  same collision with the error and hint colors applies to their pieces.
  Where a game cannot (more colors than the set has, with nothing else to
  tell its pieces apart), the reason is recorded.

## Not in this change

Any change to Path's rules, hints or generation.

## Impact

`src/engine/color/colors.ts` and its tests (`colors.test.ts`,
`scripts/checks/color-collide.test.ts` before and after); `src/games/path/render.ts`
and its snapshots; Flood's, Guess's and Samegame's renderers, and any other
game moved; Path's help (`help/games/path.md`, Look); specs
`engine-colors` and `path`.
