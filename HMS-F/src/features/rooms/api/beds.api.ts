import api from "@/lib/axios";
import type { Bed, BedStatus } from "../types";

export const getBedsByRoom = async (roomId: number): Promise<Bed[]> => {
  const response = await api.get(`/beds/room/${roomId}`);
  return response.data;
};

export const getAllBeds = async (): Promise<Bed[]> => {
  // Assuming a large size to get all current beds for mapping logic
  const response = await api.get("/beds", { params: { size: 1000 } });
  return response.data.content || response.data;
};

export const updateBedStatus = async (id: number, status: BedStatus): Promise<Bed> => {
  const response = await api.patch(`/beds/${id}/status`, null, {
    params: { status },
  });
  return response.data;
};

export const createBed = async (data: Partial<Bed>): Promise<Bed> => {
  const response = await api.post("/beds", data);
  return response.data;
};
