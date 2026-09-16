# order-hints-from-the-frontier — tasks

Read `design.md` first, then `docs/games/hints.md` § "Recompute-stable plans" and
§ "A rung is not a premise, so return per premise".

## 1. Measure before designing

- [ ] 1.1 On Loopy Hard, record how many firings are available at each plan position,
      and how often a step that jumped had a nearer one available — needs the
      enumeration hook (2.1). **Still the stopping condition for the ordering half:**
      if the jumps were unavoidable, ordering buys nothing.
- [x] 1.2 Note-to-consumer distance: median **15** firings, p90 **87**, max **143** on
      10×10 Hard. Confirmed, and separable from the ordering work (`findings.md`).
- [ ] 1.3 Record generation cost before any change, as the baseline D4 is judged
      against.
- [x] 1.4 Census the defect with the exact read-set from `LoopyReason` plus the grid:
      **14.4%** of steps land ≥4 hops from the previous step, tail 14–17 hops. A tail
      defect, ~1 hint in 7. The first instrument was vacuous and was replaced; both it
      and the replacement are written up in `findings.md`.

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
- [ ] 3.3 `planSteps` groups a note by first use rather than by `tickOf`, and the note
      joins its consumer's journey — for notes whose sentence makes only **monotone**
      claims, which is where the owner's own example sits (D5). Split read out of
      `hint-text.ts`, not assumed.
- [ ] 3.4 A note whose sentence names which edges are still open is placed at the
      **latest** step where that claim still holds, bounding its lag without letting
      its explanation go stale (D5).
- [ ] 3.5 Measure how much of today's note lag sits in each half, so the value of the
      safe fix is known before the harder one is attempted.

## 4. Guards

- [ ] 4.1 The no-orphans guard (D6) on a real plan, seen to fail under a planted
      firing nothing uses (`findings.md`).
- [ ] 4.4 The ordering guard (D6), seen to fail under a reversed comparator.
- [ ] 4.2 A note-adjacency guard: every note step is followed, within its journey, by
      a firing whose closure contains it — **and** its sentence is true of the board it
      is shown on, which is the half moving a note can break (D5). Today's suite checks
      that a note *agrees with the solution*, which a stale open-edge count can pass.
- [ ] 4.3 Generation cost is within the 1.3 baseline.

## 5. Docs and spec

- [ ] 5.1 `ts-engine` delta: the hint ordering requirement.
- [ ] 5.2 `docs/games/hints.md`: how a game supplies its metric, and the history rule
      from D2.

## 6. Report and accept

- [ ] 6.1 Replay the owner's board (10×10 squares Hard) and report the new sequence
      against the old, step by step.
- [ ] 6.2 Owner acceptance of the sequencing, on that board and on one cell game.
