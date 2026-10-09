# ts-migration Specification

## Purpose

The rules the port from upstream's C to native TypeScript left standing:
upstream's C as a readable reference and not a byte-oracle, a clean save
format with stable game IDs, and acceptance by exercising a game and not by a
green suite, with touch accepted on a device. What a tier and a generator
promise is `engine-difficulty`, and a params encoding's stability is
`engine-params`.

## Requirements

### Requirement: Clean TS save format, and future game IDs stay stable

The project SHALL use a clean TypeScript-native save format. Compatibility
with the C-serialization save format, and with shared game IDs from before the
TypeScript engine, SHALL NOT be required. A game ID the TypeScript engine
hands out SHALL remain stable and shareable: it names its board
(`params:desc`), and names the same board on every build.

#### Scenario: Old C-format save is not required to load

- **WHEN** a save produced by the C-serialization path is presented to the TS
  engine
- **THEN** the engine is NOT required to load it
- **AND** this is not treated as a defect

#### Scenario: A shared game ID reproduces its board

- **WHEN** a game ID the TS engine handed out is entered on another TS-engine
  build
- **THEN** the same board is produced

### Requirement: A C source kept as a reading reference lives with its change

A C source kept as a reading reference for scaffolded future work SHALL live
with the change that reads it (`openspec/changes/<change>/reference/`), and
SHALL carry a README recording its provenance, its license, and the fact that
it cannot be compiled or run. No other C source, and no build system for C,
SHALL be in the working tree. The reference is thereby archived with the work
that consumed it, and one nobody needed is deleted with its change.

#### Scenario: A reading reference is kept with its change

- **WHEN** an upstream C source is retained as reading material for a
  scaffolded change
- **THEN** it lives under that change's `reference/` directory
- **AND** a README there states its provenance, its license, and that it does
  not compile
- **AND** no C source outside a change's `reference/` directory, and no build
  system for C, is in the working tree

### Requirement: Game work is accepted by exercising it, not by a green suite

Acceptance of work on a game SHALL require that its actual behavior be
exercised: rendering, animation and input, not merely internal state
transitions. This covers a new game, a rendering or input change, an
animation, and a hint. A passing automated suite alone SHALL NOT be treated as
done: one asserting only state transitions passes on a game that draws
nothing. A shortfall found this way SHALL NOT be dismissed as "cosmetic" or
"out of scope", nor deferred without explicit owner agreement.

#### Scenario: A green suite is not sufficient

- **WHEN** a game's automated tests pass but its rendering, animation and
  input have not been exercised
- **THEN** the work is not accepted, and the change is not archived

### Requirement: Upstream's C is a readable reference, not a byte-oracle

Upstream's C source, readable in git history and in a sibling clone, SHALL be
treated as a readable reference for the logic it encodes, NOT as a fidelity
oracle. A game is "done" when it plays correctly and passes ordinary
behavioral tests, NOT when it reproduces upstream's output, and no game's
generator, solver, description or rendering SHALL be required to match
upstream's byte-for-byte. The project SHALL NOT track upstream or merge from
it.

#### Scenario: A ported game is accepted without a golden corpus

- **WHEN** a game has been ported to TS and plays correctly under manual and
  automated behavioral tests
- **THEN** it is accepted as done
- **AND** no byte-identical characterization corpus is required for acceptance

#### Scenario: Deliberate divergence from upstream is allowed

- **WHEN** a feature is added that upstream does not have (quick-save,
  mistake-check, explained hint, a per-game gameplay aid such as Galaxies
  cell↔dot marking)
- **THEN** the divergence is expected and acceptable
- **AND** it is NOT treated as a fidelity regression

### Requirement: Touch acceptance happens on a device, and a synthesized pointer is not one

Work whose correctness is *how it feels under a finger* SHALL be accepted on a
real touch device against a deployed build. The in-process tiers and a
synthetic-pointer browser pass SHALL NOT be offered as that acceptance: a
browser driving `PointerEvent`s with `pointerType: "touch"` exercises the
frontend's own decision logic faithfully and says nothing about a hand.

#### Scenario: A touch fix is accepted

- **WHEN** a change repairs or alters behavior under touch
- **THEN** its acceptance is performed on a real device against a deployed
  build, or is explicitly carried forward by a named change

### Requirement: Device acceptance carried forward is carried explicitly

A change archived on the code's evidence, with its device acceptance carried
forward, SHALL record the deferral in the change and SHALL name the change
that will discharge it. A browser pass SHALL NOT be written up in a way that
reads as a device pass.

#### Scenario: A browser pass is not written up as a device pass

- **WHEN** a change reports a Chrome pass using synthesized touch pointers
- **THEN** it states what that evidence covers, the frontend's decision, and
  what it does not: hit targets, gesture timings suited to a hand, and how the
  result feels

### Requirement: A device pass records a verdict per item, not an overall impression

A device pass SHALL enumerate what it checked and give each item a verdict, in
the shape of a sweep rather than a summary, so that it leaves a record of what
it covered. A finding SHALL distinguish **"the input was not delivered"** from
**"the input was delivered and the result feels wrong"**: they have different
causes and different fixes.

#### Scenario: A device pass is recorded

- **WHEN** a device pass completes
- **THEN** its report names each game, gesture and platform capability
  checked, with a verdict for each, including the ones that passed
