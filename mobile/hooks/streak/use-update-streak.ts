import { useMutation } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { Streak } from "@/types/streaks.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type UpdateStreakPayload = {
  id: string;
  currentStreak?: number;
  longestStreak?: number;
  totalActiveDays?: number;
  lastActiveDate?: string;
};

export const useUpdateStreak = () => {
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateStreakPayload) => {
      const response = await axios.patch<ApiResponse<Streak>>(`/streaks/${id}`, payload);
      return response.data.data;
    },
  });
};
