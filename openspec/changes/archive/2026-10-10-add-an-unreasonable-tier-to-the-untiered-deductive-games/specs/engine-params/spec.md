## REMOVED Requirements

### Requirement: The engine provides an untiered game's two usual answers

**Reason**: No game answers with `hintAndSolveFinish`. Every deductive game
that took it has tiers, and the Sticks board its scenario refused opens there
as one with several answers refused, or as Unreasonable where it has one.

**Migration**: "The engine provides the answer of a game that deduces
nothing" keeps `nothingToDeduce`, and "The engine walks a game's hint to the
end of a board" states the hint's half, which a tiered game asks.

## ADDED Requirements

### Requirement: The engine provides the answer of a game that deduces nothing

The engine SHALL provide `nothingToDeduce`, which says yes to every board,
for an untiered game whose board is moved, searched or guessed.

#### Scenario: A sliding puzzle

- **WHEN** a Fifteen game ID names any arrangement its parser reads
- **THEN** `finishesByDeduction` answers yes, and the board loads

### Requirement: The engine walks a game's hint to the end of a board

The engine SHALL provide `hintFinishes`: yes exactly when the game's `hint`,
followed from the given state a whole plan at a time, ends on a solved board,
and no where the hint refuses first. It SHALL throw for a game with no hint.

#### Scenario: A hint that finishes, and one that stops short

- **WHEN** `hintFinishes` is asked of a game whose hint plans a step at a time
  up to the solved board, and of one whose hint refuses a step before it
- **THEN** it answers yes for the first and no for the second

### Requirement: A deductive game has tiers

Every game whose hint can end in the deduction-exhausted refusal SHALL declare
a difficulty contract, with Mines the one exception: its answer is hidden, so
no search proves a board its deductions do not finish has one. The untiered
games SHALL otherwise be those that answer `nothingToDeduce`.

#### Scenario: The untiered games

- **WHEN** the registered games without a difficulty contract are listed, and
  those that do not answer `nothingToDeduce` are taken from them
- **THEN** Mines is the one game left
