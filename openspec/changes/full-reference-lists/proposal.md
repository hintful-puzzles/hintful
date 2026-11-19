## Why

The owner's request, 2026-11-19, after `name-and-filter-reference`: Wordtrail's
dictionary lists only the words some trail on the board spells, which gives
the player a short list the board already narrowed for them. It should list
every possible word, as Wordguess's does (perhaps with a button for each word
length), with a way to filter to just those that match the board and its
state.

The owner also asked that the answer be reusable across Wordtrail and
Crossing: Crossing's full list of numbers would stay on the main screen and
stay manual, while the automatic crossing-out would move into filters in a
new reference screen. In their words: "I'm not sure what's best", so the
design is open.

## What Changes

To be settled before implementation, starting with the consultation below.
The owner's starting points:

- Wordtrail's dictionary lists every word it could hold, not only those the
  board spells, with buttons per word length and a filter to the words that
  fit the board as the player has it.
- Crossing keeps its full number list on the main screen, marked by hand
  only, and gains a reference screen whose filters do the automatic
  crossing-out.
- One shared shape for both, built on the reference panel's search and
  filters (`components/reference-filter.ts`).

## Open questions (for the consultation)

- What "every possible word" means for Wordtrail: the whole common list at
  each length the board asks for (thousands), or something narrower. What the
  player gains from the long list, against what Wordguess's long list gives
  (a probe word can be guessed; a Wordtrail word must be on the board).
- Length buttons beside the status filters: two filter rows, or one row of
  combined choices; whether filters compose.
- Crossing: what the main screen's list shows once its automatic marks move,
  and whether a player who never opens the reference loses an aid they have
  today. Moving an automatic aid behind the help-counting panel changes what
  every Crossing player sees and makes it count as help: a player-visible
  change for the owner to confirm, with its cost stated.

## Capabilities

### New Capabilities

### Modified Capabilities

- `ts-engine`, `app-shell`: the reference model's filters, if they compose.
- `wordtrail`: the dictionary's list and filters.
- `crossing`: a reference aid; the number list's automatic marks.

## Impact

Wordtrail's `dictionary.ts`; Crossing's number list (`crossing/render.ts`,
`layoutNumbers`) and a new reference aid; the panel and its filter model;
the help pages of both games; `docs/mechanics.md` § "The reference aid" and
its subsection on an inventory drawn on the board.
