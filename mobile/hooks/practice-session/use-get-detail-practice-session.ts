import { useQuery } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { PracticeSession } from "@/types/practice-sessions.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const useGetDetailPracticeSession = (id: string) => {
  return useQuery({
    queryKey: ["practiceSessionDetail", id],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<PracticeSession>>(`/practice-sessions/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};
