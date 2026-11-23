## 1. Design

- [x] 1.1 Per game, the gap list: what its description already states,
      what `fillGame` lacks to deal, draw and play it, its ID grammar, and
      how its saves are written. Write it in `design.md`, and set the
      order (§ 1). Written 2026-11-22. Undead and Magnets have candidate
      notes, so are not of this family.
- [x] 1.2 Ask the owner whether the games' saves break, with each game's
      cost from 1.1. The owner (2026-11-22): break them; and move Undead
      and Magnets to the candidate family's change.

## 2. The games

Each its own commit, with the hand-written game playing on until its flip.
Each flip runs in the app before it is done: a deal, input, hints, live
errors, dark mode, and a solve to the end. It lists the capabilities it
added here, lowers the `game-lines` ceiling, writes its spec deltas, and
runs `npm run test:hint-sweeps` before its commit. In design.md § 1's
order.

- [x] 2.1 Range born. Done 2026-11-22, 1,381 hand-written lines gone.
      Added, each the engine's: `play.bounds` (the sides' sum, product,
      shorter and longer, and a tier's own, refused as no such tier);
      `play.plain`, a number with no block (never faint, never counted,
      outlined as a square of the area and not circled; found in the app,
      where a number the step only passed through was circled as if it
      counted from it); `scatter.tried` and `scatter.joinedRest`
      (upstream's range.c); `deal.symmetric: halfTurn`, the hide and the
      search tier's strip in units of a clue and its partner; `digits`
      with `apart`, whole numbers and `_` between two side by side, and
      each kind's least value refused below (`deal.least`); the `cross`
      painter drawing nothing under a number. Differences a player sees,
      for consistency with the born games: `S` and `X` keys; two shaded
      squares side by side take a diamond, not a frame each; the number a
      step counts from is outlined apart in its words' color, where its
      digit was redrawn in the outline's ink; a 2x2 or smaller ID is
      refused on load too, where it was refused only when dealt.
- [x] 2.2 Star Battle born. Done 2026-11-22, 1,429 hand-written lines gone.
      Added, each the engine's: `play.sizes`, a size beyond the grid's that
      the params give, by its letter and one ruleset a value with its
      `least` board (the Custom dialog's game mode, `{{rulesets}}`, and a
      preset board's `8x8s2`); a square grid's one size field and
      bare-number ID, with no turned board; `deal.sample.lines`, a count
      to every row and column, none within `apart`; `deal.grow`'s `holds`,
      `smallest` and `parts` as formulas of the sizes (`growBy`), `closed`
      optional, and a desc with another count of parts refused; the `star`
      painter. Differences a player sees, for consistency with the born
      games: `S` and `X` keys; two touching stars take a diamond where they
      meet, not a red star each; a star grows as it is placed; the refusal
      of a small grid names the ruleset.
- [x] 2.3 Clusters born. Done 2026-11-22, 1,506 hand-written lines gone.
      Added, each the engine's: `play.dealt` of a kind whose meaning goes
      on after `value(at) = v and`, drawn with a dot on its piece (`dotted`;
      the block painter is `dark`); `sample.mend`, a cell a rule breaks at
      turned until none does; `sample.climb`, upstream's hill climb, and a
      search tier that hides nothing; `deal.unpair`. Deals at every preset
      and tier take under half a second, eight seeds each, below the
      hand-written generator's slowest. The menu's Normal cap, the size
      refusals and the `etu` letters are the description's. Differences a
      player sees, for consistency with the born games: a drag paints only
      the squares that held what the pressed one held, a move a square;
      Shift-arrow puts a disc in an empty square and Ctrl-arrow a disc over
      a block too, where Shift was red, Ctrl blue and both cleared; a broken
      piece takes the red badge, not a red frame; a mistake is outlined, not
      washed red; the catalog says blocks and discs, not red and blue.
- [x] 2.4 Light Up born. Done 2026-11-22, 1,684 hand-written lines gone.
      Added, each the engine's: `deal.options`, a number or a choice by
      letter, with its bounds and its tier bounds, its label shown only
      where unusual, a preset naming one after its size; `tierFlag`
      (upstream's bare `r`); `digits`' `letters` and `deal.leaves`, a
      numbered wall hidden leaving a bare one; `build: {value}` with a
      `first` value laid symmetrically on a share of the cells, its `ramp`
      upstream's walls added after 20 failures; the build made incremental,
      one ladder run grown a placement at a time (a 12x16 Unreasonable deal
      went from up to 50 s to under half a second, against the hand-written
      generator's 40 to 275 ms); `play.wash` with its preference, a washed
      cell read as the secondary value, left open by Solve and never a
      hint's step; `play.sweepWith`; placing techniques run in fill games,
      on seeded values too; the `wall` and `bulb` painters. Differences a
      player sees: a click on a square holding the other mark empties it,
      where it was refused; `L` places a bulb and `X` or `I` a cross; Solve
      leaves lit squares open; a hint does not narrate its consequences;
      the cursor stays on a finished board; a params string with no `s` on
      a square grid is 2-way rotational, not 4-way; a 2x3 four-way mirror
      Normal board is refused (neither generator had one); a 3x4 four-way
      mirror Normal board and a 4x4 four-way mirror Unreasonable board are
      no longer refused but their deals give up, since the born deal hides
      at Easy first; saves are not read.
- [x] 2.5 Sticks born. Done 2026-11-22, 1,647 hand-written lines gone.
      Added, each the engine's: `deal.oneIn`, a clue whose meaning reads
      its own kind's clues (a line's length reads its room) derived once on
      a random square of each line; `deal.hide` as a list hidden in one
      random order; `stripFrom: everyClue`, a search tier's every draw
      stripped from every number (an 8x10 Unreasonable deal from Easy boards
      took up to 3.7 s, from every number 1.7 s, against the hand-written
      generator's 2.6 s); a `first` on a scatter; `digits`' `after`, a
      block's number straight after its `B`; the `across` and `down` bar
      painters, whose axis makes a drag run along its row or column and an
      arrow with Ctrl or Shift stroke along or across the move; a step's
      `{each}` read as the number on its square. Differences a player sees:
      a drag keeps to one row or column, where it could turn; the hint rings
      the square it decides, not a line in the hint color, and goes column
      by column; a share of blocks outside 5 to 100 is refused in any ID;
      an Unreasonable 2x3 is dealt, which the hand-written generator gave up
      on; saves of the hand-written game are not read.
- [x] 2.6 Bricks born. Done 2026-11-22, 1,838 hand-written lines gone.
      Added, each the engine's: `space.grid.hexagon`, a hexagon in a
      sheared store whose corners deal a clear kind, never drawn, targeted
      or written, a run of letters ending at each as upstream writes it;
      the sheared draw, an outline joining cells along a row alone, and no
      turned form; `hexGrid`, the pointer undoing the shear and the cursor
      starting on the board and stepping by `shearedHexStep` on the arrows
      and the number pad; a build's `order: upward`, `share` and `least`;
      `digits`' `also`; `tierAliases`. Deals measured 2026-11-22: 8x10
      Unreasonable median 28 ms, max 73 ms over 20. Differences a player
      sees: a brick with nothing to rest on is drawn red where a diamond
      sat under it; Shift with a move marks clear the empty cells and Ctrl
      the shaded ones too, where Ctrl shaded, Shift cleared and both
      emptied; a 7 in an ID is a given clear cell, not a `?`; an ID or
      params string with upstream's `t` deals and opens as Unreasonable,
      where generating was refused; the drag paints with the engine's
      sweep; saves of the hand-written game are not read.
- [x] 2.7 Pattern born. Done 2026-11-22, 2,066 hand-written lines gone.
      Added, each the engine's: list clues on a fill board, a line kind
      whose meaning is `T = v` derived whole and checked live; `id:`'s
      `lists` segment (`order: columns`) and `dots`' `before`; margins as
      deep as the longest list, the cursor's line's numbers in its color,
      a step's stripes running on through them, and each fifth grid line
      doubled; `deal.sample: picture`; `deal.never`; a search tier that
      hides no clue, drawn until the ladder stops short; `least_start` and
      `greatest_start` (`runStart`), so the planner's four ways are arms
      of the one `line` technique and `steps:` went; the text format's
      lists. Deals measured 2026-11-22 over 8 each: 30x30 Easy median
      25 ms, max 55 ms; Unreasonable median 151 ms, max 298 ms (15x15's
      max 477 ms). Differences a player sees: the menu lists each size at Easy
      and Unreasonable, where it listed Easy alone; the drag is the
      engine's sweep, not a line or an erasing rectangle; Shift with a
      move marks clear the undecided squares and Ctrl the shaded ones too,
      where Ctrl shaded, Shift cleared and both emptied; a step outlines
      the marked squares that hold a run in place, and its unreachable
      sentence names the line, not its clue; a list that overfills its line
      opens as contradictory, not with a message of its own; a shaded
      square is the engine's purple piece; saves of the hand-written game
      are not read.
- [x] 2.8 Singles born. Done 2026-11-22, 1,166 hand-written lines gone.
      Added, each the engine's: `id:`'s `cells` segment, one
      desc-alphabet character a cell; `deal.latin`, a Latin square's
      numbers under the build, each covered cell renumbered to repeat one
      of its row or column, single in both where it can
      (`latin-numbers.ts`); `play.hides`, a value whose piece hides the
      number unless a preference shows it smaller, flipped by a press in
      the half-tile rim such a board keeps; `play.wrap`; the `ring`
      painter; the text format's number inside a glyph with a blank middle.
      Deals measured 2026-11-22 over 8 each: 12x12 Easy median 137 ms,
      max 262 ms; 12x12 Normal median 20 ms, max 38 ms. Differences a
      player sees: a press with the other button replaces a mark rather
      than emptying the cell; Shift or Ctrl with a drag marks clear, as in
      every sweeping fill game; a Normal board is graded by the ladder
      alone, without the generator's sneaky step; the hint carries on from
      its last step rather than taking every number pattern first; live
      errors are the engine's diamond between touching shaded squares and
      badges on repeated clear numbers, where a square beside a shaded one
      was read as clear; Solve fills the answer rather than solving the
      current board; saves of the hand-written game are not read.
- [x] 2.9 Boats born. Done 2026-11-23, 2,949 hand-written lines gone.
      Added, each the engine's: `play.tally`, a clue at the board of a
      length and a count the params give (`f3`, `,3,2,1`), with its Custom
      fields, its default and its refusals (`FieldClue`); `sample: pieces`,
      the tally's pieces laid longest first in shuffled stretches
      (upstream's `boats_generate_fleet`); `deal.hideFlag`, a setting after
      the tier that hides its kind in one order with `deal.hide`'s and
      refuses a board hiding none; `deal.withhold`, a value never derived;
      `numbers`' `hidden` and `closed`; a `glyphs` segment of letters;
      `play.shape`, a kind drawn as its cell's piece; a painter that `runs`,
      told the sides it joins and where its way is open, an open square
      shut once the tally is all placed; a painter's `given`; the `sea` and
      `hull` painters; the tally beneath the board, struck as found and red
      past its count (`tally-display.ts`). Deals measured 2026-11-23 over 8
      each, on a loaded machine: 10x10 Easy median 18 ms, max 36 ms;
      Normal 40, 113; Tricky 29, 70; Hard 132, 590; Hard with numbers
      removed 219, 1,023. Differences a player sees: a missing tier reads
      as Easy, where it read as Normal; a right click goes round the other
      way, where it made water; a left drag acts on the square it began
      on, and a right drag, or Shift or Ctrl with an arrow, waters a line;
      a lone hidden number is not put back; a square's shape is given and
      hidden while the tier holds, where segments were added then removed;
      the text format writes `#` and `~`; the win flash sweeps each square
      at its own place; saves of the hand-written game are not read.

## 3. Finish

- [x] 3.1 Per game: lines removed against lines the engine gained, and
      capabilities added; deal and hint-walk CPU time against the
      hand-written game on the same boards (the pilot's method, in its
      archived `design.md` § "The figures (3.1)"). Recorded in design.md
      § "The figures (3.1)", 2026-11-23: 15,666 lines gone against 4,412
      gained; walks from −14% to +45%, at most 2.4 ms a game.
- [x] 3.2 Update `docs/descriptions.md` and `docs/new-game.md` for what
      the family added. Each flip added its keys to `descriptions.md`;
      `new-game.md` names what each moved game shows the board may be.
- [x] 3.3 Commit, push, archive. Archived 2026-11-23 with the figures.
