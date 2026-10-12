# Tasks

## 1. Decide

- [ ] 1.1 Re-take the adoption table in `fit-a-new-game-in-one-session` and
      read two games of the kind that are on every shared way it lists (find
      them by intersecting the `git grep -l` populations). They are the
      source of the skeleton, not Galaxies.
- [ ] 1.2 Write `design.md`: where the skeleton lives so that `tsc -b` reads
      it and no registry-derived or `src/games/*`-derived guard, and no
      bundle, does; how a copy is stamped and renamed; and each choice
      between two allowed ways, with the one taken.
- [ ] 1.3 Read `openspec/postmortems/` for the definition adapter and the
      tile loop first: the skeleton is files a game starts from and owns,
      never a layer a game is compiled through.

## 2. Build

- [ ] 2.1 The skeleton, as a trivial playable game of the kind, on every
      shared way in the proposal, with its hint.
- [ ] 2.2 Its tests, passing.
- [ ] 2.3 `scripts/new-game-port.sh` stamps from it, and prints the
      checklist of what it does not do.
- [ ] 2.4 Plant the defect: make a `Game` member required, and see the gate's
      typecheck refuse the skeleton. Stamp a game, register it, run the gate's
      guards against it, and see what a new game is refused for on its first
      day. Each refusal is either mended in the skeleton or listed in the
      printed checklist.

## 3. Close

- [ ] 3.1 The `repo-layout` delta; `docs/games/README.md` names the skeleton
      as what a new game starts from and stops naming Galaxies as required
      reading.
- [ ] 3.2 Each guide that offered the choice the skeleton made now states
      the one way.
- [ ] 3.3 Gate, commit, archive, push.
