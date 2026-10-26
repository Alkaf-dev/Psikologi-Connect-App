import { useState } from 'react'
import { GraduationCap, UsersRound } from 'lucide-react'
import CrudPage from '../../components/CrudPage'
import UserGroupsModal from '../../components/UserGroupsModal'
import { Badge, Button } from '../../components/ui'
import { formatDate } from '../../lib/utils'
import { loadProgramOptions } from '../../lib/staffLookups'
import { buildUserFields, emptyUserValues, userToForm, userToPayload } from './userFields'

const activeOptions = [
  { value: '1', label: 'Aktif' },
  { value: '0', label: 'Nonaktif' },
]

export default function StaffStudents() {
  const [groupTarget, setGroupTarget] = useState(null)

  return (
    <>
      <CrudPage
        eyebrow="Administrasi"
        title="Mahasiswa"
        description="Kelola akun mahasiswa, kelas, angkatan, program studi, serta keanggotaan kelompok mereka."
        listPath="/staff/students"
        writePath="/staff/users"
        searchPlaceholder="Cari nama, NIM, email, no HP, kelas, atau angkatan..."
        createLabel="Tambah mahasiswa"
        emptyIcon={GraduationCap}
        emptyTitle="Belum ada mahasiswa"
        emptyDescription="Tambahkan akun mahasiswa untuk mulai mengelola kelas dan kelompok."
        mascot="memegang-buku"
        initialValues={emptyUserValues({ role: 'mahasiswa' })}
        loadLookups={async () => ({ programs: await loadProgramOptions() })}
        fields={buildUserFields({ studentOnly: true })}
        filters={[
          { key: 'active', label: 'Status', placeholder: 'Semua status', options: activeOptions },
          {
            key: 'prodi_id',
            label: 'Prodi',
            type: 'chips',
            fullWidth: true,
            placeholder: 'Semua prodi',
            options: (values, lookups) => lookups.programs || [],
          },
        ]}
        columns={[
          {
            key: 'name',
            label: 'Mahasiswa',
            render: (student) => (
              <div className="min-w-[220px]">
                <p className="truncate text-sm font-semibold text-slate-800">{student.name}</p>
              </div>
            ),
          },
          {
            key: 'npm',
            label: 'NIM',
            className: 'text-center',
            render: (student) => <span className="font-mono text-xs font-semibold text-slate-700">{student.npm}</span>,
          },
          {
            key: 'class_name',
            label: 'Kelas / Angkatan',
            className: 'text-center',
            render: (student) => (
              <div>
                <p className="text-xs font-medium text-slate-700">{student.class_name || '-'}</p>
                <p className="text-[10px] text-slate-400">{student.cohort ? `Angkatan ${student.cohort}` : '-'}</p>
              </div>
            ),
          },
          {
            key: 'prodi_name',
            label: 'Program Studi',
            className: 'text-center',
            render: (student) => <Badge variant="teal">{student.prodi_name || '-'}</Badge>,
          },
          {
            key: 'phone',
            label: 'No HP',
            className: 'text-center',
            render: (student) => (
              <span className="whitespace-nowrap text-xs text-slate-600">{student.phone || '-'}</span>
            ),
          },
          {
            key: 'email',
            label: 'Email',
            className: 'text-center',
            render: (student) => (
              <span className="mx-auto block max-w-[210px] break-all text-xs text-slate-600">
                {student.email || '-'}
              </span>
            ),
          },
          {
            key: 'created_at',
            label: 'Terdaftar',
            className: 'text-center',
            render: (student) => <span className="text-xs text-slate-500">{formatDate(student.created_at)}</span>,
          },
          {
            key: 'active',
            label: 'Status',
            className: 'text-center',
            render: (student) => (
              <Badge variant={student.active ? 'success' : 'neutral'}>
                {student.active ? 'Aktif' : 'Nonaktif'}
              </Badge>
            ),
          },
        ]}
        mapItemToForm={userToForm}
        mapFormToPayload={(payload, { lookups }) =>
          userToPayload(payload, { forcedRole: 'mahasiswa', programs: lookups.programs })
        }
        extraActions={(student, { refresh }) =>
          student.role === 'mahasiswa' ? (
            <Button
              variant="ghost"
              size="icon-sm"
              title="Atur kelompok"
              aria-label="Atur kelompok mahasiswa"
              onClick={() => setGroupTarget({ user: student, refresh })}
            >
              <UsersRound className="h-3.5 w-3.5" />
            </Button>
          ) : null
        }
        deleteTitle="Hapus akun mahasiswa?"
        deleteMessage="Akun akan dihapus permanen dan seluruh sesi login dicabut. Pengumpulan tugas atas nama mahasiswa ini dapat ikut terdampak."
        formDescription="Akun mahasiswa memakai NIM atau email untuk login sesuai program studi."
        formSize="lg"
        centerActions
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
