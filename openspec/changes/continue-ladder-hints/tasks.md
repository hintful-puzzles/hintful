# Tasks — continue-ladder-hints

## 1. The measure first

- [x] 1.1 A ladder-plan continuity census beside `hint-frontier.test.ts`'s:
      for each game setting `continuing`, the jumps its plans make where a
      continuing firing was available; its population derived, and the
      `deduceHintPlan` games without `continuing` listed. Run it on Path and
      the skeleton; see it fail with the frontier planted off.
      (`ladder-continuity.test.ts`. Path 0/33, grid and edges skeletons
      0/63 and 0/69; Path planted off 61/88. Its share is of the positions
      where the plan could continue, not of jumps: Tracks' bookkeeping jumps
      drowned a frontier planted off at 54 of 1,900.)

## 2. The games

- [x] 2.1 The eight on `singleFirings`: ascent, bridges, magnets, pearl,
      separate, starbattle, tents, tracks. Each rung declares `available()`
      keyed on what its player follows; `continuing: true`.
      What they taught the engine: `SweepOffers` builds `available()` from a
      sweep as written; `fallback` and `prerequisite` keep a rung that
      presumes others ran dry from being asked first (Tents' links, Tracks'
      flags); and a continuing firing is taken only at the tier the order
      would fire at, since otherwise Ascent taught Hard reasoning on Easy
      boards (112 steps over the board's tier in its walk).
- [ ] 2.2 The eighteen with a `next` of their own: boats, bricks, clusters,
      crossing, filling, galaxies, lightup, loopy, pattern, range, rect,
      signpost, singles, slant, spokes, sticks, subsets, unruly. Onto
      `singleFirings` and `continuing`, or the reason not, recorded here.
      Done: boats, bricks, clusters, pattern, rect, signpost, spokes,
      sticks, through `findingTechniques`: each finder yields every firing
      where it returned the first (Boats' collect in `firing()` instead, so
      its thirteen finders stay as written). A dear look-ahead offers only
      the firing it would make (Clusters' shortest chain, Spokes' first
      contradiction). Done too: galaxies, lightup, range, unruly, whose
      rules record each firing and now ask `keep()` there. Range, Light Up
      and Unruly planned the trace of a full solve; their hint is now a
      ladder over the same rules, one firing a step. Galaxies'
      `dotOwnCells` is a prerequisite (a plan that took a later rule first
      ran dry on a board it used to finish), and its mirrored wall a
      fallback, as its demotion meant.
- [ ] 2.3 For each: hint pins and plan tests re-baselined, each moved
      sentence read against its board; a hint played in the app.

## 3. Close-out

- [ ] 3.1 `docs/hints.md` § "The shared plan loop: deduceHintPlan" says a
      plan continues, and how to key `available()`.
- [ ] 3.2 Commit a game or a few at a time; push; bring the reordered hints
      to the owner; archive on acceptance.
