import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/setup/axios";
import {
  CreatePerformancePayload,
  MobileImageFile,
  Performance,
} from "@/types/performances.type";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

const isMobileImageFile = (value: unknown): value is MobileImageFile =>
  typeof value === "object" &&
  value !== null &&
  "uri" in value &&
  "name" in value &&
  "type" in value;

function toPerformanceFormData(payload: CreatePerformancePayload) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      if (value.length > 0 && value.every(isMobileImageFile)) {
        value.forEach((file) => {
          formData.append(key, file as any);
        });
      } else {
        formData.append(key, JSON.stringify(value));
      }
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
}

function hasUploadFile(payload: CreatePerformancePayload) {
  return Array.isArray(payload.images) && payload.images.length > 0;
}

export const useCreatePerformance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePerformancePayload) => {
      const isMultipart = hasUploadFile(payload);
      const response = await axios.post<ApiResponse<Performance>>(
        "/performances",
        isMultipart ? toPerformanceFormData(payload) : payload,
        isMultipart
          ? { headers: { "Content-Type": "multipart/form-data" } }
          : undefined,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performances"] });
    },
  });
};
