## ADDED Requirements

### Requirement: A hint step SHALL name the rung it speaks

Every hint step SHALL carry `rung`, the id of the deduction it is, and every
game that declares a `hint` SHALL declare `hintRungs`, the list of every rung a
step of its hint can be, each once. A step's rung SHALL be one of its game's
`hintRungs`. `HintStep` and `Game` SHALL be typed by the game's rung union, so
that a game whose steps are typed by its list fails to compile when a step is
stamped with an id the list lacks.

A rung is the deduction, at the grain the game's solver or plan already names
it: the kinds of its reason union, or the branches of a hint that deduces
nothing. The legs of one journey SHALL share their firing's rung. Two wordings
of one deduction SHALL NOT be two rungs.

Whatever needs to know which deduction a step is SHALL read `rung`, and SHALL
NOT match the step's sentence to find out: the pins a game's tests read, the
narration ledger, and a render scenario that walks a plan to a step. A test MAY
still assert what a step's sentence says, where the wording is the thing under
test.

The candidate walk SHALL stamp the steps it builds: a placement or a strike
with the kind of the reason it narrates, and its own setup steps and a
placement's cull with ids the engine owns. A game on the walk SHALL therefore
write its list and no stamp. Where a game's words for a placement narrate
another of its reasons than the one the walk handed it, the game SHALL say
which, so that a step's rung and its sentence name the same deduction.

A rung id is not player-facing: no sentence, help page, save or game ID holds
one.

#### Scenario: A reason kind missing from the list

- **WHEN** a game's hint gains a reason kind and its rung list does not
- **THEN** the game does not typecheck, at the line that stamps the step

#### Scenario: A hinted game without a list

- **WHEN** a registered game declares `hint` and not `hintRungs`, or lists a
  rung twice
- **THEN** the hint-quality suite fails, naming the game

#### Scenario: A step of a rung the list lacks

- **WHEN** the hint-quality walk meets a step whose rung is not in its game's
  `hintRungs`
- **THEN** it fails, quoting the step's sentence

#### Scenario: A candidate game writes no stamp

- **WHEN** a game builds its plan through the shared candidate walk
- **THEN** each step's rung is the kind of the reason the walk narrated, or
  the engine's id for a setup step or a cull
- **AND** the game's list is the engine's ids and its own reasons' kinds

#### Scenario: A sentence of another reason

- **WHEN** a game's words for a placement are those of a reason other than
  the one the walk found, as a one-cell area's are a singleton's
- **THEN** the step carries that reason's rung, not the one the walk found

## MODIFIED Requirements

### Requirement: Hint narration SHALL be short enough to read at a glance

Every hint step's narration SHALL be at most 120 characters. The check SHALL
cover every hinting game at every tier and on every preset, since a mode a
preset selects can speak sentences no tier reaches, and SHALL walk each board's
plans into the middle of the game rather than reading only the opening plan,
because the sentences that need room are the ones spoken once more of the board
is decided. That much SHALL run on every commit.

The check SHALL **additionally** cover each tiered game's **last preset at its
hardest teachable tier** — the `presets × tiers` corner that "every tier of the
first preset" and "every preset at its own tier" both miss, and which a player
reaches through the Custom dialog. A tier the game declares as a search tier is
excluded from that rule, because a hint refuses where a guess is needed. This
rule and the ledger's rot half below SHALL be scoped by role under the
`build-pipeline` conditions for deferring an assertion to the push-time
backstop: off in the automatic per-commit hook, and running in CI on every push
and in a manual `npm run gate`. Measured 2026-09-20, it is 47 s of the block's
83, and the per-commit test selector reaches this guard from any staged path
under `src/games/`, so it otherwise lands on nearly every commit; what it
protects is decay rather than the narration the commit just wrote.

A step MAY exceed the limit only when a ledger entry lists its rung
(`HintStep.rung`) for its game, with the reason that rung's sentences need the
room. An entry SHALL name rungs by id and SHALL NOT match a step's sentence, so
that rewording a sentence cannot take it out of its listing unseen; and every
rung an entry lists SHALL be one its games declare. A ledgered sentence SHALL
still be at most 300 characters. The ledger SHALL be asserted in both
directions, and **the unit of both directions SHALL be the
`(entry, game, rung)` listing rather than the entry**: a step over the limit
whose rung no entry listing its game names fails, and a listing whose rung its
game never speaks over the limit fails, so a sentence brought under the limit
takes its listing with it and a game that stops speaking a shared rung at
length takes its listing with it. Keyed by entry alone, the reverse direction
passes as soon as any one listed game reaches the rung, which leaves a game
listed on a shared rung it never speaks at length invisible.

The forward direction SHALL run on every commit; the reverse direction SHALL
defer with the corner rule its verdict is decided against, and SHALL be
**skipped** rather than evaluated when that rule did not run, because with the
corner unwalked it would report a live listing as dead.

Because the reverse direction asserts a **negative over the walk's sample**, the
check SHALL carry a vacuity floor per listed game as well as one over the whole
walk, so that a game whose boards all failed to generate cannot read as a dead
listing; and a listing SHALL NOT be deleted on the gate walk's silence alone,
but on a widened walk of that game recorded beside the entry.

#### Scenario: A long sentence without a ledger entry fails

- **WHEN** a hint step's narration is longer than 120 characters and no ledger
  entry for its game lists its rung
- **THEN** the check fails, naming the sentence, its rung and its length
- **AND** it does so on the per-commit path, not only on push

#### Scenario: A ledger entry that no longer matches anything long fails

- **WHEN** a ledgered rung's sentences are shortened under 120 characters, or
  the rung stops being spoken
- **THEN** the check fails until the listing is deleted

#### Scenario: A game listed on a shared sentence it never speaks fails

- **WHEN** a ledger entry names several games and one of them never speaks the
  rung over the limit, while the others do
- **THEN** the check fails naming that game and that entry, and does not pass
  on the strength of the games that do speak it

#### Scenario: A listed game whose walk examined nothing is not reported as dead

- **WHEN** every board for a listed game fails to generate, so its walk
  contributes no steps
- **THEN** the check fails reporting that the game's walk looked at nothing,
  rather than reporting its listings as dead exemptions

#### Scenario: The rot half is skipped when the corner walk did not run

- **WHEN** the run is the automatic per-commit hook, so the last-preset corner
  is not walked
- **THEN** the reverse direction is reported as skipped rather than evaluated,
  and the forward direction still runs in full
- **BECAUSE** a listing whose only sentence lives in the unwalked corner would
  otherwise be reported dead on a walk that could not have heard it

#### Scenario: A ledgered sentence still has a ceiling

- **WHEN** a ledgered sentence grows past 300 characters
- **THEN** the check fails, ledger or not

#### Scenario: A reworded sentence keeps its listing

- **WHEN** a ledgered rung's sentence is reworded and stays over the limit
- **THEN** its listing still excuses it, with no edit to the ledger

#### Scenario: A listing for a rung the game does not have

- **WHEN** a ledger entry lists a rung that one of its games does not declare
- **THEN** the check fails on every commit, naming the game and the rung
