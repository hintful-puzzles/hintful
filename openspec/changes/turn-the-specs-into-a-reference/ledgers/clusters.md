# Ledger: clusters

Base: bb004490

Where every rule of Clusters' spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters.

## Clusters game implements the Game interface

| Rule | Where it went |
| --- | --- |
| `src/games/clusters/` implements `Game` and is registered | spec: Clusters game implements the Game interface |
| It declares `findMistakes` so Check & Save can flag rule-violating cells, with its reason | spec: Clusters game implements the Game interface |
| Parameters are a width, a height and a difficulty | spec: Clusters' parameters are a width, a height and a difficulty |
| A game ID encodes width and height, a bare number is a square, the full form carries the difficulty, and it round-trips | spec: Clusters' parameters are a width, a height and a difficulty |
| The difficulty is offered by the preset menu and the Custom dialog | spec: Clusters' parameters are a width, a height and a difficulty |
| Validation rejects an area of at least 10000 as too large and under 2 as too small | spec: Clusters refuses a board size that has no puzzle |
| Validation rejects a board no larger than 2×2 in both dimensions, which has no puzzle at any difficulty | spec: Clusters refuses a board size that has no puzzle |
| "Matching upstream", and that upstream's area check admits the 2×2 boards | history |
| Scenario: every preset produces a uniquely solvable board | spec: Clusters game implements the Game interface |
| Scenario: a game ID round-trips | spec: Clusters' parameters are a width, a height and a difficulty |
| Scenario: a board with no puzzle at all is rejected | spec: Clusters refuses a board size that has no puzzle |

## Clusters descriptions use the upstream run-length dot encoding

| Rule | Where it went |
| --- | --- |
| Only the dots are encoded, row-major, lowercase red and uppercase blue each after a run of blanks, `z` or `Z` a skip of twenty-five, the position totaling the area plus one | spec: Clusters descriptions use the upstream run-length dot encoding |
| Validation rejects a position short of or past the area plus one, telling too short from too long, and any character outside the letters | spec: A Clusters description is validated against the board area |
| Scenario: a generated description round-trips | spec: Clusters descriptions use the upstream run-length dot encoding |
| Scenario: the wrong number of cells is rejected | spec: A Clusters description is validated against the board area |

## Clusters ports the contradiction solver and solver-gated generator

| Rule | Where it went |
| --- | --- |
| The solver classifies a board as complete, unfinished or invalid and marks the cells that break a rule | spec: Clusters' solver deduces by contradiction at two rungs |
| It fills forced cells by contradiction, applies one level of lookahead when asked, and the two rungs are the two tiers | spec: Clusters' solver deduces by contradiction at two rungs |
| The generator's steps, and the retry until the solver completes at the tier and the tier below cannot | spec: Clusters' generator is gated by its solver |
| Generation from a seed is reproducible | spec: Clusters generation is reproducible and bounded |
| The retry loop is bounded, so a parameter set with no board fails | spec: Clusters generation is reproducible and bounded |
| Rejecting a completed candidate perturbs the grid before retrying, with why it would otherwise never terminate | spec: A completed candidate that is rejected is perturbed |
| The perturbation should be small and not a reset, because the loop is a hill-climb | spec: A completed candidate that is rejected is perturbed |
| A reset "costs several times the generation time" | figure |
| Scenario: the solver completes a uniquely solvable board | spec: Clusters' solver deduces by contradiction at two rungs |
| Scenario: generation is reproducible from a seed | spec: Clusters generation is reproducible and bounded |
| Scenario: a parameter set with no board gives up | spec: Clusters generation is reproducible and bounded |

## Clusters input, mistakes and completion

| Rule | Where it went |
| --- | --- |
| Played by click, drag and keyboard cursor, with left cycling toward blue and right toward red, each able to clear, and a drag painting every cell it passes | spec: Clusters is painted by click, drag and keyboard cursor |
| The cursor places blue, red or blank by dedicated keys | spec: Clusters is painted by click, drag and keyboard cursor |
| Givens are never overwritten, and a move changing no non-given cell adds no history | spec: Clusters is painted by click, drag and keyboard cursor |
| `findMistakes` reports the rule-breaking cells so Check & Save hard-blocks | spec: Clusters input, mistakes and completion |
| Solving fills the board to the unique solution | spec: Clusters input, mistakes and completion |
| Complete when every cell is filled and no rule is broken, with a flash and no move animation | spec: Clusters input, mistakes and completion |
| Scenario: dragging paints a run of cells | spec: Clusters is painted by click, drag and keyboard cursor |
| Scenario: a rule-breaking cell is reported as a mistake | spec: Clusters input, mistakes and completion |
| Scenario: completing the grid wins | spec: Clusters input, mistakes and completion |

## Clusters provides an explained deduction hint

| Rule | Where it went |
| --- | --- |
| `hint` and `hintKeepTrack` are implemented, and the hint is computed from the game's own solver as a second projection of one engine | spec: Clusters provides an explained deduction hint |
| The plan is recompute-stable by a deterministic scan order | spec: A Clusters hint plan is recompute-stable |
| Each step explains why, naming one of three rules, with premise, contradiction and conclusion in the necessity voice | spec: A Clusters hint step names the rule the other color would break |
| The forced cell is highlighted as the hint target | spec: A Clusters hint shows its reasoning on the board |
| A contradiction on another tile marks that tile with a ring distinct from the live-error frame, so the reasoning is on the board | spec: A Clusters hint shows its reasoning on the board |
| The ring differs from the error frame in hue and in structure | untrue: `drawTile` in `src/games/clusters/render.ts` draws one square outline like the error frame's, orange where that is red and a twelfth of the tile thick where that is a seventh, so the difference is hue and thickness |
| The narration's "ringed" refers to that tile uniquely | untrue: `src/games/clusters/hint-text.ts` names that tile through the `outline` role, whose word is "outlined", and "ringed" is the role of the cell the step colors |
| The hint does not pre-place the forced color | spec: A Clusters hint shows its reasoning on the board |
| A lookahead deduction is one step showing the whole chain: hypothesis as target, forced cells marked with their colors in a form unlike a placed tile, the breaking tile ringed, and never an un-narrated fallback | spec: A lookahead deduction is one step showing its whole forcing chain |
| At a lookahead stall the shortest chain is taken, deterministically tie-broken | spec: A lookahead stall takes the shortest forcing chain |
| Every generated board is solvable by the narratable deduction with no nested speculation, and an Easy board needs no lookahead, with the reason | spec: Every generated Clusters board is solvable by narratable deduction |
| A hint is refused with a banner on a solved board, a rule violation, or a contradiction from the player's position, the last saying a placed tile must be wrong | spec: A Clusters hint is refused where it cannot deduce |
| It does not deduce onward from a doomed position | spec: A Clusters hint is refused where it cannot deduce |
| Scenario: a forced move is explained by the rule it would break | spec: A Clusters hint step names the rule the other color would break |
| Scenario: a lookahead deduction shows its whole forcing chain | spec: A lookahead deduction is one step showing its whole forcing chain |
| Scenario: a hint is refused on an unsolvable or mistaken board | spec: A Clusters hint is refused where it cannot deduce |

## Clusters offers difficulty tiers over its two deduction levels

| Rule | Where it went |
| --- | --- |
| Two tiers, Easy the single-cell proof and Normal the same one hypothetical level deep | spec: Clusters offers difficulty tiers over its two deduction levels |
| A Normal board is not soluble by the single-cell reasoning alone, and an Easy board is | spec: Clusters offers difficulty tiers over its two deduction levels |
| The gate may run the easier rung first and reject a Normal candidate it completes, the same verdict for one solver run | held: src/games/clusters/generator.ts "const easy = solveGame(grid, w, h, DIFF_EASY)" |
| The difficulty is encoded in the game ID, and an ID with none decodes to Easy | spec: Clusters' difficulty is carried in the game ID |
| Easy was the majority tier before the parameter existed and the one a returning player would recognize | history |
| An unknown tier letter is rejected by parameter validation and not played as another tier | spec: Clusters' difficulty is carried in the game ID |
| Normal is refused for generation on a board too small, through validation with `full` set, so a description still loads at any size | spec: Clusters refuses to generate Normal on a board too small for it |
| `solve` and `hint` use the deeper rung whatever the tier, with the reason | spec: Solve and the hint use the deeper rung at every tier |
| `findMistakes` uses the deeper rung | untrue: `findMistakes` in `src/games/clusters/index.ts` returns `findErrors`, the cells breaking a local rule, and runs no solver rung at all |
| Scenario: the harder tier needs the deeper reasoning | spec: Clusters offers difficulty tiers over its two deduction levels |
| Scenario: the easier tier needs only the single-cell rule | spec: Clusters offers difficulty tiers over its two deduction levels |
| Scenario: an older game ID still resolves | spec: Clusters' difficulty is carried in the game ID |
| Scenario: a board too small for the harder tier refuses it | spec: Clusters refuses to generate Normal on a board too small for it |

## Clusters draws its two colors as the collection's two-state pair

| Rule | Where it went |
| --- | --- |
| Pieces on a quiet surface, the two colors the two members of the two-state pair, primary first, each in its member's color and shape, inset | spec: Clusters draws its two colors as the collection's two-state pair |
| A given sits on a lifted surface and carries its dot on its piece | spec: Clusters draws its two colors as the collection's two-state pair |
| The game names no hue: hint sentences and control words say the pair's words, and the help page names them by placeholder | spec: Clusters names no hue of its own |
| The cell a hint acts on is ringed in the hint-action color, which neither piece is drawn in | spec: A Clusters hint is marked in colors no piece is drawn in |
| A what-if cell carries a piece of the color it would be forced to, smaller than any placed piece | spec: A Clusters hint is marked in colors no piece is drawn in |
| Scenario: a hint names the color the piece is drawn in | spec: Clusters names no hue of its own |
| Scenario: a what-if piece cannot be taken for a placed one | spec: A Clusters hint is marked in colors no piece is drawn in |
