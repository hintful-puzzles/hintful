# move-seismic-onto-the-candidate-walk — tasks

## 1. Read and decide

- [x] 1.1 The value-dependent cull: its shape on the walk, at its three sites
      (four: the fold's region check too). A `Reach` replaces `regionsOf` at
      all of them (design D1).
- [x] 1.2 Seismic's finders as own rungs over `RungContext.shown`; no recorder
      (design D2).
- [x] 1.3 Go, recorded in design.md.

## 2. Go

- [x] 2.1 The walk takes the `reach` hook, defaulting to `regionReach`; every
      current caller unchanged, the eight walk games' suites passing unedited.
- [x] 2.2 Seismic's `buildSteps` is a call to the walk. `RungContext.populated`
      made to mean what it says; the starve rung waits for `nothingEarlier`; a
      naked cell is never narrated as hidden (design D2).
- [x] 2.3 The reading preference: default measured and set to implicit
      (design D3); `candidate-reading.test.ts` and `hint-frontier.test.ts`
      enroll Seismic by deriving it. The continuity instrument corrected for
      a non-square board and a note bit that is not its value (design D4).
- [x] 2.4 Run the app.
- [x] 2.5 Help: Seismic's page and the features page say how the hint pencils.
- [x] 2.6 `rome-implicit-continuity` told the encoding is not its cause.
