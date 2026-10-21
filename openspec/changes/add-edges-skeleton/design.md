# Design — add-edges-skeleton

## D1 — The skeleton's puzzle

A skeleton's puzzle is only there to make the concerns run (`src/skeleton/
README.md`), so it is the smallest edges puzzle that needs every one: a line
drawn through squares under a rule a Check rung reads, connectivity (no loop,
or one loop), and boards where a bounded look-ahead is needed for its harder
tier. Choose it in this change; Path's rules cut down are one candidate, a
single-loop puzzle with count clues another. It must not be a game of the
collection.

## D2 — What it owns versus what the engine owns

Everything the three earlier changes made shared is a declaration here, not
code: if the skeleton writes a helper, the earlier change missed it, and it
goes back to the engine. Write down each one found.

## D3 — Proving it

Stamp a copy, register it, run `npm run game -- <copy>` and the source-scan
guards against it, then delete the copy (`src/skeleton/README.md` §
"Changing one"). Then time a stamp-to-playing build of a toy edge game from
it against Path's findings, and record the comparison in this change.
