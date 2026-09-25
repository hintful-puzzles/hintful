# quiet-map-hint-evidence — tasks

- [x] 1 Single-region steps carry no evidence; the frontier still reads the
      target's cited neighbors.
- [x] 2 Evidence drawn as a dashed line inset from the border by a band's width,
      each strip clipped clear of the piece's other boundary sides so a corner
      does not reach back across the gap; no corner joins for a dashed band.
- [x] 3 `map-hint.test.ts`: singles outline nothing; the continuity check counts
      a single's colored neighbors as read; every evidence polygon in the chain
      frame is dash-sized (shown to fail with the dash removed). Snapshot
      re-baselined.
- [x] 4 Looked at a single and a pair frame in Chrome.
- [x] 5 `docs/games/hints.md`: the legend row and the Map section.
