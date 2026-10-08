# move-openspec-to-1-14-0

**Status: implemented 2026-10-08.** On the owner's word the same day.

## Why

The repository pinned `@fission-ai/openspec` at `^1.13.0`, and the latest
release is 1.14.1 (2026-10-05).

- **1.13.1 to 1.14.0 are worth having.** Archive refuses a requirement name
  that differs from another only in case, an unpaired `RENAMED` and a delta
  file it would never read; a repository's `config.yaml` can no longer inject
  directives into agent instructions; `validate --strict` fails on a key in
  `.openspec.yaml` the tool ignores; `show --json` gives a requirement's name.
- **1.14.1 cannot be taken yet.** It makes a requirement over 500 characters
  fail `validate --strict`, which the gate runs. Run against this tree on
  2026-10-08 without installing it (`npx -y @fission-ai/openspec@1.14.1
  validate --all --strict`), it rejects all 80 specs, over 779 of the 924
  requirements. 1.14.0 passes with no warning. Upstream shipped that as a fix
  in a patch release and its pull request (2020) says so: "projects that
  already have overlong requirements will see `validate --strict` start
  failing after upgrading".
- **The caret would have taken it anyway.** `^1.13.0` admits 1.14.1, and only
  the lockfile held the version. An `npm update` would have broken the gate
  for every commit.

## What Changes

- The pin is exactly `1.14.0`.
- `scripts/checks/openspec-version.mjs` fails on a pin that is a range, and
  says why: a newer CLI can tighten strict validation, so moving to one is a
  change that first checks the tree passes.
- Moving to 1.14.1 is a step of `turn-the-specs-into-a-reference`, which is
  what makes the tree pass it.

The generated skills under `.claude/skills/openspec-*` are not tracked;
`openspec update` refreshes them on each machine after `npm install`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. `repo-layout`, "The openspec CLI is pinned by the repository and its
floor is asserted", already requires "a stated version".

## Impact

`package.json`, `package-lock.json`, `scripts/checks/openspec-version.mjs`.
