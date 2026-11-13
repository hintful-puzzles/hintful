# Census 4: rect rome salad samegame seismic separate signpost singles sixteen slant slide sokoban

Paths are relative to src/games/<game>/ unless prefixed `engine/` (src/engine/).
Line numbers are those of the tree read on 2026-11-13.

## Composition forms (engine/hint-words.ts:596-632, `compose`), which every `so({look, follows, move})` / `sentence({...})` below sits in
- forced (`so`): `{look}, so {move}.`  With follows: `{look}, so {follows}: {move}.`  (hint-words.ts:premiseOf 579, compose 601-605)
- answers: `{look}. {how}: {move}.`
- effect: `{move}: {effect}.` (preceded by `{look}. ` when there is a look)
- sequence: `First, {move}[: effect].` / `Next, ...` / `Last, ...`
- again: `…and {move}, for {basis}.`
- serves with aim: `Working on {aim}: {move}.`
- Shared candidate-game strings (engine/hint-text.ts), used by Rome, Salad, Seismic:
  - populateText: `Start by penciling every candidate {noun} into each empty {cell}, so there is something to cross out.` (engine/hint-text.ts:113)
  - cleanObviousText: `Now clear the easy ones: cross out any {noun} already {placedVerb} in its {cell}'s {regions}.` (engine/hint-text.ts:133)
  - noteText arms (Rome and Seismic write their own copies, see below): `Nothing in {here}'s {regions} rules out {a} {noun} yet` / `pencil in every one`; `Only {values} isn't|aren't already {placedVerb} in {here}'s {regions}` / `pencil it|them in` (engine/hint-text.ts:159-165)
  - narrateLatinReason single: `Every other {noun} has been ruled out in {here}, so it can only be {v}` (engine/hint-text.ts:324-325)
  - regionsFull: `{here}'s {regions|row and column} already hold every other {noun}, so it can only be {v}` (engine/hint-text.ts:329)
  - hiddenSingle: `Every other {cell} in {line} rules out {v}, so {here} must be {v}` (engine/hint-text.ts:342-343)
  - conclusions: `must go` / `must be {v}` / `can only be {a} or {b}` (engine/hint-text.ts:253,256,259)
  - latinPremise dup: `The {v} just placed can't repeat in its row and column` + where `from the other {cell}s` (engine/hint-text.ts:452, 420)
  - latinPremise set: `{cells} already account for {values} between them` (engine/hint-text.ts:430); confined: `These {k} rows|columns fit {v} only in {cell}, taking the {v} of {k} columns|rows` (:380); wing (:404)
  - edgeContinuation (Separate): `{edges} must be a wall too` / `{edges} can't be a wall either` (engine/hint-text.ts:101-102)

---------------------------------------------------------------------------------------------------

## rect (hint-text.ts)
Templates:
- last-candidate/forced-by-fit (1-clue) | `A 1 needs no other square, so {rect} is its whole rectangle` | hint-text.ts:132-133
- last-candidate (only fit) | `Elsewhere the {n} would {run off the board | take in {the outlined clue} | cross a line | leave out part of the rectangle drawn round it}, so only {rect} fits` | hint-text.ts:136-146 (joinOr of reasons, 136,139,141,143)
- forced-by-clash (boxed) | `Lines close {rect} round the {n} alone, so it is the {n}'s whole rectangle` | hint-text.ts:151-152
- last-place (reach) | `No other clue can reach {the outlined square}, so the {n} must cover it: {rect} is the only way it can` | hint-text.ts:156-158 (long form with follows)
- would-break/forced-by-overlap (overlap) | `Wherever {the outlined clue} goes, it covers {the striped square}, so the {other }{n} can't use {it|them}: {rect} is all it has left` | hint-text.ts:163,165,166
- count-starved (starve) | `Elsewhere the {n} would leave {each outlined clue no room | each outlined square no cover}, so it must take {rect}` | hint-text.ts:173,180,185-186
- neighbor-ruled-out (edge is a line) | `Only {the outlined clues} can cross {this edge}, and {it|each} would {take {striped} {owner} always covers | take {owner}'s {striped square} | miss {the square|an outlined square} only it reaches}, so the edge is a line` | hint-text.ts:97-98,110,113,120 (one clue vs several clues forms)

RULE-CLAUSE: none firm.
MAYBE:
- `A 1 needs no other square` (hint-text.ts:132): restates what a 1 means; the board-specific part is only that the clue is a 1. The player has the clue's rule. Doubt: it is also the whole reason the move is forced.
- `miss {the square} only it reaches` (hint-text.ts:110): leans on the rule that every square must be covered, left unsaid; the clause itself gives the board reason, so probably fine.

VOCAB: cell/square = "square" (also "rectangle" for the drawn region); clue is named by number ("the 6", "square 4", "tall clue", "? clue"; hint-text.ts:35-44); ruled out = "would run off / cross a line / take in a clue", "can't use", "can cross"; edge forced = "the edge is a line"; pointing = "{rect}" (ringed rectangle), "the outlined ...", "the striped square", "this edge" (ringed), "another outlined clue", "each". Unusual: "no room" / "no cover" (as nouns after "each"), "always covers", "other {n}" to tell two like clues apart.

---------------------------------------------------------------------------------------------------

## rome (hint-text.ts; sentences also use the shared candidate strings above)
Templates:
- placement-rule/setup | `Start by penciling every candidate arrow into each empty square, so there is something to cross out.` | hint-text.ts:74 -> engine/hint-text.ts:113
- setup | `Now clear the easy ones: cross out any arrow already placed in its square's area.` | hint-text.ts:77 -> engine/hint-text.ts:133
- note (every) | `Nothing in {this square}'s area rules out a way it can point yet, so pencil in every one` | hint-text.ts:85-86
- note | `Of the ways {this square} can point, only {up, left} isn't|aren't already used in its area, so pencil it|them in` | hint-text.ts:90-91
- last-candidate (naked single) | `Every other arrow has been ruled out in {this square}, so it must point {up}` | hint-text.ts:98-99
- last-candidate (regionsFull) | `Every other way {this square} can point is already used in its area, so it must point {up}` | hint-text.ts:106-107
- last-place (hiddenSingle) | `{Its area} must hold all four arrows, and only {this square} can still point {up}, so it must point {up}` | hint-text.ts:116-117
- last-place (onlyHome, strike premise) | `{Its area} must hold all four arrows, and only {this square} can still point {up or left}` + `must go` conclusion | hint-text.ts:160-161
- conclusion | `the {up marks} {where} must go` / `{struck} must go` / `this square's {up marks} must go` / `must point {up}` / `must point {up or left}` | hint-text.ts:130-135
- count-met/neighbor-ruled-out (dup) | `{This area} now has {its up arrow}` + where `in it` | hint-text.ts:143-144
- would-break (loop) | `{The arrow in the square above} points back to {this square}` / `{The arrows from the square above} lead back to {this square}` | hint-text.ts:153-154
- last-candidate (reach) | `Every square needs a goal, and only one mark in {this square} leads to {the striped group}` + `its other marks` | hint-text.ts:167-168
- would-break (opposite) | `{Its upper neighbor} in {this area} must point {down} (a loop) or {up} (two ups)` | hint-text.ts:183
- chain/pair | `{Two squares} of {this area} must take {up or down} between them` + where `of the area` | hint-text.ts:188-189

RULE-CLAUSE:
- `Start by penciling every candidate arrow into each empty square, so there is something to cross out.` (hint-text.ts:74 / engine/hint-text.ts:113): the clause `so there is something to cross out` says why the penciling move kind exists, and the player has the pencil tool and knows hints cross out.
- `Every square needs a goal` (hint-text.ts:167): a rule of the game (every square leads to a goal) quoted as the sentence's opener; the player has the rule, and the board-specific part is `only one mark in this square leads to the group`.
- `{Its area} must hold all four arrows` (hint-text.ts:116, 160): restates the area rule (each area holds every arrow once); it is also the premise of the hidden single, so see MAYBE.
MAYBE:
- `any arrow already placed in its square's area` (engine/hint-text.ts:133 via hint-text.ts:77): restates the uniqueness rule inside the setup step; doubt: names which notes the step strikes, which the board does not show beforehand.
- `(a loop) or ... (two ups)` (hint-text.ts:183): explains what the wrong arrows would make; they are the board-specific consequences, parenthetical glosses of a rule.
- `Every other arrow has been ruled out in {this square}` (hint-text.ts:98): no rule restated, listed only because the shared naked single says the same in other games with a different clause shape.

VOCAB: cell = "square" (hint-text.ts:44, explicit override; help says square); values are "arrows" / "ways {it} can point", named as words (up, down, left, right; hint-text.ts:47); ruled out = "has been ruled out" (single), "is already used in its area" (regionsFull, note), "must go" (strike); pointing = "{this square}" (ringed), "{its area}" (striped), "its up arrow" (outlined), "the square above" (relation word); region = "area". Unusual: "leads to", "points back", "goal", "group", "home" appear only in comments; "mark" for note, "must point".

---------------------------------------------------------------------------------------------------

## salad (hint-text.ts; generic arms are the engine's, listed above, spoken with cell="square", noun letter|number, hint-text.ts:46-55)
Templates:
- setup | `Start by penciling every candidate {letter|number} into each empty square that has none yet, so there is something to cross out.` | hint-text.ts:106
- setup | `Now clear the easy ones: cross out any {noun} already placed in its square's row or column.` | hint-text.ts:108 -> engine/hint-text.ts:133
- last-candidate (generic single / regionsFull / hiddenSingle) | see engine strings above, wired at hint.ts:196
- forced-by-clue (borderNear, k=0) | `{This clue} sees {A} first, and {the outlined square} nearest it can hold only {A}` | hint-text.ts:122,128
- forced-by-clue (borderNear) | `{This clue} sees {A} first past {k empty square(s)}, which leaves only {A} for {this square}` | hint-text.ts:122,129
- neighbor-ruled-out (borderFar, blocked) | `{This clue} sees {A} first, and {the outlined square} furthest from it holds a {noun}` + where `past it` | hint-text.ts:151,170
- count (borderFar, room 0) | `{This clue} sees {A} first, and the {row|column}'s {empty square is|empty squares are} marked later, keeping it {in the square nearest it | in the first N}` + where `beyond that` | hint-text.ts:164,155-156,170
- count (borderFar) | `{This clue} sees {A} first, after at most {k empty square(s)}, keeping it {in the square nearest it | in the first N}` | hint-text.ts:165
- count-met (countHolesDone) | `{This row|column} already has {its one empty square | both of its empty squares | all k of its empty squares}, so {this square and the rest of it} must hold a {noun}` | hint-text.ts:176-177, allItsHoles 85-89
- count-met (countLettersDone, placed) | `{The one {noun} | Both {noun}s | All k {noun}s} of {this row} {is|are} already placed, so {this square and the rest of it} must be empty` | hint-text.ts:195,197
- count-met (countLettersDone, known) | `We already know which {square | k squares} of {this row} {holds its {noun} | hold its {noun}s}, so {this square and the rest of it} must be empty` | hint-text.ts:196-197
- chain/again (countAgain) | `…and {this square} must {be empty | hold a {noun}} too, for {the same row|column}` | hint-text.ts:205-208
- last-candidate (crossNaked) | `Every {noun} is ruled out in {this square}, so the empty-square mark is the only one left: the square must be empty` | hint-text.ts:214-216
- other:note-gone (xNoteGone) | `{This square}'s pencil marks have no empty-square mark among them, so it must hold a {noun}` | hint-text.ts:224-225
- count/set (setHoles, strike premise) | `{The outlined squares} account for {A, B and }{the one empty square | both empty squares | all k empty squares} of their {row|column}` + struck `{A, B and the X | the X}` | hint-text.ts:245,252
- other:note-gone (circleXNote) | `{This square|These squares} {is|are} now known to hold a {noun}` + struck `its empty-square mark | their empty-square marks` | hint-text.ts:257,261

RULE-CLAUSE:
- `..., so there is something to cross out.` (hint-text.ts:106): says why penciling exists; the player has the pencil tool.
- `{The clue} sees {A} first` (hint-text.ts:122, 151, 164, 165): MAYBE rather, see below.
MAYBE:
- `any {noun} already placed in its square's row or column` (engine/hint-text.ts:133): restates the Latin uniqueness rule inside the setup step.
- `sees {A} first` (hint-text.ts:122,151,164,165): restates what a border clue means (first symbol seen); it is the premise every clue sentence rests on, so it names the clue's value, which is board-specific, but "sees ... first" is the rule of the clue.
- `Every {noun} is ruled out in {this square}, so the empty-square mark is the only one left` (hint-text.ts:215): the second clause leans on the rule that a square may be empty.
- `We already know which squares ... hold its {noun}` (hint-text.ts:196): narrates the player's marks; no rule, but "We" differs from every other game's voice.
- `marked later, keeping it ...` (hint-text.ts:164): board fact; listed for its odd "later" wording.

VOCAB: cell = "square" (hint-text.ts:54); value = "letter" or "number" per mode, the might-be-empty note is "the X" (hint-text.ts:52); empty = "empty square", "must be empty", "empty-square mark"; ruled out = "is ruled out", "must go"; pointing = "this square" (ringed), "this row" (striped), "this clue" (outlined, letter lit), "the outlined square", "the same row". Unusual: "We already know", "sees ... first", "nearest it", "furthest from it", "beyond that", "past it", "keeping it in the first N", "this square and the rest of it", "holds a {noun}".

---------------------------------------------------------------------------------------------------

## samegame (hint-text.ts; refusal in hint.ts:153)
Templates:
- other:effect (last) | `Remove {this group}: that clears the board.` | hint-text.ts:67-68
- last-candidate (none) | `There is no other group, so remove {this group}.` (or with the relation's form) | hint-text.ts:73
- would-break (lastOfColor) | `Removing {the striped group} would leave {the outlined square} the last {red} one. One way to avoid it: remove {this group}.` | hint-text.ts:83-85
- would-break (stuck) | `Removing {the striped group} would leave no two touching squares of one color. One way to avoid it: remove {this group}.` | hint-text.ts:91-93
- forced (only) | `Removing any other group would leave a board that can never be cleared, so remove {this group}.` | hint-text.ts:100
- other:effect (onlyThese) | `Only {this group} and {the outlined group(s)} keep the board clearable, so remove {this group}.` | hint-text.ts:113
- other (alsoThese) | `{This group} and {the outlined groups} keep the board clearable; some others do not` + move | hint-text.ts:126
- other (anyGroup) | `Removing any group now keeps the board clearable` + move | hint-text.ts:134
- other (joins) | `{The outlined square} has no {red} square beside it. One way to bring one beside it: remove {this group}.` | hint-text.ts:143-145
- other (plain) | `Remove {this group}.` | hint-text.ts:151
- refusal (dead end) | `{The outlined square(s)} {is|are each} the last of {its|their} color, so the board can never be cleared. Undo until {it has|each has} another square of its color.` | hint.ts:153

RULE-CLAUSE:
- `so the board can never be cleared` (hint.ts:153): restates the goal (clear the board); the player knows what a dead board is. Fair reading: it is the reason this state is a dead end, so see MAYBE.
MAYBE:
- `that clears the board` (hint-text.ts:68): the effect of the last removal is the goal itself; board-specific only in "this is the last group".
- `a board that can never be cleared` (hint-text.ts:100): the rule/goal; but it is the reason every rival fails.
- `keep the board clearable` (hint-text.ts:113,126,134): same goal phrase; reasons about search outcome, not a rule.
- `Undo until it has another square of its color` (hint.ts:153): a how-to instruction, not a rule.

VOCAB: cell = "square"; the connected set is a "group"; color words from the palette (`colorName`, hint-text.ts:30); ruled out = n/a, a rival "would leave ...", "can never be cleared"; pointing = "this group" (ringed), "the striped group" (rival), "the outlined square / groups". Unusual: "One way to avoid it", "One way to bring one beside it" (answers form), "the last {red} one", "keeps the board clearable".

---------------------------------------------------------------------------------------------------

## seismic (hint-text.ts; narrateLatinReason for naked at :99)
Templates:
- setup | `Start by penciling every candidate number into each empty cell, so there is something to cross out.` | hint-text.ts:52 -> engine/hint-text.ts:113
- setup | `Now clear the easy ones: cross out {any number already in its cell's area or in a cell touching it | any N already in its cell's area or within N cells of it in its row or column}.` | hint-text.ts:61-70
- note (every) | `No number stands near enough to rule one out of {this cell} yet, so pencil in every one` | hint-text.ts:81-82
- note | `Only {1, 3} isn't|aren't already in {this cell}'s area or {in a cell touching it | within reach along its row or column}, so pencil it|them in` | hint-text.ts:86-87, reach 42-45
- last-candidate (singleton) | `{This area} is a single cell, so {this cell} can only be 1` | hint-text.ts:94-95
- last-candidate (naked) | `Every other number has been ruled out in {this cell}, so it can only be {n}` | hint-text.ts:99 -> engine/hint-text.ts:324
- last-candidate (regionsFull) | `Every other number is already in {this cell}'s area or {in a cell touching it | within reach along its row or column}, so it can only be {n}` | hint-text.ts:104-105
- last-place (hidden) | `No other cell in {the striped area} can still be {n}, so {this cell} must be {n}` | hint-text.ts:110-111
- count/neighbor-ruled-out (cull) | `The {n} just placed rules out {n} in its area and {in the cells touching it | within {n} cells of it in its row and column}` (+ `those {n}s`) | hint-text.ts:117-120, 151
- forced-by-clash (starve) | `{The striped area}'s {n} can only go {in a cell touching {this cell} | within {n} cells of {this cell|each of these cells}, in line with it}` (+ struck `this cell's {n}` / `their {n}s`) | hint-text.ts:138-143,147-148

RULE-CLAUSE:
- `..., so there is something to cross out.` (hint-text.ts:52 / engine/hint-text.ts:113): why the penciling move exists.
- `any N already in its cell's area or within N cells of it in its row or column` (hint-text.ts:66-67): restates the whole keep-apart rule inside the setup step (rule, not board).
- `...in its area and within {n} cells of it in its row and column` (hint-text.ts:119-120): the same rule restated as the reason of the cull.
MAYBE:
- `is a single cell` (hint-text.ts:94): board-specific (this area has one cell); the rule that an area of size k takes 1..k is left unsaid.
- `within reach along its row or column` (hint-text.ts:45) / `in line with it` (141): rule paraphrase used as the premise of the note and starve; the distance N is the board-specific part.

VOCAB: cell = "cell"; value = "number"; ruled out = "has been ruled out", "is already in", "rules out", "must go" (strike conclusion), "can only go"; pointing = "this cell" (ringed), "the striped area", "each of these cells", "The {n} just placed" (outlined), "those {n}s", "their {n}s". Unusual: "stands near enough", "within reach", "in line with it", "area" for region, "touching it" (tectonic mode vs `within N cells` in row/column mode).

---------------------------------------------------------------------------------------------------

## separate (hint-text.ts)
Templates:
- forced-by-clash (two lone squares) | `{These two As} can't share a region, so {every edge between them|the edge between them} must be a wall` | hint-text.ts:67-68, 63-64
- forced-by-clash (region + lone) | `{The striped region} already holds an A, so {the outlined A} can't join it: {the edge between them} must be a wall` | hint-text.ts:73-75
- forced-by-clash (two regions) | `{The striped and outlined regions} both hold an A, so they can't join: {every edge between them} must be a wall` | hint-text.ts:78-80
- chain/again | `…and {every edge} must be {walls|a wall} too, for {the same two As | the same striped region | the same striped and outlined regions}` (engine edgeContinuation) | hint-text.ts:113-118; engine/hint-text.ts:101
- forced-by-connection (walledApart) | `A wall already separates {the striped region and the outlined square}, so {every other edge between them | this edge between them} must be a wall too` | hint-text.ts:88-92
- count-met (onlyWay, lone) | `{This A} is walled in on every side but one, so {this edge} can't be a wall` | hint-text.ts:102
- count-met (onlyWay, region) | `{The striped region} has {n} of its {k} squares and one square left to grow into, so {this edge} can't be a wall` | hint-text.ts:107

RULE-CLAUSE: none firm.
MAYBE:
- `can't share a region` / `can't join` (hint-text.ts:67, 74, 79): states the rule (a region holds a letter once), but it is the reason the edge must be a wall; board-specific part is the two letters.
- `has {n} of its {k} squares` (hint-text.ts:107): gives the region's size; the rule `a region of k squares` is the premise but the numbers are board-specific.

VOCAB: cell = "square" for a lone one, otherwise "region" (hint-text.ts:42-47); regions told apart by mark ("striped" and "outlined"); ruled out = "can't be a wall"; edge forced = "must be a wall", "must be a wall too", "can't be a wall either"; pointing = "the edge between them", "every edge between them", "this edge between them", "every other edge between them", "these two As", "the same two As", "the same striped region". Unusual: letters named by letter ("an A"), "walled in on every side but one", "grow into".

---------------------------------------------------------------------------------------------------

## signpost (hint-text.ts)
Templates:
- last-place/forced-by-connection (onlyNext, no rivals) | `{This arrow} points only at {the ringed square}, so it must come next` | hint-text.ts:57-58
- forced (onlyNext) | `{This arrow}'s {other square(s)} {follows another|follow others | is in its chain|are in its chain | holds the wrong number|hold the wrong number}, so only {the ringed one} can follow` (reasons joined by "or") | hint-text.ts:71-72, NEXT 17-23
- last-place (onlyBefore, no others) | `Only {this arrow} points at {the ringed square}, so the square must follow it` | hint-text.ts:79-80
- forced (onlyBefore) | `{The outlined arrow(s)} into {the ringed square} {leads|lead elsewhere | is|are in its chain | holds|hold the wrong number}, so it must follow {this arrow}` | hint-text.ts:88-89, BEFORE 26-31

RULE-CLAUSE: none.
MAYBE:
- `so it must come next` / `the square must follow it` (hint-text.ts:58, 80): the move clause states what the link means (next number); the player knows links; this is the conclusion rather than a rule, so probably fine.

VOCAB: cell = "square"; link source is "arrow"; ruled out = `{follows another / is in its chain / holds the wrong number / leads elsewhere}`; pointing = "this arrow" (ringed), "the ringed square", "the ringed one", "other square(s)" (striped), "The outlined arrow(s)". Unusual: "in its chain", "the wrong number", "can follow".

---------------------------------------------------------------------------------------------------

## singles (hint-text.ts; sentences wired from singles.description.yaml `says` via sentences{}, hint-text.ts:262-308; B = engine SHADED_NAME, C = UNSHADED_NAME = "clear")
Templates (B = black-word, C = "clear"):
- chain/forced-by-clash (sandwich) | `{The outlined n's} sit one square apart, so one of them must be {B}: {the {n} between them | the squares between them} must be {C}` | hint-text.ts:81-87
- count-met/forced-by-clash (pair) | `{The outlined n's} touch, so one of them stays {C} and uses up the {n} in {this row|column}: {the n} must be {B}` | hint-text.ts:93-95
- would-break (corner4) | `Left {C}, {corner n} would box itself in with {its two ns} {B}, so {it|the n diagonally inside|it and the n diagonally inside} must be {B}{, like the n diagonally inside}` | hint-text.ts:124-125
- would-break (corner3Corner) | `Left {C}, {corner t} would box itself in with {both ns beside it} {B}, so it must be {B}` | hint-text.ts:134-135
- would-break (corner3Inner) | `Left {C}, {inner t} would make {both ns} flanking {corner c} {B} and box the corner in, so it must be {B}` | hint-text.ts:141-142
- would-break (corner2) | `{The corner's ps} need a {B}; shading {this n} forces {the side p}, boxing {the corner} in, so it must stay {C}` | hint-text.ts:154-155
- would-break (offset) | `{The outlined ns and ks} mean shading {the ringed v | either ringed square} makes two {B} squares touch, so {that v | both ps | the p and q} must be {C}` | hint-text.ts:178-190
- neighbor-ruled-out (adjBlack) | `{A {B} square} touches {this v | these squares (n, n)}, so {that v | those squares} must be {C}` | hint-text.ts:200-209
- count-met (sameLine) | `{C n} already holds {this row}'s n, so {the n} must be {B}` / `{C n} shares a line with {the ringed n | each ringed n}, so {that n | those ns} must be {B}` | hint-text.ts:220-233
- would-break (boxedIn) | `{This v} is {the C square}'s last neighbor that isn't {B}, so it must be {C} to keep that square joined` | hint-text.ts:238-239
- would-break (split) | `Shading {this v} would cut some of {the square} off from the rest of the {C} region, so it must be {C}` | hint-text.ts:244-245

RULE-CLAUSE:
- `to keep that square joined` (hint-text.ts:239): restates the connectivity rule (all {C} squares join) as the closing reason; the premise `last neighbor that isn't B` already shows it.
- `so one of them must be {B}` (hint-text.ts:82): the rule (matching numbers in a line cannot both stay clear) taught as a clause; the board part is only the two numbers one square apart.
MAYBE:
- `{A black} square touches {this v}, so {that v} must be {C}` (hint-text.ts:200-209): the whole sentence is the no-adjacent-black rule applied to a square the player can see.
- `one of them stays {C} and uses up the {n} in this row` (hint-text.ts:94): the rule that a number appears once among clear squares, paired with a board fact.
- `makes two {B} squares touch` (hint-text.ts:182) and `would box itself in` (124,134): consequences of a rule, board-specific; borderline fair.
- `rest of the {C} region` (hint-text.ts:244): connectivity rule.

VOCAB: cell = "square" (also number-names like "the 4"); shaded = engine SHADED_NAME ("black" I believe, engine/piece.ts:30), unshaded = "clear" (piece.ts:33); the sentences name squares by the number they show ("the ringed 4", "that 4", "corner 4", "inner 4", "the side 4"); ruled out = "must be {C}" / "must be {B}" (no "is out"); pointing = "this 4", "that 4", "the ringed v", "the outlined", "either ringed square", "the same row". Unusual: "box itself in", "diagonally inside", "Left {C}", "shading", "sit one square apart", "touch", "flanking", "the corner's ps need a {B}".

---------------------------------------------------------------------------------------------------

## sixteen (hint-text.ts)
Templates:
- chain/forced-step (home) | `Working on {tile 5}: move it to {the ringed square}, its final spot.` | hint-text.ts:56,60,66
- chain/forced-step (staging) | `Working on {tile 5}: move it to {the ringed square} (setting up).` | hint-text.ts:56,61 (engine/hint-text.ts:83)
- chain/forced-step (two-leg preview) | `Working on {tile 5}: move it to {the nearer ringed square}, then {the other ringed square}{, its final spot | (setting up)}` | hint-text.ts:55,60-61
- chain/again (continuation) | `Working on {tile 5}: move it on to {the ringed square}.` | hint-text.ts:56,58

RULE-CLAUSE: none.
MAYBE:
- `(setting up)` (hint-text.ts:61 / engine/hint-text.ts:83): tells why this slide exists (a staging move); it is board-specific (this plan's staging) but a why-this-move-exists gloss.
- `its final spot` (hint-text.ts:60): same, says the aim is reached.

VOCAB: cell = "square"; "tile N" for a piece; pointing = "the ringed square", "the nearer ringed square", "the other ringed square"; no ruled-out vocabulary (a goal-and-tactic game, no deduction).

---------------------------------------------------------------------------------------------------

## slant (hint-text.ts)
Templates:
- count-starved (clueFill, nothing held) | `{This c clue} {must be touched by all four diagonals | needs a line from every square around it}, so {these squares} must slant toward it` | hint-text.ts:110-112, 104
- count-starved (clueFill) | `{This c clue} has {k lines from the outlined square | one line from its marked pair | ...} and needs {n} more, so {these squares} must slant toward it` | hint-text.ts:117,119; `has` 61-72
- count-starved (held both) | `{This c clue} has {one line from its chained pair and none from the outlined square}, so {these squares} must slant toward it` | hint-text.ts:116,119
- count-met (clueEmpty, 0) | `{This 0 clue} is touched by no diagonals, so {these squares} must slant away from it{, like {the outlined square}}` | hint-text.ts:132-135
- count-met (clueEmpty) | `{This c clue} already has {k lines from the outlined square}, so {these squares} must slant away from it` | hint-text.ts:145-146
- count-met (clueEmpty, both) | `{This c clue} has {one line from its marked pair and one from the outlined square}, so {these squares} must slant away` | hint-text.ts:141-142
- chain/again (continuation) | `…and {these squares} must slant {away | toward it} too, for {the same clue}[ and {the outlined square}]` | hint-text.ts:86-92
- would-break (loop) | `Diagonals in {the outlined square} join two corners of {this square}, so it must slant the other way to avoid a loop` | hint-text.ts:152-153
- would-break (deadend) | `{The outlined square} leave|leaves two corners of {this square} one way out each, so it must slant the other way or seal a loop` | hint-text.ts:158-159
- forced-by-connection (equiv) | `{The outlined mark} link|links {this square} to {the outlined square}, so it must be {a backslash | a forward slash} too` | hint-text.ts:172-173
- forced-by-clash (markClue) | `{The c} needs one line, from just {the ringed pair}, so they must slant the same way` / `{The c} has {k} and needs {one more | one} from {the ringed pair}, so they must slant the same way` | hint-text.ts:188-190
- forced-by-clash (markV) | `{The ringed pair} can't both {touch the 1 above | slant away from the 3 on the left | ...}, or both {...}, so they must slant the same way` | hint-text.ts:198-201; clauses 209-251, vBoth 320-321
- forced (vLine) | `{This 2} and {their pairs} lie between {two 1s | a 1 and a diagonal meeting the end 2 | two diagonals missing it ...}, so {the ringed pair} must slant the same way` | hint-text.ts:279-280
- forced (vAcross) | `{The pair across this 2} {gives it one line and, with {a 1} beyond, no more | gives it at most one line and, with {2s and their pairs} beyond ending in {a 3}, at least one}, so {the ringed pair} must slant the same way` | hint-text.ts:309-313

RULE-CLAUSE:
- `must be touched by all four diagonals` (hint-text.ts:110) and `is touched by no diagonals` (hint-text.ts:132): for a 4 and a 0 the sentence restates the clue's meaning and nothing about this board; the player already has the clue.
- `to avoid a loop` (hint-text.ts:153) and `or seal a loop` (hint-text.ts:159): says the loop rule as the reason.
MAYBE:
- `needs a line from every square around it` (hint-text.ts:111): c is 1..3 with no source; the count is the clue (rule) and the squares are the board.
- `Diagonals in {square} join two corners of {this square}` (hint-text.ts:152): premise for the loop rule; board-specific.
- `slant toward it` / `away from it` (hint-text.ts:86,104,134): the geometry of "touching the clue" as the move; fine.

VOCAB: cell = "square"; clue = "{c} clue" or "the 2", "the 1 above"; slant = "backslash"/"forward slash", "slant toward it", "slant away from it", "touch the corner", "touches", "misses"; ruled out = "can't both ...", "must slant the other way"; pointing = "this {c} clue", "these squares" (ringed), "the outlined square", "the ringed pair", "the same clue", "its marked pair", "its chained pair". Unusual: "line" for a diagonal touching a clue, "v-shape" appears only in comments, "pair across it", "the end 2s", "beyond".

---------------------------------------------------------------------------------------------------

## slide (hint-text.ts; no deductions: plan-based moves)
Templates:
- other:effect (makesRoom) | `Slide {the ringed block} into {the striped space}: that makes room for {the outlined block}.` | hint-text.ts:44,58
- other:effect (makesRoomForKey) | `Slide {the ringed block|key block} into {the striped space}: that makes room for the key block.` | hint-text.ts:66
- other:effect (movesOn) | `Slide {the ringed block} into {the striped space}: it moves on again later.` | hint-text.ts:74
- other:effect (keyBlock) | `Slide {the ringed key block} into {the striped space}: after that it can be out in {1 move | n moves}.` | hint-text.ts:84
- other:effect (keyOut) | `Slide {the ringed key block} into {the striped space}: that brings it onto the exit.` | hint-text.ts:92

RULE-CLAUSE: none.
MAYBE:
- `that brings it onto the exit` (hint-text.ts:92): the goal; a gloss on the effect, board-specific (this is the last slide).

VOCAB: cell = "space" for the squares moved into, "block" for a piece, "key block"; pointing = "the ringed block", "the striped space", "the outlined block"; no ruled-out vocabulary (the file's own comment: "no rule forces a slide"). Unusual: "makes room for", "moves on again later".

---------------------------------------------------------------------------------------------------

## sokoban (hint-text.ts; refusals in hint.ts:177-184)
Templates:
- would-break (trap) | `{This barrel}'s {striped push} would {wedge {it|the outlined barrel} in a corner it can never leave | leave {it} where no push can bring it to a target | jam {it} so it can never move}. One way to avoid that: push it {left}.` | hint-text.ts:86-88, fate 63-67
- search/last-candidate (only) | `No other push of {this barrel} can still finish, so push it {left}.` | hint-text.ts:97-98
- search (onlyThese) | `{This barrel} can still finish only along {the arrows}, so push it {left}.` | hint-text.ts:106-107
- search (alsoThese) | `{This barrel} can still finish along {the arrows}, but not every way` + move | hint-text.ts:115-116
- would-break (fillFirst) | `A barrel on {the outlined target} would wall off {this one}. Fill that one first: push {this barrel} {left}.` | hint-text.ts:128-130
- would-break/effect (clearsWay) | `{This barrel} keeps {the outlined barrel} from reaching a target. Push it {left}: that opens a way.` | hint-text.ts:141-143
- sequence (runFirst) | `A run of pushes puts {this barrel} on a target. First, push it {left}.` | hint-text.ts:150-152
- sequence (runNext) | `Next, push {this barrel} {left}.` | hint-text.ts:157
- sequence (runLast) | `Last, push {this barrel} {left}: that puts it on a target.` | hint-text.ts:162-167
- other:effect (onTarget) | `Push {this barrel} {left}: that puts it on a target.` | hint-text.ts:174
- other:effect (freesYou) | `Barrels box you in. Push {this barrel} {left}: that lets you out.` | hint-text.ts:181-183
- other (plain) | `Push {this barrel} {left}.` | hint-text.ts:189
- refusals | `{It} is wedged in a corner it can never leave. Undo until it is out.` / `No push can bring {it} to a target. Undo until one can.` / `{It} is jammed where it can never move again. Undo until it can.` | hint.ts:177,181,184

RULE-CLAUSE: none firm.
MAYBE:
- `Barrels box you in` (hint-text.ts:181): the player sees the board; it is board-specific, but tells the reader what the interface already shows (the walkable region).
- `that puts it on a target` (hint-text.ts:166,174): says what a push onto a target does, which the board shows; the effect clause may be redundant.
- `can still finish` (hint-text.ts:97,106,115): "finish" is never defined in the sentence; it is a search verdict, not a rule.
- `wedge it in a corner it can never leave` (hint-text.ts:64): the explanatory tail `it can never leave` states what a corner does to a barrel.

VOCAB: cell = n/a (barrel, target); ruled out = n/a, rivals "would wedge / leave / jam", "can't finish", "can never move"; pointing = "this barrel" (ringed), "its striped push", "the outlined barrel", "the outlined target", "the arrows", "this one", "it"; direction words left/up/right/down. Unusual: "finish", "wall off", "box you in", "opens a way", "One way to avoid that" (answers form).
