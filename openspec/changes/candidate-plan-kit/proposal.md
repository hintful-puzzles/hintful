# candidate-plan-kit

## Why

`sequence-hints-in-cell-games` moved the candidate plans' loop into the engine
(`runCandidatePlan`), at the owner's direction to prefer framework functionality
over a consistent per-game idiom (`AGENTS.md` § "Convention over configuration").
Converting six games showed four more idioms each of them still writes. These
were noticed while converting, not measured, on 2026-09-19; re-read the games
before designing against them.

1. **A candidate states its premise twice.** Each `FrontierCandidate` carries
   `reads`, built from the same `reasonArea` call as the `area` its step will
   shade. Two copies of one fact, and nothing checks that they agree: a frontier
   reading something other than what the player is shown is the defect this
   invites.
2. **Every game has its own `emitPlacement`.** Towers, Keen, Unequal, Solo,
   Group and Salad each push the placement, apply it, strike the value from the
   cell's regions (`regionDuplicateMarks`) and push that strike as a
   continuation leg (or apply it silently under auto-pencil). They differ in
   narration, region provider and note encoding.
3. **The standard rungs are rebuilt per game.** Keen, Solo and Unequal build
   near-identical singles, strikes and placements rungs from `nakedSingles`,
   `availableStrikes` and `availablePlacements`. Towers, Group and Salad add
   rungs of their own around the same three.
4. **Journey continuation is tracked per game.** Towers, Unequal and Salad each
   keep a `lastStrikeGroup` so the second part of a firing continues its
   journey.

## What changes

- **A candidate is the step it would push** (or a lazily built one), and the
  frontier reads its premise from the step's own highlights. `reads` goes away.
- **One placement emitter** in the engine, with hooks for the parts that differ.
- **Standard rungs by default**: `runCandidatePlan` offers singles, strikes and
  placements from the game's recording and regions, and a game adds its own
  rungs (Towers' clue lines, Salad's markers, Group's leads) where they belong in
  the order.
- **The driver owns journey continuation**: a candidate names the firing it
  belongs to, and the driver sets `continuesPrevious`.

Every step is behavior-preserving. The render snapshots, the hint walks and
`hint-frontier.test.ts` are the net, and a moved snapshot is a finding to
explain, not a baseline to refresh.

## What this does not do

- **Not the narration.** Sentences stay in each game's `hint-text.ts`.
- **Not the region relations** (`declare-region-relations`), which touches the
  same emitter and should land first or after, not interleaved.
