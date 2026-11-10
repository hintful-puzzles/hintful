# Tasks

- [ ] 1.1 Re-measure the table in `proposal.md` at HEAD, and measure each option it names (icon sizes and formats, a per-game worker split's first-open size); bring the owner the questions with those numbers
- [ ] 1.2 The owner's answers recorded, and the rest of this list written from them
- [x] 2.1 The download's total size shown wherever offline content is, before and during the download (owner, 2026-10-31). `precache-size.json` from the build; "not downloaded (about 1.9 MB)", "downloading 42% of 1.9 MB"
- [x] 2.2 Its progress as a percentage of bytes. Both entry points open the same `settings-dialog` and `renderOfflineStatus()`, so there is one status; the game's opening showed none because nothing differs in the code to show it (not reproduced). Checked in a built app: the worker's messages carry bytes, and an update counts only the files it fetches (one changed help page: 1 file, 2,257 bytes, 100%, complete)
- [ ] 2.3 Owner's question 2026-11-10: is the download from scratch, could it be a diff? Answered: updates already fetch only files whose URL or revision changed (Workbox precache); only the first install is whole. Finer than a file needs a delta server, so the lever is smaller files: the worker split above
