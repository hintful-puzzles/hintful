# Tasks

## 1. Measure

- [ ] 1.1 Time an Easy deal and an Unreasonable one, and count the deals that
  give up, on boards from 2 to 13 on the shorter side at 5%, 10%, 20% and 40%
  blocks and at each symmetry, with at least five deals at every size the
  bound will admit and a time limit on each cell.
- [ ] 1.2 List the boards that deal today in under about three seconds and
  the ones that take longer, and choose the bound that refuses the second and
  none of the first. Record the choice in a `design.md`.

## 2. Build

- [ ] 2.1 The bound in `validateParams`, for a board that is to be dealt
  only, with a reason naming what to change, and the Unreasonable bound
  restated with the share of blocks in it.
- [ ] 2.2 The retry cap in `clueFill`, sized to the rarest board the bound
  admits.
- [ ] 2.3 Tests: a board at the bound deals at both tiers, one past it is
  refused with the reason, and one past it with a description supplied opens.
- [ ] 2.4 In the running app: the Custom dialog's refusal of a 13x13 board
  and of a 10x10 board with 5% blocks, and a board at the bound dealt.

## 3. Close

- [ ] 3.1 The spec delta, and remove `skip_specs` from `.openspec.yaml`.
- [ ] 3.2 `help/games/sticks.md` and `help/differences.md`.
- [ ] 3.3 Commit, push, archive.
