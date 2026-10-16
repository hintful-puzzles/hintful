# let-an-aim-take-an-effect

**Status: filed 2026-10-16 by `add-cube-hint`, as the engine's**, at the
owner's invitation to write up what the work found hard.

## Why

A move narrated by its subgoal and by what it does cannot say both unless it
also has a look. `sentence` (`src/engine/hint-words.ts`) writes an aim as
"Working on A: …" and an `effect` as "M: E.", so the two together read
"Working on A: roll onto the ringed square: it leaves paint there." with two
colons. Cube's hint met this on three of its five branches and gave up a part
each time: its rolls that put paint down drop the aim (so the outlined goal
disappears for that roll, against `hints-search.md` § "Hold a stable
subgoal"), and its traveling rolls drop the effect and say only the move.
Inertia's `positioning` avoids it only by having a look to put between them.

Any game with a held subgoal and moves narrated by their consequence meets
the same choice, and the engine owns the joins, so the game cannot fix it.

## What changes

- A join for aim + effect with no look that reads as one sentence, for
  example "Working on A, M: E." or "For A, M: E.", chosen by reading it in
  the games that would speak it, and pinned in `hint-words.test.ts`.
- Cube's drop and travel branches take their aim and effect back, within
  the 120-character limit.

## What has to be settled

- Which games build aim + effect with no look today, and what they say:
  measure it from the steps a hint walk produces (by `Sentence.form` and
  whether the step's words hold an aim), not by reading for the phrase.
- Whether "Working on A" stays the one aim wording across the collection.

## Impact

- `src/engine/hint-words.ts`, `hint-words.test.ts`, `docs/hints.md`
  § "A sentence has parts".
- `src/games/cube/hint-text.ts`, and any other game the measurement finds.
