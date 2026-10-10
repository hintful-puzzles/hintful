# Tasks

## 1. Measure

- [ ] 1.1 Paste a valid 64x64 board and a valid 50x50 one and see whether
  each loads. Find the largest square board and the longest 2-wide and
  10-wide ones that deal without overflowing the stack, in Chrome.
- [ ] 1.2 Time an Easy deal and an Unreasonable one on boards from 2 to 12
  on the shorter side, every width, with at least five deals at every size
  the bound will admit, a time limit on each deal and a line logged per
  cell.
- [ ] 1.3 List the boards that deal today in under about three seconds and
  the ones that take longer, and choose the bound that refuses the second and
  none of the first. Record the choice in a `design.md`.

## 2. Build

- [ ] 2.1 The connectedness rule without a call a square, reaching the same
  squares in the same order, so that the boards dealt for a seed and the
  hint's steps do not move. Range has no differential test, so record a
  dozen seeds' boards before the change and compare after.
- [ ] 2.2 The bound in `validateParams`, for a board that is to be dealt
  only, with a reason naming what to change, and the Unreasonable bound
  restated from the new sweep.
- [ ] 2.3 Tests: a board at the bound deals at both tiers, one past it is
  refused with the reason, and one past it with a description supplied opens.
- [ ] 2.4 In the running app: the Custom dialog's refusal of a board past the
  bound, and a board at the bound dealt.

## 3. Close

- [ ] 3.1 The spec delta, and remove `skip_specs` from `.openspec.yaml`.
- [ ] 3.2 `help/games/range.md` and `help/differences.md`.
- [ ] 3.3 Commit, push, archive.
