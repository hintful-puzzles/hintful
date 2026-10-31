# Descriptions Guide

How a game's deduction techniques are stated in a description and compiled
into the solver. The normative statements are in the specs:
[`latin-solver`](../openspec/specs/latin-solver/spec.md) ("The Latin ladder
is compiled from its description", "A compiled firing is recorded with a
reason built from its binding") and
[`build-pipeline`](../openspec/specs/build-pipeline/spec.md) ("Nothing is
generated into the source tree"). The parser and the compiler are
[`src/describe/`](../src/describe/). The runtime the compiled code calls is
[`engine/describe-runtime.ts`](../src/engine/describe-runtime.ts), the
engine's because the engine and games import nothing above them. The
development tools that also read a description's rules, the interpreter and
the soundness checker, are under [`research/`](../research/).

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
4. **Pairs each technique with the reason its records carry**, in a
   `Record` keyed by the compiled module's `LadderId`, so a technique the
   description adds and the game does not pair is a type error. It pairs
   through `compiledRung` ([`unequal/solver.ts`](../src/games/unequal/solver.ts)'s
   `RUNGS`), or through `uncluedRung` for a technique that reads no clues
   ([`group/solver.ts`](../src/games/group/solver.ts)); § "A firing's reason
   is built from its binding".
5. **Deals its board as the description reads it**, the compiled module's
   `Dealt`: one `ClueList` a kind, in the order the techniques should meet
   them; one `Partition` a dealt partition; and each size a technique reads
   that the grid is not measured in (Salad's `nums`). `describedLadder` deals
   clues in [`towers/solver.ts`](../src/games/towers/solver.ts) and cages in
   [`keen/solver.ts`](../src/games/keen/solver.ts). The board goes on the
   grid its units are: `latinSpace(o)`, or `sudokuSpace(boxes, diagonals)`
   for a board with boxes ([`solo/solver.ts`](../src/games/solo/solver.ts)).
   Keep what it deals no longer than the structure it reads stays as it was:
   Solo's generator merges cages in place between solves, so a partition
   kept for the cage structure's life reads stale cages.

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
  known(c)` is a map and a leading `{` a flow mapping, and the load fails at
  the field or at YAML's own parse rather than reading as something else.
- **A comment is a `#` line above what it explains.** There is no `note`
  field: the soundness fingerprint reads the statement, never its comment.
- **A game's description states its help first and its rules after**, so a
  reader meets the prose rules beside the formal ones. A rules section is
  whole or absent; the schema says what each part requires.
- **Only a library or a description with techniques compiles.**
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
- **The compiled space orders its units itself, and the interpreter follows
  the description**, so a description that lists its units in another order
  than `sudokuSpace` makes the two fire in different orders.
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
A library technique may say `"on": "place"`: the engine runs it as each
value is placed, with its first binder bound to the placed cell, and not as
a rung. A game's may say `until: <tier>`, a tier above its own: the ladder
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
`hiddenSingle`, `set` and `fish` state the engine's checks. A game whose
`valid` does not check every clue relies on them: drop `set`'s check, and
its recursion accepts a broken grid as a second answer.

## A firing's reason is built from its binding

`compiledRung(run, clues, reason)` pairs a compiled technique with the
function that turns its binding and one fact into the reason the record
carries, read off the marks before any of the firing's facts is made. A
reason is not the bare binding where its words quote the board: a sign's
reason quotes the other end's least candidate as it stood when the step
fired.

## Checking a technique sound

[`research/technique-check/describe-check.ts`](../research/technique-check/describe-check.ts)
reads a description's own formulas on small boards (`CHECKED_ORDERS` in
`src/describe/soundness.ts`) as z3 constraints, with every clue the board
could be dealt present or not, so one check covers every layout. A technique
is sound when no binding's premise holds while its conclusion fails under
the rules. What a small board cannot cover:

- **A dealt partition is checked only up to the region size `REGION_CELLS`
  gives each order**, so a technique that reads a larger region is not
  checked on it.
- **Boxes a board deals are not built**, so Solo's Jigsaw world is named in
  the results as unchecked.
- **A world or a kind a small board cannot hold is checked on nothing**,
  whatever the verdict, and the results say so (`--` lines). Such a reading
  (Mathrax's quotient) rests on the answer check and the comparison with the
  code it replaced.

A description with variations is checked in each world it deals, on the
plain board and each ruleset's, and a technique must be sound in every one.
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
