## MODIFIED Requirements

### Requirement: The midend builds the Custom form from paramConfig and applies it

The `Midend` SHALL build the app's `ConfigDescription` and initial
`ConfigValues` from `paramConfig` and the current params, leaving out a
field whose bounds allow one value. It SHALL apply a submitted form to a
copy of the params checked with `paramsError`: on success it adopts them,
so the app generates a new game at them, and on failure it returns the
refusal and applies nothing. `paramConfig` is required of every game; for
one with no fields the form SHALL be empty.

#### Scenario: Valid values are applied

- **WHEN** the dialog submits values that pass `paramsError`
- **THEN** a new game is generated at those params

#### Scenario: An invalid custom value is rejected with the game's message

- **WHEN** the submitted values fail the game's `validateParams`
- **THEN** the engine returns the refusal and does not change the current
  params

#### Scenario: A game with no custom fields has an empty form

- **WHEN** a game's `paramConfig` is empty
- **THEN** its form has no fields and a submission changes nothing

#### Scenario: A field with one value is left out

- **WHEN** the Custom dialog is opened for Subsets, whose width, height and
  letters are each bounded to 4
- **THEN** it holds the difficulty alone, and Normal submitted deals a
  `4x4n4dt` board
