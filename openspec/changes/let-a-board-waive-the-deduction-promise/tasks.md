## 0. Reproduce

- [ ] 0.1 Reproduce the throw through the midend for Mines, Net and Pearl
      with their option unticked, and record each board.

## 1. Fix

- [ ] 1.1 Declare which param releases the promise; `permitsSearch` reads it.
- [ ] 1.2 A refusal sentence for a board an option released, worded with the
      owner.
- [ ] 1.3 A midend test per game: hint on the board refuses with that
      sentence and does not throw.
- [ ] 1.4 Pin `4x4a:b4a2a2a2b2a2_2a` in `warm-repaint.test.ts`'s
      `PINNED.rect`, and remove `rect`'s `ring|line` from `UNREACHED`.
