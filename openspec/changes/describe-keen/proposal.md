# describe-keen

**Status: filed by `describe-towers` (2026-10-31)**, the next Latin game in
the order of fit (`build-a-game-from-its-description`'s `report.md` § "What
fits, and what does not"), and the first whose every own rung is a filling.

## Why

Unequal, Group and Towers run their ladders compiled from their
descriptions. Keen is next: `describe-towers` gave the compiler fillings
(`fill f of S [from cand]`), and Keen's three cage rungs are fillings of a
cage. What Keen lacks is its rules in its description, and the compiler's
reading of a dealt partition:

- **Its rules.** `keen.description.yaml` holds its help page only. The
  investigation stated them (`investigate-a-language-for-puzzle-games`'s
  `collection/latin-and-numbers.md` § "Keen"): cages a dealt partition of the
  cells, and a clue per cage whose meaning is a sum, a product, a difference
  or a quotient.
- **A cage.** The compiler has no region space: a cage as an element, its
  cells, a cell's cage, and a clue that sits at a cage. Every game with a
  dealt partition reads the same (Solo's Jigsaw and Killer, Filling, Palisade).

## What Changes

- **The compiler and the checker read a dealt partition** and clues at a
  region of it.
- **Keen's rules are stated** in its description, checked by the
  investigation's answer check under `research/describe/`.
- **Keen's techniques are stated** in the order `keen/solver.ts` scans, with
  their reasons built from their bindings, and checked sound, with a planted
  defect each.
- **Keen runs its compiled ladder**, after the comparison `describe-towers`
  ran (both side by side on every deal and hint walk; returns, grids, cubes
  and records equal), and the hand-written `solverCommon` and its three
  callers go.

## Facts for the session (2026-10-31; re-check)

- `solverCommon` enumerates each cage's layouts once and accumulates by
  tier (`solverClueCandidate`): Easy keeps, for every cell, the union of all
  the digits some layout uses anywhere in the cage (a deliberately weaker
  reading); Normal keeps each cell's own values, the shape the compiler's
  projection answers in one enumeration (`docs/descriptions.md` § "What a
  technique compiles to"); Hard keeps, per row and column, the digits every
  layout puts in the cage's part of it, and strikes them from the rest of
  the line. Hard is a `forall fill`, which the compiler enumerates
  correctly but without the projection.
- `solverEasy` returns 0 when the board's own tier is above Easy, because
  Normal is a superset. A technique that runs only at one cap has no form in
  the description yet: decide whether it is one, or the tier says it.
- Layouts are enumerated with a running total that prunes (`total < j` for
  a sum, `total % j` for a product), and a 2-cell difference or quotient
  tries each pair both ways. The compiled filling checks the clue once a
  layout is whole; measure before adding a prune.
- Cage cells live in the transposed space `s = x·w + y` in `solver.ts`, and
  a cage's layout reads its cells in `boxlist` order. The compiled order is
  the statement's: the comparison will say whether a reason or a strike
  order depends on it.
- `solverCommon` returns per cage only on the recording path, as Towers'
  `solverEasy` did, and Hard returns after one line's strike.

## Acceptance

The comparison finds no difference on every Keen deal and hint walk, every
existing Keen test and hint guard passes, each technique is checked sound
and its plant unsound, the app is run, and the speed per deal is reported
against the hand-written solver's.
