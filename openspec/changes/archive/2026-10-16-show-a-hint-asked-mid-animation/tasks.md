# Tasks

- [x] 1.1 Reproduce in-process (a `Midend` test, or the puzzle worker's
      client) and name where the step's words are lost.
      `Midend.hint()` re-displayed the plan's current step, which was still the
      step in flight: `executeHint` advances the plan only when its move
      settles. The settle then advanced the plan and, in hide-after mode, hid
      it, so the stepper was armed over a step nobody saw.
- [x] 1.2 Fix it in the stepper or the midend, for every game.
      `hint()` settles an executed step still animating before it answers, as
      `executeHint` already did.
- [x] 1.3 A guard over every game that animates a hinted move, seen to fail
      before the fix (`src/engine/hint-mid-animation.test.ts`; ten games
      failed without the fix, Fifteen and Target among them).
- [x] 1.4 Run the app: press Hint, Apply, Hint quickly on Target and Fifteen.
      Both show the next step's words and marks at once and still 2 s later,
      and the next press applies that step.
- [x] 1.5 Write the spec delta for the requirement it settles; archive.
