## ADDED Requirements

### Requirement: A variation is a ruleset or a modifier by what it does

A field whose value only adds a rule, a clue or a unit SHALL be a modifier, and one whose value replaces a part of the game SHALL be a ruleset; a field that changes only what is dealt SHALL be neither. An added rule only removes answers, so every technique sound without it stays sound. Where a description states a variation, the gate SHALL refuse a field that declares the other word.

#### Scenario: A description's variation and its field disagree

- **WHEN** a description's variation replaces a block, and the game declares
  the field it names with `modifierItem`
- **THEN** `src/variations.test.ts` fails, naming the description and the
  variation

#### Scenario: A field changes only the deal

- **WHEN** a field hides what a board would otherwise give, as Group's
  identity
- **THEN** it is an ordinary field, with no modifier words in the help's list
  of rules

## MODIFIED Requirements

### Requirement: A checkbox rule modifier has one line of the menu

A checkbox rule modifier SHALL apply on exactly one line of the menu.

#### Scenario: A modifier on several lines

- **WHEN** a game's menu holds two boards with one checkbox modifier applied,
  or none
- **THEN** the guard fails, naming the modifier by its words

### Requirement: A ruleset declares what it offers of the other settings

A ruleset that does not take every value of another setting SHALL say so in
`Ruleset.only` (`engine/ruleset.ts`), by the setting's keyword: the choices it
offers of a choices field, or the one value a checkbox has in it. A rule
modifier that takes values of another setting away SHALL say so the same way
(`modifierItem`'s `only`, `engine/modifier.ts`): a checkbox for
the value at which its rule applies, a choice by the index of each choice that
narrows. Any other choices field or checkbox SHALL say so in its item's
`only`, by its value. A setting left out SHALL be taken whole.

#### Scenario: A ruleset names one setting

- **WHEN** a ruleset's `only` names the difficulty field and no other
- **THEN** every other setting of the game is offered whole in that ruleset

### Requirement: A declaration of what a setting leaves throws when it cannot hold

An `only` declaration that names no other field of the game, names one of the
wrong kind, offers none of its choices, narrows a field that itself decides
others unless the declaration is a ruleset's, or leaves nothing of a field
between two deciding fields SHALL throw wherever the declaration is read.

#### Scenario: A declaration names a field the game does not have

- **WHEN** a ruleset's `only` names a keyword no item of the game's
  `paramConfig` has
- **THEN** reading the declaration throws

#### Scenario: A field other than the ruleset narrows a deciding field

- **WHEN** a checkbox's `only` names a field whose own `only` narrows another
- **THEN** reading the declaration throws

### Requirement: The Custom dialog offers only what the deciding fields leave

From an `only` declaration the engine SHALL build, and no game SHALL write,
what the Custom dialog offers: while a deciding value is chosen, a choice it
does not leave and a checkbox it fixes SHALL be disabled, a choices field left
one choice SHALL be disabled whole, and each SHALL show a value it is offered.
A field two deciding fields narrow SHALL offer what both leave. A deciding
field the ruleset narrows SHALL decide at the value it is shown. The engine
SHALL take a choices field or a checkbox as a deciding field.

#### Scenario: A ruleset is chosen that fixes a setting the player had changed

- **WHEN** the player ticks a checkbox, then chooses a ruleset whose `only`
  holds that checkbox off, and presses OK
- **THEN** the checkbox is shown disabled and unticked, and the board is dealt
  with no refusal

#### Scenario: A ruleset fixes off a checkbox that narrows a third field

- **WHEN** a checkbox that takes Easy away is ticked, and the player chooses
  a ruleset whose `only` holds it off
- **THEN** Easy is offered again

## REMOVED Requirements

### Requirement: Fields that cannot all be set together are one ruleset field

**Reason**: A ruleset is told from a modifier by what the variation does to
the game's techniques, not by whether its fields combine: Ascent's Edges adds
a clue to Classic alone and is a modifier of it.

**Migration**: "A variation is a ruleset or a modifier by what it does".
