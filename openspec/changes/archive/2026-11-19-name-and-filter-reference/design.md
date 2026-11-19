## Context

The reference aid was two optional hooks, `reference` and `selectReference`,
and the model carried its own title. The toolbar's toggle read "Reference" in
every game, since the title is fetched only with the model, and fetching the
model counts as help. Wordguess's dictionary listed only the words that fit
every score.

## Goals / Non-Goals

**Goals:** the toggle names what the aid is; a word game's dictionary can be
searched and narrowed by the panel, declared by the game; Wordguess lists the
whole answer list.

**Non-Goals:** a pattern search (`c?g?r`); listing the rare words a guess may
also be, which run to 9,000–29,000 a length.

## Decisions

**D1. The aid is one hook, `reference: { title, model, select }`.** The title
must be static, for the toggle shows it before the model is fetched, and one
object makes a reference without a name, or a model without a select,
impossible to write. The model's `title` goes: one copy, the hook's. The
midend's static `hasReference` becomes `referenceTitle: string | null`.

**D2. Search and filters are the panel's, declared by the model.** The model
says `search: boolean` and `filters: { label, statuses }[]`; the panel draws
"All" before them, counts each over the items, and keeps its choice while
open. They are view state, never the game's `Ui`: narrowing a list changes
nothing on the board. A filter by status keeps the declaration generic:
Wordguess's "Fits" and Wordtrail's "Fits" and "Found" are each one line.

**D3. Search matches a label's substring, case ignored.** A player typing
"ci" finds CIGAR and CIRCA, and also ACID; a prefix search would miss what a
player half remembers. A pattern search is left for a player's asking.

**D4. Wordguess lists `answerWords`, A to Z under letter headings,** 424 to
2,525 words a length (measured 2026-11-19), the words the game can draw, at
the owner's word. Unfitting words are ruled out, struck as in Wordtrail, and
still selectable: a guess that cannot win may split the rest best. Where no
answer fits (a game ID may hide another word) the words of the guess list
that fit are listed too, so "Fits" is never empty: the hint counts the same.

## Risks / Trade-offs

- A refetch on every move rebuilds a list of up to 2,525 chips; measured in
  the browser before calling it done.
