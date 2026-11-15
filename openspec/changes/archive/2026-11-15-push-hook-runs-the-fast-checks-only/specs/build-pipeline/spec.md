## MODIFIED Requirements

### Requirement: The push runs what its commits left out, and nothing when they left nothing

A pre-push hook SHALL run the gate's fast checks and no test. Where asked to
(`GATE_PUSH_TESTS=1`), it SHALL run the gate over every path changed between
the commit the remote holds and `HEAD`, with the tests that change can have
broken and the cross-game cases of every game that reaches it, nothing when the
commits' own runs left none of that out, and nothing for a push that changes
only paths the documentation shortcut names. It SHALL walk the same boards as
the per-commit hook, and CI SHALL remain the only run of the rest.

#### Scenario: A session's push carries a commit to the engine

- **WHEN** a push carries a commit that changed the midend
- **THEN** the hook runs the fast checks and no test
- **AND** with `GATE_PUSH_TESTS=1` it runs every cross-game guard that reads it,
  with every game's cases, once however many commits the push carries

#### Scenario: A session's push carries only one game's commits

- **WHEN** every path a push changes lies in one game's directory and the push
  was asked to run tests
- **THEN** the hook runs no test
- **BECAUSE** each commit ran that game's cases and nothing else was at stake

### Requirement: A push is judged on the commits it carries

The pre-push hook's tests, where asked for, read the working tree, so the hook
SHALL refuse to run them over uncommitted changes to tracked files, and SHALL
run nothing for a push of a commit other than the one checked out.

#### Scenario: A push is made over uncommitted work

- **WHEN** a push that owes a test run and asked for it is made while a tracked
  file is modified
- **THEN** the hook fails and says to commit or stash the change
- **BECAUSE** a pass would be a verdict on code the push does not carry
