# move-each-remaining-game-once

Third of the hint track the 2026-11-16 debrief set
(`archive/2026-11-16-state-hint-sentences-in-the-description/tasks.md` § 3).
It absorbs that change's remainder and the draft
`give-the-remaining-games-their-says`. It waits for
`speak-a-step-through-the-engine`, `add-norinori` and the clustering
`supply-techniques-by-kind-of-rule` asks for before it starts.

## Why

A game still on a `hint-text.ts` was to be touched three times: its
techniques given a `says`, its sentences moved into the description word for
word, and its techniques restated on a library that brings its own words and
discards the ones just moved. Byte-identical words were the only reason the
last two were apart, and the owner released them (2026-11-16): wording is free
to change wherever a simpler or more consistent sentence is not significantly
worse, and no effort goes to keeping today's phrasing.

So a game moves once.

## What Changes

- **Each game with a `hint-text.ts` loses it.** Re-derive the list before
  starting (`ls src/games/*/hint-text.ts`); at 2026-11-16 there were 33.
- **A logic game's techniques state their `says`**, and its sentences are the
  description's: a library technique's words where the clustering found its
  rule to be a standard kind, a clause of the game's own otherwise. The games
  with no `says` at 2026-11-14 were Ascent, Black Box, Filling, Guess, Mines,
  Net, Pattern, Slant and Subsets.
- **A step no firing makes is a declared step**, spoken through the adapter of
  `speak-a-step-through-the-engine`. No game writes a `speak.ts` adapter of its
  own.
- **A sentence that differs from the engine's only in style takes the
  engine's.** A game keeps words of its own for what is its own.
- **A trial kind, once two games read their breaks the same way**
  (from `supply-techniques-by-kind-of-rule`, design step 4, 2026-11-17).
  Path, Spokes and Boats state their Checks with `breaks:` and `{broke}`
  but suppose three ways (an edge, a set of spokes, nested `with`s), so no
  shared trial shape yet. A game moved here whose Checks suppose as one of
  them do is the second, and the kind is written then.

## Before it starts

1. The clustering's result decides the shape: with a small number of kinds
   covering most one-rule techniques, this change and
   `supply-techniques-by-kind-of-rule` are one, and a game moves onto the
   library; otherwise this change goes ahead with per-game clauses.
2. What `add-norinori` recorded about the engine making a game state what it
   should not have had to is mended first, or filed.
3. The games that moved before the debrief and were not read in the running
   app (Towers, Undead, Salad, Mathrax, Keen, Group) are read as their words
   are revisited. Solo's baseline dump (`DUMP_GAME=solo`) exited 1 with no
   output at `7a1223d3f`: find out why before Solo moves.

## Acceptance

A game's word dump (`research/hint-walk-dump/`) is taken before and after, the
diff is read, and every changed sentence is listed in the change for the
owner. The game is read in the running app. The marks a step draws do not
change unless the change says why.
