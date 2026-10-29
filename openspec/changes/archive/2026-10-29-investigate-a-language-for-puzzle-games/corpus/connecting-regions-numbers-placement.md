# Corpus test, families C, D, E and F (37 puzzles)

Written 2026-10-29 against the second version of `language.md`, which this
file does not change. The verdicts follow `corpus.md` § "The test, fixed before
the corpus was collected". Rules come from `corpus-list.md`. Where that text
was unclear or a variant's rules were not given, I checked pzprjs's
`src-ui/res/rules.en.yaml`: for Sukoro Room, Toichika 2, Ichimaga's two
variants, Tetrominous, Hotaru Beam, Herugolf, Lohkous and Symmetry Area.

## Conventions used throughout (readings of the library, not additions)

- **Directions.** `dirs4`, `dirs8` and `opp(d)` are read as part of the
  library's direction-labeled incidence entry (`step`, `edge`, `ray`). They
  are what that entry is labeled by. `step(c, d)` is `none` off the board.
- **Grid geometry.** `grid` cells carry coordinates `x(c)`, `y(c)`. `grid` is
  a planar graph, so `vertices(c)` and `edges(p)` at a vertex are incidence,
  as `edges(f)` is for `tiling`. The grid border counts as walled for
  `regions_of`.
- **Dealt partitions.** For `rooms = dealt partition`, `room(c)` names the
  part holding `c`, as Solo's `box` units do.
- **`L` for the drawn edges.** In line games `L = edges where line`, and
  `adjL` joins two cells that share an edge in `L`.
- **Gaps in the variation table, and how I filled them.** The table has no
  row for a **changed shape**, a **removed rule**, or a **changed answer sort**
  (as opposed to its domain). I filled each one as follows:
  - A shape line is treated as a rule line. `theory.md` defines the answer
    shape and a goal predicate in ways that overlap, so nothing decides which
    one a clue-free predicate is.
  - "Without rule X" uses the asymmetry of adding. The variant without X is
    the plain game, and the source's game is a modifier over it.
  - A changed answer sort is a separate game, because the family is the
    answer's sort.

Additions are numbered A1–A18 and defined once, in § "Library additions".
Each puzzle lists which ones it uses.

---

## C. Connecting and drawn movement

### 32. Ichimaga

```pzl
game ichimaga "Ichimaga"
family links
size w, h
space grid(w, h), circles = dealt set of cell
answer line : edge -> bool
marks mark : edge -> {line, cross, unknown}
shape forall c in cells - circles: degree(c, L) in {0, 2}        # no branch, no cross, no dead end
rule oneTurn: forall a in circles, d in dirs4 where edge(a, d) in L:
        trail_end(a, d, L, circles).cell in circles
        and trail_end(a, d, L, circles).turns <= 1
rule network: connected(circles, joins)
  where joins(a, b) := exists d: trail_end(a, d, L, circles).cell = b
clue count at circles value 1..4
  means degree(at, L) = v
freedom fill
deal circles; which circles show a number

modifier magnetic {
  add rule forall a, b in circles: joins(a, b) and clue(a) != none implies clue(a) != clue(b)
}
ruleset crossing {
  replace shape forall c in cells - circles: degree(c, L) in {0, 2, 4}
  # a trail runs straight through a degree-4 cell (A4), so a crossing joins nothing
}
```

- **Verdict:** described with an extension (A4 `trail`).
- **Variants:**
  - Magnetic is a **modifier**: an added rule, which uses the core's clues as
    terms.
  - Crossing is a **ruleset**: a predicate replaced in place. It drops any
    technique that reads "lines cannot cross". The theory accepts this under
    "changes a predicate in place".
- **Cut against collection Bridges:** two games, both in the links family.
  - The space differs: Bridges has spans between islands, Ichimaga has grid
    edges.
  - The domain differs: `0..maxb` against `bool`.
  - The count clue's meaning is replaced: a sum of bridge multiplicities
    against the degree on grid edges.
  - A solver would agree.

### 33. Hotaru Beam

```pzl
game hotaru "Hotaru Beam"
family links
size w, h
space grid(w, h), flies = dealt set of cell, dot : flies -> dirs4      # dealt with the board
answer line : edge -> bool
shape forall c in cells - flies: degree(c, L) in {0, 2}
rule start: forall f in flies: edge(f, dot(f)) in L
rule lands: forall f in flies:                    # ends at a firefly, on a side with no dot
        let T = trail_end(f, dot(f), L, flies): T.cell in flies and opp(T.dir) != dot(T.cell)
rule fromDot: forall g in flies, d in dirs4 - {dot(g)} where edge(g, d) in L:
        let T = trail_end(g, d, L, flies): T.cell in flies and opp(T.dir) = dot(T.cell)
        # every non-dot end leads back to a dot: no dot-to-dot path, no path without a dot
rule network: connected(flies + (cells where degree(c, L) > 0), adjL)
clue turns at flies value 0..
  means trail_end(at, dot(at), L, flies).turns = v
freedom fill
deal flies, dots; which fireflies show a number
```

- **Verdict:** described with an extension (A4).
- **Variants:** none.
- **Cut against 32 Ichimaga:** two games, both in the links family.
  - The count clue (line ends) is replaced by a turn count.
  - Hotaru Beam has dots and any number of turns.
  - A solver would agree.

### 34. Herugolf

```pzl
game herugolf "Herugolf"
family path
size w, h
space grid(w, h), balls, holes, water = dealt sets of cell
answer line : edge -> bool
shape forall b in balls: degree(b, L) = 1,
      forall c in holes: degree(c, L) <= 1,                 # one ball per hole
      forall c in cells - balls - holes: degree(c, L) in {0, 2}   # no crossing; never through a ball
rule noStray: forall e in L: exists b in balls, (y, d, k, t) in trail(b, out(b), L, holes):
        e = edge(y, opp(d))
  where out(b) := the d with edge(b, d) in L
clue golf at balls value 1..
  means let T = trail(at, out(at), L, holes), E = the tuple of T with the greatest k,
            lands = { sum i in 0..j-1 of (v - i) : j in 1..v }:
        E.cell in holes and E.k in lands                                   # stops in a hole after a whole move
        and forall (y, d, k, t) in T where k < E.k: y not in holes          # never over a hole
        and forall (y, d, k, t), (y2, d2, k + 1, t2) in T: d2 != d implies k in lands   # turns only on landing
        and forall (y, d, k, t) in T where k in lands: y not in water        # never lands on water
freedom fill
deal balls, holes, water
```

- **Verdict:** described with an extension (A4). The full tuple set of
  `trail`, an lfp over (cell, direction, steps, turns), states the shrinking
  moves.
- **Variants:** none.
- **Cut against 35 Yosenabe:** two games, both in the path family. The
  ball's clue (decreasing move lengths) replaces the ingredient's clue (summed
  in a pot), and the pot clue is absent. A solver would agree.

### 35. Yosenabe

```pzl
game yosenabe "Yosenabe"
family path
size w, h
space grid(w, h), circles = dealt set of cell, pots = dealt set of (connected cell sets)
answer line : edge -> bool
shape forall c in circles: degree(c, L) <= 1,
      forall c in cells - circles: degree(c, L) in {0, 1, 2}
rule straight: forall c in circles, d where edge(c, d) in L:
        trail_end(c, d, L, circles).turns = 0 and trail_end(c, d, L, circles).cell not in circles
rule noStray: forall e in L: exists c in circles, (y, d, k, t) in trail(c, out(c), L, circles):
        e = edge(y, opp(d))
rule inPot: forall c in circles: dest(c) in union pots
  where dest(c) := c if degree(c, L) = 0 else trail_end(c, out(c), L, circles).cell
clue amount at circles value 1..   means true            # read by the pot clue, as a term
clue sum at every pots value 1..
  means sum c in circles where dest(c) in at of clue(c) = v
        # complete: a pot with no number holds none, meaning
        #   count c in circles where dest(c) in at >= 1
freedom fill
deal circles, pots; which pots show a sum
```

- **Verdict:** described with an extension (A4).
  - The pot without a number is stated by a complete placement, where `none`
    has a meaning.
  - The ingredient's number is a clue read as a term.
- **Variants:** none.
- **Cut against 36 Kaero:** two games, both in the path family. The clue
  vocabulary is replaced: sums against letters grouped by room. A solver
  would agree.

### 36. Kaero

```pzl
game kaero "Kaero"
family path
size w, h
space grid(w, h), rooms = dealt partition, letters = dealt set of cell
answer line : edge -> bool
shape forall c in letters: degree(c, L) <= 1,
      forall c in cells - letters: degree(c, L) in {0, 1, 2}
rule ends: forall c in letters, d where edge(c, d) in L:
        trail_end(c, d, L, letters).cell not in letters        # one letter per line; never through a letter
rule noStray: forall e in L: exists c in letters, (y, d, k, t) in trail(c, out(c), L, letters):
        e = edge(y, opp(d))
clue letter at letters value A..Z   means true
rule group: forall a, b in letters: clue(a) = clue(b) iff room(dest(a)) = room(dest(b))
freedom fill
deal rooms, letters
```

- **Verdict:** described with an extension (A4).
- **Variants:** none.
- **Cut against 35 Yosenabe:** two games, as stated under Yosenabe.

### 37. Tren

```pzl
game tren "Tren"
family partition                   # the answer cuts cells into pieces
size w, h
space grid(w, h)
answer join : edge -> bool         # the two cells belong to one vehicle
marks mark : edge -> {join, apart, unknown}
shape forall c: let p = component(c, cells, adjJ):
        |p| = 1 or (|p| in {2, 3} and (|set(x(y) over p)| = 1 or |set(y(y) over p)| = 1))
  where adjJ(a, b) := join(edge between a and b)
rule oneNumber: forall c where |component(c, cells, adjJ)| >= 2:
        count y in component(c, cells, adjJ) where clue(y) != none = 1
clue mobility at cell value 0..
  means let p = component(at, cells, adjJ),
            D = {e, w} if |set(y(y) over p)| = 1 else {n, s}:
        |p| >= 2 and
        v = sum d in D of |sightline(the x in p where step(x, d) not in p, d)
                           until |component(x, cells, adjJ)| >= 2|
freedom fill
```

- **Verdict:** described well, with library `component` and `sightline`
  only.
- **Variants:** none.
- **Cut against collection Slide:** two games, in different families.
  - Slide is a non-commuting, transition-system planning game.
  - Tren is a fill about mobility.
  - The freedom kind differs, and a solver would agree.

### 38. Hiroimono

```pzl
game hiroimono "Hiroimono"
family path
size w, h; N = |stones|
space grid(w, h), stones = dealt set of cell
answer at : 1..N -> stones
shape bijection(at)
rule pick: forall k in 1..N-1: exists d in dirs4:
        at(k + 1) = first x in ray(at(k), d) where x in stones and exists j > k: at(j) = x
rule noReverse: forall k in 1..N-2, d, d2 in dirs4:
        at(k + 1) in ray(at(k), d) and at(k + 2) in ray(at(k + 1), d2) implies d2 != opp(d)
freedom fill
deal stones
```

- **Verdict:** described well.
- **Variants:** none.
- **Cut against 102 Neko Puzzle: the language computes two games, in
  different families. This looks wrong.**
  - Neko is written as `freedom transition` with the move
    `jump(d) when exists fruit in ray(cat, d) do cat := first fruit; eat`.
    The move is irreversible, so Neko is a planning game.
  - Hiroimono is a fill of the order.
  - A winning Neko move sequence is exactly a Hiroimono order with reversal
    allowed and a fixed start. A solver would call Hiroimono "Neko with no
    U-turns": one game, plus a modifier (the no-reversal rule) and a deal
    change (the start).
  - The word depends on whether the path is written as a filled sequence or
    as moves. The theory's freedom computation cannot see that the two
    writings describe the same search.

---

## D. Region division

### 39. Sashigane

```pzl
game sashigane "Sashigane"
family partition
size w, h
space grid(w, h)
answer wall : edge -> bool
marks mark : edge -> {wall, open, unknown}
shape forall r in regions_of(edges where wall): lshape(r)
clue corner at cell value {plain} + 3..
  means at = corner(region(at)) and (v != plain implies |region(at)| = v)
clue arrow at cell value dirs4
  means at in region(at) - {corner(region(at))}
        and count y in adj4(at) where y in region(at) = 1          # an arm's end
        and corner(region(at)) in ray(at, v)
freedom fill
```

- **Verdict:** described with an extension (A2 `region`, A6 `lshape` /
  `corner`).
- **Variants:** none.
- **Cut against 41 Lohkous and collection Rect:** two games, both in the
  partition family.
  - The shape is replaced: L against rectangle against run lengths.
  - The clue kinds are replaced.
  - A solver would agree.

### 40. Araf

```pzl
game araf "Araf"
family partition
size w, h
space grid(w, h)
answer wall : edge -> bool
clue number at cell value 1.. + {?}   means true                   # read by the rule
rule pairs: forall r in regions_of(edges where wall):
        count c in r where clue(c) != none = 2
        and forall a, b in r where a != b and clue(a) != none and clue(b) != none:
          exists p, q in 1..w*h+1:
            (clue(a) = ? or p = clue(a)) and (clue(b) = ? or q = clue(b))
            and min(p, q) < |r| < max(p, q)
freedom fill
```

- **Verdict:** described well.
- **Variants:** none.
- **Cut against collection Filling:** two games. The clue meaning is
  replaced, and the answer sort differs: Filling fills `cell -> number`,
  Araf draws `edge -> bool`.
  - Computed families: numbers (Filling) against partition (Araf). A solver
    files both under region division. This is a family flag, not a game flag:
    the family is computed from how the answer is written.

### 41. Lohkous

```pzl
game lohkous "Lohkous"
family partition
size w, h
space grid(w, h)
answer wall : edge -> bool
rule oneClue: forall r in regions_of(edges where wall): count c in r where clue(c) != none = 1
rule noDeadEnd: forall e where wall(e):
        not exists r in regions_of(edges where wall): both cells of e in r
clue lengths at cell value nonempty list of (1.. + {?}), no number repeated
  means let r = the r in regions_of(edges where wall) where at in r,
            R = { |s| : M in rows + cols, s in segments(M, (in r)) },
            K = set(v[i] over i where v[i] != ?):
        exists subset Q of 1..max(w, h) where |Q| = count i where v[i] = ? and Q ∩ K = {}:
          R = K + Q
freedom fill
```

- **Verdict:** described well. It uses list values, `segments` and a bounded
  subset.
- **Variants:** none.
- **Cut against 39 Sashigane:** two games, as stated under Sashigane.

### 42. Nawabari

```pzl
game nawabari "Nawabari"
family partition
size w, h
space grid(w, h)
answer wall : edge -> bool
shape forall r in regions_of(edges where wall): rectangle(r)
rule oneNumber: forall r in regions_of(edges where wall): count c in r where clue(c) != none = 1
clue borders at cell value 0..4
  means count d in dirs4 where step(at, d) = none or wall(edge(at, d)) = v
freedom fill
```

- **Verdict:** described with an extension (A3 `rectangle`).
- **Variants:** none.
- **Cut against collection Rect:** two games, both in the partition family.
  - They share the shape and the one-number rule.
  - The clue kind is replaced: area against wall count.
  - A solver would agree.

### 43. Tatamibari

```pzl
game tatamibari "Tatamibari"
family partition
size w, h
space grid(w, h)
answer wall : edge -> bool
shape forall r in regions_of(edges where wall): rectangle(r)
rule oneSymbol: forall r in regions_of(edges where wall): count c in r where clue(c) != none = 1
rule noFour: forall vertex p where |edges(p)| = 4: count e in edges(p) where wall(e) < 4
clue shape at cell value {+, |, -}
  means let r = region(at), W = |set(x(c) over r)|, H = |set(y(c) over r)|:
        (v = + and W = H) or (v = | and H > W) or (v = - and W > H)
freedom fill
```

- **Verdict:** described with an extension (A2, A3).
- **Variants:** none.
- **Cut against collection Rect and 42 Nawabari:** two games each, because
  the clue kind is replaced. A solver would agree.

### 44. Symmetry Area

```pzl
game symmarea "Symmetry Area"
family partition
size w, h
space grid(w, h)
answer wall : edge -> bool                  # pzprjs: "divide the grid into regions"
clue size at cell value 1..
  means |region(at)| = v
rule sizes: forall e where wall(e): |region(a)| != |region(b)|        # a, b the cells of e
rule symmetric: forall r in regions_of(edges where wall): symmetric(r)
freedom fill
```

- **Verdict:** described with an extension (A2, A13 `symmetric`).
- **Variants:** none.
- **Cut against collection Filling: the language computes two games, which
  looks wrong.**
  - Written as the source writes it (walls), the answer sort is `edge`.
    Filling's is `cell -> 1..w*h`, so the language computes two games in two
    families.
  - Written as Filling writes it (a number in every cell), rule 2 is implicit
    in maximal same-number components. Symmetry Area is then Filling plus one
    added rule: a **modifier**.
  - A solver calls it "Fillomino with symmetric regions": one game with a
    modifier.
  - The cut is decided by how the answer is written, the same defect as
    Hiroimono and Neko.

### 45. Pentominous

```pzl
game pentominous "Pentominous"
family partition
size w, h; n = 5                           # the region size
space grid(w, h)
answer wall : edge -> bool
shape forall r in regions_of(edges where wall): |r| = n
rule differ: forall e where wall(e): not congruent(region(a), region(b))   # a, b the cells of e
clue letter at cell value names(n)
  means congruent(region(at), poly(n, v))
freedom fill

size Tetrominous { replace size n = 4 }    # names(4) = {I, L, O, S, T}
```

- **Verdict:** described with an extension (A2, A7 `congruent` / `poly`).
- **Variants:** Tetrominous is a **size**. `n` is read only as a region's
  extent, which `theory.md` counts as a size, as it does Palisade's `k`. The
  letter set and templates follow from `n`.
- **Cut against collection Filling, and against 67 Pentomino tiling:** two
  games each.
  - Against Filling, the clues are replaced.
  - Against Pentomino tiling, the letter clue is replaced by the bank clue,
    and the rules differ.
  - A solver would agree.

### 46. Scrin

```pzl
game scrin "Scrin"
family placement
size w, h
space grid(w, h)
answer cover : cell -> bool
let P = components(cells where cover, adj4)
shape forall p in P: rectangle(p)                       # rectangles never share an edge: each is a component
rule atMostOne: forall p in P: count c in p where clue(c) != none <= 1
rule cycle: forall p in P: count q in P where touch(p, q) = 2,
            connected(P, touch)
  where touch(p, q) := p != q and exists a in p, b in q: b in adj8(a)
clue circle at cell value {plain} + 1..
  means cover(at) and (v != plain implies |component(at, cells where cover, adj4)| = v)
freedom fill
```

- **Verdict:** described with an extension (A1 `components`, A3).
- **Variants:** none.
- **Cut against collection Rect:** two games, because the answer sort
  differs (`cell` against `edge`).
  - Computed family: placement, while the corpus list puts Scrin under
    region division. This is a family flag only.
  - A solver would agree that they are two games.

### 47. Light and Shadow

```pzl
game lightshadow "Light and Shadow"
family shading
size w, h
space grid(w, h)
answer color : cell -> {black, white}
given color                                  # the colored number cells
clue size at cell value 1..
  means |component(at, cells where color = color(at), adj4)| = v
rule oneNumber: forall c:
        count x in component(c, cells where color = color(c), adj4) where clue(x) != none = 1
freedom fill
```

- **Verdict:** described well.
- **Variants:** none.
- **Cut against collection Filling and 7 Yin-Yang:** two games each.
  - Against Filling, the domain and the clue differ.
  - Yin-Yang has no clue kind, so against it the clue is removed and the
    rules are replaced.
  - A solver would agree.

---

## E. Number placement and arithmetic

### 48. Nanro

```pzl
game nanro "Nanro"
family numbers
size w, h
space grid(w, h), rooms = dealt partition
answer value : cell -> {none} + 1..w*h
given value
rule count: forall c where value(c) != none:
        value(c) = count x in room(c) where value(x) != none
rule nonEmpty: forall r in rooms: exists c in r: value(c) != none
rule apart: forall a, b in adj4(a) where room(a) != room(b) and value(a) != none:
        value(a) != value(b)
rule no2x2: forall B in windows(2, 2): exists c in B: value(c) = none
shape connected(cells where value != none, adj4)
freedom fill
```

- **Verdict:** described with an extension (A8 `windows`).
- **Variants:** none.
- **Cut against 3 Heyawake:** two games, because Heyawake's room-count clue
  is removed and the domain differs. A solver would agree.

### 49. Renban

```pzl
game renban "Renban"
family numbers
size w, h
space grid(w, h), rooms = dealt partition
answer value : cell -> 1..B            # B = (max given) + w*h*max(w, h); see note
given value
rule consecutive: forall r in rooms:
        distinct(value over r) and max(value over r) - min(value over r) = |r| - 1
rule borders: forall e between a, b where room(a) != room(b):
        |value(a) - value(b)| = |border_run(e)|
freedom fill
```

- **Verdict:** described with an extension (A9 `border_run`).
- **Note on the domain.** The source says "a positive number", which is not
  a finite domain. Every value lies within `w*h*max(w, h)` of a given: there
  is a path of at most `w*h` border steps, and each step's difference is at
  most `max(w, h)`. So on any board with at least one given, the bounded
  domain has the same solutions. A board with no givens is never well posed.
  This is a theorem about instances, not a rule, so it is **borderline**.
- **Variants:** none.
- **Cut against collection Seismic:** two games. The region rule is replaced
  (`1..|r|` against a consecutive offset set), and the border rule is new. A
  solver would agree.

### 50. Sukoro

```pzl
game sukoro "Sukoro"
family numbers
size w, h
space grid(w, h)
answer value : cell -> {none} + 1..4
given value                                   # numbers, and cells given as empty
rule count: forall c where value(c) != none:
        value(c) = count x in adj4(c) where value(x) != none
rule apart: forall a, b in adj4(a) where value(a) != none: value(a) != value(b)
shape connected(cells where value != none, adj4)
freedom fill

ruleset room {
  replace space grid(w, h), rooms = dealt partition
  replace rule apart: forall r in rooms: distinct(value over r where value != none)
  add rule fullOrEmpty: forall r in rooms:
        (forall c in r: value(c) != none) or (forall c in r: value(c) = none)
}
```

- **Verdict:** described well.
- **Variants:** Sukoro Room is a **ruleset**. It replaces a rule, which is
  the strongest of its changes; the space change and the added rule are
  weaker. It is acceptable as a variant.
- **Cut against 51 View: the language computes one game, which looks
  wrong.**
  - Neither game has a clue kind; both have givens only.
  - They share a space, `apart` and `connected`.
  - They differ in the domain (`1..4` against `0..w+h-2`) and in the one rule
    saying what a number means. Both changes are ruleset rows, so the
    computed answer is View = a ruleset of Sukoro.
  - A solver would call them two games, and the theory's own principle
    agrees: no technique reading `count` survives.

### 51. View

```pzl
game view "View"
family numbers
size w, h
space grid(w, h)
answer value : cell -> {none} + 0..w+h-2
given value
rule sees: forall c where value(c) != none:
        value(c) = sum d in dirs4 of |sightline(c, d) until value != none|
rule apart: forall a, b in adj4(a) where value(a) != none: value(a) != value(b)
shape connected(cells where value != none, adj4)
freedom fill
```

- **Verdict:** described well.
- **Variants:** none.
- **Cut:**
  - Against 50 Sukoro: flagged above.
  - Against collection Range: two games, in different families. Range has a
    shading answer and a `sees` clue kind, which View removes. A solver would
    agree.

### 52. Doppelblock

```pzl
game doppelblock "Doppelblock"
family numbers
size n
space grid(n, n)
answer value : cell -> {black} + 1..n-2
shape forall M in rows + cols:
        count c in M where value(c) = black = 2
        and forall k in 1..n-2: count c in M where value(c) = k = 1
clue sum at slot value 0..
  means sum c in line(at) where exists b1, b2 in line(at):
          value(b1) = black and value(b2) = black and b1 before c and c before b2
        of value(c) = v
freedom fill
```

- **Verdict:** described well.
- **Variants:** none.
- **Cut against collection Towers and 53 Japanese Sums:** two games each.
  The domain differs and the slot clue's meaning is replaced. A solver would
  agree.

### 53. Japanese Sums

```pzl
game japsums "Japanese Sums"
family numbers
size w, h, k
space grid(w, h)
answer value : cell -> {shaded} + 1..k
rule distinct: forall M in rows + cols: distinct(value over M where value != shaded)
clue sums at slot value list of (1.. + {?})
  means let S = segments(line(at), (value != shaded)):
        |S| = |v| and forall i in 1..|v|: v[i] = ? or sum c in S[i] of value(c) = v[i]
freedom fill
deal which slots show a list               # a line without clues is unconstrained
```

- **Verdict:** described well.
- **Variants:** none.
- **Cut against collection Pattern and Crossing:** two games each, because
  the clue meaning is replaced (run sums against run lengths or listed
  numbers). A solver would agree.

### 54. Garam

```pzl
game garam "Garam"
family numbers
space dealt layout: cells, eqs; for each eq: operands a(eq), b(eq) (one cell each),
      result res(eq) (a list of one or two cells)
answer digit : cell -> 0..9
given digit
clue op at eqs value {+, -, ×}
  means (v = + and digit(a) + digit(b) = number(res(at), 10))
     or (v = - and digit(a) - digit(b) = number(res(at), 10))
     or (v = × and digit(a) * digit(b) = number(res(at), 10))
     and (|res(at)| = 2 implies digit(res(at)[1]) != 0)
freedom fill
deal givens
```

- **Verdict:** described with an extension (A10 `number`, from Crossing).
- **Variants:** none.
- **Cut against collection Mathrax and Numgame, and 57 Cryptarithm:** two
  games each.
  - Mathrax has a Latin shape and vertex clues.
  - Numgame builds an expression, which is a different freedom.
  - Cryptarithm's answer sort is `letter`, not `cell`.
  - A solver would agree.

### 55. Magic Square

```pzl
game magicsquare "Magic Square"
family numbers
size n
space grid(n, n), lines = rows + cols
answer value : cell -> 1..n*n
given value
shape bijection(value)
rule magic: exists S: forall M in lines: sum c in M of value(c) = S       # S is forced to n(n²+1)/2
freedom fill

modifier diagonals  { add rule exists S: forall M in lines + {main, anti}: sum c in M of value(c) = S }
modifier pandiagonal { add rule forall D in diagonals(torus(grid(n, n))): sum c in D of value(c) = S }
setting givens { deal givens: some }
```

- **Verdict:** described with an extension (A11 `diagonals`, `main`,
  `anti`).
- **Variants:**
  - The source's "Magic Square" is the plain semi-magic game plus the
    **modifier** `diagonals`. By the asymmetry of adding, the semi-magic
    variant is the plain game.
  - Pandiagonal is a **modifier**.
  - Other orders are a **size**.
  - Some givens is a **generator setting**.
  - A reader of `theory.md` would accept all four.
- **Cut against 56 Magic Hexagon:** computed as one game, a **board shape**.
  Only the space and its lines change, and the rule `exists S` is the same.
  - A solver would plausibly accept "the magic condition on a hex board".
  - I do not flag it. Neither game has a clue kind, so this is the same
    exposure as the flags in § "Cut pairs that looked wrong".

### 56. Magic Hexagon

```pzl
game magichex "Magic Hexagon"
family numbers
size s; N = 3s(s-1)+1
space hexgrid(hexagon, s), lines = hexlines(hexagon, s)
answer value : cell -> 1..N
shape bijection(value)
rule magic: exists S: forall M in lines: sum c in M of value(c) = S
freedom fill
```

- **Verdict:** described with an extension (A12 `hexlines`).
- **Variants:** other orders are a **size**. Only `s = 1` and `s = 3` have
  solutions, and the deal test finds that.
- **Cut:** see 55.

### 57. Cryptarithm

```pzl
game cryptarithm "Cryptarithm"
family numbers
size base = 10
space letters = dealt set, words = dealt lists of letters
answer digit : letters -> 0..base-1
shape distinct(digit over letters)
rule leading: forall w in words where |w| >= 2: digit(w[1]) != 0
clue statement at board value list of (list of words, op in {+, ×}, word)
  means forall (A, op, r) in v:
          fold(op, number(digit over a, base) over a in A) = number(digit over r, base)
freedom fill
deal the statement

ruleset base       { replace size base in 2.. }       # domain and the rule both read it
setting long-mult  { replace deal statement: a product with its partial-product rows as extra equations }
setting doublyTrue { replace deal statement: words that name their own values }
# skeleton division: replace answer to cell -> digit, replace clue (a division layout): separate game
```

- **Verdict:** described with an extension (A10).
- **Variants:**
  - Other bases is a **ruleset**. The domain changes, and the strongest word
    for a domain change is ruleset.
  - The multiplication layouts are a **generator setting**: the clue's value
    set already holds them.
  - Doubly-true is a **generator setting**.
  - Skeleton division is a **separate game**: the answer sort is replaced and
    the clue is replaced.
  - A reader would accept all four.
- **Cut against 54 Garam:** two games. A solver would agree.
- **Technique, from the source** (Wikipedia, *Verbal arithmetic*, the carry
  into a longer result). Reported apart, not part of the verdict.
  ```pzl
  technique leadingCarry tier Easy
    for equation (A, +, r) in statement where |A| <= base - 1 and |r| = max(|a| over a in A) + 1
    premise true                                   # reads only the clue
    conclude digit(r[1]) in 1..|A| - 1             # with two addends: = 1
  ```
  It holds the technique form: a premise over clues and a mark conclusion. It
  is sound because a sum of `|A|` numbers below `base^m` is below
  `|A| * base^m`.

---

## F. Object placement, tiling and geometry

### 58. Hakoiri

```pzl
game hakoiri "Hakoiri"
family placement
size w, h
space grid(w, h), rooms = dealt partition
answer sym : cell -> {none, circle, triangle, square}
given sym
rule each: forall r in rooms, s in {circle, triangle, square}: count c in r where sym(c) = s = 1
rule apart: forall s in {circle, triangle, square}: no_adjacent(cells where sym = s, adj8)
shape connected(cells where sym != none, adj4)
freedom fill
```

- **Verdict:** described well.
- **Variants:** none.
- **Cut:**
  - **Against collection Star Battle: the language computes one game (a
    ruleset), which looks wrong.** Neither game has a clue kind, and both use
    a grid with dealt regions. The domain changes (`bool` to four symbols),
    the per-unit rule is replaced (rows, columns and regions, `k` each,
    against one of each symbol per room), and `connected` is added. The
    strongest of these is a ruleset. A solver would call them two games.
  - Against collection ABCD: two games, because ABCD's slot counts are
    removed. A solver would agree.

### 59. Toichika

```pzl
game toichika "Toichika"
family placement
size w, h
space grid(w, h), countries = dealt partition
answer arrow : cell -> {none} + dirs4
given arrow
rule one: forall r in countries: count c in r where arrow(c) != none = 1
rule paired: forall c, d where arrow(c) = d:
        let p = first x in ray(c, d) where arrow(x) != none:     # so every cell between is empty
        p != none and arrow(p) = opp(d) and not radj(room(c), room(p))
freedom fill

ruleset toichika2 {
  replace answer num : cell -> {none} + 1..max(w, h)
  replace rule paired: forall c where num(c) != none:
        count p in (row(c) + col(c)) - {c} where num(p) = num(c) = 1
        and exists d: let p = first x in ray(c, d) where num(x) != none:
            num(p) = num(c) and |ray(c, d) before p| = num(c) and not radj(room(c), room(p))
  add rule forall M in rows + cols, n: count c in M where num(c) = n <= 2
}
```

- **Verdict:** described with an extension (A14 `radj`, from Map).
- **Variants:** Toichika 2 is a **ruleset**. It replaces the domain and a
  rule, and adds a rule. The word is acceptable.
- **Cut against 58 Hakoiri: the language computes one game (a ruleset),
  which looks wrong.** It is the same mechanism as Hakoiri and Star Battle:
  neither game has a clue kind, the space is the same, and the domain and
  rules are replaced. A solver would call them two games.

### 60. Dosun-Fuwari

```pzl
game dosufuwa "Dosun-Fuwari"
family placement
size w, h
space grid(w, h), rooms = dealt partition, walls = dealt set of cell
answer obj : cell -> {none, balloon, iron}
shape forall c in walls: obj(c) = none
rule each: forall r in rooms, o in {balloon, iron}: count c in r where obj(c) = o = 1
rule sink: forall c where obj(c) = iron:
        step(c, s) = none or step(c, s) in walls or obj(step(c, s)) = iron
rule float: forall c where obj(c) = balloon:
        step(c, n) = none or step(c, n) in walls or obj(step(c, n)) = balloon
freedom fill
```

- **Verdict:** described well.
- **Variants:** none.
- **Cut against 17 Stostone:** two games. Stostone has a room-number clue
  kind, which is removed here, and it is a shading answer. A solver would
  agree.

### 61. Kinkonkan

```pzl
game kinkonkan "Kinkonkan"
family placement
size w, h
space grid(w, h), rooms = dealt partition, slots = border(grid)
answer mirror : cell -> {none, /, \}
rule one: forall r in rooms: count c in r where mirror(c) != none = 1
clue light at slot value letter × 0..
  means let B = beam(at, mirror):
        exit(B) != at and clue(exit(B)).letter = v.letter
        and count c in cells(B) where mirror(c) != none = v.count
rule lit: forall c where mirror(c) != none: exists s in slots where clue(s) != none: c in cells(beam(s, mirror))
freedom fill
deal rooms; letters in pairs
```

- **Verdict:** described with an extension (A15 `beam`, Black Box's ray as a
  library entry).
- **Variants:** none.
- **Cut against collection Black Box:** two games, in different families.
  Black Box's freedom is a query and Kinkonkan's is a fill. A solver would
  agree.

### 62. Shakashaka

```pzl
game shakashaka "Shakashaka"
family shading
size w, h
space quarters(grid(w, h)), blacks = dealt set of cell
answer tri : cell -> {none, ◢, ◣, ◤, ◥}
shape forall c in blacks: tri(c) = none
rule white: forall R in components(quarters where white, qadj): rect45(R)
  where white(q) := cell(q) not in blacks and q not in covered(tri(cell(q)))
clue count at blacks value 0..4
  means count x in adj4(at) where tri(x) != none = v
freedom fill
```

- **Verdict:** described with an extension (A16 `quarters`, `covered`,
  `qadj`, `rect45`; A1).
- **Variants:** none.
- **Cut against collection Slant:** two games. Slant has a diagonal in every
  cell, `acyclic` and vertex clues; here the domain, the shape and the clue
  kind are all replaced. A solver would agree.

### 63. Squaro

```pzl
game squaro "Squaro"
family shading
size w, h
space grid(w, h)
answer colored : vertex -> bool
clue count at cell value 0..4
  means count p in vertices(at) where colored(p) = v
freedom fill
```

- **Verdict:** described well.
- **Variants:** none.
- **Cut:**
  - **Against 16 Creek: computed as two games, which is doubtful.** The
    answer sort is `vertex` against `cell`, and the clue placement is
    replaced. Under the grid's duality (the vertices of `w × h` are the cells
    of `(w+1) × (h+1)`), Squaro is Creek without its connectivity rule, with
    no border clues dealt. That would make Creek a **modifier** of Squaro.
    The language does not compare spaces up to isomorphism, so it cannot see
    this. A solver would probably still say two games, because Creek's
    techniques are mostly connectivity, so the answer may be right for the
    wrong reason.
  - Against collection Mosaic: two games, because the clue meaning is
    replaced. A solver would agree.

### 64. Shinro

```pzl
game shinro "Shinro"
family placement
size n = 8, m = 12
space grid(n, n)
answer hole : cell -> bool
rule total: count c where hole(c) = m
clue count at slot value 0..n
  means count c in line(at) where hole(c) = v
clue arrow at cell value dirs8
  means not hole(at) and exists x in ray(at, v): hole(x)
freedom fill

size other { replace size n, m }
```

- **Verdict:** described well.
- **Variants:** other sizes and hole counts are a **size**. `m` counts as a
  size because "the number of mines" is a size in `theory.md`.
- **Cut against collection Tents and 12 Thermometers:** two games each,
  because the clue kinds are replaced. A solver would agree.

### 65. N-Queens

```pzl
game nqueens "N-Queens"
family placement
size n
space grid(n, n), attack(a, b) := a != b and exists M in rows + cols + diagonals(grid(n, n)): a, b in M
answer queen : cell -> bool
rule count: count c where queen(c) = n
shape no_adjacent(cells where queen, attack)
freedom fill                                   # many solutions: no uniqueness promised

board shape rooks   { replace space attack(a, b) := a != b and exists M in rows + cols: a, b in M }
board shape kings   { replace space attack = adj8 }               # with the count a size k
board shape knights { replace space attack = knight }
board shape torus   { replace space torus(grid(n, n)) }
setting givens      { deal givens: some queens }
```

- **Verdict:** described with an extension (A11, A17 `knight`).
- **Variants:**
  - Other pieces are a **board shape**: the attack relation lives in the
    space, as Ascent's adjacencies do. Written as a line rule instead, they
    compute as a ruleset, so this word depends on notation (Flip's defect).
  - Toroidal is a **board shape**.
  - Some queens given is a **generator setting**.
  - A reader accepts these by the Ascent precedent.
- **Cut against collection Star Battle: the language computes one game (a
  ruleset), which looks wrong.**
  - Star Battle: `k` per row, column and region, plus `no_adjacent(adj8)`.
  - N-Queens: `n` queens, plus `no_adjacent(attack)`.
  - Neither game has a clue kind, so the replaced rules and the space change
    file N-Queens as a ruleset of Star Battle.
  - A solver would call them two games: one is a construction puzzle with no
    clues, the other a deduction puzzle.

### 66. Statue Park

```pzl
game statuepark "Statue Park"
family placement
size w, h
space grid(w, h)
answer shade : cell -> bool
given shade                                  # black circle: shaded; white circle: clear
let P = components(cells where shade, adj4)
clue bank at board value multiset of polyominoes
  means forall p in P: exists s in v: congruent(p, s)
        and forall s in set(v): count p in P where congruent(p, s) = mult(v, s)
shape connected(cells where not shade, adj4)
freedom fill

setting bank { replace deal bank: tetrominoes | a double set | ... }
```

- **Verdict:** described with an extension (A1, A7).
- **Variants:** other banks are a **generator setting**: the bank is printed
  with each puzzle, so it is a board clue that is dealt. A reader would
  accept it.
- **Cut:**
  - Against 67 Pentomino tiling: two games, because the answer sort is `cell`
    against `edge`.
  - Against collection Boats: two games, because Boats' slot counts and
    segment clues are replaced.
  - A solver would agree with both.

### 67. Pentomino tiling

```pzl
game pentotile "Pentomino tiling"
family partition
space grid(w, h) restricted to cells = dealt region       # 6×10, 5×12, 4×15, 3×20, 8×8 less 2×2
answer wall : edge -> bool
clue bank at board value multiset of polyominoes            # the twelve pentominoes, once each
  means forall r in regions_of(edges where wall): exists s in v: congruent(r, s)
        and forall s in set(v): count r in regions_of(edges where wall) where congruent(r, s) = mult(v, s)
freedom fill                                                # many solutions

setting   sets      { replace deal bank }
modifier  oneSided  { replace parameter mirror = false; replace deal bank: the 18 one-sided pieces }
board shape cubes   { replace space grid3(a, b, c) restricted to a dealt solid }
```

- **Verdict:** described with an extension (A7, A18 `grid3`).
- **Variants:**
  - Other sets are a **generator setting**.
  - One-sided is a **modifier**: `mirror` is a parameter of `congruent`. A
    reader might expect "ruleset", but `theory.md` files a changed parameter
    as a modifier.
  - 3D is a **board shape**. Congruence is defined by the lattice's
    isometries, so it follows the space.
  - A reader would accept all three.
- **Cut against 66 Statue Park and 45 Pentominous:** two games each. A solver
  would agree.

### 68. Tangram

```pzl
game tangram "Tangram"
family placement
space pieces = 7 fixed polygons, silhouette = dealt polygon
answer place : pieces -> rigid motions of the plane          # not a finite domain
rule inside:   forall p: place(p)(p) ⊆ silhouette
rule disjoint: forall p != q: interior(place(p)(p)) ∩ interior(place(q)(q)) = {}
# with the pieces' area = the silhouette's, these give "the union is exactly the silhouette"
```

- **Verdict: not described.**
  - The core has no sort for the plane: no real-valued terms, no rigid
    motions (rotation as a pair `(c, s)` with `c² + s² = 1`), and no polygon
    containment.
  - `language.md` keeps an infinite domain as stated without a meaning, which
    is the Untangle case its second version did not change. By the test that
    is a core change.
  - The rules are statable only in ordered-field arithmetic over vertex
    coordinates. They are decidable, but not core.
- **Variants:** other dissection sets would be a generator setting if the
  game were described.
- **Cut against 67 Pentomino tiling:** not computable from descriptions. Read
  informally, the answer sort differs (a motion against a partition), so they
  would be two games. A solver would agree.

---

## Library additions, defined

Each one is a definition in the core logic, and none is a rule renamed.

| Id | Name | Definition | Puzzles |
| --- | --- | --- | --- |
| A1 | `components(S, adj)` | `set(component(x, S, adj) over S)`, the parts of `S` as elements that `count`, `forall` and `connected` range over (collection L16) | Scrin, Statue Park, Shakashaka (3) |
| A2 | `region(c)` | the `r` in `regions_of(edges where wall)` with `c in r` (Rect's) | Sashigane, Tatamibari, Symmetry Area, Pentominous (4) |
| A3 | `rectangle(r)` | `forall a, b in r: cell(x(a), y(b)) in r` and `connected(r, adj4)` (Rect's) | Nawabari, Tatamibari, Scrin (3) |
| A4 | `trail(x, d0, E, Stop)`, `trail_end` | `lfp T(y, d, k, t)`: `T(step(x, d0), d0, 1, 0)` if `edge(x, d0) in E`; from `T(y0, d1, k0, t0)` with `y0 not in Stop`, go straight if `edge(y0, d1) in E`, or turn (`t0 + 1`) along the other `E` edge if `degree(y0, E) = 2`. `k` ranges over `1..\|edges\|` and `t` over `0..\|edges\|`. `trail_end` is the tuple with the greatest `k` | Ichimaga, Hotaru Beam, Herugolf, Yosenabe, Kaero (5) |
| A6 | `lshape(r)`, `corner(r)` | exists `c in r`, perpendicular `d1, d2`, and `a, b >= 1` with `r = {c} + prefix(ray(c, d1), a) + prefix(ray(c, d2), b)`; `corner` is that `c` | Sashigane (1) |
| A7 | `congruent(a, b)`, `poly(n, name)` | `exists g in isometries(space), t: {g(c) + t : c in a} = b`; with `mirror = false`, only orientation-preserving `g`. `poly` is a table of the free `n`-omino templates as coordinate sets | Pentominous, Statue Park, Pentomino tiling (3) |
| A8 | `windows(p, q)` | every `p × q` set `{(x + i, y + j) : i < p, j < q}` on the board | Nanro (1) |
| A9 | `border_run(e)` | `edge_lines` are the edges between two adjacent rows (or columns), ordered along them. `border_run(e)` is the segment of `e`'s edge line, from `segments`, where each edge separates the same two rooms as `e` | Renban (1) |
| A10 | `number(list, base)` | `sum i in 1..\|l\| of l[i] * base^(\|l\| - i)` (Crossing's) | Garam, Cryptarithm (2) |
| A11 | `diagonals(space)`, `main`, `anti` | the maximal cell sets with constant `x - y`, or constant `x + y`; on `torus`, the broken diagonals | Magic Square, N-Queens (2) |
| A12 | `hexlines(shape, s)` | the maximal straight lines of `hexgrid` cells in each of the three axial directions | Magic Hexagon (1) |
| A13 | `symmetric(r)` | `forall c in r: cell(min x + max x - x(c), min y + max y - y(c)) in r`, with min and max over `r` | Symmetry Area (1) |
| A14 | `radj(r1, r2)` | `exists a in r1, b in r2: b in adj4(a)` (Map's) | Toichika (1) |
| A15 | `beam(s, M)`, `exit`, `cells` | `lfp` over (cell, direction) from `s`'s first cell heading inward, with the next direction `reflect(M(c), d)` (`/` swaps n↔e and s↔w; `\` swaps n↔w and s↔e). `exit` is the slot past the last cell (Black Box's ray) | Kinkonkan (1) |
| A16 | `quarters(grid)`, `covered`, `qadj`, `rect45` | Each cell is cut by its diagonals into four triangles `(c, side)`, adjacent across shared sides. `covered(◣) = {s, w}`, and the other orientations likewise. `rect45(R)`: `R` is every quarter inside its bounding box in coordinates `(x, y)`, or in `(x + y, x - y)` | Shakashaka (1) |
| A17 | `knight(a, b)` | `{\|dx\|, \|dy\|} = {1, 2}` | N-Queens, as a variant (1) |
| A18 | `grid3(a, b, c)` | cells `(x, y, z)` with `adj6` and its isometries | Pentomino tiling, as a variant (1) |

(There is no A5. A one-off "segment" addition for Yosenabe was replaced by
A4.)

**Reuse.**
- 17 additions are used by 23 puzzles.
- Eight are shared within this set: A1, A2, A3, A4, A7, A10, A11, and A14 or
  A15 via the collection.
- Puzzles that need at least one addition no other puzzle uses (counting
  collection reuse of `radj`, `ray` and `number` as shared): Sashigane,
  Nanro, Renban, Magic Hexagon, Symmetry Area, Shakashaka, N-Queens and
  Pentomino tiling. That is **8 of 23**. Without the collection, it is 10 of
  23. Either way it is under half.
- A8 `windows` will likely recur in family A, in the 2×2 rules of Yin-Yang
  and Nurimisaki.

## Table

| Puzzle | Verdict | Additions | Core gaps | Cut pair: computed / solver |
| --- | --- | --- | --- | --- |
| 32 Ichimaga | extension | A4 | — | vs Bridges: two / two ✓ |
| 33 Hotaru Beam | extension | A4 | — | vs Ichimaga: two / two ✓ |
| 34 Herugolf | extension | A4 | — | vs Yosenabe: two / two ✓ |
| 35 Yosenabe | extension | A4 | — | vs Kaero: two / two ✓ |
| 36 Kaero | extension | A4 | — | vs Yosenabe: two / two ✓ |
| 37 Tren | well | — | — | vs Slide: two / two ✓ |
| 38 Hiroimono | well | — | — | vs Neko: two (fill vs transition) / one + modifier ✗ |
| 39 Sashigane | extension | A2, A6 | — | vs Lohkous, Rect: two / two ✓ |
| 40 Araf | well | — | — | vs Filling: two / two ✓ (family differs, see text) |
| 41 Lohkous | well | — | — | vs Sashigane: two / two ✓ |
| 42 Nawabari | extension | A3 | — | vs Rect: two / two ✓ |
| 43 Tatamibari | extension | A2, A3 | — | vs Rect, Nawabari: two / two ✓ |
| 44 Symmetry Area | extension | A2, A13 | — | vs Filling: two (answer sort) / one + modifier ✗ |
| 45 Pentominous | extension | A2, A7 | — | vs Filling, Pentomino tiling: two / two ✓ |
| 46 Scrin | extension | A1, A3 | — | vs Rect: two / two ✓ |
| 47 Light and Shadow | well | — | — | vs Filling, Yin-Yang: two / two ✓ |
| 48 Nanro | extension | A8 | — | vs Heyawake: two / two ✓ |
| 49 Renban | extension (borderline domain) | A9 | — | vs Seismic: two / two ✓ |
| 50 Sukoro | well | — | — | vs View: one (ruleset) / two ✗ |
| 51 View | well | — | — | vs Range: two / two ✓ (vs Sukoro ✗, counted once) |
| 52 Doppelblock | well | — | — | vs Towers, Japanese Sums: two / two ✓ |
| 53 Japanese Sums | well | — | — | vs Pattern, Crossing: two / two ✓ |
| 54 Garam | extension | A10 | — | vs Mathrax, Numgame: two / two ✓ |
| 55 Magic Square | extension | A11 | — | vs Magic Hexagon: one (board shape) / plausibly one ✓? |
| 56 Magic Hexagon | extension | A12 | — | (see 55) |
| 57 Cryptarithm | extension | A10 | — | vs Garam: two / two ✓ |
| 58 Hakoiri | well | — | — | vs Star Battle: one (ruleset) / two ✗; vs ABCD: two / two ✓ |
| 59 Toichika | extension | A14 | — | vs Hakoiri: one (ruleset) / two ✗ |
| 60 Dosun-Fuwari | well | — | — | vs Stostone: two / two ✓ |
| 61 Kinkonkan | extension | A15 | — | vs Black Box: two / two ✓ |
| 62 Shakashaka | extension | A1, A16 | — | vs Slant: two / two ✓ |
| 63 Squaro | well | — | — | vs Creek: two / probably two, blind to duality ? |
| 64 Shinro | well | — | — | vs Tents: two / two ✓ |
| 65 N-Queens | extension | A11, A17 | — | vs Star Battle: one (ruleset) / two ✗ |
| 66 Statue Park | extension | A1, A7 | — | vs Pentomino tiling, Boats: two / two ✓ |
| 67 Pentomino tiling | extension | A7, A18 | — | vs Statue Park: two / two ✓ |
| 68 Tangram | **not described** | — | continuous domain: the plane, rigid motions, real arithmetic | vs Pentomino tiling: not computable |

## Counts

- Described well: **13**. Tren, Hiroimono, Araf, Lohkous, Light and Shadow,
  Sukoro, View, Doppelblock, Japanese Sums, Hakoiri, Dosun-Fuwari, Squaro,
  Shinro.
- Described with an extension: **23**.
- Not described: **1** (Tangram).
- Described well or with an extension: 36 of 37.

Every named variant got a word, and every word is one a reader of
`theory.md` would accept, with two caveats: one-sided pentominoes as a
modifier, and N-Queens' pieces as a notation-dependent board shape.

## Cut pairs that looked wrong (6, plus 1 doubtful)

1. **Hiroimono and Neko Puzzle.** Computed as two games, because the freedom
   kind differs: a fill of the sequence against a transition system. The
   same search can be written either way.
2. **Sukoro and View.** Computed as one game (a ruleset).
3. **Symmetry Area and Filling.** Computed as two games, because the answer
   sort differs: walls against numbers. Written with numbers, it is Filling
   plus a modifier. It also lands in two different families for the same
   reason.
4. **Hakoiri and Star Battle.** Computed as one game (a ruleset).
5. **Toichika and Hakoiri.** Computed as one game (a ruleset).
6. **N-Queens and Star Battle.** Computed as one game (a ruleset).
7. **Doubtful: Squaro and Creek.** The language does not compare spaces up to
   duality.

**The shape behind the flags.**

- **Flags 2, 4, 5 and 6: games with no clue vocabulary.** All four are games
  with givens only. Each game's central rule is a `rule` line, and the table
  files any replaced rule or domain as a ruleset. So two unrelated clue-free
  games on the same space always compute as one game.
  - The theory's principle (a ruleset keeps its techniques) says they are
    two games. So the theory can name the part that makes the difference: in
    a game with no clue kind, the central goal predicate plays the role a
    clue kind plays.
  - It is the structural test that is too weak.
- **Flags 1 and 3: the answer's writing decides.** The word depends on how
  the answer is written: a sequence or moves, walls or numbers.
- **Gaps in the table that these puzzles hit:** no row for a shape change, a
  removed rule, or a changed answer sort.
- **Families: shading and placement share a sort.** The family cannot be
  computed for `cell -> bool`, which is both shading (Squaro) and placement
  (Shinro, Scrin).

**Techniques:** the cited sources name a technique only for Cryptarithm, and
it states in the technique form. The pzprjs rule texts name none, and I did
not search the Janko pages for any.
