# add-magnets-hint — tasks

Read [`docs/games/hints.md`](../../../docs/games/hints.md) first — in particular
§ "Give the facts a notation (Loopy)", which is the worked precedent for this
change's hard part — and keep the guide current as you go.

## 1. Read the census before designing anything

- [ ] 1.1 Read `magnets-ladder.test.ts`'s firing census and write down, per
      tier, **which of the ten rungs the generator actually reaches, and which
      of the two call sites each belongs to**. Everything below depends on this
      and nothing below should be designed before it is read.
- [ ] 1.2 Count what the census looked at. A census that walked one preset and
      reported health over it is the failure this repo keeps rediscovering;
      check its own vacuity guard.
- [ ] 1.3 Read the two `runDeductionFixpoint` call sites (`solver.ts:446`,
      `:533`) and write down, in one paragraph, what each is *for*. "Two call
      sites" is the headline; which two is the design.

## 2. Settle the notation question — it gates the rest

- [ ] 2.1 Enumerate, from the census, which deductions conclude a **negative**
      (`GS_NOTPOSITIVE` / `GS_NOTNEGATIVE` / `GS_NOTNEUTRAL`) and which
      conclude a placement. Only the first group has a notation problem.
- [ ] 2.2 The UI's flag cycle exposes `notneutral` alone. Decide: extend the
      cycle to all three negatives, or find a presentation a player can manage.
      **Try it in the app before committing to it** — three negatives on a
      domino half may or may not be readable, and that is not decidable from
      the source.
- [ ] 2.3 If a tier's deductions genuinely need a notation that makes the board
      unusable, **the fallback is the tier, not the hint**: that tier refuses
      and says deduction has run out. Record which tier and why. Do not ship a
      hint-only overlay of facts the player cannot record, however clearly it
      draws them.
- [ ] 2.4 Every step the hint emits must *place* the marks it rests on, as
      moves — that is what makes the reasoning reproducible rather than shown.

## 3. One plan, two ladders

- [ ] 3.1 Thread a recorder and build the plan. The framework question: does the
      hint see one ladder or two, and does `runDeductionFixpoint` compose
      without a seam? Whatever the answer, it is this change's main deliverable
      — report it in the proposal's terms.
- [ ] 3.2 If a seam is needed, put it in the engine rather than in Magnets, and
      apply the standing test: *can we say what a game would legitimately want
      to do differently?* If not, it is a convention somebody forgot to make.
- [ ] 3.3 Narrate the domino coupling explicitly. "This half is positive, so its
      partner is negative" has a premise the player can see; a sentence that
      merely points at a cell does not meet the bar.

## 4. Tests

- [ ] 4.1 Enrollment is derived — declaring `hint()` joins every cross-game
      guard, and nothing needs adding to a list.
- [ ] 4.2 Tier-2.5 render scenarios for a placement frame and a negative-mark
      frame, targeted assertions plus a snapshot.
- [ ] 4.3 If the notation changes what the board draws, the render tests of the
      *existing* Magnets suite move. A moved snapshot there is intended; say
      which and why, and do not `-u` past one you have not read.

## 5. Player-visible: this one is the owner's call

- [ ] 5.1 A new notation is something a player sees and feels, and the flag
      cycle is a control that would behave differently. Per `AGENTS.md` §
      "Work management", **show it before settling it** — this is the narrow
      case where acceptance is genuinely owed, not the broad player-visible
      label.
- [ ] 5.2 Check the change works with keyboard, mouse and touch. A three-state
      cycle on a secondary press is exactly where a touch device diverges.

## 6. Close out

- [ ] 6.1 Report the cost in the series' terms: game production lines, of which
      how many are the recording projection.
- [ ] 6.2 Spec deltas: `magnets` for the hint and any notation change,
      `ts-engine` for a runner seam.
- [ ] 6.3 Update `docs/games/hints.md` — especially if this becomes the second
      worked example of the notation rule, which the guide currently illustrates
      with Loopy alone.
