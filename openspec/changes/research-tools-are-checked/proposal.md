## Why

Filed on the owner's word, 2026-11-19, from the review of the Wordguess and
Wordtrail session logs.

On 2026-11-18 the agent ran the inheritance report
(`research/technique-check/inherit.ts`) for Wordguess and it failed: a commit
from the same day (606ee6199) made every technique require a name, and
`inherit.ts` passed none. Nothing had noticed, because nothing checks
`research/`:

- `tsconfig.json` includes `src`, `tsconfig.node.json` includes `scripts` and
  the build files; `research/` is in neither, though it holds TypeScript
  that imports `src/describe/` and the engine (query:
  `git ls-files 'research/*.ts'`).
- `scripts/gate.sh` lists `research/` with the documentation-only paths and
  says it "holds development tools run by hand, in Python, which no test,
  build or gate step loads". There is no Python in it.
- No CI job runs `inherit.test.ts`'s two guards or the soundness checker's.

The agent fixed `inherit.ts`, and considered putting its guards in the gate,
but declined because it would cost documentation-only commits their quick
path. A rerun later hit its 10-minute limit with no output on screen, since
vitest holds a file's console output until the file ends, and the agent
recovered an earlier report from git's unreachable objects.

The project's rule is that the typechecker sees every TypeScript file, and
that a run allowed long reports its progress as it goes.

## What Changes

- `research/` TypeScript joins a typechecked project, so a contract change
  in `src/` that breaks a research tool fails the commit that made it.
- The research tools' own cheap guards run in CI (not in the commit hook, so
  documentation-only commits keep their fast path).
- The research runners print progress as they go, line by line, in a form
  vitest does not hold back.
- The gate's comment on `research/` is corrected.

## Impact

`tsconfig*.json` or a new `research/tsconfig.json`,
`scripts/checks/typescript-projects.mjs`, `.github/workflows/gate.yml`,
`scripts/gate.sh` (the comment, and whether a research path still counts as
documentation-only once it is typechecked), `research/technique-check/`.
