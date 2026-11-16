# deal-census-boards-on-demand

Filed 2026-11-16 from a review of the `add-norinori` session's transcript;
the owner agreed to it the same day.

## What the work found

`describeLadderCensus` (`engine/testing/ladder-census.ts`) takes `cases`, each
a `board: () => Board` thunk, and skips its tests outside the deep tier. But
a game builds the list with the deal *outside* the thunk:

```ts
cases: SHAPES.flatMap((p) => SEEDS.map((seed) => {
  const { desc } = newSkeletonDesc(p, randomNew(`ladder ${label}`));
  return { label, board: () => ({ ...p, desc }) };
})),
```

so every board is dealt when the file loads, in CI too, where the census is
skipped. Both skeletons (`src/skeleton/*/skeleton-generation.test.ts`) have
this shape, so each new game copies it. Norinori's CI run failed its
25-second budget at 124 s after green commit and push hooks (2026-11-16),
once its seeds were doubled to make `blocked` fire in the census. Several
ported games' `*-ladder.test.ts` have the same shape. Find the population
by the reference: the callers of `describeLadderCensus` whose deal call is
not inside `board`.

The thunk is called once per cap, so moving the deal inside it naively deals
each board once per cap when the census does run.

## What this change does

- The census takes the deal itself lazily, and keeps one board per case
  across caps: `board` is called once, in the deep tier only, and its board
  is kept for the caps (or the census takes a `deal` and a `fresh` per cap,
  for a game whose `solve` changes its board). Settle the shape in the
  design.
- The skeletons and every caller move to it. A file in CI deals nothing for
  its census.
- A guard: loading a census file outside the deep tier deals no board.
  Settle in the design what it measures (a deal counter in
  `engine/testing/dealt.ts`, or the file's collection time).

## Before it starts

- Re-check the claim: time a Norinori census file's collection in CI mode at
  HEAD.
