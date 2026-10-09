# Verdicts: spokes

## cut `spokes`: Spokes refuses to hint from a position it cannot vouch for

collection: `engine-hints` "The midend SHALL refuse a hint on a finished or wrong board before asking the game" refuses the solved board and the wrong one before Spokes' `hint` is asked, and its scenario "Asking for a hint on a board with a mistake highlights it" is this requirement's only scenario. It covers Spokes with no departure: `hint` in `src/games/spokes/index.ts` writes neither refusal, and `spokes-hint.test.ts` files both under "boards the midend refuses a hint on". The two clauses that look like the game's own are not. A board that breaks a rule the game marks (a hub over its number, a hub cut off) holds a line the solution forbids or a mark where it needs a line, which is what "Spokes' findMistakes compares the board with its one solution" flags, so it is the wrong-board refusal again; and for the same reason no step can follow from a player's mistake. The refusal when no deduction applies is stated by "Spokes' hint stops at bounded reasoning" ("SHALL refuse with a message saying no further move can be deduced").

## reword `spokes`: Spokes' difficulty tiers bind the boards they generate

The first sentence stays: it is what the generator promises of every board, at
any size, where `engine-difficulty` "A cross-game guard asserts that tiers
bind" speaks only of a guard over the presets, and it is the difference from
upstream, whose check let through boards an easier tier solves. The second
sentence goes as `how`: that the check re-solves from a cleared board is the
way the promise is kept, the header of `src/games/spokes/generator.ts` says it
at the site with the upstream defect it fixes, and a generator that broke it
would deal boards the cross-game guard refuses.

### Requirement: Spokes' difficulty tiers bind the boards they generate

A Spokes board generated at a difficulty above the easiest SHALL NOT be soluble at
the tier below it.

#### Scenario: An Unreasonable board genuinely needs its own tier

- **WHEN** a board generated at `Unreasonable` is solved at Normal
- **THEN** the solver does not reach a solution
- **AND** solving the same board at `Unreasonable` does reach one

## keep `spokes`: The look-ahead's bound has one definition

The guide is not its home. `docs/games/solver-and-generator.md` § "Check,
Tactic, Search" states the general rule (a constant a rung is gated on is
load-bearing for a tier's name) and points at `ACTION_LIMIT` as its example;
this requirement is the game's own rule that the bound is what makes Normal a
Tactic and that the solver and the hint read one definition. It is what a tier
means and a refusal that still binds, and both are on the list of what stays.

## keep `spokes`: Spokes' parameters

The round-trip sentence is the statement that the game ID carries all three
fields, a promise to shared links, and `engine-params` "Encode and decode are
mutual inverses over the corpus" is a rule about a guard, not about what
Spokes encodes. The rest (the bounds, the two refusals of `Unreasonable`) is
the game's own.

## keep `spokes`: Spokes' generator keeps every board uniquely soluble

No shared requirement states that a seed deals one board: I read `dealing`,
`engine-params`, `ts-engine`, `ts-migration` and `app-shell`, and the nearest
are `ts-migration`, which fixes only the random stream, and `app-shell` "A seed
ID still deals a game", which needs the generator to be a function of the seed
to mean anything. So the sentence stays here. See the note.

## keep `spokes`: What Spokes draws

"SHALL flash on completion" is Spokes' declaration, not a restatement:
`ts-engine` "The win flash plays on a forward move that solves the board"
plays the flash for the duration the game's `solvedFlash` gives, and whether a
game gives one is the game's (`solvedFlash: () => FLASH_TIME` in
`src/games/spokes/index.ts`). The scenario is also the spec's one statement of
what counts as solved.

## note Seed-reproducible generation has no shared requirement

Spokes, Sticks, Signpost, Ascent and Crossing each say "generation from a
given seed SHALL be reproducible", and the regrouped shared specs do not.
Something relies on it beyond each game's own test: a `params#seed` ID still
deals a board (`app-shell`), and every fixed-seed test and hint pin assumes a
seed names one board within a build. It would be one requirement in
`engine-params` or `dealing` ("a generator's output is a function of its
params and the random stream it is handed"), after which each game's sentence
and scenario could go as `collection`. Until it exists the games keep theirs.
