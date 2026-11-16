## ADDED Requirements

### Requirement: A census file deals no board while it loads

`describeLadderCensus` SHALL deal each case's board by calling the case's
`board` once, in the census's own test, and SHALL hand that board to every
cap. In every run it SHALL fail when a generator ran while the file loaded,
as the tries of the generators' retry guards between the file's setup and its
first test show.

#### Scenario: A board dealt where its case is listed

- **WHEN** a census file calls its generator at the top level of the file,
  outside any case's `board`
- **THEN** the census fails in CI, where its walk is skipped, and names the
  generator's guard

#### Scenario: A census over many caps

- **WHEN** the census walks a case at several caps
- **THEN** the case's board is dealt once
