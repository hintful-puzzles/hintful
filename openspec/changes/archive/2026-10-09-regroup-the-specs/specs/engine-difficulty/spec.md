## ADDED Requirements

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
it, since the app deals the next board ahead (`dealing`, "The next board is
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
guard fires on a solver known to be non-monotone, not chosen by judgment. That
sample SHALL be walked on every push. The per-commit hook MAY walk the first
board of each tier alone, which still fails a solver that is non-monotone on
every board.

#### Scenario: A defect shows on most boards of a tier and not all

- **WHEN** a solver fails at a higher cap on most, and not all, of the boards
  of its easiest tier
- **THEN** the guard's sample per tier is the size at which it was seen to
  fail on that solver

#### Scenario: The first board of a tier is one the defect spares

- **WHEN** a commit makes a solver non-monotone on most boards of a tier, and
  the first board of that tier is not one of them
- **THEN** the per-commit hook passes, and the run on the push fails

### Requirement: Only a tier named Unreasonable requires Search

A tier whose boards can require Search SHALL be named `Unreasonable`, and no
other tier name SHALL require it.

#### Scenario: A tier that can require guessing says so in its name

- **WHEN** a game's generator can emit, at a given tier, a board whose solution
  needs a propagating trial
- **THEN** that tier is named `Unreasonable`

### Requirement: A propagating trial on a hard tier moves up or renames the tier

A game whose hard tier ships a propagating trial SHALL NOT delete the tier.
Where a tier named `Unreasonable` sits above the rung's tier, the rung SHALL
move up to it and the lower tier be re-graded by what remains. Where the
rung's tier is the game's top tier, it SHALL be renamed `Unreasonable`. Where
emptying the tier would leave it the technique set of the tier below, so that
it generates nothing, the game SHALL first build the missing deductive rung
and re-grade, then move the trial up.

#### Scenario: The trial sits on the game's top tier

- **WHEN** a game's top tier ships a propagating trial
- **THEN** that tier is renamed `Unreasonable`, and is not deleted

### Requirement: A name is dropped only from a tier that generates nothing

The rule against deleting a tier is about tiers that name boards. A name SHALL
be dropped from the tier list only where a rename would leave an ordering a
player cannot read because a name above it belongs to a tier that generates
nothing, one already refused at generation on a measurement. Its encoded
difficulty character SHALL still decode and round-trip, so that no existing
game ID or saved game changes meaning, and the refusal SHALL keep its reason.

#### Scenario: A game ID names a tier whose name was dropped

- **WHEN** a game ID carries the difficulty character of a tier dropped from
  the list
- **THEN** it still decodes and round-trips, and nothing a player could
  previously play is removed

### Requirement: A tier list has one definition per game

A tier list SHALL have one definition per game, read by the preset menu, the
difficulty contract and the custom-params dialog alike. Dropping a
name from a declared tier list drops whatever cross-game guard iterates that
list, so a game that shortens its list SHALL re-establish the lost guarantee in
its own tests: at minimum, that the undeclared tier's difficulty character
still round-trips.

#### Scenario: A tier is renamed

- **WHEN** a game renames a tier
- **THEN** the preset menu and the custom-params dialog show the new name
  together, because both read the one list

### Requirement: A moved rung leaves its old tier generable

A rung that moves SHALL be shown to leave its old tier still generable, at
every size the game offers, before the move is called done. A size and tier
pair that becomes ungenerable SHALL be refused by `validateParams` with a
reason and SHALL NOT be silently downgraded.

#### Scenario: Moving a trial rung up leaves the tier below still generable

- **WHEN** a propagating rung is moved off a tier to the game's `Unreasonable`
  tier
- **THEN** every size the game offers still generates at the vacated tier, or
  that size/tier pair is refused by `validateParams` with a reason the player
  can read: the tier is never left silently unreachable, and never quietly
  downgraded to another difficulty

### Requirement: No parameter or tier switches a generator's checks off

No game SHALL offer a parameter or a tier that switches its generator's checks
off: a board that needs trial and error SHALL be dealt only at a tier named
Unreasonable, and every board dealt SHALL have one solution.

#### Scenario: A game ID upstream wrote with its checks on

- **WHEN** a desc from a frozen upstream fixture is loaded under the params its
  fixture states
- **THEN** it loads, unless the fixture records that upstream's own solver
  found several answers on it, and a fixture naming an option that switches a
  generator's checks off names it at the value that leaves them on

### Requirement: A generator that runs out of tries is answered, not thrown

Where a generator exhausts its retry bound, the engine SHALL report it to the
caller as a sentence a player can be shown, and SHALL leave the board in play,
and the parameters it was dealt at, as they were. A bound that runs out says
that no board was found, which is an answer about the parameters and not a
fault. The sentence SHALL say that the tier may be rare or may be absent, and
SHALL NOT assert either, since the generator cannot tell them apart.

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

### Requirement: Every generate-until-success loop is bounded by the shared retry limit

Every generate-until-success retry loop in a game generator SHALL be finitely
bounded, and the bound SHALL come from the shared `engine/retry-limit.ts`
helper rather than a hand-rolled counter, so every loop reports failure the
same way: `RetryLimitExceeded`, naming the loop and its budget. A loop whose
only termination argument is probabilistic counts as unbounded. Fixpoint
solvers, and loops that terminate by a stated monotone-progress argument, are
exempt.

#### Scenario: A runaway generator fails fast instead of orphaning a worker

- **WHEN** a game generator's retry loop is given an input for which it never
  reaches success (a porting divergence, or params that admit no puzzle)
- **THEN** it throws `RetryLimitExceeded`, naming the loop, after a finite number
  of attempts rather than looping forever, so the worker returns control (and can
  be torn down) instead of becoming an uninterruptible orphan

### Requirement: An exhausted retry limit throws, or hands over to a bounded recovery

Exhaustion of a retry limit SHALL either throw, or transfer to a recovery path
that is itself bounded. Throwing is the default, and cannot alter a seed that
converges. Recovery SHALL be preferred where the algorithm already has such a
path, since a cap that throws turns a rare but legal seed into a failed puzzle
where recovery makes it a slower one.

#### Scenario: A stalled loop recovers rather than failing the puzzle

- **WHEN** a retry loop has a natural recovery path and stops making progress
  (Net's loop-fixing rounds ceasing to reduce the loop-square count)
- **THEN** it takes that recovery path (a full reshuffle) once the stall is
  detected, bounded by an outer `retryLimit`, so the player gets a slower puzzle
  rather than an error

### Requirement: The gate holds every open loop that draws randomness to a stated bound

A loop under `src/games/` or `src/engine/` whose header does not count (a
`while`, a `do…while`, or a `for` missing its condition or its incrementor) and
which draws from the RNG SHALL either call a `retryLimit` guard once per pass,
or be listed in a ledger with what ends it. The ledger SHALL be asserted equal
to the set of such loops the scan finds unguarded, in both directions. A
deterministic open loop is outside this requirement: the first test to reach
one that never ends finds it.

#### Scenario: A generator's guard is removed

- **WHEN** the call to a `retryLimit` guard is removed from a retry loop that
  draws from the RNG, whatever file it is in and whether the loop is
  `for (;;)`, `while (true)`, `do…while` or `while (!generate(rng))`
- **THEN** the gate fails in its source-scan pass, naming the loop by file,
  function and line

#### Scenario: A ledger entry outlives its loop

- **WHEN** a ledgered loop is deleted, renamed with its function, or given a
  guard
- **THEN** the gate fails until the entry is removed

### Requirement: The open-loop scan keys on shape and references

The open-loop scan SHALL key on the loop's shape and on references, not on a
file name or a list of games: an RNG is a declaration typed `RandomState` or
initialized from a function declared to return one, a draw is followed through
local functions and relative imports, and a guard is a variable initialized
from the `retryLimit` that `engine/retry-limit.ts` exports.

#### Scenario: A deal lives in a file not named for generation

- **WHEN** a game's retry loop sits in its state or solver module
- **THEN** the scan finds it by its shape and its draw, as it finds one in a
  generator module

### Requirement: The open-loop scan runs in the source-scan pass and carries its known positives

The open-loop scan SHALL run in the gate's source-scan pass, and SHALL carry
its own known positives: a bare loop of each open shape that it finds, and a
guard that is not the loop's own that it refuses.

#### Scenario: A loop borrows another loop's guard

- **WHEN** the scan is given an open loop that draws from the RNG and whose
  only guard call belongs to a nested loop or function
- **THEN** it reports the loop as unguarded

### Requirement: A loop that deals a whole board again takes the guard, and the ledger is for the rest

A loop that deals a whole board again until one is acceptable SHALL take the
guard, a loop that only rejects an already-solved shuffle included. A ledger
entry is for a loop that uses something up each pass, that counts for itself,
or that is rejection sampling for a single item; for the last, the reason SHALL
say what keeps an acceptable draw on offer. A default-budget guard SHALL NOT be
put on per-item rejection sampling, because a legal board can exhaust it.

#### Scenario: A loop rejects a shuffle that is already solved

- **WHEN** a generator shuffles a whole board again until it is not solved
- **THEN** the loop takes a `retryLimit` guard, and a ledger entry does not
  excuse it

#### Scenario: A new game samples a free square by rejection

- **WHEN** a generator draws a square until it finds one not taken, in an open
  loop
- **THEN** the gate fails until the ledger says what keeps a free square on
  offer

## REMOVED Requirements

### Requirement: A preset title that names a difficulty names its own tier

**Reason**: Moved to `engine-params`, with its words.

### Requirement: Auto-Hint stops when a step throws

**Reason**: Moved to `engine-hints`, with its words.
