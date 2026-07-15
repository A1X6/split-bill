/**
 * The one place that defines what a username is. Imported by the signup and
 * profile forms (client) and by the better-auth username plugin config (server),
 * so the rule can never drift between where it's entered and where it's enforced.
 *
 * Usernames are stored lowercased by the plugin; only letters, numbers, and
 * underscores are allowed. `displayUsername` keeps the original casing, but the
 * app normalizes input to lowercase so the two stay equal.
 */
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 24;

/** Built from the constants so length limits live in exactly one place. */
export const USERNAME_PATTERN = new RegExp(
  `^[a-z0-9_]{${USERNAME_MIN},${USERNAME_MAX}}$`,
);

/** Trim and lowercase, matching how the plugin stores the username. */
export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

/** True when a normalized username is a valid handle. */
export function isValidUsername(normalized: string): boolean {
  return USERNAME_PATTERN.test(normalized);
}

/** Human-readable rule, shown as helper/hint text under the input. */
export const USERNAME_HINT = `${USERNAME_MIN}–${USERNAME_MAX} characters: letters, numbers, underscore.`;
