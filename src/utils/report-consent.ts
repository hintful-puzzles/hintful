import type * as Sentry from "@sentry/browser";

type TransportFactory = ReturnType<typeof Sentry.makeBrowserOfflineTransport>;
type Transport = ReturnType<TransportFactory>;
type Envelope = Parameters<Transport["send"]>[0];

/**
 * Crash reports leave the device only with the player's say-so.
 *
 * The gate sits at the transport because every byte the SDK sends — events,
 * client reports, offline retries — passes through it, so there is no second
 * route to forget. Gating earlier (in `beforeSend`, then re-capturing on
 * consent) would run each event through the SDK twice, and its dedupe
 * integration drops the second copy. Held envelopes live in memory only: the
 * offline transport is *inside* the gate, so nothing is written to storage
 * before consent either.
 *
 * Feedback passes straight through. The only thing that creates it is the
 * crash dialog's Send button, which is the consent; and `sendFeedback` waits
 * for the server's response, so holding it would make that button fail.
 */
class ReportConsent {
  /** Bounds memory when an error loop keeps capturing while nobody answers. */
  static readonly MAX_HELD = 30;

  private held: Envelope[] = [];
  private sendNow: Transport["send"] | null = null;

  gate(makeTransport: TransportFactory): TransportFactory {
    return (options) => {
      const inner = makeTransport(options);
      this.sendNow = (envelope) => inner.send(envelope);
      return {
        send: async (envelope) => {
          if (isOnlyFeedback(envelope)) {
            return inner.send(envelope);
          }
          this.held.push(envelope);
          if (this.held.length > ReportConsent.MAX_HELD) {
            this.held.shift();
          }
          return {};
        },
        flush: (timeout) => inner.flush(timeout),
      };
    };
  }

  get heldCount(): number {
    return this.held.length;
  }

  /** The player agreed: send everything held so far. */
  async release(): Promise<void> {
    const envelopes = this.held;
    this.held = [];
    const send = this.sendNow;
    if (send) {
      await Promise.all(envelopes.map((envelope) => send(envelope)));
    }
  }

  /** The player declined, or never answered: forget everything held. */
  discard(): void {
    this.held = [];
  }
}

function isOnlyFeedback(envelope: Envelope): boolean {
  let sawItem = false;
  for (const [header] of envelope[1]) {
    if (header.type !== "feedback") {
      return false;
    }
    sawItem = true;
  }
  return sawItem;
}

export const reportConsent = new ReportConsent();
