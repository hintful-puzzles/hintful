# ts-engine Specification Delta — derive-the-narration-ledger-population

## MODIFIED Requirements

### Requirement: Hint narration SHALL be short enough to read at a glance

Every hint step's narration SHALL be at most 120 characters. The check SHALL
cover every hinting game at every tier and on every preset, since a mode a
preset selects can speak sentences no tier reaches, and SHALL additionally
cover each tiered game's **last preset at its hardest teachable tier** — the
`presets × tiers` corner that "every tier of the first preset" and "every
preset at its own tier" both miss, and which a player reaches through the
Custom dialog. A tier the game declares as a search tier is excluded from that
rule, because a hint refuses where a guess is needed. The check SHALL walk each
board's plans into the middle of the game rather than reading only the opening
plan, because the sentences that need room are the ones spoken once more of the
board is decided.

A sentence template MAY exceed the limit only when a ledger entry names it,
the games that speak it, and the reason it needs the room. A ledgered sentence
SHALL still be at most 300 characters. The ledger SHALL be asserted in both
directions, and **the unit of both directions SHALL be the `(entry, game)`
listing rather than the entry**: a step over the limit that no entry listing
its game matches fails, and a listing that matches no step over the limit fails,
so a sentence brought under the limit takes its entry with it and a game that
stops speaking a shared sentence takes its listing with it. Keyed by entry
alone, the reverse direction passes as soon as any one listed game reaches the
sentence, which leaves a game listed on a shared sentence it never speaks
invisible.

Because the reverse direction asserts a **negative over the walk's sample**, the
check SHALL carry a vacuity floor per listed game as well as one over the whole
walk, so that a game whose boards all failed to generate cannot read as a dead
listing; and a listing SHALL NOT be deleted on the gate walk's silence alone,
but on a widened walk of that game recorded beside the entry.

#### Scenario: A long sentence without a ledger entry fails

- **WHEN** a hint step's narration is longer than 120 characters and no ledger
  entry for its game matches it
- **THEN** the check fails, naming the sentence and its length

#### Scenario: A ledger entry that no longer matches anything long fails

- **WHEN** a ledgered sentence is shortened under 120 characters, or stops
  being spoken
- **THEN** the check fails until the entry is deleted

#### Scenario: A game listed on a shared sentence it never speaks fails

- **WHEN** a ledger entry names several games and one of them never speaks the
  sentence over the limit, while the others do
- **THEN** the check fails naming that game and that entry, and does not pass
  on the strength of the games that do speak it

#### Scenario: A listed game whose walk examined nothing is not reported as dead

- **WHEN** every board for a listed game fails to generate, so its walk
  contributes no steps
- **THEN** the check fails reporting that the game's walk looked at nothing,
  rather than reporting its listings as dead exemptions

#### Scenario: A ledgered sentence still has a ceiling

- **WHEN** a ledgered sentence grows past 300 characters
- **THEN** the check fails, ledger or not
