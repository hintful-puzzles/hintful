# The technique checker

A development tool, never part of the app: it checks that a deduction
technique, stated in the language of
`openspec/changes/archive/2026-10-29-investigate-a-language-for-puzzle-games/language.md`,
is sound against a game's rules on small boards, and computes the cut between
two games by checking each game's techniques against the other's rules.
`openspec/changes/compute-the-cut-by-technique-transfer/` says what it was
built to test and what it found.

It is run by hand and not by the gate, which compiles it
(`tsconfig.node.json`) and runs none of its tests. It uses z3 through the
`z3-solver` package, z3's WebAssembly build:

```sh
npx vitest run -c research/technique-check/vitest.config.ts [run]
```

`PAIRS="A1 A2"` runs only those pairs of a run that takes pairs.

| Run | What it does |
| --- | --- |
| `validate` | experiment C's checks again, and a planted defect for each form; fails if any comes out other than expected. Its Range checks on 6x6 run for hours without settling |
| `run_a` | the test's group A pairs the solver decides; writes `results-a.txt` |
| `planning` | the planning pairs, by exhaustive search; writes `results-planning.txt` |
| `symarea` | A11: Symmetry Area's two writings, and Filling, by enumerating every answer |
| `run_c` | the test's group C pairs that need stated ladders; writes `results-c.txt` |
| `planted` | a planted defect in each of group C's ladders, each of which must come out unsound |

The times in the results tables are those of the tool's first version, in
Python with z3 4.16.

`starbattle-12x12-3.txt` holds two three-star boards the game's generator
dealt (seeds "cut a" and "cut b"), one region map a line, row by row: three
stars fit on no smaller board, and z3 does not settle 12x12 with the regions
as variables.

## How a check works

`pzl.ts` compiles the language's forms to z3 for a polarity, asserted or
denied, so that connectivity and least fixed points can be stated either way
exactly. A technique's bound variables are symbolic inside one query. A
counterexample is read back and judged by a plain evaluation of the game's
rules, written apart from its z3 encoding, so an encoding defect can make a
check undecided but never makes a technique look unsound.
