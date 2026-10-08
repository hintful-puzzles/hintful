## 1. The pin

- [x] 1.1 Run 1.14.0 and 1.14.1's `validate --all --strict` against the tree
      before installing either. 1.14.0: no finding above a note. 1.14.1: 83 of
      85 items fail.
- [x] 1.2 Pin `@fission-ai/openspec` at exactly `1.14.0` and run
      `openspec update`. `npx openspec --version` reports 1.14.0.
- [x] 1.3 The version check refuses a range. Seen failing on a planted
      `^1.14.0`, and passing on the exact pin.
- [x] 1.4 The gate passes, whole, on the commit.
