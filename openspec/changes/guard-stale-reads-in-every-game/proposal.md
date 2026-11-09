# guard-stale-reads-in-every-game

**Status: filed on the owner's word (2026-11-09)**, for follow-ups that
help the whole catalog, from `recheck-only-what-a-binding-used`.

## Why

A compiled technique must not fire a binding on reads of the marks that a
fact of its own run has changed since (`described-ladder`). The compiler
decides which reads to make again, and when: under a count of facts, at a
slot it chooses, narrowed to the groups a binding used. Each of those is a
place where a mistake lets a stale binding fire, and nothing in the suite
asks the question for every described game.

On 2026-11-09 a planted defect made the narrowed read always hold. Of the
five games it reaches, only Palisade's tests failed (19 of them). Filling's,
Pearl's, Separate's and Tracks' all passed. The net held by luck, through one
game's tests.

## What Changes

- **A switch, like `setKeptCheck`** (`src/engine/kept-structures.test.ts`
  is the model), under which a compiled binding, before it fires, reads all
  of its binders afresh from the marks, without the compiler's narrowing or
  its counts, and throws where what it bound differs from what it would
  bind now. The compiler emits the check behind the switch, so play pays
  nothing.
- **A test that turns it on and deals and solves every described game's
  presets**, its population taken from what each game is (a game with a
  description), never from a list. It reports how many bindings it checked,
  so a run that checked none fails.

## Acceptance

- The 2026-11-09 plant (`groupRereads`' read made `true || …`) fails the
  new test on every game it reaches, Filling among them, and so does
  dropping `rechecked`'s output entirely.
- The test's runtime earns its place against `docs/testing.md`: at most a
  few deals a preset.
