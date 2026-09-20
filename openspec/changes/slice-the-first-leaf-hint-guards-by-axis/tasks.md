# slice-the-first-leaf-hint-guards-by-axis — tasks

## 1. Confirm the blindness per guard, on the board rather than in the source

- [ ] 1.1 The call sites are listed in `proposal.md` and were read, not grepped.
      Before widening anything, take the same printout
      `slice-presets-by-the-axes-a-game-varies` took for the resume walk: for
      each of the eight, what params it actually runs on, per game. Its census
      ran off the live registry through a scratch `*.test.ts` that throws the
      report (the failure message prints in full; vitest silences `console`).
- [ ] 1.2 **Name what each guard would newly see, per game, and say whether it
      could differ.** "More boards" is not a reason; "Killer adds four cage
      sentences and this guard is about sentences" is. A guard whose subject
      genuinely cannot vary with the mode stays narrow **and says which property
      that is** — and that claim is about sentences and marks the guard has
      never rendered, so it is checked, not asserted.
- [ ] 1.3 Carry the vacuity guard: count the cases each guard runs before and
      after, so a widening that silently changed nothing cannot read as a win.

## 2. Measure before widening

- [ ] 2.1 Time each of the eight before and after on an **idle** box, recording
      free memory and swap beside the load average. A contended timing measures
      the contention. Ratios taken under comparable conditions survive where
      absolute seconds do not.
- [ ] 2.2 **These are not a like-for-like substitution for the resume walk's
      figures.** Three of them run five seeds per case
      (`hint-quality.test.ts`'s chain sweep, `hint-ordinal.test.ts`,
      `hint-deixis.test.ts`), so 141 cases is 705 boards, not 141. Decide the
      seed budget and the slice together, and price `seedBudget(gate, full)`
      against a narrower slice rather than assuming both can stay.
- [ ] 2.3 Take the treatments in `docs/games/testing.md` § "Right-sizing the
      gate" **in order** — short-circuit a deterministic search, then turn a
      seed count down, then defer — before reaching for a deferral, and check
      the `build-pipeline` four conditions bind anything deferred to push.

## 3. Widen, and prove each one

- [ ] 3.1 Point each guard at `axisSlice(game, leafPresets(game.presets()))`.
      No new key, no per-guard variant of the rule.
- [ ] 3.2 Per guard, **break something mode-specific and watch that guard go
      red** where it is currently green — the same proof
      `slice-presets-by-the-axes-a-game-varies` ran on the resume walk with
      Solo's Killer tier cap. A widening nobody has seen catch anything has not
      been shown to work, and eight of them is eight proofs, not one.
- [ ] 3.3 Re-examine `hint-ordinal.test.ts`'s `BIGGER_BOARD` roster once the
      slice is in. If Solo reaches a forcing chain without it, the entry goes;
      if not, it is telling the truth and stays with its reason.

## 4. Close out

- [ ] 4.1 Spec delta wherever the verdict lands — `ts-engine`'s "The hint walk
      SHALL cover every preset a game offers" already says *any* cross-game
      sweep over presets asks the same question, so this may be a widening of
      that rule's reach rather than a new requirement.
- [ ] 4.2 Update `docs/games/testing.md` § "Slicing a preset sweep for the gate"
      with the per-guard outcome, and § "How a cross-game guard finds its
      population" rule 6 if the `with*` tell needs sharpening now that eight
      guards have been found by it at once.
