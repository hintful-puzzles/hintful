# The brief for rewriting one capability

For the agent that rewrites a capability's `spec.md`, and the agent that
reviews the rewrite. `design.md` has the reasons; this is what to do. Worked
examples: `openspec/specs/engine-difficulty/spec.md` beside
`ledgers/engine-difficulty.md`, and `pilot/ascent.reference.md` beside
`ledgers/ascent.reference.md`.

## What the rewrite is

Every rule the spec holds is kept, stated once, in a requirement short enough
for openspec's validator. Nothing that is required changes. What leaves is
what is not a rule.

- **A requirement's body is at most 500 characters** before its first scenario,
  as the tool counts them. A long requirement becomes several short ones that
  sit together, each stating one behavior, each with a title that says its
  rule. Do not merge unrelated rules to save a heading.
- **Every requirement keeps at least one scenario.** Keep an old scenario
  where it gives a case its rule's sentence does not; drop one that only
  restates the rule or says that a named test fails. Where a split leaves a
  requirement with none, write a short one that is a case of the rule, and
  check it against the code: a scenario that asserts something new must be
  true.
- **A requirement holds the rule, in the present tense, in `SHALL`
  sentences**, with at most one sentence or clause of reason where the rule
  would look arbitrary without it.
- **What leaves:** how a decision was reached, what the rule replaced, what
  upstream did, a count or any measured figure, a date, a change id, the name
  of a test file or a private function, and the argument against a refused
  alternative. A refusal that still binds stays as one `SHALL NOT`.
- **A name stays when the name is the contract**: a `Game` hook, an exported
  engine helper, a params letter, a preference key, a sentence the player
  reads.
- **Rules that overlap are reconciled.** Where a later requirement superseded
  part of an earlier one, state what holds now, once.
- **A rule that is false of the code today is corrected to what the code
  does**, with an `untrue:` row in the ledger saying what you read. Check the
  code where a rule names a number, a size, a list or a name. Where the code
  looks wrong and the spec right, change nothing and report it.
- **The Purpose section** is kept, cut to what the capability is, with no
  history.
- American spelling. No em dash where a comma or a colon does. No dates.

## Where a rewrite goes wrong

Each of these happened in the pilot and was caught only by the review.

- A qualifier drops: "only", "at every tier", "by two cells", "in both
  schemes", "with its reason". Carry every one.
- A condition falls off when a requirement is split: the second half's "when"
  was stated in the first half. Restate it.
- `MAY` appears. It turns an obligation into a permission; do not use it.
- A sentence that hung off one case becomes a rule for every case ("with a
  right-click cycling the two" was only for the case before the comma).
- A prohibition is filed as a reason and dropped ("X is expressly not the
  remedy" is a `SHALL NOT`).
- A rule stated only inside a paragraph of history is lost with the history.
  Read the history for rules before dropping it.
- A positive rewording of a negative rule says more than the rule did.
- "Refused by `validateParams`" where the engine refuses it, or the reverse.

## The ledger

One file, `ledgers/<capability>.md` in this change's directory, in the format
the header of `scripts/checks/spec-ledger.mjs` gives. `Base:` is the commit
you are told. One `##` section for every requirement the spec had at that
commit, titled exactly as it was, and under it a two-column table: the rule,
briefly, and where it went. Group rules that went to one place into one row;
give a row of its own to everything dropped and everything found untrue. Do
not use `|` or `;` inside a cell except `;` between two destinations.

Destinations: `spec: <new title>`, `spec <capability>: <title>` for a rule
another capability's requirement already states, `guide: <path> § "<Heading>"`
only after opening the guide and reading that the section says it,
`held: <path> "<text in that file>"`, `history`, `figure`, `reason`,
`untrue: <what the code does, and where>`.

## How to work

1. Read the old spec whole: `git show <base>:openspec/specs/<capability>/spec.md`.
2. Write the new `openspec/specs/<capability>/spec.md`. For a long spec, write
   it in parts, in the old order, so related requirements stay together.
3. Write the ledger.
4. Run, and fix until all three are clean:
   - `node scripts/checks/spec-census.mjs --file openspec/specs/<capability>/spec.md`
     prints a line on stderr for each requirement over 500 characters or with
     no scenario.
   - `node scripts/checks/spec-ledger.mjs openspec/changes/turn-the-specs-into-a-reference/ledgers/<capability>.md`
   - `npx --no-install openspec validate <capability> --type spec --strict`
5. Re-read your new spec against the list above.

## What not to touch

Edit only the capability's `spec.md` and its ledger. No other spec, no guide,
no source file, no script, and no git command that changes anything: other
agents are rewriting the other capabilities in this working tree at the same
moment, and one commit is made at the end. Do not move a requirement to
another capability; if one is misfiled, keep it and say so in your report. A
reason a guide lacks and a session needs is reported, not written.

## The review

The reviewer is given the old spec, the new one and the ledger, and looks for
what the list above describes: a rule lost, weakened, strengthened or changed
in meaning; a rule or a scenario that asserts something the old text did not;
a ledger row whose destination does not hold the rule; an `untrue:` claim
that the code does not bear out. It goes through the old spec sentence by
sentence, bodies and scenarios, and then through the new one for anything
with no source. It corrects the spec and the ledger itself, runs the three
checks again, and reports what it changed.
