import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  UserPlus,
  UsersRound,
} from 'lucide-react'
import { useApiData } from '../../hooks/useApiData'
import { useGroupsData } from '../../hooks/useGroupsData'
import { useToast } from '../../context/ToastContext'
import { api, errorMessage } from '../../lib/api'
import { groupsForCourse } from '../../lib/groupHelpers'
import { Button, Card, EmptyState, PageHeader, Skeleton } from '../../components/ui'
import { MascotGif } from '../../components/PsychologyMascot'
import GroupCourseCard from '../../components/GroupCourseCard'
import GroupChips from '../../components/GroupChips'
import GroupMembersTable from '../../components/GroupMembersTable'
import GroupFormModal from '../../components/GroupFormModal'
import AddGroupMembersModal from '../../components/AddGroupMembersModal'

export default function StaffGroups() {
  const { toast, confirm } = useToast()
  const {
    courses,
    groups,
    courseCards,
    coursesLoaded,
    groupsLoaded,
    loading,
    error,
    refresh,
  } = useGroupsData('staff')

  const [studentsRequested, setStudentsRequested] = useState(false)
  const studentsState = useApiData(
    '/staff/students',
    { per_page: 500, active: true, sort: 'name', direction: 'asc' },
    { allPages: true, enabled: studentsRequested },
  )
  const students = studentsState.data || []

  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [groupModal, setGroupModal] = useState(null)
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [removingUserId, setRemovingUserId] = useState('')

  useEffect(() => {
    if (groupModal || addMemberOpen) setStudentsRequested(true)
  }, [groupModal, addMemberOpen])

  const selectedCourse =
    courseCards.find((course) => String(course.id) === String(selectedCourseId)) || null

  const selectedCourseRecord =
    courses.find((course) => String(course.id) === String(selectedCourse?.id)) || selectedCourse

  const courseGroups = useMemo(
    () => groupsForCourse(groups, selectedCourse?.id),
    [groups, selectedCourse?.id],
  )

  const selectedGroup =
    courseGroups.find((group) => String(group.id) === String(selectedGroupId)) ||
    courseGroups[0] ||
    null

  const initialLoading = loading && (!coursesLoaded || !groupsLoaded)

  const selectCourse = (courseId) => {
    const nextGroups = groupsForCourse(groups, courseId)
    setSelectedCourseId(String(courseId))
    setSelectedGroupId(nextGroups[0]?.id || '')
    setAddMemberOpen(false)
  }

  const selectGroup = (groupId) => {
    setSelectedGroupId(String(groupId))
    setAddMemberOpen(false)
  }

  const backToCourses = () => {
    setSelectedCourseId('')
    setSelectedGroupId('')
    setAddMemberOpen(false)
  }

  const handleGroupSaved = (saved) => {
    if (saved) {
      setSelectedCourseId(String(saved.course_id || ''))
      setSelectedGroupId(String(saved.id || ''))
    }
    refresh()
  }

  const deleteGroup = async () => {
    if (!selectedGroup) return

    const approved = await confirm({
      title: `Hapus ${selectedGroup.name}?`,
      message: 'Seluruh keanggotaan kelompok akan dilepas. Tugas kelompok yang menargetkan kelompok ini dapat terdampak.',
      confirmLabel: 'Hapus',
    })
    if (!approved) return

    try {
      await api.delete(`/staff/groups/${selectedGroup.id}`)
      toast.success('Kelompok dihapus', 'Kelompok dan seluruh keanggotaannya berhasil dihapus.')
      const remaining = courseGroups.filter(
        (group) => String(group.id) !== String(selectedGroup.id),
      )
      setSelectedGroupId(remaining[0]?.id || '')
      setAddMemberOpen(false)
      refresh()
    } catch (deleteError) {
      toast.error('Gagal menghapus kelompok', errorMessage(deleteError))
    }
  }

  const removeMember = async (member) => {
    if (!selectedGroup) return

    const approved = await confirm({
      title: `Keluarkan ${member.name}?`,
      message: 'Mahasiswa ini akan dilepas dari kelompok. Ketua kelompok tidak dapat dikeluarkan.',
      confirmLabel: 'Keluarkan',
    })
    if (!approved) return

    setRemovingUserId(String(member.user_id))

    try {
      await api.delete(`/staff/groups/${selectedGroup.id}/members/${member.user_id}`)
      toast.success('Anggota dikeluarkan', `${member.name} berhasil dikeluarkan dari kelompok.`)
      refresh()
    } catch (removeError) {
      toast.error('Gagal mengeluarkan anggota', errorMessage(removeError))
    } finally {
      setRemovingUserId('')
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Akademik"
        title="Kelompok Mahasiswa"
        description="Susun kelompok untuk setiap mata kuliah, tentukan ketua, dan atur anggotanya."
      />

      <MascotGif mascot="semangat" variant="banner" className="psy-page-mascot" />

      {initialLoading ? (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <Skeleton key={item} className="h-44" />
          ))}
        </div>
      ) : error && (!coursesLoaded || !groupsLoaded) ? (
        <Card className="p-6">
          <EmptyState
            icon={UsersRound}
            title="Gagal memuat kelompok"
            description={errorMessage(error, 'Periksa koneksi API dan coba lagi.')}
            action={
              <Button variant="secondary" size="sm" onClick={refresh}>
                <RefreshCw className="h-4 w-4" />
                Coba lagi
              </Button>
            }
          />
        </Card>
      ) : selectedCourse ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <Button variant="secondary" size="sm" onClick={backToCourses}>
                <ArrowLeft className="h-3.5 w-3.5" />
                Kembali
              </Button>
              <div className="min-w-0">
                <h2 className="text-lg font-bold leading-6 text-slate-900">{selectedCourse.name}</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {[selectedCourse.code, selectedCourse.class_name, selectedCourse.prodi_name]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setGroupModal({ group: null })}>
                <Plus className="h-3.5 w-3.5" />
                Tambah Kelompok
              </Button>
              {selectedGroup ? (
                <>
                  <Button variant="secondary" size="sm" onClick={() => setAddMemberOpen(true)}>
                    <UserPlus className="h-3.5 w-3.5" />
                    Tambah Anggota
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setGroupModal({ group: selectedGroup })}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Ubah Kelompok
                  </Button>
                  <Button variant="danger" size="sm" onClick={deleteGroup}>
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus Kelompok
                  </Button>
                </>
              ) : null}
            </div>
          </div>

          {courseGroups.length === 0 ? (
            <Card className="p-6">
              <EmptyState
                icon={UsersRound}
                title="Belum ada kelompok pada mata kuliah ini"
                description="Tambahkan kelompok terlebih dahulu untuk mengelola anggotanya."
                action={
                  <Button size="sm" onClick={() => setGroupModal({ group: null })}>
                    <Plus className="h-4 w-4" />
                    Tambah Kelompok
                  </Button>
                }
              />
            </Card>
          ) : (
            <>
              <GroupChips
                groups={courseGroups}
                selectedGroupId={selectedGroup?.id}
                onSelect={selectGroup}
              />
              {selectedGroup ? (
                <GroupMembersTable
                  group={selectedGroup}
                  canManage
                  showContacts
                  onRemove={removeMember}
                  removingUserId={removingUserId}
                />
              ) : null}
            </>
          )}
        </div>
      ) : courseCards.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={BookOpen}
            title="Belum ada kelompok"
            description="Tambahkan kelompok untuk mulai mengelola anggota."
          />
        </Card>
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
          {courseCards.map((card) => (
            <GroupCourseCard key={card.id} card={card} onSelect={selectCourse} />
          ))}
        </div>
      )}

      <GroupFormModal
        open={Boolean(groupModal)}
        group={groupModal?.group || null}
        courseId={selectedCourse?.id || ''}
        courses={courses}
        students={students}
        groups={groups}
        studentsLoading={studentsState.loading}
        studentsError={studentsState.error ? errorMessage(studentsState.error) : ''}
        onClose={() => setGroupModal(null)}
        onSaved={handleGroupSaved}
      />

      <AddGroupMembersModal
        open={addMemberOpen && Boolean(selectedGroup)}
        group={selectedGroup}
        course={selectedCourseRecord}
        students={students}
        groups={groups}
        studentsLoading={studentsState.loading}
        studentsError={studentsState.error ? errorMessage(studentsState.error) : ''}
        onClose={() => setAddMemberOpen(false)}
        onSaved={() => refresh()}
      />
    </div>
  )
}
