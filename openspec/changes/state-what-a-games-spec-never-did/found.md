# What the census found and this change did not act on

The census of what each game's spec owes was written from the code, and each
`census/<game>.md` ends with the places its code, its help page and the specs
disagree. This change states requirements and fixes nothing, so these are what
is left for a later session: each bullet names the census file that holds the
detail, and the strings, counts and line references are that file's. None was
checked again when this list was compiled.

## A hint that says what the board does not show

- **Palisade: a region rule joins two regions without a step, and later
  sentences count the join.** Where an undersized region has several undecided
  edges all into one other region, `src/games/palisade/solver.ts:288-297`
  joins the two and records no edge. The writer measured, over the plans of 60
  dealt Easy boards (twelve seeds each of `5x5n5`, `6x8n6`, `8x10n8`, `6x6n3`,
  `6x6n4`), 134 of the 1964 steps whose sentence gives a region's size giving
  one the no-wall marks on the board do not add up to; the reviewer, on 60
  boards of other seeds through the midend, 123 of 1924, on 28 of the 60
  boards, every board still finishing. On `5x5n5:2j2a3d1c333`, 2 of 17 sized
  steps do not match: step 34 of 37 says "This region has 4 of its 5 cells and
  just one way left to grow, so this edge can't be a wall." where the board
  shows a region of three, and step 37 says "Joining these two regions would
  make 9 cells" of an edge whose sides the board shows as regions of 2 and of
  4. `engine-hints`, "A hint relies only on marks the player can make", is the
  rule at stake, and the delta's "Palisade regions are all one size, in the
  hint as on the board" states a last clause the code breaks. Recommendation:
  record such a join as one firing that marks every undecided edge between the
  two regions as open. `census/palisade.md`.
- **Undead: a counted placement is offered before any mark is on the board.**
  The planner takes a counted placement from anywhere in the recorded
  deductions before any strike, including one reached only after strikes the
  player has not been shown (`nextPlaceOp`,
  `src/games/undead/index.ts:543`); its sentence then speaks of cells that
  "can still hold" a monster with no mark on the board to say which. Over 60
  boards dealt from `4x4de`, `4x4dn`, `4x4dt`, `5x5de` and `5x5dn` (12 each),
  the first step of a hint on the board as dealt was such a placement on 31
  and the fill on the other 29. The help says the fill comes first
  (`help/games/undead.md:47` against `src/games/undead/index.ts:710` running
  before `ensurePopulated()` at `:721`); the delta's "Undead's hint pencils
  every monster in before its first strike" states the code.
  `census/undead.md`.
- **Galaxies: the "only one dot could own a square" sentence gives a reason
  that is false of most boards it is said on.** The step says `Any other dot
  mirrors this cell off the board or onto a dot`
  (`src/games/galaxies/hint-text.ts:132`) and `help/games/galaxies.md:49` says
  the same; the firing (`src/games/galaxies/hint.ts:136`) counts the dots that
  pass `okToAddAssocWithOpposite` (`src/games/galaxies/moves.ts:100`), which
  also drops a dot for reach and for a finished region. Over 400 dealt boards
  (100 each of `7x7dn`, `7x7du`, `10x10dn`, `10x10du`), 33,265 steps of which
  4,049 were this one: in 2,544 some other dot was dropped though its mirror
  of the square is on the board and on no square a dot sits on or touches, and
  in 3,765 if "onto a dot" is read as a dot in the middle of the mirror
  square; of the dots dropped for neither reason, 3,337 were dropped for reach
  alone and 1,217 for a finished region. One board: `7x7dn:dikpfzjxgexcv`
  after 17 hints, the square at (3,5) given to the dot at (3,7), the dot at
  (8,9) dropped for reach only. A true sentence has to say that no galaxy
  about the other dots stretches to the square, and the help's paragraph with
  it. `census/galaxies.md`.
- **Signpost: every "consecutive numbers" step a player is shown asks for a
  link the board already holds.** `executeMove` and `newState` link every `k`
  to `k + 1` where the arrow points at it
  (`src/games/signpost/moves.ts:67`), and the hint plans on a copy without
  that pass (`src/games/signpost/hint.ts:193`), so `follows` (`hint.ts:108`)
  fires for exactly the pairs the board links by itself. On
  `4x4cde:1e9cfgddgadcaaabh16a` the tenth hint says "The 15 must come right
  after the 14, and the 14's arrow points at it, so the two must be linked.";
  making the link changes nothing on the board, Undo gains a step, and Undo
  then appears to do nothing. Also `5x5cde:cgdffd1bhb18gccfdeddab25aabbhg`
  (the 22nd hint) and `5x5cde:degffe1egegb4eccacbbagca25aah` (the 19th). Over
  forty dealt boards (ten seeds each of `4x4cde`, `5x5cde`, `6x6cde` and
  `5x5de`), 85 `follows` steps were shown and all 85 were already held; a
  fresh plan opened on `follows` zero times. Signpost has no
  `refreshHintStep`, so the midend cannot drop the step, which `engine-hints`
  "A displayed hint step never references already-resolved state" asks for.
  The delta's "A Signpost hint asks for no link the board already holds"
  states the rule the code breaks. The fix: the plan's copy makes the
  automatic links too and the rung goes, or the step is refreshed away; the
  help's "Consecutive numbers" bullet (`help/games/signpost.md:36`) then wants
  rewording as something the board does. `census/signpost.md`.
- **Inertia tells the player to undo on a fresh board.** The sentence of the
  route-solver bug under "A board that loads, checks or solves wrongly" is `No
  solution can be found from this position. Undo, and try from an earlier
  one.`, said where there is nothing to undo. `census/inertia.md`.

## A control that does the wrong thing

- **Sixteen: Ctrl or Shift with Right from the last column, or with Down from
  the last row, slides the line the wrong way.** On `3x3:4,1,3,2,8,6,5,7,9`
  (top row 4 1 3, first column 4 2 5): Right, Right, Ctrl+Right makes the row
  read 1 3 4 with the cursor jumping to the first square, where the help's
  rule gives 3 4 1; Shift+Right from the same square also gives 1 3 4; Down,
  Down, Ctrl+Down or Shift+Down makes the column read 2 5 4 where the rule
  gives 5 4 2; with the arrows locked (Enter, Enter on the top-left square),
  Right three times reads 3 4 1, then 1 3 4, then 3 4 1 again. Every other
  Right and Down, and every Left and Up, slide the arrow's way.
  `src/games/sixteen/index.ts:151` and `:154` (`clamped.x > at.x ? 1 : -1`)
  take the direction from whether the stopped cursor moved; upstream's
  `sixteen.c:643` and `:645` take it from the stopped coordinate being
  non-zero. The help (`help/games/sixteen.md:18`) is the rule, and the delta's
  "Ctrl or Shift with an arrow key slides the cursor's line" states it for
  every column and row, with no scenario from the last ones. No test holds
  it: the game's tests have no Ctrl press, and every Shift press in
  `sixteen-midend.test.ts` goes right or down from the first column or row,
  or left from the first column. `census/sixteen.md`.
- **Galaxies: the keyboard cannot pick up a dot that sits on an edge.**
  `help/games/galaxies.md:31` promises the drag from a dot; in
  `src/games/galaxies/index.ts:760` the keyboard's drag is taken only where
  `edgeGeometry.cursorTarget` (`index.ts:307`) is `null`, and that answers
  every edge inside the border. On `kebizmfzgbfvfu` under `7x7dn`: Right,
  Right, Down puts the cursor on the dot at (3,2), and Enter or Space changes
  nothing, the midend reporting the key as not taken. All three of that
  board's edge dots, at (3,2), (5,2) and (4,13), behave so, where its seven
  dots inside a square and its two on corners, at (6,6) and (12,8), each open
  the drag. The tree's "The association drag runs from either button, the
  keyboard, and either end" promises it, and no requirement of the delta
  states the shortfall. The fix: the keyboard branch looks for a dot under
  the cursor before asking whether the cursor is on an edge.
  `census/galaxies.md`.
- **Ascent: under "Move cursor" the number pad's diagonals also type their
  digit.** With the `numpad` preference at "Move cursor", 7, 9, 1 and 3 move
  the cursor diagonally and then reach the typing arm
  (`src/games/ascent/ui.ts:840`). On a Classic board the number pad's 9 moved
  the cursor from (1,2) to (2,1) and left the number 9 being typed; a 3 after
  it moved again and made the pending number 93; a 7 that landed on a filled
  square moved the cursor and answered that the key was declined. "Ascent's
  keys click at the cursor, and the number pad types or moves" states the
  rule, and its scenario presses 8. No test presses a number-pad diagonal
  under that preference. `census/ascent.md`.
- **Filling: a pointer press does not end a keyboard drag.**
  `src/games/filling/index.ts:115-120` clears the selection on a press and
  leaves `keydragging` set, so after Enter, a click and an arrow, the square
  the cursor lands on joins the new selection though nothing shows a drag is
  on. The delta lists what ends the drag and is silent on the press; the note
  reads it as a bug to file. A digit too large for the board also leaves the
  drag on (`index.ts:162-164`, run on a 3×3 board with `4`), which the delta
  now states. `census/filling.md`.
- **Bricks answers a move that changes nothing.** Ctrl or Shift with a move
  names a numbered cell in its move when the cursor leaves or enters one
  (`src/games/bricks/index.ts:295`), and `executeMove` passes over it: with
  the cursor on a number at the board's edge, Ctrl with Up answered a paint
  move of that one cell and the board did not change. A player sees nothing;
  `engine-input`, "A game declines a button it did not act on", would have
  the game decline. `census/bricks.md`.

## A board that loads, checks or solves wrongly

- **Mines: a board the first click finishes does not load again, and its
  save does not restore.** `9x9n1`, which the Custom dialog allows: the
  hint's first step opens the middle square and the board is solved; its game
  ID `9x9n1:4,4,m885d4e8bb6954086d11a0` is then refused by `newGameFromId` as
  needing trial and error, and `loadGame` of the save answers "Could not
  restore this saved game: This game ID's puzzle needs trial and error, and
  only puzzles that deduction alone solves can be played here."
  `finishesByDeduction` (`src/games/mines/index.ts:639-648`) asks the hint for
  a plan, and the hint answers a won board with no steps, reported as
  deduction run out (`src/games/mines/hint.ts:318`). A typed layout whose
  first square opens everything is refused the same way
  (`9x9n10:8,8,u800000000000000000000`). It breaks "Mines finishes by
  deduction as its hint's plan". Recommendation: a board that is won on
  opening finishes; fix it in `finishesByDeduction`, and ask whether the
  engine's walk of a hint to the end of a board has the same hole for every
  untiered game. `census/mines.md`.
- **Mines: a first square with a mine beside it loads.** The midend opens
  `9x9n10:1,0,u800000000000000000000`, showing a 1, where the hint says "No
  mine is ever laid in the first square you open or beside it" and the same
  layout in a `begin` move is refused (`src/games/mines/index.ts:453-455`).
  Only a typed ID reaches it; the delta does not state it. `census/mines.md`.
- **Mines: a description whose first square is a mine parses, and is refused
  in the wrong words.** `0,0,u800` on a 3×3 grid passes `validateDesc` and
  `newState` answers a dead board ("DEAD!",
  `src/games/mines/state.ts:288-299`, `src/games/mines/index.ts:357`);
  `loadVerdict` and the midend (`9x9n10:0,0,u800000000000000000000`) refuse
  it as needing trial and error, which nothing about it does. Recommendation:
  refuse it in the parse, with a sentence of the game's own.
  `census/mines.md`.
- **Subsets: Check & Save cannot point at a wrong letter that breaks no
  rule.** On `13RD,_,6R,_,_,_,_D,_UL,_R,12D,_,_DL,_UR,_,3U,10`, whose answer
  has {D} in the second cell, with B marked present there: `findMistakes`
  returns nothing, `Midend.check()` answers `dead-end`, and the app shows "Not
  saved" with "These entries contradict each other, so one of them must be
  wrong. Undo, or clear the ones you are unsure of."; Hint says the same. The
  game holds the answer (`index.ts:602`) and `findMistakes` reads it only for
  rule-outs (`solver.ts:430`). `docs/games/solver-and-generator.md` § "The
  solvable-game contract" and § "Live rule errors and the re-solve are both"
  owe more. The tree's "Subsets flags mistakes for Check & Save" lists what
  is flagged today and is the requirement to change with the fix.
  `census/subsets.md`.
- **Inertia: the route solver refuses a board that is two slides from won.**
  On the hand-typed `4x3:bmbmSbbbbbwg` the one gem lies in a pit and the
  slide that collects it wins; the hint, Solve and Check & save all say `No
  solution can be found from this position. Undo, and try from an earlier
  one.` on the fresh board, and east then south reads `COMPLETED!`. The tour
  must come home even from the last gem (`growTour` in
  `src/games/inertia/solver.ts`). It contradicts the tree's "The hint refuses
  honestly when the move to make is undo" and "Solve plays a computed route
  to the finished board". The same refusal on `7x3:mbmbmbmbbbSbbbgwbbbwg`
  (two gems, each in a pit); on dealt boards it was not found, none in 41,089
  positions over 120 boards of `8x10` and `12x15`. `census/inertia.md`.
- **Solo: a killer game ID is not checked for one sum a cage.** `parseDesc`
  in `src/games/solo/state.ts` never compares the sums section with the
  cages, and the solver holds a cage to the last sum it finds. On the pinned
  killer board's ID (`src/games/solo/solo-ladder.test.ts`, "3x3 Killer, cage
  sums") with `8_8a5` written `8_9_8_5`, the board loads, the cage shows both
  a 9 and an 8 (`src/games/solo/render.ts:405`) and is held to 8; with 8
  written twice it loads too; with `8_8_9_5` there is no board and "The clues
  in this game ID contradict each other." A cage with no sum (`15_14` written
  `a14`) gets that same sentence, which does not say a sum is missing.
  Whether to refuse the two-sum ID at the parser is a question about
  hand-typed IDs alone. `census/solo.md`.
- **Slide: the 48-square bound stops a loaded board.** The bound in
  `validateParams` (`src/games/slide/state.ts`) is not gated on `full`, so a
  game ID opening `7x7m25:` gets "Width times height must be at most 48; the
  solver runs out of memory beyond that." and no board, whatever the
  description. `engine-params`, "A generation-only bound is gated on full",
  asks for the gate, and the comment on `MAX_CELLS` argues from the
  generator's memory alone. The question for the owner is whether a larger
  board that arrives already made should load; Solve on a larger finished
  board was not measured, and the one size known to fail exhausts a 4 GB
  heap. `census/slide.md`.
- **Fifteen: the solved arrangement loads.** `1,2,3,4,5,6,7,8,0` for `3x3`
  loads as a board already finished. The spec binds `newDesc` only, nothing
  in the code decides the pasted case, and `engine-difficulty`'s "A board
  that comes solved is dealt again" is about dealing. `census/fifteen.md`.
- **Bricks: a 7 in a description loads.** The generator writes none; the
  parser accepts one (`src/games/bricks/state.ts:271`), the count check skips
  the cell (`src/games/bricks/solver.ts:144`) and it is drawn `?`
  (`src/games/bricks/render.ts:253`). It is upstream's format, so refusing it
  would be a compatibility break. `census/bricks.md`.

## A params string read oddly

Bridges' in-between percentage is under "A rule the engine could state or own
once".

- **Ascent: a mode letter the game does not know is not refused.**
  `decodeParams` sets `mode` to one past the last
  (`src/games/ascent/index.ts:321`): `6x7mXde` decodes with `mode` 6, passes
  the engine's params check for dealing and for loading, plays as a Classic
  board labeled "Classic: 6x7 Hard", and encodes as `6x7mundefinedde`. That
  ID does not come back whole: `6x7mundefineddh` decodes as Easy. Reached by
  a typo, a lowercase letter (`6x7modh`), or a string that ends at the `m`.
  The fix it suggests is to declare the mode as the choice it is. The note
  calls it a compatibility question for the owner: it would refuse an ID that
  loads today. `census/ascent.md`.
- **Ascent: `S` with the Edges mode** decodes with symmetry on, is refused
  for dealing ("Symmetrical clues must be off for Edges."), loads with a
  description, and is written back without the `S`. Not called a
  compatibility question. `census/ascent.md`.
- **Keen: `6d`**, a `d` with no letter after it, gives Easy and not the
  default tier (`DIFF_CHARS.indexOf("")` is 0,
  `src/games/keen/state.ts:128`), where "Keen's params encoding" says an
  unknown letter decodes as the default. The note leaves it as a bug to fix or
  a sentence to add "on the owner's word since it is what a link decodes to";
  it does not use the word compatibility. `census/keen.md`.
- **Keen: `m` is read only where it stands.** `6m` is a multiplication-only
  6×6 Normal, and `6dqm` loses its `m` with its unknown letter. Not called a
  compatibility question. `census/keen.md`.
- **Loopy: `validateParams` throws.** `decodeParams("7x7t18de")` yields a
  grid index past `LOOPY_GRIDS`, and Loopy's own `validateParams` throws
  ("Cannot destructure property 'amin'") instead of refusing. The engine
  refuses the choice first (`src/engine/game.ts:189-190`), so only a caller of
  the game's function alone reaches it. Not called a compatibility question.
  `census/loopy.md`.
- **Mathrax: a clue letter out of order is dropped.** `6dnDS` loads as
  division only and re-encodes as `6dnD`. The delta states it as it is;
  whether to refuse it is the owner's call, and the note calls it a
  compatibility question. `census/mathrax.md`.
- **Dominosa and Ascent write `undefined`.** Dominosa's `6tdx` encodes in
  full as `6tdundefined`; the params are refused before anything shows the
  string. Clusters' codec writes `d?` for the same case, and Rome and Salad
  encode `4x4dz` back as `4x4d?`. Ascent's `mundefined` is above, and a
  player can meet it. Not called a compatibility question.
  `census/dominosa.md`, `ascent.md`, `rome.md`.
- **Unruly: `8x8deu`** decodes as Normal with `unique` off, the `u` after the
  difficulty being passed over; the order is the shared codec's. Not called a
  compatibility question. `census/unruly.md`.
- **An unknown difficulty letter is the default in some games and refused in
  others.** Read as the default: Sticks (`5x5b20s2dq`, Easy), Tents
  (`8x8dq`), Tracks (`8x8dq`, Normal), Towers (`6dq`, which its spec states),
  Magnets (`5x6dx`, Normal), Slant, Pearl (`6x6dz` encodes back as `6x6de`),
  Keen, Undead and Unequal; Solo keeps Easy and reads the letter as a flag
  (next bullet). Refused: Ascent ("Difficulty must be one of Easy, Normal,
  Tricky, Hard."), Clusters (`7x7dx`, by the engine's check of the field;
  `validateParams` itself answers null), Dominosa (`6tdx`), Spokes, Subsets
  (a hand-written `decodeParams`), Unruly (`8x8d` and `8x8dz`, "Difficulty
  must be one of Easy, Normal, Tricky."), Rome and Salad. **The notes
  disagree on why:** `sticks.md`, `tents.md` and `magnets.md` say the default
  is the codec's `choice` segment and "the same in every game that uses one";
  `slant.md` and `spokes.md` say the codec lets each game choose, by an
  `invalid` value Slant omits and Spokes passes. No note calls it a
  compatibility question. `census/sticks.md`, `tents.md`, `tracks.md`,
  `towers.md`, `magnets.md`, `slant.md`, `spokes.md`, `pearl.md`, `keen.md`,
  `unruly.md`, `clusters.md`, `dominosa.md`, `subsets.md`, `ascent.md`,
  `rome.md`.
- **Solo: an unknown tier letter is read as a flag.** `3x3dx` decodes to the
  board `3x3x` names, Easy with the X rule on, and `3x3dz` to `3x3`. The
  modified requirement says only that the difficulty stays at Easy. Not
  called a compatibility question. `census/solo.md`.
- **Light Up: a bare number keeps the default height.** `10` decodes as 10×7
  (`src/games/lightup/state.ts` lines 131–132), where most games read a bare
  number as a square; upstream's `decode_params` does the same. No
  requirement says it; "it may be a bug to raise". Not called a compatibility
  question. `census/lightup.md`.
- **Netslide: `3w` is a 3×3 grid that does not wrap.** Its hand-written
  prefix parse (`src/games/netslide/state.ts:107-116`) returns at once on a
  bare `{n}`. Not called a compatibility question. `census/netslide.md`.
- **Netslide: the barrier probability from a string is not rounded to single
  precision** (`src/games/netslide/state.ts:130`), where the Custom dialog's
  is (`src/games/netslide/index.ts:286`) and Net's decoder's is
  (`src/games/net/state.ts:106`). `b0.1` names a probability a hair off the
  dialog's "0.1"; whether a board ever differs for it was not measured. Not
  called a compatibility question. `census/netslide.md`.
- **Pegs: any text after the size that is not one of the three words is read
  as Cross, silently.** Not called a compatibility question.
  `census/pegs.md`.
- **Sixteen: `3x4m-1`** is read as no shuffling moves; a decoded `m` below
  zero cannot be written. Not called a compatibility question.
  `census/sixteen.md`.
- **Sticks: the symmetry is written as its stored number**, so `5x5b20s7`
  decodes and is then refused by the engine's check of the choices field, at
  every check. Not called a compatibility question. `census/sticks.md`.
- **Tracks: the short form of every Easy preset (`8x8`) decodes as a Normal
  board**, the default tier being Normal; it decides only a bare params
  string with no board. And `8x8o` reads the `o` in a string with no `d`,
  which the short form never writes. Not called a compatibility question.
  `census/tracks.md`.

## A help page that disagrees with the code

- **Blackbox:** the help says a click on a fired beam "shows its path again"
  (`help/games/blackbox.md:14` and `:15`); the press sets `ui.flashLaserno`
  (`src/games/blackbox/index.ts:217`) and `redraw` only draws that laser's
  result in the flash color at its square and its exit's
  (`src/games/blackbox/render.ts:310`). Nothing is drawn across the box.
  `census/blackbox.md`.
- **Bridges:** the Controls section (`help/games/bridges.md:36`) does not
  give the `G` key, which `src/games/bridges/index.ts:373` answers as the
  `show-hints` preference does. `census/bridges.md`.
- **Cube, the diagonal keys on a triangle:** `help/games/cube.md:15` says the
  keypad's 7, 9, 1 and 3 "roll the solid across a sloping edge"; in
  `src/games/cube/grid.ts:114-117` and `:144-147` the two diagonals that lean
  toward a triangle's flat side roll across that flat side. On `t1x2:9048,4`
  keypad `7` and `9` each answer the `U` roll; on `i3x3:08D2A16B82C8C0,35`,
  `1` and `3` each answer `D`. `census/cube.md`.
- **Cube, the keypad's 8, 2, 4 and 6:** `src/games/cube/index.ts:217-224`
  rolls on them as on the arrows; `help/games/cube.md:9` names the arrow keys
  and the mouse only. An omission. `census/cube.md`.
- **Dominosa, the player's lines:** `help/games/dominosa.md:24` says the hint
  "reasons from the dominoes you have placed and the lines you have drawn";
  `src/games/dominosa/solver.ts:778-786` seeds the hint's solver from the
  dominoes only, on purpose, and `src/games/dominosa/index.ts:409-414` reads
  the lines only to leave out a step whose line is already drawn. The spec
  agrees with the code. `census/dominosa.md`.
- **Dominosa, "Every remaining spot overlaps":** `help/games/dominosa.md:35`
  gives the case where every spot left "covers the same square";
  `src/games/dominosa/solver.ts:341-372` rules out any spot that overlaps all
  of them, which they need share no square for. `census/dominosa.md`.
- **Inertia:** `help/games/inertia.md:46` names two refusals;
  `src/games/inertia/hint.ts:313` also refuses with `No solution can be found
  from this position. Undo, and try from an earlier one.` and no gem circled.
  `census/inertia.md`.
- **Loopy:** the help says "keep pressing on a pair to cycle it"
  (`help/games/loopy.md:72-73`); the code releases the pin when it notes the
  pair, so the next Space pins the edge the cursor is on, and the pair cycles
  only when Space is then pressed on the other edge
  (`src/games/loopy/index.ts:427-434`). `census/loopy.md`.
- **Seismic, the sticky pencil mode:** the help says a preference switches it
  on (`help/games/seismic.md:13`); the game starts with it on
  (`src/games/seismic/state.ts:312`, `pencilSticky: true`), so the paragraph's
  first sentence is true only with the preference off. `census/seismic.md`.
- **Seismic, `M`:** the help says it fills "every empty cell with all
  possible pencil marks" (`help/games/seismic.md:17`); the move fills only an
  empty cell that holds no marks (`src/games/seismic/index.ts:220`).
  `census/seismic.md`.
- **Solo, `M` on a large grid:** `help/games/solo.md:28`–`30` says `M` fills
  the pencil marks "except on a grid large enough to use M as a number";
  `src/games/solo/index.ts:216`–`218` reads it as 22 and line 221 enters it
  only while a cell is highlighted, and with no highlight the press falls
  through to Mark-all at line 251. `census/solo.md`.
- **Unequal, `M`:** the help says it fills
  (`help/games/unequal.md:34`); the code's `M` is the adaptive Mark-all
  (`src/games/unequal/index.ts:293`), and the help leaves the second half
  out. `census/unequal.md`.

## A requirement in the tree the code contradicts, not corrected here

- **Untangle, "Solve untangles any planar board, with or without aux"**
  (scenario "Solve refuses a non-planar graph") **and "Untangle's hint
  refusals"** (scenario "A hand-typed K5 is helped, then refused"): loading
  refuses `5:0-1,0-2,0-3,0-4,1-2,1-3,1-4,2-3,2-4,3-4` first, with "This game
  ID's puzzle has no solution, so it can't be played here." Both describe
  what the hooks do, not what a player meets. `census/untangle.md`.
- **Solo, "Solo's narration leads with what was spotted"**, scenario "A cage
  of one open cell and nothing filled": a cage of one cell cannot load ("This
  game ID divides its board into the wrong number or sizes of blocks or
  cages.") and is never dealt (300 boards dealt at `3x3ka` had no cage under
  2 cells), so `say.cageSingle`'s arm in `src/games/solo/hint-text.ts` is
  reached by no board. `census/solo.md`.
- **Solo, "Solo decodes its parameters leniently"**: `decodeParams` "SHALL
  round-trip the preset list", and the eleven presets without cages come back
  with a different `kdiff` (`DIFF_KMINMAX` declared, `DIFF_KINTERSECT`
  decoded). The MODIFIED entry keeps the sentence word for word. No preset
  deals at a difficulty other than its title's; the field could go from the
  preset table, or from the params. `census/solo.md`.
- **Dominosa, "Dominosa descriptions carry the clue grid"** says
  `validateDesc` rejects; the game has no such hook, the refusals being
  `newState`'s through `readDesc`
  (`src/games/dominosa/state.ts:167-193`). **"Dominosa renders the hint
  distinctly" and "Filling hint color legend"** name `COL_HINT_CELL`, a
  palette entry the tree no longer has under that name.
  `census/dominosa.md`.
- **Ascent, "Ascent's hint techniques stay within the board's tier"** ends
  "No step SHALL use a technique above the board's tier". The plan has no cap
  (`src/games/ascent/hint.ts`, "No tier cap"); the sentence holds as an
  outcome on dealt boards and is not a rule the code applies.
  `census/ascent.md`.
- **Ascent, "Ascent places a number three ways"** says a number "of any
  length" is typed; the code stops at three digits
  (`src/games/ascent/ui.ts:850`) and drops a typed number above the board's
  last (`ui.ts:904`). Looser than the code and not contradicted by it.
  `census/ascent.md`.
- **Flood, "Flood's Solve refuses a finish past the move limit"** has Solve
  say no solution can be found from this position. That is what a player
  reads only while the board is not yet lost: on a lost board (`FAILED! 42 /
  23 moves`) Solve and the hint both refuse with the midend's `This game is
  over. Undo to play on, or start a new one.` `census/flood.md`.
- **Group, "The identity flag sets how elements are lettered"** says the
  identity "is presented first". The code letters it `e` (`eFromFront` in
  `src/games/group/state.ts`), and it is first only in the keypad and in the
  unreordered table. `census/group.md`.
- **Pattern, "One Pattern line deduction is one multi-cell step"** reads as
  more than the code does: the step is one unbroken stretch of one run's
  overlap, so a run whose overlap is already shaded in the middle gives two
  steps (`src/games/pattern/solver.ts:650-663`, `:690-701`).
  `census/pattern.md`.
- **Galaxies, Inertia, Mines and Subsets** each have a tree requirement a
  bug above contradicts or that states the shortfall: "The association drag
  runs from either button, the keyboard, and either end"; "The hint refuses
  honestly when the move to make is undo" and "Solve plays a computed route
  to the finished board"; "Mines finishes by deduction as its hint's plan";
  "Subsets flags mistakes for Check & Save". `census/galaxies.md`,
  `inertia.md`, `mines.md`, `subsets.md`.

## A rule the engine could state or own once

- **The pencil preference keys are in no engine requirement.** `engine-notes`
  names the preferences in words; `sticky-pencil-mode` and
  `pencil-keep-highlight` appear in no engine spec as literals, only
  `hint-notes` does (in `engine-candidate-hints`), and
  `pencil-keep-highlight` is in no spec at all. The keys are declared once in
  `src/engine/pencil-prefs.ts` and a saved preference depends on them; one
  requirement in `engine-notes` would cover every note-taking game.
  `census/seismic.md`, `solo.md`, `towers.md`, `mathrax.md`, `unequal.md`
  (which names Undead too).
- **`auto-pencil` is the engine's helper (`autoPencilPref`) and
  `engine-notes` states only its default**; each game restates that a
  placement strikes its value from its regions' notes. The engine could state
  the key and the behavior once, each game keeping only the regions it
  reaches. `census/mathrax.md`, `keen.md`.
- **The ceiling on a grid's area.** The sentence (`AREA_TOO_LARGE` in
  `src/engine/params.ts`) is the engine's; the check is a line in each game's
  `validateParams` with a limit of the game's own, and no engine capability
  states it. The engine could own the check and take the number as a
  declaration. The limits the notes give: the largest safe integer in Same
  Game (`src/games/samegame/state.ts:113`), Slant, Tents
  (`w > Number.MAX_SAFE_INTEGER / h`), Tracks and Pattern
  (`src/games/pattern/state.ts:173`; `mines.md` gives Pattern's as 2⁵³);
  2³¹ − 1 in Signpost and Separate; 2²⁸ in Mines; a million in Net and
  Netslide; 10,000 cells in Pegs; 1,000,000 squares in Rectangles; Light Up's
  own (`src/games/lightup/state.ts:198`); Pearl's, which its spec states; and
  none in Sixteen, which has no `validateParams`: `3x9007199254740993` passed
  the engine's params check. `git grep -l AREA_TOO_LARGE -- 'src/games/*/*.ts'`
  lists the games. `census/samegame.md`, `lightup.md`, `slant.md`,
  `tents.md`, `tracks.md`, `mines.md`, `pattern.md`, `pegs.md`,
  `signpost.md`, `sixteen.md`.
- **A select key on a hidden cursor in a game without `targetVerbs`.** The
  arrows' first press on a hidden cursor is the engine's; Enter and Space on
  one are Rectangles' own arm, since it declares no `targetVerbs`.
  `census/rect.md`.
- **An arrow with Shift or Ctrl on a hidden cursor, against `engine-input`.**
  Clusters moves the cursor, shows it and paints in one press
  (`src/games/clusters/index.ts:244-268`): on `DceclHbAacAg` with a fresh
  `Ui`, Shift with Right answers a `paint` of squares 0 and 1. "One arrow
  press reveals the cursor and moves it" says such an arrow "reveals
  instead". Which gives way is the engine's to settle once for every game
  with a marking arrow; if Clusters changes, the delta requirement's last
  sentence and its "first press" scenario change with it.
  `census/clusters.md`.
- **Undead's first arrow.** The same `engine-input` requirement has "the
  cursor becomes visible and has moved one cell"; Undead's first arrow shows
  the highlight on the top-left square whichever arrow it is
  (`src/games/undead/index.ts:240`), its cursor starting at the corner of the
  clue ring. Whether the engine's rule should bind Undead is a question for
  the engine. `census/undead.md`.
- **Label tail words.** The preference the Custom dialog calls "Remove
  numbers" is labeled "hidden clues" in Boats, and ABCD's "Remove clues" is
  labeled "clues hidden". An engine-owned word would settle both.
  `census/boats.md`.
- **The tier a hint deduces at.** Keen and Mathrax pass the board's params'
  tier (`src/games/keen/index.ts:367`), and their specs give the cap of the
  recording solve and not that; if every Latin-family game does,
  `engine-candidate-hints` could state it once. What the other notes record:
  Unequal caps at the tier in the board's params
  (`src/games/unequal/index.ts:486`); Towers reads it from `state.diff`;
  Ascent has no cap; Slant runs the full solver (`DIFF_HARD`) on every board,
  and on the Easy board `5x5de:1a0a11a22a3b22b1a1g330a1b1a`, over 4,000
  positions, 8 plans opened with a square read off a mark and 2,333 had such
  a step; Singles runs every technique at every tier (six dealt `6x6de`
  boards each held two to four neighboring-line pairs); Spokes plans with the
  bounded look-ahead on every board. `census/keen.md`, `mathrax.md`,
  `unequal.md`, `towers.md`, `ascent.md`, `slant.md`, `singles.md`,
  `spokes.md`.
- **An unknown difficulty letter.** `engine-params` states neither behavior
  ("The codec grammar is a prefix, tagged segments, flags and letters" does
  not say what an unknown letter does, and nothing says a game must choose
  one or the other). The games on each side, and the notes' disagreement
  about the codec, are under "A params string read oddly".
  `census/sticks.md`, `tents.md`, `magnets.md`, `slant.md`, `unruly.md`.
- **Group's capital `M`, against `engine-notes`.** "The Mark-all action is
  the M key" says a game with `canMarkAll` handles "the `M`/`m` key"; Group
  answers capital `M` only (`button === 77`), small `m` being an element. The
  engine requirement could say that a game whose values are letters keeps the
  small one. `census/group.md`.
- **Bridges' in-between percentage.** A percentage field declared as choices
  is judged by the choice a value falls to, not the value: `i35` and `i0` are
  refused by the engine for dealing and loading alike; `i32` passes it and is
  refused, for dealing only, by `validateParams`
  (`src/games/bridges/state.ts:238`); `e105` likewise (`:240`); and `i7` is
  refused by neither, deals, and is labeled "7% islands". So the two
  sentences of `validateParams` are reached, by a typed ID alone, for 31 to
  34 and for 101 to 109. The engine could judge a choices field's number
  against the choices' own values where the codec writes the value.
  `census/bridges.md`.
- **Netslide's titles, against `engine-params`.** "A preset title that names
  a difficulty names its own tier": Netslide has no tiers and titles a preset
  "easy" (`src/games/netslide/index.ts:98-105`), and the guard
  (`src/engine/difficulty-contract.test.ts:183-212`) passes it twice over,
  walking only games with a difficulty contract and matching the scale's
  words with their capitals. "A preset keeps a declared title only for a name
  no field says": `easy` is the `b1` field said again and `hard` the `w`
  field; the describer names the three 3×3 presets "3x3, 100% barriers",
  "3x3" and "3x3 wrapping" where the menu shows "3x3 easy", "3x3 medium" and
  "3x3 hard". Recommendation: title these by what differs and drop the three
  words. Whether the titles change or the engine rules gain an exception is
  the owner's call: either changes what a player reads.
  `census/netslide.md`.
- **The shared dimension parser, against `engine-params`.** "The engine
  provides a shared dimension param parser" says a game "SHALL use it and
  SHALL NOT parse the prefix itself"; Mines
  (`src/games/mines/state.ts:129-136`), Net (`src/games/net/state.ts:85-95`)
  and Netslide (`src/games/netslide/state.ts:107-116`) each parse it
  themselves. The behavior is the same in Mines and Net and differs in
  Netslide (`3w`, above). `census/mines.md`, `net.md`, `netslide.md`.
- **The dot-run grammar.** The closing-letter and skip-case rules are
  `engine/dot-runs.ts`'s, which Clusters' and Unruly's givens share letter
  for letter; no capability states them. An `engine-params` requirement
  beside "The engine provides the two desc value alphabets" would state it
  once. `census/clusters.md`.
- **The wall-run grammar.** `src/engine/wall-runs.ts` is shared by Rome and
  Seismic (a letter is open borders and the wall that ends them, `z` ends on
  none); each game's spec describes it for itself. One requirement in
  `engine-params` would serve both. `census/rome.md`, `seismic.md`.
- **The wires codec.** `engine/wires.ts` is shared by Net and Netslide and no
  engine capability states it, so both games' specs do. `census/net.md`.
- **The value of a `paramConfig` bound.** That a `bounds` is a refusal at
  load as well as at deal is `engine-params`, "Params validity is the
  engine's check", but no game's spec is told to state its own bounds'
  values, which a shared link depends on. Every game with `bounds` owes the
  sentence Map's new first requirement gives. `census/map.md`.
- **The reading a candidate game starts on.** `engine-candidate-hints`, "A
  game states the reading it starts on", makes `populate` the convention and
  asks a game that overrides it to say so. Rome starts on `implicit`, as do
  Group, Mathrax, Seismic, Solo and Unequal
  (`git grep -n 'candidateReading: "implicit"' src/games`); only Map's spec
  states its own default, and each of the others owes the same sentence.
  `census/rome.md`.
- **The keyboard cursor hides when the board becomes solved.** Magnets'
  `changedState` does it, many games do the same in the same line, and no
  engine capability was found to state it. `census/magnets.md`.
- **The tier letters.** Nothing in `engine-params` or `engine-difficulty`
  gives a tier a letter, so every tiered game's spec owes its own table:
  Loopy's are `e` `n` `t` `h` with `h` Hard, where Keen's and Group's `h` is
  Tricky and Group's `x` is Hard, upstream's letters from names since
  renamed. `census/loopy.md`, `group.md`.
- **A won board that the hint walk reads as deduction run out.** The Mines
  recommendation above asks whether the engine's walk of a hint to the end of
  a board has the same hole for every untiered game. `census/mines.md`.

## A question for the owner

- **Crossing: should a click on a wall put a held clue down?** A held clue
  survives a click on a wall, a right-click, an arrow and Enter
  (`src/games/crossing/index.ts:176-193`, `:239-242`); on the first preset's
  board with 871 held, each left it held. The delta says so; the choice is
  one nobody has made. `census/crossing.md`.
- **Cube: should a board whose start square is painted load?** `3905,2` for
  `c4x4` loads, the solid standing on painted square 2 with no face painted,
  and the paint is picked up on a roll back onto the square. The delta's
  description requirement says the parser reads such a start as any other;
  refusing it would change what loads. `census/cube.md`.
- **Cube is a draft and its spec does not say why.** It has no `hint`, no
  `solve` and no `transposeParams`, and excuses only `findMistakes` in
  `notApplicable` (`src/games/cube/index.ts:363-366`). Same Game, Slide and
  Twiddle have no hint either; `src/games/slide/index.ts` says in its header
  that one "would be a solver-path hint of its own". `census/cube.md`,
  `samegame.md`, `slide.md`, `twiddle.md`.
- **Sixteen: a Solve adds one to the move count the status bar shows**
  (`src/games/sixteen/index.ts`, `executeMove`'s `solve` arm). The note
  states the fact and no more. Flip's Solve, under "Smaller things", adds one
  for each press. `census/sixteen.md`.
- **Guess: a won status bar says the board is finished twice.**
  `statusbarText` writes `Solved in N guesses.` and the midend prefixes the
  engine's words: `COMPLETED! Solved in 3 guesses.` and `Auto-solved. Solved
  in 1 guess.` on `c6p4g10Bm:7ad40e9b`. The owner may want one of them.
  `ts-engine`'s "No game writes the completion words itself" scans for what
  the words say, and this string passes it. `census/guess.md`.
- **Guess: the color numbers do not survive a reload.** They are not in
  `encodeUi`; the help (`help/games/guess.md:31`) offers them for colors that
  are hard to tell apart, a need that outlasts a session, and a preference
  would keep it. `census/guess.md`.
- **Towers: whether to tighten the too-near rule.** It passes over a height
  that stands behind a taller one only when the taller one is at least two
  taller: the loop starts one height too high (`src/games/towers/solver.ts`,
  the "Lower bounds" block, `mm = height + 1`), as upstream's `towers.c` does
  (`for (m = n+1; m < w; m++)`). It is sound, and the generator's grading
  rests on it. With one clue of 4 on a 5×5 line, 5 in the fourth cell and 4
  in the fifth, only height 3 is struck from the nearest cell; passed over,
  it would have left 3 struck from two cells and 2 from one. The delta states
  the code, and its scenarios assert only the first half. `census/towers.md`.
- **Map: should a player in notes mode be able to erase by drag?** A drag
  from outside the grid onto a colored region does nothing while the Marks
  button is on (`drop` in `src/games/map/index.ts:154`); the help states
  neither. `census/map.md`.
- **Net: are wrapping arrows wanted on a grid that does not wrap?** Left from
  0,0 on a 5×5 lands on 4,0. The delta states it as Net's own rule.
  `census/net.md`.

## Smaller things

Words a player reads:

- Sixteen titles a board dealt by one shuffling move "4x4, 1 shuffles"
  (`4x4m1`; `src/games/sixteen/state.ts`, `${p.movetarget} shuffles`). The
  delta's title scenario is ten moves. `census/sixteen.md`.
- Subsets' generated Controls paragraph says "Press Backspace or Delete to
  leave the number under the cursor undecided"
  (`src/games/subsets/index.ts:401`); the cursor is on a letter
  (`index.ts:308`). One word to fix. `census/subsets.md`.
- Sticks composes a label for params no deal accepts: `2x2b50s2du` reads "2x2
  Unreasonable, 50% blocks" and is refused for a deal. `census/sticks.md`.
- Galaxies' status bar can also read `Difficulty Unreasonable.`, and
  `Impossible`, `Ambiguous` or `Unfinished` (`DIFF_NAMES`); the spec's "when
  it is known" does not list them, and the last three were not reached.
  `census/galaxies.md`.
- Clusters' spec calls the two colors blue and red, upstream's names; the
  help and the hint use the palette's pair. `census/clusters.md`.
- ABCD's `regionsFull` and `note` sentences are held by no requirement; a
  session that wants the wording held would add it to "ABCD offers an
  explained hint". `census/abcd.md`.
- Light Up refuses a `5` or a `9` with "has a number out of range" and a `C`
  with "where it can't have one"; which of the collection's sentences a
  refusal speaks is not stated for either. `census/lightup.md`.

A help page shorter than the code, with no contradiction:

- ABCD: `M`'s second press, the strike (`help/games/abcd.md:22`,
  `src/games/abcd/index.ts:203`). `census/abcd.md`.
- Ascent: Space or Backspace at the cursor, the number pad's diagonals, and
  either preference. `census/ascent.md`.
- Boats: a left drag from a boat segment waters every square of the line
  that is no given (`help/games/boats.md:17`,
  `src/games/boats/index.ts:150`). `census/boats.md`.
- Crossing: `0` clears (`help/games/crossing.md:9`,
  `src/games/crossing/index.ts:115-120`). `census/crossing.md`.
- Map: "pressing Enter twice without moving erases" is true of a colored
  region only (`src/games/map/index.ts:284`). `census/map.md`.
- Mathrax: `0` clears (`src/games/mathrax/index.ts:215`).
  `census/mathrax.md`.
- Pattern: the line with no clues, rung `lineEmpty`
  (`src/games/pattern/solver.ts:632-643`, `help/games/pattern.md:35-41`).
  `census/pattern.md`.
- Pearl and Slide: Backspace and Delete cancel as Escape does
  (`isCancelKey`). `census/pearl.md`, `slide.md`.
- Rome: the arrows answer to `8`, `2`, `4` and `6` wherever typed, the number
  row included. `census/rome.md`.
- Salad: `-`, `_`, `+`, `=` and `0`, and a letter typed on a Number Ball
  board or a digit on an ABC End View one. `census/salad.md`.
- Seismic: `Delete` and `0` clear (`help/games/seismic.md:11`).
  `census/seismic.md`.
- Singles: the cursor wraps (`help/games/singles.md:12`); the generated
  paragraph has no words for it. `census/singles.md`.
- Unequal: a right-click on a sign or bar marks it done
  (`src/games/unequal/index.ts:224`, `help/games/unequal.md:23`).
  `census/unequal.md`.
- Palisade: the help lists its ideas "from the plainest up" with "Two clues
  side by side" fourth (`help/games/palisade.md:46-52`);
  `src/games/palisade/solver.ts:399` runs it first, once. The help does not
  claim the order tried. `census/palisade.md`.
- Sokoban: the help says a tap walks "the shortest way round"; the spec says
  "by any way round" and the route is the animation's. `census/sokoban.md`.

A requirement in the tree that reads loosely, or wants rework:

- Flip, "Flip's solver finds a shortest set of presses", says Solve presses
  the answer "in one move": one step of the history, while `moves` rises by
  one for each press (`Auto-solved. Moves: 5`). A reader of it alone would
  expect one. `census/flip.md`.
- Range, "Range's deduction applies three rules to a fixpoint", lists
  adjacency, the clue rule, connectedness; the solver runs the clue rule
  first (`applyRules`). Not written as an order, but may be taken for one.
  `census/range.md`.
- Rectangles, "A Rectangles hint step is one of five deductions", lists the
  five in the order tried and does not say it is an order; "Rectangles input"
  still holds the pointer drags, the click, the cancel keys and the status
  bar in one paragraph; and the header comment of `src/games/rect/index.ts`
  still says "a half-grid keyboard cursor". `census/rect.md`.
- Palisade's existing requirements name rungs by id (`equivalentEdges`,
  `notTooBig`), which the brief says a spec does not do. `census/palisade.md`.
- Pearl's "Pearl's keyboard cursor draws lines and marks" and the new
  keyboard requirement could be folded into one. `census/pearl.md`.
- Filling, "Filling fill moves and selection", names Backspace only; Delete
  erases too (`isEraseKey`). `census/filling.md`.
- Boats, "Boats solves with a four-tier deductive solver", names no
  technique; the solver's own order differs from the hint's and is still
  unstated. `census/boats.md`.
- Unequal's spec never says what each tier means. `census/unequal.md`.
- Spokes' Purpose says the hint "refuses a position it cannot vouch for"
  (`PUZZLE_NOT_REASONABLE`) and no requirement does; no loaded board reaches
  the branch. `census/spokes.md`.
- Scenarios that quote no real string: Keen's "Keen's params encoding" and
  "Keen descriptions encode the block structure and cage clues"; Light Up's
  "Light Up's parameters" and "Light Up descriptions use the upstream
  run-length encoding" (`c2mBc2a1a4aBc2m1c` for `7x7b20s4d0` loads); Map's
  "Map decodes params leniently" (`src/games/map/map.test.ts:155-162` holds
  `20x15n30dh` and `10x10n5.5`) and its desc requirements. `census/keen.md`,
  `lightup.md`, `map.md`.

Something no spec states, and this change's kinds had no row for:

- A save field: Mines' saved `Ui` is `D{deaths}`
  (`src/games/mines/state.ts:331-339`), a `C` from an older save being read
  past; Net's is `O{x},{y};C{x},{y}` (`src/games/net/index.ts:724-728`).
  `census/mines.md`, `net.md`.
- The keys of a game's own preferences where the spec describes them by what
  they do; Crossing's three were so, and the same may hold of other games.
  `census/crossing.md`.
- Twiddle: what `movetarget` does to the deal (exactly `K` random turns, or
  `2·w·h·n²` plus one at random), and `textFormat`'s output.
  `census/twiddle.md`.
- Net: the barrier probability is kept in single precision and written as
  C's `%g` (`src/games/net/state.ts:76`, `:106`); the spec's `b{prob}` does
  not say so. `census/net.md`.
- A decimal read with leading zeros: Cube's start square and Fifteen's
  numbers (`2,7,0,8,1,5,3,6,04` loads), which the notes call the engine
  reader's for every game; Keen's clue value (`m03` is `m3`) and Mathrax's
  (`A06` reads as `6+`), which no encoder writes. `census/cube.md`,
  `fifteen.md`, `keen.md`, `mathrax.md`.
- Flood: nothing refuses a color count the description alphabet cannot write
  beyond the `paramConfig` bound of 10, which the description requirement
  leans on. `census/flood.md`.
- Mines: the `X` and `Y` params letters have no reader in play
  (`src/games/mines/generator.ts:411-420`); and the hint gives up past forty
  candidates (`src/games/mines/deduce.ts:162-165`), which is not stated.
  `census/mines.md`.

Tests and code:

- Spokes' test "carves a wider hole for 'X' than for '0'"
  (`src/games/spokes/spokes.test.ts`) does not compare the two: `0X0111111`
  and `000111111` give the same spokes. `1X1111111` against `101111111` shows
  the difference, and no test holds one. `census/spokes.md`.
- Mines' test example `1,1,u800` on `3x3n1`
  (`src/games/mines/mines.test.ts:167`) is a board no player can open: the
  midend refuses it with "There must be at least 9 more squares than mines."
  `census/mines.md`.
- No test of Flip opens a description with an empty matrix row
  (`0074191345d1644c17058,5d0` under `3x3c`, where Enter on the top-left
  square makes no move). `census/flip.md`.
- Tents: no real description with a `z` was found for a scenario (none from
  `8x8dt`, `10x10de`, `10x10dt`, `15x15de`, `15x15dt`), and no test holds
  one. `census/tents.md`.
- Dominosa's set-analysis scenarios are composed positions and were not run.
  `census/dominosa.md`.
- A throw that is the only statement of an ordering argument: Magnets'
  `recordingPass` throws if the `neither` technique fires with no premise,
  and Tracks' loose-end rung throws on the recording path if its second rule
  ever changes the board ("a loose end in line … had a side left to block").
  A session reordering either ladder would learn it from the throw.
  `census/magnets.md`, `tracks.md`.
- Unruly: a single-gap step carries the rung `complete`, so `hintRungs` has
  four entries for five techniques (`checkSingleGap`). `census/unruly.md`.
- Twiddle: `fixedBlockKey` strips every modifier but the keypad bit, so
  Ctrl+`a` turns the top-left block. `census/twiddle.md`.
- Signpost: a keyboard pick-up is not refused on the given last number or
  the given 1 as a pointer press is; the drag starts and its release makes no
  link. `census/signpost.md`.
- Blackbox: after a check that fails with the pointer while the hidden cursor
  is parked on the corner, Up or Left does nothing and Right or Down walks it
  off. `census/blackbox.md`.
- Undead: a right-click on a count block does nothing
  (`src/games/undead/index.ts:188`). `census/undead.md`.
- Bridges: which step a hint gives first follows the order the description
  lists the islands in, though the solver's verdict does not.
  `census/bridges.md`.
- Magnets: for `−` the only-end deduction fires only when no tile of the line
  can still give a `+` (`src/games/magnets/solver.ts:463-475`, upstream's
  count, kept on purpose): sound, and weaker than the `+` case.
  `census/magnets.md`.

A hint sentence read from the code and seen on no board:

- Boats' "every boat in the fleet has been found" (`growTooLong`,
  `src/games/boats/hint-text.ts`): no board reaches it by the reading of
  `validateFullState`, not settled by a search. `census/boats.md`.
- Galaxies' "The only way out" did not come up in 33,265 steps.
  `census/galaxies.md`.
- Loopy's `closesLoop` and `related` fired on none of 63 dealt boards and
  were produced on built positions: rare, not dead. `census/loopy.md`.
- Inertia's `NO_MOVE_WORTH_MAKING` is a backstop no board reaches.
  `census/inertia.md`.
- Rome's two-leg journey for an arrow ruled out toward both neighbors: none
  in fourteen boards walked from 4×4 to 10×10. `census/rome.md`.
