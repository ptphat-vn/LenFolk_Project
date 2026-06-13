import { useQuery } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { SystemSetting } from "@/types/system-settings.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const useGetSystemSettings = () => {
  return useQuery({
    queryKey: ["systemSettings"],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<SystemSetting>>("/system-settings");
      return response.data.data;
    },
  });
};
