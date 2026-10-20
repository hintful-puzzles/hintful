# Tasks

## 1. Decide

- [x] 1.1 Measure which games speak aim + effect with no look, from a hint
      walk's steps.
      2026-10-20, every hinted game's gate presets × seeds 1–3, played to the
      end by its own hint, keyed on `Sentence.form` and whether the words open
      "Working on": no game spoke aim + effect with no look, and none held two
      colons in one sentence. Aims are spoken by Cube, Fifteen, Inertia,
      Netslide, Sixteen and Twiddle; all but Cube and Inertia use `serves`
      only, and Inertia's aimed effects all have a look. Cube was the one
      game giving a part up: its drop and forced-drop rolls (112 of 471 steps)
      named no goal, and its travel rolls (128) said no effect.
- [x] 1.2 Choose the join by reading it in those games' sentences.
      "Working on A, M: E.": the effect relation keeps its one form, "M: E",
      everywhere in the collection, and "Working on A" stays the one aim
      wording; only its punctuation follows what comes after. "For A, …"
      would be a second aim wording, and "Working on A: M; E." a second
      effect form. The engine applies the comma wherever the body's first
      sentence has its own colon (also "L, so F: M."), and refuses a run's
      effect right after an aim, whose "First"/"Next"/"Last" would open
      mid-sentence; no game builds one.

## 2. Build

- [x] 2.1 The join in `hint-words.ts`, pinned in `hint-words.test.ts`, and
      `docs/hints.md` § "A sentence has parts".
- [x] 2.2 Cube's drop and travel branches take their aim and effect back.
      Forced drops too, since § "Hold a stable subgoal" holds the goal across
      every roll of the leg: within 120 characters only with a shorter look
      ("paint must go down before any comes up") and effect ("it leaves
      paint"). After: 152 of 471 walked steps name the goal; the rest are
      legs whose goal is still plain, which no outline can call painted.
