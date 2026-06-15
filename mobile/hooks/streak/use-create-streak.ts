import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { Streak } from "@/types/streaks.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type CreateStreakPayload = {
  currentStreak?: number;
  longestStreak?: number;
  totalActiveDays?: number;
  lastActiveDate?: string;
};

export const useCreateStreak = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateStreakPayload) => {
      const response = await axios.post<ApiResponse<Streak>>("/streaks", payload);
      return response.data.data;
    },
    onSuccess: (streak) => {
      queryClient.setQueryData<Streak[]>(["streaks"], [streak]);
    },
  });
};
