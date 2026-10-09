# Verdicts: unruly

## keep `unruly`: A hint-executed placement plays at the hint-step duration

The stretch is the midend's for every game (`HINT_ANIM_S` in `src/engine/midend.ts`: a hint move with a non-zero `animLength` plays over one uniform duration, and one with none stays instant), and no requirement of `engine-hints`, `engine-drawing` or `ts-engine` states it. A game's file may not add a rule to a shared capability, so the rule stays where it is written. Unruly's own part, that a single placement has a positive `animLength` for the stretch to act on, is in its scenario.

## keep `unruly`: hintKeepTrack completes on the hinted cell and value

It is a hint's behavior and it decides something: the hinted cell set to the other value is off the plan, and no partial verdict exists. `engine-hints`, "hintKeepTrack judges a move against the board before it", says when the game is asked and not what it answers, so the answer has no other home than `hintKeepTrack` in `src/games/unruly/index.ts`.

## keep `unruly`: Unruly draws a cursor outline and a completion flash

No shared requirement says how a grid cursor is drawn: `engine-colors` gives the cursor its color and `engine-input` its movement, and the games differ (Rectangles and Light Up draw brackets at the corners, Unruly a full outline). The outline is the game's look.

## reword `unruly`: A malformed Unruly description is refused

The second sentence, that `newState` reads clue cells as immutable and every other cell as empty, restates "Unruly descriptions are run-length color grids", which says the desc encodes the immutable clue cells between runs of empty ones. It goes as a duplicate. The refusals are unchanged.

### Requirement: A malformed Unruly description is refused

`validateDesc` SHALL reject a desc holding any character outside the
run-length alphabet and any desc whose decoded length differs from
`w2·h2 + 1`.

#### Scenario: A malformed description is rejected

- **WHEN** `validateDesc` is given a desc with an invalid character or a decoded
  length mismatching the params
- **THEN** it returns a non-null error string

## edit `unruly`: A placement on a clue or off the board is rejected

That `executeMove` is pure is `ts-engine`, "Applying a move returns a new state", for every game. The rejection is Unruly's and stays, and the scenario still holds the given state unchanged.

from: `executeMove` SHALL be pure and SHALL reject a placement whose target is out
to: `executeMove` SHALL reject a placement whose target is out

## keep `unruly`: Unruly's keys place and clear at the cursor

"A keyboard cursor SHALL move within the grid" is `engine-input`, "One arrow press reveals the cursor and moves it", and it stays as the half-sentence that says Unruly has a cursor for the digit keys to act at. What a control does is not cut for being short.

## keep `unruly`: A firing that forces several cells is one journey

`engine-hints`, "One deduction firing is one journey", gives the rule. This says which of Unruly's techniques are such firings (a completed count, a near-complete line) and which emit independent steps (three-in-a-row, unique rows), which is the hint's own shape.

## note unruly: the hint-step stretch has no shared requirement

`engine-hints` should say, once, that a hint-executed move plays its game's animation stretched to one uniform duration, and that a game with no animation plays it at once (`HINT_ANIM_S` and `animScale` in `src/engine/midend.ts`). Then "A hint-executed placement plays at the hint-step duration" would reduce to Unruly having an animation, which "A placement animates as a growing fill" already says, and could be cut as `collection`.

## note unruly: the cut of the hint's refusal on a solved or mistaken board stands

"A hint is refused on a solved or mistaken board" was the midend's rule, `engine-hints`, "The midend SHALL refuse a hint on a finished or wrong board before asking the game", and Unruly's `hint` writes neither refusal.

## note unruly: the drag needs no requirement of its own

Unruly declares a sweep with no limit (`sweep: { holds }` in `targetVerbs`, `src/games/unruly/index.ts`), so a drag on from a press does exactly what `engine-input`, "A drag on from a press repeats the press", says of every declaring game. There is no departure to state. `hintGesture` is the hint choosing the button that reaches the hinted value in one press, which `engine-hints`, "A hint step is played by the pointer gesture that makes it", covers.
