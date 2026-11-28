## Context

Filed 2026-11-28 by `born-candidate-note-family-rest` at its archive
(`fd9ed95f9`, this change's baseline), whose design.md § "Decisions" 1
split the nine games it was filed with: the four Latin squares moved, and
these five need what none of those did. Its gap list, read at `0b0727c9d`
(its design.md § "The gap list (1.1)"), was read again for this change at
the baseline, with every remaining group's, in the route's
`describe-the-whole-catalog/gaps.md` § "The last candidate-note games".

## Goals / Non-Goals

**Goals:**

- Every game of this change played from its description, its directory
  holding no TypeScript but tests.
- The family judged by `docs/descriptions.md` § "Judging a family moved
  onto its description", against a worktree of the baseline.

**Non-Goals:**

- Answers on edges or partitions: the regions group's (route 1.3). Map's
  answer is a value a part, not a partition, so it is this change's.

## The rules

The predecessor's design.md § "The rules" and the route's design.md
§ "What every group does", unchanged: a game a commit, run in the app
before it is done; every capability adoptable, tested on a fixture of its
own; a game may change to fit the engine, never significantly worse, each
difference listed in its flip's task and in § "What each flip changed for
a player"; a flip moves the game's tests to its `cases.yaml` and updates
the guides for what it added.

## The gap list (1.1)

`gaps.md` § "The last candidate-note games" is this change's gap list. It
was read at the baseline, and no file under `src/`, `scripts/` or `docs/`
has changed since (`git diff --stat fd9ed95f9 -- src scripts docs` is
empty at 1.1), so it stands as read. Each flip reads its game's entry
again against the tree it starts from, since every flip before it adds to
the engine, and records in its task what it found met that the list called
new.

## Decisions

### 1. Subsets joins, fifth (1.1)

`gaps.md` § "Placement" sends Subsets here: a value a cell with candidate
notes and no partition, which is this family's shape, not the regions
group's (its `produces: regions` is the description's sort and moves with
it). No later change takes candidate-note games, so leaving it out would
strand it in a group whose engine work (an answer on edges or a
partition) it never uses. What it needs that the five do not (a value
shown as a set of letters, each marked present, absent or unknown; a band
of every value for ruling out and a spotlight; the horseshoe painter) is
its own, and what it shares (marks on a board that is not a board of
numbers, a clue at a board, the spotlight Dominosa also wants) the earlier
flips will have built. It goes after Magnets and before Map, so that Map,
the one flip that needs a new kind of space, is last and the cell-board
games are done before it starts.

### 2. The order (1.1)

`gaps.md`'s, with Subsets placed by 1:

1. **Undead**: the widest shared set (painted values with notes, a clue
   at the board derived from the sample, a clue value dealt at random,
   clockwise slots, settings by tier).
2. **Crossing**: on Undead's board clue, as a list struck as used; walls
   dealt apart from the answer.
3. **Rome**: on Undead's painted notes; adds directional input and a
   partition merged on the answer.
4. **Magnets**: whole-part moves and marks, the domino tiling; on
   Undead's painted notes and its margins.
5. **Subsets**: § 1.
6. **Map**: a space whose cells are a partition's parts, last.

The proposal's order (Undead, Rome, Magnets, Crossing, Map) put Crossing
fourth; `gaps.md` moved it second because it reuses Undead's board clue
at once, and the predecessor learned that the share of a flip met by what
is built rises within a clue universe (its § "The rules").

### 3. Where this change may split

Six games and some 19,900 lines. If the engine work of the first four runs
long, Subsets and Map go to a successor filed at that point, as the
predecessor split its nine; the decision and its reason are recorded here.

### 4. Undead is a board of numbers drawn as pictures (2.1b)

Undead's input is a typed board's: a square selected, then a monster
typed, pressed on the counts or written as a note, which is what
`play.numbers` gives, notes and their preferences included. A board of
buttons given notes would have built a second note-taking input beside
the one every candidate-note game already shares. So a board of numbers
gains pictures (`play.numbers.pictures`): each value drawn by a painter,
and a preference, named by the description so Undead keeps its key
(`monsters`), drawing the glyphs instead, `A` switching it as upstream's
does. Rome's arrows and Magnets' poles are the next to adopt it.

Picture notes fill the square two by two, as upstream undead.c's do, and
not the box a hint's ring keeps clear for text: that box drew them at three
fifths of upstream's size. A ring goes round a picture's cell over it, as
it goes round any piece, and as the hand-written Undead's does.

### 5. Undead's mirrors are two values only the deal places (2.1c)

A mirror's way is drawn by its painter (`fall`, `rise`), so the answer
gives `\` and `/` a value each, as Tents gives its trees and Light Up its
walls one, and the mirror clue fixes the cell (`value(at) = v + 3`). The
alternative, one mirror value drawn from its clue, would have needed a
second way of drawing a given cell beside `play.given`. A board of numbers
takes `play.given` (the engine catalog's `pieces/` section says what
follows from it), and the deal's first cells, two values now, are each one
of them at random: the mirror clue is derived from the answer as any clue
is, and no clue value is drawn at random apart from the answer.

### 6. Undead's deal is upstream's, its steer a sample's (2.1d)

The description (`undead.description.yaml`, a draft in this change until
the flip, as Salad's was) deals as upstream
undead.c's `new_game_desc` does: a mirror on a square in five each way,
the layout drawn again outside 0.48 to 0.78 monsters or with a sightline
longer than the tier allows; sightlines filled first, the shortest first,
each with a filling its two numbers single out, until the tier's share of
squares is left (Easy 2, Normal min(w + h, n / 2), Unreasonable the max);
the rest at random; a board of one kind of monster, or at Unreasonable one
of a kind, drawn again; Easy graded by its passes.

Without the steer, random monsters made a 6x8 Easy about once in fifty
builds: 0.2 to 7 s a deal. With it, ten deals each under vitest on a busy
machine, in ms (the hand-written generator's in brackets): 4x4 Easy 0 to 5
(1 to 6), Normal 1 to 32 (1 to 25), Unreasonable 0 to 12 (1 to 13); 5x5
0 to 1 (0 to 2), 1 to 20 (0 to 18), 1 to 14 (1 to 47); 6x8 1 to 2 (1 to 8),
2 to 87 (3 to 114), 2 to 126 (2 to 545). The steer is stated by the
concept it uses, sightlines through a kind's cells read at both ends, so
another game whose clues look along sightlines takes it as it is.

### 7. Crossing's walls are joined and symmetric, and four shapes have none (2.2c), for the owner

`openspec/specs/crossing/spec.md` says a dealt board's open squares are
joined and no 2x2 block is all walls, and the symmetric-walls setting says
the walls are the same turned half round. Upstream's opening, which the
hand-written generator copies, keeps neither promise every time: it lays
squares it never opens, so a fifth of 7x7 openings never join and are dealt
as they stand (about one dealt 7x7 in twenty is apart), and it lays one
square of a symmetric pair, so a tenth of symmetric 7x6 boards come out
asymmetric. Both are measured 2026-11-28. The engine's opening
(`deal/opened.ts`) keeps both: an opening that never joins is begun again,
and a square laid lays its orbit. The presets are unaffected: the number of
draws a deal takes is unchanged at 11x13, 15x15S and 9x11 Unreasonable.

The cost: some symmetric Custom sizes have no board at all. A board two
squares wide whose length is even (2x4, 2x6, 2x8, and turned) has no joined
symmetric layout: its middle block must hold one of its two pairs of
partners open and the other walled, which leaves two open squares on a
diagonal with no way round. A symmetric 4x4 has two joined layouts and no
board with one answer on either. Today the game deals those sizes, each
board breaking one of the two promises.

**The owner's call, asked at 2.2c**: (a), recommended, keep both promises
and refuse those sizes in the Custom dialog with a sentence, so the
setting means what its help says; or (b) keep upstream's opening, and
correct the spec and the help to say what it deals. The hand-written game
is left as it was until the answer; the flip (2.2f) needs it, and 2.2d and
2.2e do not.

Besides the answer, the flip needs: the draft's `play.along` gains
`panel: { record: number, site: run }` and its `words:` `value: digit`,
which the panel's headings read, and `src/games/crossing/numbers.ts` goes
with the game. Crossing's draft techniques were checked sound with two
records, which no board answers (`docs/solver-and-generator.md`, the
records bullet); check them again, now a record a line. The draft deals
once it has `play:` (with `marks:` and the walk's steps, which its bespoke
`steps:` then refuse until restated, and `along:` with the hand-written
keys `auto-advance` and `highlight-runs`); its `blank` clue is then
`play.given` at 10, painted `wall`, as the `opening` fixture's. Weigh
§ "Decisions" 8's two hint behaviors there.

### 8. Typing goes along the sites the deal reads the list off (2.2d)

Where a record of the list may be written, and where the selection goes as
a value is typed, are the runs the deal reads each number off. So
`play.along` declares only the two preferences, and the sites are the cells
each binding of `deal.records` reads (the compiled `recordSites`), never a
second statement of what a run is that could drift from the deal's. Its
way is a row's or a column's, read off each site's cells, so a site that
bends would still be typed along in its order; none does yet. A record's
fit is read off the values alone, as the hand-written game's is
(`openspec/specs/crossing/spec.md`, "A clue's availability is decided from
the player's entries alone").

The preview colors are the hand-written game's: blue and orange bold each
way with paper ink on them, and its ghost gray, now the shared palette's
`previewInk`. A held record's box is the list site's.

Left to the flip (2.2f), which reads them against the hand-written game:
its hint is dismissed by a press outside the squares it is about
(`hint.uiUpdateClears`), where an engine board keeps a hint through any
press; and its `keepTrack` follows a whole-run step typed a digit at a
time.

### 9. The Numbers panel is the list's, in the description's words (2.2e)

The panel is declared by what a record and a site are called
(`play.along.panel`); its title is the record's plural, a heading's member
is `words.value` and a square `words.cell`, so a description writes two
words and no sentence. What it calls fitting is `AlongInput.fits`, the
test `take` writes by, and a pick is `take`, so the panel cannot offer a
number the list's press would not write. Placed and broken are the list's
strike and red (`recordHolds`, the live errors). A number no site can read
is broken, by the rules, before it is ruled out, as in the hand-written
panel; ruled out is left for one that fits no site through the selection.
The hand-written hint names no number to the panel (`HintStep.reference`),
and neither does the engine's yet.

### 10. Rome's arrows are pieces that point, and are played by their way (2.3a, 2.3b)

Rome is a board of numbers drawn as pictures with no preference: its
values are arrows and nothing else reads them (2.3a). A painter that
points (`Painter.points`) is what places its note on its side and what
chooses a value by direction, so the drawing and the input read one
statement; the description's `to` stays the rules' (where an arrow leads),
which Rome's cases check agrees with the painters.

The input, 2.3b's plan read against `4aef22eaf`, keeps upstream's and the
hand-written game's controls, so no control changes for a player:

- A board whose every piece points is played by a drag on the shared
  select-or-drag gesture (`note-taking-cell.ts`, the arms Rome's and Map's
  hand-written input use): a press commits nothing, the drag is `ui.drag`
  (a board of numbers keeps no other), its way the dominant axis from the
  pressed square to the one under the pointer, none back on it; a release
  with a way sets the value whose piece points so (right button or notes
  mode: toggles that note), back on the square clears it, and one that
  commits nothing is `tapNoteTakingCell`. A way the cell's domain does not
  hold reads as none. The preview is the numbers input's `previewed`, the
  render's existing hook, so the live errors read the dragged board.
- Keys: `glyphs.ts` gives a pointing board's values the numpad digit of
  their way (8 up, 2 down, 4 left, 6 right) as `keyCode` and `typed`, and an
  arrow as each key's `label`, so the keypad, typing and the hint's gesture
  agree. Enter arms the selection for an arrow key (`ARMED`, drawn as a `?`
  in the entry color), Space for a note on an empty square (the `?` in
  pencil) or clears where it is armed already; on this board Enter does not
  toggle notes mode, which the Marks key (P) does, as in the hand-written
  game.

Built so in `pointing.ts` (2.3b). Left to the flip (2.3e), weighed against
the hand-written game: a drag toward a way the square's domain lacks (off
the board's edge) reads as none, which the `pointing` fixture's Latin
domain cannot show, so Rome's cases check it; the hint's gesture is a tap
and the way's digit key, where the hand-written one dragged; its ring does
not keep clear of an armed `?`, as the hand-written one's did
(`squareText`); and Rome's hint says a value with a verb ("it must point
up", "the up marks in it"), the hand-written vocabulary's `be` and `note`,
which a born game's `words:` does not yet carry.

### 11. Rome's two shadings are highlights the player switches (2.3c)

The squares already leading to a goal and the squares caught in a loop are
an aid to reading the board, not a rule, so they are not `play.wash`, whose
washed cell the live errors and the hint read as holding the secondary
value. `play.highlights` lists them, each a formula over a cell on the
values as they stand, a paint (the goal's wash, or the mistake's, which the
hand-written game uses for the two) and a boolean preference with its
default, so Rome keeps its keys (`goal`, on; `loop`, off). Built on
`pointing` (arrows leading off the board; loops). A highlight is kept in
an overlay lane of the tile cache, not in a tile word, whose bits are all
taken.

Left to the flip (2.3e): the draft's `noLoop` is a rule its live errors
read, so a born Rome marks a loop's arrows in error whatever the loop
preference says, where the hand-written game showed a loop only with it on.
The flip weighs whether the preference still earns its place beside that
(`docs/rendering.md` § "Live errors are the rules'": what the rules make
certain shows).

### 12. Rome's goals are a build's fallback, its areas merged by its rules (2.3d)

Upstream rome.c lays an arrow a square, its Easy solver run after each,
and a goal on any square the solver leaves no arrow, at most one in 25
squares (or one) or the board is drawn again; then it joins neighboring
regions, the pairs of squares in a random order, wherever the two hold no
arrow alike and neither is a goal. The build states the first as
`sample.fallback` (a value, outside the domain if need be, and its `most`),
since Rome's domain gives 5 only where a goal's clue is, which a build
never reads. The second is `deal.merge`, whose join rule is no rule of its
own but the game's: two parts join wherever the answer is still an answer
with its clues derived on the joined partition. An area's distinct arrows
are Rome's shape, and a goal stays alone because its clue's meaning says
so; a stated join rule would have been a second copy of both. While the
answer is built the partition is a cell a part, as upstream's regions are.

Each try derives and checks the whole board, where upstream's join reads
two masks: a 10x10 merges in 8 ms on the `merging` fixture, a quarter of
its deal, and it grows about as n^1.6 (1.2 ms at 6x6, 3.7 at 8x8;
2026-11-28). A Custom 100x100 would pay seconds here, which § "A Custom
size is not refused for its wait" of `docs/solver-and-generator.md` allows.

Left to the flip (2.3e): upstream's cluster steer (`rome_join_arrows`,
which avoids an arrow growing a run of three alike) is not built; the flip
weighs it by the areas the born deal makes against the hand-written ones.
`mergeNeighbors` loses its one user with the hand-written generator. The
draft's notes become `set of range(1, 5)`, as the compiler holds notes to
the domain's values, and it words the walk's `clean` and `cull`.

### 13. A value said with its verb, and a part that holds every value it can (2.3e)

Rome's arrow is not "an up": a square points up. `words.be` names the verb
a square takes a value by, and with it a value is said with no article
("it must point right", "can only point down or right"); `words.note`
names what a struck value is called ("the struck left mark must go").
Both are words, so another game whose values are ways or states takes
them with no code.

A distinct partition's part holds every value only where its squares can
take no more values between them than it has squares: Rome's area of
four, or a smaller one at the board's edge. The walk already finds a
hidden single there (a part's `holdsEvery`, read off its cells' domains);
what it lacked was a sentence that says why the part must hold the value.
`PART_STEPS.hiddenSingle` is that step, worded by the description with the
part striped and its size as a term, and asked for only where a
description has distinct parts and the step. The library's line sentence
("the only square in its area that can…") said the conclusion without its
reason.

### 14. Magnets' gap list, read against `7379eafb8` (2.4)

Met: the tiles as a dealt partition, the counts a line per value
(`per: value`), done marks on margin kinds (`done.ts`'s `marginKinds`),
the walk with no region, `deal.sample.build` with a value first
(`build.value`, `share`), the `S` flag and the tier letters. New, each a
concept another game takes:

- **A domino tiling as a divide** (`deal.divide`'s `dominoes`, upstream
  `laydomino.c`, which `engine/generate/laydomino.ts` already ports):
  Dominosa's too. With it, an ID segment writing a partition of pairs as a
  letter a cell, which way its partner lies (`L R T B`, `*` alone).
- **A count a value split across a line's two ends**: value 1's before the
  start, value 3's past the end, and a value the rules derive (the neutral
  squares, the line less its poles) neither drawn nor written. With it, an
  ID segment of one character a line, no separator (the desc alphabet).
- **A part played whole**: a value placed in one cell of a part writes
  the part's other cells by a formula of it (`4 − d`), and a click cycles
  the part through its values from the cell pressed (empty, + here, −
  here). Dominosa's pair and Map's region want the same address.
- **Pole painters**, + and −, and the neutral square's.
- **The notes**: Decision 15, the owner's.

### 15. Magnets' notes (2.4), for the owner

Today the player marks a tile `?`, a magnet either way round, and nothing
else; the hand-written hint strikes a pole from a square where the board
already rules it out and never shows that strike, re-reading it from the
board when a later step cites it (`reading.ts`, `speak.ts`: 611 lines). A
born hint is the candidate walk, whose every fact is a note the player can
make (`docs/hints-candidates.md`).

**The owner's call**: (a), recommended, candidate notes on every square as
on Undead and Rome, + and − and neutral drawn small, with the right
button's `?` kept as neutral struck from both ends of a tile and drawn as
one `?` across a tile whose ends both hold just + and −; the hint then
strikes a pole as a step the player can repeat ("Beside a +, this end
can't be +"), so it teaches with marks the player has, at the cost of more,
smaller steps (measured at the flip against the hand-written walk); or (b)
keep `?` the only note, and the engine gains a strike the board already
shows, made by the walk and never spoken, which only Magnets would use now.
2.4a to 2.4c and the painters do not wait on it.

### 16. Subsets' gap list, read against `0cb9604be`, and its notes (2.5)

Met: a given value, the horseshoes as an edge clue of three values drawn in
the gaps (`play.gaps`), every clue shown (`complete`), the walk with no
region (Magnets'), and the tier letters. New, each a concept another game
takes, each on the `holding` fixture (a 2x2 board of the four sets of two
letters, Subsets' shape at its smallest):

- **A horseshoe painter** (`shoe`), for a clue valued by which end holds
  the other: its open side to that end, and a cross where two neighbors
  with none break the rule (upstream subsets.c's).
- **A value drawn as its features**: each value a set of features in fixed
  slots of its cell (a set's letters, `bits(d - 1)`), the slot drawing its
  feature where every set the cell can still hold has it, a cross where
  none has, and nothing between. A slot press marks the feature present,
  absent or unknown by striking or giving back the half of the cell's sets
  that lack or hold it, and a cell down to one set holds it.
- **A band of every value** beneath the board, each struck where it is
  placed: a press spotlights the cells a value can still go in, and with a
  cell in focus (a badge above it) strikes the value from that cell
  instead. Dominosa wants the spotlight.
- **A sample of every value once**, shuffled over the cells.
- **Upstream's ID**: a token a cell, the set's number or `_`, then the
  letters (`U R D L`) of the horseshoes opening at it.

**The notes are the cell's candidates, and the letters a view of them.**
The hand-written game keeps two notations, the letters and the sets ruled
out, and reads a cell's candidates as their meet. A born board keeps one:
its notes are the sets a cell can hold, every open cell's full from the
deal, and a letter shows what they agree on. The alternative, a second
notation of features beside the notes, would have been a mark only Subsets
reads, which the walk, the mistake check and Mark-all would each have had
to be taught. What changes for a player, listed again at the flip:

- A letter shows once every set left in the cell agrees on it, so ruling
  sets out in the band can decide a letter, and the last set left decides
  the cell, where the player marked the letters by hand.
- Turning a letter back to unknown gives back every set of the other half
  the cell's other letters allow, a set ruled out in the band among them.

### 17. Full notes are settled after every move (2.5b1)

A board whose notes mark says `full` keeps every open cell noted, so the
walk, Mark-all and the mistake check read it unchanged, never meeting a
cell with none. One step after every move (`settleFullNotes`) keeps the
promise for every kind of move at once: a cell left one note holds that
value, a cell whose value was cleared takes its whole domain back, and a
strike that would leave an open cell nothing leaves it as it was. That
last one is because an empty set of notes is the one state the shared
readers take for never noted (`impliedNotes`, `anyEmptyLacksNotes`), and
on such a board only a contradiction reaches it (Mark-all's clean around
two wrongly placed sets), which the mistake check shows anyway. A walk's
strike that leaves one set places it, so the walk owes no single after it.

### 18. A value's features are a board of numbers' drawing, over full notes (2.5b2)

`play.numbers.features` names a formula of `d` (Subsets' `letters(d)`,
compiled to `featuresOf`) and a letter a feature, and a square of such a
board is drawn as its slots alone, in place of its glyph and its notes: a
second notation beside them would be the one Decision 16 refused. Its
slots are a grid as near square as holds them, filling the cell inside a
hint's band, as a picture's notes do. The compiler refuses features over
notes not kept full, where an unnoted square would read as agreeing on
every letter, and beside raised, lettered, pictured or empty-square
drawing.

### 19. A feature is pressed on its slot, and nothing is typed (2.5b3)

A board of features is played as the hand-written game is: its targets are
slots (`features.ts`'s `targetVerbs`, which the help's Controls paragraph
reads), the press is at once a move, and the cursor walks the slots of
every square as one grid. The verbs are `subsets/index.ts`'s, the words
said of a square's set rather than a cell's. A slot's three states are read
off the notes, so its move is a note move: present and absent strike a
half, undecided gives one back, each the canonical strike or add a hint's
track reads (2.5b4's gesture is then a press). Going straight from present
to absent both strikes and gives back, which no note move does, so an edit
may write a cell's notes whole (`Edit.notes`); so does a press on a placed
square, which clears it.

Nothing on such a board is typed, as a value or a note, so it has no
keypad, no pencil mode, and none of the preferences that act on typing:
sticky pencil, keep highlight, and auto-pencil, which strikes a typed value
from its peers and would strike nothing here. The value a square settles to
is placed by `settleFullNotes`, which no preference reaches; 2.5e weighs
whether a set settled should strike itself from the other squares.

### 20. A mistake is shown on its slot, and a hint's strike is pressed on slots (2.5b4)

Check & Save on a board of features names the slots a square's value or
notes decide against the answer (`FillMistake.slots`) and draws them red,
as the hand-written game draws a wrong letter, with no outline; a square
whose notes leave its answer out with every slot undecided (a set struck
alone, which the band will do) has no slot to show it on and keeps the
outline. Clearing gives such a square its whole domain back (an edit's
`notes`), since a square's notes cleared to none would settle back to what
they were (Decision 17). Four features at most: the edge word's four
spare bits hold a square's wrong slots, upstream's four letters fill them,
and the compiler refuses a fifth rather than the tile growing a word.

A hint's strike is pressed on slots: each undecided slot pressed to present
or absent where the half it strikes is all the step's, which reaches the
strike exactly when it is a union of letter halves. Order does not matter:
a press strikes only what the step does, so a half that holds a set the
step keeps holds it to the end. The candidate track gains a strike of part
of a step's notes as a shrink of the step (it was off): a game's own track
sees each press as such a strike, and the mark-all control's clean, which
strikes a part of a step that strikes more, now keeps the hint on it too.
A strike that is no union, the walk's {A, B} struck alone, throws until
2.5c's band strikes one set from a square.

### 21. The band is laid as the list, and a placed value is gray, not struck (2.5c1)

`play.band` draws every value a square can hold beneath the board, laid by
the list's layout (`record-list.ts`'s `listPixels`) across the board's
width, gaps included: for Subsets' sixteen sets, four rows of four, as
the hand-written tally. A set is its letters with `_` for each it lacks, in
the fixed font. A placed value is gray and red where more than one square
holds it, as the hand-written tally's; it is not struck as a list's record
is, because a line through `__` reads as `=`, and the band's strike is
2.5c3's, what the square in focus rules out. The band is refused beside a
list or a row of counts, which are drawn where it is, and on a board not of
numbers, whose values have no glyph.

### 22. A spotlight is a highlight the band switches (2.5c2)

A press on a value of the band spotlights the squares that can still hold
it, its own square among them, and frames the value; a second press puts
it out, a press on another moves it. The spotlight is the last of the
board's highlights (`play.highlights`' lane and surface, one slot past
them, `GREEN_WASH` as the hand-written spotlight's green), so it needs no
layer of its own, and it covers a highlight beneath it, being what the
player asked to see last. A slot press keeps it, as the hand-written game
kept its spotlight: the player works the squares it shows.

### 23. A square is put in focus by its badge, and the band strikes from it (2.5c3)

Each open square has a badge, a ring in the gap above its top left, left
of the gap's clue, as the hand-written game's; a press puts the square in
focus (the badge filled) and puts out the spotlight, a second press takes
the focus away. With an open square in focus, the band strikes in the
player's ink each value its notes rule out, and a press on a value strikes
it from the square or gives it back: a note move, so undo, the walk and
the mistake check read it as any other, and a square left one value holds
it (Decision 17). The last value is not struck, as no note move strikes a
square to nothing. A placed square in focus strikes nothing: a press then
spotlights, and the focus goes, as the hand-written game's did.

The badge needs room above a square, which only a board with gaps has: a
board without them draws none, and its focus is 2.5c4's cursor's. The gap
a badge sits in is cleared whenever its clue is drawn again, so what the
gap shows is in the badge's key (`sites/badges.ts`), and the badges are
drawn after the gaps.

### 24. The keyboard enters the band, and a hint strikes on it (2.5c4)

Down from the board's bottom row of slots enters the band, onto its
column under the cursor, and puts the square the cursor left in focus, so
a board's keyboard reaches everything its pointer does; the arrows walk
the band as laid, Up from its top row goes back to the board, Enter or
Space presses a value as a click does, and Backspace gives a struck value
back. The band's cursor is the board's corners. A pointer's press takes
the cursor out of the band.

A hint's strike that no union of letter halves makes is made on the band:
each square put in focus by its badge, each value pressed, then the focus
the player had given back, since a gesture leaves the Ui as it found it
where it can. Every value a step strikes from any square, while a square
still holds it, is crossed out on the band, so a strike the letters cannot
show is still read off the board (first ringed, as a list rings a step's
target; Decision 26 says why it is crossed).

### 25. Every set once is a sample, and the ID is Unequal's record (2.5d)

The deal shuffles every value of the domain over the cells
(`sample.once`), as upstream subsets.c does; a uniform draw of sixteen
squares is a permutation once in some 880,000 draws, and a build would pay
the ladder for what a shuffle gives. A board whose cells number other than
its values has no such answer, and its deal throws.

Upstream's ID is upstream unequal.c's record a cell, read by the `records`
segment, which gains what Subsets writes differently, each a property of
the segment, not a kind: `hidden` (`_` for a square with no set given,
where Unequal writes 0), `from: 0` (a set counted from 0, one less than
its value, since the marks hold no value 0) and `closed: false` (a comma
between two records, not after each). A horseshoe is a clue valued 0 to 2
at every edge, 1 naming its first end and 2 its second, and the record
writes its letter at the end it names; the compiler reads that off the
kind (`endKind`), as it reads Adjacent's both-ends bar (`flagKind`), so the
description says nothing more. The draft's horseshoe is `range(0, 2)` for
it, as the fixture's, and its nine techniques were checked sound again.

For the flip: a set given twice reads, and the board is refused at load by
its answer check, as on every born board, where the hand-written reader
refused it as a number given twice.

### 26. Full notes keep what is placed out of every other cell (2.5e)

The weighed question of 2.5e is decided: yes. Notes kept full are dealt
without the values the givens rule out, and a value placed, given, the
player's or settled, is struck from every cell it rules out as it is
placed; a square left one value holds it at once. The hand-written aid's
`canHold` read placed sets out, and a board that kept them would ask a
player to strike fifteen squares by hand after every placement, which no
technique teaches. The walk follows the board: it has no populate, clean,
note, cull, regions-full or single step under full notes (`walkStepsOf`,
`candidateFillRungs`), and a strike that leaves its square one value
places it unsaid (the plan's `autoPlace`). Mark-all is not offered, since
there is nothing to mark, nor the hint-notes preference.

What follows from it, each held by a test: clearing a value gives its
square every value no square holds, and does not give the value back to
the squares its placing struck; a wrong placement strikes its value from
its own square, which Check & Save does not count again (the placement is
the one mistake, `noteMistakes`); and a hint's strike that leaves one value
decides the square.

The rest the flip needed:

- **A strike said as its presses.** Where every press goes one way, the
  step names them by letters ("A and D must be present", `pressesSaid`),
  of the notes still live when it is shown; a mixed strike names its sets.
  A set the description gives words to (`none: the empty set`) is said in
  them, with no second article, and struck as "the struck empty set".
- **The whole board is a part.** `distinct(value(c) over c in cells)` is
  the walk's `WHOLE_BOARD` part, so a set with one square left is a hidden
  single in the words the description gives a part's (`steps.hiddenSingle`).
- **A placement is a strike of the square's other notes** on a board of
  features, kept on track until the square holds the value.
- **No Marks key and no keypad.** A board of features' notes are pressed
  with no mode (`Game.notesWithoutMode`), which `takesNotes` reads, so the
  Marks key the pencil array asked for, inert on this board, is gone; the
  guard that found it inert keeps it out.
- **A params field with one value is no choice** (`isFixedField`): the
  Custom dialog leaves it out and the menu owes it no three boards, so
  Subsets' dialog offers the tier alone, as the hand-written one did.
- **A strike on the band is crossed out**, corner to corner in the value's
  own ink, as every strike is (`docs/hints-marks.md`): a ring is drawn only
  in the ring ink, which the ink guard refused for a strike. It is drawn
  while a square still holds the value, so a strike made leaves the band.
  The band's cursor is corners at the value's own box (`drawBoxCorners`):
  a square round a wide value reached past the band's area and stayed.
- **A square's letters keep clear of a ring round it.** A hint rings a
  square of features round all four letters, which sit in the part of their
  slot a ring keeps clear (`featureTexts`, as every cell's text keeps to
  `ringTextBox`), nudged toward the middle; the slots, lines and crosses
  fill the square as before, and a press and the cursor go to the letter.
- **The soundness check skips an order a grid side's bounds refuse.**
  Subsets' 3x3 places nine of sixteen sets, so `onlyCell` read unsound
  there; the check now asks a description only of the sizes it allows. It
  also drops order 3 for every description whose width starts at 4
  (Kakurasu, Norinori, Pearl, Seismic, Tracks, Tents, Unruly, Star Battle),
  which order 4 still covers.
- **The `holding` fixture gained `noShoe` and `smaller`**, with a plant,
  since its hint had no step left once clean was the board's.

### 27. A press that leaves the step keeps the Hint control's beat (2.5f)

The midend kept the step through a badge press, as it keeps one through any
change of what the Ui shows where the game names no `uiUpdateClears`, but
every press the game took sent the Hint control back to "Hint", whose press
then showed the same step again from where to look: on every game, a cursor's
move did the same. Of the three answers the task named, the step and the
control are kept together: the midend says what it has on display
(`hintShown`, the same number while the same step object is shown at the
same beat), the page records it when the beat moves on from show, and a key
or press that leaves it as it was keeps the beat (`tookManualInput`). A move
on track that refreshes the step, a move that puts it away, and a game whose
`uiUpdateClears` dismisses it all change what is shown, so they disarm as
before; an armed refusal shows no step and disarms too. Putting the step
away on a badge press was refused: the band's own hint gesture presses a
badge, and the player following the hint by hand would lose it.

### 28. Map's gap list, read against `1d7f2073b`, and its space (2.6)

Met: the four-color ladder and its `says`, given colors, notes with no
region and the candidate walk (Rome's and Magnets'), `n` as a number
setting, the search tier, a dealt partition drawn with walls (Rome's), the
select-or-drag gesture (Rome's `pointing.ts`), color keys and the shared
palette's pastels, the tier refusals as `refuse`. New, each a concept another
game takes:

- **A space whose cells are a partition's parts.** The cells the rules,
  the notes, the walk and the mistakes read are the parts, numbered in
  reading order of their first squares, as the compiled module already
  plays them (a store of `n` cells in one row, `describedSpace(units, n,
  1)`); the squares are where the board is drawn and pressed, each the cell
  of the part it lies in. `borders(c)` is the parts sharing a side with
  `c`, which the space reads off the partition: a relation the board deals
  is no longer stated beside the partition that already says it. The
  regions group's partition games are the next to read a part as a cell
  (Dominosa's pairs, Filling's areas).
- **Drawn over its squares**: each square painted its part's value, the
  borders between parts drawn, and upstream map.c's diagonal smoothing,
  seeded by the ID as upstream's is; notes as stipples over the part's
  squares; a hint's ring at the part's label point and its outline round
  the part; a mistake red on every square of the part; a live error at a
  point of the border two clashing parts share.
- **Played on its squares**: a press addresses the part under it, the
  cursor walks the squares and selects the part under it, and Map's drag
  carries a part's value (or notes) to the part it is let go on.
- **Regions grown from seeds** (`deal.divide`'s `seeds`, the engine's
  `growFromSeeds`), before the answer, which a build colors on the ladder.
- **A hide that keeps a value's last given** as the board stands, where
  `keep` reads the clues as dealt.
- **The ID**: upstream's edge list (a run of sides, letters `a` to `y`
  flipping, `z` 25 not), and the clue list in the shared run-length grammar
  over the parts; `n` defaulting to `w·h/8` where the ID leaves it out.
- **Its display preferences**, region numbers and stipple size, kept by
  their keys.

Each on a fixture of its own (`mapping`, a small grid divided into four to
nine parts), in the order the tasks give.

Upstream map.c splits some squares diagonally between two regions, but
only in drawing: its ID's regions are whole squares joined across the
sides its edge list leaves open, and the split is made from the ID when
the board is laid out. So a region is a set of squares, and the split is
2.6b's.

### 29. A part's sides are its partition's, and the board stores its parts (2.6a)

`space.parts` names the partition of the squares (`of`) and the size that
counts its parts (`count`); the params' `w` and `h` are the squares'. The
board stores the parts as one row of cells, as the compiled module already
played Map, so the values, the notes, the walk, the edits and the mistakes
need nothing new. The partition is a `Squares` (`describe-runtime`), which
holds its grid's size and its parts' sides, computed once where the
partition is made (the divide, the ID's `borders` segment); a relation
`sides` compiles to a read of them (`cl.map.sides[c]`). Putting the sides
on the clues beside the partition was tried first: every path that makes
clues (a deal derives them in six places, the ID in one) would have had to
add them, and the deal's first rules check met a board without them.

The ID is upstream's from this step on, since a fixture deals through its
ID: the `borders` segment is map.c's edge list, and the clue list is the
shared run-letter stream with `from: 0`, a color written one less than its
value, as map.c writes 0 to 3. Checked against an ID the hand-written
generator dealt (`mapping.test.ts`).

### 30. A board of parts is drawn by a renderer of its own (2.6b)

Read 2026-11-28: the fill renderer (`render.ts`, `render/tile.ts`) keys a
tile a cell, and every layer reads a cell as one square (`c % w`), so a
board of parts is drawn by a `FillRender` of its own over the squares (the
params' `w` by `h`), chosen where `deal.parts` is set, reusing the palette
and the hint mark primitives. The hand-written `games/map/render.ts`, and
`map-data.ts`'s `smoothDiagonals` and `computeLabelPoints`, are the
reference. Upstream seeds the smoothing with the ID; `encodeDesc` of the
board's clues writes the same ID, so a born board splits the squares the
hand-written one does. A square's key is its quadrants' parts' values,
notes, mistake, hint roles and selection.

Built (`parts-render.ts`, `render/parts-geometry.ts`): the geometry is
map-data.ts's, keyed by the partition and its parts' pairs in place of
Map's graph, and matched it on 240 deals of six sizes (607 split squares;
a wrong seed diverges on 231). The values are pictures
(`play.numbers.pictures`) whose painters, `pink`, `yellow`, `teal` and
`violet` (`render/pieces/four.ts`, `FOUR_FILLS`), are their surface alone,
with a note a dot in the color's mark: so the palette, the keypad's names
and a hint's words come from the painters as on any board of pictures, and
nothing in the renderer names a color. The dot formation is upstream's,
room for four values, and the renderer refuses a board of notes with more.
Selection, the hint's marks and the drag are 2.6c and 2.6d's; the region
numbers and the large dots 2.6f's.

### 31. A part is aimed at on its squares, and selected by a band (2.6c1)

The input keeps the stored cells: a board of numbers aims through a
`TargetGeometry`, the square grid's on any board and on a board of parts
`partsAim` (`parts-aim.ts`), whose target is the part at `(part, 0)`. So
the note-taking cell, the typing and a hint's gesture read a part as any
board reads a cell, and nothing beside the aim knows the squares. The
cursor's square, and the triangle it last moved toward, are the Ui's
`square`, which a press sets where it lands; a selection moved by anything
else (a hint's press) names a part the square may not, and the next arrow
walks from the part's label square. `numberInput`'s trailing sites, which
only `game.ts` passed, are one `NumberSites` now.

The band is the hand-written Map's (`games/map/render.ts`, "the selected
region"), in `render/parts-bands.ts`, with one difference: the note-taking
corner goes in the part's first square whose top left corner is the part's.
The hand-written puts it in the part's first square, where a split can give
that corner to another part and the corner is not drawn at all (the
fixture's region 3, whose first square is split so).

A key placing a value drawn as a color alone (`Painter.swatch`, the four
colors) is painted in it and labeled by the character it sends, as the
hand-written Map's keypad is, on any board of pictures.

A press selects, as on every typed board. The drag (2.6c2) makes it Map's
select-or-drag gesture: the press picks the part's value up, and a release
that carries nothing is the tap that selects.

### 32. A carry is a play key of any board of numbers (2.6c2)

`play.carry` (`carry.ts`) holds what a press picks up in the Ui (`carry`:
the value, or an empty cell's notes, and the pointer), and its release
makes the moves a key already makes: a typed value with auto-pencil's
strike, a note toggled, a clear, or an `Edit` writing an empty cell's notes
whole. So no move or save format is new, and the drop is checked against
the cell's domain as typing is. It runs beside `pointing.ts`, before the
press that selects, and refuses to share a board with another input that
spends the press and the drag (features' slots, pointing pieces, a
selection's shape, a record held along a list). It aims through the
board's `TargetGeometry`, so a square board takes it as a board of parts
does.

What is held is no cell, so it is a sprite under the pointer behind a
blitter (`render/carried.ts`, the hand-written Map's blob: a disc in the
value's surface, an empty cell's notes dotted in map.c's formation of four,
a grid beyond), drawn by both renderers from the palette's painters or the
glyph. The blob's anchor is not kept: the release reads the cell under the
pointer again, as the hand-written one does.

Two differences from the hand-written Map, for 2.6g's list: a press off the
board picks nothing up, where the hand-written one picked up an empty
region whose drop cleared the region (a press off the board is any other
input's on a square board); and Enter and Space do not pick a region up and
put it down, the keys typing a color at the selection as on every board of
numbers (the hand-written Map's keys did both).

## What each flip changed for a player

Filled in by each flip.

### Undead (2.1e)

- **Unreasonable is the search tier.** The hand-written game took a board
  its depth-1 forcing solved; the born one takes a board Normal cannot
  finish and the search proves has one answer, as every born game's top
  tier is. Its letter stays `t`.
- **The counts are beneath the board**, centered, and read in the player's
  style as before (Left/Total by default); a finished count is gray.
- **A press on a count no longer clears a square holding that monster**: it
  types the monster's key, as the keypad does, and typing a held value
  leaves it on every board of numbers. `E` no longer clears either; `0`,
  Backspace, Space and Delete do.
- **An ID with a monster fixed in its grid (`G`, `V`, `Z`) is refused.**
  Upstream's reader takes one; its generator never writes one.
- **An empty sighting reads as a clue the board does not show**, where the
  hand-written reader refused it.
- **The hint is the candidate walk's**: its words are the collection's
  ("Every other monster has been ruled out in this square, so it can only
  be a ghost"), a sightline is striped and its clues outlined, and struck
  monsters "must go".
- **No auto-pencil preference is offered**, as before, now because a
  placement rules nothing out on a board with no unit.
- **New Game deals 4×4 Normal.**

### Rome (2.3e)

- **Each area is washed in its own pastel**, and its walls are drawn as
  bars, where the hand-written board left the grid as the gaps between
  its squares' fills. A given arrow's square keeps the given's gray, so
  its area shows by its walls alone.
- **Boards carry about one given arrow more, in smaller areas**: on twelve
  6x6 deals a tier, 14.6 given arrows against 13.8 at Normal and 17.2
  areas against 15.8, alike at Easy and Tricky. Upstream's cluster steer,
  which keeps an arrow from growing a run of three alike, is not built:
  the boards it would change differ by a clue, and every one still has a
  single answer the tier's techniques reach. A deal costs about a third
  more work, and none takes 100 ms (`compare-cost`, 2026-11-28).
- **No control places an arrow pointing off the board**: a typed or
  on-screen key that would is no move, as a value outside its square's
  domain is no move on any born board. The hand-written game placed it and
  flagged it.
- **A loop is shown in error as soon as it closes**, whatever the loop
  preference says, as every born game shows what its rules make certain.
  The preference stays, with its key and its default (off): it is a
  setting a player may hold, and drawing a loop twice costs nothing.
- **The hint is the candidate walk's.** A note is a "mark", a square
  "points" a way, and each technique says why: a loop outlines the arrows
  that would lead back ("Pointing left, this square would meet the
  outlined arrows leading back"), an area that must hold all four arrows,
  or every way its squares can point, is striped, and a pair outlines its
  two squares.
- **An ID with a goal sharing its area, or an area of more than four
  squares, is refused** as a board deduction cannot finish, where the
  hand-written reader named what was wrong. Neither has an answer, and
  upstream's generator writes neither.

### Subsets (2.5e)

- **The presets read "4x4 Easy, 4 letters"** and "4x4 Normal, 4 letters",
  where they read "4x4 Size 4 Easy"; the IDs and params are as before.
- **A placed set drops out of every other square by itself**, and a square
  left one set holds it. A given set is in no square's notes from the
  start. The hand-written board left the player's letters as they were.
- **Check & Save counts a wrong set once**: the set it took from its own
  square is not a second mistake. A note mistake is cleared by giving the
  square back every set no square holds.
- **There is no Update marks button and no Marks key**: nothing is left to
  mark, and letters are pressed with no mode.
- **The horseshoes no longer rule anything out in the aid** by themselves;
  the spotlight and a square's struck sets read its notes, which the
  player's letters and rule-outs and the placed sets narrow. The help says
  so.
- **The hint is the candidate walk's**, a square at a time, worded in
  letters and sets: "This square's set holds its neighbor's, whose sets all
  contain {B,C}, so B and C must be present." A strike no letter says is
  crossed out on the tally. A walk is shorter: 30 and 40 steps on the
  presets' first boards, against 46 and 52.
- **A square's letters sit a little toward its middle**, clear of a hint's
  ring round the square.
- **An ID giving one set twice is refused as clues that contradict each
  other**, where the hand-written reader named the repeat.

## Risks / Trade-offs

- [Map's cells are a partition's parts] → a new space, built last, with
  its own fixture; nothing else in the route builds it.
- [Undead carries the most new capabilities] → each on a fixture before
  the flip, so a later flip adopts it without Undead in the way.
