## MODIFIED Requirements

### Requirement: A ruleset declares what it offers of the other settings

A ruleset that does not take every value of another setting SHALL say so in its declaration (`Ruleset.only`, `engine/ruleset.ts`), by the setting's keyword: the choices it offers of a choices field, or the one value a checkbox has in it. A rule modifier that takes values of another setting away SHALL say so the same way (`modifierItem`'s `only`, `engine/modifier.ts`): a checkbox for the value at which its rule applies, a choice by the index of each choice that narrows. A setting left out is taken whole. A declaration that names no other field of the game, names one of the wrong kind, offers none of its choices, narrows a field that itself decides others, or leaves nothing of a field between two deciding fields SHALL throw wherever the declaration is read.

From the declaration the engine SHALL build three things (`engine/only.ts`), and no game SHALL write any of them:

- the refusal of a params set about to deal a board that holds a value the deciding field does not leave, in `paramsError`, naming the field by its dialog label, what it must be, and the ruleset by name or the modifier by its label and value. A board that arrives already written (a `:desc` game ID, a save) SHALL NOT be held to it;
- what the Custom dialog offers: while a deciding value is chosen, a choice it does not leave and a checkbox it fixes SHALL be disabled, a choices field left one choice SHALL be disabled whole, and each SHALL show a value it is offered. A field two deciding fields narrow SHALL offer what both leave. The form SHALL submit a narrowed field at the value it shows, and SHALL keep the value the player set, so that leaving the deciding value returns to it. A deciding field MAY be a choices field or a checkbox;
- a sentence in the narrowed field's entry of the help's Parameters section.

The engine SHALL also refuse a submission of the dialog's values that holds what a deciding field does not leave, with the same sentence, whether or not the game's params can hold the pair.

A limit on a typed number (an area, a size a tier needs) is not declared this way and stays in `validateParams`: a text field cannot show it before OK is pressed, so there is no second copy for a declaration to remove.

#### Scenario: A ruleset is chosen that fixes a setting the player had changed

- **WHEN** the player ticks a checkbox, then chooses a ruleset whose `only` holds that checkbox off, and presses OK
- **THEN** the checkbox is shown disabled and unticked, and the board is dealt with no refusal

#### Scenario: The player goes back to the first ruleset

- **WHEN** the player then chooses the first ruleset again, before pressing OK
- **THEN** the checkbox is enabled and ticked as they left it

#### Scenario: A game ID asks a ruleset for what it does not offer

- **WHEN** a `#seed` game ID names a ruleset and a tier that ruleset's `only` leaves out
- **THEN** it is refused with a sentence naming the field, the tiers it may be, and the ruleset

#### Scenario: A checkbox modifier takes the chosen tier away

- **WHEN** the player changes a checkbox to the value at which its modifier's `only` leaves out the tier that is chosen
- **THEN** that tier is disabled and the difficulty shows the nearest tier left, and changing the checkbox back returns the tier the player chose

#### Scenario: A form stops moving a narrowed field

- **WHEN** the function that moves a form's values to what is offered leaves a choice where the player put it, or ignores a deciding field that is a checkbox
- **THEN** `only.test.ts` fails for every game that declares an `only` of that kind
