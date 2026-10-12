# mend-what-the-guide-rewrite-found

**Status: scaffolded 2026-10-12, not started.** Filed by
`make-the-guides-a-lookup`, whose second readers checked every guide against
the tree. Each item below is a place where the engine, a guard or a spec
disagrees with a rule the guides state, found by reading and not yet
measured further. Every claim here carries that date; re-check it before
relying on it.

## Why

Rewriting the guides changed no rule, so where a guide and the tree
disagreed the guide was made true where the code and the spec agreed with
each other, and left alone where they did not. These are the ones left
alone. None is one game's: each is the skeleton, a cross-game guard or an
engine requirement.

## What was found

**1. The mistake overlay's repaint is proved by nothing a new game
inherits.** `docs/rendering.md` § "Prove the overlay repaints" says a game
with a mistake overlay owes a test that paints twice from one draw state,
because every cell misses the cache on a cold frame.

- The skeleton's own test (`src/skeleton/grid/skeleton.test.ts`) paints its
  mistake on a cold frame only, so a stamped game starts without the test
  the guide says it owes.
- `src/mistake-overlay-coverage.test.ts` accepts any frame painted with
  `showMistakes`, which is a cold one, so the cross-game guard's bar is
  below the rule it is named for. `src/engine/warm-repaint.test.ts` counts
  mistaken frames and requires none.
- `engine-drawing`, "A per-cell overlay reaches the render cache through the
  shared sidecar", says the mistake overlay SHALL go through
  `OverlaySidecar`. The skeleton folds `F_WRONG` into its tile key. Read
  strictly the two disagree, and the skeleton is what the next game copies.

**2. Three games refuse a size for its wait, and the guide says none
does.** `docs/solver-and-generator.md` § "A Custom size is not refused for
its wait" says a large Custom size that deals slowly is not refused. Net,
Signpost and Sticks each refuse an Unreasonable size with "takes too long
to deal" (`src/games/net/state.ts`, `src/games/signpost/index.ts`,
`src/games/sticks/state.ts`), and Net's refusal is in its spec. Beside it:
the guide's default, that a new game writes no refusal for a rare tier and
leaves it to the deal's deadline, is in no spec, while `engine-difficulty`,
"An unbindable tier is refused, not silently downgraded", reads as an
unconditional SHALL.

**3. Engine module headers carry history the comment rule forbids.** Change
ids or counts of games and call sites stand in the headers of
`src/engine/hint-frontier.ts`, `desc-reader.ts`, `grid/index.ts`,
`candidate-plan.ts`, `draw.ts`, `firing-replay.ts` and
`src/engine/mark-all.test.ts`. `docs/new-game.md` § "Comments, and what
earns one" says to delete both on sight. The shape to search for is a
kebab-case change id or a number before "games" or "sites" in a header,
and the population is wider than these seven.

## What Changes

- The skeleton gains the paint-twice mistake test, or the sidecar, whichever
  item 1's reading of `engine-drawing` settles on; the coverage guard is
  held to a warm frame; and the requirement is restated so that it and the
  skeleton agree.
- Item 2 waits for the owner (below).
- The engine's headers lose their history, by the shape and not by this
  list.

## A question for the owner

Item 2 is player-visible either way. Either the three refusals go and those
sizes are dealt under the deadline like any other rare tier, which lets a
player wait up to the deadline for an Unreasonable board at a large size;
or the guide's rule is narrowed to say when a wait is a reason to refuse,
and `engine-difficulty` gains the bar a refusal must clear. Recommendation:
measure the three first (seconds a board at each refused size, by
`scripts/deal-walk.ts`), since a size that deals inside the deadline has no
case for its refusal and one that never does is absent, not slow. Items 1
and 3 can start without an answer.

## Capabilities

`engine-drawing` for item 1; `engine-difficulty` if item 2 is settled by
narrowing the rule. See `.openspec.yaml`.

## Impact

`src/skeleton/grid/`, `src/mistake-overlay-coverage.test.ts`,
`openspec/specs/engine-drawing/spec.md`, headers under `src/engine/`, and,
on the owner's answer, three games' `validateParams` or
`docs/solver-and-generator.md`.
