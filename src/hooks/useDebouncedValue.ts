import { useEffect, useState } from 'react'

/**
 * Debounces a value by the specified delay. The returned value updates only
 * after the input has stopped changing for `delay` milliseconds, which is
 * ideal for search inputs to avoid filtering on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debounced
}
