## ADDED Requirements

### Requirement: Tracks rejects a bare board as too easy only when it solves

`add_clues` SHALL reject a laid path as too easy only when its bare board (the row and column counts, the entrance and the exit) solves completely without reaching the target tier. A bare board that stalls SHALL go on to clue-laying whatever rungs fired before it stalled, since the clue-laying loop already refuses any clue that finishes the board below the target tier. Above Easy this diverges from upstream, whose check since 2020 also rejects a stalled bare board. The C byte-match differential is therefore kept only for Easy fixtures. `difficulty-contract.test.ts` replaces it above Easy by grading generated boards at exactly their preset's tier.

#### Scenario: A stalled bare board is not too easy

- **WHEN** the bare board of a laid path stalls at the target tier without any of that tier's rungs having fired
- **THEN** `add_clues` lays clues on it rather than asking for a new path

#### Scenario: 15x15 Hard deals

- **WHEN** `newDesc` runs at 15x15 Hard from any of the seeds `pin-0`, `pin-66`, `pin-71`, `pin-79`, `pin-83`, `pin-94` and `pin-96`
- **THEN** it returns a board that solves at Hard and not at Tricky, rather than throwing `RetryLimitExceeded`

#### Scenario: Easy boards are unchanged

- **WHEN** `newDesc` runs at an Easy preset from a seed recorded in the C fixtures
- **THEN** it emits the C desc byte-for-byte
