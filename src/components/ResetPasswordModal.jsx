import { useEffect, useId, useState } from 'react'
import { AlertCircle, Eye, EyeOff, KeyRound } from 'lucide-react'
import { api, errorMessage } from '../lib/api'
import { useToast } from '../context/ToastContext'
import { Avatar, Button, Field, Input, Modal } from './ui'

export default function ResetPasswordModal({ open, user, onClose }) {
  const { toast } = useToast()
  const formId = useId()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setPassword('')
    setConfirmation('')
    setShowPassword(false)
    setSaving(false)
    setError('')
  }, [open, user?.id])

  const submit = async (event) => {
    event.preventDefault()
    if (!user) return

    if (password.length < 8) {
      setError('Password minimal 8 karakter.')
      return
    }

    if (password !== confirmation) {
      setError('Konfirmasi password tidak cocok.')
      return
    }

    setSaving(true)
    setError('')

    try {
      await api.post(`/staff/users/${user.id}/reset-password`, { password })
      toast.success(
        'Password berhasil direset',
        `Password ${user.name} telah diperbarui. Semua sesi login pengguna ini otomatis dicabut.`,
      )
      onClose?.()
    } catch (resetError) {
      const message = errorMessage(resetError)
      setError(message)
      toast.error('Gagal mereset password', message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reset Password"
      description="Buat password baru tanpa mengubah data profil pengguna."
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button type="submit" form={formId} loading={saving} disabled={!user}>
            <KeyRound className="h-4 w-4" />
            Reset password
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} className="space-y-4">
        {user ? (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
            <Avatar name={user.name} className="h-10 w-10" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
              <p className="truncate text-xs text-slate-500">
                {user.npm ? `NIM ${user.npm} · ` : ''}
                {user.email}
              </p>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}

        <Field label="Password baru" htmlFor={`${formId}-password`} required help="Minimal 8 karakter.">
          <div className="relative">
            <Input
              id={`${formId}-password`}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Masukkan password baru"
              autoComplete="new-password"
              className="pr-10"
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

        <Field
          label="Konfirmasi password"
          htmlFor={`${formId}-confirmation`}
          required
          error={confirmation && password !== confirmation ? 'Konfirmasi password tidak cocok.' : undefined}
        >
          <Input
            id={`${formId}-confirmation`}
            type={showPassword ? 'text' : 'password'}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder="Ulangi password baru"
            autoComplete="new-password"
            error={Boolean(confirmation && password !== confirmation)}
            required
          />
        </Field>
      </form>
    </Modal>
  )
}
