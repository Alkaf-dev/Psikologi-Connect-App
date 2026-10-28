export const CLASS_OPTIONS = [
  { header: 'Program Studi' },
  { value: 'PSI', label: 'PSI' },
  { value: 'HKI', label: 'HKI' },
  { value: 'ES', label: 'ES' },
  { value: 'PGMI', label: 'PGMI' },
  { header: 'Rombongan Belajar (Kelas)' },
  { value: '1A', label: '1A' },
  { value: '1B', label: '1B' },
  { value: '1C', label: '1C' },
]

export const CLASS_FILTER_OPTIONS = [
  { value: 'PSI', label: 'PSI' },
  { value: 'HKI', label: 'HKI' },
  { value: 'ES', label: 'ES' },
  { value: 'PGMI', label: 'PGMI' },
  { value: '1A', label: '1A' },
  { value: '1B', label: '1B' },
  { value: '1C', label: '1C' },
]

export const VALID_CLASS_VALUES = ['PSI', 'HKI', 'ES', 'PGMI', '1A', '1B', '1C']

export function parseClassSelection(rawValue) {
  if (!rawValue) return []

  if (Array.isArray(rawValue)) {
    const cleaned = []
    for (const item of rawValue) {
      cleaned.push(...parseClassSelection(item))
    }
    return VALID_CLASS_VALUES.filter((val) => cleaned.includes(val))
  }

  const text = String(rawValue).trim()
  if (!text) return []

  const selected = new Set()
  const lower = text.toLowerCase()

  // 1. Program Studi detection
  // PSI / Psikologi Islam
  if (/\bpsi\b/i.test(text) || lower.includes('psikologi')) {
    selected.add('PSI')
  }
  // HKI / Hukum Keluarga Islam
  if (/\bhki\b/i.test(text) || lower.includes('hukum keluarga')) {
    selected.add('HKI')
  }
  // ES / Ekonomi Syariah
  if (/\bes\b/i.test(text) || lower.includes('ekonomi')) {
    selected.add('ES')
  }
  // PGMI / Pendidikan Guru Madrasah Ibtidaiyah
  if (/\bpgmi\b/i.test(text) || lower.includes('madrasah') || lower.includes('ibtidaiyah') || lower.includes('pgmi')) {
    selected.add('PGMI')
  }

  // 2. Rombel detection (1A, 1B, 1C)
  if (/\b1a\b/i.test(text)) selected.add('1A')
  if (/\b1b\b/i.test(text)) selected.add('1B')
  if (/\b1c\b/i.test(text)) selected.add('1C')

  // Return strictly canonical values in fixed order
  return VALID_CLASS_VALUES.filter((val) => selected.has(val))
}

export function formatClassDisplay(rawValue) {
  if (!rawValue) return '-'
  const parsed = parseClassSelection(rawValue)
  return parsed.length > 0 ? parsed.join(', ') : String(rawValue)
}

