import { useCallback, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useApiData } from './useApiData'
import { buildCourseCards } from '../lib/groupHelpers'

export function useGroupsData(mode, options = {}) {
  const { enabled = true } = options
  const { isStaff: authIsStaff } = useAuth()
  const isPublicEndpoint = mode === 'public'
  const isStaffEndpoint = !isPublicEndpoint && (mode === 'staff' || Boolean(authIsStaff))

  const courseParams = useMemo(
    () => ({ per_page: 500, sort: 'name', direction: 'asc' }),
    [],
  )

  const groupParams = useMemo(
    () => ({
      per_page: 500,
      sort: 'name',
      direction: 'asc',
      ...(isStaffEndpoint || isPublicEndpoint ? { with_members: 1 } : {}),
    }),
    [isStaffEndpoint, isPublicEndpoint],
  )

  const coursesState = useApiData(
    isPublicEndpoint ? '/display/courses' : isStaffEndpoint ? '/staff/courses' : '/student/courses',
    courseParams,
    { allPages: true, enabled },
  )

  const groupsState = useApiData(
    isPublicEndpoint ? '/display/groups' : isStaffEndpoint ? '/staff/groups' : '/student/groups',
    groupParams,
    { allPages: true, enabled },
  )

  const courses = coursesState.data || []
  const groups = groupsState.data || []

  const courseCards = useMemo(
    () => buildCourseCards(courses, groups, { onlyWithGroups: mode !== 'staff' }),
    [courses, groups, mode],
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
