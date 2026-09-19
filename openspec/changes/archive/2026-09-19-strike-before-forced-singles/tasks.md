# strike-before-forced-singles — tasks

- [x] 1.1 Pin a Group 8x8 Tricky identity-hidden board that reaches `forcedSingle`,
      and find which solver elimination went unplaced.
      Three of five seeds (`seed0`, `seed1`, `seed4`) reached it. The unplaced
      strikes were **not** a solver elimination: they were the values the plan had
      itself just placed. `emitIdentityFillJourney` filled the identity's row and
      column without striking those values from the other notes in their lines,
      and every later placement read the stale notes. A second path turned up once
      the classifier threw: Group's placement-first arm classified before the
      obvious-cull clean, so a note the player (or a half-followed journey) left
      stale had the same effect.
- [x] 1.2 Place it as a strike step.
      Every journey leg now strikes its value (`emitDupStrike`, shared with
      `emitPlacement`), and the obvious-cull clean runs ahead of the placement arm.
      A third defect in the same arm, found while measuring: on a board with few
      notes or none, a note-less cell read as holding nothing, so every placement
      passed as a hidden single in its row. At 6x6 Normal, 11 of 78 such claims were
      false. `visibleCandidates` reads a note-less cell as the values its row and
      column leave it. `group-hint.test.ts` § "placements on a note-free board"
      guards it, and failed with the fix removed.
- [x] 1.3 Add a cross-game guard.
      Taken differently from the task's wording: rather than a new sweep keyed on
      reason names, the classifier **throws** on the residue, and Salad's plan
      throws on an unexplained marker. The population is every plan that calls the
      classifier, by construction, and the existing hint walks are the guard. With
      Group's old planner restored and the throw in place, `hint-resume` and three
      `group-hint` cases failed with the throw's message.
- [x] 1.4 Delete the arms and their sentences.
      A sweep with the throws planted walked every leaf preset of Group, Keen,
      Salad, Solo, Towers and Unequal for four seeds, applying one step per plan:
      1.35M plan steps, 0 hits. `forcedSingle` (engine, Towers, Solo),
      `forcedCross` / `forcedCircle` (Salad) and their sentences are gone.
- [x] 1.5 Repair `hint-resume.test.ts` § "a Latin-family placement never falsely
      claims a naked single", which was blind to Group: it read the cell as
      `m.x`/`m.y`, and Group's `set` carries `cells[0]`, so it looked up
      `pencil[NaN]`. It passed only because Group never used the naked phrasing on
      its first leaf. After 1.2 Group does, on note-less cells whose row and column
      leave one value, so the guard now reads either move shape and judges a
      note-less cell by what its lines leave it. With hidden singles planted as
      naked, it fails for all four games, Group included.
- [x] 1.6 Update `docs/games/hints.md` § "Re-derive a placement's why", the Group and
      Salad sections, and the audit tells.
