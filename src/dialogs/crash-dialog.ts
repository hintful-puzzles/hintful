import * as Sentry from "@sentry/browser";
import { css, html, LitElement, nothing } from "lit";
import { query } from "lit/decorators/query.js";
import { customElement, property, state } from "lit/decorators.js";
import { cssWATweaks } from "../utils/css.ts";
import { reportConsent } from "../utils/report-consent.ts";
import { EXTENSION_ERRORS } from "../utils/sentry.ts";
import { sleep } from "../utils/timing.ts";

// Register components
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/copy-button/copy-button.js";
import "@awesome.me/webawesome/dist/components/checkbox/checkbox.js";
import "@awesome.me/webawesome/dist/components/details/details.js";
import "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import "@awesome.me/webawesome/dist/components/icon/icon.js";
import "@awesome.me/webawesome/dist/components/textarea/textarea.js";

const ignoreErrors: (string | RegExp)[] = [
  "Network error: Response body loading was aborted",
  // Web Awesome: https://github.com/shoelace-style/webawesome/issues/1905:
  /TypeError.*clientX.*handleDragStop/,
  // Web Awesome: https://github.com/shoelace-style/webawesome/issues/1911:
  /TypeError.*(assignedElements|hidePopover).*disconnectedCallback/,
  // Unknown DuckDuckGo complaint. Unanchored: the handlers wrap an error's
  // own text ("Uncaught …  at file:line", "… [unhandled rejection]").
  /\bError: invalid origin\b/,
  // Chrome iOS "Translate" bug (in anonymous script):
  /^RangeError: Maximum call stack size exceeded.*at \?.*undefined:/,
  /^RangeError: Maximum call stack size exceeded.*at findTopmostVisibleElement/,
  // All browsers (but usually Firefox). Sentry ignores this by default:
  "ResizeObserver loop completed with undelivered notifications",
  // Older Chrome bugs (e.g., Huawei Browser 16.0.9 on Android 10)
  "ResizeObserver loop limit exceeded",
  "Failed to execute 'hidePopover' on 'HTMLElement': Invalid on popover elements that aren't already showing.",
  // We don't use eval() or new Function(), so any EvalError is almost
  // certainly caused by an extension (but may be injected into our code)
  "EvalError", // exact message text varies by browser
] as const;

const matches = (patterns: readonly (string | RegExp)[], errorString: string) =>
  patterns.some((pattern) =>
    pattern instanceof RegExp
      ? pattern.test(errorString)
      : errorString.includes(pattern),
  );

async function isErrorInThirdPartyCode(error: unknown) {
  // Borrow Sentry.thirdPartyErrorFilterIntegration's stack trace filtering.
  // The __third_party_code__ flag is set in Sentry.init beforeSend() in main.ts.
  // Sentry's processing is async, so wait a tick for it to finish.
  await sleep(0);
  return error instanceof Error && "__third_party_code__" in error;
}

/**
 * Create and display a crash-dialog for message.
 * (Provide the original error object if available, for better filtering.)
 *
 * If the crash-dialog is already open, adds message to its list
 * (to avoid getting stuck in a repeated error loop).
 */
export async function reportError(message: string, error?: unknown) {
  // (Sentry's longer list of extension errors:
  // https://github.com/getsentry/relay/blob/322fa6f678add6abed4772fb6046cbf7daf4814a/relay-filter/src/browser_extensions.rs#L9-L81)
  const isForeign = matches(EXTENSION_ERRORS, message);
  const isIgnored = isForeign || matches(ignoreErrors, message);
  const isThirdParty = await isErrorInThirdPartyCode(error);
  if (isIgnored || isThirdParty) {
    if (import.meta.env.VITE_SENTRY_DSN) {
      Sentry.addBreadcrumb({
        type: "error",
        category: "error.ignored",
        // An extension's or another site's error is counted and not quoted:
        // its text is the one thing a report must not carry.
        ...(isForeign || isThirdParty ? {} : { message }),
        data: { isIgnored, isThirdParty },
      });
    }
    return;
  }

  try {
    let dialog = document.querySelector("crash-dialog");
    if (!dialog) {
      dialog = document.createElement("crash-dialog");
      document.body.appendChild(dialog);
    }
    if ((await dialog.reportError(message)) && import.meta.env.VITE_SENTRY_DSN) {
      dialog.listed(eventIdFor(message, error));
    }
  } catch (err) {
    if (import.meta.env.VITE_SENTRY_DSN) {
      Sentry.captureException(err);
    }
    console.error("Error while trying to reportError", err, error);
  }
}

/**
 * The report of an error the dialog lists.
 *
 * The SDK captures most errors itself. One it did not (an error event in the
 * worker, a rejection with no Error behind it) is captured here, so that Send
 * report sends what the dialog shows.
 */
function eventIdFor(message: string, error: unknown): string {
  return (
    reportConsent.eventIdOf(error) ??
    (error instanceof Error
      ? Sentry.captureException(error)
      : Sentry.captureMessage(message, "error"))
  );
}

@customElement("crash-dialog")
class CrashDialog extends LitElement {
  private suppressedErrors = new Set<string>();

  // Maximum number of errors to display in the dialog at once
  @property({ type: Number, attribute: "maxErrors" })
  maxErrors = 20;

  @state()
  private errors: string[] = [];

  /** Nothing leaves the device until the player presses Send report. */
  @state()
  private reportState: "unsent" | "sending" | "sent" = "unsent";

  @state()
  private sentryLastEventId = "";

  private listedEventIds: string[] = [];

  @state()
  private suppressErrors = false;

  // Whether the current content of the user description
  // textarea might include an email address.
  @state()
  private mightHavePersonalInfo = false;

  @query("wa-dialog")
  private dialog?: HTMLElementTagNameMap["wa-dialog"];

  @query("wa-textarea")
  private userDescription?: HTMLElementTagNameMap["wa-textarea"];

  reset() {
    this.suppressErrors = false;
    this.errors = [];
    if (this.userDescription) {
      this.userDescription.value = "";
    }
    this.mightHavePersonalInfo = false;
    this.reportState = "unsent";
    this.sentryLastEventId = "";
    this.listedEventIds = [];
  }

  /**
   * If error has previously been ignored, do nothing.
   * Otherwise, if dialog is not open, open it to show error.
   * If dialog is already open, append error to the displayed list.
   * Resolves to whether the dialog shows the error.
   */
  async reportError(errorString: string): Promise<boolean> {
    if (this.suppressedErrors.has(errorString)) {
      return false;
    }
    if (!this.dialog?.open) {
      this.reset();
    }
    this.errors = [...this.errors, errorString];
    // A report already sent did not include this error, so ask again.
    this.reportState = "unsent";

    if (!this.dialog) {
      // reportError before first render
      await this.updateComplete;
    }
    if (this.dialog) {
      this.dialog.open = true;
    }
    return true;
  }

  protected override render() {
    const canReport = Boolean(import.meta.env.VITE_SENTRY_DSN);
    const asking = canReport && this.reportState !== "sent";
    const content = [
      html`
        <div>Uh-oh, an unexpected error occurred. Sorry about that.</div>
        <div>If this keeps happening, try reloading the page.</div>
      `,
    ];

    if (asking) {
      const noPersonal = this.mightHavePersonalInfo ? "highlight" : nothing;
      content.push(html`
        <div>
          You can send a report to the developer, so this can be fixed.
          Nothing is sent unless you choose to.
        </div>
        <details class="contents">
          <summary>What a report includes</summary>
          A report includes the errors the message shows, any other errors
          recorded since the page was opened, and a record of recent activity
          in the app: buttons pressed, pages opened, network requests the app
          made and messages written to the browser’s console. It also includes
          the app’s version, the browser and screen it happened on, and the
          puzzle being played: which game, its type, its game ID and how many
          moves in. It includes a few of the app’s own settings (whether
          offline use and automatic updates are on, and whether the app is
          installed), whether the app had to repair part of its display, and
          any note you add. It does not include your identity or any saved
          game.
        </details>
        <wa-textarea
          label="What were you doing when this happened? (optional)"
          maxlength="1000"
          resize="auto"
          rows="3"
          @input=${this.handleUserDescriptionChange}
          @change=${this.handleUserDescriptionChange}
        >
          <div slot="hint">
            Sent with the report, if you send one.
            (Please <strong class=${noPersonal}>don’t include email addresses</strong>
            or other personal information.)
          </div>
        </wa-textarea>
      `);
    }

    if (this.reportState === "sent") {
      content.push(html`<div>Report sent. Thank you!</div>`);
      if (this.sentryLastEventId) {
        content.push(html`
          <div class="event-id">Event ID (quote it if you open a GitHub issue):<br>
            <span id="event-id">${this.sentryLastEventId}</span>
            <wa-copy-button from="event-id"></wa-copy-button>
          </div>
        `);
      }
    }

    if (this.errors.length > 0) {
      content.push(html`
        <wa-details appearance="plain" open>
          <div slot="summary">Technical details</div>
          ${this.errors
            .slice(-this.maxErrors)
            .map((error) => html`<div>${error}</div>`)}
        </wa-details>
        <wa-checkbox
            .checked=${this.suppressErrors}
            @change=${this.handleSuppressErrorsChange}
        >${
          this.errors.length === 1
            ? "Don’t show this error again"
            : "Don’t show these errors again"
        }</wa-checkbox>
      `);
    }

    const closeButtons = asking
      ? html`
          <wa-button slot="footer" data-dialog="close">Don’t send</wa-button>
          <wa-button
            slot="footer"
            variant="brand"
            ?loading=${this.reportState === "sending"}
            @click=${this.handleSend}
          >Send report</wa-button>
        `
      : html`<wa-button slot="footer" variant="brand" data-dialog="close">Close</wa-button>`;

    return html`
      <wa-dialog @wa-hide=${this.handleDismiss}>
        <wa-icon slot="label" name="error"></wa-icon>
        <div slot="label">Something went wrong</div>
        ${content}
        <wa-button slot="footer" @click=${this.handleReload}>Reload page</wa-button>
        ${closeButtons}
      </wa-dialog>
    `;
  }

  private handleSuppressErrorsChange(event: UIEvent) {
    const checkbox = event.target as HTMLInputElement;
    this.suppressErrors = checkbox.checked;
  }

  private handleUserDescriptionChange() {
    this.mightHavePersonalInfo = /\w+@\w+/.test(this.userDescription?.value ?? "");
  }

  /** The report of an error listed here has this event ID. */
  listed(eventId: string) {
    this.listedEventIds.push(eventId);
    reportConsent.noteListed(eventId);
  }

  /**
   * The player's consent: send everything held, then their note if they wrote
   * one.
   */
  private async handleSend() {
    if (!import.meta.env.VITE_SENTRY_DSN || this.reportState !== "unsent") {
      return;
    }
    this.reportState = "sending";
    const note = this.userDescription?.value?.trim() ?? "";
    try {
      const sent = await reportConsent.release();
      // The ID to quote is that of an error listed here, or none: the SDK's
      // own "last event" may be one captured since, which this press did not
      // send, and the last one sent may be an error the player was never shown.
      const quotable = sent.findLast((id) => this.listedEventIds.includes(id));
      this.sentryLastEventId = quotable ?? "";
      if (note) {
        await Sentry.sendFeedback({
          associatedEventId: this.sentryLastEventId || undefined,
          message: note,
        });
      }
      if (sent.length === 0 && !note) {
        // Nothing was held and nothing was written, so nothing went.
        this.reportState = "unsent";
        return;
      }
    } catch (error: unknown) {
      // Leave the button up to try again; anything captured here is held too.
      console.error("Sending the crash report failed", error);
      Sentry.captureException(error);
      this.reportState = "unsent";
      return;
    }
    // A new error may have arrived meanwhile and asked again.
    if (this.reportState === "sending") {
      this.reportState = "sent";
    }
  }

  private handleDismiss(event: Event) {
    // wa-hide bubbles from nested components (the details panel, the tooltip
    // on the copy button); only the dialog's own closing is a decision.
    if (event.target !== this.dialog) {
      return;
    }
    if (this.suppressErrors) {
      for (const error of this.errors) {
        this.suppressedErrors.add(error);
      }
    }
    // Closing without sending declines. Anything held now was never agreed to.
    reportConsent.discard();
  }

  private handleReload(event: UIEvent) {
    if (event.target instanceof HTMLElement) {
      event.target.setAttribute("loading", "");
    }
    reportConsent.discard();
    window.location.reload();
  }

  static override styles = [
    cssWATweaks,
    css`
      :host {
        display: contents;
      }

      wa-dialog::part(dialog) {
        background-color: var(--wa-color-danger-fill-quiet);
        border-color: var(--wa-color-danger-border-loud);
        border-style: var(--wa-border-style);
        border-width: var(--wa-border-width-l);
      }
      wa-dialog::part(title) {
        display: flex;
        gap: var(--wa-space-xs);
        align-items: flex-start;
      }
      wa-icon[slot="label"] {
        margin-block-start: 0.125em;
        color: var(--wa-color-danger-on-quiet);
      }
      wa-dialog::part(body) {
        display: flex;
        flex-direction: column;
        gap: var(--wa-space-l);
      }
      wa-dialog::part(footer) {
        gap: var(--wa-space-m);
      }

      wa-details {
        display: contents;
      }
      wa-details::part(base) {
        flex: 0 1 auto;
        /* Room for the heading and the first lines of an error: squeezed
         * below that, the dialog shows no error at all and nothing scrolls. */
        min-height: 7em;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        padding-block: var(--wa-space-xs);
        border-block-start:
            var(--wa-color-danger-border-normal)
            var(--wa-border-style)
            var(--wa-border-width-s);
        border-block-end:
            var(--wa-color-danger-border-normal)
            var(--wa-border-style)
            var(--wa-border-width-s);
      }
      wa-details::part(header) {
        padding: 0;
        --spacing: var(--wa-space-xs); /* between caret and summary */
      }
      wa-details::part(content) {
        padding: 0;
        padding-block-start: var(--wa-space-xs);
        font-size: var(--wa-font-size-s);

        flex: 0 1 auto;
        min-height: 3em;
        max-height: 30vh;
        overflow: auto;

        display: flex;
        flex-direction: column;
        gap: var(--wa-space-xs);
      }
      wa-details > div:not([slot]) {
        white-space: pre-wrap;
        line-height: var(--wa-line-height-condensed);
      }

      .event-id {
        line-height: var(--wa-line-height-condensed);
      }
      #event-id {
        user-select: all;
      }
      wa-copy-button::part(button) {
        padding: 0;
        padding-inline-start: var(--wa-space-2xs);
      }

      wa-textarea::part(textarea) {
        max-height: 6lh;
      }
      /* Closed until asked for, so the note box and the buttons fit a phone. */
      .contents > summary {
        cursor: pointer;
        width: fit-content;
      }
      wa-textarea::part(label) {
        font-weight: var(--wa-font-weight-normal);
      }
      .highlight {
        color: var(--wa-color-danger-on-quiet);
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "crash-dialog": CrashDialog;
  }
}
