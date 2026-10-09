# The brief for pruning one capability

For the agent that prunes a capability's `spec.md` after the rewrite, and the
agent that reviews the cuts. The rewrite kept every rule so that it could be
checked. This pass keeps what is worth keeping.

## The test

A requirement stays if a session about to work on that part of the tree would
want to read it first, or would check its change against it. Ask of each one:
who reads this, and what would they do differently without it?

## What stays

- The rules of the puzzle, and what counts as solved.
- A description format, a params encoding, a preference key, a save field:
  anything a saved game or a shared link depends on.
- What a control does: a gesture, a key, the keypad.
- Everything a hint does and says: its techniques and their order, its
  wording rules, its marks, when it refuses. The hints are why this project
  exists.
- What a difficulty tier means, and what the generator promises of a board.
- A decision about how a game looks that is the game's own.
- A deliberate difference from upstream's behavior.
- A refusal that still binds: a design that was turned down and would be
  proposed again.
- A contract between the engine and a game: a `Game` hook's obligations, a
  shared helper's promise.
- A rule a guard exists to hold, where the rule is the reason for the guard.
- Anything you are unsure of.

## What goes

Each cut is recorded with one of these words.

- `type`: the compiler or the registry already says it of every game ("the
  game implements `Game` and is registered", a move being a discriminated
  union, a hook's signature).
- `declared`: a copy in prose of data the code declares and the engine reads,
  where the copy tells a reader nothing the declaration does not (a preset
  table, a list of palette slots, a list of file names). Keep the rule about
  the data; cut the copy of it. A params or description encoding is not this:
  it is a promise to saved games and stays.
- `collection`: a game restating, for itself, a rule a shared capability
  states for every game, with no departure of its own. Name that capability
  and the requirement, having read it.
- `how`: the way something is built, where only what it does matters to
  anyone (which algorithm builds the path, that a function is pure, which
  field caches what, which module a thing lives in).
- `process`: a rule about how work is done that a guide under `docs/` or
  `AGENTS.md` states. Name the guide and its heading, having read it.
- `port`: a rule about the act of porting from C, which is finished, where
  nothing it says still constrains the code.
- `obsolete`: a rule about something that no longer exists. Check that it is
  gone.
- `duplicate`: another requirement of this spec states it. Name it.
- `particular`: a rule so narrow that the only thing that would ever consult
  it is its own test, and that is not a decision anyone would revisit.

A requirement can lose a sentence and stay. Two short requirements on one
subject can become one, within 500 characters. A scenario that restates its
rule goes, so long as its requirement keeps one.

## What never goes

- A requirement that source or a guide cites by title. List them with
  `node scripts/checks/spec-citations.mjs --list` and keep each with its title
  unchanged.
- A rule the owner decided about what a player sees, hears or reads.
- A rule whose only other home would be a test: a test says what happens, and
  not that it was meant.

## What you write

- `openspec/specs/<capability>/spec.md`, pruned in place. The Purpose is
  brought up to date with what is left.
- `openspec/changes/turn-the-specs-into-a-reference/cuts/<capability>.md`: a
  first line `# Cuts: <capability>`, a line giving the count of requirements
  before and after, then a table of three columns: the requirement (its old
  title) or the sentence cut, the word from the list above, and what holds it
  now or why it is gone, in a few words. One row a cut.

Nothing else. Other agents are pruning the other capabilities in this working
tree at the same moment: no other file, no git command that changes anything,
no gate, no test suite. If something belongs in another capability, say so in
your report and leave it where it is.

## The checks

- `node scripts/checks/spec-census.mjs --file openspec/specs/<capability>/spec.md`
  prints a line on stderr for a requirement over 500 characters or with no
  scenario.
- `npx --no-install openspec validate <capability> --type spec --strict`
- `node scripts/checks/spec-citations.mjs` still passes.

## The review

The reviewer reads the cuts file beside the spec as it was
(`git show <base>:openspec/specs/<capability>/spec.md`) and as it is, and asks
of every cut whether its word is true: that the type does say it, that the
shared requirement named exists and covers this game, that the guide named
says it, that the thing is gone. It restores what should not have gone: a
rule the owner decided, a rule a player would notice broken, a promise to
saved data, a refusal that still binds, anything cited. It does not cut
further. It corrects the spec and the cuts file itself, runs the checks, and
reports what it restored.
