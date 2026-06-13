import { useQuery } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { Badge } from "@/types/badges.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const useGetBadges = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ["badges", params],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<Badge[]>>("/badges", {
        params,
      });
      return response.data.data;
    },
  });
};
