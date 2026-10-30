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
   gate and fails where a module differs.
3. **Checks every technique it states sound** with
   `npx vitest run -c research/technique-check/vitest.config.ts describe-check`,
   which records each verdict in `src/describe/soundness.json`; the gate
   fails on a compiled technique with no verdict for its statement as it
   reads now (§ "Checking a technique sound").
4. **Pairs each technique with the reason its records carry**, in a
   `Record` keyed by the compiled module's `LadderId`, so a technique the
   description adds and the game does not pair is a type error
   ([`unequal/solver.ts`](../src/games/unequal/solver.ts)'s
   `UNEQUAL_RUNGS`; § "A firing's reason is built from its binding").
5. **Deals its clues as the description reads them**: one `ClueList` a
   kind, in the order the techniques should meet them
   (`describedLadder` in the same file).

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
- **Only a library or a description with techniques compiles.** Solo's and
  Towers' state rules only the interpreter under `research/describe/` reads.
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
before it.

**Aggregates**: `count(B)`, `sum(B of t)`, `prod(B of t)`, `min(B of t)`,
`max(B of t)`, `the(B)` (the single binding's last name, or `none`),
`distinct(t over B)`, `set(t over B)`. Without `of`, a term is the last
binder.

**Names**: `true`, `false`, `none`, the description's sizes, `domain`, and
what the space gives: `cells`, `rows`, `cols`, `lines`, `units`.

**Functions**: `value(c)`, `cand(c)` the candidates the marks leave,
`known(c)`; `range(a, b)`, `abs(a)`, `subsets(S)`, `first(L)`; the grid's
`x(c)`, `y(c)`, `row(c)`, `col(c)`, `cells(L)`, `adj4(c)` (up, right, down,
left), `peers(c)` (row and column interleaved by index), `ends(e)`,
`end1(e)`, `end2(e)`, `other(e, c)`, `edge(a, b)`; the clues' `clues(kind)`
(a binder's set only), `at(k)`, `v(k)`, `clue(kind, x)`; and, in a
technique's conclusion only, `strike(c, d)` and `place(c, d)`. The
interpreter reads more (`slots`, `sight`, `index`, `latin(f, U)` and others,
[`research/describe/README.md`](../research/describe/README.md)); the
compiler refuses what it does not have, naming it.

A technique is `for` (its binders), an optional `premise`, and `conclude`.
A library technique may say `"on": "place"`: the engine runs it as each
value is placed, with its first binder bound to the placed cell, and not as
a rung.

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
library's `fish`). And a value read for every binding of an inner loop is
better bound once outside it (`set`'s `open`, `hiddenSingle`'s `placed`).
`research/describe/` measured the compiled ladder per deal against the
hand-written one it replaced
(`openspec/changes/archive/*-compile-the-latin-ladder/report.md` § "Speed").

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
so one check covers every layout. A technique is sound when no binding's
premise holds while its conclusion fails under the rules. Library techniques
are checked on a plain Latin square, which is the weakest rule set any Latin
game adds to.

Each technique has a planted defect beside it in `describe-check.test.ts`
that must come out unsound. A plant that only makes a technique strike
less, or that drops a condition consistent marks already give, is not a
defect, and the checker rightly calls it sound: three of the first plants
were that, and were replaced.

The verdict is recorded under a fingerprint of the statement, the rules it
was checked against and the orders (`src/describe/soundness.ts`), so editing
either makes it unchecked until the check runs again.
