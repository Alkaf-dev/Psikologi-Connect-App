import { useId, useState } from 'react'
import { AlertTriangle, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react'
import { api, errorMessage } from '../lib/api'
import { fetchAll } from '../hooks/useApiData'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Button, Field, Input, Modal } from './ui'

const DEFAULT_PASSWORD = '12345678'
const REQUEST_INTERVAL_MS = 1150
const RATE_LIMIT_WAIT_MS = 61000

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export default function BulkResetPasswordModal({ open, onClose }) {
  const { user: currentUser, logout } = useAuth()
  const { toast } = useToast()
  const formId = useId()
  const [password, setPassword] = useState(DEFAULT_PASSWORD)
  const [showPassword, setShowPassword] = useState(false)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [result, setResult] = useState(null)

  const close = () => {
    if (running) return
    setError('')
    setResult(null)
    setProgress({ done: 0, total: 0 })
    setPassword(DEFAULT_PASSWORD)
    setShowPassword(false)
    onClose?.()
  }

  const resetOne = async (userId, nextPassword) => {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        await api.post(`/staff/users/${userId}/reset-password`, { password: nextPassword })
        return
      } catch (resetError) {
        if (resetError?.status === 429 && attempt === 0) {
          await wait(RATE_LIMIT_WAIT_MS)
          continue
        }
        throw resetError
      }
    }
  }

  const run = async (event) => {
    event.preventDefault()

    if (password.length < 8) {
      setError('Password minimal 8 karakter.')
      return
    }

    setRunning(true)
    setError('')
    setResult(null)

    try {
      const users = await fetchAll('/staff/users', {
        per_page: 500,
        sort: 'name',
        direction: 'asc',
      })

      const currentId = currentUser?.id
      const isSelf = (user) => String(user.id) === String(currentId)
      const ordered = [...users.filter((user) => !isSelf(user)), ...users.filter(isSelf)]

      if (ordered.length === 0) {
        setError('Tidak ada akun yang bisa direset.')
        return
      }

      const failures = []
      let done = 0
      setProgress({ done, total: ordered.length })

      for (const target of ordered) {
        try {
          await resetOne(target.id, password)
        } catch (resetError) {
          failures.push({ name: target.name, message: errorMessage(resetError) })
        }

        done += 1
        setProgress({ done, total: ordered.length })

        if (done < ordered.length) {
          await wait(REQUEST_INTERVAL_MS)
        }
      }

      const selfReset = ordered.some(isSelf)
      setResult({ total: ordered.length, failures, selfReset })

      if (failures.length === 0) {
        toast.success('Reset semua password selesai', `${ordered.length} akun berhasil direset.`)
      } else {
        toast.warning(
          'Reset semua password selesai dengan catatan',
          `${ordered.length - failures.length} akun berhasil, ${failures.length} akun gagal.`,
        )
      }

      setRunning(false)

      if (selfReset) {
        toast.info(
          'Sesi Anda diakhiri',
          `Akun Anda juga direset. Silakan login ulang memakai password ${password}.`,
        )
        await wait(1500)
        await logout()
      }
    } catch (runError) {
      setError(errorMessage(runError))
      toast.error('Gagal reset semua password', errorMessage(runError))
    } finally {
      setRunning(false)
    }
  }

  const percent = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0

  return (
    <Modal
      open={open}
      onClose={close}
      title="Reset Semua Password"
      description="Reset password seluruh akun user sekaligus, termasuk admin/PJMK dan akun Anda sendiri."
      size="sm"
      footer={
        result ? (
          <Button onClick={close}>Tutup</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={close} disabled={running}>
              Batal
            </Button>
            <Button type="submit" form={formId} variant="danger" loading={running} disabled={running}>
              <KeyRound className="h-4 w-4" />
              Reset semua
            </Button>
          </>
        )
      }
    >
      {result ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <p className="font-semibold">{result.total - result.failures.length} akun berhasil direset.</p>
            {result.failures.length > 0 ? (
              <p className="mt-1 text-emerald-700">{result.failures.length} akun gagal direset.</p>
            ) : null}
          </div>

          {result.failures.length > 0 ? (
            <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              {result.failures.map((failure, index) => (
                <p key={`${failure.name}-${index}`}>
                  <span className="font-semibold">{failure.name}</span>: {failure.message}
                </p>
              ))}
            </div>
          ) : null}

          {result.selfReset ? (
            <p className="text-xs leading-5 text-slate-500">
              Sesi Anda akan diakhiri karena akun Anda ikut direset. Login ulang dengan password baru.
            </p>
          ) : null}
        </div>
      ) : (
        <form id={formId} onSubmit={run} className="space-y-4">
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Semua sesi login seluruh user akan dicabut dan semua akun memakai password yang sama.
              Gunakan hanya untuk keadaan mendesak.
            </p>
          </div>

          {error ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">{error}</p>
          ) : null}

          <Field label="Password baru untuk semua akun" htmlFor={`${formId}-password`} required help="Minimal 8 karakter.">
            <div className="relative">
              <Input
                id={`${formId}-password`}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Masukkan password baru"
                autoComplete="new-password"
                className="pr-10"
                disabled={running}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((show) => !show)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          {running ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Mereset password...
                </span>
                <span>
                  {progress.done}/{progress.total}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-teal-600 transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="text-[11px] leading-5 text-slate-500">
                Diproses bertahap agar tidak melebihi batas permintaan API. Jangan tutup halaman ini
                selama proses berjalan.
              </p>
            </div>
          ) : null}
        </form>
      )}
    </Modal>
  )
}
