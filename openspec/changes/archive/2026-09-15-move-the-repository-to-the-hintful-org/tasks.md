## 1. Repoint the repository

- [x] 1.1 Point `REPO_URL` in `src/project-identity.ts` at `https://github.com/hintful-puzzles/hintful`
- [x] 1.2 Repoint `README.md`'s issue link
- [x] 1.3 Name the repository `hintful` in `AGENTS.md`, `CREDITS.md`, `LICENSE.md`, the CI deploy comment and `openspec/config.yaml`
- [x] 1.4 Rename `package.json`'s `name` and the matching root `name` fields in `package-lock.json` (nothing reads the name)
- [x] 1.5 Keep the local plugin marketplace's name, `puzzles-ts` (it keys existing local registrations); state where the app is live in `README.md` and `AGENTS.md`
- [x] 1.6 Update the `project-identity` spec's repository sentence

## 2. Verify

- [x] 2.1 Search for `yoniLavi`, `puzzles-ts` and `github.com/` again; every remaining hit is a local path, the record, a fixture seed or an attribution link
- [x] 2.2 Typecheck, biome, spelling, change-citations, openspec validate, and the About-dialog and identity tests pass
