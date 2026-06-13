import { useQuery } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { Lesson } from "@/types/lessons.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const useGetLessons = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ["lessons", params],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<Lesson[]>>("/lessons", {
        params,
      });
      return response.data.data;
    },
  });
};
