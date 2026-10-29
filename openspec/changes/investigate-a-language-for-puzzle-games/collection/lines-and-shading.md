# Experiment B, part 2: nineteen games in the language

Written 2026-10-29 against `language.md` (task 3.3), `theory.md` and
`taxonomy.md` § "Disagreements with the catalog". Sources read per game:
`help/games/<id>.md`, the "Rules:" requirements of `openspec/specs/<id>/spec.md`,
the game's `paramConfig` and its `*_RUNGS` list, and where a rung's meaning was
not in the help, its reason type or hint sentence (`hint.ts`, `hint-text.ts`,
`solver.ts`). Games: Pearl, Tracks, Path, Signpost, Rome, Bridges, Spokes,
Slant, Sticks, Singles, Mosaic, Pattern, Unruly, Clusters, Bricks, Light Up,
Tents, Boats, Star Battle.

Conventions used throughout, so they are not repeated per game:

- Every game has a `difficulty` item (a tier). Each is written once as
  `setting tier { deal tier: ... }`; it contains only a deal change, so the
  computed word is **generator setting**, and the catalog files every one as a
  plain item. Agrees in all 19; not listed again per game.
- Width and height (`dimensionParamConfig`) are `size`; the computed word is
  **size**, as filed. Agrees in all 19.
- Every game's freedom is `fill`; nothing here moves.
- Tier names on technique lines follow the game's own words (help page or
  difficulty doc); where a rung's tier is not stated anywhere it is given as
  the lowest tier the help places it at.
- Library additions are numbered `L1..` and core changes `C1..`; the
  consolidated definitions are in § "Library additions, defined" and § "Core
  changes" at the end. A game's section names the numbers it needs.

## Pearl

```pzl
game pearl "Pearl"
family loop
size w in 5.., h in 5..
space grid(w, h)
answer line : edge -> bool              # edges between orthogonal cells
marks mark : edge -> {line, cross, unknown}
shape one_loop(edges where line, over cell)        # L3: cells are the vertices
clue black at cell value {black}
  means turn(at, line)                                          # L2
    and forall d in dirs4 where line(edge(at, d)):              # L1
          straight(step(at, d), line)
clue white at cell value {white}
  means straight(at, line)
    and exists d in dirs4 where line(edge(at, d)):
          turn(step(at, d), line) or turn(step(at, opp(d)), line)
freedom fill
deal clues: which cells carry a pearl; tier

setting tier { deal tier: Easy | Normal }
```

Techniques (rungs `square`, `blackRunsOn`, `blackCannotRunOn`,
`whiteCannotTurn`, `whiteTurnsOpposite`, `closesEarly`, `closesEarlyThrough`):

```pzl
technique blackRunsOn tier Easy
  for cell c with clue black, dir d in dirs4
  premise mark(edge(c, d)) = line
  conclude mark(edge(step(c, d), d)) = line
technique closesEarly tier Normal
  for edge e
  premise mark(e) = unknown and closes_cycle(e, edges where mark = line)
          and exists cell p with clue black or white:
                p not on the cycle e closes
  conclude mark(e) = cross
```

`closes_cycle` is Loopy's (language.md); the rest reads directions, which the
library's `grid` does not label.

Variations: only the tier. No disagreement.

Did not fit: **L1** (direction-labeled grid incidence: `dirs4`, `step`,
`edge(c, d)`, `opp`), **L2** (`straight`, `turn`), **L3** (`one_loop` and
`degree` over a named vertex sort: the library's `one_loop` is stated for
vertices and edges, and Pearl's loop runs through cells). L2 is a geometric
definition, not a renamed rule: "black" is not `turn`, it is `turn` plus a
condition on two neighbors. No core change. Nothing left as prose.

## Tracks

```pzl
game tracks "Tracks"
family path
size w in 4.., h in 4..
space grid(w, h), border edges                   # L4: an edge from a border slot to its end cell
answer track : edge -> bool                      # inner edges and border edges
given track [some edges]                         # the pre-laid pieces
marks square : cell -> {track, notrack, unknown},
      side   : edge -> {track, cross, unknown}
shape simple_path(edges where track, s, t)       # L5
clue entrance at slot (left end of a row)    value {A} means s = at
clue exit     at slot (bottom end of a column) value {B} means t = at
clue count at slot (top of each column, right of each row) value 1..
  means count c in line(at) where degree(c, track) > 0 = v
freedom fill
deal clues: every line's count, the two stations, some given pieces; tier

setting tier { deal tier: Easy | Normal | Tricky }
setting single-ones {
  replace deal clues: no two clues adjacent in the run "top left to right,
    then right side top to bottom" are both 1, and neither end of that run is 1
}
```

The help's "only straight and 90-degree curved rails, and the track may not
cross itself" is not written: on a square grid with degree at most 2 per cell
it follows from `simple_path`. The language shows two of the help's three
rules are the shape.

Techniques (10 rungs):

```pzl
technique clueFull tier Easy
  for slot k with clue count v
  premise count c in line(k) where square(c) = track = v
  conclude forall c in line(k) where square(c) = unknown: square(c) = notrack
technique onlyOneSideLeft tier Easy
  for cell c, dir d in dirs4
  premise square(c) = track and side(edge(c, d)) = unknown
          and forall d2 in dirs4 - {d}: side(edge(c, d2)) != unknown
          and count d2 in dirs4 where side(edge(c, d2)) = track = 1
  conclude side(edge(c, d)) = track
```

`crossingParity` ("every entry to the striped block needs an exit") states as
a count over the edges leaving a rectangle `B`, `count e leaving B where
side(e) = track` mod 2, with the stations counted in: arithmetic mod 2 is in
the core. `wouldCloseLoop` uses `closes_cycle`.

Variations:

| Variation | Computed | Catalog | |
| --- | --- | --- | --- |
| Disallow consecutive 1 clues | generator setting (deal only) | plain item | agrees |

Did not fit: **L1**, **L4** (border edges: an edge joining a slot to the
cell at its row's or column's end; the library has slots but no incidence
from a slot into the grid), **L5** (`simple_path(E, s, t)`). No core change.

## Path

The two rulesets are written over one clue kind, so that the description can
be compared with the theory's reading ("one relation inside one predicate").

```pzl
game path "Path"
family path
size w in 3.., h in 3..
space grid(w, h) minus walls, walls = dealt set of edge     # no line crosses a wall
answer line : edge -> bool
marks mark : edge -> {line, cross, unknown}
clue number at cell value 1..K
  means degree(at, line) = takes(v)
shape forall c with no clue number: degree(c, line) = 2,
      acyclic(edges where line)
rule meet: forall cells a, b with clue number:
      joined(a, b, edges where line, cells with clue number)          # L6
      implies meets(number at a, number at b)                         # C1
freedom fill
deal numbers; walls; tier

ruleset Path {
  replace parameter takes(v) = 1 if v in {1, K} else 2
  replace parameter meets(a, b) = |a - b| = 1
  replace deal numbers: each of 1..K on one cell
}
ruleset Pairs {
  replace parameter takes(v) = 1
  replace parameter meets(a, b) = a = b
  replace deal numbers: each number on two cells
}
setting tier { deal tier: Easy | Normal | Tricky | Unreasonable }
```

Under Path, degree 1 only at 1 and K plus `acyclic` makes the line one path,
and every stretch between two numbers differing by 1 then forces the order
1, 2, ..., K; so "passes the numbers in order" needs no rule of its own.

Techniques (rungs `forced`, `breaks`, `weighed`):

```pzl
technique forced tier Easy
  for cell c
  premise count e in edges(c) where mark(e) = unknown and not closed(e)
          = need(c)                      # need(c) = takes - lines drawn at c
  conclude forall e in edges(c) where mark(e) = unknown and not closed(e):
             mark(e) = line
technique breaks tier Normal
  for edge e
  premise mark(e) = unknown and
          with mark(e) = line:                                        # C5
            exists c: dead_end(c) or cut_off(c)
            or closes_cycle(e, edges where mark = line)
            or exists numbered a, b: joined(a, b, ...) and not meets(...)
  conclude mark(e) = cross
```

`closed(e)` (a full square beside it, or a join of two numbers that may not
meet) is a definition over marks. `weighed` is `breaks` over every pair of a
square's four edges, still `with`, still one board.

Variations:

| Variation | Computed | Catalog | |
| --- | --- | --- | --- |
| Path, Pairs | ruleset (replaced parameters, and a deal), as factored above | ruleset | agrees, but see below |

**The computed word depends on how the description is factored.** Written as
above, Path and Pairs replace two parameters and a deal: a ruleset, as the
theory says from the measured rungs. Written the plain way, each ruleset gives
the number its own `means` ("this square is an end of a line to the like
number"; "the line passes this square between k-1 and k+1"): `replace clue`,
so a **separate game**. Both are faithful. The language has no normal form
that makes the word a property of the rules rather than of the author.

Did not fit:

- **C1**: `meets(number at a, number at b)` reads two clues' values in one
  formula. A clue's value is a term only inside its own `means` (`v`). The
  workaround the language allows is to deal the numbers as a labeling of the
  space (`num = dealt cell -> 1..K`), which states the rule but makes the
  numbers space, not clues: Path's clue vocabulary becomes empty and any
  variation in the numbers computes as a board shape.
- **L6** `joined(a, b, E, S)`: a chain from `a` to `b` along `E` whose inner
  cells avoid `S`.
- **C5** (technique layer): `breaks` and `weighed` are bounded hypotheticals
  (the help: "each way is looked at on the board as it stands, so nothing needs
  following further"). The language's only hypothetical form is `premise
  suppose ...`, which it marks unmarkable; these are not Search.
- Language defect: the factoring dependence above.

## Signpost

```pzl
game signpost "Signpost"
family path
size w in 1.., h in 1..; N = w * h
space grid(w, h)
answer at : 1..N -> cell                   # bijection, as Ascent's
given at                                   # some cells show their number; always 1 and N
marks link : cell -> cell or none          # the player's partial "next"
shape bijection(at)
clue arrow at cell value dirs8             # every cell but the one holding N
  means at^-1(at) = N or at(at^-1(at) + 1) in ray(at, v)             # L7
freedom fill
deal givens: which numbers show (1 and N always); where 1 and N sit; tier

setting corners { replace deal givens: at(1) = top-left, at(N) = bottom-right }
setting tier    { deal tier: Easy | Unreasonable }
```

There is no `path(at, adj)` shape: the arrow clue replaces adjacency, so the
"path" is entirely clue meaning.

Techniques (rungs `onlyNext`, `onlyBefore`):

```pzl
technique onlyNext tier Easy
  for cell c with clue arrow d
  premise link(c) = none and |cands(c)| = 1
    where cands(c) = ray(c, d) where
            (not exists c0: link(c0) = x)                 # x follows nothing yet
        and not chain(x, c via link)                      # would close a loop
        and fits(c, x)                                    # numbers agree
  conclude link(c) = the x in cands(c)
technique onlyBefore tier Easy
  dual: over the cells whose ray contains x, with link^-1
```

`fits(c, x)`: where both cells have a number derived from a given along their
chains, `num(x) = num(c) + 1`. A derived number is a given's number plus the
count of cells on the chain between them: counting over a set `chain`
defines (L8).

Variations:

| Variation | Computed | Catalog | |
| --- | --- | --- | --- |
| Start and end in corners | generator setting (where the always-given 1 and N are dealt) | plain item | agrees |

Did not fit: **L7** `ray(c, d)` over eight directions (the library's
`sightline` has four and a stop predicate; a ray is `sightline` with no stop,
on `dirs8`), **L8** chain numbering for the technique. `at^-1` is Ascent's.
Also **C4**: the `link` mark's meaning, `next(c) = c'` i.e.
`at(at^-1(c) + 1) = c'`, has to be stated for soundness to be checkable, and
the `marks` block has no place for it. Otherwise fits.

## Rome

```pzl
game rome "Rome"
family path
size w in 3.., h in 3..
space grid(w, h), regions area = dealt partition(cells), goals = dealt set of cell
answer arrow : cell - goals -> dirs4
given arrow
marks cand : cell -> set of dirs4
rule distinct: forall r in area: distinct(arrow over r - goals)
rule onboard:  forall c: step(c, arrow(c)) != none                         # L1
rule reach:    forall c: exists g in goals:
                 chain(c, g via c2 -> step(c2, arrow(c2)))
freedom fill
deal givens: which arrows show; tier

setting tier { deal tier: Easy | Normal | ... }
```

`reach` is one `chain` over a relation built from the answer; the core takes
it. (Upstream's own reading, "no off-grid arrow and no loop", is equivalent
on a finite board and is the same `chain`.)

Techniques (rungs: the candidate engine's `dup` and notes rungs, `single`,
`regionsFull`, `hiddenSingle`, `loop`, `onlyHome`, `reach`, `opposite`,
`pair`):

```pzl
technique loop tier Easy
  for cell c, dir d in cand(c)
  premise chain(step(c, d), c via c2 -> step(c2, arrow(c2)) where arrow placed)
  conclude d not in cand(c)
technique opposite tier Normal
  for cell c, dirs {d, opp(d)} = cand(c)
  premise step(c, d) and step(c, opp(d)) in area(c)
  conclude forall d2 in {d, opp(d)}: opp(d2) not in cand(step(c, d2))
```

(`opposite`: the left neighbor pointing right either closes a loop with `c`
or repeats `c`'s arrow in the area.) `regionsFull`, `hiddenSingle`, `pair` are
Solo's techniques over `units = area`, unchanged: the Latin family's naked and
hidden rungs carry to Rome's distinctness rule, as the theory's "stated over
relations" predicts. `reach`: exactly one candidate arrow anywhere points
into a goal's group while an empty cell remains, so it is placed.

Variations: only the tier.

Did not fit: **L1**. Nothing else. Goals and areas are dealt space.

## Bridges

```pzl
game bridges "Bridges"
family links
size w in 3.., h in 3..; maxb in 1..4 = 2
space grid(w, h), islands = dealt set of cell,
      spans = spans(islands)            # L9: two islands in line with none between
answer bridges : span -> 0..maxb
marks bridges : span -> 0..maxb,
      limit   : span -> 0..maxb,        # "at most"; 0 is the cross
      done    : island -> bool          # "island completed"
clue count at island value 1..4*maxb
  means sum s in spans(at) of bridges(s) = v
rule nocross: forall s1, s2 in spans: crosses(s1, s2)                # L9
                implies bridges(s1) = 0 or bridges(s2) = 0
shape connected(islands, spans where bridges > 0)
freedom fill
deal islands: share of cells (5..30%); expansion (how far a new island goes); tier

modifier no-loops { add rule acyclic(spans where bridges > 0) }   # on when allow-loops is off
ruleset  max-bridges { replace parameter maxb in {1, 3, 4} }
setting  islands    { replace deal islands: share }
setting  expansion  { replace deal islands: expansion }
setting  tier       { deal tier: Easy | Normal | Tricky }
```

Techniques (rungs `exactSpace`, `everyNeighbor`, `wouldCloseLoop`,
`needsThisWay`, `wouldSealGroup`, `wouldStarve`, `mustReachOut`):

```pzl
technique exactSpace tier Easy
  for island i with clue v
  premise v - sum s in spans(i) of bridges(s) = sum s in spans(i) of room(s)
  conclude forall s in spans(i): bridges(s) = bridges(s) + room(s)
    where room(s) = min(limit(s), need(other end of s) + bridges(s)) - bridges(s)
technique wouldCloseLoop tier Normal              # brought by no-loops
  for span s joining a, b
  premise bridges(s) = 0 and chain(a, b via spans where bridges > 0)
  conclude limit(s) = 0
```

`wouldCloseLoop` reads `acyclic`, so it belongs to the no-loops modifier, as
`theory.md` § "What a variation keeps" item 1 measured (with `mustReachOut`);
by monotonicity the plain game's techniques all stay sound under it.
`wouldSealGroup` reads `connected`: the group closed by one more bridge is a
`chain` component whose islands all have their counts.

Variations:

| Variation | Computed | Catalog | |
| --- | --- | --- | --- |
| No loops (allow-loops off) | modifier (add rule) | modifier | agrees |
| Max. bridges per direction | **ruleset** (a replaced parameter), or **size** if `maxb` is put in `size` | modifier | **disagrees** |
| % island squares, expansion factor | generator setting | plain items | agrees |

The max-bridges disagreement is also a disagreement **inside** the
investigation: `theory.md` § "The catalog's words" files a parameter that
bounds a rule as a modifier ("adds a rule ... or bounds one by a parameter")
and `taxonomy.md` agrees, while `language.md`'s table computes "a changed
parameter" as a ruleset. The language cannot tell a bounding parameter from
another, nor a parameter from a size (`maxb` scales nothing, but `size` and
`replace parameter` both accept it).

Did not fit: **L9** (`spans(I)`, `crosses(s1, s2)`: geometry, definable from
coordinates). **C4**: the marks `limit` (means `bridges(s) <= limit(s)`) and
`done` (means the island's drawn bridges are all it has) need stated meanings.

## Spokes

```pzl
game spokes "Spokes"
family links
size w in 2.., h in 2..
space grid(w, h), hubs = cells - dealt holes,
      links = links8(hubs)              # L10: king-move pairs of hubs
answer line : link -> bool
marks mark : link -> {line, unused, unknown}
clue count at hub value 1..8
  means count l in links(at) where line(l) = v
rule nocross: forall l1, l2 in links: crosses_diag(l1, l2)            # L10
                implies not (line(l1) and line(l2))
shape connected(hubs, links where line)
freedom fill
deal holes; tier

setting tier { deal tier: Easy | Normal | Unreasonable }
```

Techniques (rungs `twoOnes`, `saturation`, `exhaustion`, `breaks`):

```pzl
technique saturation tier Easy
  for hub h with clue v
  premise count l in links(h) where mark(l) = line = v
  conclude forall l in links(h) where mark(l) = unknown: mark(l) = unused
technique twoOnes tier Easy
  for link l joining a, b with clue count 1 at both
  premise exists hub h not in {a, b}
  conclude mark(l) = unused
```

`breaks` is the bounded hypothetical again ("what one spoke would do the other
way, on the board as it stands"): **C5**.

Variations: only the tier.

Did not fit: **L10**. The auto-cross of a drawn diagonal's crossing is input,
not a rule (it is `nocross` read as a mark), so it is not written. **C5** for
`breaks`.

## Slant

```pzl
game slant "Slant"
family links
size w in 2.., h in 2..
space grid(w, h)                        # cells, and vertices at the corners
answer slash : cell -> {fwd, back}
marks slash : cell -> {fwd, back, unknown},
      alike : edge -> bool              # "these two squares slant the same way"
clue count at vertex value 0..4
  means count c in cells(at) where at in diag(c, slash(c)) = v          # L11
shape acyclic({diag(c, slash(c)) : c in cells})       # on the vertex graph
freedom fill
deal clues: which vertices show; tier

setting tier { deal tier: Easy | Normal }
```

Techniques (rungs `clue-fill`, `clue-empty`, `loop`, `deadend`, `equiv`,
`mark-clue`, `mark-v`):

```pzl
technique clueFill tier Easy
  for vertex x with clue v
  premise count c in cells(x) where slash(c) known and x in diag(c, slash(c)) = v
  conclude forall c in cells(x) where slash(c) = unknown: x not in diag(c, slash(c))
technique loop tier Easy
  for cell c, s in {fwd, back}
  premise slash(c) = unknown and
          chain(ends of diag(c, s) via {diag(c2, slash(c2)) : slash(c2) known})
  conclude slash(c) = other(s)
```

`mark-clue` and `mark-v` conclude a mark `alike(e) = true`, whose meaning is
`slash(a) = slash(b)` for the two cells of `e`; `equiv` reads it. `deadend`
reads "a set of vertices cut off from the border would need a loop": a
`connected` premise.

Variations: only the tier.

Did not fit: **L11** `diag(c, s)` (the two corners a slash joins).
**C4**: `alike` is a mark that the answer does not record and whose meaning
must be stated for `mark-clue`'s conclusion to be checked for soundness.

## Sticks

```pzl
game sticks "Sticks"
family links
size w in 2.., h in 2..
space grid(w, h), blocks = dealt set of cell, open = cells - blocks
answer dir : open -> {horiz, vert}
marks dir : open -> {horiz, vert, unknown}
clue length at open cell value 1..max(w, h)
  means |segment(at, dir)| = v                                         # L12
clue joins at block value 0..4
  means count d in dirs4 where step(at, d) in open
          and dir(step(at, d)) = axis(d) = v          # a line runs into the block
rule one-number: forall c in open: count c2 in segment(c, dir) with clue length <= 1
freedom fill
deal blocks: share (5..100%), symmetry; which cells show numbers; tier

setting blocks   { replace deal blocks: share }
setting symmetry { replace deal blocks: symmetry }
setting tier     { deal tier: Easy | Unreasonable }
```

No `shape`: the answer is a direction per cell, and "a line" is a run the
`segment` definition reads, not a structure of the answer.

Techniques (rungs `tooLong`, `unreachable`, `twoClues`, `overConnected`,
`starved`):

```pzl
technique tooLong tier Easy
  for open cell c, axis a
  premise dir(c) = unknown and
          with dir(c) = a:                                             # C5
            exists n in segment(c, dir) with clue length v: |segment(n, dir)| > v
  conclude dir(c) = other(a)
technique twoClues tier Easy
  for open cell c, axis a
  premise dir(c) = unknown and
          with dir(c) = a: count n in segment(c, dir) with clue length >= 2
  conclude dir(c) = other(a)
```

Here the `with` is a one-cell substitution and could be inlined as a formula
about the runs on both sides of `c`; the help says "every step rules one
direction out", so every rung has this shape.

Variations:

| Variation | Computed | Catalog | |
| --- | --- | --- | --- |
| %age of blocks, symmetry | generator setting (deal of a dealt space) | plain items | agrees |

Did not fit: **L1**, **L12** `segment(c, f)` (the maximal run along `c`'s
axis of open cells with `c`'s direction). **C5** for notation only (it can be
inlined). Language gap: the table in "Variations, and the word each gets" does
not say what a change to how a `dealt` space is dealt computes to; it is read
here as a deal change.

## Singles

```pzl
game singles "Singles"
family shading
size w in 2..MAX, h in 2..MAX
space grid(w, h)
answer shade : cell -> {shaded, clear}
marks mark : cell -> {shaded, circled, unknown}
clue number at cell value 1..max(w, h)          # every cell carries one
rule unrepeated: forall L in rows + cols:
       distinct(number at c over L where shade(c) = clear)            # C1
shape no_adjacent(cells where shaded, adj4),
      connected(cells where clear, adj4)
freedom fill
deal tier

setting tier { deal tier: Easy | Normal }
```

Techniques (rungs `sandwich`, `pair`, `corner4`, `corner3`, `corner2`,
`offset`, `adjBlack`, `sameLine`, `boxedIn`, `split`):

```pzl
technique sandwich tier Easy
  for line L, i
  premise number at L[i-1] = number at L[i+1]                          # L13, C1
  conclude mark(L[i]) = circled
technique split tier Normal
  for cell c
  premise mark(c) = unknown and
          with mark(c) = shaded: not connected(cells where mark != shaded, adj4)
  conclude mark(c) = circled
```

Variations: only the tier.

Did not fit: **C1**. `unrepeated` compares the numbers of two cells, and no
single clue's `means` can say it (the workaround is again a dealt labeling of
the space, which leaves Singles with no clue vocabulary at all). **L13**
(`L[i]`). **C5** for `split`.

## Mosaic

```pzl
game mosaic "Mosaic"
family shading
size width in 3.., height in 3..
space grid(width, height)
answer shade : cell -> {shaded, clear}
marks mark : cell -> {shaded, clear, unknown}
clue count at cell value 0..9
  means count c in adj8(at) + {at} where shade(c) = shaded = v
freedom fill
deal clues: those the solver used, and with aggressive also every one it can drop; tier

setting aggressive { replace deal clues: also drop each remaining clue the tier still solves without }
setting tier       { deal tier: Easy | Normal | Unreasonable }
```

Techniques (rungs `met`, `needsAll`, `needsMore`, `sameNeed`):

```pzl
technique met tier Easy
  for cell c with clue v
  premise count x in nb(c) where mark(x) = shaded = v
  conclude forall x in nb(c) where mark(x) = unknown: mark(x) = clear
technique needsMore tier Normal
  for cells a, b with clues
  premise need(a) - need(b) = count x in nb(a) - nb(b) where mark(x) = unknown
  conclude forall x in nb(a) - nb(b) where mark(x) = unknown: mark(x) = shaded
```

(`nb(c) = adj8(c) + {c}`, `need(c) = v - count shaded in nb(c)`: definitions
inside the description.)

Variations:

| Variation | Computed | Catalog | |
| --- | --- | --- | --- |
| Aggressive generation | generator setting | plain item | agrees |

Did not fit: nothing.

## Pattern

```pzl
game pattern "Pattern"
family shading
size w in 1.., h in 1..
space grid(w, h)
answer shade : cell -> {shaded, clear}
marks mark : cell -> {shaded, clear, unknown}
clue runs at slot (each row and column end) value list of 1..max(w, h)   # C2
  means runs(line(at), shaded) = v                                        # L14
freedom fill
deal tier

setting tier { deal tier: Easy | Unreasonable }
```

Techniques (rungs `overlap`, `unreachable`, `lineEmpty`, `intersection`):

```pzl
technique intersection tier Easy                  # "every fit agrees"
  for slot k with clue v, cell c in line(k), x in {shaded, clear}
  premise not fit_exists(line(k), v, marks with mark(c) = other(x))      # L14
  conclude mark(c) = x
technique lineEmpty tier Easy
  for slot k with clue v
  premise |v| = 0
  conclude forall c in line(k): mark(c) = clear
```

`fit_exists(L, v, m)` is a chain over pairs (position in `L`, runs placed so
far), a step being one cell left clear or the next run laid; it is true when
the chain reaches (end, `|v|`) without crossing a mark. This needs
transitive closure **over tuples**; the core says `chain` without saying
whether its steps may be pairs. `overlap` and `unreachable` are special cases
of `intersection` (leftmost and rightmost fits).

Variations: only the tier.

Did not fit:

- **C2**: the clue's value is a list of run lengths of any length up to the
  line's. The core's value sets are finite sets of scalars and its only clue
  terms are `at` and `v`; the meaning needs `|v|` and `v[k]` (or equality of
  two lists). Without it, Pattern's clue can only be prose.
- **L14** `runs(L, P)` (the list of the lengths of the maximal `P`-runs of
  `L`) and `fit_exists`.
- Clarification needed: TC over tuples, for `fit_exists`.

## Unruly

```pzl
game unruly "Unruly"
family shading
size w2 in 6.. even, h2 in 6.. even
space grid(w2, h2)
answer piece : cell -> {zero, one}
given piece
marks piece : cell -> {zero, one, unknown}
rule nothree:  forall L in rows + cols, i:
                 not (piece(L[i]) = piece(L[i+1]) = piece(L[i+2]))     # L13
rule balanced: forall L in rows + cols, x: count c in L where piece(c) = x = |L| / 2
freedom fill
deal givens; tier

modifier unique {
  add rule forall L1, L2 in rows, L1 != L2: exists i: piece(L1[i]) != piece(L2[i])
  add rule forall L1, L2 in cols, L1 != L2: exists i: piece(L1[i]) != piece(L2[i])
}
setting tier { deal tier: Easy | Normal | Tricky }
```

Techniques (rungs `threes`, `complete`, `unique`, `nearcomplete`):

```pzl
technique threes tier Easy
  for line L, i, x
  premise piece(L[i]) = x and piece(L[i+1]) = x and piece(L[i+2]) = unknown
  conclude piece(L[i+2]) = other(x)
technique complete tier Easy
  for line L, x
  premise count c in L where piece(c) = x = |L| / 2
  conclude forall c in L where piece(c) = unknown: piece(c) = other(x)
technique unique tier Normal                         # brought by the modifier
  for lines L1 != L2 parallel, x, i
  premise count c in L1 where piece(c) = x = |L1| / 2
      and L2 agrees with L1 at every known cell of L2,
          and lacks one x, which only L2[i] (unknown, where L1 has x) can take
              without matching L1 everywhere
  conclude piece(L2[i]) = other(x)
```

Variations:

| Variation | Computed | Catalog | |
| --- | --- | --- | --- |
| Unique rows and columns | modifier (add rule; its size bound is a consequence) | modifier | agrees |

The size bound in the modifier's note (a 6-wide grid at most 14 high) is the
deal test at work: the added rule is unsatisfiable on larger boards. It need
not be written; the language's deal test computes it.

Did not fit: **L13** `L[i]` (the i-th element of a line; definable from the
line's order by counting). Otherwise fits, the modifier included.

## Clusters

```pzl
game clusters "Clusters"
family shading
size w, h
space grid(w, h)
answer color : cell -> {square, disc}
given color [on dotted cells]
marks color : cell -> {square, disc, unknown}
clue tile at cell value {dot, plain}               # dealt at every cell
  means count c in adj4(at) where color(c) = color(at)
        = 1 if v = dot, >= 2 if v = plain
freedom fill
deal tier

setting tier { deal tier: Easy | Normal | Unreasonable }
```

"All of these tiles are given" makes the absence of a dot a clue: written as
a clue dealt at every cell with two values. The language allows this; no
addition.

Techniques (rungs `direct`, `count`):

```pzl
technique isolated tier Easy                       # one face of `direct`
  for cell c, x
  premise forall n in adj4(c): color(n) = other(x)
  conclude color(c) = other(x)
technique dotShared tier Normal                     # one face of `count`
  for cells a with clue dot, b, x = color(a)
  premise count n in adj4(a) where color(n) = x = 0
      and needs(b, x) >= |adj4(a) & adj4(b) where unknown|   # b forces one shared square to x
  conclude forall n in adj4(a) - adj4(b) where color(n) = unknown: color(n) = other(x)
```

`direct` as a whole is "the other color breaks a rule outright", a `with`
(C5) over every rule at `c` and its neighbors.

Variations: only the tier.

Did not fit: nothing for the rules. C5 for `direct` stated whole.

## Bricks

```pzl
game bricks "Bricks"
family shading
size w in 2.., h in 2..
space bricks(w, h)                 # L15: offset rows, adj6, rows as lines, below(c)
answer shade : cell -> {shaded, clear}
marks mark : cell -> {shaded, clear, unknown}
clue count at cell value 0..6
  means shade(at) = clear and count c in adj6(at) where shade(c) = shaded = v
rule nothree:   forall L in rows, i: not (shaded(L[i]) and shaded(L[i+1]) and shaded(L[i+2]))
rule supported: forall c not in bottom row: shade(c) = shaded
                  implies exists b in below(c): shade(b) = shaded
freedom fill
deal tier

setting tier { deal tier: Easy | Unreasonable }     # Tricky retired
```

Techniques (rungs `three`, `unsupported`, `overcount`, `strandSupport`,
`undercount`):

```pzl
technique three tier Easy
  for row L, i
  premise mark(L[i]) = shaded and mark(L[i+1]) = shaded
  conclude mark(L[i+2]) = clear and mark(L[i-1]) = clear
technique unsupported tier Easy
  for cell c not in bottom row
  premise forall b in below(c): mark(b) = clear
  conclude mark(c) = clear
```

Variations: only the tier (the retired Tricky is a deal value no board has).

Did not fit: **L15**, a brick-wall space: the library's `hexgrid` has `adj6`
and nothing else, and Bricks needs its rows as lines, `below(c)` (the two
cells under `c`) and the bottom row. Definable from coordinates. **L13**.

## Light Up

```pzl
game lightup "Light Up"
family placement
size w in 2.., h in 2..
space grid(w, h), walls = dealt set of cell, open = cells - walls
answer bulb : open -> bool
marks mark : open -> {bulb, cross, unknown}
clue count at wall value 0..4
  means count c in adj4(at) where bulb(c) = v
rule lit:    forall c in open: bulb(c) or exists d in dirs4:
               exists b in sightline(c, d) until c2 in walls: bulb(b)
rule nosee:  forall b in open where bulb(b), d in dirs4:
               forall b2 in sightline(b, d) until c2 in walls: not bulb(b2)
freedom fill
deal walls: share (5..100%), symmetry of the walls; which walls show numbers; tier

setting walls    { replace deal walls: share }
setting symmetry { replace deal walls: symmetry }
setting tier     { deal tier: Easy | Normal | Unreasonable }
```

Techniques (rungs `forcedLight`, `clueSatisfied`, `clueSaturated`,
`discountUnlit`, `discountClue`):

```pzl
technique clueSatisfied tier Easy
  for wall k with clue v
  premise count c in adj4(k) where mark(c) = bulb = v
  conclude forall c in adj4(k) where mark(c) = unknown: mark(c) = cross
technique forcedLight tier Easy
  for open cell c not lit
  premise |lighters(c)| = 1
    where lighters(c) = ({c} + union d of sightline(c, d) until walls)
                          where mark = unknown and not lit and not beside a full clue
  conclude mark(the x in lighters(c)) = bulb
```

`discountUnlit` and `discountClue` ("a bulb that would spoil every option")
quantify over the options of one square or one clue and test each with the
bulb placed: C5, one level.

Variations:

| Variation | Computed | Catalog | |
| --- | --- | --- | --- |
| %age of walls, symmetry | generator setting | plain items | agrees |

Did not fit: nothing for the rules (`sightline` is in the library and is
exactly Light Up's beam). C5 for the two `discount` rungs.

## Tents

```pzl
game tents "Tents"
family placement
size w in 4.., h in 4..
space grid(w, h), trees = dealt set of cell, open = cells - trees
answer tent : open -> bool
witness owner : trees -> open                                        # C3
marks mark : open -> {tent, grass, unknown},
      link : edge -> bool                     # tree-tent pairing; means owner(t) = c   (C4)
clue count at slot (each row and column) value 0..
  means count c in line(at) where tent(c) = v
shape no_adjacent(open where tent, adj8)
rule matched: bijection(owner, trees, open where tent)
              and forall t in trees: owner(t) in adj4(t)
freedom fill
deal tier

setting tier { deal tier: Easy | Normal }
```

Techniques (rungs `noTree`, `treesDone`, `nextToTent`, `treeSingle`,
`treeDiagonal`, `lineCount`, `lineNeighbors`, `tentLink`, `treeLink`):

```pzl
technique noTree tier Easy
  for open cell c
  premise forall t in adj4(c) & trees: done(t)
  conclude mark(c) = grass
technique treeSingle tier Easy
  for tree t not done
  premise count c in adj4(t) & open where mark(c) != grass = 1
  conclude mark(the c) = tent
```

`done(t)`: `t` is linked, or its tent can be seen at a glance (the help's two
cases), a definition over marks that reads the `link` mark, whose meaning is
about the witness. `lineNeighbors` ("wherever a row's tents go") quantifies
over every placement of a row's tents, the same TC-over-tuples shape as
Pattern's `fit_exists`.

Variations: only the tier.

Did not fit:

- **C3, a core change.** "It is possible to match tents to trees" is an
  existential over a function (a perfect matching). First-order logic with
  counting and transitive closure cannot say it in general; Hall's condition
  quantifies over subsets, which is second order. Putting the matching in the
  `answer` states it, but then a board whose pairing is not unique (the spec
  says so: "the solution's tents are unique but its pairing need not be") has
  several answers and the language calls it ill posed. What it needs is a
  **witness**: an answer component existentially quantified and projected out
  of the uniqueness promise. Without C3 the rule is prose.
- **C4**: the `link` mark's meaning reads the witness.

## Boats

```pzl
game boats "Boats"
family placement
size w in 2..99, h in 2..99; F in 1..9; fleet : 1..F -> 0..   # fleet(k) boats of length k
space grid(w, h)
answer boat : cell -> bool
marks mark : cell -> {boat, water, unknown}
rule straight: forall r in components(cells where boat, adj4):          # L16
                 forall c1, c2 in r: row(c1) = row(c2) or col(c1) = col(c2)
rule apart:    forall c1, c2 where boat: c2 in adj8(c1) - adj4(c1) implies false
rule fleet:    forall k in 1..F:
                 count r in components(cells where boat, adj4) where |r| = k = fleet(k)
clue count at slot (each row and column) value 0..
  means count c in line(at) where boat(c) = v
clue segment at cell value {single, end(d) for d in dirs4, middle, water}
  means water: not boat(at)
        single: boat(at) and forall d: not boat(step(at, d))
        end(d): boat(at) and boat(step(at, d)) and forall d2 != d: not boat(step(at, d2))
        middle: boat(at) and exists d: boat(step(at, d)) and boat(step(at, opp(d)))
freedom fill
deal segments: which show; counts: all, or some hidden with remove-numbers; tier

ruleset fleet { replace parameter F; replace parameter fleet }   # or size: see below
setting remove-numbers { replace deal counts: hide some }
setting tier { deal tier: Easy | Normal | Tricky | Hard }
```

A given segment reads its neighbors, so by `theory.md` § "The parts" item 4
it is a clue kind, not a given of the answer.

Techniques (15 rungs, among them `givenClue`, `neverTouch`, `lineSatisfied`,
`lineForced`, `mustExtend`, `growTooLong`, `refuted`):

```pzl
technique neverTouch tier Easy
  for cell c with mark boat, x in adj8(c) - adj4(c)
  premise mark(x) = unknown
  conclude mark(x) = water
technique lineSatisfied tier Easy
  for slot k with clue v
  premise count c in line(k) where mark(c) = boat = v
  conclude forall c in line(k) where mark(c) = unknown: mark(c) = water
```

`growTooLong` and `mustExtend` read the fleet (the largest length still
missing): a count over `components` of the marks. `refuted` ("if this square
were its row's last water") is C5. A hidden count's rungs ("that hidden
number can only be ...") read a sum over the fleet: total boat cells
`sum k of k * fleet(k)` minus the shown counts.

Variations:

| Variation | Computed | Catalog | |
| --- | --- | --- | --- |
| Fleet size, fleet configuration | **ruleset** (a parameter of the `fleet` rule) if written as above; **size** if `fleet` is declared in `size` | plain items (size) | **disagrees**, or undecided |
| Remove numbers | generator setting | plain item | agrees |

The theory's own sizes include "the number of mines", a count a rule reads,
which makes the fleet a size; the language's table makes any changed rule
parameter a ruleset. Nothing in the description decides between them.

Did not fit: **L1**, **L16** `components(S, adj)` (the parts of `S` under
`adj`; `regions_of` generalized from edges to a cell set, and counting over the
parts). C5 for `refuted`.

## Star Battle

```pzl
game starbattle "Star Battle"
family placement
size n in 4..26; k in 1..3                       # n regions, k stars per unit
space grid(n, n), regions reg = dealt partition(cells, n parts)
answer star : cell -> bool
marks mark : cell -> {star, cross, unknown}
rule per-unit: forall u in rows + cols + reg: count c in u where star(c) = k
shape no_adjacent(cells where star, adj8)
freedom fill
deal regions; tier

ruleset one-star    { replace parameter k = 1 }
ruleset two-stars   { replace parameter k = 2 }
ruleset three-stars { replace parameter k = 3 }
# the least grid per k (4, 8, 12) is not written: the deal test computes it
setting tier { deal tier: Easy | Normal | Tricky }
```

Techniques (rungs `around`, `full`, `exact`, `confined`, `needed`, `crowded`,
`starved`, `banded`):

```pzl
technique full tier Easy
  for unit u
  premise count c in u where mark(c) = star = k
  conclude forall c in u where mark(c) = unknown: mark(c) = cross
technique confined tier Easy
  for units u1 (a region), u2 (a row or column)
  premise forall c in u1 where mark(c) = unknown: c in u2
      and need(u1) = need(u2)
  conclude forall c in u2 - u1 where mark(c) = unknown: mark(c) = cross
technique banded tier Normal
  for rows i..j (an interval), R = regions wholly inside rows i..j
  premise sum r in R of need(r) = sum L in rows i..j of need(L)
  conclude forall c in rows i..j - union R where mark(c) = unknown: mark(c) = cross
```

Every rung is stated in `k`, so the rulesets keep them, except `needed`, which
the theory notes is about a second star (it fires only where `k >= 2`; it is
sound for every `k`). `starved` (Tricky: "a star is tried in a square") is C5.

Variations:

| Variation | Computed | Catalog | |
| --- | --- | --- | --- |
| One, two or three stars | **ruleset** (a replaced parameter) | ruleset | agrees with the catalog; disagrees with `taxonomy.md`, which calls it a modifier |

Did not fit: nothing for the rules. C5 for `starved`. The same size-or-
parameter ambiguity as Bridges and Boats: `k` could be declared in `size`.

## Library additions, defined

Each is a definition in the core logic over the space's coordinates or
relations; none is a rule renamed.

| Id | Name | Definition | Games |
| --- | --- | --- | --- |
| L1 | `dirs4`, `dirs8`, `step(c, d)`, `edge(c, d)`, `opp(d)`, `axis(d)` | `step((x, y), d) = (x + dx(d), y + dy(d))` if on the grid, else `none`; `edge(c, d)` the edge between `c` and `step(c, d)` | Pearl, Tracks, Rome, Sticks, Boats, Signpost |
| L2 | `straight(c, E)`, `turn(c, E)` | `degree(c, E) = 2` and `exists d: edge(c, d) in E and edge(c, opp(d)) in E`; `turn` is degree 2 and not straight | Pearl |
| L3 | `one_loop(E, over V)`, `degree(v, E)` on any vertex sort | the library's definitions with the incidence named, so a loop through cells (dual edges) and one through vertices are both stated | Pearl |
| L4 | border edges | an edge joining border slot `k` to the cell at its line's end | Tracks |
| L5 | `simple_path(E, s, t)` | `degree(s, E) = degree(t, E) = 1`, every other degree 0 or 2, `acyclic(E)`, and `connected` over the vertices `E` touches | Tracks |
| L6 | `joined(a, b, E, S)` | `chain(a, b)` along `E` with every inner element outside `S` | Path |
| L7 | `ray(c, d)` | `sightline(c, d) until false`, on `dirs8` | Signpost |
| L8 | chain numbering | `num(x) = num(g) + count y where chain(g, y) and chain(y, x)` along the link mark | Signpost (technique) |
| L9 | `spans(I)`, `crosses(s1, s2)` | `spans`: pairs of `I` on one row or column with no `I` strictly between; `crosses`: a horizontal and a vertical span whose interiors share a cell | Bridges |
| L10 | `links8(H)`, `crosses_diag(l1, l2)` | king-move pairs of `H`; two links that are the two diagonals of one 2 x 2 block | Spokes |
| L11 | `diag(c, s)` | the two corners of `c` joined by slash `s` | Slant |
| L12 | `segment(c, f)` | the cells `c2` on `c`'s row (if `f(c)` is horizontal) or column, such that every cell from `c` to `c2` inclusive is open and has `f = f(c)` | Sticks |
| L13 | `L[i]` | the `x` in `L` with `count y in L before x = i - 1` | Unruly, Bricks, Singles |
| L14 | `runs(L, P)`, `fit_exists(L, v, m)` | `runs`: the list of lengths of the maximal `P`-runs of `L`, in order (needs C2); `fit_exists`: a chain over pairs (position, runs placed) | Pattern; Tents (`lineNeighbors`) |
| L15 | `bricks(w, h)` | offset rows of `w` cells, `adj6`, rows as lines, `below(c)` the two cells under `c`, and `bottom` | Bricks |
| L16 | `components(S, adj)` | the parts of `S` under `chain` along `adj`, each named by its least element so that `count` and `forall` range over them | Boats |

Reused from `language.md`'s sample: `closes_cycle` (Pearl, Tracks, Path),
`at^-1` (Signpost), `sightline` (Light Up), `connected`, `acyclic`,
`no_adjacent`, `bijection`.

## Core changes

| Id | Change | Why no library definition does it | Games |
| --- | --- | --- | --- |
| C1 | a clue's value as a term anywhere (`number at c`, or none where no clue is dealt) | a rule that relates two clues' values (Path's "joins two numbers that may meet", Singles' "no number twice among the clear") is no single clue's `means`, and the term grammar has `v` only inside one. The legal workaround deals the numbers as a labeling of the space, which empties the game's clue vocabulary and turns a change to the numbers into a board shape | Path, Singles |
| C2 | list-valued clue values with `\|v\|` and `v[k]` | the core's value sets are scalars | Pattern |
| C3 | a **witness**: an answer component existentially quantified and projected out of uniqueness | a perfect matching's existence is not first-order with counting and TC; putting it in `answer` makes boards with several pairings ill posed | Tents |
| C4 | a `means` clause on each mark | soundness ("if the answer agrees with the marks the premise reads") needs every mark to have a meaning over the answer; for `cand`, `line`, `cross` it is implicit, for a mark the answer does not record it is not | Slant (`alike`), Tents (`link`), Bridges (`limit`, `done`), Signpost (`link`) |
| C5 | a bounded hypothetical in a premise, `with <mark fact>: <formula>`, evaluated on the marks with that one fact changed and no propagation, and markable | it is substitution, so it is first-order; but the language's only hypothetical is `suppose`, which it calls unmarkable, and these rungs are the Tactic tier, not Search (`docs/solver-and-generator.md` § "Check, Tactic, Search") | Path, Spokes, Singles, Light Up, Boats, Star Battle, Clusters, Sticks (notation only) |

C4 and C5 are changes to the grammar of the `marks` and `technique` blocks,
not to the logic; C1, C2 and C3 change the logic's terms or quantifiers.

## Defects of the language that are not one game's misfit

1. **The computed word is not invariant under factoring** (Path). The same
   rules written with a parameter compute as a ruleset, written with a
   replaced clue meaning as a separate game.
2. **Size or parameter is the author's choice** (Bridges' `maxb`, Star
   Battle's `k`, Boats' fleet). `size` and `replace parameter` both accept a
   number a rule reads; the theory counts "the number of mines" as a size.
3. **The language's table and the theory disagree on a bounding parameter**
   (Bridges' max bridges): the theory says modifier, the table ruleset.
4. **`family` is declared, and the taxonomy's rows do not share a shape**.
   The "loop or path" row holds `one_loop` over cells (Pearl), `simple_path`
   between slots (Tracks), degree plus acyclic plus a meets relation (Path), a
   bijection with arrow clues and no shape at all (Signpost), and a functional
   graph into sinks (Rome). The "shading" row's shapes run from
   `no_adjacent + connected` (Singles) to none (Mosaic, Pattern, Unruly,
   Clusters, Bricks). The "graph of links" row includes Sticks, whose answer
   has no graph. Computed from `shape`, the rows split; what they share is the
   answer's sort and domain.
5. **TC over tuples** is needed (Pattern's and Tents' "every fit") and the
   core does not say whether `chain` allows it.
6. **A change to how a `dealt` space is dealt** (Light Up's and Sticks'
   wall share and symmetry, Bridges' islands) has no row in the table; read
   here as a deal change.

## Rules left as prose

None, given C1 to C3. Without them: Tents' matching (C3) and Pattern's clue
meaning (C2) are prose; Path's meets rule and Singles' no-repeat rule state
only by moving the numbers into the space (C1).

## Summary

| Game | Verdict | Additions | Core changes | Variation words that disagree with the catalog |
| --- | --- | --- | --- | --- |
| Pearl | fits with library additions | L1, L2, L3 | none | none |
| Tracks | fits with library additions | L1, L4, L5 | none | none |
| Path | needs core change | L6 | C1, C5 | none as factored (ruleset); separate game if factored the plain way |
| Signpost | fits with library additions | L1, L7, L8 | C4 (marks) | none |
| Rome | fits with library additions | L1 | none | none |
| Bridges | fits with library additions | L9 | C4 (marks) | max bridges: ruleset (or size) vs modifier |
| Spokes | fits with library additions | L10 | C5 (technique) | none |
| Slant | fits with library additions | L11 | C4 (marks) | none |
| Sticks | fits with library additions | L1, L12 | none (C5 notation only) | none |
| Singles | needs core change | L13 | C1, C5 | none |
| Mosaic | fits | none | none | none |
| Pattern | needs core change | L14 | C2 (+ TC over tuples) | none |
| Unruly | fits with library additions | L13 | none | none |
| Clusters | fits | none | C5 (technique) | none |
| Bricks | fits with library additions | L13, L15 | none | none |
| Light Up | fits | none | C5 (technique) | none |
| Tents | needs core change | L14 | C3, C4 | none |
| Boats | fits with library additions | L1, L16 | C5 (technique) | fleet: ruleset (or size) vs plain item |
| Star Battle | fits | none | C5 (technique) | none with the catalog (ruleset); disagrees with `taxonomy.md` (modifier) |

Rules: 4 games fit as they stand (Mosaic, Clusters, Light Up, Star Battle),
11 fit with library additions, and 4 need a change to the core logic (Path and
Singles C1, Pattern C2, Tents C3). Techniques: 8 games have a rung that needs
C5 and 4 a mark that needs C4; every game has deduction techniques, and every
technique written states over relations. Variations: 19 tier settings and 19
sizes agree. Of the 17 other declared items, 14 agree (Tracks' single ones,
Signpost's corners, Bridges' no loops, islands and expansion, Sticks' blocks
and symmetry, Mosaic's aggressive, Unruly's unique, Light Up's walls and
symmetry, Boats' remove numbers, Star Battle's stars, Path's rulesets as
factored), and 3 disagree (Bridges' max bridges, Boats' fleet size and fleet
configuration), all by the size-or-parameter ambiguity. Path's agreement
depends on factoring, and Star Battle's agrees with the catalog against
`taxonomy.md`.
