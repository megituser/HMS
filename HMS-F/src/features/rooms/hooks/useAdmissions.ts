import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { getCurrentAdmissions, admitPatient, dischargePatient, getAdmissions } from "../api/admissions.api";
import type { Admission, AdmissionRequest, DischargeRequest } from "../types";
import { toast } from "react-hot-toast";

export const useCurrentAdmissions = () => {
  return useQuery({
    queryKey: ["admissions", "current"],
    queryFn: getCurrentAdmissions,
  });
};

export const useAdmissions = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ["admissions", "paginated", page, size],
    queryFn: () => getAdmissions(page, size),
  });
};

export const useAdmissionsMapping = () => {
  const { data: currentAdmissions } = useCurrentAdmissions();

  return useMemo(() => {
    const map: Record<number, Admission> = {};
    if (currentAdmissions) {
      currentAdmissions.forEach((adm) => {
        map[adm.bedId] = adm;
      });
    }
    return map;
  }, [currentAdmissions]);
};

export const useAdmitPatient = (roomId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: admitPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      if (roomId) {
        queryClient.invalidateQueries({ queryKey: ["beds", "room", roomId] });
      }
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      toast.success("Patient admitted successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to admit patient";
      toast.error(message);
    },
  });
};

export const useDischargePatient = (roomId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DischargeRequest }) =>
      dischargePatient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      if (roomId) {
        queryClient.invalidateQueries({ queryKey: ["beds", "room", roomId] });
      }
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      toast.success("Patient discharged successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to discharge patient";
      toast.error(message);
    },
  });
};
