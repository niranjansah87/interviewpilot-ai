/**
 * Time and date utilities.
 */

/**
 * Returns the current UTC ISO string.
 */
export function utcNow(): string {
  return new Date().toISOString();
}

/**
 * Returns the current UTC Unix timestamp in seconds.
 */
export function unixNow(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Adds a duration to a date, returning a new Date.
 */
export function addDuration(date: Date, duration: Duration): Date {
  return new Date(date.getTime() + duration.toMillis);
}

/**
 * Duration type — supports chaining with .add(), .sub(), .toMillis(), etc.
 */
export class Duration {
  private constructor(private readonly _ms: number) {}

  static seconds(n: number): Duration {
    return new Duration(n * 1000);
  }
  static minutes(n: number): Duration {
    return new Duration(n * 60 * 1000);
  }
  static hours(n: number): Duration {
    return new Duration(n * 60 * 60 * 1000);
  }
  static days(n: number): Duration {
    return new Duration(n * 24 * 60 * 60 * 1000);
  }

  get toMillis(): number {
    return this._ms;
  }
  get toSeconds(): number {
    return Math.floor(this._ms / 1000);
  }

  add(other: Duration): Duration {
    return new Duration(this._ms + other._ms);
  }
  sub(other: Duration): Duration {
    return new Duration(this._ms - other._ms);
  }
}

/**
 * Returns a Unix timestamp from a Date.
 */
export function toUnix(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/**
 * Converts a Unix timestamp to a Date.
 */
export function fromUnix(unix: number): Date {
  return new Date(unix * 1000);
}
