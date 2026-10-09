# Cuts: random

Requirements: 6 before, 2 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| Characterization corpus is committed to the repository | declared | A list of what `src/engine/random/__fixtures__/corpus.json` holds, which its fixture names say. The corpus is frozen, so nothing is ever added to it against this list. Where it lives moved into "The characterization corpus is frozen". |
| Scenario "randomBits handles the SHA rollover" (The random module's output is stable across builds) | duplicate | Restates "Corpus replay passes byte-for-byte" for one fixture; the 32-bit and encode/decode scenarios stay, as a JavaScript trap and a save field (Mines). |
| "SHALL expose, at minimum, upstream's public surface under TypeScript names: `randomNew` … `randomStateDecode`" (The random module exposes upstream's public surface, without a free) | type | The exports of `src/engine/random/index.ts`; the compiler refuses a caller of one that is missing. |
| "It SHALL NOT expose a counterpart to upstream's `random_free`", with its scenario (same requirement) | port | A note on translating C's manual memory; nothing would propose a free in TypeScript. |
| The random module bundles its own SHA-1 | how | Which file the hash comes from. What matters is the stream, which "The random module's output is stable across builds" holds whatever computes the hash. |
| The random module lives in the engine | collection | `repo-layout` "A shared library lives under `src/engine/`", which names `random/`. |
