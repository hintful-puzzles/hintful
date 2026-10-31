# describe-salad

**Status: filed by `describe-solo` (2026-10-31)**, the last Latin game whose
solver runs the engine's levels rather than a described ladder
(`build-a-game-from-its-description`'s `report.md` § "What fits, and what
does not": Salad and ABCD, "a repeated symbol, which `latin.ts` carries as a
special case and the library does not"; ABCD has a solver of its own).

## Why

Unequal, Group, Towers, Keen, Mathrax and Solo run their ladders compiled
from their descriptions. Salad still passes `latinSolver` its levels
(`usersolvers`, `diffSet0`), the last game to: once it is described, the
engine's `LatinLevels` path can go. What it lacks:

- **Its rules.** `salad.description.yaml` holds its help page only.
- **A symbol that repeats.** Salad's empty square is the cube's last
  symbol, placed `order − nums` times a line (`LatinRepeats`), and every
  library technique assumes each value once a unit. The `latin-solver` spec
  says a cube with a repeated symbol runs the engine's own multiplicity
  deductions instead; a described Salad needs its techniques stated with the
  multiplicity, or the library's taking one.
- **Its border clues.** The ABC End View reading (`saladLettersSolverDir`)
  is Salad's own Easy rung.

## What Changes

- **Salad's rules are stated** in its description, checked by the
  investigation's answer check under `research/describe/`.
- **Salad's techniques are stated**, in the order its solver scans, each
  with its reason built from its binding, checked sound with a planted
  defect, the library's where they are the library's.
- **Salad runs its compiled ladder**, after the comparison the earlier
  changes ran (both side by side on every deal and hint walk; returns,
  grids, cubes and records equal), and the hand-written rungs and the
  engine's levels path go.

## Facts for the session (2026-10-31; re-check)

- Salad's two tiers are guess-free (`diffRecursive = DIFF_IMPOSSIBLE`): no
  forcing chain or recursion runs at either.
- A player's cross is the hole symbol placed, and a ball the hole symbol
  struck (`markersFromCube`); the clue kinds are the border letters, and the
  Number Ball board's balls and crosses (`seed`).
- The comparison harness and the trace are `describe-solo`'s: commit
  `264c48bd` (`research/describe/compare-solo.test.ts`, the `COMPARE` switch
  in `solo/solver.ts`), and `research/describe/trace-latin.test.ts`, which
  walks Salad already. Where the two ladders differ, isolate each difference
  with a switch of its own until the comparison is clean, and report each
  one that stays (`describe-solo`'s `report.md` § "The comparison").
- A scale whose techniques do not run in tier order grades by the path a
  solve takes (`docs/descriptions.md` § "The formula syntax", on `scales`).

## Acceptance

The comparison finds no difference on every Salad deal and hint walk but
those its switches name, every existing Salad test and hint guard passes,
each technique is checked sound and its plant unsound, the app is run, and
the speed per deal is reported against the hand-written solver's.
