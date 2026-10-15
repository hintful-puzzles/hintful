## MODIFIED Requirements

### Requirement: verbClicks chooses each click's button by the verb the step keeps

The engine SHALL choose each target's button by applying each button's declared
verb there and judging its move with the game's `hintKeepTrack`, on a copy of
the step and with the verbs given a copy of the `Ui`. Of the buttons the step
keeps, it SHALL take one that completes the step, then one that shrinks it,
then the first, left before right. It SHALL aim each click at the geometry's
`pointAt`, SHALL end the gesture at the click that completes the step, and
SHALL throw, naming the target, where no button's verb keeps the step.

#### Scenario: The button is the one the step keeps

- **WHEN** a step wants a square white and the left button's verb would make it
  black while the right button's makes it white
- **THEN** `verbClicks` clicks the square with the right button, at its
  `pointAt`

#### Scenario: A press only on the way is not the gesture's

- **WHEN** a press cycle's `hintKeepTrack` keeps the left button's click as on
  the way to the step's mark, and the right button's click makes the mark
- **THEN** `verbClicks` clicks with the right button

#### Scenario: The step and the Ui are left as they were

- **WHEN** `verbClicks` derives a gesture for a step whose `hintKeepTrack`
  shrinks the step as it is followed
- **THEN** the step the midend holds, and the player's `Ui`, are unchanged by
  the derivation
