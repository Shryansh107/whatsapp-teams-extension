import { applyChrome } from "./chrome";
import { log, logOnce, warnOnce } from "./debug";
import { isLandingScreen, isMainUiPresent, queryFirst } from "./selectors";

export function startObserver(): void {
  let frame = 0;
  let loggedReady = false;

  const inspect = (): void => {
    if (!queryFirst("app")) {
      return;
    }

    logOnce("detected", "WhatsApp UI detected");

    if (isLandingScreen()) {
      logOnce("landing", "Landing / login screen");
      applyChrome();
      return;
    }

    if (!isMainUiPresent()) {
      applyChrome();
      return;
    }

    if (!loggedReady) {
      loggedReady = true;
      log("Main interface ready");
      if (!queryFirst("paneSide")) {
        warnOnce("sidebar", "Chat list container not found.");
      }
    }

    applyChrome();
  };

  const schedule = (): void => {
    if (frame) {
      return;
    }
    frame = requestAnimationFrame(() => {
      frame = 0;
      inspect();
    });
  };

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  window.addEventListener("resize", schedule, { passive: true });

  inspect();
}
