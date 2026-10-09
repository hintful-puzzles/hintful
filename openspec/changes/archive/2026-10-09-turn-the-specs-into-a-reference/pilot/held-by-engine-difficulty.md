# What else holds each rule of `engine-difficulty`

Measured on 2026-10-09 against commit 176780d0
(`git show 176780d0:openspec/specs/engine-difficulty/spec.md`). Holders were
read from the working tree; no test was run.

A row is one obligation. "SHALL rows" are sentences or clauses containing
`SHALL` / `SHALL NOT`, in a requirement body or a scenario. "Scenario rows" are
scenarios that state a checkable outcome without the word, one row each, counted
apart so either total can be used. Short names used in `Where`:

- **contract test** = `src/engine/difficulty-contract.test.ts`
- **unit test** = `src/engine/difficulty.test.ts`
- **midend test** = `src/engine/midend.test.ts`
- **S&G** = `docs/games/solver-and-generator.md`
- **mechanics** = `docs/games/mechanics.md`

## Counts

| Holder | SHALL rows | Scenario rows | Both |
| --- | --- | --- | --- |
| `type` | 3 | 0 | 3 |
| `guard` | 22 | 15 | 37 |
| `declaration` | 3 | 0 | 3 |
| `guide` | 12 | 2 | 14 |
| `code only` | 3 | 0 | 3 |
| `spec only` | 6 | 2 | 8 |
| **Total** | **49** | **19** | **68** |

`not a rule` rows: 11.

Three rules are false of the code today (marked FALSE below): the contract's
"declared exceptions", the ungenerable tier that stays offered, and the pinned
tier "that promises no unique solution". Two pieces of non-rule prose are also
stale (the layering exemption count, and the 26-of-57 figure).

## Requirement: A tiered game declares its difficulty contract

| Rule | Holder | Where | Notes |
| --- | --- | --- | --- |
| A tiered game declares `difficulty` with `solveAtCap` on its `Game` | guard | contract test, "every game offering a difficulty choice declares the contract" | Shape is `Game.difficulty?: DifficultyContract` in `src/engine/game.ts`. S&G § "The difficulty contract". |
| The contract also carries the declared exceptions to the tier guards | guide | mechanics § "Difficulty is a declared contract"; `docs/games/engine-catalog.md` § "`difficulty.ts` — the cross-game difficulty contract" | FALSE. `DifficultyContract` has one member, `solveAtCap`. Both guides and the interface's own doc comment repeat the phrase. |
| The contract carries no tier list and no tier accessors | type | `src/engine/difficulty.ts`, `DifficultyContract` | A game's contract literal with a `tiers` key is an excess property. Nothing stops the interface itself being widened. S&G § "The difficulty contract". |
| `solveAtCap` returns a discriminated verdict, not a raw integer | type | `src/engine/difficulty.ts`, `DifficultyVerdict` | |
| `solveAtCap` stays per-game and is not derived | guide | S&G § "The difficulty contract" ("`solveAtCap` stays per-game, and that was measured") | |
| The contract describes the game and changes no board it generates | code only | `src/engine/difficulty.ts` header comment | No generator reads the contract. A game's frozen differential would move where it has one; not checked per game. |
| The tier list is not derived from `DIFF_*` constants | declaration | `difficultyTiers` reads the `difficultyItem` in `paramConfig` | mechanics § "Difficulty is a declared contract". |
| A tier the generator refuses at every size is still offered in the form | spec only | — | FALSE for the one known case. Bricks' third tier is `retired: 1` (`src/games/bricks/state.ts`; `retired` in `src/engine/game.ts` is "accepted when loading a board, refused when generating one, and never offered"). |
| That tier's refusal comes from `validateParams` with a readable reason | guard | contract test, "either generates every declared tier, or refuses it with a reason" | Covers only a tier that no preset accepts. A retired tier is refused by `paramsError` itself (`src/engine/params.test.ts`, "loads a retired choice but will not generate one"). |
| Every tier promises one solution found at that tier's cap | guard | contract test, "deals boards that need the tier the preset claims" | Presets only. S&G § "No tier promises ambiguity". |
| No separate "generate at tier" entry point on the contract | spec only | — | True of the interface today; nothing fails if one is added. |
| History of the `tiers` array and second accessor pair; the solver-integer survey and the 29-contract measurement | not a rule | — | |
| Examples of unreliable `DIFF_*` constants (Solo, Galaxies, Singles, Salad) | not a rule | — | Solo and Unruly examples also in mechanics. |
| Scenario: a newly tiered game is enrolled in both directions by declaring | guard | contract test, "every game offering a difficulty choice declares the contract" and "every game declaring the contract offers a difficulty choice" | `docs/games/testing.md` § "Enrollment duties". |
| Scenario: a tier that generates at no size stays offered and is refused with a reason | guard | contract test, "either generates every declared tier, or refuses it with a reason" | The refusal half only. "Stays offered" is the FALSE row above. |
| Scenario: an adapter that misreports its solver fails a guard | guard | contract test, "is monotone in its cap" (a dealt board solves at no cap) and "deals boards that need the tier the preset claims" | No test is titled "every declared tier is reachable", the name the spec gives. |

## Requirement: The difficulty contract lives on the Game interface

| Rule | Holder | Where | Notes |
| --- | --- | --- | --- |
| The contract is on `Game`, not the registry, not a test-only enrollment module | type | `src/engine/game.ts`, `Game.difficulty`; read as `this.game.difficulty` by `src/engine/midend.ts` | A second holder is not refused by the compiler. A new engine-side file importing games fails `src/module-layering.test.ts`, "the engine does not import games, except the named test helpers". |
| The reasons: the registry's single job, production use, the narrow layering exemption | not a rule | — | Two figures are stale: the layering test names three exempt files, not one; the spec says 26 of 57 here and 29 elsewhere. |
| Scenario: a proposed per-game capability goes on `Game` as an optional hook | spec only | — | Nearest neighbor is mechanics § "Capability flags", which is about a method versus a flag, not about the registry. |

## Requirement: The difficulty tier list is not a projection of the technique ladder

| Rule | Holder | Where | Notes |
| --- | --- | --- | --- |
| The tier list is not derived from declared deduction techniques | declaration | `difficultyTiers` reads the `difficultyItem` in `paramConfig` | S&G § "The difficulty contract"; mechanics § "Difficulty is a declared contract". |
| A proposal to derive it is answered with this requirement, not a new survey | guide | S&G § "The difficulty contract" ("Don't try to derive them from the technique ladder") | The guide points back to this spec for the record. |
| The measured scope is recorded rather than re-estimated | spec only | — | A census in prose; `docs/method.md` § "A count written in prose is a census nobody re-runs" argues the other way. |
| The three reasons the projection fails | not a rule | — | Also in the `difficultyTiers` doc comment and S&G § "The difficulty contract". |
| The census: 14 games on the shared runner, 29 contracts, overlap 12 | not a rule | — | |
| Scenario: such a change is refused with the three reasons, re-derived only if all three change | guide | S&G § "The difficulty contract" | The re-derivation condition is in the spec alone. |

## Requirement: Difficulty tier names come from one collection-wide scale

| Rule | Holder | Where | Notes |
| --- | --- | --- | --- |
| A game names its tiers from the scale by position | guard | contract test, "names its tiers from the collection's scale" | mechanics § "Difficulty is a declared contract". |
| `tierNames(n)` is the only definition a game writes | guide | mechanics § "Difficulty is a declared contract" ("You do not write the tier names") | The guard passes a hand-written array equal to the conventional one. |
| Position and name are a bijection across the collection | guard | contract test, "names its tiers from the collection's scale"; unit test, "names the same rung the same word at every length" | |
| `Unreasonable` is never issued by position | guard | unit test, "never hands out Unreasonable by position" | |
| `tierNames` refuses a count the scale cannot name | guard | unit test, "refuses a count the scale cannot name, rather than returning a short list" | |
| An override remains first-class, declared in the change that needs it | guide | `docs/doctrine.md` § "Convention over configuration"; mechanics § "Difficulty is a declared contract" | The guard has no exemption path today, so an override fails it until one is built. |
| An override's exemption is derived from a declaration, not a roster | guide | `docs/doctrine.md` § "Convention over configuration" | |
| Adopting the names changes no board, tier index or params encoding | guard | `src/engine/params-stability.test.ts`, "encoded params are byte-stable" | Encoding only. Boards and tier indices rest on per-game frozen differentials. |
| `DIFF_*` constant names are not read as the player-facing list | guide | mechanics § "Difficulty is a declared contract" | `difficultyTiers` never reads them. |
| Scenario: a preset title naming a difficulty word names that preset's own tier | guard | contract test, "never names a tier in a preset title that is not that preset's tier" | Sees only the scale's own words. |
| Scenario: preset titles derive their tier word from the tier list | declaration | `difficultyItem` sets `label: { slot: "tier" }`, read by `presetMenu` in `src/engine/param-label.ts` | A named preset still writes its own title; `src/engine/param-label.test.ts`, "derives the unnamed and keeps the named". |
| Scenario: a new game calls `tierNames` and authors no names | guide | mechanics § "Difficulty is a declared contract" | |
| Scenario: a list that drifts fails, naming the game and the conventional list | guard | contract test, "names its tiers from the collection's scale" | |
| History: twelve words across 29 games before the convention; Solo's "Intermediate" | not a rule | — | |
| Scenario "the guard is mistaken for a check on the Search promise" | not a rule | — | A caveat about the guard; the same words are in the test's comment. |

## Requirement: A cross-game guard SHALL assert that tiers bind

| Rule | Holder | Where | Notes |
| --- | --- | --- | --- |
| A guard requires a preset's board to solve at its tier and no lower | guard | contract test, "deals boards that need the tier the preset claims" | The rule is that the guard exists; nothing fails if it is deleted. S&G § "A tier means exactly its rung". |
| Its population is derived from the registry, with no enrollment list | guard | contract test, "inspected every registered game" and "every game offering a difficulty choice declares the contract" | |
| The guard makes the generator's rule and `solveAtCap` meet | guard | contract test, "deals boards that need the tier the preset claims" | S&G § "A tier means exactly its rung" ("the rule has two spellings"). |
| The guard is keyed on each preset's own tier, never a tier written onto another | guide | `docs/games/testing.md` § "How a cross-game guard finds its population", item 6 | A property of the test's code; no test fails if it is re-keyed. |
| Exceptions are derived from a declaration, never a roster | guide | `docs/doctrine.md` § "Convention over configuration" | The test has no roster. |
| A size that cannot carry a tier is refused by `validateParams` with a reason | guard | `src/engine/testing/absent-tiers.ts`, `describeAbsentTiers`, "%s is refused when a board is to be dealt" | Per-game only: called from 20 game test files, on cells each game lists. The cross-game test covers only a tier absent at every preset; `scripts/checks/tier-walk.test.ts` is a report. S&G § "A size that cannot carry a tier". |
| The guard carries a vacuity count asserted above a floor | guard | contract test, "graded enough boards to mean something", and the per-game `checked` count | |
| Cost is tiered: a per-commit slice, the full matrix in the slow tier | guide | mechanics § "The preset menu is a grid" | In the test's code (`SLOW_TESTS_ENABLED`, `seedBudget`) and comment; no test fails if the slice changes. |
| Scenario: a generator that downgrades a tier fails, naming game, preset and caps | guard | contract test, "deals boards that need the tier the preset claims" | |
| Scenario: a `solveAtCap` wider than its tier fails | guard | same | |
| Scenario: a tier unreachable at a size is refused, and nothing is asserted of it | guard | `describeAbsentTiers`, as above | Per-game only. |
| Scenario: a new game offering a difficulty choice is covered from its first commit | guard | contract test, "every game offering a difficulty choice declares the contract" | |
| History: what the old test measured, Undead's defect, ten violations against three | not a rule | — | |

## Requirement: The generator accept loop's correctness case SHALL be argued from measurement

| Rule | Holder | Where | Notes |
| --- | --- | --- | --- |
| A proposal to share the generate-and-strip loop argues economy | spec only | — | |
| It does not argue the move is needed for guess-free or on-tier generation | spec only | — | |
| A later proposal re-runs the sweep rather than quoting the figure | guide | `docs/method.md` § "Measure a proposal's number before designing against it" | The general rule; the guide does not name this sweep. |
| The measured figure (282 of 285 preset cases) and the retired framework argument | not a rule | — | |
| Scenario: such a proposal argues from surface removed and re-runs the sweep | spec only | — | |
| Scenario: after a loop is shared, the on-tier guard still asserts its boards | guard | contract test, "deals boards that need the tier the preset claims" | |

## Requirement: The midend SHALL throw when deduction runs out outside an Unreasonable tier

| Rule | Holder | Where | Notes |
| --- | --- | --- | --- |
| On `DEDUCTION_EXHAUSTED` off an `Unreasonable` tier, the midend throws, naming game, move, tier and full id | guard | midend test, "a board on any other tier is a defect, thrown with the id to reopen it" | Asserts the whole message. `docs/games/hints.md` § "Refusal wording comes from one module". |
| A game with no tiers is included | guard | midend test, "a game with no tiers has none that allows trial and error" | |
| The tier test is one helper, `permitsSearch`, read by the midend and the walk | guide | `docs/games/engine-catalog.md` § "`difficulty.ts` — the cross-game difficulty contract" | Both import it today. The contract test compares the literal `"Unreasonable"` itself. |
| Auto-Hint stops when a step throws | guard | `src/puzzle/puzzle-hint-stepper.test.ts`, "a step that throws stops the loop and lets the error through" | |
| Scenario: a board pinned below the tier it needs throws, and the refusal is never read | guard | midend test, "a board on any other tier is a defect, thrown with the id to reopen it" | The fixture's solver solves at every cap, so the pin stands. A pin the solver rejects is raised at load (next requirement). |
| Scenario: an `Unreasonable` board gets the refusal and no throw | guard | midend test, "an Unreasonable board gets the refusal" | |
| Scenario: Auto-Hint stops and the error propagates | guard | `src/puzzle/puzzle-hint-stepper.test.ts`, as above | |
| Why the sentence would be false, and why no test walk meets these boards | not a rule | — | Also in `docs/games/hints.md` § "Refusal wording comes from one module". |

## Requirement: A loaded board carries the tier it needs

| Rule | Holder | Where | Notes |
| --- | --- | --- | --- |
| A board loaded from an id or a save gets the tier its solver says | guard | midend test, describe "Midend: a board carries the tier it needs" | S&G § "The difficulty contract". |
| A params string that cannot tell tiers apart loads at the lowest solving tier | guard | contract test, "deals boards that need the tier the preset claims" (the shared reload) and "reloaded shared boards in enough games to mean something" | The midend test's upstream-id case uses a fixture with no contract, so it does not test grading. |
| A pinned tier is kept when the board solves at it | guard | midend test, "an id pinning a tier the board solves at keeps it, even above the one it needs" | |
| Otherwise the board is raised to the lowest solving tier above the pin | guard | midend test, "an id pinning a tier below the board's is raised to the tier it needs" | |
| A pinned tier is never lowered | guard | midend test, "an id pinning a tier the board solves at keeps it, even above the one it needs" | |
| A pinned tier that allows search is kept without solving | code only | `src/engine/midend.ts`, `withBoardTier` (`if (permitsSearch(...)) return params`) | The one `Unreasonable` fixture's solver solves at every cap, so no test tells this branch from the next. |
| A pinned tier that promises no unique solution is kept without solving | spec only | — | FALSE or vacuous. No such tier exists and `withBoardTier` has no branch for one; the first requirement forbids the tier. |
| When no tier qualifies, the decoded params stand | code only | `src/engine/midend.ts`, `withBoardTier` (`tier === null ? params : …`) | Its comment says `loadDesc` turns such a board away first. |
| Scenario: a shared board reloads at the tier it was dealt at | guard | contract test, "deals boards that need the tier the preset claims" | |
| Scenario: an id stating a tier the board solves at keeps it | guard | midend test, "an id pinning a tier the board solves at keeps it, even above the one it needs" | |
| Scenario: a pin below the board's tier is raised, from an id or a save | guard | midend test, "an id pinning a tier below the board's is raised to the tier it needs" and "a save pinning a tier below the board's is raised on load" | |
| Why the board is the authority on its own tier | not a rule | — | |
