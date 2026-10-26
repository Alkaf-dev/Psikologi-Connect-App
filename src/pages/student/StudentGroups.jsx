import { useMemo, useState } from 'react'
import { ArrowLeft, RefreshCw, UsersRound } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useGroupsData } from '../../hooks/useGroupsData'
import { groupsForCourse, preferredGroupId } from '../../lib/groupHelpers'
import { errorMessage } from '../../lib/api'
import { Button, Card, EmptyState, PageHeader, Skeleton } from '../../components/ui'
import { MascotGif } from '../../components/PsychologyMascot'
import GroupCourseCard from '../../components/GroupCourseCard'
import GroupChips from '../../components/GroupChips'
import GroupMembersTable from '../../components/GroupMembersTable'

export default function StudentGroups() {
  const { user } = useAuth()
  const { groups, courseCards, coursesLoaded, groupsLoaded, loading, error, refresh } =
    useGroupsData('student')
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState('')

  const selectedCourse =
    courseCards.find((course) => String(course.id) === String(selectedCourseId)) || null

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
    setSelectedGroupId(preferredGroupId(nextGroups, user?.id))
  }

  const backToCourses = () => {
    setSelectedCourseId('')
    setSelectedGroupId('')
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Akademik"
        title="Kelompok Saya"
        description="Lihat kelompok, ketua, dan anggota untuk setiap mata kuliah yang Anda ikuti."
      />

      <MascotGif mascot="semangat" variant="banner" className="psy-page-mascot" />

      {initialLoading ? (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <Skeleton key={item} className="h-44" />
          ))}
        </div>
      ) : error && !groupsLoaded ? (
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
          </div>

          {courseGroups.length === 0 ? (
            <Card className="p-6">
              <EmptyState
                icon={UsersRound}
                title="Belum ada kelompok pada mata kuliah ini"
                description="Hubungi admin atau dosen jika kelompok Anda belum dibuat."
              />
            </Card>
          ) : (
            <>
              <GroupChips
                groups={courseGroups}
                selectedGroupId={selectedGroup?.id}
                onSelect={setSelectedGroupId}
              />
              {selectedGroup ? <GroupMembersTable group={selectedGroup} /> : null}
            </>
          )}
        </div>
      ) : courseCards.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={UsersRound}
            title="Belum ada kelompok"
            description="Hubungi admin atau dosen jika kelompok Anda belum dibuat."
          />
        </Card>
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
          {courseCards.map((card) => (
            <GroupCourseCard key={card.id} card={card} onSelect={selectCourse} />
          ))}
        </div>
      )}
    </div>
  )
}
