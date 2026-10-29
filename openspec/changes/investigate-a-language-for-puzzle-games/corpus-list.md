# Corpus: 106 puzzle games from outside the collection

Collected 2026-10-29 for the corpus test of `corpus.md` § "The test, fixed
before the corpus was collected". The list was fixed before any puzzle was
described in the language, and the collector did not read the language.
Nothing below is to be dropped for being hard to describe.

## Sources, by kind

| Kind | Source | Used for |
|---|---|---|
| Pencil-puzzle genre list | puzz.link / pzprjs rules (`https://puzz.link/rules.html?<id>`; text from `robx/pzprjs` `src-ui/res/rules.en.yaml`), Janko (`https://www.janko.at/Raetsel/<Name>/index.htm`), Nikoli | families A–F |
| Publisher's list | Janko.at's archive (a publisher of several thousand puzzles), Conceptis/Garam's own site, Brainbashers, ThinkFun (Tip-Over, Lunar Lockout, River Crossing), NYT (Wordle) | Kakurasu, Thermometers, Shinro, Garam, Codeword, Wordle, ThinkFun planning games |
| Planning / movement list | PuzzleScript demo gallery (`https://github.com/increpare/PuzzleScript/tree/master/src/demo`), Hearn & Demaine, *Games, Puzzles, and Computation* (A K Peters, 2009) catalog of planning puzzles, Wikipedia | family J |
| Prior art's corpora | Ludii puzzle category (`https://ludii.games/details.php?keyword=<Name>`), Demystify models (`https://github.com/stacs-cp/demystify/tree/master/eprime`), pzprjs variant list (`https://github.com/robx/pzprjs/blob/master/src/pzpr/variety.js`) | across families |

Rule statements were checked against the cited source's text where the
source states rules (pzprjs's English rules file, Ludii's rules field and
`.lud` source, PuzzleScript game source, Demystify's Essence' model), and
completed from the standard statement where the source's text is terse
(each completion is the genre's ordinary rule, e.g. LITS's "four cells per
region").

## Excluded as possibly in the collection (judgment calls, "if unsure, exclude")

Kakuro and Kakuru (crossing), Suguru/Tectonic, Cojun, Makaro, Number Hive
(Demystify; Tectonic on a hex board) (seismic), Kropki and Minarism
(unequal), Factors (keen), Sujiken, Hoshi, Tridoku, Miracle Sudoku, X-Sums,
Sudoku Mine (solo variants), Arukone and Link-a-Pix (path / Numberlink),
Sym-a-Pix (galaxies), Block-a-Pix (rect), Tic-Tac-Logic (unruly), Klotski
and Rush Hour (slide / sixteen), Merlin's Magic Square (flip with a fixed
pattern), Double Minesweeper (mines), Microban and other plain Sokoban
(sokoban), Peg Solitaire variants (pegs), Same Game / Clickomania
(samegame), Bulls and Cows (guess).

---

## A. Shading (17)

**1. Nurikabe** (Islands in the Stream)
Source: https://puzz.link/rules.html?nurikabe ; https://www.janko.at/Raetsel/Nurikabe/index.htm ; Nikoli.
Rules: Shade some cells of a rectangular grid. (1) Numbered cells are never
shaded. (2) Each orthogonally connected region of unshaded cells contains
exactly one number, and that number equals the region's size in cells.
(3) No 2x2 block of cells is entirely shaded. (4) All shaded cells form one
orthogonally connected area.
Variants: question-mark clues (a region of unknown size); Nuribou, Mochikoro,
Tapa as the source's neighbors.
Nearest: 2 Mochikoro.

**2. Mochikoro** (Mochi Koro)
Source: https://puzz.link/rules.html?mochikoro ; https://www.janko.at/Raetsel/Mochikoro/index.htm
Rules: Shade some cells. (1) Numbered cells are not shaded. (2) Every
orthogonally connected region of unshaded cells is a filled rectangle.
(3) A region contains at most one number; a number equals its region's
size. Regions without a number may have any size. (4) No 2x2 block is
entirely shaded. (5) All unshaded rectangles together form one area that is
connected diagonally (corner-to-corner).
Variants: Mochinyoro (pzprjs `mochinyoro`), which the source lists as a
separate genre.
Nearest: 1 Nurikabe.

**3. Heyawake**
Source: https://puzz.link/rules.html?heyawake ; https://www.janko.at/Raetsel/Heyawake/index.htm ; Nikoli.
Rules: The grid is divided into outlined rooms; some rooms carry a number.
Shade some cells. (1) No two shaded cells are orthogonally adjacent.
(2) A numbered room contains exactly that many shaded cells. (3) No
horizontal or vertical run of consecutive unshaded cells crosses two or more
room borders (that is, spans three or more rooms). (4) All unshaded cells
form one orthogonally connected area.
Variants: Ayeheya (each room's shading is symmetric; pzprjs `ayeheya`),
Heyabon, Heyablock; question-mark rooms.
Nearest: 14 Usoone; collection `singles` (no-adjacent shading with
connectivity).

**4. LITS**
Source: https://puzz.link/rules.html?lits ; https://www.janko.at/Raetsel/LITS/index.htm ; Nikoli.
Rules: The grid is divided into outlined regions, each of at least four
cells. Shade exactly four cells in every region, and those four form one
tetromino (orthogonally connected). (1) No 2x2 block is entirely shaded.
(2) Two tetrominoes of the same shape (L, I, T, S; rotations and
reflections counted as the same) never share an edge across a region
border. (3) All shaded cells form one orthogonally connected area.
Variants: LITSO (O allowed, pzprjs `invlitso` is an inverted relative).
Nearest: 5 Norinori.

**5. Norinori**
Source: https://puzz.link/rules.html?norinori ; https://www.janko.at/Raetsel/Norinori/index.htm
Rules: The grid is divided into outlined regions. Shade some cells.
(1) Each region contains exactly two shaded cells. (2) Every shaded cell is
orthogonally adjacent to exactly one other shaded cell (so shaded cells
form disjoint dominoes, which may straddle a region border).
Variants: none named.
Nearest: 4 LITS; collection `dominosa` (domino placement).

**6. Hinge**
Source: https://puzz.link/rules.html?hinge
Rules: The grid is divided into outlined regions; some regions carry a
number. Shade some cells. (1) Each orthogonally connected group of shaded
cells (a block) is crossed by exactly one straight segment of region border
running through it, and the block is mirror-symmetric across that segment.
(2) A numbered region contains exactly that many shaded cells.
Variants: none named.
Nearest: 3 Heyawake (regions with counts); Chocona (pzprjs `chocona`,
not in the corpus: blocks must be rectangles).

**7. Yin-Yang** (Shiroshiro-kuro)
Source: https://puzz.link/rules.html?yinyang ; https://www.janko.at/Raetsel/Yin-Yang/index.htm
Rules: Place a black or a white circle in every cell; some are given.
(1) All black circles form one orthogonally connected group, and all white
circles form one orthogonally connected group. (2) No 2x2 block is all one
color.
Variants: none named.
Nearest: 1 Nurikabe; collection `unruly` (two-color fill).

**8. Nurimisaki**
Source: https://puzz.link/rules.html?nurimisaki ; https://www.janko.at/Raetsel/Nurimisaki/index.htm
Rules: Shade some cells; circled cells are never shaded. (1) No 2x2 block is
all shaded or all unshaded. (2) A cell is circled if and only if it is
unshaded and orthogonally adjacent to exactly one other unshaded cell (a
"cape"): every cape is circled and every circle is a cape. (3) A number in a
circle equals the number of unshaded cells visible from it in a straight
line in the one open direction, counting itself (vision stops at a shaded
cell or the edge). (4) All unshaded cells form one orthogonally connected
area.
Variants: none named.
Nearest: 9 Cave.

**9. Cave** (Corral, Bag)
Source: https://puzz.link/rules.html?cave ; Nikoli ("Bag").
Rules: Shade some cells; numbered cells are not shaded. (1) Every shaded
cell is connected through shaded cells to the outside of the grid (no
enclosed shaded group). (2) A number equals the count of unshaded cells
visible from it horizontally and vertically, counting itself, vision
stopping at a shaded cell or the edge. (3) All unshaded cells form one
orthogonally connected area (so the unshaded cells are the inside of one
loop drawn along the grid lines).
Variants: question-mark clues.
Nearest: collection `range` (Kurodoko: the same visibility count).

**10. Tapa**
Source: https://puzz.link/rules.html?tapa ; https://www.janko.at/Raetsel/Tapa/index.htm
Rules: Shade some cells; clue cells are not shaded. (1) A clue cell holds
one or more numbers: they are the lengths of the maximal runs of consecutive
shaded cells in the ring of (up to) eight cells around it, in any order; a
`?` stands for an unknown positive length (a single `?` may be 0). (2) No
2x2 block is entirely shaded. (3) All shaded cells form one orthogonally
connected area.
Variants: the source names many Tapa variants (Tapa-Like Loop
`tapaloop`, Tapa with a different no-2x2 rule); Tapa-Like Loop is a loop
puzzle with Tapa clues.
Nearest: collection `mosaic` (neighborhood counts), 1 Nurikabe.

**11. Aquarium**
Source: https://puzz.link/rules.html?aquarium
Rules: The grid is divided into outlined tanks and viewed from the side.
Fill some cells with water (shade them). (1) A number outside the grid
gives the count of filled cells in that row or column. (2) Within a tank,
water obeys gravity: a filled cell has a filled cell or a tank floor (border
or grid edge) beneath it. (3) Within one connected body of water in a tank,
the surface is level: every cell of the tank at or below the water level of
that body, and connected to it within the tank, is filled (U-shaped tanks
fill to the same height in both arms).
Variants: none named.
Nearest: 12 Thermometers.

**12. Thermometers** (Thermometer)
Source: https://www.janko.at/Raetsel/Thermometer/index.htm ; Demystify `eprime/thermometer.eprime`.
Rules: The grid is covered by thermometers, each a path of cells starting at
a bulb. Fill some cells with mercury. (1) In each thermometer the filled
cells are a prefix of the path starting at the bulb (no gap; a thermometer
may be empty or full). (2) Numbers outside the grid give the count of
filled cells in each row and column.
Variants: thermometers that bend; some row/column counts missing.
Nearest: 11 Aquarium.

**13. Kakurasu**
Source: https://www.janko.at/Raetsel/Kakurasu/index.htm ; Brainbashers ; Demystify `eprime/kakurasu.eprime`.
Rules: An n x n grid; columns are weighted 1..n left to right and rows
1..n top to bottom. Shade some cells. (1) The clue at the end of a row is
the sum of the column weights of that row's shaded cells. (2) The clue at
the end of a column is the sum of the row weights of that column's shaded
cells.
Variants: none named.
Nearest: collection `pattern` (row/column clues on a shading).

**14. Usoone** (Liar One)
Source: https://puzz.link/rules.html?usoone ; https://www.janko.at/Raetsel/Usoone/index.htm
Rules: The grid is divided into regions; some cells hold a number 0..4.
Shade some cells; numbered cells are not shaded. (1) No two shaded cells
are orthogonally adjacent. (2) In every region exactly one number is false:
it does not equal the count of shaded cells among its orthogonal
neighbors; every other number in the region is true. (3) All unshaded
cells form one orthogonally connected area.
Variants: none named.
Nearest: 3 Heyawake; 15 Yajikazu (clues that may lie).

**15. Yajikazu** (Yajirin-Kazu)
Source: https://puzz.link/rules.html?yajikazu
Rules: Some cells hold a number with an arrow. Shade some cells (clue cells
may be shaded). (1) No two shaded cells are orthogonally adjacent. (2) An
unshaded clue is true: its number equals the count of shaded cells in the
arrow's direction to the edge. A shaded clue says nothing (it may be true or
false). (3) All unshaded cells form one orthogonally connected area.
Variants: none named.
Nearest: 18 Yajilin (same clues, different answer shape).

**16. Creek**
Source: https://puzz.link/rules.html?creek ; https://www.janko.at/Raetsel/Creek/index.htm
Rules: Numbers 0..4 sit on grid intersections. Shade some cells. (1) A
number equals how many of the (up to) four cells touching that intersection
are shaded. (2) All unshaded cells form one orthogonally connected area.
Variants: none named.
Nearest: 63 Squaro (the dual: counts in cells of shaded corners).

**17. Stostone**
Source: https://puzz.link/rules.html?stostone ; https://www.janko.at/Raetsel/Stostone/index.htm
Rules: The grid (an even number of rows) is divided into outlined regions;
some carry a number. Shade some cells. (1) Every region contains exactly one
orthogonally connected group of shaded cells (a block). (2) A number gives
the size of its region's block. (3) Shaded cells in different regions are
never orthogonally adjacent. (4) If every block fell straight down without
changing shape, stopping on the floor or another block, the fallen blocks
would exactly fill the bottom half of the grid.
Variants: none named.
Nearest: Shimaguni (pzprjs `shimaguni`, not in the corpus); 60 Dosun-Fuwari (gravity).

## B. Loops and paths (14)

**18. Yajilin** (Arrow Ring)
Source: https://puzz.link/rules.html?yajilin ; https://www.janko.at/Raetsel/Yajilin/index.htm ; Nikoli.
Rules: Some gray cells hold a number with an arrow. Shade some of the
non-clue cells and draw one loop through the centers of all the other
non-clue cells. (1) The loop passes through orthogonally adjacent cells,
never branching or crossing itself. (2) Clue cells are neither shaded nor
on the loop. (3) No two shaded cells are orthogonally adjacent. (4) A
clue's number equals the count of shaded cells in the arrow's direction up
to the edge.
Variants: Yajilin with regions (pzprjs `yajilin-regions`), question-mark
clues.
Nearest: 15 Yajikazu; collection `tracks`.

**19. Castle Wall**
Source: https://puzz.link/rules.html?castle ; https://www.janko.at/Raetsel/Castle-Wall/index.htm
Rules: Some cells are clue cells colored white, black or gray, some with a
number and arrow. Draw one loop through centers of orthogonally adjacent
non-clue cells (not necessarily all of them), never branching or crossing.
(1) Clue cells are not on the loop. (2) White clue cells lie inside the
loop, black ones outside; gray ones either. (3) A number with an arrow
counts the loop segments lying in that direction from the clue: a vertical
arrow counts vertical segments, a horizontal arrow horizontal segments.
(4) The loop does not cross bold borders where given.
Variants: none named.
Nearest: 18 Yajilin.

**20. Country Road**
Source: https://puzz.link/rules.html?country ; https://www.janko.at/Raetsel/Country-Road/index.htm ; Nikoli.
Rules: The grid is divided into countries; some carry a number. Draw one
loop through orthogonally adjacent cells, not branching or crossing.
(1) The loop visits every country exactly once (enters and leaves it once).
(2) A number gives how many cells of its country the loop passes through.
(3) Two orthogonally adjacent cells on opposite sides of a country border
are not both left unvisited.
Variants: Moon or Sun, Onsen and Double Back are the source's relatives.
Nearest: 21 Double Back.

**21. Double Back**
Source: https://puzz.link/rules.html?doubleback ; https://www.janko.at/Raetsel/Double-Back/index.htm
Rules: The grid is divided into regions; some cells are shaded. Draw one
loop through every unshaded cell, never branching or crossing. (1) The loop
does not enter shaded cells. (2) The loop enters each region exactly twice
(visits it in exactly two separate passes).
Variants: none named.
Nearest: 20 Country Road.

**22. Onsen** (Hot Springs)
Source: https://puzz.link/rules.html?onsen
Rules: The grid is divided into rooms; some cells hold a circle, possibly
numbered. Draw several loops through cell centers. (1) Loops do not
branch, cross or touch each other. (2) Every loop passes through exactly
one circle and every circle has a loop. (3) Every room is visited by at
least one loop. (4) A loop enters and leaves any given room at most once.
(5) A loop visits the same number of cells in every room it enters; a
number on its circle gives that count.
Variants: none named.
Nearest: 20 Country Road.

**23. Icebarn**
Source: https://puzz.link/rules.html?icebarn
Rules: Some cells are ice; some cell borders carry arrows; an IN arrow and
an OUT arrow sit on the grid edge. Draw one path from IN to OUT. (1) The
path passes every arrow in the arrow's direction. (2) The path does not
branch; it may cross itself only at right angles on an ice cell, and
otherwise does not overlap. (3) The path goes straight through ice cells
(no turning on ice). (4) Each orthogonally connected group of ice cells (an
icebarn) is visited at least once.
Variants: Icelom and Icelom 2 (pzprjs `icelom`, `icelom2`: numbered
waypoints in order, all non-ice cells visited), Ice Walk.
Nearest: 24 Nagare.

**24. Nagare** (Nagareru-Loop, Wind Loop)
Source: https://puzz.link/rules.html?nagare
Rules: Draw one directed loop through orthogonally adjacent cells, not
branching or crossing, and not entering shaded cells. (1) Black arrows in
unshaded cells: the loop passes through them in the arrow's direction
without turning in that cell. (2) White arrows in shaded cells are fans:
each blows wind in its direction across every cell up to the next shaded
cell. (3) The loop never travels against the wind. (4) When the loop enters
a windy cell it must leave in the wind's direction. (5) A cell blown on by
two opposing fans is not entered.
Variants: none named.
Nearest: 23 Icebarn.

**25. Pipe Link**
Source: https://puzz.link/rules.html?pipelink ; https://www.janko.at/Raetsel/Pipelink/index.htm
Rules: Draw one loop that passes through every cell. (1) The loop may cross
itself at right angles in a cell (straight through on both passes); it may
not turn at a crossing, branch, or otherwise overlap. (2) Some cells show
given pipe pieces (straight, corner or cross); they are used exactly as
shown and get no other lines.
Variants: Pipe Link Returns (pzprjs `pipelinkr`: circles/ice cells force
crossings).
Nearest: 26 Reflect Link.

**26. Reflect Link**
Source: https://puzz.link/rules.html?reflect ; https://www.janko.at/Raetsel/Reflect/index.htm
Rules: Draw one loop through orthogonally adjacent cells. (1) The loop does
not branch or overlap. (2) Cross marks are given at every cell where the
loop crosses itself, and nowhere else may it cross. (3) Every triangle cell
is visited; a triangle turns the loop at a right angle (it enters through a
leg side and leaves through the other leg side). (4) A number in a triangle
is the total count of cells covered by the two straight runs leaving it,
including the triangle's own cell.
Variants: none named.
Nearest: 25 Pipe Link.

**27. Geradeweg**
Source: https://puzz.link/rules.html?geradeweg ; https://www.janko.at/Raetsel/Geradeweg/index.htm
Rules: Some cells hold a circled number. Draw one loop through orthogonally
adjacent cells passing through every circle, not branching or crossing.
(1) Every straight segment of the loop that touches a circle (passes
through it or ends at it) has length equal to the circle's number (in cell
steps). (2) A `?` circle stands for any number.
Variants: none named.
Nearest: 28 Balance Loop; collection `pearl`.

**28. Balance Loop**
Source: https://puzz.link/rules.html?balance ; https://www.janko.at/Raetsel/Balance-Loop/index.htm
Rules: Some cells hold a white or black circle, possibly numbered. Draw one
loop through orthogonally adjacent cells passing through every circle, not
branching or crossing. (1) At a white circle, the two straight segments
leaving it have equal length. (2) At a black circle they have different
lengths. (3) A number on a circle gives the sum of those two lengths.
Variants: none named.
Nearest: 27 Geradeweg; collection `pearl` (black/white circle constraints
on segments).

**29. Slalom**
Source: https://puzz.link/rules.html?slalom
Rules: A circle marks the start; gates are straight lines of cells
(horizontal or vertical) bounded by shaded posts; some posts carry a number.
Draw one directed loop from the circle back to it, through orthogonally
adjacent cells, not branching or crossing, never entering a shaded cell.
(1) Every gate is passed exactly once, crossing it perpendicularly without
turning in the gate cell. (2) A post's number gives the order in which the
gate it belongs to is passed; some gates have no number.
Variants: none named.
Nearest: 24 Nagare (directed loop); Train Stations (pzprjs
`trainstations`, not in the corpus: stations in order).

**30. Myopia**
Source: https://puzz.link/rules.html?myopia
Rules: Draw one loop along grid edges (between dots), not branching or
crossing. Some cells carry one to four arrows. (1) For a clue cell, the
nearest loop edges in the arrowed directions are all at the same distance,
measured along the row or column from the cell. (2) In each direction
without an arrow, the nearest loop edge is farther than that distance, or
there is none.
Variants: none named.
Nearest: collection `loopy` (edge loop).

**31. Kouchoku**
Source: https://puzz.link/rules.html?kouchoku
Rules: Nodes sit at grid points; some carry letters. Draw one loop of
straight line segments between nodes, at any angle. (1) Every node is
visited exactly once and the loop does not branch. (2) Segments may cross
only at a right angle and not at a node. (3) A segment may pass through no
other node. (4) All nodes with the same letter are visited consecutively.
(5) Nodes with different letters are never directly joined: at least one
unlettered node lies between them along the loop.
Variants: none named.
Nearest: 71 One-stroke drawing (geometry of segments); collection
`untangle` (crossing geometry).

## C. Connecting and drawn movement (7)

**32. Ichimaga**
Source: https://puzz.link/rules.html?ichimaga ; https://www.janko.at/Raetsel/Ichimaga/index.htm
Rules: Circles sit in some cells, some numbered. Draw lines along cell
centers between circles. (1) Each line joins two circles and turns at most
once. (2) Lines do not branch, cross or overlap. (3) A number gives how
many lines end at its circle. (4) All circles form one connected network.
Variants: Magnetic Ichimaga (`ichimagam`: two circles with the same number
are never joined), Crossing Ichimaga (`ichimagax`: lines may cross).
Nearest: collection `bridges`.

**33. Hotaru Beam**
Source: https://puzz.link/rules.html?firefly ; https://www.janko.at/Raetsel/Hotaru-Beam/index.htm
Rules: Fireflies are circles; each has a black dot on one side marking where
its path leaves; some carry a number. (1) From every dot, draw a path
through orthogonally adjacent cell centers that ends at a firefly on a side
without a dot (possibly its own firefly). (2) A path never runs directly
from a dot into another dot. (3) Paths do not branch, cross, or pass through
another path or firefly. (4) A number gives how many turns its firefly's
path makes. (5) All fireflies and paths form one connected network.
Variants: none named.
Nearest: 32 Ichimaga.

**34. Herugolf**
Source: https://puzz.link/rules.html?herugolf ; https://www.janko.at/Raetsel/Herugolf/index.htm
Rules: Balls carry numbers; holes are marked H; some cells are water.
Draw each ball's moves into a hole. (1) A ball's first move is a straight
line of exactly its number of cells; each later move is a straight line one
cell shorter than the one before, and it may turn between moves. (2)
Movement lines do not cross or overlap themselves or each other, and do not
pass through any ball's start cell. (3) A ball does not pass over a hole;
it stops exactly in one. (4) Each hole takes at most one ball. (5) A ball
may fly over water but never land on it.
Variants: none named.
Nearest: 35 Yosenabe.

**35. Yosenabe**
Source: https://puzz.link/rules.html?yosenabe ; https://www.janko.at/Raetsel/Yosenabe/index.htm
Rules: Numbered circles (ingredients) and gray regions (pots, some with a
number) are given. Move every circle into a pot. (1) A circle moves in one
straight line horizontally or vertically (no turns), or stays if already
in a pot. (2) Movement lines do not cross or overlap, and do not pass
through another circle's start or end. (3) A pot's number is the sum of the
circles moved into it. (4) A pot without a number receives at least one
circle.
Variants: none named.
Nearest: 36 Kaero; Satogaeri (pzprjs `satogaeri`, not in corpus).

**36. Kaero** (Return Home)
Source: https://puzz.link/rules.html?kaero ; https://www.janko.at/Raetsel/Kaero/index.htm
Rules: The grid is divided into regions; letters sit in some cells. Draw
lines to move some of the letters (a line goes through orthogonally
adjacent cells and may turn). (1) Movement lines do not cross or overlap,
and do not pass through another letter's start or end cell. (2) After
moving, all copies of a letter lie in one region. (3) Different letters lie
in different regions.
Variants: none named.
Nearest: 35 Yosenabe.

**37. Tren**
Source: https://puzz.link/rules.html?tren ; https://www.janko.at/Raetsel/Tren/index.htm
Rules: Some cells hold numbers. Place 1x2 and 1x3 blocks (vehicles) in the
grid without overlap. (1) Every number lies in a block and each block
contains exactly one number. (2) A horizontal block can slide left/right,
a vertical one up/down, within the grid and not through other blocks.
(3) A block's number equals the total number of cells it can slide (sum
over its two directions) with all other blocks fixed.
Variants: none named.
Nearest: collection `slide` (sliding vehicles), here as a static puzzle
about mobility.

**38. Hiroimono** (Goishi Hiroi, Pebble pick-up)
Source: https://puzz.link/rules.html?goishi ; https://www.janko.at/Raetsel/Hiroimono/index.htm
Rules: Stones sit on some cells. Pick up all stones in one sequence. (1)
Start at any stone. (2) Each next stone is in the same row or column as the
current one, and is the first stone remaining in that direction (stones
already picked up are gone and may be passed over). (3) The direction of
travel never reverses (no 180-degree turn); 90-degree turns and going
straight are allowed. The answer numbers the stones in order.
Variants: none named.
Nearest: 102 Neko Puzzle (same move without the no-reversal rule).

## D. Region division (9)

**39. Sashigane**
Source: https://puzz.link/rules.html?sashigane ; https://www.janko.at/Raetsel/Sashigane/index.htm
Rules: Divide the grid into regions of orthogonally connected cells. (1)
Every region is an L shape of width one (two arms of length at least 2,
meeting at a corner cell). (2) A circle lies on the corner of its L; a
number in a circle gives the L's size. (3) An arrow lies at an end of an L
and points toward the corner.
Variants: none named.
Nearest: 41 Lohkous; collection `rect`.

**40. Araf**
Source: https://puzz.link/rules.html?araf ; https://www.janko.at/Raetsel/Araf/index.htm
Rules: Some cells hold numbers. Divide the grid into regions. (1) Every
region contains exactly two numbers. (2) A region's size is strictly
between its two numbers. (3) A `?` is an unknown number.
Variants: none named.
Nearest: collection `filling`.

**41. Lohkous**
Source: https://puzz.link/rules.html?lohkous
Rules: Some cells hold one or more numbers (a clue cell). Divide the grid
into regions. (1) Every region contains exactly one clue cell. (2) Every
drawn line separates two regions (no dead ends). (3) Cut each region into
maximal horizontal runs: each run's length is one of the region's clue
numbers; likewise for vertical runs. (4) Each clue number occurs as the
length of at least one horizontal or vertical run of its region. (5) A `?`
stands for a number not otherwise in that cell.
Variants: none named.
Nearest: 39 Sashigane.

**42. Nawabari**
Source: https://puzz.link/rules.html?nawabari ; https://www.janko.at/Raetsel/Nawabari/index.htm
Rules: Some cells hold numbers 0..4. Divide the grid into rectangles.
(1) Every rectangle contains exactly one number. (2) A number equals how
many of its cell's four edges are rectangle borders (the grid edge counts as
a border).
Variants: none named.
Nearest: collection `rect`.

**43. Tatamibari**
Source: https://puzz.link/rules.html?tatamibari ; https://www.janko.at/Raetsel/Tatamibari/index.htm
Rules: Some cells hold +, | or -. Divide the grid into rectangles. (1) Every
rectangle contains exactly one symbol. (2) + : the rectangle is a square;
| : taller than wide; - : wider than tall. (3) No point is a corner of four
rectangles (no 4-way border crossing).
Variants: none named.
Nearest: collection `rect`; 42 Nawabari.

**44. Symmetry Area**
Source: https://puzz.link/rules.html?symmarea
Rules: Some cells hold numbers. Divide the grid into regions. (1) A number
gives the size of its region; a region may hold any number of equal numbers
or none. (2) Two orthogonally adjacent regions have different sizes. (3)
Every region has 180-degree rotational symmetry about its center.
Variants: none named.
Nearest: collection `filling` (Fillomino: rules 1-2 without 3).

**45. Pentominous**
Source: https://puzz.link/rules.html?pentominous
Rules: Some cells hold pentomino letters (F I L N P T U V W X Y Z). Divide
the grid into pentominoes; each shape may be used any number of times. (1)
Two pentominoes sharing an edge have different shapes (rotations and
reflections the same). (2) A letter gives the shape of the pentomino
containing it.
Variants: Tetrominous (pzprjs `tetrominous`).
Nearest: collection `filling`; 67 Pentomino tiling.

**46. Scrin**
Source: https://puzz.link/rules.html?scrin ; https://www.janko.at/Raetsel/Scrin/index.htm
Rules: Some cells hold circles, some numbered. Place rectangles on the grid.
(1) Rectangles do not overlap or share any edge segment. (2) Every circle is
inside a rectangle, and a rectangle contains at most one circle. (3) A
number gives its rectangle's area. (4) Rectangles touching corner to corner
form a single cycle with no branches: each rectangle touches exactly two
others diagonally, and the cycle covers all rectangles.
Variants: none named.
Nearest: collection `rect`.

**47. Light and Shadow**
Source: https://puzz.link/rules.html?lightshadow
Rules: Some cells are pre-colored black or white and carry a number.
Color every cell black or white. (1) Every orthogonally connected
same-color area contains exactly one number. (2) Given colors stay. (3)
The number equals the size of its area.
Variants: none named.
Nearest: collection `filling`; 7 Yin-Yang.

## E. Number placement and arithmetic (10)

**48. Nanro**
Source: https://puzz.link/rules.html?nanro ; https://www.janko.at/Raetsel/Nanro/index.htm
Rules: The grid is divided into regions. Write a number in some cells (some
given). (1) In every region, each written number equals the count of
written cells in that region (so all numbers in a region are equal). (2)
Every region has at least one written cell. (3) Equal numbers in different
regions are never orthogonally adjacent. (4) No 2x2 block is entirely
written. (5) All written cells form one orthogonally connected area.
Variants: none named.
Nearest: 3 Heyawake-like shading with counts; collection `filling`.

**49. Renban** (Renban-Madoguchi)
Source: https://puzz.link/rules.html?renban ; https://www.janko.at/Raetsel/Renban/index.htm
Rules: The grid is divided into regions. Write a positive number in every
cell. (1) The numbers in a region are a set of consecutive integers, in any
arrangement, each once. (2) For two cells orthogonally adjacent across a
region border, their difference equals the length of the straight border
segment separating those two regions there (the maximal straight run of
shared border containing that edge).
Variants: none named.
Nearest: collection `seismic`.

**50. Sukoro**
Source: https://puzz.link/rules.html?sukoro ; https://www.janko.at/Raetsel/Sukoro/index.htm
Rules: Write a number 1..4 in some cells (some given; some cells may be
marked as empty). (1) Each number equals how many of its orthogonal
neighbors hold numbers. (2) Equal numbers are not orthogonally adjacent.
(3) All numbered cells form one orthogonally connected area.
Variants: Sukoro Room (`sukororoom`).
Nearest: 51 View.

**51. View**
Source: https://puzz.link/rules.html?view ; https://www.janko.at/Raetsel/View/index.htm
Rules: Write a number in some cells (some given). (1) Each number equals
the total count of empty cells visible from it in the four directions,
vision stopping at a numbered cell or the edge. (2) Equal numbers are not
orthogonally adjacent. (3) All numbered cells form one orthogonally
connected area.
Variants: none named.
Nearest: 50 Sukoro; collection `range`.

**52. Doppelblock** (Tents and Sums, Blocked Sums)
Source: https://puzz.link/rules.html?doppelblock ; https://www.janko.at/Raetsel/Doppelblock/index.htm
Rules: An N x N grid. Shade exactly two cells in every row and column, and
write a number 1..N-2 in every other cell. (1) Every row and column contains
each of 1..N-2 exactly once. (2) A clue outside a row or column gives the
sum of the numbers lying between its two shaded cells.
Variants: none named.
Nearest: 53 Japanese Sums; collection `towers` (Latin square with outside
clues).

**53. Japanese Sums**
Source: https://puzz.link/rules.html?japanesesums ; https://www.janko.at/Raetsel/Japanische-Summen/index.htm
Rules: A grid and a digit range 1..k are given. Write a digit in some
cells and shade the rest. (1) No digit repeats in a row or column. (2)
Clues outside a row or column list, in order, the sums of the maximal runs
of consecutive numbered cells in that line; runs are separated by at least
one shaded cell. (3) A `?` is an unknown sum. (4) A line without clues is
unconstrained.
Variants: none named.
Nearest: collection `pattern` (run clues) and `crossing` (sums).

**54. Garam**
Source: https://www.garam.fr/ (the inventor's publisher site) ; Demystify `eprime/garam.eprime`.
Rules: A fixed layout of white cells forms interlocking equations, each with
a given operator (+, -, x) and an equals sign. Write a digit 0..9 in every
white cell (some given). (1) Every horizontal equation reads `a op b = c`
over three cells, c a single digit. (2) Every vertical equation reads
`a op b = cd` over four cells, `cd` a two-digit number whose first digit is
not 0 (in the Demystify layout; the published layout also has three-cell
vertical equations with a one-digit result). (3) Every equation holds,
evaluated left-to-right/top-to-bottom.
Variants: none named.
Nearest: collection `mathrax` (arithmetic between cells), `numgame`.

**55. Magic Square**
Source: https://ludii.games/details.php?keyword=Magic%20Square ; Demystify `eprime/magicsquare.eprime`.
Rules: Fill an n x n grid with 1..n^2, each once (some given). Every row,
every column and both main diagonals sum to the same total n(n^2+1)/2.
Variants: semi-magic (no diagonals), pandiagonal, other orders.
Nearest: 56 Magic Hexagon.

**56. Magic Hexagon**
Source: https://ludii.games/details.php?keyword=Magic%20Hexagon
Rules: A hexagon of 19 cells (side 3). Place 1..19, each once, so that every
straight line of cells in each of the three directions (15 lines of 3, 4
or 5 cells) sums to the same total (38).
Variants: other orders (only order 1 and 3 have solutions with 1..n).
Nearest: 55 Magic Square.

**57. Cryptarithm** (Alphametic)
Source: https://en.wikipedia.org/wiki/Verbal_arithmetic ; Brainbashers (Cryptarithms).
Rules: An arithmetic statement is written with letters, e.g. SEND + MORE =
MONEY. Assign a digit to each letter. (1) Different letters get different
digits, the same letter the same digit. (2) The leading letter of a
multi-digit word is not 0. (3) The statement holds in base 10.
Variants: other bases; multiplication and long-division layouts
("skeleton division", where unknown digits are stars and no letters
repeat); doubly-true alphametics (the words name the numbers).
Nearest: 54 Garam; collection `numgame`.

## F. Object placement, tiling and geometry (11)

**58. Hakoiri** (Hakoiri-masashi)
Source: https://puzz.link/rules.html?hakoiri ; https://www.janko.at/Raetsel/Hakoiri/index.htm
Rules: The grid is divided into regions. Place a circle, triangle or square
in some cells (some given). (1) Each region contains exactly one of each
symbol. (2) Identical symbols are not adjacent orthogonally or
diagonally. (3) All cells with symbols form one orthogonally connected area.
Variants: none named.
Nearest: collection `abcd` (letters with no-touch), `starbattle`.

**59. Toichika**
Source: https://puzz.link/rules.html?toichika ; https://www.janko.at/Raetsel/Toichika/index.htm
Rules: The grid is divided into countries. Place one arrow (up, down, left,
right) in exactly one cell of each country (some given). (1) Every arrow is
paired: it points at an arrow that points back at it along the same line.
(2) The two arrows of a pair are in countries that are not adjacent (share
no border). (3) All cells between a pair's arrows are empty.
Variants: Toichika 2 (`toichika2`).
Nearest: 58 Hakoiri.

**60. Dosun-Fuwari**
Source: https://puzz.link/rules.html?dosufuwa ; https://www.janko.at/Raetsel/Dosun-Fuwari/index.htm
Rules: The grid is divided into regions; some cells are shaded (walls).
Place one balloon and one iron ball in each region, in empty unshaded
cells, at most one per cell. (1) An iron ball not in the bottom row rests on
an iron ball or a shaded cell directly below. (2) A balloon not in the top
row is directly below a balloon or a shaded cell.
Variants: none named.
Nearest: 17 Stostone (gravity).

**61. Kinkonkan**
Source: https://puzz.link/rules.html?kinkonkan ; https://www.janko.at/Raetsel/Kinkonkan/index.htm
Rules: The grid is divided into regions; letters (each used exactly twice)
with numbers sit outside the grid. Place a diagonal mirror (/ or \) in
exactly one cell of each region. (1) A beam shone into the grid from a
letter, reflecting off mirrors, leaves the grid at the other copy of the
same letter. (2) The number beside a letter is how many reflections that
beam makes. (3) Every mirror is hit by at least one beam.
Variants: none named.
Nearest: collection `blackbox` (beams through a grid).

**62. Shakashaka** (Proof of Quilt)
Source: https://puzz.link/rules.html?shakashaka ; https://www.janko.at/Raetsel/Shakashaka/index.htm
Rules: Some cells are black, some with numbers 0..4. In some white cells,
shade a right triangle covering half the cell (one of four orientations).
(1) Every connected white area (unshaded parts, joined across shared edges
and across the triangles' hypotenuses) is a rectangle, either axis-aligned
or rotated 45 degrees. (2) A number on a black cell gives how many of its
orthogonal neighbors hold a triangle.
Variants: none named.
Nearest: collection `slant` (diagonals in cells).

**63. Squaro**
Source: https://ludii.games/details.php?keyword=Squaro
Rules: Circles sit on every grid intersection; some cells hold numbers 0..4.
Color some circles. A number equals how many of its cell's four corner
circles are colored. Cells without numbers are unconstrained.
Variants: none named.
Nearest: 16 Creek (dual: counts on intersections of shaded cells);
collection `mosaic`.

**64. Shinro**
Source: https://en.wikipedia.org/wiki/Shinro (published in Southwest Airlines' Spirit and puzzle magazines).
Rules: An 8x8 grid hides exactly 12 holes. Numbers outside give how many
holes lie in each row and column. Some cells hold an arrow (one of eight
directions); an arrow cell holds no hole, and at least one hole lies in the
arrow's direction (any distance). Find the holes.
Variants: other sizes and hole counts.
Nearest: 12 Thermometers / collection `tents` (placement with row and column
counts).

**65. N-Queens** (Eight Queens)
Source: https://ludii.games/details.php?keyword=N%20Queens
Rules: Place N queens on an N x N chessboard so that no two share a row,
column or diagonal.
Variants: other pieces (N rooks, kings, knights' independence), toroidal
board, some queens given.
Nearest: collection `starbattle` (one per row and column, no touching).

**66. Statue Park**
Source: https://puzz.link/rules.html?statuepark ; https://www.janko.at/Raetsel/Statue-Park/index.htm
Rules: A bank of shapes (e.g. the twelve pentominoes) and a grid with some
black and white circles. Place every bank shape exactly once (rotations and
reflections allowed). (1) No shape outside the bank appears. (2) Two shapes
never share an edge. (3) Every black circle is covered by a shape; no white
circle is. (4) All uncovered cells form one orthogonally connected area.
Variants: other banks (tetrominoes, double sets).
Nearest: 67 Pentomino tiling; collection `boats` (placing a fleet).

**67. Pentomino tiling**
Source: https://en.wikipedia.org/wiki/Pentomino (Hearn & Demaine discuss polyomino packing).
Rules: Cover a given region exactly (no gaps, no overlaps) with the twelve
free pentominoes, each used exactly once; rotations and reflections allowed.
The standard regions are rectangles 6x10, 5x12, 4x15 and 3x20, and the 8x8
board with a central 2x2 hole.
Variants: other polyomino sets; one-sided pieces (no reflection); 3D
(pentacubes, Soma cube).
Nearest: 66 Statue Park; 45 Pentominous.

**68. Tangram**
Source: https://en.wikipedia.org/wiki/Tangram
Rules: Seven flat pieces cut from a square: two large right isosceles
triangles, one medium, two small, one square and one parallelogram. Place
all seven, rotated and (the parallelogram) flipped freely at any position
in the plane, without overlap, so that their union is exactly a given
silhouette.
Variants: other dissection sets (Stomachion, Egg of Columbus).
Nearest: 67 Pentomino tiling (but continuous positions and angles).

## G. Graph and tour puzzles (3)

**69. Icosian game** (Hamilton's puzzle)
Source: https://en.wikipedia.org/wiki/Icosian_game
Rules: On the graph of the dodecahedron (20 vertices, 30 edges), find a
cycle along edges that visits every vertex exactly once and returns to the
start. In Hamilton's version, the first five vertices of the path are given
and the cycle must extend them.
Variants: open path (Hamiltonian path); other polyhedra.
Nearest: 70 Knight's Tour.

**70. Knight's Tour**
Source: https://ludii.games/details.php?keyword=Knight%27s%20Tour
Rules: A single knight on an N x N (8x8) chessboard moves by chess knight
moves and must land on every square exactly once.
Variants: closed tour (the last square is a knight's move from the first);
other boards; magic knight's tour.
Nearest: 69 Icosian game; collection `signpost` (ordering cells by moves).

**71. One-stroke drawing** (Hitofude-gaki, Euler path)
Source: https://en.wikipedia.org/wiki/Eulerian_path ; Nikoli and children's puzzle books.
Rules: A figure (a plane graph of lines between points) is given. Trace
every line exactly once in one continuous stroke without lifting the pen,
moving only along the lines (points may be revisited).
Variants: the stroke must end where it started; fixed start point;
Seven Bridges of Konigsberg (the instance with no solution).
Nearest: 69 Icosian game (edges vs vertices).

## H. Hidden information and query (3)

**72. Hexcells**
Source: https://store.steampowered.com/app/265890/Hexcells/ ; Matthew Brown's game (Hexcells, Plus, Infinite).
Rules: A board of hexagonal cells, most covered. Each covered cell is either
blue (to be marked) or black (to be uncovered); the player commits a choice
per cell and a wrong choice counts as a mistake. Clues revealed: (1) A black
cell's number counts the blue cells among its up to six neighbors; written
`{n}` the blue neighbors are one contiguous run around the ring, `-n-` they
are not; `?` gives nothing. (2) Some blue cells show a number: the blue
cells within distance 2 (the 18 surrounding cells). (3) Numbers beside the
board on a row of cells count the blue cells along that straight line,
with the same `{n}`/`-n-` marks for contiguous/not contiguous along the
line. (4) A counter shows the total blue cells remaining. Every committed
choice reveals its cell's clue. Levels are designed to be solvable without
guessing.
Variants: Hexcells Infinite (random levels with seeds).
Nearest: collection `mines` and `mosaic`.

**73. Wumpus World**
Source: https://ludii.games/details.php?keyword=Wumpus%20World (after Yob's *Hunt the Wumpus* and Russell & Norvig).
Rules: A grid of rooms holds one wumpus, one or more pits and one room with
gold, hidden from the player. Each turn the player either moves to an
adjacent room or fires the arrow along an orthogonal line; the arrow flies
until it hits a wall or the wumpus, killing it. Entering a pit or a room
with a living wumpus is death. Entering the gold room picks up the gold. In
a room orthogonally adjacent to a pit the player feels a breeze; adjacent
to the wumpus they smell a stench. Win by holding the gold and having killed
the wumpus.
Variants: one arrow vs unlimited; must return to the start to exit (Russell
& Norvig); random layouts.
Nearest: collection `mines` (inference from local percepts), `blackbox`.

**74. Counterfeit coin weighing** (Twelve-coin problem)
Source: https://en.wikipedia.org/wiki/Balance_puzzle
Rules: Twelve coins look identical; exactly one is counterfeit and is either
heavier or lighter than the others (unknown which). With a two-pan balance,
each weighing compares any two disjoint sets of coins and reports left
heavier, right heavier, or balance. Using at most three weighings, where each
weighing may depend on earlier results, determine which coin is counterfeit
and whether it is heavier or lighter. The answer is a strategy (a decision
tree), not a single position.
Variants: 13 coins (identify the coin, not the direction); 3^n coins with
known direction; non-adaptive weighings; an extra known-genuine coin.
Nearest: collection `guess` (adaptive queries with feedback).

## I. Logic grid, verbal logic and word puzzles (6)

**75. Logic grid puzzle** (Zebra puzzle, Einstein's riddle)
Source: Demystify `eprime/pasta.eprime`, `eprime/origin.eprime` (from https://bartbog.github.io/zebra/) ; https://en.wikipedia.org/wiki/Zebra_Puzzle
Rules: There are k categories (e.g. person, sauce, pasta, price), each with
the same n values. Find the matching: a bijection between every pair of
categories, consistent across categories (each person has exactly one
sauce, one pasta, one price, all different between persons). Given clues,
each an English sentence, must all hold. Clue forms seen in the sources:
"X is Y" / "X is not Y"; "X is either Y or Z"; "of X and Y, one is A and the
other is B"; comparisons on an ordered numeric category ("X paid less than
Y", "X is 2 years younger than Y", "X paid $8 more than Y"); in the Zebra
form, positional relations on an ordered category ("X lives next to Y",
"immediately right of").
Variants: Zebra with unnamed values to deduce ("who owns the zebra?");
puzzles where categories have unequal sizes.
Nearest: collection `towers`/`solo` (bijection constraints), as a
non-geometric board.

**76. Knights and Knaves**
Source: Raymond Smullyan, *What Is the Name of This Book?* (1978) ; https://en.wikipedia.org/wiki/Knights_and_Knaves
Rules: Every inhabitant is either a knight, who always tells the truth, or
a knave, who always lies. Each puzzle gives statements made by named
inhabitants (statements may mention other inhabitants' types, counts of
knights, or other statements). Determine each speaker's type: every
statement by a knight is true and every statement by a knave is false.
Variants: normals (who may say anything); spies; "ask one yes/no question"
puzzles where the answer is a question to ask (the two-guards riddle);
Boolos's Hardest Logic Puzzle (random answerers, unknown words for yes/no).
Nearest: 14 Usoone and 15 Yajikazu (truth-valued clues).

**77. Codeword** (Cipher crossword)
Source: https://en.wikipedia.org/wiki/Cipher_crossword ; published daily in UK newspapers.
Rules: A filled crossword grid where every white cell holds a number 1..26
instead of a letter; two or three letters are given. Assign letters to
numbers so that (1) equal numbers are equal letters and different numbers
different letters (a bijection to A..Z, all 26 letters used), and (2) every
across and down entry (maximal run of two or more white cells) spells a
word in the dictionary.
Variants: grids not using every letter.
Nearest: 57 Cryptarithm (letter-digit bijection); 78 Fill-in.

**78. Fill-in** (Kriss Kross, Word fit)
Source: https://en.wikipedia.org/wiki/Fill-In_(puzzle)
Rules: A crossword-shaped grid with no clues and a list of words grouped by
length. Write every word of the list exactly once into the grid's slots
(every maximal across or down run of two or more white cells is a slot),
so that crossing slots agree on the shared letter and every slot gets a
word.
Variants: number fill-ins (digit strings instead of words); one word given
as a start.
Nearest: 77 Codeword; collection `dominosa` (place each listed item once).

**79. Word Ladder** (Doublets)
Source: https://en.wikipedia.org/wiki/Word_ladder (Lewis Carroll, 1877).
Rules: Given a start word and a target word of equal length, find a
sequence from start to target in which each word differs from the previous
in exactly one letter position, and every word is in the dictionary.
Carroll's puzzles ask for the shortest such sequence or one with a given
number of steps.
Variants: allowing letter insertion/deletion or anagramming per step.
Nearest: 81 Tower of Hanoi (state-space path); a word puzzle by its moves.

**80. Wordle**
Source: https://www.nytimes.com/games/wordle/ ; https://en.wikipedia.org/wiki/Wordle
Rules: A hidden answer is a five-letter dictionary word. The player has six
guesses, each a valid five-letter word. Each guess is scored letter by
letter: green if the letter is in the answer at that position; then yellow
for a letter that occurs in the answer at another position, with each
occurrence in the answer accounting for at most one green or yellow (greens
counted first, then yellows left to right); otherwise gray. The player wins
on guessing the answer within six guesses.
Variants: Hard mode (every green must be kept in place and every yellow
reused in later guesses); Absurdle (adversarial answer); Dordle/Quordle
(several answers at once).
Nearest: collection `guess` (Mastermind: the same scoring on colors).

## J. Movement and planning (22)

**81. Tower of Hanoi**
Source: https://ludii.games/details.php?keyword=Tower%20of%20Hanoi ; Hearn & Demaine.
Rules: Three pegs; n discs of distinct sizes start stacked on one peg,
largest at the bottom. A move takes the top disc of one peg and places it
on another peg, never on a smaller disc. Goal: the whole stack on another
given peg. (Minimal solution 2^n - 1 moves.)
Variants: four pegs (Reve's puzzle); cyclic Hanoi (moves only clockwise);
colored / bicolor towers; minimal-move requirement.
Nearest: 79 Word Ladder (pure state-space path).

**82. Lunar Lockout**
Source: ThinkFun Lunar Lockout ; Hearn & Demaine (sliding-until-blocked puzzles).
Rules: A 5x5 board holds a red robot and several helper robots. A move takes
one robot and slides it horizontally or vertically until it stops next to
another robot; a slide with no robot to stop it (it would leave the board)
is not allowed. Goal: the red robot comes to rest on the center square.
Variants: Ricochet Robots (walls inside the board, multi-player).
Nearest: 83 Atomix; collection `inertia` (sliding until blocked).

**83. Atomix**
Source: https://en.wikipedia.org/wiki/Atomix_(video_game) ; Hearn & Demaine (Atomix is PSPACE-complete, Holzer & Schwoon).
Rules: A walled maze holds atoms, each with a type and bond marks. A move
takes one atom and slides it in one of four directions until it hits a wall
or another atom. Goal: arrange the atoms so they form a given molecule
(a given pattern of atom types at relative positions), anywhere in the maze.
Variants: time limit, move-count scoring.
Nearest: 82 Lunar Lockout.

**84. Tip-Over**
Source: ThinkFun TipOver rules ; Hearn & Demaine (TipOver is NP-complete).
Rules: A 6x6 floor holds upright crate stacks of heights 1..4; a tipper
stands on one stack; one height-1 crate is the target. The tipper never
touches the floor. A move is either: (a) walk to an orthogonally adjacent
cell occupied by a crate (upright or tipped); or (b) tip the upright stack
the tipper stands on, of height h >= 2, in a direction: the h cells in that
direction must be on the board and empty; the stack then lies flat over
those h cells, the tipper on it, and the original cell becomes empty floor.
Tipped crates never move again. Goal: the tipper reaches the target crate.
Variants: none named.
Nearest: 85 Plank puzzle.

**85. Plank puzzle** (River Crossing)
Source: ThinkFun River Crossing ; Andrea Gilbert's clickmazes plank puzzles ; Hearn & Demaine (PSPACE-complete).
Rules: Tree stumps stand at grid points of a swamp; planks of given lengths
lie between stumps. The hiker stands on a stump and walks freely along laid
planks to connected stumps. She may pick up a plank that touches her stump
when carrying none, and may lay her carried plank from her stump to another
stump in the same row or column at exactly the plank's length, with no
stump in between and not crossing any laid plank. She carries at most one
plank. Goal: reach the far bank stump.
Variants: none named.
Nearest: 84 Tip-Over.

**86. Wolf, goat and cabbage** (River crossing)
Source: https://en.wikipedia.org/wiki/Wolf,_goat_and_cabbage_problem (Alcuin, 9th c.)
Rules: A farmer, a wolf, a goat and a cabbage are on one bank. The boat
carries the farmer and at most one of the three. The goat may never be left
on a bank with the wolf without the farmer, nor the cabbage with the goat.
Goal: everyone on the other bank.
Variants: Missionaries and cannibals (counts per bank); jealous husbands;
bridge-and-torch (times, an optimization).
Nearest: 81 Tower of Hanoi.

**87. Theseus and the Minotaur**
Source: https://ludii.games/details.php?keyword=Theseus%20and%20the%20Minotaur (Robert Abbott, 1990).
Rules: A grid maze with walls between cells and one exit. Each turn Theseus
moves one cell orthogonally (not through a wall) or waits. Then the
Minotaur takes two steps; for each, if a horizontal step brings it closer to
Theseus and no wall blocks it, it takes it; otherwise if a vertical step
brings it closer and is unblocked, it takes that; otherwise it stays. If the
Minotaur reaches Theseus's cell, Theseus loses. Goal: Theseus reaches the
exit.
Variants: none named.
Nearest: 92 Chase (pursuing robots).

**88. Bloxorz** (Rolling block)
Source: https://en.wikipedia.org/wiki/Bloxorz ; Hearn & Demaine (rolling block puzzles).
Rules: A 1x1x2 block rests on a floor of tiles, standing upright on one
tile or lying on two. A move rolls it 90 degrees over one of its bottom
edges in one of four directions. After each move every tile under the block
must exist (no overhang). Orange tiles cannot bear the block standing
upright. Round switches toggle bridges when any part of the block presses
them; X switches only when it stands on them. Goal: the block stands
upright on the hole.
Variants: split switches dividing the block into two 1x1x1 cubes moved
alternately.
Nearest: collection `cube` (rolling a solid over a grid).

**89. Labirintus**
Source: https://ludii.games/details.php?keyword=Labirintus (Laszlo Nagy).
Rules: A walled 16x20 maze holds two balls. A move picks a direction; every
ball rolls in that direction until it hits a wall or the other ball (in the
Ludii source the chosen ball moves first, then all balls slide in the same
direction). Goal: the two balls exchange their starting positions (each
ball on the other's exit).
Variants: one ball (tilt maze).
Nearest: 82 Lunar Lockout; collection `inertia`.

**90. Insanity** (Madness; Frogs and Toads)
Source: https://ludii.games/details.php?keyword=Insanity
Rules: A row of 10 holes: four red pegs on the left, four blue on the
right, two empty holes between. Red pegs move only rightward, blue only
leftward. A move either steps a peg one hole forward into an empty hole, or
jumps it forward over one adjacent peg (of either color) into the empty
hole beyond. Goal: four blue pegs on the left four holes and four red on the
right four.
Variants: one empty hole (classic Frogs and Toads, jumping only over the
other color); other counts.
Nearest: collection `pegs` (jumps), `sixteen`.

**91. Tchuka Ruma** (Chuka; Tchoukaillon)
Source: https://ludii.games/details.php?keyword=Chuka ; https://ludii.games/details.php?keyword=Tchoukaillon
Rules (Chuka): Five holes in a circle, one of them the Rumba; two counters
in each other hole. A move takes all counters from a chosen non-empty
non-Rumba hole and sows them one per hole in a fixed direction around the
circle. If the last counter lands in an occupied hole other than the Rumba,
pick up that hole's counters and keep sowing. If it lands in the Rumba, the
player then chooses any hole to sow from. If it lands in an empty non-Rumba
hole, the player loses. Goal: all counters in the Rumba.
Variants: Tchoukaillon (holes in a line, sowing towards the Rumba; a move
that ends outside the Rumba in an empty hole loses).
Nearest: collection `pegs` (a solitaire to empty the board).

**92. Chase** (Robots)
Source: https://ludii.games/details.php?keyword=Chase
Rules: A rectangular grid holds the player and several robots at random
positions. Each turn the player moves one cell in any of eight directions
(or teleports to a random cell). Then every robot moves one cell toward the
player along the shortest direction. A robot reaching the player kills
him. Two robots colliding, or a robot entering rubble, become rubble. Goal:
all robots destroyed.
Variants: safe teleports with limited uses; waiting until robots finish.
Nearest: 87 Theseus and the Minotaur.

**93. Shisen-Sho**
Source: https://ludii.games/details.php?keyword=Shisen-Sho
Rules: A rectangular layout of mahjong tiles, each face appearing an even
number of times. A move removes two identical tiles that can be joined by a
path of at most three straight segments (at most two turns) passing only
through empty cells, where the path may run along the empty margin just
outside the layout. Goal: remove all tiles; the game is lost when tiles
remain and no pair can be removed.
Variants: gravity (tiles drop after removals).
Nearest: collection `samegame` (clearing by removal).

**94. 2048**
Source: https://ludii.games/details.php?keyword=2048 ; https://en.wikipedia.org/wiki/2048_(video_game)
Rules: A 4x4 grid of numbered tiles (powers of two). A move picks a
direction: all tiles slide as far as they can that way, and two equal tiles
that meet merge into one tile of their sum (each tile merges at most once
per move, merges resolved from the leading edge). A move that changes
nothing is illegal. After each move a new tile, 2 with probability 0.9 or 4
with 0.1, appears on a uniformly random empty cell. Two tiles start on the
board. Goal: create a 2048 tile; the game is lost when no move is legal.
Variants: endless play for score; other board sizes; Threes (the
PuzzleScript demo `threes.txt`).
Nearest: collection `fifteen`/`sixteen` (sliding the whole board).

**95. Safe Passage**
Source: https://ludii.games/details.php?keyword=Safe%20Passage
Rules: A chess position with a white king and a black king and other
pieces; the solver moves pieces by the rules of chess (both sides). Goal:
the two kings exchange squares. The solver loses if at any point any piece
is able to capture another.
Variants: none named.
Nearest: 96 Chess mate-in-n.

**96. Chess problem: mate in n**
Source: https://ludii.games/details.php?keyword=Chess%20Puzzle
Rules: A legal chess position with White to move. Find a first move such
that, against every legal Black reply, White can continue to deliver
checkmate within n of its own moves (by the full rules of chess, including
castling and en passant rights given by the position).
Variants: selfmate (White forces Black to mate); helpmate (both cooperate);
studies (win or draw against best play).
Nearest: 95 Safe Passage.

**97. Morpion Solitaire** (Join Five)
Source: https://ludii.games/details.php?keyword=Morpion%20Solitaire ; https://en.wikipedia.org/wiki/Join_Five
Rules: On an infinite square grid, 36 dots start in a Greek-cross outline.
A move adds one dot at a grid point so that it completes a line of five
consecutive dotted points horizontally, vertically or diagonally, and
draws that line. In the 5T version a new line may not share a segment with
an existing line in the same direction (sharing one endpoint is allowed);
in 5D lines in the same direction may not even touch. Goal: maximize the
number of moves.
Variants: 5T and 5D as above; 4T, 4D.
Nearest: no close neighbor; an optimization puzzle.

**98. Block Faker**
Source: https://github.com/increpare/PuzzleScript/blob/master/src/demo/blockfaker.txt
Rules: A grid with walls, fixed wall-blocks, grilles, colored blocks
(five colors), the player and an endpoint. The player moves one cell
orthogonally. Moving into a block pushes it, and a pushed block pushes any
block in front of it, as a chain; the move fails if the chain's front is
blocked by a wall, wall-block, grille, endpoint or the player. The player
may pass through grilles; blocks may not. After each move, any three
same-colored blocks in a horizontal or vertical row vanish. Goal: the
player stands on the endpoint.
Variants: none named.
Nearest: collection `sokoban`.

**99. Lime Rick**
Source: https://github.com/increpare/PuzzleScript/blob/master/src/demo/limerick.txt
Rules: Seen from the side: walls, crates, apples, an exit and a lime (the
player's head). Moving left or right into an empty cell moves the head and
leaves a body segment behind in the old cell; moving into a crate pushes it
one cell if the cell beyond is empty. Moving up likewise leaves a segment,
but at most three consecutive upward moves are possible (the count resets
after a sideways move or a fall). Body segments, walls, crates and the
head are obstacles. After each move, if the head is on an apple the apple is
eaten and every body segment disappears; then the head falls while the cell
below is free, leaving segments behind, and crates fall while the cell below
is free. Goal: the head reaches the exit.
Variants: none named.
Nearest: 98 Block Faker; snake games.

**100. Zen Puzzle Garden**
Source: https://github.com/increpare/PuzzleScript/blob/master/src/demo/zenpuzzlegarden.txt (after Lexaloffle's Zen Puzzle Garden).
Rules: A garden of sand cells and rocks, surrounded by walkable border.
The monk moves one cell orthogonally. A sand cell the monk leaves becomes
raked. The monk may not enter a raked sand cell or a rock. Goal: every sand
cell is raked.
Variants: the original game (the monk slides in a straight line until
blocked, and must enter the sand from the border).
Nearest: 70 Knight's Tour / a Hamiltonian-path puzzle by moves; collection
`inertia` (the sliding original).

**101. MazezaM**
Source: https://github.com/increpare/PuzzleScript/blob/master/src/demo/mazezam.txt (after Malcolm Tyrrell's MazezaM).
Rules: A walled grid whose rows hold crates. The player moves one cell
orthogonally. Moving horizontally into a crate shifts every crate in that
row one cell in that direction, allowed only if there is an empty cell at
the far end of the row before the wall. Vertical moves only go into empty
cells. The entrance closes behind the player. Goal: reach the exit.
Variants: none named.
Nearest: collection `netslide` / `sixteen` (shifting a whole row).

**102. Neko Puzzle**
Source: https://github.com/increpare/PuzzleScript/blob/master/src/demo/nekopuzzle.txt
Rules: Fruit lies on some cells; the cat stands on a cell. A move picks a
direction: the cat jumps to the nearest fruit in that direction (at any
distance) and eats it; if there is no fruit that way, the move does nothing.
Goal: no fruit remains.
Variants: none named.
Nearest: 38 Hiroimono (adds the no-reversal rule).

## K. Toggle and permutation puzzles (4)

**103. Lights Out 2000** (three-state Lights Out)
Source: https://en.wikipedia.org/wiki/Lights_Out_(game)#Lights_Out_2000 (Tiger Electronics, 1998).
Rules: A 5x5 grid of lights, each off, red or green. Pressing a light
advances it and each of its orthogonal neighbors one step in the cycle
off -> red -> green -> off. Goal: all lights off.
Variants: Lights Out Deluxe; the 2000's two-state mode is plain Lights
Out (excluded as `flip`).
Nearest: collection `flip`.

**104. Buttons and Lights**
Source: https://ludii.games/details.php?keyword=Buttons%20And%20Lights
Rules: Three lights, all off, and three buttons. Button 1 toggles light 1;
button 2 swaps lights 1 and 2; button 3 swaps lights 2 and 3. Goal: all
three lights on. The game ends when all are on or after 6 presses,
whichever comes first.
Variants: none named.
Nearest: 103 Lights Out 2000; collection `flip`, `twiddle`.

**105. Rubik's Cube**
Source: https://en.wikipedia.org/wiki/Rubik%27s_Cube ; Hearn & Demaine (n x n x n Rubik's cube complexity).
Rules: A 3x3x3 cube of 26 visible cubies, each outer face showing nine
stickers. A move turns one face layer by a quarter turn (90 degrees, either
way; a half turn is two moves or one, by metric). Goal: every face shows a
single color.
Variants: 2x2x2, 4x4x4 and larger (centers have no fixed position);
Megaminx; move-count optimization (God's number).
Nearest: collection `twiddle` (rotating blocks of a grid).

**106. Instant Insanity**
Source: https://en.wikipedia.org/wiki/Instant_Insanity
Rules: Four cubes, each face colored with one of four colors. Stack the
four cubes in a column, each in any of its 24 orientations, so that each of
the column's four long sides shows all four colors (one per cube).
Variants: more cubes and colors (NP-complete in general).
Nearest: 75 Logic grid (a permutation constraint); collection `twiddle`.

---

## Counts

Shading 17, loops and paths 14, connecting and drawn movement 7, region
division 9, number placement and arithmetic 10, object placement, tiling and
geometry 11, graph and tour 3, hidden information and query 3, logic grid,
verbal and word 6, movement and planning 22, toggle and permutation 4:
106 games.

Kinds of freedom spanned, for the describer's sampling check: fixed-answer
grid fills (A, D, E, F), drawn edge sets (B, C, G), placement of a set of
pieces (F), continuous placement (31 Kouchoku, 68 Tangram), adaptive
strategies against hidden state (72-74, 80), adversarial play (95, 96),
chance (92, 94, 73's random layouts), single-agent move sequences (J, K),
and optimization (97, 81's and 105's minimal-move forms).
