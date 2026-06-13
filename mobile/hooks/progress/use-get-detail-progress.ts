import { useQuery } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { Progress } from "@/types/progress.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const useGetDetailProgress = (id: string) => {
  return useQuery({
    queryKey: ["progressDetail", id],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<Progress>>(`/progress/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};
