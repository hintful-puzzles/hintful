## MODIFIED Requirements

### Requirement: Params validity is the engine's check

Whether params can be played SHALL be decided by the engine's `paramsError(game,
p, full)`: each item's `bounds`, each choice inside its list, then the game's own
`validateParams`, which is optional and holds only what the items cannot state —
a limit depending on another field, or one that applies only when generating.
The midend, and every test asking whether params are valid, SHALL call it.

A bound's refusal SHALL name the field by the label its Custom dialog shows.
Where a requirement elsewhere in the specs says a game's `validateParams` SHALL
reject some params, that requirement is met by this check.

A generation-only limit SHALL NOT move into `bounds`, because a bound applies
whatever the `full` flag says and would refuse a description-carrying game ID
that loads today.

#### Scenario: A value outside its range

- **WHEN** the Custom dialog submits a width below its declared minimum
- **THEN** the engine refuses it with "Width must be at least N.", and the game's
  own `validateParams` is not asked

#### Scenario: A choice outside its list

- **WHEN** a decoded game ID carries a difficulty index past the tier list
- **THEN** the engine refuses it, naming the field and its choices

## ADDED Requirements

### Requirement: A params refusal is a sentence

Every refusal `paramsError` returns SHALL be one sentence with its full stop:
the bounds and choice messages it generates, and every string a game's
`validateParams` can return. The Custom dialog and the Enter Game ID dialog
SHALL show a refusal as it comes, adding no punctuation of their own. Which
refusals a game has stays the game's own, because most are rules about one
puzzle; only the form is the collection's.

`params-refusal.test.ts` SHALL hold the games' half by reading every function
named `validateParams` and following each `return` through conditionals,
templates, top-level constants and the functions it calls, failing a string it
cannot read as well as one that is not a sentence.

#### Scenario: A game's refusal reaches the Enter Game ID dialog

- **WHEN** a player opens a game ID whose params the game refuses
- **THEN** the dialog shows the game's sentence after "That game won't open.",
  with the full stop the game wrote

#### Scenario: A fragment is refused at commit

- **WHEN** a game's `validateParams` returns "Too many mines for grid size"
- **THEN** `params-refusal.test.ts` fails, naming the file and line

#### Scenario: A constant shared by games is read once

- **WHEN** several games return `AREA_TOO_LARGE`
- **THEN** the guard reads the constant's own text and names it once, where it
  is written
