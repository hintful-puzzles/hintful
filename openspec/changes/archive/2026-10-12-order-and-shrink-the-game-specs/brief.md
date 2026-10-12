# The brief for cutting a game's spec to the rule

Given to the agent that cuts a batch of game specs, and to the one that
reviews it. Written 2026-10-12.

## What this is

`docs/new-game.md` § "What a game's spec holds" says a game's spec holds no
second copy of what the game declares to the engine, of a rule of the
collection, or of what the `Game` type says of every game. The 57 specs
predate that rule and each restates about a quarter of itself. You cut your
games' specs to the rule, so that each reads as the example a new game's
author copies. Nothing a player sees changes. You edit
`openspec/specs/<game>/spec.md` in place and write one ledger per game, and
nothing else: no code, test, guide, help page or engine spec.

Read first: `AGENTS.md`; `docs/new-game.md` § "What a game's spec holds";
the `rules: specs:` list of `openspec/config.yaml`; in
`openspec/changes/order-and-shrink-the-game-specs/`, `design.md` § "The
sample" and § "The owner's answer: C, amended", and the last two sections of
each ledger in `sample/` if that directory is still there (what the first
draft did badly). Then, for each game: its spec whole, `src/games/<game>/`
(not its tests, except to find the test that holds a promise), and
`help/games/<game>.md`.

Do not commit, do not run the gate, do not create a branch, and write nothing
outside the two files per game. A shell hook refuses a heredoc or a redirect
that writes a file: edit with the edit tools, and check with `grep`, `git
show` and `node -e`. A citation in `sample/` or in another ledger is not
verified until you have opened the requirement it names.

## The three classes

Put every requirement, and every sentence and scenario inside one, in a
class:

1. **States what the code cannot.** It stays. What a hand-written function
   does (`interpretMove`, a codec written out as functions, the round a
   solver runs its deductions in); a hint technique by what it concludes and
   from what; the order techniques are tried in where a loop and not
   `hintRungs` fixes it; a refusal by `validateParams` and its reason; the
   description format as the parser reads it; what a tier means for this
   game; a promise a save or a shared link depends on that a declaration does
   not make (what a missing field decodes to); a departure from a rule of the
   collection.
2. **Restates a declaration** the engine consumes: the field list of
   `paramsCodec` or `paramConfig` (letters, order, bounds), the preset table,
   `prefs`, `targetVerbs` and `requestKeys` (which key or button applies
   which verb), the hint's legend (`hintMarks`), the palette (`colors`),
   `animLength`, `flashLength`. It goes. A codec, key map or preset list
   written out by hand is not a declaration: it stays.
3. **Restates a rule of the collection.** It would read the same with another
   game's name in it, and an engine capability states it once ("provides an
   explained deduction hint", "flags mistakes against its unique solution",
   "generates boards uniquely solvable at the requested difficulty", "a hint
   is refused on a board with a mistake"). It goes.

The engine capabilities, each a `spec.md` under `openspec/specs/`:
`ts-engine`, `engine-params`, `engine-difficulty`, `engine-hints`,
`engine-input`, `engine-notes`, `engine-candidate-hints`, `engine-colors`,
`engine-drawing`, `engine-helpers`, `border-grid`, `latin-solver`, `dealing`,
`help-pages`. They are 640 KB together: do not read them through. List a
capability's titles (`grep -n '^### Requirement' openspec/specs/<cap>/spec.md`)
and read the requirement you mean to lean on, whole, scenarios included.

## The three rules of the cut

**1. The engine says it first.** Remove something as a copy only when the
declaration or the shared requirement you name states ALL of it. Open the
requirement and compare clause by clause; for a declaration, open the code
and find the field. "Roughly covered" is not covered. The traps the first
draft fell in:

- The shared requirement states it only by a parenthesis, or by a scenario
  set in another game, or implies it from two requirements in two files:
  **not stated**. Keep the sentence, and write an engine request (below).
- The shared requirement hands the fact back to the game: `engine-params`
  says a missing difficulty decodes to "the tier the game's spec gives", so
  the game's sentence saying which tier is load-bearing and stays.
- The "copy" is the only antecedent of the sentences after it. Reword those
  so they stand alone, then cut.
- A requirement that restates `hintRungs` as the order techniques are tried
  in: check what fixes the order. If a hand-written loop does, it stays.

**2. No subject is left hollow.** `Rules`, `Params`, `Description` and
`Controls` are owed by every game, `Hint` by a game with `hint`, `Status bar`
by one with `statusbarText`, `Generation` by one with `difficulty`
(`node scripts/checks/spec-subjects.mjs` holds this). Where everything a game
would say under an owed subject is the collection's or a declaration, the
subject keeps one requirement that sends the reader on: it says the game
takes this from the shared rule or the declaration, names it (the capability
and the requirement's title in quotes, or the `Game` hook), and states every
departure the game makes, or that it makes none. Its scenario gives one real
case of this game. More generally: after your cut, a reader of one subject of
this spec alone must be able to tell what the game does there or where it is
said. If a subject kept only a corner case, add the sentence that says where
the ordinary case is stated. A subject the game does not owe may go entirely.

**A pointer is for that case only.** Everywhere else a copy is removed and
the ledger says where it is stated. A sentence that reads "X is the
collection's (`cap`, "Title")" inside a subject that already says plenty of
the game's own is the copy with a citation attached: it goes. A subject has
at most one pointer for each concern. A cut that swaps each copy for a
pointer of the same length has cut nothing.

**3. Reword, do not only delete.**

- A kept sentence keeps its qualifier. If "refuses Normal below 12 squares"
  binds generation only and the sentence that said so is going, the kept
  sentence says so itself.
- A title says what its body now says. Retitle when the body no longer
  matches; keep the subject prefix, and keep the title when it still fits.
- A copied clause inside a sentence that also says something of the game's
  own is reworded out, leaving the game's own.
- One or two orphan sentences join the requirement of the same subject they
  belong with, or stand as a short requirement of their own under a title
  written for them. Never leave a requirement that reads as a fragment.
- The `## Purpose` paragraph is corrected where it names something the spec
  no longer holds.
- A requirement whose scenarios all go keeps or gains one scenario that gives
  a case its sentence does not.
- A pointer requirement names the declaration and does not list what it
  holds (no letters, bounds or key list; it may say in a clause what the
  parameters are): it states the departures and the promises the declaration
  cannot make. One pointer may cover two concerns of one subject (a hint's
  marks and its keep-track verdict).
- What a missing field decodes to stays even where the declaration holds it
  (`whenAbsent`, a choice's default): an old link depends on it, and it is
  the one thing a reader of the params string cannot see.
- A scenario may move to the requirement that now holds its rule.
- A preference's key and the order of its choices are what a stored
  preference depends on. `prefs` declares them, and they still stay unless
  the ledger names a test that pins the key string: what goes is the
  preference's label and its description of itself.
- A declaration speaks the engine's words (the first member of a pair, a
  verb's `does` string) and the spec may speak the game's (blue and red).
  When a copied sentence was also the only place the two were tied together,
  keep the tie, in the requirement it belongs to.
- A copy whose scenario is false of the code is dropped like any copy, and
  the falsehood goes under `## Found`.

What you do not do: restate a rule better than it was, add requirements for
behavior the spec never covered, or change what a kept requirement claims.
If the spec is wrong about the code or silent on something it owes, write it
under `## Found` in the ledger and leave it. The one exception is a pointer
requirement rule 2 calls for.

## Form

- A requirement is SHALL sentences in the present tense, at most 500
  characters before its first scenario (the check below counts), at least
  one scenario. No date, change id, count of games, history, test file name
  or private function name in a spec. A `Game` hook, an exported engine
  helper, a params letter, a key, a sentence the player reads may be named.
  File paths and line numbers go in the ledger, never the spec.
- Cite an engine requirement as `` `capability`, "Its title" `` with the
  title copied exactly (a prefix that ends at a word is allowed).
- Do not compose a new description or params string, a hint sentence or a
  status word. A scenario you keep keeps its strings; a scenario you write
  uses a string the code, a test of the game or
  `src/engine/__snapshots__/params-stability.test.ts.snap` has, and where
  there is none it gives the case in words (a 3×3 board at Normal).
- The requirements stay in subject order; a requirement you add goes among
  its subject's.
- Keep the spec's line wrapping style. Change no line you have no reason to.

## The ledger

`openspec/changes/order-and-shrink-the-game-specs/ledger/<game>.md`:

```markdown
# <game>

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Params: Foo writes its difficulty as `de` or `dt` | removed | `choice(…, "d", …)` in `paramsCodec`, `src/games/foo/state.ts:132`; `src/engine/params-stability.test.ts` holds `7x7de` |
| Hint: Foo provides an explained hint | cut to its third sentence; retitled "Hint: Foo's hint starts from the player's marks"; scenario "A hint is offered" dropped | `engine-hints`, "The solver and the hint are two projections of one deduction engine" |
| Controls: Foo takes its input from the shared border grid | added (rule 2) | |

## Kept, and why

## Engine requests

## Found
```

- **One row for every requirement you removed or changed in any way**, its
  first cell the title exactly as it stood before you started (copy it from
  `git show c86372f4:openspec/specs/<game>/spec.md`), and one row for each
  requirement you added, by its new title. No row for an untouched one. A new
  title must appear in the row of the requirement it came from: a pointer
  that replaces a requirement has its row under the old title, and "added"
  is for one that came from nothing. A change to the Purpose is a line above
  the table.
- "What happens" says what went sentence by sentence and scenario by
  scenario. A scenario that moves to another requirement is written "moves,
  unchanged, to …", and the requirement that only gains something has a row
  with an empty third cell. "Where it is stated instead" names, for each thing that went, the
  declaration (hook, file and line) or the shared requirement (capability and
  exact title). Where a removed requirement held the only spec statement of a
  promise to a player's data (a save, a game ID or a link format), name the
  test that holds it now, or keep the requirement.
- `## Kept, and why`: each requirement or sentence that looks like a copy and
  stays, with the clause the shared statement lacks. Short.
- `## Engine requests`: each sentence you kept only because no engine
  capability states all of it and that would read the same with another
  game's name: the sentence, the requirement it sits in, the capability it
  belongs in, and the engine code that does it. These are gathered across
  batches and given a home once.
- `## Found`: the spec contradicting the code, a subject the spec owes and
  never stated, a defect in the game. File and line. Fix nothing.
- "None." under a heading with nothing to say.

## Check before you report

```sh
node openspec/changes/order-and-shrink-the-game-specs/tools/cut-check.mjs <game> ...
npx openspec validate <game> --type spec --strict     # each game
node scripts/checks/spec-subjects.mjs
node scripts/checks/spec-form.mjs
```

`cut-check` holds the ledger to the diff (a row per changed requirement, the
500 characters, a scenario each) and prints the before and after sizes. It
cannot tell that a "where it is stated instead" is true. Then read each of
your specs whole, once, as a session that has never seen the game: does every
subject say what the game does there or where to look, does every sentence
stand without the ones that went?

The sample found a quarter to a third of a spec's bytes go. A spec of a
search game with few declarations loses less. A cut far outside 10% to 40%
is worth a second look in either direction, and is not a target.

## The reviewer

You have the same reading list and the writer's two files per game, and not
the writer's reasoning. `git diff c86372f4 -- openspec/specs/<game>/spec.md`
is the cut.

- **Every row**: open the thing named in "Where it is stated instead" and
  compare it clause by clause with what went. A declaration: find the field
  in the code. A shared requirement: read it whole. Where it does not state
  all of what went, restore the sentence (reworded to stand) and add an
  engine request.
- **Every kept requirement**: is a sentence or scenario left that is a copy
  by the three classes? Cut it, with a row.
- **Each subject, read alone**: hollow, a fragment, a dangling "it" or
  "then", a title that no longer fits, a lost qualifier? Mend it.
- **Each new sentence** (a pointer requirement, a rewording): is it true of
  the code, is each cited title exact, is each quoted string real?
- Run the four checks above.

Make the corrections yourself, in the spec and the ledger, and list each
under a `## Review` heading at the end of the ledger: what you changed and
why, and what you checked and found sound, with counts (rows read, rows
corrected).

## The report

Under 250 words: per game, the `cut-check` line; the engine requests, one
line each; anything under `## Found` that is a defect a player meets. No
narrative of how you worked.
