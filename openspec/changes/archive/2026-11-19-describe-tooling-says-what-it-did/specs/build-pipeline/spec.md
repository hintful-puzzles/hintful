## ADDED Requirements

### Requirement: npm run describe names a description it does not compile

`npm run describe` SHALL name each description with `steps` that it does not
compile, with the reason and the line to write (`techniques: []`), at
`--quiet` too, and without `--quiet` every other description it skips. A
game's `techniques: []` SHALL compile without `tiers`. A dev server
restarted by a schema edit SHALL take the new schema though a description
fails to compile, printing the failure.

#### Scenario: A game's techniques are cut

- **WHEN** a description with `steps` loses its `techniques` key
- **THEN** `npm run describe --quiet` names the file and says to write
  `techniques: []`

#### Scenario: A schema edit while a description fails

- **WHEN** the schema is edited while some description does not compile
- **THEN** the running dev server restarts, and its help pages read the new
  schema
