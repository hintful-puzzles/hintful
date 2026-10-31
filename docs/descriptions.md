# Descriptions Guide

How a game's deduction techniques are stated in a description and compiled
into the solver. The normative statements are in the specs:
[`latin-solver`](../openspec/specs/latin-solver/spec.md) ("The Latin ladder
is compiled from its description", "A compiled firing is recorded with a
reason built from its binding") and
[`build-pipeline`](../openspec/specs/build-pipeline/spec.md) ("Nothing is
generated into the source tree"). The code is [`src/describe/`](../src/describe/),
the parser and the compiler, and the runtime the compiled code calls,
[`engine/describe-runtime.ts`](../src/engine/describe-runtime.ts), which is
the engine's because the engine and games import nothing above them. The
development tools that read a description's rules too, the interpreter and
the soundness checker, are under [`research/`](../research/).

## What every game does

Every game has a description, `src/games/<id>/<id>.description.yaml`, which
holds at least its help page ([`help-pages.md`](./help-pages.md)); the file
itself is § "The file". A game whose techniques are stated:

1. **States its techniques in `<name>.description.yaml`** beside the code
   that runs them, placing the library's with `use` and stating its own
   (§ "The formula syntax", § "A statement's order is behavior"). The Latin
   library is [`engine/latin.description.yaml`](../src/engine/latin.description.yaml).
2. **Runs `npm run describe`**, which writes `<name>.compiled.ts` beside each
   description. Edit the description, never the compiled module:
   `src/describe/compile.test.ts` compiles every description again in the
   gate and fails where a module differs. A module new to the tree reads
   there as missing until `npx vitest --clearCache`: Vitest's module cache
   keeps the test's glob as it was first expanded.
3. **Checks every technique it states sound** with
   `npx vitest run -c research/technique-check/vitest.config.ts describe-check`,
   which records each verdict in `src/describe/soundness.json`; the gate
   fails on a compiled technique with no verdict for its statement as it
   reads now (§ "Checking a technique sound").
4. **Pairs each technique with the reason its records carry**, in a
   `Record` keyed by the compiled module's `LadderId`, so a technique the
   description adds and the game does not pair is a type error
   ([`unequal/solver.ts`](../src/games/unequal/solver.ts)'s
   `UNEQUAL_RUNGS`, through `compiledRung`; a technique that reads no clues
   through `uncluedRung`, as [`group/solver.ts`](../src/games/group/solver.ts)'s;
   § "A firing's reason is built from its binding").
5. **Deals its board as the description reads it**, the compiled module's
   `Dealt`: one `ClueList` a kind, in the order the techniques should meet
   them, one `Partition` a dealt partition, and each size a technique reads
   that the grid is not measured in (Salad's `nums`) (`describedLadder` in
   [`towers/solver.ts`](../src/games/towers/solver.ts), and in
   [`keen/solver.ts`](../src/games/keen/solver.ts) for cages), on the grid
   its units are: `latinSpace(o)`, or `sudokuSpace(boxes, diagonals)` for a
   board with boxes ([`solo/solver.ts`](../src/games/solo/solver.ts)). Keep
   what it deals no longer than the structure it reads stays as it was:
   Solo's generator merges cages in place between solves, and a partition
   kept for the cage structure's life read stale cages.

## Sections

| Section | Read it when |
| --- | --- |
| The file | you write a description, or one fails to load |
| The formula syntax | you write or read a technique |
| What a technique compiles to | you read a compiled module, or a statement is slow |
| A statement's order is behavior | you restate a technique, or a hint changes after a description edit |
| A conclusion that is false is a contradiction | a technique must refuse a board, or a solver reports a false ambiguity |
| A firing's reason is built from its binding | a hint's words need a fact about a firing |
| Checking a technique sound | you state or edit a technique, or the gate reports one unchecked |

## The file

A description is YAML, read by one loader
([`describe/load.ts`](../src/describe/load.ts)) under YAML 1.2's core schema
and validated against
[`description.schema.json`](../src/describe/description.schema.json), which
says every field. `npm run describe`, the help build, the tests and the
research tools all read through it; the app never does.

- **Quote every formula, or write it as a block scalar** (`>-` folds a long
  one onto several lines, joined by spaces). Unquoted, `forall c in cells:
  known(c)` is a map and a leading `{` a flow mapping; the load then fails at
  the field, or at YAML's own parse, rather than reading as something else.
- **A comment is a `#` line above what it explains.** There is no `note`
  field: the soundness fingerprint reads the statement, never its comment.
- **A game's description states its help first and its rules after**, so a
  reader meets the prose rules beside the formal ones. A rules section whole
  or not at all: `space` brings `name`, `family`, `sizes`, `answer` and
  `freedom` with it, and `techniques` brings `space` and `tiers`.
- **Only a library or a description with techniques compiles.**
- **The compiler reads a description with every variation applied**: one
  ladder runs on every board the game deals, and a name a board's variations
  leave out is empty there, so a technique over it binds nothing (Solo's
  killer techniques on a board with no cages).
- **A family member another game deals is a second description beside it**
  (Unequal's `adjacent.description.yaml`), with no help: its game's page
  names it through `{{rulesets}}`.

## The formula syntax

The expression layer of the investigation's `language.md` § "Expressions",
with an aggregate written as a call so that its reach needs no precedence
rule. Lowest precedence first:

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

**Binders**, after `forall`, `exists`, an aggregate and a technique's `for`:
`x in S` (each member), `x = t` (a name for a term), each optionally followed
by `where P`, which skips a binding. A binder's set may read the binders
before it. A quantifier or aggregate, not a technique's `for`, may also bind
`fill f of S [from cand]`: each assignment of a value to every cell of `S`,
from its candidates where `from cand` is said, read `f(x)`, and `-1` off `S`.
A filling satisfies only what its `where` says, the Latin rule included:
Towers' line says `distinct(f(x) over x in L)`.

**Aggregates**: `count(B)`, `sum(B of t)`, `prod(B of t)`, `min(B of t)`,
`max(B of t)`, `the(B)` (the single binding's last name, or `none`),
`distinct(t over B)`, `set(t over B)`. Without `of`, a term is the last
binder.

**Names**: `true`, `false`, `none`, the description's sizes (one the grid
is not measured in, such as Salad's `nums`, is read from what the board
deals), `domain`, and
what the space gives: `cells`, `rows`, `cols`, `lines`, `units`, `slots`
(one beyond each end of every line, numbered as Towers deals its clues: above
each column, below each, left of each row, right of each), `corners` (each
point inside the grid where four cells meet, in reading order, the one below
and right of cell `(x, y)` numbered `y·(w − 1) + x`), `diagonals` (the main
one, then the other, where the space has them), and each partition by its
name (`regions: { cage: dealt }`: `cage`, its parts in the order dealt).
Named as a function, a partition gives the part holding a cell
(`cage(c)`). The one partition listed among the `units` is the space's
boxes, lines like the rows, dealt or not (Solo's `box`), and the space lists
its units in the description's order. A clue kind may sit at a part
(`at: cage`) or a corner (`at: corner`), and a partition and a clue kind may
not share a name, since both are fields of `Dealt`.

**Functions**: `value(c)`, `cand(c)` the candidates the marks leave,
`known(c)`; `times(d)`, how many times `d` appears in each unit;
`range(a, b)`, `abs(a)`, `subsets(S)`, `first(L)`; an ordered
set's `nth(L, i)` (none past its ends), `index(x, L)` (`-1` where `x` is not
in it), `before(x, L)`; the grid's
`x(c)`, `y(c)`, `cell(x, y)` (on the grid: the compiled code does not check),
`row(c)`, `col(c)`, `cells(L)` (a line's, or a part's or a corner's in reading order), `adj4(c)` (up, right, down, left), `peers(c)` (row and column interleaved by index), `corners(c)` (below right, above right, below left, above left: upstream Mathrax's order, which decides the clue its hint names), `across(k, c)` (the cell diagonally across corner `k` from `c`), `ends(e)`,
`end1(e)`, `end2(e)`, `other(e, c)`, `edge(a, b)`, `sight(s)` (a slot's line,
nearest it first), `opposite(s)`; the clues' `clues(kind)`
(a binder's set only), `at(k)`, `v(k)`, `clue(kind, x)`; and, in a
technique's conclusion only, `strike(c, d)` and `place(c, d)`. The
interpreter reads more (`latin(f, U)` and others,
[`research/describe/README.md`](../research/describe/README.md)); the
compiler refuses what it does not have, naming it.

**A value that repeats.** A description may declare one value of its domain
that appears more than once in a unit (`answer.value.repeat: { value, times
}`, Salad's empty square), and `times(d)` reads it: that count for the
repeated value, 1 for every other and for every value of a game that
declares none. The compiled code reads it off the marks, which the Latin cube
knows. The library's techniques read it behind a test that holds where it is
1 (`times(d) = 1 or ...`), so a Latin square's ladder reads as it would
without it; state a library technique's multiplicity the same way, or every
Latin game pays for a count only Salad needs.

A technique is `for` (its binders), an optional `premise`, and `conclude`.
A library technique may say `"on": "place"`: the engine runs it as each
value is placed, with its first binder bound to the placed cell, and not as
a rung. A game's may say `until: <tier>`, a tier above its own: the ladder
runs it only at a cap below that tier, for a weaker reading a higher
technique strikes all of, which a grade at a higher cap should not rest on
(Keen's `cageEasy`, as upstream omits it above Easy). `from: <tier>` is the
converse: the ladder runs it only at a cap that high, and a firing grades at
its own tier (Solo's readings of the partial cages its region rule works
out).

A game that grades on more than one scale names the others
(`scales: { killer: [...] }`), and a technique's tier is a tier of one of
them; the compiled ladder gives each entry's `scale`, and the game caps and
grades it on that scale. A grade is the same whatever path a solve takes only
where a scale's techniques run in tier order: Solo's killer scale does not
(its region rule comes before the cages' readings, as upstream's did), so
there how much one firing does decides the grade, and a technique is one
rung, as everywhere.

## What a technique compiles to

A function over [`describe-runtime.ts`](../src/engine/describe-runtime.ts)'s `Marks` and
`GridSpace` (and the game's `Clues`) that enumerates its bindings, evaluates
the conclusion of each into facts without applying them, and hands the
first binding with a fact that changes the marks to `fire`. Every term has a
sort, and the sort is its representation: a set of values is a bitmask, a set
of elements an ordered array, an element its index, `none` is `-1`.
`d in cand(c)` reads one place of the cube. A formula that mixes sorts or
names what the grid does not have is refused at compile time.

**A hint and a solve run the same function two ways.** A hint passes `fire`,
is told each firing before any fact is made, and stops at the first, so its
reasons read the marks the firing read. A solve passes `null`: the function
makes each fact as it concludes it and goes on through every binding, which
reaches the same fixpoint, because a fact concluded on marks a firing has
narrowed still holds. The library's statements were compared in both ways
against the engine they replaced.

**What a statement costs.** Within one call a rung keeps each cell's whole
candidate mask once read, and clears them after a firing it goes on from;
`d in cand(c)` is one read of the cube. A quantifier over a set of values
whose body is membership (`exists d in T: d in cand(c)`) compiles to one
bitwise test. A set of elements is an array: a statement that binds subsets
of rows binds their indices, `y(c)`, as a set of numbers instead (the
library's `fish`).

**Reading a position costs nothing where the name came from a loop.**
`index(x, L)` where `x` was bound by a loop over the same `L` is that loop's
counter, and `index(x, slots)` (or `cells`, `lines`) is `x` itself. A binder
`y in before(x, L)` loops up to `x`'s place in `L`; `before` read as a set
copies.

**A filling is enumerated depth-first** in its set's order, each cell's
values ascending, and these `where` conjuncts are kept as each cell is
assigned rather than once the assignment is whole:

- `distinct(f(x) over x in T)` passes over a value an earlier member of `T`
  holds, and `f(x) = t` gives `x` the one value `t`;
- `forall x in S, y in before(x, S) where P: B`, over the filling's own set,
  is read for each pair as the later of the two is assigned;
- `sum(x in S of f(x)) = t` passes over a value that takes the sum so far
  past `t`, and the `prod` one a value whose product so far does not divide
  `t`; either may be the right side of an `or` whose left reads no filling,
  as a guard. Both are read again once the filling is whole.

The rest of the `where`, and a quantifier's body, are read once it is whole.
A conjunct that calls a definition is read as the definition's body, and a
name bound by `=` as the term it names, so a condition stated once
(`apart(f, K)`, over `K = cells(r)`) is kept wherever it is written. Write a
filling's conditions in those forms where they hold: on a line of 6 with one
cell pinned, they leave 120 assignments of 46,656. Towers' `arrangement` and
Keen's `makes` are the examples.

**An `exists fill` asked once per cell and value is enumerated once.** Where
the only part of it that reads the loops around it is its pin `f(x) = t`,
the compiler enumerates every filling the rest allows where the rest's names
are bound, keeps the values they give each cell, and answers each question
with one bit. It enumerates again only after the technique's kept
candidates are cleared, so it answers as the pinned search would. State a
cage's or a line's per-cell question in that shape.

**A term is computed once where its names are bound.** Each binder and each
definition's parameter opens a slot just after it, and a term that binds
nothing, reads no candidate and makes no fact is computed in the slot of the
last name it reads, where that takes it out of a loop. A read (`value`,
`known`, a clue, a set's size) goes to its slot even inside the same loop, so
that every use after it shares one, a read inside a moved term included.
Such a term is then computed whether or
not the guard around it holds, which is why none may throw. `value` and
`known` move only in a technique that concludes no placement: a solve makes
each fact as it concludes it, and a strike changes neither. A comprehension
or quantifier is never moved, so a set a loop reads whole is still better
bound once outside it by the statement itself (`set`'s `open`,
`hiddenSingle`'s `placed`). `research/describe/` measured the compiled ladder
per deal against the hand-written one it replaced
(`openspec/changes/archive/*-compile-the-latin-ladder/report.md` § "Speed",
`*-describe-group/report.md` for the hoisting,
`*-describe-towers/report.md` for fillings and the projection,
`*-describe-keen/report.md` for a cage's, `*-describe-mathrax/report.md`
for a binder's order and a moved term's reads, and
`*-describe-solo/report.md` for a statement that reads every part of a
partition for each unit).

## A statement's order is behavior

Binders are enumerated in the order written, each set in its own order, and
`subsets(S)` counts in binary with `S`'s last member as the lowest bit. The
first binding that changes the marks is the firing, and it is the firing a
hint narrates. So two statements of one technique that differ only in order
deal the same boards and grades (the closure does not depend on order) but
can show a player a different step. The library and Unequal are stated in
the order the hand-written engine scanned, and were compared with it record
for record on every Latin game before it was removed
(`openspec/changes/archive/*-compile-the-latin-ladder/report.md`). Restate a
technique only with that comparison, or as a change the owner accepts.

A rung runs its techniques in turn, each over all of its bindings, so two
readings the scan interleaves (each clue's first reading, then its second,
then the next clue's) are one technique bound by the clue, its conclusion
the first reading where that changes the marks and the second otherwise.
A let binder says which, for the reason: Towers' `bounds` and its `near`.

## A conclusion that is false is a contradiction

`strike` and `place` are true, so a conclusion that is false under a binding
proves the marks inconsistent and the rung returns `-1`. Nothing else checks
consistency: a strike that empties a cell is made, and only a technique that
reads the cell sees it. The library states the engine's checks: `single`
and `hiddenSingle` on an open cell or a value with no place left, and `set`
and `fish` on their empty subset, which comes first, for any cell or column
with nothing left. A game whose `valid` does not check every clue relies on
them: Unequal's Adjacent mode skips the last row and column, and a statement
that dropped `set`'s check let its recursion accept a broken grid as a second
answer.

## A firing's reason is built from its binding

`compiledRung(run, clues, reason)` pairs a compiled technique with the
function that turns its binding and one fact into the reason the record
carries, read off the marks before any of the firing's facts is made. A
reason is not the bare binding where its words quote the board: a sign's
quotes the other end's least candidate as it stood when the step fired.

## Checking a technique sound

[`research/technique-check/describe-check.ts`](../research/technique-check/describe-check.ts)
reads a description's own formulas on small boards (orders 3 and 4) as z3
constraints: the answer and the marks are variables, the marks consistent
with the answer, and every clue the board could be dealt is present or not,
so one check covers every layout. A dealt partition is every connected
region the board could have, up to the size `REGION_CELLS` gives each order,
each a part or not, the parts covering every cell once; a technique that
reads one region is checked on every shape of that size, but no larger.
A clue whose values are a `range` is checked over its bounds, which may run
past the board's order. A clue kind marked `complete` at a partition is on
every part dealt. A technique is sound when no binding's premise holds while
its conclusion fails under the rules.

Where a partition is among the units, the board is a Sudoku whose boxes are
its `blocks(a, b)` at the sizes that make the order, the squarest first; a
board shape that deals its boxes (Jigsaw) is checked on these. A description
with variations is checked in each world it deals: every modifier that deals
a partition or a clue always applied, since a partition into single cells is
among what it deals, and each other modifier on and off. A technique must be
sound in every world, at every order where the world has an answer, and its
plant unsound in one: no order-3 Latin square has both diagonals distinct,
so Solo's X world is checked at order 4 only, and the results say so.

A size the order does not fix (Salad's `nums`) is checked at each value in
its range where the repeated value appears at least once, which is where the
domain fits the board: Salad at order 3 with two letters, and at order 4
with two and with three, so the empty square once a line and twice.

A small board may hold no clue of a kind at all, and then a technique's
reading of that kind is checked there on nothing, whatever its verdict. The
results name each such kind and order (`--` lines): no Latin square below
order 6 has a Mathrax quotient, two disjoint pairs of one ratio around a
corner, so that reading rests on the answer check and the comparison with
the code it replaced. Library techniques
are checked on a plain Latin square, which is the weakest rule set any Latin
game adds to, and on one whose last value appears twice in each line.

Each technique has a planted defect beside it in `describe-check.test.ts`
that must come out unsound, and each library technique that reads a
multiplicity a second, the technique reading it as one, which must come out
unsound where a value repeats. A plant that only makes a technique strike
less, or that drops a condition consistent marks already give, is not a
defect, and the checker rightly calls it sound: three of the first plants
were that, and were replaced.

The verdict is recorded under a fingerprint of the statement, the rules it
was checked against and the orders (`src/describe/soundness.ts`), so editing
either makes it unchecked until the check runs again.
