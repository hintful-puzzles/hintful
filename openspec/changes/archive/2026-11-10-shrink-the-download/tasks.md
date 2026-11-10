# Tasks

The owner's direction (2026-11-10): low-hanging fruit only, and a downloader
that is code-agnostic, so nothing in it is maintained as the codebase evolves.
`proposal.md` § "Decisions (2026-11-10)" holds the measurements and what was
let go.

- [x] 1.1 Measured at HEAD on 2026-11-10: wire size against the estimate, the icons' lossless and lossy options, brotli against gzip (`proposal.md` § Decisions)
- [x] 1.2 The owner chose: low-hanging fruit, code-agnostic. The worker split, a size budget and the lossy icon palette are let go (reasons in `proposal.md`)
- [x] 2.1 The download's size shown in every offline status that has one: not downloaded, downloading (of N), downloaded, update downloaded, up to date
- [x] 2.2 Progress by bytes, from the settings opened from a game and from the main page. Both open one `settings-dialog`; watched from a game in a built app against a slowed server: "downloading 82% of 1.8 MB", "downloaded, 1.8 MB"; the first-install figure follows bytes (file 181 of 306 was at 69%)
- [x] 2.3 Diff downloads: updates already fetch only files whose URL or revision changed; measured with a one-file change (1 file, 2 KB)
- [x] 3.1 Every emitted PNG recompressed losslessly at build (`vite-plugins/optimize-png.ts`): icons 458 KB to 294 KB, the whole download 1,946,639 to 1,777,519 bytes; all 124 built icons compared pixel for pixel with their sources
- [x] 3.2 The worker's planning and progress are a pure module with unit tests (`src/utils/precache-plan.ts`); the build guard fails if the size file lists under 95% of the precached files (planted and seen to fail)
