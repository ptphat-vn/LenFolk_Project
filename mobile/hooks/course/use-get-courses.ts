import { useQuery } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { Course } from "@/types/courses.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const useGetCourses = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ["courses", params],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<Course[]>>("/courses", {
        params,
      });
      return response.data.data;
    },
  });
};
