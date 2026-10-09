# random Specification

## Purpose
The seeded random-number generator that game generation draws on, whose stream
stays the same in every build of this app so that a seed keeps feeding a
generator the same numbers, and the frozen corpus that holds it to that.

## Requirements

### Requirement: The characterization corpus is frozen

The corpus under `src/engine/random/__fixtures__/` SHALL NOT be re-baselined. It pins the stream a seed produces, and what it holds the module to is stability across this app's builds: a change that moved the stream would silently change the numbers every seed feeds a generator.

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

#### Scenario: randomBits returns 32-bit values without precision loss

- **WHEN** `randomBits(state, 32)` is called
- **THEN** it returns the unsigned 32-bit value the corpus records, with no sign extension and no precision loss

#### Scenario: encode/decode round-trip preserves state

- **WHEN** a state is encoded with `randomStateEncode` and decoded with `randomStateDecode`
- **THEN** subsequent `randomBits` and `randomUpto` calls on the decoded state produce the same outputs as on the original
