## ADDED Requirements

### Requirement: The research tools' guards run in CI

The development tools under `research/` import `src/`, so a change there can
break them. Their quick guards, each file named `*.guard.test.ts`, SHALL run
in CI's gate workflow on every push, as a step of their own beside the gate,
and a test SHALL hold that step in the workflow. A commit touching only
`research/` keeps the documentation-only path, since the prefix's typecheck
compiles the tools before that shortcut.

#### Scenario: A compiler contract breaks a research tool

- **WHEN** a change to `src/describe/` makes the compiler refuse what a
  research tool builds
- **THEN** CI's research-guards step fails on the push that carries it

#### Scenario: The step is removed from the workflow

- **WHEN** the gate workflow no longer runs `npm run test:research-guards`
- **THEN** `src/gate-scope.test.ts` fails

### Requirement: A research run prints its progress as it goes

A research tool SHALL print each line of progress the moment it is reached,
through one helper that writes to the process's own stream, since vitest
holds `console` output until a file ends. Biome SHALL refuse `console` under
`research/`.

#### Scenario: A report runs for minutes

- **WHEN** a research report runs under vitest with its output piped
- **THEN** its lines appear as each is reached, not when the file ends
