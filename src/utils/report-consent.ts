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
 * What is held is everything captured since the page opened or the player
 * last answered, including errors the crash dialog never showed: the dialog
 * says so beside its Send button, and those are often the cause of the one it
 * did show.
 *
 * Feedback passes straight through. The only thing that creates it is the
 * crash dialog's Send button, which is the consent; and `sendFeedback` waits
 * for the server's response, so holding it would make that button fail.
 */
export class ReportConsent {
  /**
   * Bounds memory when an error loop keeps capturing while nobody answers.
   * Past it the oldest report the dialog does not list is dropped, so what the
   * player is shown is what goes for as long as anything else can make room.
   */
  static readonly MAX_HELD = 30;

  private held: Envelope[] = [];
  /** The event IDs of the errors the crash dialog lists. */
  private listed = new Set<string>();
  /** What each captured event was made from, by event ID, oldest first. */
  private captured = new Map<string, unknown>();
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
            const unlisted = this.held.findIndex(
              ([header]) =>
                typeof header.event_id !== "string" ||
                !this.listed.has(header.event_id),
            );
            // Every one is listed only when the dialog lists more than the
            // bound, and then the oldest of those goes.
            this.held.splice(Math.max(unlisted, 0), 1);
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

  /** The SDK made the event `eventId` from `exception`. */
  noteCapture(exception: unknown, eventId: string): void {
    this.captured.set(eventId, exception);
    if (this.captured.size > ReportConsent.MAX_HELD) {
      for (const oldest of this.captured.keys()) {
        this.captured.delete(oldest);
        break;
      }
    }
  }

  /** The crash dialog lists the error whose report is `eventId`. */
  noteListed(eventId: string): void {
    this.listed.add(eventId);
  }

  /**
   * The event the SDK made from `error`, or null when it made none.
   *
   * An error from the worker reaches the SDK and the dialog as two structured
   * clones of one object, so it is matched by its stack as well as by identity.
   */
  eventIdOf(error: unknown): string | null {
    if (!(error instanceof Error)) {
      return null;
    }
    const captures = [...this.captured];
    const match =
      captures.find(([, exception]) => exception === error) ??
      captures.find(
        ([, exception]) =>
          exception instanceof Error && error.stack && exception.stack === error.stack,
      );
    return match ? match[0] : null;
  }

  /**
   * The player agreed: send everything held so far.
   * Resolves to the event IDs sent, oldest first.
   */
  async release(): Promise<string[]> {
    const envelopes = this.held;
    this.held = [];
    this.captured.clear();
    this.listed.clear();
    const send = this.sendNow;
    if (!send) {
      return [];
    }
    await Promise.all(envelopes.map((envelope) => send(envelope)));
    return envelopes
      .map((envelope) => envelope[0].event_id)
      .filter((eventId) => typeof eventId === "string");
  }

  /** The player declined, or never answered: forget everything held. */
  discard(): void {
    this.held = [];
    this.captured.clear();
    this.listed.clear();
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
