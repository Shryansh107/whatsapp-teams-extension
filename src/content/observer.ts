import { log, logOnce, warnOnce } from "./debug";
import { isLandingScreen, isMainUiPresent, queryFirst } from "./selectors";

export function startObserver(): void {
  let frame = 0;
  let settled = false;

  const inspect = (): void => {
    if (settled) {
      return;
    }

    if (!queryFirst("app")) {
      return;
    }

    logOnce("detected", "WhatsApp UI detected");

    if (isLandingScreen()) {
      logOnce("landing", "Landing / login screen");
      return;
    }

    if (!isMainUiPresent()) {
      return;
    }

    settled = true;
    log("Main interface ready");

    if (!queryFirst("paneSide")) {
      warnOnce("sidebar", "Chat list container not found.");
    }

    observer.disconnect();
  };

  const schedule = (): void => {
    if (settled || frame) {
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

  inspect();
}
