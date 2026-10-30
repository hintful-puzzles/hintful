# shrink-the-download

**Status: filed on the owner's word (2026-10-30)**, "for us to consider in
a later session", after they asked whether the download size keeps growing.
It does. **The owner wants to consider this before it is done**: the session
that takes it up brings them the plan below, with its own measurements,
before implementing.

## Why

What the service worker precaches, the offline install, went from 1,062 KiB
to 1,748 KiB gzipped between 2026-09-01 and 2026-10-30, about 65% in two
months, and nothing in the gate watches size, so no commit that grew it was
seen to.

Measured 2026-10-30 by building seven commits in a scratch worktree
(`npm ci`, `vite build`) and summing the precache manifest in `dist/sw.js`,
each file gzipped on its own (an approximation of what the host serves):

| Date | Total | JS | Icons (PNG) | Help pages |
| --- | --- | --- | --- | --- |
| 2026-09-01 (`59d0af4a`) | 1,062 KiB | 673 | 207 | 77 |
| 2026-09-15 (`502ca6f4`) | 1,148 KiB | 680 | 203 | 82 |
| 2026-10-01 (`37cd0695`) | 1,328 KiB | 795 | 203 | 147 |
| 2026-10-15 (`499c968a`) | 1,666 KiB | 868 | 440 | 172 |
| 2026-10-23 (`277200b1`) | 1,724 KiB | 908 | 449 | 179 |
| 2026-10-30 (`af4d7046`) | 1,748 KiB | 927 | 449 | 184 |

## Where it went, and what could be done

- **The game worker: one file with every game.** `assets/worker-*.js` was
  1.9 MB raw, 642 KiB gzipped (2026-10-30), because `src/games/index.ts`
  imports all 60 games. Every game page loads it, online too, so opening
  one game downloads every other game's engine, solver and hints. Loading a
  game's code when its page opens would cut the first open of a game to a
  fraction of that; the offline install would still fetch every game. This
  is an engine change: the registry, the worker's startup, and every guard
  that reaches all games through the registry.
- **Icons: two sizes, both precached.** Each game has `<id>-64d8.png` and
  `<id>-128d8.png` (`src/components/catalog-card.ts` uses them as 1x and 2x),
  122 files and about 449 KiB that gzip cannot shrink. A browser fetches only
  the one its screen needs, but the precache takes both. The icons more than
  doubled between 2026-10-01 and 2026-10-15, plausibly when they were
  regenerated from the live game (`src/puzzle/icon-capture.ts`); the session
  confirms by the git log. Options: precache one size and fetch the other on
  demand, quantize to a palette, or another format within Baseline 2023
  (WebP is). Each is measured before it is chosen.
- **Help pages: content.** 65 pages, about 3 KB each gzipped; they grew with
  their Hints sections and generated lists. Nothing to do unless the
  measurement says otherwise.
- **A size budget in the gate.** A check on the precache total, and on the
  largest file, that fails when a commit crosses it and names what grew, so
  growth is seen in the commit that causes it (`docs/method.md`: a guard
  measures the thing it claims to guard).

## Questions for the owner

1. **Which of the three to do, and in what order**: the icons are cheap and
   save the most per hour; the worker split is the larger change and the
   larger gain for a player opening a game online; the budget keeps either
   from eroding.
2. **What budget**: a fixed ceiling, or "no commit grows it by more than N
   KiB without saying why in its message".
