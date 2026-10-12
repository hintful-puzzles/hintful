# The brief for the third pass: removing what the last engine round states

Given, with a list of games, to the agent that makes the pass. Written
2026-10-12.

## What this is

`brief.md` in this directory is the rule for the cut of the game specs: read
it whole first, with `AGENTS.md`. Every game spec has been cut and reviewed
under it. Each writer kept the sentences that restated a rule of the
collection which no engine capability yet stated, and listed them under
`## Engine requests` in `ledger/<game>.md`. Those rules now have a home: the
third engine round, recorded in `ledger/_engine.md` under "Third round: the
rest" and "Third round: hints and colors", each with a review section that
corrects it ("Review of the third round: …"). The games still hold their
copies. You remove them from your games, and you finish two consistency
rules. You edit `openspec/specs/<game>/spec.md` and `ledger/<game>.md` for
your games and nothing else: no engine spec, no code. Do not commit or run
the gate. Edit with the edit tools: a shell hook refuses scripted writes.
Other agents are doing the same for other games.

## 1. Remove what the third round states

Read both third-round sections of `ledger/_engine.md` and BOTH review
sections. Each table's last column names the games that keep a sentence and
the requirement in each game's spec that holds it; the review section adds
games, removes games, and names clauses that MUST STAY in a game (a
departure, a case the engine requirement does not make). The review's word
is the later one. "Not written" lists the requests left as the games' own:
those sentences stay.

For each of your games, for each row that names it, and for each engine
request in the game's own ledger:

- open the engine requirement and the game's sentence, and compare clause by
  clause, as rule 1 of `brief.md` asks. Where the engine requirement states
  all of the sentence, cut it. Where the game's sentence says more, keep
  only the more, reworded to stand. Where the review says a clause stays, it
  stays.
- cut it as a plain removal. Do not leave a citation in its place, unless
  the subject is owed and would otherwise say nothing of its ordinary case
  (`brief.md`, "A pointer is for that case only").
- a requirement left with one orphan sentence joins the requirement it
  belongs with or is retitled for what it now says; one left with no
  scenario of its own gains or keeps a case of this game; a scenario that
  only restated the cut sentence goes with it.

Also grep your games' specs for the same rules in other words: the tables
were built from the ledgers and the reviews found games they missed.

## 2. One rule for two sentences the passes treated unevenly

- **"What a dealt board promises is the collection's … with no departure"**
  (in `Generation`, citing `engine-difficulty`), and its like in other
  subjects (`grep -n 'no departure\|departs from n' openspec/specs/<game>/spec.md`).
  Where the subject already says what this game's tiers mean, or anything
  else of the game's own that tells a reader what the game does there, the
  sentence goes. It stays only as the one pointer of an owed subject that
  would otherwise say nothing of its ordinary case.
- **"What a pasted game ID opens as SHALL follow from that (…)"**, citing
  `engine-difficulty` for how a loaded board takes its tier: it is the
  collection's rule with a citation attached and goes, in every game. A
  scenario about a pasted ID stays only under a sentence that says something
  of this game's own about it (which boards count as which tier is the
  game's own).

## 3. Read what is left

For each spec you touched, read each subject alone. Every owed subject
(`Rules`, `Params`, `Description`, `Controls`; `Hint`, `Status bar`,
`Generation` where the game has them: `node scripts/checks/spec-subjects.mjs`
holds presence) still says what the game does there or where it is said; no
fragment, no dangling "it" or "the search" with no antecedent in the
requirement; every title fits its body; the Purpose names nothing the spec
no longer holds.

## The ledger

For each requirement you change: correct its row in the table (the first
cell is the title as it stood at `c86372f4`; a requirement that had no row
gains one), naming the engine requirement that now states what went, by
capability and exact title. Under `## Engine requests`, mark each request
"answered: `capability`, "Title"" or "left the game's own:" with the reason
the engine ledger gives. Append `## Third pass` with what you changed and
counts (rows of the engine tables that named the game, sentences cut,
clauses kept and why).

## Check

```sh
node openspec/changes/order-and-shrink-the-game-specs/tools/cut-check.mjs <game> ...
npx openspec validate <game> --type spec --strict     # each game
node scripts/checks/spec-subjects.mjs
node scripts/checks/spec-form.mjs
```

A failure of the last two that names another game's spec is not yours.

## The report

Under 200 words: the `cut-check` line per game; per game the count of
sentences cut and of clauses kept; anything the engine requirement turned
out not to state (so the sentence stayed), by title; anything you were
unsure of.
