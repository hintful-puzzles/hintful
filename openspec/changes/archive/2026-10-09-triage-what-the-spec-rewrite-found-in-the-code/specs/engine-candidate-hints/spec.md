## MODIFIED Requirements

### Requirement: A game states the reading it starts on

A game that offers the reading SHALL start on one it states in its `newUi`:
the convention is `populate`, and a game overriding it SHALL say why. A caller
asking for a hint without a `Ui` SHALL get the game's own default:
`candidateHint` given no `Ui` reads `populate`, so such a game SHALL hand it
its own fresh `Ui` in that case. A game with no reading to offer SHALL state
none and pass `candidateHint` no `Ui`, and its plan walks `populate` only.

#### Scenario: A game with no reading to offer

- **WHEN** a game's plan supplies its own setup, as Salad's does, or its hint
  takes no `Ui` at all, as Crossing's does
- **THEN** its `newUi` carries no reading, the player is offered no choice of
  one, and its hint is the same with a `Ui` or without

#### Scenario: A hint with no Ui takes the game's reading

- **WHEN** a game whose `newUi` states the implicit reading is asked for a hint
  with no `Ui`
- **THEN** the plan is built under the implicit reading

#### Scenario: A game that offers the reading drops the Ui it was not given

- **WHEN** a game whose `newUi` states the implicit reading passes no `Ui` on
  to `candidateHint`
- **THEN** its hint with no `Ui` differs from the one its own fresh `Ui` gets,
  and the cross-game guard fails, naming the game
