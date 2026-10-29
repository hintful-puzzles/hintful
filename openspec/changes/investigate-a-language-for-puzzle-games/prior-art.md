# The prior art, read whole

Step 1 of `tasks.md`, read 2026-10-29 from primary sources: papers in full,
documentation, and the source repositories, cloned and read. Where a claim
rests on a secondary source it says so. `design.md` § "Prior art" is the
table this corrects; it now points here.

## The works, corrected

| Work | What it describes | What it leaves out | Correction to the first table |
| --- | --- | --- | --- |
| PuzzleScript (Lavelle, 2013) | Movement puzzles as one-dimensional rewrite rules over a tile grid, each rule group run to exhaustion in file order; five forms of win condition (`No X`, `Some X`, `All X on Y`, `Some X on Y`, `No X on Y`) | Solving, candidates, uniqueness, deduction; its documentation lists counting and diagonals as hard | None to the summary. A deduction puzzle's **check** can be written, connectivity included, as a flood-fill rule group |
| Ludii (Browne, Piette and others) | Games as ludeme trees. A deduction puzzle is a CSP state with a **candidate bitset per variable**; its moves are Set and Toggle a candidate, so pencil marks are built in | Named techniques, tiers, explanations; region size and shape checks are unfinished in the public tree | The XCSP route was **proposed and prototyped** on 6 puzzles in the 2019 paper; the public repository has **no XCSP code**. The "2024 thesis" is a master's thesis (Accou, UCLouvain, supervised by Piette), whose own Kurodoko omits "clear cells connected" and whose Masyu allows several loops. Ludii's puzzles do use options, to carry the instance (`Challenge`), not variants |
| Maeda and Inoue, 2025 | Pencil-puzzle rules as mathematics: elements, relations, composed structures, domains, constraints, hidden values | Instance solving, clue generation, any test that a uniquely solvable instance exists; square grids only | **10 of 46** rules confirmed (about 22%), as sufficient conditions. They **did** build a completed-board generator per rule, to check the formalization |
| Demystify (Espasa, Gent, Hoffmann, Jefferson, Lynch, 2021) | Puzzles in **Essence Prime**; each step explained by a small unsatisfiable subset (MUS) of named constraints and earlier facts, with English templates | Named techniques and tiers. MUS size is called a **proxy** for difficulty, left as future work. The authors say cycle and connectivity puzzles are **explained poorly** | The encoding is tuned so that MUS size tracks tutorial techniques; steps matched tutorials 89% on average, which is agreement with tutorials, not with players. A Rust successor, demystify-rs, adds level generation (README only) |
| grilops | A Python library over z3: a symbol per cell, rectangular (holes allowed) and hex lattices, helpers for paths, loops, regions, shapes and sightlines; `is_unique()` | Steps, explanations, difficulty; any other tiling; variables on edges except through a dual lattice | None |
| ASP encodings (Çaylı and others, 2007) | Nurikabe, Heyawake, Masyu and Bag/Corral as logic programs | Steps; uniqueness is outside the program | Connectedness and the single loop are **easy to write and costly to solve**: up to 861,656 loop formulas, several 15×15 boards unsolved in 2,800 s. Sokoban is a standard ASP planning benchmark with a fixed horizon, so it is not a clean failure for ASP |
| pzprjs, cspuz, cspuz_rs | pzprjs is a **player and checker**: per genre, an ordered list of named checks with localized errors. cspuz (Python) and cspuz_rs (Rust, about 173 genres) are modeling libraries over a SAT-based solver with graph primitives (connected, single cycle, division into connected groups) on any graph; `solve()` returns the facts true in every solution | A move model; techniques and tiers as named objects | arXiv 2603.02119 is **Pencil Puzzle Bench**, an LLM benchmark built on pzprjs's `check()`, not a work on describing rules. cspuz has an undocumented **`Analyzer`** that explains each step by a minimal set of named constraints, Demystify's shape inside a solver library |
| Ludi (Browne, 2008 thesis; 2012) | Two-player board games as typed rule trees, evolved by crossover and mutation; a viability test (completion, balance, first-move advantage, duration) did the filtering, 19 viable of 1,389; quality a linear model over 57 self-play criteria fitted to 628 paired preferences from about 57 people (r = 0.82, leave-one-out); produced Yavalath | Puzzles, except two criteria for the puzzles a game produces | Browne calls the quality scores measured during evolution "unreliable"; viability, duration above all, was what culled |
| Pelánek, Sudoku difficulty (2014) | A model of human solving; difficulty from step complexity and from the dependency among steps | One genre | The 0.95 correlation is the **best of 13 metrics**, a blend of four including two hand-tuned Sudoku raters, on one dataset; the expert dataset gives 0.84, the general model 0.88 and 0.74. Puzzles solvable by singles alone differ more than twofold in solve time, so **a tier as a set of techniques misses difficulty within the tier**. Constraint relaxation transferred to Nurikabe (r = 0.9) better than the solving model (0.8) |

## Found, and added

The two works `design.md` named as not found, and those the reading turned
up that bear on the language.

| Work | What it offers | Its limit |
| --- | --- | --- |
| Browne, "Deductive search for logic puzzles" (CIG 2013) | Solving by propagation with 0, 1 or 2 levels of nested lookahead; a step's cost weighted by (depth + 1)². § IV: a player's technique is an extra derived constraint that **saves a level of embedding**, and switching constraints off finds boards that need more strategies | No user study; checked against publishers' orderings only |
| Lantz, Isaksen, Jaffe, Nealen, Togelius, "Depth in Strategic Games" (2017) | Depth is the number of steps on a **strategy ladder**: the best strategy at each level of resources, in a declared strategy language. Shallow games are "one weird trick" or pure search | Two-player games; no game measured; venue (an AAAI 2017 workshop) not confirmed from the PDF |
| Butler, Torlak and Popović (FDG 2017) | Nonogram techniques as programs in a typed condition-action language; an SMT solver **checks each sound**; a cost over the syntax prices it; techniques learned by synthesis recovered 9 of 14 documented strategies | One genre, rules over one line, no tiers |
| Bogaerts, Gamba and Guns (2021), and a 2025 follow-up | A step is the facts used, the constraints used and the facts derived, with a cost; the follow-up learns the cost from players' paired preferences | How step costs make a puzzle's difficulty is left open; the 2020 ECAI paper Demystify builds on was not read |
| HoDoKu's rating | A puzzle's level is at least its hardest technique's, overridden by a summed score when the score is high; the order of techniques changes both the rating and the technique a hint names | One genre |
| puzz.link's genre list | Groups genres by what the player produces: shading, loop, connecting, dividing into areas, numbers. **A cut by answer shape**, which `taxonomy.md` said no work makes | A list, not a theory |
| Variations Forever (Smith and Mateas), Yavalath | On and off mechanic flags, and subgenres defined by how a game is won; Yavalath's "N but not N−1" became a family | Read secondhand |

Not read in full, still: Batenburg and Kosters on nonogram difficulty,
Isaksen 2015, Variations Forever itself, Sudoku Explainer's documentation,
demystify-rs beyond its README, the puzzle_check repository, and Bogaerts and
others 2020. No Nikoli genre classification was found.

## What the reading changes

- **The deduction side has a language for one genre, and explained steps
  for any.** Butler and others have techniques as checked programs for
  Nonograms. Demystify and cspuz's Analyzer explain any constraint model's
  steps by minimal sets of named rules. What nobody has is **named techniques
  with tiers across many genres**, and both explainers are weakest on
  connectivity, loops and regions, where this collection's games are hardest.
- **A technique carries three things** in the prior art taken together: a
  pattern (Butler), a soundness proof (Demystify's MUS, Butler's SMT check),
  and a price (syntactic size, the lookahead it saves in Browne's sense, the
  refutation it replaces in Pelánek's).
- **A tier as a set of techniques is a partial account of difficulty.**
  Pelánek's dependency source varies within one set. The language keeps the
  tier as the set, as the engine does, and leaves within-tier difficulty to
  a trace measure (experiment A records step counts and premises).
- **Lantz's depth is our ladder.** The strategy language is the technique
  language, a step is a tier with a measurable gain, and Browne's nesting
  depth is the search axis. A technique ladder with its coverage over a
  generator's distribution is a direct instance of Lantz's depth, measured for
  no puzzle genre yet.
- **No work evolves deduction puzzle genres and judges them by their ladder.**
  Ludi's filter was viability, and for a puzzle the counterpart is whether
  well-posed boards can be dealt and solved without search at more than one
  tier (`design.md` question 6).

## The sample games, one per language (task 1.2)

Each language was given the game from the fixed sample that tests it
hardest. One sample ran: grilops's Ascent, solved and found unique, and found
not unique with a given removed. The others are untested: no Savile Row or
clingo was available, and the corrected cspuz run was not made.

| Language | Game | Connectivity | Single loop | Any tiling | Uniqueness | Moves | Techniques, tiers, explanations |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PuzzleScript | Sokoban; Singles | a flood-fill rule group | the same way, verbose | no | no | **yes** | none |
| Ludii | Loopy | `count Groups` | `count Groups` < 2 with degree | the named semiregular tilings; others by an explicit graph (unverified) | no | Set and Toggle a candidate | candidates only |
| Essence Prime | Range | a hidden distance labeling | the same | by given incidence, unused | assumed | none | MUS steps; poor on connectivity |
| grilops | Ascent (ran) | yes | yes | square and hex only | `is_unique()` | none | none |
| ASP (clingo) | Palisade | recursion | recursion | as facts | outside the program | planning with a horizon | none |
| cspuz | Loopy on any tiling | a primitive | a primitive | **yes, the tiling is data** | irrefutable facts | none | the Analyzer's minimal premises |

**PuzzleScript, Sokoban.** The whole move model is one rule; blocking comes
from the collision layer.

```
OBJECTS: Background, Target, Wall, Player, Crate
COLLISIONLAYERS: Background / Target / Player, Wall, Crate
RULES
[ > Player | Crate ] -> [ > Player | > Crate ]
WINCONDITIONS
All Target on Crate
```

Its Singles (not shown) checks that the clear cells are connected by a
flood-fill group seeded from two adjacent cells, one of which Singles always
leaves clear. It states a check, and nothing about solving.

**Ludii, Loopy.** Adapted from the repository's `Slitherlink.lud`; the board
is an option, and the rules never name the tiling.

```
(game "Loopy" (players 1)
  (equipment { (board <Challenge:board> (values Edge (range 0 1)) use:Edge)
               (hints { <Challenge:hints> } Cell) })
  (rules (play (satisfy {
      (forAll Cell (or (= (hint Cell at:(from)) Off)
          (is Count Edge (sites Incident Edge of:Cell at:(from)) (hint Cell at:(from)))))
      (forAll Vertex (or (is Count Edge (sites Incident Edge of:Vertex at:(from)) 0)
                         (is Count Edge (sites Incident Edge of:Vertex at:(from)) 2)))
      (< (count Groups Edge) 2) }))
    (end (if (is Solved) (result P1 Win)))))
```

It admits the empty loop, and how `count Groups` reads an unset variable is
unverified. `(is Unique)` means distinct rows, not one solution.

**Essence Prime with Demystify, Range.** Connectivity needs a hidden
distance labeling from a chosen clear root, so a step that rests on it has
no single named constraint to cite. The connectivity part:

```
$#AUX dist
find dist : matrix indexed by [R, C] of int(0..n*m)
$#CON joined "clear cell ({a[0]},{a[1]}) is joined to the other clear cells"
find joined : matrix indexed by [R, C] of bool
such that
  dist[rootr,rootc] = 0,
  forAll i : R . forAll j : C . (i != rootr \/ j != rootc) -> (joined[i,j] -> (!shaded[i,j] ->
      dist[i,j] > 0 /\
      (  (i > 1 /\ !shaded[i-1,j] /\ dist[i-1,j] = dist[i,j] - 1)
      \/ (i < n /\ !shaded[i+1,j] /\ dist[i+1,j] = dist[i,j] - 1)
      \/ (j > 1 /\ !shaded[i,j-1] /\ dist[i,j-1] = dist[i,j] - 1)
      \/ (j < m /\ !shaded[i,j+1] /\ dist[i,j+1] = dist[i,j] - 1))))
```

The clue's sightline is a sum of conjunctions over prefixes in four
directions; the no-adjacency rule is two pairwise constraints.

**grilops, Ascent** (ran with z3 4.16): diagonal adjacency on a board with a
hole.

```python
sg.solver.add(Distinct(*sg.grid.values()))
for p, v in GIVENS.items():
    sg.solver.add(sg.grid[p] == v)
for p in lattice.points:
    succ = [nb.symbol == sg.grid[p] + 1 for nb in sg.vertex_sharing_neighbors(p)]
    sg.solver.add(Or(sg.grid[p] == n, *succ))
```

**clingo, Palisade.** Regions as a choice of root per cell, connected by
reachability, each of K cells; the clue counts walls with the rim as wall
(which is Palisade's rule).

```
1 { in(X,Y,RX,RY) : cell(RX,RY), (RY,RX) <= (Y,X) } 1 :- cell(X,Y).
root(X,Y) :- in(X,Y,X,Y).
:- in(X,Y,RX,RY), not root(RX,RY).
reach(RX,RY,RX,RY) :- root(RX,RY).
reach(RX,RY,X2,Y2) :- reach(RX,RY,X,Y), adj(X,Y,X2,Y2), in(X2,Y2,RX,RY).
:- in(X,Y,RX,RY), not reach(RX,RY,X,Y).
:- root(RX,RY), k(K), #count { X,Y : in(X,Y,RX,RY) } != K.
wall(X,Y,X2,Y2) :- adj(X,Y,X2,Y2), in(X,Y,A,B), in(X2,Y2,C,D), (A,B) != (C,D).
:- clue(X,Y,N), #count { X2,Y2 : wall(X,Y,X2,Y2) } = Wl,
                #count { X2,Y2 : adj(X,Y,X2,Y2) } = Ad, Wl + 4 - Ad != N.
```

**cspuz, Loopy on any tiling.** The tiling is the instance's data; the rule
never mentions geometry.

```python
solver = Solver()
on = solver.bool_array(len(g))
solver.add_answer_key(on)
graph.active_edges_single_cycle(solver, on, g)
for f, clue in clues.items():
    solver.ensure(count_true([on[e] for e in face_edges[f]]) == clue)
```

**What the samples say for the language.** Every constraint language states
the rules of the five deduction games, and none states a technique.
Connectivity and the single loop are one primitive where the library has one
(cspuz, grilops, Ludii's `count Groups`) and an encoding everywhere else, and
the encoding is what explains badly. Only PuzzleScript and ASP state
Sokoban. Only cspuz and Ludii keep the tiling out of the rules. So
`language.md` takes cspuz's and Ludii's separation of space from rules,
grilops's and cspuz's named connectivity primitives, PuzzleScript's rewrite
rules for movement, and Butler's checked technique as its own deduction
layer.
