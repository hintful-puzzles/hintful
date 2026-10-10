# Tasks

## 1. Measure

- [ ] 1.1 Time an Easy deal, and count the deals that give up, on boards from
  1 to 25 on the shorter side and up to 900 squares, with at least five deals
  at every size the bound will admit. Say for each give-up whether the fill
  or the strip ran out, and give each cell a time limit so that one that
  never deals costs seconds.
- [ ] 1.2 List the boards that deal today in under about three seconds and
  the ones that give up or take longer, and choose the bound that refuses
  the second and none of the first. Record the choice in a `design.md`.

## 2. Build

- [ ] 2.1 The bound in `validateParams`, for a board that is to be dealt
  only, with a reason naming what to change.
- [ ] 2.2 The retry caps in `newSignpostDesc`, sized to the rarest board the
  bound admits.
- [ ] 2.3 Tests: a board at the bound deals, one past it is refused with the
  reason, and one past it with a description supplied opens.
- [ ] 2.4 In the running app: the Custom dialog's refusal of a 30x30 board,
  and a board at the bound dealt.

## 3. Close

- [ ] 3.1 The spec delta, and remove `skip_specs` from `.openspec.yaml`.
- [ ] 3.2 `help/games/signpost.md` and `help/differences.md`.
- [ ] 3.3 Commit, push, archive.
