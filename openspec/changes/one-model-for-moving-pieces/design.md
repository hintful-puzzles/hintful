# Design

A draft (no `tasks.md`): it starts after `a-game-from-its-description-alone`
has shown what an engine board and a description-built game look like, so
that this model is written in the same vocabulary. Writing `tasks.md` from
this plan is how a session takes it up.

## Context

The arrow game's analysis, recorded at filing (2026-11-21):

- With the leave-at-the-edge rule, moving an arrow out only empties cells.
  An arrow whose path is clear is always safe to move, and moving it never
  makes another harder. So the board is solvable when the "waits on"
  relation is acyclic, and any order consistent with it wins: a topological
  sort.
- The difficulty is finding a clear arrow on a crowded board, which is why
  the game is meant for large boards and needs `zoom-and-pan-the-board`.
- A tap on a blocked arrow is a loss, undone as in Mines and Inertia. That
  is the cost that keeps tapping at random from winning (owner, 2026-11-21).
- The player's mark records the reasoning: arrow A waits on B when B lies on
  A's path to the edge. The hint's sentence is in those terms: "Nothing
  lies on A's path, so A can leave" or "B lies on A's path, so A waits on
  B", with the dependency drawn as the mark the player would make.

## Goals / Non-Goals

**Goals:**

- One model for pieces as sets of cells on a grid, with move rules a
  description picks, written in the engine's vocabulary.
- Slide's one-axis ruleset as the model's first new user, then the arrow
  game; Slide itself moved onto the model.
- A hint for each, in terms of marks the player can make.

**Non-Goals:**

- Moving the other movement games (Sixteen, Fifteen, Netslide, Inertia,
  Sokoban, Ballsort, Twiddle) onto the model: later changes, once two games
  have shaped it.
- Zoom and pan, which are `zoom-and-pan-the-board`'s.

## Decisions

- **The one-axis rule is a Slide ruleset, not a game** (owner, 2026-11-21):
  a parameter with its own presets. Its generator must deal boards that need
  the constraint, not Slide boards that happen to obey it; the tier gate
  says which.
- **Slide is moved first, and the one-axis ruleset written on the model**,
  so the model meets a game that exists before a new one.
- **The arrow game's generator guarantees an acyclic "waits on" relation**
  and grades difficulty by what the hint's ladder needs; size is the main
  difficulty parameter.
- **The dependency mark is the game's note**: drawn between two arrows,
  toggled by the player, and shared with the hint.

## Open, for the session that takes this up

- Prior art, by a subagent: the arrow-exit genre's rules and generators,
  one-axis sliding-block generators and solvers, and any engine that models
  pieces and move rules declaratively. Credit what is taken.
- How a dependency mark is made with touch, mouse and keyboard, and drawn
  on a large board without clutter: player-visible, so the session brings
  options to the owner where it is unsure.
- The arrow game's name, which must not be an existing app's.

## Risks / Trade-offs

- A model generalized from Slide alone guesses its generality; the arrow
  game is the second user that reshapes it (`docs/doctrine.md`).
- Snake movement and paths as pieces stretch the drawing layer; the
  open question about the engine drawing a game's art
  (`docs/doctrine.md`) is met here first.
