# give-a-game-its-verdict-in-one-command

**Status: built 2026-10-12.** Third of the pieces of
`fit-a-new-game-in-one-session`, whose proposal holds the measurements. The
command is `npm run game -- <id>`; `design.md` says how it narrows, what it
costs and what it found.

## Why

A game's own tests run in 4 to 6 seconds (Clusters 3.6 s, Tents 6.5 s,
measured 2026-10-12). They are not its verdict. What refuses a new game's
commit is the cross-game guards, which take their population from the
registry and run in the gate, twelve minutes in. `docs/testing.md`
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

## What registering a copy of the skeleton found (2026-10-12)

`hold-the-game-skeleton-to-the-compiler` stamped a game from the skeleton,
registered it and ran the source scans and every cross-game guard against it
(its `design.md` § "The first day"). Three refusals were the skeleton's own
and are mended there. Five were records kept by hand that a game with
nothing wrong with it is refused by until someone adds it, and they are this
change's to weigh, since each is a verdict that arrives late and says
nothing about the game:

| Guard | What a new game must add by hand |
| --- | --- |
| `asset-integrity.test.ts` | its two icons (a real thing to make) |
| `help-coverage.test.ts` | its row in `help/puzzles.md` |
| `params-read-whole.test.ts` | its id in `UPSTREAM`, a record of params strings upstream's encoder wrote, which a game written here never had |
| `hint-mark.test.ts` | `expect(CHECKED.length).toBe(50)`, a census of renderers pinned as a literal |
| `capability-surface.test.ts`, `params-stability.test.ts` | a snapshot row each |

The doctrine is that a guard derives its population from what each game is.
`UPSTREAM` and the pinned 50 are the two that do not: the first should ask
nothing of a game with no upstream, and the second is a floor
(`toBeGreaterThanOrEqual`) or a derived count. The command this change
builds should at least name all five on a game's first run.

## Capabilities

`testing` gains three requirements for the command.

## Impact

`package.json`, `scripts/`, the population helpers under
`src/engine/testing/`, `docs/testing.md`.
