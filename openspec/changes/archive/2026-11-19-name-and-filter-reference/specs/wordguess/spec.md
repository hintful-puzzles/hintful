## MODIFIED Requirements

### Requirement: Controls: Wordguess's dictionary lists the words that fit every score

Wordguess's reference SHALL be titled "Dictionary" and list every word the
game can draw as an answer at the board's length, under letter headings from
A to Z, with any other word that fits every score when no answer does. A word
that no longer fits every score SHALL be ruled out. It SHALL ask for a search
box and declare a "Fits" filter showing the words that fit. Selecting any
listed word SHALL write it into the working row, ready to submit, and leave
nothing selected in the list.

#### Scenario: Picking a word from the dictionary

- **WHEN** CRANE has scored against CIGAR and the player taps CIGAR in the
  dictionary
- **THEN** the working row spells CIGAR, ready to submit, and no move is made

#### Scenario: A word that cannot win, chosen to split the rest

- **WHEN** CRANE has scored against CIGAR and the player taps a struck word
- **THEN** the working row spells it, ready to submit
