# Verdicts: ts-engine

## keep `ts-engine`: A game depends on the `Game` interface and never on the midend

No check holds it. `src/module-layering.test.ts` has four import rules (no game
imports another game; the engine does not import games; the engine and games
import nothing above them; no runtime cycle), and the midend is inside the
engine, so a game importing `src/engine/midend.ts` passes all four. The rule
holds today: `git grep -l` for an import of `midend` under `src/games`,
tests excluded, finds no file (17 test files drive a `Midend`, which is the
harness and not the game). The spec is the only statement of it.

## reword `ts-engine`: Per-game engine selection is a runtime registry, not a build flag

The build-flag half is gone and nothing it refuses can be proposed: there is
one engine. Searched `src`, `vite.config.ts`, `package.json` and `scripts` for
`.wasm`, `emscripten` and `emcc` (comments and frozen-fixture provenance only),
and for a C source or `CMakeLists.txt` outside a change's `reference/` (none).
"Selection" between engines has no second engine to select. What still binds
is kept word for word: the registry keyed by `puzzleId` and filled by
`registerGame` side effects, and the explicit failure with no fallback
(`src/puzzle/worker.ts`, "No game is registered for puzzleId"). No source or
guide cites the title (`spec-citations.mjs --list`; `git grep` for the title
finds only the spec), so it is free to change.

### Requirement: A game is resolved at runtime through the registry, and an unregistered id fails

The engine SHALL resolve a game's implementation at runtime through a registry
keyed by `puzzleId`, populated by `registerGame(...)` side effects. A
`puzzleId` absent from the registry is unplayable: the worker SHALL fail
explicitly for it and SHALL NOT fall through to another implementation.

#### Scenario: An unregistered puzzle id fails explicitly

- **WHEN** the worker is asked for a `puzzleId` with no registered `Game`
- **THEN** it raises an error naming the id
- **AND** no fallback implementation is attempted

## keep `testing`: The shared slice holds the cost discipline of a searching hint

It is a shared helper's promise and a refusal, not how the helper is built.
`docs/games/testing.md` § "Slicing a preset sweep for the gate" says only that
`gatePresets` "decides the search-planning games' cost discipline for you";
what the discipline is (every mode on the smallest board offering it, no large
board, derived from the same axes, never a count of presets to keep) is stated
nowhere but here and the comment on `gatePresets` in
`src/engine/testing/hint-games.ts`. A session speeding up a sweep would reach
for a preset count first, and this is what tells it not to.

## keep `testing`: Every value is dealt, the generator's choices included

The ledger would be proposed again: a symmetry or density value costs a deal
per sweep and no hint reads it, which is exactly the argument for excusing it.
`docs/games/testing.md` § "Slicing a preset sweep for the gate" says every
value of a `"boolean"` or `"choices"` item is dealt and that "there is no
list", and does not state the refusal or name the generator's own choices
(searched the guide for "unlikely", "symmetry", "second copy": no statement of
it).

## keep `testing`: Whether every value is dealt is asserted apart from the derivation

It is the reason for a guard and no guide states it. The assertion exists as
`hint-enrollment.test.ts`, "deals a board for every value of every closed set,
or says why not", whose comment says it is recomputed from `paramConfig` and
the dealt boards "never through `unofferedValues`". Without the rule the
obvious tidying is to reuse the derivation, which makes the assertion unable
to fail when the derivation is wrong.

## keep `ts-engine`: A `Game` member read only by a guard, or by nothing, is recorded

It says more than the general ledger rule of `docs/games/testing.md` § "How a
cross-game guard finds its population", rule 3, which is one entry per member
with its reason, held equal to the derivation. This adds two decisions of its
own: a cross-game guard counts as a real reader of a `Game` member
(`TEST_ONLY_CONSUMER` in `src/contract-surface.test.ts`), and a member with no
consumer is recorded against the change that owns the decision, never bare
(`NO_CONSUMER`). The guide names the ledger as an exemplar and states neither.

## keep `ts-engine`: A shared mechanic is joined by having it, not by declaring it

Cited by title from `docs/games/testing.md` § "How a cross-game guard finds
its population", which calls it the normative form. The doubt was whether that
guide may be the only home of the floor, ledger and slice-scan rules already
cut as `process`: it states each (rule 1, derive from what the game is; rule
2, the floor under the population drawn from; rule 3, the ledger held equal to
the derivation, and that a missing section is the game's `notApplicable`
reason and not a ledger entry; § "Slicing a preset sweep for the gate", the
scan for `firstLeaf(`/`.withTier(` and its ledger). Those are how a guard is
written, the guide is where a session writing one reads, and this requirement
keeps the rule they follow from. Nothing to restore.

## keep `ts-engine`: The midend translates preferences to the app's config shapes

The zero-based index is a promise to stored data, not a description of types.
`settings-dialog.ts` passes the form's changed `ConfigValues` to
`settings.setPuzzlePreferences`, which persists them as they are
(`src/store/settings.ts`), and `puzzle-screen.ts` reads them back with
`getPuzzlePreferences` and hands them to `setPreferences`. A `choices`
preference is therefore stored on the player's device as its index, and
reordering a game's choices changes what a stored preference means. `Midend`,
`EngineCore` and `TsWorkerPuzzle` all exist under those names.

## note `ts-engine` nothing checks that a game does not import the midend

"A game depends on the `Game` interface and never on the midend" is held by no
guard. `src/module-layering.test.ts` would take a fifth rule in a few lines:
no non-test module under `src/games/` resolves an import to
`src/engine/midend.ts`. It passes today (no offender). Not written here, since
this pass changes no code.
