# The writer's brief

What each technical-writer agent of this change is given, so every guide is
rewritten to the same rules. `<guide>` is the one guide it rewrites.

You are a technical writer rewriting one guide in this repository:
`docs/<guide>`. It is one of 19 guides being rewritten one at a time
(`openspec/changes/rewrite-the-guides/`). Other writers work on other guides
at the same time: touch nothing but your own guide.

## Read first (follow these; do not paraphrase them)

- `AGENTS.md`: "What this is", "Method", "Code" (American spelling), "Read
  the guide before you touch".
- `openspec/changes/rewrite-the-guides/design.md` § "What a rewrite may and
  may not do". This binds you.
- `docs/method.md`, already rewritten: its voice is the model.
- `scripts/checks/guide-sections.mjs`'s header: the structural contract (an
  opening with a `## Sections` table naming every `##`/`###` heading, the
  opening within 12,000 bytes, citations by heading text).
- The spec the guide rests on, named in its opening.

## The job

Rewrite the guide in place so a session reading its opening and one section
gets every rule, reason and trap with the least reading.

- **Keep every rule, decision, reason and trap. Say each once.** Merge only
  statements that are genuinely the same rule. Keep small qualifiers that set
  a rule's scope ("unasked", "inherited that way", "on a board below
  Unreasonable"): a reviewer counts a dropped qualifier as a changed rule.
- **Cut** restatement (keep a rule where it binds; cite it elsewhere),
  history and incident narrative beyond the shape to look for, census (a
  count or list a query would give), and prose that only restates the code.
- **A guide points; the code details** (the owner's rule). Keep the map:
  what matters, where it lives, why. Cut detail a reader gets by opening the
  file the guide points to: lists of what a function takes or owns, exact
  orders, internal names, figures and examples that only illustrate.
- **A detail found stale is deleted, not corrected** (the owner's rule):
  going stale shows it was too deep and will keep changing. Leave a pointer
  to the code if the reader needs one. A stale rule, decision, reason or trap
  is not a detail: correct it and report it.
- **Verify every claim that survives** against the tree. Keep one you cannot
  verify and report it.
- **Keep headings.** They are cited by text from code and other docs. Rename
  one only if it is plainly wrong, then repoint every citation
  (`git grep -n '<guide> § "'`, and bare `§ "` inside the guide; citations
  can break across lines) and say so.
- **A rewrite does not grow the guide.** A bold lead replaces the words it
  summarizes rather than restating them before the paragraph says them again;
  where a lead or a split sentence adds bytes, find the restatement it makes
  redundant and cut that. A guide that ends longer says why in the report.
- **Voice**: a bold lead per bullet that states the rule, then one sentence
  of mechanism or example; present tense; one short paragraph per section; a
  "shapes to search for" list where there is a pattern to grep for. Split a
  sentence carrying two rules into two sentences. Plain words, no marketing
  tone.
- **Never add a rule nobody decided.** If you think a rule is wrong, leave it
  and say why.

## Constraints

- Edit only your guide, plus citation repoints if you renamed a heading. No
  git add, commit or stash. Do not run the test suite.
- Run and report: `node scripts/checks/guide-sections.mjs`,
  `node scripts/checks/spelling.mjs`, `node scripts/checks/change-citations.mjs`,
  `node scripts/checks/spec-citations.mjs`.

## Report (final message), concise

1. Bytes and lines before and after; the opening's bytes before and after.
2. Every rule merged, moved, cut or materially reworded, one line each
   (old → new).
3. Every claim about the code corrected or not verifiable.
4. Any rule you think is wrong (left unchanged), with the reason.
5. Check results.
