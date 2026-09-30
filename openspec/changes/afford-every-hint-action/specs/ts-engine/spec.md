## ADDED Requirements

### Requirement: A hint step is played by the pointer gesture that makes it
Every game with a `hint` SHALL declare `hintGesture(state, ui, ds, move)`, returning the taps, drags and on-screen keys by which a pointer alone makes a hint step's move from the live board and `Ui`. `midend.executeHint()` SHALL NOT apply a step's move; it SHALL send the step's gesture through the game's `interpretMove` as the frontend delivers pointer input (a click as a press and its release, a drag as a press, its drag events and a release, a declined press as its release alone, and a key at the origin), and SHALL judge each move that makes with the game's `hintKeepTrack`. A key in a gesture SHALL be one the game's on-screen keypad offers, or the mark-all control where the game has one.

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

### Requirement: A target geometry can say where to press for a target
Every `TargetGeometry` SHALL provide `pointAt(state, ds, target, ui)`, a point whose press addresses `target`, so a hint's gesture can aim at a target of the model. `target-verb.test.ts` SHALL hold, for every declaring game and every target a press on its default board reaches, that a press at the target's `pointAt` addresses that same target.

#### Scenario: A point that presses a neighbor fails
- **WHEN** a geometry's `pointAt` returns a point inside a neighboring target
- **THEN** `target-verb.test.ts` fails for that game, naming the target and the point
