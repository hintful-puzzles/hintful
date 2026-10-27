# testing Specification Delta — enforce-test-time-budgets

## MODIFIED Requirements

### Requirement: There is one test timeout, and it is a backstop

A test timeout is a runaway backstop and not a gate: an otherwise-good commit
SHALL NOT be rejected merely because work took long, except by the gate's cost
budget, which judges the CPU time a test file's work costs and never its wall
time. There SHALL be exactly one
generous ceiling, `testTimeout` and `hookTimeout` in `vitest.config.ts`, sized
far clear of the worst loaded runtime. An individual test SHALL NOT set its own
timeout: a per-test ceiling is a guess about contention, and is tighter than
the global one without showing it.

#### Scenario: A correct-but-slow test survives a saturated box

- **WHEN** a test whose work terminates and whose assertions are deterministic
  runs while the machine is heavily loaded, taking many times its solo runtime
- **THEN** it still passes, because no per-test clock gate stands between it and
  its assertions: only the single generous ceiling, which is sized for runaway
  work rather than for contention

#### Scenario: A test that does too much work fails the budget, not the clock

- **WHEN** a test file's work grows past its cost budget
- **THEN** the gate fails it by the budget, on CPU time, whatever the load
  was, and never by a timeout
