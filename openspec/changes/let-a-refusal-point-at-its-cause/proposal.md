# let-a-refusal-point-at-its-cause

**Status: scaffolded, not started (2026-10-02).** Found by `add-pegs-hint`.

## Why

A hint refusal is a bare string (`HintResult`'s error, a `HintRefusal`), so it
can name a cause but never mark it. Two refusals are about specific things on
the board and can only count them, which leaves the player to find which ones
are meant:

- Pegs: "2 pegs are cut off where no other peg can ever reach them…"
  (`pegs/hint.ts`, from `frozenPegs`, which knows exactly which pegs).
- Inertia: "The ball can no longer reach a gem…" (`inertia/hint.ts`, from
  `unreachableGems`, which knows exactly which gems).

Both games already compute the elements, and both have a `hintMarks` legend and
a renderer that paints marks from a step's words. The one refusal that does
highlight its cause, `FIX_MISTAKES_FIRST`, can do so only because the midend
owns both the sentence and the overlay. A puzzle-specific refusal has no such
route, and "Undo to a position where it can still be jumped" is advice the
player can follow better when they can see which peg is meant.

## What

Let a game's refusal carry a `Narration` whose references name the elements,
through `puzzleHintRefusal` or a sibling. The midend would display it the way it
displays a step: the banner says the words, and the renderer paints the marks
from them with no move attached. The binding walk (`testing/hint-binding.ts`)
would then hold a refusal's frame to its words just as it holds a step's.

## Open questions for the design

- Whether a marked refusal is a `HintStep` with no move (the midend's display
  path already handles a step) or a new result arm. The first reuses the most
  but breaks "every step has a move", which `hint-gesture.ts` relies on.
- Which role a cause takes: it is what the refusal reasons from, so `outline`
  by the engine's definitions, which both games' legends would gain.
- How it crosses the worker boundary: only `explanation` crosses today.

## Hints to pull in

None. Both callers already have hints, and this change is checked by them.
