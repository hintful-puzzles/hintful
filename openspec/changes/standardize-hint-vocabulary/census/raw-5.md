# Census 5: solo spokes starbattle sticks subsets tents towers tracks twiddle undead unequal unruly untangle

Paths are under src/games/<game>/ unless prefixed engine/. "so" sentences are `look` + (optional `follows`) + `move`; the walk adds "so". Slots in {braces}.

## ENGINE-SHARED Latin sentences (spoken by solo, towers, unequal; also keen/group/salad)
All in src/engine/hint-text.ts. Counted once here, referenced from the games below.

- setup/populate | Start by penciling every candidate {noun} into each empty {cell}, so there is something to cross out. | engine/hint-text.ts:113
- setup/clean-obvious | Now clear the easy ones: cross out any {noun} already {placed} in its {cell}'s {regions}. | engine/hint-text.ts:133
- last-candidate (note step, none ruled out) | Nothing in {here}'s {regions} rules out {a} {noun} yet / pencil in every one | engine/hint-text.ts:159-160
- last-candidate (note step) | Only {values} {isn't|aren't} already {placed} in {here}'s {regions} / pencil {it|them} in | engine/hint-text.ts:164-165
- last-candidate (single) | Every other {noun} has been ruled out in {this cell} / it can only be {v} | engine/hint-text.ts:324-325
- last-candidate (regionsFull) | {here}'s {row and column | regions} already hold every other {noun} / it can only be {v} | engine/hint-text.ts:329-330
- last-place (hiddenSingle) | Every other {cell} in {this row|column} rules out {v} / {this cell} must be {v} | engine/hint-text.ts:342-343
- chain/forced-step (set premise) | {The outlined cells} already account for {values} between them | engine/hint-text.ts:430
- chain (X-wing/lines premise) | These {k} {rows|columns} fit {v} only in {the outlined cells}, taking the {v} of {k} {columns|rows} | engine/hint-text.ts:378-380
- chain (wing premise) | Whatever goes in {the middle cell}, {another outlined cell | it or another outlined cell} {in line with} {this cell} must have {v} | engine/hint-text.ts:404
- neighbor-ruled-out (dup/cull) | {The v just placed} can't repeat in its {row and column} | engine/hint-text.ts:452 (where: "from the other cells", engine/hint-text.ts:420)
- conclusion forms | {values} must go [from ...] / {this cell} must be {v} / {this cell} can only be {a or b} | engine/hint-text.ts:253,256,259
- pointing/continuation | {edges} must be a wall too / can't be a wall either | engine/hint-text.ts:101-102 (edge games; not in this batch)

RULE-CLAUSE: "so there is something to cross out" | engine/hint-text.ts:113 | explains why populating exists (the Fill-all-pencil button and the empty candidate display already show it).
MAYBE: "Now clear the easy ones: cross out any {noun} already {placed} in its {cell}'s {regions}" | engine/hint-text.ts:133 | tells the Latin rule inside a setup instruction; but it is the whole instruction of that step.
MAYBE: "{The v just placed} can't repeat in its {row and column}" | engine/hint-text.ts:452 | pure rule as the reason for a cull; there is nothing board-specific except which value was just placed.

---------------------------------------------------------------------------

## solo  (hint-text.ts, 242 lines; index.ts narrates; Latin arms delegated to ENGINE-SHARED above)
Own templates:
1. last-place/intersect (pointing) | In {this block|row|col|diagonal}, every cell that can still take {n} lies in one {region} / [strike] from the rest of the {region} | hint-text.ts:80,85
2. chain/set | {Other cells} in {this region} already account for {all ns} | hint-text.ts:94
3. count-met-ish/cageSingle (own whole cage, none placed) | {this killer cage} has only {this cell} / it must be its total, {n} | hint-text.ts:111-112
4. cageSingle (cage with placed digits) | {this killer cage} must total {total} and its other cells already make {placed} / {its last cell} must be {n} | hint-text.ts:115-116
5. cageSingle region | {this region} must total {total}; the cages and digits inside it account for all but {n} / {its one open cell} must be {n} | hint-text.ts:123-124
6. cageSingle outside | {This region}'s whole cages and digits leave {insideSum} for {this killer cage's cells in the region} / {its last cell} must be {n} | hint-text.ts:176,129
7. cageMinMax (own cage) | {This killer cage} must total {clue}; its other cells leave no room for {a or b} | hint-text.ts:144
8. cageMinMax (other origin) | {cageSum}, which the others share | hint-text.ts:145
9. cageSums (own cage) | No way to make {this killer cage} total {clue} uses {a or b} in {this cell} | hint-text.ts:158
10. cageSums (other origin) | {cageSum}; no such sum has {a or b} | hint-text.ts:159
11. cageSum clause forms | {This killer cage's open cells} make {clue} / {This region}'s whole cages and digits leave {the outlined cell} {clue} / {outsideRest}, so {clue} for {its other cells} | hint-text.ts:189,191,193
12-16 (delegated, ENGINE-SHARED): populate (:46), cleanObvious (:49), note (:54), conclude (:63), dup/dupWhere (:67,71) -- spoken via SOLO_VOCAB (noun "number", beside "in a line or block with", :39-43).
Count: 11 own templates + 5 delegated Latin arms.

RULE-CLAUSE: "so there is something to cross out" (via populateText) | engine/hint-text.ts:113, used solo hint-text.ts:46 | see shared.
MAYBE: "{this region} must total {total}; the cages and digits inside it account for all but {n}" | hint-text.ts:123 | file's own comment (:118-119) says it "states the region rule in full, the 45 and all"; the total of a block/row is a rule the player has, though the residual is board-specific.
MAYBE: "{this killer cage} must total {origin.total} ..." / "{This killer cage} must total {clue}; ..." | hint-text.ts:115,144 | the cage clue is printed on the board; restating the total is pointing at it, borderline.
MAYBE: dup "can't repeat in its {regions}" | engine/hint-text.ts:452 via hint-text.ts:68 | see shared.
VOCAB: cell = "cell" ("this cell", "its last cell", "its one open cell", "the other cells", "Other cells", "the outlined cell"); ruled-out value = "rules out", "must go", "no room for"; "can only be"; pointing = "this {block|row|column|diagonal|killer cage}" (striped), "this cell" (ringed), "the outlined", "its last cell"/"its one open cell" for the cage's last cell; value noun "number" (digits as board prints: 1-9, a, b...); unusual: "whole cages", "total", "account for", "leave {n} for", "in a line or block with".

---------------------------------------------------------------------------

## spokes  (hint-text.ts; hint.ts holds no sentence text)
1. forced-by-connection | Connecting {the outlined 1-hubs} would strand them from the rest / rule out {this spoke} | hint-text.ts:59-60
2. count-starved (last-place) | {the outlined hub} has only one free spoke left for its count / {spoke} must be a line | hint-text.ts:67-68
3. count-starved (several) | {the outlined hub} has just enough free spokes left for its count / {spokes} must all be lines | hint-text.ts:71-72
4. count-met | {the outlined hub} already has all its lines [follows: none of its other spokes can be one] / rule out {spokes} | hint-text.ts:77-79
5. would-break (draw) | Drawing {this line} would {leave the outlined N too few spokes | strand the outlined hubs} / rule it out | hint-text.ts:119-121 (consequence :111-116)
6. would-break (rule out) | Ruling {spoke} out would [leave {the outlined N} no spare spoke and] {the outlined N too few spokes | strand the outlined hubs} / it must be a line | hint-text.ts:127-128 (short :125)
7. continuation (line) | {spokes} must be {a line|lines} too [again: {the outlined hub}] | hint-text.ts:140
8. continuation (rule out) | rule {spokes} out too [again: {the outlined hub}] | hint-text.ts:141
Count: 8 templates.
RULE-CLAUSE: none.
MAYBE: none strictly; "would strand them from the rest" (:59,:116) names the connectivity rule as consequence of this board's move, so is the reason, not a restatement.
VOCAB: no "cell"/"square"; element = "spoke" ("this spoke", "{spokes}"), "line" for a drawn spoke; ruled out = "rule out" / "rule it out" (move verbs), "can't be one"; the hub = "the outlined hub", "the outlined 7", "the outlined hubs", "the other"; ring = "this line" for the spoke being drawn; unusual: "free spoke", "its count", "spare spoke", "too few spokes".

---------------------------------------------------------------------------

## starbattle  (hint-text.ts; hint.ts holds no sentence text; description yaml supplies terms only)
1. neighbor-ruled-out | No star may touch {the outlined star} / {these squares} must be empty | hint-text.ts:155-156
2. count-met | {this row|column|region} has {its star | its N stars} / {these squares} must be empty | hint-text.ts:162-163
3. count-starved | {this unit} needs {N [more] star(s)} and has only {N} open {square|squares} / {the ringed square | each ringed square} must hold a star | hint-text.ts:174-177
4. last-place | {this unit} needs {N [more] star(s)} and without {this square} has room for {none | only R} / {that square} must hold a star | hint-text.ts:189-190
5. would-break (own unit, exhausted, with cause) | A star on {this square} would complete its {row|column|region [and ...]}, leaving {this unit} {nowhere for N [more] star(s) | no open square} / it must be empty | hint-text.ts:113
6. would-break (exhausted, no cause) own | A star on {this square} would {touch | rule out} the rest of {this unit}, which would still need {N} star(s) / it must be empty | hint-text.ts:119
7. would-break (exhausted, no cause) other | A star on {this square} would {touch | rule out} every open square of {this unit}, leaving it no room for a star / it must be empty | hint-text.ts:120
8. would-break (room short) | A star on {this square} would {complete its ... | touch | rule out} [{the outlined square}], leaving {this unit} room for {R[ more| star], not N} / it must be empty | hint-text.ts:133 (left :127)
9. chain/confinement (1 star, 1 line, 1 region) | {first} must put its [last ]star in {second}, which needs only that one / {squares} must be empty | hint-text.ts:212-213
10. chain/confinement (general) | {first} {needs|need} {N [more] star(s)}, [all ]in {second}, which {needs|need} only {N} / {squares} must be empty | hint-text.ts:216-217
Count: 10 templates.
RULE-CLAUSE: none firm.
MAYBE: "No star may touch {the outlined star}" | hint-text.ts:155 | states the adjacency rule as the whole premise; the board-specific part is only which star it is.
MAYBE: "its star"/"its N stars" in count-met | hint-text.ts:162 | the unit's star quota is the game's parameter, shown in the title/help; but it names the board's count.
VOCAB: cell = "square" ("this square", "that square", "the ringed square(s)", "each ringed square", "the outlined square", "open square(s)"); never "cell"; ruled out = "must be empty" (verb for the move), "rule out" in trials; pointing = "these squares" (ringed), "this row|column|region" striped, "the outlined star|region", "the 2 outlined regions", "these 3 rows"; unusual: "room for", "nowhere for", "need(s)", "put its star in", "complete its row".

---------------------------------------------------------------------------

## sticks  (hint-text.ts; hint.ts has no sentence text)
Each deduction has an opening leg (`opens`: look+move) and a later leg (`continues`: move then "again" basis).
1. would-break/too-long (opening) | {a vertical|horizontal line on this N|square} would run {the V}'s line to {R squares}, too long for it / {this N} must be {horizontal|vertical} | hint-text.ts:99
2. too-long (later) | {move} [again basis:] a {bad} line would run {the V}'s line to {R squares} | hint-text.ts:96
3. unreachable (opening) | {The V} needs more room, and {a bad line on this N} would leave it {M square(s)} / {move} | hint-text.ts:121
4. unreachable (later) | a {bad} line would leave {the V} only {M square(s)} | hint-text.ts:118
5. forced-by-clash/twoClues (opening, 2 numbers) | {a bad line on this N} would join {the V1 and the V2 | two Vs} along {the squares} / {move} | hint-text.ts:142-143,146
6. twoClues (opening, other count) | {a bad line on this N} would put {K numbers} on one line, {squares} / {move} | hint-text.ts:140
7. twoClues (later) | a {bad} line would join {the same numbers} into one line, {the square(s)} | hint-text.ts:134
8. over-connected (opening, 0 block) | {The 0 block} takes no lines, and {a bad line on this N} would run into it / {move} | hint-text.ts:174
9. over-connected (opening) | {The V block} has {its V line(s)}, and {a bad line on this N} would add another / {move} | hint-text.ts:175
10. over-connected (later) | {the V block} already has {its lines}, and a {bad} line would add another | hint-text.ts:169
11. over-connected (later, no lines) | a {bad} line would run into {the V block} | hint-text.ts:170
12. starved (opening, 1) | {The 1 block} has one open side, and {a bad line on this N} would close it / {move} | hint-text.ts:195
13. starved (opening, n) | {The V block} needs {both|V outlined sides}, and {a bad line on this N} shuts one / {move} | hint-text.ts:196
14. starved (later) | a {bad} line would close a side {the V block} needs, like {the one|ones} | hint-text.ts:191
Move for all: {this N | this square} must be {horizontal|vertical} (hint-text.ts:67); "supposed" = "a {horizontal|vertical} line on {this N|this square}" (:66).
Count: 14 templates.
RULE-CLAUSE: none (the file's own comment at :144-145 deliberately omits "one number per line" because the help teaches it).
MAYBE: "{The V} needs more room" | hint-text.ts:121 | vague restatement of the clue's meaning before the specific "would leave it M squares".
MAYBE: "{The V block} takes no lines" / "has its V lines" | hint-text.ts:174-175 | names a clue's meaning (a black number's line count), which the rules cover, though it points at this clue.
VOCAB: cell = "square" ("this square", "{squares}") but a clued square is "this N" (by its number); line is the element ("a vertical line", "one line"); ruled out = by orientation ("must be horizontal|vertical"), "would shut"/"close a side"; pointing = "this 2" (ringed by number), "the V", "the V block" (black clue), "the outlined ...", "the same numbers", "the one|ones"; unusual: "block" for a black clue, "sides", "run into", "too long for it", "needs more room".

---------------------------------------------------------------------------

## subsets  (hint-text.ts + hint-marks.ts; letters A, B, ... are values; sets shown as {A,C})
1. forced-by-clash/arrow (known, lead) | {outlined cell}'s set lies inside {this cell}'s and has {L} marked [follows: {L} must be in both] / mark {L} present | hint-text.ts:102-104
2. arrow (known, later) | mark {L} present in {this cell} too [again: {outlined cell}'s {L} is marked] | hint-text.ts:94,106
3. arrow (mask, lead) | {this cell}'s set lies inside {outlined cell}'s, which has no {L} [follows: {L} can't be in either] / clear {L} | hint-text.ts:111-113
4. arrow (mask, later) | clear {L} in {this cell} too [again: {outlined cell} has no {L}] | hint-text.ts:115
5. last-place (hiddenSingle, lead) | {the outlined set(s)} can go nowhere but {this cell}, and {it contains L | they all contain L | it has no L | none of them has L} / {mark L present | clear L} | hint-text.ts:136,157
6. last-candidate (only-fit, lead) | only {the outlined set(s)} {fits|fit} {this cell}, and {it contains L | they all contain L | it has no L | none of them has L} / {act} | hint-text.ts:137,157
7. collapse lead with example | {attn} ({exclusion}), and {it contains L | all contain L | it has no L | none has L} / {act} | hint-text.ts:148
8. placement later leg | {act} in {this cell} too [again: {sets} all contain L | {sets} contains L | none of {sets} has L | {sets} has no L] | hint-text.ts:94,125-131
9. ruleOut | no {outlined set} is {a bigger set holding {S} | a smaller set inside {S}} / the horseshoe to {outlined cell} rules {S} out of {this cell} | hint-text.ts:178-179
10. exclusion example (placed) | {S}, say, is {already placed} | hint-text.ts:189
11. exclusion example (arrow must) | {S}, say, lacks the {letters} the horseshoe to {outlined cell} needs | hint-text.ts:192
12. exclusion example (arrow forbids) | {S}, say, has the {letters} the horseshoe to {outlined cell} forbids | hint-text.ts:193
13. exclusion example (nest) | {S}, say, can't nest with {the outlined neighbor}, which has no horseshoe to it | hint-text.ts:195
Count: 13 templates.
RULE-CLAUSE: none firm.
MAYBE: "can't nest with {the outlined neighbor}, which has no horseshoe to it" | hint-text.ts:195 | explains the nesting rule while giving an example, but the example is a board-specific competitor.
MAYBE: "the horseshoe to {cell} rules {S} out of {this cell}" | hint-text.ts:179 | comment :161-163 says the help teaches why a smaller/bigger partner is needed; the clause names the mechanism (horseshoe rule), not just this board's reason.
VOCAB: cell = "cell" ("this cell", "the outlined cell", "the outlined neighbor" for the same); sets/values: "set" with letters "A", "{A,C}", "the empty set", "(L) marked", "present"; ruled out = "clear {L}", "{L} can't be in either", "has no {L}", "rules {S} out of"; pointing = "this cell" (striped), "the outlined set(s)", "the outlined cell", ringed letter shown as its letter; unusual: "horseshoe" (the arrow), "lies inside", "say," (example aside), "can go nowhere but", "mark {L} present".

---------------------------------------------------------------------------

## tents  (hint-text.ts; hint.ts has no sentence text)
1. neighbor-ruled-out/no-tree | Every tent sits beside a tree, and no tree is beside {the ringed squares} / {each ringed square} must be grass | hint-text.ts:99-100
2. count-met (trees done) | Every tree beside {the ringed squares} already has {its tent (outlined)} / {each ringed square} must be grass | hint-text.ts:109-110
3. neighbor-ruled-out (next to tent) | Tents never touch, even diagonally / {the ringed squares} around {the outlined tent} must be grass | hint-text.ts:117-118
4. forced-by-clash/treeDiagonal | {This tree}'s tent must go in one of {the two squares}; either touches {the ringed one} / it must be grass | hint-text.ts:123-124
5. last-place (tree single, taken) | {the outlined tent(s)} {belongs to another tree|belong to other trees} / {the tree}'s tent must go in {its only open square}, with {the link} | hint-text.ts:141-142
6. last-place (tree single) | {This tree}'s only open square is {the ringed one} / its tent must go in it, with {the link} | hint-text.ts:145-146
7. forced-by-connection (tentLink) | Every other tree by {the ringed tent} {already has its tent | has (its tent)} [follows: it must belong to {the tree above|below|to its left|to its right}] / draw {the link} | hint-text.ts:165-167
8. treeLink (no taken) | {The ringed tree} has no open square beside it [follows: its tent must be {the one above|below|to its left|to its right}] / draw {the link} | hint-text.ts:185-187
9. treeLink (taken) | {The outlined tent belongs to another tree | The outlined tents belong to other trees} [follows: {the ringed tree}'s tent must be {the one ...}] / draw {the link} | hint-text.ts:191-195
10. count-met | {this row|column}'s {number} is 0 | {this row|column} already has {its N tents} / {its open square(s)} must be grass | hint-text.ts:207-209
11. count-starved | {this row|column} needs {N more tent(s)} and has only {N} open square(s) / {each ringed square} must be a tent | hint-text.ts:216-217
12. would-break/no-spare-room | {this row|column} needs {N more tent(s)}, and its open squares fit only {N} that don't touch / {each ringed square} must be a tent | hint-text.ts:224-225
13. neighbor-ruled-out (between them, later leg) | {the ringed squares} between the tents that {this line}'s {number} needs must be grass [again: tents never touch] | hint-text.ts:232-233
14. forced-by-clash (touchesBeside) | Wherever {this line}'s {1 remaining tent} goes, it touches {the ringed squares} / {each ringed square} must be grass (N>1: "...{N remaining tents} go, one touches {each ringed square}") | hint-text.ts:241-243
Count: 14 templates (templates 7/8/9 each have "follows" forms inline).
RULE-CLAUSE: "Every tent sits beside a tree, and" | hint-text.ts:99 | restates the game's core rule; the file header (:16-18) says that rule "sits in the help", yet the sentence says it; the board-specific part is only "no tree is beside {the ringed squares}".
RULE-CLAUSE: "Tents never touch, even diagonally" | hint-text.ts:117 | the whole look of nextToTent is the adjacency rule; the player already has it, and the sentence adds nothing about this board except what the ring+outline show.
RULE-CLAUSE: "tents never touch" (basis of the later leg) | hint-text.ts:233 | the same rule restated as the reason for the again leg.
MAYBE: "Every tree beside {squares} already has its tent" | hint-text.ts:109 | gives the reason (each tree takes one tent) but "every tree ... its tent" names the one-tent-per-tree rule; the board-specific part is that the trees are done.
MAYBE: "its open squares fit only {need} that don't touch" | hint-text.ts:224 | "that don't touch" is the adjacency rule used as this line's reason; board-specific because of the count.
VOCAB: cell = "square" ("the ringed square(s)", "each ringed square", "open square", "its only open square", "the two squares"); a square's state words "tent", "grass", "open"; ruled out = "must be grass" (move verb; never "empty"); pointing = "the ringed square(s)", "the ringed one", "the ringed tent|tree", "the outlined tent|tents|tree", "this tree", "this row|column", "the one above it / to its left" for a tent's tree, "the link"; unusual: "belongs to" a tree, "link" (legend's word), "spares", "number" for the clue count ("its N tents"), "remaining tent(s)".

---------------------------------------------------------------------------

## towers  (hint-text.ts; Latin arms from ENGINE-SHARED via TOWERS_VOCAB noun "height", value String)
1. last-place/full-line (opening) | {Clue V} sees every tower in {this line} [follows: heights must climb 1, 2, … from the clue] / {this cell} must be {n} | hint-text.ts:68-70
2. full-line (later) | {this cell} must be {n} [again: {the same line} from {clue V}] | hint-text.ts:61-65
3. tallestNearest | {Clue V} sees one tower in {its line} [follows: the tallest must stand next to it] / {this cell} must be {n} | hint-text.ts:75-77
4. facing | {These facing clues} sum to one more than the grid size [follows: {their line}'s tallest is pinned] / {this cell} must be {n} | hint-text.ts:88-90
5. lineFull (strike premise) | {Clue V} already sees {V-1} {tower|towers} in {the line}, so the cell nearest it must top all between; height {n} can't | hint-text.ts:102
6. lowerBound (strike premise) | {Clue V} sees exactly {V} towers along {its line}; height {n} so near it would hide too many | hint-text.ts:107
7. arrangement (strike premise) | No way for {clue V} to show exactly {V} towers along {its line} puts height {n} in {this cell} | hint-text.ts:110
8. dup (cull) | {The n just placed} can't repeat in its row and column; strikes "from the other cells" | hint-text.ts:116,119 (engine/hint-text.ts:452)
9. hiddenSingle | Every other cell in {this row|column} rules out height {n} / {this cell} must be {n} | hint-text.ts:129-130
10. set | {The outlined cells} already account for a fixed set of heights that includes {n} | hint-text.ts:135
+ Delegated Latin arms (ENGINE-SHARED): populate/cleanObvious/note (via `index.ts` notes preset), single, regionsFull, lines, wing, conclude (TOWERS_VOCAB, :141).
Count: 10 own templates (hiddenSingle and dup restate the shared arms in Towers' qualified words) + delegated arms.
RULE-CLAUSE: "heights must climb 1, 2, … from the clue" | hint-text.ts:69 | restates what a clue that sees every tower means (the rule of visibility); the board-specific part is "clue V sees every tower in this line".
RULE-CLAUSE: "the cell nearest it must top all between" | hint-text.ts:102 | explains how a clue's count works (nearest tower is always visible) rather than naming what this board has.
MAYBE: "the tallest must stand next to it" | hint-text.ts:76 | the rule consequence of "sees one tower"; it is the reason, but teaches the rule.
MAYBE: "{The n just placed} can't repeat in its row and column" | hint-text.ts:116 | see ENGINE-SHARED.
MAYBE: "height {n} so near it would hide too many" | hint-text.ts:107 | partly mechanic (taller hides), partly this board's n.
VOCAB: cell = "cell" ("this cell", "the nearest cell", "the outlined cells", "every other cell"); value = "height {n}" or the bare number "{n}"; the game's thing is "tower(s)"; ruled out = "rules out height {n}", "height {n} can't", "must go"; pointing = "this cell" (ringed), "{Clue V}"/"clue V" (outlined slot), "this line"/"its line"/"the line"/"the same line"/"their line" (striped), "these facing clues"; unusual: "sees", "top", "pinned", "hide", "climb".

---------------------------------------------------------------------------

## tracks  (hint-text.ts; hint.ts holds no sentence text, only comments citing docs)
1. neighbor-ruled-out/onlyOneSideLeft (0 open) | {the outlined sides} block every way into {the ringed square} [follows: no track can reach it] / it must be empty | hint-text.ts:110-112
2. onlyOneSideLeft (1 open) | {the outlined sides} leave {the ringed square} one way in, and track needs two / it must be empty | hint-text.ts:115-116
3. bothSidesLeft | The track can't cross {the outlined sides} / it must run through {the ringed one(s)} | hint-text.ts:121-124
4. count-met (clue 0) | {This row|column} has {clue 0} [follows: no track can run along it at all] / {every square in it} must be empty | hint-text.ts:131-133
5. count-met | By {clue N}, {this row|column}'s track {square is|squares are} {the outlined one(s)} / {every other square in it} must be empty | hint-text.ts:137-138
6. count-starved (clue = length) | {Clue N} is the length of {this row|column} / {every square in it} must carry track | hint-text.ts:148-149
7. count-starved | By {clue N}, {this row|column} has {R} empty {square|squares}, {the outlined one(s)} / {every other square in it} must carry track | hint-text.ts:153-154
8. would-break/wouldCloseLoop | {The outlined track} already joins the squares {this side} separates [follows: crossing it would close a loop] / it must be blocked | hint-text.ts:160-162
9. wouldStrandTrack | Crossing {this side|these sides} would finish the track from A to B, stranding {the outlined track} / the side must be blocked | hint-text.ts:167-168
10. wouldFinishEarly | Crossing {this side|these sides} would finish the track from A to B short of {this row|column}'s {outlined clue} / the side must be blocked | hint-text.ts:175-176
11. looseEndSpans | {This row|column} has {2 track squares left}, and none of {the outlined ones} can cross it / the loose end must run {on} | hint-text.ts:183-184
12. sharedFateFills | {the outlined sides} send track in {this square} {upward|downward|to the left|to the right}, but {this row|column}'s {clue V (+squares)} allows one more / it must be empty | hint-text.ts:191-192
13. sharedFateEmpties | Emptying {this square} empties {the outlined one} too, but {this row|column}'s {clue V} spares one more / it must carry track | hint-text.ts:198-199
14. crossingParity | Every entry to {the striped block} needs an exit, and {no crossing is marked yet | it has {N outlined crossing(s)}} / {this last side} must {carry track | be blocked} | hint-text.ts:211-212
Count: 14 templates.
RULE-CLAUSE: "and track needs two" | hint-text.ts:115 | restates that a track square has two sides open; the player has the rule and the outlined sides show how many are left.
MAYBE: "Every entry to the striped block needs an exit" | hint-text.ts:211 | comment (:202-204) calls it the parity argument; it is the reason for this board's move but explains a mechanic (track begins and ends off the board).
MAYBE: "crossing it would close a loop" | hint-text.ts:161 | loop-ban is a rule, but it is this board's reason (the outlined track already joins the squares).
MAYBE: "no track can run along it at all" | hint-text.ts:132 | restates what clue 0 means.
MAYBE: "Crossing {this side} would finish the track from A to B ..." | hint-text.ts:167,175 | "finish the track from A to B" explains the game's goal; reason for this board's block though.
MAYBE: "the loose end must run on" | hint-text.ts:184 | names the loose-end mechanic; check against the loose-end clause elsewhere.
VOCAB: cell = "square" ("the ringed square", "every other square", "this square"); sides = "side"; ruled out of a square = "must be empty", ruled out of a side = "must be blocked"; made = "must carry track", "must run through"; pointing = "the ringed square|one(s)|side", "the outlined sides|track|ones|clue", "this row|column" (striped, never by number), "the striped block", "clue N" for the margin number; unusual: "loose end", "entry/exit", "carry on upward", "track" as mass noun, "spares one more", "allows one more".

---------------------------------------------------------------------------

## twiddle  (hint-text.ts; hint.ts decides the Part, no sentence text)
All sentences are `aim` ("Working on tile N:" from the engine's `sentence({aim})`) + `move` + relation "serves".
1. other:home | {turn the ringed block clockwise|anticlockwise} to put it in place | hint-text.ts:212
2. other:carry | {turn} to carry it toward {its row | its place} | hint-text.ts:220
3. other:lineUp | {turn} to line up {the tuck|cycle|small cycles|twist|swap}[, lifting {the striped tiles}][; it turns back at the end] | hint-text.ts:149
4. lineBack | turn {the ringed block} back {dir} to undo the lining up | hint-text.ts:151
5. tuckLift | {turn} to start a tuck[, lifting ...] | hint-text.ts:153
6. tuckMiddle | {turn}, so turning the first block back brings it in | hint-text.ts:156 ; {turn} before the first block turns back | hint-text.ts:157
7. tuckBack | turn {the first block (ringed)} back {dir} to finish the tuck | hint-text.ts:159
8. cycleFirst | start a cycle: {turn}[, lifting ...] | hint-text.ts:161
9. cycleSecond | {turn}, which overlaps the first block[, lifting ...] | hint-text.ts:163
10. firstBack | turn {the first block (ringed)} back {dir}[: the tiles only it moved go home] | hint-text.ts:167-168
11. swapStart | start a swap: {turn}[, lifting ...] | hint-text.ts:170
12. secondBack | turn {the second block (ringed)} back {dir} to finish the cycle | hint-text.ts:172
13. small cycles | {turn}, {undoing|part of} the {first|second} small cycle[, lifting ...] | hint-text.ts:174
14. twist | {turn}, one way round a twist[, lifting ...] | hint-text.ts:178 ; {turn}, back the other way round the twist | hint-text.ts:177
15. again | {turn} again, a half turn in all[, lifting ...] | hint-text.ts:180
16. plain | {turn} to lift {the striped tiles} out for now | hint-text.ts:184 ; {turn} to carry it on | :185 ; {turn} to put it in place | :187 ; {turn}, a turn of a run found by search | :189 ; bare {turn} | :190
17. effects tail | : {the striped tiles} {returns|return} and it is in place | : {the striped tiles} {return(s)} | : it is in place | hint-text.ts:131-133
Count: 17 groups (about 27 distinct strings with variants).
RULE-CLAUSE: none strict (the header notes the help page names tuck/cycle/twist).
MAYBE: "a turn of a run found by search" | hint-text.ts:189 | describes how the hint found the move, not the board (the doctrine says hint words are about the board, not the hint's own method).
MAYBE: "to start a tuck", "to line up the tuck", "start a cycle", "start a swap", "one way round a twist" | hint-text.ts:149-180 | names a technique the help describes; reading load unless the player knows the names.
VOCAB: cell/square not used for the step; element = "tile N" / "the outlined N" (rows-only), "block" (ringed by its pivot), "the ringed block", "the first/second block (ringed)", "the striped tiles"; no ruled-out value; direction "clockwise|anticlockwise"; unusual: "in place", "home", "lifting", "returns", "carry it toward its place", "lining up", "half turn in all".

---------------------------------------------------------------------------

## undead  (hint-text.ts; sentences compose with NOTE struck marks)
1. setup/populate (own) | Start by penciling every monster into each empty cell, so there is something to cross out. | hint-text.ts:84
2. chain/sightline | {This sightline}'s {a} and {b} leave no room for a {ghost|vampire|zombie|a or b} in {this cell} / {the struck monster(s)} must go | hint-text.ts:102-103
3. sightline later leg | {the struck ghost(s)} in {this cell} must go too [again: {the same sightline}] | hint-text.ts:92-93
4. count-met (total) | No {name}s are left to place [follows: no undecided cell can be one] / {the struck {name}} in {this cell} must go | hint-text.ts:109-111
5. count-starved (onlyCells) | Exactly as many cells can still hold a {name} as there are {name}s left to place / {this cell} can only be a {name} | hint-text.ts:118-119
6. last-candidate (single) | Every other monster is crossed out in {this cell} / it can only be a {name or name} | hint-text.ts:126-127
Count: 6 templates.
RULE-CLAUSE: "so there is something to cross out" | hint-text.ts:84 | explains why populating exists (the same clause as the shared populateText; Undead keeps its own copy).
MAYBE: none. (Comment :96-98 says the game rule of which monster shows where is deliberately not stated.)
VOCAB: cell = "cell" ("this cell", "no undecided cell", "Exactly as many cells"); values = monster names "ghost|vampire|zombie" lowercase; ruled out = "must go" (struck notes: "the struck ghost(s)"), "crossed out"; pointing = "this cell" (ringed), "this sightline" / "the same sightline" (outlined), "the struck {ghosts}"; unusual: "sightline", "leave no room for", "undecided".

---------------------------------------------------------------------------

## unequal  (hint-text.ts 38 lines; Latin arms ENGINE-SHARED in edgeClueVocab, engine/edge-clue-latin/hint-text.ts; setup via row/column preset)
1. neighbor-ruled-out/greater (bound<=1) | The larger side of {this greater-than sign} can't hold the smallest number | hint-text.ts:29
2. greater | {The outlined smaller side} of {this greater-than sign} is at least {bound} | hint-text.ts:30
3. lesser (bound>=order) | The smaller side of {this greater-than sign} can't hold the largest number | hint-text.ts:36
4. lesser | {The outlined larger side} of {this greater-than sign} is at most {bound} | hint-text.ts:37
(Premises: the walk concludes with "{value} must go" / "must be" from ENGINE-SHARED conclude.)
Delegated: populate, cleanObvious, note, single, regionsFull, hiddenSingle, set, lines, wing, dup (via edgeClueVocab, engine/edge-clue-latin/hint-text.ts:16).
Count: 4 own templates + delegated arms.
RULE-CLAUSE: none.
MAYBE: none. ("The larger side ... can't hold the smallest number" is the board-specific reason an inequality bites.)
VOCAB: cell = "cell" (engine default) but own arms say "side" ("larger side", "smaller side", "the outlined smaller side"); sign = "greater-than sign" (also for a less-than, "this greater-than sign"); value = "number" ("the smallest number", "the largest number"); ruled out = "can't hold", "must go"; pointing = "this greater-than sign", "the outlined ... side"; unusual: "is at least / at most {bound}".

---------------------------------------------------------------------------

## unruly  (hint-text.ts; description yaml supplies terms; colors are palette words via colorName)
1. neighbor-ruled-out/threes | {the outlined cells} are already {color} [follows: {this cell} would make three in a row] / it must be {other color} | hint-text.ts:50-52
2. last-place/lastGap and count-met/quota (same `complete`) | {this row|column} has {all its {color} cells (outlined)} / {this cell} and the {row|column}'s other empty cells must be {other color} | hint-text.ts:40-41
3. forced-by-clash/unique | {this row|column}'s {color}s all sit where {the outlined row|column}'s do [follows: a {color} in {this cell} would copy it] / it must be {color} | hint-text.ts:60-62
4. last-place/lastOne | The last {color} in {this row|column} fits only in {an outlined cell} without making three {color}s / {this cell} must be {color} | hint-text.ts:67-68
Count: 4 templates (lastGap and quota share one).
RULE-CLAUSE: none firm.
MAYBE: "{this cell} would make three in a row" | hint-text.ts:51 | names the no-three rule, but as this board's reason.
MAYBE: "a {color} in {this cell} would copy it" | hint-text.ts:61 | names the unique-rows rule; board-specific because it names the copied row.
MAYBE: "without making three {color}s" | hint-text.ts:67 | rule used as the reason the last piece has only one fit.
VOCAB: cell = "cell" ("this cell", "the outlined cells", "an outlined cell", "empty cells"); colors are the two piece color words from the palette (TWO_NAMES, "black"/"white" or the theme's pair; "{color}s" for pieces); ruled out = by the other color ("must be {opposite}"); pointing = "this cell" (ringed), "this row|column" (striped), "the outlined row|column", "the outlined cells", "all its {color} cells"; unusual: "three in a row", "would copy it", "fits only in".

---------------------------------------------------------------------------

## untangle  (hint-text.ts; hint.ts 859 lines holds measuring code, not sentences)
There is no forced move; every sentence is a move + effect on the point's crossings.
1. other:clear | move {this point} to {a better spot}, because it {cuts its crossings from B to A[, clearing the outlined ones] | clears {its only crossing | both of its crossings | all B of its crossings}} | hint-text.ts:108,121-122
2. other:rearrange (nothing better) | No move removes a crossing / move {this point} to {a new spot}, because it {keeps its crossings at B | keeps its lines clear | goes from B crossings to A}[, clearing the outlined ones] | hint-text.ts:149-150,139-143
3. rearrange (payoff) | move {this point} to {a new spot}, because it {...}, but frees a move removing {N} | hint-text.ts:157
4. journey first leg | Moving {these N points} {solves the puzzle | clears their lines} / {this point} goes to {a better|new spot} | hint-text.ts:191-192
5. journey middle leg | {this point} goes to {spot}, before {the other one | the other N} [relation sequence "next"; effect: change()] | hint-text.ts:202
6. journey last leg | {this point} goes to {spot} [relation sequence "last"] | hint-text.ts:198
7. change() effect clauses | its lines stay clear | it clears {all of its crossings} | it clears {the outlined one|N}, leaving {after} | it cuts its crossings from B to A | it keeps its crossings at B | it goes from B crossings to A | hint-text.ts:89,90,95,99-102
Count: 7 groups.
RULE-CLAUSE: none.
MAYBE: "No move removes a crossing" | hint-text.ts:149 | states why this kind of step exists (nothing better was found); it is a fact about the search, not the board (the board shows the crossings).
MAYBE: "{Moving these N points} solves the puzzle" | hint-text.ts:187 | goal of the game, but also a board-specific claim about a journey.
VOCAB: element = "point" ("this point", "these 3 points", "the other one/the other 2"), "spot" ("a better spot", "a new spot"), "crossing" (outlined), "lines"; no ruled-out words (moves, not values); pointing = "this point" (ringed), "a better spot"/"a new spot" (ringed), "the outlined ones"/"the outlined N" for crossings; unusual: "journey" (internal word not said), "frees a move", "stay clear", numerals always.

---------------------------------------------------------------------------

## SUMMARY OF TEMPLATE COUNTS (own templates, distinct sentence shapes as numbered above)
solo 11 (+5 delegated), spokes 8, starbattle 10, sticks 14, subsets 13, tents 14, towers 10 (+delegated), tracks 14, twiddle 17 groups, undead 6, unequal 4 (+delegated), unruly 4, untangle 7 groups; ENGINE-SHARED 13.
RULE-CLAUSE / MAYBE counts: solo 0/3 (+shared 1/2), spokes 0/0, starbattle 0/2, sticks 0/2, subsets 0/2, tents 3/2, towers 2/3, tracks 1/6, twiddle 0/2, undead 1/0, unequal 0/0, unruly 0/3, untangle 0/2.
Cross-game vocabulary note: "square" is used by starbattle, sticks (+ "this N"), tents, tracks; "cell" by solo, subsets, towers, undead, unequal, unruly. Ruled-out: starbattle/tracks "must be empty", tents "must be grass", spokes "rule out", tracks sides "must be blocked", sticks "must be horizontal|vertical", latin "must go"/"can't hold", subsets "clear {L}". The same rule-restating populate clause is duplicated in undead (own text) and engine populateText.
