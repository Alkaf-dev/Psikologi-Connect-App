export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'https://psikologi.abudzargroup.id/api/v1'

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

export async function request(path, options = {}) {
  const {
    method = 'GET',
    body,
    params,
    auth = true,
    headers = {},
  } = options

  const token = session.getToken()
  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  }

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json'
  }

  if (auth && token) {
    requestHeaders.Authorization = `Bearer ${token}`
  }

  let response

  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers: requestHeaders,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
  } catch {
    throw new ApiError(
      'Tidak dapat terhubung ke server. Pastikan API berjalan di ' + API_BASE_URL,
      0,
    )
  }

  const payload = await parseBody(response)

  if (!response.ok) {
    const message =
      payload?.message ||
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
  delete(path, options = {}) {
    return request(path, { ...options, method: 'DELETE' })
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
