# Design: compiling the Latin ladder

## Context

The pilot (`build-a-game-from-its-description`, archived) ran the Latin
library's techniques and Unequal's from JSON through an interpreter in
`research/describe/` and found them equal to the hand-written solver at every
tier. The owner's decision was to build the ladder from the description by
compiling it. The proposal's acceptance is that a player sees no change:
the same boards, grades and hints.

## The bar this design is held to

**Same boards and grades** need only equal closures. Every technique is a
sound strike or placement, so the fixpoint at a tier cap does not depend on the
order techniques fire in, and the grade is the least cap whose closure solves
(the pilot's § "The ladder and the hint's firings" argues it). Unequal's
generator reads the final candidate cube (`cubeOut`), which is the closure
too. The forcing chain is not monotone, but it runs on the closure below it,
so its sequence is fixed once the closures are.

**Same hints** needs more: the recording solver's records, in order, with the
same reasons. A hint plan chooses among the firings the recording solver
makes, so a technique that finds a different first firing, or strikes in a
different order, can change the step a player is shown. That is the binding
constraint, and most of the design follows from it.

## Decisions

### 1. A description states its scan order, and the compiler keeps it

A technique's bindings are enumerated in the order its binders are written,
each binder's set in its own order, and the compiled function stops at the
first binding whose conclusion changes the marks (as every hand-written
generic technique does, so one call is one firing on both paths). So the
order is part of what a technique says, and the library and Unequal's
descriptions are restated to scan as the engine scans:

| Technique | Order the engine scans in, now stated |
| --- | --- |
| `hiddenSingle` | rows then columns, values ascending |
| `single` | column by column, top to bottom |
| `placed` | the placed cell's column, then its row, one firing a placement |
| `set` | rows then columns; within a line, the empty subset first (the line's check for an emptied cell), then the subsets of its unplaced values counted in binary from the largest value |
| `fish` | by value; the empty subset first (every column checked for a place left), then the subsets of the rows lacking it, by index, counted the same way |
| `wing` | middle in reading order, `x` ascending, then each target as seen from an end of the middle's least other value |
| `sign` | each clue in the game's order, both ends' strikes interleaved by value |
| `adjacent`, `adjacentSet` | column by column, then up, right, down, left |

Where the restatement changes a technique's form, it states the same
technique: `set` binds the hidden side (the values a set of cells avoids)
where the pilot bound the naked side, and the two are one set read from either
side. The interpreter and the checker read the restated forms, so the pilot's
comparisons run on what is compiled.

The alternative, clean statements in any order, would change which of
several equally valid firings a hint narrates first on some boards. That is
a change a player can see, and the proposal promises none, so it was not
taken.

### 2. A conclusion that is false is a contradiction

The hand-written techniques detect three contradictions: a cell with no
candidate, a value with no place left in a line, and more cells confined to a
set of values than it holds. The interpreter detected only the first, at the
strike. A conclusion is now a formula that must hold: `strike` and `place` are
true, and a binding whose conclusion is false proves the marks inconsistent.
`single` concludes `|cand(c)| = 1 and place(...)`, which is false on an empty
cell; `hiddenSingle` the same of a value's places; `set` and `fish` check, on
their empty subset, for a cell or column with nothing left, placed cells
included, as the engine's set search did before looking for a set. The
checker reads a false conclusion as "the premise is unsatisfiable under the
rules", which is the soundness of a contradiction. Strikes do not check for
an emptied cell: the technique that would see it does, as the engine always
has. The first statement of `set` left that check out, and the comparison
found it: a clue can strike a placed cell's own value, Unequal's Adjacent
`valid` skips the last row and column, and the recursion accepted a broken
grid as a second answer.

### 3. Generated TypeScript, checked in, held current by a test

`npm run describe` compiles each description to a `.ts` module beside it,
which the typechecker, the bundler and every tool see as ordinary source. A
test in the gate compiles every description again and compares, so a
description edited without compiling fails the gate. A Vite plugin was the
alternative: it would hide the code from the typechecker (`tsc` does not run
Vite's transforms) and from a reader.

Where things live:

| What | Where |
| --- | --- |
| The formula parser and the compiler | `src/describe/` |
| The runtime the compiled code calls (the engine's, since the engine and games import nothing above them) | `src/engine/describe-runtime.ts` |
| The Latin library, and what it compiles to | `src/engine/latin.description.json`, `src/engine/latin.compiled.ts` |
| Unequal's two descriptions, and what they compile to | `src/games/unequal/{unequal,adjacent}.description.json`, `.compiled.ts` beside each |
| The interpreter, the pilot's comparisons, the checker | `research/describe/`, `research/technique-check/`, reading the descriptions where they now live |

### 4. Types decide the representation

The compiler infers a sort for every term: a number, a truth, an element of a
sort (cell, line, edge, a clue kind) as its index, a set of numbers as a
bitmask, a set of elements as an ordered array. `subsets(S)` is only ever a
binder's set, so it compiles to a counting loop over a mask, never a list of
lists. `cand(c)` is the solver's candidate mask read off its cube. This is
what makes the compiled ladder as fast as the hand-written one: the pilot's
interpreter was 15 to 146 times slower because every value was a boxed array.

### 5. A firing hands its binding to the engine, which records it

On the recording path a compiled technique calls `fire(binding, facts)` with
the binding as an object of its named binders and the facts it would apply,
before applying them, and stops there. The engine applies them and records
each with a reason built from the binding and the board before the firing.
On a solve no one records, so the technique is given no `fire`: it makes
each fact as it concludes it and goes on through every binding. That reaches
the same fixpoint, because a fact concluded on marks a firing has narrowed
still holds, and it is what brought the compiled ladder near the
hand-written one's speed (the report's § "Speed"). Those builders
(one a technique, in `latin.ts` and Unequal's `solver.ts`) replace the reason
construction scattered through the hand-written techniques, and the reason
objects, so the hint words, are unchanged. A reason cannot be the bare binding:
the sign's words quote a bound (the other end's least candidate) as it stood
when the step fired, which the binding does not hold.

### 6. `placed` runs as each value is placed

The engine strikes a placed value from its peers inside `place`, and the
games' own solvers call `place` and rely on that. So the library's `placed` is
compiled with its first binder as a parameter, and `place` calls it on the
cell it placed: what runs is the description, at the moment the engine has
always run it. It is marked `"on": "place"` and the ladder does not run it as a
rung; the interpreter, which has no `place` of its own, still does.

### 7. The engine's ladder shape is kept

`latinSolverTop`'s rungs stay one per difficulty level, each running the
game's own techniques for the level and then the library's placed there, so
firing groups and the premise audit's rung names do not move. Unequal's
levels are read from its description's tiers; the other Latin games keep
their `diffSimple`, `diffSet0` and `diffSet1` levels, now running the compiled
library techniques, until their own changes describe them.

### 8. The repeated symbol stays hand-written, for Salad's change

A solver with a repeated symbol (Salad) runs the hand-written multiplicity
path for its rungs (`diffSimple`, `setGeneral`, the wing with the repeat
left out) and for placing the repeated symbol: the library has no repeated
symbol, and the report puts Salad last in order of fit. An ordinary value
placed in such a cube runs the library's `placed`, which strikes the same
cells in the same order. That path is removed when Salad is described.

### 9. Soundness is checked before compiling

The checker reads each technique from its description and checks it sound
against the description's rules on boards of order 3 and 4
(`research/technique-check/describe-check.ts`), and records each verdict
under a fingerprint of what was checked (the statement, the rules, the
orders) in `src/describe/soundness.json`. The gate's test fails on a compiled
technique whose fingerprint has no verdict, so a technique edited without
being checked fails the gate without running z3 there. The check runs under
vitest rather than inside `npm run describe`, because the checker's modules
are research's and run only there.

## Risks

- **The restated orders are only as good as the comparison against the
  hand-written code.** Before the hand-written layer is deleted, both run side
  by side on dealt boards of every Latin game, comparing return values, final
  cubes and record streams exactly. The comparison and its counts go in the
  change's report.
- **Speed.** Measured per deal against today's, as the proposal asks.
