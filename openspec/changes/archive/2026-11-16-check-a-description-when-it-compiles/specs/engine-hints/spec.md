## MODIFIED Requirements

### Requirement: A long sentence is excused only by a ledger listing of its rung

A step SHALL exceed the limit only when its sentence is a description's
wording that says why (`long:`), or a ledger entry lists its rung
(`HintStep.rung`) for its game, with the reason. An entry SHALL name rungs by
id and SHALL NOT match a step's sentence, so that rewording a sentence cannot
take it out of its listing unseen. Every rung an entry lists SHALL be one its
games declare. A long sentence SHALL still be at most 300 characters.

#### Scenario: A ledgered sentence still has a ceiling

- **WHEN** a ledgered sentence grows past 300 characters
- **THEN** the check fails, ledger or not

#### Scenario: A reworded sentence keeps its listing

- **WHEN** a ledgered rung's sentence is reworded and stays over the limit
- **THEN** its listing still excuses it, with no edit to the ledger

#### Scenario: A listing for a rung the game does not have

- **WHEN** a ledger entry lists a rung that one of its games does not declare
- **THEN** the check fails on every commit, naming the game and the rung

#### Scenario: A described wording says why beside it

- **WHEN** a description's wording carries `long:` and a board speaks it over
  the limit
- **THEN** the check lets it through, and no ledger entry or pinned board is
  needed

### Requirement: The narration ledger is asserted both ways, per listing

The ledger SHALL be asserted in both directions, per `(entry, game, rung)`
listing: a step over the limit whose rung no listing for its game names SHALL
fail, and a listing whose rung its game never speaks over the limit SHALL
fail. A `long:` SHALL be held both ways by `npm run describe`: a wording past
the limit at its shortest reading needs one, and one on wordings all within
the limit at their longest SHALL be refused.

#### Scenario: A ledger entry that no longer matches anything long fails

- **WHEN** a ledgered rung's sentences are shortened under 120 characters, or
  the rung stops being spoken
- **THEN** the check fails until the listing is deleted

#### Scenario: A game listed on a shared sentence it never speaks fails

- **WHEN** a ledger entry names several games and one of them never speaks the
  rung over the limit, while the others do
- **THEN** the check fails naming that game and that entry, and does not pass
  on the strength of the games that do speak it

#### Scenario: A wording shortened under its long

- **WHEN** a wording carrying `long:` is shortened so that no reading of it
  passes the limit
- **THEN** `npm run describe` fails until the `long:` is taken out
