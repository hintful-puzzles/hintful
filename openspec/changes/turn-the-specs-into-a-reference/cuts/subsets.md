# Cuts: subsets

Requirements: 35 before, 32 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| "Subsets game implements the Game interface": "The engine SHALL provide `src/games/subsets/` implementing the `Game` interface for Subsets, registered so the puzzle is served by the TypeScript engine." The solved rule stays, retitled "Subsets is solved when every set is placed once and every clue holds", with the meaning of a horseshoe and of a missing one written beside it (`subsetsValidate` in `src/games/subsets/solver.ts`). | type | The compiler and the registry say it of every game. |
| "Subsets game implements the Game interface": "Subsets is a deductive puzzle with a unique solution, so it SHALL declare a `findMistakes` hook." | duplicate | "Subsets flags mistakes for Check & Save" says what the hook reports, which it cannot do without one. |
| "Subsets game implements the Game interface": scenario "The preset produces a soluble board" | duplicate | "Subsets generates uniqueness-gated boards" and "A board above the lowest tier is not solved by the tier below" state it, with scenarios. |
| "A tier naming no rung is refused" (merged, rule and scenario whole, into "Subsets' parameters") | duplicate | Not a cut of the rule: one requirement on the game ID in place of two. |
| "Subsets declares the difficulty contract" (whole requirement and its scenario) | collection | `engine-difficulty` "A tiered game declares a difficulty contract on its Game": a game offering a tier declares `Game.difficulty`, and declaring it enrolls the game in every cross-game difficulty guard. |
| "Subsets is played by toggling letter slots": "A move SHALL be modeled as a discriminated union, not a move string." | type | `SubsetsMove` is the `Game`'s move type parameter; the compiler holds it. |
| "Solve fills the board without the win flash" (whole requirement and its scenario) | collection | `ts-engine` "Solve leaves a solved board" (the finished board, or a refusal with a reason), "The win flash plays on a forward move that solves the board" (never on the Solve command), and "No game's state records a solve or the solver's use" (the midend owns solved-with-help). |
| "Subsets solves by candidate elimination": "in the upstream order" | port | The rules only add information, so the fixpoint does not depend on their order; the order the hint reaches for them is "The hint reaches for the higher rules last". |
