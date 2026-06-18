import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '../services/userService'
import type { CreateUserInput, UpdateProfileInput } from '../services/userService'


export const useUsersList = (role?: string, search?: string) => {
  return useQuery({
    queryKey: ['users', role, search],
    queryFn: () => userService.getUsers(role, search),
  })
}

export const useUserDetail = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
  })
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserInput) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; role?: string; phone?: string; active?: boolean } }) =>
      userService.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] })
    },
  })
}

export const useUpdatePermissions = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, modules }: { id: string; modules: any }) =>
      userService.updatePermissions(id, modules),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] })
    },
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProfileInput) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })
}

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: any) => userService.changePassword(data),
  })
}

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => userService.forgotPassword(email),
  })
}

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: any) => userService.resetPassword(data),
  })
}
