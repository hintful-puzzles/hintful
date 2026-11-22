# described-fill-game Specification

## Purpose
A fill game, whose player sets each cell toward one hidden answer, born from
its description: the engine's board, input, render, deal, game ID and hint
built from the compiled module, so the game writes no TypeScript.

## Requirements

### Requirement: A fill game is born from its description

A game whose player fills a grid toward one hidden answer MAY be born from its
description: `fillGame` of its compiled module SHALL be the whole game, its
catalog entry, boards and hint legend read from `catalog:` and `play:`, and its
directory SHALL hold no TypeScript but its tests.

#### Scenario: Tents is its description

- **WHEN** the catalog and the registry are read
- **THEN** Tents and Kakurasu are in both, and neither game's directory holds
  a TypeScript file that is not a test

### Requirement: A born game's ID is its description's grammar

A born game's description SHALL state its game ID's grammar (`id:`), and the
engine SHALL read and write a desc by it alone, refusing what the grammar does
not write.

#### Scenario: Upstream's Tents descs are read and written byte for byte

- **WHEN** a Tents desc upstream's generator writes is read and written again
- **THEN** the desc written is the desc read

### Requirement: A born game deals a sampled answer at its tier

A born game SHALL deal by sampling an answer as `deal.sample` states, deriving
the clues from it, and keeping it only where its board is finished at the tier
asked for and not at the tier below. Where `noBareLine` is stated, an answer
with a line holding only the rest value SHALL be drawn again.

#### Scenario: A Tents answer with a column of grass alone

- **WHEN** a Tents answer is sampled with a column holding neither a tent nor
  a tree
- **THEN** it is drawn again, and no board is dealt from it

### Requirement: A born game's hint begins at the tier its board needs

A born game's hint SHALL walk its ladder from the player's own values and
marks, beginning at the lowest tier that finishes the board as dealt and going
up a tier only where that one finds nothing, and each step SHALL be worded by
its technique's `says`.

#### Scenario: An Easy board's hint uses no Normal technique while an Easy one fires

- **WHEN** the hint is followed on an Easy Tents board from nothing placed
- **THEN** no step is a Normal technique's while an Easy technique has a
  firing

### Requirement: A born game's step may ask for a mark

A firing's `MARK` facts SHALL be a step's targets beside its `PLACE` facts.
Where the game's mark is a link, the step SHALL ring it, and play it by the
link's drag after its clicks, the clicks on squares the secondary value rules
out first.

#### Scenario: A tree's one open square is placed joined

- **WHEN** a Tents step places a tree's tent on its one open square
- **THEN** the step sets the tent and marks the link, and playing it leaves
  them joined

### Requirement: Links read at a glance are not asked for

Where a description states `play.glance`, the walk SHALL read those
techniques once on the drawn marks before each firing, and SHALL ask for a
mark beyond them only where `play.askBefore` offers one after which a stalled
technique fires, or where nothing else is left.

#### Scenario: A link is asked for only when a step needs it

- **WHEN** a Tents step only draws a link and the next step places a square
- **THEN** that next firing could not have fired before the link

### Requirement: What a placement rules out is the description's techniques

A description's `rulesOut` SHALL name techniques, or one arm of a technique as
`<id>.<arm>`, and a placement SHALL bring the conclusions of those firings
whose premise holds a square it placed, never on a square the move itself
changed, and nothing on a board the techniques find contradictory.

#### Scenario: A tent on a small board

- **WHEN** the rule-out preference is on and a tent is placed at the fourth
  row's second square of the 4×4 Tents board `cdcc,1,1,1,0,1,1,0,1`
- **THEN** the squares round it and the open squares of the lines it completes
  become grass in the same move

### Requirement: Painters naming one color share its slot

A born game's renderer SHALL give each named color one palette slot, however
many of its painters draw in it.

#### Scenario: Tents' ground is one slot

- **WHEN** Tents' palette is built
- **THEN** the ground under a tent, under a tree and under grass is one slot
