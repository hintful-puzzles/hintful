## ADDED Requirements

### Requirement: A commit runs the per-game work of the games it stages

The per-commit hook SHALL run per-game work for the games whose directories
hold a staged path and for no other: a game's own test files, and the cases
titled `<id>: …` in the cross-game guards. The games a staged path outside
the game directories merely reaches SHALL wait for the push. A staged test
file SHALL still run with every game's cases, and every selected test that is
not titled for a game SHALL run. When no game reaches a staged path the hook
SHALL NOT narrow at all.

#### Scenario: A commit touches a module every guard reads itself

- **WHEN** the only staged path is the midend
- **THEN** the hook runs the tests that reach it with no game's cases, and no
  game's own test files
- **BECAUSE** every game's boards on every such commit was most of the suite,
  and the push runs them once

#### Scenario: A commit touches the engine and one game

- **WHEN** the staged paths are an engine module and a file of Pearl's
- **THEN** the hook runs Pearl's cases and Pearl's own tests, and no other
  game's

#### Scenario: A commit stages a cross-game guard

- **WHEN** a staged path is a test file outside the game directories
- **THEN** that file runs with every game's cases
- **BECAUSE** it is what the author just wrote

### Requirement: The push runs what its commits left out, and nothing when they left nothing

A pre-push hook SHALL run the gate over every path changed between the commit
the remote holds and `HEAD`, with the tests that change can have broken and
the cross-game cases of every game that reaches it. It SHALL run nothing when
the commits' own runs left none of that out, and nothing for a push that
changes only paths the documentation shortcut names. It SHALL walk the same
boards as the per-commit hook, and CI SHALL remain the only run of the rest.

#### Scenario: A session's push carries a commit to the engine

- **WHEN** a push carries a commit that changed the midend
- **THEN** the hook runs every cross-game guard that reads it, with every
  game's cases, before the commits leave the machine
- **AND** it does so once, however many commits the push carries

#### Scenario: A session's push carries only one game's commits

- **WHEN** every path a push changes lies in one game's directory
- **THEN** the hook runs no test
- **BECAUSE** each commit ran that game's cases and nothing else was at stake

### Requirement: A push is judged on the commits it carries

The pre-push hook's tests read the working tree, so the hook SHALL refuse to
run them over uncommitted changes to tracked files, and SHALL run nothing for
a push of a commit other than the one checked out.

#### Scenario: A push is made over uncommitted work

- **WHEN** a push that owes a test run is made while a tracked file is modified
- **THEN** the hook fails and says to commit or stash the change
- **BECAUSE** a pass would be a verdict on code the push does not carry

### Requirement: A push's scope is the games that reach a changed path

A push's scope SHALL be the games that reach a changed path: a game whose
directory holds it, and a game whose own files' walk reaches it through
imports, globs or text imports. A test file outside the game directories whose
walk reaches a changed path without passing through a game directory SHALL run
with every game's cases, in a test run of its own, because the name filter is
one per run.

#### Scenario: A push changes an engine module some games use

- **WHEN** the changed path is an engine module that the Latin-square games
  import and no guard imports itself
- **THEN** the cross-game guards run the cases of the games that reach it and
  skip the rest
- **AND** a test file that imports the module itself runs with every game's
  cases
- **BECAUSE** a game that does not reach the module cannot have changed
  verdict, while a file that reads the module itself can fail in any case

### Requirement: A case skipped in a push is one its commits could not have turned red

A case a push skips SHALL be one its commits could not have turned red, which
needs both: the case's file reaches no changed path except through a game, and
every such game is in scope; and a case titled `<id>: …` depends on no game
but `<id>`, which holds because a game cannot import another game and no case
reads a second one on purpose. A case SHALL be recognized by that title and by
nothing else, so a guard that titles its cases otherwise is not narrowed, which
only costs time.

#### Scenario: A guard titles its cases another way

- **WHEN** a cross-game guard's per-game cases do not begin `<id>: `
- **THEN** none of them is skipped on a narrowed run

### Requirement: A change to comments alone selects the tests that read the text

A source file outside the game directories whose code tokens are the same
before and after a change SHALL select only the tests that read it as text.
The comparison SHALL be made on the parser's tokens and never by matching
comment syntax. A test file SHALL NOT be treated this way, since a comment in
one can instruct the runner. The import graph cannot say which path selected a
file, so it SHALL be consulted only when some path changed in more than its
comments.

#### Scenario: A comment is corrected in the registry

- **WHEN** a change to `src/games/index.ts` alters a comment and no token of
  code
- **THEN** the guards that scan it as text are selected, and no guard that
  only imports it

#### Scenario: A comment marker sits inside a regular expression

- **WHEN** a change alters the text of a regular expression that contains `/*`
- **THEN** the change is treated as a change to code

## MODIFIED Requirements

### Requirement: The pre-commit hook may run a selected subset of the suite

The local hooks run only the test files a commit or a push can have broken.
CI and a manual `npm run gate` SHALL continue to run the whole suite, so the
guarantee on `main` is unchanged. The selection SHALL be the union of two
channels, because neither is sufficient alone: the static import graph, via
`vitest list --changed`; and every test whose walk reaches a changed path.

#### Scenario: A commit changes a help page

- **WHEN** only files under `help/` are staged
- **THEN** the guards that glob `help/` are selected and run
- **BECAUSE** the import graph alone selects nothing for such a change

### Requirement: The selector fails closed

The selector SHALL fail closed. A push's plan SHALL be the whole suite
whenever a changed path lies outside the directories the selector models, the
union is empty, or anything at all goes wrong. A commit that stages such a
path SHALL run every test file outside the other games' directories, and SHALL
run the whole suite when the selector itself fails.

#### Scenario: A commit touches a file the selector does not model

- **WHEN** a staged path lies outside the modeled directories: a config file, a
  template, a script
- **THEN** the commit runs every test file that is not a game's own, with no
  game's cases
- **AND** the push that carries it runs the whole suite
- **BECAUSE** a wrong "everything" costs minutes and a wrong subset costs a guard

### Requirement: A glob is matched by its literal base directory

The glob channel SHALL match by the pattern's literal base directory, the
prefix before its first wildcard, and SHALL NOT evaluate the pattern: a
matcher that is subtly wrong silently skips a guard. It takes two narrowings,
true of every file the pattern matches. A match ends in the pattern's
literal last segment, or in the literal after a last segment of the form
`*<literal>`. And a match lies as many segments below the base as the pattern
has outside `**`, or more where it has a `**`.

#### Scenario: A staged file lies under a glob's base directory

- **WHEN** a test globs a directory with wildcards in the middle of its pattern,
  and a staged path lies under the literal prefix and ends as the pattern ends
- **THEN** the test is selected, whether or not the full pattern would match
  the path

#### Scenario: A file lies above every match of a glob

- **WHEN** a test globs `games/*/**/*.ts` and the changed path is
  `games/index.ts`
- **THEN** the glob does not select the test
- **BECAUSE** every file the pattern matches lies in a directory below `games/`

### Requirement: The role toggle is the hook's alone, and a test holds it there

The CI backstop SHALL be asserted by a test: a test SHALL fail if the role
toggle is ever set in CI, or if either local hook stops setting it. Set in
both places, the deferred assertions run nowhere while both runs report green.
The same test SHALL hold the push hook to passing the gate its base commit,
and the per-commit hook to passing none.

#### Scenario: The role toggle leaks into CI

- **WHEN** the CI workflow is edited to set the role toggle, or a local hook
  stops setting it
- **THEN** a test fails naming it
- **BECAUSE** every deferral rests on CI being the backstop, and a toggle set in
  both places means the deferred assertions run nowhere while both runs report
  green

### Requirement: The gate is one script, and the hook selects its role by environment

The gate SHALL be a single script, `scripts/gate.sh`, run by both local hooks
and `npm run gate`, so they cannot drift. A hook's narrower role SHALL be
selected by environment toggles it sets, never by a second copy of the gate:
`GATE_BIOME_STAGED` for the biome scope, `GATE_PRECOMMIT` for everything else
a hook does less of, and `GATE_SINCE`, the push hook's alone, for the commit
the remote holds. `GATE_PRECOMMIT` SHALL be the only signal a deferred
assertion reads.

#### Scenario: The gate is run by hand

- **WHEN** `npm run gate` is run with no toggle set
- **THEN** the same script runs as in the hooks, with biome over the whole tree
  and the whole suite

### Requirement: The game scope travels as one value beside the role toggle

The scope SHALL travel as a single value, `GATE_GAME_SCOPE`, honored only
beside `GATE_PRECOMMIT=1`, so it inherits that toggle's backstop. The name
filter that skips the cases and the helpers that narrow the assertions spanning
a sweep SHALL both be derived from it, so they cannot disagree about which
games ran. It SHALL have a value for no game at all, distinct from unset,
which is every game's.

#### Scenario: The scope is set without the role toggle

- **WHEN** a run has `GATE_GAME_SCOPE` set and `GATE_PRECOMMIT` unset
- **THEN** no case is skipped and no assertion is narrowed

#### Scenario: A commit stages no game

- **WHEN** the per-commit hook runs for a commit that stages no game's file
- **THEN** every case titled for a game is skipped, and reported as skipped

### Requirement: The test suite runs beside the deploy and does not hold it back

The test suite SHALL run in CI beside the deploy, as the full `npm run gate`
in a workflow of its own, and a failure there SHALL mark the commit red
without holding back the deploy. A newer push SHALL NOT cancel a run of it in
progress: the local hooks leave the sweeps' wider boards to this run alone.

#### Scenario: The suite does not hold back the deploy

- **WHEN** a commit lands on `main`
- **THEN** it is published once the fast checks and the build pass, and the
  suite's result arrives afterwards

#### Scenario: A newer commit lands while the suite runs

- **WHEN** a second commit is pushed while the first one's suite is running
- **THEN** the first run finishes and reports, and the second waits its turn
- **AND** a third push replaces the second in the queue, so the tree is judged
  at most one run behind `main`

### Requirement: The local hooks walk one board of each kind, and CI walks the rest

A cross-game sweep SHALL do less work in the local hooks than everywhere else
only where what it leaves out is more of the same: a second or later board of
one params set, a game's largest board where a smaller board of every mode,
tier and choice is still walked, the later steps of one board's plan, or the
moves between evenly spaced positions of one board's walk.

#### Scenario: A sweep walks several boards of one params set

- **WHEN** a cross-game sweep walks four boards of each tier
- **THEN** the local hooks walk one of each and CI walks the four
- **BECAUSE** the first board catches a defect that shows on every board of the
  tier, and the others catch what CI can catch in time

#### Scenario: A walk asks for a fresh plan after every move

- **WHEN** a walk recomputes a hint after each move of a board whose plan is
  hundreds of steps long
- **THEN** the local hooks recompute at a bounded number of evenly spaced
  moves, following the plan between them, and CI recomputes after every move

## RENAMED Requirements

- FROM: `### Requirement: The per-commit hook walks one board of each kind, and the push walks the rest`
- TO: `### Requirement: The local hooks walk one board of each kind, and CI walks the rest`

## REMOVED Requirements

### Requirement: The pre-commit hook narrows the cross-game sweeps to the games a commit can reach

**Reason**: The per-commit hook narrows further, to the games a commit
stages, and the games it reaches are the push's.

**Migration**: "A commit runs the per-game work of the games it stages" and
"The push runs what its commits left out, and nothing when they left nothing".

### Requirement: The scope is the games that reach a staged path

**Reason**: That scope is a push's. A commit's is the games it stages.

**Migration**: "A push's scope is the games that reach a changed path".

### Requirement: A skipped case is one the commit could not have turned red

**Reason**: A case a commit skips may be one it broke, and the push runs it.
The guarantee holds for a push.

**Migration**: "A case skipped in a push is one its commits could not have
turned red".
