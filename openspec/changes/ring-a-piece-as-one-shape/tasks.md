# ring-a-piece-as-one-shape — tasks

## 1. Read before designing

- [ ] 1.1 Confirm the population: every game whose hint targets name more than
      one square of one piece. Read each hinting game's `targets` builder
      rather than grepping for "domino"; the proposal names Dominosa and
      Magnets as of 2026-09-21.
- [ ] 1.2 Read how `HintMarks` erases (`gutterColor`) and how Magnets repaints
      its marks every frame, and decide whether the shared painter needs the
      every-frame restamp for a piece whose body crosses into its partner's box.

## 2. The painter

- [ ] 2.1 Optional `samePiece` relation on `HintMarks.paint`; default unchanged.
- [ ] 2.2 `mark-shape.ts`: a piece-ring assertion; prove it fails on a per-square
      ring.

## 3. Adopters

- [ ] 3.1 Dominosa: pass the relation; re-baseline its hint frames and read the
      diff; add the piece-ring assertion.
- [ ] 3.2 Magnets: replace its own pass; its render snapshots should not move
      (the shape is the same), and if they do, find out why before
      re-baselining.
- [ ] 3.3 Run both in Chrome.

## 4. Close out

- [ ] 4.1 `docs/games/hints.md` § "Shade vs ring": a piece is ringed as one
      shape, and the color-legend rows for Dominosa and Magnets.
