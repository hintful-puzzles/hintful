# Ledger: random

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## Characterization corpus is committed to the repository

| Rule | Where it went |
| --- | --- |
| A JSON corpus of input seeds, call scripts and recorded outputs sits under `src/engine/random/__fixtures__/` | spec: Characterization corpus is committed to the repository |
| The corpus covers varied bit counts including 32, varied `randomUpto` limits including non-powers-of-two, the SHA rollover, `randomCopy` independence and the encode and decode round trip | spec: Characterization corpus is committed to the repository |
| The corpus was recorded from upstream's C implementation, and where it came from is history | history |
| The corpus is frozen and is not re-baselined | spec: The characterization corpus is frozen |
| It pins the random stream, and what it holds the module to is stability across this app's builds | spec: The characterization corpus is frozen |
| A change that moved the stream would silently change the board behind every seed a player has shared | untrue: no part of the app hands a seed out, and a seed's board already changes whenever a generator does (`openspec/specs/app-shell/spec.md`, "The app hands out boards, never seeds", and `docs/doctrine.md`), so the reason now says what the module does hold, the numbers a seed feeds a generator |
| Scenario: the corpus covers the named edge cases | spec: Characterization corpus is committed to the repository |
| The rollover is the `state.pos >= 20` test | spec: The random module's output is stable across builds |

## The random module's output is stable across builds

| Rule | Where it went |
| --- | --- |
| `src/engine/random/index.ts` produces, for every call in the corpus, exactly the recorded output, so its output is stable across builds | spec: The random module's output is stable across builds |
| That stability is a product requirement, since existing game IDs and shared seeds must keep producing the same boards | untrue: the module holds the stream and not the board, which a generator change moves, and the app hands out no seed (`openspec/specs/app-shell/spec.md`, "The app hands out boards, never seeds" and "A seed ID still deals a game"), so the requirement gives the stream as its reason |
| The module exposes at least `randomNew`, `randomBits`, `randomUpto`, `randomCopy`, `randomStateEncode` and `randomStateDecode`, upstream's public surface under TypeScript names | spec: The random module exposes upstream's public surface, without a free |
| No counterpart to upstream's `random_free`, since a state is garbage-collected | spec: The random module exposes upstream's public surface, without a free |
| The module bundles its own SHA-1 internally | spec: The random module bundles its own SHA-1 |
| The SHA-1 is currently at `src/engine/random/sha1.ts` | held: src/engine/random/index.ts "./sha1.ts" |
| The module lives under `src/engine/` because it is an engine library that game generators import | spec: The random module lives in the engine |
| It was a top-level `src/native/random/` under the retired bottom-up migration | history |
| Scenario: the corpus replay passes byte for byte, and every encoded state matches character for character | spec: The random module's output is stable across builds |
| The replay is a Vitest test | held: src/engine/random/random.test.ts "Replay the C-recorded" |
| Scenario: `randomBits` handles the SHA rollover past 20 bytes | spec: The random module's output is stable across builds |
| Scenario: `randomBits` returns an unsigned 32-bit value with no sign extension and no precision loss | spec: The random module's output is stable across builds |
| Scenario: an encode and decode round trip preserves the state | spec: The random module's output is stable across builds |
