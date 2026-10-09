# Verdicts: random

## note The cut of "The random module bundles its own SHA-1" stands

It is not in the regrouped spec and is not restored, and it is not a question
for the owner. Which implementation computes the hash is `how`; the two things
a swap could break are both held. A hash that produced other bytes fails the
frozen corpus ("The random module's output is stable across builds"). An
asynchronous digest such as WebCrypto's cannot be dropped in, because
`randomNew`, `randomBits` and `src/engine/obfuscate.ts` are synchronous and
every generator calls them so: the compiler refuses it.

## keep `random`: The random module's output is stable across builds

The scenario "encode/decode round-trip preserves state" stays, and the doubt's
guess is right: the encoded state is in a description. Mines writes a board not
laid out yet as `r<n>,u,<hex>` with `randomStateEncode`
(`src/games/mines/index.ts`) and reads it back with `randomStateDecode`,
refusing any text that does not re-encode to itself
(`src/games/mines/state.ts`, `readRandomState`). So the hex form and the
decoded state's stream are a promise to a game ID, which the prune brief keeps.

## keep `random`: The characterization corpus is frozen

Not in doubt itself; named because the third doubt weighs the spec's promise
against the comments. The spec's wording is the right one and stays: the
stream is stable across this app's builds. The header of
`src/engine/random/index.ts` already agrees with it.

## note docs/games/engine-catalog.md still gives the retired reason for two stable streams

§ "`random/` — the bit-identical RNG" says the stream "is what keeps shared
game IDs reproducible across builds", and § "`loopgen.ts` — random loop
generation" says "Byte-match critical". docs/doctrine.md ("The app hands out
boards, never seeds") retired that reason: the stream is frozen so that a seed
keeps feeding a generator the same numbers, which the fixtures and seeded
tests rest on. The two catalog sentences want bringing in line with the spec.

## note `mines` does not state the form of a description not laid out yet

The regrouped `mines` spec speaks of "a preliminary description" that says `u`
or `a` ("Mines never asks for a board that may need a guess") but no
requirement gives its form, `r<n>,<u|a>,<encoded random state>`, which
`readRandomState` parses and `newDesc` writes. It is a description encoding,
and it is the one place the app hands out what amounts to a seed: such a
board's layout depends on the stream and on Mines' generator staying as they
are until the first click.
