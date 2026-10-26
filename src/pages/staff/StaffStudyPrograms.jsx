import { Building2 } from 'lucide-react'
import CrudPage from '../../components/CrudPage'
import { Badge } from '../../components/ui'
import { formatDate } from '../../lib/utils'

const activeOptions = [
  { value: '1', label: 'Aktif' },
  { value: '0', label: 'Nonaktif' },
]

export default function StaffStudyPrograms() {
  return (
    <CrudPage
      eyebrow="Administrasi"
      title="Program Studi"
      description="Kelola program studi yang dapat dipilih saat login dan digunakan oleh mahasiswa serta mata kuliah."
      listPath="/staff/study-programs"
      searchPlaceholder="Cari kode, nama, atau jenjang..."
      createLabel="Tambah prodi"
      emptyIcon={Building2}
      emptyTitle="Belum ada program studi"
      emptyDescription="Tambahkan program studi pertama agar akun dan mata kuliah dapat dikelola."
      mascot="berpikir"
      initialValues={{ code: '', name: '', degree: 'S1', active: true }}
      fields={[
        { name: 'code', label: 'Kode prodi', type: 'text', required: true, placeholder: 'mis. psikologi' },
        { name: 'degree', label: 'Jenjang', type: 'select', required: true, options: ['S1', 'S2', 'S3', 'D3', 'D4'] },
        { name: 'name', label: 'Nama program studi', type: 'text', required: true, colSpan: 2, placeholder: 'mis. Psikologi' },
        { name: 'active', label: 'Prodi aktif', type: 'checkbox', help: 'Prodi aktif tersedia pada pilihan login publik.' },
      ]}
      filters={[{ key: 'active', label: 'Status', placeholder: 'Semua status', options: activeOptions }]}
      columns={[
        {
          key: 'code',
          label: 'Kode',
          className: 'text-center',
          render: (program) => <span className="font-mono text-xs font-semibold text-slate-700">{program.code}</span>,
        },
        {
          key: 'name',
          label: 'Program Studi',
          render: (program) => (
            <div>
              <p className="text-sm font-semibold text-slate-800">{program.name}</p>
              <p className="text-[11px] text-slate-400">{program.degree}</p>
            </div>
          ),
        },
        {
          key: 'id',
          label: 'ID Prodi',
          className: 'text-center',
          render: (program) => <span className="font-mono text-[10px] text-slate-400">{program.id}</span>,
        },
        {
          key: 'created_at',
          label: 'Dibuat',
          className: 'text-center',
          render: (program) => <span className="text-xs text-slate-500">{formatDate(program.created_at)}</span>,
        },
        {
          key: 'active',
          label: 'Status',
          className: 'text-center',
          render: (program) => (
            <Badge variant={program.active ? 'success' : 'neutral'}>
              {program.active ? 'Aktif' : 'Nonaktif'}
            </Badge>
          ),
        },
      ]}
      mapItemToForm={(program) => ({ ...program, active: Boolean(program.active) })}
      deleteTitle="Hapus program studi?"
      deleteMessage="Prodi yang masih dipakai akun, mata kuliah, atau pengumuman tidak dapat dihapus. Nonaktifkan sebagai gantinya."
      formDescription="Prodi aktif akan muncul sebagai pilihan pada halaman login."
      centerActions
    />
  )
}
