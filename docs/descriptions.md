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
   gate and fails where a module differs. A module new to the tree reads
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
  each present or not.
- **A clue per value** (`per: value`, ABCD's number for each letter of a
  line) sits at its element once for each value of the domain, read
  `clue(count, L, d)`, and `per` in its meaning names the value. `Dealt`
  keeps it as one `ClueList`, each clue at `perPlace(x, d)`.
- **The compiler reads a description with every variation applied.** One
  ladder runs on every board the game deals, and a name a board's variations
  leave out is empty there, so a technique over it binds nothing (Solo's
  killer techniques on a board with no cages).
- **A variation's word is read off what it does, never written.** One that
  only `add`s is a modifier, since an added rule only removes answers and
  every sound technique stays sound. One that `replace`s a block is a
  ruleset, checked on its boards and the plain game's. A change to the deal
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
| `a * b`, `a / b`, `a mod b`, `-a` | `/` truncates |
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
- **`chain(c)` is `c` and the cells its value steps to**, each from the one
  before, ending at a cell whose value names no cell or one already
  reached: Rome's arrows followed from a square. It is a set in reading
  order, not the walk's, since that is the order the checker gives it, so
  a sentence that names the walk computes it in the game's reason (Rome's
  `arrowPath`).
- **A set of numbers is a mask of 32 bits**, so it holds none past 31 and
  none below 0: a domain, or a `range` read as a set. A binder over
  `range(a, b)` counts instead, so it binds a position along a line of any
  length.
- **`connected(S)` says whether the cells `S` are one group**, each reaching
  every other through members side by side, and `cuts(S)` is the members
  without which the rest are not, in `S`'s order. Bind `cuts` once by `=`:
  it is one search of the whole set (Singles' `split`).
- **The points where squares meet are a sort** where the space says
  `points: true` (Slant's): `points` is every one, border included, in
  reading order, `cells(k)` the squares round a point, and `points(c)` a
  square's four corners. A clue may sit at one (`at: point`). `slash(c, k)`
  is the value of square `c`'s diagonal through its corner `k`, 1 from above
  left to below right and 2 the other way; `linked(k)` is `k` and the points
  the drawn diagonals join it to, in reading order. The compiled code keeps
  every group of joined points until a value is placed, so `x in linked(k)`
  costs a lookup.
- **`through(c, E)` is `c` and the cells reached from it across the edges
  `E`**, each between two squares side by side: Slant's squares marked
  alike with one. Bind `E` once by `=`, since it is a set over every edge.
- **A mark on the edges that means something of the answer** names it in
  `of` (Slant's `vee`, `of: "meeting(at)"`, where two squares side by side
  meet in a v). It is a set of values per edge, each at first; a technique
  reads it as a function (`vee(e)`), a rule never does, and `strike(e, d)`
  on an edge rules a meaning out. The checker holds each edge's mark to what
  its `of` reads of the answer. A strike on an edge records no step of its
  own: a hint reads it from the firing's facts.
- **`beam(s)` is Black Box's laser fired in from slot `s`**: the slot it
  comes out at, `s` itself where it is reflected, `|slots|` where it is
  absorbed, and none where a cell no value is placed in decides it. A 1 is
  what turns it. `beam(s, c, v)` supposes `c` holds `v`, and `ahead(s)` is
  the first cell that decides it. The engine's `traceBeam` is the physics
  for the game, the compiled code and the checker alike.
- **A library name is looked up before a description's definitions**, so a
  name added to the library is spelled apart from every one a description
  defines (`on_grid`, since Solo defines `inside`).
- **`strike(c, d)` and `place(c, d)` belong to a technique's conclusion
  only.**
- **A `with` is a Check, a look at one supposed value**
  ([`solver-and-generator.md`](./solver-and-generator.md) § "Check, Tactic,
  Search"): its body's every read of the marks sees `c` holding `d`, and it
  concludes nothing itself, so the rules' own definitions are read under the
  supposition (Sticks' `stick` and `reach`). A technique states what the
  supposed value would break, and concludes the other value. A `with` reads
  no beam, and no rule may hold one.
- **A size the grid is not measured in** (Salad's `nums`) is read from what
  the board deals.

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

**So a name bound before a loop holds the marks of that moment.** On the
solve path the bindings inside the loop make facts as they go, so a name
bound outside it, read beside a fresh read of the marks inside it, reads two
moments, and the conclusion can be false of both. Bind a name that reads the
marks after the binder it is compared across: Mosaic's `compared` binds the
first number's need after the loop over its partners, and bound before it,
the checker found boards it gave two answers. A name that reads only what
the board deals, or that nothing later compares with a fresh read, may be
bound outside (Star Battle's `neededLine`).

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
- **Pin a `subsets` binder's size first in its `where`** (`|T| = size`): the
  loop then counts only the subsets of that size, in the order it would
  have met them, and a bound (`<=`, `<`) skips the others before building
  them. A set of `n` still allows 2^`n` subsets of every size together, so
  bound `n` too: Mines' `count` reads at most ten numbers
  (`describe-revealed-clues`' `design.md` § "Mines").
- **Bind a set a loop reads whole once, outside the loop**, by the statement
  itself: a comprehension or quantifier is never moved out of a loop
  (`set`'s `open`, `hiddenSingle`'s `placed`).
- **A definition is computed at each read**, even one that reads only what
  the board deals, so bind it once where it is read more than once: Light
  Up's `square` binds `L = lights(c)`, and its discounts bind `D =
  lights(d)` after the cheap `not known(d)`, which on 12×16 boards cut a deal
  by a quarter to a third (2026-11-02, `describe-beams-and-tiles`'
  `design.md`).

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
  in a technique.
- **A square that holds no line or piece is a value of its own, given by a
  clue** (Sticks' blocks): the clue's meaning places the value, and the
  domain, read off the clue, keeps it out of every other square. A technique
  that concludes the other of two values guards its square with the clue,
  since the checker's marks may leave a block open. Where no rule tells it
  from an empty square, it holds the empty square's value (Bricks' holes,
  Light Up's walls).
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
  above `loop` did).
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

**A solve makes each fact as it concludes it**, so a set a binder computed
before a placement in the same run reads as it was: a second binding of a
square just placed, or a member of `open(k)` placed since `open(k)` was
read. A technique that places says `not known(x)` again in the binder that
reads `x` (Slant's `loop`, `pair` and `share`), or its solve concludes from
marks that are no longer there and calls a sound board inconsistent.

## A conclusion that is false is a contradiction

`strike` and `place` are true, so a conclusion that is false under a binding
proves the marks inconsistent, and the rung returns `-1`. Nothing else
checks consistency: a strike that empties a cell is made, and only a
technique that reads the cell sees it. The library's `single`,
`hiddenSingle`, `set` and `fish` state the engine's checks. A filled grid is
then judged by the answer check, so a technique that misses a contradiction
costs only the search's time, never a wrong answer.

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

`compiledRung(run, clues, reason)` pairs a compiled technique with the
function that turns its binding and one fact into the reason the record
carries, read off the marks before any of the firing's facts is made. A
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
the rules. What a small board cannot cover:

- **A dealt partition is checked only up to the region size `REGION_CELLS`
  gives each order**, or one more in a world no board of those regions has
  an answer in (Tectonic's, `regionCells`), so a technique that reads a
  larger region is not checked on it.
- **A board of cells alone has the square of the order in cells**, and a
  relation it deals is every relation on them, each pair in it or not, a
  cell with itself too: the description states no symmetry, so none is
  assumed, and a technique sound on every relation is sound on a map's.
- **Boxes a board deals are not built**, so Solo's Jigsaw world is named in
  the results as unchecked.
- **A world or a kind a small board cannot hold is checked on nothing**,
  whatever the verdict, and the results say so (`--` lines). Such a reading
  (Mathrax's quotient, Star Battle at two and three stars) rests on the
  answer check and the comparison with the code it replaced.
- **A filling of a set the marks decide is enumerated over every cell that
  may be in it**, so its cost doubles with each: Star Battle's `fill` of a
  region's open squares takes minutes. Each value of a technique's first
  binder is one query, built as it runs. **A technique whose recorded
  verdict is current is not checked again**, and each verdict is recorded
  as it is proved, so a run cut short keeps what it finished;
  `CHECK_AGAIN=1` checks every one regardless. `CHECK_TECHNIQUES` narrows a
  run to some techniques, by id, checks them whatever is recorded, and keeps
  the others' verdicts, so one game's techniques can be checked side by
  side. **A query that outgrows z3's
  2 GB heap aborts and leaves the run hung**, not failed: watch its output
  for `OOM`. `CHECK_SPLIT` fixes more of the first binders a query (Mines'
  `region` and `regions` at 3, `count` at 5), more and smaller queries.
  A run's heap only grows, a reset solver and a forced collection between
  queries notwithstanding, so a check of thousands of queries still
  outgrows it: `CHECK_SHARD=i/n` takes every nth query from the ith, n
  processes side by side (Mines' `count` at 4), each recorded under a key
  of its own as it passes and the n folded into the verdict; a shard
  already recorded is not run again. A run with `CHECK_LOG=<file>` logs its
  progress to that file every 50 queries, naming the query it starts, so a stuck one
  can be found. **A count of squares is bit-blasted**: a sum of terms each
  0 or 1 sends z3's default search splitting square by square (Mines'
  mine total read alone ran past an hour on a 4×4 board), so a query the
  default does not settle in `CHECK_QUICK_MS` (a minute) goes to a SAT
  solver by `pb2bv`, which settled that one in seconds, and back to the
  default, unlimited, where it cannot encode the query. Native z3 on a
  query dumped with `solver.toString()` is the quick way to try a tactic.
- **A size larger than the board's cells is one unknown**, from its least
  to the cell count (Mines' `mines`, `openSizes`), not a world a value.
- **A set the marks decide keeps its order**: `stretch` holds each cell of
  its line under the guard that every cell between it and `c` is in `S`, and
  `index(x, S)` counts the members before `x` under theirs.
- **A clue per value** is dealt at every element for every value some
  cell's domain holds, each present or not.
- **`connected(S)` is read as reach**: the first member reaches a member
  beside one it reaches, as many steps as the board has cells, and every
  member must be reached; `cuts(S)` holds each member under the guard that
  the rest are not connected. It needs no unknown of its own. `chain(c)` is
  read the same way, a cell reached where a member beside it holds the
  value stepping to it.
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
