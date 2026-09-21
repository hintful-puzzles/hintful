# bridges-teaches-sealing-off-at-normal — tasks

- [x] 1.1 Add `solveIslandSeal` as the Normal rung `stage2-sealing`, and the same
      step in `solveSubLegacy`, the ladder test's oracle.
- [x] 1.2 Measure generation at every size × `maxb` × Normal/Tricky; refuse
      Tricky at `maxb` 1 as a generation-only bound.
- [x] 1.3 Move the hint tests' `maxb` 1 shape to Normal; the owner's pinned
      board now grades Normal, which is the rung's live proof.
- [x] 1.4 Check the frozen C differential: all 12 fixtures still byte-match and
      grade, so none is retired.
- [x] 1.5 Spec delta on `bridges` (and correct where the loop rule sits).
- [x] 1.6 Run the app: a Normal board's hint teaches sealing off.
