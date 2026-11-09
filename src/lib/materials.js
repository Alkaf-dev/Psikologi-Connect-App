function pickUrl(...values) {
  for (const value of values) {
    if (Array.isArray(value)) {
      const nested = pickUrl(...value)
      if (nested) return nested
      continue
    }

    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }

    if (value && typeof value === 'object') {
      const nested = pickUrl(value.url, value.link, value.href)
      if (nested) return nested
    }
  }

  return ''
}

export function buildLearningMaterials({
  tasks = [],
  courses = [],
  schedules = [],
  manualMaterials = [],
  includeTasks = true,
} = {}) {
  const courseMap = new Map(
    (Array.isArray(courses) ? courses : []).map((course) => [String(course.id), course]),
  )
  const materials = []
  const seenManualIds = new Set()
  const seenFallbackKeys = new Set()

  const addMaterial = (item) => {
    if (!item.url) return

    // 1. Materi manual dosen:
    // JANGAN PERNAH di-deduplikasi berdasarkan URL!
    // Satu dosen bisa menggunakan buku / tautan Google Drive / BookCreator yang sama
    // untuk beberapa sesi pertemuan sekaligus (misal Pertemuan 1 s.d. 6).
    if (item.sourceType === 'manual') {
      const recordId = String(
        item.record?.id ||
          item.id ||
          `${item.course_id}-${item.meeting_number}-${item.title}`,
      )
      if (seenManualIds.has(recordId)) return
      seenManualIds.add(recordId)
      materials.push(item)
      return
    }

    // 2. Sumber otomatis fallback (silabus mata kuliah, drive mk, sesi jadwal):
    // Deduplikasi per mata kuliah agar berkas umum tidak berulang
    const courseKey = String(item.course_id || item.course_name || '')
    const fallbackKey = `${courseKey}::${item.url}`
    if (seenFallbackKeys.has(fallbackKey)) return
    seenFallbackKeys.add(fallbackKey)

    // Jangan masukkan fallback jika materi dosen manual pada mata kuliah ini sudah memiliki tautan tersebut
    const alreadyCoveredInManual = materials.some(
      (m) =>
        m.sourceType === 'manual' &&
        String(m.course_id) === courseKey &&
        m.url === item.url,
    )
    if (alreadyCoveredInManual) return

    materials.push(item)
  }

  ;(Array.isArray(manualMaterials) ? manualMaterials : []).forEach((material) => {
    const course = courseMap.get(String(material.course_id)) || material.course || {}
    const url = pickUrl(material.url, material.link, material.material_url)

    addMaterial({
      id: `material-${material.id}`,
      title: material.title || 'Materi Perkuliahan',
      course_name: material.course_name || course.name || 'Mata Kuliah',
      course_code: material.course_code || course.code || '',
      course_id: String(material.course_id || course.id || ''),
      meeting_number: material.meeting_number || null,
      url,
      sourceType: 'manual',
      sourceLabel: 'Materi Dosen',
      description:
        material.description || 'Materi perkuliahan yang dibagikan oleh dosen pengampu.',
      lecturer: material.lecturer || course.lecturer || '',
      deadline: null,
      relatedTask: null,
      record: material,
    })
  })

  const taskList = includeTasks ? (Array.isArray(tasks) ? tasks : []) : []
  taskList.forEach((task) => {
    const course = courseMap.get(String(task.course_id)) || {}
    const url = pickUrl(
      task.attachment_url,
      task.material_url,
      task.material_link,
      task.attachment,
      task.materials,
    )

    addMaterial({
      id: `task-mat-${task.id}`,
      title: task.title || 'Materi Perkuliahan',
      course_name: task.course_name || course.name || 'Mata Kuliah',
      course_code: task.course_code || course.code || '',
      course_id: String(task.course_id || course.id || ''),
      meeting_number: task.meeting_number || null,
      url,
      sourceType: 'task',
      sourceLabel: 'Materi & Penugasan',
      description:
        task.description ||
        'Bahan rujukan materi dan instruksi pelaksanaan tugas perkuliahan.',
      lecturer: task.lecturer_name || course.lecturer || '',
      deadline: task.deadline || null,
      relatedTask: task,
    })
  })

  ;(Array.isArray(courses) ? courses : []).forEach((course) => {
    const url = pickUrl(course.material_link, course.syllabus_url, course.drive_url)

    addMaterial({
      id: `course-mat-${course.id}`,
      title: `Silabus & Berkas Drive: ${course.name}`,
      course_name: course.name,
      course_code: course.code || '',
      course_id: String(course.id),
      meeting_number: null,
      url,
      sourceType: 'course',
      sourceLabel: 'Drive / Silabus MK',
      description: `Folder repositori berkas pembelajaran, silabus modul, dan bahan presentasi mata kuliah ${course.name}.`,
      lecturer: course.lecturer || '',
      deadline: null,
      relatedTask: null,
    })
  })

  ;(Array.isArray(schedules) ? schedules : []).forEach((schedule) => {
    const course = courseMap.get(String(schedule.course_id)) || schedule.course || {}
    const url = pickUrl(schedule.material_link, schedule.material_url)
    const courseName = schedule.course_name || course.name || 'Mata Kuliah'
    const day = schedule.day ? `hari ${schedule.day}` : 'sesi perkuliahan'

    addMaterial({
      id: `schedule-mat-${schedule.id}`,
      title: `Bahan Pertemuan: ${courseName}`,
      course_name: courseName,
      course_code: schedule.course_code || course.code || '',
      course_id: String(schedule.course_id || course.id || ''),
      meeting_number: null,
      url,
      sourceType: 'schedule',
      sourceLabel: 'Bahan Sesi Kuliah',
      description: `Tautan materi digital untuk ${day}.`,
      lecturer: schedule.lecturer_name || schedule.course_lecturer || course.lecturer || '',
      deadline: null,
      relatedTask: null,
    })
  })

  return materials
}
