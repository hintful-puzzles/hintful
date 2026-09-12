## ADDED Requirements

### Requirement: The TypeScript random module reproduces upstream's output byte-for-byte

The TypeScript implementation in `src/engine/random/index.ts` SHALL produce byte-identical output to upstream's `random.c` for every call in the characterization corpus. Bit-identical reproducibility is a product requirement: existing game IDs and shared seeds must keep working.

The implementation SHALL expose, at minimum, upstream's public surface under TypeScript names: `randomNew(seed)`, `randomBits(state, bits)`, `randomUpto(state, limit)`, `randomCopy(state)`, `randomStateEncode(state)`, `randomStateDecode(encoded)`. It SHALL NOT expose a counterpart to upstream's `random_free`: a state is garbage-collected like any other value.

The TS module SHALL bundle its own SHA-1 internally (currently at `src/engine/random/sha1.ts`).

The module lives under `src/engine/` because it is an engine library that game generators import. It was a top-level `src/native/random/` only because the retired bottom-up migration gave every ported seam its own folder next to the engine.

#### Scenario: Corpus replay passes byte-for-byte

- **WHEN** the Vitest replay loads each fixture in `src/engine/random/__fixtures__/` and replays the recorded call sequence against `src/engine/random/index.ts`
- **THEN** every returned value matches the C-recorded value byte-for-byte
- **AND** every `randomStateEncode` output matches the C-recorded hex string character-for-character

#### Scenario: randomBits handles the SHA rollover

- **WHEN** the call sequence consumes more than 20 bytes of databuf so that `state.pos >= 20` triggers seedbuf increment and re-hash
- **THEN** the TS impl produces the same post-rollover bytes as the C impl

#### Scenario: randomBits returns 32-bit values without precision loss

- **WHEN** `randomBits(state, 32)` is called
- **THEN** the TS impl returns the same unsigned 32-bit value as the C impl, with no sign extension and no precision loss

#### Scenario: encode/decode round-trip preserves state

- **WHEN** a state is encoded with `randomStateEncode` and decoded with `randomStateDecode`
- **THEN** subsequent `randomBits` and `randomUpto` calls on the decoded state produce the same outputs as on the original

## MODIFIED Requirements

### Requirement: Characterization corpus is committed to the repository

The repository SHALL contain a JSON corpus under `src/engine/random/__fixtures__/` capturing input seeds, call scripts, and recorded outputs from the native C implementation. The corpus SHALL cover varied bit counts (including 32), varied `randomUpto` limits (including non-powers-of-two), the SHA-rollover path, `randomCopy` independence, and `randomStateEncode`/`randomStateDecode` round-trips.

The corpus is a **frozen oracle** and SHALL NOT be re-baselined: the C build that recorded it is deleted. It is what keeps shared game IDs reproducible across builds, which was always its real job.

#### Scenario: Corpus covers the named edge cases

- **WHEN** the corpus is inspected
- **THEN** at least one fixture exercises `randomBits(state, 32)`
- **AND** at least one fixture exercises a `randomUpto` with a non-power-of-two limit
- **AND** at least one fixture exercises enough calls to trigger the `state.pos >= 20` SHA rollover
- **AND** at least one fixture exercises `randomCopy` and confirms the copy advances independently
- **AND** at least one fixture exercises `randomStateEncode` followed by `randomStateDecode`

## REMOVED Requirements

### Requirement: TypeScript random module reproduces C output byte-for-byte

**Reason**: It listed the surface as upstream's C names (`random_new`, `random_bits`, …) including a `random_free` the module has never had, and two of its scenario headings name those C functions, which a `MODIFIED` block cannot rename.

**Migration**: Replaced by "The TypeScript random module reproduces upstream's output byte-for-byte", which states the same obligation with the exported TypeScript names and says why there is no free.
