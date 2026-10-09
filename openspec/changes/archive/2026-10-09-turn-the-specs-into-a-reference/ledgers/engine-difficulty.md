# Ledger: engine-difficulty

Base: 176780d0

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## A tiered game declares its difficulty contract

| Rule | Where it went |
| --- | --- |
| A tiered game declares `difficulty` and an untiered one omits it | spec: A tiered game declares a difficulty contract on its Game |
| The contract is `solveAtCap(params, desc, cap)` | spec: The contract is the capped solver and nothing else |
| The contract carries no tier list and no accessors | spec: The contract is the capped solver and nothing else |
| Tier names are read off the difficulty item, and `tierOf` and `withTier` go through it | spec: A game's tiers are read from its difficulty item |
| A `tiers` array and a second pair of accessors were once held equal by assertion | history |
| `solveAtCap` returns a discriminated verdict, not the solver's integer | spec: solveAtCap answers with a verdict |
| The solvers' integers are not uniform, across 26 conventions | figure; held: src/engine/difficulty.ts "Why a discriminated verdict" |
| `solveAtCap` stays per game and is not derived | spec: The contract is the capped solver and nothing else |
| Measured across 29 contracts, the only shared step is `newState` | figure; guide: docs/games/solver-and-generator.md § "The difficulty contract" |
| The contract describes and changes no generated board | spec: A tiered game declares a difficulty contract on its Game |
| The tier list is not derived from `DIFF_*` constants | spec: A game's tiers are read from its difficulty item |
| Solo, Galaxies, Singles and Salad as cases of an unreliable constant | spec: A game's tiers are read from its difficulty item; reason |
| The contract also declares the exceptions to the tier guards | untrue: `DifficultyContract` has one member, `solveAtCap`, and the guides and the doc comment that repeated the phrase are corrected with this rewrite |
| A tier refused at every size still loads, and generating at it is refused with a reason | spec: A tier with no boards is retired and still loads |
| That refusal comes from the game's `validateParams` | untrue: a retired choice is refused by the engine's own check of the params (`src/engine/params.ts`), with the sentence it gives any value outside a field's choices |
| Such a tier is still offered in the form | untrue: the difficulty item's `retired` count is "accepted when loading a board, refused when generating one, and never offered" (`src/engine/game.ts`), and Bricks' Tricky is declared that way, so the requirement now states the retired choice |
| No tier promises anything but one solution found at its cap | spec: Every tier promises one solution found at its cap |
| A tier whose generator skips the uniqueness search is not offered | spec: Every tier promises one solution found at its cap |
| No separate entry point for generating at a tier | spec: The contract is the capped solver and nothing else |
| Scenario: declaring enrolls the game, and a choice without a contract or a contract without a choice fails | spec: A tiered game declares a difficulty contract on its Game |
| Scenario: a tier that generates at no size | spec: A tier with no boards is retired and still loads |
| The guard requires a refusal with a reason of a tier that generates nowhere | spec: An offered tier generates, or is refused with a reason |
| Scenario: an adapter misreports its solver | spec: solveAtCap answers with a verdict |

## The difficulty contract lives on the Game interface

| Rule | Where it went |
| --- | --- |
| The contract is declared on `Game`, not in the registry and not in a test-only module | spec: A tiered game declares a difficulty contract on its Game |
| The registry's one responsibility is identity lookup | spec: A tiered game declares a difficulty contract on its Game |
| The acceptance helper is production code, and the layering rule exempts one importer by name | reason |
| Scenario: a capability proposed for the registry goes on `Game` as an optional hook | spec: A tiered game declares a difficulty contract on its Game |

## The difficulty tier list is not a projection of the technique ladder

| Rule | Where it went |
| --- | --- |
| The tier list is not derived from the deduction techniques | spec: A game's tiers are read from its difficulty item |
| A change proposing it is answered with the requirement, not a new survey | spec: A game's tiers are read from its difficulty item |
| The framework vision proposed the projection | history |
| The three reasons: indices are not names, the projection runs the wrong way, a tier is not always a rung | guide: docs/games/solver-and-generator.md § "The difficulty contract"; held: src/engine/difficulty.ts "A tier is not always a rung" |
| The scope the survey was measured over is recorded | figure |
| Scenario: the reasons are re-derived only when all three conditions change | spec: A game's tiers are read from its difficulty item |

## Difficulty tier names come from one collection-wide scale

| Rule | Where it went |
| --- | --- |
| Tiers are named from the scale by position, and `tierNames(n)` is the only definition | spec: Tier names come from one collection-wide scale |
| Position and name are a bijection across the collection | spec: Tier names come from one collection-wide scale |
| The twelve words the games had chosen before | history; guide: docs/games/mechanics.md § "Difficulty is a declared contract" |
| `Unreasonable` is not issued by position, and is declared with `search: true` | spec: Unreasonable is declared and never issued by position |
| The name is reserved for a tier whose boards can require Search | spec engine-hints: A hint step always names a technique, with no un-narrated fallback |
| `tierNames` refuses a count the scale cannot name | spec: Tier names come from one collection-wide scale |
| An override is first-class, and its exemption comes from a declaration and not a roster | spec: A game overrides the scale only by declaring why |
| No game overrides the scale | figure |
| Adopting the convention changes no board, tier index or params encoding | spec: A tier's name is not part of any encoding |
| `DIFF_*` names are rung labels and are not read as the player-facing list | spec: A game's tiers are read from its difficulty item |
| Scenario: a new game calls `tierNames` | spec: Tier names come from one collection-wide scale |
| Scenario: names that drift fail the guard, and the game adopts or overrides | spec: A game overrides the scale only by declaring why |
| Scenario: a preset title naming a difficulty names its own tier, derived from the tier list | spec: A preset title that names a difficulty names its own tier |
| Solo's menu once offered "3x3 Intermediate" beside "Tricky" | history |
| Scenario: the guard is evidence about the shape of the list only | spec: Unreasonable is declared and never issued by position |

## A cross-game guard SHALL assert that tiers bind

| Rule | Where it went |
| --- | --- |
| `ts-migration` requires the behavior, and this adds the check | spec ts-migration: A difficulty tier binds the board it generates |
| The monotonicity sweep once computed the lowest cap and used it only as a floor | history; guide: docs/games/solver-and-generator.md § "A tier means exactly its rung" |
| A board dealt from a preset solves at its tier and no lower, over a derived population | spec: A cross-game guard asserts that tiers bind |
| The rule has two spellings and the guard makes them meet | spec: A cross-game guard asserts that tiers bind; guide: docs/games/solver-and-generator.md § "A tier means exactly its rung" |
| Undead's unbounded arc-consistency in its contract | history; guide: docs/games/solver-and-generator.md § "A tier means exactly its rung" |
| The guard is keyed on the presets a player can pick | spec: A cross-game guard asserts that tiers bind |
| Ten violations across four games where there were three across one | figure |
| `validateParams` accepting params is not evidence a board can carry the tier | spec: A cross-game guard asserts that tiers bind |
| Exceptions are derived from a declaration, never a roster | spec: The tier-binding guard has no exemption list and counts its cases |
| The guard carries a vacuity count above a floor | spec: The tier-binding guard has no exemption list and counts its cases |
| The per-commit slice samples seeds and the full matrix runs in the slow tier | spec: The tier-binding guard has no exemption list and counts its cases |
| The doc comment states what the gate slice still covers | held: src/engine/difficulty-contract.test.ts "deals boards that need the tier the preset claims" |
| Scenario: a generator downgrades a tier | spec: A cross-game guard asserts that tiers bind |
| Scenario: a contract's capped solve is wider than its tier | spec: A cross-game guard asserts that tiers bind |
| Scenario: a tier unreachable at a size | spec: The tier-binding guard has no exemption list and counts its cases |
| Scenario: a new game joins with no line added | spec: A cross-game guard asserts that tiers bind |

## The generator accept loop's correctness case SHALL be argued from measurement

| Rule | Where it went |
| --- | --- |
| A proposal to share the loop argues economy, not reliability | spec: Shared generation machinery is argued from economy |
| 282 of 285 preset cases needed exactly their tier | figure |
| The framework vision argued the opposite | history |
| A later proposal re-runs the sweep rather than quoting it | spec: Shared generation machinery is argued from economy |
| Scenario: a proposal argues the framework should own the loop | spec: Shared generation machinery is argued from economy |
| Scenario: a generator regresses after the loop is shared | spec: Shared generation machinery is argued from economy |

## The midend SHALL throw when deduction runs out outside an Unreasonable tier

| Rule | Where it went |
| --- | --- |
| The midend throws, naming the game, move, tier and id, instead of returning the refusal | spec: The midend throws when deduction runs out below Unreasonable |
| On any other tier the sentence would be false and the board is a defect | spec: The midend throws when deduction runs out below Unreasonable |
| A runtime board can carry the wrong tier where no test walk meets it, and the reporter shows the crash dialog | reason; held: src/engine/midend.ts "the board is a defect worth a report" |
| The tier test is one helper, `permitsSearch`, read by the midend and the walk | spec: One helper says which tiers permit search |
| Auto-Hint stops when a step throws | spec: Auto-Hint stops when a step throws |
| Scenario: a board pinned below the tier it needs | spec: The midend throws when deduction runs out below Unreasonable |
| Scenario: an Unreasonable board runs out of deduction | spec: The midend throws when deduction runs out below Unreasonable |
| Scenario: Auto-Hint meets a thrown step | spec: Auto-Hint stops when a step throws |

## A loaded board carries the tier it needs

| Rule | Where it went |
| --- | --- |
| A params string that cannot tell tiers apart loads at the lowest solving tier | spec: A loaded board whose id states no tier takes the lowest tier that solves it |
| A pinned tier is kept when the board solves at it, raised otherwise, and never lowered | spec: A pinned tier is kept or raised and never lowered |
| A pinned tier that allows search is kept without solving | spec: A pinned tier is kept or raised and never lowered |
| A pinned tier that promises no unique solution is kept without solving | untrue: no tier promises that, by "Every tier promises one solution found at its cap", and `Midend.withBoardTier` has no such case |
| When no tier qualifies the decoded params stand | spec: A pinned tier is kept or raised and never lowered; spec: A loaded board whose id states no tier takes the lowest tier that solves it |
| The board is the authority on its own tier, and a mislabeling build wrote wrong pins | reason; guide: docs/games/solver-and-generator.md § "The difficulty contract" |
| Scenario: a shared board reloads at the tier it was dealt at | spec: A loaded board whose id states no tier takes the lowest tier that solves it |
| Scenario: an id stating a tier the board solves at keeps it | spec: A pinned tier is kept or raised and never lowered |
| Scenario: a pinned tier below the board's is raised | spec: A pinned tier is kept or raised and never lowered |
