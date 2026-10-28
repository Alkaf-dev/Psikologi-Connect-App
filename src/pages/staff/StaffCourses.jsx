import { BookOpen, ExternalLink } from 'lucide-react'
import CrudPage from '../../components/CrudPage'
import { Badge } from '../../components/ui'
import { loadProgramOptions } from '../../lib/staffLookups'
import { CLASS_OPTIONS } from '../../lib/classOptions'

export default function StaffCourses() {
  return (
    <CrudPage
      eyebrow="Akademik"
      title="Mata Kuliah"
      description="Kelola mata kuliah, dosen pengampu, kelas, dan program studi yang dapat mengakses setiap mata kuliah."
      listPath="/staff/courses"
      searchPlaceholder="Cari kode, nama, dosen, semester, atau kelas..."
      createLabel="Tambah mata kuliah"
      emptyIcon={BookOpen}
      emptyTitle="Belum ada mata kuliah"
      emptyDescription="Tambahkan mata kuliah agar jadwal, kelompok, dan tugas dapat dibuat."
      mascot="memegang-buku"
      initialValues={{
        code: '',
        name: '',
        credits: 3,
        lecturer: '',
        semester: 'Ganjil',
        class_name: 'PSI',
        prodi_ids: [],
        meeting_link: '',
        description: '',
      }}
      loadLookups={async () => ({ programs: await loadProgramOptions() })}
      fields={[
        { name: 'code', label: 'Kode mata kuliah', type: 'text', required: true, placeholder: 'mis. PSI101' },
        { name: 'credits', label: 'SKS', type: 'number', required: true, min: 1, max: 8 },
        { name: 'name', label: 'Nama mata kuliah', type: 'text', required: true, colSpan: 2 },
        { name: 'lecturer', label: 'Dosen pengampu', type: 'text', required: true, placeholder: 'Nama lengkap dosen' },
        { name: 'semester', label: 'Semester', type: 'text', required: true, placeholder: 'mis. Ganjil' },
        {
          name: 'class_name',
          label: 'Kelas',
          type: 'multiselect',
          outputString: true,
          required: true,
          colSpan: 2,
          options: CLASS_OPTIONS,
          help: 'Centang program studi dan/atau kelas rombel (1A, 1B, 1C) yang mengambil mata kuliah ini.',
        },
        {
          name: 'prodi_ids',
          label: 'Program studi',
          type: 'multiselect',
          required: false,
          colSpan: 2,
          options: (values, lookups) => lookups.programs || [],
          emptyLabel: 'Memuat program studi...',
          help: 'Pilih minimal satu program studi.',
        },
        {
          name: 'meeting_link',
          label: 'Tautan kelas virtual',
          type: 'url',
          placeholder: 'https://...',
          colSpan: 2,
          help: 'Opsional. Digunakan sebagai tautan utama kelas daring.',
        },
        { name: 'description', label: 'Deskripsi', type: 'textarea', rows: 4, colSpan: 2, placeholder: 'Deskripsi singkat mata kuliah...' },
      ]}
      filters={[
        {
          key: 'prodi_id',
          label: 'Prodi',
          placeholder: 'Semua prodi',
          options: (values, lookups) => lookups.programs || [],
        },
      ]}
      columns={[
        {
          key: 'name',
          label: 'Mata Kuliah',
          render: (course) => (
            <div className="min-w-[220px]">
              <p className="text-sm font-semibold text-slate-800">{course.name}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                <span className="font-mono">{course.code}</span> · {course.credits} SKS
              </p>
            </div>
          ),
        },
        {
          key: 'lecturer',
          label: 'Dosen',
          render: (course) => <span className="text-xs text-slate-600">{course.lecturer}</span>,
        },
        {
          key: 'semester',
          label: 'Semester / Kelas',
          className: 'text-center',
          render: (course) => (
            <div>
              <p className="text-xs font-medium text-slate-700">{course.semester}</p>
              <p className="text-[10px] text-slate-400">{course.class_name}</p>
            </div>
          ),
        },
        {
          key: 'meeting_link',
          label: 'Tautan',
          className: 'text-center',
          render: (course) =>
            course.meeting_link ? (
              <a
                href={course.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Buka tautan
              </a>
            ) : (
              <span className="text-xs text-slate-400">-</span>
            ),
        },
        {
          key: 'prodi_names',
          label: 'Program Studi',
          className: 'text-center',
          render: (course) => (
            <div className="mx-auto flex max-w-[240px] flex-wrap justify-center gap-1">
              {(course.prodi_names || []).slice(0, 2).map((name) => (
                <Badge key={name} variant="teal">
                  {name}
                </Badge>
              ))}
              {(course.prodi_names || []).length > 2 ? (
                <Badge variant="neutral">+{course.prodi_names.length - 2}</Badge>
              ) : null}
            </div>
          ),
        },
      ]}
      mapItemToForm={(course) => ({
        ...course,
        credits: course.credits ?? 3,
        prodi_ids: course.prodi_ids || [],
      })}
      deleteTitle="Hapus mata kuliah?"
      deleteMessage="Jadwal, kelompok, dan tugas yang terkait dapat kehilangan referensi. Pastikan data turunan sudah dibersihkan."
      formSize="lg"
      centerActions
    />
  )
}
