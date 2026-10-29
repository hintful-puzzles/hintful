# Building from a description

A development tool, never part of the app: it reads a game's rules and
techniques from a JSON description and runs them, to compare what they say
with what the game's code does. `openspec/changes/archive/2026-10-29-build-a-game-from-its-description/`
says what it was built to test and what it found.

It is run by hand and not by the gate, which compiles it
(`tsconfig.node.json`) and runs none of its tests:

```sh
npx vitest run -c research/describe/vitest.config.ts [file filter]
```

`PILOT_SEEDS=n` sets the boards dealt per params, and `PILOT_LOG=<file>`
writes a line of progress per board.

| Run | What it does |
| --- | --- |
| `answer-check` | each description's answer check on dealt boards, against the game's `status()` and `findMistakes`, and a planted defect in each clue's meaning; writes `results-answer.txt` |
| `ladder` | the stated techniques to a fixpoint at every tier cap, against the game's own solver, cell by cell, and its grade, with three planted defects; writes `results-ladder.txt` |
| `firings` | every firing of the game's recording solver, which its hint narrates, against the technique stated under the firing's rung on the same marks; writes `results-firings.txt` |
| `measure` | the stated ladder's time against the game's solver's; writes `results-measure.txt` |
| `expr` | the formula parser |

## The files

| File | What it holds |
| --- | --- |
| `description.schema.json` | the schema every description names in its `$schema` |
| `descriptions/` | one description a game |
| `library/` | techniques stated once, which a description places at its own tiers with `use` |
| `bindings.ts` | each game's binding: its state read as an instance of its description, the one thing a game writes |
| `expr.ts`, `evaluate.ts`, `space.ts` | the formula syntax, its meaning on a board, and the library's spaces |
| `description.ts` | loading a description, and instantiating it on a dealt board |
| `answer-check.ts` | the rules on a full board, and a search for every answer that knows only the rules |
| `ladder.ts` | the techniques run as a ladder |

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
| `|S|`, `{a, b}`, `{x in S where P}` | size, a set, a comprehension |

**Binders**, after `forall`, `exists`, an aggregate and a technique's `for`:
`x in S` (each member), `x = t` (a name for a term), each optionally followed
by `where P`, which skips a binding. A binder's set may read the binders
before it.

**Aggregates**: `count(B)`, `sum(B of t)`, `prod(B of t)`, `min(B of t)`,
`max(B of t)`, `the(B)` (the single binding's last name, or `none`),
`distinct(t over B)`, `set(t over B)`.

**Names**: `true`, `false`, `none`, the description's sizes, `domain`, and
what the space gives: `cells`, `rows`, `cols`, `lines`, `units`, `slots`,
`edges`, `diagonals`, each named partition.

**Functions**: `value(c)` the answer, `cand(c)` the candidates the marks
leave, `known(c)`; `range(a, b)`, `abs(a)`, `subsets(S)`, `subsets(S, k)`,
`index(x, L)`, `before(x, L)`, `first(L)`, `nth(L, i)`; the space's `x(c)`,
`y(c)`, `cell(x, y)`, `row(c)`, `col(c)`, `cells(u)`, `adj4(c)`,
`units_of(c)`, `peers(c)`, `sight(s)`, `opposite(s)`, `ends(e)`, `end1(e)`,
`end2(e)`, `other(e, c)`, `edge(a, b)`; the clues' `clues(kind)`, `at(k)`,
`v(k)`, `clue(kind, x)`; the library predicate `latin(f, U)`; and, in a
technique's conclusion only, `strike(c, d)` and `place(c, d)`.

Inside a clue's `means`, `at` and `v` name the clue's place and value.
