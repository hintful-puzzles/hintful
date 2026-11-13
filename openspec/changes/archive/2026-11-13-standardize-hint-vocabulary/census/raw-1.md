# Hint sentence census 1: abcd adjacent ascent blackbox boats bricks bridges clusters crossing cube dominosa fifteen

Conventions. Every sentence is assembled by `so()`/`sentence()` in src/engine/hint-words.ts: `so` gives "{look}, so {move}." ; with `follows`: "{look}: {move}." where the look and follows are joined "{look}, so {follows}" (premiseOf) i.e. "{look}, so {follows}: {move}."; `again` gives "...and {move}, for {basis}."; `effect` gives "{move}: {effect}."; `sequence` gives "First/Next/Last, {move}."; `serves` gives "Working on {aim}: {move}.". Slots written {x}. Line refs are hint-text.ts of the game unless a path is given. "this X"/"the ringed X"/"the outlined X" are mark references (the engine refuses literal "this"/role adjectives in plain text).

---------------------------------------------------------------------
## abcd  (src/games/abcd/hint-text.ts; engine arms in src/engine/hint-text.ts)

TEMPLATES
- placement-rule (setup) | "Start by penciling every candidate letter into each empty cell, so there is something to cross out." | engine/hint-text.ts:113 (via populateText("letter"), abcd:77)
- placement-rule (setup) | "Now clear the easy ones: cross out any letter already beside, above or below the cell." / diag mode: "...cross out any letter already in a cell touching the cell, even at a corner." | 83-89
- other:note-writing (last-candidate precursor) | "No letter stands next to {this cell} yet, so pencil in every one." | 103-104
- other:note-writing | "Only {A, B} isn't|aren't already beside, above or below {this cell}, so pencil it|them in." (diag: "...already touching {this cell}, even at a corner") | 108-109
- last-candidate | "Every other letter has been ruled out in {this cell}, so it can only be {A}." | engine/hint-text.ts:324 via naked, abcd:113
- last-candidate | "Every other letter is already beside, above or below {this cell}, so it can only be {A}." (diag: "...touching {this cell}, even at a corner") | 119-120
- last-place | "Every other cell in {this row|column} rules out {A}, so {this cell} must be {A}." | engine/hint-text.ts:~340 (hiddenSingle arm; abcd uses the generic one)
- neighbor-ruled-out (cull) | "The {A} just placed rules out {A} in every cell beside, above or below it" (diag: "...touching it, even at a corner"); strike words "those {A}s" | 126, 129
- neighbor-ruled-out (engine fallback, same family) | "The {A} just placed can't repeat in its row and column" | engine/hint-text.ts:452 (abcd does not use; its own cull above)
- count-met | "{This row} must hold no {A}, so ..." (clue 0) | 145
- count-met | "{This row} already holds its one {A}, so ..." (clue 1; the placed letter outlined) | 147
- count-met | "{This row} already holds both its {A}s, so ..." (clue 2) | 149
- count-met | "{This row} already holds all {k} of its {A}s, so ..." (clue >2) | 150 ; struck words: "the other {A}s in it" / "the {A} in it" | 154-155
- count-starved / last-place | "{This row} needs one {A} and no other cell in it can take one, so {this cell} must be {A}." ("one more {A}" when some placed) | 172-174
- count-starved / last-place | "{This row} needs {k} {A}s and only {the outlined cells} can take one, so {this cell} must be {A}." | 173-174
- chain/forced-step (runs) | "{This row} needs {k} more {A}s, and {the outlined cells} fit only {k} apart, so each stretch is full: {this cell} must be {A}." | 191-193
- chain/forced-step (follow) | "...and {this cell} must be {A} too, for the same {row|column}." | 200-203
- placement-rule | (diag variants of every sentence above substitute "touching X, even at a corner" for "beside, above or below X") | 50-53

RULE-CLAUSE:
- (none strict.)
MAYBE:
- ", so there is something to cross out" (engine/hint-text.ts:113): says why the "fill all notes" move exists; the player has the move on the board. Doubt: shared with every candidate game, so it is the engine's.
- "beside, above or below the cell" / "touching ..., even at a corner" (abcd:52-53, 83-89, 108, 119, 126): the no-touch rule, said in every sentence that uses it. Doubt: it is also the board-specific place the letters sit; one could say "next to" and drop the rule's geometry.
- "The {A} just placed rules out {A} in every cell beside, above or below it" (126): the cull after a placement restates the placement rule. Doubt: it is the strike's premise and names the placed cell.

VOCAB: cell = "cell"; ruled-out = "ruled out" (last-candidate), "can't repeat", "rules out", "cross out", "must go" (strike words "those As"); pointing = "this cell" (ringed), "this row/column" (striped), "the outlined cells", "its one A" (the clue, drawn). Unusual: "stretch" (run of open cells), "pencil in", "clear the easy ones", "touching ..., even at a corner", counts as "its one"/"both its"/"all {k} of its".

---------------------------------------------------------------------
## adjacent  (src/games/adjacent/hint-text.ts; the generic Latin arms and setup steps are the engine's, spoken in edgeClueVocab: noun "number")

TEMPLATES
- placement-rule (setup) | "Start by penciling every candidate number into each empty cell, so there is something to cross out." | engine/hint-text.ts:113
- placement-rule (setup) | "Now clear the easy ones: cross out any number already standing in its cell's row or column." | engine/hint-text.ts:133 (adjacent/index.ts:167)
- other:note-writing | "Nothing in {this cell}'s row or column rules out a number yet, so pencil in every one." / "Only {1, 2} isn't|aren't already standing in {this cell}'s row or column, so pencil it|them in." | engine/hint-text.ts:158-166
- last-candidate | "Every other number has been ruled out in {this cell}, so it can only be {n}." | engine/hint-text.ts:324
- last-candidate | "{This cell}'s row and column already hold every other number, so it can only be {n}." | engine/hint-text.ts:329
- last-place | "Every other cell in {this row} rules out {n}, so {this cell} must be {n}." | engine/hint-text.ts:~340
- neighbor-ruled-out | "The {n} just placed can't repeat in its row and column" + conclusion | engine/hint-text.ts:452
- would-break (bar) | "{A bar} joins {this cell} to {the 3 beside it}, and they must differ by exactly 1" | hint-text.ts:32
- would-break (no bar) | "{No bar} joins {this cell} to {the 3 beside it}, and they can't differ by 1" | 33
- would-break (bar, neighbor undecided) | "{A bar} joins {this cell} to {its neighbor} with nothing open one away from {2, 4 or 5}" | 40
- would-break (no bar, neighbor undecided) | "{No bar} joins {this cell} to {its neighbor}, whose numbers all clash with {2, 4 and 5}" | 41
- other (set / wing / dup strikes, via latinPremise) | "{The outlined cells} already account for {1 and 2} between them" ; "Whatever goes in {the middle cell}, {another outlined cell} in line with {this cell} must have {n}" ; "These {k} rows fit {n} only in {the outlined cells}, taking the {n} of {k} columns" | engine/hint-text.ts:430, 404, ~383 (reached by index.ts:115)

RULE-CLAUSE:
- (none strict.)
MAYBE:
- "...and they must differ by exactly 1" / "...and they can't differ by 1" (33-34): says what a bar means, which the help gives and the clue glyph shows. Doubt: it is the reason the neighbor's value is ruled out here; dropping it would leave "A bar joins X to the 3 beside it" with the rule implicit.
- "so there is something to cross out" (engine:113): see abcd.

VOCAB: cell = "cell"; ruled-out = "has been ruled out", "can't repeat", "clash with", "nothing open one away from"; pointing = "this cell", "the 3 beside it", "its neighbor", "the middle cell", "another outlined cell". Unusual: "bar" for the clue between cells; "one away from"; "standing in" (placedVerb).

---------------------------------------------------------------------
## ascent  (src/games/ascent/hint-text.ts)

TEMPLATES (all "{look}, so it must be {n}" unless noted; move is always "it must be {n}" except route)
- last-place | "{The ringed square} is the last empty one" | 236
- last-place | "{n} must sit next to {m} [both {a} and {b}], and {the ringed square} is the only empty one that does" | 240
- last-place | "{n} must be on {its column}, and {the ringed square} is its only empty one" | 246
- last-place | "{n} must sit next to {m}, on {its column}. Only {this square} does" | 250
- last-place | "{n} must be next to {m} | within {d} steps of {m} [and {d2} of {m2}], and only {this empty square} is" | 267
- last-place | "{n} must be {where}, on {its column}. Only {this square} is" | 271
- forced-by-connection (dead end) | "Only {the outlined square} leads into {the ringed one}, so the path must end on it: with {k} placed|with the path's last|first number out of reach|with {k}'s arrow pointing elsewhere, it must be {n}" | 293-295 (look, follows, move)
- last-candidate (run fill) | "No other run comes close to {this square}, so it must be {n}" | 133
- last-candidate | "No other run can reach {this square}, so it must be {n}" | 134
- last-candidate | "{the run between 5 and 9} is too far from {this square}, so it must be {n}" | 135
- last-candidate | "{the run ...} can't fill {this square}, which doesn't touch {a or b}, so it must be {n}" | 136
- count-starved | "...and {d} steps from {m} rules out anything lower|higher" / "{d} steps from {m} and {d2} from {m2} rule out the rest" (appended to the above) | 314-316
- last-place | "Only {the run between 5 and 9} can reach {the ringed square} ({its area, striped}), and of its numbers only {n} can" ; short: "...and only its {n} can" | 337-349
- last-place | "Only {the run ...} steps to {the ringed square} by {the striped squares}, and of its numbers only {n} can" | 336
- last-place | "Only {n}, {between 2 and 4}, can reach {the ringed square} (...)" | 340-343
- chain | "{the run ...} must step through {the outlined squares}, so {n} can only go in {the ringed square}" | 363-364
- last-candidate (Edges) | "{n} must be on {its column}, within {a step|d steps} of {m's row} and {d2} steps of {m2}. Only {this square} is, so it must be {n}" | 379
- last-candidate (Edges) | "{n} has no arrow, but must be within {...}. Only {this square} is, so it must be {n}" | 380
- last-candidate (Edges) | "Of the missing numbers, only {n's arrow} points {here}, so it must be {n}" | 402
- last-candidate (Edges) | "No missing number's arrow points {here}, and only {n} has none, so it must be {n}" | 403
- last-candidate (Edges) | "Of the missing numbers, only {7, 3 and 18} point|could go {here}. {7} is too far from {11's row} {3} from {20}, so it must be {n}" | 413-420
- last-candidate (Edges, mid form) | "Of the missing numbers pointing|that could go {here}, {7 is too far from ..., 3 from ...}, so it must be {n}" | 412, 425
- last-candidate (Edges, short form) | "Of the missing numbers, only {...} point {here}, and {the striped lines} and {outlined numbers} rule out all but one, so it must be {n}" | 442
- forced-by-connection (whole run) | "With each number on {its arrow's} line, {the run ...} has only one route, so it must take {the drawn route}" | 468-469
- forced-by-connection | "No other run reaches {the striped squares}, so {the run} must take them, on {the drawn route} {its arrows} allow" / "...must take them all, along {the drawn route}" | 472-484
- forced-by-connection | "Only one route for {the run} lets {the run} through, so it must take {the drawn route}" | 489
- forced-by-connection | "{the run} has only one route through the empty squares, so it must go along {the drawn route}" | 493

RULE-CLAUSE:
- (none strict.)
MAYBE:
- "the path must end on it" (295): states that a square with one way in is the path's end (a dead-end rule, the help's). Doubt: it is the inference from this board's single neighbor; the owner's example kind is "why a move works".
- "{n} must sit next to {m}" / "within {d} steps of {m}" (73, 228, 267): the rule that consecutive numbers are adjacent. Doubt: it is the reason this board forces n here.
- "has only one route through the empty squares" (493): states the run's constraint; board-specific.

VOCAB: cell = "square" (SQUARE kind); ruled-out = "too far from", "can't fill", "rule out the rest", "rules out anything lower"; pointing = "this square", "the ringed square", "the ringed one", "this empty square", "the outlined square(s)", "the striped squares", "here" (parenthesised ring), "its column" (outlined arrow + striped line), "the drawn route". Unusual: "step(s)" as distance, "run" for missing-number stretch, "dead end", "arrow", "its one arrow's".

---------------------------------------------------------------------
## blackbox  (src/games/blackbox/hint-text.ts)

TEMPLATES
- search/trial | "{The two 3s} are one ray's ends, but with a ball on {this square} no ray could join them, so it must be empty." (supposing empty: "with {this square} empty ... so it must hold a ball") | 111-114, 51-60
- search/trial | "{The ray marked H} hit a ball|came straight back, but with {this square} empty|with a ball on {this square} it would stop dead|come straight back|leave the box|come out elsewhere, so it must hold a ball|be empty." | 120-125, 69-74
- other:fire | "{No laser is fired yet|The lasers fired so far settle no other square}, so fire {this laser}: nothing settled yet decides where it goes." | 130-139
- search/trial (layout) | "Every laser is fired, and none settles a square alone, so put a ball on {this square}: then every laser goes where it went." (only) | 150-157
- search/trial (layout, first/next/last) | "Every laser is fired, and {the ringed square|squares} can be set so each goes where it went. First, put a ball on {this square}." ; "Next, put a ball on {this square}." ; "Last, put a ball on {this square}." | 161-170
- count-met / last-place | "Every laser's way is settled, and 1 more ball hides | {n} more balls hide on squares no laser reaches. One of them: put a ball on {this square}." | 178-181
- other:done | "Press {the button} to check your answer: the balls you have send every laser where it went." | 184-188

RULE-CLAUSE:
- "to check your answer" (hint-text.ts:185): says what the button the step points at does; the button is labeled and the help says what it checks.
MAYBE:
- "are one ray's ends" (112) and "The ray marked H hit a ball" (123): explains how rays and their markers pair; the board shows the numbers/H/R. Doubt: names which laser the step reads.
- "stop dead" / "come straight back" / "leave the box" / "come out elsewhere" (59-64): says what a ball does to a laser. Doubt: it is the contradiction that refutes the supposition.
- "then every laser goes where it went" (156) and "the balls you have send every laser where it went" (189): states the puzzle's goal each time. Doubt: it says why the step is the last one.
- "nothing settled yet decides where it goes" (138): why fire a laser at all (why a move kind exists).

VOCAB: cell = "square"; ruled-out = "must be empty", "must hold a ball"; pointing = "this square" (ringed), "the two 3s"/"the ray marked H" (outlined laser ends), "the ringed squares", "this laser", "the button". Unusual: "ray"/"laser" both; "settle(s)" a square; "hides" for balls in unreachable squares.

---------------------------------------------------------------------
## boats  (src/games/boats/hint-text.ts)

TEMPLATES (all "{look}, so {move}." unless a follows is shown; "{, with its water}" is the optional closing clause `follows()` at 119-122)
- placement-rule | "{this given segment} is a whole one-square boat, so {the squares beside it} must be water." | 160-163
- placement-rule | "{this segment} is a boat's top|bottom|left|right end, so nothing can sit above|below|to its left|to its right of it: {that square} must be water." | 165-171
- placement-rule | "{this segment} is a boat's {top} end, so its boat must continue into {the square below it}, with its water." | 175-178
- neighbor-ruled-out | "boats never touch, not even at a corner, so {the ringed squares diagonally beside} {this segment} must be water." | 183-186
- count-met | "{This row}'s number is 0, so {every square in it} must be water." | 197-199
- count-met | "{This row}'s hidden number can only be {k}, and it already has that many boat squares, so {every other square in it} must be water." | 203-204
- count-met | "{This row} already has the {k} boat square(s) its number allows, so {every remaining square in it} must be water." | 208-209
- count-starved | "{This row}'s hidden number can only be {k}, so it needs one more: {its one free square} must hold a boat segment, with its water." | 224-227
- count-starved | "{This row} needs one more boat square and has one free square, so {that square} must hold a boat segment..." | 230-233
- count-starved | "...hidden number can only be {k}, so it needs {n} more: {all n of its free squares} must hold boat segments..." | 238-241
- count-starved | "{This row} needs {n} more boat squares and has {n free squares (ringed)}, so each must hold a boat segment..." | 243-246
- count-starved | "every square of water the puzzle has room for is already marked, so {every free square (ringed)} must hold a boat segment..." | 249-251
- neighbor-ruled-out | "{This segment} has {outlined water above or below|beside it | the board's edge ...}, so its boat must fill {the squares above and below|beside it}..." | 267-270
- last-candidate | "every 1-boat is already placed, and {water} or the board's edge surrounds {this square}, so it must be water." | 276-279
- last-candidate | "every 1-boat is placed and {this segment} is shut in on three sides, so its boat must use {the ringed fourth}..." | 283-286
- count-starved/would-break | "{This row}'s hidden number, {k}, leaves no room for a boat running across|up and down through {this middle segment}, so {the square to its right|below} must be water." / "{This row} has no room for a boat running ... through ..." | 303-307
- would-break | "every boat in the fleet has been found, so {this square}, beside {the segment}, must be water." | 316-319
- would-break | "filling {this square} joins {the segment} into a boat of {j}; the largest still missing is {m}, so it must be water." | 322-326
- forced-by-connection | "every {L}-boat is already placed, so {this unfinished boat} can't stop at {L}: it must continue into {this square}, with its water." | 333-336
- would-break | "filling {this run} would make a boat of {L}, but every {L}-boat is already placed, so {its free square(s)} must be water." | 340-344
- last-place | "only {the outlined run} can hold the {S}-boat, so {the ringed square} is covered wherever it sits, with its water." | 358-361
- last-place | "only {k runs} can hold the {k} remaining {S}-boats: every one is used, so {every ringed square} is covered either way..." | 365-369
- chain/forced-step | "{This row} has {k} water left, so {an outlined square} must be a boat [, which fills its column if central]: {the ringed sides} are water." / "...{the ringed squares between them} must be water." | 383-398
- search/trial | "if {this square} held {its row's last |a }boat segment, {breach}, so it must be water." | 435-440
- search/trial | "if {this square} were {its row's last }water, {breach}, so it must hold a boat segment..." | 441-444
- search/trial | "if the boat through {this middle segment} ran up and down|across, {breach}, so {the square below it|to its right} must be water." | 413-421
- breach clauses | "two boats would end up touching {corner to corner}" ; "{the striped row} couldn't reach its {k}" ; "it would make {one boat} too many" ; "there would be more {boat squares} than the whole fleet has" ; "the rest of the fleet would no longer fit beside {these boats}" ; "{a given segment's own shape} would be contradicted" ; "the rest of the fleet could no longer be placed legally" | 138-155
- other:hidden-number intro | "{This row}'s hidden number can only be {k}. " (prefix when a number was deduced) | 105-110 and in 383

RULE-CLAUSE:
- "boats never touch, not even at a corner" (hint-text.ts:183): states the never-touch rule bare; the header (lines 12-17) itself says why the water is there "is a rule of the game, and rules belong in the help".
MAYBE:
- ", with {its water}" (follows, 119-122, used by 22 sentences): names the water the step already draws and places with it. Doubt: it is the same mechanic the interface shows; owner may want it dropped or standardized.
- "...its number allows" (209): the meaning of a border number. Doubt: it only reads as "has the k boat squares its number allows".
- "{a boat's} top end ... so nothing can sit above it" (167-170): why a segment end forces water behind; teaches boat shape. Doubt: it is the reason this segment forces that square.
- "two boats would end up touching corner to corner" (140): names the rule as the breach. Doubt: it is the contradiction of this trial.
- "the rest of the fleet could no longer be placed legally" (153): generic "legally"; says nothing board-specific. Doubt: it is the only reason available for that breach kind.
- "which fills its column if central" (388): explains boat geometry; Doubt: comment says it is "the case only the words can explain".

VOCAB: cell = "square"; ruled-out = "must be water", "can't stop at", "nothing can sit"; pointing = "this square", "the ringed square", "this segment", "this middle segment", "this row" (striped), "the outlined run", "{that square}", "the ringed fourth", "the ringed sides". Unusual: "boat segment", "1-boat", "fleet", "free square", "hidden number", "covered", "shut in", "is covered wherever it sits/either way".

---------------------------------------------------------------------
## bricks  (src/games/bricks/hint-text.ts)

TEMPLATES (move is "it must stay clear" or "it must be shaded")
- would-break | "Shading {this cell}, next to {the shaded brick}, would make three in a row, so it must stay clear." | 46
- would-break | "Shading {this cell} would leave it with no shaded brick beneath it to rest on, so it must stay clear." | 61
- would-break | "{The cell} below {this cell} is all it could rest on, and it isn't a shaded brick, so it must stay clear." | 63
- would-break | "{The cells} below {this cell} are all it could rest on, and neither is a shaded brick, so it must stay clear." | 64
- count-met | "{The outlined 0} beside {this cell} allows no shaded neighbors at all, so it must stay clear." | 75
- count-met | "Shading {this cell} would give {the outlined 2} beside it more than its 2 shaded neighbors, so it must stay clear." | 76
- would-break (forced shade) | "{The outlined shaded brick above} rests only on {this cell}; clearing it would strand that brick, so it must be shaded." | 82
- count-starved | "{The outlined 3} beside {this cell} can't reach 3 shaded neighbors without it, so it must be shaded." | 89

RULE-CLAUSE:
- (none strict.)
MAYBE:
- "would make three in a row" (46): names the rule. Doubt: the board-specific part is "next to the shaded brick".
- "to rest on" (61, 63-64): gravity rule of bricks. Doubt: it is the premise of the no-support deduction.
- "clearing it would strand that brick" (82): same family.

VOCAB: cell = "cell" (and "brick" for shaded cells; "shaded brick"); ruled-out = "must stay clear"; forced = "must be shaded"; pointing = "this cell", "the outlined N", "the outlined shaded brick above", "the cell(s) below". Unusual: "brick", "rest on", "strand", "stay clear" (clear vs shaded), "neighbors" for clue count.

---------------------------------------------------------------------
## bridges  (src/games/bridges/hint-text.ts)

TEMPLATES
- count-starved | "{This 5} still needs one more bridge and has room for exactly one, so it must be drawn on {the ringed line}." | 100-101
- count-starved | "{This 5} still needs {k} more bridges and has room for exactly {k}, so {the ringed bridges} must all be drawn." | 104-105
- forced-by-connection | "{This 5} has just {one outlined neighbor} left to reach, so {the ringed line} must take at least one bridge." | 120-121
- last-candidate | "{This 5} needs more bridges than {either outlined neighbor} could carry alone, so {each ringed line} must take at least one." | 126-127
- last-candidate | "{This 5} needs more bridges than any {k-1} of {its k neighbors} could carry, so {each ringed line} must take one." | 131-132
- would-break | "{These islands} are linked by {the bridge}, so one more would close a loop: {the ringed line} must be blocked." | 138-140
- count-starved | "{This 5}'s {other neighbors} can take no bridges at all, so every bridge it needs must run along {the ringed line}." | 147-148
- count-starved | "{This 5} can take at most {k} bridge(s) from {its other neighbors}, so one must run along {the ringed line}." | 151-152
- would-break | "{One|Two|Three bridges|A bridge} on {the ringed line} would shut {these k islands} off as a finished group, so the line must be blocked | the line can take at most {one}." | 83, 88-91, 161-162
- would-break | "{A bridge on the ringed line} would leave {this 5 itself | the outlined island} short of its count, so the line must be blocked | can take at most {k}." | 171-173
- would-break | "Filling {this 5}'s other links to the full would seal off {the outlined group}, so {the ringed line} must take a bridge." | 181-182

RULE-CLAUSE:
- (none strict.)
MAYBE:
- "one more would close a loop" (139): the no-loop rule, bare. Doubt: it is the reason this line is blocked.
- "as a finished group" / "seal off ... group" (161, 181): the connectivity rule. Doubt: same.
- "short of its count" (171-172): restates that an island must reach its clue. Doubt: the count is on the board.

VOCAB: cell = n/a (island named by its clue: "this 5"); ruled-out = "must be blocked", "can take at most {k}", "can take no bridges at all"; pointing = "this {clue}", "the ringed line", "each ringed line", "the ringed bridges", "{one|either} outlined neighbor", "the outlined island", "the outlined group", "these {k} islands". Unusual: "line" for a possible bridge span, "neighbor" for an island in line, number words ("none/one/two/three/four").

---------------------------------------------------------------------
## clusters  (src/games/clusters/hint-text.ts)

TEMPLATES
- count-met / count-starved | "{The outlined red tile}'s last red must also touch {the outlined blue dot}, so {this cell} must be red." (countFull; "the other outlined tile" when kinds agree) | 81
- count-met | "{The outlined blue dot} allows at most {one|two|three|four}|no {red} beside {the outlined red tile|the other}, so {this cell} must be {red}." (countShort) | 89
- would-break | "Every neighbor of {this cell} is {red}. As {blue}, it could never touch another {blue} tile, so it must be {red}." | 104
- would-break | "If {this cell} were {blue}, at most one neighbor could ever match it, but it needs to touch two, so it must be {red}." | 113
- neighbor-ruled-out | "{The outlined blue dot} beside {this cell} already touches its one {blue} tile, so {this cell} must be {red}." | 121
- would-break | "Painting {this cell} {blue} would seal {its outlined red neighbor} off from its own color, so {this cell} must be {red}." | 133
- would-break | "If {this cell} were {blue}, {its outlined red neighbor} could never touch two {red} tiles, so {this cell} must be {red}." | 138

RULE-CLAUSE:
- (none strict.)
MAYBE:
- "As {blue}, it could never touch another {blue} tile" (104): the tile-touching rule. Doubt: it is the contradiction.
- "but it needs to touch two" (113): restates the tile rule. Doubt: same.
- "already touches its one {blue} tile" (121): the dot's "exactly one" rule; comment at 118 says "its one carries the rule". Doubt: count-met wording.
- "seal ... off from its own color" (133): connection rule. Doubt: same.

VOCAB: cell = "cell" (pieces are "tile" and "dot"); ruled-out = "must be {red}" (a two-color game, so the ruled-out color is the other); pointing = "this cell", "the outlined {color} {tile|dot}", "its outlined {color} neighbor", "the other outlined tile". Unusual: color names in the sentence ("red", "blue" from the palette); "Painting" for coloring; "last red"; "seal off".

---------------------------------------------------------------------
## crossing  (src/games/crossing/hint-text.ts; the board is squares with a list of numbers to place in runs)

TEMPLATES
- last-candidate | "{This run} is {len} squares long, and only one number in the list is {len} digits, so {the square(s)} must be {num}." | 98
- last-candidate | "Every other {len}-digit number is already on the board, so none can go in {this run}: {the squares} must be {num}." | 104-106
- last-candidate | "Only one {len}-digit number left fits the digits and notes|notes in {this run}, so {the squares} must be {num}." | 112
- last-candidate | "Only one {len}-digit number left matches the digits already in {this run}, so {the squares} must be {num}." | 117
- last-place | "{47} still fits only {this run}: the other run clashes|runs clash with {the square(s)}, so it must go in {the squares}." | 130-131
- last-candidate | "{Every outlined number} still fitting {this across|down run} has a|an {d} in {this square}, so it must be {d}." | 78, 137-138
- chain/forced-step | "{This across run}'s {outlined numbers} give {this square} {2, 5 or 7}; {this down run}'s {outlined ones} only {5}, so it must be {5}." | 153-154
- other:note-writing | "{Every outlined number} still fitting {this run} puts {2, 5 or 7} in {this square}, so note them." | 161-162
- neighbor-ruled-out | "{No outlined number} still fitting {this run} puts a|an {d} | {2 or 5} in {this square}, so {the 5|2 and 5} must go." | 174-175

RULE-CLAUSE:
- (none strict.)
MAYBE:
- "and only one number in the list is {len} digits" (98): the list-fitting reason; Doubt: board-specific, not a rule.

VOCAB: cell = "square"; ruled-out = "must go" (struck note), "clashes with", "none can go in"; pointing = "this square", "this run", "this across run", "the outlined numbers", "the outlined ones", "the other run". Unusual: "run", "the list", "{len}-digit number", "note them", "digits and notes".

---------------------------------------------------------------------
## cube  (src/games/cube/hint-text.ts)

TEMPLATES (a puzzle of moves, not deductions; every sentence is "{move}: {effect}")
- other:goal-roll | "Roll onto {the ringed square}: a plain face picks up the last of the paint." | 49-51
- other:goal-roll | "Roll onto {the ringed square}: a plain face picks up its paint, leaving {k painted squares}." | 52
- other:travel | "Working on {the outlined square}: roll onto {the ringed square}: no paint changes." (aim only when a goal exists) | 62
- other:instead | "Working on {the outlined square}, the roll onto it would land a painted face on it. Instead, roll onto {the ringed square}." | 68-71
- other:forced-drop | "Working on {the outlined square}, paint must go down before any comes up. Roll onto {the ringed square}: it leaves paint." | 80-82
- other:drop | "...roll onto {the ringed square}: it leaves paint | it leaves paint, for another face to pick up | it leaves paint, to pick up again later." | 99-104

RULE-CLAUSE:
- "a plain face picks up its paint, leaving {k painted squares}" and "a plain face picks up the last of the paint" (hint-text.ts:51-52): says how a roll exchanges paint, which the module comment (line 6-7) says "is the help's, so no sentence restates it"; the effect line restates that mechanic each time, and the player watches it on the board.
- "no paint changes" (62), "it leaves paint" (82, 104): same mechanic, as the effect of a roll.
MAYBE:
- "paint must go down before any comes up" (80): the reason this roll is forced. Doubt: it states the exchange rule as the reason.
- "for another face to pick up" / "to pick up again later" (101-103): says what the plan does next. Doubt: board-specific plan information.

VOCAB: cell = "square" (also "face" for the cube's face); ruled-out = n/a; pointing = "the ringed square", "the outlined square" (the goal), "it"; Unusual: "paint", "painted square", "plain face", "roll onto", "Working on {goal}", "Instead".

---------------------------------------------------------------------
## dominosa  (src/games/dominosa/hint-text.ts; the board is squares; a "spot" is two neighboring squares)

TEMPLATES
- last-place | "{The 2-5 domino} has only one spot left where it fits, so it must go on {the ringed spot}." | 68-69
- last-candidate | "{The outlined square} has only one neighbor left to pair with, so the {2-5} domino must go on {the ringed spot}." | 64-65
- forced-by-clash | "{The outlined square} can only be part of the {2-5} domino, so {2-5} can't sit on {the ringed spot} instead." | 97-98
- forced-by-clash | "{Every remaining spot for the outlined domino} overlaps {this pair}, so no other domino can go on it." | 102-103
- would-break | "{A|An} {2-5} domino on {the ringed spot} would force another at {the outlined square}, but each domino is used once, so it can't." | 107-108
- would-break | "A domino on {the ringed spot} would leave {both outlined squares} needing the same domino, a duplicate, so it can't." | 112-113
- would-break | "A domino on {the ringed spot} would split the empty squares into odd-sized regions dominoes can't fill, so it can't." | 117-118
- chain/forced-step | "{The outlined square} can only hold one set of dominoes, which uses the {2-5}, so {2-5} can't sit on {the ringed spot} as well." | 123-124
- chain/forced-step (follow) | "...and {this spot} can't hold a domino either, for the same reason [about {the outlined square}]." | 76-82

RULE-CLAUSE:
- "but each domino is used once" (hint-text.ts:107): states the one-domino-per-pair rule.
MAYBE:
- "a duplicate" (112): same rule named as a word. Doubt: reads as the reason the pair of squares is forbidden.
- "odd-sized regions dominoes can't fill" (117): the parity argument; board-specific region, reason.
- "has only one neighbor left to pair with" (64) / "has only one spot left where it fits" (68): the placement rule; Doubt: count-starved reasons.

VOCAB: cell = "square"; ruled-out = "can't sit on", "can't hold a domino", "it can't", "no other domino can go on it"; pointing = "the ringed spot", "this spot", "this pair", "the outlined square", "both outlined squares", "the outlined domino". Unusual: "spot" for a pair of squares (a possible domino position), "{2-5} domino", "set of dominoes", "duplicate", "barrier" (internal only).

---------------------------------------------------------------------
## fifteen  (src/games/fifteen/hint-text.ts)

TEMPLATES (all "Working on tile {g}: {move}.")
- other:goal-home | "Working on {tile 3}: slide it into place." | 40
- other:goal-closer | "Working on {tile 3}: slide it closer." | 43
- other:goal-reposition | "Working on {tile 3}: slide it back a step, leaving the hole between it and its home." | 48-53
- other:displaced-home | "Working on tile {g}: slide {tile 7} into place." | 56-57
- other:out-of-way | "Working on tile {g}: slide {tile 7} out of the way." | 60-61

RULE-CLAUSE:
- (none strict.)
MAYBE:
- "leaving the hole between it and its home" (51): explains why a step away from home helps; Doubt: it is the reason for this slide (what it does for the goal).

VOCAB: cell = n/a (tile); ruled-out = n/a; pointing = "tile {n}" (ringed, drawn filled), "it", "the hole"; Unusual: "Working on {tile}:" aim, "slide", "hole", "home", "closer", "out of the way". Fifteen has no deduction kinds; every step is a plan move.

---------------------------------------------------------------------
## COUNTS
abcd: 18 templates (incl. 1 engine fallback), 0 RULE-CLAUSE, 3 MAYBE
adjacent: 12 templates (5 engine-delegated setup/Latin, 4 own bar sentences, 1 set/wing/strike group), 0 RULE-CLAUSE, 2 MAYBE
ascent: 28 templates, 0 RULE-CLAUSE, 3 MAYBE
blackbox: 7 templates, 1 RULE-CLAUSE, 4 MAYBE
boats: 27 templates (incl. 7 breach clauses counted as 1), 1 RULE-CLAUSE, 6 MAYBE
bricks: 8 templates, 0 RULE-CLAUSE, 3 MAYBE
bridges: 11 templates, 0 RULE-CLAUSE, 3 MAYBE
clusters: 7 templates, 0 RULE-CLAUSE, 4 MAYBE
crossing: 9 templates, 0 RULE-CLAUSE, 1 MAYBE
cube: 6 templates, 2 RULE-CLAUSE entries (the paint-exchange effect lines), 2 MAYBE
dominosa: 9 templates, 1 RULE-CLAUSE, 3 MAYBE
fifteen: 5 templates, 0 RULE-CLAUSE, 1 MAYBE

Notes. (1) abcd and adjacent speak the engine's candidate-game arms (engine/hint-text.ts:113, 133, 158-166, 324, 329, ~340, 430, 404, 452); they are the engine's text, listed so the census sees them from the game. (2) The shared setup steps ("so there is something to cross out") reach every candidate game. (3) Dominosa's description yaml carries no sentence text (`says` holds only mark roles); Bricks and Clusters likewise take their text from hint-text.ts. (4) Not found in hint.ts/solver.ts/index.ts of these games: no extra phrase`...` sentence templates beyond hint-text.ts.
