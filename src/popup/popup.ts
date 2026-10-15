function requireElement<T extends HTMLElement>(
  id: string,
  guard: (value: HTMLElement) => value is T,
): T {
  const element = document.getElementById(id);
  if (!element || !guard(element)) {
    throw new Error(`Popup markup is missing #${id}.`);
  }
  return element;
}

const teamsModeInput = requireElement("teams-mode", (el): el is HTMLInputElement => {
  return el instanceof HTMLInputElement;
});
const appearance = requireElement("appearance", (el): el is HTMLElement => true);
const themeInputs = Array.from(
  document.querySelectorAll<HTMLInputElement>('input[name="theme"]'),
);

function setThemeRadios(theme: string): void {
  for (const input of themeInputs) {
    input.checked = input.value === theme;
  }
}

function setAppearanceEnabled(enabled: boolean): void {
  appearance.classList.toggle("is-disabled", !enabled);
  for (const input of themeInputs) {
    input.disabled = !enabled;
  }
}

async function restore(): Promise<void> {
  const stored = await chrome.storage.local.get(["teamsMode", "theme"]);
  const teamsMode = Boolean(stored.teamsMode);
  const theme = stored.theme === "light" || stored.theme === "dark" ? stored.theme : "system";

  teamsModeInput.checked = teamsMode;
  setThemeRadios(theme);
  setAppearanceEnabled(teamsMode);
}

teamsModeInput.addEventListener("change", () => {
  const teamsMode = teamsModeInput.checked;
  setAppearanceEnabled(teamsMode);
  void chrome.storage.local.set({ teamsMode });
});

for (const input of themeInputs) {
  input.addEventListener("change", () => {
    if (input.checked) {
      void chrome.storage.local.set({ theme: input.value });
    }
  });
}

void restore();
