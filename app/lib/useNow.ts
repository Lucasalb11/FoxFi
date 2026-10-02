'use client'

import { useEffect, useState } from 'react'

/** Current unix time in seconds, ticking every second, for countdowns. */
export function useNow() {
  const [now, setNow] = useState(() => Date.now() / 1000)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now() / 1000), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}
