import { useQuery } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { Lesson } from "@/types/lessons.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const useGetDetailLesson = (id: string) => {
  return useQuery({
    queryKey: ["lesson", id],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<Lesson>>(`/lessons/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};
