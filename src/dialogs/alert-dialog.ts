import { css, html, LitElement, nothing } from "lit";
import { query } from "lit/decorators/query.js";
import { customElement, property } from "lit/decorators.js";
import { cssWATweaks } from "../utils/css.ts";

// Register components
import "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import "@awesome.me/webawesome/dist/components/icon/icon.js";

export interface AlertOptions {
  label?: string;
  message?: string;
  /** What the message is about, where that is a string the app was handed
   * and the player may not be able to read: a game ID, a type. It is drawn
   * after the message, so the words come first at any length. */
  detail?: string;
  type?: "info" | "success" | "warning" | "error";
  icon?: string;
  lightDismiss?: boolean;
}

export async function showAlert(options: AlertOptions) {
  const alert = Object.assign(document.createElement("alert-dialog"), options);
  document.body.appendChild(alert);
  await alert.show();
  alert.remove();
}

@customElement("alert-dialog")
class AlertDialog extends LitElement {
  @property({ type: String })
  label: string = "";

  @property({ type: String })
  message: string = "";

  @property({ type: String })
  detail: string = "";

  @property({ type: String, reflect: true })
  type: Required<AlertOptions>["type"] = "error";

  @property({ type: String })
  icon?: string;

  @property({ type: Boolean, attribute: "light-dismiss" })
  lightDismiss = false;

  closed: Promise<void> = Promise.resolve();

  @query("wa-dialog")
  private dialog?: HTMLElementTagNameMap["wa-dialog"];

  private resolveClosedPromise?: () => void;

  async show() {
    await this.updateComplete;
    const dialog = this.dialog;
    if (dialog && !dialog.open) {
      this.closed = new Promise<void>((resolve) => {
        this.resolveClosedPromise = resolve;
      });
      dialog.open = true;
      await dialog.updateComplete;
    }
    return this.closed;
  }

  protected override render() {
    return html`
      <wa-dialog ?light-dismiss=${this.lightDismiss} @wa-after-hide=${this.handleDialogHide}>
        <wa-icon slot="label" name=${this.icon || this.type}></wa-icon>
        ${this.label ? html`<div slot="label">${this.label}</div>` : nothing}
        ${this.message ? html`<div class="message">${this.message}</div>` : nothing}
        ${this.detail ? html`<div class="detail">${this.detail}</div>` : nothing}
      </wa-dialog>
    `;
  }

  private handleDialogHide() {
    this.resolveClosedPromise?.();
  }

  static override styles = [
    cssWATweaks,
    css`
      :host {
        display: contents;
      }

      wa-dialog {
        --width: min(28rem, calc(100% - 2 * var(--wa-space-l)));
      }
      
      wa-dialog::part(dialog) {
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
      }

      /* A caller's text can hold a string with no space in it that is longer
         than the dialog is wide: a game ID, a file name. */
      .message,
      .detail {
        overflow-wrap: anywhere;
      }
      .detail {
        color: var(--wa-color-text-quiet);
        font-size: var(--wa-font-size-s);
      }
      .message + .detail {
        margin-block-start: var(--wa-space-s);
      }

      :host([type="error"]) {
        wa-dialog::part(dialog) {
          border-color: var(--wa-color-danger-border-loud);
        }
        wa-icon[slot="label"] {
          color: var(--wa-color-danger-fill-loud);
        }
      }

      :host([type="info"]) {
        wa-dialog::part(dialog) {
          border-color: var(--wa-color-brand-border-loud);
        }
        wa-icon[slot="label"] {
          color: var(--wa-color-brand-fill-loud);
        }
      }

      :host([type="success"]) {
        wa-dialog::part(dialog) {
          border-color: var(--wa-color-success-border-loud);
        }
        wa-icon[slot="label"] {
          color: var(--wa-color-success-fill-loud);
        }
      }

      :host([type="warning"]) {
        wa-dialog::part(dialog) {
          border-color: var(--wa-color-warning-border-loud);
        }
        wa-icon[slot="label"] {
          color: var(--wa-color-warning-fill-loud);
        }
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "alert-dialog": AlertDialog;
  }
}
