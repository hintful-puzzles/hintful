## ADDED Requirements

### Requirement: A key-only verb declares the pointer's route to it
A target-verb game's key-only verb SHALL declare how a pointer alone reaches the same move, as a `pointer` route the verb cannot be declared without, so that a verb no button applies directly is a type error unless the pointer has a way to it. A route SHALL be one of: the verb's target pressed with a button a stated number of times (`repeat`); pressed with a button until its cycle reaches the verb's result (`cycle`); or pressed with a button in notes mode, at a stated place on the target where the game reads where the press lands (`notes`).

The Controls paragraph generated from the declaration SHALL state each key-only verb's route beside its keys, so the help cannot describe a key without the pointer's way to the same move.

`target-verb.test.ts` SHALL hold every declared route to its keys, comparing boards by what the player sees rather than by the state, since a game may record bookkeeping a move leaves invisible (Net records which way its last turn went): for `repeat`, the boards the keys reach at every cursor target SHALL equal those the route reaches at every point on the board; for `cycle` and `notes`, every board the keys reach SHALL be one the route passes through.

An arm of a game's own, outside the model, is not covered by this requirement; its keys and gestures are the game's to match, and `docs/games/input.md` says so.

#### Scenario: A key-only verb without a route does not compile
- **WHEN** a game declares a key-only verb with keys and no `pointer` route
- **THEN** the typecheck fails

#### Scenario: A route that does not make the key's move fails
- **WHEN** Net's half turn declares three presses instead of two, or its lock declares a button cycle instead of a notes-mode press
- **THEN** `target-verb.test.ts` fails for Net, naming the verb

#### Scenario: The paragraph names the route
- **WHEN** a declaring game's Controls paragraph is generated
- **THEN** each key-only verb's sentence ends with its route, such as "or click it twice" for Net's half turn
