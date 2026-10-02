# share-boards-not-seeds

Asked for by the owner (2026-10-02), after `deal-every-tracks-board` and
`link-upstream-by-game-id-only`: *"Yeah, please do. A fix is worth breaking
compatibility"*, then *"please just make things as simple and consistent as
possible, so that we don't hit this again"*.

## Why

A seed names a board only through a generator. Generators here change, both
against upstream and between versions of this app, and `deal-every-tracks-board`
changed most Tracks seeds above Easy. Yet the Share dialog's "This specific
game" link was `params#seed` whenever the board came from New Game, so every
such fix silently changed what links in the wild open. The previous change
patched one surface, the upstream links. The seed was still handed out in
three other places: the in-app link, a Random seed field, and the midend's
notification that feeds them.

## What Changes

- **The midend emits no seed.** Its game-ID notification carries the sharing
  ID and the restoring ID only, and `Puzzle.randomSeed` is gone. So no part of
  the app can hand a seed out, and a future surface cannot either.
- The Share dialog's "This specific game" link carries the game ID. Its
  Random seed field is removed.
- The win message is chosen from the game ID, so a board shows the same
  message however it was opened. The Enter-ID dialog recognizes the current
  board by its game ID.
- **Compatibility break, approved:** a `params#seed` link shared before this
  change opens whatever the current generator deals for that seed. A seed ID
  still opens, and nothing persisted is affected (saves store the desc).
- AGENTS.md states the rule, and that changing which board a seed deals is
  therefore no longer a compatibility break.
- The help's Share section, and `docs/games/mechanics.md`, stop describing a
  seed ID.

## Hints to pull in

None.
