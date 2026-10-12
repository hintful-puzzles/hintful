# Tasks

## 1. Decide

- [x] 1.1 Re-take the adoption table in `fit-a-new-game-in-one-session` and
      read two games of the kind that are on every shared way it lists (find
      them by intersecting the `git grep -l` populations). They are the
      source of the skeleton, not Galaxies. No game is on all of them; Tents
      and Clusters cover the list between them (`design.md`, opening).
- [x] 1.2 Write `design.md`: where the skeleton lives so that `tsc -b` reads
      it and no registry-derived or `src/games/*`-derived guard, and no
      bundle, does; how a copy is stamped and renamed; and each choice
      between two allowed ways, with the one taken.
- [x] 1.3 Read `openspec/postmortems/` for the definition adapter and the
      tile loop first: the skeleton is files a game starts from and owns,
      never a layer a game is compiled through.

## 2. Build

- [x] 2.1 The skeleton, as a trivial playable game of the kind, on every
      shared way in the proposal, with its hint.
- [x] 2.2 Its tests, passing.
- [x] 2.3 `scripts/new-game.sh` (renamed from `new-game-port.sh` at the
      owner's word) stamps from it, checks the copy, and prints the checklist
      of what it does not do.
- [x] 2.4 Plant the defect: make a `Game` member required, and see the gate's
      typecheck refuse the skeleton. Stamp a game, register it, run the gate's
      guards against it, and see what a new game is refused for on its first
      day. Each refusal is either mended in the skeleton or listed in the
      printed checklist (`design.md` § "The first day").

## 3. Close

- [x] 3.1 The `repo-layout` delta; `docs/games/README.md` names the skeleton
      as what a new game starts from and stops naming Galaxies as required
      reading.
- [x] 3.2 Each guide that offered the choice the skeleton made now states
      the one way: `docs/games/README.md` § "File anatomy" and
      `docs/games/testing.md` § "What a new game ships". The sections that
      describe how the existing games differ are left to
      `make-the-guides-a-lookup` (`design.md` D5).
- [x] 3.3 "Port" is gone from the script's name and text, the requirement's
      name, and the guides' prose about a new game.
- [x] 3.4 Gate, commit, archive, push.
