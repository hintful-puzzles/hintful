## MODIFIED Requirements

### Requirement: Hint: A step rings the edges it decides and outlines or stripes what it reads

Each step SHALL ring every edge its move decides, between the two letters
and clear of both, and draw each line it asks for with its arrow, the way
the word reads. A step that reads one letter SHALL outline it; a step that
reads the words of a length SHALL stripe their letters. Its sentence SHALL
say why those edges are forced, from the board, in no more than 120
characters, and SHALL name the words it reasons from, in capitals, wherever
the sentence has room, and count them where it has not. The step SHALL name
those words as its reference items.

#### Scenario: The one word through a letter

- **WHEN** one word, PAVILION, still fits through a letter and decides edges
- **THEN** the hint outlines the letter, rings those edges, and says "Only PAVILION still fits through the outlined letter, so these edges must be as shown."

#### Scenario: Two words through a letter agree

- **WHEN** two words, AVION and PAVILION, still fit through a letter and run along or away from the same edges
- **THEN** the hint outlines it, rings those edges, and says "Only AVION and PAVILION still fit through the outlined letter and agree on these edges, so they must be as shown."

#### Scenario: More words through a letter agree

- **WHEN** three short words, ANT, TAN and NAB, still fit through a letter and agree on an edge
- **THEN** the hint says "Only ANT, NAB and TAN still fit through the outlined letter and agree on this edge, so it must be as shown.", and where the words would run the sentence past its length it counts them instead: "Just 5 words still fit through the outlined letter and agree on these edges, so they must be as shown."

#### Scenario: The only word of a length

- **WHEN** one trail still fits the one six-letter word listed, FRIDGE
- **THEN** the hint stripes its letters and says "The striped letters spell FRIDGE, the only 6-letter word that still fits, so these edges must be as shown."

#### Scenario: The only two words of a length

- **WHEN** two trails still fit the two eight-letter words listed, INITIATE and REACTION
- **THEN** the hint says "The striped letters spell INITIATE and REACTION, the only 8-letter words still fitting, so this edge must be as shown."

## ADDED Requirements

### Requirement: Reference: Wordtrail's dictionary lists the words the board can spell

Wordtrail's reference SHALL be titled "Dictionary" and list, under a heading
for each listed length, every common word some trail on the board spells,
alphabetically, each once. A word SHALL be placed where a drawn piece spells
it, ruled out where no trail of it fits the player's lines and crosses, and
outstanding otherwise. Selecting a word SHALL spotlight the letters of its
trails that still fit, until the board is touched.

#### Scenario: A crossed edge rules a word out

- **WHEN** the only trail spelling TAN runs across an edge the player has
  crossed
- **THEN** TAN is shown ruled out, and an undo of the cross shows it
  outstanding again
