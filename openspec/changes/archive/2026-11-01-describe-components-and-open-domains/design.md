# Design: components and open domains

Read 2026-11-01 at `a386703d`. Figures are dated; re-check one before
designing against it.

## Sections

| Section | What it holds |
| --- | --- |
| What the runtime gains | each construct, and why it is stated that way |
| Flood | its layers, the fill, its limit and its claim |
| Same Game | the group, the fall, its finish and its claims |
| Netslide | the wires, the table of sides, the slides |
| Numgame | the places and the four operations |
| Untangle | the vertices, the edges and the crossing test |
| What each keeps | the hand-written copies kept, and why |

## What the runtime gains

- **A component is a least fixed point with a parameter.** A definition that
  reads itself may take more than one parameter: it is the least set of
  cells its last parameter makes it true of, for each value of the others,
  computed when first read with that value and kept for the call. Every
  self read passes the earlier parameters through unchanged, which the
  compiler checks. Same Game's group is `joined(s, c)`; Flood's corner
  region and Netslide's powered tiles need no parameter, and are the least
  fixed points the runtime already has. No construct names a component or
  a reach: both are stated as what they are, the cells a rule joins.
- **A layer over the board** (`over: board`) holds one value, read by its
  name alone (`moves`) and assigned by an assignment with no `for`. Flood's
  count of fills is one: its finish is "one color within the limit", and
  its claim adds the fills made to the colors left.
- **A layer whose domain is not finite** (`domain: integers`) holds any
  safe integer, in a `Float64Array`. Every term that reads it is exact: a
  double while it is a safe integer and a `bigint` past that (the runtime's
  `iadd`, `imul` and the rest), so a product past 2^53 (Untangle's crossing
  test on a large snapped board) is exact, and `===` and `<` compare two
  values as they are. A value past a safe integer assigned to the layer
  throws. All-`bigint` arithmetic was tried first, and Untangle's finish
  took 6.6 times `findCrossings`' time against 5.4 with doubles. A move may
  bind a number `in integers` (Untangle's point): such a move is checked by
  `legal` and played by `play`, and `moves` never lists it, there being no
  end to the list.
- **A view** (`views: [name]`) is a definition the game reads beside the
  rules: the module's `views()` gives the cells it holds of for values of
  its other parameters. Same Game's group is one (the selection, the
  removal), Netslide's powered tiles another (the status bar), so the game
  reads the description rather than a copy.
- **A compiled move refuses a fraction** for a cell or a value binder: a
  save may hold anything, and the range and the shift `legal` tested let
  1.5 through. Untangle's hand-written check refused it; every planning
  game's `legal` now does.
- **The checker searches an open layer over a window** (`checked`, a set of
  values): where every position keeps the layer inside it, the search is
  whole; a move that takes a position out of it ends that line, so a claim
  is refuted only by a line inside the window, and the results count the
  positions with a line out of it. A claim over an open layer with no
  window is refused as beyond the checker, naming the layer. Flood's count
  is checked up to one fill past the limit. Numgame and Untangle state no
  claim: their `hasNoSolution` is a search (Numgame's reach, Untangle's
  planarity test), which no formula states.

## Flood

Layers `color` (a square's, `range(0, colors - 1)`) and `moves` (over the
board, open, checked to one past the limit). The fill to color `k`, any
color but the corner's on a board not yet one color, paints the corner's
region, the least fixed point from the corner over squares of its color,
and counts one. The finish is one color within the limit. The game's lost
status, the limit reached unfinished, is not a lost position: upstream lets
the player go on filling past it, and a lost position has no moves
(`docs/descriptions.md`), so the game's `status` reads it off the position.
Its claim `short`: the fills made, plus one for each color with a square
outside the corner's region, exceed the limit.

## Same Game

Layer `tile` (0 empty, else a color). A removal binds the first square of a
group of two or more, `joined(s, c)` its component; its assignments empty
the board and write each square that stays where the fall and the closing
up of empty columns take it: down by the squares that go below it, left by
the empty columns before it. The finish is an empty board. Its claims are
the two `hasNoSolution` tested: `stuck` (no two squares of one color side
by side) and `last` (a square the last of its color), stated once, as the
search's floor reads them too.

## Netslide

Layers `tile` (its wires, a mask of the four sides, R 1, U 2, L 4, D 8 as
`engine/square-edges.ts` has them). What the board deals beyond the tiles
is a table, `beyond(c, k)`: the square across side `k` of `c`, wrapping
round, or none where a barrier stands, so the border of a board that does
not wrap is a barrier and the rules need no wrapping variation. A tile is
powered where it is the source or meets a powered neighbor arm to arm; the
finish is every tile powered. The slide moves a line other than the
source's row or column one square either way, stated as Sixteen's slide
is, so `slide-planner` takes the compiled list. Its claims are
`hasNoSolution`'s: a tile with no wire, and too few wire ends to join every
tile.

## Numgame

The board is six places with no geometry (`space.cells`), one open layer
`value` (0 an empty place). The four operations are four moves, each
binding the place the result lands on (the larger number, the lower place
between equals) and the place emptied: a difference must be positive and a
quotient whole. The finish is a place holding the target, a size the board
deals.

## Untangle

The vertices are cells with no geometry, the edges a dealt relation
`joined(v)`, and each vertex's point three open layers `xnum`, `ynum`,
`denom` (the point `(xnum/denom, ynum/denom)`; `x` and `y` are the grid's
builtins). The move places one vertex on any point with a positive
denominator. The finish is no two edges that share no vertex crossing, by
upstream's exact test stated over the layers: `side(o, p, q)` is the cross
product of `q` and `p` seen from `o`, and `along` its dot product.
Upstream's test is not symmetric where an end lies on the other line, so
each pair is read with the later edge first, as `findCrossings` reads it,
and once: the finish read every pair twice at first, 6.6 times
`findCrossings`' time, and reads it once at 2.2 to 2.7. The view
`crossed(a, b)`, the edge's red flag, is stated for each edge.

## What each keeps

`report.md` has the measurements and what each kept.
