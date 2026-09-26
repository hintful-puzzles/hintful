# add-abcd-hint

## Why

Abcd is the collection's only **class B** solver: it sweeps the whole ladder
before restarting, rather than restarting at the first firing the way
`runDeductionFixpoint` does. Its own header says so — techniques 1+2 rerun to a
fixpoint before technique 3 is tried again (upstream's `if (busy) continue;`).

That matters because **a hint plan needs an order the solver does not have**. A
sweeping solver produces a *set* of firings per pass; a hint has to present them
as a sequence a person would actually follow, and nothing in the tree has had to
impose one. Every hint written so far has projected an order the solver already
committed to. This is the one game that would say whether the plan machinery
owns ordering or merely inherits it.

Two smaller things it presses on, both genuine:

- **A candidate *cube*, not a bitmask.** Abcd's notes are
  `pencil: Uint8Array` indexed by `cuboid(x, y, c, n, w)` — a third
  representation beside Solo's `Int32Array` bitmask and Rome's direction flags.
  `NoteEncoding` abstracts `bit(v)`; it does not abstract *where the note
  lives*. If three games need three answers, the seam is in the wrong place.
- **A line-partition deduction.** Its `runs` technique partitions a line's open
  cells into maximal runs and bounds how many copies each can hold — nonogram
  reasoning, not Latin reasoning. Narrating a counting argument to the Palisade
  bar ("this run of 5 can hold at most 3, and the line needs 3, so the odd
  offsets are forced") is a shape the collection has not written.

## Prerequisite this change must do first

**Abcd has no ladder-equivalence test.** There is no `abcd-ladder.test.ts`, so
its three techniques have no firing census and nobody knows which the generator
reaches at which tier. That is the same blind spot `certify-the-magnets-ladder`
existed to close, and the same one Tracks proved is invisible: deleting a whole
rung left all 39 of that game's tests green.

So this change **certifies the ladder before it narrates it**, and if that turns
out to be a change of its own, split it out rather than folding a census into a
hint. Do not design the narration against an assumed rung set.

## What changes

1. **A firing census for the three techniques**, per tier, with its own vacuity
   guard.
2. **A stated ordering rule**, and the framework question it answers: does the
   candidate-plan walk impose an order over a swept firing set, or does the game
   sort its own? If the game sorts its own, ask whether the next class-B game
   would sort it the same way — `pearl` and `tents` are the other two members,
   so there is a population to ask about rather than a hypothetical.
3. **Narration for three techniques**, one of which is a counting argument.
4. **The candidate-cube question answered either way** — either `NoteEncoding`
   grows a note *locator* with three games' evidence, or Abcd adapts and the
   reason is recorded.

## Refactor as you go

- **Three games, three note representations** (Solo bitmask, Rome direction
  flags, Abcd cube) is exactly the "N games sharing a defect means the layer
  below them is wrong" shape — but only if the three genuinely want the same
  thing. Apply the test: *can we say what a game would legitimately want to do
  differently?* A cube and a bitmask differ in memory layout, which is not a
  fact about the puzzle.
- **Class B is a population of three.** If ordering has to be solved, solve it
  for `abcd`, `pearl` and `tents`, not for `abcd` alone — and derive membership
  from the solvers' shape rather than a roster.
- **`adaptiveMarkAll` already exists** and the audit named it as the thing to
  build on. Check it fits the cube before writing a second one.

## What this does not do

- **Not `pearl` or `tents` in the same change.** They share the class, not the
  design. Bundle only where the `design.md` reasoning is genuinely identical,
  and it will not be until the ordering rule exists.
- **Not a reordering of the solver.** Upstream's sweep order is byte-match
  surface through the solver-gated generator; the hint imposes an order for the
  *player*, on the hint path, and the commit path is asserted untouched.
