import { useQuery } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { Streak } from "@/types/streaks.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const useGetStreaks = () => {
  return useQuery({
    queryKey: ["streaks"],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<Streak[]>>("/streaks");
      return response.data.data;
    },
  });
};
