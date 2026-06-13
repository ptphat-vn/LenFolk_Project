import { useQuery } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { Streak } from "@/types/streaks.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const useGetDetailStreak = (id: string) => {
  return useQuery({
    queryKey: ["streakDetail", id],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<Streak>>(`/streaks/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};
