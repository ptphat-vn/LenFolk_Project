import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/setup/axios";
import {
  CreatePerformancePayload,
  Performance,
} from "@/types/performances.type";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export const useCreatePerformance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePerformancePayload) => {
      const response = await axios.post<ApiResponse<Performance>>(
        "/performances",
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performances"] });
    },
  });
};
