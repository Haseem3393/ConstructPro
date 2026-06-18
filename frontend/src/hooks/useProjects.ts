import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectService } from '../services/projectService'
import type { Project } from '../types'

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getProjects(),
  })
}

export const useProjectDetails = (id: string) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getProjectById(id),
    enabled: !!id,
  })
}

export const useCreateProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'status'> & { managerId?: string; clientId?: string }) =>
      projectService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
    },
  })
}

export const useUpdateProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> & { managerId?: string; clientId?: string } }) =>
      projectService.updateProject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
    },
  })
}

export const useDeleteProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
    },
  })
}

export const useCreateMilestone = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: { name: string; description?: string; dueDate: string } }) =>
      projectService.createMilestone(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] })
    },
  })
}

export const useCreateMember = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: { userId: string; role?: string } }) =>
      projectService.createMember(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] })
    },
  })
}

export const useCreateExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: { amount: number; category: string; description?: string; date: string } }) =>
      projectService.createExpense(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
    },
  })
}
