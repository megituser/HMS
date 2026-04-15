import { useQuery, useMutation, useQueryClient }
  from '@tanstack/react-query'
import * as api from '../api/patientsAPI'
import toast from 'react-hot-toast'

export const usePatients = (page = 0, size = 10) =>
  useQuery({
    queryKey: ['patients', page, size],
    queryFn: () => api.getAllPatients(page, size)
  })

export const usePatient = (id: number) =>
  useQuery({
    queryKey: ['patient', id],
    queryFn: () => api.getPatientById(id),
    enabled: !!id
  })

export const useSearchPatients = (keyword: string) =>
  useQuery({
    queryKey: ['patients', 'search', keyword],
    queryFn: () => api.searchPatients(keyword),
    enabled: keyword.length > 1
  })

export const useCreatePatient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createPatient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] })
      toast.success('Patient created')
    },
    onError: () => toast.error('Failed to create patient')
  })
}

export const useUpdatePatient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) =>
      api.updatePatient(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] })
      toast.success('Patient updated')
    }
  })
}

export const useDeactivatePatient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deactivatePatient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] })
      toast.success('Patient deactivated')
    }
  })
}
