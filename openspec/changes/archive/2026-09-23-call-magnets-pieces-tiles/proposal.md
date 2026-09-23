# call-magnets-pieces-tiles

## Why

Owner, 2026-09-23, reading a hint frame that said "only this domino can still
give it" beside two outlined pieces: *"Why do you call them dominos? … I think
that terminology is confusing, and we should change it to magnet vs
neutral/blank tile."*

"Domino" is upstream's word, inherited through the help page ("Fill each domino
shape with either a magnet … or a neutral domino") and adopted by the explained
hint. It names the shape, while the player thinks about what the piece is, and a
domino is also the thing another game in the collection (Dominosa) is about. The
board draws a tile; the player fills it with a magnet or leaves it neutral.

## What Changes

- Every Magnets hint sentence and the Magnets help page call the two-square
  piece a **tile**: undecided, a magnet, or a neutral tile. "Neutral" stays
  rather than "blank": the hint already concludes "it must be neutral"
  throughout, and "blank" reads as the empty squares its counts speak of.
- The halves of a tile stay its "ends" and "squares", and a `?` tile stays a
  "marked magnet".
- The code keeps `dominoes`: it is the desc format's data structure, named as
  upstream names it, and no player reads it.
- A test holds every sentence the hint can speak, and the help page, free of
  the word.

## Impact

- `src/games/magnets/hint-text.ts`, `help/games/magnets.md`, their tests.
- Spec: `magnets` gains a requirement naming the player vocabulary.
