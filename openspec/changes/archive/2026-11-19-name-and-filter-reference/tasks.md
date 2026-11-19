# Tasks

## 1. The engine

- [x] 1.1 `Game.reference` becomes `{ title, model, select }` (D1); the model loses `title`, gains `search` and `filters` (D2); `referenceTitle` replaces `hasReference`. Verify: `npm run typecheck`, `midend.test.ts`, capability-surface snapshot.

## 2. The app

- [x] 2.1 The toggle reads the title, "Hide …" while open. Verify: `game-controls` test, the app.
- [x] 2.2 The panel's search box and filter buttons with counts; empty sections hidden; reset for another game (D2, D3). Verify: a panel test, the app.

## 3. The games

- [x] 3.1 Dominosa: titled "Dominoes", no search, no filters. Verify: `dominosa.test.ts`.
- [x] 3.2 Wordtrail: search, "Fits" and "Found". Verify: `wordtrail-dictionary.test.ts`.
- [x] 3.3 Wordguess: every answer word A–Z, unfitting struck, search, "Fits" (D4). Verify: `wordguess.test.ts` scenarios; the hint's count equals the "Fits" count.
- [x] 3.4 Help pages of both word games and `help/features.md`; `docs/mechanics.md` § "The reference aid". Verify: help-coverage.

## 4. Finish

- [x] 4.1 Run the app: both dictionaries' search and filters, the toggle's names, Dominosa; the time to repaint Wordguess's list after a guess. Verify: screenshots.
- [ ] 4.2 Commit, archive, push.
