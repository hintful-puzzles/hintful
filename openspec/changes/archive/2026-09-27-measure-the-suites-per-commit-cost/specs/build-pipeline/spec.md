## ADDED Requirements

### Requirement: The pre-commit hook narrows the cross-game sweeps to the games a commit touched

When every staged path lies under `src/games/<id>/`, the **automatic per-commit
hook** SHALL skip the cross-game cases of every other game, and SHALL NOT skip
anything else on that basis. CI and a manual `npm run gate` SHALL never narrow,
so the guarantee on `main` is unchanged. A cross-game guard runs one case per
game, and on a Pearl-only commit, measured 2026-09-27, 518 s of 593 s of test
time was such cases and 413 s of it was other games' cases.

A skipped case SHALL be one the commit could not have turned red, which requires
both halves of a soundness condition: **no staged path lies outside a game
directory**, so no engine module, guard or shared helper changed; and **a case
titled `<id>: …` depends on no game but `<id>`**, which holds because a game
cannot import another game and no case reads a second one on purpose. A case is
recognized by that title and by nothing else, so a guard that titles its cases
otherwise is not narrowed, which only costs time.

The scope SHALL travel as a single value, `GATE_GAME_SCOPE`, honored only beside
`GATE_PRECOMMIT=1`, so it inherits that toggle's backstop. The name filter that
skips the cases and the helpers that narrow the assertions spanning a sweep SHALL
both be derived from it, so they cannot disagree about which games ran. Skipped
cases SHALL be reported as skipped at the runner level.

An assertion that reads across a sweep SHALL be narrowed **with** the sweep, as
"The pre-commit gate minimizes wall-clock without dropping checks" already
requires of an assertion whose verdict depends on narrowed work.
A ledger compared against what the cases found SHALL be filtered to the games
that ran, so the touched game's entry is still held to its case. A floor over the
whole population that no subset can be expected to meet SHALL be skipped on a
narrowed run, unless a touched game could move it on its own; such a floor SHALL
be computed over the whole population without the narrowed work, so that it
still runs.

#### Scenario: A commit touches only one game

- **WHEN** every staged path is under `src/games/pearl/`
- **THEN** the hook skips every cross-game case titled for a game other than
  Pearl, and runs Pearl's
- **AND** reports the skipped cases as skipped
- **BECAUSE** no other game's verdict can have changed, and CI runs them all

#### Scenario: A commit touches the engine as well

- **WHEN** a staged path lies outside every game directory, such as an engine
  module or a guard
- **THEN** no case is skipped for being another game's
- **BECAUSE** a shared module can change every game's verdict

#### Scenario: A ledger is compared on a narrowed run

- **WHEN** the hook narrowed the run to one game, and a guard compares an
  exemption ledger against the games its cases found
- **THEN** the comparison is made over the ledger's entries for the games that
  ran
- **BECAUSE** skipping it would drop a check of the touched game's own entry,
  and making it whole would fail on every game whose case never ran

#### Scenario: A game drops out of a population no case can see

- **WHEN** a commit touching only one game removes that game's keypad, so it
  has no on-screen-key case left to fail
- **THEN** the floor on the number of games offering a keypad is still
  evaluated over every game, exactly as on an unnarrowed run
- **BECAUSE** that floor is read from the games without building a board, so
  narrowing the cases does not narrow it
