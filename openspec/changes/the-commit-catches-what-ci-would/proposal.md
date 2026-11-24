## Why

A review of the 68 migration sessions of 2026-11-22 to 11-24 (owner-asked,
2026-11-24) found the hooks spending the sessions' time in two ways:

- **About 45 gated commits refused on a cheap check**: biome formatting,
  unused exports, `| undefined`, British spelling, a guide citation, a
  requirement over spec-form's 500 characters, a MODIFIED delta that drops a
  scenario. The gate stops at its first refusal, so one commit took two to
  five attempts (6627deda: five), each a full background run.
- **Main red on CI at least eight times after both hooks passed**:
  `capability-surface`, `params-stability`, `hint-enrollment`, hint-walk
  fingerprints, `modifier-arrow`, `drag-cancel`, the Latin-tag guard, a
  palette token. A commit tests the games it stages, and the push runs no
  test, so a change to `src/engine/fill/` or `src/describe/` reaches the
  born games only on CI, and the next session spends its start fixing it.

## What Changes

- **The gate's fast prefix names every refusal at once**, as
  `npm run fast-checks` does, then stops before the heavy checks; and the
  refusals a tool can mend (biome's format and import order) are mended by
  one command it names, `npm run fix`.
- **An engine or compiler change tests the born games it reaches**: when the
  staged paths include the code every born game runs through, the commit's
  selection includes the guards that read every born game, and the push's
  fast set includes the snapshot guards that only CI ran.
- **An openspec delta is written from the spec it modifies**: one command
  copies a requirement with every scenario it has into a change's MODIFIED
  block, and spec-form's length bound is checked when a delta is written,
  as well as at the commit.

## Capabilities

### Modified Capabilities

- `build-pipeline`: the fast prefix reports all its refusals; the selection
  covers the born games an engine change reaches.

## Impact

`scripts/gate.sh`, `scripts/checks/select-tests.ts`, `.husky/`,
`package.json`, a new `scripts/spec-delta.ts`, `docs/testing.md`
§ "What runs when", `docs/work-management.md`. No player-visible change.
