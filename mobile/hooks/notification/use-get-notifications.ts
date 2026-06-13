import { useQuery } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { Notification } from "@/types/notifications.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const useGetNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<Notification[]>>("/notifications");
      return response.data.data;
    },
  });
};
