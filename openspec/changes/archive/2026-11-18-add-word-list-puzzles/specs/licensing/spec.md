## ADDED Requirements

### Requirement: The word list's sources are credited

The word games' list SHALL be built from sources whose terms allow the app to
ship it, and each SHALL be credited: SCOWL's notice kept byte-identical in
`licenses/` and shown in the About dialog beside the upstream notices, and
SCOWL, 12dicts and LDNOOBW thanked in `CREDITS.md` and in the About dialog's
credits. No list under a share-alike or unstated license SHALL be used.

#### Scenario: A player looks for where the words come from

- **WHEN** a player opens the About dialog
- **THEN** its credits name SCOWL, 12dicts and LDNOOBW
- **AND** its notices include SCOWL's, rendered from `licenses/scowl-LICENSE`
