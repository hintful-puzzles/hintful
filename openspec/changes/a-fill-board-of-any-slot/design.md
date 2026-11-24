## Context

Read at `a51bbd3a4` (2026-11-24). The regions and lines groups' games,
their answers as their descriptions state them:

```sh
for g in palisade filling separate galaxies rect dominosa subsets wordtrail \
  loopy pearl tracks bridges spokes slant path signpost net ascent; do
  printf '%s ' $g; awk '/^answer:/{p=1;next} /^[a-z]/{p=0} p' \
    src/games/$g/$g.description.yaml | grep -o 'sort: [a-z]*' | head -1; done
```

That gave the edge for thirteen (Palisade, Separate, Galaxies, Rect,
Dominosa, Wordtrail, Loopy, Pearl, Tracks, Bridges, Spokes, Path, Net), and
the cell for Filling, Subsets, Slant, Signpost and Ascent.

Two facts settle most of the design:

- **The description language and the ladder already have the sort.**
  `answer.value.sort` is `cell` or `edge` in the schema, the compiler's
  `env.answerSort` types every formula by it, a compiled check iterates
  `sp.edges` and names edges in its violations, and `CellMarks` takes
  `held: "edge"` (Palisade's `solver.ts`). What lacks it is the fill
  engine above the ladder: its board, deal, codec, drawing and input.
- **No game needs a vertex sort.** Loopy and Net are tilings
  (`space.tiling`), whose cells are the dots and whose edges join them;
  Slant's answer is on cells, with its mark on points. The proposal's
  "vertices" is dropped: a sort is added when a game needs it.

## Goals / Non-Goals

**Goals:** a born game whose answer is on edges, dealt, drawn, played and
hinted by the fill engine; a partition stated as such an answer; cell games
unchanged.

**Non-Goals:** moving any game (the groups' own changes do); tilings (the
fill board is a square grid, and Loopy's change takes them up); a drag that
draws a line from square to square (`line-drawing.ts`'s, which the lines
group adopts); notes, links and the keypad on edges (each refused by the
compiler until a game needs it).

## Decisions

### The word: the answer's sort, its elements

The proposal says "slot", which the fill engine already uses for a clue
beyond a line's end (`slots.ts`, `at: slot`). The code takes the words the
layers below it use: the answer's **sort** (`env.answerSort`, the schema's
`sort`), and its **elements** (`describe-runtime/space.ts`: "its elements
numbered"). The compiled fill module exports `answerSort`, and
`elementsOf(module, sp)` is `sp.cells` or `sp.edges`. An edge is numbered
as the space numbers it (`edgeEnds`), never as `board/square-edges.ts`
does: the ladder reads the board as it is, so the board keeps the ladder's
numbering, and a shared mechanic whose numbering differs (`border-grid`,
`line-drawing`, `edge-hint`) is adapted at the fill engine's edge, through
`sp.edgeOf(a, b)`.

### A partition is an edge answer drawn as walls

A partition of the cells is stated as walls on the edges, as Palisade,
Separate, Galaxies and Rect state it already, and not as a part index a
cell:

- Their ladders run on walls, and a player marks "a wall" and "no wall"
  between two squares neither of which is decided, which a part a cell
  cannot hold.
- A part index is a labeling: two boards that divide alike differ in their
  numbers, so the answer would not be one.
- The rules read regions from the walls already (`through(c, joined)`).

So the engine has no partition sort. What makes an edge answer a partition
is how its values are painted (`paint: wall`) and how the deal samples it
(a divided partition, its walls written between parts).

### Each concept, its form on an element, in order

Each is a commit (task 2.2) in this order, since each later one reads the
earlier:

1. **The board** (`board.ts`): `values` and `fixed` are an element's;
   `newBoard`, `domainMask` and `marksOf` (which passes `held`) loop over
   `elementsOf`. `mark` stays a cell's: a mark states its own sort
   (`marks.<name>.sort`), and the fill board's one mark is a cell's, as
   `CellMarks.marked` is. `pencil`, the answer's candidate notes, is
   refused on an edge answer (7). `w` and `h` stay the grid's. The
   compiler binds the domain's `c` to the answer's sort, and a number's
   `clueCells` are the answer's elements its meaning reads (lacing's
   number, the four edges round its square).
2. **The answer** (`answer.ts`): `status`, `solve`, `findMistakes`,
   `revealOne` and the `aux` answer are index-generic already. The text
   format prints an edge's value in the wall's place between its two cells,
   as `gap` prints a gap's clue: one character, from the value's glyph.
3. **The deal**: the scatter sampler over elements; a divided partition
   (`deal.divide`) sampled as an answer, its walls the value painted
   `wall` between two parts and the other value elsewhere. Clues derive
   from `means`, which reads the answer by its sort already. `given` of an
   edge answer is refused until a game has one.
4. **The drawing**: a tile's word gains its four sides' edge values; an
   edge's value is drawn by its `paint`, an edge painter: `wall` on the
   side the two squares share (the partition's walls, `region-walls.ts`),
   `line` as two halves from each center to that side (as `links.ts`
   draws a link), `cross` a small cross on the side. Live errors and
   Check & Save redden an edge as they redden a cell.
5. **The input**: an edge is the target, the nearest to the pointer
   (`border-grid.ts`'s `pointerEdge`), and the cursor moves on the half
   grid (`moveBorderCursor`); each button places its value there as on a
   cell, and a sweep runs along edges.
6. **The hint**: a record names an edge, and the step rings it as
   `mechanics/edge-hint.ts` rings one (a pill on the side); the words'
   `outline`/`stripes` name cells as they do now. Its gesture clicks the
   edge's middle.
7. **The refusals**: the compiler refuses on an edge answer what assumes a
   cell, each by name: notes, `numbers`, `links`, `wash`, `covers`,
   `given`, `dealt`, `hexagon`, `straight`.

### The fixtures

- **`lacing`, an edge answer**: lines between squares side by side, each
  number counting its square's lines; sampled by scatter at a share; its
  ladder the count kind's both readings (Palisade's `numberExhausted`).
  Drawn as lines, played by clicks.
- **`fencing`, a partition**: walls between squares, every region of `k`
  squares and each number counting its square's walls, the rim's
  included (Palisade's rules, on a small board); sampled by a divided
  partition. Drawn as walls.

## Risks / Trade-offs

- [Two edge numberings, the space's and `square-edges.ts`'] → the fill
  engine speaks only the space's, and converts at the one call into a
  shared mechanic; a test pins a round trip.
- [A cell game's tile words change shape] → the edge bits are only set on
  an edge answer; every cell fixture's snapshots and fingerprints pin it
  (task 2.1).
- [The drawing grows a fourth kind of side mark] → walls, links and gaps
  already draw on a tile's sides; the edge answer is the same bits under
  another source, not a new layer, where it can be.
