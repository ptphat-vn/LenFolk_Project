import { useQuery } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { PracticeSession } from "@/types/practice-sessions.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const useGetPracticeSessions = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ["practiceSessions", params],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<PracticeSession[]>>("/practice-sessions", {
        params,
      });
      return response.data.data;
    },
  });
};
