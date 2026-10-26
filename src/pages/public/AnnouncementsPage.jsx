import { useState } from 'react'
import { Megaphone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApiData } from '../../hooks/useApiData'
import { AnnouncementCard } from '../../components/AnnouncementCard'
import { EmptyState, Pagination, SearchInput, Skeleton } from '../../components/ui'

export default function AnnouncementsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data: announcements, meta, loading, error } = useApiData('/announcements', {
    page,
    per_page: 9,
    search: search || undefined,
    sort: 'published_at',
    direction: 'desc',
  })

  return (
    <div>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-700">
                Informasi Program Studi
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Pengumuman</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                Ikuti informasi terbaru seputar perkuliahan, kegiatan, dan layanan akademik.
              </p>
            </div>
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value)
                setPage(1)
              }}
              placeholder="Cari pengumuman..."
              className="w-full sm:w-72"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <Skeleton key={item} className="h-56" />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={Megaphone}
            title="Gagal memuat pengumuman"
            description="Periksa koneksi API atau coba muat ulang halaman ini."
          />
        ) : announcements?.length ? (
          <>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {announcements.map((announcement) => (
                <AnnouncementCard key={announcement.id} announcement={announcement} />
              ))}
            </div>
            <Pagination
              className="mt-8"
              currentPage={meta?.current_page ?? page}
              lastPage={meta?.last_page ?? 1}
              total={meta?.total}
              perPage={meta?.per_page}
              onChange={setPage}
            />
          </>
        ) : (
          <EmptyState
            icon={Megaphone}
            title={search ? 'Pengumuman tidak ditemukan' : 'Belum ada pengumuman'}
            description={
              search
                ? 'Coba kata kunci lain untuk menemukan pengumuman yang Anda cari.'
                : 'Pengumuman yang diterbitkan program studi akan muncul di sini.'
            }
            action={
              search ? (
                <button type="button" onClick={() => setSearch('')} className="text-sm font-semibold text-teal-700">
                  Bersihkan pencarian
                </button>
              ) : (
                <Link to="/" className="text-sm font-semibold text-teal-700">
                  Kembali ke beranda
                </Link>
              )
            }
          />
        )}
      </section>
    </div>
  )
}
