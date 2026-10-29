# Experiment B, other half: 22 games written in the language

Written 2026-10-29 over `language.md`, `theory.md` and `taxonomy.md` §§
"Disagreements with the catalog" and "Cases the decomposition could not
place". Sources per game: `help/games/<id>.md`, the "Rules:" requirements of
`openspec/specs/<id>/spec.md`, the `paramConfig` and the `hintRungs` list in
`src/games/<id>/`. The rung lists quoted are the `*_RUNGS` constants as of
this date.

Notation used beyond the samples, each one listed again under "did not fit":
`finish` (Sokoban's block), `requires` (a guard on a move), `:=` assignment
inside `transition` (a move written as act is written), `bound` (a path or
query bound). Where a block says `-- prose:` the language could not say it.

Keys for the per-game "did not fit" lists:

- **L** a library addition, with its definition in the core logic.
- **C** a core change: a block kind, a freedom kind or a move form, or logic
  beyond first-order + counting + aggregates + transitive closure.
- **P** a rule that stays prose.
- **V** a fault in the variation computation (§ "Variations, and the word each
  gets"), which is core too, but kept apart because it touches the catalog,
  not the game.

---

## Partition and coloring games (fill)

### Rect

```pzl
game rect "Rectangles"
family partition
size w, h
space grid(w, h)
answer wall : edge -> bool            # the border is walled
marks mark : edge -> {line, unknown}  # a drawn line; no "open" mark exists
shape forall r in regions_of(edges where wall): rectangle(r)
clue area at cell value 1..w*h
  means |region(at)| = v
rule oneNumber: forall r in regions_of(edges where wall):
  count c in r where c has clue area = 1
freedom fill
deal expansion: the board is built on a smaller grid and stretched
deal tier: Easy | Unreasonable (search tier)

setting expansionFactor { replace deal expansion: rows and columns widened at random by factor f }
setting tier            { replace deal tier: ... }

technique fit tier Easy                       # only one fit
  for cell c with clue v
  premise count R in fits(c) = 1
  conclude forall e in boundary(the R): mark(e) = line
technique overlap tier Easy                   # squares another number is sure to cover
  for cell c with clue, cell c2 with clue, c2 != c, rect R in fits(c2)
  premise forall R2 in fits(c): cells(R2) meets cells_sure(c)  # sure = intersection of c's fits
          and cells(R) meets cells_sure(c)
  conclude R not in fits(c2)               # a fit struck: not a mark the player can make
```

`fits(c)` is the set of rectangles of area `v` that contain `c`, stay on the
board, contain no other clue and cross no drawn line; `cells_sure(c)` is the
intersection of the cells of `fits(c)`.

**Words.** Expansion factor: generator setting (computed) = generator setting
(catalog, a label-tail string; taxonomy "all the rest"). Tier: setting =
setting. w, h: size. **Commute**: fill.

**Did not fit.**

- L `rectangle(r)` := `forall a, b in r: cell(a.x, b.y) in r` and
  `connected(r, adj4)`.
- L `region(c)` := the part of `regions_of(...)` containing `c`.
- L `fits(c)` := `{ R in rects where c in cells(R) and |cells(R)| = v and
  forall c2 in cells(R) - {c}: c2 has no clue and forall e interior to R:
  mark(e) != line }`, with `rects` the derived sort of `(x0, y0, x1, y1)`
  tuples. **Quantifying over a derived sort of tuples** is first-order; it is
  listed because § "Expressions" names only the space's sorts.
- **Markability, not language**: `overlap`, `reach` and `starve` conclude a
  struck fit, and the player has no mark for a fit; the hint carries these
  inside one journey to a line. The language states them; its definition of
  markable (§ "Techniques and tiers") marks them unmarkable, and the game
  narrates them anyway. One sentence is needed in the language: a technique
  may conclude an intermediate, unmarked fact when a chain of them ends in a
  mark (as Rect's `line` rung does).

### Separate

```pzl
game separate "Separate"
family partition
size w, h, k                       # k letters; k divides w*h
space grid(w, h)
answer wall : edge -> bool
marks mark : edge -> {wall, open, unknown}
shape forall r in regions_of(edges where wall): |r| = k and connected(r, adj4)
clue letter at cell value 1..k
  means forall c2 in region(at) - {at}: letter(c2) != v
freedom fill
deal letters: each letter used w*h/k times; tier Easy | Unreasonable

technique sharedLetter tier Easy
  for edge e between cells a, b
  premise letter(a) = letter(b) and mark(e) = unknown
  conclude mark(e) = wall
technique onlyWay tier Easy
  for component R of cells joined by mark = open, |R| < k
  premise count e in boundary(R) where mark(e) = unknown = 1
  conclude mark(the e) = open
```

**Words.** k: size (label tail) = size. Tier: setting = setting. **Commute**: fill.

**Did not fit.** L `region(c)` as in Rect. Nothing else: `regions_of`,
`connected` and counting carry it. That every region holds each letter exactly
once follows from size `k` and the clue's meaning; it is written once.

### Galaxies

```pzl
game galaxies "Galaxies"
family partition
size w, h
space grid(w, h), points = cells + edges + vertices   # each at doubled coordinates
answer owner : cell -> dot              # walls are derived: wall(e) iff owners differ
given dot : dealt points                # where the dots are
marks arrow : cell -> dot or unknown, mark : edge -> {wall, unknown}
shape forall d in dot: connected(cells where owner = d, adj4)
clue dot at point value {dot}
  means forall c: owner(c) = at implies (mirror(c, at) on board and owner(mirror(c, at)) = at)
        and forall c touching at: owner(c) = at
rule noLineThroughDot: forall e touching a dot: not wall(e)    # follows from the clue; kept as the game states it
freedom fill
deal tier: Normal | Unreasonable (search)

technique soleOwner tier Normal               # only one dot could own c
  for cell c, owner unknown
  premise count d in dot where could_own(d, c) = 1
  conclude arrow(c) = the d and arrow(mirror(c, the d)) = the d
technique mirrorWall tier Normal
  for dot d, edge e with mark(e) = wall, e adjacent to a cell owned by d
  conclude mark(mirror(e, d)) = wall
```

`could_own(d, c)` := `mirror(c, d)` is on the board and dot-free, and
`chain` from `d` to `c` through cells no other dot's arrows or dots occupy.

**Words.** Tier: setting = setting. **Commute**: fill.

**Did not fit.**

- L `mirror(x, p)` := the element at `2p - x` in doubled coordinates. This
  needs **every element of `grid` to carry coordinates, edges and vertices
  included**: a change to the `grid` library entry, which today gives
  coordinates only to cells.
- L `points` := `cells + edges + vertices` as one sort for the dot to sit on.
- Techniques read coordinates (`mirror`), so § "Techniques and tiers"'s
  promise that a technique "quantifies over relations, never coordinates" is
  false for this game: a point reflection is not a relation of `grid` unless
  the library adds it as one (`mirror` as a ternary relation would do it).

### Dominosa

```pzl
game dominosa "Dominosa"
family partition
size n                                   # grid (n+2) x (n+1)
space grid(n + 2, n + 1)
given num : cell -> 0..n
answer domino : edge -> bool
marks bar : edge -> {domino, barrier, unknown}
shape perfect_matching(edges where domino)
rule eachOnce: distinct(pair(e) over edges where domino)   # with the count, every pair once
freedom fill
deal tier: Easy | Normal | Hard | Extreme (search)

technique squareOnly tier Easy                 # a square with one neighbor left
  for cell c
  premise count e in edges(c) where bar(e) != barrier = 1
  conclude bar(the e) = domino
technique set tier Hard
  for number m, cells S subset (cells where num = m), dominoes D where |S| = |D|
  premise forall c in S: pairs_open(c) subset D
  conclude forall e open with pair(e) in D, e not touching S: bar(e) = barrier
```

**Words.** n: size (label slot `size`) = size. Tier: setting = setting.
**Commute**: fill.

**Did not fit.**

- L `perfect_matching(E)` := `forall c: count e in edges(c) where e in E = 1`.
- L `pair(e)` := `set(num over ends(e))`, an unordered pair as a value.
  `distinct` over set-valued terms is assumed.
- C (already latent) **set quantification**: `set` quantifies over subsets
  `S` and `D`. Solo's `set` in `language.md` does the same, while §
  "Expressions" states a first-order logic. Monadic second-order quantifiers
  over a bounded family must be added to the stated logic, or both samples
  are outside it. `parity` (an odd region left) is first-order with `chain`.

### Map

```pzl
game map "Map"
family coloring
size w, h, n                          # n regions
space grid(w, h), regions R = dealt partition(cells, n parts),
      radj(r1, r2) := exists edge between a cell of r1 and a cell of r2
answer color : region -> 1..4
given color                            # some regions colored
marks cand : region -> set of 1..4     # the dots
shape forall r1, r2 with radj(r1, r2): color(r1) != color(r2)
freedom fill
deal tier: Easy | Normal | Tricky | Unreasonable

technique onlyColorLeft tier Easy
  for region r
  premise |cand(r) - set(color(r2) over radj(r) where known)| = 1
  conclude color(r) = the color
technique sharedPair tier Normal
  for regions a, b with radj(a, b), region r with radj(r, a) and radj(r, b)
  premise cand(a) = cand(b) and |cand(a)| = 2
  conclude forall k in cand(a): k not in cand(r)
technique weighRegion tier Tricky
  for region m, regions x_k for k in cand(m), region r adjacent to every x_k
  premise forall k in cand(m): cand(x_k) - {k} = {t}
  conclude t not in cand(r)
```

**Words.** w, h, n: size = size. Tier: setting = setting. **Commute**: fill.

**Did not fit.** L `radj` (region adjacency through an edge). Nothing else:
the answer shape is a proper coloring, a first-order rule. `fill` and `clean`
are the mark-all chores, not techniques.

---

## Commuting actions

### Net

```pzl
game net "Net"
family network
size w, h
space grid(w, h)
given tile : cell -> subset of {n, e, s, w}      # the dealt wire shapes
answer orient : cell -> 0..3
marks note : edge -> {wire, none, unknown}, lock : cell -> bool
shape wire(c, d) := rot(tile(c), orient(c)) contains d,
      forall c, d: wire(c, d) implies (step(c, d) on board and wire(step(c, d), opp(d))),
      spanning_tree(links)                         # links: edges both ends wire across
clue barrier at edge value {barrier}
  means not link(at)
freedom act turn(c: cell): orient(c) := orient(c) + 1 mod 4
deal barriers: each edge without a wire in the answer gets a barrier with probability p
deal start: orient random per cell; tier Easy | Unreasonable

modifier wrapping { replace space torus(grid(w, h)) }      # computed: board shape
setting barrierProbability { replace deal barriers: ... p }
setting tier { ... }

technique side tier Easy                       # fit the sides you know
  for cell c, direction d
  premise forall k in 0..3 where fits(c, k): (d in rot(tile(c), k)) = x
  conclude note(side(c, d)) = (x ? wire : none)
technique loop tier Easy
  for cell c, turning k with fits(c, k)
  premise exists d in rot(tile(c), k): closes_cycle(side(c, d), edges where note = wire)
  conclude not fits(c, k)                       # a turning struck
```

`fits(c, k)` := every side of `c` agrees with `note`, walls and locked
neighbors under turning `k`.

**Words.** Wrapping: **board shape** (computed: a space change only) vs
**modifier** (catalog); taxonomy already filed this disagreement. Barrier
probability: setting = setting. Tier: setting = setting. **Commute**: yes,
`turn` on distinct cells commute and on one cell generate Z4; the language
computes "act, commuting".

**Did not fit.**

- L `rot(mask, k)` := `{ (d + k) mod 4 : d in mask }`, directions as 0..3.
- L `step(c, d)`, `opp(d)`, `side(c, d)`: the grid's neighbor by direction,
  so `grid` needs directions as values, not only `adj4` as a set.
- L `links` := edges `e` between `c`, `c2` with `wire(c, dir(c, c2))`.
- `loop`, `sealed` and `neighbor` conclude a struck turning, an unmarked fact
  (as Rect's struck fits); `side` concludes a note, a mark. Same sentence
  needed as in Rect.

### Flip

```pzl
game flip "Flip"
family lights
size w, h
space grid(w, h), toggles : cell -> set of cell
given lit0 : cell -> bool                 # the dealt start
answer press : cell -> 0..1               # the choice; the position is derived
shape lit(d) := lit0(d) xor (count c where d in toggles(c) and press(c) = 1) mod 2,
      forall d: lit(d)
freedom act press(c: cell): for d in toggles(c): lit(d) := not lit(d)
finish forall d: lit(d)
deal start: lit0 = toggles applied to a uniformly random press set, not all lit

ruleset Crosses { replace space toggles(c) = adj4(c) + {c} }
ruleset Random  {
  replace space toggles = dealt relation where
      forall c: c in toggles(c) and toggles(c) subset adj8(c) + {c},
      distinct(toggles(c) over cells)
}

stage reading order                      # the hint's order; a square passed is never pressed again
technique lastPress tier Easy
  for cell i, cell j with last_flipper(j) = i
  premise not lit(j) under the presses decided so far, and every square before i is passed
  conclude press(i) = 1
```

`last_flipper(j)` := the last `c` in reading order with `j in toggles(c)`.
`fromTheAnswer` is a certificate (the fewest presses, over GF(2)), not a
technique; `lastChance` is the last press.

**Words.** Crosses / Random: the computed word **depends on where the toggle
relation is written**. Written in `space`, as above, both contain only space
changes and compute **board shape**; written inside `freedom act` (as
`language.md`'s Flip line writes `adj4(c) + {c}`), they replace a commuting
move set and compute **ruleset**. The catalog says ruleset, and so does
taxonomy. **Commute**: yes, in both, over GF(2).

**Did not fit.**

- L `toggles` as a dealt relation `cell -> set of cell` with a predicate (the
  `dealt ... as` form, used on a relation rather than a partition).
- C **the act block's answer**: the language says nothing about which is the
  answer of an act game: the position (`lit`) or the choice (`press`). Net
  hides it because the choice and the position coincide (orientation is
  both). Flip's techniques read the choice, and the rules read the position.
  Written above with `press` as the answer and `lit` derived, which the core
  can do, but the language must say that a commuting act **induces** a choice
  sort (the exponent of each move modulo its order) and which one a
  technique reads.
- C **a staging policy in a deduction game.** `lastPress` is sound only
  given the policy "a square passed is not pressed again", which no mark
  records. `stage` exists in the language only for planning techniques.
- V **the word is not invariant** under moving a relation from `freedom` to
  `space`. The computation needs a normal form: a relation the moves read and
  the rules do not is either always space or always freedom.

### Untangle

```pzl
game untangle "Untangle"
family drawing
size n                                    # points
space graph(n), dealt planar
answer pos : vertex -> Q x Q within [0, L]^2      # L = COORDLIMIT(n)
shape forall e1, e2 in edges, e1 and e2 share no end: not crosses(pos, e1, e2)
freedom fill                              # place(v, p): pos(v) := p
deal graph: a random planar graph on n vertices; start: points on a circle
```

`crosses` counts collinear overlap and an endpoint on the other segment as a
crossing (spec "Crossing detection is exact").

**Techniques.** None. The hint's `clear`, `rearrange` and `journey` rungs are
names for the output of a heuristic search (the move that removes the most
crossings, or a step toward a known layout). The theory expected this.

**Words.** n: size = size. **Commute**: computed from the effect,
`place(v, p)` is `pos(v) := p`, an overwrite: two places of one point do not
commute and two of different points do. That is **fill**, not the
**commuting action** theory.md's table files Untangle under. The language
disagrees with the theory here, and the language is right: a move that sets
a value is fill whatever the domain.

**Did not fit.**

- C **a domain that is not finite**: `Q x Q` (the spec's rational points,
  whose denominator is the input device's). § "Expressions" says the meaning
  is "finite and computable by enumeration"; here it is not. The shape is
  first-order over an ordered field (decidable, by Tarski), not by
  enumeration.
- L `crosses(pos, e1, e2)` := the orientation determinants of the two
  segments have opposite signs or a zero with overlap: a polynomial inequality
  of degree 2 in the coordinates. Definable once the domain is admitted.
- P no answer is unique, and the theory's "well posed" (§ "The parts")
  assumes one. The language must allow a game whose instances have many
  solutions (Pegs and Inertia too) and say that `findMistakes` is then
  undefined, as the spec says.

---

## Non-commuting actions

### Netslide

```pzl
game netslide "Netslide"
family network
size w, h
space grid(w, h), lines = rows + cols (cyclic), source = cell(w div 2, h div 2),
      ladj = adj4                         # the adjacency a wire link reads
given tile0 : cell -> subset of {n, e, s, w}    # the dealt, scrambled position
answer at : cell -> tile                       # which tile is where; a bijection
shape bijection(at)
clue barrier at edge value {barrier}  means not link(at)
freedom permute generators {
  shift(L, +1) for L in lines where source not in L
}
finish spanning_tree(links over ladj) and every wire end meets another   # Net's shape, orient = 0
deal start: the answer shuffled by m random slides; barriers with probability p

modifier wrapping { replace space ladj = adj4 of torus(grid(w, h)) }  # computed: board shape
setting shuffles  { replace deal start: m = movetarget }
setting barrierProbability { ... }
```

**Techniques.** None: the hint is a bounded search after a matching of tiles
to homes (`NETSLIDE_RUNGS` `frozenLine`, `besideSource`, `working` label a
step's purpose, not a reason).

**Words.** Wrapping: **board shape** (computed) vs **modifier** (catalog),
as taxonomy said. A subtlety the language had to be told: the slides wrap
round in both rulesets; wrapping changes only the adjacency the finish reads,
so the space must carry **two adjacencies**, one for the moves (`lines`,
always cyclic) and one for the links (`ladj`). `torus(space)` as the library
defines it changes both at once and would be wrong. Shuffles, barriers:
setting = setting. **Commute**: no (a row and a column shift do not), so the
language computes a non-abelian permute.

**Did not fit.**

- L `lines (cyclic)`: a line whose order wraps, independent of `torus`.
- L `link`, `rot` from Net (orient fixed at 0).
- Nothing else; the finish is Net's shape read through `at`.

### Fifteen

```pzl
game fifteen "Fifteen"
family tiles in order
size w, h
space grid(w, h)
answer at : cell -> 0..w*h-1             # 0 is the gap; a bijection
given at                                 # the dealt arrangement is the start
freedom transition rules {
  dir in {up, down, left, right}:
    [ gap | t ] -> [ t | gap ]
}
finish forall c: at(c) = (index(c) + 1) mod (w*h)    # reading order, gap last
deal start: uniform over arrangements of the solvable parity
```

**Techniques** (the hint follows upstream's greedy method; `solver.ts`):

```pzl
stage the shorter of (top row left to right, left column top to bottom), tile by tile,
      repeat on the board left, until 3 x 2 remains
technique closer tier Easy
  macro walk the gap round the goal tile, through unfinished cells, to its side toward home;
        [ gap | goal ] -> [ goal | gap ]
  effect the goal is one step nearer home; every finished tile unmoved
technique lineEnd tier Easy
  macro move the line's last tile in under the goal, displacing the goal, then rotate both home
  effect the last two tiles of a line home; every other finished tile unmoved
-- prose: the 3 x 2 endgame is a 120-entry move table (upstream's next_move_3x2)
```

**Words.** w, h: size = size. **Commute**: no.

**Did not fit.**

- C **the kind the language computes is not the theory's.** The moves are
  invertible (each rule's reverse is the rule for the opposite direction), so
  theory.md files Fifteen as a non-commuting action with Sixteen and Twiddle.
  But a move here is relative to where the gap is, so it is not a fixed
  permutation of cells, and the `permute generators { ... }` form cannot hold
  it; it must be written as `transition`, which the language files with
  Sokoban. The kind must be computed from the rules (are all rules invertible?
  then a groupoid action, a non-commuting action) rather than read off the
  block keyword.
- P the 3 × 2 endgame is a lookup table, which is neither a macro with an
  effect nor a staging policy.
- P the deal's "solvable parity" is definable (L `parity(at)` := `count
  pairs a < b with at(a) > at(b), both tiles, mod 2`, with the gap's
  chessboard color), so it is an L, not a P; listed so the parity is not
  mistaken for a rule.

### Sixteen

```pzl
game sixteen "Sixteen"
family tiles in order
size w, h
space grid(w, h), lines = rows + cols (cyclic)
answer at : cell -> 1..w*h               # a bijection
given at
freedom permute generators { shift(L, +1), shift(L, -1) for L in lines }
finish forall c: at(c) = index(c) + 1
deal start: m = 0: a random arrangement; else m random slides from finished

setting shuffles { replace deal start: m = movetarget }
```

**Techniques.** None: a tile-by-tile search with a measure (travel plus
tangles); `home` and `settingUp` label what a move is for. The theory
expected this.

**Words.** Shuffles: setting = setting (label tail). **Commute**: no.

**Did not fit.** Nothing. (The move "slide by k" is `shift(L, +1)^k`; the
move counter counting a slide once is a path cost, not a rule.)

### Twiddle

```pzl
game twiddle "Twiddle"
family tiles in order
size w, h, n                              # n x n blocks
space grid(w, h), blocks = { the n x n square at (x, y) : x <= w-n, y <= h-n }
answer at : cell -> tile, label : tile -> 1..w*h (given)
given at
freedom permute generators {
  turn(b, cw) for b in blocks: at(c) := at(rot90(c, center(b))) for c in b
  turn(b, ccw) = turn(b, cw)^-1
}
finish forall c1 before c2 in reading order: label(at(c1)) <= label(at(c2))
deal start: m random turns from finished (0 = a long shuffle)

modifier rowsOnly   { replace given label(t) = row(home(t)) + 1 }   # computed: see below
modifier orientable {
  replace answer at : cell -> tile x 0..3
  replace freedom turn(b, cw): at(c) := (at(rot90(c, center(b))).tile, .turn + 1 mod 4)
  add finish forall c: at(c).turn = 0
}
setting shuffles { replace deal start: m = movetarget }
```

**Techniques** (the help names them; `engine/permutation-planner.ts`):

```pzl
stage reading order
technique tuck tier Easy
  macro turn(b1), turn(b2), turn(b1)^-1
  effect moves one tile into the space b1 lifted; every finished tile returns
technique cycle tier Easy
  macro turn(b1), turn(b2), turn(b1)^-1, turn(b2)^-1        # a commutator
  effect where b1, b2 share one cell, exactly three tiles go round
technique liningUp tier Easy
  macro x, M, x^-1                                         # a conjugate of a macro M
  effect M applied to the tiles x brought in; every other tile x moved returns
technique swap tier Easy                                   # n = 2 or n odd
  macro turn(b), cycle inside b
  effect two tiles exchanged
technique smallCycles tier Easy                            # n = 4
  macro cycle1, cycle2, cycle1^-1, cycle2^-1
technique twist tier Easy                                  # orientable
  macro P, Q^-1 where P, Q move the same tiles the same way by two routes
  effect the tiles return, turned
```

The macros state cleanly: each is a word in the generators with an effect
predicate over `at`, as `language.md` expected.

**Words.**

- **n (block size)**: the language computes **size** (a `size` change), the
  catalog says size. But the theory says a non-commuting freedom's kind is its
  generators, and `n` changes the generators: the techniques differ by `n`
  (`swap` for 2 and odd, `smallCycles` for 4). So the language's table and
  the theory's cut disagree with each other. Either a parametric family of
  generators is one kind (then the theory's test must say "up to the size
  parameters"), or every `n` is its own game. w and h raise the same question
  for Fifteen and Sixteen, and there nobody would call a 4×4 a separate game.
- **rowsOnly**: computed by what the block contains. It replaces a given
  (the tile labels): the table has no row for a replaced given of a
  planning game. Read as "replace answer domain" (the labels' range shrinks to
  1..h) it is **ruleset**; read as a change to the dealt start it would be a
  setting, which is wrong because it changes which positions finish. The
  catalog and taxonomy say **modifier**. Disagrees.
- **orientable**: replaces the answer domain, replaces the generators' action
  and adds a finish conjunct. The table's last row ("replace freedom to other
  generators") makes it **a separate game**; taxonomy said **ruleset**
  (shares 4 of 4 rungs), the catalog **modifier**. The generators are the
  same block turns acting on a richer position, so the language needs a
  notion of **the same generators, extended action** to reach the taxonomy's
  answer. Disagrees with both.
- Shuffles: setting = setting. **Commute**: no.

**Did not fit.**

- L `rot90(c, p)` := the cell at `p + (p.y - c.y, c.x - p.x)` in doubled
  coordinates (as Galaxies' `mirror`).
- L `blocks` as a derived sort of squares.
- V `finish` is missing from the variation table (a planning game's goal
  is its finish, not a `rule`), and so is a replaced given.
- V a size parameter that enters the generators (n here).
- V "same generators, extended action" (orientable).

---

## Transition systems

### Cube

```pzl
game cube "Cube"
family position
size d1, d2
space arena = grid(d1, d2) if solid = cube else triangle_patch(d1, d2)
solid S = solid(type)                        # faces F, orientations O, roll : O x dir -> O
answer pos : cell, o : O, fpaint : F -> bool, spaint : cell -> bool
given pos, o, spaint; fpaint = none          # start on an unpainted square
freedom transition moves {
  roll(d in dirs(pos)):
    requires step(pos, d) on arena
    pos := step(pos, d); o := roll(o, d)
    unless forall f: fpaint(f):
      swap fpaint(bottom(o)) with spaint(pos)          # read after the update
}
finish forall f in F: fpaint(f)
deal spaint: |F| squares painted; tier none

board shape solid { replace space ..., replace solid ... }   # type: tetra | cube | octa | icosa
```

**Techniques.** None the theory can compare: the hint is a shortest search
(an exact one on cube and tetrahedron), and `collect`, `travel`,
`come-round`, `forced-drop`, `drop` label what a roll is for. `forced-drop`
is close to a stated fact ("no square can be picked up without putting paint
down first"), which is a one-step lookahead over positions, not a deduction.

**Words.** Solid type: the block changes the space (squares for the cube,
triangles for the rest), the answer's domain (|F| and O) and the moves'
effect (the roll table). By the table that is "replace freedom to other
generators": **a separate game** per solid. The catalog (label slot `kind`)
and the taxonomy say **board shape**. Disagrees. d1, d2: size. **Commute**:
no.

**Did not fit.**

- C **a move as guarded assignment.** A roll cannot be a rewrite pattern of
  adjacent elements: the solid's faces and orientation are not cells, and the
  paint swap touches a face and a square. The `transition` block needs the
  form `act` already has (`requires`, then simultaneous `:=`), without the
  commuting claim. One change; Inertia, Slide, Flood, Same Game and Numgame
  need it too.
- L `solid(type)` := faces `F`, the rotation group `O` of the solid, `bottom
  : O -> F` and `roll : O x dir -> O`. In the core logic this is **an
  enumerated table** (12, 24, 24 and 60 orientations for the tetrahedron, cube,
  octahedron and icosahedron); the 3D geometry it is
  read from is not stated. Counted as a library addition by table.
- L `triangle_patch(d1, d2)` and `dirs(c)`: the directions a solid can roll
  from a triangle depend on whether it points up or down, which a tiling from
  `src/engine/grid/` provides.

### Pegs

```pzl
game pegs "Pegs"
family position
size w, h
space board = cross(w, h) | octagon | dealt holes
answer peg : hole -> bool
given peg
freedom transition rules {
  dir in {up, down, left, right}:
    [ peg | peg | hole ] -> [ hole | hole | peg ]
}
finish count h where peg(h) = 1
deal Cross: every hole a peg but the center; Octagon: a fixed off-center hole
-- prose: Random is built by playing jumps backwards from one peg, touching all four edges

board shape Cross   { replace space board = cross(w, h) }
board shape Octagon { replace space board = octagon(7) }
board shape Random  { replace space board = dealt holes }   # with the deal above
```

**Techniques.**

```pzl
technique trap tier Easy                     # a cut-off peg: the game can never end with one
  for hole p with peg(p)
  premise count peg > 1 and forall q in adj4(p): not can_arrive(q)
  conclude lost                               # the position is dead
technique package3 tier Easy
  macro s over a into h; c over b into a; s' (now at h) back over a into s's start  # as the help gives it
  effect the three pegs of a line cleared; every other peg where it was
```

`can_arrive` is the over-approximation `solver.ts` calls `frozen`: the least
set containing every peg and closed under "two reachable holes in a line
jump into a third". The other rungs (`only`, `onlyThese`, `alsoThese`) report
a search's certificate of which jumps can still finish.

**Words.** Board type: **board shape** (computed: only space; Random adds the
deal of the space) = board shape (catalog `kind`). w, h: size. **Commute**: no
(and not invertible).

**Did not fit.**

- C **a least fixed point beyond transitive closure.** `can_arrive` is
  `reach(c) <- peg(c)` or `exists a jump (a, b, c) with reach(a) and
  reach(b)`: an AND over two premises, a Datalog rule, which `chain` (the
  closure of a binary relation) cannot express. FO + LFP is needed.
- P a dealt space built by a process (Random). The deal holds it as a
  description, which is allowed; it is not checkable.

### Inertia

```pzl
game inertia "Inertia"
family position
size w, h
space grid(w, h), dirs8 = the eight directions, ray(c, d) = the line from c in d
given kind : cell -> {blank, gem, mine, stop, wall}
answer ball : cell, gems : cell -> bool, dead : bool
freedom transition moves {
  slide(d in dirs8):
    requires not dead
    let path = ray(ball, d) up to and including the first x where
               kind(x) in {stop, mine} or kind(next(x, d)) = wall
    gems(x) := false for x in path
    ball := last(path); dead := kind(ball) = mine
}
finish not dead and forall c: not gems(c)
deal: about a fifth each of walls, stops and mines; as many gems as mines,
      each where the ball can collect it; the ball on a stop
```

**Techniques.**

```pzl
technique strands tier Easy
  for direction d
  premise exists gem g: not (g on some slide path from a cell chain-reachable from dest(ball, d))
  conclude slide(d) is not on any finish                   # a planning prune
```

The rest (`collect`, `forced`, `declined`, `positioning`) narrate a shortest
search toward the nearest gem that leaves no gem stranded.

**Words.** w, h: size only. **Commute**: no.

**Did not fit.**

- C guarded assignment (as Cube): a slide is not one rewrite of adjacent
  cells. PuzzleScript would iterate a rewrite to a fixed point within one
  move; the language has no such iteration, so the move uses `first x in L
  where P` from § "Expressions" inside an assignment.
- L `ray(c, d)` for the eight directions: `grid`'s lines are rows and
  columns only; diagonals must be added.
- `strands` is within the core: the ball's reach is the transitive closure of
  the slide relation over cells, which does not depend on the gems.

### Slide

```pzl
game slide "Slide"
family position
size w, h                                     # the board, wall included
space grid(w, h)
given wall : cell -> bool, field : cell -> bool, target : region
answer blockof : cell -> block or none        # blocks are dealt polyominoes; main is one
freedom transition moves {
  move(b, d in {up, down, left, right}):
    requires forall c in cells(b): next(c, d) not wall
             and (blockof(next(c, d)) in {none, b})
             and (field(next(c, d)) implies b = main)
    blockof := shift(blockof, b, d)
}
finish cells(main) = target
deal: blocks merged while the shortest solution stays <= maxmoves

setting solutionLimit { replace deal: ... maxmoves }
```

**Techniques.** None: a shortest search, narrated as an errand of who makes
room for whom (`makesRoom`, `makesRoomForKey`, `movesOn`, `keyBlock`,
`keyOut`). The dependency chain is a reading of the found path, not a reason
a technique could state.

**Words.** Solution-length limit: setting = setting. w, h: size.
**Commute**: no (every move is invertible, so this is a groupoid like
Fifteen's; the language files it as transition, as theory does).

**Did not fit.**

- C guarded assignment, here with a quantified guard over a block's cells.
- C (in the deal) **distance over positions**: "the shortest solution is at
  most m" quantifies over paths in the position graph, which is exponential in
  the board and is not a closure over the board's elements. Numgame's tier
  (fewest operations) is the same.
- P the move counter's rule (a run of moves of one block counts once) is a
  path cost; it is not a rule of the game, and is left as prose.

### Flood

```pzl
game flood "Flood"
family position
size w, h, k                                    # k colors
space grid(w, h)
answer color : cell -> 1..k
given color
freedom transition moves {
  fill(x in 1..k):
    for c in component(corner, color = color(corner), adj4): color(c) := x
} bound moves <= limit
finish forall c: color(c) = color(corner)
deal limit: -- prose: the moves the game's own planner takes, plus leniency

setting leniency { replace deal limit: ... + leniency }
```

**Techniques.** None: the hint plays a few fills ahead and takes the best
(`fill` is its one rung). The theory expected this.

**Words.** k: size = size (label tail). Leniency: setting = setting.
**Commute**: no.

**Did not fit.**

- C guarded assignment, with a component in the effect.
- L `component(x, P, adj)` := the cells `chain`-joined to `x` by `adj` steps
  through cells satisfying `P`.
- P the limit is dealt as an algorithm's output. A `deal` may describe it,
  but nothing can check it but running that planner.
- `bound moves <= limit` with "lost" when reached: the language's bound
  clause carries it; that a bounded path ends in a **lose** state, not merely
  an unfinished one, is not said anywhere in the language and should be one
  sentence under "Freedom".

### Same Game

```pzl
game samegame "Same Game"
family position
size w, h, k                                    # k colors
space grid(w, h)
answer color : cell -> 1..k or empty
given color
freedom transition moves {
  remove(g):
    requires g = component(c, color = color(c), adj4) for some c, |g| >= 2
    color(c) := empty for c in g
    then fall: each column's non-empty cells keep their order, at its bottom
    then close: the non-empty columns keep their order, at the left
}
finish forall c: color(c) = empty
objective maximize sum over the path's moves of max(0, |g| - scoresub)^2   # not in the language
```

**Techniques.**

```pzl
technique lastOfColor tier Easy
  for group g
  premise exists k: count c where color(c) = k and c not in g = 1
  conclude remove(g) is not on any finish    # a square that is the last of its color is never removed
```

Stated precisely: removing `g` leaves some color `k` with exactly one cell;
a lone cell of a color can never be in a group of two or more, so no finish
follows. Sound and first-order over the position after the move. The rest
(`only`, `onlyThese`, `alsoThese`, `anyGroup`, `joins`, `plain`) narrate a
search.

**Words.** Scoring system ((n-1)² or (n-2)²): it changes a parameter of the
objective and nothing in the finish or the moves. The table would call a
changed parameter a **ruleset**; it is filed today as a label-tail choice,
which taxonomy counts among generator settings and sizes. Disagrees, and the
real answer is that **the language has no word for a variation of an
objective**. w, h, k: size. **Commute**: no.

**Did not fit.**

- C **an objective block**: `objective maximize <sum over the moves of a
  path>`. The logic is over positions; a score is an aggregate over a path,
  so the core needs path terms (a sum along the move sequence). Theory.md
  named this limit; what fails is precisely that no formula of the logic has
  a path as its domain.
- C guarded assignment; gravity and column closing are definable with
  counting (L `fall`: the new color at `(x, y)` is the old color at the `y'`
  with as many non-empty cells below it as there are rows below `y`; `close`
  the same over columns), but only inside an assignment move.

### Numgame (Target)

```pzl
game numgame "Target"
family expression
size places = 6
space places 1..6
answer num : place -> N or empty
given num, target : 100..999
freedom transition moves {
  combine(i, j, op in {+, -, x, /}):
    requires num(i), num(j) not empty, i != j
    let a = max(num(i), num(j)), b = min(...), r = a op b
    requires r is a positive integer             # no equal subtraction, no remainder
    num(place of a) := r; num(place of b) := empty
}
finish exists p: num(p) = target
deal: `large` of the six from {25, 50, 75, 100}, the rest from two each of 1..10;
      tier = the fewest operations that make the target (2..5)

setting large { replace deal: large = L }      # label slot `kind`
setting tier  { ... }
```

**Techniques.** None: the hint counts the shortest starts by search
(`starts`, `onlyStart`, `last`).

**Words.** Large numbers: **setting** (computed) = setting (taxonomy; the
catalog's `kind` label slot, which taxonomy already flagged). Tier: setting.
**Commute**: no. Two combines on disjoint places do commute: the moves form a
partially commutative system, which the language's yes/no test flattens to
no. Sokoban and Pegs are the same.

**Did not fit.**

- C guarded assignment.
- C a domain that is not finite (N), though every reachable value is bounded
  by the product of the six; the meaning is still finite by reachability, not
  by the domain.
- C the tier is a distance over positions (as Slide's limit).

---

## Queries

### Mines

```pzl
game mines "Mines"
family hidden shading
size w, h, n
space grid(w, h)
answer mine : cell -> bool                   # hidden
shape count c where mine(c) = n
clue count at cell value 0..8
  means not mine(at) and count c in adj8(at) where mine(c) = v
marks flag : cell -> bool
freedom query reveal(c: cell) shows count at zero_closure(c)    # dead if mine(c)
finish forall c: not mine(c) implies revealed(c)
deal -- prose: the layout is dealt at the first reveal, with no mine in it or
     beside it, and so that the techniques below finish from there (no guessing)

technique full tier Easy                       # a number that is full
  for revealed cell c with count v
  premise count x in adj8(c) where proven_mine(x) = v
  conclude forall x in adj8(c) unrevealed and not proven_mine(x): safe(x)
technique pair tier Easy                       # a number inside another
  for revealed c1, c2 with U1 = unknown(adj8(c1)) subset U2 = unknown(adj8(c2))
  premise need(c2) - need(c1) = |U2 - U1|
  conclude forall x in U2 - U1: mine(x)
technique count tier Normal                    # counting the mines left
  for set N of revealed numbers with pairwise disjoint unknown neighborhoods
  premise sum c in N of need(c) = n - proven
  conclude forall x unknown, not in any unknown(adj8(c)) for c in N: safe(x)
```

**Words.** w, h, n: size = size. **Commute**: queries commute (the revealed
set is a union), death aside.

**Did not fit.**

- C **a query that reveals a set**: opening a 0 opens its neighbors, so a
  reveal shows the clue at every cell of `zero_closure(c)` (L: `chain` over
  `adj8` through cells whose count is 0). The query form shows one clue at
  one place.
- C **a deal conditioned on a move**: the layout is chosen after the first
  query (spec "The first move carries the layout it laid out"). The
  language's `deal` precedes play.
- C set quantification in `count` (a family `N` of numbers), as Dominosa's
  `set`.
- The "no guessing" promise is a tier promise, which `deal tier` holds.

### Black Box

```pzl
game blackbox "Black Box"
family hidden shading
size w, h, minballs, maxballs
space grid(w, h), slots = border(grid)
answer ball : cell -> bool                   # hidden
shape minballs <= count c where ball(c) <= maxballs
clue ray at slot value {hit, reflect} + slots
  means ray(ball, at) = v
marks guess : cell -> bool, known : cell -> bool
freedom query fire(s: slot) shows ray at s and at ray(ball, s)
        verify(): requires minballs <= count guess <= maxballs
finish forall s in slots: ray(guess, s) = ray(ball, s)      # the guess cannot be told apart
deal: a random layout of a random count in minballs..maxballs

technique ray tier Easy
  for fired slot s, the first cell u on ray_prefix(known, s) that is not known
  premise ray result through u with ball(u) = true differs from observed(s)
  conclude known(u)                            # empty
technique hidden tier Normal
  for cells H that no ray from any slot can reach given the known cells
  premise minballs - count guess = |H|
  conclude forall u in H: guess(u)
```

**Words.** Ball count `N` or `N-M`: size = size (a range is two size
parameters of the same rule). w, h: size. **Commute**: queries commute.

**Did not fit.**

- L `ray(B, s)` := the terminal state of the deterministic walk over
  `cell x direction` from `s` (instant hit, instant reflection, turn
  clockwise on a ball ahead-left, anticlockwise ahead-right, hit on a ball
  ahead). This needs **`chain` over pairs** (cell, direction): k-ary
  transitive closure. Standard for FO + TC, but § "The library" uses `chain`
  on one sort only; a sentence must allow tuples.
- L the `ray` term takes a ball set as an argument (`ray(ball, s)`,
  `ray(guess, s)`), so the finish compares the hidden answer with a mark
  through every query, asked or not. A library definition with a set
  argument, as `connected(S, adj)` already is.
- C the query reveals two places at once (entry and exit), the same change as
  Mines'.
- `fire` (which laser to fire next) and `layout` (a search) are outside
  techniques, as theory.md said.

### Guess

```pzl
game guess "Guess"
family hidden code
size k colors, p pegs, g guesses
space slots 1..p
answer code : slot -> 1..k                  # hidden
marks out : slot -> set of 1..k              # ruled-out colors
freedom query guess(q : slot -> 1..k) shows feedback(q)
  bound queries <= g                          # lost when exhausted
clue feedback at query value (b, w)
  means b = count i where q(i) = code(i)
        and w = sum c in 1..k of min(count i where q(i) = c, count i where code(i) = c) - b
finish the last query has b = p
deal: code uniform over 1..k^p

ruleset allowBlanks  { replace freedom guess(q : slot -> 0..k), requires some q(i) != 0 }
modifier noDuplicates {
  add rule distinct(code over slots)
  replace freedom guess requires distinct(q over slots)
}

technique noBlack tier Easy
  for scored query q with b = 0
  conclude forall i: q(i) in out(i)
technique scoredNothing tier Easy
  for scored query q with b + w = 0
  conclude forall i, j: q(j) in out(i)
technique blacksForced tier Normal
  for scored query q with b = count i where q(i) not in out(i)
  conclude forall i with q(i) not in out(i): code(i) = q(i)
```

**Words.**

- allowBlanks: replaces the query's move set (a guess may have blanks).
  Queries commute, so by the table a commuting move set replaced is a
  **ruleset**. Catalog: a plain checkbox, filed nowhere; taxonomy said
  ruleset. Agrees with taxonomy, disagrees with the catalog.
- noDuplicates: adds a rule **and** restricts the query's move set. The table
  has no row for a block that mixes `add rule` with `replace freedom`. Taking
  the stronger, it is a **ruleset**; the catalog and taxonomy say
  **modifier**. Disagrees. If the guess restriction were dropped (a guess
  with repeats is still a legal query), it would be a modifier: so the
  disagreement turns on whether the game's refusal to score a repeated guess
  (spec "A row is submittable only when it is markable") is a rule.
- k, p, g: size. **Commute**: queries commute (b, w over a set of queries).

**Did not fit.**

- L `min` as an arithmetic term, and the feedback as above: definable.
- C `bound queries <= g` (the query block's bound, by analogy with the path
  bound) and a **lose** state when it runs out; the language states neither
  for queries.
- V mixed variation blocks need a rule in the table.
- `opening`, `probe`, `probeFits` (a suggested guess that minimizes the worst
  case) are an optimization, outside techniques, as theory said.
  `onlyAnswer` is an enumeration (Search).

---

## The table

| Game | Verdict | Library additions | Core changes | Variation words that disagree with the catalog |
| --- | --- | --- | --- | --- |
| Rect | fits with library additions | `rectangle`, `region`, `fits` (a derived sort of rectangles) | none (one sentence: an unmarked intermediate conclusion in a journey) | none |
| Separate | fits with library additions | `region` | none | none |
| Galaxies | fits with library additions | `mirror`, `points`; coordinates on edges and vertices in `grid` | none (techniques read coordinates) | none |
| Dominosa | fits with library additions | `perfect_matching`, `pair` | set quantification in `set` (already in Solo's sample) | none |
| Map | fits with library additions | `radj` | none | none |
| Net | fits with library additions | `rot`, `step`/`opp`/`side`, `links` | none | wrapping: board shape vs modifier |
| Netslide | fits with library additions | cyclic `lines` apart from `torus`, two adjacencies; Net's `link` | none | wrapping: board shape vs modifier |
| Flip | needs core change | dealt relation `toggles` | the act's induced choice sort; a staging policy in a deduction game; V: word changes with where `toggles` is written | Crosses/Random: ruleset or board shape, by notation |
| Untangle | needs core change | `crosses` | a non-finite domain (Q×Q); many solutions | none (but computed freedom is fill, not theory's commuting action) |
| Fifteen | needs core change | `parity` | kind computed from the block keyword, not from invertibility (a gap-relative groupoid); 3×2 endgame table is prose | none |
| Sixteen | fits | none | none | none |
| Twiddle | fits with library additions | `rot90`, `blocks` | V: no row for `finish` or a replaced given; size that enters the generators; "same generators, extended action" | rowsOnly: ruleset vs modifier; orientable: separate game vs modifier (taxonomy: ruleset); n: size, but different generators by the theory |
| Cube | needs core change | `solid(type)` as an enumerated table, `triangle_patch`, `dirs(c)` | guarded-assignment moves | solid type: separate game vs board shape |
| Pegs | needs core change | none | least fixed point (FO + LFP) for `trap`; Random's deal is a process (prose) | none |
| Inertia | needs core change | `ray` with diagonals | guarded-assignment moves | none |
| Slide | needs core change | `shift` of a block | guarded-assignment moves; distance over positions in the deal; move counter is prose | none |
| Flood | needs core change | `component` | guarded-assignment moves; lose state on a bound; dealt limit is prose | none |
| Same Game | needs core change | `fall`, `close` | objective over a path; guarded-assignment moves | scoring system: no word exists (table says ruleset; catalog setting) |
| Mines | needs core change | `zero_closure` | query showing a set; deal after the first query; set quantification in `count` | none |
| Black Box | needs core change | `ray(B, s)` (k-ary `chain`) | query showing two places; k-ary transitive closure | none |
| Guess | needs core change | `min`, feedback | query bound and lose state; V: mixed add-rule + replace-freedom block | allowBlanks: ruleset vs plain checkbox; noDuplicates: ruleset vs modifier |
| Numgame | needs core change | none | guarded-assignment moves; unbounded N; tier as distance over positions | none |

## Counts

- **22 games written.** All 22 have a description; no rule of the 22 had to
  be bent. Every rule the language could not state is named above.
- **Verdicts.** Fits: 1 (Sixteen). Fits with library additions: 8 (Rect,
  Separate, Galaxies, Dominosa, Map, Net, Netslide, Twiddle). Needs a core
  change: 13 (Flip, Untangle, Fifteen, Cube, Pegs, Inertia, Slide, Flood,
  Same Game, Mines, Black Box, Guess, Numgame). Twiddle's description fits,
  but its variations need the computation changed.
- **Techniques stated.** Deduction techniques in premise/conclude form: Rect,
  Separate, Galaxies, Dominosa, Map, Net, Flip (under a staging policy),
  Mines, Black Box, Guess. Macros with a staging policy: Fifteen (but its
  endgame is a table), Twiddle (six macros, all clean), Pegs (packages). A
  planning prune stated as a technique: Pegs `trap`, Inertia `strands`, Same
  Game `lastOfColor`. None, because the hint is a search: Untangle, Netslide,
  Sixteen, Cube, Slide, Flood, Numgame.
- **The core changes, by how many games need each**:
  1. Guarded-assignment moves in `transition` (act's form without the
     commuting claim): 6 (Cube, Inertia, Slide, Flood, Same Game, Numgame).
  2. Queries: a reveal of a set of places (Mines, Black Box), a bound on
     queries and a lose state (Guess), a deal after the first query (Mines):
     3 games.
  3. Set quantification, used and not stated: Dominosa, Mines (and Solo's
     sample already).
  4. Non-finite domains: Untangle (Q×Q), Numgame (N).
  5. Distance over positions in a deal or tier: Slide, Numgame.
  6. FO + LFP beyond transitive closure: Pegs. k-ary transitive closure:
     Black Box.
  7. An objective over a path: Same Game.
  8. An act game's induced choice sort, and staging in a deduction game: Flip.
  9. The freedom kind computed from the rules' invertibility, not the block
     keyword: Fifteen (Slide is the same groupoid shape, filed as theory files
     it).
  10. The variation computation: no row for `finish`, a replaced given, an
      objective, or a mixed block; a size inside the generators; extended
      actions; invariance under where a relation is written. 4 games (Flip,
      Twiddle, Same Game, Guess).
- **Left as prose**: Flood's dealt limit (an algorithm's output), Fifteen's
  3×2 endgame table, Pegs' Random deal (a process), Slide's move counter,
  Mines' first-click deal (as prose until change 2 lands), Untangle's lack of
  a unique answer (a statement about the theory, not a rule).
- **Variation words that disagree with the catalog**: 9 settings in 7 games
  (Net and Netslide wrapping; Flip's rulesets, by notation; Twiddle's
  rowsOnly, orientable and n; Cube's solid; Same Game's scoring; Guess's
  allowBlanks and noDuplicates). New against taxonomy.md: Twiddle's orientable
  (separate game, where taxonomy said ruleset), Twiddle's rowsOnly (ruleset,
  where taxonomy agreed with the catalog), Twiddle's n, Cube's solid
  (separate game, where taxonomy agreed with the catalog), Same Game's
  scoring, Guess's noDuplicates, and the Flip notation dependence.
- **Commutation, computed**: commuting act: Net, Flip. Fill: Rect, Separate,
  Galaxies, Dominosa, Map, and **Untangle** (an overwrite, where theory.md's
  table says commuting action). Non-commuting: Netslide, Sixteen, Twiddle
  (fixed generators), Fifteen and Slide (invertible but gap- or
  block-relative, so not writable as `permute`). Not invertible: Cube, Pegs,
  Inertia, Flood, Same Game, Numgame (Numgame and Pegs partially commute).
  Queries commute: Mines, Black Box, Guess.
