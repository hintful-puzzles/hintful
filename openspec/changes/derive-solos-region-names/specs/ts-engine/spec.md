# ts-engine — delta for derive-solos-region-names

## ADDED Requirements

### Requirement: A region's name is read off the region

A candidate-elimination game whose narration cites *which kinds* of region a value may not repeat in SHALL read those words off the regions it declares ("A cell's regions are one definition per relation"), never from a second list restating the same fact.

The reader's word SHALL be a property of the declared region, so that a region added to the declaration cannot be built without saying what a sentence citing it calls it. It SHALL NOT be carried by the tag that names a hidden single: that tag is present only on the regions holding every value, and a game may forbid repeats in a region that holds no full set (a Solo Killer cage) which a sentence still has to name.

Names, not regions, SHALL decide what a citation repeats: a cell lying in two regions the game calls by one word cites that word once. A citation that speaks for the whole board at once — the opening clean, which culls every cell's notes in a single step — SHALL name the union of the board's regions rather than any one cell's, so a cell lying in none of an optional kind is still told its notes were cleaned against that kind.

#### Scenario: A word is not a second statement of the regions

- **WHEN** a game gains a kind of region a value may not repeat in
- **THEN** the sentences citing the kinds of region name it without a second edit, and a region carrying no word does not compile

#### Scenario: Two regions the game calls by one word are cited once

- **WHEN** a value is placed on a Solo X board in the cell both diagonals pass through
- **THEN** the sentence says its row, column, block and diagonal, naming the diagonal once

#### Scenario: A region that holds no full set is still named

- **WHEN** a value is placed on a Solo Killer board
- **THEN** the sentence names the cage among the regions the value may not repeat in, and the cage carries no tag naming a hidden single

#### Scenario: The board-wide clean names a region the cell is not in

- **WHEN** the opening clean of a Solo X board culls the notes of a cell lying on neither diagonal
- **THEN** its sentence still names the diagonal, because the one step cleans every cell of the board
