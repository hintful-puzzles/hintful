# state-once-what-several-games-each-state

**Status: filed 2026-10-09 by the session that archived `regroup-the-specs`,
on the owner's word that its findings merit a change. What it says of the
specs was true that day; re-check before relying on it.**

## Why

Settling the doubtful requirements kept 367 of them, and a large share were
kept for one reason: a game states a rule that is true of every game, or of
its whole family, and no shared capability states it, so the game's copy
could not go. The archived `2026-10-09-regroup-the-specs/found.md`, § "A rule
several games each state, with no shared requirement" and § "A shared
requirement that reads wider or narrower than the code", lists them with the
verdict file that holds each. The largest:

- A generator given the same params and seed writes the same board: stated
  by a dozen games, relied on by every fixed-seed test, hint pin and
  `params#seed` ID, and stated nowhere shared.
- An input that would change nothing makes no move and no history entry:
  Pearl, Tracks, Salad, Tents, Rectangles, Unruly, Mosaic and the Latin
  games each say it.
- The candidate walk's family rules (a hint's solve reads the placed entries
  and never the notes; a step is never undone by a later one; a struck
  candidate is crossed through; the keep-track verdicts), which six games
  state in the same words.
- The note-taking family's presses, preference defaults and way into pencil
  marks, which `engine-notes` states obliquely or not at all.

Each is one requirement in a shared capability and a cut or a shorter
requirement in every game that repeats it: the specs get shorter and a rule
gets one place to change. Several of the shared requirements that do exist
read wider or narrower than the code (Cube and the steered figure's color,
Loopy's cursor, Seismic and the naked-single rule), and a reader of the
shared capability is told something false of one game.

## What Changes

- Each rule of the two `found.md` sections that is true of its whole
  population, checked against the code, becomes one requirement of the
  capability a session would look in, and each game's copy is cut or
  shortened to what is the game's own.
- A shared requirement that is false of a game is corrected or names its
  exception.
- Where a rule turns out to be true of only some games, nothing is shared
  and the reason is recorded.
- One small guard the settling found missing: no game imports the midend
  (`ts-engine`, "A game depends on the `Game` interface and never on the
  midend"), as a rule of `src/module-layering.test.ts`.
- Nothing a player sees.

## Capabilities

### Modified Capabilities

`ts-engine`, `engine-input`, `engine-notes`, `engine-hints`,
`engine-candidate-hints`, `engine-colors`, `testing`, and each game whose
copy goes.

## Impact

- `openspec/specs/**`, one rule in `src/module-layering.test.ts`, and the
  guides where a rule gains a home worth pointing at.
