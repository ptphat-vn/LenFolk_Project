import { useMutation } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { useAuthStore } from "@/store/authStore";
import { User } from "@/types/users.type";

type VerifyEmailPayload = {
  email: string;
  code: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

// POST /auth/verify-email — xác thực email bằng OTP. Trả về user đã cập nhật isVerified.
export const useVerifyEmail = () => {
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: async ({ email, code }: VerifyEmailPayload) => {
      const response = await axios.post<ApiResponse<{ message?: string; user?: User }>>(
        "/auth/verify-email",
        { email, code },
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      if (data?.user) {
        updateUser(data.user);
      }
    },
  });
};
