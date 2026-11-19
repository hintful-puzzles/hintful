# Design

## Context

The reference aid (`Game.reference` / `selectReference`, the generic
`reference-panel.ts`) was built for Dominosa: the panel hard-codes the title
"Dominoes", the instruction line and a domino's tooltip, and `ReferenceItem`
knows three statuses. Fetching the model is free of consequence. The word
lists live in `src/engine/word-list/`.

Measured 2026-11-19 (eight boards a preset, a scratch vitest): a Wordtrail
board's trails spell 5 to 37 distinct words, so its dictionary needs no
search or paging. Wordguess's list starts at the length's whole answer list
(1,949 five-letter words) and shrinks with each score.

## Goals / Non-Goals

**Goals:** one reference contract that Dominosa and both word games fill,
with nothing in the panel that names a game; the hint's words findable in
the panel; Wordguess without its answer row.

**Non-Goals:** Dominosa's hint naming reference items; a search box; a
dictionary for a game other than the two word games.

## Decisions

**D1. The model carries its own words.** `ReferenceModel` becomes
`{ title, instructions, sections: { heading: string | null; items; columns? }[],
selected, hinted }`. A per-game static field (`Game.referenceTitle`) was the
alternative; the model is already fetched each move and a title in it keeps
the contract to the two hooks. The toggle in Game controls keeps its generic
"Reference" label: reading the title would mean fetching the model, which
counts as help (D2).

**D2. Fetching is showing, and showing is help.** Only the open panel calls
`getReference()`, so the midend marks the board helped there, through the
same `markHelped` a shown hint uses. No per-game flag: the owner asked for
one behavior across games. A board dealt while the panel is open is helped
at once, which is right: its reference is on screen.

**D3. A step names reference items by key** (`HintStep.reference`), and the
midend copies the displayed step's into the model as `hinted`. The panel
refetches when the displayed hint changes as well as on a move. The words
are keys the game owns (Wordtrail's key is the word in lowercase), so the
engine never interprets them. `describedEdgeHint`'s leg may carry them.

**D4. Wordtrail's "still fits" is the description's own `fitting`.** The
compiled module exports `fitting(b, sp, cl, n)`; the dictionary calls it on
the board's marks for each listed length, so the panel and the hint's
`onlyWord`/`onlyLength` read one definition. A word is placed where some
drawn piece spells it (the list below the grid already finds those).
Spotlighting washes the squares of the word's fitting trails, as a render
bit in the tile key.

**D5. Wordtrail's third wording names the words with `{fit: …}`**, falling
back to a count: "{fit: only {trailWords} still fit … | all {numeral count}
words that still fit …}". Naming is what the owner missed; the count form is
for the long case only. Words are deduplicated: two trails of one word are
one word.

**D6. Wordguess keeps one hint step, the guess.** A `HintStep` must carry a
move, and the deduction steps' moves were rule-outs in the answer row. The
alternatives, a step with no move or the deductions folded into the guess's
sentence, either break the engine contract or exceed the sentence's length.
The guess's count ("12 common words fit every score") is now the
dictionary's heading, so the player can see what was counted.

**D7. Wordguess's dictionary words are `fittingIn`'s**, the hint's own
function, so the panel and the hint count the same words. Selecting a word
writes it into the working row (a `Ui` change, as the spotlight is), ready
to submit. Nothing stays `selected`: the word is the row's from then on, and
the panel refetches after a selection to show what the game kept.

**D8. A lost Wordguess names the word in the status bar**, which already
says it; the answer row was the board's only other place for it.

**D9. `WorkingRow.pencilMode` is optional.** The engine reads a `Ui` with a
boolean `pencilMode` as taking notes (`takesNotes`) and offers the Marks key;
Wordguess has no notes, so it leaves the field out and every note-taking guard
drops it by what it is. Guess declares the field itself.

**D10. The input-answers probe plays the opening hint's gesture.** Random
keys spell no word, so with the mark move gone the probe made no Wordguess
move at all; the hint's own gesture, sent as the probe's inputs, makes a move
in any game with a hint, and needs no per-game entry.

## Risks / Trade-offs

- Dominosa times now read "with help" after a look at the list, where they
  did not: the owner's call.
- Wordguess loses the deduction steps' teaching of what a score proves; the
  owner judged the colors make it obvious.
- `code-rows.ts` rule-outs stay for Guess; Wordguess no longer uses them.
