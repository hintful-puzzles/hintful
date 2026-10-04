# retire-dominosas-ambiguous-tier

Asked for by the owner on accepting `retire-the-unchecked-board-options`
(2026-10-04): *"I'd also be interested in similarly tackling Dominosa, unless
there's a really good reason to keep it different."*

## Why

Dominosa's fifth difficulty, "Ambiguous", is upstream's unchecked-board switch
under another name: its generator skips the uniqueness search and scatters the
dominoes. It is the same thing the five checkboxes were, and there is no reason
to keep it different. A board dealt there has several solutions, so
`findMistakes` returns nothing on it and the hint refuses with "This puzzle's
solution can't be determined."

It was also the only user of `DifficultyContract.nonUniqueTiers`, which three
engine consumers and three cross-game guards each carried a branch for, and
which `AGENTS.md` held up as an example of a first-class override. What the
override excused was a board the rest of the engine says must not exist.

Removing the exemption showed that it had been hiding two things:

- **A board with several solutions loaded under any ID that said
  Unreasonable**, in every game with that tier, because a tier that permits
  search was "taken as stated" and its board asked nothing.
- **`upstream-descs.test.ts` read every Dominosa fixture onto the wrong grid.**
  The test lays a fixture's fields over the game's defaults, Dominosa's default
  is the tall board, and upstream's boards are wide. The exemption passed all
  ten without asking; asked, nine were refused.

## What Changes

- **The tier is removed.** Dominosa offers Easy, Normal, Tricky and
  Unreasonable, which is the conventional four-tier list, so its tier names
  stop being an override.
- **The codec reads upstream's `da` and its older bare `a` as naming no tier**,
  so such an ID deals a checked board at the default tier.
- **`nonUniqueTiers` is deleted** from the contract, `loadDesc`, the midend and
  the three guards.
- **The load rule gets simpler and stricter: a board loads only if the game's
  own solver solves it at some cap.** Unreasonable is a cap like any other, so
  a board that needs trial and error still loads in a game with that tier, and
  a board no cap solves loads nowhere. `difficulty-contract.test.ts` already
  holds every generator to exactly this for every tier it deals.
- **A second refusal sentence**, `DESC_NO_SINGLE_ANSWER`, for a board no cap
  solves in a game that has an Unreasonable tier. `DESC_NOT_DEDUCIBLE` says the
  board "needs trial and error", which is not what is wrong where trial and
  error is allowed.
- Dominosa's one fixture dealt at Ambiguous is retired.

## Compatibility

- A Dominosa ID for a board with several solutions no longer loads. An
  Ambiguous board that happens to have one solution loads, at the tier that
  solves it.
- **Upstream's Mathrax Recursive boards no longer load.** Upstream's generator
  accepts a board with several answers at that tier (`mathrax/generator.ts`
  records the defect and diverges from it), and all three such fixtures are
  among them. They used to load under an Unreasonable ID with no mistake check.
  This follows the owner's ruling in `play-only-boards-with-one-answer`:
  *"reject non-unique solutions from upstream as incompatible with Hintful."*
- Every other upstream fixture loads, Dominosa's nine included now that they
  are read as wide boards.

## Wording for the owner

`DESC_NO_SINGLE_ANSWER`: *"This game ID's puzzle has no single solution that
can be found, and only puzzles with exactly one can be played here."*

`help/differences.md`'s entry now names Dominosa and says "or that has several
solutions". Dominosa's help page loses its sentence about Ambiguous boards.

## Hints to pull in

None.
