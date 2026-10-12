# The brief for mending what the readers found (task 3.4a)

Given to the agent that takes a batch of games. Written 2026-10-12.

## What this is

The cut of the 57 game specs is made. Each game's ledger
(`openspec/changes/order-and-shrink-the-game-specs/ledger/<game>.md`) has a
`## Found` section: what its writer and reviewer saw that the brief of the cut
forbade them to fix. You go through that section for each of your games and
mend, in `openspec/specs/<game>/spec.md`, what is the spec's to mend. You
edit the spec and the ledger of each game, and nothing else: **no code, test,
guide, help page or engine spec**. Do not commit, run the gate or create a
branch. A shell hook refuses a heredoc or redirect that writes a file: use the
edit tools.

Read first: `AGENTS.md`; `docs/new-game.md` § "What a game's spec holds";
`brief.md` in this change (§ "The three classes", "Form", "The ledger"; its
rule against adding is lifted here as below). Then for each game: its ledger's
`## Found` (and `## Review`, `## Second pass`, `## Third pass`, which may
already have mended an item), its spec whole, and the code each item names.

**Every item is a claim about the code as someone read it. Open the code and
the spec as they stand now before acting on one**; a later pass may have fixed
it, and a line number may have moved.

## What you mend

1. **A sentence, scenario or title the code contradicts**, or that names a
   hook, type or key that does not exist (`validateDesc` on a game that has
   none), or that is true only of an Easy board and says "every". Correct it
   to what the code does.
2. **A promise a link, a save or a stored preference depends on that the spec
   does not state**: above all what a params string that leaves a field out
   decodes to (the tier of a string with no `d`, a flag absent from the short
   form). State it in the `Params` requirement it belongs with, with a
   scenario whose string a test, the code or
   `src/engine/__snapshots__/params-stability.test.ts.snap` has; else give
   the case in words.
3. **What a hand-written function does that a player meets and no
   requirement states**: a hand-written `hintKeepTrack` verdict, an arm of
   `interpretMove`, what Solve answers on a board that loads, the hint's
   refusal on a board that loads, a status-bar sentence. One or two sentences
   joined to the requirement of that subject they belong with, or a short
   requirement of its own with a scenario. Only where a player can reach it:
   check that a board that loads gets there.
4. **A title that names what its body does not state**: retitle. A
   requirement filed under a subject the guide gives to another (which cells
   are flagged is `Rules`, how they are drawn is `Look`): move it only where
   the whole requirement belongs elsewhere; leave one that straddles.
5. **Two requirements of one spec that state the same thing**, where one says
   nothing the other does not: remove the one, moving any scenario that gives
   a case the other lacks.
6. **Form**: a line past the wrap, the word "port" of a game that is no
   longer one, a private function or type name the form rule forbids where a
   plain word says the same.

## What you leave, and report

- Anything that needs code changed: a defect in the game, a stale comment, a
  refusal in the wrong sentence. **These are being fixed by the main session;
  do not restate today's defective behavior as a requirement.** In
  particular leave alone: Flip's, Mosaic's and Undead's too-large refusals;
  Untangle's hint animation; Seismic's and Magnets' size bounds on a loaded
  board; Solo's malformed symmetry code; Boats' ring mark; Mathrax's size-3
  refusal; Subsets' "number under the cursor"; Loopy's grid-build retry
  loop; the generators of Fifteen, Flip and Twiddle ruling out a solved
  board; anything about the secondary button in Inertia, Slide or Untangle.
- A branch no player reaches (a refusal only a hand-built state meets).
- What a declaration states (`targetVerbs.sweep`, a preset table, `prefs`)
  or the collection states. `brief.md`'s rule holds: no copy, and a pointer
  only for a subject that would otherwise say nothing of its ordinary case.
- A requirement that states what a test asserts ("a census SHALL assert").
  Report it; do not rewrite it.
- Anything you are not sure is true after reading the code.

Do not compose a description, a params string, a hint sentence or a status
word: quote what the code or a test has.

## The ledger

Every requirement you change, add or remove needs its row in the ledger's
table, by the title it had at `c86372f4` (`brief.md` § "The ledger";
`tools/cut-check.mjs` refuses otherwise). Where the requirement already has a
row, extend that row's "What happens". Then add a section at the end of the
ledger:

```markdown
## Found, mended

- <the Found item, in a clause>: <what you changed, or "left: " and why>
```

One line for every item of `## Found`, mended or left.

## Check before you report

```sh
node openspec/changes/order-and-shrink-the-game-specs/tools/cut-check.mjs <game> ...
npx openspec validate <game> --type spec --strict     # each game you edited
node scripts/checks/spec-subjects.mjs
node scripts/checks/spec-form.mjs
```

## The report

Under 300 words: games edited with one clause each; **every item you left
that is a defect a player can meet or a question for the owner**, with file
and line; anything in a Found list you found to be false. No narrative.
