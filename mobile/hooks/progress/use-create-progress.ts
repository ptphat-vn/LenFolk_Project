import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { Progress } from "@/types/progress.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type CreateProgressPayload = {
  courseId: string;
  lessonId: string;
  status?: "not_started" | "in_progress" | "completed";
  watchedSeconds?: number;
  completionPercent?: number;
  lastAccessedAt?: string;
};

export const useCreateProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateProgressPayload) => {
      const response = await axios.post<ApiResponse<Progress>>("/progress", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progressList"] });
    },
  });
};
