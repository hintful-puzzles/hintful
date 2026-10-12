# Tasks

## 1. Decide

- [ ] 1.1 Write `design.md`: the fixed outline of a guide, the columns
      of its opening table and its budget (measure what a table of a
      guide's sections costs before naming the number), and the kinds of game it routes. Take the
      kinds from which helpers occur together across `src/games`; the pass
      of 2026-10-12 found four (cells with notes, cells marked by state,
      edges and loops, moves and search).
- [ ] 1.2 Decide where a named game's story goes, case by case rule: to its
      spec only where it is a rule of that game, to a comment only where it
      explains the lines it sits on, otherwise deleted.
- [ ] 1.3 Read `repo-layout` for what it requires of the guides, and write
      the delta if the form above changes a requirement.

## 2. Restructure, one guide to a commit-sized unit

- [ ] 2.1 `hints.md` first: it is 40% of the bytes. One reader per guide in
      parallel is the method that worked on 2026-10-12, each given the
      outline and told to change no rule.
- [ ] 2.2 `solver-and-generator.md`, `input.md`, `mechanics.md`,
      `rendering.md`, `testing.md`, `engine-catalog.md`.
- [ ] 2.3 Repoint every citation of a moved or renamed heading, in guides,
      specs, open changes and source comments (`git grep -n '§ "'`).
- [ ] 2.4 Verify by the shape of the diff: for each guide, list every rule
      sentence removed and say where it went. A rule that is in neither the
      guide nor its destination is a loss.

## 3. The move, the openings and their check

- [ ] 3.1 Move the guides up into `docs/` and repoint every citation of a
      `docs/` path outside the archive, in one commit of its own,
      verified by the shape of its diff: the count of citations before and
      after, and none left (`git grep -c 'docs/'`). Check the gate's
      documentation-only path and every check under `scripts/checks/` that
      names the directory.
- [ ] 3.2 `docs/new-game.md` from `docs/new-game.md`, with the route per
      kind of game, and the table in `README.md` § "Documentation" naming
      it first. Move out of `AGENTS.md` whatever else there is not about
      how an agent works.
- [ ] 3.3 Each guide's opening lists its sections with when a game needs
      each. A gate check, in the fast prefix, holds every `##` and `###`
      heading of a guide to being in its opening, and the opening to its
      budget. See it fail on a planted heading.
- [ ] 3.4 Test the route: a subagent with only `AGENTS.md` and `README.md` is asked ten
      questions a new game's author would have, and reports how many bytes
      it read to answer each. Record the result in `design.md`.

## 4. Close

- [ ] 4.1 Gate, commit, archive, push.
