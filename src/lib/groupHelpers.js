export function sortByName(items = []) {
  return [...items].sort((left, right) =>
    String(left?.name || '').localeCompare(String(right?.name || ''), undefined, {
      numeric: true,
      sensitivity: 'base',
    }),
  )
}

export function prodiLabel(names) {
  if (Array.isArray(names)) {
    return names.map((name) => String(name || '').trim()).filter(Boolean).join(', ') || 'Belum diatur'
  }

  return String(names || '').trim() || 'Belum diatur'
}

export function courseMeta(course) {
  return [course?.class_name, course?.prodi_name].filter(Boolean).join(' · ')
}

export function groupsForCourse(groups = [], courseId) {
  return sortByName(
    (groups || []).filter((group) => String(group?.course_id || '') === String(courseId || '')),
  )
}

export function preferredGroupId(courseGroups = [], userId) {
  if (!courseGroups.length) return ''

  const ownGroup = courseGroups.find((group) =>
    (group.members || []).some((member) => String(member.user_id) === String(userId)),
  )

  return String((ownGroup || courseGroups[0]).id)
}

export function buildCourseCards(courses = [], groups = [], { onlyWithGroups = false } = {}) {
  const groupsByCourse = new Map()

  ;(groups || []).forEach((group) => {
    const courseId = String(group?.course_id || '')
    if (!courseId) return

    if (!groupsByCourse.has(courseId)) groupsByCourse.set(courseId, [])
    groupsByCourse.get(courseId).push(group)
  })

  const knownCourseIds = new Set((courses || []).map((course) => String(course.id)))
  const cards = (courses || []).map((course) =>
    buildCard(course, groupsByCourse.get(String(course.id)) || []),
  )

  groupsByCourse.forEach((courseGroups, courseId) => {
    if (knownCourseIds.has(courseId)) return

    const firstGroup = courseGroups[0] || {}
    cards.push(
      buildCard(
        {
          id: courseId,
          code: firstGroup.course_code,
          name: firstGroup.course_name || 'Mata kuliah',
          class_name: '',
          prodi_names: undefined,
        },
        courseGroups,
      ),
    )
  })

  const visibleCards = onlyWithGroups
    ? cards.filter((card) => card.groups_count > 0)
    : cards

  return sortByName(visibleCards)
}

export function courseProgramIds(course) {
  const raw = course?.prodi_ids

  if (Array.isArray(raw)) {
    return raw.map((id) => String(id || '').trim()).filter(Boolean)
  }

  return String(raw || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
}

export function takenStudentIdsForCourse(groups = [], courseId, { excludeGroupId = '' } = {}) {
  const taken = new Set()

  ;(groups || []).forEach((group) => {
    if (String(group?.course_id || '') !== String(courseId || '')) return
    if (excludeGroupId && String(group.id) === String(excludeGroupId)) return

    const memberIds = Array.isArray(group.member_ids)
      ? group.member_ids
      : (group.members || []).map((member) => member.user_id)

    memberIds.forEach((id) => {
      if (id) taken.add(String(id))
    })
  })

  return taken
}

export function eligibleStudentsForCourse(
  students = [],
  course,
  groups = [],
  { excludeGroupId = '' } = {},
) {
  if (!course) return []

  const programIds = courseProgramIds(course)
  if (!programIds.length) return []

  const taken = takenStudentIdsForCourse(groups, course.id, { excludeGroupId })

  return sortByName(
    (students || []).filter(
      (student) =>
        student.active !== false &&
        programIds.includes(String(student.prodi_id || '')) &&
        !taken.has(String(student.id)),
    ),
  )
}

function buildCard(course, groups) {
  return {
    id: String(course.id || ''),
    code: String(course.code || ''),
    name: String(course.name || 'Mata kuliah'),
    class_name: String(course.class_name || ''),
    prodi_name: course.prodi_names === undefined ? '' : prodiLabel(course.prodi_names),
    groups_count: groups.length,
    members_count: groups.reduce(
      (total, group) => total + Number(group.members_count ?? group.members?.length ?? 0),
      0,
    ),
  }
}
