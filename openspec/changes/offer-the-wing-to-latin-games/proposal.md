# Proposal

## Why

Map's Tricky rung is now a weighing (`teach-map-chains-with-marks`, design
D2): every color one region can take, each read off a neighbor dotted with
that color and one other, so a region touching every such neighbor cannot be
that other color. Its two shapes are Sudoku's XY-wing (a two-candidate pivot,
two pincers) and XYZ-wing (a three-candidate pivot that sees the target too).
Every step of it is a note the player can make, so it is a Check.

The Latin games lost their forcing chain to Unreasonable on 2026-10-27
(`retire-hint-ordinals` D7), and their hardest deductive tiers now rest on
set elimination alone. None of them has a wing (`git grep -i wing -- src`,
2026-10-28). A wing is the markable technique a pencil-marking solver reaches
for next, and the same function serves every game whose notes are candidate
sets and whose cells "see" each other: Keen, Unequal, Group, Towers, Mathrax,
Salad and Solo.

This is one engine lack across seven games (`docs/work-management.md`
§ "What a session files", head 4).

## What Changes

- Lift Map's `weighRegion` into the engine, over a "sees" relation and
  candidate masks, and have Map consume it unchanged in behavior.
- Measure, per Latin game and preset, what a wing adds at the tier set
  elimination tops: stalls it breaks, boards that move from Unreasonable to a
  deductive tier, dealing time. Bring the owner any tier whose boards would
  change in a way a player notices.
- Where it earns a place, add it as a rung through the Latin config, with a
  hint that dots the pivot and pincers first and names them by their places,
  as Map's does.

## Impact

`engine/latin.ts` and Solo's solver, Map's solver, the Latin games' hints,
help pages and specs.
