# order-hints-from-the-frontier — tasks

Read `design.md` first, then `docs/games/hints.md` § "Recompute-stable plans" and
§ "A rung is not a premise, so return per premise".

## 1. Measure before designing

- [ ] 1.1 On Loopy Hard, record how many firings are available at each plan position —
      if it is usually one, ordering buys nothing and this change should stop here
      (`findings.md`).
- [ ] 1.2 Measure the distance, in plan steps, between a note step and the firing
      whose closure contains it, on the boards the owner played.
- [ ] 1.3 Record generation cost before any change, as the baseline D4 is judged
      against.
- [ ] 1.4 Census the defect: how many steps in today's plans are **orphans** (nothing
      later rests on them and they determine nothing), and validate the adjacency
      proxy for "advances a chain" against the note-fact closure, where the answer is
      exact (D1).

## 2. The engine's ordering

- [ ] 2.1 `hint-plan.ts`: an optional candidate-enumeration hook, used only when a
      plan is built for a hint; absent it, today's order is unchanged.
- [ ] 2.2 Admissibility first — drop the orphans — then the comparator: expansions
      before chains, cheapest among equals, ties keeping the ladder's own order so the
      result stays deterministic.
- [ ] 2.3 Both predicates ("at a front", "feeds this later step") are supplied by the
      game and read off the board (D2, D3).

## 3. Loopy adopts it

- [ ] 3.1 Enumerate the firings available at the current tier without escalating,
      and without touching the solve path the generator uses (D4).
- [ ] 3.2 Loopy's frontier and feeds-into predicates over edges and dots on every
      tiling, including the aperiodic ones.
- [ ] 3.3 `planSteps` groups notes by first use rather than by `tickOf`, and the note
      joins its consumer's journey (D5).

## 4. Guards

- [ ] 4.1 The no-orphans guard (D6) on a real plan, seen to fail under a planted
      firing nothing uses (`findings.md`).
- [ ] 4.4 The ordering guard (D6), seen to fail under a reversed comparator.
- [ ] 4.2 A note-adjacency guard: every note step is followed, within its journey, by
      a firing whose closure contains it.
- [ ] 4.3 Generation cost is within the 1.3 baseline.

## 5. Docs and spec

- [ ] 5.1 `ts-engine` delta: the hint ordering requirement.
- [ ] 5.2 `docs/games/hints.md`: how a game supplies its metric, and the history rule
      from D2.

## 6. Report and accept

- [ ] 6.1 Replay the owner's board (10×10 squares Hard) and report the new sequence
      against the old, step by step.
- [ ] 6.2 Owner acceptance of the sequencing, on that board and on one cell game.
