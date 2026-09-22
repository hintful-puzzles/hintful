# own-the-select-or-drag-gesture

**Status: scaffolded, not started.** Owner-requested, 2026-09-22: *"I don't
want per-game quirks. Any reason not to have the cell/region selection
functionality entirely in the engine, so that it is fully consistent?"* There
is none; this change does it.

## Why

`share-the-selected-cell-highlight` brought Rome and Map into the note-taking
cell by routing their **tap** (a release that commits nothing) through
`pressNoteTakingCell`, leaving their drags alone. That arm was built for games
whose *press* is the selection: it asks "is the highlight on this cell?" at the
moment of the press. In Rome and Map a press might become a drag, so each game
hides the highlight on press. By the time the release turns out to be a tap,
the answer the arm needs has been thrown away.

Two player-visible differences from every other member follow, both from that
one cause:

- **A repeat tap re-selects instead of putting the highlight away.**
- **A sticky right tap on a square or region that can take no mark hides the
  highlight**, where the sticky toggle everywhere else leaves it exactly where
  it was (`pressNoteTakingCell`'s own comment says why that matters).

They are written down as though they were decisions, in three places that this
change must correct: the `ts-engine` requirement "A game whose press starts a
drag joins the note-taking cell through its tap" ("a repeat tap SHALL
re-select rather than put the highlight away"), and a comment at the tap in
each of `map/index.ts` and `rome/index.ts`.

The deeper problem is that the engine owns the *rules* but each drag game
owns the *gesture*: when a press starts, when it becomes a drag, and what the
highlight does in between. That is the shape `AGENTS.md` § "Convention over
configuration" calls a convention two games are each re-implementing, and it
will be a third game's, since select-or-drag is a common input model.

## Recommended fix

**The engine owns the select-or-drag gesture, and the game supplies only what
is about its puzzle.** Concretely, the engine should decide:

- what a press records about the selection, before anything is hidden;
- when a press has become a drag, and that a drag belongs to the game;
- what a release that did not drag does, through the same rules as a click
  in the click-select games, so a repeat tap and a sticky toggle behave
  identically in all members.

The game keeps its drag (what is picked up, what is previewed, what a drop
commits), its `canEnter` / `canMark` answers, and **the identity of what is
selected**. That last one is the one real difference between members: a cell
for most games, a region for Map. It should arrive as something the game
supplies, such as a key or an equality, so "pressed the thing already
selected" means the same in every game and Map is not a special case.

Deliberately left open, for whoever picks this up:

- **The shape of the API.** Whether it is one driver the game hands its drag
  callbacks to, a two-phase press/release pair, or an extension of
  `pressNoteTakingCell`. Pick by what makes a *third* drag game cheapest, and
  what keeps the click-select games unchanged.
- **Where the press-time record lives.** Probably in the mechanic's `Ui`
  fields, written only by the engine, but it may turn out not to need state
  at all.
- **How a drag is recognized.** Today each game has its own notion (Rome: the
  pointer reaches another square; Map: any drop that commits). Unify only if
  the games agree once written side by side; a threshold that differs for a
  reason about the puzzle stays the game's.

## What this is not

- **Not a change to the pictures.** Map's band and the cell games' wash are
  settled (`share-the-selected-cell-highlight`); this is about behavior only.
- **Not a change to the click-select games.** Their press is already the
  selection, and every one of them must behave exactly as now. That is the
  proof obligation.
- **Not Crossing's walls.** A wall keeps corner brackets because it cannot be
  selected by the pointer and has no background to wash. That was offered to
  the owner as a one-line change if wanted, and is not part of this change
  unless asked for.
