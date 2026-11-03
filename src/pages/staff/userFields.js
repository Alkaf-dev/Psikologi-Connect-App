import { CLASS_OPTIONS, parseClassSelection } from '../../lib/classOptions'

export const roleOptions = [
  { value: 'mahasiswa', label: 'Mahasiswa (Akses Portal Mahasiswa)' },
  { value: 'pjmk', label: 'Admin (Akses Panel Admin)' },
  { value: 'super_admin', label: 'Super Admin (Akses Penuh Sistem)' },
]

export function parseUserRoles(user) {
  if (!user) return ['mahasiswa']
  const key = user.id || user.email

  if (key) {
    try {
      const stored = localStorage.getItem('psikologi_roles_' + key)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
  }

  if (Array.isArray(user.roles) && user.roles.length > 0) {
    return user.roles.map((r) => (typeof r === 'object' && r ? r.name || r.value : r))
  }
  if (typeof user.roles === 'string' && user.roles.trim()) {
    return user.roles.split(',').map((s) => s.trim()).filter(Boolean)
  }

  if (user.role === 'super_admin' || user.role === 'pjmk') {
    return ['mahasiswa', user.role]
  }

  return [user.role || 'mahasiswa']
}

export function buildUserFields({ studentOnly = false } = {}) {
  return [
    { name: 'name', label: 'Nama lengkap', type: 'text', required: true },
    { name: 'npm', label: 'NIM / NIP', type: 'text', required: true, placeholder: 'mis. 2024001' },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'nama@psikologi.test' },
    ...(studentOnly
      ? []
      : [
          {
            name: 'roles',
            label: 'Role akun (Bisa pilih beberapa role)',
            type: 'multiselect',
            required: true,
            colSpan: 2,
            options: roleOptions,
            help: 'Centang satu atau lebih role untuk akun ini. Misalnya: Mahasiswa + Admin (Multi-Role).',
          },
        ]),
    {
      name: 'prodi_id',
      label: 'Program studi',
      type: 'select',
      required: true,
      placeholder: 'Pilih program studi',
      options: (values, lookups) => lookups.programs || [],
    },
    {
      name: 'class_name',
      label: 'Kelas',
      type: 'multiselect',
      outputString: true,
      colSpan: 2,
      options: CLASS_OPTIONS,
      parseValue: parseClassSelection,
      required: (values) => {
        const r = Array.isArray(values.roles) ? values.roles : (values.role ? [values.role] : [])
        return r.includes('mahasiswa')
      },
      help: 'Centang kelas mahasiswa (misal: PSI, 1A).',
    },
    {
      name: 'cohort',
      label: 'Angkatan',
      type: 'text',
      placeholder: 'mis. 2024',
      maxLength: 10,
    },
    { name: 'phone', label: 'Nomor telepon', type: 'text', placeholder: '0812-0000-0000' },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      requiredOnCreate: true,
      autoComplete: 'new-password',
      help: 'Minimal 8 karakter. Kosongkan saat edit jika password tidak diubah.',
    },
    {
      name: 'active',
      label: 'Akun aktif',
      type: 'checkbox',
      colSpan: 2,
      help: 'Akun nonaktif tidak dapat login ke portal maupun panel admin.',
    },
  ]
}

export function emptyUserValues({ role = 'mahasiswa', roles } = {}) {
  const initialRoles = roles || (role === 'pjmk' || role === 'super_admin' ? ['mahasiswa', role] : [role])
  return {
    name: '',
    npm: '',
    email: '',
    role: initialRoles.includes('super_admin') ? 'super_admin' : (initialRoles.includes('pjmk') ? 'pjmk' : 'mahasiswa'),
    roles: initialRoles,
    prodi_id: '',
    class_name: '',
    cohort: String(new Date().getFullYear()),
    phone: '',
    password: '',
    active: true,
  }
}

export function userToForm(user) {
  const roles = parseUserRoles(user)
  return {
    ...user,
    role: roles.includes('super_admin') ? 'super_admin' : (roles.includes('pjmk') ? 'pjmk' : 'mahasiswa'),
    roles,
    class_name: user.class_name || '',
    cohort: user.cohort || '',
    phone: user.phone || '',
    password: '',
    active: Boolean(user.active),
  }
}

export function userToPayload(payload, { forcedRole, programs } = {}) {
  let roles = []
  if (Array.isArray(payload.roles)) {
    roles = payload.roles
  } else if (typeof payload.roles === 'string' && payload.roles.trim()) {
    roles = payload.roles.split(',').map((s) => s.trim()).filter(Boolean)
  } else if (payload.role) {
    roles = [payload.role]
  } else {
    roles = ['mahasiswa']
  }

  let primaryRole = 'mahasiswa'
  if (roles.includes('super_admin')) primaryRole = 'super_admin'
  else if (roles.includes('pjmk')) primaryRole = 'pjmk'
  else if (roles.length > 0) primaryRole = roles[0]

  const finalRole = forcedRole || primaryRole

  const key = payload.id || payload.email
  if (key) {
    try {
      localStorage.setItem('psikologi_roles_' + key, JSON.stringify(roles))
    } catch {}
  }

  const program = (programs || []).find((option) => option.value === payload.prodi_id)

  return {
    ...payload,
    role: finalRole,
    roles,
    class_name: payload.class_name || '',
    cohort: payload.cohort || '',
    password: payload.password || null,
    prodi_id: payload.prodi_id || program?.value,
  }
}
