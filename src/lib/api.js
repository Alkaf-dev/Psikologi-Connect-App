export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'https://api.bysherzad.web.id/api/v1'

const TOKEN_KEY = 'psikologi_connect_token'
const USER_KEY = 'psikologi_connect_user'

export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

export const session = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY) || ''
  },
  getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },
  save(token, user) {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  saveUser(user) {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}

function buildUrl(path, params) {
  const base = API_BASE_URL.replace(/\/$/, '')
  const url = new URL(`${base}${path.startsWith('/') ? path : `/${path}`}`, window.location.origin)

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return

    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry !== undefined && entry !== null && entry !== '') {
          url.searchParams.append(`${key}[]`, entry)
        }
      })
      return
    }

    url.searchParams.set(key, String(value))
  })

  return url.toString()
}

async function parseBody(response) {
  if (response.status === 204) return null

  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

const NETWORK_RETRY_DELAYS = [600, 1500]
const RETRYABLE_STATUSES = new Set([502, 503, 504])
const REQUEST_TIMEOUT_MS = 20000

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export async function request(path, options = {}) {
  const {
    method = 'GET',
    body,
    params,
    auth = true,
    headers = {},
  } = options

  const url = buildUrl(path, params)
  const token = session.getToken()
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData

  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  }

  if (body !== undefined && !isFormData) {
    requestHeaders['Content-Type'] = 'application/json'
  }

  if (auth && token) {
    requestHeaders.Authorization = `Bearer ${token}`
  }

  const canRetry = method === 'GET' || method === 'HEAD'
  const maxAttempts = canRetry ? NETWORK_RETRY_DELAYS.length + 1 : 1
  let response = null

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    response = null

    const controller = canRetry && typeof AbortController !== 'undefined' ? new AbortController() : null
    const timeoutId = controller
      ? window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
      : null

    try {
      response = await fetch(url, {
        method,
        headers: requestHeaders,
        ...(controller ? { signal: controller.signal } : {}),
        ...(body !== undefined ? { body: isFormData ? body : JSON.stringify(body) } : {}),
      })
    } catch {
      response = null
    } finally {
      if (timeoutId !== null) window.clearTimeout(timeoutId)
    }

    const transientStatus = response !== null && RETRYABLE_STATUSES.has(response.status)

    if ((response === null || transientStatus) && attempt < maxAttempts) {
      await sleep(NETWORK_RETRY_DELAYS[attempt - 1])
      continue
    }

    break
  }

  if (!response) {
    throw new ApiError(
      'Tidak dapat terhubung ke server. Periksa koneksi internet Anda, lalu coba lagi. (' +
        API_BASE_URL +
        ')',
      0,
    )
  }

  const payload = await parseBody(response)

  if (!response.ok) {
    const retryAfter = Number(response.headers.get('Retry-After'))

    const message =
      response.status === 429
        ? `Terlalu banyak permintaan. Silakan coba lagi${
            Number.isFinite(retryAfter) && retryAfter > 0 ? ` dalam ${retryAfter} detik` : ' beberapa saat lagi'
          }.`
        : payload?.message ||
          (response.status === 401
            ? 'Sesi Anda telah berakhir. Silakan masuk kembali.'
            : 'Permintaan tidak dapat diproses.')

    if (response.status === 401 && auth && token) {
      window.dispatchEvent(new CustomEvent('psikologi:unauthorized'))
    }

    throw new ApiError(message, response.status, payload?.errors ?? {})
  }

  return payload
}

export const api = {
  get(path, params, options = {}) {
    return request(path, { ...options, method: 'GET', params })
  },
  post(path, body, options = {}) {
    return request(path, { ...options, method: 'POST', body })
  },
  put(path, body, options = {}) {
    return request(path, { ...options, method: 'PUT', body })
  },
  patch(path, body, options = {}) {
    return request(path, { ...options, method: 'PATCH', body })
  },
  delete(path, options = { }) {
    return request(path, { ...options, method: 'DELETE' })
  },
  upload(path, formData, options = { }) {
    return request(path, { ...options, method: 'POST', body: formData })
  },
  getUserProfile(id) {
    return this.get(`/auth/profile/${id}`)
  },
}

export function errorMessage(error, fallback = 'Terjadi kesalahan.') {
  if (!error) return fallback

  if (error.errors && Object.keys(error.errors).length > 0) {
    const first = Object.values(error.errors)[0]
    if (Array.isArray(first) && first.length > 0) return first[0]
    if (typeof first === 'string') return first
  }

  return error.message || fallback
}
