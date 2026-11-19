## MODIFIED Requirements

### Requirement: Rules: Wordguess is won on the answer and lost when the rows run out

The game SHALL be won when the last scored row has every letter in place, and
lost when every row is used without that; a lost game SHALL say the answer in
the status bar.

#### Scenario: Running out of rows shows the word

- **WHEN** every row is used and none is the answer
- **THEN** `status()` returns `"lost"` and the status bar names the answer

### Requirement: Controls: Letters are typed, and every letter key is the game's

A letter key, either case, or a letter button on the panel, SHALL enter that
letter at the selected slot of the working row, else at its first empty
slot. Every letter key SHALL be consumed while the game is in play, even
where the row has no room for it, so that no letter falls through to the
app's one-letter shortcuts.

#### Scenario: A letter on a full row deals no new game

- **WHEN** the working row is full and N is typed
- **THEN** the key is consumed and the row is unchanged

### Requirement: Controls: Wordguess remembers a half-written word across a save

The working row SHALL be saved with the game as its letters, `.` for an
empty slot (`cr...`); a submitted or undone guess SHALL empty it.

#### Scenario: A half-written word survives a save

- **WHEN** CR has been typed and the game is saved and reloaded
- **THEN** the working row holds CR, with the frame on the third slot

#### Scenario: A whole word brought back from a save goes

- **WHEN** CRANE has been typed, the game is saved and reloaded, and Enter is
  pressed
- **THEN** CRANE is submitted

### Requirement: Hint: The suggested guess is counted, not argued

The hint SHALL read only the scored rows, never the hidden word, and SHALL
be one step: a guess, ringing the working row's squares it goes in. The
guess SHALL be a word the board accepts, a common word wherever one is sure
to find the answer in time, and its sentence SHALL name it and claim only
what was counted: how many common words still fit every score, and the most
the guess can leave whatever it scores. A guess that does not fit SHALL say
it can't win. Once no common word fits, every word of the list is counted.

#### Scenario: A guess that cannot win

- **WHEN** the word that leaves the fewest standing is not one that fits
- **THEN** the sentence says how many fit, that the guess can't win,
  and the most it can leave

#### Scenario: The same scores give the same plan

- **WHEN** CRANE is scored against MOUSE on one board and against HOUSE on
  another
- **THEN** the two hints are the same

## ADDED Requirements

### Requirement: Rules: A Wordguess move is a submitted word

A `WordguessMove` SHALL be a guess carrying the working row's letters
(`{ type: "guess", letters }`, `a` = 1 to `z` = 26). A guess SHALL be
refused unless every slot holds a letter, the word is in the word list's
guesses (`isGuess`), and, in hard mode, it keeps what earlier scores
revealed. Solve SHALL submit the answer as the next guess, which wins.

#### Scenario: Solve plays the answer

- **WHEN** the move `solve` returns is executed on a board in play
- **THEN** `status()` returns `"solved"`

#### Scenario: A word not in the list is refused

- **WHEN** a guess of CRNAE is executed
- **THEN** it throws, naming the refusal

### Requirement: Controls: Enter submits a row that may go

Enter SHALL submit the working row when it may go, wherever the frame is. A
full row that may not go SHALL be refused: nothing is submitted, the row is
framed as refused until a letter of it is typed or rubbed out, and the status
bar says why. A row with an empty slot SHALL be declined. Submit on the panel
SHALL do the same as Enter.

#### Scenario: Enter on a row that is no word

- **WHEN** the working row spells CRNAE and Enter is pressed with the frame
  on a slot
- **THEN** no guess is submitted and the row is framed as refused

### Requirement: Controls: A tap selects a slot of the working row

A tap on a slot of the working row SHALL select it, the selection made on the
press and the release doing nothing. Clear and Backspace SHALL rub out the
selected slot, or the last letter typed.

#### Scenario: A tap then a letter changes one letter

- **WHEN** the working row spells CRANX, its last slot is tapped and K typed
- **THEN** the row spells CRANK

### Requirement: Reference: Wordguess's dictionary lists the words that fit every score

Wordguess's reference SHALL be titled "Dictionary" and list, alphabetically
under a heading counting them, the common words that fit every score, or
every word of the list that does once no common word fits: the words the
hint counts. Selecting a word SHALL write it into the working row, ready to
submit, and leave nothing selected in the list.

#### Scenario: Picking a word from the dictionary

- **WHEN** CRANE has scored against CIGAR and the player taps CIGAR in the
  dictionary
- **THEN** the working row spells CIGAR, ready to submit, and no move is made

## REMOVED Requirements

### Requirement: Rules: A Wordguess move is a submitted word or a set of marks

**Reason**: The answer row's marks are gone (owner, 2026-11-19).
**Migration**: "Rules: A Wordguess move is a submitted word". A save holding
answer-row marks no longer loads.

### Requirement: Controls: Enter submits and never switches Marks mode on

**Reason**: Marks mode is gone.
**Migration**: "Controls: Enter submits a row that may go".

### Requirement: Controls: A tap selects a slot of the working row or the answer row

**Reason**: The answer row is gone.
**Migration**: "Controls: A tap selects a slot of the working row".

### Requirement: Rules: Wordguess checks the answer row against the hidden word

**Reason**: The answer row is gone; the scores' colors and the dictionary
show what its marks recorded.
**Migration**: None.

### Requirement: Hint: Wordguess's hint places what the scores prove, then suggests a guess

**Reason**: Its steps' moves were answer-row marks, which no longer exist,
and a hint step needs a move.
**Migration**: "Hint: The suggested guess is counted, not argued".

### Requirement: Look: The answer row shows each slot's letters still possible

**Reason**: The answer row is gone.
**Migration**: The dictionary lists the words that still fit.
