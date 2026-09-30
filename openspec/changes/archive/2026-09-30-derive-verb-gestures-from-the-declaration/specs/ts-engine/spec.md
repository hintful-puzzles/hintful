## MODIFIED Requirements

### Requirement: A hint step is played by the pointer gesture that makes it
Every game with a `hint` SHALL declare `hintGesture(state, ui, ds, move, step)`, returning the taps, drags and on-screen keys by which a pointer alone makes a hint step's move from the live board and `Ui`; `step` is the whole step on display, so a gesture may be found by asking the game's `hintKeepTrack`. `midend.executeHint()` SHALL NOT apply a step's move; it SHALL send the step's gesture through the game's `interpretMove` as the frontend delivers pointer input (a click as a press and its release, a drag as a press, its drag events and a release, a declined press as its release alone, and a key at the origin), and SHALL judge each move that makes with the game's `hintKeepTrack`. A key in a gesture SHALL be one the game's on-screen keypad offers, or the mark-all control where the game has one.

The midend SHALL throw, naming the step and the gesture, when the gesture makes a move `hintKeepTrack` calls off the step, makes a move after the step completed, presses a key no on-screen control sends, or ends without completing the step; and when a hinted game has no `hintGesture`. `hint-gesture.test.ts` SHALL walk every hinted game's plans with `executeHint` on every gate preset.

#### Scenario: A step the pointer cannot make fails the walk
- **WHEN** a hinted game's plan contains a step whose move no tap, drag or on-screen key makes
- **THEN** its gesture either makes some other move, which `hintKeepTrack` calls off, or makes none, and `hint-gesture.test.ts` fails for that game

#### Scenario: A step made in several moves completes on the last
- **WHEN** a step's move is made by several pointer moves, such as three note strikes or two quarter turns
- **THEN** the earlier moves are judged on track and committed, the last completes the step, and the plan advances when it settles

#### Scenario: A key the player has no control for is refused
- **WHEN** a gesture presses a key that is neither on the game's keypad nor the mark-all control
- **THEN** `executeHint` throws, naming the key

## ADDED Requirements

### Requirement: A target-verb game's hint clicks come from its verbs
A game declaring `Game.targetVerbs` SHALL make a hint step that is one click on each of some targets through the engine's `verbClicks`, supplying only the step's targets in order. The engine SHALL choose each target's button by applying each button's declared verb there, left before right, and keeping the first whose move the game's `hintKeepTrack` judges on the step, judging a copy of the step and applying the verbs to a copy of the `Ui`; it SHALL aim each click at the geometry's `pointAt`, SHALL end the gesture at the click that completes the step, and SHALL throw, naming the target, where no button's verb keeps the step. A step made otherwise (a drag, or several presses of one target over values the step accepts) stays the game's own gesture.

A drag game's own press arm SHALL park the cursor through the engine's `pressTarget`, and the release of a drag that never left its target SHALL apply the verb the engine's `buttonVerb` names for the button, so the arm names neither the cursor's handling nor which verb a button applies.

#### Scenario: The button is the one the step keeps
- **WHEN** a step wants a square white and the left button's verb would make it black while the right button's makes it white
- **THEN** `verbClicks` clicks the square with the right button, at its `pointAt`

#### Scenario: A wrong target fails the walk
- **WHEN** a game's `hintGesture` names a target the step does not decide
- **THEN** `verbClicks` throws naming that target, and `hint-gesture.test.ts` fails for that game

#### Scenario: The step and the Ui are left as they were
- **WHEN** `verbClicks` derives a gesture for a step whose `hintKeepTrack` shrinks the step as it is followed
- **THEN** the step the midend holds, and the player's `Ui`, are unchanged by the derivation
