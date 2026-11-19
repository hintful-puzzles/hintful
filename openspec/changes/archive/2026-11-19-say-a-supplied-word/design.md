# Design

## How a game supplies a word

A technique's `says` already declares terms only the game's code can know
(`{ supplied: number }` and the rest, `docs/descriptions.md` § "A firing's
reason is built from its binding"): the compiled module types them
(`SuppliedById`), writes a placeholder, and the game's `supplied` hook for the
technique returns them. A word joins that mechanism as one more kind,
**`{ supplied: words }`**: a list of words, typed `readonly string[]`, said by
`{term}` as a list ("FRIDGE and FIDGET"), by `{either term}` as alternatives
("FRIDGE or FIDGET"), and counted by `{term: one | several}`. A list rather
than one word because the sentences that want it name one word or a few, and
a one-member list is said as the word; a separate `word` kind would be a
second spelling of the one-member case.

The hook was told only the leg's `marked` and the state, which hold no
binding. What Wordtrail spells is the binding's set of trails `T`. Rather than
hand the hook the compiled binding (whose names and buffers are the
compiler's), the description states the set as an ordinary term
(`trails: "T"`, copied when read), and **the hook is now also told the
firing's stated terms**, typed by the module's `SaysById`. The reads stay the
description's: the game only turns a trail's index into the letters along it,
which is what the description cannot state (the letters are a clue's values,
the word list is no table the language has).

The checker reads nothing of it: a `words` term is no sort the soundness
checker sees, and `checkStated` holds it as a word said plainly, as a planner
step's `word` and `unit` terms are; a wording's `when` cannot read it, as no
supplied term can.

## Other games

Wordguess's planner steps say their guess as a step's `word` term, which the
planner already makes; no technique there wants one. No other game's
sentences name a word the language cannot state. The kind is general (any
game whose clue values spell something), and costs nothing to the games that
do not use it.

## Wordtrail's sentences

- `onlyWord`, one trail: "only FRIDGE still fits through the outlined letter,
  so these edges must be as shown."
- `onlyWord`, two: "only AVION and PAVILION still fit through the outlined
  letter and agree on these edges". Three or more keep "every word that still
  fits …": three words of eight letters run past the line.
- `onlyLength`: "the striped letters spell FRIDGE, the only 6-letter word that
  still fits", and with two, "spell INITIATE and REACTION, the only 8-letter
  words still fitting": "that still fit" ran two of eight letters to 121
  characters with "these edges". Three or more keep "the only three …".

A walk of 100 boards (5×5 at both tiers, 7×6 and 8×8 at Normal, 1,577 steps,
2026-11-19) spoke every form; the longest, two eight-letter words of a
length, came to 118 characters with "this edge", so 120 with "these edges".
The words are capitals, as the board draws its letters, in alphabetical
order.
