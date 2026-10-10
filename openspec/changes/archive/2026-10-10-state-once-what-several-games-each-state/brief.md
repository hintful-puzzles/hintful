# The brief for stating a rule once

For the agent that settles one family of rules, and for the agent that
reviews what it wrote. Written 2026-10-10.

## What this is

Several games' specs each state a rule that is true of every game, or of the
whole family the game belongs to, and no shared capability states it. The
archived change `openspec/changes/archive/2026-10-09-regroup-the-specs/` found
them: its `found.md`, § "A rule several games each state, with no shared
requirement" and § "A shared requirement that reads wider or narrower than the
code", and the `note` entries of the `verdicts/<capability>.md` files those
sections name. Read both sections and the notes for your family first. They
were true on 2026-10-09 and the tree has moved since: several untiered games
gained a tier, and specs were edited. A note is where to look, never what is
so.

You turn each rule of your family into one requirement of the shared
capability a session would look in, and you shorten or cut each game's copy
to what is the game's own. Nothing a player sees changes, and no code changes.

Read `openspec/config.yaml` (the rules for `specs`) and
`openspec/changes/archive/2026-10-09-turn-the-specs-into-a-reference/prune-brief.md`
(what stays in a spec, and "What never goes").

## For each rule

1. **Who states it today.** Search `openspec/specs/` for the rule's content
   by more than one wording, and read each hit. The notes named a few games;
   the search usually finds more. A rule only one game states is not shared:
   leave it and say so in a `not-shared` entry.
2. **Who it is true of, from the code.** Name the population (every game;
   every game on the candidate walk; every member of the note-taking cell;
   every game with `X`) and how the code makes it true: the engine function
   that does it for every member, or the cross-game test that walks them.
   Derive the members from the code (who calls the helper, who declares the
   hook), not from a list in a spec or a guide. Where the engine does it, the
   rule is the engine's. Where each game does it by its own code, look harder:
   find a member it is false of.
3. **Decide.** True of the whole population: one shared requirement. False of
   one or two members for a reason: the shared requirement names the
   departure, in the form "A game whose … SHALL …" where that can be said
   without naming a game, and by the game's name where it cannot. True of
   only some games with no line that divides them: `not-shared`, with the
   reason, and the games keep theirs.
4. **Write the shared requirement**, or correct the one that exists. Look
   first for a requirement of that capability that already covers the
   subject: then it is a `reword` or an `edit` of that one, never an `add`
   beside it. An `add` is for a subject the capability does not have.
5. **Shorten each game's copy.** Remove the sentence and the scenario that
   only restate the shared rule. Keep everything that is the game's own: the
   names of its keys, a departure, a number, a sentence a player reads. A
   requirement left with nothing of its own is a `cut`. One left with a rule
   but no scenario keeps the scenario or gains one about what remains; do not
   leave a requirement without a scenario.

## What decides

- **The code decides what is true, and you checked it.** Every entry says
  what you read: the file and the function. "The engine does this for every
  member" names the function.
- **Do not widen a rule to cover what the code does not do.** A shared
  requirement that reads true of eleven games and false of one is the defect
  this change exists to remove.
- **A shared requirement states the rule, not its history.** No date, no
  change id, no count of games, no "each game used to". At most 500
  characters before its first scenario; a longer rule is two requirements.
  It names a `Game` hook, an exported helper, a params letter or a sentence
  a player reads, never a test file or a private function. A scenario gives
  a case the sentence does not.
- **Never cut or retitle a requirement that source or a guide cites by
  title** without saying so: `node scripts/checks/spec-citations.mjs --list`
  prints them. Where a cited requirement must be retitled, the reason of your
  entry names the citing file.
- **Keep, when unsure after looking.** A game's sentence that says a little
  more than the shared rule stays, shortened to the little more.
- **Something you find that is not yours** (a defect in code, a stale guide
  line, a rule of another family) is a `note`. Do not act on it.

## What you write

One file and nothing else:
`openspec/changes/state-once-what-several-games-each-state/rules/<family>.md`,
with the family name your task gives. It starts with `# Rules: <family>` and
holds entries, each a `## ` heading in exactly one of these forms. The
capability is in backticks; the title is the requirement's, exactly.

````
## add `<capability>`

<Which rule this is, the population it is true of, and what in the code
makes it so. Then, optionally, on a line of its own:>
after: <the title of the requirement of that capability it should follow>

### Requirement: <title>

<the requirement, whole, with its scenarios>

## reword `<capability>`: <title>

<what changed and why, and what you read>

### Requirement: <the title, the same unless it must change>

<the requirement as it will stand, whole, with every scenario it keeps>

## edit `<capability>`: <title>

<why; for a game's copy, the shared requirement that now holds the rule, as
`capability`, "title">

from: <a run of the requirement's words, found exactly once in it>
to: <what replaces it; empty to remove the run>

## drop-scenario `<capability>`: <title>

<why>

scenario: <the scenario's name, exactly>

## cut `<capability>`: <title>

<what holds the rule now, as `capability`, "title", written as one who
checked. This text becomes the delta's reason.>

## keep `<capability>`: <title>

<a game's copy that looks like the shared rule and stays: what it says that
the shared requirement does not>

## not-shared <the rule in a few words>

<why nothing is shared: who it is false of, or that one game states it>

## note <anything>

<something another family, the code or a guide needs>
````

- **Prefer `edit` and `drop-scenario` to `reword` for a game's copy.**
  Another agent may be shortening the same requirement for another rule, and
  two edits of different sentences compose where two rewordings collide. An
  `edit`'s `from:` may run across line breaks of the spec (write it on one
  line, or let it wrap; it is matched with any whitespace), must lie within
  one paragraph or one bullet, and the paragraph is rewrapped. Several
  `from:`/`to:` pairs may follow one heading. Removing a whole sentence is an
  `edit` with an empty `to:`. Take the least that leaves good prose: check
  that what remains still reads as a sentence, with its capital and its full
  stop.
- A `reword` or a `cut` of a requirement stands alone: no other entry may
  name that requirement.
- A game's requirement whose title says what you removed ("… reproducibly")
  wants a `reword` with the new title.
- The reason of every `edit`, `drop-scenario` and `cut` of a game's copy
  names the shared requirement by capability and title.

Other agents are settling the other families at the same moment. Write no
other file. Run no git command that changes anything, no gate and no test
suite; a single test file run to check a fact about the code is fine, under
`nice`.

## The check

`node <build> --check openspec/changes/state-once-what-several-games-each-state/rules/<family>.md --list --out <dir>`

`<build>` and `<dir>` are given in your task. It applies your entries to the
specs, checks each title, each `from:`, each requirement's length and
scenarios, and writes the specs as they would stand to `<dir>`. Run it until
it passes, then read your changed requirements in `<dir>` (compare with
`diff -r openspec/specs <dir>`, which also lists the capabilities you did not
touch as "Only in"): the rewrapped paragraphs, and whether each game's
requirement still reads whole.

## The review

The reviewer reads the rules file beside `openspec/specs/` and the code, as
one who would have to defend each line to a session that relied on it:

- **Each shared requirement, against the code.** Is it true of every member
  of the population it names? Derive the population again, independently,
  and look for the member it is false of. Is anything in it wider than the
  code, or narrower? Is it in the capability a session would read before the
  work the rule binds, and does that capability already say it elsewhere?
- **Each edit, drop, reword and cut of a game's copy, old against new.** Did
  the game lose something the shared requirement does not say: a key's name,
  a number, a departure, a case? Does what remains read whole?
- **Each `not-shared` and `keep`**: does the reason hold?
- **The form**: `openspec/config.yaml`'s rules for `specs`.

It corrects the file itself, runs the check, reads the result in `<dir>`,
and reports what it changed and why. It restores what should not have gone.
It does not add a rule the first agent did not propose; that is a `note`.
