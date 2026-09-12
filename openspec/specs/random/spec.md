# random Specification

## Purpose
The seeded random-number generator that game generation draws on, whose stream
stays the same in every build of this app so that a seeded game ID keeps feeding
the generator the same numbers, and the committed corpus that holds it to that
(recorded, historically, from upstream's `random.c`).

## Requirements

### Requirement: Characterization corpus is committed to the repository

The repository SHALL contain a JSON corpus under `src/engine/random/__fixtures__/` capturing input seeds, call scripts, and recorded outputs (recorded, historically, from upstream's C implementation). The corpus SHALL cover varied bit counts (including 32), varied `randomUpto` limits (including non-powers-of-two), the SHA-rollover path, `randomCopy` independence, and `randomStateEncode`/`randomStateDecode` round-trips.

The corpus is **frozen** and SHALL NOT be re-baselined: it pins the random stream every seeded game ID depends on, so a change that moved it would silently change the board behind every seed a player has shared. Where it came from is history; what it holds the module to is stability across this app's builds.

#### Scenario: Corpus covers the named edge cases

- **WHEN** the corpus is inspected
- **THEN** at least one fixture exercises `randomBits(state, 32)`
- **AND** at least one fixture exercises a `randomUpto` with a non-power-of-two limit
- **AND** at least one fixture exercises enough calls to trigger the `state.pos >= 20` SHA rollover
- **AND** at least one fixture exercises `randomCopy` and confirms the copy advances independently
- **AND** at least one fixture exercises `randomStateEncode` followed by `randomStateDecode`

### Requirement: The random module's output is stable across builds

The TypeScript implementation in `src/engine/random/index.ts` SHALL produce, for every call in the characterization corpus, exactly the output the corpus records, so its output is stable across builds. That stability is a product requirement: existing game IDs and shared seeds must keep producing the same boards.

The implementation SHALL expose, at minimum, upstream's public surface under TypeScript names: `randomNew(seed)`, `randomBits(state, bits)`, `randomUpto(state, limit)`, `randomCopy(state)`, `randomStateEncode(state)`, `randomStateDecode(encoded)`. It SHALL NOT expose a counterpart to upstream's `random_free`: a state is garbage-collected like any other value.

The TS module SHALL bundle its own SHA-1 internally (currently at `src/engine/random/sha1.ts`).

The module lives under `src/engine/` because it is an engine library that game generators import. It was a top-level `src/native/random/` only because the retired bottom-up migration gave every ported seam its own folder next to the engine.

#### Scenario: Corpus replay passes byte-for-byte

- **WHEN** the Vitest replay loads each fixture in `src/engine/random/__fixtures__/` and replays the recorded call sequence against `src/engine/random/index.ts`
- **THEN** every returned value matches the recorded value byte-for-byte
- **AND** every `randomStateEncode` output matches the recorded hex string character-for-character

#### Scenario: randomBits handles the SHA rollover

- **WHEN** the call sequence consumes more than 20 bytes of databuf so that `state.pos >= 20` triggers seedbuf increment and re-hash
- **THEN** the post-rollover bytes match the corpus

#### Scenario: randomBits returns 32-bit values without precision loss

- **WHEN** `randomBits(state, 32)` is called
- **THEN** it returns the unsigned 32-bit value the corpus records, with no sign extension and no precision loss

#### Scenario: encode/decode round-trip preserves state

- **WHEN** a state is encoded with `randomStateEncode` and decoded with `randomStateDecode`
- **THEN** subsequent `randomBits` and `randomUpto` calls on the decoded state produce the same outputs as on the original
