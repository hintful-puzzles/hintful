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
  **It crossed Workbox's 2 MiB precache cap on 2026-11-02** (2,093,819
  bytes before `describe-chains-loops-and-fleets`, 2,097,178 after), which
  fails the build, so that change raised the cap to 3 MiB in
  `vite.config.ts` (`maximumFileSizeToCacheInBytes`). Splitting the worker
  is what brings it back under; the session that does it lowers the cap
  again, or makes it the size budget below.
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

## Show the download's size and progress everywhere (the owner, 2026-10-31)

Asked by name, while an offline download took a long time: **the download
size and percentage should always show.** Today the settings opened from the
main page show a percentage while it downloads, the settings opened from a
game do not, and nothing shows the size anywhere. What the code says
(2026-10-31, re-check before relying on it):

- The percentage is files, not bytes: `src/sw.ts` posts
  `PRECACHE_PROGRESS` with `count` of `manifest.length` files cached, and
  `src/utils/pwa.ts` rounds `count / total` to a percent. One large file
  (the game worker, 642 KiB of 1,748) moves it as much as one small icon, so
  the figure is uneven as well as file-counted.
- The precache manifest carries a URL and a revision per file, no size, so
  showing "x of y MB" needs the build to put each file's size beside it.
- The status is rendered by `renderOfflineStatus()` in
  `src/dialogs/settings-dialog.ts`, the dialog both entry points open; why
  the game's opening shows no percentage is not yet traced.

This is player-visible (`AGENTS.md`), and the owner has already asked for
it: the session shows the total size before and during the download, a
percentage by bytes, and the same status from either entry point.

## Questions for the owner

1. **Which of the three to do, and in what order**: the icons are cheap and
   save the most per hour; the worker split is the larger change and the
   larger gain for a player opening a game online; the budget keeps either
   from eroding.
2. **What budget**: a fixed ceiling, or "no commit grows it by more than N
   KiB without saying why in its message".

## Decisions (2026-11-10)

The owner asked for low-hanging fruit only, and for a downloader that needs no
upkeep as the codebase changes: it reads the build's manifest and sizes as
data and names no file, game or chunk.

**Measured** (against the live host, `https://hintful.click`, and the build):

- Wire size equals gzip level 9 within 0.3%: the 2.5 MB worker is 787,653
  bytes brotli and 801,655 gzip on the wire against an estimate of 800,815.
  Cloudflare's brotli is no better than gzip, so the estimate is gzip -9.
- Icons: 458,079 bytes. Lossless sharp 294,590 (pixel-identical), lossless
  oxipng 252,970, sharp palette 209,426 (changes pixels, worst channel 10 of
  255, in 46 of 124 icons), pngquant 199,761.
- Precache total, gzipped: 1,946,639 before, 1,777,519 after the icon pass.

**Done**: the size in every offline status; progress by bytes; an update
counts only the files it fetches (Workbox runs every manifest entry through
its plugins, a cache hit included, so the plan names the files to wait for);
a lossless PNG pass over everything the build emits.

**Let go, and why**:

- **A delta inside a file** (bsdiff, rsync-like). Needs a server that answers
  deltas, which the static host cannot, and a component to keep. Updates
  already skip every unchanged file.
- **Splitting the game worker per game.** It helps the first online open of
  one game, not the offline install, which fetches every game anyway. It
  touches the registry and every guard that reaches games through it. The
  3 MiB cap in `vite.config.ts` stays and fails the build loudly when the
  worker nears it (2.5 MB raw on 2026-11-10).
- **A size budget in the gate.** A ceiling or a baseline is a number someone
  keeps current. The size is now shown and the table above can be re-measured;
  that is enough for now.
- **Precompressed brotli.** The host re-encodes; measured above.
- **oxipng or pngquant.** oxipng saves 41 KB more than sharp but is an external
  binary, not a dependency. pngquant and sharp's palette mode change pixels.
  **The owner's call if wanted**: setting `palette: true` in
  `optimizePng` saves another 85 KB, and changes 46 icons by up to 10/255.
- **One icon size in the precache.** A 2x screen offline would show blurry or
  missing icons.

**Known limits**: sizes are estimates ("about"). An update already waiting when
a page loads (downloaded in an earlier visit) shows no size, since nothing told
this page how big it was. A deploy in flight can mismatch the size file and the
worker; a file the size file lacks weighs nothing, and the build fails if it
lacks more than 5% of them.
