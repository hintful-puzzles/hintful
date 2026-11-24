## Why

Measured 2026-11-24 at 98b5275e2:

- **Each description field is documented three times**: the TS types and
  JSDoc in `src/describe/description.ts`, the `description` strings of
  `description.schema.json` (527 properties, 242 descriptions), and the
  prose of `docs/descriptions.md` § "The file". The capability-fixtures
  guard reads the schema; nothing ties the TS types to it. `DealJson` is a
  `Record<string, …>` read through casting accessors.
- **The guides keep hand-written lists of born games, and they are stale**:
  `docs/new-game.md` § "A game born from its description" omits Solo, and
  `docs/descriptions.md` lists eight of 21. `BORN_GAMES` already exists.
- **`docs/descriptions.md` is 2,574 lines** (+436 in three days) and its
  § "What every game does" still teaches the hand-written route first. No
  guide defines born, rung, walk, slot, part and partition in one place.
- **Leftovers**: `src/skeleton/grid` is superseded for fill-shaped games;
  `src/engine/describe-runtime/` is an empty directory; the hand-written
  candidate adapters (`hint/candidate-hint.ts`, `latin-hint.ts`,
  `latin-notes.ts`) remain beside `fill/candidates.ts` for the games not
  yet born.

## What Changes

- **One source for the description's shape**: the TS types are generated
  from the schema, or the schema from the types, and a check holds them
  together; `DealJson` is typed.
- **`docs/descriptions.md` § "The file" points at the schema** instead of
  restating each field, and the born route comes first.
- **A short vocabulary section** in `docs/descriptions.md`.
- **No guide lists born games by hand**: a list becomes a query, or is
  deleted.
- **Dead code removed**: the empty directory; `skeleton/grid` and any
  adapter once nothing routes to it, or a note of what still does.

## Capabilities

### Modified Capabilities

- `described-fill-game`: the description's shape has one source.

## Impact

`src/describe/`, `scripts/describe.ts`, `docs/descriptions.md`,
`docs/new-game.md`, `src/skeleton/`. No player-visible change.
