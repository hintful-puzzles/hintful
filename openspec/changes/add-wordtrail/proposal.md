# add-wordtrail

**Status: split from `add-word-list-puzzles` on the owner's word
(2026-11-18), not a priority.** That change shipped the word list and
Wordguess; this one is the second game it filed, LinkedIn's Wend, named
Wordtrail.

## Why

The owner asked for randomly generated word-list puzzles, "and particularly
Wordle and LinkedIn's Wend" (2026-10-29). Wordtrail is the Wend half: a grid
of letters with some squares blocked, divided into words, each a path of
orthogonally adjacent letters, using every letter once, with the words'
lengths listed (`design.md` § "Wend's rules, confirmed").

Its hint can deduce, where Wordguess's mostly counts: a letter with one way
to continue, a pocket of open squares no listed length fits, a word that
fits one place only.

## What it builds on

- **The word list** is the engine's (`src/engine/word-list/`): answers
  (`answerWords`) to lay in a board, every word of the guess list
  (`guessWords`) to judge a division unique against.
- **Decided with the owner already** (archive of `add-word-list-puzzles`,
  `design.md` § "Asked of the owner"): the name is Wordtrail; the offensive
  filter keeps a word out of any board, and a player may still draw one.

## What Changes

Wordtrail, following `docs/new-game.md`: its spec, generator, input,
rendering, help page, hint and tiers.

## Acceptance

The owner's, in the running app.
