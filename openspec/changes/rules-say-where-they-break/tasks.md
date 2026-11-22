## 1. Census and design

- [x] 1.1 List every live-error checker in the games, what each highlights,
      and the description statement it restates (`design.md` § "Census").
- [x] 1.2 Design the violation: what a statement form reports on a partial
      board, how it reaches the renderer, and the soundness check for it.
      Pilot on Tents, which breaks a shape, a clue and a pairing rule.

## 2. Build and move

- [x] 2.1 Compile violations (`compile-violations.ts`); check them sound
      (`src/guards/rule-violations.test.ts`, planted and seen to fail).
- [x] 2.2 One engine path from violations to the live error marks
      (`Game.rules`, `engine/render/live-errors.ts`).
- [x] 2.3a Tents moved, checked in the app (diamonds, red number, unpaired
      tent, boxed-in tree); its render scenarios did not move.
- [x] 2.3b Batch 1 of `design.md` § "Batches": the exclusion, count, run and
      latin games. Look at each in the app; explain each moved snapshot.
      Moved: unruly (rules drawn their own way through `byRule` and the
      module's `RuleName`), starbattle, norinori (a cross red where its
      unit can no longer hold its count; Norinori's boxed-in lone square).
      Moved: towers (its clue says too that the towers seen before the
      tallest are one fewer than its count, which a line holding every height
      once makes the same rule, so a clue already seeing its count with the
      tallest still to come is red, as before; a clue is red past an open
      square too, where the old check stopped at the first).
      Moved: lightup (its `rules.grid` reads a lit or crossed square as
      holding no bulb; it gains a red cross where nothing can light the
      square). A count written through a definition (`bulbs(k)`) is
      bounded now, as a count written out is. Moved: mosaic (its state
      cells hold only the mark; "done" is the renderer's), map (its
      diamonds unchanged). A game builds `rules` with `describedRules`,
      which gives `isAnswer` too, and the guard checks a changed answer
      breaks a rule exactly where it is no answer (Map's four-coloring leaves
      some changes answers). Moved: abcd (its "no diagonal" variation is a
      module argument `deals` passes), magnets (its + and − counts are
      read as an interval, so a count with too few open squares left
      turns red before the line is full), keen (an undecided value in a
      sum or product is bounded by its domain, so a cage a digit
      overshoots is red with squares still open), group (each failed
      product's triple is read back from the four squares its violation
      names, checked against the grid), adjacent and unequal (a
      `ClueKind` gives its board's `rules`; a broken clue is marked at each
      end that shows it, both for Adjacent's missing bar; their specs'
      marks are unchanged). Moved: solo (Killer states "no number repeats
      in a cage" as its own rule, out of the total's meaning, so a repeat
      marks the two numbers and a total turns red once out of reach; a
      board's units and dealt blocks reach `describedRules` through its
      `units` and `size`). Moved: mathrax (a term one undecided element
      stops is read over each value that element's domain holds, in the
      compiler, so a digit no digit across its clue pairs with is red with
      the cell across open; `liveErrors.clueAt` says where each broken clue
      is broken, for the clue's quarter at each cell). Moved: salad (a cross
      reads as the empty square; a border clue is red once its line can no
      longer show it first, an all-crossed line included). Moved: seismic
      (its `FM_ERROR*` state bits go). Moved: dominosa (a spot touching
      another domino reads as holding none; a square no domino can cover,
      and a spot of a domino with nowhere left, show a red number; a count
      binding no element of the answer names where it breaks by what it
      read, in the compiler). Moved: subsets (its validator asks the rules;
      a horseshoe joins two different sets, so one between equal sets is
      red, and an edge to an undecided cell is red once no set there could
      keep it). Moved: clusters (its marks are unchanged: the rules flagged
      the same 465 tiles over 40 random partial fills, and no other).
      Moved: bricks (its marks show on a committed board too, as every
      game's do; a brick over an open square is no longer marked;
      `|stretch(L, c, S)|` is bounded by S's sure and possible members, in
      the compiler, and `matched` decides nothing where a set's members were
      not all read). Moved: boats (its `validate.ts` passes keep only the
      solver's verdicts and the fleet display's count; a run longer than the
      fleet's longest is stated as a rule, so it is marked as soon as it is
      laid; a given segment is red only once no completion agrees with it,
      where the old check compared the shape drawn so far; `stretch(L, c,
      {x in cells(L) where P})` tests P from c outward, in the compiler, so a
      boat walled in by water is read whole with its row still open).
      Moved: crossing (its run rule is stated for rows and for columns, so a
      broken run is named by its first square and the rule; a run is framed
      once a digit rules out every number of its length, full or not, and a
      number no run can still read turns red in the list). Moved: undead (a
      rule a monster's total, so a broken total names its monster; a total
      turns red once too few squares are left for it, where the old check
      waited for a full grid; its three error fields leave the State).
      Moved: mines (a flag reads as a mine and an opened square as safe; its
      marks are unchanged, a number with more flags round it than it counts;
      the guard lays a board out by the hint's first move, as the other
      cross-game guards do, where Solve says it is not started). Moved:
      ascent (its step rule is said of the square the next number is on,
      and its arrow of the square its number is on, both equivalent on a
      whole board since every number is placed once, so a number and the
      next placed apart break as a pair and an arrow breaks once its number
      is off its line, the marks it drew; `RulesOf.grid` may be 16 bits wide
      for its numbers past 255).
      Moved: sticks (its length clue says too that the squares its line can
      take past other numbers, `room`, reach its length; a quantifier over a
      stretch ranges over the stretch's possible run, sure over its sure run,
      in the compiler; the length is the sum of the line's two ways, since
      the size of their union is not bounded; a line walled in turns red with
      squares still open, which the old check waited for).
      Moved: signpost (three statements under the description's new
      `implied:`, which only the violation check reads, said between
      consecutive given numbers,
      counted from each end with `onward(c, i)`, the square i links on from
      c: one square holds each number between, each points at the next, and
      none leads to the first; `x in chain(c)` and `onward` walk no further
      than they need, in the compiler, and a statement reads no further into
      a binding its filter leaves undecided. Its check kept only its
      auto-link of consecutive numbers, `linkConsecutive`. A doubled number
      is marked only where it meets a given's number when one run passes
      over a given: the rule pairs consecutive givens, as one over every
      pair of squares would be cubic in the squares on a whole board, each
      redraw.
      The game's own link check keeps a player from most doubled numbers,
      so in play it shows a number off its arrow from the next).
      Run `src/guards` before a push: `capability-surface` records each
      game that declares `rules`, and only CI runs it.
- [x] 2.3c Bound `connected` in the compiler (sure and possible members);
      then batch 2. Bound: `connected(S)` and the through form
      (`design.md` § "Decisions"), and `min`/`max`. Moved: range (a number
      that can no longer see its count, or already sees more, as before; the
      shading that cuts the clear squares apart, where it drew the squares
      outside the largest group; a square beside a shaded one reads as clear,
      `besideHeld`), singles (the same cut and reading, so two copies of a
      number both forced clear beside covered squares are red; its
      `F_ERROR` flag goes), spokes (its marks unchanged: a closed group's
      rims and a number that can no longer be met; an open spoke a drawn
      diagonal crosses, or of a full hub, reads as no line; two crossing
      lines are red, where nothing was; its tallies go). Bridges moves with
      batch 3, 2.3d.
- [ ] 2.3d Bound the loop and acyclic forms; then batch 3. Loopy's and
      Pearl's "largest piece" guess goes (`design.md` § "Census"). Bridges
      first needs its rules to read a line it narrows without deciding: one
      bridge drawn where two may go, a ≤1 limit, the most its run allows.
      A value per element cannot hold that, and its old check used it (an
      island that can no longer reach its count through its lines' limits).
      Proposed: `violations` takes an optional mask per element of the values
      the player's marks still allow, read wherever the check reads a
      domain, and the guard checks each mask holds the answer's value.
      Moved: loopy, pearl. Their loop rule is the through form, bounded in
      2.3c; what they needed was the reading `oneLoopHeld` gives (an open
      edge at a dot with two lines is none, and every open edge once a loop
      closes), so a closed loop and the lines apart from it are each
      finished and named, and a clue the loop leaves short turns red as it
      closes, as Loopy's `exactlyOneLoop` did. A dot's shape said of each
      line (`meets`, implied) marks the lines at a dot that breaks it.
      `describedRules` takes `space` for a tiling. Loopy's `checkCompletion`,
      `lineErrors` and `exactlyOneLoop`, and Pearl's `markErrors` and
      `errors`, go.
      Bound (2026-11-22): a set read from the answer (`through` stated in
      place, a union, a set over binders) as its sure and possible members
      wherever it is ranged over, tested or sized, its walks kept once a
      group; the cycle form, "no line closes a loop", read whole as the sure
      lines on a cycle; a statement reading nothing of the board left out
      (`descriptions.md` § "Where a rule breaks"). Moved: path (its
      `noLoop`, implied; its board reads an open edge at a square with all
      its lines as none, so a line run into a corner it cannot leave is
      red, which is new; its pieces' colors stay the render's, and a piece
      the rules break is red whole, as before).
      Moved (2026-11-22): net. Its `network` is the through form over every
      pair of squares and `noLoop` the cycle form, where it was "one fewer
      wire than squares, each reached from the first" (the count named every
      wire, the reach every square outside the first one's group); the
      answer check reads both forms whole, so it stays linear (`wholeGraph`
      in `compile-expr.ts`), and Tracks' `path` gains that too. Its board is
      `recordedMarks` (locks, then notes, then walls; a wire where two locks
      disagree), the hint's reading. Unlocked loops, its preference, are the
      `noLoop` marks of the board read as turned (`turnedGrid`), passed to
      `liveErrors`; its render's lock-mismatch check goes, and `loops.ts`
      stays the generator's. New: a locked tile whose piece no longer fits
      the sides read round it is red whole, and a group of locked tiles
      closed off is red.
      Next: slant's shape reads
      `linked(k)`, which needs the same sure/possible reading. Tracks
      also reads its cell marks (track, no track) in its clue counts, which
      edges alone cannot hold: a cell marked no track reads its edges as
      none, but a cell marked track needs the per-element mask Bridges does
      (above), or a bound from a mark's declared `of` term. Rome's goal
      chain and wordtrail's pieces are to be read before their batch.
- [ ] 2.3e Bound region size (`|through(c, O)|` over walls decided so far);
      then batch 4.
- [x] 2.4 Plant a broken rule and see its mark appear in a game that wrote
      no checker (once batch 1 has moved a game whose checker is deleted:
      edit its description's rule, see the mark move in the app). Range's
      `shape.0` read over `adj8`: two shaded squares touching at a corner
      were framed red in the app, and not once reverted (2026-11-21).
- [x] 2.5 Magnets drew a clash as the pole's symbol in `ERROR`, the + pole's
      own fill, so touching + poles showed nothing. A clashing pole is a
      badge with an `INK` rim (the owner's choice, 2026-11-21).

## 3. Finish

- [x] 3.1a Guides: `descriptions.md` § "Where a rule breaks",
      `rendering.md` § "Live errors are the rules'", `new-game.md`.
- [ ] 3.1b Spec deltas for the game specs that state error marks, as each
      batch moves them.
- [ ] 3.2 Commit, push, archive.
