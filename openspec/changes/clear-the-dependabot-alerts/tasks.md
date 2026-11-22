## 1. Triage

- [x] 1.1 List the open alerts with `gh`: package, severity, manifest,
      runtime or development, patched version. Record the table here.

      2026-11-22: 27 open alerts, all on `package-lock.json`, all
      development scope. No runtime `dependencies` entry is affected.

      | Package | Alerts (severity) | Path | From → to | Cost |
      |---|---|---|---|---|
      | handlebars | 2 critical, 1 moderate | direct | 4.7.9 → 4.7.10 | patch |
      | happy-dom | 2 high, 1 moderate | direct (test DOM) | 20.11.1 → 21.0.4 | major |
      | markdown-it | 2 high, 1 moderate, 1 low | direct (help pages) | 14.3.0 → 14.3.3 | patch |
      | vite | 1 high, 4 moderate, 1 low | direct (dev server) | 8.2.0 → 8.3.8 | minor |
      | sharp | 1 high | `@vite-pwa/assets-generator` | 0.35.4 → 0.35.5 | override bump |
      | source-map-js | 1 high | postcss, madge | 1.2.1 → 1.2.4 | in range |
      | fast-uri | 2 moderate, 2 low | ajv | 3.1.7 → 3.1.9 | override bump |
      | minimatch | 1 moderate | stryker, madge, `glob` 11/13 | 10.2.6 → 11.0.9 | major, override |
      | brace-expansion | 1 moderate | workbox-build → filelist | 2.1.4 → 2.1.8 | in range |
      | moment | 1 moderate | rollup-plugin-license | 2.30.1 → 2.31.0 | in range |
      | qs | 1 moderate | stryker | 6.16.0 → 6.17.1 | override bump |
      | serialize-javascript | 1 low | workbox-build terser | 7.0.7 → 7.1.4 | override bump |

      `npm audit` also named `zod` < 4.6.6 (high; openspec, stryker), not yet
      a Dependabot alert: lifted in range to 4.6.7.
- [x] 1.2 For each, whether the vulnerable code is reachable from the app
      or the build, and what upgrading costs (a patch, a minor, a major).

      None ships to a player. The build reaches markdown-it, handlebars,
      sharp, serialize-javascript and minimatch (through workbox's `glob`),
      on input the repo writes itself; vite's alerts are dev-server ones.
      The majors: happy-dom 21 (test DOM only); minimatch 11, which drops
      `makeRe` and the RegExp `set` — its callers here use only
      `minimatch()`, except `glob` < 14, which reads the set, so `glob` is
      lifted to 14 (built on minimatch 11) by the same override. No minimatch
      10.x carries the fix, and stryker pins `~10.2.4` even at its latest.

## 2. Fix

- [x] 2.1 Upgrade the direct dependencies; `npm ls <pkg>` for each
      transitive one, and lift it by its parent or an `overrides` entry.
- [x] 2.2 `npm audit` and the gate; run the app (a build, a game played, a
      reload offline) where a runtime dependency moved.

      `npm audit`: 0. The build passes, and its precache-coverage check
      holds; the precache has 313 entries against HEAD's 327, because
      Vite 8.3 merges small chunks, not because a file went unmatched.
      In Chrome on `vite preview`: Tents played (tents, grass, the
      adjacency and column errors drawn); offline use turned on, the worker
      activated and took control, then with the network off Mines loaded,
      dealt a board, and its help page rendered.
- [x] 2.3 An alert left open goes to the owner with a recommendation.
      None is left open.

## 3. Finish

- [ ] 3.1 Commit, push, confirm the alerts close on GitHub, archive.
