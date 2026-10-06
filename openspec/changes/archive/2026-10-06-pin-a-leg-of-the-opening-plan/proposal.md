# pin-a-leg-of-the-opening-plan

A follow-up from `move-the-hint-scans-onto-the-harness`, scaffolded 2026-10-04
and done 2026-10-06. `name-the-rung-a-hint-step-speaks` had already made a
**rung's** pin a position whose plan holds a step of that rung at any leg; this
is what that left.

## Why

Three things were still done by hand around the pin harness (measured
2026-10-06):

- **A predicate kind saw only the step a plan opens with**, so a kind about
  the plan asked the hint again inside its predicate: Netslide's and Palisade's
  `journey`, Slant's `clueWithSecondSquare`. Netslide's plan is a search, so
  its scan paid for every plan twice.
- **A case of a rung that is only a later leg had no kind.** A rung id finds a
  later leg and a predicate did not, so Pearl's two hint frames walked a
  literal board with `hintUntil`, as Rome's, Salad's and Slant's still did
  although their rungs were pinned. Nothing finds such a board again when it
  stops saying the sentence.
- **Some forty tests fed a pin's `id` and `moves` to `renderScenario` and
  compared the sentence on show with the pin's.** That draws the step the plan
  opens with whatever the pin is for. Subsets' "collapse" frame was a snapshot
  of another rung's step, and the sentence comparison cannot tell two legs of a
  journey apart where they say the same thing, which Palisade's do.

## What Changes

- A predicate is given the plan as its third argument.
- A kind may be `{ leg: predicate }`, held by any step of the plan as a rung
  id is. The scan already prefers a position where the step opens the plan.
- `renderPinnedHint(game, pinned(kind))` draws the frame of a pin's step: it
  plays the legs before it through the midend, each run to its settled state,
  and throws where the step on show is not the pin's by sentence and move.
- `hintUntil` leaves `RenderScenario`. With no caller but the helper, the rule
  that a frame is a pin's is one the harness holds and no reader has to.

**The board a later leg is shown on** is the one `Midend.executeHint` leaves:
it plays each leg's gesture, which may commit moves on the way, and
`refreshHintStep` may rewrite a later step against that board. So it is not
rebuilt in the loader by executing the steps' moves, and a `leg` predicate is
given the board the plan was asked from, which is right for what play does not
change. No test asked for more.

## Hints to pull in

None: every game here has its hint.

## What showed it worked

- Pearl's frame snapshot is unchanged with its walk replaced by a `leg` pin,
  and both its pins fail when a `leg` is made to read the opening step only.
- No `hintUntil` is left in `src/` (`git grep hintUntil`).
- Subsets' collapse frame now shows the collapse step; its snapshot moved, and
  Rome's did with its board, which is now the rung's pin.
