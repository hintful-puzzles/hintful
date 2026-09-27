# recover-a-worker-that-never-starts

## Why

On 2026-09-27 the owner opened Ascent at 16:03, during the minute a deploy
finished (CI's deploy job ended 15:03:46 UTC). The board stayed blank, both in
the installed app and in a browser tab. The chips showed "Type…", and the top
bar still had the move counter the deploy had just removed. So the page was the
previous build, and it named that build's hashed worker file, which Cloudflare
Pages no longer served.

The "Type…" chip made it look as though the board type had been lost. It is
actually the placeholder the chips show before any puzzle has loaded. Invalid
remembered params were already handled: they are cleared and the first preset
is used instead.

The real gap was the worker. `new Worker(url)` on a missing script fires an
`error` event on the worker, and nothing listened for it. The first Comlink
call, `create(puzzleId)`, then waited for a reply that could never come.
Nothing was thrown, so nothing recovered and nothing was reported. The main
thread already recovered from this same situation for lazy imports
(`vite:preloadError`, reload once, report if that doesn't help). The worker is
not a lazy import, so that path never saw it.

## What changes

- `Puzzle.create` races the worker's first answer against its `error` event
  (`unlessWorkerFailsToStart`). A script that failed to load (a plain `Event`,
  checked in Chromium) becomes a `StaleBuildError`. An `ErrorEvent`, meaning
  the worker's own code threw during startup, becomes an ordinary error and is
  reported.
- A `StaleBuildError` nobody catches goes through the same recovery as a stale
  lazy import: one reload, then a report if the reload didn't help. The two
  paths now share `recoverFromStaleBuild`.
- The owner asked for a warning toast when a board type can't be loaded. A
  remembered type that no longer validates now shows one, where it used to be
  dropped silently. The toast doesn't name the board that replaces it, because
  a restored saved game may bring its own type.

Verified in Chromium, with the dev server's worker script answering 404: two
page loads, then the crash dialog, which reads "The puzzle worker's script could
not be loaded [stale build, and reloading did not help]". Without the 404,
Ascent loads normally. An invalid remembered type shows the toast and deals the
first preset.
