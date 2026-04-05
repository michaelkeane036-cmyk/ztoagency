/**
 * Thin wrapper around fetch.
 * - Always sends credentials (httpOnly cookies for auth).
 * - Throws on non-2xx responses with the server's error message.
 * - In development the Vite proxy forwards /api → localhost:4000,
 *   so we never hardcode the backend URL.
 */

// In development, Vite proxies /api → localhost:4000 so no absolute URL needed.
// In production, VITE_API_URL must be set to your Railway backend URL (no trailing slash).
// e.g. https://ztoagency-backend.up.railway.app
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

async function request(method, path, body) {
  const opts = {
    method,
    credentials: 'include',
    headers: {},
  }
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }
  const res  = await fetch(`${BASE}${path}`, opts)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status, data })
  return data
}

export const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  patch:  (path, body)  => request('PATCH',  path, body),
  delete: (path)        => request('DELETE', path),
}
