# Verdicts: boats

## keep `boats`: The Boats solver is monotone in its difficulty cap

The first sentence is `engine-difficulty` "A difficulty-capped solver is monotone in its cap at every tier", but the second is stated by no shared requirement: Solve and the mistake check solve once at the highest cap. `engine-difficulty` "A non-monotone solver is repaired, never declared" is about the solver and not about what its consumers ask, and `docs/games/solver-and-generator.md` § "Cap-monotonicity, and the game that broke it" says only what not to do ("do not solve at each cap in turn"), as a story. The rule binds: a board loads whatever tier its params state (`engine-params` "A board loads only if the game's own solver solves it"), so a `findMistakes` that solved at the stated tier would get stuck and report nothing. `solveToGrid` in `src/games/boats/solver.ts` is what a change would be checked against it.

## cut `boats`: Boats refuses to hint a board it cannot honestly advise

duplicate: "Boats findMistakes re-solves to the unique solution" already says a locally legal placement no solution permits is reported, with that scenario. The refusal itself is `engine-hints` "The midend SHALL refuse a hint on a finished or wrong board before asking the game", which refuses wherever `findMistakes` reports anything and highlights it. Boats' `hint` in `src/games/boats/index.ts` makes no such check of its own; its comment says the midend's refusal is why.

## reword `boats`: Every Boats technique is narrated

The rule about how a refutation is worded was only in the scenario, and it is a rule about a hint's words, so it is now in the body. It is true of the code: `breachClause` in `src/games/boats/hint-text.ts` reads the broken rule off the validator's rejection. The rest is unchanged. `engine-hints` "A hint step always names a technique, with no un-narrated fallback" covers the general ban, and this keeps Boats' own two facts: it guesses at no tier, and a refutation names its rule.

### Requirement: Every Boats technique is narrated

Every named technique SHALL be narratable. Boats guesses at no tier, so the
hint SHALL NOT fall back on an unexplained "this is the only possibility" step.
A step forced only because the opposite placement contradicts the board SHALL
name the rule that placement would break.

#### Scenario: A refutation names the rule the alternative would break

- **WHEN** a square is forced only because the opposite placement immediately
  contradicts the board
- **THEN** the explanation names the specific rule that would break (a line's
  number, two boats touching, or a boat the fleet cannot hold) rather than
  asserting the square is forced without reason

## note The two sentences cut from Boats need not come back

"A boat's first square is the smallest element of its class" was cut as `how`. It is a trap for whoever touches the union-find, and two guides hold it where that session reads: `docs/games/solver-and-generator.md` § "Cap-monotonicity, and the game that broke it" and its passage on root identity, and `docs/games/engine-catalog.md` on `minimal(i)`. "There SHALL be no interpolated animation" was cut as `declared` (`animLength: () => 0` in `src/games/boats/index.ts`). I found no decision about it: no comment at the site, and nothing in the guides. It is what the port inherited, so the declaration is enough.

## note Boats' spec has no requirement for its rules or its techniques

The last doubt names no requirement, and it holds. The rules (boats never touch, even diagonally; each line holds its number; the fleet) are stated only in the Purpose and, in part, in "Boats is solved when the fleet is placed, without the water". The hint's techniques and their order are stated nowhere: "Boats solves with a four-tier deductive solver" names the tiers and not what each holds, where Magnets and Dominosa list theirs. A follow-up change should write both from `src/games/boats/solver.ts` and `hint-solver.ts`; this pass may not add them.

## note "Generation from a given seed SHALL be reproducible" is still in Boats

No doubt names it, so "The Boats generator deals a unique board at exactly the requested difficulty" is untouched. The same sentence was cut from Clusters in the pruning and is cut from Bricks in this batch, as covered by `testing` "The test suite is deterministic under parallel load". Whoever next edits the Boats requirement can drop it and its scenario on the same ground, leaving the requirement a scenario about the tier.
