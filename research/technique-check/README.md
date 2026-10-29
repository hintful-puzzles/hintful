# The technique checker

A development tool, never part of the app: it checks that a deduction
technique, stated in the language of
`openspec/changes/archive/2026-10-29-investigate-a-language-for-puzzle-games/language.md`,
is sound against a game's rules on small boards, and computes the cut between
two games by checking each game's techniques against the other's rules.
`openspec/changes/compute-the-cut-by-technique-transfer/` says what it was
built to test and what it found.

It is run by hand and not by the gate. It needs Python 3 and z3
(`pip install z3-solver`; written against 4.16).

| Run | What it does |
| --- | --- |
| `python3 validate.py` | experiment C's checks again, and a planted defect for each form; exits non-zero if any comes out other than expected |
| `python3 run_a.py [A1 ...]` | the test's group A pairs the solver decides; writes `results-a.txt` |
| `python3 planning.py` | the planning pairs, by exhaustive search; writes `results-planning.txt` |
| `python3 symarea.py` | A11: Symmetry Area's two writings, and Filling, by enumerating every answer |
| `python3 run_c.py [C2 ...]` | the test's group C pairs that need stated ladders; writes `results-c.txt` |
| `python3 planted.py` | a planted defect in each of group C's ladders, each of which must come out unsound |

`starbattle-12x12-3.txt` holds two three-star boards the game's generator
dealt (seeds "cut a" and "cut b"), one region map a line, row by row: three
stars fit on no smaller board, and z3 does not settle 12x12 with the regions
as variables.

## How a check works

`pzl.py` compiles the language's forms to z3 for a polarity, asserted or
denied, so that connectivity and least fixed points can be stated either way
exactly. A technique's bound variables are symbolic inside one query. A
counterexample is read back and judged by a plain Python evaluation of the
game's rules, written apart from its z3 encoding, so an encoding defect can
make a check undecided but never makes a technique look unsound.
