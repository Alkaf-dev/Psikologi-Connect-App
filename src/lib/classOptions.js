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

export const PRODI_ALIASES = {
  'psikologi islam': 'PSI',
  'psikologi': 'PSI',
  'hukum keluarga islam': 'HKI',
  'ekonomi syari\'ah': 'ES',
  'ekonomi syariah': 'ES',
  'pendidikan guru madrasah ibtidaiyah': 'PGMI',
}

export function normalizeClassName(className) {
  if (!className) return []
  const rawList = Array.isArray(className)
    ? className
    : String(className).split(',').map((s) => s.trim()).filter(Boolean)

  return rawList.map((item) => {
    const lower = item.toLowerCase()
    return PRODI_ALIASES[lower] || item
  })
}
