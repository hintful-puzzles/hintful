# show-loopy-segment-connectivity — tasks

Read `proposal.md`, then `docs/games/rendering.md` on the palette's three layers.

## 1. The engine gains a hover

- [x] 1.1 `Game.hover(state, ui, ds, p)` — **typed to return `UiUpdate | null`**, so a
      hover cannot make a move by construction. `p === null` is the pointer leaving the
      board, which a game must treat as "nothing hovered" or its highlight outlives the
      pointer.
- [x] 1.2 `Midend.tracksHover` (derived from `game.hover !== undefined`) and
      `Midend.processHover`. Returning `null` from the hook means "nothing changed" and
      the midend repaints nothing — the economy a pointer sweep depends on.
- [x] 1.3 The transport: `EngineSurface` + `worker-adapter`. `tracksHover` is a
      **method**, not a getter, because this surface crosses Comlink where a getter
      does not survive.
- [x] 1.4 `Puzzle.processHover` drops a hover while one is in flight and keeps only the
      latest, deliberately **outside** `enqueueInput` — that queue keeps real moves in
      order, and queueing hovers would make a fast sweep arrive late rather than less.

## 2. The view

- [x] 2.1 `handlePointerMove`'s untracked branch (this is the whole of what was
      allegedly a missing pipe) plus `@pointerleave`, coalesced to one per animation
      frame. The leave is sent uncoalesced, because dropping *that* message is exactly
      how a highlight outlives the pointer.
- [x] 2.2 `hoverTracked` asked once per game in `updated()`, so a game without the hook
      costs no messages at all.

## 3. Loopy

- [x] 3.1 `lineRun(state, edge)` reads the run off the same dsf `checkCompletion`
      builds — one notion of connectivity, two readers.
- [x] 3.2 `LoopyUi.hoverEdge`, set only for an edge that carries a line, and `null` on
      unchanged so a sweep within one tile repaints nothing.
- [x] 3.3 Drawn as a halo under the run, in `COL_CURSOR` and at the cursor's own halo
      thickness. **No new color**: the keyboard cursor's halo already means "where your
      attention is", the two belong to different devices (a click hides the keyboard
      cursor), and extent tells them apart — one edge against a whole run.
      `highlightWash` would have been the exact semantic match and was rejected on
      measurement: it is `scale(background, 0.78)` with no authored dark value, so on a
      dark board it is darker than the board and invisible.

## 4. Tests

- [x] 4.1 `midend.test.ts` § "Midend pointer hover": a game without the hook reports no
      tracking and swallows a hover; a hook returning `null` repaints nothing; a leave
      arrives as `null`.
- [x] 4.2 `loopy-render-scenario.test.ts` § "the hovered run": the **partition** —
      hovering one run halos its edges and not a disjoint run's. A count-only check
      would pass on a highlight that lit every line, which is why the assertions name
      edges.
- [x] 4.3 **Seen to fail.** Haloing every drawn line instead of the run reddens the
      partition test (`[0, 1, 5]` against `[0, 1]`); dropping the unchanged-hover
      `null` reddens the repeat-hover test.
- [x] 4.4 Two tree-wide guards caught this, as `docs/games/testing.md` now warns they
      do. `capability-surface.test.ts` is an intended re-baseline (`hover`,
      `hoverEdge`; two lines). `help-coverage.test.ts` refused a new optional `Game`
      member with nowhere a player is told about it — which is the guard working, and
      is why 5.1 exists.

## 5. Docs

- [x] 5.1 `help/features.md` § "Seeing what is joined to what", and the
      `CAPABILITY_COVERAGE` entry pointing at it. Says plainly that it is mouse-only.
- [x] 5.2 `help/games/loopy.md`: the hover, **and the edge/line distinction**, which
      the page had never defined although every hint depends on it (owner, 2026-09-18:
      *"I don't quite understand the distinction that our hints here make between
      'edge' and 'line' — have we defined these anywhere?"*). The code's usage is
      consistent — audited across `hint-text.ts` — so this was a teaching gap, not a
      vocabulary one.

## 6. Accept

- [x] 6.1 Run it. On a board with two disjoint runs, hovering each in turn highlights
      that one and leaves the other plain; moving off the lines clears it.
- [x] 6.2 Accepted (owner, 2026-09-18): *"I accepted the new hover and everything
      else."* That covers the cursor green, which was flagged for their eye — so the
      reuse stands rather than waiting on a colour of its own.

## 7. Not here

- [~] 7.1 A keyboard equivalent. The proposal said this change would add one; it does
      not. The cursor already has its own halo on the edge it has chosen, so lighting
      the run as well would put two greens of different extent on one board with no way
      to tell which is which — and the aid's value is comparing two *distant* ends,
      which a cursor reaches by walking the board rather than by pointing. Worth doing
      only with a mark of its own, which is a design question and not a couple of lines.
- [~] 7.2 The global "pair the loose ends" view — deferred by the owner.
