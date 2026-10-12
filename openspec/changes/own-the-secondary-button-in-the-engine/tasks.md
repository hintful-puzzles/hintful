# Tasks

**Waits on `proposal.md` § "The question for the owner": fold or drop.**

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

## 3. Verify

- [ ] 3.1 The guard is green over all 57, and fails again with one game's
      declaration removed and with one fold put back.
- [ ] 3.2 In the app, with a mouse and with touch: a right click, a
      right-button drag, a held finger, and the bar, in one game of each of
      today's three kinds.
- [ ] 3.3 `docs/input.md` § "A touch hold arrives as the right button"
      states the ways that are left.
- [ ] 3.4 Gate, commit, archive, push.
