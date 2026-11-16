# The trial, for the owner (task 1.10)

Written 2026-11-15 at `7437840e0`. The four games (Unequal, Singles, Loopy,
Slide) have their hint sentences stated in the description. No override and no
`hint-text.ts` is left in any of them. Every claim below is a reading of the
tree at that commit.

## 1. Did the words move?

| Game | Moved? | How it was checked |
| --- | --- | --- |
| Unequal | No | word dump byte-identical (564 sign steps, all four arms met) |
| Singles | No | word dump byte-identical at 8 and 80 deals (105,828 lines) |
| Slide | No | word dump byte-identical (15,820 lines, every rung but the one-move form met) |
| Loopy | Two sentences | walk fingerprint, both tiers; the word dump does not finish |

Loopy's two moves, both forced by the hint-quality guards on CI (a ring
reference may not hold its verb, nor be a bare "the rest"):

| Kind | Before | After |
| --- | --- | --- |
| `clueStarved`, one edge left | "the ringed edge must be a line too" | "the ringed edge must be a line" |
| `clueBlockedPair` | "…that edge can't be one and the rest must be lines" | "…that edge can't be one and the other edges must be lines" |

Because Unequal's and Singles' words did not move, old beside new shows nothing
there. What changed is the source, so the comparison is source before and after.

## 2. Slide's source, before and after

Before (`slide/hint-text.ts`, 94 lines, one of five functions):

```ts
keyBlock: (m: Slid, left: number): Sentence =>
  sentence({
    move: slideIt(m),
    relation: {
      kind: "effect",
      effect: phrase`after that it can be out in ${left === 1 ? "1 move" : `${left} moves`}`,
    },
  }),
```

where `slideIt` is
``phrase`slide ${mark.the("ring", BLOCK, m.cells, m.key ? "key block" : "block")} into ${mark.the("stripes", BLOCK, m.into, "space")}` ``.

After (`slide.description.yaml`, in the description the engine compiles):

```yaml
keyBlock:
  ring: block
  terms: { left: number }
  marks: { stripes: [block] }
  move: "slide {ring: the ringed key block} into {stripes block: the striped space}"
  effect: "after that it can be out in {left: 1 move | {left} moves}"
```

The five kinds are 36 lines of YAML. Every slot is checked when the description
compiles: a clause cannot read a term or mark its kind does not state. The
planner (`hint.ts`) only names the kind and passes the squares.

## 3. Unequal's source, before and after

Before, `unequal/hint-text.ts`: two functions (`greater`, `lesser`), each a
ternary on the bound against the value's extreme, building `phrase` text out
of `theClue`, `across` and `displayChar`. After, four wordings on the `sign`
fact, each chosen by a formula over the candidates:

```yaml
wordings:
  - when: "c = big and min(d2 in cand(small)) <= 1"
    look: "The larger side of {outline sign: this greater-than sign} can't hold the smallest number"
  - when: "c = big"
    look: "{outline small: the outlined smaller side} of {outline sign: this greater-than sign} is at least {lo}"
  - when: "max(d2 in cand(big)) >= order"
    look: "The smaller side of {outline sign: this greater-than sign} can't hold the largest number"
  - look: "{outline big: the outlined larger side} of {outline sign: this greater-than sign} is at most {hi}"
```

## 4. What the form could not state, and the decision for each

None of these is a sentence left in code. Each is something a step needs that
the form does not carry yet, or a choice the trial made that you may want
otherwise. Recommendations are mine.

1. **Relations other than `forced` and `effect` are not stated** (`oneOf`,
   `answers`, `sequence`, `again`, `serves`). No trial game needs one. About
   twenty other games' `hint-text.ts` use them (`again`: Towers, Group,
   Dominosa, Tents, Undead and more; `answers`: Pegs, Sokoban, Cube and
   more). *Recommend:* grow the form one relation at a time, in the game that
   first needs it, as `effect` was grown in Slide. A `relation:` key on a
   clause, defaulting to `forced`.
2. **The `words:` block of nouns is not built.** Slide's nouns are literals
   inside its references, so a declaration would only restate them. The Latin
   games' `LatinVocab.cell`, `notes.cell` and `thisCellNamed` are what it
   replaces. *Recommend:* build it with the library's words (design.md § "Order
   of work", step 6), where Towers, Keen, Solo and the rest need it.
3. **A planner's choice of wording by name is declined.** Slide's planner names
   a kind and no wording differs inside one; where a wording does differ
   (Unequal, Singles, Loopy's `earlyLoop`), a `when` over the terms picks it. *Recommend:* keep declined until a game's planner cannot name a
   kind.
4. **Three things in Loopy stay the plan's code, supplied to the clause as
   terms or marks**: the corners a count leans on (`boundOf` pairs a face's
   edges greedily, as a player counts, which no formula states), the chain of
   pairs relating two edges (`chainPair`), and what a deferred note quotes of
   the board (`needed`, `dotLines`). *Recommend:* stay code. They are
   deductions or board reads, not wording, and the clause reads each as a
   checked slot.
5. **A ring reference cannot hold its verb**, so Loopy's "…must be a line too"
   for one edge went (§ 1). A form that put "too" after a live ring would need
   a suffix slot after the one-or-several words. *Recommend:* accept the loss.
   The "too" added no deduction, and a suffix slot is one more clause form to
   translate.
6. **"Both 3s" for an equal pair is two terms in Singles' `offset`** (`p`
   and `q`), because `{each}` lists "3 and 3". A reference word that said
   "both 3s" would drop the terms. One game wants it. *Recommend:* leave it
   until a second does.
7. **Two of Singles' `corner.four` wordings are met by no walk** at 80 deals
   (`besideCovered` and `sameLine` fire first). The old code had the same
   branches, and the clauses were checked against it by reading. *Recommend:*
   keep them and pin each with a unit test, or delete them if you would rather
   state only what a walk reaches. I would keep them: a board the walk did not
   sample can reach them.
8. **Slide's one-move form (`1 move`) is met by no dumped board**; only the
   unit test holds it. *Recommend:* leave it. That is the case a test is for.
9. **Loopy's word dump does not finish** (one deal a preset in ten minutes), so
   its words are held by the fingerprint and the pinned positions, not a dump.
   *Recommend:* accept for the catalog; add a Loopy preset filter to the dump
   only if a later change needs to compare Loopy's words.
10. **A library technique carries no `STATED` today.** This is the proposal's
    payoff rather than a gap: the Latin games that `use` it take one wording
    each. It is step 6 of the order of work.

## 5. What I need from you

- **Does the catalog go ahead** (the library's words first, then each game by
  its word dump)? The trial found nothing that stops it.
- **Items 5 and 7** are the only ones where I would not choose for you: 5
  changes a sentence a player reads (already shipped in `4c006199c`), 7 is a
  keep-or-delete. Everything else I would decide as recommended above.
