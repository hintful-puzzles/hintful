# Census 2: filling flip flood galaxies group guess inertia keen lightup loopy magnets map

Format: `<kind> | <sentence> | <file:line>`. look / "follows" / move parts are joined by the engine's `so` (", so") or `sentence` (relation); the long form is look+move, the shorter "follows" form replaces look when a step is partly followed. Paths relative to src/games/<game>/ unless `engine/`.

---------------------------------------------------------------
## filling (hint-text.ts)

T1 chain/other:region-grows-exact | {Region of N} fits exactly into {this last square|these squares}. | hint-text.ts:44
T2 other:region-cannot-grow | {Region of N} can't fully grow without {this square}. | hint-text.ts:45
T3 other:region-blocked-count | {Region of N} has only {one empty square|these empty squares} to grow into. | hint-text.ts:51
T4 forced-by-clash (lonely) | The region of {each outlined neighbor} can't grow to include {this square}, so it can only be a 1 | hint-text.ts:59,61
T5 forced-by-clash (lonely, no neighbors) | No neighboring region can grow to include {this square}, so it can only be a 1 | hint-text.ts:60,61
T6 would-break (bitmap) | Every other number in {this square} would match {an outlined neighbor} or leave a region short of its size, so it must be {n} | hint-text.ts:69,71
T7 would-break (bitmap, no neighbors) | Every other number in {this square} would touch an equal number or leave a region short of its size, so it must be {n} | hint-text.ts:70,71

RULE-CLAUSE: none found. (T6/T7 "match/touch an equal number" names the merge rule but is the reason this board forces the value.)
MAYBE: T3 "has only ... to grow into" is a count-starved reading, board-specific; no doubt. (none)
VOCAB: cell = "square" (marks CELL); pointing "this square", "the ringed", "an outlined neighbor", "the striped region of N"; ruled-out = "can't grow to include", "would match"; placing = "it must be {n}" / "it can only be a 1". Notes: sentences are "unshaped" (no "so") for T1-T3.

---------------------------------------------------------------
## flip (hint-text.ts; hint.ts has no sentences; flip.description.yaml `hints` is help prose only)

T1 last-place | Row by row, only {this square} can still light {the outlined square(s)}, so it must be pressed. It flips {the striped one|the striped ones} too | hint-text.ts:39-40 (without flips: "...so it must be pressed" :40)
T2 search/trial (count of presses) | There is only one way to light the whole board, and it takes {left} presses; press {this square} (relation oneOf) | hint-text.ts:50,52
T3 search/trial | The whole board can be lit in {left} presses, and no fewer; press {this square} (relation oneOf) | hint-text.ts:51,52
T4 chain/forced-step (last press) | Press {this square}: that lights {the outlined square(s)} and finishes the board / Press {this square}: that finishes the board | hint-text.ts:60,65-66

RULE-CLAUSE: none.
MAYBE: hint-text.ts:39 "Row by row," explains the hint's own sweep order (comment :25-28 says it is stated because "can still" is false without it). It is a method note, not a game rule; doubt: is it reading load the player has? Lean keep: it is the reason this board forces the press.
VOCAB: cell = "square"; "light" for the goal state; pointing "this square", "the outlined square", "the striped one(s)"; no ruled-out words (positive-only game).

---------------------------------------------------------------
## flood (hint-text.ts)

T1 other:move | Fill with {color}. (bare, when it joins nothing) | hint-text.ts:30
T2 other:move+effect | Fill with {color}: it joins {the ringed square(s)} to your region (relation "effect"; text form "fill with {name}" + "it joins ... to your region") | hint-text.ts:32,35

RULE-CLAUSE: none.
MAYBE: none.
VOCAB: cell = "square"; color words from palette COLOR_NAMES; pointing "the ringed square"; "your region" for the flooded area. Search-heuristic fill (claims no proof).

---------------------------------------------------------------
## galaxies (hint-text.ts; sentenceOf)

T1 placement-rule (dotTile) | A galaxy covers the cells its dot sits on, so {the ringed cell|both ringed cells|the N ringed cells} must belong to {the black|white dot} {between them|at their shared corner|they touch} | hint-text.ts:73-74 (where :66-71)
T2 forced-by-clash (separate) | {These two cells} {point at|go with} {different outlined dots}, so they belong to different galaxies; follows form: "they belong to different galaxies, so {the ringed edge} must be a wall" | hint-text.ts:84-86
T3 would-break/mirror (edge) | {The outlined cell} is its own partner across {the outlined black|white dot} | {The outlined cells} are partners across {the outlined dot}; so {this wall} must match {the outlined board edge} | hint-text.ts:103-104,109
T4 would-break/mirror (interior) | (same look as T3), so {the outlined wall} must be mirrored by {this wall} | hint-text.ts:103-104,113
T5 forced-by-connection (enclosed) | {This cell}'s {only way out|ways out} ({outlined}) {leads|all lead} into {the galaxy (striped)}, so {it and its partner} must join {the ringed black|white dot} | hint-text.ts:123-127
T6 last-candidate (soleOwner) | No galaxy around another dot can stretch to {this cell}, so {it and its partner} must belong to {the ringed black|white dot} | hint-text.ts:138-139
T7 last-candidate (onlyReach) | No other galaxy reaches {this cell}, so {it and its partner} must join {the ringed dot} and {its striped reach} | hint-text.ts:147-148
T8 forced-by-connection (exclave) | {The striped cell(s)} can reach {its|their ringed dot} only through {this cell}, so {it and its partner} must be that dot's too | hint-text.ts:153-154

RULE-CLAUSE: "A galaxy covers the cells its dot sits on" | hint-text.ts:73 | restates the definition of a galaxy; the dot is on the board and the help teaches it. (Counter-view: it is the only reason a cell on the dot belongs to it, so it could be MAYBE; I list it because the reason is the rule itself, with no board-specific content beyond the move.)
MAYBE: hint-text.ts:104 "are partners across {dot}" / :103 "is its own partner across" -- names the symmetry rule, but it is the premise (which cells are mirror partners is board-specific). Doubt: "partners" may be a game-vocabulary the player does not see drawn.
MAYBE: hint-text.ts:85 "they belong to different galaxies" (follows form) -- restates what "point at different dots" already says; it is the inference step, so likely fine.
MAYBE: hint-text.ts:154 "that dot's too" -- fine; flagged only because it leans on the previous clause.
VOCAB: cell = "cell" (NOT "square"); ruled-out = "can't stretch to", "can't reach", "No other galaxy reaches", edge decided = "must be a wall"; pointing "this cell", "the ringed cell(s)", "the outlined dot/cell/wall", "the striped"; "partner", "dot" ("black dot"/"white dot"), "galaxy", "reach", "ways out", "its own partner", "board edge". Verbs of belonging: "must belong to", "must join" (both used for the same conclusion: T1/T6 "belong to", T5/T7 "join").

---------------------------------------------------------------
## group (hint-text.ts, plus engine/hint-text.ts generic Latin arms and setup steps, which Group delegates to)

Group-own:
T1 forced-by-clash/chain (associativity) | The grid shows {A·B = ab}, {B·C = bc} and {known = v}. In any group, (A·B)·C = A·(B·C), so {forced} must also be {v} | hint-text.ts:57-58
T2 forced-step (identity fill, first) | The product {A·B = A} shows {B} is the identity | (follows) row {B} and column {B} are just the element labels, so {this cell} must be {value} | hint-text.ts:75-80 (alt with A/B swapped :76)
T3 chain/again (identity fill, later leg) | {This cell} must be {value} (relation "again", basis "the identity {product} shows") | hint-text.ts:89,92
T4 count-met/elimination premise (identity elim) | The product {E·O = p}, not {O} as it would be if {E} were the identity | hint-text.ts:109
T5 strike object | {E}'s identity marks | hint-text.ts:114

Engine generic arms Group uses (engine/hint-text.ts):
T6 last-candidate (single) | Every other {element} has been ruled out in {this cell}, so it can only be {v} | engine/hint-text.ts:324-325
T7 last-candidate (regionsFull) | {This cell}'s row and column already hold every other {element}, so it can only be {v} | engine/hint-text.ts:329-330
T8 last-place (hiddenSingle) | Every other cell in {this row|column} rules out {v}, so {this cell} must be {v} | engine/hint-text.ts:342-343
T9 neighbor-ruled-out (placed dup) | {The v just placed} can't repeat in its row and column (where: "from the other cells") | engine/hint-text.ts:452,421
T10 set/wing premises | {The outlined cells} already account for {v list} between them | engine/hint-text.ts:430 ; {These N lines} fit {v} only in {outlined set}, taking the {v} of N {lines} | engine/hint-text.ts:378-380 ; Whatever goes in {the middle cell}, {it or another outlined cell} {beside} {this cell} must have {v} | engine/hint-text.ts:404
T11 setup | Start by penciling every candidate {element} into each empty cell, so there is something to cross out. | engine/hint-text.ts:113
T12 setup | Now clear the easy ones: cross out {any element already placed in its cell's row or column}. | engine/hint-text.ts:133
T13 pencil-in | Nothing in {here}'s {regions} rules out {a element} yet, so pencil in every one / Only {values} {isn't|aren't} already {placed} in {here}'s {regions}, so pencil {it|them} in | engine/hint-text.ts:159-160,164-165
T14 strike words | {values} must go {where} / must be {v} / can only be {values} | engine/hint-text.ts:253-259
(Group's setup steps come from the row/column preset in index.ts; see T11-T12.)

RULE-CLAUSE: "In any group, (A·B)·C = A·(B·C)" | hint-text.ts:57 | restates the associativity axiom; the player is solving a group table. (See MAYBE: it is the whole reason.)
RULE-CLAUSE: "so there is something to cross out" | engine/hint-text.ts:113 | explains why the populate move exists.
MAYBE: hint-text.ts:57 "In any group, ..." -- if dropped, the step reads "(the three products), so {X} must also be v": probably still deducible from the outlined products; the doubt is whether a puzzle player knows the law applies. This is the clause the owner's criterion 2 most likely targets here.
MAYBE: hint-text.ts:79 "row {B} and column {B} are just the element labels" -- states what an identity row means (a property of identities); the board shows the row, but the inference needs the property.
MAYBE: hint-text.ts:57 "The grid shows" -- an interface pointer ("the grid shows X"), costs words; Group-only opening (other games say "The outlined ...").
MAYBE: engine/hint-text.ts:452 "can't repeat in its row and column" -- the Latin rule as premise of a cull; it is the reason for the strike, but is the rule itself.
VOCAB: cell = "cell" (engine `cell` default); value noun "element" (letters shown); ruled-out = "has been ruled out", "can't repeat", "rules out", "must go" (notes); pointing "this cell", "the outlined", "the ... just placed", "the middle cell"; "product", "identity", "identity marks".

---------------------------------------------------------------
## guess (hint-text.ts, Reason arms; all steps are searches, relation = judged "so")

T1 would-break/forced | {The striped row} scored nothing, so none of its colors can be in the answer; {the framed color(s)} {is|are} out | hint-text.ts:92-93,79-81
T2 forced-by-clash | {The striped row} scored no black pegs, so none of its colors can be where it was guessed; {framed} are out | hint-text.ts:96-97
T3 count-met | Every peg of {the striped row} scored, so the answer can only use its colors; {framed} are out | hint-text.ts:101-102
T4 last-place | {The outlined slot(s)} can only be one color, and no color repeats, so no other slot can hold it; {framed} are out | hint-text.ts:106-107
T5 count-starved | {The striped row}'s 1 black can only be in {the outlined slot}, so that peg is right / {row}'s N blacks can only be in {slots}, so those pegs are right | hint-text.ts:112-117
T6 count-met | {The outlined slot} accounts for {the striped row}'s black peg, so its other pegs are misplaced / {slots} account for {row}'s N blacks, so its other pegs are misplaced | hint-text.ts:122-127
T7 count-met | {The outlined slot(s)} {accounts|account} for {the 1 peg|all N pegs} {the striped row} scored; {framed} are out (no "follows") | hint-text.ts:131-133
T8 search/trial (only answer) | Only one answer fits every score so far, so guess {the framed colors} | hint-text.ts:136-138
T9 search/trial (opening) | Nothing is scored yet; guess {framed}: whatever they score, at most {worst} of the {fitting} answers will be left | hint-text.ts:144-149
T10 search/trial (probe) | {fitting} answers fit every score so far, and {framed} are one; guess them: at most {worst} will be left | hint-text.ts:153-158
T11 search/trial (probeFits) | Only guesses that fit every score so far can win; guess {framed} (relation oneOf) | hint-text.ts:162-164
ruled-out ending ("out") | {the framed colors} are out / {the framed color} is out | hint-text.ts:79-81

RULE-CLAUSE: "no color repeats" | hint-text.ts:106 | restates a game setting (repeats off) that the player chose in the preset; part of why the slots force. (Strong MAYBE rather; listed here only because it is a stated rule.)
RULE-CLAUSE: "Only guesses that fit every score so far can win" | hint-text.ts:162 | restates the logic of winning (a guess inconsistent with the scores cannot be the answer); explains why the move kind (a consistent guess) exists.
MAYBE: hint-text.ts:93 "none of its colors can be in the answer" / :97 "none of its colors can be where it was guessed" / :102 -- rules of Mastermind scoring restated as the inference; they are the reason this row forces an elimination, so likely fine.
MAYBE: hint-text.ts:126 "its other pegs are misplaced" -- scoring rule (non-black pegs are white/miss); reason or rule?
VOCAB: no "cell"/"square": "row" (striped), "slot" (outlined), "color(s)" (framed), "peg(s)", "black(s)"; ruled-out = "is out"/"are out"; pointing "the striped row", "the outlined slot", "the framed color(s)" (framed not ringed, comment :9-13); "guess" as move verb; "scored", "accounts for", "fits".

---------------------------------------------------------------
## inertia (hint-text.ts; refusal sentence in hint.ts:294)

T1 forced-step (collect, no only-move) | Slide {north..}: it sweeps up {a gem|N gems and then} {the circled gem}, and {the stop square at the end catches you|the wall at the end brings you up short} | hint-text.ts:97-98,110,58-60
T2 last-candidate (collect, only move) | {Every other way you can go runs you onto a mine|Walls block every other direction}, so slide {dir}: it sweeps up {the gem} | hint-text.ts:84-85,101-103
T3 last-candidate (forced, nothing collected) | Working toward {the outlined gem}: {Every other way ... mine|Walls block ...}, so slide {dir} (relation from judgeRivals) | hint-text.ts:119-123
T4 would-break (strands) | Sliding {dir} grabs {the gem}, but you can't pick where you stop and it strands {a gem|N gems}; so slide {dir} (answers "One safe way") | hint-text.ts:132-134
T5 search/trial (declined) | Working toward {the gem}: you could grab it now, but the route comes at it from another side; slide {dir} (relation "serves") | hint-text.ts:142-145
T6 chain/forced-step (positioning) | Working toward {the gem}: no slide reaches it yet; slide {dir}: {one more slide sweeps it up|it works the ball round toward it} | hint-text.ts:151-158
T7 other:dead-end | The ball can no longer reach {the outlined gem}. Undo to a position where it can. | hint.ts:294

RULE-CLAUSE: "the stop square at the end catches you" / "the wall at the end brings you up short" | hint-text.ts:59-60 | explains how a slide ends (the game's core stopping mechanic); the player sees where the ball stops and the code comment (:55-56) says "the rule the whole game turns on, so the collecting narration always names it."
RULE-CLAUSE: "but you can't pick where you stop" | hint-text.ts:132 | restates the sliding mechanic; the strand is shown by "it strands N gems".
MAYBE: hint-text.ts:85 "walls block every other direction" / :84 "every other way you can go runs you onto a mine" -- reasons for this board's only move; likely fine, but "walls block" restates wall behavior.
MAYBE: hint-text.ts:143 "the route comes at it from another side" -- about the planner, not the board.
VOCAB: no cell/square; "gem" ("the gem", "a gem", "three gems"), "slide north/north-east/..." by compass direction (the arrow ringed), "ball", "mine", "stop square", "wall"; ruled-out = "runs you onto a mine", "walls block"; pointing "the circled/outlined gem", ring on arrow; number words "a", "two", "three" (own NUMBER_WORDS table :49, "no" at 0).

---------------------------------------------------------------
## keen (hint-text.ts Keen-own; generic Latin arms and setup are engine/hint-text.ts as for group above)

T1 would-break (cage) | No way to make {this cage (striped)} {sum to N|multiply to N|differ by N|have a ratio of N|total N} puts {2, 3 or 4} in {this cell}; (the walk then adds the strike: "... must go") | hint-text.ts:51 (cageGoal :22-31)
T2 count-met/last-place (cageLine) | {This cage} must {goal}, and every way to fill it places {a 1, a 2} in its {row|column} | hint-text.ts:63
T3-T14: generic Latin arms as group T6-T14 with noun "number": single / regionsFull / hiddenSingle / dup / set / wing / populate / cleanObvious / pencil-in / strike words | engine/hint-text.ts:113,133,159-165,253-259,324-343,378-404,430,452

RULE-CLAUSE: "so there is something to cross out" | engine/hint-text.ts:113 | why penciling-in exists (shared with all candidate games).
MAYBE: hint-text.ts:63 "{Cage} must multiply to 72," -- repeats the cage's printed clue; the cage clue is drawn on the board. It is the premise, but could be shortened to the striped cage + "every way to fill it...". Doubt: not a rule restatement, a clue echo.
MAYBE: engine/hint-text.ts:452 "can't repeat in its row and column" -- Latin rule as premise.
VOCAB: cell = "cell"; value noun "number"; ruled-out = "has been ruled out", "puts X in this cell", "must go"; pointing "this cage" (striped), "this cell"; "No way to make ...". Keen shares Latin arms word for word with Group (noun differs).

---------------------------------------------------------------
## lightup (hint-text.ts; sentences from lightup.description.yaml `says` arms)

T1 last-candidate | {Each outlined square} is ruled out or already lit, so nothing else can light {this dark square}; it must hold a bulb (follows) | hint-text.ts:67-69
T2 last-candidate | Every other square that could light {this dark square} is ruled out or already lit, so it must hold a bulb | hint-text.ts:72-73
T3 last-candidate | {The other outlined squares} can't light {the outlined dark square}, so only {this square} can; it must hold a bulb (follows) | hint-text.ts:79-81
T4 last-candidate | Only {this square} can still light {the outlined dark square}, so it must hold a bulb | hint-text.ts:84-85
T5 count-met (0) | {The outlined clue} is 0, so no bulb may sit beside it; {its ringed free neighbor(s)} can't hold a bulb | hint-text.ts:92-94
T6 count-met | {The outlined clue} already has {its bulb|both its bulbs|all N of its bulbs}, so {its other ringed free neighbor(s)} can't hold a bulb | hint-text.ts:98-101
T7 count-starved | {The outlined clue} still needs {1 more bulb|N more bulbs} and has exactly {1 free neighbor|N free neighbors} left, so {the ringed one|each ringed one} must be a bulb | hint-text.ts:110-117
T8 would-break (dark set) | A bulb on {this square} rules out {every outlined square} that can light {the outlined dark square}, so it can't hold a bulb | hint-text.ts:136-137
T9 would-break (clue set) | A bulb on {this square} rules out {every outlined square} left for {the outlined clue}'s bulb, so it can't hold a bulb | hint-text.ts:142-143

RULE-CLAUSE: "no bulb may sit beside it" | hint-text.ts:93 | restates what a 0 clue means; the clue is printed on the board and the help teaches the number rule.
MAYBE: hint-text.ts:67,72,79 "is ruled out or already lit" -- "already lit" is the rule that lit squares need no bulb; reason for this board.
MAYBE: hint-text.ts:136,142 "rules out" -- code comment :131-133 says the help's rules ("lit, or beside a full clue") are what rule-out means; the clause names the rule while the outlines let the player check.
VOCAB: cell = "square"; "dark square" (the lit-me target), "clue" (the number), "bulb", "free neighbor"; ruled-out = "is ruled out", "can't hold a bulb", "can't light"; pointing "this square", "the outlined clue/dark square", "the other outlined squares", "the ringed one", "each ringed one"; forced = "must hold a bulb" (T1-T4) vs "must be a bulb" (T7) -- two phrasings for the same conclusion; "its" vs "its other" for neighbors.

---------------------------------------------------------------
## loopy (hint-text.ts)

T1 count-met (clueFull 0) | {This 0} takes no lines, so {the ringed edge|each ringed edge} can't be a line | hint-text.ts:193-194,150
T2 count-met | {This N} already has {its line|all N of its lines}, so {the ringed edge} can't be a line | hint-text.ts:199-200
T3 count-starved | Only one of {this 1's} edges isn't ruled out, so {the ringed edge} must be a line | hint-text.ts:208-209
T4 count-starved | Only {N} of {this N's} edges aren't ruled out, so {each ringed edge} must be a line{ too} | hint-text.ts:212-213
T5 chain | {This N} can spare one edge and must spare it at {the outlined dot}, which has a line, so {each ringed edge} must be a line | hint-text.ts:222-223
T6 forced-by-clash | {Both outlined dots} already have a line; follows: joining them leaves {this N} short, so {that edge} is out and {the other N} are lines | hint-text.ts:241-254
T7 forced-by-connection (dead end) | {The outlined dot} has no line and no other open edge; follows: a line on {this edge} would dead-end, so it can't be a line | hint-text.ts:259-261
T8 forced-by-connection | The line at {the outlined dot} has no other way to go on, so {this edge} must be a line | hint-text.ts:266-267
T9 count-met | {The outlined dot} already has its two lines, so {the ringed edge} can't be a line | hint-text.ts:272-273
T10 would-break (early loop) | {This edge} would close {the marked lines} into a loop that leaves other lines out, so it can't be a line | hint-text.ts:284-285,281
T11 would-break (early loop) | {This edge} would close {the marked lines} into a loop with {the outlined clue(s)} still unmet, so it can't be a line | hint-text.ts:292-293
T12 count-starved | {This N's} other edges can give it only {N-1}{, counting the marked corner as one}, so {this edge} must be a line | hint-text.ts:300-301,140-141
T13 count-met | {This N} already has {its line|all N}{, counting ...}, so {this edge} can't be a line | hint-text.ts:307-308
T14 corner (note) | {The marked corner} {needs a line|can take one line at most|takes exactly one line}; {one edge there is ruled out|one edge there is already a line|the outlined dot takes both or neither|the outlined dot has no line yet}, so {the ringed edge must be a line|this edge can't be one|both ringed edges must be lines|neither ringed edge can be one|this edge must be its second} | hint-text.ts:314,160-182
T15 pair | {The marked pair} makes {these two edges} match, and {this N can spare one more edge|has room for one more line}, so {both must be lines|neither can be one} | hint-text.ts:326-327,323-324
T16 pair parity (face) | {This N} needs {k} more; {the marked pair} makes two of its open edges give {exactly 1|0 or 2}, so {this edge} {must be a line|can't be a line} | hint-text.ts:341-342
T17 pair parity (dot) | {The outlined dot} has {one line|no line}; {the marked pair} makes two of its open edges give {exactly 1|0 or 2}, so {this edge} {must be a line|can't be a line} | hint-text.ts:354-355
T18 pair relation | {The marked pair} makes {this edge} {the opposite of|match} {the marked line|ruled-out edge}, so it {must be a line|can't be a line} | hint-text.ts:360-361
T19 note placed (corner at dot) | {The outlined dot} already has a line, so {this corner} can take one line at most | hint-text.ts:371-372
T20 note placed | The line at {the outlined dot} can only go on through {this corner}, so it {needs a line|takes exactly one line (mustTake)} | hint-text.ts:375-376,84-85
T21 note placed (from clue) | {This N's} other edges are ruled out / can give it {total} at most{, counting ...}, so {this corner} needs a line | hint-text.ts:390-392
T22 note placed | {This 1} takes one line, so {this corner} can take one at most | hint-text.ts:398-399
T23 note placed | {This N's} other edges already give it {total}{, counting...}, so {this corner} can take one line at most | hint-text.ts:402-403
T24 note placed | {The marked corner} across {the outlined dot} needs a line, so {this corner} can take one line at most | hint-text.ts:409-410
T25 note placed | {The marked corner} takes exactly one of {the outlined dot's} two lines, so {this corner} needs the other | hint-text.ts:415-416
T26 note placed | {The marked pair} makes {this corner's} edges opposites, so it {must take exactly one line|...} | hint-text.ts:421-422
T27 pair placed | Only {these two edges} of {this N} are still open, and it needs {k} more, so they {must be opposites|must match} | hint-text.ts:430-431
T28 pair placed | Only {these two edges} at {the outlined dot} are still open, and it has {one line|no line}, so they {must be opposites|must match} | hint-text.ts:436-437
T29 pair placed | {The marked corner} takes exactly one line, so {these two edges} must be opposites | hint-text.ts:442-443
T30 pair placed | {This N} needs {k} more from four open edges, and {the marked pair} gives {exactly 1|0 or 2}, so {these two edges} {must be opposites|must match} | hint-text.ts:455-456
T31 pair placed | {The outlined dot} has {one line|no line} and four open edges; {the marked pair} gives {...}, so {these two edges} {must be opposites|must match} | hint-text.ts:466-467
T32 pair chain | One of {these edges} matches {the marked edge} {the marked pairs} share and the other its opposite, so they must be opposites | hint-text.ts:476-477
T33 pair chain | {These two edges} are each the opposite of / each match {the marked edge the marked pairs share}, so they must match | hint-text.ts:482-484

RULE-CLAUSE: "{The outlined dot} takes both or neither" | hint-text.ts:165,175 | states the dot rule (0 or 2 lines); the code's own comment (:345-346) says "That a dot takes 0 or 2 lines is the game's rule, taught by the help rather than repeated here" but the corner arms repeat it.
RULE-CLAUSE: "which has a line" / "{dot} already has its two lines" are state reads, NOT rules. (no entry)
MAYBE: hint-text.ts:260 "a line on this edge would dead-end" -- loop rule (a line cannot end); is the reason this board forces the edge.
MAYBE: hint-text.ts:284,292 "would close ... into a loop that leaves other lines out / with ... still unmet" -- the single-loop rule, as the reason.
MAYBE: hint-text.ts:208,212 "isn't ruled out" -- "ruled out" is the game's own state, ok.
MAYBE: hint-text.ts:343,356 "makes two of its open edges give exactly 1 / 0 or 2" -- explains the pair note's meaning (docs say the help teaches it).
VOCAB: no "cell"/"square"; element nouns "edge", "dot", "clue" (shown as "this N", the digit), "corner", "pair", "line", "face" internal only; ruled-out = "can't be a line", "is out" (T6 only), "isn't ruled out", "is ruled out", "can't be one", "neither can be one"; forced = "must be a line", "must be lines", "must be its second"; pointing "this edge/these edges", "the ringed edge", "each ringed edge", "the outlined dot", "the marked corner/pair/line/edge/lines", "this N"; notes: "takes", "needs a line", "can take one line at most", "opposites", "match". Both "outlined" and "marked" used for evidence (outlined = clue/dot, marked = player's notes/lines).

---------------------------------------------------------------
## magnets (hint-text.ts)

T1 would-break (magnetHere) | {This magnet}'s {ringed end} can't be {+}, {beside {another +}|as its {row|column} already has {all its +s}[, counting marked magnets]}, so it must be {-} | hint-text.ts:301-302,142-147
T2 would-break (magnetThere) | {This magnet's other end} can't be {+}, {because}, so {the ringed end} must be {+} | hint-text.ts:314-315
T3 forced-by-clash | Both ends of {this tile} touch {a +}, so it must be neutral | hint-text.ts:327-328
T4 count-met | {This tile} lies along a {row|column} with {all its +s}[, counting marked magnets], so it must be neutral | hint-text.ts:335-336
T5 count-met | Both ends of {this tile} are in {rows|columns} with {all their +s}[, counting marked magnets], so it must be neutral | hint-text.ts:343-344
T6 would-break | No {+} fits in {this tile}: it would {exceed its row's clue at both ends|exceed {...} at one end and {...} at the other|touch {a +} at one end and exceed ... at the other}, so it must be neutral | hint-text.ts:359-364
T7 would-break | One end of {this tile} can't be + or −: {it touches both a + and a −|a + or − would exceed its clues|a + would exceed its clue, and a − its ...|it touches a −, and a + would exceed its clue}, so it must be neutral | hint-text.ts:373-387
T8 count-starved | {This row's clue(s)} {needs|need} a + or − in every one of its empty squares, so {each ringed tile} must be a magnet | hint-text.ts:395-396
T9 count-starved | {This row's clue} {leaves|leave} room for just one more neutral square, so {the ringed tile|each ringed tile} lying along it must be a magnet | hint-text.ts:403-404
T10 count-starved | {This row} needs {one more +|N more +s} and has only {this undecided tile|N undecided tiles}, so it must be a magnet / {each ringed tile} must be a magnet | hint-text.ts:411-416
T11 last-place | {This row} needs {N more +s}{; a + in {an outlined tile} would {touch a +|exceed a clue|make like poles touch|put a − beside a −}}, so {this square must be +|these N squares must be +s} | hint-text.ts:434-435
T12 last-place | {This row} needs {N more +s} and only {this square|these N squares} can take one, so it must be + / they must be +s | hint-text.ts:439-444
T13 count-met | {This row's clue(s)} {leaves|leave} no room for another + or −, so {all its empty squares} must be neutral | hint-text.ts:452-453
T14 last-place (neutral) | {This row} needs {1 more neutral square}; only {the ringed one} isn't in {a marked magnet}, so it must be neutral / needs {N more neutral squares}; only {these N} aren't in {marked magnets}, so they must be neutral | hint-text.ts:466-471
T15 chain (odd gap) | {This row}'s empty squares take alternating poles, {one more + than −}, so {this odd-length gap} must start with {+} | hint-text.ts:478-479
T16 last-place (onlyEndLeft) | {This row} needs {N more +s} from only {this tile}|just N tiles{rest}. [A + at {its far end} would {...}] so {this square must be +|it must go in {the ringed square}} | hint-text.ts:500-510

RULE-CLAUSE: ", counting marked magnets" | hint-text.ts:125 | explains how the count treats marked magnets; comment at :122-123 says "the help says so". Appended to T1,T2,T4,T5 and the because() clause (:146).
RULE-CLAUSE: "make like poles touch" | hint-text.ts:220-225 | restates the like-poles-can't-touch rule in place of a reason; may be MAYBE (it names what the pole would do, which is the reason this square is ruled out).
MAYBE: hint-text.ts:395 "needs a + or − in every one of its empty squares" -- states a count consequence; board-specific, fine.
MAYBE: hint-text.ts:478 "take alternating poles" -- the rule that adjacent squares in a gap alternate (magnet tile rule); is the reason the odd gap forces its start.
MAYBE: hint-text.ts:318-319 (comment, not text) "it can't be a magnet" avoided because it restates "neutral": no sentence issue.
MAYBE: hint-text.ts:403 "room for just one more neutral square" -- count-starved read; fine.
VOCAB: "square" for the board square, "tile" for the domino (not "cell"); "line" never named in text: "this row|column", "its row's clue"; poles as glyphs "+", "−" ("−" is U+2212); "neutral", "magnet", "clue" (digit), "marked magnet"; ruled-out = "can't be +", "fits", "would exceed", "would touch", "is ruled out" (via ring), "no room"; pointing "this square/tile/row/magnet", "the ringed end/one/square/tile", "each ringed tile", "an outlined tile/square", "the outlined tile", "the marked magnet". Forced verb: "must be", "must go in", "must start with".

---------------------------------------------------------------
## map (hint-text.ts)

T1 setup | Start by dotting all four colors into each blank region, so there is something to cross out. | hint-text.ts:108
T2 setup | Now clear the easy ones: remove from each blank region the dot of every color a neighbor already shows. | hint-text.ts:116
T3 last-candidate | {This region} touches {a, b and c}, so it must be {color} | hint-text.ts:125-126
T4 last-candidate | {This region} has a single dot, so it must be {color} | hint-text.ts:133-134
T5 last-candidate | {This region}'s other dots match its neighbors' colors, so it must be {color} | hint-text.ts:140-141
T6 forced-by-clash (pair) | {This region} touches {the outlined pair}, which use both {a and b}, so it {can't be either and must be {color}|can't be either: its {dots} must go|dot {colors}} | hint-text.ts:162-163, conclude :93-100
T7 chain (weigh) | Whatever goes in {the middle region}, {an outlined region|it or an outlined region} {beside|by} {this region} must have {color}, so it {can't be {color} and must be {c}|can't be {color}: its {dots} {dot|dots} must go|can't be {color}: dot {colors}} | hint-text.ts:188-189, conclude :93-100
T8 pencil-in | {This region}'s neighbors show {a, b and c}, so it can only be {x or y}: dot those | hint-text.ts:205-207
T9 pencil-in (trim) | {This region}'s other dots match its neighbors' colors, so it can only be {x or y} | hint-text.ts:214-215
conclusion forms | "its {color} dot(s) must go" ; "dot {colors}" ; "must be {color}" | hint-text.ts:93-100

RULE-CLAUSE: "so there is something to cross out" | hint-text.ts:108 | explains why dotting-all exists (a copy of engine/hint-text.ts:113 with "dotting").
MAYBE: hint-text.ts:162 "which use both {a and b}" -- comment :144-154 states it is a premise stated on purpose (not rule).
MAYBE: hint-text.ts:93 "{cannot} and must be {color}" -- fine.
VOCAB: no cell/square: "region"; colors by name (pink, teal, ...), "neighbor", "dot" (the player's candidate mark); ruled-out = "can't be {color}", "can't be either", "must go"; pointing "this region" (ringed), "the outlined pair", "an outlined region", "the middle region"; "touches", "shows", "match", "dot {colors}" as an instruction. Note "touches" (T3, T6) vs "beside"/"by" (T7) vs "neighbors show" (T8) for adjacency.

---------------------------------------------------------------
## Cross-game observations useful for the proposal (from this slice only)

- Same kind, different words:
  - count-met clue: lightup "{clue} already has its bulb, so ... can't hold a bulb" vs loopy "{this N} already has its line, so {edge} can't be a line" vs magnets "leaves no room for another + or −, so all its empty squares must be neutral" vs guess "{slot} accounts for ... black peg".
  - count-starved: lightup "still needs 1 more bulb and has exactly 1 free neighbor left" vs loopy "Only one of this 1's edges isn't ruled out" vs magnets "needs one more + and has only this undecided tile".
  - last-candidate: lightup "Only {this square} can still light ...", galaxies "No other galaxy reaches {this cell}", engine Latin "Every other number has been ruled out", map "has a single dot".
  - ruled out: "can't hold a bulb" (lightup), "can't be a line"/"is out" (loopy; "is out" once), "can't be +" (magnets), "is out" (guess), "can't be {color}" (map), "can't grow to include" (filling), "must be neutral" (magnets).
  - forced: "must be", "must hold a bulb" (lightup T1-4) vs "must be a bulb" (lightup T7), "must join"/"must belong to" (galaxies), "can only be" (filling, engine Latin, map).
  - cell noun: "square" (filling, flip, flood, lightup, magnets), "cell" (galaxies, group, keen), "region" (map), none (guess, inertia, loopy).
  - opener "Start by penciling/dotting ... so there is something to cross out" exists in engine/hint-text.ts:113 and map hint-text.ts:108: both end with a why-the-move-exists clause.
