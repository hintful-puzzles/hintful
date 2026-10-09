# Cuts: engine-difficulty

Requirements: 20 before, 18 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| The tier-binding guard has no exemption list and counts its cases | process | `docs/games/testing.md` § "How a cross-game guard finds its population": rule 2 puts a floor under the population, rule 3 forbids an exemption roster. § "Right-sizing the gate" gives `seedBudget` and the slow tier. That a size which cannot carry a tier refuses it with a reason stays in "An offered tier generates, or is refused with a reason" and in the scenario "A hard tier on the smallest preset". |
| One helper says which tiers permit search | how | Which function decides is construction, and `permitsSearch` in `src/engine/difficulty.ts` is the one the midend imports. The rule it serves stays in "The midend throws when deduction runs out below Unreasonable", and the walk's half is `engine-hints`, "Deduction runs out only where the tier permits search". |
| "Its population SHALL be derived from the registry, with no enrollment list." (A cross-game guard asserts that tiers bind) | duplicate | "A tiered game declares a difficulty contract on its Game": declaring the contract enrolls the game in every cross-game difficulty guard, and no test-only enrollment module holds it. |
| Scenario "A new game joins" (A cross-game guard asserts that tiers bind) | duplicate | The same requirement, "A tiered game declares a difficulty contract on its Game", and its scenario "A game offers a difficulty choice and declares no contract". |
