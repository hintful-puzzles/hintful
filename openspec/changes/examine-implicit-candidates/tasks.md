# examine-implicit-candidates — tasks

**Nothing here is started.** Read the proposal, then
[`docs/games/hints.md`](../../../docs/games/hints.md) § "Candidate-elimination
games" and § "A graph, not a grid (Map)".

## 1. Read the code

- [ ] 1.1 List every place the candidate walk and its helpers treat empty notes
      as "no candidates", and what each would do under "derive them".
- [ ] 1.2 Read Group's `visibleCandidates` and decide whether it is the
      implicit reading in miniature (and so the engine's to own) or something
      narrower.
- [ ] 1.3 Sketch the option on `runCandidatePlan`: what populate, the obvious
      clean and the dup culls become under it, and whether any of them
      disappears.

## 2. Measure, per candidate game

- [ ] 2.1 Share of plan steps that are populate or clean, over every preset.
- [ ] 2.2 Steps until a clue-driven elimination forces notes under the implicit
      reading.
- [ ] 2.3 Premise cells read per step, under each reading.
- [ ] 2.4 For Map, the same numbers under a populate-first reading, so its
      choice is argued from data too.

## 3. Decide

- [ ] 3.1 Convention, per-game default, or player preference: a recommendation
      with the numbers, to the owner (player-visible).
- [ ] 3.2 If it goes ahead: the spec deltas (ts-engine candidate plan; any
      game's prefs), and the multi-cell-premise duty from Map's playtests
      written into the walk rather than left to each game.
