# Tasks

## Help

- [x] Guard: every page has the one skeleton, read off `hint()` and `paramConfig`
      (`src/help-coverage.test.ts`), proven red on 44 pages before the rewrite
- [x] `## Hints` for every hinted game, each written from its `hint-text.ts` and
      a rendered hint
- [x] `## Controls` and `## <Name> parameters` on every page
- [x] Correct the help sentences found wrong about this app, and the menu name
      (‘Custom type…’)
- [x] AGENTS.md § "Documentation", hints.md § "The help teaches the marks", the
      definition of done

## Hint defects found while writing the sections

- [x] Boats: a count breach from a middle segment is striped, not ringed
- [x] Spokes: a rule-out is a ring round the dot, not a finished-looking dot
- [x] Solo: "outlined cells", as drawn
- [x] Rome: the `opposite` sentence states both branches (ledgered long)
- [x] Group: "an element" (`noteText`)
- [x] Palisade: drop the unreachable one-unconnected-pair branch
- [x] File Group's note-mistake gap: `share-the-note-mistake-check`

## Render caches

- [x] Census of every game's packed keys
- [x] `engine/candidate-bits.ts`; `OverlaySidecar.struck`; the twelve renderers
      migrated with every snapshot unchanged
- [x] `applyNoteMove` for the six square Latin games; full-set formulas replaced
- [x] Unequal capped at 31 (owner-approved)
- [x] Subsets: the inspect badge reads its own key bit
- [x] `repaint-differential.ts` and `warm-repaint.test.ts`, every registered game
- [x] Triage every warm-repaint mismatch: fix each real one with a warm-draw-state
      test, or fix the instrument (design D5)
- [x] `HintMarks.eraseBeforeTiles`, replacing Keen's and Solo's copies
- [x] Prove the guard red: a cursor bit planted out of Flip's key fails it
- [x] Run the app: the Spokes rule-out ring beside a finished mark, a help page
      in the new skeleton
