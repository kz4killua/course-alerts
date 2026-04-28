import { useState, useEffect } from "react"

export function useCountdown(initial: number) {
  const [count, setCount] = useState(initial)
  const finished = count === 0

  useEffect(() => {
    if (finished) return
    const id = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          clearInterval(id)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [finished])

  function reset() {
    setCount(initial)
  }

  return { count, reset }
}