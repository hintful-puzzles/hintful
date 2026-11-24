## Why

Measured 2026-11-24 at 98b5275e2, the description language grew a key for
each game's need, and some of those keys say the same thing:

- **A setting the params give is spelled eight ways**: `play.modifiers`,
  `play.sizes` (rulesets), `deal.options`, `deal.onlyFlag`,
  `deal.kindLetters`, `deal.thorough`, `play.tally`, `play.blocks`. Several
  are documented by naming a game (`description.ts` around 497–531).
- **The ID codec has 12 segment kinds for 21 games**, 6 used by one game
  (runs, lists, cells, glyphs, parts, codes), and `digits` has five
  optional sub-fields (`apart`, `before`, `letters`, `after`, `also`) that
  exist to match upstream's bytes. `engine/fill/game-id.ts` sits beside the
  declared `engine/game-id/params-codec.ts`, which says it cannot express
  Solo's symmetry, so there are two codecs.
- **About 15 description keys have one user**: `play.tally`, `play.shape`
  (Boats), `wash`, `sweepWith` (Light Up), `hides`, `wrap` (Singles),
  `deal.oneKind`, `onlyFlag` (Keen), `firstKind`, `kindLetters` (Mathrax),
  `glance`, `askBefore`, `links` (Tents), `thorough` (Mosaic). The deal's
  hide went through three keys in one day (`hideInTurn`, `hideFirst`,
  `hideBy`), each for the game in hand.
- **Fixtures are named for games** (killing, fleet, washing), not concepts.

The owner's rule (2026-11-23, `every-game-is-engine-capabilities`): a
one-off option is fine if another game could in principle adopt it. At 45
more games, the cost is in the options and their combinations, so each one
is named for its concept now, or folded into a neighbor.

The owner, 2026-11-24: small changes to a game's interface that make the
engine more consistent need no ask; prefer consistency and simplicity to
the status quo. Saves and IDs may move for born games (pre-approved for the
migration); upstream's IDs must still read.

## What Changes

- **One `settings` concept**: a setting has a letter, a kind (flag, number,
  choice), its Custom field, and what it gates (a variation, the deal, the
  size). The eight spellings become it.
- **One codec**: the fill game ID and the declared params codec become one,
  with segment kinds named for what they encode; a quirk upstream's bytes
  need is a property of the kind, never a new kind.
- **Each one-user key is renamed for its concept with a second fixture, or
  folded into a neighbor** (`hides`, `wash` and `shape` look like one
  "a piece covers a square" concept). The hide keys become one.
- **Fixtures are renamed for their concepts.**

## Capabilities

### Modified Capabilities

- `described-fill-game`: one settings concept, one codec, no key named for
  one game.

## Impact

`src/describe/description.ts`, `description.schema.json`, the compiler, the
fill engine's codec, every born game's description, the fixtures,
`docs/descriptions.md`. Player-visible: Custom dialog fields and labels may
reorder or be renamed for consistency; save files of born games may not
load (pre-approved); upstream game IDs still load.
