'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createSubscriptions, listSubscriptions, deleteSubscriptions } from '@/services/alerts'
import { useUser } from '@/hooks/use-user'
import type { Section, Subscription } from "@/types";


export function useSubscriptions() {
  const { data: user } = useUser()

  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const response = await listSubscriptions()
      return response.data
    },
    enabled: !!user,
  })
}


export function useCreateSubscriptions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sectionIds: Section["id"][]) => {
      const response = await createSubscriptions(sectionIds)
      return response.data
    },
    onSuccess: (newSubscriptions) => {
      queryClient.setQueryData<Subscription[]>(['subscriptions'], (oldSubscriptions) => {
        return oldSubscriptions ? [...oldSubscriptions, ...newSubscriptions] : newSubscriptions
      })
    },
  })
}

export function useDeleteSubscriptions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (subscriptionIds: Subscription["id"][]) => {
      await deleteSubscriptions(subscriptionIds)
      return subscriptionIds
    },
    onSuccess: (deletedSubscriptionIds) => {
      queryClient.setQueryData<Subscription[]>(['subscriptions'], (oldSubscriptions) => {
        return oldSubscriptions ? oldSubscriptions.filter(s => !deletedSubscriptionIds.includes(s.id)) : []
      })
    },
  })
}