# Verdicts: engine-params

## keep `engine-params`: The engine provides a shared dimension param parser

The `dims` scenario of "The codec grammar is a prefix, tagged segments, flags and letters" covers only a declared codec. Seven hand-written codecs call `parseDimensions` directly (`git grep parseDimensions -- src/games`: Ascent, Cube, Flood, Mosaic, Pegs, Slide, Twiddle), Cube and Pegs with a `start` or a suffix read from `next`, and "A params encoding the grammar does not fit stays hand-written" keeps such codecs first-class. The author of the next one reads this for "SHALL NOT parse the prefix itself" and the square fallback, which is a promise to shared game IDs.

## keep `engine-params`: A rule that a game rejects params is met by the engine's check

The reading rule is still needed: thirty-odd game specs of the regrouped tree say a game's `validateParams` rejects or refuses some params (`grep -rlE "validateParams.{0,3} (SHALL )?(reject|refuse)" <scratch>/regrouped-v1`), and in several the refusal is an item's `bounds`. Rewording those specs is not this entry's to do, and until they are reworded a session checking a game against its spec needs this to know a `bounds` refusal meets it.

## keep `engine-params`: A declaration of what a setting leaves throws when it cannot hold

A helper's promise to a game author, and the five conditions are the ones `src/engine/only.ts` throws on (`narrowedBy`: no other field, wrong kind, a field that itself decides, no choices or choices it does not have; `narrowings`: nothing left between two deciding fields). A session declaring an `only` reads it to learn what a declaration may not say, and two of the five (a decided field cannot decide, two deciders must leave something) are design limits of the Custom form that would be revisited, not accidents of one test.

## keep `engine-params`: The codec grammar is a prefix, tagged segments, flags and letters

The segment list is the contract and not only today's API: "A params encoding the grammar does not fit stays hand-written" forbids growing it for one game, so what it holds now is what decides whether a new game declares or hand-writes its codec. The guide's copy (`docs/games/mechanics.md` § "Codecs and validation") gives the reasons and is incomplete as a list (see the note below), so the spec is the only whole statement of the grammar.

## edit `engine-params`: A params refusal is a sentence

The cut of "A guard reads every string a validateParams can return" as `how` stands for how the guard follows a `return`. That it fails what it cannot read is not construction: it is what makes "reads every string" true, since a guard that skipped an expression it could not follow would pass over the refusals most likely to be malformed. Its only other home is the header of `src/engine/params-refusal.test.ts`, so the clause goes back in, in words.

from: a guard SHALL read every string
to: a guard SHALL read, and fail where it cannot read, every string

## keep `engine-params`: A game can supersede its game description mid-play

Cited by title in `docs/games/mechanics.md` § "A board decided at first click", so it stays with its title unchanged. The citation is missing from `spec-citations.mjs --list` for a reason other than the one the doubt gives; see the note below.

## note The near-miss test's two cut requirements stay cut

"Near misses come from boards dealt at a fixed seed" and "The near-miss test says what it cannot see" are not in the regrouped `engine-params`, and the doubt asks whether the floor deserves a normative home. It does not need one of its own. What a player is promised is in "A pasted game ID is refused or opened, never thrown", which names both populations and keeps the scenario that a game refuses at least one malformed description. The floor (`expect(total).toBeGreaterThanOrEqual(1100)` in `src/engine/desc-error-games.test.ts`) is an instance of `docs/method.md` § "Count what the check looked at", and the figure and the seed are that test's own; the test's header ("What this can see", "The cap") carries the rest. Nothing to restore.

## note spec-citations.mjs missed a citation whose capability name is a markdown link, and the working tree now reads it

The doubt supposed the citation in `docs/games/mechanics.md` § "A board decided at first click" was missed because the title wraps. It was not: the script folds newlines before matching. It was missed because the capability is written as a link, `` [`engine-params`](../../openspec/specs/engine-params/spec.md), "A game can supersede…" ``, and the committed `CITATION` in `scripts/checks/spec-citations.mjs` wanted the quoted title straight after the closing backtick, allowing only " spec", a comma, a colon or a section sign between. The working tree's `CITATION` admits `](…)` after the backtick, and `node scripts/checks/spec-citations.mjs --list` prints this citation as resolved, so what is left is to commit that edit. The linked path names `openspec/specs/engine-params/`, which stays right because the requirement stays in this capability.

## note docs/games/mechanics.md § "Codecs and validation" lists five of six segment kinds

The guide says "Six segment kinds cover the grammar" and then names `dims`, `size`, `num`, `choice` and `flag`. `src/engine/params-codec.ts` exports a sixth, `letters`, which the spec's grammar requirement does name. The guide should name it.
