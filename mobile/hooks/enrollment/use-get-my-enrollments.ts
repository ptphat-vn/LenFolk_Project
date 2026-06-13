import { useQuery } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { MyEnrollmentItem } from "@/types/enrollments.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const useGetMyEnrollments = (all?: boolean) => {
  return useQuery({
    queryKey: ["myEnrollments", all],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<MyEnrollmentItem[]>>("/enrollments/me", {
        params: { all: all ? "true" : "false" },
      });
      return response.data.data;
    },
  });
};
