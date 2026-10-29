# add-ball-sort

**Status: filed on the owner's word (2026-10-29)**: "I'd be interested in us
adding a test tube color sort game", without the ad and micropayment
mechanics most implementations sell.

## Why

Tubes of equal capacity hold colored balls, with some tubes empty. A move
takes the top ball of one tube and puts it on another that has room and is
empty or shows the same color on top. The puzzle is solved when every tube
is empty or full of one color. It goes by ball sort, water sort and color
sort; the owner's screenshot shows nine tubes of four, two of them empty.

Written in the language (`2026-10-29-investigate-a-language-for-puzzle-games/
corpus.md` § "Added after the test"), its moves are not always reversible, so
it is a **planning** game with **dead ends**, as Sokoban and Pegs are. It is
in scope (`theory.md` § "Scope"): no chance in play, no adversary, no clock.

## Decisions for the session, and the owner's where marked

- **The way out of a dead end.** The owner suggested letting the player add
  an empty tube. Undo is the other. Whether to offer an added tube, how many,
  and whether it is a setting, is player-visible: the owner's.
- **A move**: one ball, or the whole run of a color on top (water sort). The
  owner's, with what the session finds about each.
- **Generation**: deals that are solvable, at tiers, and the measure a tier
  rests on.
- **The hint**: a planning game's hint, a stable subgoal and the next move
  serving it (`docs/hints-search.md`), which can also say when a position is
  a dead end and what undo reaches a live one.

## What Changes

A new game, with its spec, help page, hint and tiers, following
`docs/new-game.md`.

## Acceptance

The owner's, in the running app.
