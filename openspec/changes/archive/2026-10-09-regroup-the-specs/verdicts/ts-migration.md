# Verdicts: ts-migration

## reword `ts-migration`: Clean TS save format, and future game IDs stay stable

The tree answers the question put to the owner, so it is not asked. The
sentence "The stream the engine's random number generator produces for a seed
SHALL be held fixed" is neither obsolete nor at odds with `AGENTS.md`: the
`random` capability holds it as its own subject ("The random module's output
is stable across builds", "The characterization corpus is frozen", with the
corpus under `src/engine/random/__fixtures__/`). `AGENTS.md` and `app-shell`,
"The app hands out boards, never seeds", say a different thing: a seed names a
board only through a generator, and the generators change, so a seed is never
handed out. The stream is fixed and what a generator makes of it is not. Here
the sentence sat in a requirement about game IDs and read as though a seed
were one, which is what raised the doubt. It goes from this requirement, and
`random` keeps the rule. Everything else is word for word, both scenarios
kept. `src/store/saved-games.ts` leans on the C-format half, which is
untouched.

### Requirement: Clean TS save format, and future game IDs stay stable

The project SHALL use a clean TypeScript-native save format. Compatibility
with the C-serialization save format, and with shared game IDs from before the
TypeScript engine, SHALL NOT be required. A game ID the TypeScript engine
hands out SHALL remain stable and shareable: it names its board
(`params:desc`), and names the same board on every build.

#### Scenario: Old C-format save is not required to load

- **WHEN** a save produced by the C-serialization path is presented to the TS
  engine
- **THEN** the engine is NOT required to load it
- **AND** this is not treated as a defect

#### Scenario: A shared game ID reproduces its board

- **WHEN** a game ID the TS engine handed out is entered on another TS-engine
  build
- **THEN** the same board is produced

## keep `ts-migration`: A device pass records a verdict per item, not an overall impression

The practice did not end with the porting era: the rule was written by
`2026-09-24-test-touch-on-a-real-device`, after the last port of that era, and
that change's `device-report.md` is a report in this shape. The owner runs the
pass and a session writes the checklist and the record, so a session does read
this. No guide states it (searched `docs/` and `AGENTS.md` for "device",
"device pass", "real device": only unrelated uses in `docs/games/input.md`).

## keep `ts-migration`: Device acceptance carried forward is carried explicitly

Same provenance, and it binds any session that archives touch work on a Chrome
pass, which is every session, since browser checks are Chrome only. The owner
deferred `2026-08-29-audit-input-mode-parity`'s acceptance "to a real device
rather than skipped" and this is the rule that came of it. No guide states it;
`docs/work-management.md` § "What the owner accepts" does not mention a device.

## keep `ts-migration`: Touch acceptance happens on a device, and a synthesized pointer is not one

The question left to this step was whether a guide should hold the three
device rules in place of the spec. They stay in the spec: they are the owner's
decision about what evidence counts for what a player feels, not a habit of
work, and the capability's Purpose as regrouped names "touch accepted on a
device" as one of the things it holds. The guides should point here (note
below).

## keep `engine-helpers`: A shared abstraction states its actual scope, not an aspirational one

"A game that does not fit the runner records the promise it breaks" is not
enough: it is about the deduction runner alone, and this is the rule for every
shared module, followed outside the runner (`src/engine/run-length.ts` records
its measured no-go in its header, as `src/engine/deduction-fixpoint.ts` does;
`docs/games/engine-catalog.md` says of one module that its header's list of
no-gos matters as much as its call sites, and states no general rule). The
second scenario is not an account of one audit: it holds the refusal to widen
an abstraction that most candidates do not fit, and that a candidate nobody
examined is "unaudited" and not a no-go. Both would be got wrong again.

## keep `engine-difficulty`: The monotonicity guard samples enough boards to catch its defect

Yes, someone would resize it: the sample is `seedBudget(perCommit(1, 4), 12)`
in `src/engine/difficulty-contract.test.ts`, a number in a slow guard, and the
first thing a session cutting gate time reaches for. `docs/method.md`'s "see a
new guard fail before trusting it" is the general rule; this fixes what it
means for this guard (the size is the one at which it fired on the solver that
was non-monotone), and it also holds the split between the hook's first board
and the push's whole sample, which no guide states for this guard.

## keep `engine-difficulty`: A rejecting generation gate is measured before it is adopted

The last clause still binds. `git ls-files 'src/games/*differential*'` lists
46 files, 29 of which call a generator, and they compare its desc byte for
byte with a frozen C-recorded fixture (`lightup-differential.test.ts`: "must
reproduce the C reference desc byte-for-byte"). A new rejecting gate in any of
those games turns its differential red, and this clause is what says the gate
wins.

## keep `engine-helpers`: A shared declarative helper is adopted by every game it fits

The no-op sentence is not about a finished sweep. The requirement's scenario is
a new port, and the sentence is the test of fit for any such helper, the next
one included: a helper whose adoption moves a differential or a render
snapshot is not emitting the table the game wrote by hand. Whether any game is
left to adopt today's two helpers does not decide it (45 game directories call
`dimensionParamConfig`; the rule that the rest record a reason stands).

## keep `engine-hints`: The solver and the hint are two projections of one deduction engine

Not a duplicate, of either neighbor. `engine-hints`, "A game narrates every
deduction or rejects the board at generation", is the choice between two
strategies; no requirement of `engine-hints`, `engine-helpers` or
`engine-difficulty` states the projection rule itself (searched the three for
"projection", "recorder", "uniqueness pass"), and
`docs/games/solver-and-generator.md` § "One engine, two projections" is its
guide. The grade-by-tier sentence is wider than `engine-helpers`, "The grade
and the cap are tiers, never positions", which binds the shared runner: this
one binds every logic game, the ones that keep a bespoke loop included, so the
sentence and its scenario stay.

## note `ts-migration` no guide points a session at the device rules

A session changing touch behavior reads `docs/games/input.md`, and a session
about to archive reads `docs/work-management.md` § "What the owner accepts" and
§ "Before archiving". Neither mentions that touch feel is accepted on a real
device against a deployed build, or that a Chrome pass with synthesized touch
pointers must say what it does not cover. The rules stay in the spec; a
one-line pointer to `ts-migration` in each guide would get them read.

## note `random` and the seed sentence of `AGENTS.md`

`AGENTS.md` says "changing which board a seed deals breaks nothing" and
`random` says the stream a seed produces never moves. Both are true and the
pruning read them as a contradiction. If `random`'s Purpose is touched in this
change, a clause saying the stream is fixed while a generator's use of it is
free to change would stop the next reader doing the same.
