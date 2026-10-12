# Tasks

## 1. Decide

- [x] 1.1 Write `design.md`: the fixed outline of a guide, the columns
      of its opening table and its budget (measure what a table of a
      guide's sections costs before naming the number), and the kinds of game it routes. Take the
      kinds from which helpers occur together across `src/games`; the pass
      of 2026-10-12 found four (cells with notes, cells marked by state,
      edges and loops, moves and search).
- [x] 1.2 Decide where a named game's story goes, case by case rule: to its
      spec only where it is a rule of that game, to a comment only where it
      explains the lines it sits on, otherwise deleted. `design.md` § "What
      leaves a guide, and where it goes".
- [x] 1.3 Read `repo-layout` for what it requires of the guides, and write
      the delta if the form above changes a requirement. Two requirements
      modified and three added.

## 2. Restructure, one guide to a commit-sized unit

- [x] 2.1 `hints.md` first: it is 40% of the bytes. It became four guides,
      one rewriter each.
- [x] 2.2 `solver-and-generator.md`, `input.md`, `mechanics.md`,
      `rendering.md`, `testing.md`, `engine-catalog.md`.
- [x] 2.3 Repoint every citation of a moved or renamed heading, in guides,
      specs, open changes and source comments. By a script from the
      rewriters' maps; `scripts/checks/guide-sections.mjs` holds that none
      is dead.
- [x] 2.4 Verify by the shape of the diff: for each guide, list every rule
      sentence removed and say where it went. A second reader for each
      guide; `design.md` § "What was done" has the counts.

## 3. The move, the openings and their check

- [x] 3.1 Move the guides up into `docs/` and repoint every citation of a
      `docs/games/` path outside the archive, in one commit of its own
      (b34f05be), verified by the shape of its diff. Done first, so that
      every later edit was made at the final path.
- [x] 3.2 `docs/new-game.md` from `docs/games/README.md`, with the route per
      kind of game, and the table in `README.md` § "Documentation" naming
      it first. `AGENTS.md` held nothing else that was not how an agent
      works; its paragraph on using a guide now names the opening and the
      route.
- [x] 3.3 Each guide's opening lists its sections with when a game needs
      each. A gate check, in the fast prefix, holds every `##` and `###`
      heading of a guide to being in its opening, and the opening to its
      budget. Seen to fail on a planted heading.
- [x] 3.4 Test the route: a subagent with only `AGENTS.md` and `README.md` is asked ten
      questions a new game's author would have, and reports how many bytes
      it read to answer each. The result is in `design.md`.

## 4. Close

- [x] 4.1 Gate, commit, archive, push.
