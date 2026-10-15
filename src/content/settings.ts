import { applyChrome } from "./chrome";

export type ThemePreference = "light" | "dark" | "system";

export interface Settings {
  teamsMode: boolean;
  theme: ThemePreference;
}

const DEFAULT_SETTINGS: Settings = {
  teamsMode: false,
  theme: "system",
};

const THEME_CLASSES = ["theme-light", "theme-dark", "theme-system"] as const;

function isTheme(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

export function applySettings(settings: Settings): void {
  const root = document.documentElement;
  root.classList.toggle("teams-mode", settings.teamsMode);

  for (const className of THEME_CLASSES) {
    root.classList.remove(className);
  }

  if (settings.teamsMode) {
    root.classList.add(`theme-${settings.theme}`);
  }

  applyChrome();
}

export async function loadSettings(): Promise<Settings> {
  try {
    const stored = await chrome.storage.local.get(["teamsMode", "theme"]);
    return {
      teamsMode: Boolean(stored.teamsMode),
      theme: isTheme(stored.theme) ? stored.theme : DEFAULT_SETTINGS.theme,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function subscribeSettings(onChange: (settings: Settings) => void): void {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") {
      return;
    }
    if (!changes.teamsMode && !changes.theme) {
      return;
    }

    void loadSettings().then(onChange);
  });
}
