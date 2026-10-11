## ADDED Requirements

### Requirement: A refused link says why first, and no alert's text leaves its dialog

An alert for a game ID or a type in the URL that was refused SHALL give the
reason as its message and the refused string after it. The text of every
alert SHALL wrap inside the dialog, a string with no space in it included.

#### Scenario: A link whose game ID is refused

- **WHEN** a puzzle page is opened with a game ID the game refuses
- **THEN** the alert's message is the game's reason, and the ID follows it

#### Scenario: An ID longer than the dialog is wide

- **WHEN** the refused ID has no space in it and is wider than the dialog, at
  a phone's width or a desktop's
- **THEN** it wraps onto further lines and no part of it is outside the dialog
