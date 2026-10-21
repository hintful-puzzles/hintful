# Tasks — continue-ladder-hints

## 1. The measure first

- [ ] 1.1 A ladder-plan continuity census beside `hint-frontier.test.ts`'s:
      for each game setting `continuing`, the jumps its plans make where a
      continuing firing was available; its population derived, and the
      `deduceHintPlan` games without `continuing` listed. Run it on Path and
      the skeleton; see it fail with the frontier planted off.

## 2. The games

- [ ] 2.1 The eight on `singleFirings`: ascent, bridges, magnets, pearl,
      separate, starbattle, tents, tracks. Each rung declares `available()`
      keyed on what its player follows; `continuing: true`.
- [ ] 2.2 The eighteen with a `next` of their own: boats, bricks, clusters,
      crossing, filling, galaxies, lightup, loopy, pattern, range, rect,
      signpost, singles, slant, spokes, sticks, subsets, unruly. Onto
      `singleFirings` and `continuing`, or the reason not, recorded here.
- [ ] 2.3 For each: hint pins and plan tests re-baselined, each moved
      sentence read against its board; a hint played in the app.

## 3. Close-out

- [ ] 3.1 `docs/hints.md` § "The shared plan loop: deduceHintPlan" says a
      plan continues, and how to key `available()`.
- [ ] 3.2 Commit a game or a few at a time; push; bring the reordered hints
      to the owner; archive on acceptance.
