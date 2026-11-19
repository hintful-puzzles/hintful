## ADDED Requirements

### Requirement: The commit hook tests what the commit carries

The commit hook SHALL refuse, before any check runs, a commit with a staged path whose working-tree copy differs from the staged one, or whose staged deletion is still on disk, and SHALL name each such path. It SHALL NOT stash or otherwise rewrite the working tree. An unstaged change to a path the commit does not stage SHALL be named and SHALL NOT be refused.

#### Scenario: A file is fixed after it was staged

- **WHEN** a staged test file is edited again in the working tree and not restaged
- **THEN** the hook refuses the commit and names the file
- **BECAUSE** every check reads the working tree, so it would pass on a file the commit does not hold

#### Scenario: Another file has unstaged edits

- **WHEN** the commit stages one file and another tracked file has unstaged edits
- **THEN** the hook runs, and names the other file as read but not carried
- **BECAUSE** it may be another session's work, and refusing would block every commit beside it

## MODIFIED Requirements

### Requirement: A hook's run is held to a ceiling

The commit hook and the push hook SHALL each price their plan, before running any test, from the CPU time its files cost in the last runs recorded on that machine, and SHALL run only what fits the hook's ceiling, naming what they leave out. A test file the commit stages, and a file no run has recorded, SHALL run whatever they cost, and SHALL NOT count against the ceiling. What a commit leaves out SHALL be CI's, and a push's that is asked to run tests; what a push leaves out SHALL be CI's.

#### Scenario: A commit selects most of the suite

- **WHEN** a commit stages a path that selects every test file outside the games, and their recorded cost exceeds the commit hook's ceiling
- **THEN** the hook runs the cheapest of them that fit and names the dearest it left out
- **BECAUSE** a commit that waits minutes on tests it did not ask for is the cadence this budget exists to protect, and a plan that cannot be split must still be committable without bypassing the gate

#### Scenario: A commit stages dear test files of its own

- **WHEN** a game's commit stages test files whose cost exceeds the ceiling, and a cheap cross-game guard records that game's capabilities
- **THEN** the guard still runs, with the game's cases
- **BECAUSE** charged with the staged files the ceiling left nothing for the guards, and a capability the commit removed was found by CI on `main`

#### Scenario: A commit left files to the push

- **WHEN** a commit hook left files out, every commit of the push was a game's own, and the push was asked to run tests
- **THEN** the push runs its whole plan rather than nothing
- **BECAUSE** the commits' plans no longer show what they ran
