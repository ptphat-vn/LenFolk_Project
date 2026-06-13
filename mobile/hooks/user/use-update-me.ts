import { useMutation, useQueryClient } from "@tanstack/react-query";

import axios from "@/setup/axios";
import { useAuthStore } from "@/store/authStore";
import { User } from "@/types/users.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type UpdateMePayload = {
  name: string;
  email: string;
  gender: "male" | "female" | "other";
  dateOfBirth?: string | null;
  phoneNumber?: string | null;
  avatar?: {
    uri: string;
    name: string;
    type: string;
  };
};

export const useUpdateMe = () => {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: async ({ avatar, ...fields }: UpdateMePayload) => {
      const formData = new FormData();

      Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value === null ? "" : String(value));
        }
      });

      if (avatar) {
        formData.append("avatar", avatar as any);
      }

      const response = await axios.patch<ApiResponse<User>>("/users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    },
    onSuccess: async (user) => {
      await updateUser(user);
      queryClient.setQueryData(["me"], user);
    },
  });
};
