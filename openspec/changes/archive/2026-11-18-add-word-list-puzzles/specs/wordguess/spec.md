## ADDED Requirements

### Requirement: Rules: A Wordguess move is a submitted word or a set of marks

A `WordguessMove` SHALL be a guess carrying the working row's letters
(`{ type: "guess", letters }`, `a` = 1 to `z` = 26), or a set of answer-row
marks that each set a letter's rule-out in a slot on or off. A guess SHALL be
refused unless every slot holds a letter, the word is in the word list's
guesses (`isGuess`), and, in hard mode, it keeps what earlier scores revealed.
Solve SHALL submit the answer as the next guess, which wins.

#### Scenario: Solve plays the answer

- **WHEN** the move `solve` returns is executed on a board in play
- **THEN** `status()` returns `"solved"`

#### Scenario: A word not in the list is refused

- **WHEN** a guess of CRNAE is executed
- **THEN** it throws, naming the refusal

### Requirement: Rules: Wordguess scores each letter in place, elsewhere or absent

A submitted guess SHALL be scored a slot at a time: in place where the answer
has that letter in that slot; then, from the left, elsewhere while the answer
still has a copy of the letter that is neither in place nor already claimed by
an earlier slot of the guess; and absent otherwise. A guess repeating a letter
the answer has once SHALL score only one of its copies.

#### Scenario: A repeated letter is scored once

- **WHEN** LOLLY is scored against HOTEL
- **THEN** the marks are elsewhere, in place, absent, absent, absent

### Requirement: Rules: Wordguess is won on the answer and lost when the rows run out

The game SHALL be won when the last scored row has every letter in place, and
lost when every row is used without that; a lost game SHALL show the answer.

#### Scenario: Running out of rows shows the word

- **WHEN** every row is used and none is the answer
- **THEN** `status()` returns `"lost"` and the answer row shows the answer's
  letters

### Requirement: Rules: Hard mode keeps every revealed letter

With hard mode on, a guess SHALL keep each letter an earlier row scored in
place in that slot, and SHALL use each letter an earlier row scored in place
or elsewhere at least as many times as that row scored it.

#### Scenario: A guess dropping a revealed letter is refused

- **WHEN** hard mode is on, the answer is CIGAR and CRANE has been scored
- **THEN** COAST is refused because it drops the R, and CARDS is accepted

### Requirement: Rules: Wordguess checks the answer row against the hidden word

Check & save SHALL report each answer slot whose rule-outs include the
answer's letter there, naming the slot and not the letter, and SHALL judge
no guess. It SHALL report nothing once the game is won or lost.

#### Scenario: A slot ruling out its own letter is reported

- **WHEN** the answer is CIGAR and I and A are ruled out of the second slot
- **THEN** Check & save reports the second slot alone

### Requirement: Params: Wordguess's parameters

The params SHALL be the word length (the lengths the word list holds), the
number of guesses (1 to 20) and hard mode, encoded as the length, `g` and the
count, and `h` when hard mode is on (`5g6h`). A string without `g` SHALL
decode to six guesses, and one without `h` to hard mode off. A length the
word list has no words of SHALL be refused.

#### Scenario: Params round-trip

- **WHEN** `{ len: 5, nguesses: 6, hard: true }` is encoded
- **THEN** the string is `5g6h`, and decoding it gives the same params

### Requirement: Description: A Wordguess description is the obfuscated answer

The description SHALL be the answer's letters, one byte each, obfuscated as
Guess's colors are and written as lowercase hex, so a game ID does not spell
its answer. It SHALL be refused unless it decodes to letters forming a word
of the guess list; the generator deals only from the answers list.

#### Scenario: A description whose word is not a word is refused

- **WHEN** a description decoding to QZXQZ is loaded
- **THEN** it is refused with a reason saying the hidden word is not in the
  word list

### Requirement: Controls: Letters are typed, and every letter key is the game's

A letter key, either case, or a letter button on the panel, SHALL enter that
letter at the selected slot of the working row, else at its first empty slot,
or, in Marks mode, rule it out of the selected answer slot or back in. Every
letter key SHALL be consumed while the game is in play, even where the row
has no room for it, so that no letter falls through to the app's one-letter
shortcuts.

#### Scenario: A letter on a full row deals no new game

- **WHEN** the working row is full and N is typed
- **THEN** the key is consumed and the row is unchanged

### Requirement: Controls: A full row takes no more letters

A letter typed onto a full row SHALL be declined, whether or not the row may
go, unless the player selected a slot of it to change.

#### Scenario: A letter past a row that is no word changes nothing

- **WHEN** the working row spells CRANX and E is typed
- **THEN** the row still spells CRANX; and when its last slot is tapped and K
  typed, it spells CRANK

### Requirement: Controls: The panel is a keyboard

The panel SHALL lay the letters out in QWERTY rows, with Submit and Clear
flanking the last row.

#### Scenario: The last row

- **WHEN** the panel is shown
- **THEN** its last row is Submit, Z X C V B N M and Clear

### Requirement: Controls: Enter submits and never switches Marks mode on

Enter SHALL submit the working row when it may go, wherever the frame is. A
full row that may not go SHALL be refused: nothing is submitted, the row is
framed as refused until a letter of it is typed or rubbed out, and the status
bar says why. A row with an empty slot SHALL be declined. In Marks mode Enter
SHALL switch back to typing. Submit on the panel SHALL do the same as Enter
while typing.

#### Scenario: Enter on a row that is no word

- **WHEN** the working row spells CRNAE and Enter is pressed with the frame
  on a slot
- **THEN** no guess is submitted, the row is framed as refused, and Marks
  mode stays off

### Requirement: Controls: A tap selects a slot of the working row or the answer row

A tap on a slot of the working row SHALL select it and switch to typing; a
tap on an answer slot SHALL select that slot and switch to Marks mode. The
selection SHALL be made on the press, and the release SHALL do nothing. Clear and Backspace SHALL rub out the
selected slot, or the last letter typed, and in Marks mode SHALL put every
letter of the selected answer slot back.

#### Scenario: A tap on an answer slot then a letter rules it out

- **WHEN** the third answer slot is tapped and Q is typed
- **THEN** Q is ruled out of the third slot, and typing Q again puts it back

### Requirement: Controls: Wordguess remembers a half-written word across a save

The working row SHALL be saved with the game as its letters, `.` for an
empty slot (`cr...`), and SHALL be kept across a mark; a submitted or undone
guess SHALL empty it.

#### Scenario: A half-written word survives a save

- **WHEN** CR has been typed and the game is saved and reloaded
- **THEN** the working row holds CR, with the frame on the third slot

#### Scenario: A whole word brought back from a save goes

- **WHEN** CRANE has been typed, the game is saved and reloaded, and Enter is
  pressed
- **THEN** CRANE is submitted

### Requirement: Status bar: Wordguess says why a word will not go

The status bar SHALL count the guesses (`Guess 2 of 6`), add
`ready to submit` when the full working row may go, and otherwise the reason
it may not: that the word is not in the word list, or which revealed letter
hard mode keeps. A won game SHALL say how many guesses it took, and a lost
one the word.

#### Scenario: A full row that is no word

- **WHEN** the working row spells CRNAE on the first guess of six
- **THEN** the status bar reads `Guess 1 of 6: CRNAE is not in the word list.`

### Requirement: Look: A score is told by shape as well as color

A letter scored in place SHALL sit on a filled square, a letter scored
elsewhere on a disc, and a letter scored absent in faint ink on the bare
surface, so the score reads without color.

#### Scenario: Three kinds of score on one row

- **WHEN** CRANE is scored against CIGAR
- **THEN** C is drawn on a filled square, R and A on discs, and N and E in
  faint ink

### Requirement: Look: Each letter key shows its letter's best score

Each letter key SHALL show the best score its letter has had in any row, in
the board's picture of it: filled for in place, a disc for elsewhere, and
faint for a letter scored only absent, which the word lacks; a letter not yet
guessed SHALL be plain. A screen reader SHALL be told `in place`,
`in the word` or `not in the word` after the letter.

#### Scenario: A repeated letter is shown at its best

- **WHEN** LOLLY has been scored against HOTEL
- **THEN** the O key is filled, the L key has a disc, and the Y key is faint

### Requirement: Look: The answer row shows each slot's letters still possible

Each answer slot SHALL show every letter not ruled out of it, each in a fixed
place in four columns, with nothing where a letter is ruled out; a lost game
SHALL show the answer's letter in each slot instead.

#### Scenario: A ruled-out letter leaves a gap

- **WHEN** Q is ruled out of a slot
- **THEN** the slot shows every other letter in its place and nothing where
  Q was

### Requirement: Hint: Wordguess's hint places what the scores prove, then suggests a guess

The hint SHALL read only the scored rows, never the hidden word or the
player's marks. Its plan SHALL first rule out of the answer row each letter a
technique of the description proves out and the row does not already show,
one firing a step, striking the letters, striping the scored row it reads and
outlining the slots it leans on; then it SHALL end with a guess, ringing the
working row's squares it goes in. Each technique SHALL be checked sound
against the rules.

#### Scenario: A letter scored in place settles its slot

- **WHEN** CRANE is scored against MOUSE and a hint is asked
- **THEN** its first step rules every letter but E out of the last slot, and
  says the striped row scored E in place

#### Scenario: The same scores give the same plan

- **WHEN** CRANE is scored against MOUSE on one board and against HOUSE on
  another
- **THEN** the two hints are the same

### Requirement: Hint: The suggested guess is counted, not argued

The guess SHALL be a word the board accepts, a common word wherever one is
sure to find the answer in time, and its sentence SHALL name it and claim
only what was counted: how many common
words still fit every score, and the most the guess can leave whatever it
scores. A guess that does not fit SHALL say it can't win. Once no
common word fits, the words counted SHALL be every word of the list, and
the sentence SHALL say that no common word fits.

#### Scenario: A guess that cannot win

- **WHEN** the word that leaves the fewest standing is not one that fits
- **THEN** the sentence says how many fit, that the guess can't win,
  and the most it can leave

### Requirement: Hint: Following the hint wins on every preset

On every preset, a player who follows the hint SHALL find every common word
within the rows. Where few enough words still fit, the guess SHALL be one
from which a short search finds every one of them in the rows left, and that
search SHALL depend only on the words still fitting and the words the board
accepts, so that the hint asked again after the guess continues what it
found.

#### Scenario: Every answer is found

- **WHEN** every common word of each preset's length is played by applying
  the hint's plans until the game ends
- **THEN** every game is won

#### Scenario: A lost game has no hint

- **WHEN** a hint is asked after the rows are exhausted
- **THEN** the hint refuses, saying the game is over
