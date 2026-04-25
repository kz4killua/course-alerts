'use client'

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { listCourses } from '@/services/courses'

export function useCourses(term?: string, search?: string) {
  const enabled = !!term && !!search && search.length > 0

  return useQuery({
    queryKey: ['courses', term, search],
    queryFn: async () => {
      const response = await listCourses(term, search)
      return response.data
    },
    enabled: !!term && !!search && search.length > 0,
    placeholderData: enabled ? keepPreviousData : undefined
  })
}