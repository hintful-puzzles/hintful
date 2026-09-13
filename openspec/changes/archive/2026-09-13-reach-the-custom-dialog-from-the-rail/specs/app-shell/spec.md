## ADDED Requirements

### Requirement: Custom type… SHALL open its dialog from every Type menu, titled by name

Choosing "Custom type…" from a Type menu SHALL open the game's Custom dialog
wherever that menu is drawn — the wide layout's rail, which draws it inside its
own shadow root, as well as the phone's top bar — and the dialog SHALL be titled
with the game's display name, never its id.

The rail's menu once raised "launchCustomDialog() can't find puzzle-context
container" instead of opening, because the lookup for the dialog's container did
not cross a shadow root. The dialog read "abcd" because its title was the one the
engine sent, and the engine knows a game only by its id; the name belongs to the
catalog, so the engine's form description carries no title at all.

#### Scenario: Custom type… opens from a menu inside a shadow root

- **WHEN** a player chooses Custom type… from the rail's Type chips
- **THEN** the Custom dialog opens, with no error

#### Scenario: The dialog is titled by the game's name

- **WHEN** the Custom dialog opens for Abcd
- **THEN** its title is "Custom ABCD", not "abcd"
