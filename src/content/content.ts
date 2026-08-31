import { log } from "./debug";
import { startObserver } from "./observer";
import { applySettings, loadSettings, subscribeSettings } from "./settings";

function init(): void {
  log("Extension initialized");

  void loadSettings().then((settings) => {
    applySettings(settings);
    if (settings.teamsMode) {
      log("Teams mode enabled");
    }
  });

  subscribeSettings((settings) => {
    applySettings(settings);
    log(settings.teamsMode ? "Teams mode enabled" : "Teams mode disabled");
  });

  startObserver();
}

init();
