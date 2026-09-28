## ADDED Requirements

### Requirement: A warm frame matches a fresh paint of the same state

For every registered game, a frame drawn on a draw state that has painted earlier
frames SHALL show what the same frame shows drawn on a fresh draw state. A render
cache that repaints a tile only when its key changes breaks this whenever the
painter reads something the key does not carry — two flags sharing a bit, a value
overflowing its field, or an input the key never names — and every one of those
is invisible to a snapshot, which starts from a fresh draw state.

`src/engine/warm-repaint.test.ts` SHALL drive each game through seeded input on a
real `Midend` and compare every frame against its fresh twin
(`engine/testing/repaint-differential.ts`). The comparison SHALL claim for each
op only pixels the op surely paints, so that a difference is stale content and
never an artifact of the approximation. The population is the registry, and the
test SHALL assert that it looked at the whole registry and compared frames.

#### Scenario: A painter input is missing from the key

- **WHEN** a game paints a tile from state its cache key does not include, and
  that state changes while the key does not
- **THEN** the warm frame differs from the fresh one and the test fails, naming
  the game, the frame, the event before it and the differing pixel

#### Scenario: A packed field overflows onto another

- **WHEN** a value shifted into a key wraps onto another field's bit
- **THEN** two different draw states share a key, the warm frame keeps the older
  one, and the test fails

### Requirement: The engine owns the candidate encoding

A candidate value `n` SHALL be bit `n` of a 32-bit mask, through the engine's
`valueBit` and `valuesOneTo` (`engine/candidate-bits.ts`), which SHALL refuse a
value the mask cannot hold rather than wrap. A game's largest value SHALL be at
most `MAX_CANDIDATE_VALUE`.

An `OverlaySidecar` SHALL keep a step's struck marks in a lane of their own, in
the game's encoding, never in the word that carries the target and evidence
roles, and its stale test SHALL cover that lane.

#### Scenario: The highest values of a 31-value game

- **WHEN** a hint strikes candidate 30 or 31 from a cell
- **THEN** the struck lane holds that value's bit, the role word is untouched,
  and swapping a struck 30 for a target on the same cell makes the cell stale

#### Scenario: A value past the mask

- **WHEN** code asks for the bit of value 32
- **THEN** it throws a `RangeError` instead of returning another value's bit
