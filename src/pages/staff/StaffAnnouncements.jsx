import { Megaphone } from 'lucide-react'
import CrudPage from '../../components/CrudPage'
import { Badge } from '../../components/ui'
import { formatDateTime, toDateTimeInput, truncate } from '../../lib/utils'
import { courseLabel, loadCourseOptions, loadProgramOptions } from '../../lib/staffLookups'

const audienceLabels = {
  all: 'Semua pengunjung',
  mahasiswa: 'Mahasiswa',
  admin: 'Admin',
}

const audienceVariants = {
  all: 'teal',
  mahasiswa: 'info',
  admin: 'purple',
}

function prodiNames(announcement) {
  if (Array.isArray(announcement.prodi_names)) return announcement.prodi_names

  return String(announcement.prodi_names || '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
}

export default function StaffAnnouncements() {
  return (
    <CrudPage
      eyebrow="Konten"
      title="Pengumuman"
      description="Publikasikan informasi untuk situs publik, seluruh mahasiswa, program studi tertentu, atau panel admin."
      listPath="/staff/announcements"
      searchPlaceholder="Cari judul, isi, penulis, mata kuliah, atau prodi..."
      createLabel="Tulis pengumuman"
      emptyIcon={Megaphone}
      emptyTitle="Belum ada pengumuman"
      emptyDescription="Tulis pengumuman pertama untuk dibagikan kepada pengunjung atau mahasiswa."
      mascot="menunjuk"
      initialValues={{
        title: '',
        audience: 'all',
        course_id: '',
        prodi_ids: [],
        published_at: toDateTimeInput(new Date()),
        body: '',
      }}
      loadFilterLookups={async () => ({ courses: await loadCourseOptions() })}
      loadLookups={async () => ({ programs: await loadProgramOptions() })}
      fields={[
        { name: 'title', label: 'Judul pengumuman', type: 'text', required: true, colSpan: 2 },
        {
          name: 'audience',
          label: 'Audiens',
          type: 'select',
          required: true,
          options: [
            { value: 'all', label: 'Semua pengunjung (publik)' },
            { value: 'mahasiswa', label: 'Mahasiswa' },
            { value: 'admin', label: 'Admin / staf' },
          ],
        },
        {
          name: 'published_at',
          label: 'Tanggal publikasi',
          type: 'datetime-local',
          required: true,
        },
        {
          name: 'course_id',
          label: 'Mata kuliah terkait',
          type: 'select',
          colSpan: 2,
          placeholder: 'Tidak terkait mata kuliah',
          options: (values, lookups) => lookups.courses || [],
        },
        {
          name: 'prodi_ids',
          label: 'Program studi sasaran',
          type: 'multiselect',
          colSpan: 2,
          visible: (values) => values.audience === 'mahasiswa',
          options: (values, lookups) => lookups.programs || [],
          emptyLabel: 'Memuat program studi...',
          help: 'Kosongkan untuk menjangkau semua program studi.',
        },
        {
          name: 'body',
          label: 'Isi pengumuman',
          type: 'textarea',
          required: true,
          rows: 8,
          colSpan: 2,
          placeholder: 'Tulis isi pengumuman secara lengkap...',
        },
      ]}
      filters={[
        {
          key: 'audience',
          label: 'Audiens',
          placeholder: 'Semua',
          options: [
            { value: 'admin', label: 'Admin / PJMK' },
            { value: 'mahasiswa', label: 'Mahasiswa' },
          ],
        },
        {
          key: 'course_id',
          label: 'Mata kuliah',
          type: 'chips',
          placeholder: 'Semua mata kuliah',
          options: (values, lookups) => lookups.courses || [],
        },
      ]}
      columns={[
        {
          key: 'title',
          label: 'Pengumuman',
          render: (announcement) => (
            <div className="max-w-[360px]">
              <p className="text-sm font-semibold text-slate-800">{announcement.title}</p>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-5 text-slate-500">
                {truncate(announcement.body, 120)}
              </p>
            </div>
          ),
        },
        {
          key: 'audience',
          label: 'Audiens',
          className: 'text-center',
          render: (announcement) => (
            <Badge variant={audienceVariants[announcement.audience] || 'neutral'}>
              {audienceLabels[announcement.audience] || announcement.audience}
            </Badge>
          ),
        },
        {
          key: 'course_name',
          label: 'Mata kuliah',
          className: 'text-center',
          render: (announcement) => (
            <span className="text-xs text-slate-600">{announcement.course_name || '-'}</span>
          ),
        },
        {
          key: 'prodi_names',
          label: 'Prodi',
          className: 'text-center',
          render: (announcement) => {
            const names = prodiNames(announcement)

            return (
              <div className="mx-auto flex max-w-[160px] flex-wrap justify-center gap-1">
                {names.slice(0, 2).map((name) => (
                  <Badge key={name} variant="neutral">
                    {name}
                  </Badge>
                ))}
                {names.length > 2 ? <Badge variant="neutral">+{names.length - 2}</Badge> : null}
              </div>
            )
          },
        },
        {
          key: 'published_at',
          label: 'Publikasi',
          className: 'text-center',
          render: (announcement) => (
            <div>
              <p className="text-xs text-slate-600">{formatDateTime(announcement.published_at)}</p>
              <p className="text-[10px] text-slate-400">{announcement.author_name || '-'}</p>
            </div>
          ),
        },
      ]}
      mapItemToForm={(announcement) => ({
        ...announcement,
        course_id: announcement.course_id || '',
        prodi_ids: announcement.prodi_ids || [],
        published_at: toDateTimeInput(announcement.published_at),
        body: announcement.body || '',
      })}
      mapFormToPayload={(payload) => ({
        ...payload,
        course_id: payload.course_id || '',
        prodi_ids: payload.audience === 'mahasiswa' ? payload.prodi_ids : [],
      })}
      deleteTitle="Hapus pengumuman?"
      deleteMessage="Pengumuman akan dihapus dari situs publik dan portal mahasiswa."
      formSize="lg"
      centerActions
    />
  )
}
