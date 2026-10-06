## 1. Design

- [x] 1.1 Where a kept board lives and what invalidates it. IndexedDB, in a
      database of its own; a row is good for the build that dealt it.
- [x] 1.2 Which types deal ahead: all, or those whose deal is slow. All.
- [x] 1.3 Whether rejects are banked, for which tiers, and whether a banked
      board plays differently from one dealt at its tier. Not banked; see
      design.md.

## 2. Build

- [x] 2.1 The next board dealt ahead and kept.
- [x] 2.2 Rejects graded and banked, if 1.3 says so. It says not.

## 3. Reopen

- [x] 3.1 Group's `tierTooRare` cells that have boards, dealt instead of
      refused, and the spec clause that allowed the refusal revisited.

## 4. Verify

- [x] 4.1 Each new test file seen red with its defect planted.
- [x] 4.2 The app run in Chrome: the second and later deals of Group 6x6 Tricky
      timed, on the dev server and on a production build across a reload.
