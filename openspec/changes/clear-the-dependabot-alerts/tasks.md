## 1. Triage

- [ ] 1.1 List the open alerts with `gh`: package, severity, manifest,
      runtime or development, patched version. Record the table here.
- [ ] 1.2 For each, whether the vulnerable code is reachable from the app
      or the build, and what upgrading costs (a patch, a minor, a major).

## 2. Fix

- [ ] 2.1 Upgrade the direct dependencies; `npm ls <pkg>` for each
      transitive one, and lift it by its parent or an `overrides` entry.
- [ ] 2.2 `npm audit` and the gate; run the app (a build, a game played, a
      reload offline) where a runtime dependency moved.
- [ ] 2.3 An alert left open goes to the owner with a recommendation.

## 3. Finish

- [ ] 3.1 Commit, push, confirm the alerts close on GitHub, archive.
