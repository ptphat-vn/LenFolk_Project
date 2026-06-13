import { useQuery } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { Progress } from "@/types/progress.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const useGetProgressList = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ["progressList", params],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<Progress[]>>("/progress", {
        params,
      });
      return response.data.data;
    },
  });
};
