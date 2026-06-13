import { useQuery } from "@tanstack/react-query";

import axios from "@/setup/axios";
import { User } from "@/types/users.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const useGetMe = () =>
  useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<User>>("/users/me");
      return response.data.data;
    },
  });
