## ADDED Requirements

### Requirement: A technique that found nothing runs again only once what it reads changes

A compiled ladder's solve SHALL skip a technique that found nothing until a fact changes a mark it reads, and SHALL still try the techniques from the easiest after every firing, so that every board's tier and every firing's order are those of a run that skips nothing.

#### Scenario: A firing elsewhere does not wake a technique

- **WHEN** a technique has found nothing and a later firing changes only marks it does not read
- **THEN** the solve does not run it again until one of its marks changes

#### Scenario: Skipping changes no verdict

- **WHEN** a ladder is run on the same board with skipping and without it
- **THEN** both runs make the same firings in the same order and reach the same marks
