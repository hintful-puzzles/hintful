# declare-region-relations — tasks

- [ ] 1.1 Read how each candidate game builds its regions today (`rowColRegions`,
      Solo's `regionsOf` / `noRepeatRegionsOf`, Salad's `saladRegions`). Since
      `candidate-plan-kit`, a hint plan hands `runCandidatePlan` both lists
      (`regionsOf`, and `cullRegionsOf` defaulting to it) and the walk is the one
      reader of both inside the hint; the other cull consumers are Mark-all and
      auto-pencil in each game.
- [ ] 1.2 The declaration and the two derived lists in the engine; every consumer
      reads the derived list.
- [ ] 1.3 Solo declares its cage as forbidding repeats only; the Killer tests in
      `solo-hint.test.ts` stay green and still fail with the cage declared as
      holding every digit.
- [ ] 1.4 Spec delta modifying "A cell's regions are one definition per relation";
      update `docs/games/hints.md` § "Candidate-elimination games".
