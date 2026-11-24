## ADDED Requirements

### Requirement: The fast prefix names every refusal before it stops

The gate SHALL run every step of its fast prefix and report each refusal before it stops, and SHALL NOT start its heavy checks when any step of the prefix refused.

#### Scenario: Two cheap refusals in one commit

- **WHEN** a staged change both fails formatting and leaves an unused export
- **THEN** one gate run names both refusals, and runs neither vitest nor the build

### Requirement: An engine change is tested on the born games it reaches

When the staged paths include code that every game born from its description runs through, the commit's test selection SHALL include the guards that read every born game, so that a guard a born game fails is not first run on CI.

#### Scenario: A fill-engine change that moves a snapshot

- **WHEN** a commit stages only a change under the fill engine that alters what the capability surface records
- **THEN** the commit is refused by the capability-surface guard
