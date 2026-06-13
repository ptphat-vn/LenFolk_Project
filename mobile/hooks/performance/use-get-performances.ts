import { useQuery } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { Performance } from "@/types/performances.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const useGetPerformances = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ["performances", params],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<Performance[]>>("/performances", {
        params,
      });
      return response.data.data;
    },
  });
};
