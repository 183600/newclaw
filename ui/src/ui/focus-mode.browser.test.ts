import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ClawApp } from "./app.ts";

// oxlint-disable-next-line typescript/unbound-method
const originalConnect = ClawApp.prototype.connect;

function mountApp(pathname: string) {
  window.history.replaceState({}, "", pathname);
  const app = document.createElement("claw-app") as ClawApp;
  document.body.append(app);
  return app;
}

beforeEach(() => {
  ClawApp.prototype.connect = () => {
    // no-op: avoid real gateway WS connections in browser tests
  };
  window.__CLAW_CONTROL_UI_BASE_PATH__ = undefined;
  localStorage.clear();
  document.body.innerHTML = "";
});

afterEach(() => {
  ClawApp.prototype.connect = originalConnect;
  window.__CLAW_CONTROL_UI_BASE_PATH__ = undefined;
  localStorage.clear();
  document.body.innerHTML = "";
});

describe("chat focus mode", () => {
  it("collapses header + sidebar on chat tab only", async () => {
    const app = mountApp("/chat");
    await app.updateComplete;

    const shell = app.querySelector(".shell");
    expect(shell).not.toBeNull();
    expect(shell?.classList.contains("shell--chat-focus")).toBe(false);

    const toggle = app.querySelector<HTMLButtonElement>('button[title^="Toggle focus mode"]');
    expect(toggle).not.toBeNull();
    toggle?.click();

    await app.updateComplete;
    expect(shell?.classList.contains("shell--chat-focus")).toBe(true);

    const link = app.querySelector<HTMLAnchorElement>('a.nav-item[href="/channels"]');
    expect(link).not.toBeNull();
    link?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));

    await app.updateComplete;
    expect(app.tab).toBe("channels");
    expect(shell?.classList.contains("shell--chat-focus")).toBe(false);

    const chatLink = app.querySelector<HTMLAnchorElement>('a.nav-item[href="/chat"]');
    chatLink?.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }),
    );

    await app.updateComplete;
    expect(app.tab).toBe("chat");
    expect(shell?.classList.contains("shell--chat-focus")).toBe(true);
  });
});
