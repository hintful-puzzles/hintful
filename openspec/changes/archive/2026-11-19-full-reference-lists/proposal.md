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

The consultation's answers, and what was taken, are in `design.md`. The
Wordtrail half and the panel's length row are built in this change; the
Crossing half waits on the questions below.

## Questions for the owner

Answered 2026-11-19: **(b)** for Crossing, so only the fit coloring moves
into the panel and the held clue's ghost stays; and help stays counted when
the panel first shows.

1. **Crossing: which marks leave the main screen?** Today the list strikes
   through a placed clue, reds a duplicate, and (with the `fit-highlight`
   preference, on by default) colors each clue a click would place and
   grays the rest whenever a square is selected; none of it counts as help.
   - (a) Your starting point: the list is marked by hand only, and every
     automatic mark moves into a reference panel's filters. Cost: every
     Crossing player loses all of it unless they open the panel, which marks
     the solve "with help"; a hand-marking gesture is needed on the list
     (a click already picks a clue up, so the right button), and hand marks
     go into the save format.
   - (b) The consultant's, and my recommendation: strike-through and red
     stay automatic, being bookkeeping a paper solver does anyway; only the
     fit coloring (and perhaps the held clue's ghosted runs) moves into the
     panel as a "Fits the selected square" filter, since on Easy it plays
     "only one number fits this run" for the player. Cost: players lose the
     fit coloring unless they open the panel and take help; the
     `fit-highlight` preference is retired. An optional hand tick can come
     later.
   - (c) Nothing leaves the main screen; Crossing only gains the panel.
     Costs no one anything, and changes little.
2. **Help at the filter, not the panel?** Opening a reference marks the
   solve "with help" today, in all three reference games. The consultant
   proposes counting help only when a board-derived filter ("Fits") is
   first pressed or an item spotlighted, so a plain dictionary is free, as a
   paper one is; the "Fits" count would then stay hidden until pressed.
   Cost: fewer solves read "with help" for Wordguess and Dominosa players
   too, and Dominosa's list (all statuses) would need its own reading.

## Capabilities

### New Capabilities

### Modified Capabilities

- `ts-engine`, `app-shell`: a reference model may group its sections, and
  the panel shows one group at a time.
- `wordtrail`: the dictionary's list and filters.
- `crossing`: a reference aid; the number list's automatic marks.

## Impact

Wordtrail's `dictionary.ts`; Crossing's number list (`crossing/render.ts`,
`layoutNumbers`) and a new reference aid; the panel and its filter model;
the help pages of both games; `docs/mechanics.md` § "The reference aid" and
its subsection on an inventory drawn on the board.
