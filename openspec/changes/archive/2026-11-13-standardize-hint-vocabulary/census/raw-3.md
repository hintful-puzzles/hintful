# Census 3: mathrax mines mosaic net netslide numgame palisade path pattern pearl pegs range

Conventions. Sentences are built as `look` + `follows` + `move` by `so()`/`sentence()` in src/engine/hint-words.ts; the engine joins them (long form "L, so M." ; with `follows` "L, so F: M." ; shorter "follows" form is the `follows` clause). Slots: {x}. Reference words ("this X", "the ringed X", "the outlined X", "the striped X") are `mark.this/the/as` references, rendered by role adjective (ring=ringed, outline=outlined, stripes=striped, strike=struck). SHADED_NAME and UNSHADED_NAME are engine words (piece.ts:30,33: UNSHADED_NAME = "clear"; SHADED_NAME = TWO_NAMES[0].only, not read, so written {shaded}). File:line is hint-text.ts unless stated. A "(follows)" tag marks a clause that is the `follows` slot.

---------------------------------------------------------------------------
## mathrax  (src/games/mathrax/hint-text.ts; the Latin arms are the engine's, src/engine/hint-text.ts, listed below because Mathrax speaks them)

Own templates:
- other:clue-parity (strike) | The {E|O} clue means all four numbers around it are {even|odd} | hint-text.ts:86
- other:clue-with-known-partner (strike) | The {clueLabel} clue means this cell and the {v} across it {add to N | differ by N | are equal | multiply to N | divide to give N | go together} | hint-text.ts:92 (diagonalRule 41-55)
- other:clue-with-open-partner (strike) | Nothing open across the {clueLabel} clue {adds with {list} to make N | is N away from {list} | matches {list} | multiplies with {list} to make N | divides with {list} to give N | goes with {list}} | hint-text.ts:97 (pairClause 62-76)

Engine Latin arms Mathrax delegates to (engine/hint-text.ts, via mathrax/index.ts:387 narrateLatinReason and :382 latinPremise):
- last-candidate | Every other number has been ruled out in this cell, so it can only be {v} | engine/hint-text.ts:~308-311 (single)
- last-candidate | {this cell}'s row and column already hold every other number, so it can only be {v} (regionsFull) | engine/hint-text.ts:~313
- last-place | Every other cell in this {row|column} rules out {v}, so this cell must be {v} | engine/hint-text.ts:~326 (hiddenSingle)
- neighbor-ruled-out | The {v} just placed can't repeat in its row and column (placedRulesOut) | engine/hint-text.ts:~466
- other:set | {cells} already account for {values} between them | engine/hint-text.ts:~408 ; confined-lines: These N rows fit {v} only in the outlined cells, taking the {v} of N columns | ~382 ; wing: Whatever goes in the middle cell, another outlined cell in line with this cell must have {v} | ~398

RULE-CLAUSE:
- "can't repeat in its row and column" (engine/hint-text.ts placedRulesOut ~466, spoken by Mathrax): restates the Latin rule; the player has the rule and the placed number is outlined. Engine-owned, so for the engine census.
- "means all four numbers around it are even/odd" (hint-text.ts:86): the E/O clue's meaning is the game's rule. But it is the premise of the strike, and the glyph 'E'/'O' may not be self-explanatory; see MAYBE.
- "The {clue} clue means this cell and the {v} across it {add to 7}" (hint-text.ts:92): states what the clue means (the rule) before the board-specific part (the {v} partner). Header comment (hint-text.ts:11-16) itself says "'add to 7' is the technique".
MAYBE:
- hint-text.ts:86 parity and :92 / :97 clue meanings: they name the rule of the clue, but the hint's content is which cells/partner the clue constrains; doubt whether "means ..." is the reason this board forces the strike or only teaches what the clue glyph means. The file's own comment argues the glyph "teaches nothing the board did not already show" so the words are kept; the owner's criterion 2 may drop the first half ("The 7+ clue means ...") if the help explains the glyph.

VOCAB:
- cell: "cell" (engine default; Latin arms use `cell`); "numbers around it" for the four cells of a parity clue (86); "square" never used.
- ruled-out value: "ruled out" (Latin arms), "Nothing open across ... X" (97) for a strike; "can only be {v}" / "must be {v}".
- pointing: "this cell" (thisCell), "the {clue} clue" via outline reference, "the {v} across it" (92, a bare value, no pointer word).
- unusual: the clue is named by its glyph label ("7+", "E"); "open" = a value still a candidate ("Nothing open across"); "across it" (diagonal); "is N away from"; "go together" fallback.

---------------------------------------------------------------------------
## mines  (src/games/mines/hint-text.ts; hint.ts only wires)

- other:first-click | no mine is ever laid in the first square you open or beside it, so this square can't hold one: open it to begin (look / follows / move) | hint-text.ts:113-115
- count-met | {the outlined N} has no mine around it, so {the ringed squares | this square} must be safe | hint-text.ts:123 + conclusion 92 (N = 0 arm)
- count-met | {the outlined N} already touches {its mine | both its mines | all N of its mines}, so {the ringed squares | this square} must be safe | hint-text.ts:124 + 92
- count-starved | {the outlined N} still needs {k mine(s)} and has just {k} unopened {square|squares} left, so {each ringed one | this square} must be a mine | hint-text.ts:132 + 93
- count-starved | {the outlined N} has exactly {k} unopened {square|squares} around it, so {each ringed one | this square} must be a mine | hint-text.ts:134 + 93
- chain/forced-step (pair, split) | {heavy} {needs N more | needs N mines | hold(s) exactly N mines}; {light} {allows|allow} at most {L} in {the shared squares}, so ... must be a mine | hint-text.ts:238 (sayPair.split)
- chain/forced-step (pair, after split) | that puts {the outlined N's mine | all L of the outlined N's mines} in {the shared squares}, so ... must be safe | hint-text.ts:245 (splitThen)
- chain (pair, safe only) | {heavy} {needs ...}, which leaves {light's mines} in {shared}, so ... must be safe | hint-text.ts:257 (splitSafeOnly)
- chain (pair, same) | {inner own squares} {all touch {outer} too | are all among the striped squares}, and both need {k mine(s)}, so ... must be safe | hint-text.ts:264 (sayPair.same, within 219/216)
- chain (pair, more) | {outer} {needs ...}, but at most {k} fits in {inner own squares}, so ... must be a mine | hint-text.ts:271 (sayPair.more)
- chain (region prefix, rung 3) | {The outlined N's} unopened squares all touch {the outlined M}, whose {others | striped others} hold exactly {k mine(s)}. [then the pair sentence] | hint-text.ts:292-293 (sayRegion)
- count (global) | all {total} mines are found, so ... must be safe | hint-text.ts:305 (sayCount.allFound)
- count (global) | {k mine(s)} {is|are} left and just {k} unopened {square|squares}, so ... must be a mine | hint-text.ts:311 (allMines)
- count (global) | {k mine(s)} {is|are} left, and {numbers} {needs|need} {it | all k} in {counted}{, which none of them share}, so ... must be safe | hint-text.ts:323 (outsideSafe)
- count (global) | {k mine(s)} {is|are} left, and {numbers} {needs|need} just {n} in {counted}{, which none of them share}, so ... must be a mine | hint-text.ts:336 (outsideMines)
- other:dead-board (not a deduction) | You opened a mine. Undo that move to carry on from just before it. | hint.ts:75
- conclusion forms (all rungs) | {this square | the ringed squares | each ringed one} must be safe / must be a mine | hint-text.ts:92-93

RULE-CLAUSE:
- "no mine is ever laid in the first square you open or beside it" (hint-text.ts:113): the first-click guarantee is a game mechanic, not a fact about this board; the help's rules and the generator describe it. (It is the only reason the hint exists at that step, so it may be the whole content; see MAYBE.)
- "which none of them share" (hint-text.ts:323, 336): states that the counted numbers' squares do not overlap; this is board-specific (what makes the count argument valid), not a rule. Not a RULE-CLAUSE; listed for the record.
MAYBE:
- hint-text.ts:113-115 first-click sentence: the whole sentence teaches the first-click rule; but the hint at an unopened board has nothing else to say. Doubt: could be "Open any square to begin" with no rule.
- hint-text.ts:305 "all {total} mines are found": restates nothing; the total is on the status bar (the interface already shows the mine counter). Doubt: it is the premise.
- hint-text.ts:132/134 "unopened": the help defines "unopened" in the hints blurb (mines.description.yaml:35), so it is a defined term, not a rule restatement.

VOCAB:
- cell: "square" (always; "unopened squares", "the ringed squares", "this square"); never "cell".
- ruled-out: not applicable (safe/mine): "must be safe" / "must be a mine"; one-square form "this square must be safe".
- pointing: "the outlined N" (number), "the upper/lower N" when two share a value (via apartByPosition), "the ringed squares", "each ringed one", "the striped squares", "the striped square('s)", "this square", "its mine"/"both its mines"/"all N of its mines" (parenthesised outlined mines), "the shared squares", "the outlined N's squares beyond the outlined M's".
- unusual: "unopened" (neither opened nor proved); "touches" for adjacency; "still needs ... more"; "allows at most"; "holds exactly"; mine count words "N mine(s)" via minesWord.

---------------------------------------------------------------------------
## mosaic  (src/games/mosaic/hint-text.ts; yaml `says` carries terms only, no text)

- count-met | {the outlined N} allows no shaded squares, so these squares must be clear | hint-text.ts:87+89 (N = 0)
- count-met | {the outlined N} already has its {N} shaded square(s), so these squares must be clear | hint-text.ts:88+89
- count-starved | {the outlined N} needs all {size} of its squares shaded, so these squares must be shaded | hint-text.ts:98+100
- count-starved | {the outlined N} needs {N} shaded square(s), and only {N} of its squares are not clear, so these squares must be shaded | hint-text.ts:99+100
- chain/compare | {the outlined N} needs {by} more shaded square(s) than {the outlined M}, so these squares outside {the M's} block must be shaded | hint-text.ts:111-112 (needsMore)
- chain/compare | {the outlined N} and {the outlined M} both need {k} shaded square(s), and the {N}'s all lie in {the outlined M's} block, so these squares must be clear | hint-text.ts:127-128 (sameNeed, different values)
- chain/compare | Both {N}s need {k} shaded square(s), and the {upper} {N}'s all lie in the {lower} {N}'s block, so these squares must be clear | hint-text.ts:126 (same values)
- (shaded plural: "N shaded square(s)" built by `shadeds`, hint-text.ts:78-79)

RULE-CLAUSE:
- hint-text.ts:6-8 header says "A number's squares are its block ... which the help's Hints section says": the block rule is deliberately NOT restated in sentences. None found in the sentence bodies.
MAYBE:
- hint-text.ts:89, 100, 112, 128 "these squares must be shaded/clear": fine, move. No doubt.
- hint-text.ts:99 "and only N of its squares are not clear": board-specific count; reason, not rule.
- hint-text.ts:127 "all lie in ... block": uses the word "block" (a rule term the help defines); doubt whether "block" needs the help; the header treats it as known.

VOCAB:
- cell: "square" ("these squares", "its squares"); never "cell". (The CELL mark kind is named "cell" internally.)
- two states: "shaded" / "clear" (SHADED_NAME / UNSHADED_NAME), "not clear".
- ruled-out: "must be clear".
- pointing: "the outlined N" (number), "the upper N / the lower N" when same value, "Both Ns", "these squares" (ringed, via mark.this), "the N's block".
- unusual: "block" for the 3x3 neighborhood; "needs N more ... than"; "allows no shaded squares"; apostrophe-s on numbers ("the 7's").

---------------------------------------------------------------------------
## net  (src/games/net/hint-text.ts; hint.ts/explain.ts have no further literal sentences)

Look-clause family (the "look", reused by turn / lock / note), all hint-text.ts:257-272 via `look()` and `trapped()` 201-247, `stranding()` 163-177:
- would-break (no trap) | {this {piece}} must fit {the wall | the outlined notes and locks} | hint-text.ts:265
- would-break (loop/seal) | {lying across | standing upright | pointing X}, {this piece} would close a loop through {the striped square(s)} | hint-text.ts:268, 246, 217
- would-break (several turnings) | pointing {any other way | any way but X | X}, {this piece} would {close a loop through | seal off | close a loop through or seal off} {the striped square(s)} | hint-text.ts:270, 217, 246
- would-break (fit + trap) | every other way {this piece} fits {the wall, the outlined notes and locks} would {close a loop through ...} | hint-text.ts:276, 271 (OTHER_WAYS)
- would-break (dead ends) | ... would face {the striped dead end} | hint-text.ts:235 ; ... would join {the striped dead end(s)}, which {has|have} no other wire, closing {the two | all N} off from the rest | hint-text.ts:238
- would-break (stranded neighbor) | would leave {the outlined {piece} | the other {piece}} {(across the wrapped edge)} no way to fit {it and the wall, the outlined notes and locks} without closing a loop through {the striped square(s)} | hint-text.ts:176
- would-break (stranded, no pieces named) | would {close a loop through ...} {the striped squares}, or leave {the outlined square | one of the outlined squares} no way to turn without closing a loop | hint-text.ts:225 ; would leave {...} no way to turn without closing a loop through {the striped squares} | hint-text.ts:226
Conclusions:
- forced-by-clash | {look}, so only one way fits {fit}: turn it  (turn) | hint-text.ts:283-289 (follows: "only one way fits {fit}" / "only one way fits")
- forced-by-clash | {look}, so it can fit {fit} only {across|upright|as it is}: lock it  (lock) / it must stay {across|upright|as it is}: lock it | hint-text.ts:295-301
- other:lock-after-turn | lock {this piece} (relation "again": basis "no other way fits") | hint-text.ts:305-308
- forced-by-clash | {look}, so {to fit {fit}, }it must point {d}: note a wire across {this side}  | hint-text.ts:337-340
- forced-by-clash | {look}, so {to fit {fit}, }it can never point {d}: note no wire across {this side} | hint-text.ts:352-355

RULE-CLAUSE:
- "which {has|have} no other wire, closing {the two | all N} off from the rest" (hint-text.ts:238): explains why dead ends seal a group (a dead end has one wire), which is a rule of the game (dead ends cannot join each other in a closed group). The hint's own comment (hint-text.ts:232-233) says "two dead ends can never face each other" is in the help. Partly reason (names the group closed off) but "which have no other wire" teaches the rule.
- "which {has} no other wire" also in the header doc of Premises.deadEnds (hint-text.ts:96-98).
MAYBE:
- hint-text.ts:176, 225, 226 "without closing a loop": "no loops" is a rule of Net (help states it); here it is the reason the neighbor cannot turn, so it is board-specific. I judge not a rule restatement.
- hint-text.ts:265 "must fit {fit}": the fit is the walls/notes/locks the tile touches; the fit rule (network must be connected to the neighbor) is the game's, but the outlined notes make it board-specific.
- hint-text.ts:176, 203-205 "(across the wrapped edge)": a mechanic the screen does not show (the Premises doc says "which nothing on screen shows"); keep.
- "pointing any other way" / "lying across" / "standing upright": describes tile orientation, board-specific.

VOCAB:
- cell: "square(s)" in prose ("the striped squares", "the outlined square"); the tile is named by its shape: "dead end", "T", "cross", "straight", "corner" (pieceName, 57-63).
- ruled-out: "can never point {d}"; "no wire across {side}" (a note, not a line).
- pointing: "this {piece}" (ringed), "the outlined {piece}", "the other {piece}", "the striped squares", "the outlined notes and locks", "the outlined lock(s)", "this side"; "it" after.
- unusual: "lock" / "locked", "note a wire across", "turn it", "seal off", "close a loop through", "no way to fit", "dead end", "wrapped edge", "any other way", numbers spelled ("all three").

---------------------------------------------------------------------------
## netslide  (src/games/netslide/hint-text.ts; hint.ts only chooses)

- other:slide-aim | {this loose end|T-piece|cross|straight|corner}: take it on to {the ringed square | the two ringed squares}{, where it belongs}  (next, relation "serves") | hint-text.ts:114
- other:slide-aim | {this piece}: take it to {the ringed square(s)} {(setting up) | , where it belongs}  (working) | hint-text.ts:151
- other:effect | {This row|column} never slides, so only {column|row} moves shift {this piece}: take it to {ringed squares}  [effect: "that sets it up" | "that's where it belongs"] | hint-text.ts:119-122 (rowFixed), 128-131 (colFixed) -- follows clause: "only column moves shift ..." / "only row moves shift ..."
- other:effect | take {this piece} to {ringed squares}: it belongs beside the source  (home leg) | hint-text.ts:141-142
- other:effect | {this piece} belongs beside the source, so take it to {ringed square(s)}: that sets it up  (leg on the way) | hint-text.ts:145-147
- (closing words) "(setting up)" = HINT_SETTING_UP (engine/hint-text.ts:83), "where it belongs", "that's where it belongs", "it belongs {where}", "that sets it up" | hint-text.ts:91-103

RULE-CLAUSE:
- "{This row|column} never slides" (hint-text.ts:119, 128): states that the source's row/column is fixed. The header (hint-text.ts:15-19) calls "the source can never move" a rule shown by the board (no arrows beside it), yet this sentence says the line "never slides". The player already sees no arrows on that line.
- "only column moves shift {this piece}" / "only row moves shift {this piece}" (hint-text.ts:120, 129): explains how the game's moves work (a loose end on a fixed row can only be moved by column slides). This is the owner's flagged example; it is mechanic, not board-forcing reason.
- "belongs beside the source" (hint-text.ts:145, 142): says where the tile belongs; this is the plan's goal, not a rule, but "the source" is a game concept the board labels.
MAYBE:
- hint-text.ts:92 "(setting up)" and "that sets it up": says why the slide exists (staging move). A why-a-move-kind-exists clause per criterion 2; doubt: the player needs to know a staging leg is not the final move.
- hint-text.ts:98-103 ", where it belongs" / "that's where it belongs": states the plan's reason (finished board wants its wires there), board-specific, not rule.

VOCAB:
- cell: "square" ("the ringed square(s)"), "row"/"column" for lines (striped "this row"/"this column", hint-text.ts:87-88); the thing moved is a "tile" in the code but named by shape in prose: "loose end", "T-piece", "cross", "straight", "corner" (hint-text.ts:67-73).
- ruled-out: not applicable (movement game; imperative "take it to").
- pointing: "this {shape}" (ringed tile), "the ringed square", "the two ringed squares", "this row"/"this column" (striped), "it".
- unusual: "the source" (the board's source tile), "slides", "(setting up)", "take it on to", "belongs". Note T-piece here vs T in Net; "loose end" here vs "dead end" in Net.

---------------------------------------------------------------------------
## numgame  (src/games/numgame/hint-text.ts; hint.ts:41 for the dead-board line)

- search/trial | You can finish in {n} more {operation|operations}, starting {ways} ways, so {a} {op} {b} = {c}  (relation: engine's rival judging) | hint-text.ts:73-75 (starts); sum() 45-48
- search/trial | You can finish in {n} more {operation|operations}, and only one first combination does it, so {a} {op} {b} = {c} | hint-text.ts:81-83 (onlyStart)
- last-place | {a} {op} {b} = {c}, the target. (unshaped "bare") | hint-text.ts:87 (last)
- other:dead-board | The numbers left can no longer make {target}. Undo until they can. | hint.ts:41
- (mark legend) ring: "the two numbers to combine, and the operator to combine them with." | hint-text.ts:31

RULE-CLAUSE: none found.
MAYBE:
- hint-text.ts:73 "starting {ways} ways": count of first combinations, board-specific; no doubt.
- hint.ts:41 "Undo until they can." tells the player the interface action (Undo); a mechanic the interface shows. Doubt: it is a recovery instruction, not a rule.

VOCAB:
- cell: no cells; "numbers" and "tile" (internal); "combination", "operation(s)", "operator".
- ruled-out: none.
- pointing: ring on the numbers and operator themselves; "the target" (bare).
- unusual: "You can finish in N more operations" (second person, counts the plan, not a forcing); sums written as "a + b = c" with the larger number first.

---------------------------------------------------------------------------
## palisade  (src/games/palisade/hint-text.ts)

- would-break | Open as each 3's only gap, the edge between these 3s would seal 2 cells where regions hold {k}, so it must be a wall | hint-text.ts:62-63 (cluesVersusRegionSize, c=d=3)
- would-break | this clue would need a shared region of at least {8-c-d} cells, but every region holds {k}, so the edge between them must be a wall | hint-text.ts:71-72
- count-met | Clue {c} allows no walls, so {none of its remaining edges can be walls | this edge can't be one} | hint-text.ts:84-87 (c = 0)
- count-starved | Clue {c} reaches its count only if every ringed edge is a wall, so draw them all | hint-text.ts:93-94 (multi)
- count-starved | Clue {c} needs all its remaining edges to be walls, so the ringed edge must be a wall | hint-text.ts:103-104 (single)
- count-met | Clue {c} already has all its walls, so {its remaining edges can't be walls | this edge can't be one} | hint-text.ts:97-98 (multi), 107-108 (single)
- would-break | Joining these two regions would leave more than the {k} cells a region holds | hint-text.ts:126 ; ... would make {j} cells, but every region holds {k} | hint-text.ts:127; then "this edge must be a wall" | hint-text.ts:128
- neighbor-ruled-out | This region is short of its {k} cells and has {only one region left to grow into | just one way left to grow}, so {these edges can't be walls | this edge can't be a wall} | hint-text.ts:149-153 ; with size: This region has {size} of its {k} cells and ... | hint-text.ts:150
- would-break | A wall can't stop in mid-air at this corner, so this edge must be a wall | hint-text.ts:160-161 (noDanglingEdges)
- forced-by-connection | Both ringed edges border the same region and share a fate; leaving both open leaves clue {c} short, so both must be walls | hint-text.ts:181-186 ; ... walling both would exceed clue {c}, so neither can be a wall | hint-text.ts:188-189
- forced-by-connection (singleton) | This edge borders a region clue {c} can't fully open, so it must be a wall | hint-text.ts:197-198 ; ... clue {c} can't wall off, so it can't be a wall | hint-text.ts:201-202
- neighbor-ruled-out | This region already holds the squares either side of this edge, so it can't be a wall | hint-text.ts:210-211 (inside)
- (basis words for later legs) clue {c}, the same {outlined noun}, the same region | hint-text.ts:217-221

RULE-CLAUSE:
- "A wall can't stop in mid-air at this corner" (hint-text.ts:160): states the no-dangling-walls rule; the corner is outlined but the clause is the rule itself.
- "every region holds {k}" (hint-text.ts:72, 63, 127): restates the region-size rule; though k is board-specific, the player has it in the puzzle's status/params.
- "{k} cells a region holds" (hint-text.ts:126): same.
MAYBE:
- hint-text.ts:181 "share a fate": explains why two edges border the same region (a coupling argument the code comment calls the crux); board-specific reason.
- hint-text.ts:62 "Open as each 3's only gap": hypothetical-based reason; would-break.
- hint-text.ts:94 "draw them all": instruction; fine.

VOCAB:
- cell: "cell(s)" ("{k} cells", "2 cells"), "square(s)" ("the squares either side of"); both appear in one game.
- ruled-out: "can't be a wall", "can't be one", "can't be walls", "none of ... can be walls", "neither can be a wall"; positive "must be a wall".
- pointing: "this edge", "these edges", "the ringed edge", "every ringed edge", "its remaining edges", "Both ringed edges", "Clue {c}" (outlined clue, capitalized) / "clue {c}", "this clue", "these 3s", "these two regions", "this region" (striped), "this corner", "the same region", "a region".
- unusual: "share a fate", "mid-air", "stop", "dangle" (internal), "its remaining edges", "reaches its count", "short of its k cells", "grow into".

---------------------------------------------------------------------------
## path  (src/games/path/hint-text.ts; hint.ts only chooses)

- count-starved | {the outlined {N | square}} has only one edge left for its line, so {this edge must be a line | these edges must be lines} | hint-text.ts:96, 100 (forced, takes = 1)
- count-starved | {the outlined N} has only two edges left for its two lines, so these edges must be lines | hint-text.ts:98
- count-starved | {the outlined N} has only one edge left for its second line, so this edge must be a line | hint-text.ts:99
- would-break | a line on {this edge} would {give {the outlined N} {no|one|two|three|four} lines | leave {the outlined N} a dead end | cut off {the outlined N} | make a loop of the outlined squares | join the outlined A to the B}, so it must be crossed out | hint-text.ts:108-109 (lineBreaks, clashWords 66-81)
- would-break | lines on both outlined edges would {clash}, so {this edge must be a line} | hint-text.ts:116-117 (pairBreaks)
- would-break | lines on any two of the outlined edges would {listed whys}, so {this edge must be a line} | hint-text.ts:133-134 (weighedLine)
- would-break | lines on any other two edges of {the outlined N} would {listed whys}, so {these edges must be lines} | hint-text.ts:143-144 (weighedPair)
- would-break | a line on this edge and any other edge of {the outlined N} would {listed whys}, so it must be crossed out | hint-text.ts:153-154 (weighedCross)
- why list (long / short) | close a loop / give a square too many lines (overfill a square) / cut a square off / leave a square a dead end (leave a dead end) / join numbers that may not meet (join numbers wrongly) / break a rule | hint-text.ts:180-193, 174
- conclusion forms | "this edge must be a line", "these edges must be lines", "must be crossed out" (mustBe, 39-40)

RULE-CLAUSE:
- hint-text.ts:84-86 (doc only): "An edge beside a square that has all its lines is not one of them, which the help says" - the code says this is left to the help; no sentence restates it.
- "give a square too many lines" / "overfill a square" (hint-text.ts:182, 190): states the rule (a square takes one or two lines) as the reason a line would break; it is the reason this edge is excluded, so board-specific enough; MAYBE below.
- "join numbers that may not meet" (hint-text.ts:185): states the rule that some numbers may not be joined; again the reason.
MAYBE:
- hint-text.ts:69 "{N} lines" / 182 "too many lines": rule-flavored reason, but each names what the board would show.
- hint-text.ts:174 "break a rule": generic filler that names no rule; when used, it adds nothing specific (an inexplicit fallback for length).
- hint-text.ts:96 "has only one edge left for its line": "its line" assumes the player knows the square takes one line (the number-on-square rule).

VOCAB:
- cell: "square" (internal CELL kind named "cell"); "the outlined 3" / "the outlined square" (a square is named by its number when it has one).
- ruled-out: "must be crossed out" (mustBe cross); "a line on X would ...".
- pointing: "this edge", "these edges", "the outlined N", "the outlined square", "the outlined squares", "the outlined edges", "both outlined edges", "the outlined A to the B" (two numbers), "it".
- unusual: "dead end", "cut off", "make a loop", "join", "one edge left", "its second line", "crossed out" (vs Net "no wire"), "break the board at once" (comment only).

---------------------------------------------------------------------------
## pattern  (src/games/pattern/hint-text.ts; hint-marks.ts holds mark kinds only)

- count-starved (slack) | {this row|column}'s {run of N} has nowhere to slide{, given the outlined cells}, so these cells must be shaded | hint-text.ts:55, 59
- count-starved (slack) | {this row|column}'s {run of N} can slide only {k} cell(s){, given the outlined cells}, so these cells must be shaded | hint-text.ts:56-59
- neighbor-ruled-out | No run of {this row|column}'s {outlined clue} can reach {the ringed cell(s)}, so {that cell | those cells} must be clear | hint-text.ts:64-65 (unreachable)
- count-met | {This row|column} has no clues, so these cells must be clear | hint-text.ts:70-71 (lineEmpty)
- forced-by-clash (all fits) | Every way {this row|column}'s {outlined runs} can fit {covers | leaves out} {the ringed cell(s)}, so {that cell | those cells} must be {shaded | clear} | hint-text.ts:77-78 (intersection)
- (given-clause) ", given the outlined cells" | hint-text.ts:47

RULE-CLAUSE: none found.
MAYBE:
- hint-text.ts:56 "can slide only {k} cells": uses sliding-block-of-run reasoning; this is the technique (the "overlap" method), not a rule; boards show clue and cells.
- hint-text.ts:77 "Every way ... can fit": a search-flavored reason; board-specific.

VOCAB:
- cell: "cell" (the CELL kind; "these cells", "that cell", "those cells", "the ringed cell"); "row" / "column" for lines ("this row", "this column", striped).
- two states: shaded / clear (SHADED_NAME / UNSHADED_NAME).
- ruled-out: "must be clear" ; "covers" / "leaves out".
- pointing: "this row" / "this column" (striped), "run of N" / "outlined clue" / "outlined runs" (clue reference), "these cells", "the ringed cell(s)", "that cell", "those cells", "the outlined cells".
- unusual: "run of N", "slide", "nowhere to slide", "reach", "fit", "covers" / "leaves out".

---------------------------------------------------------------------------
## pearl  (src/games/pearl/hint-text.ts; hint.ts only picks)

All via `forced()` (hint-text.ts:83-93): "L, so [F: ]M" plus ", and on through the next pearl(s)" when a white pearl is run through (throughNextWhite, 79-80).
- count-met | This square already has its two lines, so {this edge can't be a line | its other edges can't be lines} | hint-text.ts:101-104 (squareFull)
- last-place | The line in this square has no other way to go on, so this edge must be a line | hint-text.ts:110-111 (lineGoesOn)
- would-break | This square has no line and no other open edge, so it can't be a line: a line on this edge would dead-end | hint-text.ts:117-119 (deadEnd)
- forced-by-clash | This black pearl must turn, and the opposite edge is a line, so this edge can't be one | hint-text.ts:134-135 (blackOpposite, line)
- forced-by-clash | This black pearl {backs onto the board's edge | has its opposite edge ruled out}, so this edge must be a line [, and on through the next pearl(s)] | hint-text.ts:141-146 ; with run-on: ... so its line must take {the ringed edges}{, and on through the next pearl(s)} | hint-text.ts:157
- forced-by-connection | This white pearl's line runs straight through it, so it must leave by the opposite edge | hint-text.ts:164-165 (whiteCarriesOn)
- forced-by-clash | This white pearl {sits on the board's edge | has one edge ruled out}, so its line must run {along it | across | up and down} | hint-text.ts:173-174, 178-179 (whiteBlocked)
- forced-by-connection | The outlined black pearl's line runs straight through the next square, so this line must carry on out of its far side | hint-text.ts:187-188 (blackRunsOn)
- forced-by-clash | The outlined square {holds a black pearl, which must turn | has a line off to the side | has its far edge ruled out | is at the board's edge}, so this black pearl's line can't run straight through it | hint-text.ts:59-62, 196-197 (blackCannotRunOn)
- forced-by-clash | Neither outlined square can turn into this white pearl, so it runs {across | up and down} | hint-text.ts:205-206 (whiteCannotTurn)
- forced-by-connection | The white pearl runs straight through the outlined square, so it turns on its other side: {this edge | these edges} {must be a line | can't be a line | must be lines | can't be lines} | hint-text.ts:215-219 (whiteTurnsOpposite)
- would-break | Joining the ends of the outlined line with this edge would close a loop that misses {a pearl | other lines}, so it can't be a line | hint-text.ts:227-228 (closesEarly)
- would-break | Any line through this square would close the outlined line into a loop that misses {a pearl | other lines}, so it must stay empty | hint-text.ts:237-238 (closesEarlyThrough)
- would-break | {Across | Up and down}, this white pearl would close the outlined line into a loop missing {a pearl | other lines}, so it must run {across | up and down} | hint-text.ts:246-247 (closesEarlyWhite)

RULE-CLAUSE:
- "which must turn" (hint-text.ts:59, 134): "This black pearl must turn" restates the black-pearl rule; the file's header (hint-text.ts:15-18) says that rule "sits in the help", yet blackOpposite line and NO_STRAIGHT.blackPearl say it.
- "This square already has its two lines" (hint-text.ts:101): a square holding two lines is the rule's limit; board-specific (it has them), so a reason. Not a rule restatement.
- "The white pearl runs straight through ..., so it turns on its other side" (hint-text.ts:215-219) and "This white pearl's line runs straight through it" (164): the white-pearl rule restated; the second names what the line already does; MAYBE.
- "a line on this edge would dead-end" (hint-text.ts:119): states the dead-end rule (every square is 0 or 2 lines) as the reason.
MAYBE:
- hint-text.ts:164 "runs straight through it, so it must leave by the opposite edge": white-pearl rule as the whole reason.
- hint-text.ts:227 "would close a loop that misses a pearl": the one-loop rule is the reason; board-specific because it names what is left out.
- hint-text.ts:80 "and on through the next pearl(s)": restates the black-pearl run-on rule (the owner requested it, comment hint-text.ts:73-76), so a deliberate kept clause.

VOCAB:
- cell: "square" (always); never "cell".
- ruled-out: "can't be a line", "can't be lines", "ruled out", "must stay empty", "can't run straight through it".
- pointing: "this edge", "its other edges", "the opposite edge", "this square", "the outlined square", "the outlined line", "this black pearl", "this white pearl", "the next pearl(s)", "this line", "the ringed edges".
- unusual: "pearl" (black / white), "dead-end", "turn", "runs", "carry on", "backs onto the board's edge", "far side/edge", "close a loop that misses", "run-on", "up and down" / "across".

---------------------------------------------------------------------------
## pegs  (src/games/pegs/hint-text.ts; hint.ts:159 for one more sentence)

- chain/forced-step (answers) | {this peg's striped jump | the striped jump} would cut off {the outlined peg}: {One way to save it:} jump {this peg} into {the hole} | hint-text.ts:106-109 (trap)
- chain | After {the striped jump}, any next jump cuts off {the outlined peg}: ... | hint-text.ts:115-118 (trapSoon)
- search/trial | No other jump can still finish, so jump this peg into the ringed hole | hint-text.ts:125-127 (only; relation from rival judging)
- search/trial | Only {the jumps with arrows} can still finish, so jump ... | hint-text.ts:134-136 (onlyThese)
- search/trial | {The jumps with arrows} can still finish; some others cannot: jump ... | hint-text.ts:142-144 (alsoThese)
- search/trial | Every jump can still finish with one peg, so jump ... | hint-text.ts:150-152 (anyJump)
- last-place | jump this peg into the ringed hole: that finishes with one peg | hint-text.ts:158-159 (last)
- placement-rule (bare) | Jump this peg into the ringed hole. | hint-text.ts:165 (plain, unshaped bare)
- neighbor-ruled-out | {the outlined peg} is stranded, with no peg beside it: One way to save it: go back for it | hint-text.ts:171-173 (joins)
- chain | {this peg's striped jump | the striped jump} would strand {the outlined peg}: One way to keep a peg beside it: jump ... | hint-text.ts:179-182 (leavesAlone)
- chain/sequence | A run of jumps clears the striped {row|column|block} and changes nothing else: jump this peg into the ringed hole | hint-text.ts:189-191 (packageStart)
- chain/sequence | to clear the striped {row|column|block}: jump ... | hint-text.ts:197 (packageNext), 205 (packageEnd)
- other:dead-board | {The outlined peg(s)} {is|are} cut off, so the game can never finish with one peg. Undo until a peg can still land beside {it|each}. | hint.ts:159
- (mark legend) ring/outline/stripes meanings | hint-text.ts:47-51

RULE-CLAUSE:
- "can still finish" / "finish with one peg" (hint-text.ts:125, 134, 142, 150, 159): restates the goal of the game (end with one peg); the player has the goal. "Every jump can still finish with one peg" says the jump choice does not matter; this is board-specific (a search result), so MAYBE.
- hint.ts:159 "so the game can never finish with one peg" and "Undo until a peg can still land beside it": restates the goal and tells the player the interface action (Undo).
- "One way to save it" / "One way to keep a peg beside it" (hint-text.ts:108, 117, 173, 181): explains why the move exists ("answers" relation), a why-a-move-kind-exists clause; the board shows the danger already.
MAYBE:
- hint-text.ts:125 "No other jump can still finish": the search result is the reason; fine.
- hint-text.ts:189 "A run of jumps clears the striped row and changes nothing else": describes the package technique; board-specific shape, but "changes nothing else" teaches the technique.
- hint-text.ts:171 "stranded, with no peg beside it": defines "stranded" (the legend does too, hint-text.ts:49).

VOCAB:
- cell: no cells; "peg", "hole" ("the ringed hole"), "jump" ("the striped jump"), "row" / "column" / "block" for a package shape.
- ruled-out: "cut off", "stranded", "can still finish" / "cannot".
- pointing: "this peg" (ringed), "the ringed hole", "the outlined peg", "the striped jump", "this peg's striped jump", "the jumps with arrows" / "the jump with an arrow" (outlined), "the striped row|column|block", "it".
- unusual: "stranded", "cut off", "frozen" (comments), "finish with one peg", "package" (internal), "One way to save it", "go back for it".

---------------------------------------------------------------------------
## range  (src/games/range/hint-text.ts)

- neighbor-ruled-out | this cell touches the outlined shaded square, and no two shaded squares may touch, so it must be clear | hint-text.ts:64-65 (adjacency)
- count-met | this {N} already sees {its one clear cell | both of its clear cells | all N of its clear cells}, so the ringed cell just past {it | them} must be shaded | hint-text.ts:75-81 (satisfied)
- would-break | if this cell, just past the outlined cell(s), were clear, this {N} would see more than {N}, so it must be shaded | hint-text.ts:87-88 (overrun)
- count-starved | this {N} needs more than the outlined cell(s), so it must see along the striped run: the ringed cell must be clear | hint-text.ts:99-101 (reach, area non-empty; follows "it must see along {run}")
- count-starved | this {N} can't see N without seeing along the striped run to the ringed cell, so that cell must be clear | hint-text.ts:104-105 (reach, bare)
- would-break | making this cell shaded would cut some of the outlined cell(s) around it off from the rest, so it must stay clear | hint-text.ts:114-115 (connect)

RULE-CLAUSE:
- "and no two shaded squares may touch" (hint-text.ts:64): restates the adjacency rule of Range; the touched shaded square is outlined, so the "touches" fact is the board-specific part and the clause teaches the rule.
- "would cut some of the outlined cells around it off from the rest" (hint-text.ts:114): the connectivity rule is the reason; it names what would be cut off, so board-specific. MAYBE.
MAYBE:
- hint-text.ts:87 "if this cell ... were clear, this N would see more than N": hypothetical; reason, not rule.
- hint-text.ts:104 "can't see N without seeing along the striped run": reason.
- hint-text.ts:64 both clauses: the first clause (touches the outlined shaded square) is the reason; the second restates the rule. Drop candidate: "and no two shaded squares may touch".

VOCAB:
- cell: "cell" ("this cell", "the ringed cell", "its clear cells", "the outlined cell(s)"), but "shaded square" ("the outlined shaded square", "no two shaded squares may touch"): both cell and square appear in one game.
- two states: "shaded" / "clear" (SHADED_NAME / UNSHADED_NAME); "stay clear".
- ruled-out: "must be clear", "must stay clear".
- pointing: "this cell" (ringed), "the ringed cell just past {it|them}", "this {N}" (clue, outlined), "the outlined cell(s)", "the outlined shaded square", "the striped run", "that cell", "it".
- unusual: "sees" (line of sight), "just past", "along the run", "touches", "cut off from the rest".
