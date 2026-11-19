## Decisions

**Typecheck first, it is the cheap half.** The break that cost the session
was a type error. A project for `research/` in the gate's typecheck (the
same compiler run, a third `-p`, or `research` added to an existing
project's include if its lib settings fit) catches it in seconds. Expect a
first run to find more stale code; fix it or delete the tool, and record
which.

**The doc-only fast path.** Once `research/` is typechecked, a commit
touching only `research/` is no longer documentation-only. Move it out of
`doc_only`'s list, or keep it there and let the typecheck in the prefix
(which runs before the shortcut) cover it; read the prefix's order to see
which holds. `src/gate-scope.test.ts` proves the list; keep it proving.

**Guards in CI.** `inherit.test.ts`'s two guards and any like it run in
`gate.yml` as their own step, scoped to those guards and not the whole
report.

**Progress.** Vitest buffers a file's console output until the file ends,
so a long report shows nothing. Write progress to stderr directly
(`process.stderr.write`), which vitest passes through, or run the report as
a script outside vitest; check which holds on this vitest version before
choosing.

## Risks

- Some research tools may be abandoned and not worth fixing. Delete them
  rather than exclude them from the project.
