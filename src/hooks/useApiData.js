import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

export function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debounced
}

export function useApiData(path, params, options = {}) {
  const { enabled = true, initialData = null, keepPrevious = true, allPages = false } = options
  const [data, setData] = useState(initialData)
  const [meta, setMeta] = useState(null)
  const [links, setLinks] = useState(null)
  const [loading, setLoading] = useState(Boolean(enabled && path))
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const paramsKey = useMemo(() => JSON.stringify(params ?? {}), [params])

  const refresh = useCallback(() => {
    setReloadKey((key) => key + 1)
  }, [])

  useEffect(() => {
    let active = true

    if (!enabled || !path) {
      setLoading(false)
      return () => {
        active = false
      }
    }

    const load = async () => {
      setLoading(true)
      setError(null)

      if (!keepPrevious) setData(initialData)

      try {
        const requestParams = JSON.parse(paramsKey)
        const response = allPages
          ? { data: await fetchAll(path, requestParams) }
          : await api.get(path, requestParams)
        if (!active) return

        if (response && Array.isArray(response.data)) {
          setData(response.data)
          setMeta(response.meta ?? null)
          setLinks(response.links ?? null)
        } else if (response && 'data' in response) {
          setData(response.data)
          setMeta(response.meta ?? null)
          setLinks(response.links ?? null)
        } else {
          setData(response)
          setMeta(null)
          setLinks(null)
        }
      } catch (requestError) {
        if (active) {
          setError(requestError)
          if (!keepPrevious) setData(initialData)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, paramsKey, enabled, reloadKey, keepPrevious, allPages])

  return { data, meta, links, loading, error, refresh, setData }
}

export async function fetchAll(path, params = {}) {
  const perPage = Number(params.per_page) || 500
  const first = await api.get(path, { ...params, page: 1, per_page: perPage })
  const items = Array.isArray(first?.data) ? [...first.data] : []
  const lastPage = Number(first?.meta?.last_page) || 1

  for (let page = 2; page <= lastPage; page += 1) {
    const response = await api.get(path, { ...params, page, per_page: perPage })
    if (Array.isArray(response?.data)) items.push(...response.data)
  }

  return items
}
