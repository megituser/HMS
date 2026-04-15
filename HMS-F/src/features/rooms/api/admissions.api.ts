import api from "@/lib/axios";
import type { Admission, AdmissionRequest, DischargeRequest, PaginatedResponse } from "../types";

export const getCurrentAdmissions = async (): Promise<Admission[]> => {
  const response = await api.get("/admissions/current");
  return response.data;
};

export const admitPatient = async (data: AdmissionRequest): Promise<Admission> => {
  const response = await api.post("/admissions", data);
  return response.data;
};

export const dischargePatient = async (id: number, data: DischargeRequest): Promise<Admission> => {
  const response = await api.patch(`/admissions/${id}/discharge`, data);
  return response.data;
};

export const getAdmissions = async (page = 0, size = 10): Promise<PaginatedResponse<Admission>> => {
  const response = await api.get("/admissions", { params: { page, size } });
  return response.data;
};
