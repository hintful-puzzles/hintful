# give-a-game-its-verdict-in-one-command

**Status: scaffolded 2026-10-12, not started.** Third of the five pieces of
`fit-a-new-game-in-one-session`, whose proposal holds the measurements.

## Why

A game's own tests run in 4 to 6 seconds (Clusters 3.6 s, Tents 6.5 s,
measured 2026-10-12). They are not its verdict. What refuses a new game's
commit is the cross-game guards, which take their population from the
registry and run in the gate, twelve minutes in. `docs/games/testing.md`
tells a session how to run them against one game in three places, by a
pipeline through `scripts/checks/select-tests.ts` and `-t <game>`, and
`-t` breaks any guard that pins a count over the whole collection.

So a session writing a game learns late, and one guard at a time, what the
collection requires of it: a pinned board for every hint rung, a ledger
entry for a long sentence, a mark drawn and not named, a key the keypad
offers and the game ignores.

## What Changes

- **`npm run game -- <id>`** (the name is `design.md`'s) runs, for one game:
  the typecheck, its own tests, and every cross-game guard narrowed to that
  game, and reports each refusal with the guide section that says what the
  game owes.
- **A guard is narrowed by a population it is given, not by a test-name
  filter**, so a guard that pins a count over the collection either runs
  whole or is left to the gate, and says which.
- **It says what it did not run**, so a green result is never read as the
  gate's.
- The three instructions in `testing.md` become one.

Not in this change: making the gate faster, and any new guard.

## Capabilities

None at filing; see `.openspec.yaml`.

## Impact

`package.json`, `scripts/`, the population helpers under
`src/engine/testing/`, `docs/games/testing.md`.
