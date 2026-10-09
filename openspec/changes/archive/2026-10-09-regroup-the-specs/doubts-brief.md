# The brief for settling a capability's doubtful requirements

For the agent that settles what the pruning left in doubt for a batch of
capabilities, and for the agent that reviews its verdicts. Written 2026-10-09.

## What this is

Every capability's spec was rewritten into short requirements and then pruned
by the criteria of
`openspec/changes/archive/2026-10-09-turn-the-specs-into-a-reference/prune-brief.md`.
That pass was cautious by instruction: where its agent was unsure it kept the
requirement and wrote down the question that would settle it. You answer those
questions, by looking.

Read `prune-brief.md` first. Its test, its list of what stays, its nine words
for a cut and its "What never goes" all stand, and this brief only adds to
them.

## What you are given

- **The entries for each of your capabilities**, in
  `<scratch>/entries/<capability>.md`: the doubts, and the entries of the two
  "belongs in another capability" lists with what the plan of moves made of
  each. An entry marked "Step 3" is yours. The rest are done or declined, and
  are there for context.
- **The specs as they will stand after the moves**, in
  `<scratch>/regrouped-v1/<capability>/spec.md`. Read these and not
  `openspec/specs/`: 161 requirements have changed capability, and five
  capabilities are new (`help-pages`, `testing`, `dealing`, `error-reporting`,
  `border-grid`). A requirement an entry names may now be in another
  capability; find it by its title and name the capability it is in now.
- The source under `src/`, the guides under `docs/`, `AGENTS.md`, the scripts.

`<scratch>` is given in your task.

## The three answers

For each entry, and each requirement it names:

1. **Answerable from the tree.** Most are: is the thing gone, does a guide
   say it, does the shared requirement exist and cover this game, does a
   check stop it. Look, and then cut or keep.
2. **The owner's.** Only where the answer rests on what the owner intends and
   the tree cannot show it, and a wrong guess would cost something. A
   question that merely says "does the owner want" is usually a decision
   about internal form, which is yours: decide it. The owner will be asked
   few questions in all, so each must be worth their time, and comes with what
   each answer would do and which you recommend.
3. **Neither**: it stays, and you say in a line why the doubt does not hold.

## What decides a cut

- **Who reads this, and what would they do differently without it?** A rule a
  session would read before working on that part of the tree, or check a
  change against, stays.
- **A test is not a home.** Do not cut a rule because a test holds it. A test
  says what happens and not that it was meant. A table of what a test holds
  was found right about half the time at a strict reading.
- **`collection` needs the shared requirement in front of you.** Name its
  capability and title, having read it in the regrouped specs, and say that
  it covers this game with no departure. Where the game's requirement also
  holds something of its own, `reword` it to keep that and drop the rest.
  The commonest case: a game's "a hint is refused on a solved or mistaken
  board" restates `engine-hints`, "The midend SHALL refuse a hint on a
  finished or wrong board before asking the game".
- **`process` needs the guide in front of you.** Name the file and heading.
  If the guide does not say it and the rule is worth keeping, the rule stays
  in the spec, or you write a `guide` entry (below) with the cut.
- **`obsolete` needs the absence checked.** Say what you searched for.
- **Never cut**: a requirement source or a guide cites by title
  (`node scripts/checks/spec-citations.mjs --list`); what a control does, a
  description or params encoding, a preference key or a save field; a hint's
  techniques, order, words and marks; a rule the owner decided about what a
  player sees.
- **Do not add a rule to a shared capability from a game's file.** Where a
  game restates something a shared capability ought to say and does not, the
  game keeps it. Write a `note`.
- **When unsure after looking, keep.** This pass has no successor.

## What you write

One file a capability in your batch, and nothing else:
`openspec/changes/regroup-the-specs/verdicts/<capability>.md`, named for the
capability whose entries it settles. It starts with a line
`# Verdicts: <capability>` and then holds entries, each a `## ` heading in
exactly one of these forms, where the capability in backticks is the one the
requirement is in now:

```
## cut `<capability>`: <the requirement's title, exactly>

<word>: <what holds the rule now, or why it is gone, as one who checked>

## reword `<capability>`: <title>

<what changed and why>

### Requirement: <title, the same unless it must change>

<the requirement as it will stand, whole, with every scenario it keeps>

## edit `<capability>`: <title>

<why>

from: <a run of words on one line, found exactly once in the requirement>
to: <what replaces it>

## keep `<capability>`: <title>

<why the doubt does not hold, in a line or two>

## owner `<capability>`: <title>

<the question; what each answer would do; which you recommend and why>

## guide `docs/<file>.md` § "<heading>"

<a paragraph to add under that heading, for a rule that leaves the spec
because it is how work is done and the guide does not yet say it>

## note <anything>

<something another capability or the code needs that you may not write:
a shared requirement that is missing, code that looks wrong, a stale guide>
```

- Every requirement an entry of yours names gets exactly one of `cut`,
  `reword`, `edit`, `keep` or `owner`. A doubt that names several gets one
  entry for each.
- A reworded requirement is at most 500 characters before its first scenario
  and keeps at least one scenario; no date, no change id, no count of games.
- Do not touch a requirement no entry names, however much you would like to.

Other agents are settling the other capabilities at the same moment. Write no
other file. Run no git command that changes anything, no gate, no test suite.

## The check

`node <scratch>/check-verdicts.mjs openspec/changes/regroup-the-specs/verdicts/<capability>.md`
checks the headings, that each title exists in the capability named, and a
reworded requirement's length and scenario. Run it until it passes.

## The review

The reviewer reads each verdict file of the batch beside the entries and the
regrouped spec, and checks every `cut` and `reword` as if it had to defend
the cut to someone who needed the rule: that the shared requirement named
exists and does cover this game, that the guide named does say it, that the
thing is gone, that a reworded requirement lost no rule and changed none
(read old against new, word for word). It checks every `owner` entry for a
question the tree answers, and settles those. It restores what should not
have gone by changing the entry to `keep` with the reason, corrects the file
itself, runs the check, and reports what it changed. It does not cut what the
first agent kept.
