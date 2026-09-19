# strike-before-forced-singles

## Why

`apply-markable-facts-rule`'s audit found the shared `forcedSingle` arm breaking
`AGENTS.md` § "Hint quality bar" rule 6. `singlePlacementReason`
(`engine/latin-hint.ts`) returns `forcedSingle` for a placement that is neither a
naked nor a hidden single in the notes, which its own comment calls *"deeper
combined deductions the notes don't yet reflect"*. The sentence (*"Working through
this cell's row and column together, only … can still go here"*) asserts
eliminations the plan never placed.

Measured on opening plans (every leaf preset, five seeds), it fired only at Group
8x8 Tricky with the identity hidden: 11 of 481 steps, on 3 of 5 boards. Those were
exactly the boards whose plan found the identity. Keen, Unequal, Towers and Solo
speak the same arm, and Salad's `forcedCross` / `forcedCircle` has its shape. All
five had 0 hits, but nothing makes the arm unreachable.

## What changes

- Locate Group's unplaced strikes (the identity path is where the measurement
  points) and place them as steps.
- Make the arm unreachable by construction across the family: a placement whose
  notes do not already show it as a naked or hidden single means the plan skipped a
  strike. Put that check in the shared layer, where every Latin-family plan passes,
  so a new game cannot reintroduce it.
- Then delete `forcedSingle`, Salad's `forcedCross` / `forcedCircle`, and their
  sentences, if nothing reaches them.

## What was found

The strikes were Group's own. The identity-fill journey placed its cells without
striking them from their lines' notes, and the placement-first arm ran before the
obvious-cull clean. The same arm also misnarrated note-free boards: a note-less
cell read as holding nothing, so every placement there was called a hidden
single in its row, false in 11 of 78 cases at 6x6 Normal. `tasks.md` has the
measurements.

## Acceptance

The steps a player sees change in rare positions. The owner decides only if a
sentence changes.
