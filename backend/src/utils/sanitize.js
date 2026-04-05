/**
 * sanitize.js — Strip HTML tags and null-byte characters from text inputs
 * before writing to the database.
 *
 * Why: express-validator handles structural validation (type, length, format)
 * but doesn't strip embedded HTML. A client sending
 * "<script>alert(1)</script>" as their name would store that in the DB and
 * render it verbatim in the admin dashboard, causing a stored-XSS vector.
 *
 * This utility is intentionally minimal — no external dependency needed.
 */

/**
 * Remove HTML tags and null bytes from a string value.
 * Non-strings (undefined, null, numbers) are returned as-is.
 *
 * @param {*} value
 * @returns {*}
 */
function sanitizeStr(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/<[^>]*>/g, '')   // strip HTML tags
    .replace(/\0/g, '')        // strip null bytes
    .trim();
}

/**
 * Sanitize every string value in a plain object (one level deep).
 * Returns a new object — does not mutate the original.
 *
 * @param {Record<string, *>} obj
 * @returns {Record<string, *>}
 */
function sanitizeFields(obj) {
  const out = {};
  for (const [key, val] of Object.entries(obj)) {
    out[key] = sanitizeStr(val);
  }
  return out;
}

module.exports = { sanitizeStr, sanitizeFields };
