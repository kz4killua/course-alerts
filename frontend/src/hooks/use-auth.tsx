'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  removeAccessToken,
  removeRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '@/lib/tokens'
import { requestSignIn, verifySignIn } from '@/services/accounts'

export function useRequestSignIn() {
  return useMutation({
    mutationFn: async (email: string) => {
      return await requestSignIn(email)
    },
  })
}

export function useVerifySignIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ email, code }: { email: string; code: string }) => {
      const response = await verifySignIn(email, code)
      return response.data
    },
    onSuccess: async (data) => {
      setAccessToken(data.access)
      setRefreshToken(data.refresh)
      await queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      removeAccessToken()
      removeRefreshToken()
    },
    onSuccess: async () => {
      queryClient.resetQueries()
    },
  })
}
