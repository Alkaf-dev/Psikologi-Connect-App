import { useCallback, useMemo } from 'react'
import { useApiData } from './useApiData'
import { buildCourseCards } from '../lib/groupHelpers'

export function useGroupsData(mode) {
  const isStaff = mode === 'staff'

  const courseParams = useMemo(
    () => ({ per_page: 500, sort: 'name', direction: 'asc' }),
    [],
  )

  const groupParams = useMemo(
    () => ({
      per_page: 500,
      sort: 'name',
      direction: 'asc',
      ...(isStaff ? { with_members: 1 } : {}),
    }),
    [isStaff],
  )

  const coursesState = useApiData(
    isStaff ? '/staff/courses' : '/student/courses',
    courseParams,
    { allPages: true },
  )

  const groupsState = useApiData(
    isStaff ? '/staff/groups' : '/student/groups',
    groupParams,
    { allPages: true },
  )

  const courses = coursesState.data || []
  const groups = groupsState.data || []

  const courseCards = useMemo(
    () => buildCourseCards(courses, groups, { onlyWithGroups: !isStaff }),
    [courses, groups, isStaff],
  )

  const refresh = useCallback(() => {
    coursesState.refresh()
    groupsState.refresh()
  }, [coursesState.refresh, groupsState.refresh])

  return {
    courses,
    groups,
    courseCards,
    coursesLoaded: coursesState.data !== null,
    groupsLoaded: groupsState.data !== null,
    loading: coursesState.loading || groupsState.loading,
    error: coursesState.error || groupsState.error,
    refresh,
  }
}
