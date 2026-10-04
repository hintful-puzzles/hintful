## MODIFIED Requirements

### Requirement: A tiered game declares its difficulty contract

A game with difficulty tiers SHALL declare an optional `difficulty` contract on
its `Game`: `solveAtCap(params, desc, cap)` running the game's solver with its
deduction ladder capped at `cap`, and the declared exceptions to the tier guards.
A game without tiers omits it, exactly as a game without a solver omits `solve`.

The contract SHALL NOT carry the tier list or the tier accessors. **The tier
names are read off the game's difficulty item** — `difficultyTiers(game)` — which
is the list a player picks from, and which decides both *whether* a game is
tiered and *what its tiers are*; `tierOf` and `withTier` read and move a tier
through the same item. A `tiers` array on the contract was a second
hand-maintained copy of that list held equal to it by an assertion, and the
accessors were a second pair held equal to the item's `get`/`set` the same way;
with both derived from the item, there is nothing for either to disagree with.

`solveAtCap` SHALL return a **discriminated verdict** (`"solved"` /
`"unsolved"` / `"impossible"`), not the raw integer its solver uses. The
collection's solvers report `-1 / 0 / 1` with meanings that are **not uniform** —
one game's `0` is "ambiguous", another's is "stuck", another returns a status
enum — so the per-game translation belongs in the adapter. Propagating the raw
integers would import 26 conventions into every cross-game consumer.

`solveAtCap` SHALL stay per-game and SHALL NOT be derived. Measured across all
29 contracts, its only shared step is `newState(params, desc)`, which `Game`
already provides and each adapter spends one line on; the cap is passed straight
through to the game's own solver, and the verdict mapping is the per-game
knowledge the discriminated verdict exists to hold. There is no capping logic to
share — the shared part was `latinVerdict`, and it is already extracted.

The contract SHALL describe what the game already does and SHALL NOT change any
board it generates: adopting it is a no-op, and a differential fixture that moves
means an adapter misreports its game's solver.

The tier list SHALL NOT be derived from the game's `DIFF_*` constants. A `DIFF_*`
constant is not reliably a tier: Solo declares eight and offers six (two are
solver verdicts), Galaxies' names list has five entries and two tiers, Singles
has a `DIFF_MAX` *and* a `DIFF_ANY`, and Salad has a `DIFF_HOLESONLY` at −1.

A tier that the game's solver understands but that the generator refuses at every
size SHALL still be offered in the form, because a saved game or a
description-carrying game ID may request it and `solveAtCap` must be able to
answer. Its refusal SHALL come from `validateParams` with a human-readable
reason, never from silent failure.

No tier SHALL promise anything but a board with one solution that the game's
solver finds at that tier's cap. A tier whose generator skips the uniqueness
search is not offered, and the contract has no way to declare one.

Because generation is already uniform through `Game.newDesc(params, rng)`, the
contract SHALL NOT add a separate "generate at tier" entry point —
`newDesc(withTier(game, p, t), rng)` is that, and a second spelling of an
existing capability is how a contract sprawls.

#### Scenario: A newly tiered game is enrolled by declaring the contract

- **WHEN** a game with difficulty tiers declares `difficulty`
- **THEN** every cross-game difficulty guard covers it without further enrollment
- **AND** its tier list is read from the difficulty choices its custom-params
  form offers, so there is no second list for a game that gains a tier to leave
  stale
- **AND** a game that offers such a choice without declaring the contract fails
  the guard, so enrollment is conscription rather than invitation
- **AND** a game that declares the contract while offering no such choice fails
  the guard, because it would have no tiers at all and every per-game assertion
  would loop zero times over it while reporting health

#### Scenario: A tier is declared but generates at no size

- **WHEN** a tier exists in the solver's ladder but the generator refuses it
  everywhere
- **THEN** the tier stays offered in the form, so a saved game or game ID can
  still name it
- **AND** `validateParams` refuses it with a human-readable reason, which the
  guard requires — a tier that fails to generate and says nothing about why is a
  silent downgrade wearing a menu entry

#### Scenario: An adapter misreports its solver

- **WHEN** an adapter maps a solver's return value to the wrong verdict
- **THEN** the "every declared tier is reachable" guard fails, because a board
  the game's own generator just produced at that tier is reported unsolved
- **AND** the adapter is corrected rather than the guard relaxed

### Requirement: The difficulty tier list is not a projection of the technique ladder

A game's tier list SHALL NOT be derived from its declared deduction techniques,
and a change proposing to do so SHALL be answered with this requirement rather
than by re-surveying the games. The framework vision (`docs/framework-rdd/`,
retired by `retire-the-framework-vision`) proposed the projection — *"if your
techniques carry tiers … there is no hand-written `DifficultyContract`; it is a
projection of the technique ladder"* — and `declare-deduction-techniques` appeared
to supply the lever by giving every technique a declared `tier`. It does not, for
three independent reasons, each sufficient on its own.

**A ladder declares tier *indices*; a tier list is *names*.**
`DeductionTechnique.tier` is a `number`. "Easy" and "Unreasonable" are strings a
player reads in the Custom dialog, and no projection invents them from integers.

**The projection runs the wrong way.** `runDeductionFixpoint` *receives*
`maxTier`, derived from a tier index — it is downstream of the tier list, not
upstream of it. Every ladder in the collection is an array literal built inside a
solve, closing over board state, so there is nothing to interrogate at module
load, which is when `paramConfig` and the params codec need the list.
`engine/latin.ts` makes this concrete: it synthesizes its rungs as `0..maxdiff`,
so asking that ladder for its tiers returns the cap it was handed.

**A tier is not always a rung.** Towers, Keen, Group, Unequal and Mathrax put
their top tier on `latinSolverRecurse`, outside the fixpoint entirely — and the
latin ladder still synthesizes a rung for it that can never fire, because no
built-in technique maps to that level and the game's `usersolvers` slot is
`null`. Undead's only ladder on the shared runner is its *hint
recorder*, whose two techniques both sit on tier 0 while the game offers three
tiers. A ladder-derived list is short for every one of them.

The scope this was measured over SHALL be recorded rather than re-estimated:
14 games run a solver on the shared fixpoint runner (Group, Keen, Mathrax, Salad,
Towers and Unequal through `engine/latin.ts`; Clusters, Filling, Magnets,
Pattern, Singles, Spokes, Undead and Unruly directly), 29 declare a difficulty
contract, and the overlap is 12 — Filling and Pattern are untiered. Boats and
Loopy name `runDeductionFixpoint` only in doc comments explaining why they do not
use it, so a name-keyed scan over-counts them.

#### Scenario: A change proposes deriving tiers from techniques

- **WHEN** a change proposes projecting the difficulty contract from the
  technique ladder
- **THEN** it is refused with the three reasons above, which do not depend on
  which games are currently on the shared runner
- **AND** the reasons are re-derived only if `DeductionTechnique` starts carrying
  a tier *name*, the ladder becomes declarable without a board, and every tier a
  game offers becomes a rung — all three, since any one of them left standing
  defeats the projection on its own

### Requirement: Difficulty tier names come from one collection-wide scale

A tiered game SHALL name its tiers from the collection's scale by position,
rather than choosing words of its own. The scale, easiest first, is **Easy ·
Normal · Tricky · Hard · Extreme**, and a game with `n` tiers takes the first
`n`. `tierNames(n)` in `engine/difficulty.ts` is that projection and SHALL be the
only definition a game writes.

**Position and name SHALL be a bijection across the collection.** "Tricky" is the
third rung in every game that has one; "Normal" the second. This is the property
the convention exists for: before it, the 29 tiered games had chosen twelve
different words with no decision behind the spread — the six three-tier games
used six different vocabularies, the eleven two-tier games five, and "Tricky" was
the second rung in six games and the third in three others, so the word carried
no meaning between games.

**`Unreasonable` SHALL NOT be issued by position.** It is not a rung of the scale
but a promise about one — reserved by "A tier whose boards can require Search
SHALL be named `Unreasonable`" — so `tierNames(n, { search: true })` replaces the
top name with it on the game's declaration that its hardest rung searches. A
two-tier game whose harder rung backtracks is `Easy · Unreasonable`; a six-tier
game whose top rung is a bounded tactic never acquires the word.

`tierNames` SHALL refuse a count the scale cannot name rather than returning a
short list. A truncated list would leave a game with fewer names than tiers, and
every cross-game guard iterates the names — so the shortfall would surface as
guards quietly covering fewer tiers, not as an error.

**An override SHALL remain first-class**, declared in the change that needs it,
and its exemption from the guard SHALL be derived from a declaration the game
makes for its own reasons rather than from a roster, which would go stale as
quietly as a membership list. No game overrides the scale.

Adopting the convention SHALL NOT change any board, any tier index, any params
encoding, or any generated puzzle. `DIFF_CHARS` maps a tier *index* to a
character, so every existing game ID and saved game continues to decode to the
same board at the same tier; only the word on the menu moves. A differential
fixture that moves under a renaming means the rename reached code it should not
have.

**A game's internal `DIFF_*` constant names are solver rung labels, not tier
names**, and SHALL NOT be read as the player-facing list. They were already
unreliable — Solo declares eight and offers six — and under the convention they
routinely differ, as Unruly's `DIFF_TRIVIAL` naming a tier a player sees as
"Easy". The rung labels stay because the solvers and the differentials are
written in them.

#### Scenario: A new game declares its difficulty tiers

- **WHEN** a game with `n` difficulty tiers is implemented
- **THEN** it calls `tierNames(n)` — or `tierNames(n, { search: true })` when its
  hardest rung can require Search — rather than authoring names
- **AND** it inherits the collection's vocabulary without a decision to make

#### Scenario: A game's tier names drift from the scale

- **WHEN** a game names a tier off the scale, or out of position
- **THEN** `difficulty-contract.test.ts` fails, naming the game and the
  conventional list it should have used
- **AND** the game either adopts the convention or declares an override with its
  reason, rather than the guard being relaxed

#### Scenario: A preset title names a difficulty

- **WHEN** a preset's title uses one of the collection's difficulty words
- **THEN** it SHALL be that preset's own tier
- **AND** a title that names no difficulty at all is permitted — Salad's presets
  name a symbol range, Solo's Killer preset names its mode — so the rule is a
  prohibition rather than a requirement, and needs no exemption roster
- **AND** preset titles SHALL derive their tier word from the game's tier list
  rather than restating it, because a restated word is a copy that no test reads
  and that goes stale silently: Solo's menu offered "3x3 Intermediate" while its
  Custom dialog offered "Tricky", with the whole suite green

#### Scenario: The guard is mistaken for a check on the Search promise

- **WHEN** a game's tier list ends in `Unreasonable` and the guard passes
- **THEN** that is evidence about the *shape* of the list only
- **AND** it is **not** evidence that the tier has earned the name, because
  `search` is read from the game's own top name and "this rung is a Search" is a
  judgment about the code that no test can read off it

### Requirement: A cross-game guard SHALL assert that tiers bind

`ts-migration` § "A difficulty tier binds the board it generates" already
requires the behavior, and `engine/difficulty.ts`'s `solvableAtExactlyTier` is
its one expression. **This requirement adds only the check**, because until it
nothing in the collection compared the tier a board was generated at with the
tier the board needs: `difficulty-contract.test.ts` computed the lowest solving
cap and used it only as the floor of a monotonicity sweep — an assertion sitting
beside the very value that would have proved the point, measuring a neighbor of
it (`AGENTS.md` § "Method").

A cross-game guard SHALL, over a population derived from the registry with no
enrollment list, require that a board dealt from a preset whose tier the game's
difficulty contract can read is solvable at that tier and at no lower one.

**The rule has two spellings and the guard SHALL be what makes them meet.** A
game's generator states the tier-acceptance rule in its own terms, and the
game's `DifficultyContract.solveAtCap` states it again for every cross-game
consumer. A game's own tests exercise only the first, so a contract whose capped
solve is *wider* than the tier it names is invisible: Undead's generator bounded
Easy at three arc-consistency passes while its contract ran arc-consistency
unbounded, so every Normal board graded as Easy-solvable and the collection's
difficulty guards read an Easy that was not Undead's. Neither side was checkable
alone.

**The guard SHALL be keyed on the presets a player can pick**, reading each
preset's own tier through the difficulty contract — never on a tier written onto
some other preset. The distinction is not pedantic: applying a hard tier to the
collection's smallest preset asks a question no generator can answer (a 4×4 Solo
board cannot be Hard however its params are labeled), and a guard written that
way reported ten violations across four games where there were three across one.
`validateParams` accepting a params record is not evidence that a board can carry
the tier in it.

**Exceptions SHALL be derived from a declaration the game already makes**, never
from a roster. A contract declaring `nonMonotone` has no well-defined lowest
cap and is exempt for the same reason it is exempt from the monotonicity sweep. A game that genuinely cannot generate a declared tier at
a given size SHALL refuse it from `validateParams` with a reason — the shape
already required by "either generates every declared tier, or refuses it with a
reason" — rather than being added to an exemption list.

**The guard SHALL carry a vacuity count.** It iterates presets whose tier is
readable; a contract that stopped reporting one would make every assertion pass
over nothing. The count of asserted preset cases SHALL be asserted above a floor.

**Cost SHALL be tiered rather than paid per commit.** The full matrix over every
preset of every tiered game is expensive; the per-commit slice samples seeds
through the shared budget helper and the full matrix runs in the opt-in slow
tier, with the doc comment stating what the gate slice still covers.

#### Scenario: A generator downgrades a tier

- **WHEN** a game's generator accepts a board its lower cap already solves, for a
  preset the menu labels with the higher tier
- **THEN** the cross-game guard fails, naming the game, the preset and the caps
  it found

#### Scenario: A contract's capped solve is wider than the tier it names

- **WHEN** a game's `solveAtCap` omits a bound its generator's tier-acceptance
  rule applies, so boards of a higher tier solve at a lower cap
- **THEN** the guard fails, even though the game deals correct boards and every
  test the game owns passes

#### Scenario: A tier is unreachable at a size

- **WHEN** a declared tier cannot be generated at some preset's size
- **THEN** the game refuses those params from `validateParams` with a reason,
  and the guard asserts nothing about a board that was never dealt

#### Scenario: A new game joins

- **WHEN** a game is registered that offers a difficulty choice
- **THEN** it is asserted by this guard from its first commit, with no line added
  anywhere to enroll it

### Requirement: A board with a mistake check loads only with exactly one answer

The engine SHALL refuse to load a description, whoever wrote it, when the game
implements `findMistakes` and the game's own `solve`, asked about the board it
builds, proves the board has more than one solution (refused with
`DESC_NOT_UNIQUE`) or none (refused with `DESC_CONTRADICTORY`). The verdict
SHALL be part of `loadDesc`, so a pasted game ID, a shared link and a save are
judged alike. A solver that gives up without proving either SHALL leave this
verdict passing. A game's `findMistakes` SHALL compare the player's marks with
that one answer, including where the answer is hidden from the player; a hidden
answer SHALL NOT be a reason in `notApplicable.findMistakes`.

#### Scenario: A game ID with two answers

- **WHEN** a player opens a Black Box game ID whose lasers allow two layouts
- **THEN** it is refused with `DESC_NOT_UNIQUE`, and nothing throws

#### Scenario: A game ID upstream's generator wrote

- **WHEN** a desc from a frozen upstream fixture is loaded under the params its
  fixture states, every field of which is placed or known to describe the
  fixture
- **THEN** it loads

#### Scenario: A hidden answer is checked

- **WHEN** the player runs Check & Save in Mines with a flag on a square that
  has no mine
- **THEN** the flag is highlighted as a mistake and the board is not saved

## REMOVED Requirements

### Requirement: A board deduction cannot finish loads only on a tier that permits search

**Reason**: It took a tier named Unreasonable as stated and asked its board
nothing, and it exempted a game that declares `nonUniqueTiers`. A board with
several solutions loaded under either, with no mistake check and no hint.

**Migration**: "A board loads only if the game's own solver solves it" asks
every board, and carries the surviving scenarios.

## ADDED Requirements

### Requirement: A board loads only if the game's own solver solves it

The engine SHALL refuse to load a description, whoever wrote it, when the
game's own solver does not solve its board. The verdict SHALL be part of
`loadDesc`. For a game with a difficulty contract, the board SHALL load
exactly when the contract's solver solves it at some cap, whatever tier its
params state; a tier named Unreasonable is a cap like any other. A board no
cap solves SHALL be refused with `DESC_NO_SINGLE_ANSWER` in a game that has a
tier named Unreasonable, and with `DESC_NOT_DEDUCIBLE` in a game that has
none. For a game without a difficulty contract, the board SHALL load unless
the game implements `finishesByDeduction` and that returns false for the
board's opening state, which is refused with `DESC_NOT_DEDUCIBLE`. Where a
save carries a private description, the midend SHALL ask the public one.

No game SHALL offer a parameter or a tier that switches its generator's checks
off: a board that needs trial and error is dealt only at a tier named
Unreasonable, and every board dealt has one solution.

#### Scenario: A board no tier solves

- **WHEN** a Pearl game ID names a board neither tier's rules finish
- **THEN** it is refused with `DESC_NOT_DEDUCIBLE` under either tier's params,
  and nothing throws

#### Scenario: A board harder than its ID says

- **WHEN** a board that solves only at a tiered game's third cap is loaded under
  params stating its first tier
- **THEN** it loads

#### Scenario: A board with several solutions under an Unreasonable ID

- **WHEN** the board upstream's Dominosa dealt at its Ambiguous tier is loaded
  under params stating Unreasonable
- **THEN** it is refused with `DESC_NO_SINGLE_ANSWER`

#### Scenario: An untiered game's board that needs a guess

- **WHEN** a Mines game ID names a layout and first click from which the
  numbers do not determine every square
- **THEN** it is refused with `DESC_NOT_DEDUCIBLE`, as is a save of that board

#### Scenario: A game ID upstream wrote with its checks on

- **WHEN** a desc from a frozen upstream fixture is loaded under the params its
  fixture states
- **THEN** it loads, unless the fixture records that upstream's own solver
  found several answers on it, and a fixture naming an option that switches a
  generator's checks off names it at the value that leaves them on
