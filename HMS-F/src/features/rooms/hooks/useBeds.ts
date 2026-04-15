import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBedsByRoom, getAllBeds, updateBedStatus, createBed } from "../api/beds.api";
import type { BedStatus, Bed } from "../types";
import { toast } from "react-hot-toast";

export const useBeds = (roomId: number) => {
  return useQuery({
    queryKey: ["beds", "room", roomId],
    queryFn: () => getBedsByRoom(roomId),
    enabled: !!roomId,
  });
};

export const useAllBeds = () => {
  return useQuery({
    queryKey: ["beds"],
    queryFn: getAllBeds,
  });
};

export const useUpdateBedStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: BedStatus }) =>
      updateBedStatus(id, status),
    onSuccess: () => {
      // ✅ Invalidate all related clinical data
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      toast.success("Bed status updated");
    },
    onError: () => {
      toast.error("Failed to update bed status");
    },
  });
};

export const useCreateBed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBed,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      if (variables.roomId) {
        queryClient.invalidateQueries({ queryKey: ["beds", "room", variables.roomId] });
      }
      toast.success("Bed created successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to create bed";
      toast.error(message);
    },
  });
};
