import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { PracticeSession } from "@/types/practice-sessions.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type CreatePracticeSessionPayload = {
  lessonId: string;
  audioFileUrl: string;
  duration?: number; // in seconds
  referenceAudio?: string;
};

export const useCreatePracticeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePracticeSessionPayload) => {
      const response = await axios.post<ApiResponse<PracticeSession>>("/practice-sessions", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["practiceSessions"] });
    },
  });
};
