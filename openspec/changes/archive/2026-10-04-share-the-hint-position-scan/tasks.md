## 1. Read

- [x] 1.1 Take the population: every hint test that reaches a position by
      walking seeds, and every one that pins a desc a scan once found. Read
      them; a grep for the phrase is a floor. About 45 scans across about 30
      games, and nine pin groups: design D1.
- [x] 1.2 What the scans differ in for a reason (random play beside hinted
      play in Pegs, a render frame in Palisade) and what they merely repeat.
      Design D2 and D3.

## 2. Build, with Flip

- [x] 2.1 The harness, and Flip's hint test written against it as
      `add-flip-hint` lands. `src/engine/testing/hint-positions.ts`.
- [x] 2.2 Sokoban's pins found again through it, with the count each rests on.
- [x] 2.3 One every-run scanner moved onto it. Light Up's `multiCellStep`.

## 3. Close

- [x] 3.1 docs/games/testing.md and docs/games/hints.md § "Verifying a hint
      in-process" name it; docs/games/engine-catalog.md if it is an engine
      module the catalog covers. AGENTS.md's tier 2.5 paragraph too.
- [x] 3.2 Or withdraw it, with the reason, if Flip's test was no better for it.
      It was better: design D4. The scans left are
      `move-the-hint-scans-onto-the-harness`.
