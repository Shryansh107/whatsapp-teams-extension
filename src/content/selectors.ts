export const selectors = {
  app: ["#app"],
  landing: [".landing-wrapper", ".landing-window"],
  paneSide: [
    "#pane-side",
    "#side",
    '[aria-label="Chat list"]',
    '[data-testid="chat-list"]',
  ],
  conversation: ["#main"],
  conversationHeader: ["#main > header", "#main header"],
  messageList: ['#main [role="application"]', "#main .copyable-area"],
  composer: [
    '#main footer [contenteditable="true"][role="textbox"]',
    '#main [contenteditable="true"][role="textbox"]',
  ],
  rail: [
    'header:has([data-icon="chat"])',
    '[role="navigation"]:has([data-icon="chat"])',
    '[data-icon="chat"]',
    '[data-icon="status-refreshed"]',
    '[data-icon="newsletter"]',
  ],
  chatList: ['#pane-side [role="grid"]', '#pane-side [role="list"]', "#pane-side"],
} as const;

export type SelectorGroup = keyof typeof selectors;

export function queryFirst(group: SelectorGroup): Element | null {
  for (const selector of selectors[group]) {
    try {
      const match = document.querySelector(selector);
      if (match) {
        return match;
      }
    } catch {
      // Invalid selectors should never crash the content script.
    }
  }
  return null;
}

export function isLandingScreen(): boolean {
  return queryFirst("landing") !== null;
}

export function isMainUiPresent(): boolean {
  return (
    queryFirst("paneSide") !== null ||
    queryFirst("rail") !== null ||
    queryFirst("conversation") !== null
  );
}
