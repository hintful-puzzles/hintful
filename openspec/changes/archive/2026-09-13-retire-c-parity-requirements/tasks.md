# Retire the C-parity requirements

## 1. Specs

- [x] 1.1 Read every spec whole — the keyword census is a superset and also
      misses wording — and classify each C mention: an obligation to match
      upstream's C output (in scope), or origin credit, history, this app's own
      ID/save stability, the MIT notices, or the frozen differentials as a
      refactoring net (out of scope).
- [x] 1.2 Game specs: remove or restate each parity obligation, keeping the
      behavior that survives; a heading that asserts parity is `REMOVED` +
      `ADDED`. Kept, as rules rather than parity: behaviors defined by
      reference to upstream's ("computes live errors as upstream"), upstream
      encodings and presets, "parity" meaning a mathematical parity (Sixteen,
      Twiddle, Slant, Tracks, Dominosa). A hint's "recording leaves the
      generator unchanged" stays; "verified by the C differential" goes, in
      every game that said it.
- [x] 1.3 `random`, `grid`, `latin-solver`: restate byte-identity with upstream
      as stability across this app's builds where a player's game ID depends
      on it; drop the rest. Grid's face order stays pinned because a Loopy
      description indexes clues by face.
- [x] 1.4 `ts-engine`, `ts-migration`, `repo-layout`, `build-pipeline`: the
      parity scenarios, the dev-time C-vs-TS harness `SHOULD`, and the
      obligation to keep upstream's acceptance check reachable — including
      `ts-engine`'s permission to keep a moved rung behind a differential-only
      flag. `build-pipeline` needed nothing.
- [x] 1.5 `app-shell`'s "C/WebAssembly engine" mention, missed by the previous
      change's `C/WASM` key.

## 2. Guidance

- [x] 2.1 `AGENTS.md`: drop "Assuming you must choose … keep the oracle as a
      test" and say no requirement asks for C compatibility.
- [x] 2.2 `docs/games/`: `testing.md`'s "Try to keep both",
      `solver-and-generator.md`'s rule and its "Keep the oracle and ship the fix"
      section (now "Retained upstream paths are history, not the default"), a
      `hints.md` sentence and a `README.md` example; repoint Crossing's two
      citations of the old heading.

## 3. Verify and conclude

- [x] 3.1 Word-level diff of every `MODIFIED` block against its live requirement,
      read in full: 47 modified, 54 removed, every difference intended.
- [ ] 3.2 Re-run the census on the archived specs and read what remains.
- [ ] 3.3 `openspec validate --all --strict`, archive, full gate on the commit.
