import api from "@/lib/axios";
import type { Room, PaginatedResponse } from "../types";

export const getRooms = async (page = 0, size = 10): Promise<PaginatedResponse<Room>> => {
  const response = await api.get("/rooms", { params: { page, size } });
  return response.data;
};

export const getRoomById = async (id: number): Promise<Room> => {
  const response = await api.get(`/rooms/${id}`);
  return response.data;
};

export const createRoom = async (data: Partial<Room>): Promise<Room> => {
  const response = await api.post("/rooms", data);
  return response.data;
};
