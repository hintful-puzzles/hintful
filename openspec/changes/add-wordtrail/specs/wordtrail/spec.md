## ADDED Requirements

### Requirement: Rules: A Wordtrail board is divided into words along lines between letters

A board SHALL be a grid of letters and dark squares, and word lengths that
sum to its letters. It SHALL be solved when the player's lines between
letters side by side divide the letters into paths, each spelling a word of
the word list end to end, one for each listed length. A path MAY run beside
itself, as a U through a two-by-two block does. A cross SHALL count as no
line, so lines alone finish a board.

#### Scenario: The answer's lines solve the board

- **WHEN** on `4x3n2de:45,namedlgo3p` lines join G-L-A-N-D and P-O-E-M
- **THEN** the board is solved

#### Scenario: A division into pieces that are not all words does not

- **WHEN** on the same board lines join N-A-M-E along the top and D-L-G-O-P below it
- **THEN** the board is not solved, since DLGOP is no word

### Requirement: Rules: A mistake is a line the answer lacks or a cross on one it has

`findMistakes` SHALL report a line on an edge the board's one answer has no
line on, and a cross on an edge it has one on. A cross the answer agrees
with SHALL NOT be a mistake.

#### Scenario: A line joining the A of NAME to its M is a mistake

- **WHEN** on `4x3n2de:45,namedlgo3p` a line is drawn between the A and the M of the top row
- **THEN** that edge is reported as a mistake

### Requirement: Params: A Wordtrail params string may leave out its word count and its difficulty

Params SHALL encode as the width and height, `n` and the number of words,
and `d` and the difficulty's letter (`e` Easy, `n` Normal), as `5x5n4dn`. A
string without the word count SHALL decode to four words, and one without
the difficulty to Normal: the default board's.

#### Scenario: A bare size takes the default's words and tier

- **WHEN** `5x5` is decoded
- **THEN** it is a five by five board of four words at Normal

### Requirement: Params: Wordtrail refuses a board its words cannot fill

A board SHALL hold between six tenths (rounded up) and eight tenths (rounded
down) of its squares as letters, and between three and eight letters a
word. Params where no count of letters meets both SHALL be refused: as too
many words where three letters a word overfills eight tenths of the squares,
and as too few otherwise. A side SHALL be between two and eight.

#### Scenario: Five words are too many for four by four

- **WHEN** a four by four board of five words is asked for
- **THEN** it is refused as too many words for a grid this size

#### Scenario: Four words are too few for eight by eight

- **WHEN** an eight by eight board of four words is asked for
- **THEN** it is refused as too few words for a grid this size

### Requirement: Description: The lengths, a comma, then the letters with dark runs counted

A description SHALL be the lengths as a digit each, shortest first; a comma;
then the squares in reading order, a letter in lower case each and a run of
dark squares as its count. It SHALL be refused with no length, a length
outside three to eight, a stray character, squares too few or too many, or
lengths that do not sum to its letters. It holds no words: a board is judged
by the word list the app ships.

#### Scenario: A board reads back as it was written

- **WHEN** `45,namedlgo3p` is read for a four by three board
- **THEN** its lengths are 4 and 5, its last row is three dark squares and a P, and it encodes back to `45,namedlgo3p`

#### Scenario: Lengths that are not the letters' count are refused

- **WHEN** `46,namedlgo3p` is read for a four by three board
- **THEN** it is refused

### Requirement: Generation: A board's answer words are the answer list's, and its division is unique against the guess list

The generator SHALL lay a path for each length on a grid, write a different
word of the answer list along each, and darken the squares left over. It
SHALL keep a board only where the ladder, capped at the tier asked for,
finishes it and the tier below does not, so that its one division into
words of the guess list is reached by reasoning alone.

#### Scenario: Every board dealt needs exactly its tier

- **WHEN** a board is dealt at any preset and tier
- **THEN** the ladder capped at that tier finishes it, and capped below it does not

### Requirement: Generation: Easy reasons one letter at a time, and Normal also by the lengths

Easy SHALL use the techniques that read one letter: the one way on from a
letter, and the words that still fit through a letter. Normal SHALL add the
words of a length: where the trails still fitting a listed length are as
many as the words of it, they are all of them.

#### Scenario: A Normal board needs the lengths

- **WHEN** a Normal board is dealt
- **THEN** the ladder without the lengths' technique does not finish it

### Requirement: Solver: The ladder is the description's, and Solve plays its answer

The solver SHALL be the ladder `wordtrail.description.yaml` states, run to
a fixpoint, and Solve SHALL play the lines of the answer it reaches. Every
trail of letters that spells a word of a listed length SHALL be dealt to the
ladder with the board, which is how a technique reads the word list.

#### Scenario: Solve finishes the board

- **WHEN** Solve is chosen on `4x3n2de:45,namedlgo3p`
- **THEN** the board is solved

### Requirement: Controls: Wordtrail draws as the engine's line drag does

A press and drag SHALL lay a line along each edge between the letters it
passes, a rook move at a time, taking back the steps it retraces over its
end, as the engine's line drag does; a left click near an edge SHALL lay or
lift its line, and a right click SHALL cross it or clear its cross; a right
drag SHALL cross each edge it passes. The keyboard SHALL be the engine's:
the arrows move a cursor, Enter starts and ends a line the arrows carry, and
Shift with an arrow crosses that edge.

#### Scenario: A drag lays a line through the letters it passes

- **WHEN** on `4x3n2de:45,namedlgo3p` a drag runs from the N to the A and down to the L
- **THEN** lines are laid between the N and the A and between the A and the L

### Requirement: Controls: A dark square takes no line, and a word ends at two

A drag SHALL stop at a dark square, at a cross, and where a letter already
has its two lines. An edge beside a dark square SHALL take nothing a click or
key asks of it.

#### Scenario: A drag into a dark square stops

- **WHEN** a drag runs from the L of the middle row down into the dark square below it
- **THEN** no move is made

### Requirement: Hint: A step rings the edges it decides and outlines or stripes what it reads

Each step SHALL ring every edge its move decides, between the two letters
and clear of both. A step that reads one letter SHALL outline it; a step
that reads the words of a length SHALL stripe their letters. Its sentence
SHALL say why those edges are forced, from the board, in no more than 120
characters.

#### Scenario: One way on from a letter

- **WHEN** a letter has no line and one edge left that can take one
- **THEN** the hint outlines it and says "The outlined letter has just one neighbor it can still join, so this edge must be a line."

#### Scenario: The words through a letter agree

- **WHEN** every word that still fits through a letter runs along or away from the same edges
- **THEN** the hint outlines it, rings those edges, and says "Every word that still fits through the outlined letter agrees on these edges, so they must be as shown."

#### Scenario: The only word of a length

- **WHEN** one trail still fits the one six-letter word listed
- **THEN** the hint stripes its letters and says "The striped letters spell the only 6-letter word that still fits, so these edges must be as shown."

### Requirement: Hint: The techniques are tried easiest first, and decide only what is forced

The hint SHALL try one way on, then the words through a letter, then the
words of a length, and SHALL take the first that fires. The words through a
letter SHALL cross an edge only where it ends every fitting word there and
the letter is not yet filled, so the board carries no cross a player would
not need.

#### Scenario: A plan leads a dealt board to its answer

- **WHEN** the hint is asked again and again on a dealt board and each step is applied
- **THEN** the board is solved, and no step lays a line the answer lacks

### Requirement: Look: The letters sit on discs over the lines, and the words drawn fill the list

Each letter SHALL sit on a disc of its square's surface drawn over the
lines, so a line shows only between letters. A piece of lines that spells a
word of the guess list SHALL color its squares, and the list of lengths below
the grid SHALL write each such word into a slot of its length. A closed loop
or a piece longer than the longest length SHALL be drawn in the error color.

#### Scenario: A word drawn is written into the list

- **WHEN** on `4x3n2de:45,namedlgo3p` lines join P-O-E-M
- **THEN** POEM is written into the list's four-letter slot

#### Scenario: Letters that are not yet a word stay out of the list

- **WHEN** lines join only P-O-E
- **THEN** the list is empty
