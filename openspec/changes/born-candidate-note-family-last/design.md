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
