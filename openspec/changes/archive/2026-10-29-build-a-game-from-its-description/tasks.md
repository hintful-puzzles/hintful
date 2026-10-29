# Tasks

The session that takes this up revises these as it designs; they are the
investigation's starting point, not a plan. Revised 2026-10-29 as the work
went (`design.md`).

## 1. Ground

- [x] 1.1 Re-read each postmortem for whether its finding binds building from a description of rules and techniques, and say why for each (`report.md` § "The postmortems, read again")
- [x] 1.2 Choose the schema form (JSON or YAML, and how formulas are written) and write one Latin game in it (JSON with a JSON Schema, formulas in one syntax; Towers, Unequal, Adjacent and Solo with its variations written, and the Latin engine's techniques as a library)

## 2. Pilot

- [x] 2.1 Evaluate a game's answer check from its description, and compare it with `status()` and `findMistakes` on dealt boards (Towers, Unequal, Adjacent, Solo; a planted defect in each clue's meaning)
- [x] 2.2 Run a game's stated techniques as its ladder, and compare grade and hint steps with the hand-written ladder, at every tier (Unequal and Adjacent: closures cell by cell, grades, and every recorded firing the hint narrates; three planted defects)
- [x] 2.3 Measure what was built against what it replaces, and what each game still had to write
- [x] 2.4 Measure z3's WebAssembly build on the heaviest checks, before any port

## 3. Report

- [x] 3.1 What to adopt, for which games, and what would be excluded for fitting badly; the owner's decision recorded (`report.md` § "The owner's decision"; next: `compile-the-latin-ladder`)
