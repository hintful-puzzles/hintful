# Design

## What a rewrite may and may not do

A guide holds only what the source cannot say: a rule, a decision, a reason
or a trap (`AGENTS.md`, "What this is"). The rewrite keeps every one of them
and changes how they are said:

- **Cut** restatement (the same rule in two sections or two guides: keep it
  where it binds, cite it elsewhere), history ("used to", "was renamed",
  incident narratives beyond the shape to look for), census (a count or list
  of games that a query would give), and prose that describes what the code
  plainly shows.
- **Correct** every claim about the code against the tree: a file, export,
  flag or behavior a sentence names must exist and do what it says, or the
  sentence goes.
- **Keep** each `##`/`###` heading unless a new one is plainly better.
  Citations are by heading text across the tree; a renamed heading repoints
  every citation in the same commit (`node scripts/checks/guide-sections.mjs`
  finds them).
- **Never** drop a rule because it is awkward to say, merge two rules into
  one that says less, or add a rule nobody decided. A rule the writer thinks
  wrong is raised with the reason, not edited out.

## How a guide is rewritten

One guide at a time, smallest first so the voice settles on short guides:

1. A **writer** agent (general-purpose, briefed as a technical writer)
   rewrites the guide in place, reading the code it describes, and reports
   every rule it moved, merged or could not verify.
2. A **reviewer** agent that did not write it reads the old and new text
   side by side and the code, and lists any rule lost, claim false, or
   citation broken.
3. This session settles the review, runs the guide checks
   (`guide-sections`, `spelling`, `change-citations`, `spec-citations`), and
   commits the guide alone, so each is one reviewable diff.

The writer gets the rules for a guide by citation, not paraphrase: `AGENTS.md`
("What this is", "Read the guide before you touch"), `docs/method.md`, and
the guide's own opening. Owner-facing prose style is the guides' existing
one: present tense, short declarative sentences, American spelling, no
headings in `#`/`##` beyond the guide's own structure.

## The engine catalog's index

Its opening is one table row per module, about 106 modules. Each row's left
cell is the section heading, so the row cannot shrink without the heading.
The rewrite decides between two shapes, by measuring both:

- **Shorter rows**: one cell per module, the heading alone, with "read it
  when" moved into each section's first line.
- **A catalog per area**: the table lists areas (board, solving, hints,
  drawing, input, testing), and each area's section opens with its modules'
  rows; `guide-sections` would then need to accept a table per `##`.

The first keeps the tool as it is and is preferred if it leaves at least a
quarter of the budget free.
