## MODIFIED Requirements

### Requirement: A reference model may ask for a search box and filters

A reference model MAY ask for a search box, MAY declare filters, each a
label and the item statuses it shows, and MAY put each section in a named
group. A model with none of these SHALL be shown whole.

#### Scenario: A dictionary's filters

- **WHEN** Wordtrail's model is read
- **THEN** it asks for a search box and declares "Fits", showing outstanding
  words, and "Found", showing placed ones

#### Scenario: A dictionary's groups

- **WHEN** Wordtrail's model is read for a board asking for three- and
  five-letter words
- **THEN** its sections are in two groups, "3 letters" and "5 letters", and
  Wordguess's and Dominosa's sections are in none
