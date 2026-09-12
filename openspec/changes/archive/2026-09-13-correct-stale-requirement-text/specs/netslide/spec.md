## ADDED Requirements

### Requirement: Netslide solves from the generator's grid when it has one

The game has **no deduction solver**. `solve` SHALL replay the unshuffled grid
saved in the generator's `aux` when the game came with one, and otherwise SHALL
recover the finished grid from the board, as "Netslide can be solved without the
generator's answer" requires.

Netslide SHALL NOT implement `findMistakes`: every reachable board is legal —
the solution can still be reached from any state by sliding — so there is no
wrong-but-legal state to flag, and Check & Save correctly degrades to a plain
quick-save.

#### Scenario: Solve on a freshly generated game

- **WHEN** Solve is invoked on a game created from a random seed
- **THEN** the board is restored to the generator's unshuffled grid and is
  reported solved-with-help

## REMOVED Requirements

### Requirement: Netslide solves by replaying the generator's grid

**Reason**: It required Solve to report "solution not known" when no `aux` is
available, with a scenario asserting exactly that for a descriptive id.
"Netslide can be solved without the generator's answer", in the same spec,
requires the opposite, and `solve` in `src/games/netslide/index.ts` recovers the
grid from the board (`parseAux(aux, …) ?? reconstructSolution(curr)`).

**Migration**: Replaced by "Netslide solves from the generator's grid when it has
one", which keeps the `aux` replay, the fresh-game scenario and the reason there
is no `findMistakes`, and defers the no-`aux` case to the requirement the code
follows.
