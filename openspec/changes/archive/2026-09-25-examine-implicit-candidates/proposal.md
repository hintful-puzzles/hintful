# examine-implicit-candidates

**Status: implemented** (2026-09-25). Owner-requested, 2026-09-25; the owner
chose a player preference owned by the engine, and `design.md` records what the
measurement decided from there.

## Why

Map's hint (`add-map-hint` and the four playtest changes after it, all
2026-09-25) reads candidates **implicitly**: a blank region with no dots can be
every color its neighbors do not show, and the hint writes dots only when a
deduction removes something the board does not already show, or when a pair's
or chain's premise needs its two colors visible. Every other candidate game walks
`runCandidatePlan`, which is **populate-first**: the notes are the whole
candidate set, penciled in by a populate step (the Mark-all move) and cleaned
against the board, and an empty cell means "not filled in yet".

`add-map-hint` recorded the difference as a property of Map ("an unmarked
element is 'no information', not 'no candidates'"). The owner's reading, and the
one this change starts from: **it is an independent choice, not a requirement
of Map.** Map could have used Mark-all, and a Latin game could read an unmarked
cell as "every value not already in its row, column or cage", which is how many
players solve before they pencil anything. If so, it is exactly the kind of
decision `AGENTS.md` § "Convention over configuration" says the framework
should own: one way per game chosen deliberately, not two ways because two
games were built at different times.

## What is already known

- **The engine half-does this already.** Group places before it populates, and
  to classify a single on a board with few notes it reads a note-less cell as
  the values its lines leave it (`visibleCandidates` in `group/index.ts`, fed to
  the walk as `shownNotes`). That is the implicit reading, written once, for one
  game, as a workaround.
- **Map's reasons, for re-deriving rather than inheriting.** With four colors
  and a region's handful of neighbors, "what can this still be" is a glance, so
  its Easy tier needs no notes at all, and a populate would have penciled 120
  dots onto a 30-region board to strike most of them. Those are arguments about
  *how much the board shows at a glance*, which varies by game, not about what
  Map is.
- **What the implicit reading costs a hint.** The playtests found that a
  premise read off neighbors is fine for one region and too much for several:
  a pair or chain has to dot its premise regions before it speaks
  (`dot-map-pairs-first`, `dot-map-chains-first`). A game adopting the implicit
  reading inherits that duty for every multi-cell premise.
- **Soundness is the same either way.** Both read the player's notes only
  where `findMistakes` vouches for them (a non-empty note set missing the
  answer is a mistake), which every candidate game already does.

## What this change must settle

1. **Is it orthogonal in the code?** Could `runCandidatePlan` take the reading
   as an option (implicit: candidates are notes-or-derived; explicit: notes after
   populate) with populate, the obvious clean and the dup culls following from
   it, rather than each being a separate game decision? Read the walk and its
   helpers (`nakedSingles`, `availableStrikes`, `availablePlacements`,
   `lazyPopulate`, `emitObviousCleanStep`) for where "empty notes" is assumed to
   mean "nothing".
2. **Where does each reading teach better?** Per candidate game, measure over
   its presets: the share of plan steps that are populate or clean (pure
   procedure), how soon a clue-driven elimination forces notes anyway (Towers,
   Keen, Mathrax), and how many premise cells a typical step reads (the load
   the implicit reading moves onto the player). Take the number against the
   population, not the one game that suggested it.
3. **Convention, default or preference?** Three possible outcomes, and the
   measurement decides between them: a collection-wide convention; a per-game
   default the framework owns, with the override first-class; or a player
   preference ("start from all notes" / "notes only when needed"), since some
   players pencil everything and some never do. Anything a player sees is the
   owner's call; bring the measurements.
4. **Could Map go the other way?** If the answer is "per-game default", say
   what Map's default is and why, from the same measurement, rather than from
   its being first.

## Constraints

- Nothing a player has saved may break: the move formats stay, including
  Mark-all's.
- The cross-game hint guards (`hint-resume.test.ts`, the narration ledger, the
  frontier's continuity check) must hold under either reading for every game
  that offers it.
- A hint must never rest on a fact the player cannot see or mark (`AGENTS.md`
  § "Hint quality bar" rule 6). Under the implicit reading, "the board shows it"
  has to be true at a glance, which is the thing §2 measures.
