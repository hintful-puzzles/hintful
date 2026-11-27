## Next

2.2 step 3b with 3.2: the `fencing` fixture (design.md § "The fixtures")
and a divided partition (`deal.divide`) sampled as its answer, the value
painted `wall` on the edges between two parts and the other value on the
rest (design.md § "Each concept, its form on an element, in order", 3).
Every other step is done, and lacing (3.1) is the model of a fixture's
tests: `edge-answer.test.ts`. What an edge answer refuses is
`describe/fill/cell-only.ts`; a partition fixture that needs one of those
lifts it there, with what the engine then does on an edge.
To look at a fixture in the app, copy its description under
`src/games/<id>/` with a `catalog:` block, run `npm run describe`, and
delete the copy after; Chrome refuses `file://` SVGs, so a recording is
read with `toSvg` and `rsvg-convert`. Open: none.

## 1. Design

- [x] 1.1 What the groups' answers are, and where the fill engine assumes
      a cell: design.md.

## 2. Generalize

- [x] 2.1 The board and its slots by sort; cell games unchanged (their
      cases, snapshots and fingerprints pass).
- [ ] 2.2 Each per-cell concept per slot, a registry a commit, as
      task 1.1 orders them.
  - [x] 1 The board (with 2.1).
  - [x] 2 The answer: the text format, an edge's text its edge painter's
        (`render/pieces/edge-value.ts`); a value on an edge has no glyph.
  - [x] 3 The deal: scatter over elements. The rest of the deal (derived
        clues, hide, codec, `aux`) needed nothing: lacing deals and solves
        to its `aux` (`edge-answer.test.ts`).
  - [ ] 3b A divided partition sampled as walls, with 3.2's fixture.
  - [x] 4 The drawing: edge painters in a fifth tile word, the edge
        word; an edge reddened; a number on a disc the lines run in to.
  - [x] 5 The input: edge targets, the half-grid cursor.
  - [x] 6 The hint: an edge ringed; the gesture.
  - [x] 7 The refusals of what assumes a cell, `rulesOut` among them.

## 3. Fixtures of the new sorts

- [x] 3.1 An edge-answer fixture, dealt, drawn, played and hinted end to
      end, and run in the app.
- [ ] 3.2 A partition fixture, the same.

## 4. Close

- [ ] 4.1 `describe-the-whole-catalog`'s design says what the regions and
      lines groups start from.
- [ ] 4.2 `npm run test:hint-sweeps`; the app run on three born games.
- [ ] 4.3 Archive. Then follow `describe-the-whole-catalog` § "0. The
      refactor first" for what comes next.
