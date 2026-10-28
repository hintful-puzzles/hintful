## ADDED Requirements

### Requirement: The gate fails on a snapshot entry no test checked

Every vitest run in `scripts/gate.sh` SHALL pass `--update=none`, so that a
snapshot entry no test in its file checked fails that file, and a snapshot a
test asks for but its file lacks fails rather than being written. The vitest in
use SHALL spare only a skipped test's own entries, so that a skipped or
name-filtered test does not hide another test's orphan.

#### Scenario: A renamed test's entry fails the commit

- **WHEN** a test that calls `toMatchSnapshot` is renamed in a file that also
  holds a skipped test, such as a `describeHintPins` file's scan
- **THEN** the gate fails that file and names the old entry
- **BECAUSE** vitest's default mode only lists an obsolete entry in a summary,
  and before vitest 5 one skipped test in a file kept nearly every entry in it
  from being counted obsolete

#### Scenario: A narrowed run does not convict the cases it filtered out

- **WHEN** the hook narrows a pass to some games with a name filter
- **THEN** the entries of the cases it filtered out are not reported obsolete
