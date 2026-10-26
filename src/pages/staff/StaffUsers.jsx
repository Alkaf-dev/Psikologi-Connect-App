import { useState } from 'react'
import { Users, UsersRound } from 'lucide-react'
import CrudPage from '../../components/CrudPage'
import UserGroupsModal from '../../components/UserGroupsModal'
import { Avatar, Badge, Button } from '../../components/ui'
import { formatDate } from '../../lib/utils'
import { loadProgramOptions } from '../../lib/staffLookups'
import { buildUserFields, emptyUserValues, roleOptions, userToForm, userToPayload } from './userFields'

const activeOptions = [
  { value: '1', label: 'Aktif' },
  { value: '0', label: 'Nonaktif' },
]

const roleVariants = {
  mahasiswa: 'info',
  pjmk: 'warning',
  super_admin: 'danger',
}

export default function StaffUsers() {
  const [groupTarget, setGroupTarget] = useState(null)

  return (
    <>
      <CrudPage
        eyebrow="Akun"
        title="Manajemen User"
        description="Kelola seluruh akun pengguna, role, status aktif, program studi, dan akses panel administrasi."
        listPath="/staff/users"
        searchPlaceholder="Cari nama, NIM/NIP, email, kelas, atau telepon..."
        createLabel="Tambah user"
        emptyIcon={Users}
        emptyTitle="Belum ada user"
        emptyDescription="Tambahkan akun untuk mahasiswa atau staf program studi."
        initialValues={emptyUserValues()}
        loadLookups={async () => ({ programs: await loadProgramOptions() })}
        fields={buildUserFields()}
        filters={[
          { key: 'role', label: 'Role', placeholder: 'Semua role', options: roleOptions },
          {
            key: 'prodi_id',
            label: 'Prodi',
            placeholder: 'Semua prodi',
            options: (values, lookups) => lookups.programs || [],
          },
          { key: 'active', label: 'Status', placeholder: 'Semua status', options: activeOptions },
        ]}
        columns={[
          {
            key: 'name',
            label: 'Pengguna',
            render: (user) => (
              <div className="flex min-w-[220px] items-center gap-2.5">
                <Avatar name={user.name} className="h-9 w-9" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
                  <p className="truncate text-[11px] text-slate-500">{user.email}</p>
                </div>
              </div>
            ),
          },
          {
            key: 'npm',
            label: 'NIM / NIP',
            render: (user) => <span className="font-mono text-xs text-slate-700">{user.npm}</span>,
          },
          {
            key: 'prodi_name',
            label: 'Prodi',
            render: (user) => <span className="text-xs text-slate-600">{user.prodi_name || '-'}</span>,
          },
          {
            key: 'class_name',
            label: 'Kelas',
            render: (user) => <span className="text-xs text-slate-500">{user.class_name || '-'}</span>,
          },
          {
            key: 'role',
            label: 'Role',
            render: (user) => (
              <Badge variant={roleVariants[user.role] || 'neutral'}>{user.role_label || user.role}</Badge>
            ),
          },
          {
            key: 'active',
            label: 'Status',
            render: (user) => (
              <div>
                <Badge variant={user.active ? 'success' : 'neutral'}>
                  {user.active ? 'Aktif' : 'Nonaktif'}
                </Badge>
                <p className="mt-1 text-[10px] text-slate-400">{formatDate(user.created_at)}</p>
              </div>
            ),
          },
        ]}
        mapItemToForm={userToForm}
        mapFormToPayload={(payload, { lookups }) =>
          userToPayload(payload, { programs: lookups.programs })
        }
        extraActions={(user, { refresh }) =>
          user.role === 'mahasiswa' ? (
            <Button
              variant="ghost"
              size="icon-sm"
              title="Atur kelompok"
              aria-label="Atur kelompok mahasiswa"
              onClick={() => setGroupTarget({ user, refresh })}
            >
              <UsersRound className="h-3.5 w-3.5" />
            </Button>
          ) : null
        }
        deleteTitle="Hapus akun pengguna?"
        deleteMessage="Akun akan dihapus permanen dan seluruh sesi login dicabut. Akun sendiri serta admin aktif terakhir tidak dapat dihapus."
        formDescription="Password dapat dikosongkan saat mengedit jika tidak ingin mengubahnya. Mengganti password akan mencabut semua sesi pengguna."
        formSize="lg"
      />

      <UserGroupsModal
        open={Boolean(groupTarget)}
        user={groupTarget?.user}
        onClose={() => setGroupTarget(null)}
        onSaved={() => groupTarget?.refresh?.()}
      />
    </>
  )
}
