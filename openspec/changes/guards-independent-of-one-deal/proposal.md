## Why

Filed on the owner's word, 2026-11-19, from the review of the Wordguess and
Wordtrail session logs.

Two cross-game guards read the frames of one board each game deals from a
fixed seed. A change to shared data moves that board, and the guard fails
for a reason that has nothing to do with the change:

- **`src/puzzle/mark-collisions.test.ts`** holds its `DECLARED` ledger exact
  against the marks of one dealt frame. Giving Wordtrail's words their own
  colors failed it (2026-11-19, 15:17); then a word-list change, which only
  altered which board the seed dealt, failed it the other way: "every
  collision is declared, and every declaration collides" (15:45). Wordtrail's
  three declared pairs depend on how many words that one board shows.
- **`src/engine/warm-repaint.test.ts`** needs a seeded run to paint every
  mark a renderer can paint, and a game pins a board by hand (`PINNED`) for
  any mark the seeded run misses. A shared word-list edit made for Wordtrail
  moved Wordguess's seeded deal, and the guard reported
  `marks the renderer can paint that no run painted: ['outline|slot']`
  (15:59). The agent found a new pin by trial and error over hint pins.

Each cost a gated commit and minutes of searching, and either will recur
whenever a dealer, a shared word list or a random helper changes.

## What Changes

- Mark-collisions' ledger declares a collision by the slots' meaning (a
  slot against a family of slots, such as each word color), and is held
  exact against what the game can draw, not against one frame: a pair is
  stale when no board of a declared set shows it.
- Warm-repaint finds a board that paints each mark the seeded run missed by
  a bounded, deterministic search over seeds, instead of a hand-picked pin,
  and a pin stays only for a mark no search within the bound reaches.

## Impact

The two test files and their helpers (`src/puzzle/mark-collisions.ts`,
`src/engine/testing/`); `docs/testing.md` § "What a game owes the cross-game
guards".
