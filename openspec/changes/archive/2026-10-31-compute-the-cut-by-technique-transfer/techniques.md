# The techniques the pairs turn on

Tasks 2.1 and 2.2, written 2026-10-29. For each pair of `test.md`, the
techniques stated in the language, where each comes from, and why that many
decides the pair. The code that states each one is
`research/technique-check/`; the name in brackets is its function.

**When each was stated.** Group A's techniques for A1 to A5, A7, A8, A10 and
A14 were stated in code and run in this session before this file was
committed; each is the source's or the corpus write-up's own, or the standard
one for its rule, and each decides its direction by being unsound, which no
later choice could undo. Every other technique below was listed in this file,
and committed, before it was run. That ordering matters only for a direction
the run calls **kept**, which needs the whole list (`test.md` § "The computed
cut").

## Sections

| Section | What it holds |
| --- | --- |
| How a statement reads | the conventions every technique below follows |
| Group A | the corpus's fifteen wrong pairs |
| Group B | the corpus's twenty-four right pairs, all decided by vocabulary |
| Group C | the catalog's variations: entailment, then the stated ladders |
| Group D | the planning rows |

## How a statement reads

- A technique binds elements with `for`, reads the player's marks and the
  clues in its premise, and concludes a fact about the answer. A technique
  that names an element (the cat, a placed star) binds it, so it applies only
  where that element exists.
- A technique **general in** a relation or a parameter the description
  defines (`clash`, `fits`, `k`, an adjacency) reads it by name, and in the
  other game reads that game's definition (`test.md` § "The computed cut",
  vocabulary). It is general in it only where the game's code is: one
  function reading it, with no branch per variant (`rungs.md`).
- A **Search** rung (Solo's forcing chain) is stated as a bounded instance.
  A rung that reads the solver's answer and not the marks (Flip's
  `lastPress`, `fromTheAnswer`) is an oracle step, not a technique, and has
  nothing to keep.

## Group A

| # | Direction | Techniques stated | Source | Why it decides |
| --- | --- | --- | --- | --- |
| A1 | Nurikabe in Mochikoro | `unreachable` [nurikabe_unreachable]: a cell farther from every clue than its island can stretch is shaded | corpus 1 | one unsound technique is enough for "not kept" |
| A1 | Mochikoro in Nurikabe | `rectangle` [mochikoro_rectangle]: three clear cells of a 2x2 make the fourth clear | the rule's own completion | the same |
| A2 | LITS in Norinori | `four` [lits_four]: a region with four cells left not clear has them all shaded | the rule's completion | the same |
| A2 | Norinori in LITS | `pair` [norinori_pair]: a shaded cell with a shaded neighbor has its other neighbors clear | the rule's completion | the same |
| A3 | Heyawake in Hinge | `adjacent` [heyawake_adjacent]: a cell beside a shaded cell is clear | the rule's completion | the same |
| A3 | Hinge in Heyawake | `alone` [hinge_alone]: a cell whose neighbors are all clear is clear | the rule: a block of one cell has no border inside it | the same |
| A4 | Yin-Yang in Unruly | `no2x2` [windows_completion] | the rule's completion | the same |
| A4 | Unruly in Yin-Yang | `threes` [unruly_threes] | experiment C | the same |
| A5 | Range in Cave | `connect`, `adjacency` [range_connect, range_adjacency] | experiment C, Range's rung | the same |
| A5 | Cave in Range | `enclosed` [cave_enclosed]: a cell off the rim with every neighbor clear is clear | the rim rule | the same |
| A6 | both | none run | | vocabulary: Aquarium's techniques read its tanks (a partition), Thermometers' its thermometers (ordered lines); neither space has the other's relation |
| A7 | Stostone in Shimaguni | `column` [stostone_column]: a column holding half its height shaded has its other cells clear | the fall keeps column counts and fills the bottom half | one unsound is enough |
| A7 | Shimaguni in Stostone | `differ` [shimaguni_differ]: a two-cell region beside a region clued 1 is all shaded | the size rule | the same |
| A8 | Pipe Link in Reflect Link | `corner` [pipe_corner]: a square with two edges left takes both | every square is visited | the same |
| A8 | Reflect Link in Pipe Link | none run | | vocabulary: the triangle clue's completion |
| A9 | Neko in Hiroimono | `isolated`: for the cat's cell k and a fruit f, no fruit and not k in f's row or column: lost. `stuck`: for the cat's cell k, no fruit in any of k's four lines and a fruit left: lost | the moves | **kept needs both**; they are every technique stated for Neko (the corpus names none). Checked by exhaustive search, Hiroimono written as moves |
| A9 | Hiroimono in Neko | `noReverse`: the current stone with stones in its reverse direction only, and stones left: lost | the no-reversal rule | one unsound is enough |
| A10 | Sukoro in View | `full` [sukoro_full] | the count rule's completion | one unsound is enough |
| A10 | View in Sukoro | `seen` [view_seen] | the sight rule's completion | the same |
| A11 | Filling in Symmetry Area | none: entailment | | Symmetry Area written as numbers is Filling's description with two lines added (the size clue, a given; `symmetric`), so its rules include Filling's; the rewrite is checked by enumerating both writings' answers |
| A11 | Symmetry Area in Filling | `straightThree`: two neighboring 3s make a third 3 at a right angle to them impossible, since an L of three cells is not its own half-turn image | the symmetry rule | one unsound is enough |
| A12 | both | none run | | vocabulary: Hakoiri's answer is a symbol of three kinds a cell, Star Battle's a star or not |
| A13 | both | none run | | vocabulary: Toichika's answer is an arrow, Hakoiri's a symbol |
| A14 | N-Queens in Star Battle | `diagonal` [nqueens_diagonal]: no queen on a queen's diagonal at any distance | the attack rule | one unsound is enough |
| A14 | Star Battle in N-Queens | none run | | vocabulary: Star Battle's region techniques read regions |
| A15 | both | none run | | vocabulary: Icosian's techniques read edge marks; Knight's Tour's, written as moves, the knight's square, and written as a fill (the rewrite), number marks. A cycle's `twoLeft` (a vertex with two edges left takes both) is stated for the record |

## Group B

Every pair is two games with a clue kind, or an answer sort, that one has and
the other lacks; each game's clue has its completion (`test.md`), and nothing
is run. The difference each turns on, read from `corpus/shading-and-loops.md`
and the collection:

| # | Pair | What one has and the other lacks |
| --- | --- | --- |
| B1 | Heyawake, Usoone | room counts; lying cell numbers |
| B2 | Heyawake, Singles | room counts; a number in every cell |
| B3 | Norinori, Dominosa | a shading; a domino partition with numbers |
| B4 | Yin-Yang, Nurikabe | none; island clues |
| B5 | Nurimisaki, Cave | cape clues; four-way sight clues |
| B6 | Tapa, Mosaic | ring runs; 3x3 counts |
| B7 | Tapa, Nurikabe | ring runs; island clues |
| B8 | Kakurasu, Pattern | weighted line sums; run lists |
| B9 | Usoone, Yajikazu | lying cell numbers; lying arrows |
| B10 | Yajikazu, Yajilin | a shading; a loop with arrows |
| B11 | Creek, Squaro | corner counts on cells; counts on vertices |
| B12 | Stostone, Dosun-Fuwari | a shading with sizes; balloons and weights |
| B13 | Yajilin, Tracks | arrow counts; line counts and an entry |
| B14 | Castle Wall, Yajilin | inside or outside walls; arrows |
| B15 | Country Road, Double Back | room counts; rooms crossed twice |
| B16 | Onsen, Country Road | onsen circles; room counts |
| B17 | Icebarn, Nagare | ice and arrows; wind and flow |
| B18 | Geradeweg, Balance Loop | straight legs; black and white balance |
| B19 | Geradeweg, Pearl | straight legs; pearls |
| B20 | Balance Loop, Pearl | balance; pearls |
| B21 | Slalom, Nagare | gates; wind and flow |
| B22 | Myopia, Loopy | arrows to the nearest line; edge counts |
| B23 | Kouchoku, Untangle | segments between dealt points; points placed in the plane |
| B24 | Kouchoku, One-stroke | lettered points; one stroke over given edges |

## Group C

**By entailment.** Each variation adds a rule or a clue kind in its archived
description, or changes only the deal, so its rules include the plain game's
and every plain technique is kept, with no technique stated. The other
direction loses the added rule's or clue's completion, so the word is a
modifier (one game), or, where only the deal changes, a generator setting
(both directions kept).

| # | Variation | What it adds |
| --- | --- | --- |
| C1 | Solo X | the two diagonals as units |
| C3 | Killer | cages (a clue kind); fewer givens is the deal |
| C6 | Ascent Edges | arrow clues around Classic's grid |
| C10 | Salad Letters | border clues on Numbers |
| C17 | Bridges no loops | acyclic |
| C18 | Bridges most bridges | a lower bound on a pair implies the higher: most-one's answers are most-two's, so most-two's techniques hold under most-one (checked by z3 on the bound) |
| C19 | Unruly unique | distinct rows and columns |
| C20 | Group identity hidden | the deal only |
| C21 | Guess no duplicates | distinct colors |
| C25, C26 | Keen, Mathrax settings | the deal only |
| C27 | ABCD no diagonal | diagonal neighbors differ |

**By vocabulary.** C11 (Unequal's inequality signs, Adjacent's bars, each a
clue kind the other lacks) and C24 (Net's techniques read a tile's turnings,
which Netslide has no move to change; Netslide's slides).

**By stated ladders.** Every rung of `rungs.md`, stated over the description's
relations; each list is the game's whole ladder.

| # | Game | Techniques | Run on |
| --- | --- | --- | --- |
| C2 | Solo, plain and Jigsaw | `hiddenSingle` (a unit), `nakedSingle`, `intersect` (two units), `subset` (sizes 2 to n-2 in a unit), `fish` (rows and columns, size 2), `wing` (XY and XYZ over `sees`), `forcingChain` (bivalue, three links) | 4x4 and 6x6, the blocks as variables |
| C4, C5, C7 | Ascent, Classic, Orthogonal, Hex, and a board shape with a wall | `singlePosition`, `proximity` (k within |m - k| steps of a placed m, by the mode's `dist`), `overlap` (n beside a cell that may hold n - 1 and one that may hold n + 1, by `near`), `deadEnd` (a cell with one open neighbor holds 1 or N), `singleNumber`; the path-link rungs are `deadEnd`'s cases | 3x3 and 4x3 |
| C8, C9 | Star Battle, one star in two and three | `around`, `full`, `exact`, `confined` (one line against the regions inside it), `needed`, `crowded` (look: one unit left without room), `starved` | 5x5 and 6x6 for one star, where two stars fit |
| C12 | Seismic, Tectonic | `nakedSingle`, `strike` (a placed n strikes n from every cell in `clash`), `hiddenSingle` in an area, `starve` (every home of n in an area clashes with c, so c is not n) | 4x4 and 5x4, the areas as variables |
| C13 | Path, Pairs | `forced` (a cell needing k lines with k live edges), `joined` (a line on e would join numbers that do not `fits`), `closed` (a line on e closes a piece), `stuck` (a line on e leaves a neighbor short); `weighed` is these looks over a four-way cell's pairs, sound when they are | 3x3 and 4x3 |
| C14 | Flip, Crosses and Random | `lastChance`, general in the press pattern | 3x3 and 4x3, Random's patterns as variables |
| C15, C16 | Twiddle, rows only, orientation | every library sequence (turns, cycles, tucks, conjugates, twists), each with the cells it leaves finished | 3x3 with 2x2 blocks, by computing each sequence's permutation and turns |
| C22 | Net, wrapping | `side`, `loop`, `sealed`, `neighbor` | 3x3 and 4x3, on a bordered board and a torus |
| C23 | Netslide, wrapping | the search (sound by construction) and the prunes: a tile with no arm, too few arms, and the parity of a slide | every spanning tree of 3x3 and 4x3, bordered and torus; the slide group of 3x3 |

## Group D

| # | Direction | Techniques | Why it decides |
| --- | --- | --- | --- |
| D1 | ball sort in ball sort with the added tube | `noPour`: no legal pour and not sorted: lost. `pourRun`: a run of one color onto a matching top moves the whole run | kept needs both; exhaustive search on 2 colors and 3 colors, capacity 2 and 3, one empty tube |
| D1 | with the tube in plain | `addTube`: stuck with the tube unused, add it | vocabulary: plain ball sort has no such move |
| D2 | Knight's Tour in the closed tour | `deadEnds`: two unvisited squares with no unvisited knight move between them and the rest, neither a move from the knight: lost | kept needs it; exhaustive search on 3x4 and 3x5 |
| D2 | closed tour in Knight's Tour | `noReturn`: the start has no unvisited knight move and squares remain: lost | one unsound is enough |
