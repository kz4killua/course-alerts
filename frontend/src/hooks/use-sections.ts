"use client"

import { useQuery } from "@tanstack/react-query"
import { listSections } from "@/services/courses"

export function useSections(course: string, term?: string, enabled = true) {
  return useQuery({
    queryKey: ["sections", course, term],
    queryFn: async () => {
      const response = await listSections(course, term)
      return response.data
    },
    enabled: enabled,
  })
}
