## Why

The repository has moved from the maintainer's personal GitHub account to the
`hintful-puzzles` organization, as `hintful-puzzles/hintful`, so that other
maintainers can be brought on without the project living under one person's
name. The live spec still says the repository is `puzzles-ts`, and the app's
source and bug-report links still point at the old location.

## What Changes

- The repository is named `hintful`, at `https://github.com/hintful-puzzles/hintful`.
  `REPO_URL` (and so `ISSUES_URL`) in `src/project-identity.ts` points there.
- Every live surface that names the repository says `hintful`: `AGENTS.md`,
  `README.md`'s issue link, `CREDITS.md`, `LICENSE.md`'s opening line, the CI
  deploy comment, `openspec/config.yaml`, and `package.json`/`package-lock.json`'s
  `name`.
- `README.md` and `AGENTS.md` name <https://hintful.click> as where the app is
  live, which they had not caught up with.
- Unchanged: the product name "Hintful Puzzles", "maintained by Yoni Lavi", the
  copyright lines, the Cloudflare Pages project `hintful-puzzles`, the domain,
  the local checkout directory, and the local Claude Code plugin marketplace's
  name (`puzzles-ts`). That name is a label no visitor sees, and existing local
  `tsgo-lsp` registrations are keyed on it, so renaming it would break them for
  no benefit.

## Impact

- `project-identity` spec: the "product is named Hintful Puzzles" requirement
  names the repository `hintful`.
- Players see the new source and bug-report links in the About dialog and on the
  front page. No save, preference or game-ID format changes.
- CI's Actions variable `VITE_CANONICAL_BASE_URL` is set on the new repository;
  the Cloudflare secrets must be re-entered there, since GitHub never reveals a
  secret's value to copy.
