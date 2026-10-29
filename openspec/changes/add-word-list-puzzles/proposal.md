# add-word-list-puzzles

**Status: filed on the owner's word (2026-10-29)**: randomly generated
word-list puzzles, "and particularly Wordle and LinkedIn's Wend". Not
crosswords or other definition-based games, which work well only with
authorial intent.

## Why

Two games, and the engine piece they share.

- **Wordle**: a hidden word, guessed in a bounded number of tries, each guess
  answered by which letters are right and in place, right and elsewhere, or
  absent. A query game, as Guess (Mastermind) already is in the collection.
- **Wend** (LinkedIn): a grid of letters with some cells blocked, divided
  into words, each a path of orthogonally adjacent letters, using every
  letter once, with the words' lengths listed. **Its rules are read from the
  owner's screenshot alone and are unverified**; the session confirms them.

Both are in scope (`2026-10-29-investigate-a-language-for-puzzle-games/
theory.md` § "Scope"), and the language states both, with a word list as a
library table (`corpus.md`).

## The shared piece: a word list

- **Which list**, under a license the app can ship (`licenses/` holds every
  notice), and in which languages; English first.
- **Its size offline**: the app is a PWA that works offline, so the list is
  precached, and its weight is measured against the bundle
  (`AGENTS.md`, "Weigh bundle size and offline use before adding a
  dependency").
- **Answers and accepted guesses** may be two lists: common words as
  answers, every word as a guess.

## Decisions for the session, and the owner's where marked

- Whether one change delivers both games, or the word list and Wordle first
  and Wend after: the session's, from the size of each.
- Wordle's bound on guesses is a lost state, as Guess's rows are. Whether to
  keep six, or make the bound a setting, is player-visible: the owner's.
- The hints: Wordle's is a query game's (which guess serves the subgoal);
  Wend's can deduce (a letter with one way to continue).

## What Changes

The word list as an engine asset, and the two games, each with its spec,
help page, hint and tiers, following `docs/new-game.md`.

## Acceptance

The owner's, in the running app.
