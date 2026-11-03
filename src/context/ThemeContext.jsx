import { createContext, useContext, useEffect, useState } from 'react'

const THEME_STORAGE_KEY = 'psikologi_theme'

export const THEMES = [
  {
    id: 'light',
    name: 'Light',
    label: 'Cerah',
    desc: 'Bersih & segar untuk siang hari',
    icon: 'Sun',
    accentColor: '#0d9488',
    previewBg: '#f6f8fb',
    previewCard: '#ffffff',
  },
  {
    id: 'dark',
    name: 'Dark',
    label: 'Gelap',
    desc: 'Nyaman di mata saat malam',
    icon: 'Moon',
    accentColor: '#14b8a6',
    previewBg: '#0b1120',
    previewCard: '#1e293b',
  },
  {
    id: 'soft',
    name: 'Soft Sage',
    label: 'Teduh',
    desc: 'Nuansa hijau sage relaksasi',
    icon: 'Leaf',
    accentColor: '#3b7a57',
    previewBg: '#eef3f0',
    previewCard: '#f8faf9',
  },
  {
    id: 'sepia',
    name: 'Warm Sepia',
    label: 'Mode Baca',
    desc: 'Warna hangat kertas buku',
    icon: 'BookOpen',
    accentColor: '#a05a2c',
    previewBg: '#f4ecd8',
    previewCard: '#fdf8ee',
  },
]

const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {},
  themes: THEMES,
})

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    if (saved && THEMES.some((t) => t.id === saved)) {
      return saved
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light'
  })

  const setTheme = (newTheme) => {
    if (THEMES.some((t) => t.id === newTheme)) {
      setThemeState(newTheme)
      localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    }
  }

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    root.classList.remove('theme-light', 'theme-dark', 'theme-soft', 'theme-sepia')
    root.classList.add(`theme-${theme}`)

    // Update meta theme-color for mobile address bar
    let themeMeta = document.querySelector('meta[name="theme-color"]')
    if (!themeMeta) {
      themeMeta = document.createElement('meta')
      themeMeta.name = 'theme-color'
      document.head.appendChild(themeMeta)
    }
    const colors = {
      light: '#f6f8fb',
      dark: '#0b1120',
      soft: '#eef3f0',
      sepia: '#f4ecd8',
    }
    themeMeta.content = colors[theme] || '#0d9488'
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
