import { useQuery } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { Badge } from "@/types/badges.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const useGetDetailBadge = (id: string) => {
  return useQuery({
    queryKey: ["badgeDetail", id],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<Badge>>(`/badges/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};
