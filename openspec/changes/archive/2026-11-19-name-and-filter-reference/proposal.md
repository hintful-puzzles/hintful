## Why

The toolbar calls every game's reference "Reference", though each game's is a
particular thing: Dominosa's dominoes, a word game's dictionary. And Wordguess's
dictionary lists only the words that fit every score, while a good guess is
often one that cannot win but splits the words left most evenly: the player
needs the whole list to choose one, and a way to narrow it when they want only
the words that fit. Wordtrail's dictionary wants the same narrowing.

## What Changes

- A game's reference aid is one hook carrying its name, its model and its
  selection. The name labels the toolbar toggle ("Dictionary", "Hide
  dictionary") and titles the panel; the model no longer carries a title.
- The model may ask the panel for a search box and declare filter buttons,
  each naming the statuses it shows. The panel draws "All" and the game's
  filters, each with its count, filters the items by both, and hides a
  section the filter empties. The filter and the search are the panel's, kept
  while it is open.
- Wordguess's dictionary lists every word the game can draw as an answer, A to
  Z under letter headings, those that no longer fit every score struck
  through, with a search box and a "Fits" filter. A tap writes any listed
  word, struck or not, into the working row.
- Wordtrail's dictionary gains the search box and "Fits" and "Found" filters.

## Capabilities

### New Capabilities

### Modified Capabilities

- `ts-engine`: the reference aid is one named hook; the model's search and
  filters.
- `app-shell`: the toggle is labelled with the aid's name; the panel's search
  and filter buttons.
- `wordguess`: the dictionary lists every answer word, unfitting ones struck.
- `wordtrail`: the dictionary's search and filters.

## Impact

`src/engine/game.ts`, `types.ts`, `midend.ts`; `src/components/reference-panel.ts`;
`src/puzzle/components/game-controls.ts` and the puzzle's capability surface;
Dominosa, Wordtrail and Wordguess's reference hooks and tests; the help pages
of the two word games and `help/features.md`; `docs/mechanics.md` § "The
reference aid". No save or preference changes.
