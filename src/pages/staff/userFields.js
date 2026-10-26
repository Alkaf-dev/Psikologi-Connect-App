export const roleOptions = [
  { value: 'mahasiswa', label: 'Mahasiswa' },
  { value: 'pjmk', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
]

export function buildUserFields({ studentOnly = false } = {}) {
  return [
    { name: 'name', label: 'Nama lengkap', type: 'text', required: true },
    { name: 'npm', label: 'NIM / NIP', type: 'text', required: true, placeholder: 'mis. 2024001' },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'nama@psikologi.test' },
    ...(studentOnly
      ? []
      : [
          {
            name: 'role',
            label: 'Role akun',
            type: 'select',
            required: true,
            options: roleOptions,
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
      type: 'text',
      placeholder: 'mis. Psikologi A',
      required: (values) => values.role === 'mahasiswa',
      help: 'Wajib untuk mahasiswa.',
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

export function emptyUserValues({ role = 'mahasiswa' } = {}) {
  return {
    name: '',
    npm: '',
    email: '',
    role,
    prodi_id: '',
    class_name: '',
    cohort: String(new Date().getFullYear()),
    phone: '',
    password: '',
    active: true,
  }
}

export function userToForm(user) {
  return {
    ...user,
    role: user.role || 'mahasiswa',
    class_name: user.class_name || '',
    cohort: user.cohort || '',
    phone: user.phone || '',
    password: '',
    active: Boolean(user.active),
  }
}

export function userToPayload(payload, { forcedRole, programs } = {}) {
  const role = forcedRole || payload.role
  const program = (programs || []).find((option) => option.value === payload.prodi_id)

  return {
    ...payload,
    role,
    class_name: role === 'mahasiswa' ? payload.class_name || '' : '',
    cohort: role === 'mahasiswa' ? payload.cohort || '' : '',
    password: payload.password || null,
    prodi_id: payload.prodi_id || program?.value,
  }
}
