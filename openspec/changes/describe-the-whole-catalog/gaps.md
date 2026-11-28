# The remaining groups' gap lists

Read 2026-11-28 at `fd9ed95f9`, one group a reader, each game's TypeScript
and description against `src/engine/fill/`, `src/describe/` and the
schema. Each group's change still reads its own list again against its
tree as its first task (design.md § "What every group does"); this is the
map they start from, so that a capability several groups need is planned
once. *Met* names what does it now; *new* names a capability as a
concept. Lines are each game's non-test TypeScript.

## Shared across groups

What two or more groups need, each to be built once, by the first group
that reaches it, as a concept every later group adopts:

- **Marks on a board that is not a board of numbers**: notes on painted
  values or buttons (Undead, Rome, Magnets, Map), and marks on a sort that
  is not the answer's (Galaxies' arrow, Slant's and Loopy's edge marks,
  Tracks' and Net's cell marks). Today `fill/notes.ts` takes notes on
  `play.numbers` alone, and `describe/fill/cell-only.ts` refuses notes and
  marks on an edge answer.
- **Division samplers**, from `engine/generate/divide.ts`'s primitives:
  merged under a predicate on the answer (Rome), grown from seeds (Map),
  domino tilings (Magnets, Dominosa), free sizes (Filling), no rings
  (Separate), rectangles (Rect), symmetric (Galaxies), and mending until
  the ladder finishes (Palisade).
- **Clues dealt apart from what `means` derives**: at random (Undead's
  mirrors, Crossing's walls), one a part as a permutation (Separate,
  Dominosa, Wordtrail), one a part (Rect, Galaxies).
- **A clue at the board derived from the sample**, drawn as a panel or
  row struck as used (Undead's totals, Crossing's list, Wordtrail's
  words); it would replace Boats' `tally-display.ts`.
- **The square-to-square drag** (`mechanics/line-drawing.ts`): Pearl,
  Tracks, Path, Bridges, Wordtrail, and through cells Signpost and Ascent.
- **Links and moves addressed to two cells or a part**: Magnets' whole
  tile, Map's parts, Dominosa's pairs, Bridges' long links, Signpost's
  links, and the moving pieces' two-cell moves.
- **Clue sites off the cells**: points and the rim (Slant, Tracks,
  Ascent), centers (Galaxies).
- **Washes and highlights that only show**, behind a preference: Rome's
  reach, Crossing's runs, a closed region shaded (Filling, Rect,
  Galaxies), a satisfied clue lit (Bridges, Spokes), a value spotlight
  (Dominosa, Subsets).
- **The fill board on a tiling**, square then any (Pearl, Net, Loopy);
  Cube's tilings are the moving pieces'.
- **The answer kept hidden** in the desc, with probes revealing clues: the
  four of hidden information alone.

**Placement.** The readers would move four games, each group's change
deciding when it starts: Subsets, a value a cell with notes and no
partition, to the candidate notes (`born-candidate-note-family-last`);
Wordtrail, directed lines drawn as Path's, to lines and loops; Net, whose
play turns whole pieces, to moving pieces or last of lines and loops (its
`produces: regions` reads wrong either way); Slant, an answer on cells,
may go to regions. Filling stays in regions for its division.

**What is left, by size** (non-test TypeScript, 2026-11-28): candidate
notes 17,038, and Subsets 2,840; regions 17,323 without Subsets; lines
and loops 36,515; moving pieces about 30,900; hidden information 8,715,
and the 252 of `code-rows.ts`. Of these, the
groups that need a new kind of board (moving pieces' position board,
hidden information's model, Map's space of parts, the tiling board) are
where the engine work is, not the game count.

## The last candidate-note games

None of the five has `play:`, `id:` or `catalog:` yet, and each `deal:` is
prose; each bespoke hint is restated as `says`. 17,038 lines.

- **Undead** (3,353): met sightlines through mirrors (`space.slots`,
  `sight_*`), done marks at slots, the walk with no region, givens only an
  ID carries (`deal.never`), the glyph stream with its last run, the
  sightings as `numbers` with `before`, mirrors dealt first
  (`sample.build.first`). New: totals at the board derived from the sample
  (`derive.ts` refuses a board clue), drawn as a clickable counts row with
  done marks; a clue value drawn at random among those its meaning allows;
  slots written clockwise; deal settings by tier, and a tier graded by a
  rung's passes; a board refused for holding one kind of monster; painted
  values with notes and a pictures-or-letters preference; monster and
  mirror painters.
- **Crossing** (3,923): met notes, `stretch`, the search tier, the walk
  with no region, the bare `S` flag, symmetric boards by variant, menu
  tiers, hint marks. New: a list at the board derived from the sample,
  drawn as a panel struck as used and marked by hints; walls dealt apart
  from the answer, opened until no 2x2 is open; a uniform digit a cell as
  the sample; the wall-run and list segments; typing that advances along
  a run, and a whole number placed from the list; the runs through the
  cursor washed.
- **Rome** (2,871): met the areas as a dealt partition, arrows as a value
  (`to`, `chain`, `home`, `implied`), goals as a dealt clue, the hide, the
  walls segment, the clue stream, notes with no region. New: painted
  values with notes (small arrows); a value chosen by a drag's direction
  or armed by the arrow keys; a build with a fallback value and a cap on
  it; a partition merged on the answer (`mergeNeighbors`, which no deal
  key runs); washes over placed cells behind preferences; arrow and goal
  painters.
- **Magnets** (3,423): met the tiles as a dealt partition with walls,
  counts a line per value in margins with done marks, the `S` flag, a
  tier refused by size, its tier letters. New: a move writing both ends of
  a tile (the partner `4 − d`), cycling on click; notes on a board of
  buttons (`?`); a value's margin split across a line's two ends, the
  derived neutral count never written; a segment of one character a line,
  and a domino segment; a domino tiling with a leftover cell as a divide
  (`laydomino.ts` exists); a build dealing one value first; pole painters;
  1,536 lines of hint restated as `says`.
- **Map** (3,468): met the four-color ladder, given colors, notes with no
  region, `space.cells: n` with `relations: borders: dealt`, `n` as a
  number setting, the search tier. New: a space whose elements are a
  partition's parts, drawn over a grid of quadrant-split squares, with
  input, cursor, mistakes and notes on the parts (`derive.ts` refuses
  relations under a sampled deal); regions grown from seeds apart from the
  answer (`growFromSeeds`); a four-coloring sample (`colorRegions`); a hide
  keeping a color's last given (`keep` reads the clues as dealt, not as
  they stand); the edge-list and parts segments; `n` defaulting to
  `w·h/8`; its display preferences.

**Order:** Undead (painted values with notes, the board clue, a random
clue: the widest shared set), Crossing (the board clue as a list, a clue
dealt apart), Rome (directional input, a partition merged on the answer),
Magnets (whole-part moves, the domino tiling), Map last on both.

## Moving pieces

All fifteen are hand-written, and are exactly the descriptions whose
`freedom` is `transition` (twelve) or `permute` (Sixteen, Netslide,
Twiddle); about 30,900 lines. Met for every one: `moves:` compiled by
`compile-position.ts` into `PositionRules`, the win wave, `input/pointer`,
`hint-gesture`, `hint-finishes`, `game-id/params`.

**Sub-families, one board model each:**

1. *Grid permutation*: Fifteen (1,059), Sixteen (1,732), Twiddle (1,930),
   Netslide (2,783). One value layer, a move a fixed rearrangement.
   Planners met (`slide-planner`, `permutation-planner` with
   `moveEffect`); Fifteen's staged plan is its own, since its gap's move
   depends on the position. Netslide's wires met (`mechanics/wires.ts`);
   its finished grid recovered from the board alone is new.
2. *A tap changes cells*: Flip (1,138), Flood (1,059), Samegame (1,570).
   A tap is the move, on a grid like the fill board's. New: Flip's GF(2)
   solve of presses that commute and undo themselves; Flood's greedy
   look-ahead and par; Samegame's removal with gravity and a deal built
   back from empty (its search met: `finish-search`, `rival-judging`).
3. *A cell to another*: Pegs (1,860), Ballsort (1,847). A move binds a
   source and a target, a drag or a tap then a tap (`target-verb` met).
   New: a full search of reachable positions (Ballsort, and Slide).
4. *Pieces and a mover with walls*: Inertia (2,422), Sokoban (3,028),
   Slide (2,648). One mover (`once`) by direction keys, or pieces over
   several cells. New: run until blocked, a push, a walk then a push as
   one gesture, pieces covering several cells, a two-ended push search.
5. *Free-form*: Cube (2,060; square and triangle tilings, a solid
   rolling), Numgame (1,622; cards, no board), Untangle (4,170; points at
   real coordinates, edges, crossings). Each near a model of its own.

**What the position board needs (all new):** the position as named
layers from `position:`, with what the descriptions already mark (`once`
the mover, `arranged` and `carried` a piece's identity for animation,
`over: faces`, real values); gestures derived from each move's binders as
`play:` modules (one cell a tap; a cell and a neighbor a drag or a
direction key; two cells a tap then a tap; a move binding no cell read
from the cell tapped; a line and an offset edge arrows), legal moves from
`PositionRules.legal`; animation that follows each piece; a move count,
par, losing, and undo by position; `deal:` as named strategies (scramble
from the finished board, play backward, random then filtered by the
planner, a sampler of the game's); `hint:` naming one planner
(`finish-search`, `slide-planner`, `permutation-planner`,
`position-store`, and new: a full search of reachable positions, GF(2)),
its words from `steps:`.

**What the fill engine lends:** settings and the ID
(`engine/fill/params/*`, `game-id.ts`, `segments/`); the frame, palette,
tile and the `surface`, `wash`, `numbers`, `piece` layers and the
`hint-rings` and `labels` sites; `input/{pointer,target-verb,key-map,
hint-gesture,touch-help}` and `play:` split into modules; the step voice
and hint frame. Not the `Edit`, the answer, the ladder or notes: a
planning game has a path through positions, not a deduction.

**Order:** a tap (Flip, Samegame, Flood) proves the layers, gestures from
binders and a planner by name; then permutation (Fifteen, Sixteen,
Twiddle, Netslide) adds animation; then a cell to another (Pegs,
Ballsort); then pieces and a mover (Inertia, Slide with its one-axis
ruleset, Sokoban); then free-form (Numgame, Cube, Untangle), where a new
game would give them family.

**`one-model-for-moving-pieces`, re-planned:** split in two. First the
position board, built as the fill board is (layers, controls from binders,
painters as layers and sites, deal strategies, a planner by name, settings
and ID from `engine/fill`), proved on Flip and Fifteen, not on Slide. Then
its own proposal's pieces as sets of cells with move rules (one axis, run
until blocked, leave at the edge) as a pieces layer and move modules on
that board, with Slide.

## Regions and partitions

All eight hand-written. **Met for the group:** an edge answer dealt,
drawn, played on the half grid and hinted (`fill/board.ts`,
`render/layers/edge-values.ts`, `fill/hint.ts`), the `wall`, `cross` and
`line` painters, `play.values`, `play.hintMarks`; a partition as walls
(`sample.walls.equal`, the `fencing` fixture).

- **Palisade** (1,361): met its walls, its count clue with `region.apart`
  and `region.grow`, its run stream ID, its hide. New: a division mended
  where the ladder stops short (`deal.grow` mends only a dealt partition);
  a stronger ladder at 9x9.
- **Separate** (1,499): met as Palisade, and a clue at every cell. New: a
  division with no region round another; a letter clue dealt one a part
  as a permutation and swapped until the ladder finishes; an ID of one
  letter a cell from `A`.
- **Rect** (4,051): new a division into rectangles (a base tiling, its
  singletons merged, then stretched); a clue placement winnowed to one
  answer; a rectangle drag (outline, erase inside, resize); a finished
  rectangle shaded. To verify: one number a part by `deal.oneIn`, its ID
  as the stream with `apart: _`.
- **Galaxies** (4,344): new clues at centers and half-grid points
  (`space.centers`, refused by the compiler's `universesOf`; drawing,
  deal and a half-grid ID segment); a division grown symmetric about
  dots; a mark on cells pointing at a clue, with a drag from cell to dot
  and back; a closed galaxy shaded.
- **Filling** (1,732): a cell answer with `play.numbers`; only its deal is
  a division. New: a division of free sizes as the answer, each cell its
  part's size; a drag selecting a free run of cells typed into at once
  (`play.select` has only `diagonal`); a size derived from the grid;
  borders where neighbors differ; a finished region shaded. Met: `area.*`
  compiled, though no fill game runs it yet.
- **Dominosa** (2,374): new a domino tiling sampled with the value placed
  inside a part (`sample.walls` paints between parts); a domino painter
  over both squares; barrier marks; numbers dealt as a permutation over
  the pieces; sizes derived from one param; bracketed multi-digit numbers
  in the ID; a value spotlight.
- **Wordtrail** (1,962): new a directed edge (three values) with an arrow
  painter; the square-to-square line drag; clues at the board as lists
  (`words`, `trail`); a deal from the word list; letters dealt from the
  trails laid.
- **Subsets** (2,840): met a given value, candidate notes, clues at edges
  drawn in gaps. New: a horseshoe gap painter; a value shown as a set of
  letters, each played present, absent or unknown; a band of every value
  for ruling out and the spotlight; a fixed 4x4 board; an all-distinct
  sample; upstream's ID.

**Shared new:** division samplers for `sample.walls` (free sizes, no
rings, rectangles, symmetric, dominoes), and mending until the ladder
finishes; clues dealt a part from the sampled answer, not derived from
`means` (Separate, Dominosa, Wordtrail, Rect, Galaxies); edge painters
and edges of more than two values (domino, directed arrow, counts);
drags on an edge answer (line, rectangle, association); marks and notes
on an edge answer, refused today (Galaxies, and Bridges, Slant, Loopy);
clue sites off the cells (centers, board lists); a closed region shaded
(Filling, Rect, Galaxies); a size derived from another (Dominosa,
Filling); a value spotlight (Dominosa, Subsets).

**Order:** Palisade (the base, mending, a stronger ladder), Separate,
Rect, Galaxies, Filling, Dominosa, Wordtrail (a bridge into lines and
loops).

**Misfits:** Subsets is a value a cell with notes and no partition: it
goes with the candidate notes. Wordtrail draws directed lines as Path and
Signpost do: it goes with lines and loops, or last here. Filling stays,
sharing its division with Rect, though not its play. Net's description
says `produces: regions` while the route puts it in lines and loops.

## Lines and loops

All ten hand-written, none with a `play:` block. **Met for the group:** an
answer on edges (`answer.value.sort: edge`) on a square grid, drawn as
halves with crosses, played by clicks, a sweep and the nearest edge
(`fill/edge-target.ts`, `mechanics/border-grid.ts`, `edge-hint.ts`; the
`lacing` fixture); `space.tiling` and wide values for the ladder and the
solver (`solve/square-tiling.ts`, the wide `CellMarks`). But the fill
board is a square grid, its `domainMask` 32 bits, and on an edge answer
`describe/fill/cell-only.ts` refuses notes, `given`, `gaps`, `straight`,
`wrap`, `hexagon`, `links`, `numbers` and `rulesOut`.

- **Pearl** (2,312): new a fill board on the square tiling (it reads
  `faces` and `bent`); the square-to-square line drag
  (`mechanics/line-drawing.ts` adopted); a deal growing a loop.
- **Tracks** (3,486): new given edges on an edge answer; a mark on cells a
  player places on an edge board; `straight` on edges; its rail drag from
  a square with track stays its own; an end count drawn as a stub off the
  rim. Met: counts at line ends (margins).
- **Path** (3,053): new a wall on an edge, fixed on an edge answer; the
  drag that picks up and re-routes a stroke; each stretch between two
  numbers colored. Met: its two rulesets, its numbers as clues (no mask
  limit).
- **Spokes** (2,539): new diagonal edges (`edges: king`), whose two
  diagonals in a square share a midpoint (target, cursor, drawing); a
  satisfied clue lit by preference.
- **Bridges** (3,900): new an edge value that is a count, drawn as
  parallel lines; a link between distant cells spanning every edge
  between (a drag island to island, the crossing rule); its two
  preferences. Met: `cand` derived (`of:`), `variations`.
- **Slant** (3,368): new clues at every point, the rim's included
  (`corners` covers the inner points); a diagonal-stroke painter; marks on
  edges on a cell answer; live errors on a loop through points. Met: the
  cell answer, `play.click: cycle`.
- **Signpost** (2,525): new link play, a drag along a square's arrow that
  sets its value; numbers derived from chains, letters for loose ones; an
  eight-way arrow painter; unlinking. Met: `to:` and `chain()`; its values
  fit the mask (sides capped at 31).
- **Ascent** (5,696): new a wide domain on the fill board (values to w·h);
  numbers typed past 9; a drag placing consecutive numbers; neighbors by
  ruleset (4, 6, 8), the hexagon under one; arrows round the rim. Met:
  number and wall clues, the hexagon store, `variations`.
- **Loopy** (5,419): new a fill board on any tiling (geometry, drawing,
  nearest edge on a polygon, cursor, grid type and grid desc in the ID);
  a loop grown over faces as the deal; marks on angles and on edge pairs.
  Met: the ladder on tilings.
- **Net** (4,217): new a wrapping tiling (torus drawing, scrolling);
  notes on edges; a lock on cells; rotation, one move turning a dealt
  piece and all its edges; a jumbled start; the powered highlight.

**Shared new:** the square-to-square line drag (Pearl, Tracks, Path,
Bridges; Signpost and Ascent through cells; Wordtrail); fixed edges on an
edge answer (Path, Net, Tracks, and the regions group's dealt walls);
marks on a sort that is not the answer's (Net, Slant, Loopy, Tracks); the
fill board on a tiling, square first and then any (Pearl, Net, Loopy);
clues at points and off the rim (Slant, Tracks, Ascent, and Galaxies);
links between cells not side by side and diagonal neighbors (Bridges,
Signpost, Spokes, Ascent, and Dominosa's pairs); a satisfied clue lit
(Bridges, Spokes); a path colored or numbered from its chain (Path,
Signpost, Ascent); a wide domain (Ascent).

**Order:** Pearl (the drag, the square tiling), Tracks, Path, Spokes,
Bridges, Slant (separate, it may go anywhere), Signpost, Ascent, Loopy
(any tiling), Net last.

**Misfits:** Net's play turns whole pieces, a position shown apart from
what is known, as Netslide's and Twiddle's are: it goes with moving
pieces, or last here with a rotation input (its `produces: regions` reads
wrong). Slant's answer is on cells with no line drawn; it is here for its
no-loop rule and could go to regions. Signpost and Ascent are numbered
paths on cells, a pair after the edge games. Bridges' long links and
Dominosa's pairs are one capability, built once.

## Hidden information

Mines (2,681), Blackbox (2,106), Guess (2,427), Wordguess (1,501), with
`engine/mechanics/code-rows.ts` (252) shared by the last two; exactly the
descriptions whose `freedom` is `query`, which nothing reads yet (the
exemptions read the `WorkingRow` Ui fields instead:
`archive/2026-11-20-derive-hidden-answer-exemptions/design.md`). Each
description already states a probe's response as a clue kind (Mines' count
at a cell, Blackbox's laser at a slot, Guess's and Wordguess's score at
the board with fields), so what the player has found out is the clues
revealed so far, and the ladder already reasons over them.

**Met:** clues at a cell, a slot (with `beam`) and the board with fields
(`FieldClue`, Boats' fleet); a two-value board of marks; a board decided
at the first click in the contract and midend (`supersededDesc`,
`docs/mechanics.md` § "A board decided at first click"); `obfuscate.ts`;
`code-rows.ts`'s working row and rule-outs; the word list; the contract's
`timerHolds`, `flashLength` and `reference`; `lose` formulas (planning
only, Inertia).

**New, shared by all four:** the answer kept in the desc and never read by
the ladder, with the fill board's `status`, mistakes and solve comparing
against it (one switch in `engine/fill/answer.ts`); clues that grow by a
probe move, which undo takes back; a deal of a hidden answer (each game's
generator: a deducible layout round the first click, balls in a count
range, a color a slot, a word); a hint whose move is a probe where nothing
is forced.

**New, by game:** Mines: the first click on the fill board, open and
chord input, a death that is undone (deaths in the Ui). Blackbox: firing
at the rim, the reveal that counts wrong verifications. Guess: the
working row on the fill board, scored rows drawn stacked (a site), `lost`
when the rows run out. Wordguess: a word refused, the hard mode, the
reference panel of words that still fit, no mistakes to check.

**Hints:** Mines' is an ordinary ladder over the revealed counts;
Blackbox's a ball or an empty square forced by the rays, else a probe;
Guess's rule-outs from the scores, else a guess; Wordguess has no ladder
(`techniques: []`), only the choice of a probe over the word list.

**Order:** Mines (the core at its simplest), Blackbox (rim probes, a
probe as a hint), Guess (the working row, `lost`), Wordguess (the word
list). Guess may go before Blackbox if its rows prove the cheaper.
