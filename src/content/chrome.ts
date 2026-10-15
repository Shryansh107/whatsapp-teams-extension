import { isLandingScreen, queryFirst } from "./selectors";

const HOST_ID = "whatsapp-teams-chrome";
const TABS = ["Chat", "Shared", "Notes", "Recap", "Storyline"] as const;
const CHIP_LABELS: Record<string, string> = {
  All: "Chats",
  Unread: "Unread",
  Favourites: "Favorites",
  Favorites: "Favorites",
  Groups: "Channels",
};

function ensureHost(): HTMLElement {
  let host = document.getElementById(HOST_ID);
  if (host instanceof HTMLElement) {
    return host;
  }

  host = document.createElement("div");
  host.id = HOST_ID;
  host.setAttribute("aria-hidden", "true");

  const title = document.createElement("div");
  title.className = "teams-chrome-title";
  title.textContent = "Chat";
  host.append(title);

  const tabs = document.createElement("div");
  tabs.className = "teams-chrome-tabs";
  for (const [index, label] of TABS.entries()) {
    const tab = document.createElement("span");
    tab.className = "teams-chrome-tab" + (index === 0 ? " is-active" : "");
    tab.textContent = label;
    tabs.append(tab);
  }
  host.append(tabs);

  const empty = document.createElement("div");
  empty.className = "teams-chrome-empty";
  empty.innerHTML =
    '<div class="teams-chrome-empty-copy"><strong>Select a chat to start messaging</strong><span>Pick a conversation from the list.</span></div>';
  host.append(empty);

  const promo = document.createElement("div");
  promo.className = "teams-chrome-promo";
  host.append(promo);

  document.documentElement.append(host);
  return host;
}

function place(element: HTMLElement, rect: DOMRect | null): void {
  if (!rect || rect.width < 4 || rect.height < 4) {
    element.style.display = "none";
    return;
  }
  element.style.display = "flex";
  element.style.position = "fixed";
  element.style.left = `${Math.round(rect.left)}px`;
  element.style.top = `${Math.round(rect.top)}px`;
  element.style.width = `${Math.round(rect.width)}px`;
  element.style.height = `${Math.round(rect.height)}px`;
}

function appTop(): number {
  const app = queryFirst("app");
  return app instanceof HTMLElement ? app.getBoundingClientRect().top : 0;
}

function getPane(): HTMLElement | null {
  const top = appTop();
  const seeds: HTMLElement[] = [];
  const known = queryFirst("paneSide");
  if (known instanceof HTMLElement) {
    seeds.push(known);
  }
  for (const box of document.querySelectorAll('[contenteditable="true"][role="textbox"]')) {
    if (box instanceof HTMLElement && !box.closest("#main")) {
      seeds.push(box);
    }
  }

  for (const seed of seeds) {
    let node: HTMLElement | null = seed;
    while (node && node !== document.body) {
      const rect = node.getBoundingClientRect();
      if (
        rect.width >= 200 &&
        rect.width <= 720 &&
        rect.height >= 240 &&
        Math.abs(rect.top - top) <= 20
      ) {
        return node;
      }
      node = node.parentElement;
    }
  }
  return known instanceof HTMLElement ? known : null;
}

function tagWhatsAppTitle(pane: HTMLElement): DOMRect | null {
  const paneRect = pane.getBoundingClientRect();
  const nodes = pane.querySelectorAll("h1, h2, span, header, div");
  for (const node of nodes) {
    if (!(node instanceof HTMLElement)) {
      continue;
    }
    const ownText = Array.from(node.childNodes)
      .filter((child) => child.nodeType === Node.TEXT_NODE)
      .map((child) => (child.textContent || "").trim())
      .join("");
    if (ownText !== "WhatsApp") {
      continue;
    }
    const rect = node.getBoundingClientRect();
    if (rect.top > paneRect.top + 72 || rect.height > 56) {
      continue;
    }
    node.setAttribute("data-teams-chat-label", "");
    return rect;
  }
  return null;
}

function tagFilterChips(pane: HTMLElement): void {
  for (const node of pane.querySelectorAll("button, div[role='button']")) {
    if (!(node instanceof HTMLElement)) {
      continue;
    }
    const label = (node.textContent || "").replace(/\s+/g, " ").trim();
    const mapped = CHIP_LABELS[label];
    if (!mapped) {
      continue;
    }
    const selected =
      node.getAttribute("aria-selected") === "true" ||
      node.getAttribute("aria-pressed") === "true" ||
      node.className.includes("selected");
    node.setAttribute("data-teams-chip", selected ? "active" : "");
    node.setAttribute("data-teams-chip-label", mapped);
  }
}

function findPromo(pane: HTMLElement): HTMLElement | null {
  const links = pane.querySelectorAll("a, span, div");
  for (const node of links) {
    if (!(node instanceof HTMLElement)) {
      continue;
    }
    const text = (node.textContent || "").replace(/\s+/g, " ").trim();
    if (!/WhatsApp for Windows/i.test(text) || text.length > 80) {
      continue;
    }
    let box: HTMLElement | null = node;
    while (box && box !== pane) {
      const rect = box.getBoundingClientRect();
      if (rect.height >= 36 && rect.height <= 96 && rect.width >= pane.clientWidth * 0.7) {
        return box;
      }
      box = box.parentElement;
    }
    return node;
  }
  return null;
}

function positionChrome(host: HTMLElement): void {
  const title = host.querySelector(".teams-chrome-title");
  const tabs = host.querySelector(".teams-chrome-tabs");
  const empty = host.querySelector(".teams-chrome-empty");
  const promo = host.querySelector(".teams-chrome-promo");
  if (
    !(title instanceof HTMLElement) ||
    !(tabs instanceof HTMLElement) ||
    !(empty instanceof HTMLElement) ||
    !(promo instanceof HTMLElement)
  ) {
    return;
  }

  const pane = getPane();
  if (pane) {
    const paneRect = pane.getBoundingClientRect();
    const headingRect = tagWhatsAppTitle(pane);
    const cover = headingRect
      ? new DOMRect(
          paneRect.left,
          paneRect.top,
          Math.min(220, Math.max(headingRect.right - paneRect.left + 12, 160)),
          Math.max(48, headingRect.bottom - paneRect.top + 8),
        )
      : new DOMRect(paneRect.left, paneRect.top, Math.min(220, paneRect.width * 0.58), 56);
    place(title, cover);
    tagFilterChips(pane);

    const promoEl = findPromo(pane);
    if (promoEl) {
      promoEl.setAttribute("data-teams-hide", "");
      place(promo, promoEl.getBoundingClientRect());
    } else {
      promo.style.display = "none";
    }
  } else {
    title.style.display = "none";
    promo.style.display = "none";
  }

  const convHeader = queryFirst("conversationHeader");
  if (convHeader instanceof HTMLElement) {
    const rect = convHeader.getBoundingClientRect();
    place(tabs, new DOMRect(rect.left + 72, rect.bottom - 38, Math.max(200, rect.width - 200), 38));
  } else {
    tabs.style.display = "none";
  }

  const conversation = queryFirst("conversation");
  if (!conversation && pane) {
    const paneRect = pane.getBoundingClientRect();
    const app = queryFirst("app");
    const appRect = app?.getBoundingClientRect();
    const left = paneRect.right;
    const top = appRect?.top ?? 0;
    const width = (appRect?.right ?? window.innerWidth) - left;
    const height = appRect?.height ?? window.innerHeight;
    place(empty, new DOMRect(left, top, width, height));
  } else {
    empty.style.display = "none";
  }
}

export function applyChrome(): void {
  const enabled = document.documentElement.classList.contains("teams-mode");
  const existing = document.getElementById(HOST_ID);

  if (!enabled || isLandingScreen()) {
    existing?.remove();
    return;
  }

  if (!document.body) {
    return;
  }

  if (document.querySelector('#app [role="dialog"][aria-modal="true"]')) {
    if (existing) {
      existing.hidden = true;
    }
    return;
  }

  const host = ensureHost();
  host.hidden = false;
  positionChrome(host);
}
