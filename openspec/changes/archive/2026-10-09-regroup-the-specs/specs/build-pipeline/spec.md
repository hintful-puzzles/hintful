## MODIFIED Requirements

### Requirement: Pool tuning keeps the suite deterministic, or is reverted

Any vitest pool or isolation tuning adopted to reduce per-file module-load
overhead SHALL preserve the `testing` requirement "The test suite is
deterministic under parallel load", verified by a green full run repeated
under the new configuration, including under file-order shuffle, which
stresses the shared module state a non-isolated pool exposes. Otherwise it
SHALL be reverted.

#### Scenario: A speed change never weakens the gate

- **WHEN** a pool/isolation setting is changed to speed up `vitest run`
- **THEN** the full suite is shown to remain green and deterministic under the
  new setting (repeated runs, including under file-order shuffle)
- **AND** if it does not, the setting is reverted and not shipped

### Requirement: A test selector is accepted only against two experiments

Any scheme that selects the tests a commit runs, one that selects on what a
test actually read at runtime included, SHALL be accepted only against two
experiments, a change to one game's source and a change to a `help/` page, and
only if it selects the glob-based guards for both. It SHALL treat an
unclassifiable change as "run everything" and never as "run nothing".

#### Scenario: A test-impact selector is proposed

- **WHEN** a change proposes to run only the tests downstream of a commit
- **THEN** it is run against a game source change and a `help/` change, and
  adopted only if it selects the glob-based guards for both
- **BECAUSE** the guards this project most relies on are exactly the ones a
  static graph cannot see, and switching them off is silent

## REMOVED Requirements

### Requirement: A cross-game guard bounds its cost on the axis the game varies

**Reason**: Moved to `testing`, with its words.

### Requirement: The hint-resume walk excuses the games that can say a search ran out

**Reason**: Moved to `engine-hints`, with its words.

### Requirement: An excused game's reason and remaining cover are recorded per member

**Reason**: Moved to `engine-hints`, with its words.

### Requirement: The gate rejects a test whose every assertion is conditional

**Reason**: Moved to `testing`, with its words.

### Requirement: Which test shapes the gate guards is decided by measurement

**Reason**: Moved to `testing`, with its words.

### Requirement: A stated reporting rule matches what the build does

**Reason**: Moved to `error-reporting`, with its words.

### Requirement: Turning on error reporting settles its side effects deliberately

**Reason**: Moved to `error-reporting`, with its words.

### Requirement: A public DSN is restricted at the reporting service

**Reason**: Moved to `error-reporting`, with its words.

### Requirement: Error reporting is verified on the deployed origin

**Reason**: Moved to `error-reporting`, with its words.

### Requirement: What a crash report carries matches what the privacy notes promise

**Reason**: Moved to `error-reporting`, with its words.

### Requirement: A sweep's per-commit amount is chosen through perCommit

**Reason**: Moved to `testing`, with its words.

### Requirement: A sweep's ledger is true of the hook's boards and of the push's

**Reason**: Moved to `testing`, with its words.
