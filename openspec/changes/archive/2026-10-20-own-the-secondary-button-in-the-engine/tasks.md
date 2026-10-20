# Tasks

**The owner chose the fold, and a declared verb for "rule it out" that keeps
each game's own marks (`proposal.md` § "The owner's answers", 2026-10-20).**

## 1. The probe and the guard

- [x] 1.1 Add the probe to `engine/testing/input-probe.ts`: does any
      secondary gesture differ from the primary one at the same place (the
      comparison `proposal.md` § "Why" describes). Take the census of all 57
      again and compare it with the proposal's table.
      `secondaryAction` asks, per gesture, whether it differs both from the
      sequence without it and from the sequence on the primary button. Its
      census (2026-10-20, 58 games) matched the proposal's table once
      Rectangles was seen: its eraser acts only on edges inside the box it
      spans, so the probe gained a prime that drags to one neighbor before
      the gesture drags to another (`proposal.md` § "What the work found").
- [x] 1.2 Turn the biconditional of `input-parity.test.ts` onto it, and see
      it refuse Inertia, Slide and Untangle before anything else changes.
      It refused exactly those three.

## 2. The engine owns it

- [x] 2.1 Write the `engine-input` delta for the owner's answer, and the
      `ts-engine` one if the flag is renamed. The flag keeps its name: what
      it declares, that the game does nothing with the right button, has not
      moved; only the engine's answer to it has. The `ts-engine` delta
      restates the derivation, and Inertia's and Slide's specs say they
      declare it.
- [x] 2.2 The engine gives a mouse's right button its one answer for a
      declaring game, before the game is asked: `Midend.processInput` hands
      it the left button's codes, and `midend.test.ts` holds the keys clear
      of the fold.
- [x] 2.3 Inertia, Slide and Untangle declare the fact; `asPrimary` and
      Untangle's class tests go. Their specs and help pages follow. Their own
      help pages never named the right button; `help/features.md` lists the
      eleven games and says what a right click does there.

## 3. The ruled-out verb

- [x] 3.1 A `ruledOut` verb in `TargetVerbs`, in place of `secondary`, which
      the model puts on the right button and Space; the game keeps its
      `does` and its mark. Built as `secondary: rulingOut({ … })`, a marked
      verb that `primary` refuses at the type level, so every reader of the
      `secondary` slot is unchanged (`proposal.md` § "What the work found").
- [x] 3.2 The twelve games whose right button rules a target out declare it
      (re-count from `targetVerbs` first), and a guard the declaration makes
      possible holds them, seen failing first. Seventeen declare it; the
      guard holds a game declaring `Game.rulesOut` to a ruling-out right
      button, and failed on Tents with the declaration taken off.
- [x] 3.3 `docs/input.md` § "Targets and verbs" names the verb where it
      states the rule.

## 4. Verify

- [x] 4.1 The guard is green over every registered game, and fails again
      with one game's declaration removed and with one fold put back. Cube
      with the flag off, and Untangle with a fold put back, each failed with
      its own message.
- [x] 4.2 In the app, with a mouse and with touch: a right click, a
      right-button drag, a held finger, and the bar, in one game of each of
      today's three kinds. Cube (declared before): a right click rolls the
      cube. Inertia (folded by hand before): a right click moves the ball, a
      finger held 600 ms on the ball then swiped aims and plays west, and the
      bar has no toggle. Slide and Untangle: a right drag moves the block and
      the point. Tents (an action of its own): a right click makes grass and
      the toggle is shown.
- [x] 4.3 `docs/input.md` § "A touch hold arrives as the right button"
      states the ways that are left.
- [x] 4.4 Gate, commit, archive, push.
