## Context

### What the two lists do today (run in the app, 2026-11-19)

**Crossing** draws its clue numbers under the grid, in two columns by
length. The list is an input surface (`docs/mechanics.md` § "An inventory
already drawn on the board is an input surface"): a click picks a clue up,
and a click on a run that can take it writes it in. There is no reference
panel, and nothing about the list counts as help. Everything it marks, it
marks by itself; the player cannot mark a clue by hand:

- A clue written into the grid exactly once is struck through and grayed
  (`colorClass` 1 in `crossing/render.ts`).
- A clue written in more than once is red (class 2).
- With a square selected for entry, and the `fit-highlight` preference on
  (the default), each clue a click would place is written in the color of
  the run it would go to (across or down, decided by `runForNumber`), and
  every other clue is grayed in the used-up color (class 3). Pencil mode
  and no selection leave the list in plain ink.
- A held clue is boxed, and the board shows every run it could go in.
- A displayed hint boxes the numbers it reasons over.

"Fits" here is local: a clue's length, the digits already in the run, and
whether it is used elsewhere (`crossing` spec, "A clue's availability is
decided from the player's entries alone"). It never asks whether a crossing
run can still be filled.

**Wordtrail**'s Dictionary is a reference panel (help-counted on first
show) listing, by length, only the common words that some trail on the board
spells, each placed, outstanding or ruled out, with "Fits" and "Found"
filters and a search box. On a 4×4 Easy board asking for two 3-letter words
and one 5-letter word it listed five words: NEW, OWN, SOW, WEB and SWISH.
The list is the board's own candidate set, so it is close to the answer.

**Wordguess**'s Dictionary, the owner's model, lists every answer word of
the length (1,399 at four letters) A to Z under letter headings, with one
"Fits" filter for the words every score so far allows.

The common list Wordtrail judges by holds 498 three-letter words, 1,966 of
four, 3,647 of five, 5,582 of six, 7,233 of seven and 7,281 of eight.

### The consultation (task 0.2)

A general-purpose agent briefed as a game designer and ludologist read the
proposal, the context above, both games' specs and screenshots of the three
lists. It was given no preferred answer. Its advice, in brief:

- **Wordtrail.** List the whole common list at each asked length, A to Z
  under letter headings. In Wordtrail the long list is a lookup ("does this
  game count SWISH?"), which matters because the game judges by its own
  common list; it is not something to browse. The board-only list gives
  away the finding, which is the puzzle. Not the answer list, which would
  narrow the field again.
- **Two rows that compose**: a length row, one choice per asked length and
  no "all lengths" (nobody wants 9,000 words in one list), and the status
  row; each button counted under the other's choice and the search. Not one
  row of combined choices.
- **"Fits" does hand over candidates**; let the help count be the cost, and
  do not weaken the filter.
- **Crossing, against the owner's starting point.** A paper Fill-In solver
  crosses a number off as it is written in; that is bookkeeping, and doing
  it by hand adds no thinking. The duplicate's red reveals nothing either.
  The fit coloring is the deduction: on Easy "only one number fits this
  run" is the whole technique, and the default setting plays it for the
  player, uncounted. The held clue's ghost is its mirror ("only one place
  for this number"), though it is also input feedback. Its advice: keep
  strike-through and red on the main screen, automatic; move the fit
  coloring into the reference as a filter that counts as help; the ghost
  probably follows. A hand mark (a tick) has value on harder boards, on the
  secondary button, and is a save-format question.
- **One shape, at the panel**: search, a grouping row and a status row that
  compose, the statuses, one definition of "fits" shared with the hint, and
  help counting. Crossing needs no grouping row (tens of clues); its "fits"
  follows the selected square, Wordtrail's the whole board.
- **Flagged for the owner**: count help when a board-derived filter is first
  chosen, not when the panel first shows, so a plain dictionary is free, as
  on paper; then the "Fits" count must stay hidden until then. The
  `fit-highlight` preference's meaning, if its aid moves. Thousands of chips
  on a phone: measure.

### What I take from it

- Wordtrail's list, the length row and its composition: taken, as below.
- Crossing: the advice and the owner's starting point disagree on which
  marks move, and either way an aid every Crossing player sees today moves
  behind help. That is the owner's call (task 0.3), asked with its costs in
  `proposal.md` § "Questions for the owner".
- Counting help at the filter rather than the panel changes what every
  reference game counts as help, so it goes to the owner with Crossing.
  Until they answer, showing the panel stays help.

## Decisions

### A reference model may group its sections, and the panel shows one group

`ReferenceSection` gains `group: string | null`. Where any section has a
group, the panel shows a row of the groups in section order, one pressed
(the first by default), each counted under the search and the pressed
filter, and hides the other groups' sections. The group row has no "All": a
model groups because the whole is too long to show. The status filters and
their counts read the pressed group. The search narrows within the pressed
group, and the group buttons' counts show where else the text is found.

Alternatives: a model-level list of groups each holding its sections (a
second nesting every model writes, where the panel only needs a label per
section); one row of combined chips ("5 · Fits"), which multiplies.

The field is on every section, so Dominosa and Wordguess write `group:
null`: absence is `null`, and a model that forgets it fails the typecheck.

### Wordtrail lists the whole common list, a group a length

For each length the board asks for: every common word of that length, under
letter headings, in a group labeled "N letters". A word is placed where a
drawn piece spells it, outstanding where some trail spelling it still fits
(the hint's `fittingTrails`, as before), and ruled out otherwise, every
word no trail spells included. The filters stay "Fits" and "Found".
Selecting a word no trail spells spotlights nothing. The heading's "N words
to find" goes: the slots under the board already say how many.

The panel renders one length at a time, at most 7,281 chips; rendering is
measured in the app, on a phone-sized window too, before this is called
done.
