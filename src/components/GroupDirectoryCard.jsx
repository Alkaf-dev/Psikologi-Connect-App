import { BookOpen, Crown, UsersRound } from 'lucide-react'

function memberLabel(member) {
  return typeof member === 'string' ? member : member?.name || ''
}

export default function GroupDirectoryCard({ group }) {
  const memberList = Array.isArray(group?.members) && group.members.length > 0
    ? group.members.map(memberLabel).filter(Boolean)
    : String(group?.member_names || '')
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean)

  const leaderName =
    group?.leader_name ||
    (group?.members || []).find((member) => member?.role === 'ketua')?.name ||
    'Belum ditentukan'

  const memberCount = Number(group?.members_count ?? memberList.length)

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex min-w-0 items-center gap-1 rounded-md border border-teal-200 bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-800 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
          <BookOpen className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="truncate">{group?.course_code || 'Kelompok'}</span>
        </span>

        <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <UsersRound className="h-3 w-3" aria-hidden="true" />
          {memberCount} anggota
        </span>
      </div>

      <h3 className="mt-2.5 text-sm font-bold leading-snug text-slate-900 dark:text-white">
        {group?.name || 'Tanpa nama kelompok'}
      </h3>

      <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
        {group?.course_name || 'Mata kuliah belum diatur'}
      </p>

      <div className="mt-2.5 inline-flex items-start gap-1.5 rounded-lg border border-amber-200/80 bg-amber-50 px-2.5 py-1.5 text-[11px] font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
        <Crown className="mt-0.5 h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <span>
          Ketua: <strong className="font-bold">{leaderName}</strong>
        </span>
      </div>

      <div className="mt-3 border-t border-slate-100 pt-2.5 dark:border-slate-800">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Anggota ({memberCount})
        </p>

        {memberList.length > 0 ? (
          <div className="mt-1.5 max-h-32 overflow-y-auto pr-1">
            <ul className="flex flex-wrap gap-1.5">
              {memberList.map((name, index) => (
                <li
                  key={`${group?.id || 'group'}-${name}-${index}`}
                  className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Belum ada anggota yang terdaftar.
          </p>
        )}
      </div>
    </article>
  )
}
