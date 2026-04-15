import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRooms, getRoomById, createRoom } from "../api/rooms.api";
import { toast } from "react-hot-toast";

export const useRooms = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ["rooms", page, size],
    queryFn: () => getRooms(page, size),
  });
};

export const useRoom = (id: number) => {
  return useQuery({
    queryKey: ["room", id],
    queryFn: () => getRoomById(id),
    enabled: !!id,
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Room created successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to create room";
      toast.error(message);
    },
  });
};
