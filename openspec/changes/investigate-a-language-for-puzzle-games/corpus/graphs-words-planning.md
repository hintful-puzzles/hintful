# Corpus test, families G, H, I, J, K (puzzles 69-106)

Written 2026-10-29 against the second version of `language.md`. Nothing in the
language was changed. Verdicts follow `corpus.md` § "The test, fixed before the
corpus was collected". All 38 puzzles of `corpus-list.md` families G
(3), H (3), I (6), J (22) and K (4) are written below. None was dropped.

## Rulings applied throughout (read these before the verdicts)

These are the readings of the test I had to make. Each one decides at least
one verdict, so the coordinator can overturn any of them in one place.

1. **Core** is what `language.md` lists: FO plus counting, aggregates, folds,
   `lfp` over tuples, bounded fillings and subsets, clue terms and list
   values. The block kinds are those of § "The shape of a description". The
   freedom forms are fill, act, permute, and transition with guarded-assignment
   moves; `then` sequencing inside a move, as the collection's Same Game uses
   it; `bound moves <= m` with `lose`; query with reveal sets, `budget`,
   `lose when`, and `deal after first query`. Then `finish` and
   `objective maximize`. `minimize t` is written `maximize -t`. A position
   variable `dead` or `lost` that disables every move is core: it is Inertia's
   form.
2. **The freedom kind is computed** from the moves: a move is invertible when
   some move undoes it, and two moves either commute or do not. "Transition"
   means some move cannot be undone. A planning freedom whose moves are all
   invertible computes as a **non-commuting action**, a group or groupoid,
   whatever block keyword it is written under. This is § "Freedom" after
   experiment B.
3. **A data table counts as a library addition by table**: a dictionary of
   words, or a solid's roll table. This is how experiment B counted Cube's
   `solid(type)`. If the coordinator instead rules a table to be prose, then
   Codeword, Word Ladder and Wordle fall to "not described". Every other
   addition below is a definition in the logic and needs no table.
4. **A variant gets its word from the strongest thing its block touches.**
   Some variants are separate games whose own description would need more than
   the core. When the part that makes the variant a separate game (another
   freedom kind, another product) can be written, the word "separate game" is
   computed and criterion 2 holds for the puzzle under test. A variant counts
   against the puzzle only when no word can be computed, because the change
   itself cannot be written. That happens once, to Atomix's time limit.
5. **A variant word that a player would dispute but `theory.md` gives** counts
   as placed, so criterion 2 holds. Each such case is flagged under "Variant
   words that look wrong". Criterion 3 and the cut-failure count use the pairs
   only.
6. **A non-finite space** is allowed by § "Expressions": it is "stated, and
   has no such meaning". Morpion is therefore described, with that flag, as
   Untangle is.

---

## G. Graph and tour puzzles

### 69. Icosian game

```pzl
game icosian "Icosian game"
family loop
space graph(20) dealt as the skeleton of the dodecahedron    # 20 vertices, 30 edges
answer line : edge -> bool
given line                                   # Hamilton's version: the 4 edges joining the first five vertices
marks mark : edge -> {line, cross, unknown}
shape one_loop(edges where line),
      forall v in vertices: degree(v, edges where line) = 2  # every vertex on the cycle
freedom fill
deal start: none (pure) | a path of five vertices (Hamilton's)

ruleset openPath {
  replace shape acyclic(edges where line), connected(vertices, adj over edges where line),
                forall v: 1 <= degree(v, edges where line) <= 2
}
board shape polyhedron { replace space graph(n) dealt as the skeleton of P }
setting hamilton { replace deal start: five vertices given }
```

**Kind.** Fill, so it is a constraint problem. **Verdict: described well.**
It uses only library entries already present (`graph`, `one_loop`, `degree`,
`acyclic`, `connected`).

**Variants.**
- Open path: the shape is replaced, which computes **ruleset**.
- Other polyhedra: only the space changes, which computes **board shape**.
- Hamilton's five given vertices: only the givens change, which computes
  **generator setting**.

**Cut.** See 70 for the pair with Knight's Tour, flagged there, and 71 for the
pair with One-stroke.

**Technique.** None is named in the source. The obvious one states directly:
`premise degree(v, unknown or line) = 2 conclude both are line`.

### 70. Knight's Tour

```pzl
game knightstour "Knight's Tour"
family position                 # computed from a transition freedom (as Ludii plays it)
size n
space grid(n, n)
answer k : cell, visited : cell -> bool
given k, visited = {k}           # the start square
freedom transition moves {
  jump(c in knight(k)): requires not visited(c)
    k := c; visited(c) := true
}
finish forall c: visited(c)

ruleset closed { replace finish forall c: visited(c) and start in knight(k) }
board shape boards { replace space grid(w, h) | other outlines }
ruleset magic {                                   # keep the order: num(c) := moves made so far
  replace answer ... , num : cell -> 1..n*n ; replace freedom jump: ... num(c) := num(k) + 1
  replace finish ... and forall L in rows + cols: sum c in L of num(c) = n(n*n+1)/2
}
```

`knight(c)` (L) := `{ step(step(step(c, d1), d1), d2) : d1 in dirs4, d2 in dirs4, d2 ⟂ d1 }`,
the cells that are on the board.

**Kind.** Transition: a jump is never undone, because visited squares stay
blocked. **Verdict: described with an extension**, `knight`.

**Variants.**
- Closed tour: replaces the finish, which computes **ruleset**. The theory
  would call an added goal a modifier, but the table has no "add finish" row.
  This is the gap Twiddle already showed.
- Other boards: **board shape**.
- Magic tour: it replaces the answer and the finish, which computes
  **ruleset**.

**Cut, flagged as looking wrong.**
- Against Icosian: Knight's Tour is a transition (family position) and
  Icosian is a fill (family loop), so the language computes **two games in two
  families**. A solver of both sees one problem: a Hamiltonian cycle or path,
  on two graphs. The closed tour is a Hamiltonian cycle on the knight graph.
  Write Knight's Tour as a fill instead (`order : 1..N -> cell`,
  `bijection`, `path(order, knight)`), as Ascent is written, and it computes
  as **one game** with Icosian's open-path ruleset, as a board shape. The word
  turns on whether the source presents the puzzle as moves or as a drawing.
  The theory reads only the freedom, so it cannot say which part makes the
  difference.
- Against Ascent and Signpost: written as a fill, Knight's Tour is Ascent with
  `adj = knight` and no givens, a board shape plus a generator setting. As a
  transition it is a separate game. The same factoring dependence applies.

**Technique.** Warnsdorff's rule (Wikipedia) is a staging policy, not a
technique: `stage next jump to the c in knight(k) with fewest unvisited onward
jumps`. It is a heuristic. No sound deduction technique is named.

### 71. One-stroke drawing

```pzl
game onestroke "One-stroke drawing"
family path
size m = number of edges
space graph(n) dealt as a plane multigraph          # ends(e) : edge -> pair of vertices
answer walk : 1..m -> edge, at : 0..m -> vertex     # the stroke and where it stands after each line
shape bijection(walk),                               # every line exactly once
      forall i in 1..m: ends(walk(i)) = {at(i-1), at(i)}
freedom fill

modifier closed { add rule at(m) = at(0) }
setting fixedStart { add deal givens: at(0) }        # a given of the answer
```

**Kind.** Fill. **Verdict: described well** (core only).

**Variants.**
- Closed stroke: adds a rule, which computes **modifier**.
- Fixed start: adds a given, which computes **generator setting**.
- Seven Bridges of Königsberg is not a variation. It is one dealt instance
  whose meaning is empty, which follows from the parity of its degrees.

**Cut.**
- Against Icosian, two games. The answer sorts differ (a sequence of edges
  against a set of edges), so the families computed differ: path against loop.
  A solver agrees: Euler against Hamilton, techniques in P against search.
  Only Icosian's factoring could move this. Written as a sequence too, its
  shape would be replaced in place and compute as a ruleset, which would be
  wrong. The factoring dependence noted at 70 is the same one.

**Technique.**
- Euler's parity: `technique oddStart premise count v where degree(v) odd = 2
  conclude at(0) in {v : degree(v) odd}`.
- Fleury's "cross a bridge only when forced": `premise not connected(remaining
  edges - e) conclude walk(next) ≠ e unless e is the only line at at(i)`.
  This reads `connected`.

---

## H. Hidden information and query

### 72. Hexcells

```pzl
game hexcells "Hexcells"
family hidden shading
size shape, n
space hexgrid(shape, size), hexlines                 # three axes of lines; slots at their ends
answer blue : cell -> bool                           # hidden
shape count c where blue(c) = n
clue total at board value 0..|cells|                 # the remaining counter
  means count c where blue(c) = v
clue ring at cell value (0..6, {plain, together, apart, none})   # `?` = none
  means not blue(at) and count c in adj6(at) where blue(c) = v.n
        and (v.flag = together implies ring_runs(at) <= 1)
        and (v.flag = apart implies ring_runs(at) >= 2)
clue near at cell value 0..18
  means blue(at) and count c in within2(at) where blue(c) = v
clue line at slot value (0..|L|, {plain, together, apart})
  means count c in L(at) where blue(c) = v.n
        and (v.flag = together implies |runs(L(at), blue)| <= 1)
        and (v.flag = apart implies |runs(L(at), blue)| >= 2)
marks none                                           # a commit is the only mark
freedom query commit(c: cell, k: {blue, black}) shows blue at c, ring | near at c
finish forall c: revealed(c)
objective maximize -(count of commits whose k ≠ blue(c))   # mistakes
deal clues: designed; tier (solvable without guessing); some cells revealed at start

setting infinite { replace deal: random levels by seed }
```

Library additions, each defined in the core:
- `hexlines` := for each of the three axis directions `d` of `hexgrid`, the
  maximal sequences `c, step(c, d), step(step(c, d), d), ...` of present
  cells.
- `ring(c)` := `[step(c, d0), ..., step(c, d5)]`, the six directions in
  cyclic order, where an absent cell counts as not blue.
- `ring_runs(c)` := `count i in 0..5 where blue(ring(c)[i]) and not
  blue(ring(c)[i-1 mod 6])`.
- `within2(c)` := `adj6(c) ∪ {y : exists x in adj6(c): y in adj6(x)} - {c}`.

**Kind.** Query. The commits commute in what they reveal, though the count of
mistakes depends on the commits.

**Verdict: described with an extension** (`hexlines`, `ring`, `ring_runs`,
`within2`).

**Variants.** Infinite: **generator setting**.

**Cut.**
- Against Mines: several things change at once. The board is hexagonal (board
  shape), clue kinds are added (contiguity, near, line and total, each a
  modifier), and the query and the lose condition are replaced by a commit
  with a mistake objective (a replaced move set of the same query kind, so
  ruleset). The strongest word computes Hexcells as **one game with Mines, a
  ruleset of it**. Mines' count techniques stay sound, by monotonicity.
- A solver would likely call Hexcells "a Minesweeper-like game", which is
  borderline. I record it as plausible, not as wrong.
- Against Mosaic: Mosaic is a fill and Hexcells a query, so the freedom kinds
  differ and they are **two games**. A solver agrees.

**Technique.** The level design promises "no guessing", which is a tier.
- `full` (as Mines): `premise count x in adj6(c) where known_blue(x) = v.n
  conclude other unknown neighbors black`.
- `together`: `premise v.flag = together and blue(a) and blue(b) known for
  ring positions a, b conclude the ring cells between them on the shorter arc
  are blue`. It reads `ring`.

### 73. Wumpus World

The player's walk is written as its quotient. Every room the player has
visited is safe, and walking through visited rooms has no bound and no cost
in these rules. The rooms the player can enter next are therefore exactly the
unvisited rooms beside a visited one. The written freedom is a query over
those rooms, and an arrow is fired from any visited room. Without this
quotient the literal freedom is a transition over a hidden board, and the core
has no such thing: a transition is fully observed, and only a query reveals.
**This is the one verdict in this file that rests on a restatement of the
freedom**, so it is flagged for the coordinator.

```pzl
game wumpus "Wumpus World"
family hidden shading
size w, h, pits, arrows = 1
space grid(w, h), start : cell
answer pit : cell -> bool, wumpus : cell, gold : cell      # hidden
shape not pit(start), wumpus ≠ start, count c where pit(c) = pits
clue percept at cell value (breeze, stench, glitter : bool)
  means v.breeze = exists x in adj4(at): pit(x)
        and v.stench = (wumpus in adj4(at) + {at})
        and v.glitter = (gold = at)
clue scream at cell × dirs4 value bool
  means v = wumpus in ray(at.cell, at.dir)                  # the arrow flies to the wall or the wumpus
freedom query
  enter(c: cell) when c in frontier shows percept at c
  shoot(c: cell, d: dir) when revealed(percept at c)
        and count (x, e) where revealed(scream at (x, e)) < arrows
        shows scream at (c, d)
  lose when exists c: revealed(percept at c) and
            (pit(c) or (wumpus = c and not killed))
finish revealed(percept at gold) and killed
deal layout: random                                          # pits, wumpus, gold
```

- `frontier` (L) := `{ c : not revealed(percept at c) and exists x in
  adj4(c): x = start or revealed(percept at x) }`.
- `killed` (L) := `exists (x, e): revealed(scream at (x, e)) and wumpus in
  ray(x, e)`.

**Kind.** Query. The queries do not commute when it comes to losing: entering
the wumpus's room before shooting it differs from entering after.

**Verdict: described with an extension** (`frontier`, `killed`), resting on
the quotient above. Strictly, without the quotient: **not described**, since
the core has no partially observed transition.

**Variants.**
- One arrow against unlimited: `arrows` is a parameter the freedom reads, so
  this computes **modifier**.
- Return to the start to exit: replaces the finish, which computes
  **ruleset**. Under the quotient this conjunct is always reachable, so the
  variant changes nothing. That is a sign the quotient drops the start's
  role, which matters only under Russell and Norvig's step costs, and those
  are not in the stated rules.
- Random layouts: **generator setting**.

**Cut.**
- Against Mines: both are query games, but the clue kinds are replaced (a
  breeze is not a count) and there is a second query kind, so they are **two
  games, same family**. A solver agrees.
- Against Black Box: also **two games**.

**Technique.** None named in the source. A `premise` form states directly:
`premise revealed(percept at x) with not breeze conclude forall y in adj4(x):
not pit(y)`.

### 74. Counterfeit coin weighing (twelve coins)

The source says the answer is a decision tree. Its shape is fixed by the size:
a ternary tree of depth w. So it is written as the answer, which makes this a
fill whose product is a strategy, not a query game.

```pzl
game coins "Counterfeit coin weighing"
family strategy                                     # computed: the answer is a weighing per tree node
size n = 12, w = 3
space coins 1..n, hidden = coins × {heavy, light},
      tree(3, w): node, root, child : node × {left, right, balance} -> node,
      internal = nodes of depth < w, leaf = nodes of depth w
answer inL, inR : internal × coins -> bool          # the weighing at each node
shape forall t in internal: forall c: not (inL(t, c) and inR(t, c)),
      forall t: count c where inL(t, c) = count c where inR(t, c)
rule decides: forall h, h2 in hidden: h ≠ h2 implies leafof(h) ≠ leafof(h2)
freedom fill
```

- `tilt(h, t)` := `balance` if `h.coin` is in neither pan; otherwise `left`
  when the coin is on the left and heavy, or on the right and light, and
  `right` otherwise.
- `reach` := `lfp R(h, t) = (t = root) or exists t0: R(h, t0) and t =
  child(t0, tilt(h, t0))`, a fixed point over (hidden, node) pairs.
- `leafof(h)` := the `t in leaf` with `reach(h, t)`.
- `tree(b, d)` (L) := the complete b-ary tree of depth d, as a space.

**Kind.** Fill. **Verdict: described with an extension** (`tree`, with
`reach` and `tilt` written inline above). This is also the precise reason the
game is not a query game. As a query (`weigh(L, R) shows tilt`, budget 3) it
states, but a lucky player wins. "Whatever the coin" is the universal over
`hidden` in `decides`, and only a fill of the tree can hold it.

**Variants.**
- 13 coins, identifying the coin and not its direction: `decides` is
  replaced, reading only `.coin`, and n changes, which computes **ruleset**.
- 3^k coins with known direction: the domain of `hidden` changes and the size
  changes, which computes **ruleset**.
- Non-adaptive weighings: adds the rule `forall t, t2 of equal depth: inL(t)
  = inL(t2), inR(t) = inR(t2)`, which computes **modifier**.
- Extra known-genuine coin: `coins` grows while `hidden` does not, a space
  change, which computes **board shape**.

**Cut.**
- Against Guess: Guess is a query and this is a fill of a strategy, so the
  freedom kind and the product differ. **Two games, two families.** A solver
  agrees.

**Technique.** The classical 4-4-4 first weighing is a certificate, not a
technique. A sound rung: `premise |{h : reach(h, t)}| > 3^(w - depth(t))
conclude no assignment under t decides`. This is the information bound, which
reads only counts.

---

## I. Logic grid, verbal logic and word

### 75. Logic grid puzzle

```pzl
game logicgrid "Logic grid"
family matching
size k categories, n values each
space categories K1..Kk, value = K1 + ... + Kk, cat : value -> 1..k,
      num : value -> Z (ordered categories only)
answer m : K1 × 2..k -> value                       # m(p, j) in Kj
shape forall j: bijection(p -> m(p, j))
marks pair : value × value -> {yes, no, unknown} means same(x, y)
clue is      at value × value          means same(at.1, at.2)
clue isnt    at value × value          means not same(at.1, at.2)
clue either  at value × value × value  means same(at.1, at.2) or same(at.1, at.3)
clue oneEach at value^4                means (same(a, x) and same(b, y)) or (same(a, y) and same(b, x))
clue less    at value × value × cat    means num(m(ent(at.1), at.3)) < num(m(ent(at.2), at.3))
clue differ  at value × value × cat value Z
             means num(m(ent(at.2), at.3)) - num(m(ent(at.1), at.3)) = v
clue nextTo  at value × value × cat    means |num(m(ent(at.1), at.3)) - num(m(ent(at.2), at.3))| = 1
clue rightOf at value × value × cat    means num(m(ent(at.1), at.3)) = num(m(ent(at.2), at.3)) + 1
freedom fill
deal clues: a set of sentences of the kinds above; tier

setting zebra   { replace deal clues: some values appear in no clue }    # "who owns the zebra?"
ruleset unequal { replace space |Kj| varies; replace shape forall j: injective(p -> m(p, j)) }
```

- `ent(x)` (L) := `x` if `cat(x) = 1`, else the `p in K1` with `m(p, cat(x))
  = x`.
- `same(x, y)` (L) := `ent(x) = ent(y)`.
- `m(p, 1)` := `p`.

**Kind.** Fill. **Verdict: described with an extension** (`ent`, `same`).
Each English clue form the source lists is one clue kind. A new clue form in
another puzzle is a new clue kind, which is the genre's open vocabulary and is
stated the same way.

**Variants.**
- Zebra form: **generator setting**.
- Unequal category sizes: replaces the shape, which computes **ruleset**.

**Cut.**
- Against Solo and Towers: the space (no grid), the answer sort (bijections
  between categories, against values in cells) and the clue kinds all differ,
  so **two games, two families** (matching against numbers). A solver agrees.

**Technique.** The source (Demystify's model) explains steps by minimal unsat
subsets. Grid transfer: `premise pair(x, y) = yes and pair(y, z) = no conclude
pair(x, z) = no`. Elimination: `premise forall y2 in Kj - {y}: pair(x, y2) =
no conclude pair(x, y) = yes`.

### 76. Knights and Knaves

```pzl
game knaves "Knights and Knaves"
family verbal logic
size people, statement size
space people I, statements: dealt node with
      op : node -> {knight(x), knave(x), not, and, or, iff, exactly(k, S), atleast(k, S), says(x)},
      kid : node × 1..2 -> node
answer type : I -> {knight, knave}
clue says at I value node
  means (type(at) = knight implies T(v)) and (type(at) = knave implies F(v))
freedom fill
```

`T`, `F` (L) are a simultaneous least fixed point over (bool, node), written
positively:
- `knight(x)`: `T(n) <- type(x) = knight`, `F(n) <- type(x) = knave`.
- `not`: `T(n) <- F(kid1)`, `F(n) <- T(kid1)`.
- `and`: `T(n) <- T(kid1) and T(kid2)`, `F(n) <- F(kid1) or F(kid2)`. `or` and
  `iff` are dual.
- `exactly(k, S)`: `T(n) <- count x in S where type(x) = knight = k`,
  `F(n) <- ... ≠ k`. `atleast` is the same with `>=`.
- `says(x)`: `T(n) <- (type(x) = knight and T(kid1)) or (type(x) = knave and
  F(kid1))`, and `F(n)` is the dual.

A self-referring node ("I am lying") gets neither `T` nor `F`, so its speaker
has no type, and that is the right meaning.

**Kind.** Fill. **Verdict: described with an extension**: the dealt statement
trees, and `T`/`F` by `lfp`. This is not a renamed rule; it is an evaluator
for a statement grammar.

**Variants.**
- Normals: replaces the answer domain with `{knight, knave, normal}`, which
  computes **ruleset**. That holds only because the clue meaning is written as
  two implications. Written as a disjunction, the clue would need replacing,
  which computes separate game. This is a factoring dependence.
- Spies: replaces the domain and adds "exactly one spy", which computes
  **ruleset**.
- "Ask one yes/no question" (two guards): the product becomes a question (a
  statement tree), so the family differs and it computes **separate game**.
  The table's row "`replace answer` domain → ruleset" would say ruleset. The
  family computation and the table disagree when the answer's sort changes,
  not only its domain.
- Boolos: the product is an adaptive strategy, which computes **separate
  game**.

**Cut.**
- Against Usoone and Yajikazu: both share the meaning shape "a clue binds only
  if its cell or speaker is truthful". The answer sorts differ (people against
  cells) and so do the clue kinds, so **two games, two families**. A solver
  agrees.

**Technique.** Smullyan's method is case analysis: `technique selfDenial look
type(x) = t: breaks says(x, knave(x))`. Nobody can say "I am a knave", and
this is a Check.

### 77. Codeword

```pzl
game codeword "Codeword"
family words
space grid(w, h), white : cell -> bool (given), entries, dict
given num : white cell -> 1..26
answer letter : 1..26 -> A..Z
given letter                                    # two or three
shape bijection(letter)
rule words: forall e in entries: word(e) in dict
freedom fill

ruleset partial { replace shape injective(letter) }
```

- `entries` (L) := `{ r in runs(L, white) : L in rows + cols, |r| >= 2 }`.
- `word(e)` (L) := the list `[letter(num(c)) for c in e]`.
- `dict` (L, by table) := a fixed finite set of letter lists.

**Kind.** Fill. **Verdict: described with an extension** (`entries`, `word`,
`dict` by table).

**Variants.** Not every letter used: **ruleset**.

**Cut.**
- Against Fill-in: Codeword has a number clue at each cell and a dictionary
  rule; Fill-in has a word list at the board and a bijection rule. The clue is
  replaced, so **two games, same family** (letters in cells). A solver agrees.
- Against Cryptarithm: different rule and domain, so **two games**. A solver
  agrees.

**Technique.** None named in the source.

### 78. Fill-in

```pzl
game fillin "Fill-in"
family words
space grid(w, h), white : cell -> bool, slots           # slots = entries of 77
answer letter : white cell -> A..Z
clue list at board value list of (list of A..Z)
  means exists fill σ of slots from 1..|v|: bijection(σ) and forall s: word(s) = v[σ(s)]
freedom fill

ruleset numbers { replace answer letter : white cell -> 0..9 }
setting seed    { add deal givens: one word placed }
```

`word(s)` here is `[letter(c) for c in s]`.

**Kind.** Fill. **Verdict: described with an extension** (`entries`/`slots`
and `word`, both shared with 77).

**Variants.**
- Number fill-in: **ruleset**.
- One word given: **generator setting**.

**Cut.**
- Against Codeword: as at 77.
- Against Dominosa: different space, answer and product. They share only the
  "each listed item placed once" form, `exists fill σ ... bijection`. **Two
  games.** A solver agrees.

**Technique.** None named in the source. Length-unique placement states as a
premise over `|s|`.

### 79. Word Ladder

```pzl
game wordladder "Word Ladder"
family position
size n letters
space positions 1..n, dict
answer w : 1..n -> A..Z
given w = start; target : 1..n -> A..Z
freedom transition moves {
  change(i, x): requires x ≠ w(i) and exists u in dict: u[i] = x and forall j ≠ i: u[j] = w(j)
    w(i) := x
}
finish w = target
objective maximize -(length of path)                # Carroll's "shortest"; or `bound moves <= m`
```

**Kind.** Computed as a **non-commuting action (groupoid)**. Each change is
undone by changing the letter back, and two changes do not commute because the
middle word must be in the dictionary. **Verdict: described with an
extension** (`dict`).

**Variants.** Insertion and deletion, or anagramming per step: these are other
generators of a non-commuting kind, which computes **separate game**. A player
would call them variants, but the theory gives "separate game".

**Cut.**
- Against Tower of Hanoi: different positions and generators, so **two games,
  same family**. A solver agrees.

**Technique.** None named in the source.

### 80. Wordle

```pzl
game wordle "Wordle"
family hidden code
space positions 1..5, dict, answers subset dict
answer a : 1..5 -> A..Z, a in answers                    # hidden
clue feedback at query value 1..5 -> {green, yellow, gray}
  means forall i: (v[i] = green iff q[i] = a[i])
    and (v[i] = yellow iff q[i] ≠ a[i] and
           count j < i where q[j] = q[i] and q[j] ≠ a[j] and v[j] = yellow
         < count j where a[j] = q[i] and q[j] ≠ a[j])
freedom query guess(q : 1..5 -> A..Z) when q in dict shows feedback at q
  budget 6 queries; lose when the budget is spent and no query equals a
finish some query q = a
deal a: uniform over answers

ruleset hard { replace freedom guess when q in dict and q agrees with every revealed green and yellow }
-- Absurdle: separate game, written below
-- Dordle/Quordle: replace answer a : 1..k -> word; clue feedback at query × 1..k; replace finish
```

Absurdle as its own description: the adversary is deterministic, so it is a
fully observed transition.

```pzl
answer cand : answers -> bool              # given: all true
freedom transition moves { guess(q) when q in dict:
  let f* = the pattern f maximizing count a where cand(a) and fb(q, a) = f (ties by a fixed order)
  cand(a) := cand(a) and fb(q, a) = f* }
finish cand = {q} for the last q
```

**Kind.** Query. **Verdict: described with an extension** (`dict`, `answers`
by table). The feedback's "each occurrence counts once, greens first, then
left to right" is FO with counting, as written.

**Variants.**
- Hard mode: another move set of the same kind, which computes **ruleset**.
- Absurdle: the freedom kind changes from query to transition, which computes
  **separate game**. It keeps every feedback deduction, so a player could
  dispute the word.
- Dordle/Quordle: the answer, the clue placement (now `query × 1..k`) and the
  finish change. The table has no row for a change of clue placement whose
  meaning is unchanged. Taking replace answer and replace finish, it computes
  **ruleset**.

**Cut.**
- Against Guess: positional per-letter feedback replaces Guess's (b, w)
  counts, so the clue is replaced and it computes **two games, same family**.
  A solver agrees.

**Technique.** `premise v[i] = gray and count j where q[j] = q[i] and v[j] ≠
gray = 0 conclude forall k: a[k] ≠ q[i]`. The yellow rule `conclude a[i] ≠
q[i] and exists k ≠ i: a[k] = q[i]` is the same form.

---

## J. Movement and planning

### 81. Tower of Hanoi

```pzl
game hanoi "Tower of Hanoi"
family position
size n discs, p = 3 pegs
space pegs 1..p, discs 1..n (ordered by size)
answer on : disc -> peg                     # order on a peg is forced by size
given on = all on source; target : peg
freedom transition moves {
  move(a, b): requires a ≠ b and exists d: on(d) = a
    let d = first d in discs where on(d) = a
    requires forall d2 where on(d2) = b: d2 > d
    on(d) := b
}
finish forall d: on(d) = target

size fourPegs { p = 4 }                     # reported: changes the generators
ruleset cyclic  { replace freedom move(a, a + 1 mod 3) only }       # computed: separate game, see below
-- bicolor: replace answer (stack order no longer forced) and the move guard (<=)
modifier minimal { add freedom bound moves <= 2^n - 1 }
```

**Kind.** Computed as a **non-commuting action (groupoid)**. Every move is
undone by `move(b, a)`, and the moves do not commute. **Verdict: described
well** (core only).

**Variants.**
- Four pegs: a **size**. It changes the generators, the case `theory.md`
  § "Limits" leaves open, and it is reported as such.
- Cyclic: its generators are other generators of a non-commuting kind, which
  computes **separate game**. The keyword `ruleset` above is a claim, and the
  computation corrects it.
- Bicolor: the same generator names with an extended action and a richer
  position. That is Twiddle's "same generators, extended action" gap, so it
  computes **separate game**.
- Minimal moves: the bound's m is a parameter the freedom reads, which
  computes **modifier**.

**Cut.** Against Word Ladder, **two games**. A solver agrees.

**Technique.** The source names the minimal solution. The recursive method has
no recursive macro form. The iterative form states: `stage odd moves: the
smallest disc one peg cyclically; even moves: the only other legal move`. It
is a staging policy over two macros.

### 82. Lunar Lockout

```pzl
game lunarlockout "Lunar Lockout"
family position
space grid(5, 5), robots R, red in R, center
answer at : R -> cell
given at
freedom transition moves {
  slide(r, d): let s = first x in ray(at(r), d) where occupied(x)
    requires s exists and s ≠ step(at(r), d)     # a robot must stop it; a zero slide is no move
    at(r) := step(s, opp(d))
}
finish at(red) = center
```

`occupied(x)` := `exists r: at(r) = x`.

**Kind.** Transition: a slide is not in general undone by a slide. **Verdict:
described well** (core, plus the library's `ray`, `step` and `opp`).

**Variants.** Ricochet Robots has walls, which is a board shape. Its slides
also stop at walls and at the board's edge, which is other generators. It
computes **separate game**. Its bidding between players is outside the
one-player round puzzle, which is a shortest path to a target.

**Cut.**
- Against Atomix: the stopping rule differs (a robot only, against a wall or
  an atom), and so does the finish. **Two games.** A solver agrees.
- Against Inertia: **two games**.

**Technique.** None named in the source.

### 83. Atomix

```pzl
game atomix "Atomix"
family position
space grid(w, h), wall : cell -> bool, atoms A, kind : A -> type × bonds (given)
answer at : A -> cell
clue molecule at board value (pattern cell -> type × bonds)
  means (read by the finish)
freedom transition moves {
  slide(a, d): let s = first x in ray(at(a), d) where wall(x) or occupied(x)
    requires s ≠ step(at(a), d)
    at(a) := step(s, opp(d))
}
finish exists t in offsets: forall p in molecule: exists a: kind(a) = molecule(p) and at(a) = translate(p, t)
objective maximize -(length of path)               # move-count scoring
-- time limit: cannot be stated (a wall clock)
```

`translate(c, t)` (L) := the cell `(x + t.x, y + t.y)`, where `offsets` are
the vectors that keep the pattern on the board.

**Kind.** Transition. **Verdict: not described.** The base game, with no
timer, is described with the extension `translate`. The source's time limit
is a bound in seconds, and no block or freedom clause in the core can state
it: the core bounds moves and queries, never time. Ruling 4 makes this the one
variant in the file with no computable word. If the coordinator rules a clock
outside the theory's eight parts, Atomix moves to "described with an
extension".

**Variants.**
- Time limit: **no word**.
- Move-count scoring: adds an objective, which computes **ruleset**.

**Cut.** Against Lunar Lockout, **two games**, as at 82.

**Technique.** None named in the source.

### 84. Tip-Over

```pzl
game tipover "Tip-Over"
family position
space grid(6, 6), target : cell
answer crate : cell -> {empty, tipped} + upright 1..4, t : cell
given crate, t
freedom transition moves {
  walk(d): requires step(t, d) on board and crate(step(t, d)) ≠ empty
    t := step(t, d)
  tip(d): requires crate(t) = upright h, h >= 2,
                   forall k in 1..h: ray(t, d)[k] on board and crate(ray(t, d)[k]) = empty
    for k in 1..h: crate(ray(t, d)[k]) := tipped
    crate(t) := empty; t := ray(t, d)[1]
}
finish t = target
```

Where the tipper lands on the fallen stack does not matter, because the h
tipped cells are joined and walking along them is free.

**Kind.** Transition. **Verdict: described well** (core, plus `ray`).

**Variants.** None named.

**Cut.** Against the Plank puzzle, **two games, same family**. A solver
agrees.

**Technique.** None named in the source.

### 85. Plank puzzle (River Crossing)

```pzl
game planks "Plank puzzle"
family position
space lattice points P of grid(w, h), stumps S subset P, start, goal in S
answer laid : S × S -> length or none, carried : length or none, hiker : S
given laid, carried = none, hiker = start
freedom transition moves {
  walk(s): requires laid({hiker, s}) ≠ none; hiker := s
  pick(e): requires carried = none, laid(e) ≠ none, hiker in e
    carried := laid(e); laid(e) := none
  lay(s): requires carried ≠ none, aligned(hiker, s), |between(hiker, s)| + 1 = carried,
          forall x in between(hiker, s): x not in S,
          forall e with laid(e) ≠ none: between(e) ∩ (between(hiker, s) + {hiker, s}) = ∅
                                        and between(hiker, s) ∩ (between(e) + e) = ∅
    laid({hiker, s}) := carried; carried := none
}
finish hiker = goal
```

Library additions:
- `aligned(a, b)` := same row or same column.
- `between(a, b)` := the lattice points strictly between a and b on that
  line.

**Kind.** Computed as a **non-commuting action (groupoid)**. Pick and lay
undo each other, walking is reversible, and none of them commute. **Verdict:
described with an extension** (`aligned`, `between`).

**Variants.** None named.

**Cut.** Against Tip-Over, **two games**. A solver agrees.

**Technique.** None named in the source.

### 86. Wolf, goat and cabbage

```pzl
game rivercrossing "Wolf, goat and cabbage"
family position
space items {farmer, wolf, goat, cabbage}, banks {L, R}
answer side : item -> bank
given side = all L
freedom transition moves {
  cross(x in {none, wolf, goat, cabbage}):
    requires x = none or side(x) = side(farmer)
    requires safe(after)          # the guard read on the assigned values
    side(farmer) := opp; if x ≠ none: side(x) := opp
}
finish forall i: side(i) = R
```

Here `safe(s)` := `not (s(wolf) = s(goat) ≠ s(farmer)) and not (s(goat) =
s(cabbage) ≠ s(farmer))`, written inline.

**Kind.** Computed as a **non-commuting action (groupoid)**: every crossing is
undone by crossing back. **Verdict: described well** (core only).

**Variants.** Missionaries and cannibals, jealous husbands, and bridge and
torch each have another position, other moves and other rules. Each computes
**separate game**. Bridge and torch also has an objective.

**Cut.** Against Tower of Hanoi, **two games**. A solver agrees.

**Technique.** None named in the source.

### 87. Theseus and the Minotaur

```pzl
game theseus "Theseus and the Minotaur"
family position
space grid(w, h), wall : edge -> bool, exit
answer T, M : cell, dead : bool
given T, M
freedom transition moves {
  turn(d in dirs4 + {wait}): requires not dead and (d = wait or not wall(edge(T, d)))
    let T2 = (d = wait ? T : step(T, d)); M1 = mstep(M, T2); M2 = mstep(M1, T2)
    T := T2; M := M2; dead := (M = T2 or M1 = T2 or M2 = T2)
}
finish T = exit and not dead
```

`mstep(m, t)` (L) := the Minotaur's step, defined explicitly:
- with `h = sign(col(t) - col(m))`: if `h ≠ 0` and `not wall(edge(m, h))`,
  then `step(m, h)`;
- otherwise, with `v = sign(row(t) - row(m))`: if `v ≠ 0` and `not
  wall(edge(m, v))`, then `step(m, v)`;
- otherwise `m`.

It reads coordinates, as Galaxies does.

**Kind.** Transition. **Verdict: described with an extension** (`mstep`). The
pursuer is deterministic, so its move is part of the player's move.

**Variants.** None named.

**Cut.** Against Chase, **two games**. A solver agrees.

**Technique.** None named in the source.

### 88. Bloxorz

```pzl
game bloxorz "Bloxorz"
family position
space grid(w, h), tile : cell -> {none, floor, fragile, soft, hard, bridge, hole},
      switches : cell -> set of (cell, {toggle, on, off})
answer pos : cell, o : {up, lx, ly}, open : cell -> bool
given pos, o = up, open
freedom transition moves {
  roll(d): let (p2, o2) = roll_block(pos, o, d)
    requires forall c in occupies(p2, o2): tile(c) ≠ none and (tile(c) = bridge implies open(c))
    requires not (o2 = up and tile(p2) = fragile)
    pos := p2; o := o2
    then for c in occupies(p2, o2) where tile(c) = soft or (tile(c) = hard and o2 = up):
         for (b, mode) in switches(c): open(b) := apply(mode, open(b))
}
finish o = up and tile(pos) = hole
```

Library additions:
- `occupies(p, o)` := `{p}` if `o = up`, `{p, step(p, e)}` if `lx`, and `{p,
  step(p, s)}` if `ly`.
- `roll_block(p, o, d)` := twelve cases over three orientations and four
  directions. For example, `up, e` gives `(step(p, e), lx)`, and `lx, e` gives
  `(step(p, e, 2), up)`. This is a definition over `step`, not geometry.

**Kind.** Transition: a switch makes some rolls impossible to undo.
**Verdict: described with an extension** (`occupies`, `roll_block`). The
block's "3D" is three orientation states, and needs no solid geometry.

**Variants.** Split switches: the position becomes two cubes, and there are
new moves. These are other generators of a planning kind, which computes
**separate game**. **Flagged**: a player sees a split switch as one more tile
inside the same game.

**Cut.**
- Against Cube: different solid, roll table and finish (painting against
  reaching the hole), so **two games, same family**. A solver agrees.

**Technique.** None named in the source.

### 89. Labirintus

```pzl
game labirintus "Labirintus"
family position
space grid(16, 20), wall : edge -> bool, exit1, exit2
answer b1, b2 : cell
given b1 = exit1, b2 = exit2
freedom transition moves {
  tilt(d):
    let lead = (b2 in sightline(b1, d) until wall ? b2 : b1), trail = the other
    let lead2 = last x in {lead} + sightline(lead, d) until wall
    let trail2 = last x in {trail} + sightline(trail, d) until (wall or x = lead2)
    lead := lead2; trail := trail2
}
finish b1 = exit2 and b2 = exit1
```

Here `until wall` means up to the first wall edge crossed. The Ludii source's
"chosen ball moves first" adds an argument `ball` that fixes `lead`.

**Kind.** Transition. **Verdict: described well** (core, plus `sightline`).

**Variants.** One ball (tilt maze): the finish is replaced and the ball count
is a size, which computes **ruleset**.

**Cut.**
- Against Lunar Lockout: a tilt moves all balls and walls stop them, against
  one chosen robot that only robots stop. The generators differ, so **two
  games**. A solver agrees.
- Against Inertia: **two games**.

**Technique.** None named in the source.

### 90. Insanity (Frogs and Toads)

```pzl
game insanity "Insanity"
family position
size holes = 10, k = 4
space holes 1..10 (a line)
answer h : hole -> {red, blue, empty}
given h = red^4 empty^2 blue^4
freedom transition rules {
  [ red | empty ] -> [ empty | red ]                  # rightward only
  [ red | peg | empty ] -> [ empty | peg | red ]       # peg = red or blue
  [ empty | blue ] -> [ blue | empty ]                 # leftward only
  [ empty | peg | blue ] -> [ blue | peg | empty ]
}
finish h = blue^4 empty^2 red^4
```

**Kind.** Transition, since moves go one way only. **Verdict: described
well** (rewrite rules, core).

**Variants.**
- One empty hole, jumping only over the other color: the jump rule is
  restricted, which is other generators, so it computes **separate game**,
  and the size changes too. **Flagged**: players call both "Frogs and Toads".
- Other counts: **size**.

**Cut.**
- Against Pegs: a jump removes a peg there and not here, and the moves here
  are directional, so **two games**. A solver agrees.

**Technique.** None named in the source.

### 91. Tchuka Ruma (Chuka)

The relay sowing is written as forced micro-moves, so each move is a guarded
assignment.

```pzl
game chuka "Tchuka Ruma"
family position
space holes 0..4 (cyclic; 0 = Rumba)
answer k : hole -> 0..8, hand : 0..8, at : hole, phase : {free, sowing, lost}
given k = (0, 2, 2, 2, 2), hand = 0, phase = free
freedom transition moves {
  start(x): requires phase = free and x ≠ 0 and k(x) > 0
    hand := k(x); k(x) := 0; at := x; phase := sowing
  drop(): requires phase = sowing and hand > 0      # the only move while sowing
    at := at + 1 mod 5; k(at + 1 mod 5) := k(at + 1 mod 5) + 1; hand := hand - 1
    then if hand = 0:
      if at = 0: phase := free
      elif k(at) > 1: hand := k(at); k(at) := 0        # relay
      else phase := lost
}
finish k(0) = 8
```

**Kind.** Transition. **Verdict: described well** (core only).

**Variants.** Tchoukaillon has holes in a line and sows toward the Rumba
without a relay. The space changes and the generators change, so it computes
**separate game**.

**Cut.** Against Pegs, **two games**. A solver agrees.

**Technique.** None named in the source. Tchoukaillon's solution has a known
closed form, which is a certificate.

### 92. Chase (Robots)

```pzl
game chase "Chase"
family position
space grid(w, h)
answer p : cell, robot : cell -> {none, robot, rubble}, dead : bool
freedom transition moves {
  walk(d in dirs8 + {stay}): p := step(p, d); then robots_move
  teleport(): p := ?                                # a uniformly random cell: CANNOT BE STATED
}
finish forall c: robot(c) ≠ robot
deal: random positions
```

`robots_move` is definable: each robot steps `sign(dx), sign(dy)` toward `p`.
A cell entered by two robots, or containing rubble, becomes rubble. `dead :=
robot(p) = robot`.

**Kind.** Transition. **Verdict: not described.** The teleport's effect is a
random draw during play, and the core has chance only in the `deal`, before
play or after the first query. A move with a random outcome, a chance node,
is missing. Without teleport the rest is described with the extension
`robots_move`.

**Variants**, the words they would compute if chance were stated:
- Safe teleports with limited uses: a parameter, which would compute
  **modifier**.
- "Wait until the robots finish": a new move, which would compute **separate
  game**.

**Cut.** Against Theseus, **two games**. A solver agrees.

**Technique.** None named in the source.

### 93. Shisen-Sho

```pzl
game shisensho "Shisen-Sho"
family position
space ext = grid(w + 2, h + 2), board = its interior     # the margin is ext - board
answer tile : ext cell -> face or empty; tile = empty on the margin
given tile
freedom transition moves {
  remove(a, b): requires a ≠ b and tile(a) = tile(b) ≠ empty
                and exists p, q in ext: clear(a, p) and clear(p, q) and clear(q, b)
                    and (p = a or tile(p) = empty) and (q = b or tile(q) = empty)
    tile(a) := empty; tile(b) := empty
}
finish forall c: tile(c) = empty               # stuck otherwise: no move, unfinished
```

`clear(x, y)` := `x = y or (aligned(x, y) and forall z in between(x, y):
tile(z) = empty)`. It uses `aligned` and `between` from 85.

**Kind.** Transition. **Verdict: described with an extension** (`aligned`,
`between`, shared with 85). The margin is the `ext` space, a definition.

**Variants.** Gravity: tiles fall after a removal. That is a changed action,
other generators, so it computes **separate game**. **Flagged**: KShisen
offers gravity as a game option.

**Cut.**
- Against Same Game: the removal rules differ (a linked pair against a group),
  as do the objective and gravity. **Two games.** A solver agrees.

**Technique.** None named in the source.

### 94. 2048

```pzl
game g2048 "2048"
family position
size w = h = 4
space grid(4, 4)
answer v : cell -> {0} + {2^i : 1 <= i <= 17}
freedom transition moves {
  push(d): requires slide(v, d) ≠ v
    v := slide(v, d)
    then spawn: a uniformly random empty cell gets 2 (p 0.9) or 4 (p 0.1)   # CANNOT BE STATED
}
finish exists c: v(c) = 2048
deal: two spawned tiles
```

`slide` is definable per line, from the leading edge, by an `lfp` over
(index, output-index, merged?) tuples, or as a scan over `runs`.

**Kind.** Transition. **Verdict: not described.** A random tile after every
move is a chance node in play, and the core lacks it, as at 92. `deal after
first query` is a query clause and does not repeat.

**Variants**, the words they would compute if chance were stated:
- Endless play for score: replaces the finish with an objective, which would
  compute **ruleset**.
- Other board sizes: **size**.
- Threes: other merge rules, which would compute **separate game**.

**Cut.** Against Fifteen and Sixteen, **two games**. A solver agrees.

**Technique.** None named in the source.

### 95. Safe Passage

The source text does not say whether White and Black alternate, as in chess.
I read it as alternating: "by the rules of chess (both sides)".

```pzl
game safepassage "Safe Passage"
family position
space grid(8, 8)
answer pc : cell -> none + {white, black} × {K, Q, R, B, N, P}, turn : color,
       rights : castling and en passant flags, dead : bool
given pc, turn, rights
freedom transition moves {
  move(a, b, promo): requires not dead and color(pc(a)) = turn and b in moves(a) and pc(b) = none
    pc(b) := (promotes(a, b) ? (turn, promo) : pc(a)); pc(a) := none
    update rights; turn := other(turn)
    then dead := exists x, y: pc(y) ≠ none and color(pc(y)) ≠ color(pc(x)) and y in attacks(x)
  castle(side): requires the rights, the empty squares between, none of them attacked
}
finish not dead and pc(Kw_start) = (black, K) and pc(Kb_start) = (white, K)
```

`moves(a)` and `attacks(a)` (L) are defined per piece type:
- K: `adj8`.
- N: `knight`, from 70.
- R, B, Q: the orthogonal, diagonal and both rays of `ray8`, up to the first
  occupied cell. For `attacks` that cell is included; for `moves` it is
  excluded.
- P: forward one, or two from the home rank through an empty cell. A pawn
  attacks the two forward diagonals.

`ray8` is Inertia's diagonal `ray` from the collection.

**Kind.** Transition. **Verdict: described with an extension**
(`moves`/`attacks`, `knight`, `ray8`). Captures and checks cannot occur, since
either one is already `dead`.

**Variants.** None named.

**Cut.**
- Against Mate in n: **two games**. Here the solver moves both sides; there an
  opponent chooses. A solver agrees.

**Technique.** None named in the source.

### 96. Chess problem: mate in n

```pzl
game mateinn "Mate in n"
family position
space grid(8, 8)
answer (the chess position, as in 95, with full capture, check and en passant)
freedom transition moves { move(...) by the side to move }   # definable as in 95
-- finish: exists w1 forall b1 exists w2 ... mate within n: CANNOT BE STATED
```

**Verdict: not described.** The core has one agent. A freedom has no
opponent whose choice is quantified universally, and no logic ranges over
positions or plays. In twelve coins (74) the strategy is a tree whose shape
the size fixes, so it is a space. Here the replies depend on the position, so
a strategy tree would be a space built from the rules: the game tree, which is
not a set the board bounds. Bounded fillings therefore do not reach it. The
core needs an **adversarial freedom**: "against every reply", an alternation
over moves. Moves and checkmate themselves are definable as in 95.

**Variants:**
- Selfmate: replaces the finish (Black must mate), which computes
  **ruleset**, given an adversarial core.
- Helpmate: both sides cooperate, so the freedom becomes a one-agent
  transition, which computes **separate game**. Helpmate on its own is
  describable, as 95 shows.
- Studies (win or draw against best play): unbounded, which computes
  **ruleset** (a replaced finish), given an adversarial core.

**Cut.** Against Safe Passage, **two games**, as at 95.

**Technique.** None that is stated in the language. Key-move heuristics are
not deductions.

### 97. Morpion Solitaire

```pzl
game morpion "Morpion Solitaire (5T)"
family position
size len = 5
space plane = Z^2, dirs = {e, n, ne, se}        # not finite: stated, no finite meaning
answer dot : point -> bool, drawn : point × dirs -> bool
given dot = the Greek cross of 36 points; drawn = none
freedom transition moves {
  play(p, s, d): requires not dot(p) and p in line(s, d)
                 and forall x in line(s, d) - {p}: dot(x)
                 and forall s2 with drawn(s2, d): |line(s, d) ∩ line(s2, d)| <= 1
    dot(p) := true; drawn(s, d) := true
}
objective maximize length of path                # every end is a finish
```

`line(s, d)` (L) := `{ s + i·d : 0 <= i < len }`, which is `plane`'s
direction-labeled incidence.

**Kind.** Transition. **Verdict: described with an extension** (`plane`,
`line`). Flag: the space is not finite, which is permitted only as "stated,
and has no such meaning", the same status as Untangle. Every 5T and 5D game is
known to end, so the space could be bounded by a theorem, but not by a rule.

**Variants.**
- 5T and 5D: the overlap rule is replaced (`<= 1` against `= 0` points
  shared), which computes **ruleset**.
- 4T and 4D: `len` is a parameter of the rule, plus a different starting cross
  in the deal, which computes **modifier**. By the theory a changed parameter
  is a modifier. A player might call 4T a separate game.

**Cut.** No neighbor is listed. Against Same Game, the nearest optimization:
**two games**.

**Technique.** None named in the source.

### 98. Block Faker

```pzl
game blockfaker "Block Faker"
family position
space grid(w, h), fixed : cell -> {floor, wall, wallblock, grille, endpoint}
answer p : cell, block : cell -> 1..5 or none
given p, block
freedom transition moves {
  push(d): let t = step(p, d), f = first x in ray(p, d) where block(x) = none
    requires fixed(t) not in {wall, wallblock}
    requires block(t) = none or (fixed(f) = floor and f ≠ p)
    for c in ray(p, d) before f: block(step(c, d)) := block(c)
    block(t) := none (if pushed); p := t
    then for c where exists L in rows + cols, r in runs(L, block = block(c)):
                     c in r and |r| >= 3: block(c) := none
}
finish p = endpoint
```

**Kind.** Transition. **Verdict: described well** (core, plus `ray` and
`runs`).

**Variants.** None named.

**Cut.**
- Against Sokoban: chain pushes against single pushes, a match-three removal,
  and a finish on the player rather than on the crates. These are other
  generators and another finish, so **two games, same family**. A solver
  agrees.

**Technique.** None named in the source.

### 99. Lime Rick

```pzl
game limerick "Lime Rick"
family position
space grid(w, h) seen from the side, wall : cell -> bool, exit
answer head : cell, body : cell -> bool, crate : cell -> bool, apple : cell -> bool, ups : 0..3
given head, crate, apple; body = none; ups = 0
freedom transition moves {
  go(d in {left, right, up}): let t = step(head, d)
    requires d ≠ up or ups < 3
    requires free(t) or (d ≠ up and crate(t) and free(step(t, d)))
    if crate(t): crate(t) := false; crate(step(t, d)) := true
    body(head) := true; head := t; ups := (d = up ? ups + 1 : 0)
    then if apple(head): apple(head) := false; body := none
    then settle
}
finish head = exit
```

`free(c)` := `not wall(c) and not body(c) and not crate(c) and c ≠ head`.

`settle` (L): gravity defined with counting, generalizing the collection's
Same Game `fall`.
- The head falls to `last x in ray(head, down) until not free(x)`. Every cell
  it passes gets `body := true`. If it fell, `ups := 0`.
- Then, in each column, the fixed obstacles (walls, body, head) cut the column
  into gaps. A gap holding k crates holds them in its bottom k cells.

**Kind.** Transition. **Verdict: described with an extension** (`settle`).
The order "head first, then crates" is PuzzleScript's rule order, read from
the source.

**Variants.** None named.

**Cut.** Against Block Faker, **two games**. A solver agrees.

**Technique.** None named in the source.

### 100. Zen Puzzle Garden (PuzzleScript version)

```pzl
game zengarden "Zen Puzzle Garden"
family position
space grid(w, h), kind : cell -> {border, sand, rock}
answer m : cell, raked : cell -> bool
given m on the border; raked = none
freedom transition moves {
  walk(d): let t = step(m, d)
    requires t on board and kind(t) ≠ rock and not raked(t)
    if kind(m) = sand: raked(m) := true
    m := t
}
finish forall c: kind(c) = sand implies raked(c)
```

**Kind.** Transition. **Verdict: described well** (core only).

**Variants.** The original game slides until blocked and enters from the
border. Those are other generators, so it computes **separate game**. The
step version and the slide version play differently, so the word is
plausible.

**Cut.**
- Against Knight's Tour: both are tours by moves through cells that cannot be
  re-entered, but the generators are a step on `adj4` against a knight jump,
  and the free border is a difference too. **Two games, same family.** This
  is consistent with 70's transition reading, and a solver agrees.
- Against Inertia: **two games**.

**Technique.** None named in the source.

### 101. MazezaM

```pzl
game mazezam "MazezaM"
family position
space grid(w, h) inside walls, entrance, exit
answer p : cell, crate : cell -> bool, closed : bool
given p = entrance, crate, closed = false
freedom transition moves {
  side(d in {e, w}): let t = step(p, d), R = row(p)
    requires t on board and not (closed and t = entrance)
    if crate(t): requires not crate(last cell of R in direction d)
        for c in R: crate(c) := crate(step(c, opp(d)))     # the trailing end gets false
    p := t; closed := closed or p ≠ entrance
  vert(d in {n, s}): let t = step(p, d)
    requires t on board and not crate(t) and not (closed and t = entrance)
    p := t; closed := true
}
finish p = exit
```

**Kind.** Transition: the closing entrance cannot be undone. **Verdict:
described well** (core only).

**Variants.** None named.

**Cut.**
- Against Sixteen and Netslide: those shift whole lines cyclically from
  outside the board; here a row shifts without wrapping, only where the player
  stands, and only when its end is empty. Other generators, so **two games**.
  A solver agrees.

**Technique.** None named in the source.

### 102. Neko Puzzle

```pzl
game neko "Neko Puzzle"
family position
space grid(w, h)
answer cat : cell, fruit : cell -> bool
given cat, fruit
freedom transition moves {
  jump(d in dirs4): let f = first x in ray(cat, d) where fruit(x)
    requires f exists
    cat := f; fruit(f) := false
}
finish forall c: not fruit(c)
```

**Kind.** Transition. **Verdict: described well** (core, plus `ray`).

**Variants.** None named.

**Cut, flagged as looking wrong.**
- Against Hiroimono (38): the list says Hiroimono is Neko's move plus "no
  reversal", with a free start. Written as puzz.link presents it, Hiroimono is
  a fill (`order : 1..N -> stone`, numbering the stones). The freedom kinds
  then differ and the language computes **two games in two families**.
- Written as a transition like Neko's, the no-reversal rule is a guard on the
  move (the previous direction kept in the position). That is other
  generators of a planning kind, which still computes **separate game**.
- A solver of both would call Hiroimono "Neko plus one rule", a modifier.
  Monotonicity backs that: every Neko prune stays sound under the extra
  guard. The theory cannot reach it, because for planning freedoms it treats
  any change of the move set as a change of kind. An added guard only removes
  moves, which is the planning analog of an added rule, and the table has
  no row for it.

**Technique.** None named in the source.

---

## K. Toggle and permutation

### 103. Lights Out 2000

```pzl
game lightsout2000 "Lights Out 2000"
family lights
size w = h = 5
space grid(5, 5)
answer s : cell -> 0..2                        # off, red, green
given s
freedom act press(c: cell): for d in adj4(c) + {c}: s(d) := s(d) + 1 mod 3
finish forall c: s(c) = 0

ruleset twoState { replace answer s : cell -> 0..1; replace freedom ... + 1 mod 2 }   # = Flip Crosses
```

**Kind.** Computed as a **commuting action** over Z3. **Verdict: described
well** (core only).

**Variants.**
- Two-state mode: the domain is replaced and the commuting move set with it,
  which computes **ruleset**.
- Lights Out Deluxe (6×6, two-state): **ruleset** plus a **size**.

**Cut.**
- Against Flip (Crosses): only the domain differs (Z3 against GF(2)), so it
  computes **one game, a ruleset**. A solver agrees: the method is linear
  algebra over the field.

**Technique.** Light chasing (Wikipedia) is Flip's `lastPress` with the
staging policy "row by row: press below each lit light". It is stated as in
the collection's Flip, with `+1 mod 3` in place of a toggle. It carries the
same unmarked staging premise that experiment B noted.

### 104. Buttons and Lights

```pzl
game buttonslights "Buttons and Lights"
family lights
space lights 1..3
answer l : 1..3 -> bool
given l = all false
freedom transition moves {
  b1: l(1) := not l(1)
  b2: l(1) := l(2); l(2) := l(1)          # simultaneous
  b3: l(2) := l(3); l(3) := l(2)
} bound moves <= 6
finish forall i: l(i)
```

**Kind.** Computed as a **non-commuting action (a group)**. Each button is an
involution, and b1 and b2 do not commute. It cannot be written as `permute`,
because b1 is not a permutation of elements; the computation reads the moves.
**Verdict: described well** (core only).

**Variants.** None named.

**Cut.**
- Against Lights Out 2000 and Flip: commuting against non-commuting, so **two
  games** of the lights family. A solver agrees.
- Against Twiddle: other generators, so **two games**.

**Technique.** None named in the source. The macro `b1 b2 b1` lights two
lamps, which is a macro with an effect.

### 105. Rubik's Cube

```pzl
game rubik "Rubik's Cube"
family tiles in order
size n = 3
space cubelets(n): facelet = (v in {-(n-1), ..., n-1 step 2}^3 with one |coordinate| = n-1, normal)
answer color : facelet -> 1..6
given color                                       # the scramble
freedom permute generators {
  turn(a in axes, side in {+, -}): for x with x.v[a] = side·(n-1): color(rot(x, a, side)) := color(x)
}
finish forall face F: forall x, y in F: color(x) = color(y)
deal start: m random turns from finished

size bigger { n = 2 | 4 | ... ; add generators slice(a, layer) }   # reported: changes the generators
objective godsNumber { add objective maximize -(length of path) }   # with the half-turn metric as a cost
```

Library additions:
- `cubelets(n)` := the space above.
- `rot(x, a, side)` := a quarter rotation of position and normal about axis
  `a`. About z it is `(x, y, z) -> (-y, x, z)`. This is integer arithmetic,
  not a table.

**Kind.** Computed as a **non-commuting action (a group)**. **Verdict:
described with an extension** (`cubelets`, `rot`).

**Variants.**
- 2×2×2, 4×4×4 and larger: a **size**. It changes the generators (slices),
  Twiddle's open case, and is reported. For even n the centers move, but the
  finish already reads only face colors.
- Megaminx: another space and other generators, so **separate game**.
- Move-count optimization: adds an objective, which computes **ruleset**.

**Cut.**
- Against Twiddle: other generators and space, so **two games, same family**.
  A solver agrees.

**Technique.** The layer method states as macros, as Twiddle's do:

```pzl
technique sexy
  macro R, U, R^-1, U^-1
  effect a commutator: it moves only pieces in R ∩ U
stage first layer, middle layer, last layer
```

### 106. Instant Insanity

```pzl
game instantinsanity "Instant Insanity"
family placement
size k = 4 cubes and colors
space cubes 1..k, faces = {±x, ±y, ±z}, rotations(cube): the 24 signed permutation matrices of det +1
given paint : cube × face -> 1..k
answer o : cube -> rotations(cube)
rule sides: forall s in {+x, -x, +y, -y}: distinct(paint(i, o(i)^-1 · s) over cubes)
freedom fill
```

`rotations(cube)` (L) is defined by arithmetic over 3×3 matrices with entries
in {-1, 0, 1}. It is the same object as the collection's `solid(cube)`
orientation set, and as 105's `rot`, which generates it.

**Kind.** Fill: choosing an orientation overwrites the previous one.
**Verdict: described with an extension** (`rotations`).

**Variants.** More cubes and colors: k is read as the extent of the domain,
so it computes **size**.

**Cut.**
- Against the logic grid: both are "each side a permutation" constraints, but
  the space, answer and clue kinds differ. **Two games, two families.**
- Against Twiddle: fill against permute, so **two games**. A solver agrees
  with both.

**Technique.** The classical graph method (Wikipedia) is two disjoint
2-regular subgraphs of the color multigraph. It is a certificate, not a
technique.

---

## Table

| # | Puzzle | Verdict | Library additions | Core gaps | Cut pair verdict |
| --- | --- | --- | --- | --- | --- |
| 69 | Icosian | well | none | none | vs 70: two (freedom); **looks wrong** (one Hamiltonian problem) |
| 70 | Knight's Tour | extension | `knight` | none | vs 69 **looks wrong**; vs Ascent/Signpost: factoring-dependent |
| 71 | One-stroke | well | none | none | vs 69: two (answer sort), agrees |
| 72 | Hexcells | extension | `hexlines`, `ring`, `ring_runs`, `within2` | none | vs Mines: one (ruleset), borderline; vs Mosaic: two, agrees |
| 73 | Wumpus World | extension (rests on the walk-as-query quotient) | `frontier`, `killed` | strictly: partially observed transition | vs Mines: two, agrees |
| 74 | Twelve coins | extension | `tree(b, d)` (+ `reach` lfp) | none | vs Guess: two, agrees |
| 75 | Logic grid | extension | `ent`, `same` | none | vs Solo/Towers: two, agrees |
| 76 | Knights and Knaves | extension | dealt statement trees + `T`/`F` evaluator (lfp) | none | vs Usoone/Yajikazu: two, agrees |
| 77 | Codeword | extension | `entries`, `word`, `dict` (table) | none | vs Fill-in: two, agrees |
| 78 | Fill-in | extension | `entries`, `word` | none | vs Dominosa: two, agrees |
| 79 | Word Ladder | extension | `dict` (table) | none | vs Hanoi: two, agrees |
| 80 | Wordle | extension | `dict`, `answers` (tables) | none | vs Guess: two, agrees |
| 81 | Tower of Hanoi | well | none | none | vs 79: two, agrees |
| 82 | Lunar Lockout | well | none | none | vs 83: two, agrees |
| 83 | Atomix | **not described** | (`translate`) | a wall-clock time limit | vs 82: two, agrees |
| 84 | Tip-Over | well | none | none | vs 85: two, agrees |
| 85 | Plank puzzle | extension | `aligned`, `between` | none | vs 84: two, agrees |
| 86 | Wolf, goat, cabbage | well | none | none | vs 81: two, agrees |
| 87 | Theseus and Minotaur | extension | `mstep` | none | vs 92: two, agrees |
| 88 | Bloxorz | extension | `occupies`, `roll_block` | none | vs Cube: two, agrees |
| 89 | Labirintus | well | none | none | vs 82: two, agrees |
| 90 | Insanity | well | none | none | vs Pegs: two, agrees |
| 91 | Tchuka Ruma | well | none | none | vs Pegs: two, agrees |
| 92 | Chase | **not described** | (`robots_move`) | a move with a random outcome | vs 87: two, agrees |
| 93 | Shisen-Sho | extension | `aligned`, `between` | none | vs Same Game: two, agrees |
| 94 | 2048 | **not described** | (`slide`) | a random spawn after each move | vs Sixteen: two, agrees |
| 95 | Safe Passage | extension | `moves`/`attacks`, `knight`, `ray8` | none | vs 96: two, agrees |
| 96 | Mate in n | **not described** | (chess as 95) | an adversary: "against every reply" | vs 95: two, agrees |
| 97 | Morpion | extension (non-finite space) | `plane`, `line` | none (stated without finite meaning) | no neighbor; vs Same Game: two |
| 98 | Block Faker | well | none | none | vs Sokoban: two, agrees |
| 99 | Lime Rick | extension | `settle` | none | vs 98: two, agrees |
| 100 | Zen Puzzle Garden | well | none | none | vs 70: two, agrees |
| 101 | MazezaM | well | none | none | vs Sixteen/Netslide: two, agrees |
| 102 | Neko | well | none | none | vs Hiroimono: two; **looks wrong** (modifier) |
| 103 | Lights Out 2000 | well | none | none | vs Flip: one (ruleset), agrees |
| 104 | Buttons and Lights | well | none | none | vs 103/Flip: two, agrees |
| 105 | Rubik's Cube | extension | `cubelets`, `rot` | none | vs Twiddle: two, agrees |
| 106 | Instant Insanity | extension | `rotations(cube)` | none | vs 75 / Twiddle: two, agrees |

## Counts

| Verdict | Count | Puzzles |
| --- | --- | --- |
| Described well | 15 | 69, 71, 81, 82, 84, 86, 89, 90, 91, 98, 100, 101, 102, 103, 104 |
| Described with an extension | 19 | 70, 72, 73, 74, 75, 76, 77, 78, 79, 80, 85, 87, 88, 93, 95, 97, 99, 105, 106 |
| Not described | 4 | 83 Atomix (clock), 92 Chase (chance), 94 2048 (chance), 96 Mate in n (adversary) |

Total: 38. The core gaps fall into three kinds: **chance during play** (2),
**an adversary** (1) and **a clock** (1). Three verdicts rest on a ruling
that could flip them:
- 73 Wumpus: the walk written as a query. If that is refused, Wumpus becomes
  not described, for want of a partially observed transition.
- 77, 79, 80: the dictionary counted as a library table. If that is refused,
  all three become not described.
- 83 Atomix: the clock counted as a rule. If the clock is ruled outside the
  game, Atomix becomes an extension.

## Library additions and reuse (within this slice)

| Addition | Definition (short) | Puzzles |
| --- | --- | --- |
| `dict` / `answers` (table) | fixed finite sets of letter lists | 77, 79, 80 (3) |
| `entries` (`slots`), `word` | runs of white of length ≥ 2 in rows + cols; the letter list along one | 77, 78 (2) |
| `aligned`, `between` | same row/col; lattice points strictly between | 85, 93 (2) |
| `knight` | step∘step∘step with a perpendicular turn | 70, 95, and 96 if it were described (2 counted) |
| `rot` / `rotations(cube)` | quarter rotation of integer vectors; the 24 signed permutation matrices of det +1 | 105, 106 (2), and the collection's Cube |
| `ray8` | `ray` on eight directions | 95, and the collection's Inertia |
| `settle` | gravity in gaps between fixed obstacles | 99, generalizing the collection's Same Game `fall` |
| `hexlines`, `ring`, `ring_runs`, `within2` | hex axes; cyclic neighbor order; runs on it; distance ≤ 2 | 72 only |
| `frontier`, `killed` | unrevealed cells beside a revealed one; a shot whose ray holds the wumpus | 73 only |
| `tree(b, d)` (+ `reach`) | the complete b-ary tree as a space; an lfp over (hidden, node) | 74 only |
| `ent`, `same` | a logic grid's entity of a value | 75 only |
| statement trees + `T`/`F` | a positive simultaneous lfp evaluator of a statement grammar | 76 only |
| `mstep` | the Minotaur's horizontal-first step | 87 only |
| `occupies`, `roll_block` | a 1×1×2 block's cells; 12 roll cases | 88 only |
| `plane`, `line` | Z², five points in a direction | 97 only |
| `cubelets(n)` | facelets as integer position and normal | 105 only |

Of the 19 puzzles with an extension, those whose every addition no other
puzzle in this slice uses are 72, 73, 74, 75, 76, 87, 88, 97 and 99: nine of
19, under half. Counting reuse with the collection, 99 (`fall`) and 106
(`solid(cube)`) are shared anyway. The other slices may share `hexlines`,
`ring`, `between` and `tree`, so the coordinator should merge before judging
the "few and shared" condition.

## Cut pairs that looked wrong

1. **69 Icosian / 70 Knight's Tour.** Computed as two games in two families,
   because one is a fill and the other a transition. A solver sees one
   Hamiltonian problem on two graphs. The word turns on whether the source
   presents the puzzle as a drawing or as moves. The theory's freedom test
   cannot tell a transition that builds a sequence from a fill of that
   sequence when every move is "extend the path by one".
2. **102 Neko / 38 Hiroimono.** Computed as two games, either by freedom kind
   or, both written as transitions, by other generators. A solver says
   Hiroimono is Neko plus no reversal, a modifier. The theory has no row for
   "an added guard that only removes moves" in a planning freedom, though
   monotonicity carries every Neko prune.
3. Borderline, not counted: **72 Hexcells / Mines**, computed as one game (a
   ruleset). This is defensible by technique carry-over, but a solver may say
   two.

Factoring dependence, which is not a wrong answer but a word that moves with
the writing:
- 70 against Ascent and Signpost (fill or transition).
- 71 against 69 (a sequence or a set for the Hamiltonian answer).
- 76's normals (implications or a disjunction in the clue meaning).

## Variant words that look wrong to a player (criterion 2 held, by the theory)

- Shisen-Sho's gravity, Bloxorz's split switches, Insanity's one-hole Frogs
  and Toads, and Word Ladder's insertion: **separate game**, because a planning
  move set changed. Players call each of these an option of the same game.
- Hanoi bicolor: "same generators, extended action", Twiddle's gap again.
- Hanoi's four pegs and Rubik's n: a size that changes the generators, the
  case the theory leaves open.
- Knight's Tour closed and magic: an added finish conjunct computes ruleset
  because the table has no "add finish" row. The theory says an added goal is
  a modifier.
- Knights and Knaves' one-question variant: the table's "replace answer
  domain → ruleset" against the family computation's "separate game" when the
  answer's sort changes.
- Wordle's Quordle: no row for a changed clue placement whose meaning is
  unchanged.
- Absurdle: a separate game by its freedom kind, though it keeps every
  feedback deduction.

## Techniques (reported apart)

Stated for the puzzles whose sources name a method:
- 71: Euler's parity and Fleury, as premises.
- 72: `full` and `together`.
- 74: the information bound.
- 75: grid transfer.
- 76: a `look` Check.
- 80: gray elimination.
- 81: the iterative Hanoi staging.
- 103: light chasing, which is Flip's `lastPress`, with the same unmarked
  staging premise.
- 105: the commutator macro with a layer staging.

The technique form holds outside the collection in each of these. Two gaps
appeared:
- A **recursive macro**: Hanoi's natural method has no form. Only its
  iterative restatement fits.
- Warnsdorff's rule and Instant Insanity's graph method are a heuristic and a
  certificate, outside techniques, as `theory.md` expects.
