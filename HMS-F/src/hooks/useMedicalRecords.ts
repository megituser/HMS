import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/medicalRecordsAPI';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';

/**
 * Role-aware hook — ADMIN calls GET /medical-records (all records)
 * DOCTOR calls GET /medical-records/my (own records only)
 */
export const useMedicalRecords = () => {
  const role = useAuthStore((s) => s.role);
  const isAdmin = role === 'ROLE_ADMIN';

  return useQuery({
    queryKey: ['medical-records', role],
    queryFn: isAdmin ? api.getAllRecords : api.getMyRecords,
    // Returns MedicalRecord[] directly — no .data or .content extraction needed
  });
};

export const useCreateRecord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createRecord,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medical-records'] });
      toast.success('Medical record created');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create medical record');
    },
  });
};

export const useDeleteRecord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteRecord,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medical-records'] });
      toast.success('Record archived');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete record');
    },
  });
};