# towers-implicit-strike-window — tasks

- [x] 1. Reproduce the figure (12.9% implicit, 7.2% populate, six seeds).
- [x] 2. Replace the strike window with the pending-mark rule: an unmade
      placement's cell is pending, and ends the first-firing exemption.
- [x] 3. Unit tests for both sides of the rule, each seen red against a
      mutation.
- [x] 4. Under the implicit reading, the setup is done while no note is stale;
      tried skipping the opening outright first, which broke the naked-single
      tests on stale boards.
- [x] 5. Measure every frontier game under both readings, before and after.
- [x] 6. Empty the `OVER_BOUND` ledger.
- [x] 7. Re-baseline the three render snapshots whose scenarios reach a
      different instance of the same step; targeted assertions unchanged.
- [x] 8. Hints guide, Salad's comments, spec delta.
- [x] 9. Run Towers in the app under "Only as needed" and take hints.
