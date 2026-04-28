"use client"

import eventEmitter from "@/lib/event-emitter"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useLogout } from "@/hooks/use-auth"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error: any) => {
              const status = error?.response?.status || error?.status
              if (status >= 400 && status < 500) {
                return false
              }
              return failureCount < 3
            },
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 10,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <LogoutListener />
      {children}
    </QueryClientProvider>
  )
}

function LogoutListener() {
  const { mutate: logout } = useLogout()

  useEffect(() => {
    const handleLogout = () => logout()
    eventEmitter.addEventListener("logout", handleLogout)
    return () => {
      eventEmitter.removeEventListener("logout", handleLogout)
    }
  }, [logout])

  return null
}
