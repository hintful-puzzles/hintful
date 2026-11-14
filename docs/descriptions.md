# Descriptions Guide

How a game's deduction techniques are stated in a description and compiled
into the solver, its rules into its answer check, and a planning game's
moves, finish and dead-end claims into the rules it plays by. The normative
statements are in the specs:
[`latin-solver`](../openspec/specs/latin-solver/spec.md) ("The Latin ladder
is compiled from its description", "A compiled firing is recorded with a
reason built from its binding", "A game's answer check is compiled from its
rules"),
[`described-position`](../openspec/specs/described-position/spec.md) and
[`build-pipeline`](../openspec/specs/build-pipeline/spec.md) ("Nothing is
generated into the source tree"). The parser and the compilers are
[`src/describe/`](../src/describe/). The runtime the compiled code calls is
[`engine/describe-runtime.ts`](../src/engine/describe-runtime.ts), and a
planning game's rules are the engine's
[`engine/position-runtime.ts`](../src/engine/position-runtime.ts), the
engine's because the engine and games import nothing above them. The
development tools that also read a description's rules, the interpreter and
the soundness checkers, are under [`research/`](../research/).

## What every game does

Every game has a description, `src/games/<id>/<id>.description.yaml`, which
holds at least its help page ([`help-pages.md`](./help-pages.md)); the file
itself is § "The file". A game whose techniques are stated:

1. **States its techniques in `<name>.description.yaml`** beside the code
   that runs them. It places the library's with `use` and states its own
   (§ "The formula syntax", § "A statement's order is behavior"); the Latin
   library is [`engine/latin.description.yaml`](../src/engine/latin.description.yaml).
2. **Runs `npm run describe`**, which writes `<name>.compiled.ts` beside each
   description. Edit the description, never the compiled module:
   `src/describe/compile.test.ts` compiles every description again in the
   gate and fails where a module differs. The module's diff is read by
   function: each numbers its own fresh names, and what a rung keeps at the
   module's scope is named after it (`Out.own`), so a function moves only
   when its own code does. A module new to the tree reads
   there as missing until `npx vitest --clearCache`: Vitest's module
   cache keeps the test's glob as it was first expanded.
3. **Checks every technique it states sound** with
   `npx vitest run -c research/technique-check/vitest.config.ts describe-check`,
   which records each verdict in `src/describe/soundness.json`. The gate
   fails on a compiled technique with no verdict for its statement as it
   reads now (§ "Checking a technique sound").
4. **Pairs each of its own techniques with the reason its records carry**,
   by `describedLadder`, or `latinLadder` where it places the Latin library,
   whose techniques the engine pairs: a technique of its own the
   description adds and the game does not pair is a type error. It pairs
   through `compiledRung`, or `uncluedRung` for a technique that reads
   nothing the board deals, `placingRung` for one run on placing
   ([`seismic/solver.ts`](../src/games/seismic/solver.ts)), and
   `strikingRung` for one run on striking; § "A firing's reason is built
   from its binding".
5. **Deals its board as the description reads it**, the compiled module's
   `Dealt`: one `ClueList` a kind, in the order the techniques should meet
   them; one `Partition` a dealt partition; and each size a technique reads
   that the grid is not measured in (Salad's `nums`, Seismic's `mode`).
   [`towers/solver.ts`](../src/games/towers/solver.ts) deals clues and
   [`keen/solver.ts`](../src/games/keen/solver.ts) cages. The board goes on
   the space the module's `units` declare, `describedSpace(units, w, h,
   parts)` (`latinSpace(o)` is a Latin square's), and where its domain is a
   cell's, each cell holds what the module's `domainOf` gives it
   (§ "The runtime a ladder runs on"). Keep what it deals no longer than the
   structure it reads stays as it was: Solo's generator merges cages in
   place between solves, so a partition kept for the cage structure's life
   reads stale cages.
6. **Checks its answers by its rules**: its `status`, and every solver
   that asks whether a filled grid is right, call the module's `isAnswer`
   over the board as one `dealtOf` deals it, which the ladder reads too
   (§ "The answer check"). It writes no completion check of its own.

A planning game, one whose player moves pieces toward a finish rather than
filling in an answer, states a position and its moves in place of an answer
and techniques, and:

1. **Plays by its compiled rules**: `executeMove` asks `legal` and `play`,
   `status` asks `finished`, and `hasNoSolution` asks `deadEnd`, of the
   module's `rules` for the board, and a banner outlines the claim's
   `witnesses` (§ "A planning game's position and moves"). It keeps its own
   move type, counters, animation and Solve move.
2. **Checks every dead-end claim sound** with
   `npx vitest run -c research/technique-check/vitest.config.ts dead-end-check`
   (§ "Checking a dead-end claim sound").
3. **Feeds its planner the compiled moves**: the move list, or each move's
   effect by `moveEffect`.

## Sections

| Section | Read it when |
| --- | --- |
| The file | you write a description, or one fails to load |
| The formula syntax | you write or read a technique |
| What a technique compiles to | you read a compiled module, or a statement is slow |
| The runtime a ladder runs on | you solve or hint a described game, or its board is not a Latin square |
| A statement's order is behavior | you restate a technique, or a hint changes after a description edit |
| A conclusion that is false is a contradiction | a technique must refuse a board, or a solver reports a false ambiguity |
| The answer check | you decide whether a board is solved, or write an error overlay |
| A firing's reason is built from its binding | a hint's words need a fact about a firing |
| Checking a technique sound | you state or edit a technique, or the gate reports one unchecked |
| A planning game's position and moves | you describe a planning game, or its moves or finish change |
| Checking a dead-end claim sound | you state or edit a dead-end claim, a move or a finish, or the gate reports a claim unchecked |
| What a candidate inherits | you plan a new game's ladder, or ask what another game's techniques would do under a game's rules |
| What this builds on | you design a new part of the language or the engine, or write about the approach |

## The file

A description is YAML, read by one loader
([`describe/load.ts`](../src/describe/load.ts)) under YAML 1.2's core schema
and validated against
[`description.schema.json`](../src/describe/description.schema.json), which
says every field. `npm run describe`, the help build, the tests and the
research tools all read through it; the app never does.

- **Quote every formula, or write it as a block scalar** (`>-` folds a long
  one onto several lines, joined by spaces). Unquoted, `forall c in cells:
  known(c)` is a map and a leading `{` a flow mapping, and the load fails at
  the field or at YAML's own parse rather than reading as something else.
- **A comment is a `#` line above what it explains.** There is no `note`
  field: the soundness fingerprint reads the statement, never its comment.
- **A game's description states its help first and its rules after**, so a
  reader meets the prose rules beside the formal ones. A rules section is
  whole or absent; the schema says what each part requires.
- **Only a library, a description with techniques and a planning game's
  description compile.**
- **A clue revealed during play is a dealt clue**: a guess's score, an
  opened square's number, a fired laser. The game builds `Dealt` from its
  state on each hint and solve, and nothing declares where a clue came from,
  since nothing would read it: the checker covers every set of clues a board
  could show. Mines rebuilds it after each opening and keeps the marks,
  since an opening only adds a clue.
- **A clue at the board** (`at: board`, Guess's `score`) sits at no element.
  Its value is `fields`, each a function of the clue (`black(k)`) and, where
  the field is one a cell, of the cell (`peg(k, s)`); `means` reads the clue
  as `k`. It compiles to plain arrays in `Dealt`, and the checker deals two,
  each present or not, with any values, so what the game guarantees of them
  is a rule: Boats' fleet names each length once, and without the rule its
  `total` was unsound on two entries of one length. **So is what the game
  guarantees of any clue kind**: Tracks deals exactly two ends, and without
  its `ends` rule `closeLoop` was unsound on a board dealt none, where a
  lone loop is an answer. **A field may be a list** (`list: true`,
  Crossing's listed numbers' `digits`), one a clue and at no element: read
  `f(k)` whole, its length `|f(k)|`, and a member `nth(f(k), i)`, counted
  from 0 and -1 past the end. It compiles to an `Int32Array` a clue, and
  the checker deals each a length up to the longest line and members within
  `value`'s range.
- **A clue that says nothing of the answer itself means `true`**, and the
  answer check reads nothing of it: Signpost's arrows, which its domain and
  its `to` read.
- **A clue per value** (`per: value`, ABCD's number for each letter of a
  line) sits at its element once for each value of the domain, read
  `clue(count, L, d)`, and `per` in its meaning names the value. `Dealt`
  keeps it as one `ClueList`, each clue at `perPlace(x, d)`.
- **A list clue** (`list: true`, Pattern's `runs`) is a list of numbers at
  its element, each within `value`'s range, read `clue(runs, L)` and in its
  meaning as `v`. Lists compare only whole, by `=` and `!=`, and
  `run_lengths(L, S)` makes one: the lengths of the runs of `S`'s cells
  along `L`, in order. `Dealt` keeps the kind as `ListClues`. The checker
  deals one a line, up to as many members as the line has room for runs.
- **The compiler reads a description with every variation applied.** One
  ladder runs on every board the game deals, and a name a board's variations
  leave out is empty there, so a technique over it binds nothing (Solo's
  killer techniques on a board with no cages).
- **A variation's word is read off what it does, never written.** One that
  only `add`s is a modifier, since an added rule only removes answers and
  every sound technique stays sound. One that `replace`s a block is a
  ruleset, checked on its boards and the plain game's. A ruleset may replace
  a clue kind's statement (`replace.clues`): Patches widens Rect's number to
  take the question mark that says nothing of the rectangle. A change to the deal
  alone is a setting and has no variation. A variation is named as the game
  offers it, a ruleset's name or a modifier's words, and
  `src/variations.test.ts` refuses a game whose field declares the other
  word.

## The formula syntax

The expression layer of the investigation's `language.md` § "Expressions",
with an aggregate written as a call so that its reach needs no precedence
rule. The parser is [`describe/expr.ts`](../src/describe/expr.ts). Lowest
precedence first:

| Form | Meaning |
| --- | --- |
| `forall B: P`, `exists B: P` | over every binding of the binders `B` |
| `with place(c, d): P` | `P` read on the marks with `c` holding `d`, nothing propagated |
| `P iff Q`, `P implies Q` | `implies` is right-associative |
| `P or Q`, `P and Q`, `not P` | short-circuiting, so a premise can guard what it reads |
| `a = b`, `!=`, `<`, `<=`, `>`, `>=` | `=` compares numbers, elements, truths and sets |
| `x in S`, `x not in S`, `S subset T` | membership |
| `a + b`, `a - b` | on sets, union and difference |
| `a * b`, `a / b`, `a mod b`, `-a` | `/` truncates; the checker reads it only by a number the board fixes |
| `f(a, ...)` | a library function, a definition, or an answer or mark function |
| `\|S\|`, `{a, b}`, `{x in S where P}` | size, a set, a comprehension |

**Binders** follow `forall`, `exists`, an aggregate and a technique's `for`:
`x in S` (each member) or `x = t` (a name for a term), each optionally
followed by `where P`, which skips a binding. A binder's set may read the
binders before it. A quantifier or aggregate, but not a technique's `for`,
may also bind `fill f of S [from cand]`: each assignment of a value to every
cell of `S`, from its candidates where `from cand` is said, read `f(x)`. A
filling satisfies only what its `where` says, the Latin rule included:
Towers' line says `distinct(f(x) over x in L)`.

**Aggregates**: `count(B)`, `sum(B of t)`, `prod(B of t)`, `min(B of t)`,
`max(B of t)`, `the(B)`, `distinct(t over B)`, `set(t over B)`. Without
`of`, a term is the last binder.

**Names and functions** are the ones [`compile.ts`](../src/describe/compile.ts)
knows, over the space in
[`describe-runtime.ts`](../src/engine/describe-runtime.ts), whose `GridSpace`
says what each set holds and in which order. The compiler refuses a name or
function it does not have, naming it; the interpreter reads more
([`research/describe/README.md`](../research/describe/README.md)). What a
description author acts on:

- **A partition is named in `regions`**, and named as a function gives the
  part holding a cell (`cage(c)`). The one partition listed among the
  `units` is the space's boxes, dealt or not (Solo's `box`). A partition and
  a clue kind may not share a name, since both are fields of `Dealt`.
- **`cell(x, y)` must be on the grid**: the compiled code does not check.
- **A hexagonal board stored sheared needs no geometry of its own**: its
  six neighbors are `adj8` less the diagonal that runs with the shear, and
  the squares outside the hexagon are a clue whose meaning places a value
  of their own (Bricks' `around` and `hole`).
- **`stretch(L, c, S)` is the run of the cells `S` along the line `L` that
  holds `c`**, in the line's order, none where `S` does not hold `c`. A
  line's segments are read by binding a cell of each, since no sort is a set
  of sets: ABCD counts a stretch's most letters as its cells at an even
  place (`index(c, stretch(L, c, O)) mod 2 = 0`).
- **`ray(c, n)` is the cells from `c`'s neighbor `n` on, to the edge**, so
  a number's four arms are `ray(k, a)` over `a in adj4(k)`, and a position
  along one is a number bound by `range` (Range's `seen` and `far`).
- **`step(c, d)` is the cell beside `c` in direction `d`**, numbered as the
  slots are, 1 up, 2 down, 3 left, 4 right, and none off the grid or for
  any other `d`. A value that names a direction is numbered the same, so a
  goal or a square of no direction is a value past 4 (Rome's 5).
- **A value may name a cell**: the answer's `to` is the cell `c`'s value `d`
  names, none where it names none (Rome's `step(c, d)`, Signpost's
  `compass(c, clue(arrow, c), d - 1)`), and `to(c)` reads it on the marks.
  **`chain(c)` is `c` and the cells its value names**, each from the one
  before, ending at a cell whose value names no cell or one already
  reached: Rome's arrows followed from a square, Signpost's links. It is a
  set in reading order, not the walk's, since that is the order the checker
  gives it, so a sentence that names the walk computes it in the game's
  reason (Rome's `arrowPath`). Read on the marks under no supposition,
  `|chain(c)|` and `x in chain(c)` are lookups in the chains the marks keep
  while their values stand (`chainsOf`), every cell's at once; read
  otherwise, the walk is made. A chain counts as a loop for keeping a
  definition (§ "What a technique compiles to"). **`last(c)` is the cell
  `c`'s chain ends at**, whose value names none; none where the chain runs
  into a loop. On the marks it is a lookup too.
- **`compass(c, a, k)` is the cell `k` squares from `c` along compass
  direction `a`**, numbered from 1 up and on clockwise to 8, up and left;
  none off the grid, or for `k` below 1. A position along an arrow is a
  number bound by `range`, as along a `ray`.
- **A set of numbers is a mask of 32 bits**, so it holds none past 31 and
  none below 0: a domain, or a `range` read as a set. A binder over
  `range(a, b)` counts instead, so it binds a position along a line of any
  length. **A domain whose values pass 31 says `wide: true`** (Ascent's
  numbers, up to the board's square count): a cell's candidates are then
  read by `d in cand(c)`, `|cand(c)|`, `first(cand(c))` and a binder, and
  the compiler refuses any other read, any set of numbers but constants
  under 32, and a supposition. A binder over a set stated member by member
  loops its members, so `m in {n - 1, n + 1}` is how a wide description
  names two numbers; `{n}` made as a mask wrapped past 31 unseen before the
  compiler refused it.
- **`connected(S)` says whether the cells `S` are one group**, each reaching
  every other through members side by side, and `cuts(S)` is the members
  without which the rest are not, in `S`'s order. Bind `cuts` once by `=`:
  it is one search of the whole set (Singles' `split`). **`cut_edges(E)` is
  the members of a set of edges whose two cells `E` joins only through
  them**: what `end2(e) not in through(end1(e), E - {e})` asks of one
  member, answered for all in one search. A binder over the members of `E`
  that asks it of each is a walk a member; Tracks' `parity` doubled its
  deals so.
- **A group that runs straight is two stretches**: Boats' boat through `c`
  is `stretch` along its row plus along its column, one of them `{c}`, so
  its boats need no grouping of their own. A boat is counted by its first
  square, the one with no segment above or to its left.
- **The points where squares meet are a sort** where the space says
  `points: true` (Slant's): `points` is every one, border included, in
  reading order, `cells(k)` the squares round a point, and `points(c)` a
  square's four corners. A clue may sit at one (`at: point`). `slash(c, k)`
  is the value of square `c`'s diagonal through its corner `k`, 1 from above
  left to below right and 2 the other way; `linked(k)` is `k` and the points
  the drawn diagonals join it to, in reading order. The runtime keeps the
  groups as the hand-written solver did, joined a placement at a time from
  the marks' log, so `x in linked(k)` costs a lookup, and a `sum`, `count`,
  `forall` or `exists` over `linked(k)` whose term reads the marks only
  round its own point reads a sum kept over the group (§ "What a technique
  compiles to").
- **The centers of squares, edges and points are a sort** where the space
  says `centers: true` (Galaxies' dots): `centers` is every half-grid point
  in reading order, `cells(p)` the one, two or four squares round it, and
  `opp(c, p)` square `c` turned half a turn about `p`, or none off the grid.
  A clue may sit at one (`at: center`).
- **A mark on the cells may name a clue** (`notation: "one of clues(kind)"`,
  Galaxies' arrow): read `arrow(c)`, the clue or none, and made by
  `mark(c, q)`, which is false where `c` names another clue. Its `means`
  says what the square naming clue `v` says of the answer, reading `at` as
  the clue's place; the checker holds every named square to it. A mark is
  a fact that counts as placing, so a definition that reads it is kept
  only while nothing is placed.
- **`through(c, E)` is `c` and the cells reached from it across the edges
  `E`**, each between two squares side by side: Slant's squares marked
  alike with one. Bind `E` once by `=`, since it is a set over every edge.
  The compiled code keeps each group as one shared list, so `x in
  through(c, E)` and `A = B` over two groups compare the lists, wherever
  in the technique they are read, a filling's test of each pair of its
  sides included (Net's `loopFits`), and keeps
  the groups of the last few sets between runs while each is unchanged, so
  a technique binding one set per number (Filling's `room(d)`) still finds
  its groups kept. State `E` inline as `{e in edges where P}` where only
  `c`'s own group is read, and especially under `with`: it compiles to a
  walk from `c` that tests `P` at each edge it meets, where a bound set
  would test every edge of the board at every supposition (Path's
  `piece(c)` and `nearest(c)`).
- **`reaches(c, S, t)` is how many cells of `S` stay reachable from `c`
  with `t` taken out**, `c` not counted: all of `c`'s group in `S` where `t`
  is outside it, none where `t` is `c` or `c` is not in `S`. A region that
  must hold `d` cells grows through `t` where `reaches(c, R, t) < d`
  (Filling's `mustGrow`). Bind `S` once by `=`: one search of `c`'s group
  answers every `t`.
- **`matched(A, B)` says the cells of `A` and of `B` pair off one to one,
  each pair side by side** (Tents' tents and trees), a rule only. A mark
  naming the partner is read in its `means` by `paired(a, b)`, true where
  the rules' pairing joins `a` and `b`, so the checker holds a named square
  to the pairing the answer has, not to any it could have.
- **An answer on the edges** (`value.sort: edge`, Separate's walls) places
  its values on the edges between squares: `value(e)`, `known(e)` and
  `place(e, d)` read an edge, and `CellMarks` holds a mark an edge
  (`held: "edge"`). A hint step names an edge's two squares. A division
  game states its regions as `through(c, O)`, `O` the edges known open,
  since the answer is the walls.
- **A diagonal neighbor is across an edge too where the space says
  `edges: king`** (Spokes' links between hubs): `edges` holds the
  diagonals, `edge(a, b)` names one between squares corner to corner,
  `through` crosses them, and `crossedBy(e)` is the other diagonal of the
  four squares a diagonal crosses, none for an orthogonal edge. The module
  exports `edgeGeometry`, which the game passes to `describedSpace`.
- **A line the deal decides is a run of edges** (Bridges' spans): the
  answer's value on each edge between squares is a count, and a shape rule
  makes a bridge run straight on through a square with no island, so the
  description needs no space of its own. A definition that reads no marks
  names a line's far end and its edges (`far(c, y)`, `run(c, y)`), kept for
  the board. **A read of a line holds edge by edge**: the checker allows
  any consistent marks, which need not agree along a run, so a line's count
  is read from both of its end edges (`has` the most either says is drawn,
  `allows` the least either leaves), and a group shut off is one that no
  bridge known drawn leaves (`closed(G)`). Read off one edge,
  `exactSpace` came out unsound in every world.
- **A board may be any tiling** (`space: { tiling: true }`, Loopy's): the
  cells are its dots, the answer sits on its edges, and `faces` and
  `angles` are sorts, so a clue sits on a face. An angle is two edges side
  by side round a dot: `edges(a)`, `apex(a)`, and `angles(c)` or
  `angles(f)` the angles round a dot or inside a face, in order. The game
  passes its grid to `tilingSpace`; the rectangle's names (rows, `edge(a,
  b)`, directions) are refused. A square grid, wrapping or not, is one
  through `squareTiling` (Net's: a square's two sides meet at a corner
  where they bound one face). **A description that is only ever dealt the
  square grid says `tiling: square`** (Pearl's), and its techniques are
  checked on square tilings alone: a statement true only of squares, as
  that an edge has one edge of its square across from it, would be judged
  unsound on a triangle the game never deals. An edge mark may sit on the angles
  (`marks.<name>.sort: angle`, Loopy's corners: how many of the two are
  lines), read and struck as Slant's edge mark is.
- **Two edges may be known alike or opposite** (a mark with `sort: edge`
  and `notation: alike or opposite`, Loopy's pairs): `pair(e, f)` is `{1}`
  alike, `{2}` opposite and `{1, 2}` unrelated, `related(e)` the edges
  related to `e`, and `relate(e, f, d)` concludes one. The marks keep the
  relation closed (`EdgeRelation`), so a chain of pairs reads as one, and a
  hint that cites one names its links (`Relations.path` in `loopy/solver.ts`,
  whose chain's keys the firing reports in `Reads.relations`).
- **A rectangle on the grid is a sort** (Rect's): `rects(c, n)` is the
  rectangles holding cell `c` of `n` cells, or of any size where `n` is 0,
  narrowest first; `cells(r)`, `width(r)` and `height(r)` read one, and
  `inner(r)` and `rim(r)` are the edges inside it and round it. Drawing a
  rectangle is `place` on both. `x in cells(r)` is a comparison of
  coordinates, never a walk.
- **A mark on the edges that means something of the answer** names it in
  `of` (Slant's `vee`, `of: "meeting(at)"`, where two squares side by side
  meet in a v). It is a set of values per edge, each at first; a technique
  reads it as a function (`vee(e)`), a rule never does, and `strike(e, d)`
  on an edge rules a meaning out. The checker holds each edge's mark to what
  its `of` reads of the answer. A strike on an edge records no step of its
  own: a hint reads it from the firing's facts. **A mark on the cells may
  mean something of an answer on the edges** the same way (Tracks' `track`,
  `of: "2 - drawn(at) / 2"`, 1 track and 2 empty): the runtime keeps its
  candidates per cell (`CellMarks`' `markOn`), and the hint names the cell.
- **`beam(s)` is Black Box's laser fired in from slot `s`**: the slot it
  comes out at, `s` itself where it is reflected, `|slots|` where it is
  absorbed, and none where a cell no value is placed in decides it. A 1 is
  what turns it. `beam(s, c, v)` supposes `c` holds `v`, and `ahead(s)` is
  the first cell that decides it. The engine's `traceBeam` is the physics
  for the game, the compiled code and the checker alike.
- **`sight(s, M)` is the cells seen from slot `s`** through the mirrors a
  cell clue kind `M` deals (Undead's), each mirror turning the line, 1 as
  `\` and 2 as `/`. `sight_direct`
  holds those before the first mirror, `sight_bent` those passed after one,
  `sight_twice` those passed twice after one, and `sight_exit(s, M)` is the
  slot the line leaves by. The engine's `traceSight` is the physics, built
  once a board.
- **A library name is looked up before a description's definitions**, so a
  name added to the library is spelled apart from every one a description
  defines (`on_grid`, since Solo defines `inside`). A definition spelled as
  a library name fails as a sort error, not a clash: Boats' `ends(G, L)`
  compiled as "expected a edge, got set of cell".
- **`strike(c, d)` and `place(c, d)` belong to a technique's conclusion
  only.**
- **A `with` is a Check, a look at one supposed value**
  ([`solver-and-generator.md`](./solver-and-generator.md) § "Check, Tactic,
  Search"): its body's every read of the marks sees `c` holding `d`, and it
  concludes nothing itself, so the rules' own definitions are read under the
  supposition (Sticks' `stick` and `reach`). A technique states what the
  supposed value would break, and concludes the other value. A `with` reads
  no beam, and no rule may hold one.
- **A supposition of many squares is a definition's parameters**: Boats'
  trials suppose the rest of a line one value, so `broken(H, W, T)` reads
  every rule with the squares `H` segments (`x in H or value(x) = 1`) and
  `W` water. Nothing propagates, so what follows at once from the
  supposition is stated in it: the water at a supposed segment's corners,
  and every boat the supposition closes, counted against what the fleet has
  left. A set of edges supposed lines is the same: Spokes' `spareBreaks`
  supposes a hub's other links all lines as `H`, read through `drawn(e, H)`.
- **A size the grid is not measured in** (Salad's `nums`) is read from what
  the board deals.
- **`bits(n)` is the positions of `n`'s one bits, as a set**, so a value
  that is a set of things fits the mask where the number of such sets does:
  Subsets' set is one more than its letters add up to, A as 1 up to D as 8,
  and `bits(d - 1)` its letters, compared with `subset`. The checker reads
  each bit of an unknown number by cases, as the number being one of the
  values up to the board's word with that bit set: read by `div` and `mod`,
  z3 found no answer to a Subsets board in 17 minutes.

**A value that repeats.** A description may declare one value of its domain
that appears more than once in a unit (`answer.value.repeat`, Salad's empty
square), and `times(d)` reads its count, 1 for every other value and in a
game that declares none. The library's techniques read it behind a test
that holds where it is 1 (`times(d) = 1 or ...`), so a Latin square's ladder
reads as it would without it. State a library technique's multiplicity the
same way, or every Latin game pays for a count only Salad needs.

A technique is `for` (its binders), an optional `premise`, and `conclude`.
A technique may say `"on": "place"`: the engine runs it as each value is
placed, with its first binder bound to the placed cell, and not as a rung
(the library's `placed`, over `units_of(c)`; Seismic's `cull`, which reads
its keep-apart rule). It may place as well as strike: Light Up's `shine`
places no bulb in every square a bulb lights, so a lit square and a crossed
one read alike, and a board whose every square is placed is one the answer
check can judge. Its false conclusion is not a contradiction, so a rung
holds the rule it relies on (Light Up's `square`, a bulb lit by another).
`"on": "strike"` is the same as a fact strikes a value from a cell, bound
to that cell, and it only strikes: Magnets' `tile` strikes from a tile's
other end the opposite of each value its first end has lost, so a strike's
consequence is part of the firing that made it, and a hint never shows it
as a step of its own. A placement narrows its cell without running it,
since what a placed value rules out is the placing techniques' to follow.
A mark a player makes that is only a state of the candidates needs no
construct: Magnets' `?`, a tile that is a magnet either way round, is
neutral struck from both ends. A game's may say `until: <tier>`, a tier above its own: the ladder
runs it only at a cap below that tier, for a weaker reading a higher
technique strikes all of, which a grade at a higher cap should not rest on
(Keen's `cageEasy`, as upstream omits it above Easy). `from: <tier>` is the
converse: the ladder runs it only at a cap that high, and a firing grades at
its own tier (Solo's readings of the partial cages its region rule works
out).

**A game's `tiers` are the names its menu shows**, and the only place it
writes them: its difficulty field takes the compiled module's `tiers`
(`searchTiers` or `searchTierItem` where its top tier is the search's),
so a search tier is listed, Unreasonable last, though no technique runs
at it. Name them from the collection's scale by position
([`mechanics.md`](./mechanics.md) § "Difficulty is a declared contract").

**A game that grades on more than one scale names the others**
(`scales: { killer: [...] }`), and a technique's tier is a tier of one of
them; the game caps and grades each ladder entry on its `scale`. A grade is
the same whatever path a solve takes only where a scale's techniques run in
tier order. Solo's killer scale does not (its region rule comes before the
cages' readings, as upstream's did), so there how much one firing does
decides the grade, and a technique is one rung, as everywhere.

## What a technique compiles to

A function over [`describe-runtime.ts`](../src/engine/describe-runtime.ts)'s
marks and grid that enumerates its bindings and hands the first binding
whose conclusion changes the marks to `fire`
([`compile.ts`](../src/describe/compile.ts)'s header says how terms are
represented). A formula that mixes sorts or names what the grid does not
have is refused at compile time.

**A hint and a solve run the same function two ways.** A hint passes
`fire`, is told each firing before any fact is made, and stops at the first,
so its reasons read the marks the firing read. A solve passes `null` and
makes each fact as it concludes it, through every binding. That reaches the
same fixpoint, because a fact concluded on marks a firing has narrowed still
holds. So a hand-written sweep that placed in turn, each placement read by
the next, is two firings on a hint's walk: Magnets' upstream placed a tile
that an earlier tile's pole had just forced in the same sweep, and its
compiled `onlyEnd` leaves that tile to the next firing.

**So a binding fires only on the marks it read.** On the solve path a
binding can read marks an earlier binding of the same run has since changed:
a name bound before a loop, or a set read before a placement in it. Read
beside a fresh read, it would conclude from two moments, and the conclusion
can be false of both. The compiled code prevents this, never the statement.
Before a binding's premise, it reads again what its binders read of the
marks: that its element is still in its set, that a `=` still names what
its term reads, that a `where` still holds (`rereads` in
[`compile.ts`](../src/describe/compile.ts)). A read is made again only where
a loop opened since lets another binding's facts come between, and only
where it reads the marks. A binding whose read fails is passed over with
every binding that read fails for. The run goes on with the next element
of the failing binder, or returns where a `=` bound before every loop
failed. The binding's element stays to visit (`CellMarks.visit`, below). A
technique run on placing, which no fixpoint runs again, runs again on its
cell.

The reads are made again only where a fact has been made since. The marks
count the facts that change each kind of mark (`Marks.made`, its kinds
`MADE`), and the count is taken where the binding first reads that kind.
What a line reads is taken from the members of the marks `b` it names
(`READS` in `compile.ts`). Any other mention of `b`, as when a function of
the runtime is given the marks, reads every kind. A new member of the marks
is added there, or it is read as every kind, which is safe and costs only
reads made again.

Whether a binder's term reads the marks at all is `readsMarks`, from the
functions in `MARK_READS` and the description's own definitions. A function
of the language that hands the marks to the runtime is listed there, or its
read is taken for one of the board and never made again: Blackbox's `ray`
fired on a stale `ahead(s)` until `beam` and `ahead` were listed
(2026-11-10).

**Every binding is checked afresh in the suite.** The compiler emits, after
each binding's reads made again, every read of its binders made afresh with
no count or narrowing (`freshReads`), behind `staleChecking` and
`import.meta.env.DEV`, so a build drops it. The module reads
`import.meta.env.DEV` once, into a constant: Vitest makes each read of it
a lookup, and read in every binding it doubled the suite's solves.
[`stale-reads.test.ts`](../src/engine/stale-reads.test.ts) turns it on and
solves every described game's shared boards. A defect in the reads made
again fails there in every game whose boards make that read fail. A game
whose boards never do cannot fail, since the defect changes nothing it does.

A set named by `=` before the loops, whose groups are kept on the marks, and
which the binding reads only as `through(t, S)` with `t` a term of its
binders, is read again only at those groups (`groupRereads`). A changed group
passes over the bindings of `t`'s value, and a placement elsewhere passes
over none. Filling's `O = alike` changed with nearly every placement, and
read whole it ended each run at its first.

What a binder's place still decides is cost. Any other set read whole at
the top is read whole again at each binding after a fact of its kinds. That
covers a set whose groups are not kept (Slant's `alike`, of the edge marks)
and one passed whole to a definition (Net's `L`). Where it changed, the run
ends. So a name compared across
a loop is bound inside it: Mosaic's `compared` binds the first number's need
after the loop over its partners.

**A solve visits again only the elements a fact reached.** The fixpoint
runs every technique again from the top after each firing, and most find
nothing. Where every mark a binding reads is reached from its first binder's
element through a tiling's geometry, the compiler emits that footprint
([`footprint.ts`](../src/describe/footprint.ts)), and on the solve path the
technique visits only the elements a fact reached since a binding there
found nothing (`CellMarks.visit`): a binding that found nothing finds
nothing again on the same marks, so every firing and every tier stands.
Connectivity is followed where a technique binds a set of edges first, as
`L = {e in edges where …}`, and reads it only by whether squares near its
element share a group of `L` (`x in through(c, L)`): the footprint names
those squares, and the kept groups list the squares a join or a split moved,
so a binding is visited again only where a group it compares changed. Net's
`loopLock` and `loopNote` so skip. Any other read of connectivity (a reach
built step by step, the set read whole), a loop, a set over the whole board
or a supposition makes the technique whole, and it visits every element as
before; so does every technique off a tiling, until the grid's geometry is
followed too. Net's seal and strand techniques stay whole: their reach
spans the board, and their cost is the runs that fire, which a skip would
not cut (2026-11-09). `ladder-skip.test.ts` deals each game that skips both
ways and compares the boards; it failed at one deal when the footprint
dropped the neighbors' group read. A new way to read the marks is added to
the analysis, or it must make the technique whole: a read it lets through
unnamed skips a binding that now fires.

**A search's positions fork the marks**: `CellMarks.fork` copies the marks,
the edge groups they keep (sharing what neither changes) and what each
technique last visited, so a child position starts where its parent's
ladder stopped, not from empty marks. It took the fit techniques' share of
Net's search to under half (2026-11-09).

**What a description costs is measured on the same boards.**
[`deal-profile`](../scripts/checks/deal-profile.test.ts) profiles every
described game's deals and walks at HEAD and says where the work is, which
bounds what the description could cost; it never says what a construct costs
above the code it replaced, since the old code did much of the same work.
[`deal-compare`](../scripts/checks/deal-compare.test.ts) says that: it deals
some games' presets with the same seeds on the working tree and on any commit,
alternating which goes first, times deals and single solves, and fails where
a board's verdicts differ. A change to the compiler or the runtime is timed
with it against the commit before, on the games whose profile names the
construct; each file's header says how to run it.

**Speed is improved as work passes, not in a campaign of its own.** Where a
session finds a described game slow, or meets a statement the compiler makes
costly, it makes the engine or the compiler cheaper for that shape, never the
game's description, and times the change as above. Timing the catalog
against the hand-written ladders it replaced is not done again: it told less
than a profile and the commit before (2026-11-08,
`make-descriptions-zero-cost`).

**The compiler states how each technique grows with the board**, above its
function in the compiled module: the loops round its dearest read over the
board (`n`) or a line (`n^0.5`), and the walks it makes of either
(`techniqueGrowth` in `compile.ts`). A read a kept structure answers is a
lookup. `npm run describe` lists every technique from `n^2.5`, and the
compiler refuses one past `n^3`; the module's comparison in the gate holds
the rest, so a statement that grows steeper shows in its diff. A steep
technique is where a description costs more than a hand-written ladder:
Boats' and Galaxies' were the ones listed when the report came in, and both
games were measured slower.

**What a statement costs** turns on the shapes the compiler recognizes. An
author writing for speed uses these:

- **Bind a set of rows by its indices** (`y(c)`), a set of numbers, rather
  than as rows, a set of elements (the library's `fish`).
- **Read a position from the loop that bound the name**: `index(x, L)` over
  the loop's own `L` is its counter, and a binder `y in before(x, L)` loops
  up to `x`, where `before` read as a set copies.
- **State a filling's conditions so they prune as each cell is assigned**:
  `distinct(...)`, a pin `f(x) = t`, a pairwise `forall x in S, y in
  before(x, S)` over the filling's own set, and a `sum` or `prod` bound,
  each directly or through a definition or `=` name (Towers' `arrangement`,
  Keen's `makes`). The rest of the `where` is read only once a filling is
  whole. A `sum` bound prunes from both sides, so state a count over a
  filling as a sum of its values: Star Battle's `fits` asks for `n` stars as
  `sum(x in S of f(x)) = 2 * |S| - n`, a star being 1 and an empty square 2,
  where a `count` of the stars would be read only once the filling was whole.
- **Ask a per-cell question as an `exists fill` whose only read of the loops
  around it is its pin** `f(x) = t`: it is then enumerated once, not once per
  cell and value.
- **A filling of a line whose only test is its runs is not enumerated**:
  `exists fill f of cells(L) [from cand]` whose `where`, definitions
  expanded, is `run_lengths(L, {x in cells(L) where f(x) = v}) = R` and pins
  compiles to `runFits`, a dynamic program over where each run starts, linear
  in the line times its runs. The pinned form answers every square at once.
  Enumerating was exponential: a line of 30 with seven runs of 1 has 346,104
  fillings. Pattern's `line` is the shape.
- **Pin a `subsets` binder's size first in its `where`** (`|T| = size`): the
  loop then counts only the subsets of that size, in the order it would
  have met them, and a bound (`<=`, `<`, `>=`, `>`) skips the others before
  building them. A set of `n` still allows 2^`n` subsets of every size
  together, so bound `n` too: Mines' `count` reads at most ten numbers
  (`describe-revealed-clues`' `design.md` § "Mines").
- **Make a union over a subset from its members alone**: a `set(t over x in
  T, …)` of numbers, `T` a `subsets` binder, whose rest reads only `x`, names
  bound before `T`, and the marks through `value` and `known`, is kept for
  each member ahead of the loop over the subsets, and made again only once a
  value has been placed since; each subset's is then an OR of its members'.
  Dominosa's `partners` so read cost its `set` a quarter of what it had
  (2026-11-07, `describe-dominoes-rectangles-and-galaxies`).
- **Pin a clue in a binder over the cells**: `x in cells where clue(k, x) = t`
  loops over the cells whose `k` clue is `t` alone, from an index the board's
  clues are read into once (Dominosa's `showing`).
- **Pin a kept definition the same way**: `x in cells where f(x) = t`, `f` a
  definition of one cell kept for the marks, loops over the cells an index
  of every cell's `f` names for `t`, made once a placement (Signpost's
  `held(k)`, whether some square holds number `k`, is a lookup).
- **Pin a value the same way**: `x in cells where value(x) = t` loops over
  the cells an index of the placed values names for `t`, made once a
  placement (`cellsValued`). Crossing's `written(k)` reads only the squares
  holding a number's first digit; scanning the board for each number, it was
  a third of an Unreasonable deal (2026-11-09).
- **Bind the cells whose chain holds one**: `x in cells where t in
  chain(x)`, read on the marks, loops over `t`'s tree in the chains the
  marks keep, not the board. State a value every cell of a chain shares for
  the chain's `last` square, so it is made once a chain: Signpost's `top(e)`
  and `num(c) = top(last(c)) - |chain(c)|`, which took a 12×12 deal from
  8.8 s to 1.1 s, where `num(c)` read every square for each square.
- **Count a range from the end the answer lies at**: a `min` or a `max` over
  `k in range(a, b)` whose term is `k`, or `k` plus or minus what does not
  read it, stops at the first number that passes from that end: a position
  along a long line, or Signpost's nearest number held after a square's
  (`roomAfter`), read a number at a time as the hand-written solver did.
- **Pass over cheaply what a costly read would reject**: a walk over a set is
  read for each binding that reaches it, so a necessary condition read first
  saves the walk. Dominosa's `parity` passes over a spot on a ring of four
  before walking its group, which cut the rung by seven eighths.
- **Bind the thing a firing is about, not each place it shows**: Dominosa's
  `onlySpot` and `mustOverlap` bind each domino and read its spots once,
  rather than reading every spot's domino's spots, a third of the cost.
- **Bind a set a loop reads whole once, outside the loop**, by the statement
  itself: a comprehension or quantifier is never moved out of a loop
  (`set`'s `open`, `hiddenSingle`'s `placed`).
- **A definition of one element or number whose loops nest two deep is
  kept**, its value a set, a number, a truth or an element (Boats' `done(m)`, the
  closed boats of `m` squares counted over the board, kept, took its deals
  to 0.74 of the time on the same boards, 2026-11-07): one
  that reads the marks only through `value` and `known`, and no name of the
  technique, compiles once as a function of the module, and its value for
  each element is kept until a value is placed, shared by every rung. Rect's
  `fits(q)`, read for every other clue inside loops over the clues, is made
  once a clue between placements. A shallower one is kept where it is read
  inside a loop that does not bind its argument, so each pass would make it
  again for the same argument: Mosaic's `need(c)`, read for each clue near
  `c`, so kept took Mosaic's, Path's, Slant's and Clusters' deals to 0.93
  of the time (2026-11-08). Elsewhere it is inlined, so the keeping is paid
  only where the reads repay it. One that
  reads no marks at all is kept for the board, on the clues it deals, so a
  ladder's every run shares it, wherever it has one loop or walks a line or
  the board: Rect's `allowed(q)`, every rectangle a clue could take, is made
  once a deal, and Light Up's `lights(c)` once a square, which took its
  deals to 0.16 of the time on the same boards, Clusters' to 0.68 and
  Dominosa's to 0.86 (2026-11-07). Bridges' `far(c, y)`, the island a ray
  from an island reaches, is an element kept so; inlined, it was a ray
  scanned at every read, and Bridges' deals took 23 times HEAD's
  (2026-11-08). One of several arguments, each an
  element or a number, is kept only for the board (Star Battle's `band(k,
  dir, a)`, 0.95 of its solves): kept for the marks, a pair's values made
  again after each placement made Rect's and Path's deals slower. None is
  kept whose statement compiles to one expression with no loop or walk,
  since the lookup costs more (Rect's `meets(r, s)`, a comparison of
  corners). Each keeps its values in a store of its
  own, which looks at the marks it was last read on first: a lookup by the
  definition's name cost Rect's deals a third of their time. Keeping a value
  past a placement that misses what it read was built and timed, both by
  recording each value's reads and by refiltering a set that can only
  narrow. The recording made Rect's and Star Battle's deals slower, and the
  narrowing gained 5%: a value made again after a placement is a twentieth
  of `fits`' reads (2026-11-07, `keep-definitions-across-placements`).
- **A sum over a group is kept with the group**, as the hand-written solver
  kept a group's exits at its root: added together as two groups join, and
  moved by a point's change as a placement touches it. The compiler does it
  for an aggregate over `linked(k)` whose term reads the marks only through
  `value` and `known` of the squares round its point, and no name of the
  technique (`linkedAggregate` in `compile.ts`); any other term walks the
  group at each read, which made Slant's `deadEnd` quadratic in the board.
  Slant's 30×30 solves took half the time, on the same boards, once it was
  kept (2026-11-07, `make-descriptions-zero-cost`). A structure the runtime
  keeps over the marks catches up from their log, and anything that sets the
  marks wholesale says so with `restore`, which starts the log again. A sum
  whose term reads candidates is walked: a strike is not logged.
- **The groups a set of edges joins are kept on the marks** where the set
  is bound as `{e in edges where P}`, directly or through a definition, and
  `P` reads the marks only through `value` and `known` of the edge, or of
  its two squares, and at most one number bound before it (Filling's
  `room(d)`). A placement rechecks only the edges it could change: an edge
  that joins the set joins two groups, and one that leaves it splits only
  its own group (`keptEdgeGroups`). Filling's deals took 0.86 of the time
  on the same boards, Palisade's 0.94 (2026-11-07). Any other set of edges
  is joined afresh where it is bound. `kept-structures.test.ts` checks every
  kept structure against a fresh one through each game that keeps one.
- **Narrow a costly set by a board-kept one**: Rect's `fits(q)` filters
  `allowed(q)` by the marks, and `near(c)` names the clues whose `allowed`
  reaches a square, so `reachers(c)` reads a handful of clues, not all.
  `near` itself first asks whether the clue's number is enough to reach the
  square, by the steps between them, before it reads any rectangle.
- **A set's size first**: a binder `F = fits(q) where |F| > 1` passes over
  a clue already drawn before anything is read of it, which cut Rect's
  `overlap` by three quarters on 12×14 boards.
- **A truth about a kept group is made once a group**: `forall R =
  through(x, O): P` (or `exists`), `O`'s groups kept and `P` reading `R` but
  no marks and no other bound name, is kept by the group's list beside
  where `O` is bound, and every square of the group reads it
  (`groupQuantifier`). Galaxies' `finished(x, O)`, read for every square
  and for each dot near it, so kept took its deals to 0.71 of the time and
  its solves to 0.41 on the same boards (2026-11-07). The growth the
  compiler states counts the loops inside it once a group; it does not see
  that a loop under a test runs for few bindings, so Galaxies'
  `soleOwner` still reads `n^3`.
- **An edge between a square and a neighbor its loop bound is a table
  read**: `edge(x, y)` with `y` bound over `adj4(x)` reads
  `sp.adj4Edges` at the loop's counter, which took Palisade's deals to 0.83
  of the time and Path's to 0.90 on the same boards (2026-11-07). Any other
  `edge(x, y)` asks `edgeOf`.
- **One rectangle against another is their sides**: `exists x in
  cells(r): x in cells(s)` and its `forall` and `not in` forms compile to a
  comparison of the two rectangles' corners, no list made.
- **Let a cheap technique close what a costly definition would watch for**:
  Rect's `boxed` fires on a fit whose rim is all lines, which a `fits(q)`
  that dropped every rectangle crossing another's closed one would have had
  to find per clue, quadratically (2026-11-07,
  `describe-rectangles-and-galaxies`).
- **An answer check hoists as a rung does**: a set a rule binds is made once
  where it is bound, so `through(c, O)` over a bound `O` is a lookup in its
  groups (Rect's shape rule, a walk per edge otherwise). Spokes' `joined`
  binds its lines as `L` ahead of the pairs of hubs it reads: with the set
  stated inside `through`, the check walked once a pair, three quarters of
  an Easy deal (2026-11-08). A definition kept for the board is read there
  as a rung reads it, since it reads no marks; one kept for the marks is
  inlined. Inlined, Crossing's `head(L, c)` walked the board for every
  square of every line, two thirds of an Unreasonable deal (2026-11-09).
- **A count, sum or truth read again in one binding's premise and
  conclusion is made once**: `bulbs(c)` stated three times in Light Up's
  `square` counts once. The compiler shares one only where the code that
  made it has surely run since the last fact, so a read after a `place`, or
  inside a loop, makes it again (`Shared` in `compile.ts`). Light Up's deals
  took 0.96 of the time, Magnets' solves 0.89 (2026-11-07). A technique's
  binders share theirs the same way, since no fact is made among them:
  Bridges' `cap(c, y)` reads `has(c, y)` three times in one `where`.
- **A definition that reads the candidates, of one or two elements, whose
  loops nest two deep through the definitions it reads, is kept by the rung
  that reads it** until a firing changes the marks, as the rung keeps the
  candidates themselves (`rungKept` in `compile.ts`). It compiles once as a
  function of the module, which the rung passes its candidates to. Bridges'
  `need(c)`, `room(c, y)` and the reads under them are asked for an island
  and each of its lines by every line near it; kept, Bridges' module fell
  from 437 KB to 57 KB and its deals from 4 to 3 times HEAD's. A single
  loop over a few cells is not kept: a lookup costs more, and kept,
  Mosaic's `need(c)` over its 3×3 block took its deals to 1.26 of the time
  (2026-11-08).
- **A board-kept definition of one argument is a table read**: the table is
  fetched once at the top of the technique's function, and the definition
  is called only for an element it has not yet made. That holds inside a
  filling's pairwise test too, where nothing else is moved. Net's `arms(c)`,
  read for every pair in every filling, was a tenth of its deals when it was
  asked through the store at each read (2026-11-09).
- **Set arithmetic stamps its members**: `A + B`, `A - B` and a comprehension
  that may meet a member twice mark the members in one shared array, not a
  `Set` (`union`, `minus`, `addOnce`), once the set is past sixteen members:
  a shorter one is scanned, and stamping Palisade's short ones took its
  deals to 1.13 of the time (2026-11-09). A set bound outside every loop, asked
  `x in S` inside one, is read from a table of its members. One made by `+`
  or `-` of sets already bound is made once where they are. With a set of
  `through(c, O)` over a bound `O`, kept a group of `O` beside where `O` is
  bound, these took Net's `sealLock` from 1.6 s to 1.0 s of ten 9x11
  wrapping deals (2026-11-09).
- **A run of costly names before a cheap binder asks first whether the
  binder has any member**: `G = through(c, L), K = open(c, P, U), e in
  edges(c) where not known(e)`, where the `where` reads none of the names,
  passes over a square with no open side before making `G` or `K`. It took
  Net's `sealNote` and `strandNote` from 0.77 s to 0.06 s of ten deals
  (2026-11-09).
- **A set stated member by member is looped over as its members**, no
  array made, a member equal to one before it passed over: `max(e in
  {edge(c, y), end(c, y)} of …)`, and the `{c}` of a conditional `sum(z in
  {c} where P of t)`.
- **Any other definition is computed at each read**, so bind a set read
  inside a loop once outside it, where it holds for every pass. Boats' `onlyFit` and `onlyRuns` read `top`, the longest
  boat still to close, at every run, and were the two costliest rungs of a
  10×10 Hard deal; bound first as `M = top`, they fell below the trials
  (2026-11-06, `describe-fleets`). A count of closed boats only grows, so
  `top` bound early is never smaller than a fresh read.

The measurements behind these are in the `report.md` of
`openspec/changes/archive/*-compile-the-latin-ladder` (its section on
speed) and of each `*-describe-<game>` change.

## The runtime a ladder runs on

[`engine/ladder-runtime.ts`](../src/engine/ladder-runtime.ts) owns the marks
(`CellMarks`: a value and a candidate mask a cell), makes a firing's facts,
runs the module's `placing` techniques as each value is placed (recording
their strikes as the placement's cull) and its `striking` techniques as a
fact strikes a value (`CellMarks.striking`, set beside `placing`), and runs
the ladder: one technique
an entry, in the module's order, capped per scale. A game's solver extends
`CellMarks` only to keep what no description states, a Search (`LatinSolver`
and Solo's forcing chains and recursion); a game whose solve is its ladder
uses it as it is ([`unruly/solver.ts`](../src/games/unruly/solver.ts)).

- **The space is the module's.** `units` lists the description's units in
  its order, and `describedSpace` builds the grid from them: rows and
  columns are lines whether or not they are units, and the one partition
  among the units gives the space its boxes. Seismic keeps its areas a
  dealt partition outside the units, which the checker can build.
- **A board may be cells alone, its neighbors a relation it deals**
  (`space.cells: <size>` in place of `grid`, and `space.relations:
  { borders: dealt }`, read `borders(c)`): Map's regions. The relation is a
  field of `Dealt`, the grid's geometry is refused, and the game builds the
  space as `describedSpace(units, n, 1)`. A hint that walks such a board
  takes its firings from the rungs' `firings` and keeps its own plan
  ([`hints-candidates.md`](./hints-candidates.md) § "A graph, not a grid
  (Map)").
- **A domain may be a cell's.** Where the answer's domain reads `c`
  (Seismic's `range(1, |cells(area(c))|)`), the module exports `domainOf`,
  `CellMarks.seed` starts each cell from it, and `domain` alone is refused
  in a technique. A wide domain's `domainOf` says whether a cell may hold a
  value, and the game keeps its marks in `WideCellMarks`, which seeds each
  cell by asking it of every value and keeps its candidates in words.
- **A square that holds no line or piece is a value of its own, given by a
  clue** (Sticks' blocks): the clue's meaning places the value, and the
  domain, read off the clue, keeps it out of every other square. A technique
  that concludes the other of two values guards its square with the clue,
  since the checker's marks may leave a block open. Where no rule tells it
  from an empty square, it holds the empty square's value (Bricks' holes,
  Light Up's walls). A technique reads an open square as one with no value
  and no clue (Tents' `blank(c)`, its trees): the checker's marks need not
  have placed the clue's value. Likewise a mark the player makes beside a
  value is read with the value (a link names a tree from a square that
  holds a tent, in Tents' `has(q)`), since the checker's marks may name a
  partner from a square left open.
- **A variation's techniques**, rungs and those run on placing alike, run
  only where the board has it on (`describedLadder`'s `variations`), and the
  ladder places each rung before the first technique of a higher tier on its
  scale (ABCD's diagonal strikes, `placedDiagonal`).
- **A hint walks the same firings.** A candidate game records them into the
  candidate walk (`record`); one without notes walks them with
  `ladderWalk`, which takes the firing that continues from the walk's last
  steps and never one harder than the ladder's own next firing. It is
  `singleFirings`' continuing driver, so the continuity guard measures it as
  it does every other ladder's. State the techniques in tier order: a
  harder one stated first sets the walk's cap at its tier while an easier
  firing waits, and the hint teaches the harder reasoning (Slant's `pair`
  above `loop` did). A game may name rungs whose order is not their tier's
  (`ladderWalk`'s `roles`, `DeductionTechnique`'s meaning): the rungs after
  a `prerequisite` are asked only once it has nothing left, and a
  `fallback` only once every rung before it has nothing. Galaxies marks
  each dot's own squares before any other step, and mirrors a wall only
  when no arrow or line is otherwise forced, the order its hint had before
  it was described. The walk continues from the cells a firing wrote,
  unless `roles.writes` names other keys: Path continues along the numbers
  a step's lines reach, since its edges' cells say nothing of which line a
  player is following. A game whose ladder strikes candidates its player
  cannot mark, and whose steps only place, does not walk the strikes as
  steps: it reads the board afresh through the striking techniques, weakest
  reading first, and takes a placing technique's firing on it, keeping its
  own plan (`readingOf` in [`ascent/solver.ts`](../src/games/ascent/solver.ts)).
- **Seeding runs the techniques run on placing**, so what they decide
  about the player's own marks is never a step. Where the player should see
  it (Boats' water at a segment's corners), the game seeds before it sets
  `placing` and states a rung that decides the same (`near`).
- **A recorded run takes one firing a pass**, the order a hint says them
  in. A caller that asks only which firings a solve made, as Mosaic's Easy
  deal asks which numbers it read, sets `wholePasses` and takes every firing
  of a pass, as the solve path does: one a pass reads the board again for
  each.
- **A recording run offers the premise audit its replay** through
  `ladderReplay`: the game says how to build fresh marks from the values
  placed and its techniques on them, and `runLadder` marks each firing. A
  candidate game that records and offers none fails `firing-replay.test.ts`.

## A statement's order is behavior

Binders are enumerated in the order written, each set in its own order. The
first binding that changes the marks is the firing, and it is the firing a
hint narrates. So two statements of one technique that differ only in order
deal the same boards and grades (the closure does not depend on order) but
can show a player a different step.

The library and Unequal are stated in the order the hand-written engine
scanned, and were compared with it record for record on every Latin game
before it was removed
(`openspec/changes/archive/*-compile-the-latin-ladder/report.md`). Restate a
technique only with that comparison, or as a change the owner accepts.

A rung runs its techniques in turn, each over all of its bindings, so two
readings the scan interleaves (each clue's first reading, then its second,
then the next clue's) are one technique bound by the clue, its conclusion
the first reading where that changes the marks and the second otherwise. A
let binder says which, for the reason: Towers' `bounds` and its `near`.

**A statement never asks again what its own run may have changed.** A
solve makes each fact as it concludes it, and a binding that read a mark a
fact has changed since does not fire (§ "What a technique compiles to"). So
a set read before a placement, `open(k)` or a group `through(c, O)`, is read
as it stands, with no `not known(x)` repeated for a fact the run made. Only
the compiled check guards this, and the other nets miss it. The soundness
check judges one binding on one position, never a run. The generator drops
the boards a stale read misgrades, so its own deals pass. Path's
`pairBreaks` read its three edges as open after it had drawn one, and
called 21 of 260 boards the old solver dealt impossible. `path.test.ts`
grades three of them, and fails where the check is not compiled.

## A conclusion that is false is a contradiction

`strike` and `place` are true, so a conclusion that is false under a binding
proves the marks inconsistent, and the rung returns `-1`. Nothing else
checks consistency: a strike that empties a cell is made, and only a
technique that reads the cell sees it. The library's `single`,
`hiddenSingle`, `set` and `fish` state the engine's checks. A filled grid is
then judged by the answer check, so a technique that misses a contradiction
costs only the search's time, never a wrong answer. That time can decide
which boards load: a search that finds a dead branch only once its grid is
full can need sixteen times the positions. State each way a position dies as
a technique of its own, with a conclusion and no fact (Clusters' `broken`,
Rect's `uncovered`, a square no clue's fit reaches), as `fit`'s `|F| > 0` is
for a clue: Rect's took the positions HEAD's Patches boards need from up to
32,000 to under 2,000 (2026-11-07).

## The answer check

`npm run describe` compiles the rules too: the module's `isAnswer(g, sp,
cl)` says whether a whole grid is an answer to the board `cl` deals. Every
cell holds a value of its domain, and the shape, the rules and each dealt
clue's meaning hold of it. The compiler's `answerCheck` says how each part
compiles; what a game acts on:

- **The grid is the game's own**, a value a cell and 0 where none is: the
  check reads only `value` and `known`, never the marks, so `cand` in a rule
  is refused. A game that keeps a value outside its grid gives the check the
  grid its description reads (Salad's empty square, `answerOf`).
- **A rule a variation adds holds only where the board has it on**: the
  check then takes `variations`, as `describedLadder` does (Unruly's unique
  rows). A clue kind or partition a variation adds is dealt empty where it
  is off, and needs nothing.
- **A grid measured in other sizes** (Solo's `c * r`) reads that term as the
  grid's width, so the check needs no size the space already gives.
- **An error overlay stays the game's own code.** It judges a board still
  being filled, which no rule of the answer says, and what it marks (a
  run of three, a row's count) is presentation. It never decides that a
  board is solved.

Its comparison with the checks it replaced is in the `report.md` of
`openspec/changes/archive/*-check-the-answer-from-the-rules`.

## A firing's reason is built from its binding

**A technique that `says` needs no reason callback.** Its `says` block names
the `terms` its step's sentence reads and the `marks` (`outline`, `stripes`,
`strike`, `strand`) it shows, each a formula over the binding; the compiler reads them
at the firing, on the marks before its facts are made and under the
technique's own `with`, and only where a hint asks (a solve passes no `fire`).
`compiledRung(run, clues)` then records `{ binding, says }` for each fact, and
`describedHint` (`engine/described-hint.ts`, a step a fact) or
`describedFiringHint` (`engine/described-firing-hint.ts`, a step a firing)
builds the steps from it: the firing's facts are the ringed targets, evidence
is the outline less them and less the `strand`, drawn apart. **What the walk
reads is the outline, the strand, the facts and a `reads` set where a
technique says one**: a line it only hatches is not read, a line it fills whole
is, so the second says `reads: "cells(L)"` (Unruly's fills) and the first
nothing (Singles' pair). A step's kind is the technique's id, and the module's
`SaysById` types each technique's terms for its sentence. What a technique says
is read once a firing and only on a hint's path, so it is no part of the
technique's reported growth. Exemplars:
`unruly/unruly.description.yaml`, `singles/singles.description.yaml`.

**A technique that reads differently by what holds says `arms`**: an ordered
map from a name to a `when` condition over the binding, each arm adding its
own `terms` and `marks` to the shared ones, the first true arm winning (an
arm that holds none throws). The kind is `<id>.<arm>` and `SAYS_KINDS` in the
compiled module lists them, which a game hands to `Game.hintRungs`; the
terms are a union keyed by `arm`, so a sentence narrows on `spoken.arm`.
Arms are conditions on the binding and not parts of the conclusion: Singles'
corner reads as four, apex, across or a pair by which of its numbers match.
A mark that depends on the facts (Singles' hatch, the one line holding every
cell it covers) is a set expression over the cells' own state, as `sameLine`'s.

**A technique whose squares are each their own argument says `shown: each`**:
`describedFiringHint` then makes a step for every square the firing decides,
the evidence of each being the outline less that square alone (Light Up's two
discount sets, which rule out a square for a reason that is its own). The
compiled module's `SAYS_EACH` lists them. **`shown: legs`** is `each` where the
squares are one insight (a number that rules out several squares by one rule,
Sticks'): the later squares' steps continue the first (`continuesPrevious`), and
`spoken.later` says so, for a sentence that drops what the first has taught
(`SAYS_LEGS`). The engine takes a step's own square out of its outline, so a
sentence whose evidence holds that square adds `spoken.targets` back. **Where each square has evidence of
its own** (Bricks' `three`: the run its shading would make), the technique says
`fact`, a `terms` and `marks` read at each `place` or `strike` of the
conclusion, in the conclusion's scope, so a `forall` binder is live and a `with`
may be written (`outline: "with place(c, 1): run(c)"`). The module types it as
`<Id>SaysFact`, held in `says.facts` in step with the firing's facts, and a
sentence reads `spoken.facts` (each square of its step, with its own terms) and
`spoken.outline`, which holds the firing's marks and those of the step's
squares. The walk reads the facts' marks too. Only a cell game's `place` and
`strike` read one; a fact made elsewhere throws. **A game whose placing techniques
decide what the board already shows** (a bulb lights its lines, and a player
crosses none) passes `consequences: false`, so a step asks only for its
firing's squares. `describedFiringHint` also owns `refreshHintStep` (a step the
player has partly made, shown for what is left).

**A step that is a journey** (Boats: one firing, a fill a leg, each judged by
the squares it makes) gives `describedFiringHint` a `journey`; the squares its
placing techniques decide on their own are read off the marks across the firing
and shown and made with it, and `tiers` and `plan` start a walk at the board's
own tier and cap its length. **A game whose answer is on the edges** (Bridges: the facts strike values from
an edge, and a step's move is the bridges, crosses and limits a line ended up
with) gives `describedEdgeHint` (`engine/described-edge-hint.ts`) the walk,
`writes` (the elements a player's attention follows: Bridges' islands) and a
`step` that makes the move and the highlights from the marks as the firing found
them and left them. Its `says` marks are cells (the islands outlined and the
island read, `reads`), and what is an edge or a line (a group's bridges) is a
term, which the game reads off its geometry. **What a step shows is said
too**: the squares it reasons from are its `outline` (the walk reads them),
the sides a set-of-edges term (Tracks' `shut`, `set(edge(c, y) over y in
adj4(c) where shut(c, y))`), and the game only places them. A side on the
board's rim is no edge, so that is the game's geometry. Magnets is the
exception: a count step's sentence reads each square's reason (`whyNot`)
again on the board each of its legs leaves, and a term is read once, at the
firing. **The squares a premise reads
are `reads`, never a hook**, however far they lie from the binding (Pearl's
square past the next, `set(other(x, j) over x in edges(j) where ...)`, and the
piece of line a way would close, `through(...)`). Write a predicate only
`reads` needs inline: a `define` added is part of every technique's
statement, so each loses its soundness verdict, and `says` is not. **A
change to what a firing reads is compared by
[`research/hint-walk-dump/`](../research/hint-walk-dump/dump.test.ts)**, run
here and in a worktree of `HEAD`, each step's marks listed with its words: the hint-walk fingerprint's few boards miss
a rare rung, and a wrong `reads` set on Pearl's `earlyThrough` passed every
test while the dump moved 1,349 lines. The game's own `hintKeepTrack`
stays: a bridge is drawn a drag at a time, which no fact is.

**A technique whose words need what held says `witness: true`**: the
compiler then reads, on the same marks as the terms and only on a hint's
path, what held in its `for` clauses' `where`s and its `premise`, and the
firing's `says.witness` carries it (`Witness`, `engine/describe-runtime.ts`).
It is a tree over the formula: the side of an `or` that held (`arm`, the left
tried first), the first member an `exists` held for (`member`: the binders'
values), the cell and value a `with` supposed and what held under it
(`supposing`), each definition read (`def`, by name: `witnessOfDef` finds
one) and the parts of an `and` (`all`). A `not`, a `forall` and an aggregate
have none: a `forall` has no one member. Nothing in the conclusion is
witnessed yet. It is a second read of the formula, so a part is compiled twice
and a technique that says it costs about half again its module's size
(Path's `lineBreaks`, 2026-11-13); only the hint path runs it, and the solve
path's code is the same as without it (`compile.test.ts`, "a witness is
written for a hint only"). Exemplar: Path's `lineBreaks`
(`path-witness.test.ts`).

**A technique whose firing must say what it rests on says `reads: true`**: in
the same hint-only block, the `for` clauses' `where`s and `premise`, and what
each binder is drawn from or defined as (`n = |{...}|`, `a in open(k)`), are
compiled a further time, in place (nothing hoisted out of its loop, or the read
would run before `_rc` is declared), with every read of a mark (`known`, `value`, `cand`,
`in cand`, an edge's mark) recording its element, and the firing's
`says.reads` (`Reads`, `engine/describe-runtime.ts`) lists the answer elements
(`cells`) and edge-mark elements (`edges`) read on the path the formula took,
each once, first read first. A read under a `with` of the supposed element is
not a read of the board and is not recorded. Cost (Path's `lineBreaks`,
2026-11-13): no measurable time on a firing (9–12 ms for 44 firings either
way), about 980 lines of compiled module, so opt in only where the engine
consumes it. **A set built over the whole board reads all of it**: Slant's
`alike` (`{e in edges where vee(e) = {3}}`), bound by `pair`, `share` and
`same`, reads every edge, so every firing after it rests on every earlier edge
strike. A technique whose firing should rest on a few marks reads those
(`through(c, alike)` in place of a bound `A`), or the graph over-cites.
Exemplar: `path-witness.test.ts`.

**What a fact rests on is the engine's, derived from the reads**: `ladderWalk`
keeps a `FactGraph` (`engine/fact-graph.ts`, `walk.graph`) of every fact the
walk made, with its firing, and a fact's parents are the earlier facts about
any element its firing read. `restsOn(id)` answers from any fact: what it
rests on transitively, the elements read that no fact made (the board's own
marks), and `complete: false` where a firing in the chain did not say `reads`.
A game writes no parent list. Relation facts have no readable element yet.
`placeNotes` (same module) places the notes among a walk's steps from the
graph, so no game keeps its own "where does this mark go" pass.

**The witness is read where the sentence is built, by the name of what it
holds**, not written into a term: `witnessOfDef(w, "shortNear")` finds the
definition's node (null where that part of the formula did not hold, so its
absence says which arm held), `witnessNodes(w)` lists every node, outermost
first, and a `member` node's record is keyed by the binders' own names. A
game's reason callback that re-read the board to find what broke reads this
instead (Path's `brokeOf`, `solver.ts`, moved `lineBreaks` and `pairBreaks`
off `clashOf`: the hint-walk fingerprint, `hint-walk-fingerprint.test.ts`, is
unchanged, and fails when `brokeOf` names another member or arm). Count and geometry stay the
game's: the witness names the square, the board says how many ways it has.

A rule that only a run of the validator can name
(Boats' three trials) stays a reason callback, which receives what the
technique says and returns it with the rule added: the description cannot
state it.

`compiledRung(run, clues, reason)` pairs a compiled technique with the
function that turns its binding and one fact into the reason the record
carries, read off the marks before any of the firing's facts is made. A set
in the binding is the reason's own copy, so a reason may keep it: a hint's
plan holds reasons while the technique binds again into the buffer it was
built in (Tents' `treesDone` read as no squares at all before it was). A
reason is not the bare binding where its words quote the board: a sign's
reason quotes the other end's least candidate as it stood when the step
fired. A reason names the unit it reads where that is not a row or a
column (Solo's blocks and diagonals), so the engine's Latin sentences
(`engine/hint-text.ts`) speak it in every game.

## Checking a technique sound

[`research/technique-check/describe-check.ts`](../research/technique-check/describe-check.ts)
reads a description's own formulas on small boards (`CHECKED_ORDERS` in
`src/describe/soundness.ts`) as z3 constraints, with every clue the board
could be dealt present or not, so one check covers every layout. A technique
is sound when no binding's premise holds while its conclusion fails under
the rules.

**A technique is checked from the least order up to the first where each of
its planted defects comes out unsound**, and no further: the check is worth
its cost on the least board shown to catch a defect, and a larger one costs
many times more. Of 110 plants across the games checked to 2026-11-07, 87
came out unsound at order 3 in seconds; the rest had no board of order 3
to run on (Unruly's, Star Battle's) or were not tried there (a set of two),
so no plant tried at order 3 needed order 4, while Filling's `mustGrow`
took 8 hours there. A plant still sound at the last order fails
the check. What a small board cannot cover:

- **A dealt partition is checked only up to the region size `REGION_CELLS`
  gives each order**, or one more in a world no board of those regions has
  an answer in (Tectonic's, `regionCells`), so a technique that reads a
  larger region is not checked on it.
- **A board of cells alone has the square of the order in cells**, and a
  relation it deals is every relation on them, each pair in it or not, a
  cell with itself too: the description states no symmetry, so none is
  assumed, and a technique sound on every relation is sound on a map's.
- **A grid of fixed size is checked as itself at every order**: Subsets'
  4×4 is checked whole, its sixteen sets at once. Its encoding is timed on
  that board first, since z3's first query there, whether any board has an
  answer, has no deadline.
- **A tiling is checked on the boards `TILINGS` names at each order**, which
  between them hold dots and faces of each size a technique tells apart (a
  plant on a dot of four edges is caught only where there is one), and on
  their square ones alone where the tiling is `square`. A mark on
  its angles is read as an edge's mark is, and a relation over the edges as
  two unknowns a pair, alike and opposite, true of the answer and closed as
  the runtime's classes are.
- **Boxes a board deals are not built**, so Solo's Jigsaw world is named in
  the results as unchecked.
- **A world or a kind a small board cannot hold is checked on nothing**,
  whatever the verdict, and the results say so (`--` lines). Such a reading
  (Mathrax's quotient, Star Battle at two and three stars) rests on the
  answer check and the comparison with the code it replaced.
- **A filling of a set the marks decide is enumerated over every cell that
  may be in it**, so its cost doubles with each: Star Battle's `fill` of a
  region's open squares takes minutes. A `forall` or `exists` over a fill
  of more than `LISTED_FILLS` assignments is a z3 quantifier instead, one
  integer a member held to its candidates: Undead's sightline fills nine
  squares four ways, 262,144 assignments a binding, which listed ran the
  heap out. Each value of a technique's first
  binder is one query, built as it runs. **A technique whose recorded
  verdict is current is not checked again**, and each verdict is recorded
  as it is proved, so a run cut short keeps what it finished;
  `CHECK_AGAIN=1` checks every one regardless. `CHECK_TECHNIQUES` narrows a
  run to some techniques, by id, checks them whatever is recorded, and keeps
  the others' verdicts, so one game's techniques can be checked side by
  side. **A query that outgrows z3's
  2 GB heap aborts and leaves the run hung**, not failed: watch its output
  for `OOM`. `CHECK_SPLIT` fixes more of the first binders a query (Mines'
  `region` and `regions` at 3, `count` at 5; Bridges at 3), more and
  smaller queries. A plant is asked as one query, and once a board of an
  order has caught it, not on that order's other boards.
  A run's heap only grows, a reset solver and a forced collection between
  queries notwithstanding, so a check of thousands of queries still
  outgrows it: `CHECK_SHARD=i/n` takes every nth query from the ith, n
  processes side by side (Mines' `count` at 4), each recorded under a key
  of its own as it passes and the n folded into the verdict; a shard
  already recorded is not run again. A run with `CHECK_LOG=<file>` logs its
  progress to that file every 50 queries, naming the query it starts, so a stuck one
  can be found. `CHECK_MODEL=1` prints the board an unsound verdict was
  found on (answer, known marks, clues, sizes): run it through the compiled
  technique before believing either side. **A count of squares is bit-blasted**: a sum of terms each
  0 or 1 sends z3's default search splitting square by square (Mines'
  mine total read alone ran past an hour on a 4×4 board), so a query the
  default does not settle in `CHECK_QUICK_MS` (a minute) goes to a SAT
  solver by `pb2bv`, which settled that one in seconds, and back to the
  default, unlimited, where it cannot encode the query. Native z3 on a
  query dumped with `solver.toString()` is the quick way to try a tactic.
- **A count the rules imply only through a sum is a rule of its own.**
  Boats' fleet covers `total` squares because each length's boats are
  counted by their first squares; z3 ran past 25 minutes on `total` at
  order 4 deriving it, and 210 s with the count stated as a rule. A rule
  every answer meets already changes no answer.
- **A set of numbers holds only the board's values**, `0` to `top`; a
  member past it would be dropped unseen, and the technique judged on a
  reading that is not its own. A member made of numerals, counts, `index`
  and arithmetic is bounded by its form, and the check refuses a set whose
  member can pass `top` (a pair of a square's four edges coded `4 *
  index(i, U) + index(j, U)` reaches 11, on a 3×3 board whose `top` is 3).
  State such a set over cells: Path's `weighed` holds each pair's edges in
  two sets of cells. A member that reads an answer or a clue is not bounded.
  `top` is the order, or past it where the domain ends past it, at a number,
  at sizes the board fixes (Bridges' `range(1, maxb + 1)`) or at a region's
  size (Seismic's, up to the region cells the board deals). **A binder
  over `range(a, b)` counts** its numbers, as the runtime's does, so a
  position along the round of Undead's slots is bound past `top`; an end
  that reads the answer or a clue is held to `top`.
- **A size larger than the board's cells is one unknown**, from its least
  to the cell count (Mines' `mines`, `openSizes`), not a world a value.
- **A set the marks decide keeps its order**: `stretch` holds each cell of
  its line under the guard that every cell between it and `c` is in `S`, and
  `index(x, S)` counts the members before `x` under theirs.
- **A clue per value** is dealt at every element for every value some
  cell's domain holds, each present or not.
- **A list clue is a length and members**, each member read only below the
  length, and `run_lengths(L, S)` is each way `S` may meet `L`'s cells
  under its guard: 2^|`L`| ways, few on a line of a small board.
- **`connected(S)` is read as reach**: the first member reaches a member
  beside one it reaches, as many steps as the board has cells, and every
  member must be reached; `cuts(S)` holds each member under the guard that
  the rest are not connected, and `cut_edges(E)` each member under the
  guard that its second cell is not reached from its first across the
  others. Neither needs an unknown of its own.
  `reaches(c, S, t)` is the same reach from `c` over the members other
  than `t`, counted. `matched(A, B)` is a witness pairing, an unknown
  for each pair side by side, each member of `A` and of `B` in exactly
  one, and `paired` reads it. `chain(c)` is
  read the same way, a cell reached where a member holds the value naming
  it by the answer's `to`, and `last(c)` as the member reached whose value
  names none.
- **A domain stated as the values of a range that pass a test** (`{d in
  range(1, 5) where ...}`, Rome's) is checked up to the range's end, as
  `range(1, 5)` is, past the order.
- **A `with` is read as its supposition**: each read of the marks in it
  sees the supposed cell holding the value, under the guard that it is that
  cell. Ignoring it would make every `with` premise false and every
  technique vacuously sound, so Sticks' `overConnected` plant supposes the
  wrong value, which comes out unsound only where the supposition is read.
- **`beam` is read by walking `traceBeam` itself**, asked again with each
  cell it stops at settled each way, so the check reads the game's physics,
  under the guard of what each cell on the path holds.
- **`sight` is read a step at a time** (`sightlineGuards`), each way the line
  can stand on a cell, heading a direction, bent or not, kept once under the
  guard of the mirrors that bring it there, by the engine's `sightEntry`,
  `sightAhead` and `sightTurn`. Walking every mirror layout whole, as
  `beam` is, made 298,240 ways at order 4 and ran z3 out of memory.
  `sightline.test.ts` holds the two readings equal on every layout of two
  small boards.
- **`linked(k)` and `through(c, E)` are read as reach**, as `connected` is:
  over the points, each step along a diagonal its square holds, and over
  the cells, each step across an edge in `E`. A mark on the edges is a
  candidate a value an edge, each held to its `of` read of the answer, so
  `strike(e, d)` is the fact that the answer's `of` is not `d`. A technique
  that binds a set over the whole board first (Slant's `same`, over its
  alike pairs) is one query at order 4 for that binding; `CHECK_SPLIT=2`
  fixes the next binder too.

A description with variations is checked in each world it deals, on the
plain board and each ruleset's, and a technique must be sound in every one
that has it: a modifier's own technique (Unruly's `unique`) is checked where
the modifier is on.
Library techniques are checked on a plain Latin square, the weakest rule set
any Latin game adds to, and on one with a repeated value.

**Each technique has a planted defect beside it in
`describe-check.test.ts` that must come out unsound**, and each library
technique that reads a multiplicity a second, the technique reading it as
one, which must come out unsound where a value repeats. A plant is keyed by
technique id, or `<game>.<id>` where two games state one id. A plant that only
makes a technique strike less, or drops a condition consistent marks already
give, is not a defect, and the checker rightly calls it sound.

The verdict is recorded under a fingerprint of the statement, the rules it
was checked against and the orders (`src/describe/soundness.ts`), so editing
either makes it unchecked until the check runs again. The fingerprint reads
the description, not the code that gives a statement its meaning: a change
to a library term's runtime (`traceBeam`), the compiler or the checker
leaves recorded verdicts standing, so such a change runs the check again on
the games that read it, with `CHECK_AGAIN=1`.

**A technique gets `CHECK_BUDGET_MS` (ten minutes), its plants included, and
no more.** A whole proof can run for hours on one technique (Dominosa's
`parity` passed 70 minutes unfinished), and a proof unfinished says nothing a
bounded search does not. So the proof over every board runs to `WHOLE` of
the budget; if it has not finished, the same question is asked of boards z3
samples (`sampleAnswers`), each answer and its clues fixed and every
position of the marks on it, a batch at a time with fresh boards drawn,
until `SAMPLED` of the budget. A technique on which no defect turned up is
recorded as holding: `heldVerdict`, its fingerprint marked `held`, which the
gate takes as checked. **The clues are dealt as constants on a sampled
board**, so a set the clues decide is built of its members alone: Dominosa's
subsets of the squares showing a number were 2^30 unknowns at order 4, and
the query ran the JavaScript heap out while being built. A query that holds
most of the heap stops as one past its deadline does. A plant gets a tenth
of the budget for its whole proof, then sampled boards to the deadline, and
**a plant not caught within the budget fails the run**: a check that cannot
catch the planted defect in the time cannot vouch for the technique either.
A held verdict is evidence, not proof; a technique whose held verdict a
wrong hint later contradicts is the first place to look. **The check is a
net, not a proof program**: the hand-written solvers and upstream's C played
correctly with no such check, so a session does not widen what a held
verdict samples, or spend past the budget, for rigor's sake (the owner,
2026-11-07). A defect a player meets is the reason to look further.

## A planning game's position and moves

A planning game's description has `position` in place of `answer`: its
layers, each a value a cell, read in a formula as a function of a cell
(`value(c)`, Twiddle's `turn(c)`). `moves` states each move by its binders
(`for`, plain numbers and elements, which are the compiled move's fields),
an optional guard (`when`) and what it sets; `finish`, `lose` and
`deadEnds` are formulas over the position.
[`compile-position.ts`](../src/describe/compile-position.ts) compiles them,
and the module's `rules(sp, cl, variations)` is the engine's
`PositionRules`. Exemplars: [`sixteen`](../src/games/sixteen/sixteen.description.yaml)
(a permutation), [`fifteen`](../src/games/fifteen/fifteen.description.yaml)
(a guarded move), [`twiddle`](../src/games/twiddle/twiddle.description.yaml)
(a layer a variation adds), [`pegs`](../src/games/pegs/pegs.description.yaml)
(a jump, a least fixed point), [`flip`](../src/games/flip/flip.description.yaml)
(a dealt relation), [`inertia`](../src/games/inertia/inertia.description.yaml)
(a run until stopped, a token, a lose state),
[`sokoban`](../src/games/sokoban/sokoban.description.yaml) (a walk as a
reach, `on`, a carried layer), [`slide`](../src/games/slide/slide.description.yaml)
(a block shifted whole), [`cube`](../src/games/cube/cube.description.yaml)
(a board of cells alone, faces, dealt tables),
[`samegame`](../src/games/samegame/samegame.description.yaml) (a component,
a view), [`flood`](../src/games/flood/flood.description.yaml) (a board layer,
an open domain the checker windows),
[`netslide`](../src/games/netslide/netslide.description.yaml) (barriers as a
dealt table), [`numgame`](../src/games/numgame/numgame.description.yaml) and
[`untangle`](../src/games/untangle/untangle.description.yaml) (open domains,
moves never listed).

- **An assignment's last binder is the cell it sets**, and each of its
  terms reads the position before the move: a move's assignments are
  simultaneous, so a slide reads the line as it was.
- **A binder that reads the position is a guard too.** Fifteen binds its gap
  as `g in cells where value(g) = 0`; a move is legal where every binder
  holds of its binding and the guard holds.
- **`freedom.kind: permute` is a claim the dead-end checker checks**: every
  move legal on every position, and moving the pieces the same way on each.
  Only such a move has an `Effect` (`moveEffect`) for a planner.
- **A variation adds layers, assignments, finish formulas and claims, or
  replaces layers.** What it adds runs only where it is on, and a layer it
  adds is all zeros on a board without it, so a game keeps the layer in its
  state whatever its board.
- **The domain, `arranged` and `once` are read by the checker only**: they
  say which positions a board can hold. `once: v` is a token, one cell
  holding `v` (Inertia's ball). `on: P` says where a layer's value may be
  other than 0 (Sokoban's barrel stands on floor). A desc parser keeps its
  own errors.
- **A `carried` layer is one no rule reads** but its own assignment, which
  moves it with what it labels (Sokoban's barrel letters). The compiler
  refuses any other read, so the checker holds it at 0 and a claim cannot
  rest on it.
- **What never changes is a layer too**: Pegs' holes and Inertia's walls are
  values no move assigns. `play` shares such a layer rather than copying it,
  and the checker's universe holds every board as well as every position on
  it.
- **A relation the board deals** (`space.relations: { flips: dealt }`, Flip's
  patterns) is a set of cells for each cell, read `flips(c)`, and a field of
  `Dealt`.
- **A board that is not a rectangle is its cells** (`space.cells: <size>`),
  and the compiler refuses the grid's geometry on it. What a cell neighbors
  is a table the board deals (`space.tables`, a function of cells, faces and
  numbers to a cell or a face, read `dest(s, r)`; `-1` where there is none),
  built by the game's own code once a board. `space.faces: <size>` is a
  second sort, which a layer `over: faces` is a value of (Cube's paint); an
  element of one sort where the other is read is refused.
- **A definition that reads itself is its least fixed point**: the least set
  of cells its last parameter makes it true of, computed once at the top of
  the function that reads it (Pegs' `arrive`, Inertia's `rests`), or, with
  earlier parameters, once for each value of them as it is first read (Same
  Game's group, `joined(s, c)`). Every self read passes the earlier
  parameters through unchanged. The compiler refuses a self read under
  `not`, on either side of `iff` or `=`, on the left of `implies`, in a
  `forall`'s `where`, inside an aggregate, or through another definition.
  Only a planning game's rules may state one.
- **A layer `over: board` is one value** (Flood's count of fills), read by
  its name alone and set by an assignment with no `for`.
- **A layer of `domain: integers` holds any safe integer** (Numgame's
  numbers, Untangle's points), in a `Float64Array`. A term that reads one is
  exact: a double while it is a safe integer and a `bigint` past that, so
  `===` and `<` compare as they are; a value past a safe integer assigned to
  the layer throws. A move binder `x in integers`, last of its binders, is
  checked and played but never listed by `moves`.
- **`views: [name]`** compiles definitions the game reads beside the rules
  into the module's `views()`, each giving the cells it holds of for values
  of its other parameters (Same Game's group, Netslide's powered tiles).
- **A claim whose last conjunct is `exists x in S: P` names its cells**:
  `witnesses(id, p)` gives every `x` the rest holds of, which the banner
  outlines. State a claim that way when a player should see where it holds.
- **A lost position has no moves**: `moves` is empty and `legal` false on
  one, so the game is undone, not played on.
- **A move's geometry**: `on_grid(x, y)` (`cell(x, y)` is unchecked);
  `ray(c, n)`, the cells from `c`'s neighbor `n` on, in that direction, to
  the edge, so a run until stopped is the first square of a ray where it
  halts; `adj8(c)`, clockwise from up.
- **A layer is an `Int32Array`.** A game whose state keeps a layer in
  another array copies it on each call, so it keeps the layer as the
  description's.
- **A planner may keep its own fast move** where the compiled one is too
  slow, with the measurement and a test holding it to the compiled one:
  `slide-planner`'s in-place slide is 1.6× the compiled slide's speed on a
  4×4 board and 4.4× on a 5×5 (2026-11-01), and its pruning is built on a
  slide's line (`sixteen.test.ts`, "slides in the planner as the description
  says"). Pegs' searches keep a packed jump table: a proof of loss fed the
  compiled jumps took 2.6× as long (2026-11-01; `pegs.test.ts`, "Pegs'
  searches"). Sokoban's, Slide's and Cube's solvers keep theirs, at 5× to
  58×, 20× and 15× to 40× the compiled move's speed (2026-11-01; held by
  `sokoban-solver.test.ts` "the search's board", `slide.test.ts` "moves as
  the description's shifts do", `cube.test.ts` "the planner's roll"). A copy
  a hint narrates from, as Inertia's slide path, is held to the compiled
  move the same way. Flood's solver fill (5× to 8×), Same Game's groups and
  removal (18× to 42×) and Untangle's `findCrossings` (10× to 13× its
  `crossed` view) are kept so (2026-11-01; `flood-solver.test.ts`,
  `samegame.test.ts` "Same Game's search reads its board as the
  description's rules do", `untangle.test.ts` "crosses as the description
  says"). Numgame's search combines subsets of values, which no move list
  feeds, and its arithmetic is held to the moves (`numgame.test.ts`,
  "combines as the solver's search does").

Its comparison with the code it replaced is in the `report.md` of
`openspec/changes/archive/*-describe-moves-and-finishes`,
`*-describe-guarded-moves`, `*-describe-pushes-blocks-and-solids` and
`*-describe-components-and-open-domains`.

## Checking a dead-end claim sound

A dead-end claim is consumed as `Game.hasNoSolution`: the dead-end banner
and the hint's refusal rest on it, and a generator that deals only boards
that can finish rests on it being complete as well. So each is checked by
[`research/technique-check/dead-end-check.ts`](../research/technique-check/dead-end-check.ts),
by search, on every small board: every size in the description's ranges
whose positions number at most `CHECKED_POSITIONS`
(`src/describe/soundness.ts`), with each set of its variations on.

- **The universe is every position the layers allow**: an arranged layer's
  arrangements, a token's cells, times every filling of the others, less
  each cell whose values break a layer's `on`; a carried layer is held at 0.
  A move whose result leaves it fails the check, as does a `permute` claim
  found false. A layer of five values reaches 2×3 boards and no further
  under the cap (Inertia's), so a claim over many kinds of square is checked
  small.
- **A description that reads what the board deals is checked on boards the
  game deals**: `research/technique-check/boards/<game>.ts` lists them, each
  with its `Dealt`, built by the game's own code (Cube's small arenas). The
  checker refuses such a description without the file.
- **An open layer is searched over its window** (`checked`, a set of
  values; Flood's count, to one fill past the limit). A move out of the
  window ends that line, and the results count the positions with one, so
  a claim is refuted only by a line inside the window. The checker refuses
  a claim over an open layer with no window as beyond it.
- **A game that states no claim is passed by**, Numgame and Untangle among
  them: what proves their boards lost is a search no formula states.
- **It walks the moves backward from the finished positions**, so it
  assumes nothing of the moves, and a claim is sound where it holds of no
  position that can finish. A claim that never holds on a board checked is
  not recorded.
- **It runs the compiled module**, compiled afresh so a planted claim runs
  the same way, which is what the app runs.
- **The results say what each claim misses**: how many positions that
  cannot finish no claim holds of. Twiddle's invariants miss many; Sixteen's
  and Fifteen's parity miss none, which their generators rely on.
- **A board where nothing moves checks nothing** (a block wider than the
  board) and is listed apart.
- **Each claim has a planted defect beside it** in `dead-end-check.test.ts`
  that must come out unsound.

The verdict is recorded in `src/describe/soundness.json` under a fingerprint
of the claim and every part of the rules the search reads, and the gate
fails on a compiled claim with none.

## What a candidate inherits

A new game in a family costs what its family's ladders do not already
give it. [`research/technique-check/inherit.ts`](../research/technique-check/inherit.ts)
computes that from the candidate's description, its rules stated and its
techniques not yet: each technique of each library its family places and of
each other game of its family is

- **not in its words** where the compiler cannot build it from the
  candidate's description: it reads a clue kind, partition or term the
  candidate does not have, which the line names. A term the source defines
  and the candidate does not travels with the technique; one both define is
  read as the candidate's.
- **sound**, **unsound** with the board that shows it, or **undecided**,
  checked against the candidate's rules as § "Checking a technique sound"
  checks a game's own, on the same boards and in the same time, but with no
  planted defect and on every order.

Beside the table, each clue kind, partition and unit of the candidate is
marked by whether some technique found sound reads it: a rule none reads is
one the port writes techniques for. Run it by hand:

```sh
CANDIDATE=<game> [FROM=<game or library>,...] npx vitest run -c research/technique-check/vitest.config.ts inherit
```

It writes `results-inherit-<game>.txt`. **What it does not see**:

- **A technique for two rules together.** A rule an inherited technique
  reads is marked read, though the port may still need a technique for its
  interplay with another: tried on Solo (2026-11-10), every technique the
  report named was one the port has, but Solo's `intersect`, a box against a
  line, reads two units the Latin library reads one at a time.
- **A technique stated in other words.** A source whose clue means the same
  as the candidate's under another name, or the same deduction over other
  units, comes out not in its words; Solo's `digitSet` is the library's
  `fish` with rows and columns swapped.
- **Where a technique belongs.** That a technique is sound says nothing of
  its tier, or of whether the ladder should run it. And a technique that
  reads only the grid is in every grid game's words: Group's read the
  answer as a multiplication table, and come out unsound in Solo, rightly.

## What this builds on

The works the language and its engine take from, kept here so that a design
builds on them and anything written about the approach cites them. The
reading, with each work's limits and the corrections to what was first said
of it, is
[`prior-art.md`](../openspec/changes/archive/2026-10-29-investigate-a-language-for-puzzle-games/prior-art.md).
A design that takes from a work adds it here, with what was taken.

| Work | What is taken from it |
| --- | --- |
| Butler, Torlak and Popović, FDG 2017 (Nonograms) | A technique as a program in a typed condition-action language, checked sound by an SMT solver: § "Checking a technique sound". Their synthesis recovered 9 of 14 documented strategies, in one genre |
| Espasa, Gent, Hoffmann, Jefferson and Lynch, 2021 (Demystify) | A step explained by a minimal unsatisfiable subset of named rules and facts, for any constraint model. Not taken as the hint: its steps are not techniques a player learns, and its authors call loop and connectivity explanations poor. A candidate tool for finding the rules a missing technique combines |
| Bogaerts, Gamba and Guns, 2021 | A step as the facts used, the constraints used and the facts derived, with a cost: a firing's premises and conclusion (§ "A firing's reason is built from its binding") |
| cspuz and cspuz_rs (semiexp); Ludii (Browne, Piette and others) | The space kept apart from the rules, so one game's rules run on any tiling; connectivity and the single loop as named primitives, not encodings |
| PuzzleScript (Lavelle, 2013) | Moves as rewrite rules over positions: § "A planning game's position and moves" |
| Browne, CIG 2013; Lantz, Isaksen, Jaffe, Nealen and Togelius, 2017 | A technique as a derived constraint that saves a level of lookahead, and depth as the steps of a strategy ladder: the ladder and its tiers |
| Pelánek, 2014; HoDoKu's rating | A tier as a set of techniques is a partial account of difficulty, and the order of techniques changes both the grade and the technique a hint names (§ "A statement's order is behavior") |
| AC-3 (Mackworth, 1977); semi-naive Datalog evaluation | Running again only what a changed fact can reach: `CellMarks.visit` (§ "What a technique compiles to") |
