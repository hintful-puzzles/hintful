# deploy-without-waiting-on-the-suite — tasks

- [x] 1. `GATE_BUILD_ONLY=1` in `scripts/gate.sh`; run locally (15 s).
- [x] 2. CI: a `build` job the deploy needs, the full `gate` job beside it.
- [x] 3. `gate-scope.test.ts` requires a full-gate step in CI.
- [x] 4. Spec: the publish requirement replaced; AGENTS.md's description of CI.
- [x] 5. Watch the first run: deploy lands before the suite finishes (run
      36318470060: build 52 s, deploy done 80 s after start, suite still
      running).
