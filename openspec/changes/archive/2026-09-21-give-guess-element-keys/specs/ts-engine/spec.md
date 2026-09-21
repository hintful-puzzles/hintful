# ts-engine — delta

## ADDED Requirements

### Requirement: A color keypad may spell its tenth value zero

The engine SHALL offer a color keypad whose tenth key is `'0'` alongside the one
whose tenth key is `'a'`, and a game SHALL choose between them rather than
spelling either set of button codes itself.

Both are real conventions in the collection and a game cannot be talked out of
its own: the digit games read `'a'` for a tenth value because they can go past
ten, and Guess reads `'0'` because its colors stop at ten and `digitOf` already
answers that key as zero. Offering only one would leave the other game shipping
a key it refuses, which is inert on the panel and invisible to the sweep that
catches inert keys — that sweep reads a game's **default** params, and the
tenth value here is reachable only through the Custom dialog.

The builder SHALL be keyed on there *being* a tenth value rather than on the
tenth *entry* existing: the keypad carries a clear key after its values, so at
nine values that entry is Clear and rewriting it would take the clear key away.

#### Scenario: Ten values put zero last and keep Clear

- **WHEN** a zero-is-ten color keypad is built for ten values
- **THEN** its tenth key sends `'0'` and the clear key is still the last entry

#### Scenario: Nine values are the ordinary keypad

- **WHEN** the same builder is asked for nine values
- **THEN** the keys are `'1'`–`'9'` and the clear key is untouched
