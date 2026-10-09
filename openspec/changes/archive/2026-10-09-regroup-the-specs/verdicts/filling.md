# Verdicts: filling

## keep `filling`: Filling solver deduces the unique solution

The four techniques are the solver's reach, and the reach decides which boards the generator deals ("Filling generates uniquely solvable boards") and which deductions the hint has to narrate. A session adding or removing a technique checks against this list; the hint requirements name the rungs and not the solver's promise that they are sound and confluent.

## keep `filling`: Filling hint color legend

Not merged. It says which mark and which color each role takes, that the legend is the same across the deduction kinds, and that grouped targets share one color. A hint's marks are not cut for the one clause it shares with the requirement below.

## keep `filling`: Filling draws the displayed step's target and evidence

Not merged. It says what is marked and why: a target carries no digit because the value is read from the narration, evidence digits stay readable, and evidence never includes a target. None of that is in the legend.

## reword `filling`: Filling provides on-screen key labels

What the keypad offers stays: the digits 1 to 9 and Clear, the same on every board size. The method name and the Clear key's button code go as `how`: the keypad is built by `digitKeys(9)` in `src/engine/key-labels.ts`, which appends the shared `clearKey`, and that key's code and label are said for every game by `engine-input` "The on-screen key panel is a second key emitter" ("the clear key's button is `8`") and "A key label carries its resolved text" (the label `"Clear"`, on `CLEAR_BUTTON`).

### Requirement: Filling provides on-screen key labels

Filling's on-screen keypad SHALL be the digits `1` to `9`, each labeled by its
digit, followed by the collection's Clear key. It SHALL be those keys whatever
the board's size.

#### Scenario: The keypad is digits 1–9 plus clear

- **WHEN** the key labels are requested for any Filling board
- **THEN** the result is the buttons `1,2,…,9` followed by a clear key

## note filling: the hint's own refusal needs no requirement of the game's

`hint` returns `DEDUCTION_EXHAUSTED` when its plan is empty (`src/games/filling/index.ts`). `engine-hints` "Deduction runs out only where the tier permits search" says a hinting game with no difficulty contract "SHALL NOT be able to emit this refusal", and Filling has no tiers, so on a sound board that line is one the shared guard exists to keep unreachable. Nothing is added to the filling spec. If the line is in fact unreachable it is dead code in the game, which is the code's question and not the spec's.
