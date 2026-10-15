# WhatsApp Teams Theme

A Manifest V3 Chromium extension that restyles [WhatsApp Web](https://web.whatsapp.com/) with a Microsoft Teams-inspired look. WhatsApp itself is unchanged: sending, receiving, search, media, calls, and login all keep working.

This is a visual theme. It is not a Teams client, and it does not talk to Microsoft.

## Installation

1. Clone or download this project.
2. Install dependencies: `npm install`
3. Build the extension: `npm run build`
4. Open `chrome://extensions`
5. Enable **Developer mode**
6. Click **Load unpacked**
7. Select the `dist` directory
8. Open [WhatsApp Web](https://web.whatsapp.com/)

Works in Chrome, Edge, Brave, and other Chromium browsers.

## Usage

1. Open WhatsApp Web and log in as usual.
2. Click the extension icon.
3. Turn **Teams Mode** on.
4. Choose **Light**, **Dark**, or **System**.

The choice is stored in `chrome.storage.local` and applies immediately, without reloading the tab.

Turn Teams Mode off to restore WhatsApp's original UI. The extension does not wrap or clone WhatsApp's DOM, so nothing is left behind.

## Architecture

```text
Popup
  ↓
chrome.storage.local  (teamsMode, theme)
  ↓
Content script        (toggles html.teams-mode + theme-*)
  ↓
CSS                   (WhatsApp Design System tokens + layout)
  ↓
Existing WhatsApp DOM
```

- **Popup** writes `{ teamsMode, theme }`.
- **Content script** runs at `document_start`, reads storage, and sets classes on `document.documentElement`.
- **CSS** is injected by the manifest and does nothing unless `html.teams-mode` is present.
- Colors go through WhatsApp's `--WDS-*` variables so bubbles, chrome, and drawers pick up the theme without hashed class names.
- A MutationObserver only waits until the main UI appears after login, then disconnects. It does not restyle nodes.

The native left rail (Chats, Status, Channels, Communities, Settings) is restyled in place. The extension does not inject a fake Teams navigation bar.

## Development

```text
npm run watch      # rebuild on change
npm run typecheck  # tsc --noEmit
```

Verbose logs: set `DEBUG` to `true` in `src/content/debug.ts` and rebuild. You should see:

```text
[WhatsApp Teams] Extension initialized
[WhatsApp Teams] WhatsApp UI detected
[WhatsApp Teams] Teams mode enabled
```

WhatsApp changes its DOM often. Fragile selectors live in `src/content/selectors.ts`. If a landmark disappears, other styling should keep working.

## Load unpacked path

Always load **`dist/`**, not the repo root. `dist/` is produced by `npm run build`.
