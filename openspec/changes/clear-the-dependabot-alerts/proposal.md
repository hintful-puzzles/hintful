## Why

GitHub reports 27 Dependabot alerts on `main` (2 critical, 7 high, 13
moderate, 5 low), seen on the push of 2026-11-22. The owner asked for them
first, before the next pilot of born games.

## What Changes

- Read each alert (`gh api repos/{owner}/{repo}/dependabot/alerts`): the
  package, whether it is a runtime dependency or only a build or test one,
  and whether the vulnerable path is reachable from the app or the build.
- Upgrade to the patched versions, a direct dependency by its own range and
  a transitive one by its parent or an `overrides` entry, and run the gate.
- An alert with no fix, or whose fix breaks the build, is raised with the
  owner with a recommendation, never dismissed silently.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None: no requirement changes, so the change carries no spec delta.

## Impact

`package.json` and `package-lock.json`, and whatever code a major upgrade
touches. The app is offline-first: weigh a dependency change by what ships
in the precache as well as what the build runs.
