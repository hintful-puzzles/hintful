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
- [ ] 2.3b Batch 1 of `design.md` § "Batches": the exclusion, count, run and
      latin games. Look at each in the app; explain each moved snapshot.
      Moved: unruly (rules drawn their own way through `byRule` and the
      module's `RuleName`), starbattle, norinori (a cross red where its
      unit can no longer hold its count; Norinori's boxed-in lone square).
      Towers waits: its clue's "the tallest is still to come" (a prefix
      showing its count with the tallest unplaced) needs a bound the
      compiler lacks; ordering comparisons of an undecided `value` against
      its domain's interval come first, in the compiler.
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
      Sticks waits: a stick too short that can no longer reach its number
      because another number's stick is in the way breaks the length clue
      only read together with "one number a stick", and each statement is
      read alone; the length clue restated over the squares a stick can
      still take (as its `reach` does), or a compiler reading of the two
      together, comes first. Signpost waits: its numbers follow from chains
      of links, and a chain is read only once every link of it is decided;
      a bound on `chain` over the links decided so far comes first. Run
      `src/guards` before a
      push: `capability-surface` records each game that declares `rules`,
      and only CI runs it.
- [ ] 2.3c Bound `connected` in the compiler (sure and possible members);
      then batch 2.
- [ ] 2.3d Bound the loop and acyclic forms; then batch 3. Loopy's and
      Pearl's "largest piece" guess goes (`design.md` § "Census").
- [ ] 2.3e Bound region size (`|through(c, O)|` over walls decided so far);
      then batch 4.
- [ ] 2.4 Plant a broken rule and see its mark appear in a game that wrote
      no checker (once batch 1 has moved a game whose checker is deleted:
      edit its description's rule, see the mark move in the app).
- [x] 2.5 Magnets drew a clash as the pole's symbol in `ERROR`, the + pole's
      own fill, so touching + poles showed nothing. A clashing pole is a
      badge with an `INK` rim (the owner's choice, 2026-11-21).

## 3. Finish

- [x] 3.1a Guides: `descriptions.md` § "Where a rule breaks",
      `rendering.md` § "Live errors are the rules'", `new-game.md`.
- [ ] 3.1b Spec deltas for the game specs that state error marks, as each
      batch moves them.
- [ ] 3.2 Commit, push, archive.
