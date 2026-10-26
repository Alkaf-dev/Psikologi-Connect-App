import { fetchAll } from '../hooks/useApiData'

export function courseLabel(course) {
  return `${course.code || '-'} · ${course.name || '-'}`
}

export async function loadProgramOptions() {
  const programs = await fetchAll('/staff/study-programs', { sort: 'name', direction: 'asc' })
  return programs.map((program) => ({
    value: program.id,
    label: program.label || `${program.degree || ''} ${program.name || ''}`.trim(),
  }))
}

export async function loadCourseOptions(params = {}) {
  const courses = await fetchAll('/staff/courses', { sort: 'name', direction: 'asc', ...params })
  return courses.map((course) => ({
    value: course.id,
    label: courseLabel(course),
  }))
}

export async function loadStudentOptions(params = {}) {
  const students = await fetchAll('/staff/students', {
    active: true,
    sort: 'name',
    direction: 'asc',
    ...params,
  })
  return students.map((student) => ({
    value: student.id,
    label: `${student.name}${student.npm ? ` · ${student.npm}` : ''}${student.class_name ? ` · ${student.class_name}` : ''}`,
  }))
}

export async function loadGroupOptions(params = {}) {
  const groups = await fetchAll('/staff/groups', { sort: 'name', direction: 'asc', ...params })
  return groups.map((group) => ({
    value: group.id,
    label: `${group.name}${group.course_code ? ` · ${group.course_code}` : ''}`,
  }))
}

export async function loadGroupsWithMembers() {
  return fetchAll('/staff/groups', {
    with_members: 1,
    per_page: 100,
    sort: 'name',
    direction: 'asc',
  })
}

export async function loadTaskOptions(params = {}) {
  const tasks = await fetchAll('/staff/tasks', {
    per_page: 100,
    sort: 'deadline',
    direction: 'desc',
    ...params,
  })
  return tasks.map((task) => ({
    value: task.id,
    label: `${task.title} · ${task.course_code || ''}`,
  }))
}

export async function loadAllTasks(params = {}) {
  return fetchAll('/staff/tasks', {
    per_page: 100,
    sort: 'deadline',
    direction: 'desc',
    ...params,
  })
}
