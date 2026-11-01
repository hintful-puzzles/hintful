# Design: pushes, blocks and solids

Read 2026-11-01 at `a15780e5`. Figures are dated; re-check one before
designing against it.

## Sections

| Section | What it holds |
| --- | --- |
| What the runtime gains | each construct, and why it is stated that way |
| Sokoban | its layers, its three moves, its finish and its claims |
| Slide | its layers, the shift, and the game's move as a line of shifts |
| Cube | the arena, the faces and the roll table |
| What each keeps | the hand-written copies kept, and why |

## What the runtime gains

- **A layer's value stands only where a formula holds** (`on: P`, read
  of the cell `c`): where `P` is false the layer holds 0. Like `domain` and
  `once`, only the checker reads it, to leave out positions no board holds
  (a barrel on a wall, the player on a barrel). Without it Sokoban's
  universe is 16 states a square and the checker reaches no board above
  four squares; with it, 7, and it reaches 2×3. The checker refuses an `on`
  that reads anything but layers at `c`, so the universe is a product of
  each square's admitted states, and a move whose result breaks an `on`
  fails the check as any value outside a domain does.
- **A carried layer** (`carried: true`) is a value a move copies and no
  rule reads: Sokoban's barrel letters. The compiler refuses a read of it
  anywhere but an assignment to itself, so no verdict depends on it, and the
  checker holds it at 0.
- **The player's reach is a least fixed point**, which the runtime already
  has: no construct is added for Sokoban's walk.
- **A block shifted whole** needs no construct either: a move binds the
  block's first square and the neighbor it sets off toward, its guard is a
  `forall` over the block's squares, and its two assignments clear the block
  and write it one square on, the later winning where they meet.
- **A board that is not a rectangle** (`space.cells: n`): the board is `n`
  cells and nothing else, so the geometry (`x`, `y`, `cell`, `adj4`, `adj8`,
  `ray`, `on_grid`, the lines) is refused on it. Cube's arena is a list of
  squares or triangles, and its adjacency is the roll table.
- **A second sort of element** (`space.faces: n`): the elements `faces`, and
  a layer `over: faces` holds a value a face. An assignment's last binder is
  an element of its layer's sort.
- **A dealt table** (`space.tables`): a function of elements and numbers to
  an element or `none`, read `dest(s, r)`, and a field of `Dealt`. Cube's
  roll table stays the data its geometry computes (`solver.ts`' `Rolls`),
  read by the description.
- **The checker deals what a game deals** where a description reads a dealt
  table: the game exports the boards it checks and what each deals
  (`checkedBoards`), built by the same code that deals the game's board, so
  the claim is checked on boards the game makes, not on every table.

## Sokoban

Layers `ground` (floor, wall, pit, deep pit), `target`, `barrel`, `label`
(carried) and the token `man`. Moves:

- `step`, the keyboard's: to a neighbor that is free, a diagonal one only
  past a free square beside both (upstream's NetHack rule).
- `walk`, a tap's: to any square in the player's reach, a least fixed point
  over free squares from the player.
- `push`: from any square of the reach behind a barrel, the barrel one
  square on, onto floor, into a pit (which it fills) or a deep pit (which
  eats it). The keyboard's push is one from the player's own square, and a
  drag's push of `n` squares is `n` pushes, the first from behind the
  barrel and each after from where the last left the player, so a drag
  that runs into a pit stops there as the compiled pushes do.

Its finish is two-sided (`describe-the-whole-catalog/design.md`
§ "Corrections"): no barrel off a target, or nowhere left to put one.

Its claims, on a board where every barrel is needed (no pits, no more
barrels than targets): `dead`, a barrel no push could bring to a target with
the board to itself (a least fixed point backward from the targets); and
`jammed`, a barrel that can never move again. The solver's `frozen` assumes
the barrels on its path frozen, which is the greatest fixed point; the
description states its complement, `loose`, as a least one. The banner
outlines the first stuck barrel in reading order, `dead`'s word winning a
tie, as the solver's `stuckKind` did.

## Slide

Layers `ground` (floor, wall), `field` (forcefield), `goal` (the square the
main block's first square must reach) and `block`, a block's number on each
of its squares, the main block 1. The state keeps its canonical encoding, in
which two blocks of one shape are the same, and numbers the blocks in
reading order each time it is read. The description's move is `shift`, one
square; the game's move, a block to any square its first square can reach,
is played as the line of shifts a search over the compiled shifts finds.

## Cube

The arena is `space.cells`, its squares as the grid lists them, with the
faces a second sort. Layers `blue` (a square's paint), `at` (the token
solid) and `paint` (`over: faces`). The roll table deals each square's
destination by direction and each face's source; face numbers are the
game's, and the dealt `down` names the face that rests on the square. The
claim `short` is too little paint to cover the solid: a roll moves paint and
never makes or loses it. The game's test was "not exactly a solid's worth",
which would hold of a hand-made board with paint to spare that can finish,
so the claim says fewer; `report.md` says what the checker found of the
game's test.

## What each keeps

`report.md` has the measurements and what each kept.
