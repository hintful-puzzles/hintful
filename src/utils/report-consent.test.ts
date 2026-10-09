// @vitest-environment happy-dom
/*
 * "Nothing is sent unless you choose to send it" — the privacy notes' promise,
 * checked against the real `initSentry` with every integration it installs,
 * rather than against the gate on its own. A gate that works while the app's
 * init routes around it would pass a unit test of the gate.
 *
 * The inner transport is a recorder: whatever reaches it is what would have
 * left the device.
 */
import * as Sentry from "@sentry/browser";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import "../test-setup/element-internals.ts";
import "../test-setup/icons.ts";
import "../test-setup/resize-and-animations.ts";
import { reportError } from "../dialogs/crash-dialog.ts";
import { ReportConsent, reportConsent } from "./report-consent.ts";
import { initSentry } from "./sentry.ts";

type TransportFactory = NonNullable<Parameters<typeof initSentry>[0]>;

/** The item types of each envelope that reached the network. */
const sent: string[][] = [];
/** Each event item that reached the network, serialized. */
const sentEvents: string[] = [];

const recordingTransport: TransportFactory = () => ({
  send: async (envelope) => {
    const types: string[] = [];
    for (const [header, payload] of envelope[1]) {
      types.push(header.type);
      if (header.type === "event") {
        sentEvents.push(JSON.stringify(payload));
      }
    }
    sent.push(types);
    return { statusCode: 200 };
  },
  flush: async () => true,
});

function captureShown(message: string) {
  Sentry.captureException(new Error(message));
}

beforeAll(() => {
  vi.stubEnv("VITE_SENTRY_DSN", "https://public@o0.ingest.de.sentry.io/1");
  initSentry(recordingTransport);
});

afterEach(() => {
  document.querySelector("crash-dialog")?.remove();
  reportConsent.discard();
  sent.length = 0;
  sentEvents.length = 0;
});

afterAll(async () => {
  // `isolate: false` shares this module graph with other files in the worker.
  await Sentry.close();
  vi.unstubAllEnvs();
});

describe("a crash report leaves the device only with consent", () => {
  it("initialized a real client, without session tracking", () => {
    const client = Sentry.getClient();
    expect(client).toBeDefined();
    // Known positive first, so an absent lookup means something.
    expect(client?.getIntegrationByName("GlobalHandlers")).toBeDefined();
    expect(client?.getIntegrationByName("BrowserSession")).toBeUndefined();
  });

  it("holds a captured error instead of sending it", async () => {
    Sentry.captureException(new Error("boom"));
    await Sentry.flush(2000);
    // Vacuity guard: the event reached the transport rather than being filtered.
    expect(reportConsent.heldCount).toBe(1);
    expect(sent).toEqual([]);
  });

  it("sends exactly what was held once the player agrees", async () => {
    captureShown("boom");
    await Sentry.flush(2000);
    expect(await reportConsent.release()).toHaveLength(1);
    expect(sent).toEqual([["event"]]);
    expect(reportConsent.heldCount).toBe(0);
  });

  it("sends nothing ever for a report the player declined", async () => {
    captureShown("boom");
    await Sentry.flush(2000);
    reportConsent.discard();
    await reportConsent.release();
    expect(sent).toEqual([]);
  });

  it("carries no trace of a declined report inside one the player sends", async () => {
    // Found on the deployed site: the SDK's own breadcrumb for the declined
    // error rode along in the next report.
    Sentry.captureException(new Error("Declined-4f1c"));
    await Sentry.flush(2000);
    reportConsent.discard();
    captureShown("Sent-4f1c");
    await Sentry.flush(2000);
    await reportConsent.release();
    expect(sentEvents).toHaveLength(1);
    expect(sentEvents[0]).toContain("Sent-4f1c");
    expect(sentEvents[0]).not.toContain("Declined-4f1c");
  });

  /**
   * One error caught and captured with no dialog, as a service worker failure
   * is; one the dialog's own list turns away; one logged; one the dialog shows.
   */
  async function aSessionOfErrors() {
    Sentry.captureException(new Error("Silent-7b2e"));
    const ignored = new Error("invalid origin");
    Sentry.captureException(ignored);
    await reportError(`${ignored}`, ignored);
    expect(document.querySelector("crash-dialog")).toBeNull();
    // Through the real console, which the SDK listens to: this prints a line.
    console.error("Logged-7b2e (a test's own line, not a failure)");
    const shown = new Error("Shown-7b2e");
    Sentry.captureException(shown);
    await reportError(`Uncaught ${shown}`, shown);
    await Sentry.flush(2000);
    // Vacuity guards: the dialog opened, and all three reached the transport.
    expect(document.querySelector("crash-dialog")).not.toBeNull();
    expect(reportConsent.heldCount).toBe(3);
  }

  it("sends nothing of a session's errors while the player has not sent", async () => {
    await aSessionOfErrors();
    expect(sent).toEqual([]);
    reportConsent.discard();
    await reportConsent.release();
    expect(sent).toEqual([]);
  });

  it("sends everything recorded this session once the player sends", async () => {
    await aSessionOfErrors();
    expect(await reportConsent.release()).toHaveLength(3);
    const all = sentEvents.join();
    expect(sentEvents).toHaveLength(3);
    expect(all).toContain("Silent-7b2e");
    expect(all).toContain("invalid origin");
    // The record of what led up to the error shown rides in its report.
    const shown = sentEvents.find((event) => event.includes('"value":"Shown-7b2e"'));
    expect(shown).toContain("Logged-7b2e");
    expect(shown).toContain("error.ignored");
  });

  it("never holds an error out of a browser extension, or quotes one", async () => {
    const foreign = new Error("Foreign-7b2e at chrome-extension://abcdef/content.js");
    Sentry.captureException(foreign);
    await reportError(`Uncaught ${foreign}`, foreign);
    console.error("chrome-extension://abcdef/content.js said Foreign-7b2e");
    await Sentry.flush(2000);
    expect(document.querySelector("crash-dialog")).toBeNull();
    expect(reportConsent.heldCount).toBe(0);
    captureShown("Shown-7b2e");
    await Sentry.flush(2000);
    await reportConsent.release();
    expect(sentEvents).toHaveLength(1);
    // Known positive: the turned-away error is counted in the record.
    expect(sentEvents[0]).toContain("error.ignored");
    expect(sentEvents[0]).not.toContain("Foreign-7b2e");
    expect(sentEvents[0]).not.toContain("abcdef");
  });

  it("does not say where the player came from", async () => {
    vi.spyOn(document, "referrer", "get").mockReturnValue(
      "https://elsewhere.test/a?q=b",
    );
    captureShown("boom");
    await Sentry.flush(2000);
    await reportConsent.release();
    vi.restoreAllMocks();
    // Known positive: the request context is there, with the browser in it.
    expect(sentEvents[0]).toContain("User-Agent");
    expect(sentEvents[0]).not.toContain("elsewhere.test");
  });

  it("keeps where the player came from only when that was this app", async () => {
    // An address that merely begins with this app's origin is another site's.
    const referrer = vi.spyOn(document, "referrer", "get");
    referrer.mockReturnValue(`${location.origin}.elsewhere.test/a`);
    captureShown("boom");
    referrer.mockReturnValue(`${location.origin}/sokoban?from=home`);
    captureShown("bang");
    await Sentry.flush(2000);
    await reportConsent.release();
    vi.restoreAllMocks();
    expect(sentEvents).toHaveLength(2);
    expect(sentEvents[0]).not.toContain("elsewhere.test");
    expect(sentEvents[1]).toContain("sokoban?from=home");
  });

  it("drops the oldest error the dialog does not list when it holds too many", async () => {
    await reportError("Uncaught Error: Listed-9c3a", new Error("Listed-9c3a"));
    for (let i = 0; i < ReportConsent.MAX_HELD + 2; i++) captureShown(`Unlisted-${i}`);
    await Sentry.flush(2000);
    expect(reportConsent.heldCount).toBe(ReportConsent.MAX_HELD);
    await reportConsent.release();
    const all = sentEvents.join();
    expect(all).toContain("Listed-9c3a");
    // What went was the oldest the dialog never showed, and the newest stayed.
    expect(all).not.toContain('"value":"Unlisted-0"');
    expect(all).toContain(`"value":"Unlisted-${ReportConsent.MAX_HELD + 1}"`);
  });

  /** Press the dialog's Send report and wait for it to say it was sent. */
  async function pressSend(): Promise<ShadowRoot> {
    const dialog = document.querySelector("crash-dialog");
    const root = dialog?.shadowRoot;
    if (!dialog || !root) throw new Error("no crash dialog");
    await dialog.updateComplete;
    const send = [...root.querySelectorAll("wa-button")].find(
      (button) => button.textContent?.trim() === "Send report",
    );
    if (!send) throw new Error("no Send report button");
    send.click();
    await vi.waitFor(() => expect(root.textContent).toContain("Report sent"));
    return root;
  }

  it("quotes the event ID of an error the dialog listed", async () => {
    captureShown("Unlisted-5d1e");
    await reportError("Uncaught Error: Listed-5d1e", new Error("Listed-5d1e"));
    captureShown("Later-5d1e");
    await Sentry.flush(2000);
    const root = await pressSend();
    const quoted = root.querySelector("#event-id")?.textContent ?? "";
    expect(quoted).toMatch(/^[0-9a-f]{32}$/);
    const listed = sentEvents.find((event) => event.includes("Listed-5d1e"));
    expect(listed).toContain(`"event_id":"${quoted}"`);
  });

  it("quotes no event ID when no report of a listed error went", async () => {
    // The dialog lists this one and the SDK's own filter turns it away, so
    // the only report sent is of an error the player was never shown.
    captureShown("Unlisted-5d1e");
    await reportError("Script error.");
    await Sentry.flush(2000);
    const root = await pressSend();
    // Vacuity guard: a report did go.
    expect(sentEvents).toHaveLength(1);
    expect(sentEvents[0]).toContain("Unlisted-5d1e");
    expect(root.querySelector("#event-id")).toBeNull();
  });

  it("sends an error the SDK did not capture itself, since the dialog shows it", async () => {
    // An error event in the worker reaches the dialog and not the SDK.
    await reportError("Uncaught Error: Worker-7b2e", new Error("Worker-7b2e"));
    await reportError("Bare-7b2e [unhandled rejection]");
    await Sentry.flush(2000);
    expect(await reportConsent.release()).toHaveLength(2);
    expect(sentEvents.join()).toContain("Worker-7b2e");
    expect(sentEvents.join()).toContain("Bare-7b2e [unhandled rejection]");
  });

  it("sends the screen it happened on, but not the player's timezone or locale", async () => {
    captureShown("boom");
    await Sentry.flush(2000);
    await reportConsent.release();
    expect(sentEvents).toHaveLength(1);
    // Known positive: a context the notes do describe.
    expect(sentEvents[0]).toContain('"Display"');
    expect(sentEvents[0]).not.toContain('"culture"');
    expect(sentEvents[0]).not.toMatch(/timezone|locale/);
  });

  it("sends the player's note, which only the Send button creates", async () => {
    await Sentry.sendFeedback({ message: "I pressed undo" });
    expect(sent).toEqual([["feedback"]]);
  });
});
