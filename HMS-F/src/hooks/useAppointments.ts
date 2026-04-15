import { useQuery, useMutation, useQueryClient } 
  from '@tanstack/react-query'
import * as api from '../api/appointmentsAPI'
import toast from 'react-hot-toast'

export const useAppointments = (page=0, size=10) =>
  useQuery({ 
    queryKey: ['appointments', page, size],
    queryFn: () => api.getAllAppointments(page, size)
  })

export const useMyAppointments = () =>
  useQuery({
    queryKey: ['appointments', 'my'],
    queryFn: api.getMyAppointments
  })

export const useCreateAppointment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createAppointment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] })
      toast.success('Appointment booked')
    },
    onError: () => toast.error('Failed to book appointment')
  })
}

export const useCompleteAppointment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.completeAppointment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] })
      toast.success('Appointment completed')
    }
  })
}

export const useCancelAppointment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.cancelAppointment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] })
      toast.success('Appointment cancelled')
    }
  })
}
