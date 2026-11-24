## ADDED Requirements

### Requirement: The fast prefix names every refusal before it stops

The gate SHALL run every step of its fast prefix and report each refusal before it stops, and SHALL NOT start its heavy checks when any step of the prefix refused. Its refusal SHALL name `npm run fix`, which writes the fixes that have one right answer into the files the working tree changed and names each file it wrote.

#### Scenario: Two cheap refusals in one commit

- **WHEN** a staged change both fails formatting and leaves an unused export
- **THEN** one gate run names both refusals, and runs neither vitest nor the build

#### Scenario: A refusal a tool can mend

- **WHEN** the gate refuses a file biome would reformat
- **THEN** `npm run fix` reformats it and names it, and the next gate run passes that step

## MODIFIED Requirements

### Requirement: A commit runs the per-game work of the games it stages

The per-commit hook SHALL run per-game work for the games whose directories
hold a staged path, and for each game born from its description whose code
reaches one, and for no other: a game's own test files, and the cases titled
`<id>: …` in the cross-game guards. Other games a staged path reaches SHALL
wait for CI. A staged test file SHALL run with every game's cases, and every
selected test not titled for a game SHALL run. When no game reaches a staged
path the hook SHALL NOT narrow.

#### Scenario: A commit touches a module every guard reads itself

- **WHEN** the only staged path is the midend
- **THEN** the hook runs the tests that reach it with the born games' cases
  and no hand-written game's, and no hand-written game's own test files
- **BECAUSE** every game's boards on every such commit was most of the suite,
  and a born game has no file of its own for such a commit to stage

#### Scenario: A commit touches the engine and one game

- **WHEN** the staged paths are an engine module and a file of Pearl's
- **THEN** the hook runs Pearl's cases and Pearl's own tests, the cases of
  the born games that reach the module, and no other game's

#### Scenario: A fill-engine or compiler change that moves a snapshot

- **WHEN** a commit stages only a change to the fill engine or to the
  description compiler that alters what the capability surface records
- **THEN** the commit is refused by the capability-surface guard
- **BECAUSE** a compiled module reads what the compiler wrote, so the walk
  takes the compiler's inputs as read by every reader of a compiled module

#### Scenario: A commit stages a cross-game guard

- **WHEN** a staged path is a test file outside the game directories
- **THEN** that file runs with every game's cases
- **BECAUSE** it is what the author just wrote

### Requirement: The push runs what its commits left out, and nothing when they left nothing

A pre-push hook SHALL run the gate's fast checks and, of the tests its
commits can have broken, the guards outside the game directories that hold a
snapshot, with the cross-game cases of the games that reach a changed path,
and no build. Asked to (`GATE_PUSH_TESTS=1`), it SHALL run every such test and
the build, and nothing for a push of documentation alone. CI SHALL remain the
only run of the rest.

#### Scenario: A session's push carries a commit to the engine

- **WHEN** a push carries a commit that changed the midend
- **THEN** the hook runs the fast checks and the snapshot guards that read
  the midend, with every game's cases
- **AND** with `GATE_PUSH_TESTS=1` it runs every cross-game guard that reads it,
  with every game's cases, once however many commits the push carries

#### Scenario: A session's push carries only one game's commits

- **WHEN** every path a push changes lies in one game's directory and the push
  was asked to run tests
- **THEN** the hook runs no test
- **BECAUSE** each commit ran that game's cases and nothing else was at stake

### Requirement: The gate's fast checks run past a refusal on request

The repository SHALL provide `npm run fast-checks`, which runs the steps of
the gate's fast prefix and its source scans, through the gate's own list,
over what the working tree changed, staged or not, and ends by naming every
refusal with the command that reproduces it. It SHALL first apply
`npm run fix` and name each file that wrote. The gate itself SHALL write
nothing.

#### Scenario: A commit owes four cheap checks

- **WHEN** the working tree holds a British spelling, an unused export, an
  absence spelled `undefined` and a requirement over the validator's limit
- **THEN** one run names all four, each with its command, and exits nonzero

#### Scenario: An archive appends a requirement out of order

- **WHEN** the command runs after an archive that appended a game spec's
  requirement after a later subject
- **THEN** the spec is put in order, the file is named, and the subject check
  passes

#### Scenario: The gate meets the same refusals

- **WHEN** a commit carries those refusals
- **THEN** the gate names all four too, and writes nothing

### Requirement: The commit hook tests what the commit carries

The commit hook SHALL refuse, before any check runs, a commit with a staged path whose working-tree copy differs from the staged one, or whose staged deletion is still on disk, or a test snapshot changed or untracked in the working tree and not staged, and SHALL name each such path. It SHALL NOT stash or otherwise rewrite the working tree. Any other unstaged change to a path the commit does not stage SHALL be named and SHALL NOT be refused.

#### Scenario: A file is fixed after it was staged

- **WHEN** a staged test file is edited again in the working tree and not restaged
- **THEN** the hook refuses the commit and names the file
- **BECAUSE** every check reads the working tree, so it would pass on a file the commit does not hold

#### Scenario: A rebaselined snapshot is left unstaged

- **WHEN** a snapshot was rewritten in the working tree and the commit does not stage it
- **THEN** the hook refuses the commit and names the snapshot
- **BECAUSE** the tests would pass against a baseline the commit does not carry, and CI then fails

#### Scenario: Another file has unstaged edits

- **WHEN** the commit stages one file and another tracked file has unstaged edits
- **THEN** the hook runs, and names the other file as read but not carried
- **BECAUSE** it may be another session's work, and refusing would block every commit beside it
