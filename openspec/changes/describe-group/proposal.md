# describe-group

**Status: filed by `compile-the-latin-ladder` (2026-10-30)**, the next Latin
game in the order of fit (`build-a-game-from-its-description`'s
`report.md` § "What fits, and what does not"). **It starts after
`describe-games-in-yaml-with-their-help` is archived**, so Group's
description is written once, in the form that change settles.

## Why

`compile-the-latin-ladder` built the Latin library and Unequal from their
descriptions. Group is next in order of fit: it runs on `latinSolver`, its
two deductions read pairs and triples of cells (associativity, the
identity), which the formula syntax has, and it needs no fillings, which
Keen, Towers' `arrangement` and Killer's cages wait on.

It is also where the compiled ladder is slowest: a Group 8x8 Tricky deal
takes about 197 ms against 127 ms hand-written (that change's `report.md`
§ "Speed"), and the cost is the compiler's general loops.

## What Changes

- **Group's description**: its rules (a Latin square that is a group's
  table) and its two techniques, `solverNormal` (associativity forward
  deduction) and `solverHard` (ruling elements out as the identity), stated
  to scan in the order `group/solver.ts` scans, with the reasons its hint
  words read built from their bindings.
- **Group runs its compiled ladder** (`LatinLadder`), as Unequal does, and
  the hand-written `solverNormal` and `solverHard` go, after the same
  comparison `compile-the-latin-ladder` ran: both side by side on every deal
  and hint walk, returns, grids, cubes and records equal.
- **Each technique checked sound** against Group's rules, with a planted
  defect each.
- **The compiler hoists a read out of a loop it does not depend on**, the
  pass that report names as what is left of the speed gap, measured on
  Group and Unequal per deal against the numbers there.

## Facts for the session (2026-10-30; re-check)

- `group/solver.ts`'s header names the tiers and which deduction runs at
  each, and the two index conventions its deductions read the grid with
  (raw `grid[i*w+j]` in `solverNormal`, the C macro's transposed
  `grid[y*w+x]` in `solverHard` and `groupValid`); a statement's scan order
  must reproduce each.
- `solverHard` returns per element on the recording path only, and
  `solverNormal` per firing on both; a compiled technique stops at its first
  firing when recording and goes on otherwise
  (`docs/descriptions.md` § "What a technique compiles to").
- Group has a frozen differential (`group-c-reference.json`) that the
  comparison does not replace: it must stay green.

## Acceptance

The comparison finds no difference on every Group deal and hint walk, every
existing Group test and hint guard passes, each technique is checked sound
and its plant unsound, the app is run, and the speed is reported against
`compile-the-latin-ladder`'s.
