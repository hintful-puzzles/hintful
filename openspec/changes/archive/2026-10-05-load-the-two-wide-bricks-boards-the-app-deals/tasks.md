## 1. Read

- [x] 1.1 Why a two-wide board the generator accepted is `impossible` once
      rebuilt from its desc: the generator. It never accepted the board; it
      never asked.
- [x] 1.2 Whether such a board plays to a solution in the app: it cannot. Each
      of the three boards has no solution, by trying every coloring.

## 2. Fix

- [x] 2.1 The generator solves the fully numbered board before it removes a
      number, and starts again when that does not complete.
- [x] 2.2 A test that deals at the smallest width and height and loads each
      board from its ID, seen to fail on six of its ten cells before the fix.
- [x] 2.3 `metrics/tier-walk.md`: Bricks walked again, its three cells gone.
- [x] 2.4 `docs/games/solver-and-generator.md` § "Solver-gated generation":
      the unchecked start.
