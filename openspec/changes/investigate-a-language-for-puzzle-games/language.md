# A basic language for describing puzzle games

Task 3.3, written 2026-10-29 over `theory.md`. It is a notation for the
theory's parts, precise enough for a program to read, and nothing the app
runs. Experiment B (`collection.md`) writes the collection in it, and the
corpus test (`corpus.md`) writes a hundred outside puzzles in it.

## Sections

| Section | What it holds |
| --- | --- |
| What it is for | the three aims, and what the language must do for each |
| The shape of a description | one block per part, and the variation blocks |
| Expressions | the logic every rule, clue and technique is written in |
| The library | the named predicates and spaces, which the core does not need to change to grow |
| Freedom | the five kinds, and how a planning game is written |
| Techniques and tiers | the deduction layer, which no prior language has for many games |
| Variations, and the word each gets | how the catalog's words are computed, not declared |
| Where each layer came from | the prior art taken, and what was not |
| The six sample games | Solo, Loopy, Range, Ascent, Palisade, Sokoban |
| What is ready for games not yet written | the claim of "future ready", and its limits |

## What it is for

The aims, from `proposal.md`, and what each asks of the notation:

1. **Maintainability** asks that a description be checkable against the game
   it describes: a checker built from the rules, compared with the game's
   verdict on dealt boards. So the rules must have an executable meaning on a
   finite board.
2. **Reasoning about the space of games** asks that two descriptions be
   comparable part by part, and that the catalog's words be computed from
   what a variation touches. So the parts must be separate blocks, and a
   variation must say what it changes in terms of them.
3. **Invention** asks that a new game be a new combination of parts and that
   its techniques be statable and checkable. So techniques must be written in
   the same logic as the rules.

## The shape of a description

A description is a list of blocks, one per part of `theory.md` § "The
parts", then its techniques and its variations. Every block but `game`,
`space`, `answer` and `freedom` may be absent.

```pzl
game <id> "<Name>"
family <answer-shape name>          # which family the game belongs to

size   <name> in <range>, ...       # numbers that scale an instance
space  <space expression>           # elements, their sorts and relations
answer <name> : <sort> -> <domain>  # what the answer assigns, one line per sort
given  <answer name> [coarsened by <map>]   # givens of the answer (not clues)
marks  <name> : <sort> -> <notation>        # what the player can write down
shape  <predicate>, ...             # the answer shape
clue   <kind> at <placement> value <set> means <predicate>
rule   <name>: <predicate>          # goal predicates
freedom <kind> ...                  # fill | act | permute | transition | query
deal   <name>: <description>        # distribution: what the generator chooses
technique <id> tier <tier> ...      # deduction or planning techniques
tier   <name> = { <technique ids> } # optional where the technique lines carry tiers

board shape <name> { ... }          # a variation: only space blocks inside
modifier    <name> { ... }          # only added rule or clue blocks
ruleset     <name> { ... }          # replaced rule, domain, parameter, commuting move set
setting     <name> { ... }          # only deal blocks
```

A **variation block** contains blocks of the same kinds, each prefixed by
`add`, `replace` or `remove`. The word it is filed under is computed from
what it contains (§ "Variations, and the word each gets"); the keyword at its
head is a claim that the computation checks.

## Expressions

Rules, clue meanings and techniques are written in one many-sorted
first-order logic over the finite structure an instance is, with counting.

- **Sorts**: the space's element sorts (`cell`, `edge`, `vertex`, `face`,
  `region`, `line`, `slot`) and finite value sets (`1..n`, `{shaded, clear}`,
  `bool`).
- **Terms**: an answer function applied to an element (`value(c)`), a
  relation's image (`adj(c)`, `edges(f)`, `cells(r)`), the clue's own place and
  value inside a `means` (`at`, `v`), integers and arithmetic.
- **Formulas**: `and`, `or`, `not`, `implies`, comparisons, `in`,
  `forall x in S: ...`, `exists x in S: ...`.
- **Aggregates**: `count x in S where P`, `sum x in S of t`, `S where P`,
  `distinct(t over S)` (every value different), `set(t over S)`.
- **Sequences**: a line is an ordered sort, so `first x in L where P`,
  `seen from <slot> until P` (a sightline) and `run`s are expressible.

A description has a **meaning** on every instance: the set of answers that
satisfy `shape`, every dealt clue's `means`, and every `rule`. That set is
finite and computable by enumeration on small boards, which is what a checker
and experiment C need.

## The library

The core is the logic above. Everything with a name is defined in it, once,
and a new game that needs a new name adds a definition rather than changing
the core. Each entry says what it is defined as.

**Spaces**

| Name | Elements and relations |
| --- | --- |
| `grid(w, h)` | `cell` (x, y), `edge` between orthogonal cells, `vertex` at corners, `face` = cell; `adj4`, `adj8`; `rows`, `cols` as lines; `border` slots around the outside, one per row or column end |
| `tiling(t, size)` | a planar graph from `src/engine/grid/` (`face`, `edge`, `vertex`, incidence), for Loopy's tilings and any other |
| `hexgrid(shape, size)` | hexagonal `cell`s with `adj6` |
| `torus(space)` | the same space with each line's ends joined |
| `blocks(rw, rh)` | regions of a `grid` cut into rw × rh rectangles |
| `dealt <sort> as <predicate>` | an element set or relation chosen by the generator (Jigsaw's blocks, Pegs' Random board) |
| `graph(n)` | an abstract graph dealt as the instance (Untangle) |

**Predicates and functions**

| Name | Definition |
| --- | --- |
| `latin(f, lines)` | `forall L in lines: distinct(f over L)` and every value used once per line |
| `connected(S, adj)` | for every two elements of `S` a chain of `adj` steps inside `S` joins them |
| `one_loop(E)` | the edges `E` form one cycle: each vertex has degree 0 or 2 and `E` is connected |
| `path(order, adj)` | consecutive elements of an `order : 1..N -> cell` are adjacent |
| `partition(R)` | every element is in exactly one part of `R`, each part connected |
| `regions_of(edges)` | the parts the drawn edges cut the board into |
| `acyclic(E)`, `spanning_tree(E)` | the usual |
| `no_adjacent(S, adj)` | no two elements of `S` are adjacent |
| `sightline(c, dir) until P` | the cells from `c` in direction `dir`, up to but not including the first where `P` holds |
| `degree(v, E)` | `count e in edges(v) where e in E` |

The table holds what the six samples and experiment B needed. Connectivity
and one loop are the two the prior art calls hard: here they are library
definitions in a logic with transitive closure (`chain`), which is enough to
state and to check, and is not how a solver should search.

## Freedom

The block names one of the five kinds of `theory.md` § "Freedom". Whether
moves commute is computed for `act` and `permute` from the moves' effects,
and is a property the language reports, not one a description asserts.

```pzl
freedom fill                                 # set any element's value; the answer is the position
freedom act turn(c: cell): orient(c) := orient(c) + 1 mod 4     # Net: commutes, per element
freedom act press(c: cell): for d in adj4(c) + {c}: lit(d) := not lit(d)   # Flip: commutes, GF(2)
freedom permute generators { shift(row r, +1), shift(col c, +1) }  # Sixteen: a group, not abelian
freedom transition rules { ... } [bound moves <= m]              # Sokoban, Flood
freedom query reveal(c: cell) shows <clue kind> at c             # Mines
```

**A transition system is written as rewrite rules**, PuzzleScript's form: a
pattern of adjacent elements along the move's direction, rewritten to
another, applied where it matches. **A finish** for a planning game is a
predicate over the position (`all crate on target`), and the position is the
answer the predicate reads. A path bound is a clause of the freedom.

## Techniques and tiers

A **deduction technique** is written as a premise and a conclusion over the
player's marks (`marks`), so a technique can be markable only if the marks
say what it reads and writes.

```pzl
technique hiddenSingle tier Normal
  for unit u in units, digit d, cell c in u
  premise forall c2 in u - {c}: d not in cand(c2)
  conclude value(c) = d
```

- **Premise** is a formula over marks and clues; **conclusion** is a set of
  mark facts (`value(c) = d`, `d not in cand(c)`, `line(e)`, `cross(e)`).
- **Sound** means: for every instance and every answer satisfying the rules,
  if the answer agrees with the marks the premise reads, it satisfies the
  conclusion. Experiment C checks this by enumeration on small boards.
- **Over relations**: a technique quantifies over `units`, `adj`, `edges(f)`,
  never coordinates, so it stays the same technique on another space.
- A **tier** is a set of technique ids; a technique line may carry its tier.
  A board is at a tier when the tier's techniques reach its answer from its
  givens and the tier below's do not.

A **planning technique** is a macro and its effect, and a game's method is
a staging policy over macros:

```pzl
technique tuck tier Easy
  macro turn(b1), turn(b2), turn(b1)^-1
  effect moves one tile into the stage; every finished tile returns
stage reading order
```

## Variations, and the word each gets

The word is computed from what the block contains:

| Contains only | Computed word |
| --- | --- |
| `space` changes | board shape |
| `add rule` or `add clue` (and `deal` that goes with them) | modifier |
| `replace rule`, a changed parameter, `replace answer` domain, `replace freedom` of a commuting kind with another commuting move set | ruleset |
| `deal` changes | generator setting |
| `size` changes | size |
| `replace clue`, `remove clue`, or `replace freedom` to another kind or other generators | not a variation: a separate game, which the language reports |

A modifier must also pass the deal test (it combines with the game's other
modifiers); the language checks it by forming each combination and asking
whether the rules are still satisfiable on a small board. **Monotonicity is
then a theorem the language can use**: a modifier's techniques are the
plain game's plus its own, with no check needed.

## Where each layer came from

| Layer | Taken from | What was not taken, and why |
| --- | --- | --- |
| Space | grilops's lattices and Ludii's equipment for the vocabulary; `src/engine/grid/` for the planar-graph model | Ludii's container types tied to rendering; a board is mathematics here |
| Answer and domain | Essence's `find` and Maeda and Inoue's domains | Essence's type system beyond finite sets, not needed |
| Shape, rules, clue meanings | constraint languages (Essence, ASP, cspuz): a logic with aggregates and named global constraints | a solver's encoding of connectivity (ASP's reachability, cspuz's graph constraints): the language states, it does not search |
| Clue kinds as parameterized predicates | pzprjs's per-clue checks, Maeda and Inoue's "hidden values"; making a clue kind a first-class predicate family is ours | pzprjs's checks are code, not statements |
| Freedom | PuzzleScript's rewrite rules for transition systems; Ludii's deduction and planning split | Ludii files Flip as planning; the commuting test (ours) puts it with deduction |
| Techniques | Butler, Torlak and Popović (FDG 2017): Nonogram techniques as condition-action programs a solver checks sound; Demystify's explanation by a minimal unsatisfiable subset as the soundness and minimality reference | Butler's single-line, single-genre scope; Demystify's search for steps instead of named techniques |
| Tiers | HoDoKu's levels as sets of techniques, and this repository's ladders | a summed score overriding the hardest technique (HoDoKu): a tier here means exactly its rung |
| Variations | pzprjs's variant flag and Ludii's options, as precedents for a modifier | both declare a variation's kind; here it is computed |

`design.md` § "Prior art" holds the full readings (step 1).

## The six sample games

The sample `design.md` § "Decisions" fixed in advance, chosen to break a
vocabulary. What did not fit is listed after each.

### Solo (a Latin game)

```pzl
game solo "Solo"
family latin
size rw in 2..5, rh in 2..5
space grid(n, n) where n = rw * rh, regions box = blocks(rw, rh)
answer value : cell -> 1..n
given value
marks cand : cell -> set of 1..n
shape latin(value, rows + cols + box)
freedom fill
deal symmetry: of the givens; tier

board shape Jigsaw { replace space regions box = dealt partition(cells, size n) }
modifier X { add rule diagonals: forall d in {main, anti}: distinct(value over d) }
modifier Killer {
  add clue cage at dealt region c value 1..45
    means sum c2 in c of value(c2) = v and distinct(value over c)
  deal givens: fewer
}

technique regionsFull tier Easy               # one empty cell left in a unit
  for unit u, cell c in u
  premise forall c2 in u - {c}: value(c2) known
  conclude value(c) = the digit missing from u
technique hiddenSingle tier Normal
  for unit u, digit d, cell c in u
  premise forall c2 in u - {c}: d not in cand(c2)
  conclude value(c) = d
technique intersect tier Tricky               # pointing and claiming
  for units u1, u2, digit d
  premise forall c in u1 - u2: d not in cand(c)
  conclude forall c in u2 - u1: d not in cand(c)
technique set tier Hard                       # naked and hidden sets
  for unit u, cells S in u, digits D where |S| = |D|
  premise forall c in S: cand(c) subset D
  conclude forall c in u - S, d in D: d not in cand(c)
```

Fits. `units` is `rows + cols + box` (+ diagonals under X), so the
techniques run unchanged under X and Jigsaw, as the taxonomy measured
(11 of 11). Killer's cage rungs are its own techniques, added. The `wing`
and the `forcing` rungs fit the same form; `forcing` is a Search
(`docs/solver-and-generator.md` § "Check, Tactic, Search") and is written
with `premise suppose ...`, which the language marks unmarkable.

### Loopy (a loop on any tiling)

```pzl
game loopy "Loopy"
family loop
size w, h; tiling t in {square, triangular, honeycomb, snub-square, ... 18}
space tiling(t, w, h)
answer line : edge -> bool
marks mark : edge -> {line, cross, unknown}
shape one_loop(edges where line)
clue count at face value 0..|edges(at)|
  means count e in edges(at) where line(e) = v
freedom fill
deal clues: which faces show their count; tier

technique clueFull tier Easy
  for face f with clue v
  premise count e in edges(f) where mark(e) = line = v
  conclude forall e in edges(f) where mark(e) = unknown: mark(e) = cross
technique dotFull tier Easy
  for vertex x
  premise count e in edges(x) where mark(e) = line = 2
  conclude forall e in edges(x) where mark(e) = unknown: mark(e) = cross
technique earlyLoop tier Easy
  for edge e
  premise mark(e) = unknown and closes_cycle(e, edges where mark = line)
          and exists e2: mark(e2) = line and e2 not on that cycle
  conclude mark(e) = cross
```

Fits, with one library function added: `closes_cycle`, defined by `chain`.
The 18 tilings are one `space` parameter, so a tiling is a board shape by
computation. Loopy's corner and pair rungs (23 in experiment A) are local
patterns at a vertex or a face, and state the same way. **Did not fit
cleanly**: `parity` (a count of crossings of a closed curve) needed a
definition of "inside", which the library does not have; added as
`inside(f, loop)` by a crossing count along a line of faces.

### Range (a connectivity rule)

```pzl
game range "Range"
family shading
size w, h
space grid(w, h)
answer shade : cell -> {shaded, clear}
shape no_adjacent(cells where shaded, adj4),
      connected(cells where clear, adj4)
clue sees at cell value 1..w+h-1
  means shade(at) = clear and
        1 + sum dir in {n, e, s, w} of |sightline(at, dir) until shaded| = v
freedom fill
```

Fits. The connectivity rule is one library call. The techniques `reach`,
`overrun`, `satisfied` and `adjacency` are sums over sightlines and state
directly; the ones that use connectivity (a shaded cell would cut the clear
cells apart) need `connected` in a premise, which is legal and is checked by
enumeration only on small boards.

### Ascent (a numbered path)

```pzl
game ascent "Ascent"
family path
size w, h; N = number of cells in the shape
space grid(w, h), shape in {rectangle, ...}
answer at : 1..N -> cell          # where each number sits; a bijection
given at                           # some numbers are placed
shape bijection(at), path(at, adj)
freedom fill

ruleset Orthogonal { replace space adj = adj4 }
ruleset Hex        { replace space hexgrid(shape, size), adj = adj6 }
ruleset Classic    { replace space adj = adj8 }
ruleset Edges {                       # computed: modifier over Classic
  add clue arrow at slot value 1..N
    means at(v) on the line the slot points along
  deal givens: fewer in the grid
}
```

Fits, and the computation disagrees with the catalog twice, as
`taxonomy.md` did: Orthogonal, Hex and Classic contain only space changes,
so they are board shapes, and Edges adds a clue kind, so it is a modifier.
The language reports both. **Did not fit cleanly**: the answer is a function
from numbers to cells, not from cells to values. The language allows an
answer over any finite sort, so it states it; the player's marks are on
cells, so the techniques read the inverse, which needed `at^-1`.

### Palisade (a region puzzle)

```pzl
game palisade "Palisade"
family partition
size w, h, k
space grid(w, h)
answer wall : edge -> bool         # the drawn edges; the border is walled
marks mark : edge -> {wall, open, unknown}
shape forall r in regions_of(edges where wall): |r| = k
clue walls at cell value 0..4
  means count e in edges(at) where wall(e) = v
freedom fill
```

Fits. A region is defined from the answer (`regions_of`), not given, which
is the case Maeda and Inoue's "composed structures" exist for. Techniques
such as `notTooBig` read a region's size so far, a term over the connected
component of open edges, which `regions_of` on the marks gives.

### Sokoban (a planning game, the expected failure)

```pzl
game sokoban "Sokoban"
family position
size w, h
space grid(w, h)
answer at : cell -> {empty, wall, crate, player} with target : cell -> bool
given at, target                   # the dealt level is the whole start position
freedom transition rules {
  dir in {up, down, left, right}:
    [ player | empty ]          -> [ empty | player ]
    [ player | crate | empty ]  -> [ empty | player | crate ]
}
finish forall c: at(c) = crate implies target(c)
```

Fits as a description, as PuzzleScript says it would: the rewrite rules are
the freedom, the finish is a predicate. It **fails as the language's
deduction layer predicted**: it has no deduction techniques, and its hint
is a search with a stable subgoal. A planning technique (a macro such as "push
a crate along a corridor") is statable, but none is in our hint today, so the
technique layer is empty.

### What the sample says

All six are stated. Two library additions were needed (`closes_cycle` and
`inside` for Loopy) and one notational one (an answer over numbers, for
Ascent). The computed words disagree with the catalog where `taxonomy.md`
said they would (Ascent's rulesets are board shapes and a modifier). The
expected failure failed in the way expected: Sokoban's rules state, and it
has no techniques to state.

## What is ready for games not yet written

"Future ready" (the owner's words, 2026-10-29) is claimed for these, and only
these:

- **A new game is a new combination of parts**, each written with the core
  logic and the library. A part the library lacks is a definition in the
  logic, added once. The corpus test (`corpus.md`) is the evidence: how many
  outside puzzles needed only library additions, and how many needed the core
  to change.
- **The catalog's words are computed**, so a new variation is filed by what it
  touches, and a new game's place in its family follows from its answer shape
  and freedom.
- **Techniques are statements, checked against the rules**
  (`experiment-c.md`), so a technique written for a new game is sound before
  any hint narrates it.
- **Nothing in it is about rendering or input**, which every withdrawal found
  per-game (`design.md` § "What the earlier withdrawals bind").

What it is not ready for: an objective rather than a finish (Same Game's
score), a continuous domain beyond stating it (Untangle), and techniques
over a planning game whose hint is a search.
