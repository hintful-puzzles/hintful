# write-a-position-as-a-desc

**Status: scaffolded, not started (2026-10-04). Needs the owner's word before
it is built: it touches what a player shares.** A follow-up from
`move-the-hint-scans-onto-the-harness`.

## Why

A pinned hint position is a board and the moves played on it, unless the
game's mid-game board is itself a desc. Three test files pass `descOf` (Flip,
Sokoban, Pegs) and their pins are one short line. Everywhere else a pin is
the moves as JSON, and a ladder's late rung opens a plan only once every
earlier rung is spent, so the pin is long: Galaxies' rarest is about 17 KB
on one line, and a file of them costs every reader that much. The queries:
`git grep -l "descOf:" -- 'src/games/*/*.test.ts'` against
`git grep -l "describeHintPins(" -- src/games`.

The same thing is missing for a player. The app hands out boards, never
seeds (`docs/doctrine.md` § "Upstream"), and the board it hands out is the
dealt one. A player cannot share where they have got to.

## What Changes

A game may declare how its position is written as a string, and the engine
consumes it twice:

- the Share dialog offers the position in progress beside the dealt board;
- `describeHintPins` writes a pin as that string, with no moves.

For a game whose state is its grid (Flip, Pegs) the position is a desc
already. For a game with marks, notes or links it is the desc plus those,
and the question is the format.

## Decisions that are the owner's

- Whether a shared position is a new kind of ID or an extension of
  `params:desc`, and what loading one does to undo history and to the
  "restart" target.
- Whether upstream-format IDs stay untouched (they should: `docs/doctrine.md`
  § "Upstream" keeps them loading).

## What to check before designing

`Game.serializeMove` and the save format already carry every move. Ask
first whether a compact encoding of the move list is the smaller change and
serves the pins as well, since it needs no per-game work. It would not give
a player a shareable position that survives a change to the move format.

## Hints to pull in

None: this changes how a position is named, not what a hint says.

## What would show it worked

A pin for a late rung is one line a person can read past, a rescan of
Galaxies writes no line over a few hundred characters, and a player can send
someone the board as it stands.
