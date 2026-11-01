# describe-guarded-moves

**Status: filed by `describe-moves-and-finishes` (2026-11-01)**, the second
part of step 3 of `describe-the-whole-catalog`'s plan (`design.md` § "The
plan"), split from it by move shape (`describe-moves-and-finishes/design.md`
§ "The split"). It files nothing of its own kind.

## Why

The position runtime compiles a planning game's moves, finish and dead-end
claims from its description (`docs/descriptions.md`), and runs Sixteen,
Twiddle and Fifteen. Six games have moves it cannot state yet, and ball sort
(`add-ball-sort`), whose pours are guarded and cannot always be undone, is
written from its description only once they can be.

## What Changes

- **The move shapes**: a move run until it stops (Inertia's and Slide's
  slides), a jump (Pegs), a push (Sokoban, with its pits' two-sided finish:
  `describe-the-whole-catalog/design.md` § "Corrections"), a rolling solid
  whose roll table stays data the description reads (Cube), and a toggle of a
  pattern (Flip, whose random patterns are dealt).
- **A lose state** compiled and called (Inertia's mine).
- **`finish-search` fed the compiled moves** for Pegs, Inertia and Sokoban; a
  solver keeps its fast packed copy where the compiled move is too slow, and
  says so with the measurement.
- **The checker's universe for moves that change what is on the board**
  (Pegs' jumps remove pegs, so no arrangement holds every position): every
  filling of the layers on small boards. Its backward search already assumes
  nothing of the moves.
- **Dead-end claims** (Pegs' frozen pegs, Sokoban's deadlocks) stated and
  checked sound.

## Facts for the session (2026-11-01; re-check)

- The rules are written twice inside Pegs, Inertia and Sokoban
  (`describe-the-whole-catalog/design.md` § "Corrections").
- Pegs' `can_arrive` is a least fixed point over two premises
  (`2026-10-29-investigate-a-language-for-puzzle-games/collection/regions-and-moves.md`
  § "Pegs"), which no construct of the formula syntax states yet.

## Acceptance

Each of the six has a description its runtime executes: its moves' legality,
its finish and its lose state compiled and called, its hand-written copies
removed or kept with the reason and the measurement; `finish-search` fed the
compiled moves; every dead-end claim checked sound on small boards; every
fixture, deal and hint walk unchanged, or each difference reported; the
guides updated.
