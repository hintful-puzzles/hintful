## MODIFIED Requirements

### Requirement: Per-puzzle thumbnail icons are committed PNGs

The repository SHALL hold two committed PNG files for every cataloged puzzle
in `src/assets/icons/`: `<puzzleId>-64d8.png`, which is 64×64, and
`<puzzleId>-128d8.png`, which is 128×128. For every `puzzleId` in the catalog
(each game's `src/games/<puzzleId>/catalog.ts`) both files SHALL be present
and tracked in git: the directory is a committed snapshot, not a generated one.

#### Scenario: A cataloged puzzle lacks an icon

- **WHEN** a puzzle is in the catalog and either `<puzzleId>-64d8.png` or
  `<puzzleId>-128d8.png` is absent from `src/assets/icons/`
- **THEN** the test suite fails
- **AND** the failure names the missing file's path
