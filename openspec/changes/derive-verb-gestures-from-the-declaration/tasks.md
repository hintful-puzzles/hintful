## 0. Mosaic against the model

- [x] 0.1 Read Mosaic's input: its press applies the move, Space already sends
      the right button's `double` (design.md § "Task 0").

## 1. The engine

- [x] 1.1 `verbClicks`, `pressTarget`, `buttonVerb` in `target-verb.ts`, with
      model tests (the untouched-step assertion proven red on a verbClicks that
      judged the midend's own step); `Game.hintGesture` receives the step.
- [x] 1.2 Exemplar: Pattern's gesture and arm through them; the hint walk
      proven red on a target shifted one square.

## 2. The declaring games

- [x] 2.1 Hint gestures: Boats, Bricks, Clusters, Galaxies, Loopy (`set`),
      Palisade and Separate (`borderHintGesture` retired for
      `borderStepEdge`), Spokes, Sticks, Tents, Tracks. Each proven red on a
      planted wrong target.
- [x] 2.2 Arms: the drag games and Mines press through `pressTarget`, and the
      drag games release through `buttonVerb` (Mines' release acts by the
      press's intent, not its button).

## 3. Mosaic

- [x] 3.1 Mosaic declares `targetVerbs`; its help writes `{{controls}}`.
- [x] 3.2 Mosaic's hint, bound to its marks, click steps from `verbClicks`;
      tier-2.5 frames for both rules; `hint-resume`'s cap derived from the
      game's own plan, proven red on a planted no-op step.

## 4. Close

- [x] 4.1 Docs (`hints.md` § "Every step is a gesture", `input.md`,
      `engine-catalog.md`); `ts-engine` delta.
- [x] 4.2 Ran the app (2026-09-30): Mosaic's hint on 3×3 and 10×10 (a "needs
      all" step, a "0" step and a mid-game "already has" step with its block
      outlined), nine steps applied through derived clicks; Tents' hints
      applied three times without error. Mosaic's band thinned to the
      collection's `ts >> 4` after seeing it.
- [x] 4.3 Archive.
