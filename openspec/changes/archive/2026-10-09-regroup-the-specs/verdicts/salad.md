# Verdicts: salad

## keep `salad`: A Salad move that would not change the board is a no-op

No shared requirement says a move that changes nothing makes no history entry: `engine-notes` "The engine owns what a press and an entry do to the highlight" covers only re-typing the value a cell holds. Most of this requirement is Salad's own in any case: what the two markers do on a square that already carries one, and the refusal of an empty marker on a ball.

## keep `salad`: Salad offers a fill-all-candidates action

The key and the fill-then-clean are `engine-notes` "The Mark-all action is the M key" and "Mark-all is adaptive in a game with uniqueness regions". Which squares count as needing notes is Salad's own and is what the scenario says: a square marked empty is blank and never takes notes, so Salad asks `needsPencilFill` (`src/games/salad/state.ts`) and not the shared predicate.

## keep `salad`: Salad's generation retry bound outlasts a legal seed

It is a decision with its reason, and a session changing the constants in `src/games/salad/generator.ts` would read it first: the bound is sized from the mean tries of a shape's rarest tier, two shapes have bounds of their own, and running out is a refusal the player sees. `engine-difficulty` "Every generate-until-success loop is bounded by the shared retry limit" says only that a bound exists.

## keep `salad`: Salad's hint plan is recomputable from any position

`engine-hints` "The hint walk SHALL cover every preset a game offers" promises the walk solves from any reached position, and `engine-candidate-hints` "A firing is offered only when the board shows its premise" is about the order of firings. Neither says a recomputed plan repeats none of the moves already on the board, and the scenario of `engine-candidate-hints` "A candidate hint plan reads an unmarked cell the way the player chose" binds only games that offer the reading, which Salad does not. Hint behavior, so it stays.

## reword `salad`: Salad has two difficulties, both solved by deduction alone

The requirement did not say what separates the tiers. `src/games/salad/solver.ts` does (`diffSimple: DIFF_EASY`, the set and forcing layers at `DIFF_HARD`, which is shown as Normal, and the border deduction as the one user-solver at Easy), and what a tier means belongs in the spec. One sentence is added and nothing is removed.

### Requirement: Salad has two difficulties, both solved by deduction alone

Salad's solver SHALL provide two difficulties, Easy and Normal, and both SHALL
be solvable by pure deduction without guessing. To the shared Latin deductions
it SHALL add one of its own, the border-clue deduction, in ABC End View mode.
Easy SHALL be that deduction and the shared positional and numeric
eliminations, and Normal SHALL add the shared set elimination and forcing
chains.

#### Scenario: The solver deduces the unique solution without guessing

- **WHEN** a generated board is solved at its difficulty
- **THEN** the solver reaches the unique completion using only its deductive
  techniques, never backtracking search

## keep `salad`: Salad selects a square and enters a symbol or a marker

What the two presses do under each setting of the sticky preference is the engine's (`pressNoteTakingCell`), but `engine-notes` states it only in scenarios, so the game keeps it. See the note in `verdicts/towers.md`.

## reword `salad`: Salad's menu offers both of its difficulties

collection: "The menu SHALL hold one section for each game mode" and its scenario restate `engine-params` "The preset menu gives each ruleset a section", which covers Salad with no departure: Salad declares `rulesetItem(RULESETS, "mode")` and lists its presets flat. That sentence and the scenario "Each mode has a section" go, and "within a section" becomes "within a mode" because the sentence that introduced the sections has left. Nothing else changes.

### Requirement: Salad's menu offers both of its difficulties

Salad's presets SHALL include boards at each difficulty the game deals, so a
player reaches Normal from the menu and every cross-game guard that deals from a
game's presets deals a Normal Salad board. The Normal presets SHALL be shapes
whose deal stays well under a second. Within a mode each shape's Normal preset
SHALL follow its Easy one.

#### Scenario: Normal is on the menu

- **WHEN** Salad's preset menu is read
- **THEN** it holds presets titled Normal as well as Easy, in both game modes,
  and a shape offered at both has its Normal line straight after its Easy one

#### Scenario: A cross-game guard deals a Normal board

- **WHEN** a cross-game guard takes Salad's presets one per value of every
  field they vary
- **THEN** difficulty is one of those fields, and a Normal board is among the
  boards it deals

## note The cut of "Computing a hint leaves Salad's generation unchanged" stands

`src/games/salad/generator.ts` names no recorder at all, so `engine-hints` "The solver and the hint are two projections of one deduction engine" (the generator runs with the recorder off) covers it as read. "A Salad hint is refused on a wrong or a complete board" is likewise gone, to `engine-hints` "The midend SHALL refuse a hint on a finished or wrong board before asking the game".

## note No shared requirement says a move that changes nothing is no move

Salad states it for itself, and Towers, Unequal and Mathrax each say "entering a value a cell already holds SHALL be a no-op" in their input requirements. If it is meant of every game, `ts-engine` or `engine-input` should say that `interpretMove` makes no move, and so no history entry, of an input that would leave the board as it is.
