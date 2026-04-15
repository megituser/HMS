import { useQuery, useMutation, useQueryClient }
  from '@tanstack/react-query'
import * as api from '../api/usersAPI'
import toast from 'react-hot-toast'

export const useUsers = (page = 0, size = 10) =>
  useQuery({
    queryKey: ['users', page, size],
    queryFn: () => api.getAllUsers(page, size)
  })

export const useCreateUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('User created')
    }
  })
}

export const useUpdateUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) =>
      api.updateUser(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('User updated')
    }
  })
}
export const useDeleteUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('User deleted')
    }
  })
}
