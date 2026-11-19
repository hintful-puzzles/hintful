## ADDED Requirements

### Requirement: Rules: A Wordtrail board is divided into words along lines between letters

A board SHALL be a grid of letters and dark squares, and word lengths that
sum to its letters. It SHALL be solved when the player's lines between
letters side by side divide the letters into paths, each spelling a word of
the word list, one for each listed length. A path MAY run beside itself, as
a U through a two-by-two block does. A cross SHALL count as no line, so
lines alone finish a board.

#### Scenario: The answer's lines solve the board

- **WHEN** on `4x3n2de:45,namedlgo3p` lines run G to L to A to N to D and P to O to E to M
- **THEN** the board is solved

### Requirement: Rules: A line runs one way, and a word reads the way its lines run

Each line SHALL run one way, from a letter to the next in reading order,
and a path SHALL spell its word read from its first letter along its lines.

#### Scenario: A word drawn backwards does not solve the board

- **WHEN** on the same board lines run G-L-A-N-D and M to E to O to P
- **THEN** the board is not solved, since MEOP is no word

#### Scenario: A division into pieces that are not all words does not

- **WHEN** on the same board lines join N-A-M-E along the top and D-L-G-O-P below it
- **THEN** the board is not solved, since DLGOP is no word

### Requirement: Rules: A mistake is a line the answer lacks or a cross on one it has

`findMistakes` SHALL report a line on an edge the board's one answer has no
line on, a line running the other way from the answer's, and a cross on an
edge it has one on. A cross the answer agrees with SHALL NOT be a mistake.

#### Scenario: A line joining the A of NAME to its M is a mistake

- **WHEN** on `4x3n2de:45,namedlgo3p` a line is drawn between the A and the M of the top row
- **THEN** that edge is reported as a mistake

#### Scenario: A line the wrong way round is a mistake

- **WHEN** on the same board a line runs from the D up to the N, where GLAND reads from the N down to the D
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
SHALL refuse a draw where an answer word read backwards is a guess, whose
direction no reasoning could decide. It SHALL keep a board only where the
ladder, capped at the tier asked for, finishes it and the tier below does
not, so that its one division into words of the guess list, each read one
way, is reached by reasoning alone.

#### Scenario: Every board dealt needs exactly its tier

- **WHEN** a board is dealt at any preset and tier
- **THEN** the ladder capped at that tier finishes it, and capped below it does not

### Requirement: Generation: Easy reasons one letter at a time, and Normal also by the lengths

Easy SHALL use the technique that reads one letter: the words that still fit
through a letter. No technique SHALL decide a line without its direction, as
a letter's one way on would, since a player can draw no such line. Normal
SHALL add the
words of a length: where the trails still fitting a listed length are as
many as the words of it, they are all of them.

#### Scenario: A Normal board needs the lengths

- **WHEN** a Normal board is dealt
- **THEN** the ladder without the lengths' technique does not finish it

### Requirement: Solver: The ladder is the description's, and Solve plays its answer

The solver SHALL be the ladder `wordtrail.description.yaml` states, run to
a fixpoint, and Solve SHALL play the lines of the answer it reaches, each
the way it runs. Every trail of letters that spells a word of a listed
length SHALL be dealt to the ladder with the board, which is how a technique
reads the word list; letters that spell a word each way round are two
trails.

#### Scenario: Solve finishes the board

- **WHEN** Solve is chosen on `4x3n2de:45,namedlgo3p`
- **THEN** the board is solved

### Requirement: Controls: Wordtrail draws as the engine's line drag does

Wordtrail's lines SHALL be the engine's directed lines. A press and drag
SHALL lay a line along each edge between the letters it passes, each running
the way the drag passed it, a rook move at a time, taking back the steps it
retraces over its end; a drag from a word's last letter SHALL carry it on,
and one ending on a word's first letter SHALL join onto its front. A right click
SHALL cross an edge or clear its cross, and a right drag SHALL cross each
edge it passes.

#### Scenario: A drag lays a line through the letters it passes

- **WHEN** on `4x3n2de:45,namedlgo3p` a drag runs from the N to the A and down to the L
- **THEN** lines are laid from the N to the A and from the A to the L

#### Scenario: A fragment drawn first is joined at its front

- **WHEN** on the same board a drag draws A-N-D, and a second drag runs from the G through the L to the A
- **THEN** the lines read G, L, A, N, D, and the list writes GLAND

### Requirement: Controls: A click and the keys lay a line with its direction

A left click near an edge SHALL lay a line carrying a word on where it is
beside a word's end, and otherwise pointing right or down; a click on a line
pointing right or down SHALL turn it round where it fits so, and otherwise
lift it. The keyboard SHALL be the engine's: the arrows move a cursor, Enter
starts and ends a line the arrows carry, Ctrl with an arrow lays a line
pointing the way the cursor moves, and Shift with an arrow crosses that edge.

#### Scenario: A click lays, turns, then lifts a line

- **WHEN** on `4x3n2de:45,namedlgo3p` the edge between the N and the A is clicked three times
- **THEN** a line runs from the N to the A, then from the A to the N, then there is none

### Requirement: Controls: A dark square takes no line, and a word ends at two

A drag SHALL stop at a dark square, at a cross, where a letter already has
its two lines, and where a letter would get a second line in or a second
line out. An edge beside a dark square SHALL take nothing a click or key
asks of it.

#### Scenario: A drag into a dark square stops

- **WHEN** a drag runs from the L of the middle row down into the dark square below it
- **THEN** no move is made

### Requirement: Hint: A step rings the edges it decides and outlines or stripes what it reads

Each step SHALL ring every edge its move decides, between the two letters
and clear of both, and draw each line it asks for with its arrow, the way
the word reads. A step that reads one letter SHALL outline it; a step that
reads the words of a length SHALL stripe their letters. Its sentence SHALL
say why those edges are forced, from the board, in no more than 120
characters, and SHALL name the words it reasons from, in capitals, where
they are one or two.

#### Scenario: The one word through a letter

- **WHEN** one word, PAVILION, still fits through a letter and decides edges
- **THEN** the hint outlines the letter, rings those edges, and says "Only PAVILION still fits through the outlined letter, so these edges must be as shown."

#### Scenario: Two words through a letter agree

- **WHEN** two words, AVION and PAVILION, still fit through a letter and run along or away from the same edges
- **THEN** the hint outlines it, rings those edges, and says "Only AVION and PAVILION still fit through the outlined letter and agree on these edges, so they must be as shown."

#### Scenario: More words through a letter agree

- **WHEN** three or more words still fit through a letter and run along or away from the same edges
- **THEN** the hint says "Every word that still fits through the outlined letter agrees on these edges, so they must be as shown."

#### Scenario: The only word of a length

- **WHEN** one trail still fits the one six-letter word listed, FRIDGE
- **THEN** the hint stripes its letters and says "The striped letters spell FRIDGE, the only 6-letter word that still fits, so these edges must be as shown."

#### Scenario: The only two words of a length

- **WHEN** two trails still fit the two eight-letter words listed, INITIATE and REACTION
- **THEN** the hint says "The striped letters spell INITIATE and REACTION, the only 8-letter words still fitting, so this edge must be as shown."

### Requirement: Hint: The techniques are tried easiest first, and decide only what is forced

The hint SHALL try the words through a letter, then the words of a length,
and SHALL take the first that fires. A line SHALL be decided only with its
direction, where every fitting word reads the same way along it. The words through a
letter SHALL cross an edge only where it ends every fitting word there and
the letter is not yet filled, so the board carries no cross a player would
not need.

#### Scenario: A plan leads a dealt board to its answer

- **WHEN** the hint is asked again and again on a dealt board and each step is applied
- **THEN** the board is solved, and no step lays a line the answer lacks or runs one the other way

### Requirement: Look: The letters sit on discs over the lines, and the words drawn fill the list

Each letter SHALL sit on a disc of its square's surface drawn over the
lines, so a line shows only between letters. A piece of lines that spells a
word of the guess list, read the way its lines run, SHALL color its squares,
and the list of lengths below the grid SHALL write each such word into a
slot of its length as it reads. A closed loop or a piece longer than the
longest length SHALL be drawn in the error color.

#### Scenario: A word drawn is written into the list

- **WHEN** on `4x3n2de:45,namedlgo3p` lines run P to O to E to M
- **THEN** POEM is written into the list's four-letter slot

#### Scenario: Letters that are not yet a word stay out of the list

- **WHEN** lines run only P to O to E, or M to E to O to P
- **THEN** the list is empty

#### Scenario: A word is written the way it was drawn

- **WHEN** on `3x2n1de:3,pis3` lines run S to I to P, and on another such board P to I to S
- **THEN** the first writes SIP into the list and the second PIS

### Requirement: Look: Each line wears the engine's arrow, and a word's first letter its start mark

Each line SHALL be drawn as the engine's arrow, a thin shaft and the head
filling the gap between the two letters' discs and pointing to the next
letter, the drag's preview and a hint's asked lines included. A line the drag
would lift SHALL be a plain stroke in the drag's removing ink. A letter with a
line out and none in SHALL wear the engine's start mark.

#### Scenario: A word's start and direction are drawn

- **WHEN** on `4x3n2de:45,namedlgo3p` lines run P to O to E to M
- **THEN** each of the three lines has its arrowhead pointing on toward M, and the P is ringed
