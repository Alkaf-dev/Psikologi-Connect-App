import { Component } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from './ui'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">Halaman tidak dapat ditampilkan</h1>
          <p className="mt-2 text-sm text-slate-500">
            Terjadi kesalahan saat memuat halaman. Coba muat ulang atau kembali ke beranda.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Button onClick={() => window.location.reload()}>
              <RotateCcw className="h-4 w-4" />
              Muat ulang
            </Button>
            <Button as={Link} to="/" variant="secondary">
              Ke beranda
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
