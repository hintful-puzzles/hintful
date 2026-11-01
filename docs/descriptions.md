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
   nothing the board deals, and `placingRung` for one run on placing
   ([`seismic/solver.ts`](../src/games/seismic/solver.ts)); § "A firing's
   reason is built from its binding".
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
   module's `rules` for the board (§ "A planning game's position and
   moves"). It keeps its own move type, counters, animation and Solve move.
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
- **`strike(c, d)` and `place(c, d)` belong to a technique's conclusion
  only.**
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
its keep-apart rule). A game's may say `until: <tier>`, a tier above its own: the ladder
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
holds.

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
  whole.
- **Ask a per-cell question as an `exists fill` whose only read of the loops
  around it is its pin** `f(x) = t`: it is then enumerated once, not once per
  cell and value.
- **Bind a set a loop reads whole once, outside the loop**, by the statement
  itself: a comprehension or quantifier is never moved out of a loop
  (`set`'s `open`, `hiddenSingle`'s `placed`).

The measurements behind these are in the `report.md` of
`openspec/changes/archive/*-compile-the-latin-ladder` (its section on
speed) and of each `*-describe-<game>` change.

## The runtime a ladder runs on

[`engine/ladder-runtime.ts`](../src/engine/ladder-runtime.ts) owns the marks
(`CellMarks`: a value and a candidate mask a cell), makes a firing's facts,
runs the module's `placing` techniques as each value is placed (recording
their strikes as the placement's cull), and runs the ladder: one technique
an entry, in the module's order, capped per scale. A game's solver extends
`CellMarks` only to keep what no description states, a Search (`LatinSolver`
and Solo's forcing chains and recursion); a game whose solve is its ladder
uses it as it is ([`unruly/solver.ts`](../src/games/unruly/solver.ts)).

- **The space is the module's.** `units` lists the description's units in
  its order, and `describedSpace` builds the grid from them: rows and
  columns are lines whether or not they are units, and the one partition
  among the units gives the space its boxes. Seismic keeps its areas a
  dealt partition outside the units, which the checker can build.
- **A domain may be a cell's.** Where the answer's domain reads `c`
  (Seismic's `range(1, |cells(area(c))|)`), the module exports `domainOf`,
  `CellMarks.seed` starts each cell from it, and `domain` alone is refused
  in a technique.
- **A variation's techniques** run only where the board has it on
  (`describedLadder`'s `variations`), and the ladder places each before the
  first technique of a higher tier on its scale.
- **A hint walks the same firings.** A candidate game records them into the
  candidate walk (`record`); one without notes walks them with
  `ladderWalk`, which takes the firing that continues from the walk's last
  steps and never one harder than the ladder's own next firing. It is
  `singleFirings`' continuing driver, so the continuity guard measures it as
  it does every other ladder's.
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
- **Boxes a board deals are not built**, so Solo's Jigsaw world is named in
  the results as unchecked.
- **A world or a kind a small board cannot hold is checked on nothing**,
  whatever the verdict, and the results say so (`--` lines). Such a reading
  (Mathrax's quotient) rests on the answer check and the comparison with the
  code it replaced.

A description with variations is checked in each world it deals, on the
plain board and each ruleset's, and a technique must be sound in every one
that has it: a modifier's own technique (Unruly's `unique`) is checked where
the modifier is on.
Library techniques are checked on a plain Latin square, the weakest rule set
any Latin game adds to, and on one with a repeated value.

**Each technique has a planted defect beside it in
`describe-check.test.ts` that must come out unsound**, and each library
technique that reads a multiplicity a second, the technique reading it as
one, which must come out unsound where a value repeats. A plant that only
makes a technique strike less, or drops a condition consistent marks already
give, is not a defect, and the checker rightly calls it sound.

The verdict is recorded under a fingerprint of the statement, the rules it
was checked against and the orders (`src/describe/soundness.ts`), so editing
either makes it unchecked until the check runs again.

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
(a layer a variation adds).

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
- **The domain and `arranged` are read by the checker only**: they say which
  positions a board can hold. A desc parser keeps its own errors.
- **A layer is an `Int32Array`.** A game whose state keeps a layer in
  another array copies it on each call, so it keeps the layer as the
  description's.
- **A planner may keep its own fast move** where the compiled one is too
  slow, with the measurement and a test holding it to the compiled one:
  `slide-planner`'s in-place slide is 1.6× the compiled slide's speed on a
  4×4 board and 4.4× on a 5×5 (2026-11-01), and its pruning is built on a
  slide's line (`sixteen.test.ts`, "slides in the planner as the description
  says").

Its comparison with the code it replaced is in the `report.md` of
`openspec/changes/archive/*-describe-moves-and-finishes`.

## Checking a dead-end claim sound

A dead-end claim is consumed as `Game.hasNoSolution`: the dead-end banner
and the hint's refusal rest on it, and a generator that deals only boards
that can finish rests on it being complete as well. So each is checked by
[`research/technique-check/dead-end-check.ts`](../research/technique-check/dead-end-check.ts),
by search, on every small board: every size in the description's ranges
whose positions number at most `CHECKED_POSITIONS`
(`src/describe/soundness.ts`), with each set of its variations on.

- **The universe is every position the layers allow**: an arranged layer's
  arrangements, times every filling of the others. A move whose result
  leaves it fails the check, as does a `permute` claim found false.
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
