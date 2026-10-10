# Tasks

## 1. Measure

- [ ] 1.1 Count, for each letter count from 2 to 9 and for 12, how many
  divisions a dealt board takes, on boards from 2 to 20 on the shorter side,
  with at least five boards dealt at every size the bound will admit. Count
  divisions with a cap low enough that a cell that never deals costs seconds,
  and time a division at each. A run that reports only when every cell has
  finished, over cells that can only fail slowly, was tried first and told
  nothing in twenty minutes.
- [ ] 1.2 List the boards that deal today in under about three seconds and
  the ones that never do, and choose the bound that refuses the second and
  none of the first. Record the choice in a `design.md`.

## 2. Build

- [ ] 2.1 The bound in `validateParams`, for a board that is to be dealt
  only, with a reason naming what to change.
- [ ] 2.2 The retry cap in `easyBoard`, sized to the rarest board the bound
  admits.
- [ ] 2.3 Tests: a board at the bound deals at both tiers, one past it is
  refused with the reason, and one past it with a description supplied opens.
- [ ] 2.4 In the running app: the Custom dialog's refusal of an 8x8 board
  with eight letters, and a board at the bound dealt.

## 3. Close

- [ ] 3.1 The spec delta, and remove `skip_specs` from `.openspec.yaml`.
- [ ] 3.2 `help/games/separate.md` and `help/differences.md`.
- [ ] 3.3 Commit, push, archive.
