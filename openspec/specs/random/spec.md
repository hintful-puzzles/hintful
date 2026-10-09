# random Specification

## Purpose
The seeded random-number generator that game generation draws on, whose stream
stays the same in every build of this app so that a seed keeps feeding a
generator the same numbers, and the committed corpus that holds it to that.

## Requirements

### Requirement: Characterization corpus is committed to the repository

The repository SHALL contain a JSON corpus under `src/engine/random/__fixtures__/` capturing input seeds, call scripts, and recorded outputs. The corpus SHALL cover varied bit counts (including 32), varied `randomUpto` limits (including non-powers-of-two), the SHA-rollover path, `randomCopy` independence, and `randomStateEncode`/`randomStateDecode` round-trips.

#### Scenario: Corpus covers the named edge cases

- **WHEN** the corpus is inspected
- **THEN** at least one fixture exercises `randomBits(state, 32)`
- **AND** at least one fixture exercises a `randomUpto` with a non-power-of-two limit
- **AND** at least one fixture exercises enough calls to trigger the SHA rollover
- **AND** at least one fixture exercises `randomCopy` and confirms the copy advances independently
- **AND** at least one fixture exercises `randomStateEncode` followed by `randomStateDecode`

### Requirement: The characterization corpus is frozen

The corpus SHALL NOT be re-baselined. It pins the stream a seed produces, and what it holds the module to is stability across this app's builds: a change that moved the stream would silently change the numbers every seed feeds a generator.

#### Scenario: A replay that fails is not fixed in the corpus

- **WHEN** a change to the module makes a recorded output stop matching
- **THEN** the module is corrected
- **AND** the recorded output is left as it was

### Requirement: The random module's output is stable across builds

The TypeScript implementation in `src/engine/random/index.ts` SHALL produce, for every call in the characterization corpus, exactly the output the corpus records, so its output is stable across builds and a seed keeps feeding a generator the same numbers.

#### Scenario: Corpus replay passes byte-for-byte

- **WHEN** each fixture in `src/engine/random/__fixtures__/` is loaded and its recorded call sequence is replayed against `src/engine/random/index.ts`
- **THEN** every returned value matches the recorded value byte-for-byte
- **AND** every `randomStateEncode` output matches the recorded hex string character-for-character

#### Scenario: randomBits handles the SHA rollover

- **WHEN** the call sequence consumes more than 20 bytes of the state's data buffer, so that the seed buffer is incremented and hashed again
- **THEN** the post-rollover bytes match the corpus

#### Scenario: randomBits returns 32-bit values without precision loss

- **WHEN** `randomBits(state, 32)` is called
- **THEN** it returns the unsigned 32-bit value the corpus records, with no sign extension and no precision loss

#### Scenario: encode/decode round-trip preserves state

- **WHEN** a state is encoded with `randomStateEncode` and decoded with `randomStateDecode`
- **THEN** subsequent `randomBits` and `randomUpto` calls on the decoded state produce the same outputs as on the original

### Requirement: The random module exposes upstream's public surface, without a free

The TypeScript implementation in `src/engine/random/index.ts` SHALL expose, at minimum, upstream's public surface under TypeScript names: `randomNew(seed)`, `randomBits(state, bits)`, `randomUpto(state, limit)`, `randomCopy(state)`, `randomStateEncode(state)`, `randomStateDecode(encoded)`. It SHALL NOT expose a counterpart to upstream's `random_free`: a state is garbage-collected like any other value.

#### Scenario: A generator is done with its state

- **WHEN** a caller has finished drawing from a state made by `randomNew` or `randomCopy`
- **THEN** it drops the reference
- **AND** the module offers no call to release the state

### Requirement: The random module bundles its own SHA-1

The random module SHALL bundle its own SHA-1 internally.

#### Scenario: A state is seeded

- **WHEN** `randomNew(seed)` is called
- **THEN** the hashes that fill the state come from the SHA-1 beside the module in `src/engine/random/`

### Requirement: The random module lives in the engine

The module SHALL live under `src/engine/`, because it is an engine library that game generators import.

#### Scenario: A game's generator draws a number

- **WHEN** a game's generator needs `randomUpto`
- **THEN** it imports it from `src/engine/random/index.ts`
