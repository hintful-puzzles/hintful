## 1. Read before building

- [ ] 1.1 Check the proposal's table in the app (`playwright-cli`): Boats',
      Pattern's, Tents' and Kakurasu's left and right drags, and how Boats'
      water looks beside Pattern's clear square. Correct the proposal where
      the code's reading was wrong.
- [ ] 1.2 Read Tracks' square-marking drag (`src/games/tracks/`) and the
      hand-written Boats' (`git show 0c15e5b38~1:src/games/boats/index.ts`)
      for what a straight drag does that the engine's sweep does not, such
      as Tracks' "a left drag from a square that holds no track yet".
      Record in this change's design notes what the one model keeps.

## 2. The engine

- [ ] 2.1 One drag in `src/engine/fill/play.ts`: either button, what the
      first square became, with `play.straight`; `stroke: line | sweep`
      leaves the schema and the compiler. Keep `sweepWith` only if Light
      Up's one-button drag still needs it after the model; otherwise fold
      it in. Engine tests for both paths, failing first against HEAD.
- [ ] 2.2 Every born description's `play:` moved: `straight` for a game
      whose clues are on rows and columns, free for regions and areas.
      List each game's choice here.
- [ ] 2.3 Boats' water: the player's mark drawn as `clear` draws it, on a
      surface of its own, the waves only on given water; `sea` keeps only
      what given water needs.

## 3. Games, help and specs

- [ ] 3.1 Each game whose drag changed: its help's controls and its
      controls requirement as a delta in this change (`pattern`, `tents`,
      `kakurasu`, and any other 2.2 lists).
- [ ] 3.2 In the app: each changed game dragged both ways, by mouse and
      by touch, and Boats' water in light and dark mode. Run
      `npm run test:hint-sweeps`.
