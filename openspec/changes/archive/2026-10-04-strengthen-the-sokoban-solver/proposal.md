# strengthen-the-sokoban-solver

A follow-up from `judge-rivals-for-search-hints`.

## Why

Sokoban's search (`src/games/sokoban/solver.ts`) has a reach, and three things
follow from where it ends:

- **The generator rejects levels** the search cannot finish, so a 16×20 board
  was slow to deal and most levels generated for it were thrown away.
- **A position the player reaches** can still be past the search, and so can a
  level typed or shared by game ID, which the generator never checked. The
  hint then says it is out of reach.
- **A hint request** took a second or more where the plan's first push failed
  the potential check and the rivals had to be searched for one that passed it.

The scaffold put the cause down to lost positions the search could not
recognize, and scoped corral pruning, macros and incremental keys. Measuring
found a different cause (design D2): the search stalls a few pushes from done,
on positions that are not lost, where a barrel sent home early has to come off
its target again.

## What Changes

- **The search ranks a push by its distance from the nearest barrel or target
  still out of place**, which is what took the largest preset from 8 of 30
  openings within the deal's budget to 27 (design D3).
- **Corral pruning**: where floor the player cannot reach is fenced by barrels
  that can only go in, only the pushes into it are searched (D4).
- **The fence check is made when a position is expanded**, not when it is
  generated, which halves the time per position (D5).
- **The hint's potential check stops at the first rival that lowers it** and
  searches those rivals to the plan's budget (D7).
- **`DEAL_BUDGET` is re-chosen** and the deal's loop is bounded (D8).

Tunnel and goal-room macros and incremental position keys were measured and
dropped (D6).

## What it changes for a player

Dealing a 16×20 board takes about a quarter of the time. The hint answers
sooner on the larger boards and reaches positions it used to give up on.
Which board a seed deals changes at the larger sizes, since levels the search
used to reject are now dealt; that is not a compatibility break (AGENTS.md
§ "Upstream policy"), and a board shared as `params:desc` is unaffected.

## Impact

`src/games/sokoban/solver.ts`, `hint.ts`, `generator.ts` and their tests; the
`sokoban` spec gains a requirement on what the search may leave out;
docs/games/hints.md § "Judge the rivals of a searched move".
