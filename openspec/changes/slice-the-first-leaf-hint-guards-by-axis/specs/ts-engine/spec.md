# ts-engine — delta

## ADDED Requirements

### Requirement: A cross-game sweep SHALL take its boards from the shared slice, not build them

A test that walks the collection SHALL obtain the boards it walks from the one
shared preset enumeration, and SHALL NOT construct a population of its own out
of a game's parts.

The rule already said that any cross-game sweep over presets asks the same
question and derives the answer from the game. What it did not say is where the
answer comes from, and so **twelve sweeps answered it twelve times and eleven
answered it wrong**. Eleven read `firstLeaf(game.presets())` — by convention the
smallest and easiest board a game offers — or synthesized params from it with a
`withTier` that writes the tier field and nothing else. Measured 2026-09-20 over
the live registry: no board any of the eleven had ever run on carried a cage, a
jigsaw block, an X diagonal, an Adjacent clue, a Tectonic region, a
multiplication-only Keen or any Loopy tiling but Squares. Three of the eleven
have *narration* as their subject, while Killer alone adds four cage sentences.

Three of the eleven sat inside the very file whose main walk had already been
widened, which is why the rule has to name the shared function rather than the
finding: a sweep that was fixed once is not a sweep that stays fixed.

**A shared decision keeps its cost discipline in one place too.** A hint that
plans by *searching* pays for board size twice over — one full search per move,
and more moves to make — so the shared function gives those games every mode on
the smallest board offering it and no large board at all, derived from the same
axes as everyone else's slice. The count it replaced was a number of presets to
keep, chosen because three happened to reach Netslide's three barrier modes,
which stops being true the day Netslide gains a fourth.

**Widening a sweep is not license to widen what it asserts.** The same
assertions run over more boards; a rule that then fails has found either a
defect or a vocabulary its own subject uses and it had never heard, and both are
findings.

#### Scenario: A sweep is written that walks the collection

- **WHEN** a new cross-game test needs a board per game
- **THEN** it calls the shared slice, and gains every game's every mode from
  that commit with no key of its own to maintain

#### Scenario: A guard's own population is synthesized from a base preset

- **WHEN** a cross-game guard builds its boards by writing a tier onto one
  preset's params
- **THEN** that is the tell of a population the games did not offer, and the
  guard is re-keyed on the presets menu — unless its subject is what a *params
  record* does rather than what a *board* carries, which it SHALL say at the
  site

#### Scenario: A hand-maintained roster patches the narrow population

- **WHEN** a guard carries a per-game entry naming a bigger or different preset
  to use, because the population it built is too small to reach the behavior
- **THEN** reading the presets menu retires the roster, because the board the
  entry named by hand is the board the derivation picks: `hint-ordinal`'s
  `{ solo: "3x3 Extreme" }` went that way, Extreme being a value of Solo's
  difficulty axis and `3x3 Extreme` the smallest preset offering it

#### Scenario: A lexical narration rule meets a construction it has never heard

- **WHEN** a rule that recognizes narration by vocabulary is run over the modes
  and tiers for the first time
- **THEN** a phrasing the collection has used all along may fail it, and the
  vocabulary is extended with the reason rather than the sentence being
  flattened to fit: *"can take one line at most"* is a proved bound and *"none
  of its remaining edges can be walls"* is a negated possibility, each written
  by five or more games
- **AND** where the wording is owner-endorsed, it is recorded as a declared
  idiom rather than rewritten

#### Scenario: A guard needs a configuration the presets menu does not offer

- **WHEN** the behavior a guard observes needs a params combination no preset
  carries — a small grid at a hard tier, which a menu never pairs because menus
  climb size and difficulty together
- **THEN** the guard walks the slice **and** that combination, and says which
  behavior needs it: Keen emits an ordered chain on none of its ten presets at
  eight seeds each, and readily on the 4x4 its first preset gives once the tier
  is turned up, a board the Custom dialog offers and `validateParams` accepts
