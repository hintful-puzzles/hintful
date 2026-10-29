# Experiment B, batch "latin": thirteen games in the language

Written 2026-10-29 against `language.md`, `theory.md` and `taxonomy.md`
§ "Disagreements with the catalog" in
`openspec/changes/investigate-a-language-for-puzzle-games/`. Games: Keen,
Towers, Unequal, Mathrax, Group, Salad, Seismic, Filling, ABCD, Crossing,
Subsets, Magnets, Undead.

Sources read for each game: `help/games/<id>.md`, the `Rules:` requirements of
`openspec/specs/<id>/spec.md`, its `paramConfig` (in `index.ts` or `state.ts`),
its `*_RUNGS` list, and the solver's reason types where a technique needed
more than the rung name (Keen, Towers, Group, Subsets, Filling, Undead).

Two conventions. A **tier** in a `deal` line names the game's own ladder
(`tierNames(k)`). An entry under "Did not fit" is classed as one of these:

- a **library addition**: a name defined in the core logic once;
- a **notation** need: syntax the language's blocks do not offer, with no new
  logic;
- a **core change**: a new block kind, a new freedom kind, or logic beyond
  first-order with counting, aggregates and transitive closure;
- **prose**: a rule left in words.

One finding comes up in five games: a technique premise that reads "no way
of filling this cage, line or path is consistent with the marks". It is
written once, under Keen, and referred to after that.

---

## Keen

```pzl
game keen "Keen"
family latin
size w in 3..9
space grid(w, w), regions cage = dealt partition(cells)      # cages are contiguous
answer value : cell -> 1..w
marks cand : cell -> set of 1..w
shape latin(value, rows + cols)
clue cage at region k value {+, ×} × N  ∪  {−, ÷} × N
  where (op(v) in {−, ÷} implies |k| = 2)
  means case op(v) of
    +  : sum c in k of value(c) = target(v)
    ×  : prod c in k of value(c) = target(v)                   # prod: see below
    −  : exists a, b in k: a != b and value(a) - value(b) = target(v)
    ÷  : exists a, b in k: a != b and value(a) = target(v) * value(b)
freedom fill
deal cages: the partition and each cage's operation; tier in {Easy, Normal, Hard, Extreme, Unreasonable}

setting MultiplicationOnly { replace deal cages: every cage's op is × }
```

Every cell lies in a cage, so the cage clue is the whole vocabulary. A
one-cell cage reads as a given (`+` with its digit), and Keen deals no
separate givens.

```pzl
technique cage tier Normal                  # Keen's "cage" rung
  for cage k with clue v, cell c in k, digit d in cand(c)
  premise not exists f : k -> 1..w
            where (forall x in k: f(x) in cand(x)) and f(c) = d
              and distinct(f over k ∩ L) for every line L
              and v.means(f)
  conclude d not in cand(c)
technique cageLine tier Hard
  for cage k with clue v, line L, digit d
  premise forall f : k -> 1..w consistent as above:
            exists x in k ∩ L: f(x) = d
  conclude forall c in L - k: d not in cand(c)
```

**Variations.** MultiplicationOnly contains only a `deal` change, so the
computed word is generator setting. Today it is a plain boolean, and
`taxonomy.md` files it as a generator setting. They agree. Difficulty is a
generator setting, and grid size is a size.

**Did not fit.**

- **Core change, the product aggregate (`prod`).** The core's aggregates are
  `count`, `sum`, `distinct` and `set`. A product over a variable-sized cage
  cannot be defined from them, because the logic cannot fold an arbitrary
  operator. The smallest change is a general `fold(op, t over S)`, with `sum`
  and `prod` as instances. Taken alone this is mild: it is one more
  aggregate of the same kind.
- **Core change, quantifying over assignments.** The premises of `cage` and
  `cageLine` quantify over an assignment `f : k -> 1..w` of a cage whose size
  varies. That is existential second-order logic over a bounded set. It is
  not first-order: for a fixed cage size it unrolls into first-order, but no
  single formula covers every size. The alternative is to write the premise
  as "suppose value(c) = d and derive a contradiction from the cage alone",
  which is the `premise suppose` form `language.md` reserves for Search and
  marks unmarkable. That would misfile a rung the hint narrates as a
  Tactic. **The same need recurs** in Towers (`arrangement`), Undead
  (`sightline`) and Filling (`growth`). Keen's two cage rungs cannot be
  written without it.
- **Notation.** A clue value is a pair (operation, target), and the
  restriction of − and ÷ to two-cell cages is a condition on placement given
  the value. Both are written above with a `where` on the clue line, which
  `language.md` does not show but does not forbid.

---

## Towers

```pzl
game towers "Towers"
family latin
size w in 3..9
space grid(w, w)                         # border slots: one per row or column end
answer value : cell -> 1..w
given value
marks cand : cell -> set of 1..w; done : slot -> bool     # done is a play aid, not logic
shape latin(value, rows + cols)
clue sees at slot s value 1..w
  means visible(s) = v
freedom fill
deal clues: which slots show; givens: how many; tier in {Easy, Normal, Hard, Unreasonable}
```

Library addition, in the core logic:

```pzl
define visible(s) = count c in line(s)
  where forall c2 in line(s): c2 before c from s implies value(c2) < value(c)
```

```pzl
technique tallestNearest tier Easy
  for slot s with clue 1
  conclude value(first c in line(s) from s) = w
technique lowerBound tier Easy              # "too tall, too close"
  for slot s with clue v, cell c in line(s) at distance i from s (1-based), height h in cand(c)
  premise h > w - v + i
  conclude h not in cand(c)
technique facing tier Easy
  for line L with slots s1, s2 at its ends, clues v1 + v2 = w + 1
  conclude value(the cell at distance v1 from s1 along L) = w
```

`arrangement` (Hard), "no arrangement of the line giving clue v puts h here",
needs the assignment quantifier described under Keen.

**Variations.** None declared. Difficulty is a generator setting, and grid
size is a size.

**Did not fit.**

- **Library addition: `visible(s)`**, defined above. It needs the order
  `before ... from s` along a line, which the core's ordered lines provide.
- **Core change: the assignment quantifier**, for the `arrangement` rung only.
- The "mark a clue done" aid is UI state with no logical meaning. It is
  listed under `marks` for completeness.

---

## Unequal

There are two rulesets. Each replaces the clue kind, so per the theory
(§ "The asymmetry of adding") they are two games of one family, written here
as Unequal and Adjacent.

```pzl
game unequal "Unequal"
family latin
size order in 3..16
space grid(order, order)
answer value : cell -> 1..order
given value
marks cand : cell -> set of 1..order; done : edge -> bool
shape latin(value, rows + cols)
clue greater at edge e = (a, b) value {a, b}          # which side is larger
  means value(v) > value(other(e, v))
freedom fill
deal clues: which true inequalities show (fewer at higher tiers); givens; tier in {Trivial, Easy, Tricky, Extreme, Recursive}

game adjacent "Adjacent"
family latin
size order in 3..16
space grid(order, order)
answer value : cell -> 1..order
given value
marks cand : cell -> set of 1..order; done : edge -> bool
shape latin(value, rows + cols)
clue bar at every edge e = (a, b) value {bar, none}   # every edge carries one
  means (v = bar) iff |value(a) - value(b)| = 1
freedom fill
deal givens; tier
```

```pzl
technique greater tier Easy                 # in Unequal
  for edge (a, b) with clue a, digit d in cand(a)
  premise forall d2 in cand(b): d <= d2
  conclude d not in cand(a)
technique adjacent tier Easy                # in Adjacent
  for edge (a, b) with clue bar, digit d in cand(a)
  premise forall d2 in cand(b): |d - d2| != 1
  conclude d not in cand(a)
  # and with clue none: premise cand(b) ⊆ {d - 1, d + 1}
```

**Variations.** The Unequal/Adjacent choice contains `replace clue`, so the
language reports **not a variation: a separate game**. The catalog files
them as two rulesets, so they **disagree**. `taxonomy.md` left this as
question 2, and `theory.md` § "The asymmetry of adding" resolves it as two
games of one family. Difficulty is a generator setting, and size is a size.

**Did not fit.**

- **Core change (notation, in clue semantics): a complete clue kind.**
  Adjacent's rule includes the absence of a bar ("the absence of a bar tells
  you the numbers are not consecutive"). In the language, a clue is a
  predicate that exists only where one is dealt, so an undealt bar means
  nothing. It states only with either a total placement (`at every edge`,
  with `none` as a value) or a term `clued(e)` the rules can read. Neither
  is in `language.md`. The total placement is the faithful reading: the game
  promises every bar is shown. It changes the clue block, not the logic.
  Subsets needs the same.
- Both games otherwise fit with no library addition.

---

## Mathrax

```pzl
game mathrax "Mathrax"
family latin
size o in 3..9
space grid(o, o)
answer value : cell -> 1..o
given value
marks cand : cell -> set of 1..o
shape latin(value, rows + cols)
clue arith at interior vertex x value {+, −, ×, ÷} × N
  means forall (a, b) in diagonal_pairs(x): op(v)(value(a), value(b)) = target(v)
        # −: |a - b|;  ÷: max / min
clue equal at interior vertex x value {=}
  means forall (a, b) in diagonal_pairs(x): value(a) = value(b)
clue parity at interior vertex x value {even, odd}
  means forall c in cells(x): value(c) mod 2 = (0 if v = even else 1)
freedom fill
deal kinds: which of the six clue kinds may appear; clues; givens; tier in {Easy, Normal, Tricky, Unreasonable}

setting AdditionClues       { replace deal kinds: + allowed or not }
setting SubtractionClues    { replace deal kinds: − allowed or not }
setting MultiplicationClues { replace deal kinds: × allowed or not }
setting DivisionClues       { replace deal kinds: ÷ allowed or not }
setting EqualityClues       { replace deal kinds: = allowed or not }
setting EvenOddClues        { replace deal kinds: E, O allowed or not }
```

Library addition:

```pzl
define diagonal_pairs(x) = { (nw(x), se(x)), (ne(x), sw(x)) }   # the four cells around an interior vertex
```

`interior vertex` restricts the placement to vertices with four incident
cells.

```pzl
technique clue tier Easy                    # Mathrax's one own rung
  for clue at x, pair (a, b) in diagonal_pairs(x), digit d in cand(a)
  premise not exists d2 in cand(b): op(v)(d, d2) = target(v)
  conclude d not in cand(a)
```

A diagonal pair shares no row or column, so d2 may equal d. The parity
clue's version is `premise d mod 2 != parity(v)`, and the equality clue's is
`premise d not in cand(b)`.

**Variations.** The six clue switches each contain only a `deal` change, so
each is a generator setting. Today they are plain booleans, and `taxonomy.md`
files them as generator settings. They agree. A clue kind that is switched
off is still in the vocabulary, and only the deal stops dealing it.

**Did not fit.**

- **Library addition: `diagonal_pairs(x)`** and the vertex's `nw`, `ne`,
  `sw` and `se` cells. These need the grid's orientation, which `grid(w, h)`
  holds as coordinates. It is a definition, not a renamed rule.
- `prod` is not needed, because × is binary here.
- Fits.

---

## Group

```pzl
game group "Group"
family latin
size w in 3..26
space table(E) where E = 1..w           # cells are pairs (a, b) of elements; rows and cols are lines
answer value : cell -> E
given value
marks cand : cell -> set of E
shape latin(value, rows + cols),
      forall a, b, c in E: value(cell(value(cell(a, b)), c)) = value(cell(a, value(cell(b, c))))
freedom fill
deal givens; identity: shown (e = 1, its row and column given) or hidden; tier in {Easy, Normal, Hard, Extreme, Unreasonable}

setting IdentityHidden {                 # filed as the modifier "Show identity" off
  replace deal identity: hidden, so the identity's row and column are not given
  # deal test: only at the tiers HIDDEN_IDENTITY_TIERS lists, and never at w = 3
}
```

The help's other two conditions, the identity and inverses, follow from
Latin and associative on a finite set, so they are not separate rules. The
spec's `Rules:` requirement says only "Latin and associative". Dragging the
headers to reorder rows and columns, and the thick separator lines, are play
aids with no logical meaning.

Library addition:

```pzl
define table(E): cell = E × E; rows = { {cell(a, b) : b in E} : a in E }; cols likewise; cell(a, b) its constructor
```

```pzl
technique associativity tier Hard
  for a, b, c in E
  premise value(cell(a, b)) = p and value(cell(b, c)) = q and value(cell(p, c)) = r
  conclude value(cell(a, q)) = r
  # and the mirrored form, from a·(b·c) to (a·b)·c
technique identityElim tier Normal       # fires only when the identity is hidden
  for cell (a, b) with value(cell(a, b)) = p, p != b
  conclude forall x in E: x not in cand(cell(a, x)) and x not in cand(cell(x, a))
           # "a is not the identity": strike, in a's row and column, the mark that would make a·x = x
           # (and symmetrically for b when p != a)
```

`identityElim` concludes "a is not the identity". The marks record that fact
only through a pencil mark in each cell of a's row and column (the help's
"identity marks"). So the conclusion is written as a family of candidate
strikes, which says less than the fact. The faithful conclusion needs a mark over elements, not
cells: `marks idcand : E -> bool`. The game's marks do not have one, so the
technique as narrated is a derived fact written through cell marks.

**Variations.** IdentityHidden contains only a `deal` change, so it is a
generator setting. Today it is the **modifier** "Show identity", so they
**disagree**. `theory.md` § "The open cases" already resolves it this way:
`identityFill` and `identityElim` are sound in the plain game too, and never
fire there. Difficulty is a generator setting, and grid size is a size.

**Did not fit.**

- **Library addition: the space `table(E)`.** Its cells are indexed by the
  answer's own value sort, so the rule composes the answer with itself
  (`cell(value(cell(a, b)), c)`). The core is many-sorted, and this needs
  the value set `1..w` and the row-index sort to be the same sort. That is
  allowed, but no other sample needs it. The rule is then plain first-order.
- **Marks gap, not a language gap:** `identityElim`'s fact ("b is not the
  identity") has no mark of its own. The language can state the technique.
  Its markability depends on a mark the game does not give.
- Fits with one library addition.

---

## Salad

The plain game is Numbers (Number Ball). Letters (ABC End View) adds a clue
kind to it. Both deal givens of the answer, so neither replaces the other's
vocabulary: Numbers has no vocabulary, only givens.

```pzl
game salad "Salad"
family latin
size order >= 3, k in 2..9 with k <= order        # k is "Symbols"
space grid(order, order)
answer value : cell -> {blank} ∪ 1..k
given value coarsened by {blank -> cross, 1..k -> ball}   # Numbers' balls and crosses
given value                                               # given symbols
marks cand : cell -> set of ({blank} ∪ 1..k)
shape latin_blanks(value, rows + cols, k)
freedom fill
deal givens: symbols, balls and crosses; tier in {Easy, Normal}

modifier Letters {                        # filed as ruleset "Letters"
  add clue endview at slot s value 1..k
    means value(first c in line(s) from s where value(c) != blank) = v
  replace deal givens: symbols only, none below 8x8 (border clues alone); strip clues to the tier
}
```

Library addition:

```pzl
define latin_blanks(f, lines, k) =
  forall L in lines: (forall d in 1..k: count c in L where f(c) = d = 1)
```

The blanks per line follow (order − k). This is `latin` with a blank value,
a definition and not a renamed rule.

```pzl
technique borderNear tier Easy            # Letters: the first square not known empty sees the clue
  for slot s with clue v, cell c = first c in line(s) from s where cand(c) != {blank}
  premise true                              # the squares before c are all known empty
  conclude forall d in 1..k - {v}: d not in cand(c)
technique countHolesDone tier Easy
  for line L
  premise count c in L where cand(c) = {blank} = order - k
  conclude forall c in L where cand(c) != {blank}: blank not in cand(c)
```

`borderNear` is read from `salad/hint.ts`. Its premise is the run of
squares known empty before `c`, which the `first ... where` binding carries.
It uses `first` along an ordered line, and states in the core.

**Variations.**

- Letters contains `add clue` plus `deal`, so it is a **modifier**. Today it
  is a **ruleset**, so they **disagree**. `theory.md` § "What a variation
  keeps" already counts Letters as adding `borderNear` and `borderFar` to
  Numbers.
- Numbers, read against Letters, would `remove clue`: "not a variation". So
  the direction matters, and the language files the pair as plain plus
  modifier, never as two exclusive rulesets.
- Symbols (k) is a **size**. Today it is a `numberItem` labeled in the
  `kind` slot. They do not disagree on a word, since the catalog gives it
  none, but the label slot is wrong for a size.
- Difficulty is a generator setting.

**Did not fit.**

- **Library addition: `latin_blanks`.**
- The fact that Letters "excludes" Numbers' ball and cross givens is a deal
  constraint (`replace deal`), not a rule. This fits.
- Fits with one library addition.

---

## Seismic

```pzl
game seismic "Seismic"
family regions-numbered
size w, h >= 4
space grid(w, h), regions area = dealt partition(cells)
answer value : cell -> 1..9
given value
marks cand : cell -> set of 1..9
shape forall r in area: set(value over r) = 1..|r|        # each of 1..N once in an area of size N
rule apart: forall c1 != c2: value(c1) = value(c2) implies not clash(c1, c2, value(c1))
define clash(c1, c2, n) = exists L in rows + cols: c1, c2 in L and gap(c1, c2, L) < n
freedom fill
deal areas; givens; tier in {Easy, Normal}

ruleset Tectonic {
  replace define clash(c1, c2, n) = c2 in adj8(c1)
}
```

Library addition: `gap(c1, c2, L)` = `count c in L where c strictly between
c1 and c2`.

```pzl
technique hidden tier Easy
  for area r, number n in 1..|r|, cell c in r
  premise forall c2 in r - {c}: n not in cand(c2)
  conclude value(c) = n
technique starve tier Normal
  for area r, number n, cell c not in r
  premise forall c2 in r where n in cand(c2): clash(c, c2, n)
  conclude n not in cand(c)
```

`starve` reads only `clash`. It is general in the rule's parameter, so it
holds unchanged under Tectonic, which is the theory's case (3).

**Variations.** Tectonic replaces a rule (the clash relation), so it is a
**ruleset**. Today it is a ruleset. They agree. Difficulty is a generator
setting, and w and h are sizes.

**Did not fit.**

- **Library addition: `gap`.**
- The domain depends on the area (`1..|area(c)|`). The answer's codomain is
  fixed (`1..9`), and the shape cuts it down. That is a rule, not a domain.
  This fits, but the language's `answer` line cannot state a dependent
  domain, so the domain is wider than the game's.
- Writing the ruleset as a replaced `define` and not a replaced `rule` is a
  notational choice. A ruleset that replaces the whole `rule apart` is
  equivalent.
- Fits with one library addition.

---

## Filling

```pzl
game filling "Filling"
family regions-numbered
size w, h >= 1
space grid(w, h)
answer value : cell -> 1..w*h
given value
shape forall c: |component(c)| = value(c)
freedom fill
deal givens; tier in {Easy, Unreasonable}
```

Filling's region is defined by the answer, as Palisade's is. Library
addition:

```pzl
define component(c) = { d : chain(c, d, adj4) through cells x with value(x) = value(c) }
```

```pzl
technique lonely tier Easy
  for cell c with value unknown
  premise forall region R adjacent to c (R a component of placed cells, n = its value):
            dist(R, c, through cells unknown) > n - |R|
  conclude value(c) = 1
technique bitmap tier Easy                 # "nothing else fits"
  for cell c, n
  premise exists d in adj4(c): value(d) = n and |component(d)| = n   # a full n-region touches c
  conclude value(c) != n
```

`growth` ("every way it could reach six passes through the same squares")
quantifies over connected extensions of a region. That is the assignment
quantifier again, here over sets of cells (monadic second-order). Its
special case "only one empty square beside it" is first-order. The game has
no candidate marks (`marks` is absent: the hint reasons from placed numbers
only), so `bitmap`'s premise and conclusion are over values, not marks.

**Variations.** None declared. Difficulty is a generator setting, and w and
h are sizes.

**Did not fit.**

- **Library additions: `component(c)`** (by `chain`), and **`dist(R, c,
  through P)`**, the shortest-path length inside a set. Bounded distance is
  transitive closure over (cell, counter) pairs, so it stays in the core.
- **Core change: the assignment quantifier**, for `growth` and `blocked`
  ("every way to finish this region passes here"). It is monadic
  second-order over connected sets.
- `lonely` and `bitmap` fit.

---

## ABCD

```pzl
game abcd "ABCD"
family counted-letters
size w, h >= 2, n in 3..9
space grid(w, h)
answer letter : cell -> 1..n
marks cand : cell -> set of 1..n
clue count at (line L, letter l) value 0..|L|            # the numbers on the edge, one per line and letter
  means count c in L where letter(c) = l = v
rule apart: forall c, d with d in adj4(c): letter(c) != letter(d)
freedom fill
deal clues: all shown, or some hidden (Remove clues); tier in {Easy, Unreasonable}

modifier NoDiagonal {                      # filed as modifier "Allow diagonal touching" off
  add rule apart8: forall c, d with d in adj8(c) - adj4(c): letter(c) != letter(d)
  # deal test: only with n >= 5
}
setting RemoveClues { replace deal clues: strip as many as uniqueness at the tier allows }
```

```pzl
technique satisfied tier Easy
  for line L, letter l with clue v
  premise count c in L where letter(c) = l = v
  conclude forall c in L where letter(c) unknown: l not in cand(c)
technique packed tier Easy
  for line L, letter l with clue v, stretches S = segments(L, cells where l in cand)
  premise (count c in L where letter(c) = l) + sum s in S of ceil(|s| / 2) = v
  conclude forall s in S where |s| odd: forall i: (i odd implies letter(s[i]) = l)
           and (i even implies l not in cand(s[i]))
```

**Variations.**

- NoDiagonal adds a rule, so it is a **modifier**. Today it is a modifier.
  They agree.
- RemoveClues contains only a `deal` change, so it is a **generator
  setting**. Today it is a plain boolean, and `taxonomy.md` files it as a
  generator setting. They agree. It removes individual clues, not a clue
  kind, so it is not the "remove clue" row of `language.md`'s table.
- Letters (n) is a **size**. Today it is a `numberItem`, labeled in the
  `tail` slot. They agree.
- Difficulty is a generator setting.

**Did not fit.**

- **Library addition: `segments(L, P)`**, the maximal runs of consecutive
  cells of L in P, with indexing `s[i]`. Crossing needs it too.
- **Notation:** a clue placed at a pair (line, letter), not at one element
  or slot. The language says a placement is "an element sort, or a line or
  slot". A product placement is a small extension of the clue line, with no
  new logic.
- `ceil` and `mod` are arithmetic.
- Fits with one library addition and one notation need.

---

## Crossing

```pzl
game crossing "Crossing"
family counted-letters
size w, h >= 2
space grid(w, h), wall = dealt set of cells
answer digit : cell - wall -> 1..9
marks cand : cell -> set of 1..9
clue list at board value finite set of N            # the number list, all distinct
  means forall x in N:
          (x in v) iff exists r in runs: number(r) = x
        and forall r1 != r2 in runs: number(r1) != number(r2)
        # with |runs| = |v| this is a bijection between runs and listed numbers
freedom fill
deal walls: every open cell in some run, no run longer than MAX_NUMBER_LENGTH;
     the list read from a filled grid; tier in {Easy, Unreasonable}

setting SymmetricWalls { replace deal walls: 180° rotationally symmetric }
```

Library additions:

```pzl
define runs = { s : L in rows + cols, s in segments(L, cells - wall), |s| >= 2 }
define number(r) = sum i in 1..|r| of digit(r[i]) * 10^(|r| - i)
```

```pzl
technique onlyNumber tier Easy
  for run r
  premise exactly one x in list with len(x) = |r| and x not yet used elsewhere
  conclude forall i: digit(r[i]) = x[i]
technique sharedDigit tier Easy
  for run r, position i
  premise forall x in fits(r): x[i] = d             # fits(r): listed numbers of r's length that agree with r's marks and aren't placed elsewhere
  conclude digit(r[i]) = d
technique crossRuns tier Easy
  for cell c in across run a and down run b
  premise {x[pos(c, a)] : x in fits(a)} ∩ {y[pos(c, b)] : y in fits(b)} = {d}
  conclude digit(c) = d
```

**Variations.** SymmetricWalls contains only a `deal` change (the walls are
a dealt space), so it is a **generator setting**. Today it is the label slot
`kind`, which names no word, and `taxonomy.md` already files it as a
generator setting. The word agrees with the taxonomy, and the label slot
does not. Difficulty is a generator setting, and w and h are sizes.

**Did not fit.**

- **Library additions: `segments`** (shared with ABCD), **`runs`** and
  **`number(r)`**. `number` needs exponentiation and a run's positional
  index. Both are arithmetic over terms, and `x[i]`, a listed number's i-th
  digit, is arithmetic too.
- **Notation: a clue placed on the whole board** (`at board`) whose value is
  a finite set of numbers, not a number. Undead's totals need the same
  nullary placement.
- `fits(r)` in the techniques is a defined set (first-order). It is used as
  a term, not added to the library, because only Crossing's techniques read
  it.
- Fits with library additions and one notation need.

---

## Subsets

```pzl
game subsets "Subsets"
family placement-bijection
size none                                 # fixed: a 4×4 grid over the letters {A, B, C, D}
space grid(4, 4), letters = {A, B, C, D}
answer set : cell -> subsets(letters)     # 16 values for 16 cells
given set
marks letter : cell × letters -> {present, cleared, unknown};
      ruledOut : cell -> set of subsets(letters)
shape bijection(set)
clue horseshoe at every edge e = (a, b) value {a ⊃ b, b ⊃ a, none}
  means case v of
    a ⊃ b : set(b) ⊂ set(a)
    b ⊃ a : set(a) ⊂ set(b)
    none  : not set(a) ⊆ set(b) and not set(b) ⊆ set(a)
freedom fill
deal givens; tier in {Easy, Normal}
```

```pzl
technique arrowKnown tier Easy
  for edge (a, b) with clue a ⊃ b, letter x
  premise letter(b, x) = present
  conclude letter(a, x) = present
technique arrowMask tier Easy
  for edge (a, b) with clue a ⊃ b, letter x
  premise letter(a, x) = cleared
  conclude letter(b, x) = cleared
technique ruleOut tier Normal             # the argument run backwards
  for edge (a, b) with clue a ⊃ b, set T not in ruledOut(b)
  premise forall U not in ruledOut(a): not T ⊂ U
  conclude T in ruledOut(b)
```

**Variations.** None but difficulty, which is a generator setting. The game
has no size: the help gives the reason (16 sets fill 16 cells), and the
language shows it by `size none`.

**Did not fit.**

- **Core change (notation, in clue semantics): a complete clue kind**, the
  same as Adjacent's. "All possible horseshoe symbols are given", and the
  absence of one is a rule (incomparable sets).
- **Library addition: `subsets(S)`** as a value set, with `⊆` and `⊂`
  between values. The core's value sets are `1..n` and named finite sets.
  A powerset as a domain is a definition over a finite set, with no new
  logic.
- `bijection` is used as in Ascent's sample. The library table does not
  list it, so it is a library addition shared with Ascent.
- Marks over `cell × letters` (a mark per cell and letter) and over sets
  (`ruledOut`) are richer than a candidate set. The `marks` line states
  them as functions over product sorts, the same extension as ABCD's clue
  placement.

---

## Magnets

```pzl
game magnets "Magnets"
family objects-placed
size w, h in 2..(DESC_ALPHABET_SIZE - 1)
space grid(w, h), tiles = dealt partition(cells, each part a domino (two adj4 cells) or a singleton)
answer pole : cell -> {+, −, 0}
marks magnet : tile -> {?, unknown}      # "?": a magnet, way round unknown
shape forall t in tiles:
        (|t| = 1 implies pole(t's cell) = 0) and
        (|t| = 2 implies (forall c in t: pole(c) = 0) or set(pole over t) = {+, −})
rule apart: forall c, d with d in adj4(c): pole(c) = pole(d) implies pole(c) = 0
clue plus at line-start slot s value 0..|line(s)|
  means count c in line(s) where pole(c) = + = v
clue minus at line-end slot s value 0..|line(s)|
  means count c in line(s) where pole(c) = − = v
freedom fill
deal tiles; clues: all, or stripped (Strip clues); tier in {Easy, Tricky}

setting StripClues { replace deal clues: remove numbers one at a time while unique at the tier }
```

```pzl
technique force tier Easy                   # "like poles repel"
  for tile t = {a, b}, c in adj4(a) - t, d in adj4(b) - t
  premise pole(c) = + and pole(d) = +        # both ends touch a +
  conclude pole(a) = 0 and pole(b) = 0       # (the − case alike; one end alone strikes that end's pole)
technique lineFull tier Easy
  for line L with plus clue v
  premise count c in L where pole(c) = + = v
  conclude forall c in L where pole(c) unknown: pole(c) != +
           and forall t ⊆ L with |t| = 2, t undecided: pole over t = 0
technique oddGap tier Tricky
  for line L whose undecided cells must all hold poles, plus need p, minus need m, p = m + 1
  premise exactly one s in segments(L, cells undecided) has |s| odd
  conclude pole(s[1]) = +
```

**Variations.** StripClues contains only a `deal` change, so it is a
generator setting. Today it is a plain boolean, and `taxonomy.md` files it
as a generator setting. They agree. Difficulty is a generator setting, and
w and h are sizes.

**Did not fit.**

- **Library addition: `segments`** (shared), for `oddGap`.
- The dealt domino tiling is a `dealt partition` with a shape condition on
  its parts, which the library's `dealt` form takes.
- The `?` mark says "this tile is a magnet". It is a fact over tiles, not
  cells, and the technique conclusions can name it. `lineFull`'s "counting
  marked magnets" reads it.
- Fits with one shared library addition.

---

## Undead

```pzl
game undead "Undead"
family objects-placed
size w, h with w * h <= 54, w, h >= 3
space grid(w, h), mirror : dealt cells -> {\, /}
answer monster : cell - mirror -> {ghost, vampire, zombie}
given monster
marks cand : cell -> set of {ghost, vampire, zombie}
clue totals at board value (g, v, z)
  means count c where monster(c) = ghost = g and ... vampire = v and ... zombie = z
clue seen at every slot s value 0..
  means count t in ray(s) where cell(t) not in mirror and
          (monster(cell(t)) = zombie
           or (monster(cell(t)) = vampire and not reflected(t))
           or (monster(cell(t)) = ghost and reflected(t))) = v
freedom fill
deal mirrors; givens; tier in {Easy, Normal, Tricky, Unreasonable}
```

Library additions, all by `chain` over the finite states (cell, direction):

```pzl
define step((c, d)) = (c + d', d') where d' = reflect(d, mirror(c)) if c in mirror else d
define ray(s) = { t : chain(entry(s), t, step) and cell(t) on the board }    # a deterministic walk that ends at the border
define reflected(t) = exists t0 in ray(s): chain(entry(s), t0, step) and chain(t0, t, step) and cell(t0) in mirror
```

A ray can pass through a cell twice. It is counted over states (cell,
direction), not cells, so a monster seen twice counts twice, as the rule
does.

```pzl
technique total tier Easy
  for monster kind m with total n
  premise count c where monster(c) = m = n
  conclude forall c undecided: m not in cand(c)
technique onlyCells tier Easy
  for monster kind m with total n
  premise count c where m in cand(c) = n
  conclude forall c where m in cand(c): monster(c) = m
```

`sightline`, the core rung ("the line's two numbers leave no room for this
monster in this cell"), is `pathSurvivors` in `undead/solver.ts`. It
enumerates every filling of a path's cells from their candidates that meets
both end clues, and strikes what no filling uses. That is the assignment
quantifier of Keen.

**Variations.** None but difficulty, which is a generator setting. w and h
are sizes.

**Did not fit.**

- **Library additions: `step`, `ray` and `reflected`**, the mirror
  sightline, all by `chain`. This is the first library item in the batch
  that walks a space dealt by the generator, and it states in the core.
- **Notation: a clue `at board`** (the totals), as in Crossing.
- **Core change: the assignment quantifier**, for `sightline`, which is the
  game's main rung.
- Without `sightline` the ladder written here is only `total`, `onlyCells`
  and `single`, which does not reach most boards.

---

## Summary of what did not fit

**Core changes**, counted by kind:

1. **The assignment quantifier**: `exists f : S -> D within the marks where
   P`, over a set S whose size the instance fixes. This is bounded
   second-order logic. It is needed by the rungs Keen `cage` and `cageLine`,
   Towers `arrangement`, Undead `sightline`, and Filling `growth` and
   `blocked` (monadic, over cell sets), in five games. These are Tactic
   rungs, narrated as forced moves, not Search. `premise suppose` would
   misfile them. This is the batch's main finding: the language's technique
   form is first-order, and the "every way to fill this unit" family of
   techniques is not.
2. **A fold aggregate** (`prod`, generally `fold(op)`), for Keen's ×
   cages. This is one more aggregate.
3. **A complete clue kind** (`at every <sort>`, or a term `clued(e)`), for
   Unequal-Adjacent's bars and Subsets' horseshoes, where an absent clue is a
   rule. It changes the clue block's semantics, not the logic.

**Notation needs** (no new logic): a clue placed `at board` (Crossing's list,
Undead's totals); a clue or mark at a product placement (ABCD's
line × letter, Subsets' cell × letter marks); a `where` condition on a
clue's placement given its value (Keen's two-cell − and ÷).

**Library additions** (definitions in the core logic): `visible` (Towers),
`diagonal_pairs` (Mathrax), `table(E)` (Group), `latin_blanks` (Salad),
`gap` (Seismic), `component` and `dist` (Filling), `segments` (ABCD,
Crossing, Magnets), `runs` and `number` (Crossing), `subsets(S)` as a
domain and `bijection` (Subsets; `bijection` is shared with Ascent), and
`step`, `ray` and `reflected` (Undead). None is a renamed rule: each defines
a structure (a sightline, a run, a component, a table) that a rule then
quantifies over.

**Rules left as prose:** none. Every rule of the thirteen games states in the
logic, given the additions above. What stays prose is only play-aid state:
Towers' and Unequal's "done" clue marks, and Group's header reordering and
separator lines.

**Marks gap, not a language gap:** Group's `identityElim` concludes "b is not
the identity", which no mark records. The game writes it as candidate
strikes.

## Table

| Game | Verdict | Library additions | Core changes | Variation words that disagree with the catalog |
| --- | --- | --- | --- | --- |
| Keen | needs core change | — | `prod` (fold aggregate); assignment quantifier (`cage`, `cageLine`) | none (Multiplication only: generator setting, agrees) |
| Towers | needs core change (one rung) | `visible` | assignment quantifier (`arrangement`) | none declared |
| Unequal | needs core change (Adjacent) | — | complete clue kind (Adjacent's bars) | Unequal / Adjacent: catalog says rulesets, computed "separate game" (two games of one family) |
| Mathrax | fits with library additions | `diagonal_pairs` | — | none (six clue switches: generator settings, agree) |
| Group | fits with library additions | `table(E)` | — | Show identity: catalog says modifier, computed generator setting |
| Salad | fits with library additions | `latin_blanks` | — | Letters: catalog says ruleset, computed modifier over Numbers (Numbers is the plain game); Symbols is a size in the `kind` label slot |
| Seismic | fits with library additions | `gap` | — | none (Tectonic: ruleset, agrees) |
| Filling | needs core change (two rungs) | `component`, `dist` | assignment quantifier, monadic (`growth`, `blocked`) | none declared |
| ABCD | fits with library additions (+ notation) | `segments` | — (notation: line × letter placement) | none (No diagonal: modifier; Remove clues: generator setting; both agree) |
| Crossing | fits with library additions (+ notation) | `segments`, `runs`, `number` | — (notation: `at board` clue) | Symmetric walls: generator setting, catalog files it under the label slot `kind` (no word) |
| Subsets | needs core change | `subsets(S)` domain, `bijection` | complete clue kind (horseshoes and their absence) | none declared |
| Magnets | fits with library additions | `segments` | — | none (Strip clues: generator setting, agrees) |
| Undead | needs core change (main rung) | `step`, `ray`, `reflected` | assignment quantifier (`sightline`); notation `at board` | none declared |

Counts: 13 games, all 13 described with every declared variation. The
**rules** of all 13 state with library additions and notation alone. No rule
needed a core change except where noted: Keen's product, and Adjacent's and
Subsets' complete clues. The **techniques** of 5 games need the assignment
quantifier. Verdicts: 0 fit outright, 7 fit with library additions (Mathrax,
Group, Salad, Seismic, ABCD, Crossing, Magnets), and 6 need a core change
(Keen, Towers, Unequal, Filling, Subsets, Undead). Of the 6, 4 need it for
techniques only (Towers, Filling, Undead, and Keen apart from `prod`).
Variation words that disagree with the catalog: Unequal's two rulesets
(separate games), Group's Show identity (generator setting), and Salad's
Letters (modifier). Two label-slot misfilings without a word disagreement:
Salad's Symbols and Crossing's Symmetric walls.
