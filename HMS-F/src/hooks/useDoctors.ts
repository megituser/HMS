import { useQuery, useMutation, useQueryClient }
  from '@tanstack/react-query'
import * as api from '../api/doctorsAPI'
import toast from 'react-hot-toast'

export const useDoctors = (page = 0, size = 10) =>
  useQuery({
    queryKey: ['doctors', page, size],
    queryFn: async () => {
      const resp = await api.getAllDoctors(page, size);
      console.log("[useDoctors] API Response:", resp.data); // 🔍 Debug Log
      return resp.data;
    }
  })

export const useMyDoctorProfile = () =>
  useQuery({
    queryKey: ['doctor', 'me'],
    queryFn: async () => {
      const resp = await api.getMyProfile();
      return resp.data;
    }
  })

export const useDoctorsByDepartment = (deptId: number) =>
  useQuery({
    queryKey: ['doctors', 'dept', deptId],
    queryFn: async () => {
      const resp = await api.getDoctorsByDepartment(deptId);
      return resp.data;
    },
    enabled: !!deptId
  })

export const useCreateDoctor = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createDoctor,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doctors'] })
      toast.success('Doctor created')
    },
    onError: (err: any) => {
      console.error('Doctor creation failed:', err.response?.data || err.message);
      toast.error('Failed to create doctor');
    }
  })
}

export const useUpdateDoctor = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) =>
      api.updateDoctor(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doctors'] })
      toast.success('Doctor updated')
    }
  })
}

export const useDeactivateDoctor = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deactivateDoctor,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doctors'] })
      toast.success('Doctor deactivated')
    }
  })
}
