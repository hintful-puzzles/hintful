## Why

The owner saw "Offline content: downloading update…" with a spinner and no
percentage or size in Preferences opened from a game, after
`shrink-the-download` had shown both. The size and progress show only if the
page has the worker's plan, and the worker announced it once, when the install
began. A page opened after that (a game, a second tab) never had a total.

The owner also asked for a version number in that screen, and both versions
during an update.

## What changed

- **A late page learns the plan.** A page that finds a worker `installing`
  sends `PRECACHE_QUERY`; the worker answers that page with a
  `PRECACHE_PROGRESS` carrying its plan and current progress. Every progress
  message carries the total, so any one is enough to show "x% of y MB".
- **One tested reducer.** The page's download state (percent, bytes, pending
  version, bytes just downloaded) is `applyPrecacheMessage` in
  `src/utils/precache-plan.ts`, with unit tests for a page that never saw the
  start, for sizes that could not be read, and for completion and reset.
- **A version in Preferences > Advanced.** `Version <running build>`; during an
  update (`update-downloading`, `update-ready`) `, updating to <new build>`,
  the new build named by the installing worker in each message. The version is
  the existing `YYYYMMDD.<7-char git sha>` build string the About dialog shows,
  now one constant, `src/utils/app-version.ts`. There is no semver: the
  `package.json` version is a placeholder nothing reads.

Player-visible, and the owner asked for it. No save, game-ID or preference
format changed.

## Verified

2026-11-12, Chrome against a local server that served two builds and delayed
every asset: a page opened mid-download (so it missed the start) showed
"downloading update 52% of 208 KB…" and both versions, and so did the tab that
clicked "check for updates". The owner then saw it on a phone after the deploy.

Not covered by an automated test: the worker's handling of `PRECACHE_QUERY`
(`src/sw.ts`), which a unit test cannot reach without a worker; the browser run
above is its evidence.

## Left as it was

A scratch label such as `20261112.update2` was used only for the test builds;
no shipped version has a word in it.
