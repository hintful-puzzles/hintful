## MODIFIED Requirements

### Requirement: The privacy notes promise no more than the code keeps

The privacy notes SHALL NOT promise
more than the code keeps. The crash-report description is bound to
`sendDefaultPii: false` and to the consent gate in `src/utils/sentry.ts`. The
measurement description is bound to whatever analytics block a deployment
injects: a deployment that adds identifying measurement MUST change the notes
in the same change.

#### Scenario: A deployment adds identifying measurement

- **WHEN** a deployment injects an analytics block that sets a cookie or
  another client-side identifier
- **THEN** the same change changes the notes to say so

## REMOVED Requirements

### Requirement: A crash report leaves the device only with the player's consent

**Reason**: Moved to `error-reporting`, with its words.

### Requirement: Consent is enforced at the reporting SDK's transport

**Reason**: Moved to `error-reporting`, with its words.
