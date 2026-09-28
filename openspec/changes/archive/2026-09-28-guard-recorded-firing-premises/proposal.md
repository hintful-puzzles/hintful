# guard-recorded-firing-premises

Found by `offer-recorded-placements-by-premise`, 2026-09-28.

## Why

Since `towers-implicit-strike-window` and `offer-recorded-placements-by-premise`,
the candidate-plan walk offers a recorded strike or placement when its premise
holds no mark the board has yet to show (`availableFirings` in
`src/engine/candidate-hint.ts`). That is sound only if a step's premise
(`area ∪ hatch ∪ reads`, plus `targets` for a strike) names **every cell whose
candidates or placed value the deduction reads**. A step that under-declares
passes every test and narrates a premise the player's board does not show.

Nothing checked this. It was verified by reading, per game, what each strike's
solver reads against what its step outlines. A reading is a census of the
games there were that day, and the next game's premise is unread.

## What it found

The audit built here found four under-declared premises the reading had
passed, every one of them on the player's board:

- **Group, implicit reading**: 65 of 331 placement hints said "The grid shows
  a·f = b …" with that product's cell still blank (every leaf preset, two
  seeds). `CandidateWalk.evidence` dropped every cell a step of the firing
  targets, and under the implicit reading a note leg targets the very premise
  cells the board has not filled.
- **The Latin fish** (Towers, Unequal, Keen): a set in the value slice reads
  that its value is absent from the rest of its lines, and named only the
  cells where it survives.
- **Rome's `reach`**: "only this mark still leads into the striped group"
  reads every square around the group, and named only the group.
- **Solo's Killer cages**: a cage the solver shrank by filling cells is still
  the cage the player sees, and four cage reasons named only what was left.

It also found an existing defect it cannot hold: on Killer boards, 6 of 157
`cageSingle` hints on HEAD said "The rest of this killer cage is filled in"
with cells of the cage empty, because the solver had split the cage. Scaffolded
as `teach-solo-cage-splits`.

## What changes

- A recorded reason may carry `reads`, and the walk adds them to its step's
  premise. The Latin set, Rome's `reach` and Solo's cage reasons carry them.
- `CandidateWalk.evidence` leaves out the cells the firing's legs act on,
  not the cells its note legs write.
- `engine/firing-replay.ts`: the audit, and `FiringReplay` for a solver to
  offer. `latinSolver`, Rome and Solo offer one.
- `firing-replay.test.ts`: the audit over every candidate walk, with its
  ledgers pinned to boards; tests of Rome's and Solo's reads, which the audit
  cannot see.
- Scaffolded: `teach-solo-cage-splits`, `solo-ladder-as-declared-techniques`.
