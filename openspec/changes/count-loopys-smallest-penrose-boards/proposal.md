# count-loopys-smallest-penrose-boards

**Status: scaffolded, not started (2026-10-06).** A follow-up from
`settle-the-cells-the-tier-walk-still-lists`.

## Why

That change made the tier walk start a field with no declared minimum at 1,
which brought Loopy's small boards into it for the first time. One cell gave
up: `3x3t12dn`, a 3x3 Penrose (rhombs) at Normal.

Counted 2026-10-06 under the generator's real bounds, on a loaded machine:

| cell | deals | boards | a run-out |
| --- | --- | --- | --- |
| `3x3t12de` (Easy) | 190,000 | all | |
| `3x3t12dn` (Normal) | 5 | 0 | 6 s |
| `3x4t12dn` | 5 | 0 | 6 s |
| `4x4t12dn` | 11 | 9 | 6 s |

A run-out there is ten patches of 10,000 boards each (`newDesc` in
`loopy/generator.ts`), so each of the two empty cells is none in 500,000
boards over 50 patches. The player is told no puzzle was found, after six
seconds, which is what `Midend.deal` does with a run-out; nothing crashes.

## What is known and what is not

- **Whether it is absent or the patches were unlucky is not known.** Fifty
  patches is a small sample of a 3x3 Penrose patch's shapes, and a 4x4 gives
  up on two deals in eleven, so the rate falls off with size and may not
  reach zero.
- **Tricky and Hard at these sizes were not dealt.** The walk left them out
  as slow, since Normal had taken over three seconds.
- **The other aperiodic tilings were not counted at their smallest sizes.**
  Penrose (kite/dart) has a width bound from an earlier count
  (`loopy/params.ts`); Hats and Spectres start at 6x6.
- The walk leaves 758 of Loopy's cells out as slow. Those are
  `bound-custom-sizes-by-their-deal`'s, and not this change's.

## What Changes

Count the smallest Penrose (rhombs) boards at each tier, over enough patches
to say rare or absent (docs/games/solver-and-generator.md § "A size that
cannot carry a tier"), then refuse what is absent in `validateParams` and
pin it with `describeAbsentTiers`, or size the patch budget to what is rare.
A patch is the unit to count in: tries on one patch are not alike across
patches, which is the trap that section names for Light Up's ramp.

## Hints to pull in

None.

## What would show it worked

The walk for Loopy lists no cell that gave up, or this change lists the ones
left with their counts.
