export const DEBUG = false;

const seen = new Set<string>();

function format(message: string): string {
  return `[WhatsApp Teams] ${message}`;
}

export function log(message: string): void {
  if (!DEBUG) {
    return;
  }
  console.log(format(message));
}

export function logOnce(key: string, message: string): void {
  if (seen.has(key)) {
    return;
  }
  seen.add(key);
  log(message);
}

export function warnOnce(key: string, message: string): void {
  if (seen.has(key)) {
    return;
  }
  seen.add(key);
  if (!DEBUG) {
    return;
  }
  console.warn(format(message));
}
