# signpost

The Purpose was corrected: it named "its params and description encodings",
and the params encoding is the declared codec's now; it says "what its params
refuse and its description encoding", and names the hint, which it left out.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Signpost reports mistakes for Check & Save | title kept. "`signpost` SHALL implement `findMistakes(state)`: it SHALL take the board's one chain from the search that counts its answers, at either difficulty" cut, and no citation stands in its place (second pass); what is flagged, how a flagged cell is drawn, and the unlinked cell kept. "Where the search did not prove exactly one chain, `findMistakes` SHALL return no mistakes" cut (third pass). Scenarios "A wrong link is flagged" and "A hand-typed ambiguous board reports nothing" dropped; "A wrong link out of a given" kept | `engine-difficulty`, "One search answers a board for everything that asks" (`answerOf`, `src/games/signpost/index.ts:310`); the empty result is `ts-engine`, "A mistake check compares with the one answer, hidden or not"; the first scenario is `engine-hints`, "Check & Save names a wrong entry in every game"; the second restated the requirement's last sentence, of a board that does not load (`engine-params`, "A board with a mistake check loads only with exactly one answer") |
| Params: Signpost's parameters | replaced by "Params: A Signpost params string may leave out its height and its difficulty" (the pointer, rule 2, with the two missing-field sentences) and "Params: Signpost refuses to deal a 1×1 board" (the `validateParams` sentence, standing alone, with scenario "Invalid params are rejected"). The field list, the `{w}x{h}`, `c`, `de`, `du` encoding and the bound of one cut. Scenarios "Params round-trip" and "The difficulty is in the full encoding only" replaced by "A string that leaves the difficulty out", made of the first's last line | `paramConfig`, `src/games/signpost/index.ts:144` (`bounds: { min: 1 }` at `:147`), and the `paramsCodec` field list, `:169` (`dims`, `flag "c"` full only, `searchTierSegment`); `engine-difficulty`, "A game that searches has a tier for each deduction and Unreasonable above them"; `engine-params`, "Params validity is the engine's check"; `src/engine/__snapshots__/params-stability.test.ts.snap` holds `4x4cde`/`4x4`, `5x5cdu`/`5x5`, `4x4de` and every preset. Found, mended: the pointer gains what a string with no `c` decodes to (free ends, the short form included: `flag` sets the opposite of `means` where the letter is absent, `src/engine/params-codec.ts:290`), with scenario "A string that leaves the corner letter out", whose `6x4` and `6x4de` are `src/games/signpost/signpost.test.ts:57`-`:59`; and "Params: Signpost refuses to deal a 1×1 board" has its scenario give the refusal's sentence (`src/games/signpost/index.ts:108`) in place of "a non-null error string" |
| Params: Signpost's menu offers each size at both difficulties | removed; the `Params` pointer names `presets` and `defaultParams` | `BOARDS`, `VARIANTS`, `defaultParams` and `presets`, `src/games/signpost/index.ts:93`, `:96`, `:100`, `:402`; `engine-params`, "The preset menu is a grid" (each board at every tier, then one board for each thing that is neither a size nor a tier); the snapshot lists the default and the nine other lines |
| Generation: An Unreasonable Signpost board has one answer that the solver does not reach | retitled "Generation: An Unreasonable Signpost board is an Easy one with more numbers taken away". Kept: the strip (from an Easy board, further givens taken, never the first or the last, each only while the search proves one chain). Cut: the strip's budget "of its own, well under the search's" (the citation that stood for it went in the second pass), and "SHALL keep the board only when the solver stops short on it", for the pointer to the engine's deal. Scenario "A dealt Unreasonable board needs search and has one answer" dropped; "The smallest boards and the largest carry the tier" kept | `engine-difficulty`, "The engine deals the Unreasonable board of a game that searches" (its first scenario) and "A strip is asked within the engine's dealing budget"; `dealUnreasonable`, `src/games/signpost/generator.ts:234` |
| Generation: A pasted Signpost board opens at the difficulty it needs | retitled "Generation: A Signpost board is Easy where the solver and the hint both finish it". Kept: what makes a board Easy and what Unreasonable. The loading rule and the two refusals cut whole (second pass: the pointer that stood for them went too). Scenario "A board with several answers or none is refused" dropped; "A board that needs search opens as Unreasonable" kept | `engine-difficulty`, "A loaded board whose id states no tier takes the lowest tier that solves it" and "A pinned tier is kept or raised and never lowered"; `engine-params`, "A board with a mistake check loads only with exactly one answer". Boards of the dropped scenario's two kinds are in this spec, "Solver: Signpost's search assumes each link of the cell with the fewest, nearest first", scenario "The search tells one answer from several and from none"; `src/games/signpost/signpost-tier.test.ts:373` holds the refusals |
| Solver: Signpost solves by forced-link deduction | last sentence ("`solve()` SHALL take the chain from the search that counts a board's answers, at either difficulty") cut, with scenario "Solve recovers the chain from a dirty state" | `engine-difficulty`, "Solve from the search shows the one answer or says which it lacks" and "One search answers a board for everything that asks" (the search does not read the player's entries); `ts-engine`, "Solve leaves a solved board"; `solve`, `src/games/signpost/index.ts:299` |
| Solver: Signpost counts a board's answers by a bounded search | retitled "Solver: Signpost's search assumes each link of the cell with the fewest, nearest first". Kept: what the search runs over, which cell it takes and in what order it assumes. Cut: counting up to two, the four verdicts, the budget in positions; the citation that stood for them, and the sentence that Solve is the search's, went in the second pass. Scenarios "A spent budget is neither answer" and "An Easy board takes one position" dropped; the other two kept | `engine-difficulty`, "The engine counts a searching game's answers up to two, within a budget of positions" (its scenarios "The budget runs out with one answer in hand" and "A board the deduction finishes"); `searchAnswers`, `src/games/signpost/solver.ts:177` |
| Hint: A Signpost hint step marks both ends of its link | retitled "Hint: A Signpost hint step stripes the squares ahead of its arrow only where there are several" (second pass). The three roles' pictures (the arrow in the hint color, the ringed square, the striped squares, the outlined rivals) cut, and with them, in the second pass, the sentence naming `hintMarks` and "the ring at both ends of its link", which is the legend's `ring`; kept: the squares an arrow points at are striped only where there are several. Scenario kept | `hintMarks.roles`, `src/games/signpost/index.ts:434` (`ring`: "at both ends: the arrow it leaves by is drawn in the hint color, and the square it arrives at is ringed"; `outline`; `stripes`) |
| Hint: Signpost's hint stops where the solver does | third pass. Retitled "Hint: Signpost's hint finishes an Unreasonable board from links tried rightly". "The hint SHALL never run the search", "and no others, and where none is forced it SHALL refuse with the collection's sentence that deduction has run out" and "It SHALL go on from the links the player then makes" cut; kept, reworded to stand, that the steps are the links forced from the player's own, and, from the scenario's last line, that a link made rightly wherever the hint stops lets it finish the board. The scenario cut to that line and retitled "The hint goes on from a link tried rightly" | `engine-hints`, "The hint of a game on the search's tiers never searches" (and its scenario "A value tried wrongly") and "A hint gives every step deduction still forces before it refuses"; the wording of the refusal is `engine-hints`, "Deduction running out on a sound board SHALL have one wording" |
| Look: The Signpost completion flash runs the chain from 1 to the last number | removed, with both scenarios | `ts-engine`, "A game gives each element a position, and the route is which position it gives" ("its step from the start where the board holds a path"; `flash.win(renderState.nums[i])`, `src/games/signpost/render.ts:496`); `engine-colors`, "A solved flash drawn as a color takes a shared color" (the ground filled and what it holds kept; nothing moved, its scenario "A flash that is not a color" naming arrows; a lit given as a lit cell, scenario "A board that lifts its cells") |

## Kept, and why

- **Params, the square fallback and "no difficulty letter decodes as Easy".**
  `dims` and `searchTierSegment` say both; kept as what a missing field
  decodes to (upstream's IDs carry no tier).
- **Params: Signpost refuses an area past what a signed 32-bit number
  holds.** `engine-params`, "A grid too large for a game is refused in one
  sentence", leaves where the ceiling sits to the game.
- **Generation: Signpost generates solver-gated boards.** One sentence, and
  it is what Easy means here.
- **Generation, "Easy where the solver and the hint finish it".**
  `deductionFinishes`, `src/games/signpost/index.ts:426`, asks both.
- **Controls**, all three. `interpretMove` is hand-written and the game
  declares no `targetVerbs` and no `requestKeys`.
- **Hint: Signpost's hint tries the next square, then the arrow in.**
  `hintRungs` lists the two, and the order is the plan's own loop in
  `src/games/signpost/hint.ts`.
- **Hint: Signpost's hint finishes an Unreasonable board from links tried
  rightly.** The engine's scenario "A value tried rightly" says the hint holds
  what the value forces or refuses again; that right links carry Signpost's
  hint to the end of the board is the game's.

## Engine requests

The three are stated, each under the same bold name, in `crossing.md`,
`filling.md` and `signpost.md`; Palisade's spec holds the same three
sentences.

- **`findMistakes` returns nothing where the search proved no single
  answer.** Answered: `ts-engine`, "A mistake check compares with the one
  answer, hidden or not"; the sentence is cut. As filed: "Where the search did not prove exactly one chain,
  `findMistakes` SHALL return no mistakes", in "Rules: Signpost reports
  mistakes for Check & Save". Belongs in `engine-difficulty`, "One search
  answers a board for everything that asks", which names `findMistakes` among
  what reads the search and does not say what it returns where the verdict is
  not one answer. No engine code does it: each game's `findMistakes` returns
  early (`src/games/signpost/index.ts:311`).
- **A board counts as Easy where the solver and the hint both finish it.**
  Left the game's own: `deductionFinishes` is a hook each game writes, and
  nothing requires that it ask the solver and the hint both
  (`ledger/_engine.md`, "Third round: the rest", Not written). Here: "A board SHALL count as Easy where the solver and the hint finish
  it", in "Generation: A Signpost board is Easy where the solver and the hint
  both finish it". Belongs in `engine-difficulty`, "A game that searches has
  a tier for each deduction and Unreasonable above them", which says the
  contract asks "the game's deduction" and not that the hint is asked with
  the solver. The code is `hintFinishes`, `src/engine/hint-finishes.ts`,
  called from each game's `deductionFinishes`
  (`src/games/signpost/index.ts:426`).
- **The hint never runs the search; on an Unreasonable board it holds only
  what deduction forces from the player's board, and goes on from what the
  player then enters.** Answered: `engine-hints`, "The hint of a game on the
  search's tiers never searches" and "A hint gives every step deduction still
  forces before it refuses"; the three sentences are cut but for the game's
  own. As filed: "The hint SHALL never run the search. On an
  Unreasonable board its plan SHALL hold the links forced from the player's
  own and no others … It SHALL go on from the links the player then makes",
  in "Hint: Signpost's hint stops where the solver does". Belongs in
  `engine-hints`, beside "A Search is refused and never narrated" (a search's
  survivor is never a step; it does not say the hint runs no search, and "A
  search certifies a position and never teaches one" lets a hint run one) and
  "A hint finishes a board from a right entry made out of order" (binds only
  a tier with no trial and error). The clause between them, that the refusal
  is the collection's sentence, is already `engine-hints`, "Deduction running
  out on a sound board SHALL have one wording". No engine code does it;
  `src/games/signpost/signpost-tier.test.ts:384` holds it.

## Found

- **The spec never says what a string with no `c` decodes to.** The flag is
  absent in every short form, so `5x5` decodes with free ends while the
  default is corner start (`flag(…, "c", …, { full: true })`,
  `src/games/signpost/index.ts:171`; the snapshot's `4x4de` is the free-ends
  preset). A short form always travels with its description, so no board
  changes; the cut left it unsaid as it found it.
- **The dropped scenario "A hand-typed ambiguous board reports nothing"
  described a board that cannot be opened**: a desc with no one solution is
  refused at load.
- **The spec never states the wording of the 1×1 refusal** ("Width and
  height cannot both be one.", `src/games/signpost/index.ts:108`); its
  scenario says only "a non-null error string".

## Review

10 rows read, each against the declaration or the requirement it names, read
whole; no row corrected in the spec, no sentence restored, no further
sentence cut.

Changed, in the ledger only:

- **The engine requests** are worded as Crossing's and Filling's are, under
  the same three names, each with what the nearest shared requirement lacks
  and the line that does it here.

The three sentences were read against `engine-difficulty` and `engine-hints`
as `crossing.md` § "Review" records; none is stated whole by a shared
requirement, and all three stay.

Checked and found sound:

- The 10 engine titles the spec cites resolve, each exactly, and each
  requirement states what its row removed. The removed Solve sentence and its
  scenario "Solve recovers the chain from a dirty state" are
  `engine-difficulty`, "One search answers a board for everything that asks"
  ("the search SHALL NOT read the player's entries") with "Solve from the
  search shows the one answer or says which it lacks". The removed flash
  requirement is `ts-engine`'s "its step from the start where the board
  holds a path" and `engine-colors`' fill that keeps what the element holds,
  with "nothing spins" for the arrows and its lifted-cell scenario for a lit
  given.
- The marks: the legend's `ring` says "at both ends: the arrow it leaves by
  is drawn in the hint color, and the square it arrives at is ringed", its
  `outline` the other squares whose arrows point at the ringed square, its
  `stripes` the squares an arrow points at. "Only where there are several"
  is in none of them and stays.
- The declarations: `bounds: { min: 1 }`, `flag "c"` in the full form only,
  `searchTierSegment`, `BOARDS`, `VARIANTS` and `presetGrid`. Every line
  citation of the writer's, 20 of them, lands on the line named; the
  snapshot holds the default and the nine other lines, `5x5cde` among them.
- The new sentences against the code: the 1×1 refusal is behind `full`; the
  Unreasonable deal draws with `easyBoard` and strips with `stripFurther`;
  `hint.ts` calls no search.
- The first `## Found` item is true and is no gap in what a link depends on:
  `engine-params`, "A params string is read whole or refused", scenario "A
  bare flag letter left out", states it of every `flag`.
- No kept requirement holds a further copy by the three classes. The three
  Controls requirements are `interpretMove` written out; "Hint: A Signpost
  hint asks for no link the board already holds" opens on a sentence
  `engine-hints`, "A hint SHALL show only steps the player's board does not
  already decide", comes near, and that sentence is the antecedent of what
  is Signpost's, the links the board makes itself.
- Each subject read alone: none hollow, no dangling antecedent, every title
  fits its body.

## Second pass

The brief's "A pointer is for that case only" and its line on a preference's
key, applied. 10 citing sentences read; 7 removed or reworded to the game's
own (the Solver requirement held two), 2 kept as the one pointer of a subject
or concern, 1 kept inside an engine-request sentence.

Removed (each a copy with a citation, in a subject that says plenty of its
own; where it is stated is the row's third cell):

- **Rules**, "which it SHALL take from the search as `engine-difficulty`,
  "One search answers …" says". The engine-request sentence at the
  requirement's end stands as it did.
- **Generation**, "within the budget of "A strip is asked within the engine's
  dealing budget"", a second citation in the one pointer the Unreasonable
  deal has.
- **Generation**, "What a pasted game ID opens as SHALL follow from that (…),
  and one with several chains or none SHALL be refused (…)": three citations
  and nothing of the game's. The scenario stays as the case of a board that
  counts as Unreasonable.
- **Solver**, the citation in the first sentence, reworded to the game's own
  ("Signpost's search for a board's chains SHALL run over the solver: …"),
  and "Solve SHALL be the search's, by "…", and Signpost SHALL depart from
  neither".
- **Hint**, "A finished board, or one with a mistake, is refused before
  `hint` is asked: `engine-hints`, "The midend SHALL refuse …"". With it gone
  "Hint: Signpost's hint stops where the solver does" is as it stood before
  the cut, and its row is gone from the table.
- **Hint**, "A step's marks SHALL be the roles `hintMarks` declares, the ring
  at both ends of its link: the arrow it leaves by and the square it arrives
  at". The second half is the legend's own words (`ring`: "at both ends: the
  arrow it leaves by is drawn in the hint color, and the square it arrives at
  is ringed", `src/games/signpost/index.ts:436`), so the sentence was a
  pointer and a copy of the declaration together. The requirement keeps the
  one thing the legend does not say, and is retitled for it.

Kept as a pointer: the `Params` pointer (`paramConfig`, the codec, `presets`
and `defaultParams`, one requirement); "Signpost's Unreasonable boards SHALL
be dealt by the engine's deal (…), from an Easy board, with a strip of the
game's own".

Kept otherwise: "it SHALL refuse with the collection's sentence that
deduction has run out", inside an engine-request sentence and left as it is.
"`validateParams` SHALL refuse a `w·h` above 2,147,483,647, in the
collection's sentence "…"" cites no requirement: where the ceiling sits is
the game's. The surfaces of "Look: Signpost draws its squares on the
collection's quiet surface" say which square takes which.

Preferences: Signpost has no `prefs` of its own in the spec and the cut
touched none.

Each subject read alone after the edits: no fragment, no dangling "it",
every owed subject says what the game does there or where to look, every
title fits its body.

## Third pass

Three rows of the engine tables name Signpost (the mistake check, every step
before a refusal, the hint that never searches); a fourth, the bare flag
letter, names it as saying nothing, and the spec says nothing of `c` left
out.

- **Rules**, "Where the search did not prove exactly one chain,
  `findMistakes` SHALL return no mistakes": cut. `findMistakes` reports no
  broken rule; the live overlay's loops and clashes are stated apart, in
  "Rules: Signpost's live error overlay is not its mistake check".
- **Hint**, "Hint: Signpost's hint stops where the solver does": three
  sentences cut to one and retitled; the scenario cut to its last line.

Sentences cut: 4, and three lines of one scenario. Clauses kept: "the links
forced from the player's own", and that a link tried rightly lets the hint
finish the board (the review keeps the scenario's last clause). "A board
SHALL count as Easy where the solver and the hint finish it" stays as the
game's own. "The cursor SHALL stop at the grid's edges", in "Controls:
Signpost's keys pick a square up and put it down", was read against
`engine-input`, "The engine provides the geometry of a grid of squares":
that binds a game on `squareGrid`, and Signpost calls `moveCursor` from its
own `interpretMove` (`src/games/signpost/index.ts:222`), so the sentence
stays.

Section 2 of the brief: no "no departure" sentence, and the pasted-ID
sentence went in the second pass; the scenario "A board that needs search
opens as Unreasonable" stays under the sentence that says which boards count
as which tier.

Each subject read alone: no fragment, every title fits its body.

## Found, mended

- What a string with no `c` decodes to: stated in the `Params` pointer, with
  a scenario.
- The dropped scenario described a board that cannot be opened: left: the
  scenario is gone.
- The wording of the 1×1 refusal: the scenario of "Params: Signpost refuses
  to deal a 1×1 board" now quotes it.
