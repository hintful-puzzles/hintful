# hide-family-chips-while-searching

Owner, 2026-10-09, with a screenshot of a phone searching for "Solo": *"on a
mobile screen, when I search for a game on the home page, I can't actually see
the results - what would you say about hiding the tags when the input is not
empty?"*

## Why

Measured 2026-10-09 at 360 CSS px, the width of the owner's phone: the family
chips wrap to four rows, 188 px, between the filter and the list, and the
list's first row starts at 545 px. The on-screen keyboard in the screenshot
begins at about 503 px. A player who types a name sees the chips and no
result.

Once something is typed, the chips are also saying nothing the box cannot:
a family's label is in what the search matches.

## What Changes

- **While the search box holds text, the home screen shows no family chip
  except the pressed one.** The list moves up by the rows that leaves. The
  pressed chip stays because it is still narrowing the list, and a narrowing
  with no control on screen cannot be undone. Clearing the box brings every
  chip back.
- This holds at every window size: one rule, and at desktop width the chips
  are a single row.

A family and a search still combine as before. Nothing a player has saved or
shared changes.

## Capabilities

### Modified Capabilities

- `app-shell`: which family chips the home screen offers beside a search.

## Acceptance

The owner's, who asked for it by name.
