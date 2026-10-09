# engine-difficulty Specification

## Purpose
Difficulty tiers: the contract a tiered game declares, the collection-wide
scale its tier names come from, and the guards that hold a board to the tier
it was dealt at. Why each rule is as it is, and how to follow it, is in
`docs/games/solver-and-generator.md` § "Difficulty tiers".

## Requirements

### Requirement: A tiered game declares a difficulty contract on its Game

A game that offers a difficulty choice SHALL declare `Game.difficulty`, and a
game that offers none SHALL omit it. The contract SHALL be declared on `Game`:
not in the `puzzleId → Game` registry, whose one job is identity lookup, and
not in a test-only enrollment module. Declaring it SHALL enroll the game in
every cross-game difficulty guard, and SHALL NOT change any board the game
generates.

#### Scenario: A game offers a difficulty choice and declares no contract

- **WHEN** a game's custom-params form offers a difficulty choice and the game
  declares no `difficulty`
- **THEN** the cross-game guard fails, so no tiered game escapes the guards by
  not enrolling

#### Scenario: A game declares the contract and offers no choice

- **WHEN** a game declares `difficulty` and its form offers no difficulty choice
- **THEN** the guard fails, because the game would have no tiers and every
  per-tier assertion would pass over nothing

#### Scenario: A capability is proposed for the registry

- **WHEN** a change proposes attaching per-game capability metadata
- **THEN** it goes on `Game` as an optional hook, beside `hint`, `findMistakes`
  and `supersededDesc`

### Requirement: The contract is the capped solver and nothing else

The contract SHALL hold `solveAtCap(params, desc, cap)`, which runs the game's
own solver with its deduction ladder capped at `cap`. `solveAtCap` SHALL be
written per game and SHALL NOT be derived. The contract SHALL NOT carry the
tier list, the tier accessors, or an entry point for generating at a tier:
`newDesc(withTier(game, params, tier), rng)` is that.

#### Scenario: A consumer needs a board at a tier

- **WHEN** a cross-game consumer needs a board of a game at a given tier
- **THEN** it sets the tier on the params with `withTier` and calls `newDesc`

### Requirement: solveAtCap answers with a verdict

`solveAtCap` SHALL return `"solved"`, `"unsolved"` or `"impossible"`, and SHALL
NOT return its solver's own integer. The solvers' integers do not mean the same
thing from game to game, so the translation belongs to the game.

#### Scenario: An adapter misreports its solver

- **WHEN** a game maps its solver's return value to the wrong verdict
- **THEN** a cross-game guard fails, because a board the game's own generator
  dealt at a tier is reported unsolved at it
- **AND** the adapter is corrected and the guard is not relaxed

### Requirement: A game's tiers are read from its difficulty item

The tier names SHALL be read from the game's difficulty item, the list a player
picks from, through `difficultyTiers(game)`. `tierOf` and `withTier` SHALL read
and set a tier through the same item. The list SHALL NOT be derived from the
game's `DIFF_*` constants, which label solver rungs and are not the
player-facing list, and SHALL NOT be derived from its deduction techniques.

#### Scenario: A game's constants outnumber its tiers

- **WHEN** a game declares more `DIFF_*` constants than it offers tiers, as Solo
  does with two that are solver verdicts
- **THEN** its tier list is the one its form offers

#### Scenario: A change proposes deriving tiers from techniques

- **WHEN** a change proposes projecting the tier list from the technique ladder
- **THEN** it is refused without surveying the games again
- **AND** the refusal is reconsidered only when a technique carries a tier
  name, a ladder can be declared without a board, and every tier a game offers
  is a rung: all three, since any one left standing defeats the projection

### Requirement: Every tier promises one solution found at its cap

No tier SHALL promise anything but a board with one solution that the game's
solver finds at that tier's cap. A tier whose generator skips the uniqueness
search SHALL NOT be offered.

#### Scenario: Upstream offers a tier with no uniqueness search

- **WHEN** a game is ported whose upstream menu has a tier that skips the
  uniqueness search
- **THEN** the port does not offer that tier

### Requirement: A tier with no boards is retired and still loads

A tier that the game's solver understands and its generator can deal at no size
SHALL be declared a retired choice of the difficulty item, because a saved game
or a game ID may still name it. A retired tier SHALL NOT be offered, SHALL be
accepted when a board is loaded, with `solveAtCap` answering at its cap, and
SHALL be refused with a human-readable reason when a board is to be generated.
A board loaded under a retired tier SHALL take the lowest offered tier that
solves it.

#### Scenario: A game ID names a retired tier

- **WHEN** a game ID or a save names a tier the game has retired, as Bricks'
  `dt` does
- **THEN** the board loads
- **AND** the form does not offer the tier, and asking for a new board at it is
  refused with the reason

#### Scenario: A board that needs search arrives under a retired tier

- **WHEN** a Bricks board that only its Unreasonable tier solves is loaded by an
  ID carrying `dt`
- **THEN** the midend reports it as Unreasonable, and a hint that runs out of
  deduction on it is returned as the refusal and nothing is thrown

### Requirement: An offered tier generates, or is refused with a reason

A cross-game guard SHALL require of every tier a game offers that some preset
generates at it, or that generating at it is refused with a human-readable
reason. A tier that fails to generate and says nothing about why SHALL NOT
pass.

#### Scenario: An offered tier generates at no preset

- **WHEN** no preset's size can generate a tier the form offers
- **THEN** the guard requires a refusal with a reason at every preset, and fails
  on a silent one

### Requirement: Tier names come from one collection-wide scale

A tiered game SHALL name its tiers by position from the collection's scale,
easiest first: Easy, Normal, Tricky, Hard, Extreme. A game with `n` tiers takes
the first `n`, and a name SHALL hold the same position in every game that has
it. `tierNames(n)` SHALL be the only definition a game writes, and SHALL refuse
a count the scale cannot name rather than return a short list.

#### Scenario: A new game declares its tiers

- **WHEN** a game with `n` tiers is implemented
- **THEN** it calls `tierNames(n)`, or `tierNames(n, { search: true })` when its
  hardest tier can require Search, and authors no names

#### Scenario: A count past the scale

- **WHEN** `tierNames` is asked for more names than the scale holds
- **THEN** it throws, since a short list would leave the guards covering fewer
  tiers than the game has

### Requirement: Unreasonable is declared and never issued by position

`Unreasonable` SHALL NOT be issued by position. It is the name `engine-hints`
reserves for a tier whose boards can require Search, and a game takes it by
declaring that of its hardest tier, with `tierNames(n, { search: true })`,
which replaces the top name. The guard on
tier names SHALL NOT be read as evidence that a tier searches: it checks the
shape of the list.

#### Scenario: A two-tier game whose harder tier backtracks

- **WHEN** a game has two tiers and its harder one can require Search
- **THEN** its tiers are Easy and Unreasonable

#### Scenario: A top tier that is a bounded tactic

- **WHEN** a game's hardest tier never requires Search
- **THEN** it is never named `Unreasonable`, however many tiers the game has

### Requirement: A game overrides the scale only by declaring why

An override of the scale SHALL be declared by the game, with its reason, in the
change that needs it. Its exemption from the guard SHALL be derived from a
declaration the game makes for its own reasons and SHALL NOT be a roster.

#### Scenario: A game's tier names drift from the scale

- **WHEN** a game names a tier off the scale, or out of position, and declares
  no override
- **THEN** the cross-game guard fails, naming the game and the list it should
  have used
- **AND** the game adopts the scale or declares an override, and the guard is
  not relaxed

### Requirement: A tier's name is not part of any encoding

A change to a tier's name SHALL NOT change any board, tier index, params
encoding or generated puzzle. The encoding carries a tier's index, so a game ID
or a saved game decodes to the same board and the same tier index whatever the
tier is called.

#### Scenario: A game ID written before a tier was renamed

- **WHEN** a game ID or a save written under a tier's old name is decoded
- **THEN** it names the same board and the same tier index

### Requirement: A preset title that names a difficulty names its own tier

A preset title that uses one of the collection's difficulty words SHALL use the
word for that preset's own tier, and SHALL derive it from the game's tier list
rather than restate it. A title that names no difficulty is permitted.

#### Scenario: A preset named for something else

- **WHEN** a preset's title names a symbol range or a mode and no difficulty,
  as Salad's and Solo's Killer preset do
- **THEN** it passes, with no exemption list

### Requirement: A cross-game guard asserts that tiers bind

A cross-game guard SHALL require that a board dealt from a preset whose tier
the contract can read solves at that tier and at no lower one. Its population
SHALL be derived from the registry, with no enrollment list. It SHALL be keyed
on the presets a player can pick, each at its own tier, and never on a tier
written onto another preset.

#### Scenario: A generator downgrades a tier

- **WHEN** a generator accepts a board its lower cap already solves, for a
  preset the menu labels with the higher tier
- **THEN** the guard fails, naming the game, the preset and the caps it found

#### Scenario: A contract's capped solve is wider than the tier it names

- **WHEN** a game's `solveAtCap` omits a bound its generator's acceptance rule
  applies, so boards of a higher tier solve at a lower cap
- **THEN** the guard fails, though the game deals correct boards and every test
  it owns passes

#### Scenario: A hard tier on the smallest preset

- **WHEN** a tier is one no preset of that size carries
- **THEN** the guard asserts nothing of it: that `validateParams` accepts a
  params record is not evidence that a board can carry the tier in it

#### Scenario: A new game joins

- **WHEN** a game is registered that offers a difficulty choice
- **THEN** the guard asserts it from its first commit, with no line added to
  enroll it

### Requirement: The tier-binding guard has no exemption list and counts its cases

The guard SHALL take an exception only from a declaration the game already
makes: a tier a size cannot carry is refused by `validateParams` with a reason.
The guard SHALL assert that the number of preset cases it checked is above a
floor. Its per-commit run SHALL sample seeds through the shared budget helper,
and the full matrix SHALL run in the opt-in slow tier.

#### Scenario: A tier is unreachable at a size

- **WHEN** a declared tier cannot be generated at some preset's size
- **THEN** the game refuses those params with a reason, and the guard asserts
  nothing about a board that was never dealt

#### Scenario: A contract stops reporting tiers

- **WHEN** a change leaves the guard with no preset whose tier it can read
- **THEN** the floor on its count of cases fails

### Requirement: Shared generation machinery is argued from economy

A proposal to move a game's generate-and-strip loop into shared machinery SHALL
argue from the per-game code it removes. It SHALL NOT argue that the move is
needed for guess-free or on-tier generation, which the tier-binding guard
asserts of the boards whatever loop dealt them, and it SHALL run that guard's
sweep again rather than quote a figure.

#### Scenario: A generator adopts shared machinery

- **WHEN** a game moves its generation onto shared machinery
- **THEN** the tier-binding guard still asserts that its boards need the tier
  their preset claims

### Requirement: The midend throws when deduction runs out below Unreasonable

When a game's `hint()` refuses with `DEDUCTION_EXHAUSTED` and the board's tier
is not named `Unreasonable`, a game with no tiers included, the `Midend` SHALL
throw an error naming the game, the move, the tier and the board's full id,
and SHALL NOT return the refusal. Such a board was promised to solve by
deduction, so the refusal's sentence would be false of it.

#### Scenario: A board pinned below the tier it needs

- **WHEN** a board is loaded by an id that pins a tier whose rules run out
  before it is solved, and the player follows the hint to that point
- **THEN** the midend throws, and the player never reads `DEDUCTION_EXHAUSTED`

#### Scenario: An Unreasonable board runs out of deduction

- **WHEN** the hint runs out of deduction on a board whose tier is named
  `Unreasonable`
- **THEN** the midend returns `DEDUCTION_EXHAUSTED` as a refusal and throws
  nothing

### Requirement: One helper says which tiers permit search

Whether a tier permits search SHALL be decided by one engine helper,
`permitsSearch`, read by the midend and by the test walk over dealt boards, so
the runtime check and the test cannot disagree.

#### Scenario: The walk meets a board the midend would throw on

- **WHEN** the test walk follows a hint to `DEDUCTION_EXHAUSTED` on a dealt
  board
- **THEN** it fails for exactly the tiers at which the midend throws

### Requirement: Auto-Hint stops when a step throws

Auto-Hint SHALL stop when a step's hint throws, so the error reaches the app's
reporter and the loop is not left marked active with nothing driving it.

#### Scenario: Auto-Hint meets a thrown step

- **WHEN** Auto-Hint is running and a step's hint throws
- **THEN** Auto-Hint stops and the error propagates to the app's reporter

### Requirement: A loaded board whose id states no tier takes the lowest tier that solves it

When the midend loads a tiered game's board from a `params:desc` id or a save
whose params string cannot tell tiers apart, as upstream's game IDs cannot, it
SHALL load the board at the lowest tier at which the game's own `solveAtCap`
solves it. When no tier solves it, the decoded params SHALL stand.

#### Scenario: A shared board reloads at the tier it was dealt at

- **WHEN** a tiered game deals a board at a tier other than its default, and the
  board is loaded by the id offered for sharing it
- **THEN** the midend reports that tier, and the hint runs at it

### Requirement: A pinned tier is kept or raised and never lowered

When a loaded board's params string pins a tier, the midend SHALL keep that
tier if the board solves at it, and otherwise SHALL raise the board to the
lowest tier above it at which it solves. A pinned tier SHALL NOT be lowered,
and one that permits search SHALL be kept without solving. When no tier
qualifies, the decoded params SHALL stand.

#### Scenario: A pinned tier above the one the board needs

- **WHEN** a board is loaded by an id that pins a tier at which it solves,
  above the one it needs
- **THEN** the midend reports the pinned tier

#### Scenario: A pinned tier below the board's is raised

- **WHEN** a board is loaded by an id or a save whose params pin a tier at which
  the board does not solve
- **THEN** the midend reports the lowest tier above it at which the board
  solves, and the hint runs at it
