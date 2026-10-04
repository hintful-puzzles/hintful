## 0. Measure

- [x] 0.1 Deal boards with each box unticked and walk them by hints: Rect, Net
      and Pearl all strand the hint (proposal.md's table). Mines is held by
      `mines-hint.test.ts`'s scattered layouts.
- [x] 0.2 Measure the solver-versus-hint gap on those boards, which decides
      what the load check may ask (design D4).

## 1. Engine

- [x] 1.1 `DESC_NOT_DEDUCIBLE`, and `loadDesc` refusing a board deduction
      cannot finish: the difficulty contract for a tiered game,
      `Game.finishesByDeduction` for an untiered one.
- [x] 1.2 The midend asks a save's public desc when the save carries a private
      one.
- [x] 1.3 `desc-error.test.ts`: fake tiered and untiered games through every
      branch of the verdict.

## 2. Games

- [x] 2.1 Rectangles: no `unique`; the codec reads past `a`; the solver's
      verdict as `finishesByDeduction`.
- [x] 2.2 Net: no `unique`; the codec skips `a`; the solver's verdict as
      `finishesByDeduction`.
- [x] 2.3 Mines: no `unique` on params or the layout; `minegen` always
      perturbs; the `r` desc reads `u` or `a`; the hint's plan as
      `finishesByDeduction`.
- [x] 2.4 Pearl: no `nosolve`; the generator always gates and minimizes.
- [x] 2.5 Same Game: no `soluble`; the random-scatter generator deleted.
- [x] 2.6 A pinned refused board in Rectangles, Net, Pearl and Mines, and a
      refused Mines save.

## 3. Fixtures and guards

- [x] 3.1 Retire the eight fixtures dealt unchecked (Rect 2, Net 3, Pearl 1,
      Same Game 2); `upstream-descs.test.ts` holds the rest to "dealt checked".
- [x] 3.2 Lower `desc-error-games.test.ts`'s accepted-near-miss floor, with the
      reason; re-baseline the capability and params-stability snapshots.
- [x] 3.4 Boats' and Seismic's render tests draw their clue-less boards
      directly, since such a board no longer loads; the midend's fake
      exhausted game gets a solver stronger than its hint.
- [x] 3.3 `warm-repaint.test.ts`: Rect's `ring|line` stays in `UNREACHED`,
      reworded.

## 4. Words

- [x] 4.1 `help/differences.md` entry; Mines' help page loses "(by default)"
      and the unticked-box sentence; the params docs say the narrower bounds.
- [x] 4.2 Guides: `solver-and-generator.md` § "No option switches the
      generator's checks off", `engine-catalog.md`, `hints.md`.
- [x] 4.3 Spec deltas: `ts-engine`, `rect`, `net`, `mines`, `pearl`,
      `samegame`, `repo-layout`.

## 5. Finish

- [x] 5.1 Scaffold `close-the-solver-hint-gap-in-net-and-rect`.
- [x] 5.2 Run the app: the five Custom dialogs show no such field, and
      `rect?id=4x4a:2b2_2a2b2b2a2_2` is refused with the new sentence.
- [x] 5.3 Owner acceptance of `DESC_NOT_DEDUCIBLE`'s sentence and the
      differences entry (2026-10-04: *"Excellent work, accepted."*).
