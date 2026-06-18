import { useMutation, useQuery } from '@tanstack/react-query'
import { authService } from '../services/authService'
import type { LoginCredentials } from '../types'
import { useAuthStore } from '../store/authStore'

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      setAuth(data.user, data.token)
    },
  })
}

export const useCurrentUser = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getCurrentUser(),
    enabled: isAuthenticated,
  })
}
