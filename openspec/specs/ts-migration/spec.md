# ts-migration Specification

## Purpose
The rules the port from upstream's C to native TypeScript left standing:
upstream's C as a readable reference and not a byte-oracle, a clean save
format with stable game IDs, narratable-deduction generation, acceptance by
exercising a game and not by a green suite, with touch accepted on a device,
byte-stable params encodings, what a difficulty tier promises of a board and
what a generator does when it cannot keep that promise, and the rules for a
shared helper's scope and labels.

## Requirements

### Requirement: Clean TS save format, and future game IDs stay stable

The project SHALL use a clean TypeScript-native save format. Compatibility
with the C-serialization save format, and with shared game IDs from before the
TypeScript engine, SHALL NOT be required. A game ID the TypeScript engine
hands out SHALL remain stable and shareable: it names its board
(`params:desc`), and names the same board on every build. The stream the
engine's random number generator produces for a seed SHALL be held fixed.

#### Scenario: Old C-format save is not required to load

- **WHEN** a save produced by the C-serialization path is presented to the TS
  engine
- **THEN** the engine is NOT required to load it
- **AND** this is not treated as a defect

#### Scenario: A shared game ID reproduces its board

- **WHEN** a game ID the TS engine handed out is entered on another TS-engine
  build
- **THEN** the same board is produced

### Requirement: Narratable-deduction generation policy

Every board a **logic** game generates for a non-`Unreasonable` tier SHALL be
solvable by the *same* narratable techniques that game's explained hint
teaches. A hint SHALL NOT fall back to a generic, unexplained step for a
deduction its techniques do not cover (`engine-hints`, "A hint step always
names a technique, with no un-narrated fallback").

#### Scenario: A generated board is solvable by the taught techniques

- **WHEN** a non-`Unreasonable` board is generated for a logic game that has
  adopted the policy
- **THEN** the game's narratable techniques solve it to completion with no
  guessing and no un-narrated fallback deduction

### Requirement: The solver and the hint are two projections of one deduction engine

A logic game's deductive solver and its hint SHALL be two projections of one
deduction engine. The generator runs the techniques to a fixpoint with the
recorder off and SHALL accept a board only when the techniques fully solve it;
the hint runs the same techniques with the recorder on. Deductive completion
implies uniqueness, so no separate uniqueness pass SHALL be required. The
difficulty grade SHALL be the highest **tier** reached, never a technique's
position in the ladder.

#### Scenario: A board is graded by tier and not by position

- **WHEN** the techniques solve a board, and the last technique in the ladder
  that fired declares a lower tier than an earlier one that fired
- **THEN** the board's grade is the higher tier

### Requirement: A rejecting generation gate is measured before it is adopted

A generation gate that rejects boards SHALL be adopted only after measuring
that its rejection rate does not make a size or difficulty tier unfillable or
materially slow "New Game". A game that redefines "solvable" as "narratably
solvable" SHALL have its tiers re-graded afterward, since that can shift a
tier's character. A gate SHALL NOT be refused for changing which boards the
game generates, and a game's byte-match differential against the C reference
SHALL NOT be required to outlive it.

#### Scenario: A costly rejection gate is measured before adoption

- **WHEN** a game would adopt a generation gate that rejects non-narratable
  boards
- **THEN** its rejection rate and difficulty-tier grades are measured first
- **AND** if rejection would thin a size/tier or materially slow generation,
  the game narrates the deduction honestly instead of rejecting

### Requirement: An Unreasonable tier is the one exemption from the narratable policy

An explicitly named `Unreasonable` tier SHALL be the one sanctioned exemption.
The policy SHALL NOT forbid that tier to require guess-and-backtrack, to keep
a minimized backtracking oracle for uniqueness, or to give a non-deductive
hint on its boards. Movement and objective games, which have no deductive
"why", are outside the policy: their hints are heuristic or `aux` walks, and
there is no solver to unify.

#### Scenario: Unreasonable is exempt

- **WHEN** a game ships an explicitly named `Unreasonable` tier
- **THEN** that tier requiring a guess, and its hint being non-deductive
  there, do not violate this policy

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

### Requirement: A shared abstraction states its actual scope, not an aspirational one

A shared module's documentation SHALL describe the scope it actually has. A
module that documents itself as universal while fitting a minority of its
candidates SHALL be corrected, and its known non-fits SHALL be named in the
module itself with the reason each does not fit. An abstraction's stated scope
is part of its API: fitting a minority of callers is not a defect, and
claiming otherwise is.

#### Scenario: A game is considered for a shared abstraction

- **WHEN** a contributor evaluates whether a game's solver fits the shared
  deduction runner
- **THEN** the module names the known non-fits and why, so the evaluation
  starts from evidence rather than from an implied obligation
- **AND** a solver whose loop merely *resembles* the shared one is not treated
  as fitting until its differential says so

#### Scenario: An audit finds the majority do not fit

- **WHEN** an audit of candidates for a shared abstraction finds most do not
  fit
- **THEN** the correct outcome is a short adoption list, a recorded no-go
  list, and a corrected module header, and not a widened abstraction
- **AND** candidates that were not individually examined are recorded as
  **unaudited**, never counted as no-gos

### Requirement: A shared declarative helper is adopted by every game it fits

Every game that an engine-provided declarative-table helper fits SHALL use it,
and a game that does not SHALL have its reason recorded. The helpers in
question emit tables a game would otherwise hand-write:
`dimensionParamConfig()` for width/height params, and the shared pencil-mark
preference declarations. Adopting such a helper SHALL be a no-op: no
differential and no render snapshot moves.

#### Scenario: A new port declares its params config

- **WHEN** a newly ported game with width and height params declares
  `paramConfig`
- **THEN** it calls `dimensionParamConfig()` rather than writing the table
- **AND** its Custom-type dialog behaves identically to every other game's

### Requirement: A per-game label states only what holds on every board

A per-game label SHALL state only what holds for every board that game can
deal. Where the fact it states varies within the game, as Solo's auto-pencil
clears a diagonal only under X and a cage only under Killer, the label SHALL
name the relation rather than enumerate, since a declarative table has no
params in scope. A label that differs between games because it states a
game-specific fact SHALL be a required argument of the shared helper, never a
default.

#### Scenario: A helper is parameterized by a player-visible string

- **WHEN** a shared declarative helper's label differs between games because
  it states a game-specific fact (the auto-pencil preference names what that
  game's placement clears)
- **THEN** the label is a **required** argument, never a default
- **BECAUSE** a default that only some callers want is a sentence a game can
  inherit while it is silently wrong about that game

#### Scenario: A label enumerates a structure that varies within the game

- **WHEN** a declarative label would list the parts of a structure the game
  derives elsewhere, and which parts exist depends on the params
- **THEN** the label names the relation instead, so that it holds on every
  board the game can deal
- **BECAUSE** the enumeration is a copy of the derivation that no single board
  makes true

### Requirement: A difficulty tier binds the board it generates

A game offering more than one difficulty SHALL NOT generate, at any tier above
the easiest, a board that its own solver can complete at the tier below. The
acceptance gate SHALL therefore test both directions, solvable at the
requested tier and not solvable one tier down, rather than only the first. A
setting that does not bind is a player-visible defect and not a difficulty
curve: the player chose the tier.

#### Scenario: A board generated above the easiest tier needs that tier

- **WHEN** a board generated at a tier above the easiest is solved at the tier
  below it
- **THEN** the solver does not reach a solution
- **AND** solving it at its own tier does

#### Scenario: A game that cannot grade says so

- **WHEN** a game's tiers are not a strict hierarchy of deductions, so
  "solvable one tier down" is not a meaningful test
- **THEN** that is recorded in the game's specification with its reason,
  rather than left as an unbinding setting

### Requirement: The tier gate's cost is measured by its worst case

The cost of the tier gate's extra solver run, and of the rejections it causes,
SHALL be measured by the worst case over repeated seeds, not the median, and
the generator's retry bound SHALL exceed that worst case by a margin: a bound
a legal seed can exhaust turns a rare puzzle into a visible failure.

#### Scenario: A retry bound is set

- **WHEN** the tries a gated generator needs are measured over repeated seeds
- **THEN** its retry bound is set above the largest count seen, by a margin,
  and not from the median

### Requirement: An unbindable tier is refused, not silently downgraded

A game SHALL refuse to generate where its parameters admit no board that
requires the requested tier, reporting it through parameter validation, rather
than quietly producing a board of some other difficulty. The refusal SHALL
apply to generation only, so that a saved game or a game ID carrying its own
description still loads. Substituting a neighboring tier gives the player a
difficulty other than the one asked for, without telling them.

#### Scenario: A size that cannot support a tier refuses it

- **WHEN** a full, generation-capable parameter set requests a tier no board
  of that size requires
- **THEN** parameter validation rejects it, naming the constraint
- **AND** the same parameters are accepted when a description is supplied
  instead

### Requirement: A generator never settles for a lower tier

A generator SHALL NOT itself settle for a lower tier, whether from a table of
sizes, after a count of tries, or by excusing small boards from its tier gate:
it deals the tier asked for or exhausts its retry bound. A game found still to
cap or downgrade a tier silently SHALL be recorded as a known deviation with
the reason, and SHALL converge on this rule when it is revisited.

#### Scenario: A generator asked for an absent tier does not deal another

- **WHEN** a generator is called directly at a size and tier that parameter
  validation refuses
- **THEN** it exhausts its retry bound and throws
- **AND** it never returns a board of a lower tier

### Requirement: A refusal that claims absence rests on a count

A refusal of a tier at a size claims that no such board exists, and SHALL rest
on a count of the generator's tries at that size and tier, recorded where the
refusal is written. A count that finds none says only that such boards are
rarer than the count could see.

#### Scenario: A refusal is written

- **WHEN** a game refuses a size and tier as having no board
- **THEN** the count of the generator's tries that found none is recorded
  beside the refusal

### Requirement: A rare tier is dealt by retrying

A tier that is merely *rare* SHALL NOT be refused where retrying deals it
promptly: it is generated by retrying, with a retry bound that exceeds the
worst count measured by a margin. Where the retry takes seconds a board, the
pair SHOULD still be dealt, with a retry bound sized to the rate measured for
it, since the app deals the next board ahead (`ts-engine`, "The next board is
dealt ahead and kept") and the wait is the first board's alone.

#### Scenario: A rare tier that deals promptly is dealt

- **WHEN** a size has boards at a tier that the generator finds only after
  many tries, each try taking a small fraction of a second in total
- **THEN** the generator keeps trying and deals a board that needs that tier
- **AND** its retry bound exceeds the worst count measured by a margin

#### Scenario: A rare tier that takes seconds is dealt with a bound sized to it

- **WHEN** a size has boards at a tier found once in a measured number of
  tries, taking seconds a board
- **THEN** parameter validation accepts the pair when a board is to be dealt
- **AND** the generator's retry bound at that pair is a multiple of the
  measured number, so that a deal seldom runs it out

### Requirement: A tier too rare to deal says so

A size and tier that is rare, and not known to be absent, SHALL be refused, in
place of being dealt, only where the first wait is longer than a player would sit through once, or
where a count found no board to size a retry bound to. Such a refusal SHALL
say that such boards are too rare to deal and SHALL NOT say that none exists.

#### Scenario: A tier too rare to deal says so

- **WHEN** a size has boards at a tier but a count found none, or finding the
  first takes longer than a player would wait, and parameter validation
  rejects the pair when a board is to be dealt
- **THEN** the message says such boards are too rare to deal, not that there
  are none

### Requirement: A tier probe runs on state uncontaminated by earlier candidates

A generator's check that the tier below cannot solve a candidate SHALL run on
solver state initialized for that candidate alone, and SHALL NOT leave state
behind that affects later candidates. A probe sharing a solver scratch that is
reused or retained across a generation run answers about the leftover position
and not the puzzle, and makes which boards ship depend on the gate's own side
effects.

#### Scenario: The probe's verdict is about the puzzle

- **WHEN** a generator tests a candidate against the tier below
- **THEN** the solver's scratch state carries nothing from any previous
  candidate
- **AND** the probe leaves no state that changes the next candidate's outcome

### Requirement: Encoded params are byte-stable, and the guard is derived

A game's params encoding appears inside every shared game ID, so it SHALL be
held byte-stable by an assertion rather than by policy alone, and the corpus
that assertion runs over SHALL be derived from each game's own declarations
rather than authored. The corpus SHALL carry a vacuity guard on both the
number of games and the number of cases.

#### Scenario: A changed encoding is reported before it ships

- **WHEN** a change alters the string any game encodes for reachable params
- **THEN** the byte-stability snapshot fails, naming the game and the case

#### Scenario: The guard cannot pass over an empty corpus

- **WHEN** the registry is unpopulated, or a game contributes no cases
- **THEN** the vacuity guard fails rather than every downstream assertion
  passing over nothing

### Requirement: Encode and decode are mutual inverses over the corpus

Encode and decode SHALL be mutual inverses for every case in the corpus,
compared through the encoded string. This SHALL be asserted as a property and
not a fixture, for every registered game with no exemption roster: it survives
a preset being added and cannot be re-baselined.

#### Scenario: A codec that stops being invertible is reported

- **WHEN** a decoder stops recovering a field its encoder writes
- **THEN** the mutual-inverse assertion fails for that game, independently of
  the snapshot

### Requirement: The recorded params encodings do not move

The recorded encodings SHALL NOT move, held as a per-game snapshot.
Re-baselining the snapshot is a compatibility decision that SHALL go to the
owner beforehand with the cost stated, and SHALL NOT be applied as a
formatting fix with `vitest -u`.

#### Scenario: A change would move a recorded encoding

- **WHEN** a change makes a game encode a recorded case as a different string
- **THEN** the snapshot is not re-baselined until the owner has agreed to the
  break with its cost stated

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

### Requirement: A difficulty-capped solver is monotone in its cap at every tier

A solver that accepts a difficulty cap SHALL be monotone in it: a board
solvable with the ladder capped at difficulty `d` SHALL be solvable at every
cap above `d`. This SHALL be asserted for **every** game declaring a
difficulty contract, by a single cross-game guard, rather than per game by
hand. The property is a statement about what a difficulty tier means.

#### Scenario: A capped run succeeds where an uncapped run fails

- **WHEN** a game's solver solves a board with its ladder capped at the
  easiest tier but fails the same board with the ladder uncapped
- **THEN** the cross-game monotonicity guard fails, naming the game and seed
- **AND** the solver is fixed: no declaration excuses the game from the guard

### Requirement: A non-monotone solver is repaired, never declared

A solver found non-monotone SHALL be repaired, and the difficulty contract
SHALL offer no way to declare it so. Every technique is sound and a higher cap
only adds some, so a board that fails at a higher cap convicts a technique or
a check.

#### Scenario: A game declares itself non-monotone

- **WHEN** a game's solver is found to fail at a higher cap what it solves at
  a lower one
- **THEN** its contract has no field to say so, and the guard fails until the
  cause is found and repaired
- **AND** the game is never silently skipped

### Requirement: The monotonicity guard samples enough boards to catch its defect

The guard SHALL sample **enough boards per tier to catch the defect it
names**, and that sample size SHALL be established by confirming that the
guard fires on a solver known to be non-monotone, not chosen by judgment. A
guard that has never been shown to fail is not known to work.

#### Scenario: A defect shows on most boards of a tier and not all

- **WHEN** a solver fails at a higher cap on most, and not all, of the boards
  of its easiest tier
- **THEN** the guard's sample per tier is the size at which it was seen to
  fail on that solver

### Requirement: A generator that runs out of tries is answered, not thrown

Where a generator exhausts its retry bound, the engine SHALL report it to the
caller as a sentence a player can be shown, and SHALL leave the board in play,
and the parameters it was dealt at, as they were. A bound that runs out says
that no board was found, which is an answer about the parameters and not a
fault. The sentence SHALL NOT claim that the tier is rare, nor that it is
absent, since the generator cannot tell them apart.

#### Scenario: A deal that finds no board keeps the one in play

- **WHEN** a type is chosen whose generator exhausts its retry bound
- **THEN** the player is shown a sentence saying no puzzle of that type was
  found
- **AND** the board that was on screen is still in play
- **AND** the type shown as chosen is that board's

#### Scenario: A seed that finds no board is refused like any other id

- **WHEN** a game ID carrying a seed is loaded and its generator exhausts its
  retry bound
- **THEN** loading returns the same sentence, as it returns any other refusal

### Requirement: Only an exhausted retry bound is answered

Parameter validation SHALL remain where a counted absence is reported: the
answer to an exhausted retry bound covers only what validation does not name.
Any other error a generator throws SHALL propagate.

#### Scenario: A fault is not mistaken for an answer

- **WHEN** a generator throws anything other than its exhausted retry bound
- **THEN** the error propagates to the caller

### Requirement: The app shows the sentence wherever a deal was asked for

The app SHALL show the sentence for an exhausted retry bound wherever a deal
was asked for. Where no board is in play to keep, it SHALL deal the game's
first preset.

#### Scenario: No board is in play to keep

- **WHEN** a page opens on a type whose generator exhausts its retry bound,
  with no board in play
- **THEN** the game's first preset is dealt
