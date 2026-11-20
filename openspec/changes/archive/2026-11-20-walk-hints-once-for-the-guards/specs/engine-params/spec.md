## MODIFIED Requirements

### Requirement: Encode and decode are mutual inverses over the corpus

Encode and decode SHALL be mutual inverses for every case in the corpus,
compared through the encoded string, and for the params the menu offers
(the default, every preset and every tier) the decoded record SHALL equal
the one encoded. This SHALL be asserted as a property and not a fixture, for
every registered game with no exemption roster: it survives a preset being
added and cannot be re-baselined.

#### Scenario: A codec that stops being invertible is reported

- **WHEN** a decoder stops recovering a field its encoder writes
- **THEN** the mutual-inverse assertion fails for that game, independently of
  the snapshot

#### Scenario: A preset that its own game ID does not reproduce is reported

- **WHEN** a preset carries a value in a field the codec does not write, and
  the decoder's default for that field differs
- **THEN** the menu's round-trip assertion fails for that game and preset
