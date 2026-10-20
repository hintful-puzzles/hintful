# Tasks

**The owner chose the fold, and a declared verb for "rule it out" that keeps
each game's own marks (`proposal.md` § "The owner's answers", 2026-10-20).**

## 1. The probe and the guard

- [ ] 1.1 Add the probe to `engine/testing/input-probe.ts`: does any
      secondary gesture differ from the primary one at the same place (the
      comparison `proposal.md` § "Why" describes). Take the census of all 57
      again and compare it with the proposal's table.
- [ ] 1.2 Turn the biconditional of `input-parity.test.ts` onto it, and see
      it refuse Inertia, Slide and Untangle before anything else changes.

## 2. The engine owns it

- [ ] 2.1 Write the `engine-input` delta for the owner's answer, and the
      `ts-engine` one if the flag is renamed.
- [ ] 2.2 The engine gives a mouse's right button its one answer for a
      declaring game, before the game is asked.
- [ ] 2.3 Inertia, Slide and Untangle declare the fact; `asPrimary` and
      Untangle's class tests go. Their specs and help pages follow.

## 3. The ruled-out verb

- [ ] 3.1 A `ruledOut` verb in `TargetVerbs`, in place of `secondary`, which
      the model puts on the right button and Space; the game keeps its
      `does` and its mark.
- [ ] 3.2 The twelve games whose right button rules a target out declare it
      (re-count from `targetVerbs` first), and a guard the declaration makes
      possible holds them, seen failing first.
- [ ] 3.3 `docs/input.md` § "Targets and verbs" names the verb where it
      states the rule.

## 4. Verify

- [ ] 4.1 The guard is green over every registered game, and fails again
      with one game's declaration removed and with one fold put back.
- [ ] 4.2 In the app, with a mouse and with touch: a right click, a
      right-button drag, a held finger, and the bar, in one game of each of
      today's three kinds.
- [ ] 4.3 `docs/input.md` § "A touch hold arrives as the right button"
      states the ways that are left.
- [ ] 4.4 Gate, commit, archive, push.
