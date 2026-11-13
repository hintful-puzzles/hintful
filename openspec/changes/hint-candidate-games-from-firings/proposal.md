# hint-candidate-games-from-firings

Filed 2026-11-13 from `build-hint-steps-in-the-engine`, as the engine's finding
(one face of a lack that reaches a dozen games).

## What the work found

The candidate games (Unequal, Adjacent, Keen, Towers, Group, Solo, Mathrax, Rome,
Salad, Seismic, Undead, Crossing) take their hint reasons from hand-written
recording solvers. Only Abcd's `satisfied` and `runs` (and one of Solo's
techniques) are compiled techniques that `say`, which is why Abcd's reason
callbacks could go (`46e3f388b`) while the others' cannot.

Their per-game hint code is already thin, because `runLatinCandidatePlan` and
`runCandidatePlan` share the walk: what is left per game is a recorder, the
words for each reason kind, and the note encoding.

## What this change does

Moves a game at a time from its recorder to the compiled firings its
description already holds, read over the player's notes as Abcd's `lineFirings`
does (`techniqueFirings`, `engine/ladder-runtime.ts`), with each technique's
terms in a `says`. Nearest Abcd first: Seismic's `starve`, Rome, Salad. Each
game is compared by its hint test's snapshots, and a commit each.

## What it needs to decide

Whether the walk's `RungContext` (`shown`, `populated`, `nothingEarlier`) is
enough for a firing read off notes or the engine takes that gate itself; Abcd's
`satisfied` and `packed` wrappers are the first evidence.
