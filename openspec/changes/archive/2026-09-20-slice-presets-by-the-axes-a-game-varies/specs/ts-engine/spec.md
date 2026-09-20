# ts-engine Specification Delta — slice-presets-by-the-axes-a-game-varies

## MODIFIED Requirements

### Requirement: The hint walk SHALL cover every preset a game offers

The cross-game guarantee that following hints solves the board, from any reached
position, SHALL be asserted over **every leaf preset** of every hinting game, not
over one of them.

It was asserted over `firstLeaf(game.presets())` — by convention the smallest and
easiest board a game offers — for thirty games. The guard therefore had never
seen a Hard board, an `Unreasonable` board, or any mode variant, while reading as
the collection's strongest hint guarantee. Widened (2026-09-08) it walked **209
preset cases** and reported thirteen refusals that the narrow form could not
reach, all of them a real finding.

The sweep SHALL carry a vacuity count of preset cases walked, and its cost SHALL
be tiered rather than paid per commit — with the per-commit slice keeping at
least one preset **per value of every axis the game actually varies**, and with
the axes derived from the game's own `paramConfig` rather than named by the
sweep.

**A game varies more than one axis, and every key tried so far has named one of
them and dropped the rest in silence.** That is a measurement, taken three times:

| the key | what it walked | what it could not reach |
| --- | --- | --- |
| `firstLeaf` | the smallest, easiest board | every Hard, every `Unreasonable`, every mode — thirteen refusals across seven games |
| one preset per declared tier | a board at each difficulty | every preset of an **untiered** game after the first, since they all carry one tier key — Sixteen's 3×3 walks in seven moves and its 5×5 hint cycled for ever |
| that, plus first and last preset where there is no tier | the size ends of untiered games | every **mode** of a tiered one — Solo walked no X, jigsaw or Killer board, Unequal no Adjacent board, Seismic no Tectonic board, Group no identity-hidden board, Keen no multiplication-only board, Loopy one tiling of eighteen; and Salad, whose eleven presets all carry one tier, collapsed to a single board |

Each key was correct about the axis it named. What makes the third fail is not a
missing game but a missing **axis**: a preset that shares a tier with a plainer
board earlier in the menu is de-duplicated away, and a mode is exactly such a
preset. Killer is not a skin on Solo — it adds four cage deduction rungs and four
cage sentences that these guards exist to check.

**The axes SHALL be derived from `paramConfig`, and its *types* SHALL decide what
covering an axis means.** `paramConfig` is a value a mechanism consumes (the
Custom dialog is built from it) rather than a statement written for a guard, it
is complete because a registered game with no `paramConfig` already fails its own
guard, and it distinguishes the two kinds of axis without anyone restating them:
a `"string"` item is a free scalar whose values lie on a line, so **both ends**
cover it; a `"boolean"` or `"choices"` item is a selection from a closed set with
nothing between its members, so **every value** does. Difficulty is a `"choices"`
item, so "one preset per tier" follows from the general rule and is not a case.
A field every preset holds one value at is not an axis: no preset reaches a
second value, so no slice can walk one.

**Presets SHALL be taken in menu order**, keeping one that supplies a value no
earlier one did. That is the cost discipline rather than a detail: it claims each
value on the **smallest** board offering it, so a mode costs about what the
game's easiest board costs. Measured 2026-09-20 back to back on one box (16 GB,
18.6 of 19.4 GB of swap in use, so seconds are upper bounds and the ratio is the
figure that survives), the slice went **88 → 141 walks** and `hint-resume.test.ts`
**25.1 s → 67.0 s**; of the added cost the modes were nearly free — Seismic's
Tectonic board 3 ms, Group's identity-hidden 11 ms, Unequal's Adjacent 34 ms,
Salad's Numbers 9 ms — and the two large items were Loopy's eighteen tilings and
one largest board per game.

**Any cross-game sweep over presets SHALL ask the same question**, and the answer
SHALL be derived from the game rather than assumed. A second sweep keyed on tier
did worse than sample one preset of an untiered game: it skipped such games
before reaching its own vacuity count, so twelve of the thirty hinting games were
outside it while it read as covering them all. The shared preset enumeration
these sweeps derive their population from lives with the other cross-game hint
testing helpers, so a sweep does not re-answer it — and the slice itself lives
there too, for the same reason.

**The slice's own vacuity floor SHALL sit above the ways it can collapse**, not
merely above zero. One board per game and one board per tier are both counts a
broken derivation produces while every walk stays green, so a floor beneath
either asserts nothing about the axis keying. Measured 2026-09-20: 35, 88 and
141 respectively.

**A sweep's finding SHALL be pinned by its shape where it has one, rather than by
more sampling.** The stranding above appears on about a fifth of boards, which no
affordable number of seeds catches reliably; every instance is the same
recognizable board shape, and a test that names two such boards asserts the same
property deterministically in seconds. Seeds remain the wrong dial to turn.

#### Scenario: A hint works on Easy and gives up on Hard

- **WHEN** a game's hint cannot walk a board dealt from a preset at a
  deduction-complete tier
- **THEN** the walk fails, naming the game, the preset and the position

#### Scenario: A game gains a preset

- **WHEN** a preset is added to a game's menu
- **THEN** it is walked from that commit, with no line added anywhere to enroll
  it

#### Scenario: A game's second mode is walked per commit

- **WHEN** a game's presets differ in a `"boolean"` or `"choices"` param — a
  Killer grid, an Adjacent clue set, a Tectonic region shape, a tiling — and the
  mode's presets share their tier with a plainer board earlier in the menu
- **THEN** the per-commit slice walks a board carrying that mode, on the smallest
  preset offering it, rather than de-duplicating it away against the plainer
  board
- **BECAUSE** a mode is a different set of deductions and sentences, not a
  larger board: capping Solo's hint recorder below its board's Killer tier left
  the tier-keyed slice green and turns the axis-keyed one red

#### Scenario: An untiered game's largest board is walked per commit

- **WHEN** a hinting game declares no difficulty contract, so every preset it
  offers carries the same tier key
- **THEN** the per-commit slice walks the largest board it offers as well as the
  smallest, rather than collapsing the game to one board — unless the game's
  hint plans by searching, where board size is sliced away under the
  `build-pipeline` cost requirement and a named per-game test covers the largest
  board instead
- **AND** "largest" is the extreme of each scalar axis, not the last entry in
  the menu: Flood's last preset is 12×12 at four colors, whose color count is
  interior and whose leniency an earlier board already claimed, while its
  largest board (16×16) went unwalked under the rule that took the last one

#### Scenario: A sweep meets a game with no tiers

- **WHEN** a cross-game sweep varies a game's params by tier, and the game
  declares no difficulty contract
- **THEN** it varies that game by preset instead of skipping it, and its vacuity
  count counts what it actually looked at
