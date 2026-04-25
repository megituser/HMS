// ─── useWards.ts ─────────────────────────────────────────────────────────────
// Hooks for Departments, Rooms, Beds, and Admissions

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/roomsAPI';
import * as deptApi from '../api/departments.api';
import toast from 'react-hot-toast';
import type { DepartmentRequest } from '../types/ward.types';

// ── Departments ───────────────────────────────────────────────────────────────

export const useDepartments = () =>
  useQuery({
    queryKey: ['departments'],
    queryFn: deptApi.getAllDepartments,
  });

export const useCreateDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deptApi.createDepartment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department created successfully');
    },
    onError: (err: Error) => {
      toast.error(err?.message || 'Failed to create department');
    },
  });
};

export const useUpdateDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DepartmentRequest }) =>
      deptApi.updateDepartment(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department updated');
    },
    onError: (err: Error) => {
      toast.error(err?.message || 'Failed to update department');
    },
  });
};

export const useDeactivateDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deptApi.deactivateDepartment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department deactivated');
    },
    onError: (err: Error) => {
      toast.error(err?.message || 'Failed to deactivate department');
    },
  });
};

// ── Rooms ─────────────────────────────────────────────────────────────────────

export const useRooms = (page = 0, size = 10) =>
  useQuery({
    queryKey: ['rooms', page, size],
    queryFn: () => api.getAllRooms(page, size),
  });

export const useCreateRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createRoom,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room created');
    },
    onError: (err: Error) => {
      toast.error(err?.message || 'Failed to create room');
    },
  });
};

export const useDeleteRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteRoom,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room deleted');
    },
  });
};

// ── Beds ──────────────────────────────────────────────────────────────────────

export const useAvailableBeds = () =>
  useQuery({
    queryKey: ['beds', 'available'],
    queryFn: api.getAvailableBeds,
  });

export const useBedsByRoom = (roomId: number) =>
  useQuery({
    queryKey: ['beds', 'room', roomId],
    queryFn: () => api.getBedsByRoom(roomId),
    enabled: !!roomId,
  });

export const useCreateBed = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createBed,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['beds'] });
      toast.success('Bed created');
    },
  });
};

export const useDeleteBed = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteBed,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['beds'] });
      toast.success('Bed deleted');
    },
  });
};

export const useUpdateBedStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.updateBedStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['beds'] });
      toast.success('Bed status updated');
    },
  });
};

// ── Admissions ────────────────────────────────────────────────────────────────

export const useAdmissions = (page = 0, size = 10) =>
  useQuery({
    queryKey: ['admissions', page, size],
    queryFn: () => api.getAdmissions(page, size),
  });

export const useCurrentAdmissions = () =>
  useQuery({
    queryKey: ['admissions', 'current'],
    queryFn: api.getCurrentlyAdmitted,
  });

export const useAdmitPatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.admitPatient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admissions'] });
      qc.invalidateQueries({ queryKey: ['beds'] });
      toast.success('Patient admitted');
    },
  });
};

export const useDischargePatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { dischargeSummary: string; notes?: string } }) =>
      api.dischargePatient(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admissions'] });
      qc.invalidateQueries({ queryKey: ['beds'] });
      toast.success('Patient discharged');
    },
  });
};