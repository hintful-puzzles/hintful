# keep-a-board-at-its-own-tier — tasks

- [x] 1.1 Rule out the id path: the owner's short id grades to Normal on every
      load, from any params set before it.
- [x] 1.2 Find the reload path in Chrome: the URL loses `?id=` after load, and
      reloads restore from the autosave or `lastGameId`, both carrying full
      params. A record written before grading existed pins `d0`.
- [x] 2.1 Check a pinned tier against the board in `withBoardTier`, and apply
      it to `loadGame`.
- [x] 2.2 Split `boardParams` from `params`, with every board reader moved over.
- [x] 2.3 Tests in `midend.test.ts` (pinned id raised, pin above the need kept,
      stale save raised, choosing a type leaves the board alone), and the
      owner's board pinned Easy by id and by save hinted to solved in
      `bridges-hint.test.ts`. Each proved red with its fix planted off.
- [x] 2.4 Spec deltas: `ts-engine` REMOVED + ADDED for grading, ADDED for the
      params split, and a MODIFIED `app-shell` requirement.
- [x] 2.5 In Chrome, the owner's board under an Easy-pinned id opens as
      "10x10 Normal".
