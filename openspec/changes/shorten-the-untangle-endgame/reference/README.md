# Reference: the endgame prototype

`endgame-prototype.test.ts.txt` is the scratch vitest file that produced every
number in `../design.md`. It is kept as reading material for whoever implements
this change. It is not code to ship, and the `.txt` extension keeps it out of
the typechecker, biome and vitest.

- **To run it**, copy it to `src/games/untangle/zz-scratch.test.ts` (its imports
  are relative to that directory) and run `npx vitest run` on that path. Each
  `it` throws its report as the failure message, the scratch idiom this repo uses
  because vitest swallows console output. Unskip the one you want.
- **It measured the code at `fbd8490c`.** The hint it compares against, and the
  `solvedLayout` it imports, will have moved on by the time this change is
  taken up, so its numbers are a baseline to re-measure, not a result.
- **Its geometry is floating point throughout**, with no exact recount. A real
  implementation re-checks with `cross()` in the board's argument order, as
  `hint.ts` does.
- **It is slow on purpose** (grid × backtracking, up to 30 s per request). That
  cost is the problem design D4 sets out to remove, not a property to keep.
