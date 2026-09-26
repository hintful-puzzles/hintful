# adopt-track-targets

**Status: scaffolded, not started.** Found by `add-tents-hint` (design D6),
2026-09-27.

## Why

`engine/hint-track.ts`'s `trackTargets` owns the keep-track verdict for a step
that decides several things at once: every element the move changed must be a
target set the way it asks, a move that changed nothing is off, and the step
shrinks to the targets that do not yet hold. Pearl, Pattern and Tents use it.

A survey of every game's `hintKeepTrack` (2026-09-26) found four more writing
the same policy by hand, reading the changes off the move's ops rather than a
board diff: **Singles**, **Lightup**, **Filling** and **Tracks**. Two were
re-read for this scaffold (Lightup `index.ts` `hintKeepTrack`, Filling
`index.ts` `hintKeepTrack`, both 2026-09-27) and fit as they stand. Each
re-derives "is every op a pending target", "what is left" and the three
verdicts, and each spells the edge cases its own way: Filling tests "hit none
of the targets" by comparing lengths, and Lightup guards a toggle on a done
cell by hand. Taking the changes from a board diff instead answers that case
by construction, because a toggle that removes a mark is a change the step did
not ask for.

This is `AGENTS.md` § "A consistent idiom is not the finish line": the policy
belongs to the framework, and a game should supply only what the move changed
and how to rebuild its own shrunk move.

## What changes

1. Move Singles, Lightup, Filling and Tracks onto `trackTargets`, choosing per
   game whether its changes come from the move's ops or from a board diff
   (`executeMove` on the pre-move state).
2. Each game's existing hint tests must pass **unedited**; a test that has to
   change means the move changed behavior, so stop and re-evaluate.
3. Then decide, with the population in view, whether a shared "diff two
   boards over this key" helper is worth adding beside `trackTargets`. Pearl
   and Tents each write a loop over their own keys (edges; squares plus a
   tent's tree), and a key enumeration may genuinely be each game's own.

## Not in scope

The candidate-elimination games already share `keepCandidateHintTrack`, and the
single-target games (Range, Palisade, Unruly, Spokes) compare one move exactly,
which is a different and simpler question.
