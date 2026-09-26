# ring-a-piece-as-one-shape — tasks

## 1. Read before designing

- [x] 1.1 Confirm the population: every game whose hint targets name more than
      one square of one piece. Read each hinting game's `targets` builder
      rather than grepping for "domino"; the proposal names Dominosa and
      Magnets as of 2026-09-21.
      *Read 2026-09-26: Dominosa (a placement's `[a, b]`) and Magnets (a domino
      decided whole). Boats' targets are squares drawn as recolored segments,
      not rings; every other `HintMarks` caller's targets are single cells.*
- [x] 1.2 Read how `HintMarks` erases (`gutterColor`) and how Magnets repaints
      its marks every frame, and decide whether the shared painter needs the
      every-frame restamp for a piece whose body crosses into its partner's box.
      *`paint` already draws every mark every frame and erases only on change,
      so the restamp is free. The gap was the other way: with a join, a square
      keeps its role while its sides change, so an inside-the-box game must key
      its tile on the sides. `MarkOutlines.packed` exposes them; Magnets
      already keyed on them, Dominosa keyed on membership and now takes a
      `markSides` lane.*

## 2. The painter

- [x] 2.1 Optional relation on `HintMarks.paint`; default unchanged. Two, as it
      turned out — `joinTargets` and `joinEvidence` — because Dominosa joins its
      target but not its evidence, and Magnets joins both.
- [x] 2.2 `mark-shape.ts`: `expectPieceRing`; seen failing (8 sides against 6)
      in both games with the join removed.

## 3. Adopters

- [x] 3.1 Dominosa: pass the relation; add the piece-ring assertion. It has no
      hint snapshot to re-baseline.
- [x] 3.2 Magnets: replace its own pass; its render snapshots did not move.
- [x] 3.3 Run both in Chrome. Dominosa showed an edge domino missing its outer
      sides: the outer squares' gutters bleed off the canvas, so the band sat
      off it. Its `markBand` now stops at the canvas, with a scan test for an
      edge placement, seen failing without the clamp.

## 4. Close out

- [x] 4.1 `docs/games/hints.md` § "Shade vs ring": a piece is ringed as one
      shape, and the color-legend rows for Dominosa and Magnets.
