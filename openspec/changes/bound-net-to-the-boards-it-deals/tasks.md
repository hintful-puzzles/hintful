# Tasks

## 1. Measure

- [ ] 1.1 Find where a slow 3x100 wrapping Easy deal spends its time: a time
  limit and a count in `shuffle` and in `finishes`, a line logged per deal,
  until one takes over ten seconds.
- [ ] 1.2 Time an Easy deal and an Unreasonable one on boards from 3 to 12 on
  the shorter side, every width, wrapping and not, with a barrier probability
  of 0, 0.3 and 1, with at least five deals at every size the bound will
  admit, a time limit on each deal and a line logged per cell.
- [ ] 1.3 List the boards that deal today in under about three seconds and
  the ones that take longer, and choose the bound that refuses the second and
  none of the first. Record the choice in a `design.md`.

## 2. Build

- [ ] 2.1 The fix for the tail 1.1 finds, in the loop that has it.
- [ ] 2.2 The bound in `validateParams`, for a board that is to be dealt
  only, with a reason naming what to change, and the Unreasonable bounds
  restated from the new sweep.
- [ ] 2.3 Tests: a board at the bound deals at both tiers, one past it is
  refused with the reason, and one past it with a description supplied opens.
- [ ] 2.4 In the running app: the Custom dialog's refusal of a board past the
  bound, and a board at the bound dealt.

## 3. Close

- [ ] 3.1 The spec delta, and remove `skip_specs` from `.openspec.yaml`.
- [ ] 3.2 `help/games/net.md` and `help/differences.md`.
- [ ] 3.3 Commit, push, archive.
