# say-a-supplied-word

**Status: filed by `add-wordtrail` (2026-11-19)**, an engine lack that
change's fresh read of the hint found.

## Why

Wordtrail's hint cannot name the word it reasons from. Its sentences read
"Only one word still fits through the outlined letter, so these edges must
be as shown." and "The striped letters spell the only 6-letter word that
still fits, …", and a reader who did not write the game said the first thing
they would change is to name it: FRIDGE, not "the only 6-letter word". A
named word is one a player can check on the board; an unnamed one asks them
to find it first. "Every word that still fits through the outlined letter
agrees on these edges" would read better with its few words named too.

The description language says a word only as a planner step's `word` term
(Wordguess's suggested guess, `compile.ts`'s `saidPlainly`). A technique's
`says` carries numbers, units and cells the compiler computes from the
firing; a word is not a value the language has, since the word list is a
table it cannot state (Wordtrail deals it as the `trail` board clue).

## What changes

- A technique's `says` may declare a term the game supplies from the
  firing's bindings (for Wordtrail, the word a trail clue spells, read from
  the board's letters along its `pos`), said plainly as a `word` term is.
- Wordtrail's `onlyWord` names its one word, or its few, and `onlyLength`
  names the words of the length, each within the 120-character line.
- The checker is untouched: a supplied term is words, and the soundness of
  a technique never reads its sentence.

## Impact

- `src/describe/` (the term kind, the compiler's `StepsById`/`SaysById`
  types, the loader's checks), `engine/described-edge-hint.ts` or wherever a
  step's terms are filled, Wordtrail's description, hint and pins.
- The spec delta is for the descriptions capability that states a `says`
  term's kinds, and Wordtrail's `Hint` scenarios, which quote the sentences.
