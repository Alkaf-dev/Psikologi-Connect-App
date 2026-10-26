import { useEffect, useMemo, useState } from 'react'
import { Search, UserMinus, UsersRound } from 'lucide-react'
import { sortByName } from '../lib/groupHelpers'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Pagination,
  SearchInput,
} from './ui'

const PAGE_SIZE = 10

export default function GroupMembersTable({
  group,
  canManage = false,
  showContacts = false,
  onRemove,
  removingUserId = '',
}) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const groupId = group?.id

  useEffect(() => {
    setSearch('')
    setPage(1)
  }, [groupId])

  const members = useMemo(() => sortByName(group?.members || []), [group?.members])

  const filteredMembers = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return members

    return members.filter((member) => {
      const roleLabel = member.role === 'ketua' ? 'Ketua' : 'Anggota'
      const fields = [member.name, member.npm, roleLabel, group?.course_name]
      if (showContacts) fields.push(member.phone, member.email)

      return fields.some((value) =>
        String(value || '').toLowerCase().includes(term),
      )
    })
  }, [members, search, group?.course_name, showContacts])

  const lastPage = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE))
  const currentPage = Math.min(page, lastPage)

  useEffect(() => {
    if (page > lastPage) setPage(lastPage)
  }, [page, lastPage])

  const visibleMembers = filteredMembers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  const memberCount = group?.members_count ?? members.length

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Anggota Kelompok</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {group?.name || 'Pilih kelompok'} · {memberCount} anggota
          </p>
        </div>
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          placeholder={showContacts ? 'Cari nama, NPM, email, atau no HP...' : 'Cari nama, NPM, atau peran...'}
          className="sm:w-72"
        />
      </div>

      {filteredMembers.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={search ? Search : UsersRound}
            title={search ? 'Anggota tidak ditemukan' : 'Belum ada anggota'}
            description={
              search
                ? 'Coba kata kunci lain untuk menemukan anggota kelompok.'
                : 'Pilih kelompok untuk melihat daftar anggotanya.'
            }
            action={
              search ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearch('')
                    setPage(1)
                  }}
                >
                  Bersihkan pencarian
                </Button>
              ) : null
            }
          />
        </div>
      ) : (
        <>
          <div className="scrollbar-thin overflow-x-auto">
            <table
              className={`w-full border-collapse text-left ${
                showContacts ? 'min-w-[980px]' : 'min-w-[720px]'
              }`}
            >
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="w-14 border-r border-slate-200/80 px-4 py-3 text-center font-semibold">No</th>
                  <th className="border-r border-slate-200/80 px-4 py-3 text-center font-semibold">Nama Mahasiswa/i</th>
                  <th className="border-r border-slate-200/80 px-4 py-3 text-center font-semibold">Mata Kuliah</th>
                  {showContacts ? (
                    <>
                      <th className="border-r border-slate-200/80 px-4 py-3 text-center font-semibold">No HP</th>
                      <th className="border-r border-slate-200/80 px-4 py-3 text-center font-semibold">Email</th>
                    </>
                  ) : null}
                  <th className="border-r border-slate-200/80 px-4 py-3 text-center font-semibold">Jumlah Anggota</th>
                  {canManage ? (
                    <th className="px-4 py-3 text-center font-semibold">Aksi</th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleMembers.map((member, index) => {
                  const roleLabel = member.role === 'ketua' ? 'Ketua' : 'Anggota'
                  const isLeader =
                    member.role === 'ketua' ||
                    String(member.user_id) === String(group?.leader_id)
                  const removing = String(removingUserId) === String(member.user_id)

                  return (
                    <tr key={member.id || member.user_id} className="transition hover:bg-slate-50/70">
                      <td className="border-b border-r border-slate-100 px-4 py-3 text-center text-xs font-medium text-slate-400">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </td>
                      <td className="border-b border-r border-slate-100 px-4 py-3">
                        <p className="text-sm font-semibold text-slate-800">
                          {member.name || 'Tanpa nama'}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {[member.npm ? `NIM ${member.npm}` : '', roleLabel]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </td>
                      <td className="border-b border-r border-slate-100 px-4 py-3 text-center text-xs text-slate-600">
                        {group?.course_name || '-'}
                      </td>
                      {showContacts ? (
                        <>
                          <td className="whitespace-nowrap border-b border-r border-slate-100 px-4 py-3 text-center text-xs text-slate-600">
                            {member.phone || '-'}
                          </td>
                          <td className="border-b border-r border-slate-100 px-4 py-3 text-center text-xs text-slate-600">
                            <span className="mx-auto block max-w-[190px] break-all">
                              {member.email || '-'}
                            </span>
                          </td>
                        </>
                      ) : null}
                      <td className="border-b border-r border-slate-100 px-4 py-3 text-center">
                        <Badge variant="info">{memberCount}</Badge>
                      </td>
                      {canManage ? (
                        <td className="border-b border-slate-100 px-4 py-2 text-center">
                          <Button
                            variant="danger-soft"
                            size="sm"
                            disabled={isLeader || removing}
                            title={
                              isLeader
                                ? 'Ketua kelompok tidak dapat dikeluarkan. Ubah ketua terlebih dahulu.'
                                : 'Keluarkan anggota'
                            }
                            onClick={() => onRemove?.(member)}
                          >
                            <UserMinus className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">
                              {removing ? 'Mengeluarkan...' : 'Keluarkan'}
                            </span>
                          </Button>
                        </td>
                      ) : null}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-4 py-3">
            <Pagination
              currentPage={currentPage}
              lastPage={lastPage}
              total={filteredMembers.length}
              perPage={PAGE_SIZE}
              onChange={setPage}
            />
          </div>
        </>
      )}
    </Card>
  )
}
