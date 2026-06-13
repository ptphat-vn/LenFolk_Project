import { useQuery } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { Course } from "@/types/courses.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const useGetDetailCourse = (id: string) => {
  return useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<Course>>(`/courses/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};
