# plan-permutation-puzzles-by-stage

**Filed 2026-10-16**, as the engine's half of what `add-twiddle-hint` found
(archived as `2026-10-16-add-twiddle-hint`; its `design.md` § 5 and § "Known
limit"), with the owner's acceptance of both recommendations that day.

## Why

Twiddle's planner (`src/games/twiddle/solver.ts`) solves the way a person
does: tiles in reading order, finished tiles kept. A tile travels by moves
that touch no finished cell. Where none reaches, it goes in by a sequence that
leaves every finished cell as it was. The sequences come from a library built
once per board shape: commutators, commutators of commutators, conjugates,
twists and parity products. A per-stage table over one tile's state ranks the
ways home. The hint narrates each turn's part in a named technique (tuck,
cycle, lining up, small cycles, swap, twist). Plans are recompute-stable by a
proved potential, not a measured one.

Nothing in that is Twiddle's except its moves, given as cell permutations with
turn deltas. Sixteen's line slides, Fifteen's gap moves and Netslide's slides
are such lists:

- Sixteen and Netslide plan with `planSlides`, a whole-board search whose
  narration has to infer a goal tile from the plan.
- Sixteen is in the `SEARCH_REACH` ledger because its tangled 5×5 endgames
  pass the exact search's reach.

A staged planner over a move set would give each of them a plan a person
could follow and a technique to name, with no reach to run out of on a
preset.

## What to settle

1. **The engine's shape.** A module (say `engine/permutation-planner.ts`) that
   takes the board, the moves as effects, and the goal order. It returns
   segments with roles; Twiddle becomes its first consumer, with no change to
   its hint.
2. **Whether Sixteen and Netslide should move onto it.** Measure plan
   lengths, request times and reach against `planSlides` before deciding. A
   game that moves keeps its hint wording's quality bar.
3. **Identical pieces** (Netslide's wires, Twiddle's rows-only), which the
   current planner handles by letting a stage take any tile of its value.
4. **Twiddle's known limit**: with orientation and an odd block (custom boards
   only), every commutator turns its blocks' center tiles in place, so no
   small sequence joins the library. Learning covers the early stages but runs
   out of budget late in the game: three of four boards measured refused in
   the last two rows. The fix is a family of small in-place twists for odd
   blocks, built in the shared library so any game with orientation has it.

## Impact

- `src/engine/`: the new module, its catalog entry, its tests.
- `src/games/twiddle/solver.ts`: moves onto it.
- `src/games/sixteen/`, `src/games/netslide/`, `src/games/fifteen/`: only if
  § 2's measurements favor it.
