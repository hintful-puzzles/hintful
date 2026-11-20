## 1. Census

- [x] 1.1 Re-take the hook counts at run time from the registry (a `git grep`
      misreads `notApplicable` keys). Record which hooks every game has,
      which serve one to five games, and the hint fields each builder
      produces.

      Taken 2026-11-20 over the 65 registered games, by `Object.hasOwn` on
      each game object in a throwaway vitest file. Every game had `solve`,
      `paramConfig`, `preferredTileSize` and five of the hint's fields
      (`hint`, `hintRungs`, `hintMarks`, `hintKeepTrack`, `hintGesture`);
      `judgeMove` served 44, `refreshHintStep` 28. One to five games: `doneClues` 5, `encodeUi` and
      `decodeUi` 5, `paletteScheme` 5, `reference` 4, `flashLength` 4,
      `rulesOut` 4, `timerHolds` 3, `serializeMove` and `deserializeMove` 2,
      `uiUpdateClearsHint` 2, `hover` 2, `supersededDesc` 1, `keyStatus` 1.
      The builders produced: `describedHint` {hint, judgeMove,
      hintKeepTrack, hintRungs}; `describedEdgeHint` {hint, judgeMove};
      `describedFiringHint` {hint, judgeMove, hintKeepTrack,
      refreshHintStep, rulesOut?}.

## 2. The contract

- [x] 2.1 Make the universal hooks required; remove the fallbacks at their
      call sites. `solve`, `paramConfig` and `preferredTileSize` are
      required; `solve` left the draft sections (every game has one, and a
      solver that cannot answer returns a `SolveFailure`), and `canSolve`
      went with it.
- [x] 2.2 One hint capability object; the builders return it whole and each
      game hands it over. `Game.hint` is a `GameHint` (`plan`, `rungs`,
      `marks`, `keepTrack`, and `gesture` or `targets`, `refreshStep`,
      `judgeMove`, `uiUpdateClears`). The three builders return their part
      under those names, and the firing builder nests it as `hint` beside
      `rulesOut`. Unruly, Light Up, Singles, Boats and the firing games
      that took the part unchanged spread it. **Declined**: spreading the
      edge builder's two members (`plan`, `judgeMove`) in its sixteen
      games, which name them because their tests call the plan directly;
      two named fields are no harder to read than a spread.
- [x] 2.3 Derive `hintGesture` from `targetVerbs` where a game's body only
      restates it; plant a wrong gesture in one game and see the guard fail.
      Sixteen hints (Palisade, Separate, Sticks, Black Box, Norinori, Star
      Battle, Mines, Clusters, Pattern, Tracks, Flip, Twiddle, Bricks,
      Spokes, Mosaic, the grid skeleton) name `targets`; the engine's
      `hintGesture` (`target-verb.ts`) clicks them through `verbClicks`, and
      the registry refuses a hint with both or neither, or `targets` without
      `targetVerbs`. Loopy, Tents, Boats and Galaxies keep a gesture: each
      mixes verb clicks with drags or a notes-mode press. Planted Flip's
      targets as `{x: m.y, y: m.x}`: `hint-gesture.test.ts` failed on Flip
      ("no button's verb keeps the step on target 0 of 1"); un-planted.
- [x] 2.4 The draft rule keys on the standard refusal; the skeletons stamp
      a game that is a draft until its hint is written. A draft registers
      `hint: DRAFT_HINT`, and `sections.ts` and `hasHint` read that.
      **Changed from the proposal**: `DRAFT_HINT.plan` throws instead of
      returning the standard refusal. A draft offers no Hint control, so a
      refusal would be shown nowhere, and a guard that forgets to skip a
      draft then fails loudly instead of reading a refusal as a verdict on
      the board. The skeletons ship with their hints written, so they stamp
      nothing; `docs/mechanics.md` § "Contract sections, and what makes a
      draft" tells a port to register `DRAFT_HINT` until its hint is.
- [x] 2.5 Decide each rare hook: keep, fold into a capability, or replace by
      a declaration. Record each decision here.
      - `uiUpdateClearsHint`: folded into the hint, `hint.uiUpdateClears`.
      - `encodeUi`/`decodeUi`: folded into `uiCodec { encode, decode }`, and
        `serializeMove`/`deserializeMove` into `moveCodec { serialize,
        deserialize }`, so a game cannot write a save half it cannot read.
        The save format is unchanged.
      - Kept, each already a declaration or a capability object: `doneClues`
        (verbs the engine runs and the help reads), `paletteScheme`,
        `reference`, `rulesOut`.
      - Kept, each a function of the position no declaration can say:
        `flashLength` (Mines flashes on a death, not a completion),
        `timerHolds`, `hover`, `supersededDesc` (Mines' first-click board),
        `keyStatus` (Wordguess's key colors).

## 3. Finish

- [x] 3.1 Guides describe the contract as it is. Run
      `npm run test:hint-sweeps`; commit, push, archive. The guides, the
      specs that named the old hooks, and the comments are renamed. The
      sweeps passed, and in Chrome Flip and Palisade were auto-solved
      through their targets, Show solution is offered, and Palisade's
      Custom dialog opens with its fields.
