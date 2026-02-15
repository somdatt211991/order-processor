export function generateOrderId(prefix?: string): string {
  // ISO timestamp like "2026-02-08T12:34:56.789Z"
  const iso = new Date().toISOString();
  // Normalize to a filesystem/URL-safe form: replace ":" and "." with "-"
  const ts = iso.replace(/[:.]/g, "-");
  // Add a short random string to reduce collision risk when called rapidly
  const rand = Math.random().toString(36).slice(2, 8); // 6 chars
  return `${prefix ? `${prefix}-` : ""}${ts}-${rand}`;
}