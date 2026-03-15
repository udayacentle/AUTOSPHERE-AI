import { useEffect, useState, useCallback, useRef } from 'react'

/** Poll interval in ms. Refetch so DB changes show in the app. */
const DEFAULT_POLL_MS = 15_000

export interface UseApiDataOptions {
  /** Refetch every N ms. Set to 0 to disable polling. */
  pollInterval?: number
  /** Refetch when window/tab gains focus (default true). */
  refetchOnFocus?: boolean
}

export function useApiData<T>(
  fetchFn: () => Promise<T>,
  options: UseApiDataOptions = {}
): { data: T | null; loading: boolean; error: string | null; refetch: () => Promise<void> } {
  const { pollInterval = DEFAULT_POLL_MS, refetchOnFocus = true } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchFnRef = useRef(fetchFn)
  fetchFnRef.current = fetchFn

  const refetch = useCallback(async (background = false) => {
    if (!background) {
      setLoading(true)
      setError(null)
    }
    try {
      const result = await fetchFnRef.current()
      setData(result)
    } catch (e) {
      if (!background) {
        const msg = e instanceof Error ? e.message : 'Failed to load'
        setError(msg.includes('<') || msg.includes('DOCTYPE') ? 'Unable to load data' : msg)
      }
    } finally {
      if (!background) setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  useEffect(() => {
    if (pollInterval <= 0) return
    const id = setInterval(() => refetch(true), pollInterval)
    return () => clearInterval(id)
  }, [pollInterval, refetch])

  useEffect(() => {
    if (!refetchOnFocus) return
    const onFocus = () => refetch(true)
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refetchOnFocus, refetch])

  const refetchOnce = useCallback(() => refetch(false), [refetch])
  return { data, loading, error, refetch: refetchOnce }
}
