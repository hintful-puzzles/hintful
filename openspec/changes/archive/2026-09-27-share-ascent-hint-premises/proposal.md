# share-ascent-hint-premises

## Why

`read-ascent-edges-by-lines` added a second premise model beside the one the
run techniques already had. `hint.ts`'s `Measured` and `squaresWithin` measured
distance to placed numbers, with an optional arrow line. `hint-edges.ts`'s
`Premise` and `allows` measured distance to a placed number or to a missing
number's line. The first is the second restricted to placed numbers, and each
file also carried its own board readers (arrows, positions, lines).

The owner asked whether the Edges approach helps the regular boards. It
doesn't. A census over every regular mode (15 boards per shape and tier) found
30 of 5,066 steps marking more than a third of the board, all of them rare
`only`/`route` steps, and on a board without arrows every line premise
disappears and what remains is straight reach. The two modes share the
reasoning and differ only in the unit a sentence groups by (runs versus lines).
That shared reasoning belongs in one place.

The same review found a player-visible inconsistency on Edges boards: `touch`
and `reach` said "on its arrow's striped line" while `lines` said "on its
column". `touch` is about half of all Edges steps, so a player met both phrasings
on every board.

## What changes

- `premises.ts` holds the one model. A `Premise` is `Placed` or `OnLine`,
  alongside `readBoard`, `premisesOf`, `allows`, `squaresMeeting` and the line
  helpers. `boundsOf` becomes `premisesOf` filtered to the placed ones.
  `Measured`, `squaresWithin`, the second `arrowOf` and the second
  positions reader go.
- Edges `touch`/`reach` name the number's own line by its shape: *"22 must sit
  next to 21, on its row. Only this square does, so it must be 22."* Their
  stripes and outlines are unchanged.

## How it is held

- The refactor alone was checked plan for plan against the previous commit
  over every mode: 58 regular shapes and 6 Edges shapes, 10 seeds each, with
  zero differences.
- With the wording change, regular plans are still identical. Edges plans are
  identical in moves and marks (880 steps) and differ only in text.
- The tests now read each named line's shape independently off the arrow's
  place on the border, for `touch`/`reach` and for `lines`. Planting "rows are
  columns" in `lineKind` turned both red; before this change the `lines` test
  would not have noticed it.
