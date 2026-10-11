# decide-whether-a-solved-game-id-opens

**Status: filed 2026-10-11, moved out of
`open-and-check-the-boards-the-spec-census-found-mishandled` so that change
did not wait on it. It needs the owner's answer before it starts.**

## The question for the owner

**Should a game ID whose board is already solved open?**

Today it does. Fifteen's `3x3:1,2,3,4,5,6,7,8,0` opens as a finished board,
with the completion dialog. Mines opens a board its first square wins, which
the app itself deals on `9x9n1` and whose ID it hands out, so at least that
one has to open. Nothing in `openspec/specs/` decides the typed case:
`engine-difficulty`, "A board that comes solved is dealt again", binds
dealing only.

- **Open it, as today (recommended).** Nothing changes in the code. One
  requirement in `ts-engine` says a description of a solved board loads, and
  one test holds it. A solved board harms nobody, a link to one is a thing a
  player might send, and upstream reads the same description.
- **Refuse it.** One rule in `loadDesc`, with a sentence of its own. It
  refuses a description upstream's parser reads, which is a compatibility
  break, and it needs an exception for a board the game dealt and the player
  then won in one move (Mines), or that board's own ID stops opening again.

## What Changes

By the answer: a requirement and a test, or the rule in `loadDesc` with its
exception.
