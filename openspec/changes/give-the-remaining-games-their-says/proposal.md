# give-the-remaining-games-their-says

**Status: draft, filed 2026-11-14 on the owner's word**, split out of
`state-hint-sentences-in-the-description` so that change states words and
this one states steps. The session that takes it up writes its tasks.

## Why

`build-hint-steps-in-the-engine` gave most described logic games a `says`
on each technique: the terms a step names and the elements it marks. It left
some, whose hints still build a reason by hand and narrate it in code. At
2026-11-14 they were Ascent, Black Box, Filling, Guess, Mines, Net, Pattern,
Slant and Subsets (Loopy's is done in `state-hint-sentences-in-the-description`,
whose trial needed it). Re-derive the list before starting: a logic game
whose description has techniques and no `says`.

`state-hint-sentences-in-the-description` states a step's words beside its
`says`, so a game without one cannot move there.

## What Changes

- Each listed game's techniques state their terms and marks, and its hint
  is built by the engine from the firing, as the games
  `build-hint-steps-in-the-engine` moved are.
- A step the game's own plan writes, and no firing makes, is a declared step
  kind (`state-hint-sentences-in-the-description` design.md § "Step kinds"),
  once that change has built them.

## Acceptance

Each game's hint walk fingerprint is unchanged (`research/hint-walk-dump/`
dumps a game's steps, marks included, before and after), and its words are
unchanged: this change moves no word.
