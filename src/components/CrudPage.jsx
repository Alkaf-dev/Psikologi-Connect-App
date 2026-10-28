import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react'
import { api, errorMessage } from '../lib/api'
import { useApiData, useDebouncedValue } from '../hooks/useApiData'
import { cn, toApiDateTime } from '../lib/utils'
import { useToast } from '../context/ToastContext'
import {
  Button,
  Card,
  Checkbox,
  EmptyState,
  Field,
  FilterChip,
  Input,
  Modal,
  PageHeader,
  Pagination,
  SearchInput,
  Select,
  Skeleton,
  Textarea,
} from './ui'
import { MascotGif } from './PsychologyMascot'

function resolveOptions(options, values, lookups) {
  if (!options) return []
  const raw = typeof options === 'function' ? options(values, lookups) : options
  return (raw || []).map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option,
  )
}

function normalizeValue(value) {
  if (value === '') return null
  return value
}

function preparePayload(values) {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      Array.isArray(value) ? value : normalizeValue(value),
    ]),
  )
}

function FormField({ field, values, lookups, errors, onChange }) {
  const required = Boolean(field.required)
  const options = resolveOptions(field.options, values, lookups)
  const error = errors?.[field.name]
  const errorMessage = Array.isArray(error) ? error[0] : error
  const value = values[field.name]
  const id = `field-${field.name}`

  switch (field.type) {
    case 'textarea':
      return (
        <Field label={field.label} htmlFor={id} required={required} error={errorMessage} help={field.help} className={field.colSpan === 2 ? 'sm:col-span-2' : ''}>
          <Textarea
            id={id}
            rows={field.rows || 4}
            value={value ?? ''}
            onChange={(event) => onChange(field.name, event.target.value)}
            placeholder={field.placeholder}
            required={required}
            error={Boolean(errorMessage)}
          />
        </Field>
      )

    case 'select':
      return (
        <Field label={field.label} htmlFor={id} required={required} error={errorMessage} help={field.help} className={field.colSpan === 2 ? 'sm:col-span-2' : ''}>
          <Select
            id={id}
            value={value ?? ''}
            onChange={(event) => onChange(field.name, event.target.value)}
            required={required}
            error={Boolean(errorMessage)}
          >
            <option value="">{field.placeholder || 'Pilih...'}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      )

    case 'multiselect': {
      const currentArray = Array.isArray(value)
        ? value
        : typeof value === 'string'
          ? value.split(',').map((s) => s.trim()).filter(Boolean)
          : []

      return (
        <Field label={field.label} required={required} error={errorMessage} help={field.help} className={field.colSpan === 2 ? 'sm:col-span-2' : ''}>
          <div className="scrollbar-thin grid max-h-56 gap-1.5 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-2 sm:grid-cols-2">
            {options.length === 0 ? (
              <p className="col-span-full px-2 py-3 text-xs text-slate-400">{field.emptyLabel || 'Belum ada pilihan.'}</p>
            ) : (
              options.map((option, idx) => {
                if (option.header) {
                  return (
                    <div
                      key={`header-${idx}`}
                      className="col-span-full mt-1.5 first:mt-0 px-1 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-800/80 bg-teal-50/60 rounded"
                    >
                      {option.header}
                    </div>
                  )
                }

                const isMatch = (item) => {
                  if (item === option.value) return true
                  const lower = String(item || '').toLowerCase()
                  if (option.value === 'PSI' && (lower === 'psikologi islam' || lower === 'psikologi' || lower.includes('psikologi'))) return true
                  if (option.value === 'HKI' && (lower === 'hukum keluarga islam' || lower.includes('hukum keluarga'))) return true
                  if (option.value === 'ES' && (lower === "ekonomi syari'ah" || lower === 'ekonomi syariah' || lower.includes('ekonomi syari'))) return true
                  if (option.value === 'PGMI' && (lower === 'pendidikan guru madrasah ibtidaiyah' || lower.includes('madrasah ibtidaiyah'))) return true
                  return false
                }

                const selected = currentArray.some(isMatch)
                return (
                  <label
                    key={option.value}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-xs transition select-none',
                      selected
                        ? 'border-teal-300 bg-teal-50 text-teal-800 font-medium shadow-xs'
                        : 'border-transparent bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(event) => {
                        let next = currentArray.filter((item) => !isMatch(item))
                        if (event.target.checked) {
                          next.push(option.value)
                        }
                        const finalValue = field.outputString ? next.join(', ') : next
                        onChange(field.name, finalValue)
                      }}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                    <span className="min-w-0 truncate">{option.label}</span>
                  </label>
                )
              })
            )}
          </div>
          {field.showPreview !== false && currentArray.length > 0 ? (
            <p className="mt-1 text-[11px] text-teal-700 font-medium">
              <span className="text-slate-500 font-normal">Terpilih: </span>
              {currentArray.join(', ')}
            </p>
          ) : null}
        </Field>
      )
    }

    case 'checkbox':
      return (
        <div className={field.colSpan === 2 ? 'sm:col-span-2' : ''}>
          <Checkbox
            label={field.label}
            description={field.help}
            checked={Boolean(value)}
            onChange={(event) => onChange(field.name, event.target.checked)}
          />
          {errorMessage ? <p className="mt-1 text-xs font-medium text-rose-600">{errorMessage}</p> : null}
        </div>
      )

    default:
      return (
        <Field label={field.label} htmlFor={id} required={required} error={errorMessage} help={field.help} className={field.colSpan === 2 ? 'sm:col-span-2' : ''}>
          <Input
            id={id}
            type={field.type === 'url' ? 'text' : field.type || 'text'}
            inputMode={field.type === 'url' ? 'url' : undefined}
            value={value ?? ''}
            onChange={(event) => onChange(field.name, event.target.value)}
            onBlur={(event) => {
              if (field.type === 'url') {
                const raw = (event.target.value || '').trim()
                if (raw && !/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw)) {
                  onChange(field.name, `https://${raw}`)
                }
              }
            }}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            maxLength={field.maxLength}
            autoComplete={field.autoComplete}
            required={required}
            error={Boolean(errorMessage)}
          />
        </Field>
      )
  }
}

export default function CrudPage({
  eyebrow,
  title,
  description,
  listPath,
  writePath,
  columns = [],
  fields = [],
  filters = [],
  defaultParams = {},
  initialValues = {},
  mapItemToForm,
  mapFormToPayload,
  loadLookups,
  loadFilterLookups,
  deferLookups = false,
  extraActions,
  headerActions,
  createLabel = 'Tambah data',
  searchPlaceholder = 'Cari data...',
  emptyTitle = 'Belum ada data',
  emptyDescription = 'Data akan muncul di sini setelah ditambahkan.',
  emptyIcon,
  mascot,
  canCreate = true,
  canEdit = true,
  canDelete = true,
  canBulkDelete = true,
  deleteTitle = 'Hapus data?',
  deleteMessage = 'Data yang dihapus tidak dapat dikembalikan.',
  bulkDeleteTitle = 'Hapus data terpilih?',
  bulkDeleteMessage = (count) => `Yakin ingin menghapus ${count} data terpilih? Tindakan ini tidak dapat dikembalikan.`,
  formSize = 'lg',
  formDescription,
  onDataLoaded,
  centerHeaders = true,
  centerActions = false,
  responsiveActions = false,
  minTableWidth = 720,
  gridLines = true,
}) {
  const { toast, confirm } = useToast()
  const formId = useId()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [filterValues, setFilterValues] = useState(() =>
    Object.fromEntries(filters.map((filter) => [filter.key, filter.defaultValue || ''])),
  )
  const loadAllLookupsOnMount = Boolean(loadLookups) && !loadFilterLookups && !deferLookups
  const [lookups, setLookups] = useState({})
  const [lookupsLoading, setLookupsLoading] = useState(Boolean(loadFilterLookups) || loadAllLookupsOnMount)
  const [formLookupsLoading, setFormLookupsLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [values, setValues] = useState(initialValues)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const formLookupsLoadedRef = useRef(false)
  const formLookupsPromiseRef = useRef(null)
  const debouncedSearch = useDebouncedValue(search)

  const queryParams = useMemo(
    () => ({
      page,
      per_page: 25,
      ...defaultParams,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...Object.fromEntries(Object.entries(filterValues).filter(([, value]) => value !== '')),
    }),
    [page, defaultParams, debouncedSearch, filterValues],
  )

  const { data, meta, loading, error, refresh, setData } = useApiData(listPath, queryParams)

  useEffect(() => {
    if (!onDataLoaded || !data) return
    onDataLoaded(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const loadLookupsStage = useCallback((loader, stage) => {
    if (!loader) return Promise.resolve()

    if (stage === 'form') {
      if (formLookupsLoadedRef.current) return Promise.resolve()
      if (formLookupsPromiseRef.current) return formLookupsPromiseRef.current
      setFormLookupsLoading(true)
    } else {
      setLookupsLoading(true)
    }

    const promise = (async () => {
      try {
        const result = await loader()
        setLookups((current) => ({ ...current, ...(result || {}) }))
        if (stage !== 'filter') formLookupsLoadedRef.current = true
      } catch {
        if (stage !== 'filter') formLookupsLoadedRef.current = false
      } finally {
        if (stage === 'form') {
          setFormLookupsLoading(false)
          formLookupsPromiseRef.current = null
        } else {
          setLookupsLoading(false)
          if (stage === 'all') formLookupsPromiseRef.current = null
        }
      }
    })()

    if (stage !== 'filter') formLookupsPromiseRef.current = promise
    return promise
  }, [])

  useEffect(() => {
    if (loadFilterLookups) {
      loadLookupsStage(loadFilterLookups, 'filter')
    } else if (loadAllLookupsOnMount) {
      loadLookupsStage(loadLookups, 'all')
    } else {
      setLookupsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const ensureFormLookups = useCallback(
    () => loadLookupsStage(loadLookups, 'form'),
    [loadLookups, loadLookupsStage],
  )

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, filterValues])

  const visibleFields = fields
    .filter((field) => (field.visible ? field.visible(values, lookups) : true))
    .map((field) => ({
      ...field,
      required:
        typeof field.required === 'function'
          ? field.required(values, lookups)
          : field.requiredOnCreate
            ? !editing
            : field.required,
    }))

  const openCreate = () => {
    ensureFormLookups()
    setEditing(null)
    setFormErrors({})
    setValues({ ...initialValues })
    setModalOpen(true)
  }

  const openEdit = (item) => {
    ensureFormLookups()
    setEditing(item)
    setFormErrors({})
    setValues({
      ...initialValues,
      ...(mapItemToForm ? mapItemToForm(item) : item),
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
    setEditing(null)
    setFormErrors({})
  }

  const updateValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }))
    setFormErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFormErrors({})

    const normalizedValues = { ...values }
    visibleFields.forEach((field) => {
      if (field.type === 'url' && normalizedValues[field.name]) {
        const raw = String(normalizedValues[field.name]).trim()
        if (raw && !/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw)) {
          normalizedValues[field.name] = `https://${raw}`
        }
      }
    })

    const basePayload = preparePayload(
      Object.fromEntries(
        visibleFields.map((field) => [
          field.name,
          field.type === 'datetime-local' && normalizedValues[field.name]
            ? toApiDateTime(normalizedValues[field.name])
            : normalizedValues[field.name],
        ]),
      ),
    )
    const payload = mapFormToPayload ? mapFormToPayload(basePayload, { isEdit: Boolean(editing), values: normalizedValues, lookups }) : basePayload

    try {
      const response = editing
        ? await api.put(`${writePath || listPath}/${editing.id}`, payload)
        : await api.post(writePath || listPath, payload)

      toast.success(
        editing ? 'Data diperbarui' : 'Data ditambahkan',
        response?.message || (editing ? 'Perubahan berhasil disimpan.' : 'Data baru berhasil disimpan.'),
      )
      setModalOpen(false)
      setEditing(null)
      refresh()
    } catch (submitError) {
      setFormErrors(submitError.errors || {})
      toast.error(editing ? 'Gagal memperbarui data' : 'Gagal menambahkan data', errorMessage(submitError))
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    setSelectedIds([])
  }, [page])

  const allIdsOnPage = useMemo(() => (Array.isArray(data) ? data.map((item) => item.id) : []), [data])
  const isAllSelected = allIdsOnPage.length > 0 && allIdsOnPage.every((id) => selectedIds.includes(id))
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allIdsOnPage.includes(id)))
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allIdsOnPage])))
    }
  }

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleDelete = async (item) => {
    const approved = await confirm({
      title: deleteTitle,
      message: deleteMessage,
      confirmLabel: 'Hapus',
    })
    if (!approved) return

    // Optimistic UI update: hilangkan baris seketika tanpa kedip
    const previousData = data
    if (setData) {
      setData((current) => (Array.isArray(current) ? current.filter((i) => i.id !== item.id) : current))
    }
    setSelectedIds((prev) => prev.filter((id) => id !== item.id))

    try {
      await api.delete(`${writePath || listPath}/${item.id}`)
      toast.success('Data dihapus', 'Data berhasil dihapus dari sistem.')
      refresh()
    } catch (deleteError) {
      if (setData && previousData) {
        setData(previousData)
      }
      toast.error('Gagal menghapus data', errorMessage(deleteError))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return

    const count = selectedIds.length
    const approved = await confirm({
      title: typeof bulkDeleteTitle === 'function' ? bulkDeleteTitle(count) : bulkDeleteTitle,
      message:
        typeof bulkDeleteMessage === 'function'
          ? bulkDeleteMessage(count)
          : `Yakin ingin menghapus ${count} data terpilih? Tindakan ini tidak dapat dikembalikan.`,
      confirmLabel: `Hapus (${count})`,
    })
    if (!approved) return

    setBulkDeleting(true)
    const targets = [...selectedIds]
    const previousData = data

    // Optimistic UI update: hilangkan data terpilih seketika tanpa kedip
    if (setData) {
      setData((current) =>
        Array.isArray(current) ? current.filter((i) => !targets.includes(i.id)) : current,
      )
    }
    setSelectedIds([])

    try {
      const results = await Promise.allSettled(
        targets.map((id) => api.delete(`${writePath || listPath}/${id}`)),
      )

      const successCount = results.filter((r) => r.status === 'fulfilled').length
      const failedCount = results.filter((r) => r.status === 'rejected').length

      if (failedCount === 0) {
        toast.success('Data dihapus', `${successCount} data berhasil dihapus dari sistem.`)
      } else if (successCount > 0) {
        toast.warning(
          'Sebagian data terhapus',
          `${successCount} berhasil dihapus, ${failedCount} gagal.`,
        )
      } else {
        throw new Error('Semua penghapusan data gagal.')
      }

      refresh()
    } catch (bulkError) {
      if (setData && previousData) {
        setData(previousData)
      }
      toast.error('Gagal menghapus data', errorMessage(bulkError))
    } finally {
      setBulkDeleting(false)
    }
  }

  const resolvedFilterOptions = (filter) => resolveOptions(filter.options, values, lookups)
  const hasChipFilters = filters.some((filter) => filter.type === 'chips')

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={
          <>
            {headerActions}
            <Button variant="secondary" onClick={refresh} aria-label="Muat ulang data">
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
              <span className="hidden sm:inline">Muat ulang</span>
            </Button>
            {canCreate ? (
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                {createLabel}
              </Button>
            ) : null}
          </>
        }
      />

      {mascot ? <MascotGif mascot={mascot} variant="banner" className="psy-page-mascot" /> : null}

      <Card className="p-3">
        <div className={cn('flex flex-col gap-2', !hasChipFilters && 'xl:flex-row xl:items-center')}>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={searchPlaceholder}
            className={hasChipFilters ? '' : 'xl:flex-1'}
          />
          {filters.length > 0 ? (
            <div
              className={cn(
                hasChipFilters
                  ? 'flex w-full flex-wrap items-center gap-2'
                  : 'grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center',
              )}
            >
              {filters.map((filter) => {
                const value = filterValues[filter.key] || ''
                const options = resolvedFilterOptions(filter)

                if (filter.type === 'chips') {
                  return (
                    <div
                      key={filter.key}
                      className={cn(
                        'flex flex-wrap items-center gap-1.5',
                        filter.fullWidth && 'w-full',
                      )}
                    >
                      {filter.label ? (
                        <span className="mr-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          {filter.label}
                        </span>
                      ) : null}
                      <FilterChip
                        active={!value}
                        onClick={() =>
                          setFilterValues((current) => ({ ...current, [filter.key]: '' }))
                        }
                      >
                        {filter.placeholder || filter.label || 'Semua'}
                      </FilterChip>
                      {options.map((option) => (
                        <FilterChip
                          key={option.value}
                          active={String(value) === String(option.value)}
                          count={option.count}
                          onClick={() =>
                            setFilterValues((current) => ({
                              ...current,
                              [filter.key]: option.value,
                            }))
                          }
                        >
                          {option.label}
                        </FilterChip>
                      ))}
                    </div>
                  )
                }

                return (
                  <Select
                    key={filter.key}
                    value={value}
                    onChange={(event) =>
                      setFilterValues((current) => ({ ...current, [filter.key]: event.target.value }))
                    }
                    className="min-w-[130px] text-xs"
                  >
                    <option value="">{filter.placeholder || filter.label}</option>
                    {options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                )
              })}
              {lookupsLoading ? (
                <span className="inline-flex items-center gap-1.5 px-1 text-[11px] text-slate-400">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Memuat pilihan...
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </Card>

      {canDelete && canBulkDelete && selectedIds.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-200 bg-teal-50/95 p-3 px-4 text-xs shadow-sm transition-all animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2.5">
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1.5 text-[11px] font-bold text-white shadow-sm">
              {selectedIds.length}
            </span>
            <span className="font-semibold text-slate-800">data terpilih</span>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="font-medium text-teal-700 hover:text-teal-900 hover:underline"
            >
              Batalkan pilihan
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={handleBulkDelete}
              loading={bulkDeleting}
              disabled={bulkDeleting}
              className="gap-1.5 shadow-sm"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Hapus {selectedIds.length} data terpilih</span>
            </Button>
          </div>
        </div>
      ) : null}

      <Card className="relative overflow-hidden">
        {loading && data && data.length > 0 ? (
          <div className="absolute inset-x-0 top-0 z-10 h-0.5 bg-gradient-to-r from-teal-400 via-teal-600 to-teal-400 animate-pulse" />
        ) : null}

        {loading && (!data || data.length === 0) ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-12" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6">
            <EmptyState
              icon={Search}
              title="Gagal memuat data"
              description={errorMessage(error, 'Periksa koneksi API dan coba lagi.')}
              action={
                <Button variant="secondary" size="sm" onClick={refresh}>
                  <RefreshCw className="h-4 w-4" />
                  Coba lagi
                </Button>
              }
            />
          </div>
        ) : data?.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={emptyIcon}
              title={debouncedSearch || Object.values(filterValues).some(Boolean) ? 'Data tidak ditemukan' : emptyTitle}
              description={
                debouncedSearch || Object.values(filterValues).some(Boolean)
                  ? 'Coba ubah kata kunci atau filter pencarian.'
                  : emptyDescription
              }
              action={
                canCreate && !debouncedSearch ? (
                  <Button size="sm" onClick={openCreate}>
                    <Plus className="h-4 w-4" />
                    {createLabel}
                  </Button>
                ) : null
              }
            />
          </div>
        ) : (
          <>
            <div className="scrollbar-thin overflow-x-auto">
              <table className="w-full border-collapse text-left" style={{ minWidth: minTableWidth }}>
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500">
                    {canDelete && canBulkDelete ? (
                      <th
                        className={cn(
                          'w-11 px-3 py-3 text-center align-middle',
                          gridLines && 'border-r border-slate-200/80',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = isSomeSelected
                          }}
                          onChange={handleToggleSelectAll}
                          className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                          title={isAllSelected ? 'Batalkan pilih semua' : 'Pilih semua di halaman ini'}
                          aria-label="Pilih semua data di halaman ini"
                        />
                      </th>
                    ) : null}
                    {columns.map((column, index) => (
                      <th
                        key={column.key}
                        className={cn(
                          'whitespace-nowrap px-4 py-3 font-semibold',
                          centerHeaders ? 'text-center' : 'text-left',
                          gridLines && index < columns.length - 1 && 'border-r border-slate-200/80',
                          column.className,
                        )}
                      >
                        {column.label}
                      </th>
                    ))}
                    <th
                      className={cn(
                        'sticky right-0 w-[104px] bg-slate-50/80 px-4 py-3 font-semibold',
                        centerHeaders ? 'text-center' : 'text-right',
                        responsiveActions && 'max-sm:static',
                        gridLines && 'border-l border-slate-200/80',
                      )}
                    >
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((item) => {
                    const isSelected = selectedIds.includes(item.id)
                    return (
                      <tr
                        key={item.id}
                        className={cn(
                          'group transition hover:bg-slate-50/70',
                          isSelected && 'bg-teal-50/60 hover:bg-teal-50/80',
                        )}
                      >
                        {canDelete && canBulkDelete ? (
                          <td
                            className={cn(
                              'w-11 px-3 py-3 text-center align-middle',
                              gridLines && 'border-b border-slate-100',
                              gridLines && 'border-r border-slate-100',
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(item.id)}
                              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                              aria-label={`Pilih baris ${item.id}`}
                            />
                          </td>
                        ) : null}
                        {columns.map((column, index) => (
                        <td
                          key={column.key}
                          className={cn(
                            'px-4 py-3 align-middle text-sm text-slate-600',
                            gridLines && 'border-b border-slate-100',
                            gridLines && index < columns.length - 1 && 'border-r border-slate-100',
                            column.className,
                          )}
                        >
                          {column.render ? column.render(item, { lookups }) : item[column.key] ?? '-'}
                        </td>
                      ))}
                      <td
                        className={cn(
                          'sticky right-0 bg-white px-4 py-2 group-hover:bg-slate-50/70',
                          centerActions ? 'text-center' : 'text-right',
                          responsiveActions && 'max-sm:static',
                          gridLines && 'border-b border-l border-slate-100',
                        )}
                      >
                        <div className={cn('flex items-center gap-1', centerActions ? 'justify-center' : 'justify-end')}>
                          {extraActions ? extraActions(item, { refresh, lookups }) : null}
                          {canEdit ? (
                            <button
                              type="button"
                              onClick={() => openEdit(item)}
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-teal-50 hover:text-teal-700"
                              title="Edit"
                              aria-label="Edit data"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          ) : null}
                          {canDelete ? (
                            <button
                              type="button"
                              onClick={() => handleDelete(item)}
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                              title="Hapus"
                              aria-label="Hapus data"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-100 px-4 py-3">
              <Pagination
                currentPage={meta?.current_page ?? page}
                lastPage={meta?.last_page ?? 1}
                total={meta?.total}
                perPage={meta?.per_page}
                onChange={setPage}
              />
            </div>
          </>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? `Edit ${title.toLowerCase()}` : createLabel}
        description={formDescription || (editing ? 'Perbarui data di bawah ini.' : 'Lengkapi data untuk menambahkan entri baru.')}
        size={formSize}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              Batal
            </Button>
            <Button type="submit" form={formId} loading={saving} disabled={formLookupsLoading}>
              {editing ? 'Simpan perubahan' : 'Simpan data'}
            </Button>
          </>
        }
      >
        <form id={formId} onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
          {formLookupsLoading ? (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 sm:col-span-2">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Memuat pilihan formulir...
            </div>
          ) : null}
          {visibleFields.map((field) => (
            <FormField
              key={field.name}
              field={field}
              values={values}
              lookups={lookups}
              errors={formErrors}
              onChange={updateValue}
            />
          ))}
          {visibleFields.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada field yang dikonfigurasi.</p>
          ) : null}
          {Object.keys(formErrors).length > 0 ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 sm:col-span-2">
              <p className="font-semibold">Periksa kembali data Anda.</p>
              <p className="mt-0.5">Beberapa field belum valid. Pesan detail ditampilkan pada field terkait.</p>
            </div>
          ) : null}
        </form>
      </Modal>
    </div>
  )
}
