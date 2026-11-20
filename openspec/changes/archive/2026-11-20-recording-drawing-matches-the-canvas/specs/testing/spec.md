## ADDED Requirements

### Requirement: The recording drawing accepts what the canvas drawing accepts

The recording drawing SHALL refuse every call the app's canvas drawing refuses,
and record nothing for a call the canvas paints nothing for, by calling the
same checks the canvas drawing calls. A test comparing the two over each
primitive, with colors in and out of the palette and sizes that paint and that
do not, SHALL hold them together.

#### Scenario: A game draws with a color its palette lacks

- **WHEN** a game's `redraw` passes a palette index with no entry, such as `-1`
  as a circle's outline, to the recording drawing
- **THEN** the test fails with the error the canvas would throw in the app
- **AND** no label stands in for the missing color

### Requirement: A snapshot keys a drawn color by what it paints

A recorded op's snapshot form SHALL name each color by its resolved label and
SHALL NOT hold the palette index the game passed. The record itself SHALL keep
the index, for assertions that mean a particular palette slot.

#### Scenario: A game removes a color from its palette

- **WHEN** a game drops a palette entry, renumbering every later index
- **THEN** only the snapshots of frames that painted in the removed color change
