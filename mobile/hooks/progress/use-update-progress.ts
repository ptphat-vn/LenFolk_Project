import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { Progress } from "@/types/progress.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type UpdateProgressPayload = {
  id: string;
  status?: "not_started" | "in_progress" | "completed";
  watchedSeconds?: number;
  completionPercent?: number;
  bestPracticeScore?: number;
  attemptCount?: number;
  lastAccessedAt?: string;
};

export const useUpdateProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateProgressPayload) => {
      const response = await axios.patch<ApiResponse<Progress>>(`/progress/${id}`, payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progressList"] });
    },
  });
};
