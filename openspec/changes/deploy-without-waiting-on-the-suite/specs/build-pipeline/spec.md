## REMOVED Requirements

### Requirement: The app is published from a green gate, and the publish is verified on the deployed origin

**Reason**: Waiting on the whole suite before publishing cost about ten minutes
per push and bought no check the pre-commit hook had not already made (owner,
2026-09-27). The deploy now waits on the gate's fast checks and the build; the
suite runs beside it.

**Migration**: Replaced by "The app is published once the fast checks and the
build pass, and the publish is verified on the deployed origin".

## ADDED Requirements

### Requirement: The app is published once the fast checks and the build pass, and the publish is verified on the deployed origin

The app SHALL be deployed to a public HTTPS origin, and the deploy SHALL wait on
the gate's checks up to and including the production build: the typecheck, the
lint, the source checks and openspec validation, run by `scripts/gate.sh` itself
with `GATE_BUILD_ONLY=1`, so the deploy and the gate cannot disagree about what
those checks are. The build that runs there SHALL be the artifact published. The
test suite SHALL run in CI beside the deploy, as the full `npm run gate`, and a
failure there SHALL fail the run without holding back the deploy.

Verification SHALL be performed **against the deployed origin**, not against a
local build, for the four things that fail silently there:

- a route loads by its **clean URL** (`/pegs` served from `pegs.html`) —
  extensionless resolution is host behavior and is a configuration switch on
  some hosts, so it is checked, never assumed;
- the **security headers arrive** as headers, confirmed by inspecting the
  response, not inferred from `dist/_headers` existing in the output;
- the **service worker registers on that origin** and the app opens with the
  network off — registration is scope- and `base`-sensitive, and a local preview
  does not exercise either;
- the **canonical-URL-gated artifacts** (`sitemap.xml`, `robots.txt`) are
  present, since they are emitted only when `VITE_CANONICAL_BASE_URL` is set and
  their absence is invisible.

#### Scenario: A commit that fails the fast checks does not reach the public URL

- **WHEN** a commit lands on `main` whose typecheck, lint, source checks or build
  fail
- **THEN** no deploy is published for that commit

#### Scenario: The suite does not hold back the deploy

- **WHEN** a commit lands on `main`
- **THEN** it is published once the fast checks and the build pass, and the
  suite's result arrives on the same run afterwards

#### Scenario: A puzzle route is reachable by its clean URL

- **WHEN** the deployed origin is asked for a puzzle route with no `.html`
  extension
- **THEN** the corresponding page is served
