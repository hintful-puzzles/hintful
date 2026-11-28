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

## Risks / Trade-offs

- [Map's cells are a partition's parts] → a new space, built last, with
  its own fixture; nothing else in the route builds it.
- [Undead carries the most new capabilities] → each on a fixture before
  the flip, so a later flip adopts it without Undead in the way.
