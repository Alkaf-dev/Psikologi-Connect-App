export const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function parseDate(value) {
  if (!value) return null

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  let text = String(value).trim()
  if (!text) return null

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(text)) {
    text = text.replace(' ', 'T')
  }

  const date = new Date(text)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(value, options = {}) {
  const date = parseDate(value)
  if (!date) return options.fallback ?? '-'

  const { time = false, long = false, fallback = '-' } = options

  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: long ? 'long' : 'short',
      year: 'numeric',
      ...(time ? { hour: '2-digit', minute: '2-digit' } : {}),
    }).format(date)
  } catch {
    return fallback
  }
}

export function formatDateTime(value, options = {}) {
  return formatDate(value, { ...options, time: true })
}

export function formatDayDate(value) {
  const date = parseDate(value)
  if (!date) return '-'

  try {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  } catch {
    return '-'
  }
}

export function toDateInput(value) {
  const date = parseDate(value)
  if (!date) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function toDateTimeInput(value) {
  const date = parseDate(value)
  if (!date) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function toApiDateTime(value) {
  if (!value) return ''
  const date = parseDate(value)
  if (!date) return String(value)

  const pad = (number) => String(number).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
}

export function initials(name) {
  const parts = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) return 'PC'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}

export function truncate(value, length = 160) {
  const text = String(value ?? '')
  if (text.length <= length) return text
  return `${text.slice(0, length).trimEnd()}...`
}

export function isTruthy(value) {
  return ['1', 'true', 'yes', 'ya', true].includes(value)
}

export function statusTone(status) {
  switch (status) {
    case 'active':
    case 'graded':
      return 'success'
    case 'submitted':
    case 'late':
      return 'warning'
    case 'completed':
      return 'info'
    case 'draft':
      return 'neutral'
    default:
      return 'neutral'
  }
}

export function pluralize(count, singular, plural = `${singular}-${singular}`) {
  return `${count} ${count === 1 ? singular : plural}`
}

export function groupBy(items, key) {
  return items.reduce((result, item) => {
    const value = typeof key === 'function' ? key(item) : item[key]
    result[value] = result[value] ?? []
    result[value].push(item)
    return result
  }, {})
}

export function uniqueBy(items, key) {
  const seen = new Set()
  return items.filter((item) => {
    const value = typeof key === 'function' ? key(item) : item[key]
    if (seen.has(value)) return false
    seen.add(value)
    return true
  })
}

export function dayOrder(day) {
  const index = DAYS.indexOf(day)
  return index === -1 ? 99 : index
}
