# Tasks

Implemented in `80bd9cc5`; this change records it.

- [x] 1.1 A page opened mid-download learns the total: `PRECACHE_QUERY` from the page (`src/utils/pwa.ts`), answered by the worker with its current progress (`src/sw.ts`)
- [x] 1.2 The page's download state is one reducer, `applyPrecacheMessage`, tested for a page that missed the start, unreadable sizes, completion and reset (`src/utils/precache-plan.test.ts`)
- [x] 2.1 Preferences > Advanced shows the running build's version, and during an update the version it is updating to (`src/dialogs/settings-dialog.ts`)
- [x] 2.2 The version is one constant shared with the About dialog (`src/utils/app-version.ts`); the worker carries its own in each message
- [x] 3.1 Watched in Chrome against a throttled two-build server: a late-joining page and a "check for updates" click both showed percent, size and both versions
- [x] 3.2 Seen on the owner's phone after the deploy
