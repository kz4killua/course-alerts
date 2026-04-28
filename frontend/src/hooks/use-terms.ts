"use client"

import { useQuery } from "@tanstack/react-query"
import { listTerms } from "@/services/courses"

export function useTerms(registrationOpen?: boolean) {
  return useQuery({
    queryKey: ["terms", registrationOpen],
    queryFn: async () => {
      const response = await listTerms(registrationOpen)
      return response.data
    },
  })
}
