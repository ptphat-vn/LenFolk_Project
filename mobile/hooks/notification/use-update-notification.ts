import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { Notification } from "@/types/notifications.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type UpdateNotificationPayload = {
  id: string;
  isRead: boolean;
};

export const useUpdateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isRead }: UpdateNotificationPayload) => {
      const response = await axios.patch<ApiResponse<Notification>>(
        `/notifications/${id}`,
        { isRead }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
