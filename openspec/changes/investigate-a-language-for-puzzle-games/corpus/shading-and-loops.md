# Corpus test, families A (Shading, 17) and B (Loops and paths, 14)

Written 2026-10-29 against `language.md` (second version, unchanged),
`theory.md` and `corpus.md` § "The test, fixed before the corpus was
collected". All 31 puzzles of `corpus-list.md` §§ A and B are described; none
is dropped. Rules are those stated in the list, checked against pzprjs's
`rules.en.yaml` where the list was terse or where a variant's rules were
needed (Ayeheya, Heyabon, Heyablock, Mochinyoro, LITS, invlitso,
yajilin-regions, icelom, icelom2, icewalk, pipelinkr, tapaloop).

## Conventions

- Every puzzle has `size w, h` (a size by the parameter test) and `freedom
  fill`; neither is repeated in the per-puzzle discussion.
- `grid(w, h)` is the library's; its `edge` is between orthogonal cells, so an
  edge set read with cell incidence is a line through cell centers, and read
  with corner incidence is a line along grid lines. Where the loop runs along
  grid lines and on the outer border (Myopia), `tiling(square, w, h)` is used.
- `dirs4 = {n, e, s, w}`; `step`, `edge(c, d)`, `ray`, `sightline`,
  `segments`, `component`, `connected`, `no_adjacent`, `one_loop`, `degree`
  are library entries of the second version and are not additions. `x(c)`,
  `y(c)` are a grid cell's coordinates (y grows downward).
- **Shape versus rule.** The language has both blocks, and the theory defines
  both ("answer shape: what a finished board looks like with every clue
  removed"; "goal predicate: a predicate the game imposes whatever is dealt"),
  and every clue-free predicate meets both definitions. The convention here
  follows the samples: connectivity, loop, region and no-adjacency predicates
  go in `shape` (Range, Star Battle), local bans and counts in `rule`. This
  choice decides words; § "The cut, and what went wrong" says how.
- Library additions are numbered **A1..A13** and defined once in § "Library
  additions"; each puzzle names the ones it uses.

---

## A. Shading

### 1. Nurikabe

```pzl
game nurikabe "Nurikabe"
family shading
space grid(w, h)
answer shade : cell -> {shaded, clear}
marks mark : cell -> {shaded, clear, unknown}
shape connected(cells where shaded, adj4)
rule no2x2: forall q in windows2: exists c in q: shade(c) = clear          # A1
clue island at cell value 1..w*h
  means shade(at) = clear and |component(at, cells where clear, adj4)| = v
rule onenumber: forall c where shade(c) = clear:
  count x in component(c, cells where clear, adj4) where clued(x) = 1      # clued(x): clue(x) != none
deal clues; tier

modifier question {
  add clue anyisland at cell value {?} means shade(at) = clear
}
```

- **Verdict: described with an extension** (A1).
- **Variants.** Question-mark clue: adds a clue kind (an island marker with no
  size), which `onenumber` counts through `clued` → **modifier**. A reader
  might call a value hidden from a clue a generator setting; modifier is
  defensible (it is a new clue kind, every plain technique stays sound).
  Nuribou, Mochikoro, Tapa are the source's neighbors, not variants; see the
  cuts.
- **Cut, vs 2 Mochikoro.** Same answer, same `island` clue meaning. Mochikoro
  replaces the shape (shaded connected → clear diagonally connected, clear
  components rectangles) and replaces `onenumber` (exactly → at most).
  Language: a `replace shape` has **no row** in the variation table; read as a
  rule it is a **ruleset**, one game. Theory ("a game: one answer shape"):
  **two games**, shading. A solver of both: two games (Nurikabe's
  "the wall must escape" rungs are unsound in Mochikoro). **Flagged.**
- **Technique** (standard, not named by the cited source):
  ```pzl
  technique unreachable tier Easy
    for cell c
    premise mark(c) = unknown and forall clue cell k:
            dist(k, c, cells where mark != shaded) >= v(k)   # dist: chain length, lfp
    conclude mark(c) = shaded
  ```
  A Tactic (`premise`), markable.

### 2. Mochikoro

```pzl
game mochikoro "Mochikoro"
family shading
space grid(w, h)
answer shade : cell -> {shaded, clear}
shape connected(cells where clear, adj8),
      forall c where shade(c) = clear: rectangle(component(c, cells where clear, adj4))
rule no2x2: forall q in windows2: exists c in q: shade(c) = clear          # A1
clue island at cell value 1..w*h
  means shade(at) = clear and |component(at, cells where clear, adj4)| = v
rule atmostone: forall c where shade(c) = clear:
  count x in component(c, cells where clear, adj4) where clued(x) <= 1
deal clues; tier

modifier mochinyoro {
  add rule forall c where shade(c) = shaded:
    not rectangle(component(c, cells where shaded, adj4))
}
```

`rectangle(S) := |S| = (fold(max, x over S) - fold(min, x over S) + 1)
* (fold(max, y over S) - fold(min, y over S) + 1)`, a definition inside the
description from core folds (not counted as an addition).

- **Verdict: described with an extension** (A1).
- **Variant.** Mochinyoro (pzprjs: Mochikoro's rules plus "shaded blocks are
  not rectangles") → **modifier**. The source files it as a separate genre;
  the theory accepts modifier (it only adds).
- **Cut, vs 1 Nurikabe**: the pair above, **flagged**.

### 3. Heyawake

```pzl
game heyawake "Heyawake"
family shading
space grid(w, h), regions room = dealt partition(cells)
answer shade : cell -> {shaded, clear}
shape no_adjacent(cells where shaded, adj4), connected(cells where clear, adj4)
clue count at region room value 0..|cells(at)|
  means count c in cells(at) where shade(c) = shaded = v
rule span: forall L in rows + cols, S in segments(L, clear):
  count c in S where step(c, along(L)) in S and room(step(c, along(L))) != room(c) <= 1
deal rooms; clues; tier

modifier ayeheya {
  add rule forall r in room, c in cells(r):
    shade(c) = shade(iso(rot180, c, center(r)))                              # A7
}
modifier question { add clue any at region room value {?} means true }
```

(`along(rows) = e`, `along(cols) = s`.)

- **Verdict: described with an extension** (A7, needed only by Ayeheya).
- **Variants.**
  - Ayeheya (pzprjs: 180° symmetry of shading in each room) → **modifier**.
    Agrees.
  - Heyabon: pzprjs's rules are not a Heyawake variant at all: "draw lines to
    move some of the circles... a number indicates how many spaces the circle
    must move... circles within each region have 180° symmetry". Its answer is
    a move per circle (`move : circle -> dir × 0..n`), a replaced answer and
    clue → **separate game**, in the drawn-movement family. The list's
    filing of it as a Heyawake variant is wrong; the computed word is right.
  - Heyablock (pzprjs: each room's shaded cells connected, unnumbered rooms
    have at least one shaded cell, shaded cells not adjacent across room
    borders, `span`, clear connected): replaces `no_adjacent` in the shape.
    Language: **no row** (a shape change); as a rule, ruleset. Theory: a
    separate game, which is what the source and a solver say. **Not decided by
    the language.**
  - Question-mark rooms: a clue whose meaning is `true` → computed
    **modifier**, a vacuous one. A reader would say it is no variation at all.
    The language could detect a `means true`; it does not. **Doubtful.**
- **Cut, vs 14 Usoone**: same shape, clue kinds replaced (room count → lying
  cell numbers) → **two games**, shading. Agrees. **vs collection Singles**:
  same shape, clue replaced → two games. Agrees.

### 4. LITS

```pzl
game lits "LITS"
family shading
space grid(w, h), regions reg = dealt partition(cells) where |r| >= 4
answer shade : cell -> {shaded, clear}
shape connected(cells where shaded, adj4)
rule four:  forall r in reg: count c in cells(r) where shaded = 4
        and connected(cells(r) where shaded, adj4)
rule no2x2: forall q in windows2: exists c in q: shade(c) = clear          # A1
rule alike: forall r1, r2 in reg, r1 != r2:
  (exists a in cells(r1), b in cells(r2): a, b shaded and b in adj4(a))
  implies not congruent(cells(r1) where shaded, cells(r2) where shaded)    # A7
deal regions; tier

ruleset litso {
  replace rule no2x2: forall q in windows2:
    (exists c in q: shade(c) = clear) or exists r in reg: q subset cells(r)
}
```

- **Verdict: described with an extension** (A1, A7).
- **Variants.** LITSO (the O tetromino allowed, so a 2×2 inside one region) →
  **ruleset**. Agrees. invlitso (pzprjs: four *unshaded* cells per region form
  the tetromino, the rest shaded; no 2×2 shaded; shaded connected): the
  tetromino rules move to the clear cells and the shape is kept → computed
  **ruleset** (replaced rules, same shape). A solver would call it another
  game: every "four shaded per region" rung is gone. **Doubtful.**
- **Cut, vs 5 Norinori.** Neither has a clue kind; both are dealt regions and
  goal predicates. Norinori replaces the shape (shaded connected → every
  shaded cell has exactly one shaded neighbor) and `four` (4 → 2, and no
  connectivity). Language: no row for the shape; as rules, **ruleset, one
  game**. Theory: two games (answer shapes differ). Solver: two. **Flagged.**

### 5. Norinori

```pzl
game norinori "Norinori"
family shading
space grid(w, h), regions reg = dealt partition(cells)
answer shade : cell -> {shaded, clear}
shape forall c where shaded: count x in adj4(c) where shaded = 1
rule two: forall r in reg: count c in cells(r) where shaded = 2
deal regions; tier
```

- **Verdict: described well** (no additions).
- **Variants:** none named.
- **Cut, vs 4 LITS**: the pair above, **flagged**. **vs collection
  Dominosa**: Dominosa's answer is a partition into dominoes with numbers
  (regions family), Norinori's a shading → two games, two families. Agrees.

### 6. Hinge

```pzl
game hinge "Hinge"
family shading
space grid(w, h), regions reg = dealt partition(cells)
answer shade : cell -> {shaded, clear}
shape forall c where shaded:
  let B = component(c, cells where shaded, adj4),
      X = edges e between cells of B where reg differs across e:
  exists axis a in grid_lines:                                                # A7
    X != {} and X = {e between cells of B : e crosses a}
    and X is one run along a
    and forall b in B: iso(mirror(a), b) in B
clue count at region reg value 0..|cells(at)|
  means count c in cells(at) where shaded = v
deal regions; clues; tier
```

("one run along a": the edges of X form a contiguous run of a's unit
segments, `connected` over their shared corners.)

- **Verdict: described with an extension** (A7).
- **Variants:** none.
- **Cut, vs 3 Heyawake**: the same `count` clue meaning; Heyawake's shape
  (`no_adjacent`, clear connected) and `span` are replaced by the hinge
  shape. Language: no row / ruleset → one game. Theory: two (shapes differ).
  Solver: two. **Flagged.** (Chocona, named, would be another ruleset of the
  same clue kind by the language's table, for the same reason.)

### 7. Yin-Yang

```pzl
game yinyang "Yin-Yang"
family shading
space grid(w, h)
answer stone : cell -> {black, white}
given stone
shape connected(cells where black, adj4), connected(cells where white, adj4)
rule no2x2: forall q in windows2: not all equal(stone over q)               # A1
deal givens; tier
```

- **Verdict: described with an extension** (A1).
- **Variants:** none.
- **Cut, vs 1 Nurikabe**: Nurikabe's `island` clue kind is absent here
  (`remove clue`) → **two games**, shading. Agrees. **vs collection
  Unruly**: both have only givens of the answer; Unruly has no shape and two
  rules (`nothree`, `balanced`), Yin-Yang a shape and `no2x2`. Language: shape
  added and rules replaced → no row / ruleset → **one game**. Theory: two
  (shapes differ). Solver: plainly two. **Flagged** (the clearest case).

### 8. Nurimisaki

```pzl
game nurimisaki "Nurimisaki"
family shading
space grid(w, h)
answer shade : cell -> {shaded, clear}
shape connected(cells where clear, adj4)
rule no2x2: forall q in windows2: not all equal(shade over q)               # A1
clue cape at every cell value {circle, none} × (1..w+h | blank)               # complete
  means (v != none) = (shade(at) = clear and count x in adj4(at) where clear = 1)
    and (v has number n implies
         forall d in dirs4 where step(at, d) clear:
           1 + |sightline(at, d) until shaded| = n)
deal clues; tier
```

- **Verdict: described with an extension** (A1). The "circle iff cape" rule
  is a complete clue kind, a second-version feature, and states exactly.
- **Variants:** none.
- **Cut, vs 9 Cave**: clue kinds replaced (cape and one-way sight vs
  four-way sight) → **two games**, shading. Agrees.

### 9. Cave

```pzl
game cave "Cave"
family shading
space grid(w, h)
answer shade : cell -> {shaded, clear}
shape connected(cells where clear, adj4),
      forall c where shaded:
        exists x in component(c, cells where shaded, adj4): x on the rim     # x(x) in {1,w} or y(x) in {1,h}
clue sees at cell value 1..w+h-1
  means shade(at) = clear and
        1 + sum d in dirs4 of |sightline(at, d) until shaded| = v
deal clues; tier

modifier question { add clue unknown at cell value {?} means shade(at) = clear }
```

- **Verdict: described well** (no additions; "on the rim" is a coordinate
  formula).
- **Variant.** Question-mark clues → **modifier**. Agrees.
- **Cut, vs collection Range**: the `sees` clue is Range's word for word.
  Cave replaces Range's shape (`no_adjacent` shaded → every shaded group
  reaches the rim). Language: no row / ruleset → **one game**. Theory: two.
  Solver: two (Nikoli publishes both; Range's `adjacency` rungs are unsound in
  Cave). **Flagged.**

### 10. Tapa

```pzl
game tapa "Tapa"
family shading
space grid(w, h)
answer shade : cell -> {shaded, clear}
shape connected(cells where shaded, adj4)
rule no2x2: forall q in windows2: exists c in q: clear                      # A1
clue runs at cell value list of (1..8 | ?) with |v| <= 4
  means shade(at) = clear and
    let R = cyc_runs(ring8(at), shaded):                                      # A9
    (v = [?] and |R| <= 1) or
    (|R| = |v| and exists fill f of indices(v) from indices(R):
       bijection(f) and forall i: v[i] = ? or v[i] = R[f(i)])
deal clues; tier

# Tapa-Like Loop (pzprjs tapaloop)
game tapaloop "Tapa-Like Loop" {
  replace answer line : edge -> bool
  replace shape cell_loop(edges where line)                                   # A2
  replace clue runs ... means no line at at, and the runs of on-loop cells in ring8(at) match v
}
```

- **Verdict: described with an extension** (A1, A9). The "in any order" and
  `?` matching is a bounded filling over the clue's list positions, which the
  core has.
- **Variants.** Tapa-Like Loop: replaced answer and clue meaning →
  **separate game**, loop family. Agrees with the source. A Tapa "with a
  different no-2×2 rule" → `replace rule no2x2` → **ruleset**. Agrees.
- **Cut, vs collection Mosaic**: clue replaced (3×3 count vs ring run
  lengths) → two games, shading. Agrees. **vs 1 Nurikabe**: clue replaced →
  two. Agrees.

### 11. Aquarium

```pzl
game aquarium "Aquarium"
family shading
space grid(w, h), regions tank = dealt partition(cells)
answer water : cell -> bool
shape forall c where water(c): forall x in basin(c, tank(c)): water(x)      # A8
clue count at slot value 0..max(w, h)
  means count c in line(at) where water(c) = v
deal tanks; clues; tier
```

`basin` makes rule (3) exactly, and rule (2) (gravity) follows from it: a
cell's basin contains the cell below it in the tank.

- **Verdict: described with an extension** (A8).
- **Variants:** none.
- **Cut, vs 12 Thermometers**: same clue kind (line counts); the space
  differs (tanks vs dealt ordered lines) and the shape is replaced (level vs
  prefix). Language: a board shape plus a shape change → no row / ruleset →
  **one game**. Theory: two. Solver: two genres with overlapping line-count
  reasoning. **Flagged.**

### 12. Thermometers

```pzl
game thermometers "Thermometers"
family shading
space grid(w, h), lines therm = dealt partition(cells) into lines,
      each a path(adj4) starting at its bulb
answer fill : cell -> bool
shape forall T in therm, a before b in T: fill(b) implies fill(a)
clue count at slot value 0..max(w, h)
  means count c in line(at) where fill(c) = v
deal thermometers; which counts show; tier

setting bent    { replace deal thermometers: may bend }
setting missing { replace deal clues: some counts hidden }
```

- **Verdict: described well** (dealt lines and order along a line are core
  and library).
- **Variants.** Bending thermometers: how a dealt space is dealt →
  **generator setting** (the second-version table's row). A reader might say
  board shape; both are within-game words and keep every technique.
  Accepted. Missing counts → **generator setting**. Agrees.
- **Cut, vs 11 Aquarium**: the pair above, **flagged**.

### 13. Kakurasu

```pzl
game kakurasu "Kakurasu"
family shading
space grid(n, n)
answer shade : cell -> bool
clue rowsum at slot (row end)    value 0..n(n+1)/2
  means sum c in line(at) where shade(c) of x(c) = v
clue colsum at slot (column end) value 0..n(n+1)/2
  means sum c in line(at) where shade(c) of y(c) = v
deal tier
```

- **Verdict: described well.**
- **Cut, vs collection Pattern**: clue replaced (run list vs weighted sum) →
  **two games**, shading. Agrees.

### 14. Usoone

```pzl
game usoone "Usoone"
family shading
space grid(w, h), regions reg = dealt partition(cells)
answer shade : cell -> {shaded, clear}
shape no_adjacent(cells where shaded, adj4), connected(cells where clear, adj4)
clue number at cell value 0..4 means shade(at) = clear
rule liar: forall r in reg:
  count c in cells(r) where clue(c) != none
     and count x in adj4(c) where shaded != clue(c) = 1
deal regions; clues; tier
```

- **Verdict: described well.** The lie is a rule that reads clues as terms,
  which the second version added for Path and Singles; it is needed again
  here, which supports that change.
- **Cut, vs 3 Heyawake**: same shape, clue kinds replaced → two games.
  Agrees. **vs 15 Yajikazu**: same shape; both have "clues that may lie" but
  of different kinds (a region with one liar vs a shaded clue) → two games.
  Agrees.

### 15. Yajikazu

```pzl
game yajikazu "Yajikazu"
family shading
space grid(w, h)
answer shade : cell -> {shaded, clear}
shape no_adjacent(cells where shaded, adj4), connected(cells where clear, adj4)
clue arrow at cell value dirs4 × 0..max(w, h)
  means shade(at) = clear implies count x in ray(at, v.dir) where shaded = v.n
deal clues; tier
```

- **Verdict: described well.**
- **Cut, vs 18 Yajilin**: same arrow count, but Yajilin's answer is a loop
  and its clue cells are neither shaded nor on the loop → replaced answer and
  clue → **two games, two families** (shading, loop). Agrees.

### 16. Creek

```pzl
game creek "Creek"
family shading
space grid(w, h)
answer shade : cell -> {shaded, clear}
shape connected(cells where clear, adj4)
clue count at vertex value 0..4
  means count c in cells(at) where shaded = v       # cells(v): the up to 4 cells at a corner
deal clues; tier
```

- **Verdict: described well** (corner–cell incidence is the grid's).
- **Cut, vs 63 Squaro**: Squaro's answer is on vertices
  (`dot : vertex -> bool`), its clue sits on cells, and it has no
  connectivity → **two games**. Agrees. **Family**: computed from the
  answer's sort, Creek (cells) and Squaro (vertices) are two products; a
  reader would put both in shading. **The family computation is doubtful
  here.** It is not a game cut. **vs collection Mosaic**: clue replaced →
  two games. Agrees.

### 17. Stostone

```pzl
game stostone "Stostone"
family shading
size w, h with h even
space grid(w, h), regions reg = dealt partition(cells)
answer shade : cell -> bool
shape forall r in reg: |cells(r) where shaded| >= 1
        and connected(cells(r) where shaded, adj4),
      forall a, b shaded, b in adj4(a): reg(a) = reg(b)
clue size at region reg value 1.. means count c in cells(at) where shaded = v
rule fall: exists fill d of reg from 0..h:                     # core bounded filling
  let F(r) = shift(cells(r) where shaded, d(r)):               # A12
  (forall r1 != r2: F(r1) disjoint F(r2))
  and union r of F(r) = cells where y(c) > h/2
  and forall a in r1, b in r2 shaded, x(a) = x(b), y(a) < y(b):
        y(a) + d(r1) < y(b) + d(r2)
deal regions; clues; tier
```

Each region holds exactly one block, so a filling of displacements over the
regions is a filling over the blocks. Claim: an order-preserving set of
downward shifts that packs the bottom half exactly is the result of the fall.
The fall is monotone and stops at a stable position, and a packed bottom half
is stable. The claim is argued here and not checked by enumeration.

- **Verdict: described with an extension** (A12).
- **Cut, vs Shimaguni** (named, not in the corpus): same `size` clue and
  one-block shape. Shimaguni's "adjacent regions' blocks differ in size" is
  replaced by `fall` → language **ruleset, one game**. Theory: still one, if
  both are filed as `rule`. Solver: two. **Flagged** (the theory's shape test
  does not save this pair unless `fall` is filed as shape). **vs 60
  Dosun-Fuwari**: replaced answer domain and no clue kind → two games.
  Agrees.

---

## B. Loops and paths

### 18. Yajilin

```pzl
game yajilin "Yajilin"
family loop
space grid(w, h)
answer line : edge -> bool
marks mark : cell -> {shaded, onloop, unknown}
clue arrow at cell value dirs4 × 0..max(w, h)
  means degree(at, line) = 0
    and count x in ray(at, v.dir) where shaded(x) = v.n
# shaded(c) := no clue at c and degree(c, line) = 0   (derived, not answer)
shape cell_loop(edges where line),                                            # A2
      no_adjacent(cells where shaded, adj4)
deal clues; tier

modifier question { add clue blank at cell value {?} means degree(at, line) = 0 }
game yajilin_regions "Yajilin (regions)" {
  add space regions reg = dealt partition(cells)
  remove clue arrow
  add clue count at region reg value 0.. means count c in cells(at) where shaded(c) = v
}
```

The answer is the loop alone: shading is derived from it, so the family
computes as loop.

- **Verdict: described with an extension** (A2).
- **Variants.** Question-mark clue → **modifier**. Agrees. Yajilin with
  regions: clue replaced → **separate game**, loop family. pzprjs files it as
  a separate variety. Agrees.
- **Cut, vs 15 Yajikazu**: two games, two families (above). **vs collection
  Tracks**: shape (a path between slots vs a loop) and clue replaced → two
  games, one family (loop and path). Agrees.
- **Technique** (standard): `premise count x in ray(c, d) where
  mark(x) = shaded = n conclude forall x in ray(c, d) where unknown:
  mark(x) = onloop`. Markable.

### 19. Castle Wall

```pzl
game castle "Castle Wall"
family loop
space grid(w, h), walls = dealt set of edge
answer line : edge -> bool
shape cell_loop(edges where line), forall e in walls: not line(e)           # A2
clue wall at cell value {white, black, gray} × (dirs4 × 0.. | none)
  means degree(at, line) = 0
    and (v.color = white implies inside(at, line))                           # A13
    and (v.color = black implies not inside(at, line))
    and (v has (d, n) implies
         count x in {at} + ray(at, d) where line(edge(x, d)) = n)
deal walls; clues; tier
```

The edges counted lie along `d`: vertical edges for a vertical arrow,
horizontal for a horizontal one, as the rule says.

- **Verdict: described with an extension** (A2, A13).
- **Variants:** none.
- **Cut, vs 18 Yajilin**: clue replaced (inside/outside and segment count vs
  shaded count), and the loop need not cover every cell → **two games**, loop
  family. Agrees.

### 20. Country Road

```pzl
game country "Country Road"
family loop
space grid(w, h), regions country = dealt partition(cells)
answer line : edge -> bool
shape cell_loop(edges where line)                                             # A2
rule once: forall r in country: exits(cells(r), line) = 2                    # A6
rule gaps: forall a, b in adj4(a), country(a) != country(b):
  degree(a, line) > 0 or degree(b, line) > 0
clue count at region country value 1..
  means count c in cells(at) where degree(c, line) > 0 = v
deal regions; clues; tier
```

- **Verdict: described with an extension** (A2, A6).
- **Variants:** Moon or Sun, Onsen and Double Back are relatives (the cuts).
- **Cut, vs 21 Double Back**: Double Back removes the `count` clue, changes
  `once`'s bound (2 → 4), adds holes and "every open cell is on the loop" →
  `remove clue` → **separate game**, loop family. Agrees.

### 21. Double Back

```pzl
game doubleback "Double Back"
family loop
space grid(w, h) minus holes, holes = dealt set of cell,
      regions reg = dealt partition(cells - holes)
answer line : edge -> bool
shape cell_loop(edges where line),                                            # A2
      forall c not in holes: degree(c, line) = 2
rule twice: forall r in reg: exits(cells(r), line) = 4                       # A6
deal holes; regions; tier
```

- **Verdict: described with an extension** (A2, A6).
- **Cut, vs 20 Country Road**: the pair above. Agrees.

### 22. Onsen

```pzl
game onsen "Onsen"
family loop
space grid(w, h), regions room = dealt partition(cells)
answer line : edge -> bool
shape forall c: degree(c, line) in {0, 2}
# a loop is component(k, cells, linked(line)) for a circle k               # A2's linked
clue circle at cell value (1.. | blank)
  means degree(at, line) = 2 and
    let K = component(at, cells, linked(line)):
      count x in K where clue(x) != none = 1
      and forall r in room where cells(r) meets K:
            exits(cells(r) ∩ K, line) = 2                                    # A6
            and |cells(r) ∩ K| = m(K)
      and (v != blank implies m(K) = v)
# m(K) := |cells(r0) ∩ K| for the first room r0 K meets
rule everyloop: forall c where degree(c, line) = 2:
  exists k in component(c, cells, linked(line)): clue(k) != none
rule rooms: forall r in room: exists c in cells(r): degree(c, line) = 2
deal regions; circles; tier
```

The loops are quantified through their circles, so no "set of components"
quantifier is needed.

- **Verdict: described with an extension** (A2's `linked`, A6).
- **Cut, vs 20 Country Road**: shape replaced (several loops vs one) and clue
  replaced → **two games**, loop family. Agrees.

### 23. Icebarn

```pzl
game icebarn "Icebarn"
family path
space grid(w, h), ice = dealt set of cell; slots IN, OUT on the border
answer line : edge -> bool          # border edges at IN and OUT included
shape one_trace(edges where line, X = ice, from IN to OUT)                  # A4
      # straight through every ice cell; degree 4 allowed only on ice
rule barns: forall c in ice:
  exists x in component(c, ice, adj4): degree(x, line) > 0
clue arrow at edge value {forward, back}
  means (at, v) in trace_states(from IN)                                      # A4: passed in that direction
deal ice; arrows; IN/OUT; tier

game icelom "Icelom" {
  remove clue arrow; remove rule barns
  add rule forall c not in ice: degree(c, line) > 0
  add clue number at cell value 1.. means degree(at, line) > 0
  add rule forall numbered a, b, clue(a) < clue(b): before(a, b, trace from IN)   # A10
}
game icelom2 "Icelom 2" {
  remove clue arrow
  add clue number at cell (as Icelom), add the ordering rule (as Icelom)
}
game icewalk "Ice Walk" {
  replace shape one_trace(edges where line, X = ice) as a loop
  remove clue arrow
  add clue number at cell means the non-ice stretch of the trace through at has v cells
}
```

The direction of travel is the trace's from IN. A3 is not needed because the
start fixes the orientation.

- **Verdict: described with an extension** (A4; A10 for the variants).
- **Variants.** Icelom, Icelom 2 and Ice Walk each remove the arrow clue kind
  (`remove clue`) → **separate games**, path/loop family. pzprjs files each
  as its own variety. Agrees.
- **Cut, vs 24 Nagare**: clue kinds and shape replaced (a path with crossings
  vs a directed loop without) → **two games**, one family. Agrees.

### 24. Nagare

```pzl
game nagare "Nagare"
family loop
space grid(w, h), dark = dealt set of cell
answer flow : edge -> {none, fwd, back}             # fwd: toward larger x or y
shape directed_loop(flow), forall c in dark: in(c) = {}                    # A3 (uses A2)
clue arrow at cell value dirs4 (on a light cell)
  means in(at) = {opp(v)} and out(at) = {v}         # through, without turning
clue fan at cell value dirs4 (on a dark cell)        # wind on sightline(at, v) until dark
# wind(c) := { d : exists fan f, value d, c in sightline(f, d) until dark }
rule wind: forall c with wind(c) != {}:
  (exists d in wind(c): opp(d) in wind(c)) implies in(c) = {}
  and in(c) != {} implies out(c) = wind(c)          # one wind: leave with it
  and forall d in wind(c): opp(d) not in out(c)     # never against the wind
deal dark cells; arrows; fans; tier
```

The fan's meaning is carried by the `wind` rule, which reads fans as clue
terms. This is the same pattern as Usoone's `liar`, and the second version
allows it.

- **Verdict: described with an extension** (A2, A3).
- **Cut, vs 23 Icebarn**: the pair above. Agrees.

### 25. Pipe Link

```pzl
game pipelink "Pipe Link"
family loop
space grid(w, h)
answer piece : cell -> {─, │, ┌, ┐, └, ┘, ┼}        # every cell visited: no empty
given piece
shape agree(piece),                                    # neighbors agree on the shared edge
      one_trace(edges used by piece, X = cells where ┼)                      # A4
deal givens; tier

modifier returns {           # pzprjs pipelinkr
  add clue circle at every cell value {circle, none}
    means (v = circle implies piece(at) in {─, │, ┼})
      and (v = none   implies piece(at) != ┼)
}
```

(`agree` is `line(edge(c, d))` read from both cells' pieces, a definition
inside the description.)

- **Verdict: described with an extension** (A4).
- **Variant.** Pipe Link Returns: a complete clue kind is added → **modifier**.
  pzprjs files it as a separate variety; the theory accepts modifier (it only
  adds, and every Pipe Link technique stays sound).
- **Cut, vs 26 Reflect Link**: Reflect Link adds `empty` to the domain, adds
  two clue kinds (triangles, and complete cross marks) and keeps the shape.
  Language: replaced domain + added clues → **ruleset, one game**. Theory:
  the same (domain change → ruleset). Solver: two games. Pipe Link's
  "every cell is visited, so this corner is forced" rungs are unsound in
  Reflect Link. **Flagged, against both language and theory.** If "every cell"
  is written as a rule instead of the domain, Reflect Link *removes* a rule,
  and the variation table has no row for `remove rule`.

### 26. Reflect Link

```pzl
game reflect "Reflect Link"
family loop
space grid(w, h)
answer piece : cell -> {empty, ─, │, ┌, ┐, └, ┘, ┼}
shape agree(piece), one_trace(edges used by piece, X = cells where ┼)      # A4
clue cross at every cell value {cross, none} means (piece(at) = ┼) = (v = cross)
clue triangle at cell value {◤, ◥, ◣, ◢} × (1.. | blank)
  means piece(at) = corner(v)                        # enter one leg, leave the other
    and (v has n implies 1 + sum d in legs(v) of leg(at, d, line) = n)      # A5
deal crosses; triangles; tier
```

- **Verdict: described with an extension** (A4, A5).
- **Cut, vs 25 Pipe Link**: the pair above, **flagged**.

### 27. Geradeweg

```pzl
game geradeweg "Geradeweg"
family loop
space grid(w, h)
answer line : edge -> bool
shape cell_loop(edges where line)                                             # A2
clue circle at cell value (1.. | ?)
  means degree(at, line) = 2 and (v = ? or
    (straight(at)  implies leg(at, d, line) + leg(at, opp(d), line) = v
                   for the d with line(edge(at, d)))
    and (turn(at)  implies forall d where line(edge(at, d)): leg(at, d, line) = v))  # A5
deal circles; tier
```

(`straight(c)`: the two loop edges at `c` are opposite; a formula over
`edge(c, d)`.)

- **Verdict: described with an extension** (A2, A5).
- **Cut, vs 28 Balance Loop**: clue replaced → **two games**, loop. Agrees.
  **vs collection Pearl**: clue replaced → two games. Agrees.

### 28. Balance Loop

```pzl
game balance "Balance Loop"
family loop
space grid(w, h)
answer line : edge -> bool
shape cell_loop(edges where line)                                             # A2
clue circle at cell value {white, black} × (1.. | blank)
  means degree(at, line) = 2 and
    let {d1, d2} = { d : line(edge(at, d)) }:
      (color = white implies leg(at, d1, line) = leg(at, d2, line))          # A5
      and (color = black implies leg(at, d1, line) != leg(at, d2, line))
      and (v has n implies leg(at, d1, line) + leg(at, d2, line) = n)
deal circles; tier
```

- **Verdict: described with an extension** (A2, A5).
- **Cut, vs 27 Geradeweg** (above) and **vs collection Pearl**: Pearl's black
  and white also read the legs, but with different meanings (turn, and a
  straight on each side) → clue replaced → **two games**, loop. Agrees.

### 29. Slalom

```pzl
game slalom "Slalom"
family loop
space grid(w, h), posts = dealt set of cell,
      gates = dealt set of line (straight runs of cells between two posts),
      start = dealt cell
answer line : edge -> bool
shape cell_loop(edges where line), forall p in posts: degree(p, line) = 0,  # A2
      degree(start, line) = 2
rule gate: forall g in gates:
  count c in g where degree(c, line) = 2 = 1
  and forall c in g where degree(c, line) = 2: straight across axis(g) at c
clue order at cell (a post) value 1..|gates|
# gateno(p) := the clue on a post of g
rule sequence: exists first neighbor s1 of start on the loop:
  forall g with gateno = k: count g2 in gates where before(g2, g, walk from start via s1) = k - 1   # A10
deal posts; gates; start; numbers; tier
```

- **Verdict: described with an extension** (A2, A10). The order clue is read
  as a term by `sequence` (it constrains a gate, not its post). This is legal
  in the second version.
- **Cut, vs 24 Nagare**: both are loops with a sense of travel, but the clues
  are replaced (gates in order vs arrows and wind) → **two games**, loop.
  Agrees.

### 30. Myopia

```pzl
game myopia "Myopia"
family loop
space tiling(square, w, h)                 # edges along grid lines, border included
answer line : edge -> bool
shape one_loop(edges where line)           # the library's, over corners
clue arrows at face value nonempty subset of dirs4
  means let g(d) = leg(at, d, not line) + 1 if some loop edge lies that way, else ∞:  # A5
    exists m: (forall d in v: g(d) = m) and (forall d not in v: g(d) > m)
deal clues; tier
```

- **Verdict: described with an extension** (A5, generalized to a run of
  edges that are *not* in the set).
- **Cut, vs collection Loopy**: same answer and shape; clue replaced (face
  count vs nearest-edge arrows) → **two games**, loop. Agrees.

### 31. Kouchoku

```pzl
game kouchoku "Kouchoku"
family loop
space complete(nodes), nodes = dealt set of point in Z × Z                   # A11
answer link : pair -> bool
shape forall p: count q where link(p, q) = 2,
      connected(nodes, link)                        # one Hamiltonian cycle
rule crossing: forall s1, s2 linked, disjoint ends:
  crosses(s1, s2) implies perpendicular(s1, s2)
    and the crossing point is not a node
rule through: forall s linked, p node not an end of s: not on_segment(p, s)
clue letter at node value A..Z
rule together: forall letter L:
  connected(nodes where clue = L, link) or (nodes where clue = L) = nodes
rule apart: forall p, q linked: clue(p) = none or clue(q) = none or clue(p) = clue(q)
deal nodes; letters; tier
```

The geometry is integer arithmetic on the coordinates (cross and dot
products), which the core has.

- **Verdict: described with an extension** (A11).
- **Cut, vs collection Untangle**: Untangle's answer is a point's place in the
  plane (not finite), Kouchoku's a set of links among fixed points → **two
  games, two families**. Agrees. **vs 71 One-stroke drawing**: a Hamiltonian
  cycle on points vs an Euler trail on a given graph: answer shape replaced →
  two games. Agrees.

---

## Library additions

| Id | Name | Definition in the core | Puzzles using it | Count |
| --- | --- | --- | --- | --- |
| A1 | `windows2` | the sets `{c, step(c,e), step(c,s), step(step(c,e),s)}` for every `c` where all four exist | Nurikabe, Mochikoro, LITS, Yin-Yang, Nurimisaki, Tapa | 6 |
| A2 | `cell_loop(E)`, `linked(E)` | `linked(E)(a,b) := edge(a,b) in E`; `cell_loop(E) := forall c: degree(c,E) in {0,2}` and `connected(cells where degree > 0, linked(E))`. This is the library's `one_loop` with cells as the vertex sort (Pearl's v1 L3, not taken into v2) | Yajilin, Castle Wall, Country Road, Double Back, Onsen, Nagare, Geradeweg, Balance Loop, Slalom (and Tapa-Like Loop) | 9 |
| A3 | `in(c)`, `out(c)`, `directed_loop(F)` | over `F : edge -> {none, fwd, back}`, `out(c)` = the directions `d` whose edge carries flow away from `c`; `directed_loop(F) := cell_loop(edges where F != none)` and `forall c: |in(c)| = |out(c)| <= 1` | Nagare | 1 |
| A4 | `trace_states`, `one_trace(E, X[, from s to t])` | states `(c, d)` with `edge(c, d) in E`; `next(c, d) = (step(c, d), d')`, where `d' = d` if `step(c, d) in X`, else the other direction with an `E`-edge; `trace_states(from s) = lfp` of `next` from `s`; `one_trace` := degree 2 outside `X`, degree 2 or 4 (straight pairs) in `X`, and every state reached from one state (or from `s`, ending at `t`) | Icebarn, Pipe Link, Reflect Link | 3 |
| A5 | `leg(c, d, P)` | `|sightline(c, d) until (x: not P(edge(x, opp(d))))|`: the number of consecutive edges from `c` in direction `d` satisfying `P` | Reflect Link, Geradeweg, Balance Loop, Myopia | 4 |
| A6 | `exits(S, E)` | `count e in E where exactly one cell of e in S` | Country Road, Double Back, Onsen | 3 |
| A7 | `iso(t, c, o)`, `congruent(A, B)` | `t` in the eight maps `(x,y) -> (sx·x, sy·y)` and their swaps, about center `o` (half-integers allowed); `rot180`, `mirror(a)` are instances; `congruent(A,B) := exists t, offset: {iso(t,a)+offset : a in A} = B` | LITS, Hinge, Heyawake (Ayeheya) | 3 |
| A8 | `basin(c, t)` | `component(c, cells(t) where y >= y(c), adj4)` | Aquarium | 1 |
| A9 | `ring8(c)`, `cyc_runs(L, P)` | `ring8` = the up to eight neighbors in clockwise order, cyclic; `cyc_runs` = `runs` of the ring, merging the first and last run when both ends hold `P` and not every cell does | Tapa (and Tapa-Like Loop) | 1 |
| A10 | `before(a, b, walk)` | `a` is reached from the walk's start state without passing `b`: an lfp over A4's states restricted to cells other than `b` | Slalom, Icebarn (Icelom, Icelom 2) | 2 |
| A11 | `complete(P)`, `on_segment`, `crosses`, `perpendicular` | the space of all pairs of dealt integer points; orientation tests by the sign of a cross product; `perpendicular` by a dot product of 0 | Kouchoku | 1 |
| A12 | `shift(S, k)` | `{(x, y + k) : (x, y) in S}` | Stostone | 1 |
| A13 | `inside(c, E)` | Loopy sample's `inside`, for a cell-center loop: `odd(count x in ray(c, e) where edge(x, s) in E)` | Castle Wall (shared with collection Loopy) | 1 (+ Loopy) |

None is a renamed rule. Each is a set, function or relation that a rule
quantifies over or compares; `basin` comes closest, since it is used once and
with one rule.

---

## Summary table

"Cut" is the nearest-neighbor pair as computed by the language's variation
table. "OK" means it agrees with a solver of both. "no word" means a shape
change, which has no row (read as a rule it gives a ruleset, one game).
"wrong" means it computes one game where a solver sees two.

| # | Puzzle | Verdict (rules) | Additions | Core gaps | Cut pair verdict |
| --- | --- | --- | --- | --- | --- |
| 1 | Nurikabe | extension | A1 | none | vs Mochikoro: no word / one game. **Flagged** (theory: two) |
| 2 | Mochikoro | extension | A1 | none | same pair, **flagged**; Mochinyoro modifier OK |
| 3 | Heyawake | extension | A7 (Ayeheya) | none | vs Usoone OK, vs Singles OK; variants: Heyablock no word, ? rooms vacuous modifier |
| 4 | LITS | extension | A1, A7 | none | vs Norinori: no word / one game, **flagged**; invlitso ruleset, doubtful |
| 5 | Norinori | well | none | none | vs LITS **flagged**; vs Dominosa OK |
| 6 | Hinge | extension | A7 | none | vs Heyawake: no word / one game, **flagged** |
| 7 | Yin-Yang | extension | A1 | none | vs Nurikabe OK; vs Unruly: no word / one game, **flagged** |
| 8 | Nurimisaki | extension | A1 | none | vs Cave OK |
| 9 | Cave | well | none | none | vs Range: no word / one game, **flagged** |
| 10 | Tapa | extension | A1, A9 | none | vs Mosaic OK, vs Nurikabe OK |
| 11 | Aquarium | extension | A8 | none | vs Thermometers: no word / one game, **flagged** |
| 12 | Thermometers | well | none | none | same pair, **flagged** |
| 13 | Kakurasu | well | none | none | vs Pattern OK |
| 14 | Usoone | well | none | none | vs Heyawake OK, vs Yajikazu OK |
| 15 | Yajikazu | well | none | none | vs Yajilin OK (two families) |
| 16 | Creek | well | none | none | vs Squaro OK as games; family doubtful (cell vs vertex sort) |
| 17 | Stostone | extension | A12 | none | vs Shimaguni: ruleset, one game, **flagged** (theory too); vs Dosun-Fuwari OK |
| 18 | Yajilin | extension | A2 | none | vs Yajikazu OK, vs Tracks OK |
| 19 | Castle Wall | extension | A2, A13 | none | vs Yajilin OK |
| 20 | Country Road | extension | A2, A6 | none | vs Double Back OK |
| 21 | Double Back | extension | A2, A6 | none | vs Country Road OK |
| 22 | Onsen | extension | A2, A6 | none | vs Country Road OK |
| 23 | Icebarn | extension | A4 (A10 for variants) | none | vs Nagare OK |
| 24 | Nagare | extension | A2, A3 | none | vs Icebarn OK |
| 25 | Pipe Link | extension | A4 | none | vs Reflect Link: ruleset, one game, **flagged** (theory too) |
| 26 | Reflect Link | extension | A4, A5 | none | same pair, **flagged** |
| 27 | Geradeweg | extension | A2, A5 | none | vs Balance OK, vs Pearl OK |
| 28 | Balance Loop | extension | A2, A5 | none | vs Geradeweg OK, vs Pearl OK |
| 29 | Slalom | extension | A2, A10 | none | vs Nagare OK |
| 30 | Myopia | extension | A5 | none | vs Loopy OK |
| 31 | Kouchoku | extension | A11 | none | vs Untangle OK, vs One-stroke OK |

## Counts

**On the rules alone** (criterion 1): described well **7** (Norinori, Cave,
Thermometers, Kakurasu, Usoone, Yajikazu, Creek); with an extension **24**;
not described **0**. No puzzle needed a change to the core. The
second-version features did real work: clues as terms (Usoone, Nagare,
Slalom, Nurikabe's `onenumber`), complete clue kinds (Nurimisaki, Reflect
Link, Pipe Link Returns), bounded fillings (Tapa, Stostone), lfp over tuples
(A4, A10) and list values (Tapa).

**Strictly, with criteria 2 and 3**: 13 puzzles have a nearest-neighbor cut
the language's table does not decide correctly (Nurikabe, Mochikoro, LITS,
Norinori, Hinge, Yin-Yang, Cave, Aquarium, Thermometers, Stostone, Pipe Link,
Reflect Link), or a named variant whose word is missing or doubtful
(Heyawake: Heyablock, ? rooms). Strict tally: **well 4** (Kakurasu, Usoone,
Yajikazu, Creek), **extension 14**, **failing criterion 2 or 3 with no core
gap: 13**, **not described 0**. The test has no verdict for "rules stated,
cut wrong"; these 13 are reported apart.

**Shared additions**: 24 puzzles were described with an extension. Those
whose additions are used by no other puzzle are Aquarium (A8), Stostone (A12)
and Kouchoku (A11): 3 of 24, well under half. A13 is Loopy's. Reuse is
concentrated in A2 (9 puzzles), A1 (6), A5 (4), A4 (3), A6 (3) and A7 (3).

## The cut, and what went wrong

32 pairs were examined. 24 come out right. **8 come out wrong or undecided
under the language's variation table**, which is more than the 5 allowed for
the whole corpus:

1. Nurikabe – Mochikoro
2. LITS – Norinori
3. Hinge – Heyawake
4. Yin-Yang – Unruly (collection)
5. Cave – Range (collection)
6. Aquarium – Thermometers
7. Stostone – Shimaguni
8. Pipe Link – Reflect Link

All eight have the same shape. **Two puzzles with no clue kind between them,
or with the same clue kind, differ only in clue-free predicates.** The
table's rows send a replaced `rule` to **ruleset**, one game, and have **no
row at all for a changed `shape`**. A solver calls every one of these pairs
two games. In each, the techniques that read the replaced predicate become
unsound: Nurikabe's escape, Range's adjacency, Pipe Link's every-cell
corners. So the theory's own principle ("a ruleset keeps its game's
techniques") also says two games, and the table's structural test for
"changes a predicate in place → ruleset" is too generous.

- In the first six pairs, the theory's definition of a game ("one answer
  shape, one clue vocabulary, one kind of freedom") gives the right answer,
  provided the differing predicates are filed as `shape`. The language
  cannot compute this, because the table lacks a `replace shape` row.
  Whether a predicate is shape or rule is also the author's choice: the
  theory's definitions of both fit every clue-free predicate. So the word
  depends on factoring, the defect `collection.md` found for Path and Pairs.
- In Stostone – Shimaguni, the replaced predicate (`fall` vs different block
  sizes) reads most naturally as a rule. In Pipe Link – Reflect Link, the
  difference is a domain change (`empty` allowed) plus added clues. In both,
  the language and the theory compute **one game (ruleset)**, and both are
  wrong. The theory can name the part that differs, but files it as a
  ruleset.

**What would have to change**: a `replace shape` row (separate game); a
`remove rule` row (absent today, needed for Reflect Link written the other
way); and a test separating shape from goal predicate that does not depend
on the author. Alternatively, file a replaced clue-free predicate as a
separate game unless the replacement is a parameter change (Star Battle's
`k`, Double Back's 2 → 4 crossings).

**Other doubts, not counted as cut failures**:

- Heyawake's ? rooms compute as a vacuous modifier.
- invlitso computes as a LITS ruleset where a solver sees another game.
- Creek and Squaro compute as two families because the answers sit on
  different sorts.
- The list files Heyabon as a Heyawake variant, but its pzprjs rules make it
  a circle-moving puzzle of the drawn-movement family. The language computes
  it as a separate game, which is right.

## Techniques

The cited sources (puzz.link and pzprjs rules, Janko's index pages, Ludii,
Demystify) **name no techniques** for any of these 31. As a check of the form
only, two standard ones were stated: Nurikabe's `unreachable` (a `premise`
over a chain-length lfp on the marks, a markable Tactic), and Yajilin's
saturated arrow (a `premise`). Both fit the technique form without change.
Neither was checked by enumeration.
