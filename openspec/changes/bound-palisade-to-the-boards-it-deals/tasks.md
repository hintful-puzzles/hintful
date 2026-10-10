# Tasks

## 1. Measure

- [ ] 1.1 Count, for each region size from 3 to 12 and for larger ones at
  15, 20 and 30, how many divisions in how many are kept, on boards from 2 to
  30 on the shorter side, with at least five kept at every size the bound
  will admit. Count draws, and time a division at each.
- [ ] 1.2 List the boards that deal today in under about three seconds and
  the ones that never do, and choose the bound that refuses the second and
  none of the first. Record the choice in a `design.md`.

## 2. Build

- [ ] 2.1 The bound in `validateParams`, for a board that is to be dealt
  only, with a reason naming what to change.
- [ ] 2.2 The retry cap in `easyClues`, sized to the rarest board the bound
  admits, and the comment that says the solver "nearly always" solves a
  division corrected to what was measured.
- [ ] 2.3 Tests: a board at the bound deals at both tiers, one past it is
  refused with the reason, and one past it with a description supplied opens.
- [ ] 2.4 In the running app: the Custom dialog's refusal of a 12x12 board in
  threes, and a board at the bound dealt.

## 3. Close

- [ ] 3.1 The spec delta, and remove `skip_specs` from `.openspec.yaml`.
- [ ] 3.2 `help/games/palisade.md` and `help/differences.md`.
- [ ] 3.3 Commit, push, archive.
