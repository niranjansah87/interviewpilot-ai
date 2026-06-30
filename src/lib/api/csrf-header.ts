/**
 * Reads the CSRF token from the cookie and returns it as a header.
 * Use in client-side fetch calls for mutating requests.
 *
 * Usage: fetch(url, { headers: { ...csrfHeader(), ... } })
 */
export function csrfHeader(): Record<string, string> {
  if (typeof document === 'undefined') return {};
  const match = document.cookie.match(/(?:^|;\s*)ip_csrf=([^;]*)/);
  return match?.[1] ? { 'x-csrf-token': match[1] } : {};
}
