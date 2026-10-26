import { useMemo, useState } from 'react'
import {
  CalendarDays,
  Clock3,
  DoorOpen,
  MapPin,
  UserRound,
  Video,
} from 'lucide-react'
import { useApiData, useDebouncedValue } from '../../hooks/useApiData'
import { DAYS, dayOrder, formatDayDate } from '../../lib/utils'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  FilterChip,
  PageHeader,
  SearchInput,
  Select,
  Skeleton,
} from '../../components/ui'
import { MascotGif } from '../../components/PsychologyMascot'

const todayIndex = new Date().getDay()
const todayName = DAYS[(todayIndex + 6) % 7]

export default function StudentSchedule() {
  const [day, setDay] = useState('')
  const [mode, setMode] = useState('')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)

  const { data: schedules, meta, loading } = useApiData('/student/schedules', {
    per_page: 100,
    search: debouncedSearch || undefined,
    day: day || undefined,
    mode: mode || undefined,
  })

  const grouped = useMemo(() => {
    const items = [...(schedules || [])].sort((a, b) => {
      const dayDiff = dayOrder(a.day) - dayOrder(b.day)
      if (dayDiff !== 0) return dayDiff
      return String(a.start_time).localeCompare(String(b.start_time))
    })

    return DAYS.map((dayName) => ({
      day: dayName,
      items: items.filter((schedule) => schedule.day === dayName),
    })).filter((group) => group.items.length > 0)
  }, [schedules])

  const totalSessions = schedules?.length || 0
  const onlineCount = (schedules || []).filter((schedule) => schedule.mode === 'online').length

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Akademik"
        title="Jadwal Mata Kuliah"
        description="Jadwal kuliah sesuai Prodi dan kelas Anda, termasuk ruangan serta tautan Zoom atau Google Meet."
      />

      <MascotGif mascot="berjalan" variant="banner" className="psy-page-mascot" />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Total sesi</p>
            <p className="text-lg font-bold text-slate-900">{totalSessions}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <Video className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Sesi online</p>
            <p className="text-lg font-bold text-slate-900">{onlineCount}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Clock3 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Hari ini</p>
            <p className="text-lg font-bold text-slate-900">{todayName}</p>
          </div>
        </Card>
      </div>

      <Card className="space-y-3 p-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari mata kuliah, dosen, atau ruangan..." />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="scrollbar-thin flex gap-1.5 overflow-x-auto pb-1">
            <FilterChip active={!day} onClick={() => setDay('')}>
              Semua hari
            </FilterChip>
            {DAYS.map((dayName) => (
              <FilterChip key={dayName} active={day === dayName} onClick={() => setDay(dayName)}>
                {dayName}
              </FilterChip>
            ))}
          </div>
          <Select value={mode} onChange={(event) => setMode(event.target.value)} className="sm:w-40">
            <option value="">Semua mode</option>
            <option value="offline">Offline</option>
            <option value="online">Online</option>
          </Select>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : grouped.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Belum ada jadwal"
          description={
            day || mode || search
              ? 'Tidak ada jadwal yang cocok dengan filter Anda.'
              : 'Jadwal untuk Prodi dan kelas Anda belum tersedia.'
          }
          action={
            day || mode || search ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setDay('')
                  setMode('')
                  setSearch('')
                }}
              >
                Reset filter
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-5">
          {grouped.map((group) => (
            <div key={group.day}>
              <div className="mb-2.5 flex items-center gap-3">
                <h2 className="text-sm font-bold text-slate-900">{group.day}</h2>
                <span className="h-px flex-1 bg-slate-200" />
                {group.day === todayName ? <Badge variant="teal">Hari ini</Badge> : null}
                <span className="text-[11px] text-slate-400">{group.items.length} sesi</span>
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                {group.items.map((schedule) => (
                  <Card
                    key={schedule.id}
                    className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-stretch ${
                      group.day === todayName ? 'border-teal-200 bg-teal-50/20' : ''
                    }`}
                  >
                    <div className="flex w-full shrink-0 flex-col items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-white sm:w-[104px]">
                      <span className="text-base font-bold">{schedule.start_time}</span>
                      <span className="mt-0.5 text-[10px] text-slate-400">s.d. {schedule.end_time}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={schedule.mode === 'online' ? 'info' : 'neutral'}>
                          {schedule.mode === 'online' ? 'Online' : 'Offline'}
                        </Badge>
                        <span className="text-[11px] font-medium text-slate-400">{schedule.course_code}</span>
                        <Badge variant="teal" className="ml-auto">
                          {schedule.class_name}
                        </Badge>
                      </div>
                      <h3 className="mt-2 text-sm font-semibold text-slate-900">{schedule.course_name}</h3>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <UserRound className="h-3 w-3" />
                          {schedule.course_lecturer}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          {schedule.mode === 'online' ? <Video className="h-3 w-3" /> : <DoorOpen className="h-3 w-3" />}
                          {schedule.platform_label || schedule.location_label}
                        </span>
                        {schedule.room ? (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3 w-3" />
                            {schedule.room}
                          </span>
                        ) : null}
                      </div>
                      {schedule.mode === 'online' && schedule.meeting_link ? (
                        <Button
                          as="a"
                          href={schedule.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                          variant="soft"
                          size="sm"
                          className="mt-3"
                        >
                          <Video className="h-3.5 w-3.5" />
                          Gabung {schedule.platform_label || 'kelas online'}
                        </Button>
                      ) : null}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {meta?.total ? (
        <p className="text-center text-xs text-slate-400">
          {meta.total} sesi kuliah · diperbarui {formatDayDate(new Date())}
        </p>
      ) : null}
    </div>
  )
}
