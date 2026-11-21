## 1. The review

- [x] 1.1 Read the `Game` contract (`src/engine/contract/game.ts`), the
      description schema (`src/describe/description.ts`,
      `description.schema.json`) and Tents end to end.
- [x] 1.2 Measure the 46 fill games' layers: the state against the
      description's model, `index.ts` and input, `render.ts`, the hint, the
      generator. Record each count with its query (`design.md` § "What a
      fill game writes today").
- [x] 1.3 Survey prior art: pzprjs, cspuz, noq/noqx, grilops, PuzzleScript,
      Penpa+, step-wise explanation research.
- [x] 1.4 Write the target, the gap and a staged route.
- [ ] 1.5 Deliver to the owner, and wait for their pick.
      2026-11-21: delivered at `017e0b32c`. The owner answered the C-fixture
      question: retire every tie to the C version with no other benefit;
      census and verdicts in `design.md` § "Ties to the C version". Saves:
      a clean break is accepted. Which stages to file waits on a discussion
      the owner opened of a fully declarative end state.

## 2. The owner's pick

- [ ] 2.1 Scaffold each pick as its own change, in the owner's order. This
      change is archived once the picks are filed.
