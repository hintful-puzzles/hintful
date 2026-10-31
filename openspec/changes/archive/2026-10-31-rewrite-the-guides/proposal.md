# rewrite-the-guides

**Status: filed on the owner's word (2026-10-31)**, a follow-up of
`split-adjacent-from-unequal`: "let's use this next change as an opportunity
to update and rewrite the docs in general. I suggest using a technical
writer subagent to help with that."

## Why

`docs/engine-catalog.md`'s opening is 11,988 of the 12,000 bytes
`guide-sections` allows (2026-10-31): the next engine helper that needs a row
is refused, as Adjacent's entry was until it was folded into the Latin
section. The guides as a whole have grown by accretion, a section per
lesson: 19 guides, about 830 KB in 14,500 lines (2026-10-31), the largest
four between 1,250 and 1,723 lines. A session reads a guide's opening and
one section, so what costs it is an opening it must wade through, a section
that restates another, and a claim about the code that is no longer true.

## What Changes

- **The engine catalog's index fits its budget with room to grow.** How is
  the design's.
- **Every guide under `docs/` is rewritten, one at a time**, drafted by a
  technical-writer subagent and reviewed by a second agent that did not write
  it, against the code and the repo's rules for a guide. A rewrite keeps what
  a guide promises: every rule, decision, reason and trap stays, said once,
  in the guide that binds it.
- **`README.md` § "Documentation"** follows the guides it indexes.
- `AGENTS.md` is not rewritten: it is how an agent works and has its own
  gate. Only its citations follow a heading that moves.

## Acceptance

The owner reads a sample of the rewritten guides (their choice of which) and
accepts the voice and the cuts.
