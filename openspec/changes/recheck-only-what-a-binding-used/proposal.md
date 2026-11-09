# recheck-only-what-a-binding-used

**Status: filed by `recheck-a-firing-before-it-writes` (2026-11-09)**, from
its cost census.

## Why

A binding that read the marks before a fact made in its own run reads its
binders again, and a set bound whole ahead of the loop is read again whole.
Filling's `mustGrow` binds `O`, every edge between equal values, before its
first loop. After the run's first placement, every later binding scans all
the edges again, finds `O` changed, and ends the run, and the ladder starts
again from its first rung. A binding that used only its own group of `O`
would still have held.

The census of 2026-11-09 (3 seeds a preset, under load) put Filling 13x17du
at 1.86 s at most, 1.39 s before, over the owner's 1 s ceiling, and 13x17de
at 1.90×. Slant's `alike` and Net's `L` have the same shape.

## What Changes

A whole set's re-read narrows to what the binding took from it. For a group
of a kept edge set, that is the group the binding's element is in. The
compiler already knows which term each binder took from the set. A binding
whose part still holds fires, and the run goes on.

## Acceptance

- Filling 13x17 deals faster than HEAD, measured with
  `scripts/checks/deal-compare.test.ts`, and Slant and Net no slower.
- Every described game's dealt boards grade as before. Path's three boards
  in `path.test.ts` still grade at their tiers.
