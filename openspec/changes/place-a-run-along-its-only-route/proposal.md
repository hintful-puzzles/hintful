# place-a-run-along-its-only-route

## Why

Owner playtest, 2026-09-27: a run of six numbers arrived as a six-leg journey
opening "Only the run 14 to 19 between 13 and 20 can reach this square, and of
those only 16 can", and the deduction was not obvious. A player sees one
thought: the far squares can be reached by no other run, so this run must take
them all, and only one route does. The owner also found "14 to 19" redundant
beside "between 13 and 20".

## What changes

- **A run on its only route is one step.** When the plan follows a run to its
  end and the run has exactly one route, either through the empty squares at
  all or through every square no other run reaches, one step places the whole
  run (a hint-only `places` move). It is drawn as the game's own path line in
  the hint color, with every square ringed and the must-visit squares striped.
  The route count is computed (`runRoutes`, capped), never inferred, and the
  test recounts it by brute force. A player may follow it a number at a time;
  the step shrinks to what is left.
- **Runs are named by their ends** in every sentence: "the run between 13 and
  20", "the run after 43", "the run before 5".

The `places` move is new in saves; no older save contains one.
