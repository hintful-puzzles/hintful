## MODIFIED Requirements

### Requirement: The reference panel searches and filters as its model asks

Where the model asks, the panel SHALL show a search box, which keeps the
items whose label contains its text, case ignored. Where the model puts its
sections in groups, the panel SHALL show each group as a button, the first
pressed, and only the pressed group's sections. Where the model declares
filters, the panel SHALL show "All" and each filter as buttons, one pressed,
and keep the items the pressed one shows. Each button SHALL count the items
it would show under the search and the other row's pressed button. A
section left empty SHALL be hidden. The search, the pressed group and the
pressed filter SHALL be kept while the panel is open and reset for another
game.

#### Scenario: Narrowing a dictionary

- **WHEN** a Wordguess player with one row scored presses "Fits" and types
  "ci" in the search box
- **THEN** the panel lists only the words that fit every score and contain
  "ci", under their letters' headings

#### Scenario: Two rows that compose

- **WHEN** a Wordtrail player on a board asking for three- and five-letter
  words presses "5 letters" and then "Fits"
- **THEN** the panel lists only the five-letter words that fit, "Fits"
  counts five-letter words, and "3 letters" counts the three-letter words
  that fit
